import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Star, Zap, Users, TrendingUp } from "lucide-react";
import { isFeatureUnlocked, getNextUnlock, LEVEL_UNLOCKS, type FeatureUnlock } from "@shared/schema";

interface UserProgress {
  currentLevel: number;
  unlockedFeatures: string[];
  tokensEarned: number;
  themesUnlocked: string[];
  activeTheme: string;
}

interface FeatureGateProps {
  featureName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  upgradePrompt?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  };
}

export function FeatureGate({ 
  featureName, 
  children, 
  fallback,
  upgradePrompt
}: FeatureGateProps) {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const { data: progress, isLoading } = useQuery<UserProgress>({
    queryKey: ["/api/user/progress"],
    retry: false,
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-8"></div>;
  }

  if (!progress) {
    return fallback || <div className="text-gray-500">Unable to load user progress</div>;
  }

  const isUnlocked = isFeatureUnlocked(progress.currentLevel, featureName);

  if (isUnlocked) {
    return <>{children}</>;
  }

  // Feature is locked - show upgrade prompt or fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show upgrade prompt modal when clicked
  if (showUpgradePrompt) {
    return <FeatureUpgradeModal 
      featureName={featureName}
      currentLevel={progress.currentLevel}
      onClose={() => setShowUpgradePrompt(false)}
      upgradePrompt={upgradePrompt}
    />;
  }

  // Show locked feature teaser
  return (
    <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600 opacity-75">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {upgradePrompt?.title || "Feature Locked"}
            </p>
            <p className="text-xs text-gray-500">
              {upgradePrompt?.description || `Unlock at Level ${getRequiredLevel(featureName)}`}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowUpgradePrompt(true)}
        >
          <Zap className="w-4 h-4 mr-1" />
          Unlock
        </Button>
      </CardContent>
    </Card>
  );
}

function FeatureUpgradeModal({ 
  featureName, 
  currentLevel, 
  onClose,
  upgradePrompt 
}: {
  featureName: string;
  currentLevel: number;
  onClose: () => void;
  upgradePrompt?: FeatureGateProps['upgradePrompt'];
}) {
  const requiredLevel = getRequiredLevel(featureName);
  const nextUnlock = getNextUnlock(currentLevel);
  const targetUnlock = LEVEL_UNLOCKS.find(unlock => 
    unlock.features.includes(featureName)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            {upgradePrompt?.icon || <Star className="w-5 h-5 text-yellow-500" />}
            <CardTitle className="text-lg">
              {upgradePrompt?.title || "Feature Locked"}
            </CardTitle>
          </div>
          <CardDescription>
            {upgradePrompt?.description || `This feature unlocks at Level ${requiredLevel}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {targetUnlock && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Level {targetUnlock.level}</Badge>
                <span className="text-sm font-medium">{getLevelName(targetUnlock.level)}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {targetUnlock.description}
              </p>
              <p className="text-xs italic text-gray-500">
                "{targetUnlock.motivation}"
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Your Progress:</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Level {currentLevel}</Badge>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {getLevelName(currentLevel)}
              </span>
            </div>
            
            {nextUnlock && (
              <div className="text-xs text-gray-500">
                Next unlock at Level {nextUnlock.level}: {nextUnlock.description}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
            <Button className="flex-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              Keep Journaling
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getRequiredLevel(featureName: string): number {
  const unlock = LEVEL_UNLOCKS.find(unlock => 
    unlock.features.includes(featureName)
  );
  return unlock?.level || 1;
}

function getLevelName(level: number): string {
  const levelNames = [
    "", "Wanderer", "Seeker", "Student", "Climber", "Builder", 
    "Navigator", "Architect", "Guardian", "Sage", "Legendary Oracle"
  ];
  return levelNames[level] || "Unknown";
}

// Entry count limit component
interface EntryLimitGateProps {
  children: React.ReactNode;
  currentCount: number;
  maxEntries: number;
}

export function EntryLimitGate({ children, currentCount, maxEntries }: EntryLimitGateProps) {
  if (currentCount >= maxEntries) {
    return (
      <Card className="border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Entry Limit Reached
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300">
                You've reached your limit of {maxEntries} entries. Level up to unlock more!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

// Symbol limit component for progressive symbol unlocking
interface SymbolGateProps {
  symbols: Array<{ symbol: string; type: string; name: string }>;
  userLevel: number;
}

export function SymbolGate({ symbols, userLevel }: SymbolGateProps) {
  const maxSymbols = getMaxSymbolsForLevel(userLevel);
  const availableSymbols = symbols.slice(0, maxSymbols);
  
  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {availableSymbols.map((symbolInfo, index) => (
          <Button
            key={symbolInfo.symbol}
            variant="outline"
            size="sm"
            className="text-lg h-12"
            title={symbolInfo.name}
          >
            {symbolInfo.symbol}
          </Button>
        ))}
      </div>
      
      {symbols.length > maxSymbols && (
        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-center">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {symbols.length - maxSymbols} more symbols unlock as you level up
          </p>
        </div>
      )}
    </div>
  );
}

function getMaxSymbolsForLevel(level: number): number {
  if (level >= 5) return 18; // All symbols at Builder level
  if (level >= 3) return 8;  // More symbols at Student level  
  if (level >= 2) return 8;  // Basic expansion at Seeker level
  return 5; // Basic symbols at Wanderer level
}