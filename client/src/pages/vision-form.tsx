import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BetaFeature } from "@/hooks/useBetaAccess";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";

interface VisionAnswers {
  legacy: string;
  wealth: string;
  love: string;
  health: string;
  wisdom: string;
  spirituality: string;
  character: string;
}

interface VisionResult {
  ultimateGoals: Record<string, {
    title: string;
    phrase: string;
    milestones: string[];
    icon: string;
    color: string;
  }>;
  lifeVisionSummary: string;
  extractedCategories: Record<string, string>;
}

const LIFE_CATEGORIES = [
  {
    key: 'legacy',
    title: 'Legacy',
    question: 'What impact do you want to have on the world? What do you want to be remembered for?',
    placeholder: 'I want to be remembered for creating positive change through...'
  },
  {
    key: 'wealth',
    title: 'Wealth',
    question: 'What is your relationship with money and financial goals? How do you envision abundance in your life?',
    placeholder: 'Financial freedom means to me...'
  },
  {
    key: 'love',
    title: 'Love',
    question: 'How do you envision your relationships, family, and connections with others?',
    placeholder: 'My ideal relationships are characterized by...'
  },
  {
    key: 'health',
    title: 'Health',
    question: 'What does optimal physical wellness, energy, and self-care look like for you?',
    placeholder: 'My vision for health and vitality includes...'
  },
  {
    key: 'wisdom',
    title: 'Wisdom',
    question: 'How do you want to grow intellectually? What knowledge or skills do you want to develop?',
    placeholder: 'I want to learn and grow by...'
  },
  {
    key: 'spirituality',
    title: 'Spirituality',
    question: 'How do you connect with meaning, purpose, and your inner life?',
    placeholder: 'My spiritual practice and sense of purpose involves...'
  },
  {
    key: 'character',
    title: 'Character',
    question: 'What values and qualities define who you want to become as a person?',
    placeholder: 'The person I aspire to be is...'
  }
];

export default function VisionForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<VisionAnswers>({
    legacy: '',
    wealth: '',
    love: '',
    health: '',
    wisdom: '',
    spirituality: '',
    character: ''
  });
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async (finalAnswers: VisionAnswers) => {
      const response = await apiRequest('/api/vision-architect/submit', 'POST', {
        answers: finalAnswers
      });
      return response.json();
    },
    onSuccess: (data) => {
      setVisionResult(data);
      toast({
        title: "Vision Created!",
        description: "Your life vision has been processed by the AI workflow and is ready to view.",
      });
    },
    onError: (error: any) => {
      console.error("Vision creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create vision. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnswerChange = (key: keyof VisionAnswers, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < LIFE_CATEGORIES.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit to n8n workflow
      submitMutation.mutate(answers);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentCategory = LIFE_CATEGORIES[currentStep];
  const currentAnswer = answers[currentCategory.key as keyof VisionAnswers];
  const isLastStep = currentStep === LIFE_CATEGORIES.length - 1;
  const canProceed = currentAnswer.trim().length > 20;

  if (visionResult) {
    return <VisionBoard visionResult={visionResult} />;
  }

  return (
    <BetaFeature fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Vision Architect</h2>
            <p className="text-gray-600 dark:text-gray-400">
              This feature is currently in beta testing and not available to your account.
            </p>
          </CardContent>
        </Card>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Vision Architect
            </h1>
            <p className="text-slate-300">
              Structured Life Vision Creation
            </p>
            
            {/* Progress Indicator */}
            <div className="mt-6 flex justify-center">
              <div className="flex items-center space-x-2">
                {LIFE_CATEGORIES.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index <= currentStep ? 'bg-blue-500' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-slate-400 text-sm mt-2">
              Step {currentStep + 1} of {LIFE_CATEGORIES.length}
            </div>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm border-slate-300 shadow-2xl">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{currentStep + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{currentCategory.title}</h3>
                      <div className="text-sm text-gray-500">Life Category</div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {currentCategory.question}
                    </p>
                  </div>
                </div>

                <div>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(currentCategory.key as keyof VisionAnswers, e.target.value)}
                    placeholder={currentCategory.placeholder}
                    className="min-h-[120px] text-base resize-none"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {currentAnswer.length}/500 characters
                    {currentAnswer.length < 20 && (
                      <span className="text-orange-500 ml-2">
                        Please provide more detail (minimum 20 characters)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    variant="outline"
                    className="px-6"
                  >
                    Previous
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed || submitMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                  >
                    {submitMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : isLastStep ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Vision
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BetaFeature>
  );
}

// Vision Board Component
function VisionBoard({ visionResult }: { visionResult: VisionResult }) {
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [cardPositions, setCardPositions] = useState<Record<string, { x: number, y: number }>>({});

  useEffect(() => {
    // Initialize random positions for cards
    const positions: Record<string, { x: number, y: number }> = {};
    Object.keys(visionResult.ultimateGoals).forEach((category, index) => {
      positions[category] = {
        x: 100 + (index % 3) * 300,
        y: 100 + Math.floor(index / 3) * 200
      };
    });
    setCardPositions(positions);
  }, []);

  const handleDragStart = (e: React.DragEvent, category: string) => {
    setDraggedCard(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedCard) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setCardPositions(prev => ({
        ...prev,
        [draggedCard]: { x, y }
      }));
      setDraggedCard(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Vision Board</h1>
          <p className="text-slate-300">Drag the cards to arrange your life vision</p>
          
          {visionResult.lifeVisionSummary && (
            <Card className="mt-6 bg-white/95 backdrop-blur-sm border-blue-300 max-w-4xl mx-auto">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-semibold text-gray-900">n8n AI-Enhanced Life Vision Summary</h3>
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {visionResult.lifeVisionSummary}
                </div>
                <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                  <span>🤖</span>
                  <span>Processed by external n8n workflow</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Canvas */}
        <div 
          className="relative bg-slate-800 rounded-lg border-2 border-slate-600 shadow-2xl overflow-hidden"
          style={{
            height: '600px',
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {Object.entries(visionResult.ultimateGoals).map(([category, data]) => (
            <div
              key={category}
              draggable
              onDragStart={(e) => handleDragStart(e, category)}
              className="absolute cursor-move"
              style={{
                left: `${cardPositions[category]?.x || 0}px`,
                top: `${cardPositions[category]?.y || 0}px`,
                transform: draggedCard === category ? 'rotate(5deg)' : 'none'
              }}
            >
              <Card 
                className="w-72 bg-white/95 backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105"
                style={{ borderColor: data.color || '#6B7280' }}
              >
                <CardContent className="p-4">
                  <div 
                    className="h-20 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: data.color ? `${data.color}20` : '#F3F4F6' }}
                  >
                    <div className="text-4xl">{data.icon || '🎯'}</div>
                    <div 
                      className="absolute inset-0 opacity-10"
                      style={{ backgroundColor: data.color || '#6B7280' }}
                    />
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{data.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{data.phrase}</p>
                  
                  {data.milestones && data.milestones.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Milestones:</div>
                      {data.milestones.slice(0, 3).map((milestone, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div 
                            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: data.color || '#6B7280' }}
                          />
                          <span className="text-xs text-gray-700 leading-relaxed">{milestone}</span>
                        </div>
                      ))}
                      {data.milestones.length > 3 && (
                        <div className="text-xs text-gray-500 italic">
                          +{data.milestones.length - 3} more...
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}