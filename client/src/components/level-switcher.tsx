import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Zap, Lock, Crown } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useProgressiveFeatures } from "@/hooks/useProgressiveFeatures";

const LEVEL_DESCRIPTIONS = {
  1: { title: "Reflective Wanderer", features: ["30 entries max", "Basic moods (4)", "Basic symbols (6)"], color: "bg-gray-500" },
  2: { title: "Mindful Seeker", features: ["60 entries max", "More moods (6)", "More symbols (9)", "Tags unlocked"], color: "bg-blue-500" },
  3: { title: "Growth Student", features: ["100 entries max", "All moods (10)", "All symbols (18)", "Pinning unlocked"], color: "bg-green-500" },
  4: { title: "Path Climber", features: ["150 entries max", "Folders unlocked", "Advanced search"], color: "bg-yellow-500" },
  5: { title: "Inner Builder", features: ["200 entries max", "Goals system", "Weekly insights"], color: "bg-orange-500" },
  6: { title: "Life Navigator", features: ["300 entries max", "Monthly insights", "Goal progress"], color: "bg-red-500" },
  7: { title: "Soul Architect", features: ["500 entries max", "Community access", "Advanced analytics"], color: "bg-purple-500" },
  8: { title: "Wisdom Guardian", features: ["750 entries max", "Premium features", "Priority support"], color: "bg-pink-500" },
  9: { title: "Enlightened Sage", features: ["1000 entries max", "All premium features", "Beta access"], color: "bg-indigo-500" },
  10: { title: "Legendary Oracle", features: ["Unlimited entries", "All features", "Exclusive content"], color: "bg-gradient-to-r from-yellow-400 to-purple-600" }
};

export function LevelSwitcher() {
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { progress } = useProgressiveFeatures();

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
      if (result.unlockedFeatures?.length > 0) {
        toast({
          title: "Features Available",
          description: `Level ${result.newLevel} features: ${result.unlockedFeatures.join(", ")}`,
        });
      }
      setSelectedLevel("");
    },
    onError: (error: any) => {
      toast({
        title: "Level Switch Failed",
        description: error.message || "Failed to switch level. Make sure you have admin access.",
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

  return (
    <div className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Level Switcher (Admin)</h3>
      </div>
      
      {progress && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Current: Level {progress.currentLevel}
            </span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            {LEVEL_DESCRIPTIONS[progress.currentLevel as keyof typeof LEVEL_DESCRIPTIONS]?.title}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose level to test..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LEVEL_DESCRIPTIONS).map(([level, desc]) => (
              <SelectItem key={level} value={level}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${desc.color}`} />
                  <span>Level {level}: {desc.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedLevel && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border text-xs">
            <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
              Level {selectedLevel} Features:
            </h4>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300">
              {LEVEL_DESCRIPTIONS[parseInt(selectedLevel) as keyof typeof LEVEL_DESCRIPTIONS]?.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button 
          onClick={() => handleLevelChange(selectedLevel)}
          disabled={!selectedLevel || setLevelMutation.isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
        >
          {setLevelMutation.isPending ? "Switching..." : `Switch to Level ${selectedLevel}`}
        </Button>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Admin testing tool for eon only
        </p>
      </div>
    </div>
  );
}