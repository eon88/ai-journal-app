import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, Smile, Tags, PenTool, X, Lock, TrendingUp } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { CustomTagsSelector } from "@/components/custom-tags-selector";
import { useProgressiveFeatures } from "@/hooks/useProgressiveFeatures";
import { EntryLimitGate } from "@/components/feature-gate";
import { LevelUpModal } from "@/components/level-up-modal";
import { useJournalEntry } from "@/hooks/useJournalEntry";

export function JournalEntryForm() {
  const { text: globalEntry, updateText } = useJournalEntry();
  const [entry, setEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [manualTag, setManualTag] = useState("");
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number;
    unlockedFeatures: string[];
    motivation: string;
  } | null>(null);

  // Sync with global journal entry state
  useEffect(() => {
    if (globalEntry && globalEntry !== entry) {
      console.log('Syncing global entry to form:', globalEntry);
      setEntry(globalEntry);
    }
  }, [globalEntry, entry]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    hasReachedEntryLimit,
    getMaxEntriesForLevel,
    getMaxMoodsForLevel,
    entryCount,
    progress
  } = useProgressiveFeatures();

  // Limit mood options based on user level
  const allMoodOptions = [
    { value: "happy", label: "😊 Happy" },
    { value: "sad", label: "😢 Sad" },
    { value: "excited", label: "🎉 Excited" },
    { value: "anxious", label: "😰 Anxious" },
    { value: "calm", label: "😌 Calm" },
    { value: "frustrated", label: "😤 Frustrated" },
    { value: "grateful", label: "🙏 Grateful" },
    { value: "determined", label: "💪 Determined" },
    { value: "neutral", label: "😐 Neutral" },
    { value: "reflective", label: "🤔 Reflective" },
    { value: "apathetic", label: "😑 Apathetic" },
  ];
  
  const maxMoods = getMaxMoodsForLevel();
  const moodOptions = allMoodOptions.slice(0, maxMoods);

  const createEntryMutation = useMutation({
    mutationFn: async (data: { content: string; mood?: string | null; tags?: string[] | null }) => {
      const response = await apiRequest("/api/entries", "POST", data);
      return response.json();
    },
    onSuccess: (result) => {
      // Invalidate all entry-related queries with different parameters
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries", { limit: 6 }] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries", { limit: 1 }] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries", { limit: "all" }] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries/search"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/entry-count"] });
      
      // Clear the form after successful submission
      setEntry("");
      setSelectedMood(null);

      setTags([]);
      setManualTag("");
      
      // Check for level up
      if (result.levelUpdate) {
        setLevelUpData({
          newLevel: result.levelUpdate.newLevel,
          unlockedFeatures: result.levelUpdate.unlockedFeatures || [],
          motivation: result.levelUpdate.motivation || "Keep growing!"
        });
        setShowLevelUpModal(true);
      } else {
        toast({
          title: "Entry Saved",
          description: "Your journal entry has been saved successfully.",
        });
      }
    },
    onError: (error: any) => {
      // Handle entry limit errors specifically
      if (error.message && error.message.includes("Entry limit reached")) {
        toast({
          title: "Entry Limit Reached",
          description: `You've reached your limit of ${getMaxEntriesForLevel()} entries. Level up to unlock more!`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Save Failed",
          description: error instanceof Error ? error.message : "Failed to save entry. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const handleSubmit = async () => {
    if (!entry.trim()) {
      toast({
        title: "Entry Required",
        description: "Please write something in your journal entry first.",
        variant: "destructive",
      });
      return;
    }

    createEntryMutation.mutate({
      content: entry.trim(),
      mood: selectedMood,
      tags: tags.length > 0 ? tags : null,
    });
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <>
      {/* Entry Limit Warning */}
      {hasReachedEntryLimit() && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                Entry Limit Reached
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                You've used {entryCount} of {getMaxEntriesForLevel()} entries. Level up to unlock more!
              </p>
            </div>
          </div>
        </div>
      )}



      <EntryLimitGate 
        currentCount={entryCount} 
        maxEntries={getMaxEntriesForLevel()}
      >
        <div className="glass-card-transparent rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <svg 
                className="w-7 h-7 opacity-90" 
                viewBox="0 0 100 100" 
                fill="none"
                title="Today's Entry"
              >
                {/* Scroll background */}
                <path d="M20 15 L80 15 Q85 15 85 20 L85 80 Q85 85 80 85 L20 85 Q15 85 15 80 L15 20 Q15 15 20 15 Z" 
                      fill="#F5F1E8" stroke="#8B7355" strokeWidth="1"/>
                {/* Scroll curls */}
                <path d="M15 20 Q10 20 10 15 Q10 10 15 10" fill="none" stroke="#8B7355" strokeWidth="1"/>
                <path d="M85 80 Q90 80 90 85 Q90 90 85 90" fill="none" stroke="#8B7355" strokeWidth="1"/>
                {/* Compass circle */}
                <circle cx="50" cy="50" r="25" fill="none" stroke="#8B4513" strokeWidth="2"/>
                {/* Compass points */}
                <path d="M50 30 L55 45 L50 40 L45 45 Z" fill="#8B4513"/>
                <path d="M50 70 L45 55 L50 60 L55 55 Z" fill="#8B4513"/>
                <path d="M30 50 L45 45 L40 50 L45 55 Z" fill="#8B4513"/>
                <path d="M70 50 L55 55 L60 50 L55 45 Z" fill="#8B4513"/>
                {/* Center dot */}
                <circle cx="50" cy="50" r="3" fill="#8B4513"/>
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Today's Entry</h2>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-900 dark:text-white">
              <Clock className="w-4 h-4" />
              <span>{formatTime()}</span>
            </div>
          </div>
    
          <div className="space-y-4">
            <div>
              <label htmlFor="entry" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                What's on your mind today?
              </label>
              <Textarea 
                id="entry"
                value={entry}
                onChange={(e) => {
                  const newValue = e.target.value;
                  console.log('Textarea onChange:', newValue);
                  setEntry(newValue);
                  updateText(newValue);
                }}
                placeholder="Write about your day, thoughts, goals, or anything that comes to mind. The AI will help you reflect on your entry..."
                rows={12}
                className="w-full p-4 border border-journal-border rounded-lg focus:ring-2 focus:ring-journal-primary focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 leading-relaxed bg-transparent"
              />
              <div className="text-right mt-1 text-xs text-gray-500 dark:text-gray-400">
                {entry.length} characters
              </div>
            </div>

            {/* Selected Items Display */}
            {(selectedMood || tags.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                {selectedMood && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {moodOptions.find(m => m.value === selectedMood)?.label}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSelectedMood(null)}
                    />
                  </Badge>
                )}
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    #{tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Simple Controls - Single Line */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {/* Mood Selector */}
              <div className="min-w-[120px]">
                <select 
                  value={selectedMood || ""} 
                  onChange={(e) => setSelectedMood(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-journal-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Mood</option>
                  {moodOptions.map((mood) => (
                    <option key={mood.value} value={mood.value}>
                      {mood.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags Section */}
            <div className="mb-4">
              <CustomTagsSelector
                selectedTags={tags}
                onTagsChange={setTags}
                manualTag={manualTag}
                onManualTagChange={setManualTag}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div></div>
              
              <Button 
                onClick={handleSubmit}
                disabled={createEntryMutation.isPending || hasReachedEntryLimit()}
                className="bg-journal-primary hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-journal-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PenTool className="w-4 h-4" />
                <span>
                  {createEntryMutation.isPending ? "Saving..." : hasReachedEntryLimit() ? "Limit Reached" : "Save Entry"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </EntryLimitGate>

      {/* Level Up Modal */}
      {showLevelUpModal && levelUpData && (
        <LevelUpModal
          newLevel={levelUpData.newLevel}
          unlockedFeatures={levelUpData.unlockedFeatures}
          motivation={levelUpData.motivation}
          onClose={() => setShowLevelUpModal(false)}
        />
      )}
    </>
  );
}