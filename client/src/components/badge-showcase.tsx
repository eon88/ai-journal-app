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
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievement Badges
          </h3>
          <p className="text-sm text-white/80">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  const unlockedBadges = badges.filter(badge => badge.unlockedAt);
  const lockedBadges = badges.filter(badge => !badge.unlockedAt);

  return (
    <div className="glass-card-transparent rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievement Badges
        </h3>
        <p className="text-sm text-white/80">
          {unlockedBadges.length} of {badges.length} badges unlocked
        </p>
      </div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Unlocked Badges */}
          <div>
            <h4 className="font-medium text-sm text-white/80 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Unlocked ({unlockedBadges.length})
            </h4>
            <div className="space-y-2">
              {unlockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20"
                >
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{badge.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {badge.description}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    +{badge.xpReward} XP
                  </Badge>
                </div>
              ))}
              {unlockedBadges.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No badges unlocked yet</p>
                  <p className="text-xs">Keep journaling to earn your first badge!</p>
                </div>
              )}
            </div>
          </div>

          {/* Locked Badges */}
          <div>
            <h4 className="font-medium text-sm text-white/80 mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Locked ({lockedBadges.length})
            </h4>
            <div className="space-y-2">
              {lockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 opacity-60"
                >
                  <div className="text-2xl grayscale">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{badge.name}</div>
                    <div className="text-xs text-muted-foreground">
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
        </div>
      </div>
    </div>
  );
}