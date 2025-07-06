import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Clock, Smile, Tags, Sparkles, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface JournalEntryFormProps {
  onAnalysisResult: (result: any) => void;
}

export function JournalEntryForm({ onAnalysisResult }: JournalEntryFormProps) {
  const [entry, setEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const moodOptions = [
    { value: "happy", label: "Happy", emoji: "😊" },
    { value: "sad", label: "Sad", emoji: "😢" },
    { value: "excited", label: "Excited", emoji: "🎉" },
    { value: "anxious", label: "Anxious", emoji: "😰" },
    { value: "calm", label: "Calm", emoji: "😌" },
    { value: "frustrated", label: "Frustrated", emoji: "😤" },
    { value: "grateful", label: "Grateful", emoji: "🙏" },
    { value: "determined", label: "Determined", emoji: "💪" },
    { value: "neutral", label: "Neutral", emoji: "😐" },
    { value: "reflective", label: "Reflective", emoji: "🤔" },
  ];

  const analyzeMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/analyze", { entry: content });
      return response.json();
    },
    onSuccess: (data) => {
      onAnalysisResult(data);
      // Clear the form after successful submission
      setEntry("");
      setSelectedMood(null);
      setTags([]);
      toast({
        title: "Analysis Complete",
        description: "Your journal entry has been analyzed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze entry. Please try again.",
        variant: "destructive",
      });
    }
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: { content: string; mood?: string | null; tags?: string[] | null }) => {
      const response = await apiRequest("POST", "/api/entries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
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

    // Create the entry first
    createEntryMutation.mutate({
      content: entry.trim(),
      mood: selectedMood,
      tags: tags.length > 0 ? tags : null
    });
    
    // Then analyze it
    analyzeMutation.mutate(entry.trim());
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-journal-border p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-journal-text">Today's Entry</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{formatTime()}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="entry" className="block text-sm font-medium text-journal-text mb-2">
            What's on your mind today?
          </label>
          <Textarea 
            id="entry"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Write about your day, thoughts, goals, or anything that comes to mind. The AI will help you reflect on your entry..."
            rows={12}
            className="w-full p-4 border border-journal-border rounded-lg focus:ring-2 focus:ring-journal-primary focus:border-transparent resize-none text-journal-text placeholder-gray-400 leading-relaxed"
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {entry.length} characters
          </div>
        </div>

        {/* Mood and Tags Section */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedMood && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {moodOptions.find(m => m.value === selectedMood)?.emoji}
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

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-sm text-gray-500 hover:text-journal-primary flex items-center space-x-1">
                  <Smile className="w-4 h-4" />
                  <span>Add Mood</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3">
                <div className="grid grid-cols-2 gap-2">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 text-left text-sm"
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button className="text-sm text-gray-500 hover:text-journal-primary flex items-center space-x-1">
                  <Tags className="w-4 h-4" />
                  <span>Add Tags</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Enter tag..."
                    className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-journal-primary"
                  />
                  <Button size="sm" onClick={addTag}>Add</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={analyzeMutation.isPending || createEntryMutation.isPending}
            className="bg-journal-primary hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-journal-primary focus:ring-offset-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {analyzeMutation.isPending ? "Analyzing..." : "Get AI Reflection"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
