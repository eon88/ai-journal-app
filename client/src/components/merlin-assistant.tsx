import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, X, Scroll, Gem, Compass } from "lucide-react";
import merlinWizardImage from "@assets/ChatGPT Image Jul 6, 2025, 01_31_56 PM_1751805312463.png";
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
  isOpen?: boolean;
  onClose?: () => void;
  mobileMode?: boolean; // When true, renders content directly without modal wrapper
}

export function MerlinAssistant({ userMood, hasJournalToday, recentEntry, isOpen: externalIsOpen, onClose, mobileMode = false }: MerlinProps) {
  const { userName } = useUser();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external isOpen if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onClose ? (open: boolean) => !open && onClose() : setInternalIsOpen;
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

  // Mobile content without modal wrapper
  const MerlinContent = () => (
    <div className="space-y-4">
      <div className="text-center">
        <img 
          src={merlinWizardImage} 
          alt="Merlin" 
          className="w-16 h-16 object-cover rounded-full border-2 border-purple-300 mx-auto mb-2"
        />
        <h3 className="text-lg font-serif text-amber-800 dark:text-amber-200">Merlin the Wise</h3>
        <p className="text-sm text-amber-600 dark:text-amber-400 italic">
          "What wisdom do you seek today?"
        </p>
      </div>

      {!selectedMode && !merlinMutation.data && (
        <div className="space-y-3">
          {/* Daily Wisdom Button */}
          <Button
            onClick={() => handleModeSelect("daily-wisdom")}
            disabled={merlinMutation.isPending || dailyWisdomUsed}
            className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {dailyWisdomUsed ? "Daily Prophecy Received" : "Daily Prophecy"}
          </Button>

          {/* Other Mode Buttons */}
          <Button
            onClick={() => handleModeSelect("reflection")}
            disabled={merlinMutation.isPending}
            variant="outline"
            className="w-full justify-start"
          >
            <Scroll className="w-4 h-4 mr-2" />
            Deep Reflection
          </Button>

          <Button
            onClick={() => handleModeSelect("goal-alignment")}
            disabled={merlinMutation.isPending}
            variant="outline"
            className="w-full justify-start"
          >
            <Compass className="w-4 h-4 mr-2" />
            Path Alignment
          </Button>

          <Button
            onClick={() => setShowCustomInput(true)}
            disabled={merlinMutation.isPending}
            variant="outline"
            className="w-full justify-start"
          >
            <Send className="w-4 h-4 mr-2" />
            Ask Anything
          </Button>
        </div>
      )}

      {showCustomInput && !selectedMode && (
        <div className="space-y-3">
          <Textarea
            placeholder="What wisdom do you seek today?"
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
    </div>
  );

  // If in mobile mode, render content directly
  if (mobileMode) {
    return <MerlinContent />;
  }

  return (
    <>
      {/* Floating Merlin Avatar - Hidden on mobile devices */}
      <div className="fixed top-6 right-6 z-50 hidden md:block">
        <Button
          onClick={() => setInternalIsOpen(true)}
          className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transition-all duration-300 hover:scale-110 border-2 border-purple-300/50 overflow-hidden"
          title={getRandomHoverTip()}
        >
          <div className="relative w-full h-full">
            <img 
              src={merlinWizardImage} 
              alt="Merlin" 
              className="w-full h-full object-cover rounded-full"
            />
            {!dailyWisdomUsed && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" />
            )}
          </div>
        </Button>
      </div>

      {/* Merlin Dialog Window - Only show when not externally controlled */}
      {isOpen && externalIsOpen === undefined && (
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
                <img 
                  src={merlinWizardImage} 
                  alt="Merlin" 
                  className="w-6 h-6 object-cover rounded-full border border-purple-300"
                />
                Merlin
              </CardTitle>
              <p className="text-center text-sm text-amber-600 dark:text-amber-400 italic">
                "What wisdom do you seek today?"
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {!selectedMode && !merlinMutation.data && (
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowCustomInput(true)}
                    disabled={merlinMutation.isPending}
                    variant="outline"
                    className="w-full justify-start border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Ask Anything
                  </Button>
                </div>
              )}

              {showCustomInput && !selectedMode && (
                <div className="space-y-3">
                  <Textarea
                    placeholder="What wisdom do you seek today?"
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