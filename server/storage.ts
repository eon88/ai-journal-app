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
  type ForumCategory,
  type InsertForumCategory,
  type ForumPost,
  type InsertForumPost,
  type ForumReply,
  type InsertForumReply,
  type ForumLike,
  type InsertForumLike,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte, count } from "drizzle-orm";

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
  getTodaysChallenge(userId: number): Promise<DailyChallenge | null>;
  generateDailyChallenge(userId: number, date: string): Promise<DailyChallenge>;
  completeChallenge(userId: number, challengeId: number): Promise<DailyChallenge>;
  
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
  updateQuestionnaireCompletion(userId: number, completed: boolean): Promise<User | undefined>;
  updateUserDisplayName(userId: number, displayName: string): Promise<User | undefined>;
  
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
    const [stats] = await db.select().from(userStats).where(eq(userStats.id, userId));
    
    if (!stats) {
      // Create default stats for new user
      const [newStats] = await db
        .insert(userStats)
        .values({
          id: userId,
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
    
    return stats;
  }

  async updateUserStats(userId: number, updateData: Partial<UserStats>): Promise<UserStats> {
    const [updatedStats] = await db
      .update(userStats)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(userStats.id, userId))
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

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = new Date(entries[0].createdAt);
    
    // Normalize to start of day for comparison
    lastDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if the most recent entry was today or yesterday
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 1) {
      currentStreak = 1;
    }

    // Calculate streaks
    for (let i = 1; i < entries.length; i++) {
      const currentDate = new Date(entries[i].createdAt);
      currentDate.setHours(0, 0, 0, 0);
      
      const prevDate = new Date(entries[i - 1].createdAt);
      prevDate.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        tempStreak++;
        if (daysDiff <= 1 && i < currentStreak + daysDiff) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
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
      .values(insight)
      .returning();
    return savedInsight;
  }

  async getSavedInsights(userId: number): Promise<SavedInsight[]> {
    return await db
      .select()
      .from(savedInsights)
      .orderBy(desc(savedInsights.createdAt));
  }

  async deleteSavedInsight(userId: number, id: number): Promise<void> {
    await db
      .delete(savedInsights)
      .where(eq(savedInsights.id, id));
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

  async getTodaysChallenge(userId: number): Promise<DailyChallenge | null> {
    const today = new Date().toISOString().split('T')[0];
    const [challenge] = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.date, today))
      .limit(1);
    
    if (!challenge) {
      return await this.generateDailyChallenge(userId, today);
    }
    
    return challenge;
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
        completed: false,
        completedAt: null,
      })
      .returning();
    
    return challenge;
  }

  async completeChallenge(userId: number, challengeId: number): Promise<DailyChallenge> {
    const [challenge] = await db
      .update(dailyChallenges)
      .set({
        completed: true,
        completedAt: new Date(),
      })
      .where(eq(dailyChallenges.id, challengeId))
      .returning();

    // Award XP for completing challenge
    const stats = await this.getUserStats(userId);
    await this.updateUserStats(userId, {
      xpPoints: stats.xpPoints + challenge.xpReward,
    });

    return challenge;
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
      .values(goalData)
      .returning();
    return goal;
  }

  async getGoals(userId: number): Promise<UserGoal[]> {
    return await db
      .select()
      .from(userGoals)
      .orderBy(desc(userGoals.createdAt));
  }

  async getGoal(userId: number, id: number): Promise<UserGoal | undefined> {
    const [goal] = await db
      .select()
      .from(userGoals)
      .where(eq(userGoals.id, id))
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
      .where(eq(userGoals.id, id))
      .returning();
    return goal;
  }

  async deleteGoal(userId: number, id: number): Promise<void> {
    await db
      .delete(userGoals)
      .where(eq(userGoals.id, id));
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
}

export const storage = new DatabaseStorage();