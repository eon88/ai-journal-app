import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Target, Brain, Heart } from "lucide-react";

interface EmptyVisionStateProps {
  onStartQuestionnaire: () => void;
}

export function EmptyVisionState({ onStartQuestionnaire }: EmptyVisionStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader className="pb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl mb-2">Design Your Life Vision</CardTitle>
          <CardDescription className="text-lg">
            Create a comprehensive life vision based on the 7 Pillars of Life framework
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Deep Reflection</h3>
              <p className="text-sm text-muted-foreground">
                AI-guided questions help you explore your values and aspirations
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Smart Goals</h3>
              <p className="text-sm text-muted-foreground">
                Transform insights into actionable goals with clear milestones
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Meaningful Life</h3>
              <p className="text-sm text-muted-foreground">
                Build a balanced life across Health, Wealth, Love, and more
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button size="lg" onClick={onStartQuestionnaire} className="px-8">
              <Sparkles className="w-5 h-5 mr-2" />
              Start Your Vision Journey
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Takes 10-15 minutes • Based on 7 Pillars of Life framework
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}