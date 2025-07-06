import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle, Star, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface DailyChallenge {
  id: number;
  date: string;
  title: string;
  description: string;
  prompt: string;
  xpReward: number;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export function DailyChallenge() {
  const queryClient = useQueryClient();
  const [showPrompt, setShowPrompt] = useState(false);

  const { data: challenge, isLoading } = useQuery<DailyChallenge>({
    queryKey: ["/api/challenge/today"],
  });

  const completeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      return await apiRequest(`/api/challenge/${challengeId}/complete`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenge/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Today's Challenge
          </CardTitle>
          <CardDescription>Loading your daily quest...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Today's Challenge
          </CardTitle>
          <CardDescription>No challenge available today</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleComplete = () => {
    completeMutation.mutate(challenge.id);
  };

  return (
    <Card className={challenge.completed ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {challenge.completed ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Target className="h-5 w-5" />
            )}
            Today's Challenge
          </CardTitle>
          <Badge variant={challenge.completed ? "default" : "secondary"} className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            +{challenge.xpReward} XP
          </Badge>
        </div>
        <CardDescription>
          {challenge.completed ? "Completed!" : "Complete today's micro-quest"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg mb-2">{challenge.title}</h3>
            <p className="text-muted-foreground text-sm">
              {challenge.description}
            </p>
          </div>

          {!challenge.completed && (
            <div className="space-y-3">
              {!showPrompt ? (
                <Button
                  variant="outline"
                  onClick={() => setShowPrompt(true)}
                  className="w-full"
                >
                  View Challenge Prompt
                </Button>
              ) : (
                <div className="p-4 rounded-lg bg-muted/50 border-l-4 border-primary">
                  <div className="flex items-start gap-2 mb-2">
                    <Target className="h-4 w-4 mt-0.5 text-primary" />
                    <span className="font-medium text-sm">Challenge Prompt</span>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {challenge.prompt}
                  </p>
                </div>
              )}

              <Button
                onClick={handleComplete}
                disabled={completeMutation.isPending}
                className="w-full"
              >
                {completeMutation.isPending ? "Completing..." : "Mark as Complete"}
              </Button>
            </div>
          )}

          {challenge.completed && challenge.completedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Completed {new Date(challenge.completedAt).toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}