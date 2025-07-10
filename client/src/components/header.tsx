import { Calendar, User, Crown, LogOut, UserCircle, Home, Shield, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useProgressiveFeatures } from "@/hooks/useProgressiveFeatures";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const LEVEL_DESCRIPTIONS = {
  1: { title: "Reflective Wanderer", color: "bg-gray-500" },
  2: { title: "Mindful Seeker", color: "bg-blue-500" },
  3: { title: "Growth Student", color: "bg-green-500" },
  4: { title: "Path Climber", color: "bg-yellow-500" },
  5: { title: "Inner Builder", color: "bg-orange-500" },
  6: { title: "Life Navigator", color: "bg-red-500" },
  7: { title: "Soul Architect", color: "bg-purple-500" },
  8: { title: "Wisdom Guardian", color: "bg-pink-500" },
  9: { title: "Enlightened Sage", color: "bg-indigo-500" },
  10: { title: "Legendary Oracle", color: "bg-gradient-to-r from-yellow-400 to-purple-600" }
};

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { progress } = useProgressiveFeatures();

  // Check if current user is admin
  const { data: adminCheck } = useQuery({
    queryKey: ["/api/admin/check"],
    retry: false,
  });

  const setLevelMutation = useMutation({
    mutationFn: async (level: number) => {
      const response = await apiRequest("/api/admin/set-level", "POST", { level });
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/entry-count"] });
      toast({
        title: "Level Updated!",
        description: `Successfully switched to Level ${result.newLevel}: ${LEVEL_DESCRIPTIONS[result.newLevel as keyof typeof LEVEL_DESCRIPTIONS]?.title}`,
      });
      setSelectedLevel("");
    },
    onError: (error: any) => {
      toast({
        title: "Level Switch Failed",
        description: error.message || "Failed to switch level",
        variant: "destructive",
      });
    }
  });

  const handleLevelChange = (level: string) => {
    const levelNum = parseInt(level);
    if (levelNum >= 1 && levelNum <= 10) {
      setLevelMutation.mutate(levelNum);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <header className="glass-overlay shadow-sm border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">Life Path Companion</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Reflect, grow, and discover insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden md:flex items-center space-x-4 mr-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Today, {formatDate(currentTime)}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {formatTime(currentTime)}
              </span>
            </div>
{/* Upgrade button temporarily hidden - payment system is properly configured but in test mode */}
            <ThemeToggle />
            <Link href="/">
              <div 
                className="w-8 h-8 bg-accent rounded-full flex items-center justify-center cursor-pointer hover:bg-accent/80 transition-colors"
                onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
              >
                <Home className="text-accent-foreground text-sm" />
              </div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center cursor-pointer hover:bg-accent/80 transition-colors">
                  <User className="text-accent-foreground text-sm" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <Link href="/entries">
                  <DropdownMenuItem className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    Browse Entries
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                {adminCheck?.isAdmin && (
                  <Link href="/admin">
                    <DropdownMenuItem className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  </Link>
                )}
                
                {/* Level Switcher for testing - EON ONLY */}
                {user?.id === 2 && (
                  <div className="px-2 py-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Level Testing</span>
                    </div>
                    {progress && (
                      <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                        Current: Level {progress.currentLevel} - {LEVEL_DESCRIPTIONS[progress.currentLevel as keyof typeof LEVEL_DESCRIPTIONS]?.title}
                      </div>
                    )}
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Switch to level..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LEVEL_DESCRIPTIONS).map(([level, desc]) => (
                          <SelectItem key={level} value={level}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${desc.color}`} />
                              <span className="text-xs">Level {level}: {desc.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedLevel && (
                      <Button 
                        onClick={() => handleLevelChange(selectedLevel)}
                        disabled={setLevelMutation.isPending}
                        className="w-full mt-2 h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                      >
                        {setLevelMutation.isPending ? "Switching..." : `Switch to Level ${selectedLevel}`}
                      </Button>
                    )}
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Owner testing tool
                      </p>
                    </div>
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={async () => {
                    try {
                      // Call logout API
                      await fetch('/api/logout', {
                        method: 'POST',
                        credentials: 'include'
                      });
                      // CRITICAL: Clear ALL cached data to prevent privacy issues when switching users
                      queryClient.clear();
                      // Clear any stored user data
                      localStorage.removeItem('premium_user');
                      localStorage.removeItem('user_name');
                      // Refresh the page to update auth state
                      window.location.href = '/';
                    } catch (error) {
                      console.error('Logout error:', error);
                      // Even if logout fails, clear local data and redirect
                      queryClient.clear();
                      localStorage.removeItem('premium_user');
                      localStorage.removeItem('user_name');
                      window.location.href = '/';
                    }
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

    </header>
  );
}
