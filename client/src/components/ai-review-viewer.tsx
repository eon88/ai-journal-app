import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Compass, Brain, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AIReviewViewerProps {
  responses?: Record<string, string>;
}

interface IkigaiResults {
  currentTension: string;
  futureCalling: string;
  strengthsAndMap: string;
  lifeCompass: string | {
    coreValues?: string | string[];
    sourcesOfJoy?: string;
    innerNavigation?: string;
  };
  ikigaiPathway: string | {
    whatTheyLove?: string | string[];
    whatTheyAreGoodAt?: string | string[];
    whatTheWorldNeeds?: string | string[];
    whatTheyCanBePaidFor?: string | string[];
  };
  nextStep: string;
}

export function AIReviewViewer({ responses }: AIReviewViewerProps) {
  const [ikigaiResults, setIkigaiResults] = useState<IkigaiResults | null>(null);
  const [open, setOpen] = useState(false);

  // Get questionnaire responses from localStorage if not provided
  const getStoredResponses = () => {
    if (responses) return responses;
    
    const stored = localStorage.getItem('questionnaireResponses');
    return stored ? JSON.parse(stored) : null;
  };

  const analyzeResponsesMutation = useMutation({
    mutationFn: async (responses: Record<string, string>) => {
      const response = await apiRequest("/api/life-path-analysis", "POST", { responses });
      return await response.json();
    },
    onSuccess: (data) => {
      setIkigaiResults(data);
    },
    onError: (error) => {
      console.error("Analysis failed:", error);
    }
  });

  const handleAnalyze = () => {
    const storedResponses = getStoredResponses();
    if (storedResponses) {
      analyzeResponsesMutation.mutate(storedResponses);
    }
  };

  const hasResponses = () => {
    const storedResponses = getStoredResponses();
    return storedResponses && Object.keys(storedResponses).length > 0;
  };

  if (!hasResponses()) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Brain className="w-4 h-4 mr-2" />
            View AI Life Path Analysis
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Compass className="w-5 h-5" />
              Life Path Analysis
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-300">
              Complete the Life Path Discovery questionnaire first to access your personalized AI analysis.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Brain className="w-4 h-4 mr-2" />
          View AI Life Path Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5" />
            Your Life Path Discovery
          </DialogTitle>
        </DialogHeader>
        
        {!ikigaiResults ? (
          <div className="text-center py-8">
            <Button 
              onClick={handleAnalyze}
              disabled={analyzeResponsesMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              {analyzeResponsesMutation.isPending ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Your Responses...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate AI Analysis
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              This will analyze your questionnaire responses and provide personalized insights
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-red-400">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">🧩 Your Current Tension</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ikigaiResults.currentTension}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-blue-400">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">🌅 Your Future Calling</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ikigaiResults.futureCalling}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-green-400">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">🛤 Your Strengths & Map</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ikigaiResults.strengthsAndMap}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-purple-400">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">🧭 Your Life Compass</h3>
              {typeof ikigaiResults.lifeCompass === 'string' ? (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ikigaiResults.lifeCompass}</p>
              ) : (
                <div className="space-y-3">
                  {(ikigaiResults.lifeCompass as any)?.coreValues && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Core Values:</h4>
                      <p className="text-gray-700 dark:text-gray-300">{Array.isArray((ikigaiResults.lifeCompass as any).coreValues) ? (ikigaiResults.lifeCompass as any).coreValues.join(', ') : (ikigaiResults.lifeCompass as any).coreValues}</p>
                    </div>
                  )}
                  {(ikigaiResults.lifeCompass as any)?.sourcesOfJoy && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Sources of Joy:</h4>
                      <p className="text-gray-700 dark:text-gray-300">{(ikigaiResults.lifeCompass as any).sourcesOfJoy}</p>
                    </div>
                  )}
                  {(ikigaiResults.lifeCompass as any)?.innerNavigation && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Inner Navigation:</h4>
                      <p className="text-gray-700 dark:text-gray-300">{(ikigaiResults.lifeCompass as any).innerNavigation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">🔵 Your Ikigai Pathway</h3>
              {typeof ikigaiResults.ikigaiPathway === 'string' ? (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{ikigaiResults.ikigaiPathway}</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {(ikigaiResults.ikigaiPathway as any)?.whatTheyLove && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">💖 What You Love:</h4>
                      <p className="text-gray-700 dark:text-gray-300">{Array.isArray((ikigaiResults.ikigaiPathway as any).whatTheyLove) ? (ikigaiResults.ikigaiPathway as any).whatTheyLove.join(', ') : (ikigaiResults.ikigaiPathway as any).whatTheyLove}</p>
                    </div>
                  )}
                  {(ikigaiResults.ikigaiPathway as any)?.whatTheyAreGoodAt && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">🎯 What You're Good At:</h4>
                      <p className="text-gray-700 dark:text-gray-300">{Array.isArray((ikigaiResults.ikigaiPathway as any).whatTheyAreGoodAt) ? (ikigaiResults.ikigaiPathway as any).whatTheyAreGoodAt.join(', ') : (ikigaiResults.ikigaiPathway as any).whatTheyAreGoodAt}</p>
                    </div>
                  )}
                  {(ikigaiResults.ikigaiPathway as any)?.whatTheWorldNeeds && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">🌍 What the World Needs:</h4>
                      <p className="text-gray-700 dark:text-gray-300">{Array.isArray((ikigaiResults.ikigaiPathway as any).whatTheWorldNeeds) ? (ikigaiResults.ikigaiPathway as any).whatTheWorldNeeds.join(', ') : (ikigaiResults.ikigaiPathway as any).whatTheWorldNeeds}</p>
                    </div>
                  )}
                  {(ikigaiResults.ikigaiPathway as any)?.whatTheyCanBePaidFor && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">💰 What You Can Be Paid For:</h4>
                      <p className="text-gray-700 dark:text-gray-300">{Array.isArray((ikigaiResults.ikigaiPathway as any).whatTheyCanBePaidFor) ? (ikigaiResults.ikigaiPathway as any).whatTheyCanBePaidFor.join(', ') : (ikigaiResults.ikigaiPathway as any).whatTheyCanBePaidFor}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-orange-400">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Your Next Step:</h4>
                <p className="text-gray-700 dark:text-gray-300">{ikigaiResults.nextStep}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}