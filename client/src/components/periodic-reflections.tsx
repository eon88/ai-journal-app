import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, TrendingUp, Lightbulb, BarChart3, Target, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { WeeklyReflection, MonthlyReflection } from "@shared/schema";

export function PeriodicReflections() {
  const [weeklyReflection, setWeeklyReflection] = useState<WeeklyReflection | null>(null);
  const [monthlyReflection, setMonthlyReflection] = useState<MonthlyReflection | null>(null);
  const { toast } = useToast();

  const getWeekStart = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return {
      month: now.toLocaleString('default', { month: 'long' }),
      year: now.getFullYear()
    };
  };

  const weeklyMutation = useMutation({
    mutationFn: async (weekStart: string) => {
      const response = await fetch(`/api/reflect/weekly?weekStart=${weekStart}`);
      if (!response.ok) throw new Error('Failed to fetch weekly reflection');
      return await response.json();
    },
    onSuccess: (result) => {
      setWeeklyReflection(result.summary);
      toast({
        title: "Weekly reflection generated!",
        description: "Your insights are ready and auto-saved to The Vault for future reference.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to generate weekly reflection",
        description: "Make sure you have journal entries for this week.",
        variant: "destructive",
      });
    },
  });

  const monthlyMutation = useMutation({
    mutationFn: async ({ month, year }: { month: string; year: number }) => {
      const response = await fetch(`/api/reflect/monthly?month=${month}&year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch monthly reflection');
      return await response.json();
    },
    onSuccess: (result) => {
      setMonthlyReflection(result.summary);
      toast({
        title: "Monthly reflection generated!",
        description: "Your insights are ready and auto-saved to The Vault for future reference.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to generate monthly reflection",
        description: "Make sure you have journal entries for this month.",
        variant: "destructive",
      });
    },
  });

  const handleWeeklyReflection = () => {
    const weekStart = getWeekStart();
    weeklyMutation.mutate(weekStart);
  };

  const handleMonthlyReflection = () => {
    const { month, year } = getCurrentMonth();
    monthlyMutation.mutate({ month, year });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Periodic Reflections</h2>
        <p className="text-gray-900 dark:text-white">Get AI-powered insights about your journaling patterns over time</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Weekly Reflection */}
        <div className="glass-card-transparent rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Reflection
            </h3>
          </div>
          <div className="space-y-4">
            <Button 
              onClick={handleWeeklyReflection}
              disabled={weeklyMutation.isPending}
              className="w-full min-w-0 px-4 py-4 text-sm font-medium h-auto leading-tight"
            >
              {weeklyMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate This Week's Reflection
            </Button>

            {weeklyReflection && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">Week of {weeklyReflection.weekStart}</h3>
                  <Badge variant="secondary">{weeklyReflection.entryCount} entries</Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm text-gray-700 dark:text-white/80">
                      <TrendingUp className="w-4 h-4" />
                      Dominant Moods
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {weeklyReflection.dominantMoods.map((mood, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm text-gray-700 dark:text-white">
                      <BarChart3 className="w-4 h-4" />
                      Common Themes
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-white/70 mt-1">{weeklyReflection.commonThemes}</p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                      <TrendingUp className="w-4 h-4" />
                      Growth Observations
                    </h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{weeklyReflection.growthObservations}</p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                      <ArrowRight className="w-4 h-4" />
                      Direction & Momentum
                    </h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{weeklyReflection.directionAndMomentum}</p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                      <Target className="w-4 h-4" />
                      Emerging Goals
                    </h4>
                    <div className="mt-1 space-y-1">
                      {weeklyReflection.emergingGoals.map((goal, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 mt-0.5 text-green-600" />
                          <p className="text-sm text-gray-800 dark:text-gray-200">{goal}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {weeklyReflection.goalProgressAssessment && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <h4 className="font-medium flex items-center gap-2 text-sm text-purple-800">
                        <Target className="w-4 h-4" />
                        Goal Progress Assessment
                      </h4>
                      <p className="text-sm text-purple-700 mt-1 whitespace-pre-line">
                        {weeklyReflection.goalProgressAssessment}
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium flex items-center gap-2 text-sm text-blue-800">
                      <Lightbulb className="w-4 h-4" />
                      Weekly Insight
                    </h4>
                    <p className="text-sm text-blue-700 mt-1 italic">{weeklyReflection.weeklyInsight}</p>
                  </div>

                  <p className="text-xs text-gray-800 dark:text-gray-400">
                    Generated in {weeklyReflection.processingTime}ms
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Reflection */}
        <div className="glass-card-transparent rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monthly Reflection
            </h3>
          </div>
          <div className="space-y-4">
            <Button 
              onClick={handleMonthlyReflection}
              disabled={monthlyMutation.isPending}
              className="w-full min-w-0 px-4 py-4 text-sm font-medium h-auto leading-tight"
            >
              {monthlyMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate This Month's Reflection
            </Button>

            {monthlyReflection && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">{monthlyReflection.month} {monthlyReflection.year}</h3>
                  <Badge variant="secondary">{monthlyReflection.entryCount} entries</Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                      <TrendingUp className="w-4 h-4" />
                      Mood Trends
                    </h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{monthlyReflection.moodTrends}</p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                      <BarChart3 className="w-4 h-4" />
                      Key Themes
                    </h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{monthlyReflection.keyThemes}</p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                      <TrendingUp className="w-4 h-4" />
                      Growth Journey
                    </h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{monthlyReflection.growthJourney}</p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                      <ArrowRight className="w-4 h-4" />
                      Life Direction
                    </h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{monthlyReflection.lifeDirection}</p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm text-gray-700 dark:text-white">
                      <Target className="w-4 h-4" />
                      Emerging Goals
                    </h4>
                    <div className="mt-1 space-y-1">
                      {monthlyReflection.emergingGoals.map((goal, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 mt-0.5 text-green-600" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">{goal}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-medium flex items-center gap-2 text-sm text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      Goal Achievement Suggestions
                    </h4>
                    <div className="mt-2 space-y-1">
                      {monthlyReflection.goalAchievementSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 mt-0.5 text-green-700" />
                          <p className="text-sm text-green-700">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {monthlyReflection.goalProgressAssessment && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <h4 className="font-medium flex items-center gap-2 text-sm text-purple-800">
                        <Target className="w-4 h-4" />
                        Goal Progress Assessment
                      </h4>
                      <p className="text-sm text-purple-700 mt-1 whitespace-pre-line">
                        {monthlyReflection.goalProgressAssessment}
                      </p>
                    </div>
                  )}

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="font-medium flex items-center gap-2 text-sm text-purple-800">
                      <Lightbulb className="w-4 h-4" />
                      Monthly Wisdom
                    </h4>
                    <p className="text-sm text-purple-700 mt-1 italic">{monthlyReflection.monthlyWisdom}</p>
                  </div>

                  <p className="text-xs text-gray-800 dark:text-gray-400">
                    Generated in {monthlyReflection.processingTime}ms
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}