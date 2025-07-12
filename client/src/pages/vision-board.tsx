import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { BetaFeature } from "@/hooks/useBetaAccess";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Target, Calendar, CheckCircle, Circle, Trash2, Edit, Sparkles, Map } from "lucide-react";

interface VisionCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface VisionNextStep {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
}

interface VisionMilestone {
  id: number;
  title: string;
  description?: string;
  targetDate?: string;
  isCompleted: boolean;
  position: number;
  nextSteps?: VisionNextStep[];
}

interface VisionArea {
  id: number;
  title: string;
  description?: string;
  category: string;
  colorCode: string;
  position: number;
  isActive: boolean;
  milestones?: VisionMilestone[];
}

interface AISuggestion {
  title: string;
  description: string;
  category: string;
  milestones: {
    title: string;
    description: string;
    nextStep: string;
  }[];
}

export default function VisionBoard() {
  const [selectedArea, setSelectedArea] = useState<VisionArea | null>(null);
  const [editingArea, setEditingArea] = useState<VisionArea | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    colorCode: "#3B82F6"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vision board data
  const { data: visionBoard = [], isLoading } = useQuery<VisionArea[]>({
    queryKey: ["/api/vision-board"],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<VisionCategory[]>({
    queryKey: ["/api/vision-board/categories"],
    staleTime: 30 * 60 * 1000,
  });

  // Create vision area mutation
  const createAreaMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/vision-board/areas", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vision-board"] });
      setShowCreateDialog(false);
      setFormData({ title: "", description: "", category: "", colorCode: "#3B82F6" });
      toast({ title: "Vision area created successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create vision area", variant: "destructive" });
    }
  });

  // Generate AI suggestions mutation
  const generateAISuggestions = useMutation({
    mutationFn: () => apiRequest("/api/vision-board/ai-suggestions", "POST"),
    onSuccess: (data) => {
      setAiSuggestions(data.suggestions?.suggestedAreas || []);
      setShowAIDialog(true);
      toast({ 
        title: "AI suggestions generated!", 
        description: `Based on ${data.entriesAnalyzed} journal entries and ${data.insightsAnalyzed} insights`
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to generate AI suggestions", variant: "destructive" });
    }
  });

  // Update completion status mutations
  const updateMilestoneMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      apiRequest(`/api/vision-board/milestones/${id}`, "PATCH", updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vision-board"] });
      toast({ title: "Milestone updated!" });
    }
  });

  const updateNextStepMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      apiRequest(`/api/vision-board/next-steps/${id}`, "PATCH", updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vision-board"] });
      toast({ title: "Next step updated!" });
    }
  });

  const handleCreateArea = () => {
    if (!formData.title.trim() || !formData.category) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const selectedCategory = categories.find(cat => cat.id === formData.category);
    createAreaMutation.mutate({
      ...formData,
      colorCode: selectedCategory?.color || formData.colorCode,
      position: visionBoard.length
    });
  };

  const handleApplyAISuggestion = (suggestion: AISuggestion) => {
    const selectedCategory = categories.find(cat => cat.id === suggestion.category);
    setFormData({
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      colorCode: selectedCategory?.color || "#3B82F6"
    });
    setShowAIDialog(false);
    setShowCreateDialog(true);
  };

  const getProgressPercentage = (area: VisionArea) => {
    if (!area.milestones || area.milestones.length === 0) return 0;
    const completed = area.milestones.filter(m => m.isCompleted).length;
    return Math.round((completed / area.milestones.length) * 100);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon || "🎯";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your vision board...</p>
        </div>
      </div>
    );
  }

  return (
    <BetaFeature fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Vision Board
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              Vision Board is currently in beta testing. This feature will be available soon for all users.
            </p>
          </CardContent>
        </Card>
      </div>
    }>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Map className="h-8 w-8 text-blue-500" />
                  Vision Board
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Plan your life with the 5-3-1 formula: 5 major areas, 3 milestones each, 1 next step per milestone
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => generateAISuggestions.mutate()}
                  disabled={generateAISuggestions.isPending}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {generateAISuggestions.isPending ? "Generating..." : "AI Suggestions"}
                </Button>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  disabled={visionBoard.length >= 5}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Vision Area
                </Button>
              </div>
            </div>
            {visionBoard.length >= 5 && (
              <Badge variant="outline" className="mt-2">
                Maximum 5 vision areas reached
              </Badge>
            )}
          </div>

          {/* Vision Board Grid */}
          {visionBoard.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Create Your Vision Board
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Start mapping your life goals using our 5-3-1 formula. Let AI analyze your journal entries to suggest personalized vision areas.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => generateAISuggestions.mutate()}
                    disabled={generateAISuggestions.isPending}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {generateAISuggestions.isPending ? "Analyzing..." : "Get AI Suggestions"}
                  </Button>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Manually
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visionBoard.map((area) => (
                <Card 
                  key={area.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ borderLeft: `4px solid ${area.colorCode}` }}
                  onClick={() => setSelectedArea(area)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(area.category)}</span>
                        <CardTitle className="text-lg">{area.title}</CardTitle>
                      </div>
                      <Badge variant="outline" style={{ color: area.colorCode }}>
                        {area.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {area.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{getProgressPercentage(area)}%</span>
                      </div>
                      <Progress value={getProgressPercentage(area)} className="h-2" />
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {area.milestones?.length || 0}/3 milestones
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {area.milestones?.filter(m => m.isCompleted).length || 0} completed
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Create Vision Area Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Vision Area</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Health & Fitness Journey"
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your vision for this area..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Category *
                  </label>
                  <Select value={formData.category} onValueChange={(value) => {
                    const selectedCategory = categories.find(cat => cat.id === value);
                    setFormData(prev => ({ 
                      ...prev, 
                      category: value,
                      colorCode: selectedCategory?.color || prev.colorCode
                    }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateArea}
                    disabled={createAreaMutation.isPending}
                  >
                    {createAreaMutation.isPending ? "Creating..." : "Create Vision Area"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* AI Suggestions Dialog */}
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Vision Suggestions
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {aiSuggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-300">
                      No suggestions generated. Try journaling more about your goals and aspirations.
                    </p>
                  </div>
                ) : (
                  aiSuggestions.map((suggestion, index) => (
                    <Card key={index} className="border-l-4" style={{ borderLeftColor: categories.find(cat => cat.id === suggestion.category)?.color || "#3B82F6" }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span>{getCategoryIcon(suggestion.category)}</span>
                            {suggestion.title}
                          </CardTitle>
                          <Button
                            size="sm"
                            onClick={() => handleApplyAISuggestion(suggestion)}
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Use This
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {suggestion.description}
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Suggested Milestones:</h4>
                          {suggestion.milestones.map((milestone, mIndex) => (
                            <div key={mIndex} className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                              <p className="font-medium text-sm">{milestone.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Next step: {milestone.nextStep}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </BetaFeature>
  );
}