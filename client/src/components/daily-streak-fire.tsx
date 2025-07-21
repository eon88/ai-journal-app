import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, AlertTriangle, Check, Zap } from 'lucide-react';

interface StreakFireData {
  currentStreak: number;
  hasWrittenToday: boolean;
  fireStatus: 'safe' | 'warning' | 'danger' | 'broken';
  message: string;
  timeUntilMidnight: number;
}

export function DailyStreakFire() {
  const { data: streakFire, isLoading } = useQuery<StreakFireData>({
    queryKey: ["/api/streak-fire"],
    refetchInterval: 60000, // Refresh every minute to update fire status
  });

  if (isLoading || !streakFire) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="animate-pulse w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="animate-pulse h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
      </div>
    );
  }

  const getFireIcon = () => {
    switch (streakFire.fireStatus) {
      case 'danger':
        return <Flame className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'safe':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'broken':
        return <Zap className="w-5 h-5 text-gray-500" />;
      default:
        return <Flame className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFireStyle = () => {
    switch (streakFire.fireStatus) {
      case 'danger':
        return "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200";
      case 'warning':
        return "bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-700 text-orange-800 dark:text-orange-200";
      case 'safe':
        return "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200";
      case 'broken':
        return "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getFireStyle()} transition-all duration-300`}>
      <div className="flex items-center gap-2">
        {getFireIcon()}
        <div className="flex-1">
          <div className="text-sm font-medium">
            Streak Fire Status
          </div>
          <div className="text-xs opacity-90 mt-1">
            {streakFire.message}
          </div>
          {streakFire.fireStatus === 'danger' && (
            <div className="text-xs opacity-75 mt-1">
              {streakFire.timeUntilMidnight} hours left!
            </div>
          )}
        </div>
        {streakFire.currentStreak > 0 && (
          <div className="text-right">
            <div className="text-lg font-bold">
              {streakFire.currentStreak}
            </div>
            <div className="text-xs opacity-75">
              day{streakFire.currentStreak !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}