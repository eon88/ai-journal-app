import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, X, Scroll, Gem, Compass } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/components/user-provider";

interface MerlinResponse {
  message: string;
  mode: string;
  timestamp: string;
}

interface MerlinProps {
  userMood?: string;
  hasJournalToday?: boolean;
  recentEntry?: string;
}

export function MerlinAssistant({ userMood, hasJournalToday, recentEntry }: MerlinProps) {
  const { userName } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Check if daily wisdom was already received today
  const [dailyWisdomUsed, setDailyWisdomUsed] = useState(() => {
    const lastUsed = localStorage.getItem("merlin-daily-wisdom");
    if (!lastUsed) return false;
    const lastUsedDate = new Date(lastUsed).toDateString();
    const today = new Date().toDateString();
    return lastUsedDate === today;
  });

  const merlinMutation = useMutation({
    mutationFn: async (data: { mode: string; context?: string; question?: string }) => {
      const response = await apiRequest("POST", "/api/merlin/consult", {
        ...data,
        userName: userName || "friend"
      });
      return await response.json();
    },
  });

  const handleModeSelect = async (mode: string) => {
    setSelectedMode(mode);
    
    let context = "";
    if (hasJournalToday && recentEntry) {
      context = `Recent journal entry: "${recentEntry.substring(0, 200)}..."`;
    }
    if (userMood) {
      context += ` Current mood: ${userMood}`;
    }

    if (mode === "daily-wisdom" && !dailyWisdomUsed) {
      // Mark daily wisdom as used
      localStorage.setItem("merlin-daily-wisdom", new Date().toISOString());
      setDailyWisdomUsed(true);
    }

    await merlinMutation.mutateAsync({ mode, context });
  };

  const handleCustomQuestion = async () => {
    if (!customQuestion.trim()) return;
    
    setSelectedMode("custom");
    let context = "";
    if (hasJournalToday && recentEntry) {
      context = `Recent journal entry: "${recentEntry.substring(0, 200)}..."`;
    }
    if (userMood) {
      context += ` Current mood: ${userMood}`;
    }

    await merlinMutation.mutateAsync({ 
      mode: "custom", 
      context, 
      question: customQuestion 
    });
    setCustomQuestion("");
    setShowCustomInput(false);
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "daily-wisdom": return <Sparkles className="w-4 h-4" />;
      case "reflection": return <Scroll className="w-4 h-4" />;
      case "goal-alignment": return <Compass className="w-4 h-4" />;
      default: return <Gem className="w-4 h-4" />;
    }
  };

  const getModeTitle = (mode: string) => {
    switch (mode) {
      case "daily-wisdom": return "Daily Prophecy";
      case "reflection": return "Deep Reflection";
      case "goal-alignment": return "Path Alignment";
      case "custom": return "Personal Counsel";
      default: return "Wisdom";
    }
  };

  const getRandomHoverTip = () => {
    const tips = [
      "Need a spark of insight?",
      "Merlin awaits...",
      "Seek wisdom, young seeker?",
      "The crystal ball grows brighter...",
      "Your journey continues...",
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  return (
    <>
      {/* Floating Merlin Avatar */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transition-all duration-300 hover:scale-110 border-2 border-purple-300/50"
          title={getRandomHoverTip()}
        >
          <div className="relative">
            <Gem className="w-8 h-8 text-white animate-pulse" />
            {!dailyWisdomUsed && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" />
            )}
          </div>
        </Button>
      </div>

      {/* Merlin Dialog Window */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-2 border-amber-200 dark:border-amber-800 shadow-2xl">
            <CardHeader className="relative pb-2">
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedMode(null);
                    setShowCustomInput(false);
                    merlinMutation.reset();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-center text-xl font-serif text-amber-800 dark:text-amber-200 flex items-center justify-center gap-2">
                <Gem className="w-6 h-6 text-purple-600" />
                Merlin the Wise
              </CardTitle>
              <p className="text-center text-sm text-amber-600 dark:text-amber-400 italic">
                "Welcome, {userName || 'friend'}. How may I guide your journey today?"
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {!selectedMode && !merlinMutation.data && (
                <div className="space-y-3">
                  <Button
                    onClick={() => handleModeSelect("daily-wisdom")}
                    disabled={dailyWisdomUsed || merlinMutation.isPending}
                    className="w-full justify-start bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-200"
                  >
                    {getModeIcon("daily-wisdom")}
                    Daily Prophecy
                    {dailyWisdomUsed && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Used Today
                      </Badge>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleModeSelect("reflection")}
                    disabled={merlinMutation.isPending}
                    className="w-full justify-start bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200"
                  >
                    {getModeIcon("reflection")}
                    Deep Reflection
                  </Button>

                  <Button
                    onClick={() => handleModeSelect("goal-alignment")}
                    disabled={merlinMutation.isPending}
                    className="w-full justify-start bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200"
                  >
                    {getModeIcon("goal-alignment")}
                    Path Alignment
                  </Button>

                  <Button
                    onClick={() => setShowCustomInput(true)}
                    disabled={merlinMutation.isPending}
                    variant="outline"
                    className="w-full justify-start border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Ask Merlin Anything
                  </Button>
                </div>
              )}

              {showCustomInput && !selectedMode && (
                <div className="space-y-3">
                  <Textarea
                    placeholder={`What wisdom do you seek, ${userName || 'friend'}?`}
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    className="bg-white/50 dark:bg-black/20 border-amber-300"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCustomQuestion}
                      disabled={!customQuestion.trim() || merlinMutation.isPending}
                      className="flex-1"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Consult Merlin
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCustomInput(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {merlinMutation.isPending && (
                <div className="text-center py-6">
                  <Gem className="w-8 h-8 mx-auto animate-spin text-purple-600 mb-2" />
                  <p className="text-sm text-amber-600 dark:text-amber-400 italic">
                    Merlin consults the mystical forces...
                  </p>
                </div>
              )}

              {merlinMutation.data && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                    {getModeIcon(selectedMode || "custom")}
                    <span className="font-medium">
                      {getModeTitle(selectedMode || "custom")}
                    </span>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                    <p className="text-amber-800 dark:text-amber-200 leading-relaxed font-serif">
                      {merlinMutation.data.message}
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedMode(null);
                      merlinMutation.reset();
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Seek More Wisdom
                  </Button>
                </div>
              )}

              {merlinMutation.error && (
                <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    "The mystical connection falters... Please try again, {userName || 'friend'}."
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}