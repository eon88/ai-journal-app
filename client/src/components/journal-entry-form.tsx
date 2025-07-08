import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Clock, Smile, Tags, PenTool, X, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BULLET_SYMBOLS } from "@shared/schema";

export function JournalEntryForm() {
  const [entry, setEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const moodOptions = [
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
  ];



  const createEntryMutation = useMutation({
    mutationFn: async (data: { content: string; mood?: string | null; tags?: string[] | null }) => {
      const response = await apiRequest("/api/entries", "POST", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      // Clear the form after successful submission
      setEntry("");
      setSelectedMood(null);
      setTags([]);
      toast({
        title: "Entry Saved",
        description: "Your journal entry has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save entry. Please try again.",
        variant: "destructive",
      });
    }
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!entry.trim()) {
      toast({
        title: "Entry Required",
        description: "Please write something in your journal entry first.",
        variant: "destructive",
      });
      return;
    }

    // Create the entry
    createEntryMutation.mutate({
      content: entry.trim(),
      mood: selectedMood,
      tags: tags.length > 0 ? tags : null
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
    <div className="glass-card-transparent rounded-xl shadow-sm p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Today's Entry</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-900 dark:text-white">
          <Clock className="w-4 h-4" />
          <span>{formatTime()}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="entry" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            What's on your mind today?
          </label>
          <Textarea 
            id="entry"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Write about your day, thoughts, goals, or anything that comes to mind. The AI will help you reflect on your entry..."
            rows={12}
            className="w-full p-4 border border-journal-border rounded-lg focus:ring-2 focus:ring-journal-primary focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 leading-relaxed bg-transparent"
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">
            {entry.length} characters
          </div>
        </div>

        {/* Bullet Symbol Buttons */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <PenTool className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Symbols:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(BULLET_SYMBOLS).map(([symbol, config]) => (
              <Button
                key={symbol}
                variant="outline"
                size="sm"
                onClick={() => {
                  const cursorPos = (document.querySelector('textarea') as HTMLTextAreaElement)?.selectionStart || 0;
                  const newEntry = entry.slice(0, cursorPos) + symbol + ' ' + entry.slice(cursorPos);
                  setEntry(newEntry);
                  // Focus back to textarea after symbol insertion
                  setTimeout(() => {
                    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                    if (textarea) {
                      textarea.focus();
                      textarea.setSelectionRange(cursorPos + symbol.length + 1, cursorPos + symbol.length + 1);
                    }
                  }, 10);
                }}
                className="text-xs px-2 py-1 h-auto"
                title={config.name}
              >
                {symbol} {config.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Mood and Tags Section */}
        <div className="flex flex-wrap gap-2 mb-4">
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
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>

        {/* Mood and Tags Controls */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <Smile className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select 
              value={selectedMood || ""} 
              onChange={(e) => setSelectedMood(e.target.value || null)}
              className="w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-journal-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select mood...</option>
              {moodOptions.map((mood) => (
                <option key={mood.value} value={mood.value}>
                  {mood.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Tags className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            {!showTagInput ? (
              <button
                type="button"
                onClick={() => setShowTagInput(true)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
                Add Tag
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag();
                    }
                  }}
                  placeholder="Enter tag..."
                  className="w-32 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-journal-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button 
                  type="button" 
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  className="px-3 py-1 text-sm bg-journal-primary text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTagInput(false);
                    setNewTag("");
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div></div>
          
          <Button 
            onClick={handleSubmit}
            disabled={createEntryMutation.isPending}
            className="bg-journal-primary hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-journal-primary focus:ring-offset-2"
          >
            <PenTool className="w-4 h-4" />
            <span>
              {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
