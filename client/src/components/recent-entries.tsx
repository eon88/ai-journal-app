import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { Link } from "wouter";
import type { JournalEntry } from "@shared/schema";
import { BULLET_SYMBOLS } from "@shared/schema";

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
        <Link href="/entries">
          <Button 
            variant="ghost"
            className="text-sm text-mobile-enhanced hover:text-blue-200 font-medium"
          >
            View All
          </Button>
        </Link>
      </div>

      {entries && entries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Link href={`/entry/${entry.id}`} key={entry.id}>
              <div 
                className="bg-white rounded-lg shadow-sm border border-journal-border p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-journal-primary group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-800 dark:text-gray-400" style={{ color: 'rgb(17, 24, 39)' }}>
                    {formatDate(entry.createdAt)}
                  </span>
                  <div className="flex items-center space-x-2">
                    {entry.symbol && (
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        {entry.symbol} {BULLET_SYMBOLS[entry.symbol as keyof typeof BULLET_SYMBOLS]?.name}
                      </Badge>
                    )}
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 ${getMoodColor(entry.mood)} rounded-full`}></div>
                      <span className="text-xs text-gray-800 dark:text-gray-400" style={{ color: 'rgb(17, 24, 39)' }}>
                        {entry.mood || 'No mood'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-200 line-clamp-3 mb-3" style={{ color: 'rgb(17, 24, 39)' }}>
                  {entry.symbol ? `${entry.symbol} ` : ''}{truncateText(entry.content)}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs text-gray-800 dark:text-gray-400" style={{ color: 'rgb(17, 24, 39)' }}>
                    <MessageCircle className="w-3 h-3" />
                    <span style={{ color: 'rgb(17, 24, 39)' }}>
                      {entry.aiReflection ? 'AI Reflection' : 'No reflection'}
                    </span>
                  </div>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="text-xs text-journal-primary hover:text-indigo-700 group-hover:text-indigo-700"
                  >
                    Read More
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-900 dark:text-white">
          <p>No journal entries yet. Start writing your first entry above!</p>
        </div>
      )}
      
      {/* Advanced Entry Management Link */}
      <div className="text-center mt-8 pt-6 border-t border-white/20">
        <Link href="/entries">
          <button className="bg-gray-800/10 hover:bg-gray-800/20 dark:bg-white/20 dark:hover:bg-white/30 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2 backdrop-blur-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Manage All Entries
          </button>
        </Link>
        <p className="text-gray-800 dark:text-white text-sm mt-2">
          Pin, organize, search, and download your journal entries
        </p>
      </div>
    </div>
  );
}
