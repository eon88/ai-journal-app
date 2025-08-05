import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles, Target, TrendingUp, Calendar, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AdminRoute } from "@/components/admin-route";
import { EmptyVisionState } from "@/components/vision/empty-vision-state";
import { apiRequest } from "@/lib/queryClient";
import { VisionGoal } from "@shared/schema";
import { useLocation } from "wouter";
import { format } from "date-fns";

const goalCategories = [
  { id: 'health', name: 'Health', color: '#10B981', icon: '💪' },
  { id: 'wealth', name: 'Wealth', color: '#F59E0B', icon: '💰' },
  { id: 'love', name: 'Love', color: '#EF4444', icon: '❤️' },
  { id: 'legacy', name: 'Legacy', color: '#F59E0B', icon: '🏛️' },
  { id: 'wisdom', name: 'Wisdom', color: '#6366F1', icon: '🧠' },
  { id: 'spirituality', name: 'Spirituality', color: '#8B5CF6', icon: '✨' },
  { id: 'character', name: 'Character', color: '#3B82F6', icon: '🎯' },
];

interface VisionBoardStats {
  totalGoals: number;
  completedGoals: number;
  averageProgress: number;
  activeGoals: number;
}

export default function VisionBoard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch vision goals
  const { data: goals = [], isLoading, error } = useQuery<VisionGoal[]>({
    queryKey: ['/api/vision/goals'],
    queryFn: () => apiRequest("GET", "/api/vision/goals").then(res => res.json()),
  });

  const stats: VisionBoardStats = {
    totalGoals: goals.length,
    completedGoals: goals.filter(g => g.status === 'completed').length,
    averageProgress: goals.length > 0 ? goals.reduce((sum, g) => sum + g.progressPercentage, 0) / goals.length : 0,
    activeGoals: goals.filter(g => g.status === 'active').length,
  };

  const handleStartQuestionnaire = () => {
    setLocation('/vision-questionnaire');
  };

  if (isLoading) {
    return (
      <AdminRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Vision Board</h1>
            <p className="text-muted-foreground">
              Transform your 7 Pillars vision into actionable goals and milestones
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleStartQuestionnaire}>
              <Sparkles className="h-4 w-4 mr-2" />
              Take Vision Journey
            </Button>
          </div>
        </div>

        {goals.length === 0 ? (
          <EmptyVisionState onStartQuestionnaire={handleStartQuestionnaire} />
        ) : (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalGoals}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeGoals}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedGoals}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(stats.averageProgress)}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const category = goalCategories.find(cat => cat.id === goal.category);
                return (
                  <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg"
                            style={{ backgroundColor: goal.color || '#6366F1' }}
                          >
                            {category?.icon || '🎯'}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <CardDescription className="capitalize">
                              {goal.category}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant={goal.status === 'completed' ? 'default' : 'secondary'}
                          className={goal.status === 'completed' ? 'bg-green-600' : ''}
                        >
                          {goal.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {goal.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {goal.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.progressPercentage}%</span>
                        </div>
                        <Progress value={goal.progressPercentage} className="h-2" />
                      </div>

                      {goal.targetDate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Target: {format(new Date(goal.targetDate), "MMM d, yyyy")}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <Badge 
                          variant="outline" 
                          className={
                            goal.priority === 'high' ? 'border-red-200 text-red-800' :
                            goal.priority === 'medium' ? 'border-yellow-200 text-yellow-800' :
                            'border-blue-200 text-blue-800'
                          }
                        >
                          {goal.priority} priority
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Vision Board Canvas Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Interactive Vision Board
                </CardTitle>
                <CardDescription>
                  Visual mindmap representation of your life vision and goals
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Interactive Canvas Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md">
                    A drag-and-drop visual canvas where you can arrange your goals in a mind map format, 
                    connecting your 7 pillars of life into a cohesive vision.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminRoute>
  );
}