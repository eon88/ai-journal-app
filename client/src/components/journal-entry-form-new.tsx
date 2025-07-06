import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Smile, Tags, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertJournalEntry } from "@shared/schema";

interface JournalEntryFormProps {
  onAnalysisResult: (result: any) => void;
}

const moodOptions = [
  { value: "excited", label: "😄 Excited" },
  { value: "happy", label: "😊 Happy" },
  { value: "content", label: "😌 Content" },
  { value: "neutral", label: "😐 Neutral" },
  { value: "thoughtful", label: "🤔 Thoughtful" },
  { value: "sad", label: "😢 Sad" },
  { value: "anxious", label: "😰 Anxious" },
  { value: "frustrated", label: "😤 Frustrated" },
  { value: "calm", label: "😇 Calm" },
  { value: "energetic", label: "⚡ Energetic" }
];

export function JournalEntryForm({ onAnalysisResult }: JournalEntryFormProps) {
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEntryMutation = useMutation({
    mutationFn: async (entry: InsertJournalEntry) => {
      return apiRequest({
        method: "POST",
        path: "/api/entries",
        body: entry,
      });
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      setContent("");
      setSelectedMood(null);
      setTags([]);
      setNewTag("");
      setShowTagInput(false);
      toast({
        title: "Entry saved!",
        description: "Your journal entry has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const analyzeEntryMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest({
        method: "POST",
        path: "/api/analyze",
        body: { content },
      });
    },
    onSuccess: (result) => {
      onAnalysisResult(result);
      toast({
        title: "Analysis complete!",
        description: "Your AI reflection is ready.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: "Unable to generate AI reflection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      setShowTagInput(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const removeMood = () => {
    setSelectedMood(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Empty entry",
        description: "Please write something before saving.",
        variant: "destructive",
      });
      return;
    }

    const entry: InsertJournalEntry = {
      content: content.trim(),
      mood: selectedMood,
      tags: tags.length > 0 ? tags : null,
    };

    createEntryMutation.mutate(entry);
  };

  const handleAnalyze = () => {
    if (!content.trim()) {
      toast({
        title: "No content to analyze",
        description: "Please write something before requesting analysis.",
        variant: "destructive",
      });
      return;
    }
    analyzeEntryMutation.mutate(content.trim());
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="journal-content" className="block text-sm font-medium mb-2">
              What's on your mind today?
            </label>
            <Textarea
              id="journal-content"
              placeholder="Write about your day, thoughts, feelings, or anything that comes to mind..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>

          {/* Selected Items Display */}
          <div className="flex flex-wrap gap-2">
            {selectedMood && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {moodOptions.find(m => m.value === selectedMood)?.label}
                <button
                  type="button"
                  onClick={removeMood}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* NEW SIMPLE CONTROLS */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Smile className="w-4 h-4 text-gray-600" />
              <select 
                value={selectedMood || ""} 
                onChange={(e) => setSelectedMood(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose your mood...</option>
                {moodOptions.map((mood) => (
                  <option key={mood.value} value={mood.value}>
                    {mood.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <Tags className="w-4 h-4 text-gray-600" />
              {!showTagInput ? (
                <button
                  type="button"
                  onClick={() => setShowTagInput(true)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm"
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
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Enter tag..."
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTagInput(false);
                      setNewTag("");
                    }}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={createEntryMutation.isPending}
              className="flex-1"
            >
              {createEntryMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Entry
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAnalyze}
              disabled={analyzeEntryMutation.isPending || !content.trim()}
              className="flex-1"
            >
              {analyzeEntryMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Get AI Reflection
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}