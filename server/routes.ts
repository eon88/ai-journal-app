import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalEntrySchema, type AIReflection } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
