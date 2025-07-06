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
- dominantMoods: The 2-3 most common moods this week
- directionAndMomentum: Based on these entries, what direction is this person's life/mindset/goals heading? What momentum do you see building?
- emergingGoals: Array of 2-3 potential goals or aspirations that seem to be emerging from these entries`
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
        directionAndMomentum: aiResponse.directionAndMomentum || "Moving toward greater self-awareness through consistent reflection.",
        emergingGoals: aiResponse.emergingGoals || ["Continue journaling practice", "Develop deeper self-reflection"],
        processingTime
      };

      res.json({ summary: weeklyReflection });
    } catch (error) {
      console.error("Weekly reflection error:", error);
      res.status(500).json({ message: "Failed to generate weekly reflection" });
    }
  });

  // Get user stats and growth metrics
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  app.get("/api/growth-metrics", async (req: Request, res: Response) => {
    try {
      const metrics = await storage.getGrowthMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching growth metrics:", error);
      res.status(500).json({ error: "Failed to fetch growth metrics" });
    }
  });

  // Saved insights management
  app.get("/api/insights", async (req: Request, res: Response) => {
    try {
      const insights = await storage.getSavedInsights();
      res.json(insights);
    } catch (error) {
      console.error("Error fetching saved insights:", error);
      res.status(500).json({ error: "Failed to fetch saved insights" });
    }
  });

  app.post("/api/insights", async (req: Request, res: Response) => {
    try {
      const { title, content, category, source, entryId } = req.body;
      const insight = await storage.saveInsight({
        title,
        content,
        category,
        source,
        entryId: entryId || null,
      });
      res.json(insight);
    } catch (error) {
      console.error("Error saving insight:", error);
      res.status(500).json({ error: "Failed to save insight" });
    }
  });

  app.delete("/api/insights/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSavedInsight(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting insight:", error);
      res.status(500).json({ error: "Failed to delete insight" });
    }
  });

  // Badge routes
  app.get("/api/badges", async (req: Request, res: Response) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  // Daily challenge routes
  app.get("/api/challenge/today", async (req: Request, res: Response) => {
    try {
      const challenge = await storage.getTodaysChallenge();
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching today's challenge:", error);
      res.status(500).json({ error: "Failed to fetch challenge" });
    }
  });

  // Merlin AI Assistant endpoint
  app.post("/api/merlin/consult", async (req: Request, res: Response) => {
    try {
      const { mode, context, question, userName = "friend" } = req.body;
      
      // Build the persona prompt for Merlin
      let systemPrompt = `You are Merlin the Wise, a mystical AI mentor guiding ${userName} on their life journey through journaling. You speak in a wise, poetic, and slightly mystical tone - like a fantasy mentor. Keep responses to 2-3 sentences maximum, profound but concise. Address ${userName} directly. Use evocative language but remain grounded and helpful.

Key personality traits:
- Wise and encouraging, never preachy
- Speaks with gentle authority and mystical insight
- Uses metaphors from nature, journeys, and growth
- Focuses on empowerment and self-discovery
- Sometimes references "the path ahead" or "inner wisdom"

Context about ${userName}: They are on a personal growth journey using this journaling app to gain insights and track their emotional landscape.`;

      let userPrompt = "";
      
      switch (mode) {
        case "daily-wisdom":
          userPrompt = `Give ${userName} a daily prophecy - a motivational and poetic piece of wisdom to guide their day. Focus on themes of growth, mindfulness, and personal journey. Make it inspiring but grounded.`;
          break;
          
        case "reflection":
          userPrompt = `${userName} seeks deep reflection. ${context ? `Based on their current state: ${context}.` : ""} Ask them a profound, thought-provoking question that will help them explore their inner landscape and gain new insights about themselves.`;
          break;
          
        case "goal-alignment":
          userPrompt = `Help ${userName} reconnect with their life vision and goals. ${context ? `Their current state: ${context}.` : ""} Offer guidance on staying aligned with their deeper purpose and making progress on their personal journey.`;
          break;
          
        case "custom":
          userPrompt = `${userName} asks: "${question}" ${context ? `Their current state: ${context}.` : ""} Respond with wisdom that addresses their question while considering their personal growth journey.`;
          break;
          
        default:
          userPrompt = `Offer ${userName} general wisdom and encouragement for their personal growth journey.`;
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
          error: "OpenAI API key not configured. Merlin's mystical connection requires proper setup." 
        });
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 150,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const message = data.choices[0]?.message?.content || "The mystical forces are unclear at this moment, Alex. Perhaps try again when the stars align better.";

      res.json({
        message: message.trim(),
        mode,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error("Merlin consultation error:", error);
      res.status(500).json({ 
        error: "Merlin's crystal ball has clouded over. Please try again shortly, Alex." 
      });
    }
  });

  app.post("/api/challenge/:id/complete", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const challenge = await storage.completeChallenge(id);
      res.json(challenge);
    } catch (error) {
      console.error("Error completing challenge:", error);
      res.status(500).json({ error: "Failed to complete challenge" });
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
- monthlyWisdom: One profound insight or lesson from this month
- lifeDirection: Based on this month's entries, what overall direction is this person's life heading? What major themes and intentions are emerging?
- emergingGoals: Array of 3-5 specific goals or aspirations that have emerged from this month's reflections
- goalAchievementSuggestions: Array of 3-5 concrete, actionable suggestions for achieving the goals identified above`
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
        lifeDirection: aiResponse.lifeDirection || "Moving toward greater self-awareness and personal development.",
        emergingGoals: aiResponse.emergingGoals || ["Continue personal growth", "Maintain consistent journaling", "Develop deeper self-reflection skills"],
        goalAchievementSuggestions: aiResponse.goalAchievementSuggestions || ["Set aside dedicated time for daily reflection", "Create specific goals with measurable outcomes", "Track progress weekly"],
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
