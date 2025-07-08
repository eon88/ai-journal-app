import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getForumRank, getNextRank, type ForumRank } from "@shared/schema";

interface ForumRankBadgeProps {
  xpPoints: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ForumRankBadge({ xpPoints, showProgress = false, size = "md" }: ForumRankBadgeProps) {
  const currentRank = getForumRank(xpPoints);
  const { nextRank, xpNeeded } = getNextRank(xpPoints);

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg"
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${sizeClasses[size]} font-medium border-2 transition-all hover:scale-105`}
              style={{
                borderColor: currentRank.color,
                backgroundColor: `${currentRank.color}15`,
                color: currentRank.color
              }}
            >
              <span className={`mr-1 ${iconSizes[size]}`}>{currentRank.badge}</span>
              {currentRank.name}
            </Badge>
            {showProgress && nextRank && (
              <div className="text-xs text-gray-500">
                {xpNeeded} XP to {nextRank.name}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{currentRank.icon}</span>
              <span className="font-semibold" style={{ color: currentRank.color }}>
                {currentRank.name}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {currentRank.description}
            </p>
            <div className="text-xs text-gray-500">
              <div>XP Range: {currentRank.minXP} - {currentRank.maxXP === Infinity ? "∞" : currentRank.maxXP}</div>
              <div>Current XP: {xpPoints}</div>
              {nextRank && (
                <div className="mt-1 text-blue-600">
                  Next: {nextRank.name} ({xpNeeded} XP needed)
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ForumRankDisplay({ rank, isCompact = false }: { rank: ForumRank; isCompact?: boolean }) {
  if (isCompact) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm">{rank.badge}</span>
        <span className="text-xs font-medium" style={{ color: rank.color }}>
          {rank.name}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: `${rank.color}10` }}>
      <span className="text-lg">{rank.icon}</span>
      <div>
        <div className="font-semibold text-sm" style={{ color: rank.color }}>
          {rank.name}
        </div>
        <div className="text-xs text-gray-600">
          {rank.description}
        </div>
      </div>
    </div>
  );
}