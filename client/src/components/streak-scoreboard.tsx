import { useQuery } from "@tanstack/react-query";
import { Flame, TrendingUp, Trophy, Zap, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DailyStreakFire } from "@/components/daily-streak-fire";

interface UserStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  xpPoints: number;
  level: number;
  title: string;
}

export function StreakScoreboard() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Daily Streak Fire Status */}
      <div className="mb-4">
        <DailyStreakFire />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Level {stats.level}
        </h2>
        <div className="text-sm text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full inline-block">
          {stats.title}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full mx-auto mb-2">
            <Flame className={`w-6 h-6 ${stats.currentStreak > 0 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`} />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEntries}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mx-auto mb-2">
            <Trophy className="w-6 h-6 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.longestStreak}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-2">
            <Zap className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.xpPoints}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">XP Points</div>
        </div>
      </div>

      {stats.currentStreak > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
          <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">
              {stats.currentStreak === 1 
                ? "Great start! Keep the momentum going!" 
                : `Amazing! ${stats.currentStreak} days in a row! ${
                    stats.currentStreak === stats.longestStreak ? "🏆 New record!" : ""
                  }`
              }
            </span>
          </div>
        </div>
      )}
      
      {/* Links */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Link to="/forum/leaderboard">
          <Button variant="outline" size="sm" className="w-full text-xs">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </Button>
        </Link>
        <Link to="/rules">
          <Button variant="outline" size="sm" className="w-full text-xs">
            <HelpCircle className="w-4 h-4 mr-2" />
            How to earn XP & unlock features
          </Button>
        </Link>
      </div>
    </div>
  );
}