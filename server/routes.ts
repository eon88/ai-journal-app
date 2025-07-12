import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalEntrySchema, insertFolderSchema, type AIReflection, type WeeklyReflection, type MonthlyReflection, type JournalEntry, type Folder, parseBulletSymbol, users, folders, journalEntries, LEVEL_UNLOCKS, getUnlockedFeatures, forumCategories, forumPosts, forumReplies, forumLikes, forumModerators, userStats, dailyChallenges, userChallengeCompletions, userCustomTags, isBetaTester, requireBetaAccess, insertVisionAreaSchema, insertVisionMilestoneSchema, insertVisionNextStepSchema, VISION_CATEGORIES } from "@shared/schema";
import { db } from "./db";
import { z } from "zod";
import { eq, and, desc, asc, like, or, inArray } from "drizzle-orm";
import OpenAI from "openai";
import Stripe from "stripe";
import { emailService } from "./email-service";
import { setupAuth, isAuthenticated, hashPassword, verifyPassword } from "./auth";
import type { NextFunction } from "express";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Helper function to get level motivation
function getLevelMotivation(level: number): string {
  const unlock = LEVEL_UNLOCKS.find(u => u.level === level);
  return unlock?.motivation || "Keep growing and exploring your inner world!";
}

// Beta tester middleware - Only allows eon (ID: 2) and Noony (ID: 4)
function requireBetaTester(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId || !isBetaTester(userId)) {
      return res.status(403).json({ 
        error: "Beta access required", 
        message: "This feature is only available to beta testers" 
      });
    }
    next();
  } catch (error) {
    res.status(403).json({ 
      error: "Beta access required", 
      message: "This feature is only available to beta testers" 
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication first
  await setupAuth(app);
  // Registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      
      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        passwordHash,
        firstName,
        lastName,
      });
      
      // Set up session
      (req.session as any).userId = user.id;
      
      // Ensure session is saved before responding
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        
        // Return user without password hash
        const { passwordHash: _, ...userResponse } = user;
        res.json({ success: true, user: userResponse });
      });
      
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      console.log("Login attempt for username:", username);
      
      // Find user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        console.log("User not found by username, trying email");
        user = await storage.getUserByEmail(username);
      }
      
      if (!user) {
        console.log("User not found in database");
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      console.log("User found:", user.username);
      
      // Verify password
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set up session
      (req.session as any).userId = user.id;
      
      // Ensure session is saved before responding
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        
        // Return user without password hash
        const { passwordHash: _, ...userResponse } = user;
        res.json({ success: true, user: userResponse });
      });
      
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  // Auth route to get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const { passwordHash: _, ...userResponse } = req.user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Progressive gamification routes
  app.get('/api/user/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.post('/api/user/progress/check-level', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getUserStats(userId);
      const levelUpdate = await storage.checkAndUpdateUserLevel(userId, stats.xpPoints);
      res.json(levelUpdate);
    } catch (error) {
      console.error("Error checking user level:", error);
      res.status(500).json({ message: "Failed to check user level" });
    }
  });

  app.get('/api/user/feature-check/:featureName', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { featureName } = req.params;
      const isUnlocked = await storage.isFeatureUnlockedForUser(userId, featureName);
      res.json({ isUnlocked });
    } catch (error) {
      console.error("Error checking feature unlock:", error);
      res.status(500).json({ message: "Failed to check feature unlock" });
    }
  });

  app.get('/api/user/entry-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const count = await storage.getUserEntryCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching entry count:", error);
      res.status(500).json({ message: "Failed to fetch entry count" });
    }
  });

  // Check if user is a beta tester
  app.get('/api/user/beta-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const isBeta = isBetaTester(userId);
      res.json({ isBetaTester: isBeta, userId });
    } catch (error) {
      console.error("Error checking beta status:", error);
      res.status(500).json({ message: "Failed to check beta status" });
    }
  });

  // Update questionnaire completion status
  app.post('/api/questionnaire/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.updateQuestionnaireCompletion(userId, true);
      if (user) {
        const { passwordHash: _, ...userResponse } = user;
        res.json(userResponse);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error updating questionnaire completion:", error);
      res.status(500).json({ message: "Failed to update questionnaire completion" });
    }
  });

  // Update user display name
  app.post('/api/user/display-name', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { displayName } = req.body;
      
      if (!displayName || !displayName.trim()) {
        return res.status(400).json({ message: "Display name is required" });
      }
      
      const user = await storage.updateUserDisplayName(userId, displayName.trim());
      if (user) {
        const { passwordHash: _, ...userResponse } = user;
        res.json(userResponse);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error updating display name:", error);
      res.status(500).json({ message: "Failed to update display name" });
    }
  });

  // Get recent journal entries (protected)
  app.get("/api/entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Get entries with pinned entries first
      const entries = await db.select().from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .orderBy(desc(journalEntries.isPinned), desc(journalEntries.createdAt))
        .limit(limit);
      
      res.json(entries);
    } catch (error) {
      console.error("Get entries error:", error);
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  // Get specific journal entry by ID (protected)
  app.get("/api/entries/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const entry = await storage.getJournalEntry(userId, entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error fetching entry:", error);
      res.status(500).json({ message: "Failed to fetch entry" });
    }
  });

  // Create new journal entry (protected) with progressive limits
  app.post("/api/entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { content, mood, tags } = req.body;
      
      // Check if entry contains a challenge prompt and validate character requirement
      const today = new Date().toISOString().split('T')[0];
      const [todaysChallenge] = await db.select()
        .from(dailyChallenges)
        .where(eq(dailyChallenges.date, today))
        .limit(1);
      
      if (todaysChallenge && content && content.includes(todaysChallenge.prompt)) {
        // This entry contains a challenge prompt, validate 100 extra characters
        const effectiveContent = content.replace(todaysChallenge.prompt, '').trim();
        if (effectiveContent.length < 100) {
          return res.status(400).json({ 
            error: `When using a challenge prompt, you must write at least 100 characters beyond the prompt. Currently: ${effectiveContent.length}/100 characters.`
          });
        }
        
        // Automatically add "Daily Challenge" tag if not already present
        const challengeTag = "Daily Challenge";
        const existingTags = tags || [];
        if (!existingTags.includes(challengeTag)) {
          req.body.tags = [...existingTags, challengeTag];
        }
      }
      
      // Check progressive gamification limits
      const progress = await storage.getUserProgress(userId);
      const entryCount = await storage.getUserEntryCount(userId);
      
      // Check entry limits for lower levels
      const isUnlimitedUnlocked = await storage.isFeatureUnlockedForUser(userId, 'unlimited_entries');
      if (!isUnlimitedUnlocked && progress.currentLevel === 1 && entryCount >= 30) {
        return res.status(403).json({ 
          message: "Entry limit reached", 
          limit: 30,
          currentCount: entryCount,
          upgradeMessage: "Level up to unlock more entries!",
          requiredLevel: 5
        });
      }
      
      // Parse bullet symbols from the content
      const { symbol, type, status, cleanContent } = parseBulletSymbol(content || "");
      
      // Prepare the entry data with parsed bullet symbol information
      const entryData = {
        content: cleanContent || content, // Use cleaned content if symbol was found
        mood,
        tags: req.body.tags || tags, // Use updated tags if modified, otherwise original tags
        type,
        status,
        symbol
      };
      
      const validatedData = insertJournalEntrySchema.parse(entryData);
      const entry = await storage.createJournalEntry(userId, validatedData);
      
      // Check for level up after creating entry
      const stats = await storage.getUserStats(userId);
      const levelUpdate = await storage.checkAndUpdateUserLevel(userId, stats.xpPoints);
      
      res.status(201).json({ 
        entry, 
        levelUpdate: levelUpdate.leveledUp ? {
          newLevel: levelUpdate.newLevel,
          unlockedFeatures: levelUpdate.unlockedFeatures,
          motivation: getLevelMotivation(levelUpdate.newLevel || 1)
        } : null
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create entry" });
    }
  });

  // Analyze journal entry with AI and save reflection
  app.post("/api/entries/:id/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      // Get the entry to analyze
      const entry = await storage.getJournalEntry(userId, entryId);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      if (!entry.content || entry.content.trim().length === 0) {
        return res.status(400).json({ message: "Entry has no content to analyze" });
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
            content: `Here is my journal entry:\n\n${entry.content}\n\nPlease analyze it and provide thoughtful insights, a meaningful reflection question, and identify any growth patterns you observe.`
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

      // Update the entry with the reflection
      const updatedEntry = await storage.updateJournalEntryReflection(userId, entryId, reflection);
      
      if (!updatedEntry) {
        return res.status(500).json({ message: "Failed to save reflection" });
      }

      res.json({ 
        entry: updatedEntry,
        reflection: reflection 
      });
    } catch (error) {
      console.error("OpenAI API error:", error);
      res.status(500).json({ 
        message: "Failed to analyze entry with AI. Please check your API key and try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update journal entry (protected)
  app.put("/api/entries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entryId = parseInt(req.params.id);
      const { content, mood, tags } = req.body;
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      // Verify the entry belongs to the user
      const existingEntry = await storage.getJournalEntry(userId, entryId);
      if (!existingEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      // Parse bullet symbols from the content
      const { symbol, type, status, cleanContent } = parseBulletSymbol(content || "");
      
      // Prepare the entry data with parsed bullet symbol information
      const entryData = {
        content: cleanContent || content,
        mood,
        tags,
        type,
        status,
        symbol
      };

      const validatedData = insertJournalEntrySchema.partial().parse(entryData);
      const updatedEntry = await storage.updateJournalEntry(userId, entryId, validatedData);
      
      if (!updatedEntry) {
        return res.status(500).json({ message: "Failed to update entry" });
      }

      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid entry data", errors: error.errors });
      }
      console.error("Update entry error:", error);
      res.status(500).json({ message: "Failed to update entry" });
    }
  });

  // Delete journal entry (protected)
  app.delete("/api/entries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      // Verify the entry belongs to the user
      const existingEntry = await storage.getJournalEntry(userId, entryId);
      if (!existingEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      const deleted = await storage.deleteJournalEntry(userId, entryId);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete entry" });
      }

      res.json({ message: "Entry deleted successfully" });
    } catch (error) {
      console.error("Delete entry error:", error);
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // Analyze journal entry with AI (legacy endpoint for compatibility)
  app.post("/api/analyze", isAuthenticated, async (req: any, res) => {
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

  // VISION ARCHITECT ROUTES

  // Vision Architect chat endpoint (beta feature)
  app.post("/api/vision-architect/chat", isAuthenticated, requireBetaTester, async (req: any, res) => {
    try {
      const { messages, visionData } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
      }

      const userId = req.user.id;
      const userDisplayName = req.user.displayName || req.user.firstName || req.user.username;
      
      // Create system prompt for Vision Architect
      const systemPrompt = `You are a wise, empathetic Vision Architect - a life design mentor helping ${userDisplayName} discover their ideal life through deep reflection. Your role is to guide them through these phases naturally:

1. PHASE 1 - CLARIFY IDEAL FUTURE: Start by understanding their dream life, values, and how they want to feel. Ask open-ended questions about their vision.

2. PHASE 2 - IDENTIFY CATEGORIES: Help them identify 3-7 key life areas that matter most (e.g., health, relationships, career, creativity, spirituality, family, finances, etc.). Don't force specific categories - let them emerge naturally.

3. PHASE 3 - WRITE PHRASES: For each category, help them craft a meaningful phrase or sentence that captures their vision for that area. These will become captions on their vision board.

4. PHASE 4 - SET MILESTONES: Ask about short-term milestones or goals for each category - concrete steps they can take.

5. PHASE 5 - COMMITMENT: End by asking them to commit to daily reflection and choose their preferred time.

IMPORTANT GUIDELINES:
- Flow naturally through conversation - don't dump all questions at once
- Be warm, encouraging, and deeply listening
- Ask follow-up questions to go deeper
- Help them discover their own answers rather than giving advice
- Keep responses conversational and mentor-like
- When you identify a life category and phrase, indicate this clearly
- Track their progress through the phases organically

Current conversation context: ${JSON.stringify(visionData)}

Respond as their mentor, continuing the natural flow of discovery.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10) // Keep last 10 messages for context
        ],
        temperature: 0.7,
      });

      const aiMessage = response.choices[0].message.content || "";
      
      // Try to extract vision categories from the conversation
      const updatedVisionData = { ...visionData };
      
      // Simple pattern matching to identify when categories are being discussed
      // This is a basic implementation - could be enhanced with more sophisticated parsing
      const categoryKeywords = ['health', 'career', 'relationships', 'family', 'finances', 'creativity', 'spirituality', 'personal growth', 'adventure', 'service', 'learning', 'fitness', 'love', 'purpose', 'freedom', 'peace'];
      
      // Check if we're in a phase where categories are being identified
      if (aiMessage.toLowerCase().includes('category') || aiMessage.toLowerCase().includes('area of life')) {
        // This is a simplified approach - in a full implementation, you'd want more sophisticated NLP
        const lastUserMessage = messages[messages.length - 1]?.content || '';
        for (const keyword of categoryKeywords) {
          if (lastUserMessage.toLowerCase().includes(keyword)) {
            if (!updatedVisionData.categories[keyword]) {
              updatedVisionData.categories[keyword] = {
                title: keyword.charAt(0).toUpperCase() + keyword.slice(1),
                phrase: '',
                milestones: []
              };
            }
          }
        }
      }

      res.json({ 
        message: aiMessage,
        visionData: updatedVisionData
      });
    } catch (error) {
      console.error("Vision Architect chat error:", error);
      res.status(500).json({ 
        message: "Failed to get response from Vision Architect. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // FOLDER MANAGEMENT ROUTES

  // Get user folders (protected)
  app.get("/api/folders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userFolders = await db.select().from(folders)
        .where(eq(folders.userId, userId))
        .orderBy(asc(folders.name));
      res.json(userFolders);
    } catch (error) {
      console.error("Get folders error:", error);
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  // Create new folder (protected)
  app.post("/api/folders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const folderData = insertFolderSchema.parse(req.body);
      
      const [folder] = await db.insert(folders)
        .values({ ...folderData, userId })
        .returning();
      
      res.status(201).json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid folder data", errors: error.errors });
      }
      console.error("Create folder error:", error);
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  // Update folder (protected)
  app.patch("/api/folders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const folderId = parseInt(req.params.id);
      const folderData = insertFolderSchema.partial().parse(req.body);
      
      if (isNaN(folderId)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }
      
      const [folder] = await db.update(folders)
        .set(folderData)
        .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
        .returning();
      
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      res.json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid folder data", errors: error.errors });
      }
      console.error("Update folder error:", error);
      res.status(500).json({ message: "Failed to update folder" });
    }
  });

  // Delete folder (protected)
  app.delete("/api/folders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const folderId = parseInt(req.params.id);
      
      if (isNaN(folderId)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }
      
      // First, remove folder reference from all entries in this folder
      await db.update(journalEntries)
        .set({ folderId: null })
        .where(and(eq(journalEntries.folderId, folderId), eq(journalEntries.userId, userId)));
      
      // Then delete the folder
      const [deletedFolder] = await db.delete(folders)
        .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
        .returning();
      
      if (!deletedFolder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      res.json({ message: "Folder deleted successfully" });
    } catch (error) {
      console.error("Delete folder error:", error);
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  // ENHANCED ENTRY MANAGEMENT ROUTES

  // Search entries by filters (protected)
  app.get("/api/entries/search", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { tags, mood, dateFrom, dateTo, query, folderId } = req.query;
      
      const conditions = [eq(journalEntries.userId, userId)];
      
      // Filter by tags
      if (tags) {
        const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
        const tagConditions = tagsArray.map((tag: string) => 
          like(journalEntries.tags, `%${tag.trim()}%`)
        );
        if (tagConditions.length > 0) {
          conditions.push(or(...tagConditions));
        }
      }
      
      // Filter by mood
      if (mood) {
        conditions.push(eq(journalEntries.mood, mood));
      }
      
      // Filter by date range
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        conditions.push(eq(journalEntries.createdAt, fromDate));
      }
      
      // Filter by folder
      if (folderId) {
        if (folderId === 'null' || folderId === 'none') {
          conditions.push(eq(journalEntries.folderId, null));
        } else {
          conditions.push(eq(journalEntries.folderId, parseInt(folderId)));
        }
      }
      
      // Search in content
      if (query) {
        conditions.push(like(journalEntries.content, `%${query}%`));
      }
      
      const entries = await db.select().from(journalEntries)
        .where(and(...conditions))
        .orderBy(desc(journalEntries.isPinned), desc(journalEntries.createdAt));
      
      res.json(entries);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search entries" });
    }
  });

  // Pin/unpin entry (protected)
  app.patch("/api/entries/:id/pin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entryId = parseInt(req.params.id);
      const { isPinned } = req.body;
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const [entry] = await db.update(journalEntries)
        .set({ isPinned })
        .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
        .returning();
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Pin entry error:", error);
      res.status(500).json({ message: "Failed to update entry" });
    }
  });

  // Move entry to folder (protected)
  app.patch("/api/entries/:id/folder", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entryId = parseInt(req.params.id);
      const { folderId } = req.body;
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const [entry] = await db.update(journalEntries)
        .set({ folderId: folderId || null })
        .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
        .returning();
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Move entry error:", error);
      res.status(500).json({ message: "Failed to move entry" });
    }
  });

  // Download entries as text (protected)
  app.post("/api/entries/download", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { entryIds } = req.body;
      
      if (!Array.isArray(entryIds) || entryIds.length === 0) {
        return res.status(400).json({ message: "Entry IDs are required" });
      }
      
      const entries = await db.select().from(journalEntries)
        .where(and(
          eq(journalEntries.userId, userId),
          inArray(journalEntries.id, entryIds)
        ))
        .orderBy(desc(journalEntries.createdAt));
      
      // Generate text content
      let textContent = "Life Path Companion - Journal Entries Export\n";
      textContent += "=" + "=".repeat(50) + "\n\n";
      
      entries.forEach((entry, index) => {
        textContent += `Entry ${index + 1}\n`;
        textContent += `Date: ${new Date(entry.createdAt).toLocaleDateString()}\n`;
        if (entry.mood) textContent += `Mood: ${entry.mood}\n`;
        if (entry.tags && entry.tags.length > 0) textContent += `Tags: ${entry.tags.join(", ")}\n`;
        if (entry.isPinned) textContent += `Status: Pinned\n`;
        textContent += `\n${entry.content}\n\n`;
        textContent += "-".repeat(50) + "\n\n";
      });
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="journal-entries-${new Date().toISOString().split('T')[0]}.txt"`);
      res.send(textContent);
    } catch (error) {
      console.error("Download entries error:", error);
      res.status(500).json({ message: "Failed to download entries" });
    }
  });

  // Get weekly reflection
  app.get("/api/reflect/weekly", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const weekStart = req.query.weekStart as string;
      if (!weekStart) {
        return res.status(400).json({ message: "weekStart parameter is required (YYYY-MM-DD format)" });
      }

      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const entries = await storage.getEntriesByDateRange(userId, startDate, endDate);
      
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

      // Get user goals for progress assessment (Premium feature)
      const goals = await storage.getGoals(userId);
      let goalProgressAssessment = undefined;
      
      if (goals.length > 0) {
        const goalsContext = goals.map(goal => 
          `Goal: "${goal.title}" (${goal.category}, Priority: ${goal.priority}, Status: ${goal.status})`
        ).join('\n');
        
        const goalAssessmentPrompt = `Based on this week's journal entries and the user's goals:

Goals:
${goalsContext}

Journal entries from this week:
${entryTexts}

Please assess the user's progress toward their goals this week. Provide:
1. Which goals seem to be moving forward and why
2. Which goals may need more attention  
3. Specific evidence from the journal entries
4. Actionable suggestions for the upcoming week

Keep it encouraging but honest, focusing on patterns and momentum.`;

        try {
          const goalAssessmentResponse = await openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: [
              { role: "system", content: "You are a supportive life coach analyzing goal progress." },
              { role: "user", content: goalAssessmentPrompt }
            ],
            max_tokens: 500,
          });
          
          goalProgressAssessment = goalAssessmentResponse.choices[0].message.content;
        } catch (error) {
          console.error("Goal assessment error:", error);
        }
      }

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
        goalProgressAssessment,
        processingTime
      };

      // Auto-save weekly reflection to vault
      try {
        const reflectionContent = `Weekly Period: ${weekStart} to ${endDate.toISOString().split('T')[0]}
Entries Analyzed: ${entries.length}

📊 DOMINANT MOODS
${Array.isArray(weeklyReflection.dominantMoods) ? weeklyReflection.dominantMoods.join(', ') : weeklyReflection.dominantMoods}

🎯 COMMON THEMES
${weeklyReflection.commonThemes}

🌱 GROWTH OBSERVATIONS
${weeklyReflection.growthObservations}

💡 WEEKLY INSIGHT
${weeklyReflection.weeklyInsight}

🧭 DIRECTION & MOMENTUM
${weeklyReflection.directionAndMomentum}

🎯 EMERGING GOALS
${Array.isArray(weeklyReflection.emergingGoals) ? weeklyReflection.emergingGoals.map(goal => `• ${goal}`).join('\n') : weeklyReflection.emergingGoals}

${goalProgressAssessment ? `📈 GOAL PROGRESS ASSESSMENT\n${goalProgressAssessment}` : ''}`;

        await storage.saveReflectionToVault(
          userId,
          'weekly',
          weekStart,
          `Weekly Reflection: ${weekStart}`,
          reflectionContent
        );
      } catch (vaultError) {
        console.error("Error saving weekly reflection to vault:", vaultError);
        // Continue without failing the main request
      }

      res.json({ summary: weeklyReflection });
    } catch (error) {
      console.error("Weekly reflection error:", error);
      res.status(500).json({ message: "Failed to generate weekly reflection" });
    }
  });

  // Get user stats and growth metrics
  app.get("/api/stats", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  app.get("/api/growth-metrics", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const metrics = await storage.getGrowthMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching growth metrics:", error);
      res.status(500).json({ error: "Failed to fetch growth metrics" });
    }
  });

  // Saved insights management
  app.get("/api/insights", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const insights = await storage.getSavedInsights(userId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching saved insights:", error);
      res.status(500).json({ error: "Failed to fetch saved insights" });
    }
  });

  app.post("/api/insights", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { title, content, category, source, entryId } = req.body;
      const insight = await storage.saveInsight(userId, {
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

  app.delete("/api/insights/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteSavedInsight(userId, id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting insight:", error);
      res.status(500).json({ error: "Failed to delete insight" });
    }
  });

  // Badge routes
  app.get("/api/badges", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const badges = await storage.getBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  // Daily challenge routes
  app.get("/api/challenge/today", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const challenge = await storage.getTodaysChallenge(userId);
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching today's challenge:", error);
      res.status(500).json({ error: "Failed to fetch challenge" });
    }
  });

  // Life Path Analysis endpoint
  app.post("/api/life-path-analysis", isAuthenticated, async (req: any, res: Response) => {
    try {
      console.log("Life path analysis request received:", req.body);
      const { answers } = req.body;
      
      if (!answers || !Array.isArray(answers) || answers.length !== 16) {
        console.log("Invalid answers format:", answers);
        return res.status(400).json({ error: "Invalid answers format" });
      }

      console.log("Valid answers received, starting OpenAI analysis...");

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

4. **Life Compass** - From COMPASS responses, write a single paragraph identifying their core values, sources of joy, and inner navigation system.

5. **Ikigai Pathway** - Synthesize all responses into a single unified paragraph describing their life purpose intersection
   
6. **Next Step** - One bold but small action that aligns with their path and values.

Use poetic, encouraging language. Speak like a wise mentor guiding a young seeker on the start of their quest. Be specific and actionable while maintaining an inspiring tone.

IMPORTANT: All values must be strings only. No nested objects or arrays allowed. Respond in JSON format with these exact keys:
- currentTension: string
- futureCalling: string  
- strengthsAndMap: string
- lifeCompass: string (single paragraph)
- ikigaiPathway: string (single paragraph)
- nextStep: string`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      console.log("OpenAI response received:", response.choices[0]?.message?.content);
      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      console.log("Parsed analysis:", analysis);
      
      res.json({
        answers,
        ikigaiAnalysis: analysis
      });
      console.log("Response sent successfully");
      
    } catch (error) {
      console.error("Life path analysis error:", error);
      res.status(500).json({ error: "Failed to analyze life path responses" });
    }
  });

  // Merlin AI Assistant endpoint
  app.post("/api/merlin/consult", isAuthenticated, async (req: any, res: Response) => {
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
        error: `Merlin's crystal ball has clouded over. Please try again shortly, ${userName || "friend"}.` 
      });
    }
  });

  // Accept daily challenge
  app.post("/api/challenge/:id/accept", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      
      const challenge = await storage.acceptChallenge(userId, id);
      res.json(challenge);
    } catch (error) {
      console.error("Error accepting challenge:", error);
      res.status(500).json({ error: "Failed to accept challenge" });
    }
  });

  // Custom tags routes
  app.get("/api/custom-tags", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const tags = await storage.getUserCustomTags(userId);
      res.json(tags);
    } catch (error) {
      console.error("Error fetching custom tags:", error);
      res.status(500).json({ error: "Failed to fetch custom tags" });
    }
  });

  app.post("/api/custom-tags", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { tagName, displayOrder } = req.body;
      
      if (!tagName || typeof tagName !== 'string' || tagName.trim().length === 0) {
        return res.status(400).json({ error: "Tag name is required" });
      }
      
      if (tagName.length > 50) {
        return res.status(400).json({ error: "Tag name must be 50 characters or less" });
      }
      
      // Get user's current level to check tag limit
      const progress = await storage.getUserProgress(userId);
      const currentTags = await storage.getUserCustomTags(userId);
      const tagLimit = storage.getCustomTagLimit(progress.currentLevel);
      
      if (currentTags.length >= tagLimit) {
        return res.status(400).json({ 
          error: "Tag limit reached", 
          limit: tagLimit, 
          currentLevel: progress.currentLevel 
        });
      }
      
      // Check for duplicate tag names
      const isDuplicate = currentTags.some(tag => 
        tag.tagName.toLowerCase() === tagName.trim().toLowerCase()
      );
      
      if (isDuplicate) {
        return res.status(400).json({ error: "Tag name already exists" });
      }
      
      const tag = await storage.createCustomTag(userId, {
        tagName: tagName.trim(),
        displayOrder: displayOrder || currentTags.length
      });
      
      res.json(tag);
    } catch (error) {
      console.error("Error creating custom tag:", error);
      res.status(500).json({ error: "Failed to create custom tag" });
    }
  });

  app.put("/api/custom-tags/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const tagId = parseInt(req.params.id);
      const { tagName, displayOrder } = req.body;
      
      if (tagName && (typeof tagName !== 'string' || tagName.trim().length === 0)) {
        return res.status(400).json({ error: "Tag name cannot be empty" });
      }
      
      if (tagName && tagName.length > 50) {
        return res.status(400).json({ error: "Tag name must be 50 characters or less" });
      }
      
      // Check for duplicate tag names (excluding current tag)
      if (tagName) {
        const currentTags = await storage.getUserCustomTags(userId);
        const isDuplicate = currentTags.some(tag => 
          tag.id !== tagId && tag.tagName.toLowerCase() === tagName.trim().toLowerCase()
        );
        
        if (isDuplicate) {
          return res.status(400).json({ error: "Tag name already exists" });
        }
      }
      
      const updates: any = {};
      if (tagName) updates.tagName = tagName.trim();
      if (displayOrder !== undefined) updates.displayOrder = displayOrder;
      
      const tag = await storage.updateCustomTag(userId, tagId, updates);
      
      if (!tag) {
        return res.status(404).json({ error: "Tag not found" });
      }
      
      res.json(tag);
    } catch (error) {
      console.error("Error updating custom tag:", error);
      res.status(500).json({ error: "Failed to update custom tag" });
    }
  });

  app.delete("/api/custom-tags/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const tagId = parseInt(req.params.id);
      
      await storage.deleteCustomTag(userId, tagId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting custom tag:", error);
      res.status(500).json({ error: "Failed to delete custom tag" });
    }
  });

  app.post("/api/challenge/:id/complete", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      
      const challenge = await storage.completeChallenge(userId, id);
      res.json(challenge);
    } catch (error) {
      console.error("Error completing challenge:", error);
      res.status(400).json({ error: error.message || "Failed to complete challenge" });
    }
  });

  // Get monthly reflection
  app.get("/api/reflect/monthly", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const month = req.query.month as string;
      const year = parseInt(req.query.year as string);
      
      if (!month || !year) {
        return res.status(400).json({ message: "month and year parameters are required" });
      }

      const startDate = new Date(year, new Date(`${month} 1, ${year}`).getMonth(), 1);
      const endDate = new Date(year, startDate.getMonth() + 1, 0);

      const entries = await storage.getEntriesByDateRange(userId, startDate, endDate);
      
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

      // Get user goals for progress assessment (Premium feature)
      const goals = await storage.getGoals(userId);
      let goalProgressAssessment = undefined;
      
      if (goals.length > 0) {
        const goalsContext = goals.map(goal => 
          `Goal: "${goal.title}" (${goal.category}, Priority: ${goal.priority}, Status: ${goal.status})`
        ).join('\n');
        
        const goalAssessmentPrompt = `Based on this month's journal entries and the user's goals:

Goals:
${goalsContext}

Journal entries from this month:
${entryTexts}

Please assess the user's progress toward their goals this month. Provide:
1. Which goals showed significant progress and why
2. Which goals need renewed focus
3. Patterns from the journal entries that support or hinder goal achievement
4. Strategic recommendations for next month

Be comprehensive and insightful, focusing on long-term patterns and sustainable progress.`;

        try {
          const goalAssessmentResponse = await openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: [
              { role: "system", content: "You are an experienced life coach providing monthly goal progress analysis." },
              { role: "user", content: goalAssessmentPrompt }
            ],
            max_tokens: 600,
          });
          
          goalProgressAssessment = goalAssessmentResponse.choices[0].message.content;
        } catch (error) {
          console.error("Goal assessment error:", error);
        }
      }

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
        goalProgressAssessment,
        processingTime
      };

      // Auto-save monthly reflection to vault
      try {
        const monthYear = `${year}-${String(new Date(`${month} 1, ${year}`).getMonth() + 1).padStart(2, '0')}`;
        const reflectionContent = `Monthly Period: ${month} ${year}
Entries Analyzed: ${entries.length}

📈 MOOD TRENDS
${monthlyReflection.moodTrends}

🎯 KEY THEMES
${monthlyReflection.keyThemes}

🌱 GROWTH JOURNEY
${monthlyReflection.growthJourney}

💡 MONTHLY WISDOM
${monthlyReflection.monthlyWisdom}

🧭 LIFE DIRECTION
${monthlyReflection.lifeDirection}

🎯 EMERGING GOALS
${Array.isArray(monthlyReflection.emergingGoals) ? monthlyReflection.emergingGoals.map(goal => `• ${goal}`).join('\n') : monthlyReflection.emergingGoals}

💪 GOAL ACHIEVEMENT SUGGESTIONS
${Array.isArray(monthlyReflection.goalAchievementSuggestions) ? monthlyReflection.goalAchievementSuggestions.map(suggestion => `• ${suggestion}`).join('\n') : monthlyReflection.goalAchievementSuggestions}

${goalProgressAssessment ? `📈 GOAL PROGRESS ASSESSMENT\n${goalProgressAssessment}` : ''}`;

        await storage.saveReflectionToVault(
          userId,
          'monthly',
          monthYear,
          `Monthly Reflection: ${month} ${year}`,
          reflectionContent
        );
      } catch (vaultError) {
        console.error("Error saving monthly reflection to vault:", vaultError);
        // Continue without failing the main request
      }

      res.json({ summary: monthlyReflection });
    } catch (error) {
      console.error("Monthly reflection error:", error);
      res.status(500).json({ message: "Failed to generate monthly reflection" });
    }
  });

  // Export journal entries
  app.get("/api/entries/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const format = req.query.format as string || 'json';
      const entries = await storage.getAllJournalEntries(userId);
      
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

  // Contact form endpoint
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const { name, email, subject, message } = req.body;
      
      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields" 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid email format" 
        });
      }

      // Send email using the email service
      try {
        await emailService.sendContactMessage(name, email, subject || '', message);
        
        res.json({ 
          success: true, 
          message: "Message sent successfully! We'll respond within 24 hours." 
        });
        
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        
        // Even if email fails, log the message so it's not lost
        console.log('===== CONTACT FORM SUBMISSION (EMAIL FAILED) =====');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Subject:', subject || 'No subject provided');
        console.log('Message:', message);
        console.log('Email Error:', emailError);
        console.log('================================================');
        
        res.json({ 
          success: true, 
          message: "Message received successfully. We'll respond within 24 hours." 
        });
      }
      
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to process contact form" 
      });
    }
  });

  // User settings endpoint
  app.post("/api/user/settings", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { settingType, settings } = req.body;
      
      if (!settingType || !settings) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields" 
        });
      }

      // Log the settings update for admin review
      console.log('===== USER SETTINGS UPDATE =====');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Setting Type:', settingType);
      console.log('Settings:', JSON.stringify(settings, null, 2));
      console.log('================================');

      // Here you could save to database if needed
      // For now, we'll just acknowledge the update
      
      res.json({ 
        success: true, 
        message: "Settings updated successfully" 
      });
      
    } catch (error) {
      console.error("Settings update error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update settings" 
      });
    }
  });

  // Get user settings endpoint
  app.get("/api/user/settings", isAuthenticated, async (req: any, res: Response) => {
    try {
      // In production, this would fetch from database
      // For now, return default settings
      const defaultSettings = {
        notifications: {
          emailNotifications: true,
          weeklyReflections: true,
          dailyChallenges: true,
          progressReminders: false,
          darkMode: true
        }
      };
      
      res.json({ 
        success: true, 
        settings: defaultSettings 
      });
      
    } catch (error) {
      console.error("Settings fetch error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch settings" 
      });
    }
  });

  // Account management routes
  app.get("/api/account/status", isAuthenticated, async (req: any, res: Response) => {
    try {
      // Check if user has completed upgrade simulation
      // In production, this would check actual subscription status from database
      const urlParams = req.query;
      const hasUpgraded = urlParams.premium === 'true'; // Simple simulation check
      
      const account = hasUpgraded ? {
        id: 1,
        email: "user@example.com",
        name: "Premium User",
        accountType: "premium",
        subscriptionStatus: "active",
        betaAccessGranted: false,
        features: [
          "Unlimited journal entries",
          "AI-powered reflections",
          "Weekly & monthly insights",
          "Personal goals management",
          "Goal progress tracking in reflections",
          "Growth dashboard",
          "Daily challenges",
          "Community forum access",
          "Merlin AI assistant",
          "Streak tracking & XP system",
          "Export capabilities",
          "Premium support"
        ]
      } : {
        id: 1,
        email: "user@example.com",
        name: "Free User",
        accountType: "free",
        subscriptionStatus: "inactive",
        betaAccessGranted: false,
        features: [
          "Basic journal entries (up to 10 per month)",
          "Basic AI insights",
          "View recent entries",
          "Limited growth dashboard"
        ]
      };
      
      res.json({ success: true, account });
    } catch (error) {
      console.error("Account status error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch account status" });
    }
  });

  // Get subscription plans
  app.get("/api/subscription/plans", async (req: Request, res: Response) => {
    try {
      const plans = [
        {
          id: 1,
          name: "Life Path Light",
          description: "Essential features for your journaling journey",
          price: 299, // $2.99/month
          currency: "usd",
          interval: "month",
          features: [
            "Unlimited journal entries",
            "AI-powered reflections",
            "Weekly & monthly insights",
            "Personal goals management",
            "Goal progress tracking in reflections",
            "Growth dashboard",
            "Daily challenges",
            "Community forum access",
            "Merlin AI assistant",
            "Streak tracking & XP system"
          ],
          isActive: true,
          popular: false
        },
        {
          id: 2,
          name: "Life Path Light Annual",
          description: "Full yearly access with 2 months free",
          price: 2999, // $29.99/year (2 months free)
          currency: "usd",
          interval: "year",
          features: [
            "All Light features",
            "2 months free (save $5.98)",
            "Advanced goal analytics",
            "Priority support",
            "Early access to new features"
          ],
          isActive: true,
          popular: true
        }
      ];
      
      res.json({ success: true, plans });
    } catch (error) {
      console.error("Plans fetch error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch subscription plans" });
    }
  });

  // Create subscription checkout session
  app.post("/api/subscription/create-checkout", async (req: Request, res: Response) => {
    try {
      const { planId } = req.body;
      
      const planDetails = {
        1: { amount: 299, interval: 'month', name: 'Life Path Light Monthly' }, // $2.99/month
        2: { amount: 2999, interval: 'year', name: 'Life Path Light Annual' }   // $29.99/year
      };
      
      const plan = planDetails[planId as keyof typeof planDetails];
      if (!plan) {
        return res.status(400).json({ success: false, message: "Invalid plan ID" });
      }

      // Create Stripe checkout session - works in both test and live mode
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: plan.name,
                description: `Life Path Companion - ${plan.name}`,
              },
              unit_amount: plan.amount,
              recurring: {
                interval: plan.interval as 'month' | 'year',
              },
            },
            quantity: 1,
          }],
          mode: 'subscription',
          success_url: `${req.protocol}://${req.get('host')}/profile?upgrade=success&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.protocol}://${req.get('host')}/pricing?upgrade=cancelled`,
          metadata: {
            planId: planId.toString(),
          },
          // Allow test mode checkouts
          allow_promotion_codes: true,
        });

        res.json({ 
          success: true, 
          checkoutUrl: session.url,
          sessionId: session.id,
          message: "Redirecting to secure payment checkout..."
        });
      } catch (stripeError: any) {
        console.error("Stripe error:", stripeError.message);
        
        // Check for specific error types
        if (stripeError.message.includes("live charges") || stripeError.message.includes("live mode")) {
          res.status(400).json({ 
            success: false, 
            message: "Payment system is in test mode. Contact support for live payment processing.",
            error: "test_mode_only"
          });
        } else {
          res.status(500).json({ 
            success: false, 
            message: `Payment processing error: ${stripeError.message}`,
            error: "stripe_error"
          });
        }
      }
      
    } catch (error) {
      console.error("Checkout creation error:", error);
      res.status(500).json({ success: false, message: "Failed to create checkout session. Please try again." });
    }
  });

  // Handle Stripe webhooks
  app.post("/api/webhooks/stripe", async (req: Request, res: Response) => {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!endpointSecret) {
        console.warn("Stripe webhook secret not configured");
        return res.status(400).send("Webhook secret not configured");
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return res.status(400).send(`Webhook Error: ${err}`);
      }

      // Handle the event
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object;
          console.log('Subscription updated:', subscription.id);
          // Update user account in database
          break;
        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object;
          console.log('Subscription canceled:', deletedSubscription.id);
          // Update user account status in database
          break;
        case 'invoice.payment_succeeded':
          const invoice = event.data.object;
          console.log('Payment succeeded:', invoice.id);
          break;
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          console.log('Payment failed:', failedInvoice.id);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ success: false, message: "Webhook processing failed" });
    }
  });

  // Goals management routes (Premium feature)
  app.get("/api/goals", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const goals = await storage.getGoals(userId);
      res.json({ success: true, goals });
    } catch (error) {
      console.error("Goals fetch error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { title, description, category, targetDate, priority, progressNotes } = req.body;
      
      if (!title || !category) {
        return res.status(400).json({ success: false, message: "Title and category are required" });
      }

      const goalData = {
        title,
        description: description || null,
        category,
        targetDate: targetDate ? new Date(targetDate) : null,
        priority: priority || "medium",
        progressNotes: progressNotes || null,
      };

      const goal = await storage.createGoal(userId, goalData);
      res.json({ success: true, goal });
    } catch (error) {
      console.error("Goal creation error:", error);
      res.status(500).json({ success: false, message: "Failed to create goal" });
    }
  });

  app.patch("/api/goals/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const goalId = parseInt(req.params.id);
      const updates = req.body;

      if (isNaN(goalId)) {
        return res.status(400).json({ success: false, message: "Invalid goal ID" });
      }

      // Convert targetDate string to Date if provided
      if (updates.targetDate) {
        updates.targetDate = new Date(updates.targetDate);
      }

      const goal = await storage.updateGoal(userId, goalId, updates);
      
      if (!goal) {
        return res.status(404).json({ success: false, message: "Goal not found" });
      }

      res.json({ success: true, goal });
    } catch (error) {
      console.error("Goal update error:", error);
      res.status(500).json({ success: false, message: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const goalId = parseInt(req.params.id);

      if (isNaN(goalId)) {
        return res.status(400).json({ success: false, message: "Invalid goal ID" });
      }

      await storage.deleteGoal(userId, goalId);
      res.json({ success: true, message: "Goal deleted successfully" });
    } catch (error) {
      console.error("Goal deletion error:", error);
      res.status(500).json({ success: false, message: "Failed to delete goal" });
    }
  });

  // Admin routes for forum management
  const isAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const isUserAdmin = await storage.isUserAdmin(req.user.id);
      if (!isUserAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      console.error("Admin check error:", error);
      res.status(500).json({ message: "Failed to verify admin status" });
    }
  };

  // Forum moderator middleware
  const isForumModerator = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const isUserAdmin = await storage.isUserAdmin(req.user.id);
      const isModerator = await storage.isForumModerator(req.user.id);
      
      if (!isUserAdmin && !isModerator) {
        return res.status(403).json({ message: "Moderator access required" });
      }
      
      next();
    } catch (error) {
      console.error("Moderator check error:", error);
      res.status(500).json({ message: "Failed to verify moderator status" });
    }
  };

  // Check if current user is admin
  app.get("/api/admin/check", isAuthenticated, async (req: any, res: Response) => {
    try {
      const isUserAdmin = await storage.isUserAdmin(req.user.id);
      res.json({ isAdmin: isUserAdmin });
    } catch (error) {
      console.error("Admin check error:", error);
      res.status(500).json({ message: "Failed to check admin status" });
    }
  });

  // Get all users for admin management
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
      }).from(users).orderBy(users.createdAt);
      
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Enhanced admin endpoint with detailed user data for marketing/promotion (EON ONLY)
  app.get("/api/admin/users-detailed", isAuthenticated, async (req: any, res: Response) => {
    try {
      // Restrict to EON user only for user database access
      if (req.user.id !== 2) { // EON's user ID
        return res.status(403).json({ message: "Access denied - owner access only" });
      }
      
      const detailedUsers = await storage.getAllUsersWithDetails();
      res.json(detailedUsers);
    } catch (error) {
      console.error("Error fetching detailed user data:", error);
      res.status(500).json({ message: "Failed to fetch detailed user data" });
    }
  });

  // Update user role (promote/demote admin)
  app.patch("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!role || !['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: "Valid role required (admin or user)" });
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Admin endpoint to manually set user level (for testing - EON only)
  app.post("/api/admin/set-level", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { level } = req.body;
      const userId = req.user.id;
      
      // SECURITY: Only allow eon (user ID 2) to use level testing
      if (userId !== 2) {
        return res.status(403).json({ message: "Access denied - owner testing only" });
      }
      
      console.log(`Setting level ${level} for user ${userId}`);
      
      if (level < 1 || level > 10) {
        return res.status(400).json({ message: "Level must be between 1 and 10" });
      }
      
      // Get current progress or initialize if doesn't exist
      const currentProgress = await storage.getUserProgress(userId);
      console.log("Current progress:", currentProgress);
      
      // Calculate unlocked features for this level
      const unlockedFeatures = getUnlockedFeatures(level);
      console.log("Unlocked features:", unlockedFeatures);
      
      const updatedProgress = await storage.updateUserProgress(userId, {
        currentLevel: level,
        unlockedFeatures: unlockedFeatures,
        lastLevelUp: new Date(),
        updatedAt: new Date()
      });
      
      console.log("Updated progress:", updatedProgress);
      
      res.json({ 
        success: true, 
        newLevel: level,
        message: `Level manually set to ${level}`,
        unlockedFeatures: unlockedFeatures
      });
    } catch (error) {
      console.error("Error setting level:", error);
      console.error("Stack trace:", error.stack);
      res.status(500).json({ message: "Failed to set level", error: error.message });
    }
  });

  // Admin XP Gifting endpoint (Admin only)
  app.post("/api/admin/gift-xp", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const { userId, xpAmount, reason } = req.body;
      
      if (!userId || !xpAmount || xpAmount <= 0) {
        return res.status(400).json({ message: "Valid user ID and positive XP amount required" });
      }
      
      // Get current user stats
      const currentStats = await storage.getUserStats(userId);
      const newXP = currentStats.xpPoints + xpAmount;
      
      // Update user stats with new XP
      const updatedStats = await storage.updateUserStats(userId, {
        xpPoints: newXP
      });
      
      // Check if user should level up
      const levelUpResult = await storage.checkAndUpdateUserLevel(userId, newXP);
      
      // Get user info for response
      const user = await storage.getUser(userId);
      
      res.json({
        success: true,
        message: `Successfully gifted ${xpAmount} XP to ${user?.username}`,
        newXP: newXP,
        xpGifted: xpAmount,
        reason: reason || "Admin gift",
        levelUp: levelUpResult.leveledUp ? {
          newLevel: levelUpResult.newLevel,
          unlockedFeatures: levelUpResult.unlockedFeatures
        } : null
      });
    } catch (error) {
      console.error("Error gifting XP:", error);
      res.status(500).json({ message: "Failed to gift XP" });
    }
  });

  // Admin Level Integrity Check endpoint (Admin only)
  app.post("/api/admin/fix-level-consistency", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      console.log(`Admin ${req.user.username} initiated level consistency check`);
      
      // Run the integrity check
      const result = await storage.verifyAndFixLevelConsistency();
      
      res.json({
        success: true,
        message: `Level consistency check completed`,
        checkedUsers: result.checkedUsers,
        fixedUsers: result.fixedUsers,
        report: result.fixedUsers > 0 
          ? `Fixed ${result.fixedUsers} out of ${result.checkedUsers} users with level inconsistencies`
          : `All ${result.checkedUsers} users have consistent levels`
      });
    } catch (error) {
      console.error("Error in level consistency check:", error);
      res.status(500).json({ message: "Failed to run level consistency check" });
    }
  });

  // Forum API routes
  
  // Get forum categories
  app.get("/api/forum/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getForumCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching forum categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get forum posts
  app.get("/api/forum/posts", async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const posts = await storage.getForumPosts(categoryId, limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Get single forum post
  app.get("/api/forum/posts/:id", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getForumPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Increment view count
      await storage.incrementPostViews(postId);
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching forum post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Create forum post
  app.post("/api/forum/posts", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { title, content, categoryId } = req.body;
      
      if (!title || !content || !categoryId) {
        return res.status(400).json({ message: "Title, content, and category are required" });
      }
      
      const post = await storage.createForumPost(req.user.id, {
        title,
        content,
        categoryId: parseInt(categoryId)
      });
      
      res.json(post);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Edit forum post (users can edit their own posts)
  app.patch("/api/forum/posts/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const { title, content } = req.body;
      const userId = req.user.id;
      
      if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
      }
      
      // Get the post to check ownership
      const existingPost = await db.select().from(forumPosts).where(eq(forumPosts.id, postId));
      
      if (!existingPost.length) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user owns the post or is admin
      const isUserAdmin = await storage.isUserAdmin(userId);
      if (existingPost[0].authorId !== userId && !isUserAdmin) {
        return res.status(403).json({ message: "You can only edit your own posts" });
      }
      
      // Update the post
      const [updatedPost] = await db.update(forumPosts)
        .set({ 
          title, 
          content, 
          updatedAt: new Date() 
        })
        .where(eq(forumPosts.id, postId))
        .returning();
      
      res.json({ success: true, post: updatedPost });
    } catch (error) {
      console.error("Error editing forum post:", error);
      res.status(500).json({ message: "Failed to edit post" });
    }
  });

  // Get forum replies
  app.get("/api/forum/posts/:id/replies", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const replies = await storage.getForumReplies(postId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching forum replies:", error);
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });

  // Create forum reply
  app.post("/api/forum/posts/:id/replies", isAuthenticated, async (req: any, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const { content, parentReplyId } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const reply = await storage.createForumReply(req.user.id, {
        content,
        postId,
        parentReplyId: parentReplyId ? parseInt(parentReplyId) : undefined
      });
      
      res.json(reply);
    } catch (error) {
      console.error("Error creating forum reply:", error);
      res.status(500).json({ message: "Failed to create reply" });
    }
  });

  // Toggle like on post or reply
  app.post("/api/forum/like", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { postId, replyId } = req.body;
      
      if (!postId && !replyId) {
        return res.status(400).json({ message: "Post ID or Reply ID is required" });
      }
      
      const liked = await storage.toggleForumLike(
        req.user.id,
        postId ? parseInt(postId) : undefined,
        replyId ? parseInt(replyId) : undefined
      );
      
      res.json({ liked });
    } catch (error) {
      console.error("Error toggling forum like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Get forum stats
  app.get("/api/forum/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getForumStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching forum stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin contact messages endpoint (owner only)
  app.get("/api/admin/contact-messages", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      console.log("Contact messages endpoint called by user:", req.user?.username);
      const fs = await import('fs/promises');
      
      try {
        const logContent = await fs.readFile('contact-messages.log', 'utf8');
        console.log("Raw log content:", logContent);
        
        const messages = logContent
          .trim()
          .split('\n')
          .filter(line => line.trim())
          .map((line, index) => {
            try {
              const msg = JSON.parse(line);
              return { ...msg, id: index };
            } catch {
              console.log("Failed to parse line:", line);
              return null;
            }
          })
          .filter(msg => msg !== null)
          .reverse(); // Most recent first
        
        console.log("Processed messages:", messages.length);
        res.json({ success: true, messages });
      } catch (fileError) {
        console.log("File read error:", fileError);
        // If file doesn't exist or can't be read, return empty array
        res.json({ success: true, messages: [] });
      }
    } catch (error) {
      console.error("Error reading contact messages:", error);
      res.status(500).json({ success: false, message: "Failed to read contact messages" });
    }
  });

  // Delete contact message (owner only)
  app.delete("/api/admin/contact-messages/:id", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const messageId = parseInt(req.params.id);
      const fs = await import('fs/promises');
      
      try {
        const logContent = await fs.readFile('contact-messages.log', 'utf8');
        const messages = logContent
          .trim()
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter(msg => msg !== null);
        
        // Remove the message at the specified index (accounting for reverse order)
        const actualIndex = messages.length - 1 - messageId;
        if (actualIndex >= 0 && actualIndex < messages.length) {
          messages.splice(actualIndex, 1);
          
          // Write back to file
          const newContent = messages.map(msg => JSON.stringify(msg)).join('\n') + '\n';
          await fs.writeFile('contact-messages.log', newContent);
          
          res.json({ success: true, message: "Message deleted successfully" });
        } else {
          res.status(404).json({ success: false, message: "Message not found" });
        }
      } catch (fileError) {
        res.status(500).json({ success: false, message: "Failed to read contact messages" });
      }
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ success: false, message: "Failed to delete message" });
    }
  });

  // Archive/unarchive contact message (owner only)
  app.patch("/api/admin/contact-messages/:id/archive", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const messageId = parseInt(req.params.id);
      const { archived } = req.body;
      const fs = await import('fs/promises');
      
      try {
        const logContent = await fs.readFile('contact-messages.log', 'utf8');
        const messages = logContent
          .trim()
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter(msg => msg !== null);
        
        // Update the message at the specified index (accounting for reverse order)
        const actualIndex = messages.length - 1 - messageId;
        if (actualIndex >= 0 && actualIndex < messages.length) {
          messages[actualIndex].archived = archived;
          
          // Write back to file
          const newContent = messages.map(msg => JSON.stringify(msg)).join('\n') + '\n';
          await fs.writeFile('contact-messages.log', newContent);
          
          res.json({ success: true, message: `Message ${archived ? 'archived' : 'unarchived'} successfully` });
        } else {
          res.status(404).json({ success: false, message: "Message not found" });
        }
      } catch (fileError) {
        res.status(500).json({ success: false, message: "Failed to read contact messages" });
      }
    } catch (error) {
      console.error("Error archiving contact message:", error);
      res.status(500).json({ success: false, message: "Failed to archive message" });
    }
  });

  // Pin/unpin contact message (owner only)
  app.patch("/api/admin/contact-messages/:id/pin", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const messageId = parseInt(req.params.id);
      const { pinned } = req.body;
      const fs = await import('fs/promises');
      
      try {
        const logContent = await fs.readFile('contact-messages.log', 'utf8');
        const messages = logContent
          .trim()
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter(msg => msg !== null);
        
        // Update the message at the specified index (accounting for reverse order)
        const actualIndex = messages.length - 1 - messageId;
        if (actualIndex >= 0 && actualIndex < messages.length) {
          messages[actualIndex].pinned = pinned;
          
          // Write back to file
          const newContent = messages.map(msg => JSON.stringify(msg)).join('\n') + '\n';
          await fs.writeFile('contact-messages.log', newContent);
          
          res.json({ success: true, message: `Message ${pinned ? 'pinned' : 'unpinned'} successfully` });
        } else {
          res.status(404).json({ success: false, message: "Message not found" });
        }
      } catch (fileError) {
        res.status(500).json({ success: false, message: "Failed to read contact messages" });
      }
    } catch (error) {
      console.error("Error pinning contact message:", error);
      res.status(500).json({ success: false, message: "Failed to pin message" });
    }
  });

  // Get leaderboard data
  app.get("/api/leaderboard/top-users", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      
      const topUsers = await db
        .select({
          id: users.id,
          username: users.username,
          xpPoints: userStats.xpPoints,
          level: userStats.level,
          title: userStats.title,
          totalEntries: userStats.totalEntries,
          currentStreak: userStats.currentStreak,
        })
        .from(users)
        .innerJoin(userStats, eq(users.id, userStats.userId))
        .orderBy(desc(userStats.xpPoints), desc(userStats.totalEntries))
        .limit(limit);

      res.json(topUsers);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // ===== FORUM MANAGEMENT ADMIN ROUTES =====
  
  // Category Management
  app.post("/api/admin/forum/categories", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const { name, description, color, icon, isActive } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({ success: false, message: "Name and description are required" });
      }

      const [category] = await db.insert(forumCategories).values({
        name,
        description,
        color: color || "#3B82F6",
        icon: icon || "MessageSquare",
        isActive: isActive !== undefined ? isActive : true,
      }).returning();

      res.json({ success: true, category });
    } catch (error) {
      console.error("Category creation error:", error);
      res.status(500).json({ success: false, message: "Failed to create category" });
    }
  });

  app.patch("/api/admin/forum/categories/:id", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const [category] = await db.update(forumCategories)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(forumCategories.id, id))
        .returning();

      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }

      res.json({ success: true, category });
    } catch (error) {
      console.error("Category update error:", error);
      res.status(500).json({ success: false, message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/forum/categories/:id", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      // Check if category has posts
      const postsInCategory = await db.select({ id: forumPosts.id })
        .from(forumPosts)
        .where(eq(forumPosts.categoryId, id))
        .limit(1);

      if (postsInCategory.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Cannot delete category with existing posts. Move or delete posts first." 
        });
      }

      await db.delete(forumCategories).where(eq(forumCategories.id, id));
      res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
      console.error("Category deletion error:", error);
      res.status(500).json({ success: false, message: "Failed to delete category" });
    }
  });

  // Post Management
  app.patch("/api/admin/forum/posts/:id/pin", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { isPinned } = req.body;

      const [post] = await db.update(forumPosts)
        .set({ isPinned, updatedAt: new Date() })
        .where(eq(forumPosts.id, id))
        .returning();

      if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
      }

      res.json({ success: true, post });
    } catch (error) {
      console.error("Post pin error:", error);
      res.status(500).json({ success: false, message: "Failed to update post pin status" });
    }
  });

  app.patch("/api/admin/forum/posts/:id/feature", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { isFeatured } = req.body;

      const [post] = await db.update(forumPosts)
        .set({ isFeatured, updatedAt: new Date() })
        .where(eq(forumPosts.id, id))
        .returning();

      if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
      }

      res.json({ success: true, post });
    } catch (error) {
      console.error("Post feature error:", error);
      res.status(500).json({ success: false, message: "Failed to update post feature status" });
    }
  });

  app.patch("/api/admin/forum/posts/:id/lock", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { isLocked } = req.body;

      const [post] = await db.update(forumPosts)
        .set({ isLocked, updatedAt: new Date() })
        .where(eq(forumPosts.id, id))
        .returning();

      if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
      }

      res.json({ success: true, post });
    } catch (error) {
      console.error("Post lock error:", error);
      res.status(500).json({ success: false, message: "Failed to update post lock status" });
    }
  });

  app.delete("/api/admin/forum/posts/:id", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      // Delete associated replies first
      await db.delete(forumReplies).where(eq(forumReplies.postId, id));
      
      // Delete associated likes
      await db.delete(forumLikes).where(eq(forumLikes.postId, id));
      
      // Delete the post
      await db.delete(forumPosts).where(eq(forumPosts.id, id));

      res.json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
      console.error("Post deletion error:", error);
      res.status(500).json({ success: false, message: "Failed to delete post" });
    }
  });

  // Moderator Management
  app.get("/api/admin/forum/moderators", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const moderators = await db.select({
        id: forumModerators.id,
        userId: forumModerators.userId,
        createdAt: forumModerators.createdAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
        }
      })
      .from(forumModerators)
      .leftJoin(users, eq(forumModerators.userId, users.id));

      res.json(moderators);
    } catch (error) {
      console.error("Moderators fetch error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch moderators" });
    }
  });

  app.post("/api/admin/forum/moderators", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const adminId = req.user.id;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }

      // Check if user is already a moderator
      const existing = await db.select({ id: forumModerators.id })
        .from(forumModerators)
        .where(eq(forumModerators.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: "User is already a moderator" });
      }

      const [moderator] = await db.insert(forumModerators).values({
        userId,
        assignedBy: adminId,
      }).returning();

      res.json({ success: true, moderator });
    } catch (error) {
      console.error("Moderator assignment error:", error);
      res.status(500).json({ success: false, message: "Failed to assign moderator" });
    }
  });

  app.delete("/api/admin/forum/moderators/:userId", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);

      await db.delete(forumModerators).where(eq(forumModerators.userId, userId));
      res.json({ success: true, message: "Moderator removed successfully" });
    } catch (error) {
      console.error("Moderator removal error:", error);
      res.status(500).json({ success: false, message: "Failed to remove moderator" });
    }
  });

  // Vision Board API Routes - Beta Feature
  
  // Get user's vision board
  app.get("/api/vision-board", isAuthenticated, requireBetaTester, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const visionBoard = await storage.getUserVisionBoard(userId);
      res.json(visionBoard);
    } catch (error) {
      console.error("Vision board fetch error:", error);
      res.status(500).json({ message: "Failed to fetch vision board" });
    }
  });

  // Get vision board categories
  app.get("/api/vision-board/categories", isAuthenticated, requireBetaTester, async (req: any, res: Response) => {
    try {
      res.json(VISION_CATEGORIES);
    } catch (error) {
      console.error("Vision categories fetch error:", error);
      res.status(500).json({ message: "Failed to fetch vision categories" });
    }
  });

  // Create vision area
  app.post("/api/vision-board/areas", isAuthenticated, requireBetaTester, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const validatedData = insertVisionAreaSchema.parse(req.body);
      
      // Check if user already has 5 vision areas (max limit)
      const existingAreas = await storage.getUserVisionBoard(userId);
      if (existingAreas.length >= 5) {
        return res.status(400).json({ message: "Maximum 5 vision areas allowed" });
      }
      
      const visionArea = await storage.createVisionArea(userId, validatedData);
      res.json(visionArea);
    } catch (error) {
      console.error("Vision area creation error:", error);
      res.status(500).json({ message: "Failed to create vision area" });
    }
  });

  // Update vision area
  app.patch("/api/vision-board/areas/:id", isAuthenticated, requireBetaTester, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const areaId = parseInt(req.params.id);
      const updates = req.body;
      
      const visionArea = await storage.updateVisionArea(userId, areaId, updates);
      if (!visionArea) {
        return res.status(404).json({ message: "Vision area not found" });
      }
      
      res.json(visionArea);
    } catch (error) {
      console.error("Vision area update error:", error);
      res.status(500).json({ message: "Failed to update vision area" });
    }
  });

  // Delete vision area
  app.delete("/api/vision-board/areas/:id", isAuthenticated, requireBetaTester, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const areaId = parseInt(req.params.id);
      
      const success = await storage.deleteVisionArea(userId, areaId);
      if (!success) {
        return res.status(404).json({ message: "Vision area not found" });
      }
      
      res.json({ message: "Vision area deleted successfully" });
    } catch (error) {
      console.error("Vision area deletion error:", error);
      res.status(500).json({ message: "Failed to delete vision area" });
    }
  });

  // Create milestone
  app.post("/api/vision-board/milestones", isAuthenticated, requireBetaTester, async (req: any, res: Response) => {
    try {
      const validatedData = insertVisionMilestoneSchema.parse(req.body);
      const milestone = await storage.createVisionMilestone(validatedData);
      res.json(milestone);
    } catch (error) {
      console.error("Milestone creation error:", error);
      res.status(500).json({ message: "Failed to create milestone" });
    }
  });

  // Update milestone
  app.patch("/api/vision-board/milestones/:id", isAuthenticated, requireBetaTester, async (req: any, res: Response) => {
    try {
      const milestoneId = parseInt(req.params.id);
      const updates = req.body;
      
      const milestone = await storage.updateVisionMilestone(milestoneId, updates);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      res.json(milestone);
    } catch (error) {
      console.error("Milestone update error:", error);
      res.status(500).json({ message: "Failed to update milestone" });
    }
  });

  // Delete milestone
  app.delete("/api/vision-board/milestones/:id", isAuthenticated, requireBetaTester, async (req: any, res: Response) => {
    try {
      const milestoneId = parseInt(req.params.id);
      
      const success = await storage.deleteVisionMilestone(milestoneId);
      if (!success) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      res.json({ message: "Milestone deleted successfully" });
    } catch (error) {
      console.error("Milestone deletion error:", error);
      res.status(500).json({ message: "Failed to delete milestone" });
    }
  });

  // Create next step
  app.post("/api/vision-board/next-steps", isAuthenticated, requireBetaTester, async (req: any, res: Response) => {
    try {
      const validatedData = insertVisionNextStepSchema.parse(req.body);
      const nextStep = await storage.createVisionNextStep(validatedData);
      res.json(nextStep);
    } catch (error) {
      console.error("Next step creation error:", error);
      res.status(500).json({ message: "Failed to create next step" });
    }
  });

  // Update next step
  app.patch("/api/vision-board/next-steps/:id", isAuthenticated, requireBetaTester, async (req: any, res: Response) => {
    try {
      const nextStepId = parseInt(req.params.id);
      const updates = req.body;
      
      const nextStep = await storage.updateVisionNextStep(nextStepId, updates);
      if (!nextStep) {
        return res.status(404).json({ message: "Next step not found" });
      }
      
      res.json(nextStep);
    } catch (error) {
      console.error("Next step update error:", error);
      res.status(500).json({ message: "Failed to update next step" });
    }
  });

  // Delete next step
  app.delete("/api/vision-board/next-steps/:id", isAuthenticated, requireBetaTester, async (req: any, res: Response) => {
    try {
      const nextStepId = parseInt(req.params.id);
      
      const success = await storage.deleteVisionNextStep(nextStepId);
      if (!success) {
        return res.status(404).json({ message: "Next step not found" });
      }
      
      res.json({ message: "Next step deleted successfully" });
    } catch (error) {
      console.error("Next step deletion error:", error);
      res.status(500).json({ message: "Failed to delete next step" });
    }
  });

  // Generate AI vision suggestions
  app.post("/api/vision-board/ai-suggestions", isAuthenticated, requireBetaTester, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const suggestions = await storage.generateAIVisionSuggestions(userId);
      
      // Use OpenAI to generate actual suggestions
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a life coach AI helping users create vision boards. Analyze their journal entries and provide personalized vision area suggestions following the 5-3-1 formula."
          },
          {
            role: "user",
            content: suggestions.prompt
          }
        ],
        temperature: 0.7,
      });

      let aiSuggestions;
      try {
        aiSuggestions = JSON.parse(completion.choices[0].message.content || '{}');
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        aiSuggestions = { suggestedAreas: [] };
      }

      res.json({
        suggestions: aiSuggestions,
        entriesAnalyzed: suggestions.entriesAnalyzed,
        insightsAnalyzed: suggestions.insightsAnalyzed
      });
    } catch (error) {
      console.error("AI suggestions error:", error);
      res.status(500).json({ message: "Failed to generate AI suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
