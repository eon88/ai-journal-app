import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalEntrySchema, type AIReflection, type WeeklyReflection, type MonthlyReflection, type JournalEntry } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get recent journal entries
  app.get("/api/entries", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const entries = await storage.getRecentJournalEntries(limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  // Get specific journal entry
  app.get("/api/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(id);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entry" });
    }
  });

  // Create new journal entry
  app.post("/api/entries", async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create entry" });
    }
  });

  // Analyze journal entry with AI
  app.post("/api/analyze", async (req, res) => {
    try {
      const { entry } = req.body;
      
      if (!entry || typeof entry !== 'string' || entry.trim().length === 0) {
        return res.status(400).json({ message: "Entry content is required" });
      }

      const startTime = Date.now();

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a reflective journaling coach. Analyze the journal entry and provide insights, a reflection question, and growth patterns. Respond in JSON format with the following structure: { \"insights\": \"string\", \"reflectionQuestion\": \"string\", \"growthPattern\": \"string\" }"
          },
          {
            role: "user",
            content: `Here is my journal entry:\n\n${entry}\n\nPlease analyze it and provide thoughtful insights, a meaningful reflection question, and identify any growth patterns you observe.`
          }
        ],
        response_format: { type: "json_object" },
      });

      const processingTime = (Date.now() - startTime) / 1000;
      const aiResponse = JSON.parse(response.choices[0].message.content || "{}");
      
      const reflection: AIReflection = {
        insights: aiResponse.insights || "No insights generated",
        reflectionQuestion: aiResponse.reflectionQuestion || "What would you like to explore further about this entry?",
        growthPattern: aiResponse.growthPattern || "Continue documenting your thoughts and experiences",
        processingTime
      };

      res.json({ summary: reflection });
    } catch (error) {
      console.error("OpenAI API error:", error);
      res.status(500).json({ 
        message: "Failed to analyze entry with AI. Please check your API key and try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get weekly reflection
  app.get("/api/reflect/weekly", async (req, res) => {
    try {
      const weekStart = req.query.weekStart as string;
      if (!weekStart) {
        return res.status(400).json({ message: "weekStart parameter is required (YYYY-MM-DD format)" });
      }

      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const entries = await storage.getEntriesByDateRange(startDate, endDate);
      
      if (entries.length === 0) {
        return res.status(404).json({ message: "No entries found for this week" });
      }

      const startTime = Date.now();
      
      const entryTexts = entries.map(e => `${e.mood ? `Mood: ${e.mood}. ` : ""}${e.content}`).join("\n\n");
      const moods = entries.filter(e => e.mood).map(e => e.mood);
      const tags = entries.flatMap(e => e.tags || []);

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a thoughtful journaling coach analyzing a week's worth of journal entries. Provide insights, patterns, and gentle guidance for personal growth. Respond in JSON format."
          },
          {
            role: "user",
            content: `Analyze these journal entries from ${weekStart} to ${endDate.toISOString().split('T')[0]}:

${entryTexts}

Moods recorded: ${moods.join(', ')}
Tags used: ${tags.join(', ')}

Please provide a weekly reflection in JSON format with these fields:
- commonThemes: Main themes and topics that emerged this week
- growthObservations: What growth, changes, or patterns do you notice?
- weeklyInsight: One key insight or wisdom from this week
- dominantMoods: The 2-3 most common moods this week`
          }
        ],
        response_format: { type: "json_object" },
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || "{}");
      const processingTime = Date.now() - startTime;

      const weeklyReflection: WeeklyReflection = {
        weekStart: weekStart,
        weekEnd: endDate.toISOString().split('T')[0],
        entryCount: entries.length,
        dominantMoods: aiResponse.dominantMoods || moods.slice(0, 3),
        commonThemes: aiResponse.commonThemes || "Various personal reflections and daily experiences.",
        growthObservations: aiResponse.growthObservations || "Continued personal development through journaling.",
        weeklyInsight: aiResponse.weeklyInsight || "Regular reflection helps build self-awareness.",
        processingTime
      };

      res.json({ summary: weeklyReflection });
    } catch (error) {
      console.error("Weekly reflection error:", error);
      res.status(500).json({ message: "Failed to generate weekly reflection" });
    }
  });

  // Get monthly reflection
  app.get("/api/reflect/monthly", async (req, res) => {
    try {
      const month = req.query.month as string;
      const year = parseInt(req.query.year as string);
      
      if (!month || !year) {
        return res.status(400).json({ message: "month and year parameters are required" });
      }

      const startDate = new Date(year, new Date(`${month} 1, ${year}`).getMonth(), 1);
      const endDate = new Date(year, startDate.getMonth() + 1, 0);

      const entries = await storage.getEntriesByDateRange(startDate, endDate);
      
      if (entries.length === 0) {
        return res.status(404).json({ message: "No entries found for this month" });
      }

      const startTime = Date.now();
      
      const entryTexts = entries.map(e => `${e.mood ? `Mood: ${e.mood}. ` : ""}${e.content}`).join("\n\n");
      const moods = entries.filter(e => e.mood).map(e => e.mood);
      const tags = entries.flatMap(e => e.tags || []);

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a wise journaling mentor analyzing a month's worth of personal journal entries. Focus on long-term patterns, growth, and meaningful insights. Respond in JSON format."
          },
          {
            role: "user",
            content: `Analyze these journal entries from ${month} ${year}:

${entryTexts}

Moods recorded: ${moods.join(', ')}
Tags used: ${tags.join(', ')}

Please provide a monthly reflection in JSON format with these fields:
- moodTrends: How did moods evolve and change throughout the month?
- keyThemes: The main life themes, challenges, and focuses this month
- growthJourney: What personal growth and development occurred?
- monthlyWisdom: One profound insight or lesson from this month`
          }
        ],
        response_format: { type: "json_object" },
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || "{}");
      const processingTime = Date.now() - startTime;

      const monthlyReflection: MonthlyReflection = {
        month,
        year,
        entryCount: entries.length,
        moodTrends: aiResponse.moodTrends || "Various mood patterns observed throughout the month.",
        keyThemes: aiResponse.keyThemes || "Personal growth and daily life experiences.",
        growthJourney: aiResponse.growthJourney || "Continued development through regular journaling practice.",
        monthlyWisdom: aiResponse.monthlyWisdom || "Consistent reflection builds deeper self-understanding.",
        processingTime
      };

      res.json({ summary: monthlyReflection });
    } catch (error) {
      console.error("Monthly reflection error:", error);
      res.status(500).json({ message: "Failed to generate monthly reflection" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
