import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, Sparkles, Target, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AdminRoute } from "@/components/admin-route";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface PillarQuestion {
  id: string;
  name: string;
  icon: string;
  color: string;
  question: string;
  description: string;
}

const sevenPillars: PillarQuestion[] = [
  {
    id: "health",
    name: "Health",
    icon: "💪",
    color: "#10B981",
    question: "It's ten years from now, and your body finally feels like a home—not a battlefield. What does your daily life feel like now that your body is in balance?",
    description: "Reflect on physical fitness, mental health, energy levels, and your relationship with your body."
  },
  {
    id: "wealth", 
    name: "Wealth",
    icon: "💰",
    color: "#F59E0B",
    question: "It's been ten years, and you no longer trade your time for survival—you've built stability and freedom. What kind of life would your money be funding if it were truly aligned with your purpose?",
    description: "Consider your financial goals, career vision, and relationship with money."
  },
  {
    id: "love",
    name: "Love", 
    icon: "❤️",
    color: "#EF4444",
    question: "It's ten years from now, and your relationships feel like roots, not cages. What does it look like to build a life surrounded by people who see and support the real you?",
    description: "Think about romantic relationships, family, friendships, and emotional connections."
  },
  {
    id: "legacy",
    name: "Legacy",
    icon: "🏛️", 
    color: "#F59E0B",
    question: "Ten years have passed, and your life now echoes beyond you. What will echo after you're gone?",
    description: "Reflect on your impact, contribution, and how you want to be remembered."
  },
  {
    id: "wisdom",
    name: "Wisdom",
    icon: "🧠",
    color: "#6366F1",
    question: "It's a decade later, and your mind is clear. Your decisions are grounded in truth, not noise. How are you becoming someone who sees clearly and chooses well?", 
    description: "Consider lifelong learning, critical thinking, and inner wisdom."
  },
  {
    id: "spirituality",
    name: "Spirituality",
    icon: "✨",
    color: "#8B5CF6",
    question: "It's ten years from today, and your soul is no longer restless. Who or what do you submit to that is greater than yourself?",
    description: "Explore your spiritual practices, beliefs, and connection to something transcendent."
  },
  {
    id: "character",
    name: "Character", 
    icon: "🎯",
    color: "#3B82F6",
    question: "A decade has passed, and you've become someone you'd trust—even when no one's watching. What kind of person are you now—and who must you become to live the life you desire?",
    description: "Reflect on your values, integrity, and personal growth."
  }
];

export default function VisionQuestionnaire() {
  const [currentPillar, setCurrentPillar] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const generateVisionMutation = useMutation({
    mutationFn: async (questionsAndAnswers: any) => {
      console.log("Generating vision with data:", questionsAndAnswers);
      try {
        // Use fetch directly to avoid the authentication redirect
        const response = await fetch("/api/vision/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include", // Include cookies for session auth
          body: JSON.stringify({ questionsAndAnswers })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("API response:", data);
        return data;
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Vision generation successful:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/vision/goals'] });
      setTimeout(() => {
        setLocation('/vision-board');
      }, 1000);
    },
    onError: (error: any) => {
      console.error("Vision generation failed:", error);
      alert(`Vision generation failed: ${error.message}. Please try logging in again.`);
      setIsComplete(false);
    },
  });

  const progress = ((currentPillar + 1) / sevenPillars.length) * 100;
  const currentPillarData = sevenPillars[currentPillar];

  useEffect(() => {
    // Load existing answer for current pillar
    setCurrentAnswer(answers[currentPillarData?.id] || "");
  }, [currentPillar, answers, currentPillarData?.id]);

  const handleNext = () => {
    // Save current answer
    if (currentPillarData) {
      setAnswers(prev => ({
        ...prev,
        [currentPillarData.id]: currentAnswer
      }));
    }

    if (currentPillar < sevenPillars.length - 1) {
      setCurrentPillar(currentPillar + 1);
    } else {
      // Complete questionnaire
      const finalAnswers = {
        ...answers,
        [currentPillarData.id]: currentAnswer
      };
      
      console.log("Completing questionnaire with final answers:", finalAnswers);
      console.log("Current pillar:", currentPillar, "Total pillars:", sevenPillars.length);
      
      setIsComplete(true);
      
      // Generate vision board from answers
      const questionsAndAnswers = sevenPillars.map(pillar => ({
        pillar: pillar.id,
        pillarName: pillar.name,
        question: pillar.question,
        answer: finalAnswers[pillar.id] || ""
      }));
      
      console.log("Sending questions and answers to API:", questionsAndAnswers);
      generateVisionMutation.mutate(questionsAndAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentPillar > 0) {
      // Save current answer before going back
      if (currentPillarData) {
        setAnswers(prev => ({
          ...prev,
          [currentPillarData.id]: currentAnswer
        }));
      }
      setCurrentPillar(currentPillar - 1);
    }
  };

  const handleSkip = () => {
    setCurrentAnswer("");
    handleNext();
  };

  if (isComplete || generateVisionMutation.isPending) {
    return (
      <AdminRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                {generateVisionMutation.isPending ? (
                  <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-white" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold mb-4">
                {generateVisionMutation.isPending ? "Creating Your Vision..." : "Vision Complete!"}
              </h2>
              
              <p className="text-muted-foreground mb-6">
                {generateVisionMutation.isPending 
                  ? "Our AI is analyzing your responses and creating a personalized vision board with goals and milestones."
                  : "Your personalized vision board has been created. Redirecting to your vision board..."
                }
              </p>
              
              {!generateVisionMutation.isPending && (
                <Button onClick={() => setLocation('/vision-board')}>
                  View My Vision Board
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Life Vision Journey</h1>
            <p className="text-muted-foreground">
              Design Your Meaningful Life Through Deep Reflection
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentPillar + 1} of {sevenPillars.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Pillars Preview */}
          <div className="grid grid-cols-7 gap-2 mb-8">
            {sevenPillars.map((pillar, index) => (
              <div
                key={pillar.id}
                className={`text-center p-3 rounded-lg transition-all ${
                  index === currentPillar
                    ? 'bg-white dark:bg-gray-800 shadow-md scale-105'
                    : index < currentPillar
                    ? 'bg-green-100 dark:bg-green-900'
                    : 'bg-gray-100 dark:bg-gray-700 opacity-60'
                }`}
              >
                <div className="text-2xl mb-1">{pillar.icon}</div>
                <div className="text-xs font-medium">{pillar.name}</div>
              </div>
            ))}
          </div>

          {/* Current Question */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge 
                  className="text-white"
                  style={{ backgroundColor: currentPillarData.color }}
                >
                  {currentPillarData.name}
                </Badge>
                <CardTitle className="text-xl">
                  {currentPillar + 1} of {sevenPillars.length}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 leading-relaxed">
                  {currentPillarData.question}
                </h3>
                <CardDescription className="text-base">
                  {currentPillarData.description}
                </CardDescription>
              </div>

              <div>
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Take a moment to reflect deeply and share your thoughts..."
                  rows={6}
                  className="text-base leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentPillar === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={handleSkip}
                    className="text-muted-foreground"
                  >
                    Skip Question
                  </Button>
                  
                  <Button onClick={handleNext}>
                    {currentPillar === sevenPillars.length - 1 ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Vision
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Take your time with each question. Thoughtful reflection creates a more meaningful vision.</p>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}