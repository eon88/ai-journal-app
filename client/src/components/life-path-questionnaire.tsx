import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Compass, Map, Target, Frame } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";

interface LifePathQuestionnaireProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface QuestionnaireResponse {
  answers: string[];
  ikigaiAnalysis: {
    currentTension: string;
    futureCalling: string;
    strengthsAndMap: string;
    lifeCompass: string;
    ikigaiPathway: string;
    nextStep: string;
  };
}

const sections = [
  {
    id: 'frame',
    title: 'FRAME — Clarify Current State',
    icon: Frame,
    description: 'Understanding where you are right now',
    questions: [
      "What feels off or misaligned in your current life?",
      "Where do you feel stuck or unmotivated?",
      "If your life were a story, what chapter are you in—and what's the conflict?",
      "What are you secretly afraid to want?"
    ]
  },
  {
    id: 'destination',
    title: 'DESTINATION — Envision the Future',
    icon: Target,
    description: 'Imagining your ideal future self',
    questions: [
      "If you had total freedom, how would you spend your days?",
      "What kind of person do you want to become?",
      "Describe your ideal life 3–5 years from now.",
      "Who do you admire, and what draws you to them?"
    ]
  },
  {
    id: 'map',
    title: 'MAP — Assess Tools & Starting Point',
    icon: Map,
    description: 'Identifying your strengths and resources',
    questions: [
      "What are you naturally good at that others often struggle with?",
      "What drains you most in your current life?",
      "What difficult experience shaped you in a meaningful way?",
      "What's one small thing you could do now to move toward your vision?"
    ]
  },
  {
    id: 'compass',
    title: 'COMPASS — Build Your Navigation System',
    icon: Compass,
    description: 'Discovering your values and inner guidance',
    questions: [
      "What values do you want to live by—no matter what?",
      "When do you feel most alive or energized?",
      "What injustice or problem in the world do you feel drawn to fix?",
      "What truth have you been avoiding in your life?"
    ]
  }
];

export function LifePathQuestionnaire({ onComplete, onSkip }: LifePathQuestionnaireProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(16).fill(''));
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [ikigaiResults, setIkigaiResults] = useState<QuestionnaireResponse['ikigaiAnalysis'] | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const totalQuestions = sections.reduce((acc, section) => acc + section.questions.length, 0);
  const currentQuestionIndex = sections.slice(0, currentSection).reduce((acc, section) => acc + section.questions.length, 0) + currentQuestion;
  const progress = (currentQuestionIndex / totalQuestions) * 100;

  const analyzeResponsesMutation = useMutation({
    mutationFn: async (responses: string[]): Promise<QuestionnaireResponse> => {
      const response = await fetch("/api/life-path-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: responses }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze responses");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setIkigaiResults(data.ikigaiAnalysis);
      setShowResults(true);
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Analysis Error",
        description: "Unable to analyze your responses. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleNextQuestion = () => {
    if (currentAnswer.trim()) {
      const answerIndex = currentQuestionIndex;
      const newAnswers = [...answers];
      newAnswers[answerIndex] = currentAnswer.trim();
      setAnswers(newAnswers);
      setCurrentAnswer('');

      if (currentQuestion < sections[currentSection].questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
        setCurrentQuestion(0);
      } else {
        // All questions completed - analyze responses
        analyzeResponsesMutation.mutate(newAnswers);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(sections[currentSection - 1].questions.length - 1);
    }
    
    // Load previous answer
    const prevAnswerIndex = currentQuestionIndex - 1;
    if (prevAnswerIndex >= 0) {
      setCurrentAnswer(answers[prevAnswerIndex] || '');
    }
  };

  const currentSectionData = sections[currentSection];
  const currentQuestionText = currentSectionData?.questions[currentQuestion];
  const IconComponent = currentSectionData?.icon;
  const canGoNext = currentAnswer.trim().length > 0;
  const canGoPrevious = currentQuestionIndex > 0;

  if (showResults && ikigaiResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white-strong mb-2">Your Life Path Discovery</h1>
              <p className="text-gray-600 dark:text-white-strong dark:opacity-90">A personalized guide based on your responses</p>
            </div>

            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-red-400">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white-strong mb-3">🧩 Your Current Tension</h3>
                <p className="text-gray-700 dark:text-white-strong dark:opacity-90 leading-relaxed">{ikigaiResults.currentTension}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white-strong mb-3">🌅 Your Future Calling</h3>
                <p className="text-gray-700 dark:text-white-strong dark:opacity-90 leading-relaxed">{ikigaiResults.futureCalling}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-green-400">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white-strong mb-3">🛤 Your Strengths & Map</h3>
                <p className="text-gray-700 dark:text-white-strong dark:opacity-90 leading-relaxed">{ikigaiResults.strengthsAndMap}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-purple-400">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white-strong mb-3">🧭 Your Life Compass</h3>
                <p className="text-gray-700 dark:text-white-strong dark:opacity-90 leading-relaxed">{ikigaiResults.lifeCompass}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white-strong mb-3">🔵 Your Ikigai Pathway</h3>
                <p className="text-gray-700 dark:text-white-strong dark:opacity-90 leading-relaxed mb-4">{ikigaiResults.ikigaiPathway}</p>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-orange-400">
                  <h4 className="font-semibold text-gray-800 dark:text-white-strong mb-2">Your Next Step:</h4>
                  <p className="text-gray-700 dark:text-white-strong dark:opacity-90">{ikigaiResults.nextStep}</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button 
                onClick={onComplete}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3"
              >
                Begin Your Journaling Journey
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700 dark:text-white-strong dark:hover:text-white dark:hover:bg-white/10"
              >
                Skip for now
              </Button>
              <div className="text-sm text-gray-500 dark:text-white-strong dark:opacity-70">
                {currentQuestionIndex + 1} of {totalQuestions}
              </div>
            </div>
            
            <Progress value={progress} className="mb-6" />
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                {IconComponent && <IconComponent className="text-white text-lg" />}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white-strong mb-1">
                {currentSectionData?.title}
              </h2>
              <p className="text-gray-600 dark:text-white-strong text-sm dark:opacity-90">{currentSectionData?.description}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white-strong mb-4 leading-relaxed">
              {currentQuestionText}
            </h3>
            
            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Take your time to reflect and share your thoughts..."
              className="min-h-32 resize-none bg-white/90 border-gray-300 text-gray-800 placeholder:text-gray-500 dark:bg-white/10 dark:border-white/20 dark:text-white dark:placeholder:text-white/60 backdrop-blur-sm"
              maxLength={1000}
            />
            
            <div className="text-right text-xs text-gray-500 dark:text-white-strong dark:opacity-70 mt-1">
              {currentAnswer.length}/1000
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={!canGoPrevious}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <Button
              onClick={handleNextQuestion}
              disabled={!canGoNext || analyzeResponsesMutation.isPending}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              <span>
                {analyzeResponsesMutation.isPending 
                  ? 'Analyzing...' 
                  : currentQuestionIndex === totalQuestions - 1 
                    ? 'Complete Journey' 
                    : 'Next'
                }
              </span>
              {!analyzeResponsesMutation.isPending && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}