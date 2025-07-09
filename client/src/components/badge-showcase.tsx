import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Lock } from "lucide-react";

interface BadgeItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  xpReward: number;
  unlockedAt: string | null;
  createdAt: string;
}

export function BadgeShowcase() {
  const { data: badges = [], isLoading } = useQuery<BadgeItem[]>({
    queryKey: ["/api/badges"],
  });

  if (isLoading) {
    return (
      <div className="glass-card-transparent rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievement Badges
          </h3>
          <p className="text-sm text-gray-800 dark:text-white">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  const unlockedBadges = badges.filter(badge => badge.unlockedAt);
  const lockedBadges = badges.filter(badge => !badge.unlockedAt);

  return (
    <div className="glass-card-transparent rounded-xl shadow-sm p-6 pb-8 min-h-fit h-auto overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievement Badges
        </h3>
        <p className="text-sm text-gray-800 dark:text-white">
          {unlockedBadges.length} of {badges.length} badges unlocked
        </p>
      </div>
      <div className="w-full space-y-6">
        {/* Unlocked Badges Section */}
        {unlockedBadges.length > 0 && (
          <div className="w-full">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Unlocked ({unlockedBadges.length})
            </h4>
            <div className="space-y-3 w-full">
              {unlockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 w-full"
                >
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{badge.name}</div>
                    <div className="text-xs text-gray-800 dark:text-gray-200">
                      {badge.description}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    +{badge.xpReward} XP
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Badges Section */}
        {lockedBadges.length > 0 && (
          <div className="w-full">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Locked ({lockedBadges.length})
            </h4>
            <div className="space-y-3 w-full">
              {lockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-gray-100/50 dark:bg-gray-800/30 opacity-70 w-full"
                >
                  <div className="text-2xl grayscale">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-300">{badge.name}</div>
                    <div className="text-xs text-gray-800 dark:text-gray-400">
                      Requirement: {badge.requirement}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    +{badge.xpReward} XP
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No badges state */}
        {unlockedBadges.length === 0 && lockedBadges.length === 0 && (
          <div className="text-center py-8 text-white/70">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No badges available yet</p>
            <p className="text-xs">Keep journaling to unlock achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
}