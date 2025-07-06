import { useQuery } from "@tanstack/react-query";
import { Flame, TrendingUp, Trophy, Zap } from "lucide-react";

interface UserStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  xpPoints: number;
}

export function StreakScoreboard() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Your Journey
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
            <Flame className={`w-6 h-6 ${stats.currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.currentStreak}</div>
          <div className="text-sm text-gray-600">Current Streak</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalEntries}</div>
          <div className="text-sm text-gray-600">Total Entries</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
            <Trophy className="w-6 h-6 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.longestStreak}</div>
          <div className="text-sm text-gray-600">Longest Streak</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
            <Zap className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.xpPoints}</div>
          <div className="text-sm text-gray-600">XP Points</div>
        </div>
      </div>

      {stats.currentStreak > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 text-orange-800">
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
    </div>
  );
}