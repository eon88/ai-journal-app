import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, Crown, Trophy, Zap } from "lucide-react";
import { LEVEL_UNLOCKS } from "@shared/schema";

interface LevelUpModalProps {
  newLevel: number;
  unlockedFeatures: string[];
  motivation: string;
  onClose: () => void;
}

export function LevelUpModal({ newLevel, unlockedFeatures, motivation, onClose }: LevelUpModalProps) {
  const [showFeatures, setShowFeatures] = useState(false);
  const levelInfo = LEVEL_UNLOCKS.find(unlock => unlock.level === newLevel);

  useEffect(() => {
    // Show features after a delay for dramatic effect
    const timer = setTimeout(() => setShowFeatures(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getLevelIcon = (level: number) => {
    if (level >= 8) return <Crown className="w-8 h-8 text-yellow-500" />;
    if (level >= 5) return <Trophy className="w-8 h-8 text-amber-500" />;
    if (level >= 3) return <Star className="w-8 h-8 text-blue-500" />;
    return <Sparkles className="w-8 h-8 text-green-500" />;
  };

  const getLevelName = (level: number): string => {
    const names = ["", "Wanderer", "Seeker", "Student", "Climber", "Builder", "Navigator", "Architect", "Guardian", "Sage", "Legendary Oracle"];
    return names[level] || "Unknown";
  };

  const getFeatureDisplayName = (feature: string): string => {
    const featureNames: Record<string, string> = {
      'journal_entries_30': '30 Journal Entries',
      'basic_symbols_5': 'Basic Bullet Symbols',
      'mood_tracker_5': 'Basic Mood Tracker',
      'daily_quote': 'Daily Inspirational Quotes',
      'daily_challenge_1': 'Daily Challenges',
      'streak_tracker': 'Streak Tracking',
      'xp_tracking': 'XP Points System',
      'xp_bonus_3day': '3-Day Streak XP Bonus',
      'ai_reflection_weekly': 'Weekly AI Reflections',
      'mood_history': 'Mood History Tracking',
      'insights_vault': 'Personal Insights Vault',
      'symbols_8': 'Extended Symbol Library',
      'mood_tracker_10': 'Full Mood Tracker',
      'pin_entries': 'Pin Important Entries',
      'basic_folders': 'Custom Folder Organization',
      'challenge_sequences': 'Challenge Sequences',
      'badge_cabinet': 'Achievement Badge Cabinet',
      'streak_badges': 'Streak Achievement Badges',
      'ai_reflection_weekly_reports': 'Enhanced Weekly Reports',
      'mood_trends_graph': 'Mood Trends Visualization',
      'folder_customization': 'Folder Colors & Customization',
      'unlimited_entries': 'Unlimited Journal Entries',
      'all_symbols_18': 'Complete Symbol System',
      'daily_challenges_3': 'Multiple Daily Challenges',
      'pattern_recognition_ai': 'AI Pattern Recognition',
      'prompt_library': 'Curated Writing Prompts',
      'life_path_quiz': 'Life Path Discovery',
      'advanced_search': 'Advanced Search & Filters',
      'reflection_tags': 'Reflection Tagging System',
      'navigation_mode': 'Weekly Navigation Mode',
      'growth_dashboard': 'Advanced Growth Dashboard',
      'custom_prompt_packs': 'Custom Prompt Collections',
      'visual_themes': 'Visual Theme Unlocks',
      'long_term_vision': 'Long-term Vision Tracker',
      'forum_access': 'Community Forum Access',
      'leaderboard': 'Community Leaderboard',
      'shareable_badges': 'Shareable Achievement Badges',
      'community_threads': 'Community Discussion Threads',
      'guardian_gate': 'Guardian Wisdom Sharing',
      'merlin_prophecies': 'Merlin Prophecy System',
      'legacy_view': 'Personal Growth Timeline',
      'deep_prompts': 'Deep Philosophical Prompts',
      'contribution_quests': 'Community Contribution Quests',
      'secret_grove_theme': 'Secret Grove Theme',
      'oracle_forum': 'Oracle-Only Forum',
      'custom_avatars': 'Custom Avatar System',
      'solo_quests': 'Personal Solo Quests',
      'oracle_emblem': 'Legendary Oracle Emblem'
    };
    return featureNames[feature] || feature;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border-2 border-purple-200 dark:border-purple-700">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              {getLevelIcon(newLevel)}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-yellow-800" />
              </div>
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Level Up!
          </CardTitle>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="secondary" className="text-lg px-4 py-1">
              Level {newLevel}
            </Badge>
            <span className="text-lg font-semibold text-purple-700 dark:text-purple-300">
              {getLevelName(newLevel)}
            </span>
          </div>
          
          <CardDescription className="text-base text-gray-600 dark:text-gray-300 mt-3 italic">
            "{motivation}"
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {levelInfo && (
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Your New Abilities:
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {levelInfo.description}
              </p>
            </div>
          )}
          
          {showFeatures && unlockedFeatures.length > 0 && (
            <div className="space-y-3 animate-in slide-in-from-bottom duration-500">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                New Features Unlocked:
              </h4>
              <div className="grid gap-2 max-h-40 overflow-y-auto">
                {unlockedFeatures.map((feature, index) => (
                  <div 
                    key={feature}
                    className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-800 dark:text-green-200">
                      {getFeatureDisplayName(feature)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} className="flex-1">
              <Trophy className="w-4 h-4 mr-2" />
              Continue Your Journey
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}