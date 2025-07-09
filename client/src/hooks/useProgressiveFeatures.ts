import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isFeatureUnlocked, getNextUnlock, LEVEL_UNLOCKS } from "@shared/schema";

interface UserProgress {
  id: number;
  userId: number;
  currentLevel: number;
  unlockedFeatures: string[];
  tokensEarned: number;
  themesUnlocked: string[];
  activeTheme: string;
  lastLevelUp?: string;
  createdAt: string;
  updatedAt: string;
}

interface LevelUpResult {
  leveledUp: boolean;
  newLevel?: number;
  unlockedFeatures?: string[];
  motivation?: string;
}

export function useProgressiveFeatures() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user progress
  const { data: progress, isLoading } = useQuery<UserProgress>({
    queryKey: ["/api/user/progress"],
    retry: false,
  });

  // Check for level up
  const levelUpMutation = useMutation({
    mutationFn: async (): Promise<LevelUpResult> => {
      return await apiRequest("/api/user/progress/check-level", {
        method: "POST",
      });
    },
    onSuccess: (result) => {
      if (result.leveledUp) {
        // Invalidate progress to refresh
        queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
        
        // Show level up notification
        toast({
          title: `🎉 Level Up! You reached Level ${result.newLevel}!`,
          description: result.motivation || "Keep up the great work!",
          duration: 5000,
        });

        // Show newly unlocked features
        if (result.unlockedFeatures && result.unlockedFeatures.length > 0) {
          setTimeout(() => {
            toast({
              title: "🔓 New Features Unlocked!",
              description: `You've unlocked ${result.unlockedFeatures!.length} new features`,
              duration: 4000,
            });
          }, 1000);
        }
      }
    },
  });

  // Check if a feature is unlocked
  const isFeatureUnlockedForUser = (featureName: string): boolean => {
    if (!progress) return false;
    return isFeatureUnlocked(progress.currentLevel, featureName);
  };

  // Get entry count
  const { data: entryCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/user/entry-count"],
    retry: false,
  });

  // Get max entries allowed for current level
  const getMaxEntriesForLevel = (level: number): number => {
    if (isFeatureUnlocked(level, 'unlimited_entries')) {
      return Infinity;
    }
    if (level === 1) return 30;
    return Infinity; // Other levels have no limits until unlimited_entries
  };

  // Get max symbols for current level
  const getMaxSymbolsForLevel = (level: number): number => {
    if (isFeatureUnlocked(level, 'all_symbols_18')) return 18;
    if (isFeatureUnlocked(level, 'symbols_8')) return 8;
    return 5; // Basic symbols for level 1
  };

  // Get max moods for current level
  const getMaxMoodsForLevel = (level: number): number => {
    if (isFeatureUnlocked(level, 'mood_tracker_10')) return 10;
    return 5; // Basic moods for level 1-2
  };

  // Get max daily challenges for current level
  const getMaxChallengesForLevel = (level: number): number => {
    if (isFeatureUnlocked(level, 'daily_challenges_3')) return 3;
    return 1; // One challenge for beginners
  };

  // Check if user has reached entry limit
  const hasReachedEntryLimit = (): boolean => {
    if (!progress || !entryCountData) return false;
    const maxEntries = getMaxEntriesForLevel(progress.currentLevel);
    return entryCountData.count >= maxEntries;
  };

  // Get next unlock info
  const getNextUnlockInfo = () => {
    if (!progress) return null;
    return getNextUnlock(progress.currentLevel);
  };

  // Get current level info
  const getCurrentLevelInfo = () => {
    if (!progress) return null;
    return LEVEL_UNLOCKS.find(unlock => unlock.level === progress.currentLevel);
  };

  return {
    // State
    progress,
    isLoading,
    entryCount: entryCountData?.count || 0,
    
    // Feature checks
    isFeatureUnlockedForUser,
    
    // Limits
    hasReachedEntryLimit,
    getMaxEntriesForLevel: () => progress ? getMaxEntriesForLevel(progress.currentLevel) : 30,
    getMaxSymbolsForLevel: () => progress ? getMaxSymbolsForLevel(progress.currentLevel) : 5,
    getMaxMoodsForLevel: () => progress ? getMaxMoodsForLevel(progress.currentLevel) : 5,
    getMaxChallengesForLevel: () => progress ? getMaxChallengesForLevel(progress.currentLevel) : 1,
    
    // Level info
    getNextUnlockInfo,
    getCurrentLevelInfo,
    
    // Actions
    checkForLevelUp: levelUpMutation.mutate,
    isCheckingLevelUp: levelUpMutation.isPending,
  };
}

export function useFeatureGate(featureName: string) {
  const { isFeatureUnlockedForUser, progress } = useProgressiveFeatures();
  
  return {
    isUnlocked: isFeatureUnlockedForUser(featureName),
    userLevel: progress?.currentLevel || 1,
    requiredLevel: LEVEL_UNLOCKS.find(unlock => 
      unlock.features.includes(featureName)
    )?.level || 1,
  };
}