import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { AdventureIcons } from "@/components/icons/adventure-icons";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface UserStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  xpPoints: number;
  level: number;
  title: string;
}

export function MobileScoreboard() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="lg:hidden mb-4">
        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="animate-pulse flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const nextLevelXP = stats.level * 1000;
  const progress = (stats.xpPoints % 1000) / 10;

  return (
    <div className="lg:hidden mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Compact Header Bar */}
        <Card className="glass-card">
          <CollapsibleTrigger asChild>
            <CardContent className="p-3 cursor-pointer hover:bg-accent/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                    <AdventureIcons.Hourglass size={16} className="text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">Lv. {stats.level}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <AdventureIcons.Flame size={12} className="text-orange-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{stats.currentStreak}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AdventureIcons.CompassMap size={12} className="text-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{stats.totalEntries}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">{stats.xpPoints} XP</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
            </CardContent>
          </CollapsibleTrigger>
        </Card>

        {/* Expanded Content */}
        <CollapsibleContent>
          <Card className="glass-card mt-2">
            <CardContent className="p-4">
              {/* Level Title */}
              <div className="text-center mb-4">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full inline-block">
                  {stats.title}
                </div>
              </div>

              {/* Combined Level & XP Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  <div className="flex items-center gap-2">
                    <AdventureIcons.Hourglass size={16} className="text-yellow-500" />
                    <span>Level {stats.level} Progress</span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{stats.xpPoints} XP</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                    style={{ width: `${progress}%` }}
                  >
                    <span className="text-xs text-white font-medium">{Math.round(progress)}%</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                  <span>{stats.xpPoints % 1000} / 1000 XP</span>
                  <span>{1000 - (stats.xpPoints % 1000)} XP to Lv. {stats.level + 1}</span>
                </div>
              </div>

              {/* Detailed Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-1">
                    <AdventureIcons.Flame size={16} className="text-orange-500 mr-1" />
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Current Streak</span>
                  </div>
                  <div className="text-xl font-bold text-orange-600 dark:text-orange-400 text-center">{stats.currentStreak}</div>
                  <div className="text-xs text-orange-600/70 dark:text-orange-400/70 text-center">days</div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-1">
                    <AdventureIcons.CompassMap size={16} className="text-blue-500 mr-1" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Entries</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400 text-center">{stats.totalEntries}</div>
                  <div className="text-xs text-blue-600/70 dark:text-blue-400/70 text-center">entries</div>
                </div>
              </div>

              {/* Best Streak Display */}
              {stats.longestStreak > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 mb-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Personal Best Streak</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.longestStreak}</div>
                    <div className="text-xs text-purple-600/70 dark:text-purple-400/70">consecutive days</div>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="space-y-2">
                <Link to="/forum-leaderboard">
                  <Button variant="outline" size="sm" className="w-full">
                    <Trophy className="w-4 h-4 mr-2" />
                    Leaderboard
                  </Button>
                </Link>
                <Link to="/rules">
                  <Button variant="outline" size="sm" className="w-full">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Game Rules & XP System
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}