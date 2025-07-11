import { useQuery } from "@tanstack/react-query";
import { HelpCircle, Trophy } from "lucide-react";
import { AdventureIcons } from "@/components/icons/adventure-icons";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface UserStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  xpPoints: number;
  level: number;
  title: string;
}

export function LevelSidebar() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-lg p-4 w-48">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
          <div className="h-6 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const nextLevelXP = stats.level * 1000;
  const progress = (stats.xpPoints % 1000) / 10;

  return (
    <div className="glass-card rounded-lg p-4 w-48 sticky top-24">
      {/* Level Display */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center mb-2">
          <AdventureIcons.Hourglass size={20} className="text-yellow-500 mr-1" />
          <span className="text-lg font-bold text-foreground">Lv. {stats.level}</span>
        </div>
        <div className="text-xs text-purple-600 font-medium bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-full">
          {stats.title}
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>XP</span>
          <span>{stats.xpPoints}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-muted-foreground mt-1 text-center">
          {1000 - (stats.xpPoints % 1000)} XP to next level
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <AdventureIcons.Flame size={12} className="text-orange-500 mr-1" />
            <span className="text-muted-foreground">Streak</span>
          </div>
          <span className="font-medium text-foreground">{stats.currentStreak}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <AdventureIcons.CompassMap size={12} className="text-blue-500 mr-1" />
            <span className="text-muted-foreground">Entries</span>
          </div>
          <span className="font-medium text-foreground">{stats.totalEntries}</span>
        </div>
      </div>
      
      {/* Links */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Link to="/forum-leaderboard">
          <Button variant="outline" size="sm" className="w-full text-xs">
            <Trophy className="w-3 h-3 mr-2" />
            Leaderboard
          </Button>
        </Link>
        <Link to="/rules">
          <Button variant="outline" size="sm" className="w-full text-xs">
            <HelpCircle className="w-3 h-3 mr-2" />
            Game Rules
          </Button>
        </Link>
      </div>
    </div>
  );
}