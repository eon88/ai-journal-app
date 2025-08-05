import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Target, Sparkles, Lightbulb, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";

export default function VisionBoard() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vision Board</h1>
          <p className="text-muted-foreground">
            Transform your dreams into actionable goals with AI-guided planning
          </p>
        </div>
      </div>
      
      <div className="p-8 text-center">
        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
          <Target className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Your Vision Goals</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Here are your personalized vision goals created from your questionnaire...
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <AIEnhancedGoalCard 
            title="Health Vision"
            description="I want to exercise daily and eat better"
            category="health"
            icon="🏃‍♂️"
            color="green"
          />
          
          <AIEnhancedGoalCard 
            title="Wealth Vision"
            description="Save more money and invest wisely"
            category="wealth"
            icon="💰"
            color="yellow"
          />
        </div>
      </div>
    </div>
  );
}

// AI-Enhanced Goal Card Component
function AIEnhancedGoalCard({ 
  title, 
  description, 
  category, 
  icon, 
  color 
}: {
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
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
    green: {
      card: "border-green-200 bg-green-50 hover:bg-green-100",
      title: "text-green-800",
      text: "text-green-700",
      progress: "text-green-600",
      button: "bg-green-600 hover:bg-green-700 text-white"
    },
    yellow: {
      card: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100",
      title: "text-yellow-800",
      text: "text-yellow-700",
      progress: "text-yellow-600",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white"
    }
  };

  const styles = colorStyles[color as keyof typeof colorStyles] || colorStyles.green;

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