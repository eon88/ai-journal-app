import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, Sparkles, Lightbulb, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { VisionGoal } from "@shared/schema";
import { Link } from "wouter";

const pillarConfig = {
  health: { icon: "💪", color: "emerald" },
  wealth: { icon: "💰", color: "amber" },
  love: { icon: "❤️", color: "rose" },
  legacy: { icon: "🏛️", color: "indigo" },
  wisdom: { icon: "🧠", color: "violet" },
  spirituality: { icon: "✨", color: "purple" },
  character: { icon: "🎯", color: "blue" }
};

export default function VisionBoard() {
  const queryClient = useQueryClient();
  const { data: visionGoals = [], isLoading, error } = useQuery({
    queryKey: ["/api/vision/goals"],
    queryFn: async () => {
      const response = await fetch("/api/vision/goals", {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch vision goals");
      }
      return response.json();
    }
  });

  const handleClearVision = async () => {
    try {
      await apiRequest("DELETE", "/api/vision/goals");
      queryClient.invalidateQueries({ queryKey: ["/api/vision/goals"] });
    } catch (error) {
      console.error("Error clearing vision goals:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vision Board</h1>
          <p className="text-muted-foreground">
            Your 7 Pillars of Life - AI-generated goals from your questionnaire responses
          </p>
        </div>
        {visionGoals.length > 0 && (
          <div className="flex gap-3">
            <Link href="/vision/questionnaire">
              <Button variant="outline" className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Retake Questionnaire
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      {error ? (
        <div className="p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Target className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-red-800">Unable to Load Goals</h3>
          <p className="text-red-600 mb-6 max-w-md mx-auto">
            There was an error loading your vision goals. Please complete the questionnaire first.
          </p>
        </div>
      ) : visionGoals.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
            <Target className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Complete Your Vision Questionnaire</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Complete the 7 Pillars questionnaire to generate your personalized vision goals.
          </p>
          <Link href="/vision/questionnaire">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
              Start Questionnaire
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visionGoals.map((goal: VisionGoal) => {
            const config = pillarConfig[goal.pillarId as keyof typeof pillarConfig];
            return (
              <AIEnhancedGoalCard
                key={goal.id}
                title={`${config?.icon} ${goal.pillarName}`}
                description={goal.goal}
                category={goal.pillarId}
                icon={config?.icon || "🎯"}
                color={config?.color || "blue"}
                actionSteps={goal.actionSteps || []}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// AI-Enhanced Goal Card Component
function AIEnhancedGoalCard({ 
  title, 
  description, 
  category, 
  icon, 
  color,
  actionSteps = []
}: {
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  actionSteps?: string[];
}) {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const response = await fetch("/api/vision/ai-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          goal: description,
          category: category
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate insights: ${response.status}`);
      }
      
      const data = await response.json();
      setAiInsights(data.insights);
      setShowInsights(true);
    } catch (error) {
      console.error("Failed to generate AI insights:", error);
      setAiInsights("Unable to generate insights at this time. Please try again later.");
      setShowInsights(true);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const colorStyles = {
    emerald: {
      card: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100",
      title: "text-emerald-800",
      text: "text-emerald-700",
      progress: "text-emerald-600",
      button: "bg-emerald-600 hover:bg-emerald-700 text-white"
    },
    amber: {
      card: "border-amber-200 bg-amber-50 hover:bg-amber-100",
      title: "text-amber-800",
      text: "text-amber-700", 
      progress: "text-amber-600",
      button: "bg-amber-600 hover:bg-amber-700 text-white"
    },
    rose: {
      card: "border-rose-200 bg-rose-50 hover:bg-rose-100",
      title: "text-rose-800",
      text: "text-rose-700",
      progress: "text-rose-600",
      button: "bg-rose-600 hover:bg-rose-700 text-white" 
    },
    indigo: {
      card: "border-indigo-200 bg-indigo-50 hover:bg-indigo-100",
      title: "text-indigo-800",
      text: "text-indigo-700",
      progress: "text-indigo-600",
      button: "bg-indigo-600 hover:bg-indigo-700 text-white"
    },
    violet: {
      card: "border-violet-200 bg-violet-50 hover:bg-violet-100",
      title: "text-violet-800",
      text: "text-violet-700",
      progress: "text-violet-600",
      button: "bg-violet-600 hover:bg-violet-700 text-white"
    },
    purple: {
      card: "border-purple-200 bg-purple-50 hover:bg-purple-100",
      title: "text-purple-800",
      text: "text-purple-700",
      progress: "text-purple-600",
      button: "bg-purple-600 hover:bg-purple-700 text-white"
    },
    blue: {
      card: "border-blue-200 bg-blue-50 hover:bg-blue-100",
      title: "text-blue-800",
      text: "text-blue-700",
      progress: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700 text-white"
    }
  };

  const styles = colorStyles[color as keyof typeof colorStyles] || colorStyles.blue;

  return (
    <Card className={`${styles.card} transition-all duration-200 cursor-pointer transform hover:scale-105`}>
      <CardHeader>
        <CardTitle className={`${styles.title} flex items-center justify-between`}>
          <span className="flex items-center gap-2">
            {icon} {title}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={generateAIInsights}
            disabled={isGeneratingInsights}
            className={`${styles.button} h-8 px-3`}
          >
            {isGeneratingInsights ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className={styles.text}>{description}</p>
        <Progress value={0} className="mt-3" />
        <p className={`text-xs ${styles.progress} mt-1`}>Just getting started</p>
        
        {actionSteps.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Action Steps:</h4>
            <ul className="text-xs space-y-1">
              {actionSteps.slice(0, 3).map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showInsights && aiInsights && (
          <div className="mt-4 p-3 bg-white/50 rounded-lg border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">AI Insights</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{aiInsights}</p>
          </div>
        )}
        
        {!showInsights && !isGeneratingInsights && (
          <Button
            variant="outline"
            size="sm"
            onClick={generateAIInsights}
            className="w-full mt-2"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Get AI Insights
          </Button>
        )}
      </CardContent>
    </Card>
  );
}