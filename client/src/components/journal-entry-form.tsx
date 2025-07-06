import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Smile, Tags, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface JournalEntryFormProps {
  onAnalysisResult: (result: any) => void;
}

export function JournalEntryForm({ onAnalysisResult }: JournalEntryFormProps) {
  const [entry, setEntry] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const analyzeMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/analyze", { entry: content });
      return response.json();
    },
    onSuccess: (data) => {
      onAnalysisResult(data);
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
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/entries", { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
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

    // Create the entry first
    createEntryMutation.mutate(entry.trim());
    
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

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-4">
            <button className="text-sm text-gray-500 hover:text-journal-primary flex items-center space-x-1">
              <Smile className="w-4 h-4" />
              <span>Add Mood</span>
            </button>
            <button className="text-sm text-gray-500 hover:text-journal-primary flex items-center space-x-1">
              <Tags className="w-4 h-4" />
              <span>Add Tags</span>
            </button>
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
