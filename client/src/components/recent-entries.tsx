import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import type { JournalEntry } from "@shared/schema";

export function RecentEntries() {
  const { data: entries, isLoading, error } = useQuery<JournalEntry[]>({
    queryKey: ["/api/entries"],
    queryFn: async () => {
      const response = await fetch("/api/entries?limit=6");
      if (!response.ok) {
        throw new Error("Failed to fetch entries");
      }
      return response.json();
    },
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const getMoodColor = (mood?: string | null) => {
    switch (mood?.toLowerCase()) {
      case 'good':
      case 'happy':
      case 'excited':
        return 'bg-green-400';
      case 'neutral':
      case 'okay':
        return 'bg-yellow-400';
      case 'sad':
      case 'down':
        return 'bg-red-400';
      default:
        return 'bg-blue-400';
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-mobile-enhanced">Recent Entries</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-journal-border p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-mobile-enhanced">Recent Entries</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">
            Failed to load recent entries. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-mobile-enhanced">Recent Entries</h2>
        <Button 
          variant="ghost"
          className="text-sm text-mobile-enhanced hover:text-blue-200 font-medium"
        >
          View All
        </Button>
      </div>

      {entries && entries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <div 
              key={entry.id}
              className="bg-white rounded-lg shadow-sm border border-journal-border p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {formatDate(entry.createdAt)}
                </span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 ${getMoodColor(entry.mood)} rounded-full`}></div>
                  <span className="text-xs text-gray-400">
                    {entry.mood || 'No mood'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                {truncateText(entry.content)}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <MessageCircle className="w-3 h-3" />
                  <span>
                    {entry.aiReflection ? 'AI Reflection' : 'No reflection'}
                  </span>
                </div>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="text-xs text-journal-primary hover:text-indigo-700"
                >
                  Read More
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white">
          <p>No journal entries yet. Start writing your first entry above!</p>
        </div>
      )}
    </div>
  );
}
