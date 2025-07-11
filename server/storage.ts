import {
  journalEntries,
  type JournalEntry,
  type InsertJournalEntry,
  userStats,
  type UserStats,
  type InsertUserStats,
  savedInsights,
  type SavedInsight,
  type InsertSavedInsight,
  badges,
  type Badge,
  type InsertBadge,
  dailyChallenges,
  type DailyChallenge,
  type InsertDailyChallenge,
  userChallengeCompletions,
  type UserChallengeCompletion,
  type InsertUserChallengeCompletion,
  userCustomTags,
  type UserCustomTag,
  type InsertUserCustomTag,
  userGoals,
  type UserGoal,
  type InsertUserGoal,
  users,
  type User,
  type InsertUser,
  type AIReflection,
  type GrowthMetrics,
  forumCategories,
  forumPosts,
  forumReplies,
  forumLikes,
  forumModerators,
  type ForumCategory,
  type InsertForumCategory,
  type ForumPost,
  type InsertForumPost,
  type ForumReply,
  type InsertForumReply,
  type ForumLike,
  type InsertForumLike,
  userProgress,
  type UserProgress,
  type InsertUserProgress,
  quests,
  type Quest,
  type InsertQuest,
  userQuests,
  type UserQuest,
  type InsertUserQuest,
  isFeatureUnlocked,
  getUnlockedFeatures,
  getNextUnlock,
  LEVEL_UNLOCKS
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte, count, isNotNull } from "drizzle-orm";

export interface IStorage {
  createJournalEntry(userId: number, entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntry(userId: number, id: number): Promise<JournalEntry | undefined>;
  getAllJournalEntries(userId: number): Promise<JournalEntry[]>;
  getRecentJournalEntries(userId: number, limit: number): Promise<JournalEntry[]>;
  getEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<JournalEntry[]>;
  updateJournalEntryReflection(userId: number, id: number, reflection: AIReflection): Promise<JournalEntry | undefined>;
  
  // Stats and gamification
  getUserStats(userId: number): Promise<UserStats>;
  updateUserStats(userId: number, stats: Partial<UserStats>): Promise<UserStats>;
  calculateStreak(userId: number): Promise<{ currentStreak: number; longestStreak: number }>;
  getGrowthMetrics(userId: number): Promise<GrowthMetrics>;
  
  // Saved insights
  saveInsight(userId: number, insight: InsertSavedInsight): Promise<SavedInsight>;
  getSavedInsights(userId: number): Promise<SavedInsight[]>;
  deleteSavedInsight(userId: number, id: number): Promise<void>;
  
  // Badges and achievements
  getBadges(userId: number): Promise<Badge[]>;
  unlockBadge(userId: number, badgeId: number): Promise<Badge>;
  checkAndUnlockBadges(userId: number): Promise<Badge[]>;
  
  // Daily challenges
  getTodaysChallenge(userId: number): Promise<any | null>;
  generateDailyChallenge(userId: number, date: string): Promise<DailyChallenge>;
  acceptChallenge(userId: number, challengeId: number): Promise<any>;
  completeChallenge(userId: number, challengeId: number): Promise<any>;
  
  // Custom tags
  getUserCustomTags(userId: number): Promise<UserCustomTag[]>;
  createCustomTag(userId: number, tagData: InsertUserCustomTag): Promise<UserCustomTag>;
  updateCustomTag(userId: number, tagId: number, updates: Partial<InsertUserCustomTag>): Promise<UserCustomTag | undefined>;
  deleteCustomTag(userId: number, tagId: number): Promise<void>;
  getCustomTagLimit(userLevel: number): number;
  
  // Goals management (Premium feature)
  createGoal(userId: number, goal: InsertUserGoal): Promise<UserGoal>;
  getGoals(userId: number): Promise<UserGoal[]>;
  getGoal(userId: number, id: number): Promise<UserGoal | undefined>;
  updateGoal(userId: number, id: number, updates: Partial<InsertUserGoal>): Promise<UserGoal | undefined>;
  deleteGoal(userId: number, id: number): Promise<void>;
  
  // Leveling system
  calculateLevel(xp: number): number;
  calculateLevelTitle(level: number): string;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(userId: number, role: string): Promise<User | undefined>;
  isUserAdmin(userId: number): Promise<boolean>;
  
  // Forum moderation
  isForumModerator(userId: number): Promise<boolean>;
  assignForumModerator(userId: number, assignedBy: number): Promise<void>;
  removeForumModerator(userId: number): Promise<void>;
  updateQuestionnaireCompletion(userId: number, completed: boolean): Promise<User | undefined>;
  updateUserDisplayName(userId: number, displayName: string): Promise<User | undefined>;

  // Progressive gamification system
  getUserProgress(userId: number): Promise<UserProgress>;
  updateUserProgress(userId: number, updates: Partial<InsertUserProgress>): Promise<UserProgress>;
  initializeUserProgress(userId: number): Promise<UserProgress>;
  checkAndUpdateUserLevel(userId: number, currentXP: number): Promise<{ leveledUp: boolean; newLevel?: number; unlockedFeatures?: string[] }>;
  isFeatureUnlockedForUser(userId: number, featureName: string): Promise<boolean>;
  getUserEntryCount(userId: number): Promise<number>;
  
  // Quest system
  getActiveQuests(userId: number): Promise<UserQuest[]>;
  getQuest(questId: number): Promise<Quest | undefined>;
  startQuest(userId: number, questId: number): Promise<UserQuest>;
  updateQuestProgress(userId: number, questId: number, progress: any): Promise<UserQuest>;
  completeQuest(userId: number, questId: number): Promise<UserQuest>;
  
  // Forum operations
  getForumCategories(): Promise<ForumCategory[]>;
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  getForumPosts(categoryId?: number, limit?: number): Promise<(ForumPost & { author: { username: string; xpPoints: number; }, category: { name: string; } })[]>;
  getForumPost(id: number): Promise<(ForumPost & { author: { username: string; }, category: { name: string; } }) | undefined>;
  createForumPost(userId: number, post: InsertForumPost): Promise<ForumPost>;
  updateForumPost(id: number, updates: Partial<InsertForumPost>): Promise<ForumPost | undefined>;
  deleteForumPost(id: number): Promise<void>;
  getForumReplies(postId: number): Promise<(ForumReply & { author: { username: string; xpPoints: number; } })[]>;
  createForumReply(userId: number, reply: InsertForumReply): Promise<ForumReply>;
  toggleForumLike(userId: number, postId?: number, replyId?: number): Promise<boolean>;
  incrementPostViews(postId: number): Promise<void>;
  getForumStats(): Promise<{ totalPosts: number; totalCategories: number; activeMembers: number; onlineNow: number }>;
}

export class DatabaseStorage implements IStorage {
  async createJournalEntry(userId: number, insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db
      .insert(journalEntries)
      .values({
        userId,
        content: insertEntry.content,
        mood: insertEntry.mood || null,
        tags: insertEntry.tags || null,
        type: insertEntry.type || null,
        status: insertEntry.status || null,
        symbol: insertEntry.symbol || null,
      })
      .returning();
    
    // Update user stats
    await this.updateStatsOnNewEntry(userId);
    
    return entry;
  }

  private async updateStatsOnNewEntry(userId: number): Promise<void> {
    const currentStats = await this.getUserStats(userId);
    const { currentStreak, longestStreak } = await this.calculateStreak(userId);
    
    // Award XP points: 10 for entry, bonus for streaks
    let xpBonus = 0;
    if (currentStreak >= 7) xpBonus += 5; // Weekly streak bonus
    if (currentStreak >= 30) xpBonus += 10; // Monthly streak bonus
    
    const newXp = currentStats.xpPoints + 10 + xpBonus;
    const newLevel = this.calculateLevel(newXp);
    const newTitle = this.calculateLevelTitle(newLevel);
    
    await this.updateUserStats(userId, {
      totalEntries: currentStats.totalEntries + 1,
      currentStreak,
      longestStreak: Math.max(currentStats.longestStreak, longestStreak),
      xpPoints: newXp,
      level: newLevel,
      title: newTitle,
      lastEntryDate: new Date(),
    });

    // Check for new badge unlocks
    await this.checkAndUnlockBadges(userId);
  }

  async getJournalEntry(userId: number, id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(
      and(eq(journalEntries.id, id), eq(journalEntries.userId, userId))
    );
    return entry;
  }

  async getAllJournalEntries(userId: number): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async getRecentJournalEntries(userId: number, limit: number): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);
  }

  async getEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          gte(journalEntries.createdAt, startDate),
          lte(journalEntries.createdAt, endDate)
        )
      )
      .orderBy(desc(journalEntries.createdAt));
  }

  async updateJournalEntryReflection(userId: number, id: number, reflection: AIReflection): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .update(journalEntries)
      .set({ aiReflection: reflection })
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .returning();
    return entry;
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    
    if (!stats) {
      // Create default stats for new user
      const [newStats] = await db
        .insert(userStats)
        .values({
          userId: userId,
          totalEntries: 0,
          currentStreak: 0,
          longestStreak: 0,
          xpPoints: 0,
          level: 1,
          title: "Reflective Wanderer",
          moodMasteryScore: 0,
          lastEntryDate: null,
        })
        .returning();
      return newStats;
    }
    
    // SAFEGUARD: Verify level consistency on every stats fetch
    const calculatedLevel = this.calculateLevel(stats.xpPoints);
    const calculatedTitle = this.calculateLevelTitle(calculatedLevel);
    
    if (stats.level !== calculatedLevel || stats.title !== calculatedTitle) {
      console.warn(`Level inconsistency detected for user ${userId}: DB level ${stats.level} vs calculated ${calculatedLevel}`);
      
      // Auto-correct the inconsistency
      const [correctedStats] = await db
        .update(userStats)
        .set({
          level: calculatedLevel,
          title: calculatedTitle,
          updatedAt: new Date(),
        })
        .where(eq(userStats.userId, userId))
        .returning();
      
      return correctedStats;
    }
    
    return stats;
  }

  async updateUserStats(userId: number, updateData: Partial<UserStats>): Promise<UserStats> {
    // SAFEGUARD: Always recalculate level and title when XP changes
    if (updateData.xpPoints !== undefined) {
      const calculatedLevel = this.calculateLevel(updateData.xpPoints);
      const calculatedTitle = this.calculateLevelTitle(calculatedLevel);
      
      // Override level and title with calculated values to prevent inconsistencies
      updateData.level = calculatedLevel;
      updateData.title = calculatedTitle;
    }
    
    const [updatedStats] = await db
      .update(userStats)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, userId))
      .returning();
    
    return updatedStats;
  }

  async calculateStreak(userId: number): Promise<{ currentStreak: number; longestStreak: number }> {
    const entries = await db
      .select({ createdAt: journalEntries.createdAt })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));

    if (entries.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Group entries by date (YYYY-MM-DD) to handle multiple entries per day
    const entriesByDate = new Set<string>();
    for (const entry of entries) {
      const dateKey = entry.createdAt.toISOString().split('T')[0];
      entriesByDate.add(dateKey);
    }

    // Convert to sorted array of unique dates (most recent first)
    const uniqueDates = Array.from(entriesByDate).sort().reverse();
    
    if (uniqueDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Calculate current streak starting from today/yesterday
    let currentStreak = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Start counting from the most recent entry date
    const mostRecentDate = uniqueDates[0];
    
    // Current streak only counts if last entry was today or yesterday
    if (mostRecentDate === todayStr || mostRecentDate === yesterdayStr) {
      // Find the starting point for current streak calculation
      let streakStartIndex = 0;
      
      // If most recent is yesterday and today has no entry, start from yesterday
      if (mostRecentDate === yesterdayStr && !entriesByDate.has(todayStr)) {
        streakStartIndex = 0;
      } else if (mostRecentDate === todayStr) {
        streakStartIndex = 0;
      }

      // Calculate consecutive days from the starting point
      for (let i = streakStartIndex; i < uniqueDates.length; i++) {
        const currentDate = uniqueDates[i];
        
        if (i === 0) {
          currentStreak = 1;
          continue;
        }
        
        // Check if current date is exactly one day before the previous date
        const currentDateObj = new Date(currentDate);
        const prevDateObj = new Date(uniqueDates[i - 1]);
        const dayDiff = Math.floor((prevDateObj.getTime() - currentDateObj.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break; // Streak broken
        }
      }
    }

    // Calculate longest streak by checking all possible consecutive sequences
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const prevDate = new Date(uniqueDates[i - 1]);
      
      const dayDiff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // If we only have one date, both streaks should be 1
    if (uniqueDates.length === 1) {
      if (mostRecentDate === todayStr || mostRecentDate === yesterdayStr) {
        currentStreak = 1;
      }
      longestStreak = 1;
    }


    
    return { currentStreak, longestStreak };
  }

  async getGrowthMetrics(userId: number): Promise<GrowthMetrics> {
    const stats = await this.getUserStats(userId);
    
    // Get mood trends from recent entries
    const recentEntries = await this.getRecentJournalEntries(userId, 50);
    const moodCounts = recentEntries.reduce((acc, entry) => {
      if (entry.mood) {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const totalMoodEntries = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    const moodTrends = Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / totalMoodEntries) * 100) || 0,
    }));

    // Get common themes from tags
    const commonThemes = recentEntries
      .flatMap(entry => entry.tags || [])
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const themes = Object.entries(commonThemes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([theme, frequency]) => ({ theme, frequency }));

    // Get writing frequency for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyEntries = await this.getEntriesByDateRange(userId, thirtyDaysAgo, new Date());
    const writingFrequency = monthlyEntries.reduce((acc, entry) => {
      const date = entry.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const frequency = Object.entries(writingFrequency).map(([date, count]) => ({ date, count }));

    return {
      totalEntries: stats.totalEntries,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      xpPoints: stats.xpPoints,
      moodTrends,
      commonThemes: themes,
      writingFrequency: frequency,
    };
  }

  async saveInsight(userId: number, insight: InsertSavedInsight): Promise<SavedInsight> {
    const [savedInsight] = await db
      .insert(savedInsights)
      .values({ ...insight, userId })
      .returning();
    return savedInsight;
  }

  async getSavedInsights(userId: number): Promise<SavedInsight[]> {
    return await db
      .select()
      .from(savedInsights)
      .where(eq(savedInsights.userId, userId))
      .orderBy(desc(savedInsights.createdAt));
  }

  async deleteSavedInsight(userId: number, id: number): Promise<void> {
    await db
      .delete(savedInsights)
      .where(and(eq(savedInsights.id, id), eq(savedInsights.userId, userId)));
  }

  async getBadges(userId: number): Promise<Badge[]> {
    return await db.select().from(badges).orderBy(badges.id);
  }

  async unlockBadge(userId: number, badgeId: number): Promise<Badge> {
    const [badge] = await db
      .update(badges)
      .set({ unlockedAt: new Date().toISOString() })
      .where(eq(badges.id, badgeId))
      .returning();
    return badge;
  }

  async checkAndUnlockBadges(userId: number): Promise<Badge[]> {
    const stats = await this.getUserStats(userId);
    const allBadges = await this.getBadges(userId);
    const unlockedBadges: Badge[] = [];

    for (const badge of allBadges) {
      if (badge.unlockedAt) continue; // Already unlocked

      let shouldUnlock = false;
      
      switch (badge.name) {
        case "First Steps":
          shouldUnlock = stats.totalEntries >= 1;
          break;
        case "Week Warrior":
          shouldUnlock = stats.currentStreak >= 7;
          break;
        case "Consistency King":
          shouldUnlock = stats.totalEntries >= 30;
          break;
        case "Streak Legend":
          shouldUnlock = stats.longestStreak >= 30;
          break;
        case "Reflection Master":
          shouldUnlock = stats.totalEntries >= 100;
          break;
        case "XP Hunter":
          shouldUnlock = stats.xpPoints >= 500;
          break;
      }

      if (shouldUnlock) {
        const unlockedBadge = await this.unlockBadge(userId, badge.id);
        unlockedBadges.push(unlockedBadge);
      }
    }

    return unlockedBadges;
  }

  async getTodaysChallenge(userId: number): Promise<any | null> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get or create today's challenge
    let [challenge] = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.date, today))
      .limit(1);
    
    if (!challenge) {
      challenge = await this.generateDailyChallenge(userId, today);
    }
    
    // Get user-specific completion status
    let [userCompletion] = await db
      .select()
      .from(userChallengeCompletions)
      .where(and(
        eq(userChallengeCompletions.userId, userId),
        eq(userChallengeCompletions.challengeId, challenge.id)
      ))
      .limit(1);
    
    // If no completion record exists, create one
    if (!userCompletion) {
      [userCompletion] = await db
        .insert(userChallengeCompletions)
        .values({
          userId,
          challengeId: challenge.id,
          status: 'not_started',
          acceptedAt: null,
          completedAt: null,
        })
        .returning();
    }
    
    // Return combined challenge and user completion data
    return {
      id: challenge.id,
      date: challenge.date,
      title: challenge.title,
      description: challenge.description,
      prompt: challenge.prompt,
      xpReward: challenge.xpReward,
      createdAt: challenge.createdAt,
      status: userCompletion.status,
      acceptedAt: userCompletion.acceptedAt,
      completedAt: userCompletion.completedAt,
      acceptedUserId: userCompletion.status === 'accepted' || userCompletion.status === 'completed' ? userId : null,
    };
  }

  async generateDailyChallenge(userId: number, date: string): Promise<DailyChallenge> {
    const challenges = [
      {
        title: "Gratitude Spotlight",
        description: "What made you smile today?",
        prompt: "Write about three things you're grateful for today, no matter how small.",
        xpReward: 15
      },
      {
        title: "Fear Explorer",
        description: "Face a small fear today",
        prompt: "What's one small thing you've been avoiding? Write about taking that first step.",
        xpReward: 20
      },
      {
        title: "Growth Spotter",
        description: "Notice your progress",
        prompt: "Reflect on how you've grown in the past month. What positive changes do you notice?",
        xpReward: 15
      },
      {
        title: "Future Visionary",
        description: "Dream about tomorrow",
        prompt: "Describe where you see yourself in one year. What steps will get you there?",
        xpReward: 18
      }
    ];

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    const [challenge] = await db
      .insert(dailyChallenges)
      .values({
        date,
        ...randomChallenge,
      })
      .returning();
    
    return challenge;
  }

  async acceptChallenge(userId: number, challengeId: number): Promise<any> {
    // Update user-specific completion status
    const [userCompletion] = await db
      .update(userChallengeCompletions)
      .set({
        status: 'accepted',
        acceptedAt: new Date(),
      })
      .where(and(
        eq(userChallengeCompletions.userId, userId),
        eq(userChallengeCompletions.challengeId, challengeId)
      ))
      .returning();

    // Get the challenge details
    const [challenge] = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.id, challengeId))
      .limit(1);

    // Return combined data
    return {
      id: challenge.id,
      date: challenge.date,
      title: challenge.title,
      description: challenge.description,
      prompt: challenge.prompt,
      xpReward: challenge.xpReward,
      createdAt: challenge.createdAt,
      status: userCompletion.status,
      acceptedAt: userCompletion.acceptedAt,
      completedAt: userCompletion.completedAt,
      acceptedUserId: userId,
    };
  }

  async completeChallenge(userId: number, challengeId: number): Promise<any> {
    // Get the challenge first to access the prompt
    const [existingChallenge] = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.id, challengeId));

    if (!existingChallenge) {
      throw new Error("Challenge not found");
    }

    // Get user-specific completion status
    const [userCompletion] = await db
      .select()
      .from(userChallengeCompletions)
      .where(and(
        eq(userChallengeCompletions.userId, userId),
        eq(userChallengeCompletions.challengeId, challengeId)
      ))
      .limit(1);

    if (!userCompletion || userCompletion.status !== 'accepted') {
      throw new Error("Challenge must be accepted before it can be completed");
    }

    // Verify the user has written a journal entry today
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = await db
      .select()
      .from(journalEntries)
      .where(and(
        eq(journalEntries.userId, userId),
        sql`DATE(${journalEntries.createdAt}) = ${today}`
      ));

    if (todayEntries.length === 0) {
      throw new Error("You must write a journal entry today to complete the challenge");
    }

    // Calculate total characters excluding the challenge prompt
    const challengePrompt = existingChallenge.prompt;
    const totalCharacters = todayEntries.reduce((total, entry) => {
      // If the entry contains the challenge prompt, subtract it from the count
      let effectiveContent = entry.content;
      if (effectiveContent.includes(challengePrompt)) {
        effectiveContent = effectiveContent.replace(challengePrompt, '').trim();
      }
      return total + effectiveContent.length;
    }, 0);

    console.log(`DEBUG: Challenge prompt: "${challengePrompt}"`);
    console.log(`DEBUG: Entry content: "${todayEntries[0]?.content}"`);
    console.log(`DEBUG: Characters beyond prompt: ${totalCharacters}`);

    if (totalCharacters < 100) {
      throw new Error(`You must write at least 100 characters beyond the challenge prompt to complete the challenge. Currently: ${totalCharacters}/100 characters.`);
    }

    // Update user-specific completion status
    const [updatedCompletion] = await db
      .update(userChallengeCompletions)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(and(
        eq(userChallengeCompletions.userId, userId),
        eq(userChallengeCompletions.challengeId, challengeId)
      ))
      .returning();

    // Award XP for completing challenge
    const stats = await this.getUserStats(userId);
    await this.updateUserStats(userId, {
      xpPoints: stats.xpPoints + existingChallenge.xpReward,
    });

    // Return combined data
    return {
      id: existingChallenge.id,
      date: existingChallenge.date,
      title: existingChallenge.title,
      description: existingChallenge.description,
      prompt: existingChallenge.prompt,
      xpReward: existingChallenge.xpReward,
      createdAt: existingChallenge.createdAt,
      status: updatedCompletion.status,
      acceptedAt: updatedCompletion.acceptedAt,
      completedAt: updatedCompletion.completedAt,
      acceptedUserId: userId,
    };
  }

  calculateLevel(xp: number): number {
    // Level progression: 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500...
    let level = 1;
    let requiredXp = 100;
    let totalXp = 0;
    
    while (totalXp + requiredXp <= xp) {
      totalXp += requiredXp;
      level++;
      requiredXp += 200; // Increasing requirement for each level
    }
    
    return level;
  }
  
  // SAFEGUARD: Database integrity check to fix level inconsistencies
  async verifyAndFixLevelConsistency(): Promise<{ checkedUsers: number; fixedUsers: number }> {
    const allStats = await db.select().from(userStats);
    let checkedUsers = 0;
    let fixedUsers = 0;
    
    for (const stats of allStats) {
      checkedUsers++;
      const calculatedLevel = this.calculateLevel(stats.xpPoints);
      const calculatedTitle = this.calculateLevelTitle(calculatedLevel);
      
      if (stats.level !== calculatedLevel || stats.title !== calculatedTitle) {
        console.log(`Fixing level inconsistency for user ${stats.userId}: ${stats.level} → ${calculatedLevel}`);
        
        await db
          .update(userStats)
          .set({
            level: calculatedLevel,
            title: calculatedTitle,
            updatedAt: new Date(),
          })
          .where(eq(userStats.userId, stats.userId));
        
        fixedUsers++;
      }
    }
    
    return { checkedUsers, fixedUsers };
  }

  calculateLevelTitle(level: number): string {
    const titles = [
      "Reflective Wanderer",      // Level 1
      "Thoughtful Seeker",        // Level 2-3
      "Mindful Explorer",         // Level 4-5
      "Wisdom Gatherer",          // Level 6-7
      "Growth Catalyst",          // Level 8-9
      "Inner Architect",          // Level 10+
    ];
    
    if (level === 1) return titles[0];
    if (level <= 3) return titles[1];
    if (level <= 5) return titles[2];
    if (level <= 7) return titles[3];
    if (level <= 9) return titles[4];
    return titles[5];
  }

  async createGoal(userId: number, goalData: InsertUserGoal): Promise<UserGoal> {
    const [goal] = await db
      .insert(userGoals)
      .values({ ...goalData, userId })
      .returning();
    return goal;
  }

  async getGoals(userId: number): Promise<UserGoal[]> {
    return await db
      .select()
      .from(userGoals)
      .where(eq(userGoals.userId, userId))
      .orderBy(desc(userGoals.createdAt));
  }

  async getGoal(userId: number, id: number): Promise<UserGoal | undefined> {
    const [goal] = await db
      .select()
      .from(userGoals)
      .where(and(eq(userGoals.id, id), eq(userGoals.userId, userId)))
      .limit(1);
    return goal;
  }

  async updateGoal(userId: number, id: number, updates: Partial<InsertUserGoal>): Promise<UserGoal | undefined> {
    const [goal] = await db
      .update(userGoals)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(userGoals.id, id), eq(userGoals.userId, userId)))
      .returning();
    return goal;
  }

  async deleteGoal(userId: number, id: number): Promise<void> {
    await db
      .delete(userGoals)
      .where(and(eq(userGoals.id, id), eq(userGoals.userId, userId)));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async isUserAdmin(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    return user?.role === 'admin';
  }

  async isForumModerator(userId: number): Promise<boolean> {
    const [moderator] = await db.select()
      .from(forumModerators)
      .where(eq(forumModerators.userId, userId));
    return !!moderator;
  }

  async assignForumModerator(userId: number, assignedBy: number): Promise<void> {
    await db.insert(forumModerators)
      .values({ userId, assignedBy });
  }

  async removeForumModerator(userId: number): Promise<void> {
    await db.delete(forumModerators)
      .where(eq(forumModerators.userId, userId));
  }

  // Custom tags methods
  async getUserCustomTags(userId: number): Promise<UserCustomTag[]> {
    return await db
      .select()
      .from(userCustomTags)
      .where(eq(userCustomTags.userId, userId))
      .orderBy(userCustomTags.displayOrder);
  }

  async createCustomTag(userId: number, tagData: InsertUserCustomTag): Promise<UserCustomTag> {
    const [tag] = await db
      .insert(userCustomTags)
      .values({ ...tagData, userId })
      .returning();
    return tag;
  }

  async updateCustomTag(userId: number, tagId: number, updates: Partial<InsertUserCustomTag>): Promise<UserCustomTag | undefined> {
    const [tag] = await db
      .update(userCustomTags)
      .set(updates)
      .where(and(eq(userCustomTags.id, tagId), eq(userCustomTags.userId, userId)))
      .returning();
    return tag;
  }

  async deleteCustomTag(userId: number, tagId: number): Promise<void> {
    await db
      .delete(userCustomTags)
      .where(and(eq(userCustomTags.id, tagId), eq(userCustomTags.userId, userId)));
  }

  getCustomTagLimit(userLevel: number): number {
    // Levels 1-3: 5 tags, Levels 4-7: 10 tags, Levels 8-10: 15 tags
    if (userLevel <= 3) return 5;
    if (userLevel <= 7) return 10;
    return 15;
  }

  async getAllUsersWithDetails(): Promise<any[]> {
    const LEVEL_TITLES = [
      "Reflective Wanderer",
      "Mindful Seeker", 
      "Insight Student",
      "Growth Climber",
      "Wisdom Builder",
      "Path Navigator", 
      "Soul Architect",
      "Life Guardian",
      "Inner Sage",
      "Legendary Oracle"
    ];

    // Get all users with their progress and stats
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      createdAt: users.createdAt
    }).from(users).orderBy(users.createdAt);

    const detailedUsers = [];

    for (const user of allUsers) {
      // Get user progress
      const [progress] = await db.select()
        .from(userProgress)
        .where(eq(userProgress.userId, user.id));

      // Get user stats
      const [stats] = await db.select()
        .from(userStats)
        .where(eq(userStats.userId, user.id));

      // Get badge count (only unlocked badges)
      const badgeCount = await db.select({ count: sql<number>`count(*)` })
        .from(badges)
        .where(and(eq(badges.userId, user.id), sql`unlocked_at IS NOT NULL`));

      // Get last active date from latest journal entry
      const [lastEntry] = await db.select({ createdAt: journalEntries.createdAt })
        .from(journalEntries)
        .where(eq(journalEntries.userId, user.id))
        .orderBy(desc(journalEntries.createdAt))
        .limit(1);

      const currentLevel = progress?.currentLevel || 1;
      const levelTitle = LEVEL_TITLES[currentLevel - 1] || "Reflective Wanderer";

      detailedUsers.push({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        isAdmin: user.role === 'admin',
        progress: {
          currentLevel,
          xpPoints: progress?.xpPoints || 0,
          unlockedFeatures: progress?.unlockedFeatures || [],
          levelTitle
        },
        stats: {
          totalEntries: stats?.totalEntries || 0,
          currentStreak: stats?.currentStreak || 0,
          longestStreak: stats?.longestStreak || 0,
          lastActiveDate: lastEntry?.createdAt || null
        },
        badges: badgeCount[0]?.count || 0
      });
    }

    return detailedUsers;
  }

  // Forum operations
  async getForumCategories(): Promise<ForumCategory[]> {
    return await db.select().from(forumCategories).where(eq(forumCategories.isActive, true)).orderBy(forumCategories.createdAt);
  }

  async createForumCategory(categoryData: InsertForumCategory): Promise<ForumCategory> {
    const [category] = await db.insert(forumCategories).values(categoryData).returning();
    return category;
  }

  async getForumPosts(categoryId?: number, limit = 50): Promise<(ForumPost & { author: { username: string; xpPoints: number; }, category: { name: string; } })[]> {
    const query = db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        content: forumPosts.content,
        authorId: forumPosts.authorId,
        categoryId: forumPosts.categoryId,
        isPinned: forumPosts.isPinned,
        isFeatured: forumPosts.isFeatured,
        isLocked: forumPosts.isLocked,
        viewCount: forumPosts.viewCount,
        likeCount: forumPosts.likeCount,
        replyCount: forumPosts.replyCount,
        lastReplyAt: forumPosts.lastReplyAt,
        lastReplyBy: forumPosts.lastReplyBy,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
        author: { 
          username: users.username,
          xpPoints: userStats.xpPoints
        },
        category: { name: forumCategories.name }
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.authorId, users.id))
      .leftJoin(userStats, eq(users.id, userStats.id))
      .leftJoin(forumCategories, eq(forumPosts.categoryId, forumCategories.id))
      .orderBy(desc(forumPosts.isPinned), desc(forumPosts.createdAt))
      .limit(limit);

    if (categoryId) {
      query.where(eq(forumPosts.categoryId, categoryId));
    }

    return await query;
  }

  async getForumPost(id: number): Promise<(ForumPost & { author: { username: string; }, category: { name: string; } }) | undefined> {
    const [post] = await db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        content: forumPosts.content,
        authorId: forumPosts.authorId,
        categoryId: forumPosts.categoryId,
        isPinned: forumPosts.isPinned,
        isFeatured: forumPosts.isFeatured,
        isLocked: forumPosts.isLocked,
        viewCount: forumPosts.viewCount,
        likeCount: forumPosts.likeCount,
        replyCount: forumPosts.replyCount,
        lastReplyAt: forumPosts.lastReplyAt,
        lastReplyBy: forumPosts.lastReplyBy,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
        author: { username: users.username },
        category: { name: forumCategories.name }
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.authorId, users.id))
      .leftJoin(forumCategories, eq(forumPosts.categoryId, forumCategories.id))
      .where(eq(forumPosts.id, id));

    return post;
  }

  async createForumPost(userId: number, postData: InsertForumPost): Promise<ForumPost> {
    const [post] = await db.insert(forumPosts).values({ ...postData, authorId: userId }).returning();
    return post;
  }

  async updateForumPost(id: number, updates: Partial<InsertForumPost>): Promise<ForumPost | undefined> {
    const [post] = await db.update(forumPosts).set({ ...updates, updatedAt: new Date() }).where(eq(forumPosts.id, id)).returning();
    return post;
  }

  async deleteForumPost(id: number): Promise<void> {
    await db.delete(forumPosts).where(eq(forumPosts.id, id));
  }

  async getForumReplies(postId: number): Promise<(ForumReply & { author: { username: string; xpPoints: number; } })[]> {
    return await db
      .select({
        id: forumReplies.id,
        content: forumReplies.content,
        authorId: forumReplies.authorId,
        postId: forumReplies.postId,
        parentReplyId: forumReplies.parentReplyId,
        likeCount: forumReplies.likeCount,
        createdAt: forumReplies.createdAt,
        updatedAt: forumReplies.updatedAt,
        author: { 
          username: users.username,
          xpPoints: userStats.xpPoints
        }
      })
      .from(forumReplies)
      .leftJoin(users, eq(forumReplies.authorId, users.id))
      .leftJoin(userStats, eq(users.id, userStats.id))
      .where(eq(forumReplies.postId, postId))
      .orderBy(forumReplies.createdAt);
  }

  async createForumReply(userId: number, replyData: InsertForumReply): Promise<ForumReply> {
    const [reply] = await db.insert(forumReplies).values({ ...replyData, authorId: userId }).returning();
    
    // Update post reply count and last reply info
    await db.update(forumPosts)
      .set({ 
        replyCount: sql`${forumPosts.replyCount} + 1`,
        lastReplyAt: new Date(),
        lastReplyBy: userId
      })
      .where(eq(forumPosts.id, replyData.postId));

    return reply;
  }

  async toggleForumLike(userId: number, postId?: number, replyId?: number): Promise<boolean> {
    const existing = await db
      .select()
      .from(forumLikes)
      .where(
        and(
          eq(forumLikes.userId, userId),
          postId ? eq(forumLikes.postId, postId) : sql`${forumLikes.postId} IS NULL`,
          replyId ? eq(forumLikes.replyId, replyId) : sql`${forumLikes.replyId} IS NULL`
        )
      );

    if (existing.length > 0) {
      // Unlike
      await db.delete(forumLikes).where(eq(forumLikes.id, existing[0].id));
      
      if (postId) {
        await db.update(forumPosts).set({ likeCount: sql`${forumPosts.likeCount} - 1` }).where(eq(forumPosts.id, postId));
      }
      if (replyId) {
        await db.update(forumReplies).set({ likeCount: sql`${forumReplies.likeCount} - 1` }).where(eq(forumReplies.id, replyId));
      }
      
      return false;
    } else {
      // Like
      await db.insert(forumLikes).values({ userId, postId, replyId });
      
      if (postId) {
        await db.update(forumPosts).set({ likeCount: sql`${forumPosts.likeCount} + 1` }).where(eq(forumPosts.id, postId));
      }
      if (replyId) {
        await db.update(forumReplies).set({ likeCount: sql`${forumReplies.likeCount} + 1` }).where(eq(forumReplies.id, replyId));
      }
      
      return true;
    }
  }

  async incrementPostViews(postId: number): Promise<void> {
    await db.update(forumPosts).set({ viewCount: sql`${forumPosts.viewCount} + 1` }).where(eq(forumPosts.id, postId));
  }

  async getForumStats(): Promise<{ totalPosts: number; totalCategories: number; activeMembers: number; onlineNow: number }> {
    const [postsCount] = await db.select({ count: count() }).from(forumPosts);
    const [categoriesCount] = await db.select({ count: count() }).from(forumCategories).where(eq(forumCategories.isActive, true));
    const [membersCount] = await db.select({ count: count() }).from(users);
    
    return {
      totalPosts: postsCount.count,
      totalCategories: categoriesCount.count,
      activeMembers: membersCount.count,
      onlineNow: Math.floor(membersCount.count * 0.05) // Simulate online users
    };
  }

  async updateQuestionnaireCompletion(userId: number, completed: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ hasCompletedQuestionnaire: completed })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserDisplayName(userId: number, displayName: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ displayName })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Progressive gamification system implementation
  async getUserProgress(userId: number): Promise<UserProgress> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    
    if (!progress) {
      return await this.initializeUserProgress(userId);
    }
    
    return progress;
  }

  async updateUserProgress(userId: number, updates: Partial<InsertUserProgress>): Promise<UserProgress> {
    const [progress] = await db
      .update(userProgress)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProgress.userId, userId))
      .returning();
    return progress;
  }

  async initializeUserProgress(userId: number): Promise<UserProgress> {
    // Get current user stats to determine initial level
    const stats = await this.getUserStats(userId);
    const initialLevel = this.calculateLevel(stats.xpPoints);
    const unlockedFeatures = getUnlockedFeatures(initialLevel);
    
    const [progress] = await db
      .insert(userProgress)
      .values({
        userId,
        currentLevel: initialLevel,
        unlockedFeatures,
        tokensEarned: 0,
        themesUnlocked: ['default'],
        activeTheme: 'default'
      })
      .returning();
    
    return progress;
  }

  async checkAndUpdateUserLevel(userId: number, currentXP: number): Promise<{ leveledUp: boolean; newLevel?: number; unlockedFeatures?: string[] }> {
    const progress = await this.getUserProgress(userId);
    const newLevel = this.calculateLevel(currentXP);
    
    if (newLevel > progress.currentLevel) {
      const newUnlockedFeatures = getUnlockedFeatures(newLevel);
      const newlyUnlocked = newUnlockedFeatures.filter(
        feature => !progress.unlockedFeatures.includes(feature)
      );
      
      await this.updateUserProgress(userId, {
        currentLevel: newLevel,
        unlockedFeatures: newUnlockedFeatures,
        lastLevelUp: new Date()
      });
      
      return {
        leveledUp: true,
        newLevel,
        unlockedFeatures: newlyUnlocked
      };
    }
    
    return { leveledUp: false };
  }

  async isFeatureUnlockedForUser(userId: number, featureName: string): Promise<boolean> {
    const progress = await this.getUserProgress(userId);
    return isFeatureUnlocked(progress.currentLevel, featureName);
  }

  async getUserEntryCount(userId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId));
    
    return result.count;
  }

  // Quest system implementation
  async getActiveQuests(userId: number): Promise<UserQuest[]> {
    return await db
      .select()
      .from(userQuests)
      .where(and(
        eq(userQuests.userId, userId),
        eq(userQuests.status, 'active')
      ));
  }

  async getQuest(questId: number): Promise<Quest | undefined> {
    const [quest] = await db
      .select()
      .from(quests)
      .where(eq(quests.id, questId));
    
    return quest;
  }

  async startQuest(userId: number, questId: number): Promise<UserQuest> {
    const [userQuest] = await db
      .insert(userQuests)
      .values({
        userId,
        questId,
        status: 'active',
        currentStep: 0,
        progress: {}
      })
      .returning();
    
    return userQuest;
  }

  async updateQuestProgress(userId: number, questId: number, progress: any): Promise<UserQuest> {
    const [userQuest] = await db
      .update(userQuests)
      .set({ progress })
      .where(and(
        eq(userQuests.userId, userId),
        eq(userQuests.questId, questId)
      ))
      .returning();
    
    return userQuest;
  }

  async completeQuest(userId: number, questId: number): Promise<UserQuest> {
    const [userQuest] = await db
      .update(userQuests)
      .set({ 
        status: 'completed',
        completedAt: new Date()
      })
      .where(and(
        eq(userQuests.userId, userId),
        eq(userQuests.questId, questId)
      ))
      .returning();
    
    return userQuest;
  }
}

export const storage = new DatabaseStorage();