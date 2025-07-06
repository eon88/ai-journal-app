import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, TrendingUp, Lightbulb, BarChart3 } from "lucide-react";
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
      return apiRequest({
        method: "GET",
        path: `/api/reflect/weekly?weekStart=${weekStart}`,
      });
    },
    onSuccess: (result) => {
      setWeeklyReflection(result.summary);
      toast({
        title: "Weekly reflection generated!",
        description: "Your AI-powered weekly insights are ready.",
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
      return apiRequest({
        method: "GET",
        path: `/api/reflect/monthly?month=${month}&year=${year}`,
      });
    },
    onSuccess: (result) => {
      setMonthlyReflection(result.summary);
      toast({
        title: "Monthly reflection generated!",
        description: "Your AI-powered monthly insights are ready.",
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-journal-text mb-2">Periodic Reflections</h2>
        <p className="text-gray-600">Get AI-powered insights about your journaling patterns over time</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Reflection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Reflection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleWeeklyReflection}
              disabled={weeklyMutation.isPending}
              className="w-full"
            >
              {weeklyMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate This Week's Reflection
            </Button>

            {weeklyReflection && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Week of {weeklyReflection.weekStart}</h3>
                  <Badge variant="secondary">{weeklyReflection.entryCount} entries</Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm">
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
                    <h4 className="font-medium flex items-center gap-2 text-sm">
                      <BarChart3 className="w-4 h-4" />
                      Common Themes
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{weeklyReflection.commonThemes}</p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      Growth Observations
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{weeklyReflection.growthObservations}</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium flex items-center gap-2 text-sm text-blue-800">
                      <Lightbulb className="w-4 h-4" />
                      Weekly Insight
                    </h4>
                    <p className="text-sm text-blue-700 mt-1 italic">{weeklyReflection.weeklyInsight}</p>
                  </div>

                  <p className="text-xs text-gray-500">
                    Generated in {weeklyReflection.processingTime}ms
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Reflection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monthly Reflection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleMonthlyReflection}
              disabled={monthlyMutation.isPending}
              className="w-full"
              variant="outline"
            >
              {monthlyMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate This Month's Reflection
            </Button>

            {monthlyReflection && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{monthlyReflection.month} {monthlyReflection.year}</h3>
                  <Badge variant="secondary">{monthlyReflection.entryCount} entries</Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      Mood Trends
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{monthlyReflection.moodTrends}</p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm">
                      <BarChart3 className="w-4 h-4" />
                      Key Themes
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{monthlyReflection.keyThemes}</p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      Growth Journey
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{monthlyReflection.growthJourney}</p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="font-medium flex items-center gap-2 text-sm text-purple-800">
                      <Lightbulb className="w-4 h-4" />
                      Monthly Wisdom
                    </h4>
                    <p className="text-sm text-purple-700 mt-1 italic">{monthlyReflection.monthlyWisdom}</p>
                  </div>

                  <p className="text-xs text-gray-500">
                    Generated in {monthlyReflection.processingTime}ms
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}