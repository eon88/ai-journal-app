import { 
  journalEntries, 
  userStats, 
  savedInsights,
  badges,
  dailyChallenges,
  userGoals,
  type JournalEntry, 
  type InsertJournalEntry,
  type UserStats,
  type InsertUserStats,
  type SavedInsight,
  type InsertSavedInsight,
  type Badge,
  type InsertBadge,
  type DailyChallenge,
  type InsertDailyChallenge,
  type UserGoal,
  type InsertUserGoal,
  type AIReflection,
  type GrowthMetrics,
  users,
  type User,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte, count } from "drizzle-orm";

export interface IStorage {
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  getAllJournalEntries(): Promise<JournalEntry[]>;
  getRecentJournalEntries(limit: number): Promise<JournalEntry[]>;
  getEntriesByDateRange(startDate: Date, endDate: Date): Promise<JournalEntry[]>;
  updateJournalEntryReflection(id: number, reflection: AIReflection): Promise<JournalEntry | undefined>;
  
  // Stats and gamification
  getUserStats(): Promise<UserStats>;
  updateUserStats(stats: Partial<UserStats>): Promise<UserStats>;
  calculateStreak(): Promise<{ currentStreak: number; longestStreak: number }>;
  getGrowthMetrics(): Promise<GrowthMetrics>;
  
  // Saved insights
  saveInsight(insight: InsertSavedInsight): Promise<SavedInsight>;
  getSavedInsights(): Promise<SavedInsight[]>;
  deleteSavedInsight(id: number): Promise<void>;
  
  // Badges and achievements
  getBadges(): Promise<Badge[]>;
  unlockBadge(badgeId: number): Promise<Badge>;
  checkAndUnlockBadges(): Promise<Badge[]>;
  
  // Daily challenges
  getTodaysChallenge(): Promise<DailyChallenge | null>;
  generateDailyChallenge(date: string): Promise<DailyChallenge>;
  completeChallenge(challengeId: number): Promise<DailyChallenge>;
  
  // Goals management (Premium feature)
  createGoal(goal: InsertUserGoal): Promise<UserGoal>;
  getGoals(): Promise<UserGoal[]>;
  getGoal(id: number): Promise<UserGoal | undefined>;
  updateGoal(id: number, updates: Partial<InsertUserGoal>): Promise<UserGoal | undefined>;
  deleteGoal(id: number): Promise<void>;
  
  // Leveling system
  calculateLevel(xp: number): number;
  calculateLevelTitle(level: number): string;
  
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db
      .insert(journalEntries)
      .values({
        content: insertEntry.content,
        mood: insertEntry.mood || null,
        tags: insertEntry.tags || null,
        type: insertEntry.type || null,
        status: insertEntry.status || null,
        symbol: insertEntry.symbol || null,
      })
      .returning();
    
    // Update user stats
    await this.updateStatsOnNewEntry();
    
    return entry;
  }

  private async updateStatsOnNewEntry(): Promise<void> {
    const stats = await this.getUserStats();
    const streakData = await this.calculateStreak();
    
    // Award XP points: 10 for entry, bonus for streaks
    const baseXP = 10;
    const streakBonus = streakData.currentStreak > 1 ? streakData.currentStreak * 2 : 0;
    const newXP = stats.xpPoints + baseXP + streakBonus;
    
    // Calculate new level and title
    const newLevel = this.calculateLevel(newXP);
    const newTitle = this.calculateLevelTitle(newLevel);
    
    await this.updateUserStats({
      totalEntries: stats.totalEntries + 1,
      currentStreak: streakData.currentStreak,
      longestStreak: Math.max(stats.longestStreak, streakData.longestStreak),
      xpPoints: newXP,
      level: newLevel,
      title: newTitle,
      lastEntryDate: new Date(),
    });
    
    // Check for new badges to unlock
    await this.checkAndUnlockBadges();
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry || undefined;
  }

  async getAllJournalEntries(): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).orderBy(desc(journalEntries.createdAt));
  }

  async getRecentJournalEntries(limit: number): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries)
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);
  }

  async getEntriesByDateRange(startDate: Date, endDate: Date): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries)
      .where(and(
        gte(journalEntries.createdAt, startDate),
        lte(journalEntries.createdAt, endDate)
      ))
      .orderBy(desc(journalEntries.createdAt));
  }

  async updateJournalEntryReflection(id: number, reflection: AIReflection): Promise<JournalEntry | undefined> {
    const [updatedEntry] = await db
      .update(journalEntries)
      .set({ aiReflection: reflection })
      .where(eq(journalEntries.id, id))
      .returning();
    return updatedEntry || undefined;
  }

  async getUserStats(): Promise<UserStats> {
    let [stats] = await db.select().from(userStats).limit(1);
    
    if (!stats) {
      // Initialize stats for first time user
      [stats] = await db.insert(userStats).values({
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        xpPoints: 0,
      }).returning();
    }
    
    return stats;
  }

  async updateUserStats(updateData: Partial<UserStats>): Promise<UserStats> {
    const currentStats = await this.getUserStats();
    
    const [updatedStats] = await db
      .update(userStats)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(userStats.id, currentStats.id))
      .returning();
      
    return updatedStats;
  }

  async calculateStreak(): Promise<{ currentStreak: number; longestStreak: number }> {
    const entries = await db.select({
      createdAt: journalEntries.createdAt
    }).from(journalEntries).orderBy(desc(journalEntries.createdAt));

    if (entries.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Check if there's an entry today or yesterday to start streak
    const latestEntry = entries[0];
    const latestDate = new Date(latestEntry.createdAt);
    const daysDiff = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      currentStreak = 1;
      
      // Calculate consecutive days
      for (let i = 1; i < entries.length; i++) {
        const currentDate = new Date(entries[i-1].createdAt);
        const prevDate = new Date(entries[i].createdAt);
        const diff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
          currentStreak++;
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, currentStreak, tempStreak);
    
    return { currentStreak, longestStreak };
  }

  async getGrowthMetrics(): Promise<GrowthMetrics> {
    const stats = await this.getUserStats();
    const entries = await this.getAllJournalEntries();
    
    // Calculate mood trends
    const moodCounts: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });
    
    const moodTrends = Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / entries.length) * 100)
    }));

    // Calculate theme frequency (from tags)
    const themeCounts: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach(tag => {
          themeCounts[tag] = (themeCounts[tag] || 0) + 1;
        });
      }
    });
    
    const commonThemes = Object.entries(themeCounts)
      .map(([theme, frequency]) => ({ theme, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Calculate writing frequency by day
    const writingFrequency = entries.reduce((acc: Record<string, number>, entry) => {
      const date = new Date(entry.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const writingFrequencyArray = Object.entries(writingFrequency)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalEntries: stats.totalEntries,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      xpPoints: stats.xpPoints,
      moodTrends,
      commonThemes,
      writingFrequency: writingFrequencyArray,
    };
  }

  async saveInsight(insight: InsertSavedInsight): Promise<SavedInsight> {
    const [savedInsight] = await db
      .insert(savedInsights)
      .values(insight)
      .returning();
    return savedInsight;
  }

  async getSavedInsights(): Promise<SavedInsight[]> {
    return await db.select().from(savedInsights).orderBy(desc(savedInsights.createdAt));
  }

  async deleteSavedInsight(id: number): Promise<void> {
    await db.delete(savedInsights).where(eq(savedInsights.id, id));
  }

  // Badges and achievements
  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges).orderBy(badges.createdAt);
  }

  async unlockBadge(badgeId: number): Promise<Badge> {
    const [badge] = await db
      .update(badges)
      .set({ unlockedAt: new Date() })
      .where(eq(badges.id, badgeId))
      .returning();
    return badge;
  }

  async checkAndUnlockBadges(): Promise<Badge[]> {
    const stats = await this.getUserStats();
    const unlockedBadges: Badge[] = [];
    
    // Define badge requirements
    const badgeRules = [
      { name: "First Steps", requirement: "1 entry", check: stats.totalEntries >= 1 },
      { name: "Week Warrior", requirement: "7-day streak", check: stats.currentStreak >= 7 },
      { name: "Consistency King", requirement: "30 entries", check: stats.totalEntries >= 30 },
      { name: "Reflection Master", requirement: "100 XP", check: stats.xpPoints >= 100 },
      { name: "Streak Legend", requirement: "30-day streak", check: stats.longestStreak >= 30 },
    ];

    // Check each badge rule
    for (const rule of badgeRules) {
      if (rule.check) {
        const existingBadges = await db.select().from(badges).where(eq(badges.name, rule.name));
        if (existingBadges.length === 0) {
          // Create and unlock new badge
          const [newBadge] = await db
            .insert(badges)
            .values({
              name: rule.name,
              description: `Unlocked for ${rule.requirement}`,
              icon: this.getBadgeIcon(rule.name),
              requirement: rule.requirement,
              xpReward: 25,
              unlockedAt: new Date(),
            })
            .returning();
          unlockedBadges.push(newBadge);
        }
      }
    }

    return unlockedBadges;
  }

  private getBadgeIcon(badgeName: string): string {
    const icons: { [key: string]: string } = {
      "First Steps": "🏆",
      "Week Warrior": "🔥",
      "Consistency King": "👑",
      "Reflection Master": "🧠",
      "Streak Legend": "⚡",
    };
    return icons[badgeName] || "🎖️";
  }

  // Daily challenges
  async getTodaysChallenge(): Promise<DailyChallenge | null> {
    const today = new Date().toISOString().split('T')[0];
    const [challenge] = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.date, today))
      .limit(1);
    
    if (!challenge) {
      return await this.generateDailyChallenge(today);
    }
    
    return challenge;
  }

  async generateDailyChallenge(date: string): Promise<DailyChallenge> {
    const challenges = [
      {
        title: "Fear Explorer",
        description: "Write about a fear you're facing",
        prompt: "What's one thing that's been worrying you lately? How might you approach it differently?",
      },
      {
        title: "Gratitude Seeker",
        description: "Reflect on three things you're grateful for",
        prompt: "List three things that brought you joy today, no matter how small.",
      },
      {
        title: "Growth Spotter", 
        description: "Identify one lesson learned recently",
        prompt: "What's one thing you learned about yourself this week?",
      },
      {
        title: "Future Visionary",
        description: "Describe your ideal day next month",
        prompt: "If everything went perfectly, what would a typical day look like for you in 30 days?",
      },
      {
        title: "Connection Builder",
        description: "Write about a meaningful relationship",
        prompt: "Think about someone important to you. What do you appreciate most about them?",
      },
    ];

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    const [challenge] = await db
      .insert(dailyChallenges)
      .values({
        date,
        title: randomChallenge.title,
        description: randomChallenge.description,
        prompt: randomChallenge.prompt,
        xpReward: 15,
      })
      .returning();

    return challenge;
  }

  async completeChallenge(challengeId: number): Promise<DailyChallenge> {
    const [challenge] = await db
      .update(dailyChallenges)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(dailyChallenges.id, challengeId))
      .returning();

    // Award XP for completing challenge
    const stats = await this.getUserStats();
    await this.updateUserStats({
      xpPoints: stats.xpPoints + challenge.xpReward,
    });

    return challenge;
  }

  // Leveling system
  calculateLevel(xp: number): number {
    // Level formula: every 100 XP = 1 level
    return Math.floor(xp / 100) + 1;
  }

  calculateLevelTitle(level: number): string {
    const titles = [
      "Reflective Wanderer",    // Level 1
      "Clarity Seeker",         // Level 2
      "Inner Explorer",         // Level 3
      "Wisdom Gatherer",        // Level 4
      "Growth Navigator",       // Level 5
      "Inner Architect",        // Level 6+
    ];
    
    const titleIndex = Math.min(level - 1, titles.length - 1);
    return titles[titleIndex] || "Inner Architect";
  }
  // Goals management (Premium feature)
  async createGoal(goalData: InsertUserGoal): Promise<UserGoal> {
    const [goal] = await db
      .insert(userGoals)
      .values(goalData)
      .returning();
    return goal;
  }

  async getGoals(): Promise<UserGoal[]> {
    return await db
      .select()
      .from(userGoals)
      .orderBy(desc(userGoals.createdAt));
  }

  async getGoal(id: number): Promise<UserGoal | undefined> {
    const [goal] = await db
      .select()
      .from(userGoals)
      .where(eq(userGoals.id, id));
    return goal;
  }

  async updateGoal(id: number, updates: Partial<InsertUserGoal>): Promise<UserGoal | undefined> {
    const [goal] = await db
      .update(userGoals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userGoals.id, id))
      .returning();
    return goal;
  }

  async deleteGoal(id: number): Promise<void> {
    await db
      .delete(userGoals)
      .where(eq(userGoals.id, id));
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
