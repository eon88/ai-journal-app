import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Target, Calendar, TrendingUp, Settings, Eye, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureGate } from "@/components/feature-gate";
import { CreateGoalDialog } from "@/components/vision/create-goal-dialog";
import { GoalCard } from "@/components/vision/goal-card";
import { GoalDetailModal } from "@/components/vision/goal-detail-modal";
import { VisionBoardCanvas } from "@/components/vision/vision-board-canvas";
import { apiRequest } from "@/lib/queryClient";
import { VisionGoal } from "@shared/schema";

interface VisionBoardStats {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  averageProgress: number;
  overdueMilestones: number;
}

export default function VisionBoard() {
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<VisionGoal | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const queryClient = useQueryClient();

  // Fetch user's goals
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['/api/vision/goals'],
    enabled: true,
  });

  // Fetch vision board stats
  const { data: stats } = useQuery<VisionBoardStats>({
    queryKey: ['/api/vision/stats'],
    enabled: true,
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (goalData: any) => apiRequest("POST", "/api/vision/goals", goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vision/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vision/stats'] });
      setCreateGoalOpen(false);
    },
  });

  // Goal categories for organization
  const goalCategories = [
    { id: 'career', name: 'Career & Professional', color: '#3B82F6', icon: '💼' },
    { id: 'health', name: 'Health & Wellness', color: '#10B981', icon: '🏃‍♂️' },
    { id: 'relationships', name: 'Relationships', color: '#F59E0B', icon: '❤️' },
    { id: 'personal', name: 'Personal Growth', color: '#8B5CF6', icon: '🌱' },
    { id: 'financial', name: 'Financial', color: '#059669', icon: '💰' },
    { id: 'creative', name: 'Creative & Hobbies', color: '#DC2626', icon: '🎨' },
    { id: 'spiritual', name: 'Spiritual & Purpose', color: '#7C2D12', icon: '🧘‍♂️' },
  ];

  // Group goals by category
  const goalsByCategory = goals.reduce((acc: any, goal: VisionGoal) => {
    if (!acc[goal.category]) acc[goal.category] = [];
    acc[goal.category].push(goal);
    return acc;
  }, {});

  return (
    <FeatureGate requiredTier="vision_planning">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-foreground mb-2">Vision Board</h1>
            <p className="text-muted-foreground">
              Transform your dreams into actionable goals with AI-guided planning
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="flex rounded-md border border-border">
              <Button
                variant={viewMode === 'board' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('board')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Button onClick={() => setCreateGoalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Total Goals</p>
                    <p className="text-2xl font-bold">{stats.totalGoals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeGoals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.completedGoals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="ml-2 w-full">
                    <p className="text-sm font-medium mb-2">Average Progress</p>
                    <Progress value={stats.averageProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground mt-1">{stats.averageProgress}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-red-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{stats.overdueMilestones}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={viewMode} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="board">Board View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="board" className="mt-0">
            {goals.length === 0 ? (
              <EmptyState onCreateGoal={() => setCreateGoalOpen(true)} />
            ) : (
              <VisionBoardCanvas 
                goals={goals} 
                onGoalClick={setSelectedGoal}
                categories={goalCategories}
              />
            )}
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            {goals.length === 0 ? (
              <EmptyState onCreateGoal={() => setCreateGoalOpen(true)} />
            ) : (
              <div className="space-y-6">
                {goalCategories.map((category) => {
                  const categoryGoals = goalsByCategory[category.id] || [];
                  if (categoryGoals.length === 0) return null;
                  
                  return (
                    <div key={category.id}>
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">{category.icon}</span>
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <Badge variant="secondary" className="ml-2">
                          {categoryGoals.length}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryGoals.map((goal: VisionGoal) => (
                          <GoalCard
                            key={goal.id}
                            goal={goal}
                            onClick={() => setSelectedGoal(goal)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <CreateGoalDialog
          open={createGoalOpen}
          onOpenChange={setCreateGoalOpen}
          onSubmit={createGoalMutation.mutate}
          categories={goalCategories}
          isPending={createGoalMutation.isPending}
        />
        
        {selectedGoal && (
          <GoalDetailModal
            goal={selectedGoal}
            open={!!selectedGoal}
            onOpenChange={(open) => !open && setSelectedGoal(null)}
          />
        )}
      </div>
    </FeatureGate>
  );
}

function EmptyState({ onCreateGoal }: { onCreateGoal: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Target className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Create Your First Vision</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start your journey by creating goals that align with your life vision. 
        Our AI will help you break them down into actionable steps.
      </p>
      <Button onClick={onCreateGoal} size="lg">
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Goal
      </Button>
    </div>
  );
}