import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Plus, 
  Trash2, 
  Filter,
  Lightbulb,
  BookOpen,
  Target,
  Calendar,
  Archive
} from "lucide-react";
import { AdventureIcons } from "@/components/icons/adventure-icons";

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

export default function VaultPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
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
        title: "Insight added!",
        description: "Successfully added to your vault",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add insight",
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

  // Filter insights based on search and filters
  const filteredInsights = insights?.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || insight.category === selectedCategory;
    const matchesSource = selectedSource === "all" || insight.source === selectedSource;
    
    return matchesSearch && matchesCategory && matchesSource;
  }) || [];

  const categoryStats = insights?.reduce((acc, insight) => {
    acc[insight.category] = (acc[insight.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (isLoading) {
    return (
      <div className="min-h-screen font-inter">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <AdventureIcons.Vault size={32} className="text-purple-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">The Vault</h1>
              <p className="text-gray-600 dark:text-gray-400">Your personal collection of insights and wisdom</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Insight
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Insights</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{insights?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Insights</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{categoryStats.insight || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lessons</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{categoryStats.lesson || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Goals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{categoryStats.goal || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search insights, lessons, and goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="insight">Insights</option>
                  <option value="lesson">Lessons</option>
                  <option value="goal">Goals</option>
                </select>
                
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Sources</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Insight Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Insight</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <Input
                    type="text"
                    value={newInsight.title}
                    onChange={(e) => setNewInsight({ ...newInsight, title: e.target.value })}
                    placeholder="Enter insight title..."
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
                    placeholder="Describe your insight..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[100px]"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={addInsightMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {addInsightMutation.isPending ? "Adding..." : "Add Insight"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Insights Grid */}
        {filteredInsights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInsights.map((insight) => {
              const IconComponent = categoryIcons[insight.category];
              const colorClass = categoryColors[insight.category];
              
              return (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                        <IconComponent className="w-3 h-3" />
                        {insight.category}
                      </div>
                      <button
                        onClick={() => deleteInsightMutation.mutate(insight.id)}
                        disabled={deleteInsightMutation.isPending}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {insight.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {insight.content}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{insight.source} • {new Date(insight.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Vault className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || selectedCategory !== "all" || selectedSource !== "all" 
                  ? "No insights found" 
                  : "No insights yet"
                }
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm || selectedCategory !== "all" || selectedSource !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start saving meaningful insights from your reflections to build your personal wisdom library."
                }
              </p>
              {!searchTerm && selectedCategory === "all" && selectedSource === "all" && (
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Insight
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
}