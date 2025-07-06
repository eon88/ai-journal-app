import type { Express, Request, Response } from "express";
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

  // Life Path Analysis endpoint
  app.post("/api/life-path-analysis", async (req: Request, res: Response) => {
    try {
      const { answers } = req.body;
      
      if (!answers || !Array.isArray(answers) || answers.length !== 16) {
        return res.status(400).json({ error: "Invalid answers format" });
      }

      const prompt = `You are a wise and intuitive AI guide that helps users discover their unique life path. You have received responses to a 16-question life path discovery questionnaire.

The questionnaire follows this structure:
- Questions 1-4: FRAME (Current State)
- Questions 5-8: DESTINATION (Future Vision)  
- Questions 9-12: MAP (Tools & Starting Point)
- Questions 13-16: COMPASS (Values & Navigation)

Here are the user's responses:

FRAME - Current State:
1. What feels off or misaligned: ${answers[0]}
2. Where they feel stuck: ${answers[1]}
3. Life story chapter/conflict: ${answers[2]}
4. Secret fear to want: ${answers[3]}

DESTINATION - Future Vision:
5. How they'd spend days with freedom: ${answers[4]}
6. Kind of person they want to become: ${answers[5]}
7. Ideal life 3-5 years from now: ${answers[6]}
8. Who they admire and why: ${answers[7]}

MAP - Tools & Starting Point:
9. Natural strengths others struggle with: ${answers[8]}
10. What drains them most: ${answers[9]}
11. Difficult experience that shaped them: ${answers[10]}
12. Small action toward vision: ${answers[11]}

COMPASS - Values & Navigation:
13. Values to live by: ${answers[12]}
14. When they feel most alive: ${answers[13]}
15. Problem they feel drawn to fix: ${answers[14]}
16. Truth they've been avoiding: ${answers[15]}

Please analyze these responses and provide:

1. **Current Tension** - From FRAME responses, identify their emotional tension and inner conflict. Add a poetic metaphor.

2. **Future Calling** - From DESTINATION responses, extract what they love and hints of what the world needs. Start with "You are becoming the kind of person who..."

3. **Strengths & Map** - From MAP responses, identify their assets, friction points, and first action step.

4. **Life Compass** - From COMPASS responses, identify 3 core values, sources of joy, and build their inner navigation system.

5. **Ikigai Pathway** - Synthesize all responses through the Ikigai framework:
   - What they LOVE (from DESTINATION + COMPASS)
   - What they are GOOD AT (from MAP)
   - What the WORLD NEEDS (from DESTINATION + COMPASS) 
   - What they can be PAID FOR (from MAP)
   
6. **Next Step** - One bold but small action that aligns with their path and values.

Use poetic, encouraging language. Speak like a wise mentor guiding a young seeker on the start of their quest. Be specific and actionable while maintaining an inspiring tone.

Respond in JSON format with these exact keys: currentTension, futureCalling, strengthsAndMap, lifeCompass, ikigaiPathway, nextStep`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      res.json({
        answers,
        ikigaiAnalysis: analysis
      });
      
    } catch (error) {
      console.error("Life path analysis error:", error);
      res.status(500).json({ error: "Failed to analyze life path responses" });
    }
  });

  // Merlin AI Assistant endpoint
  app.post("/api/merlin/consult", async (req: Request, res: Response) => {
    try {
      const { mode, context, question, userName = "friend" } = req.body;
      
      // Build the persona prompt for Merlin
      let systemPrompt = `You are Merlin the Wise, a mystical life coach who gives practical advice with a touch of poetic wisdom. You must ALWAYS provide specific, actionable steps that ${userName} can immediately implement. Your mystical personality is charming, but your advice must be concrete and useful.

REQUIRED FORMAT: Start with 1-2 sentences of mystical wisdom, then give 2-3 specific, practical actions. End with an encouraging mystical phrase.

Example structure:
"Like a wise gardener tends their plot, ${userName}, focus requires daily cultivation. Here's what to do: [specific action 1], [specific action 2], [specific action 3]. The path of mastery unfolds one deliberate step at a time."

Key requirements:
- ALWAYS include specific techniques, methods, or steps
- Give concrete time frames when relevant (e.g., "spend 5 minutes", "try for one week")
- Reference real psychology, productivity methods, or life coaching strategies  
- Use mystical language ONLY to wrap practical advice, never replace it
- Be genuinely helpful with actionable guidance

Context about ${userName}: They seek real solutions for personal growth through their journaling practice.`;

      let userPrompt = "";
      
      switch (mode) {
        case "daily-wisdom":
          userPrompt = `Give ${userName} practical daily guidance wrapped in mystical language. 

MANDATORY: Include at least 2 specific, actionable steps they can take today. Use numbered format:
1. [Specific action with timing/details]
2. [Another specific action with timing/details]

Focus on concrete practices: journaling prompts, time management techniques, mindfulness exercises, productivity methods, or habit formation. Be immediately useful.`;
          break;
          
        case "reflection":
          userPrompt = `${userName} seeks deep reflection. ${context ? `Based on their current state: ${context}.` : ""} 

MANDATORY: Ask 1-2 specific, practical questions that lead to actionable insights. Format as:
1. [Specific reflection question that leads to action]
2. [Follow-up question that helps with next steps]

Focus on questions about patterns, goals, relationships, or decisions that help them understand what to do differently.`;
          break;
          
        case "goal-alignment":
          userPrompt = `Help ${userName} with practical goal alignment. ${context ? `Their current state: ${context}.` : ""} 

MANDATORY: Provide specific strategies in numbered format:
1. [Specific strategy with steps]
2. [Another concrete approach]

Give actionable advice on prioritizing, breaking down goals, time management, habit formation, or decision-making frameworks.`;
          break;
          
        case "custom":
          userPrompt = `${userName} asks: "${question}" ${context ? `Their current state: ${context}.` : ""} 

MANDATORY: Your response must include at least 2 specific, actionable steps they can take immediately. Use this exact format:

1. [Specific action with details]
2. [Another specific action with details]

Wrap these practical steps with mystical language, but the actions must be concrete and useful. Examples of good actions: "Try the Pomodoro Technique: work for 25 minutes, then take a 5-minute break", "Write down your 3 most important tasks each morning", "Put your phone in another room while working".`;
          break;
          
        default:
          userPrompt = `Offer ${userName} practical wisdom with mystical flair. Give them 1-2 concrete actions they can take today for personal growth, better relationships, or achieving their goals.`;
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
      const message = data.choices[0]?.message?.content || `The mystical forces are unclear at this moment, ${userName}. Perhaps try again when the stars align better.`;

      res.json({
        message: message.trim(),
        mode,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error("Merlin consultation error:", error);
      res.status(500).json({ 
        error: `Merlin's crystal ball has clouded over. Please try again shortly, ${userName}.` 
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

  // Export journal entries
  app.get("/api/entries/export", async (req, res) => {
    try {
      const format = req.query.format as string || 'json';
      const entries = await storage.getAllJournalEntries();
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="journal-entries.json"');
        res.json(entries);
      } else if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="journal-entries.csv"');
        
        // Create CSV content
        const headers = ['Date', 'Content', 'Mood', 'Tags', 'AI Insights'];
        const csvContent = [
          headers.join(','),
          ...entries.map(entry => [
            new Date(entry.createdAt).toLocaleDateString(),
            `"${entry.content.replace(/"/g, '""')}"`,
            entry.mood || '',
            entry.tags ? entry.tags.join('; ') : '',
            entry.aiReflection && typeof entry.aiReflection === 'object' && 'insights' in entry.aiReflection ? `"${(entry.aiReflection as any).insights.replace(/"/g, '""')}"` : ''
          ].join(','))
        ].join('\n');
        
        res.send(csvContent);
      } else if (format === 'txt') {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename="journal-entries.txt"');
        
        // Create text content
        const textContent = entries.map(entry => {
          const date = new Date(entry.createdAt).toLocaleDateString();
          const mood = entry.mood ? `Mood: ${entry.mood}` : '';
          const tags = entry.tags && entry.tags.length > 0 ? `Tags: ${entry.tags.join(', ')}` : '';
          const insights = entry.aiReflection && typeof entry.aiReflection === 'object' && 'insights' in entry.aiReflection ? `\nAI Insights: ${(entry.aiReflection as any).insights}` : '';
          
          return `Date: ${date}\n${mood ? mood + '\n' : ''}${tags ? tags + '\n' : ''}\n${entry.content}${insights}\n\n---\n\n`;
        }).join('');
        
        res.send(textContent);
      } else {
        res.status(400).json({ message: "Unsupported format. Use 'json', 'csv', or 'txt'" });
      }
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export entries" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
