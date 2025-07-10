import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Vault, Lightbulb, Target, BookOpen, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SavedInsight {
  id: number;
  title: string;
  content: string;
  category: 'insight' | 'lesson' | 'goal';
  source: 'daily' | 'weekly' | 'monthly';
  entryId?: number;
  createdAt: string;
}

const categoryIcons = {
  insight: Lightbulb,
  lesson: BookOpen,
  goal: Target,
};

const categoryColors = {
  insight: 'text-yellow-800 bg-yellow-50 border-yellow-200 dark:text-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700',
  lesson: 'text-blue-800 bg-blue-50 border-blue-200 dark:text-blue-200 dark:bg-blue-900/30 dark:border-blue-700',
  goal: 'text-green-800 bg-green-50 border-green-200 dark:text-green-200 dark:bg-green-900/30 dark:border-green-700',
};

export function InsightsVault() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInsight, setNewInsight] = useState({
    title: '',
    content: '',
    category: 'insight' as const,
    source: 'daily' as const,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery<SavedInsight[]>({
    queryKey: ["/api/insights"],
  });

  const addInsightMutation = useMutation({
    mutationFn: async (insight: Omit<SavedInsight, 'id' | 'createdAt' | 'entryId'>) => {
      const response = await apiRequest("/api/insights", "POST", insight);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      setNewInsight({ title: '', content: '', category: 'insight', source: 'daily' });
      setShowAddForm(false);
      toast({
        title: "Insight saved!",
        description: "Added to your personal vault",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save insight",
        variant: "destructive",
      });
    },
  });

  const deleteInsightMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/insights/${id}`, "DELETE");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      toast({
        title: "Insight deleted",
        description: "Removed from your vault",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInsight.title.trim() && newInsight.content.trim()) {
      addInsightMutation.mutate(newInsight);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100/80 rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100/80 dark:bg-gray-800/80 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Vault className="w-5 h-5 text-purple-500" />
          The Vault
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Insight
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newInsight.title}
                onChange={(e) => setNewInsight({ ...newInsight, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="What's your insight?"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                value={newInsight.content}
                onChange={(e) => setNewInsight({ ...newInsight, content: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Describe your insight..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={newInsight.category}
                  onChange={(e) => setNewInsight({ ...newInsight, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="insight">Insight</option>
                  <option value="lesson">Lesson</option>
                  <option value="goal">Goal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Source
                </label>
                <select
                  value={newInsight.source}
                  onChange={(e) => setNewInsight({ ...newInsight, source: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="daily">Daily Entry</option>
                  <option value="weekly">Weekly Reflection</option>
                  <option value="monthly">Monthly Reflection</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addInsightMutation.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addInsightMutation.isPending ? 'Saving...' : 'Save Insight'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {insights && insights.length > 0 ? (
        <div className="space-y-2">
          {insights.slice(0, 3).map((insight) => {
            const IconComponent = categoryIcons[insight.category];
            const colorClass = categoryColors[insight.category];
            
            return (
              <div key={insight.id} className="border border-gray-200 dark:border-gray-600 rounded-md p-3 hover:shadow-sm transition-shadow bg-white dark:bg-gray-700/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${colorClass}`}>
                        <IconComponent className="w-2.5 h-2.5" />
                        {insight.category}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {insight.source} • {new Date(insight.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1 truncate">{insight.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{insight.content}</p>
                  </div>
                  <button
                    onClick={() => deleteInsightMutation.mutate(insight.id)}
                    disabled={deleteInsightMutation.isPending}
                    className="flex-shrink-0 p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {insights.length > 3 && (
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing 3 of {insights.length} insights
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Vault className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No insights saved yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Start saving meaningful insights from your reflections to build your personal wisdom library.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            <Plus className="w-4 h-4" />
            Add Your First Insight
          </button>
        </div>
      )}
    </div>
  );
}