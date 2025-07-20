import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Clock } from "lucide-react";
import { AdventureIcons } from "@/components/icons/adventure-icons";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { setGlobalJournalText } from "@/hooks/useJournalEntry";

interface DailyChallenge {
  id: number;
  date: string;
  title: string;
  description: string;
  prompt: string;
  xpReward: number;
  status: 'not_started' | 'accepted' | 'completed';
  acceptedAt: string | null;
  completedAt: string | null;
  acceptedUserId: number | null;
  createdAt: string;
}

export function DailyChallenge() {
  const queryClient = useQueryClient();
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  const { data: challenge, isLoading } = useQuery<DailyChallenge>({
    queryKey: ["/api/challenge/today"],
  });

  const acceptMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await apiRequest(`/api/challenge/${challengeId}/accept`, "POST");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenge/today"] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await apiRequest(`/api/challenge/${challengeId}/complete`, "POST");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenge/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Quest Completed!",
        description: `Congratulations! You've earned +${challenge?.xpReward} XP for completing today's quest.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Quest Not Complete",
        description: error.message || "Unable to complete quest. Please ensure you've written a substantial journal entry.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AdventureIcons.Sword size={20} className="" />
            Today's Quest
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
            <AdventureIcons.Sword size={20} className="" />
            Today's Quest
          </CardTitle>
          <CardDescription>No quest available today</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleAccept = () => {
    acceptMutation.mutate(challenge.id);
    // Auto-populate journal entry with quest prompt
    copyToJournalEntry(challenge.prompt);
  };

  const handleComplete = () => {
    completeMutation.mutate(challenge.id);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const copyToJournalEntry = (text: string) => {
    try {
      // Copy to clipboard as backup
      navigator.clipboard.writeText(text);
      
      // Set the global journal text state
      setGlobalJournalText(text);
      
      // Scroll to the journal entry form
      const textArea = document.querySelector('textarea[placeholder*="Write about your day"]') as HTMLTextAreaElement;
      if (textArea) {
        textArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        textArea.focus();
      }
      
      // Show success message
      toast({
        title: "Quest Prompt Added",
        description: "The quest prompt has been added to your journal entry!",
      });
    } catch (error) {
      console.error('Failed to copy challenge prompt:', error);
      toast({
        title: "Copy Failed",
        description: "Please manually copy the quest prompt to your journal entry.",
        variant: "destructive",
      });
    }
  };

  const isCompleted = challenge.status === 'completed';
  const isAccepted = challenge.status === 'accepted';
  const isNotStarted = challenge.status === 'not_started';

  return (
    <Card className={isCompleted ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : isAccepted ? (
              <Clock className="h-5 w-5 text-blue-600" />
            ) : (
              <AdventureIcons.Sword size={20} className="" />
            )}
            Today's Quest
          </CardTitle>
          <Badge variant={isCompleted ? "default" : isAccepted ? "outline" : "secondary"} className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            +{challenge.xpReward} XP
          </Badge>
        </div>
        <CardDescription>
          {isCompleted ? "Completed!" : isAccepted ? "Accepted - Write a journal entry (minimum 100 characters beyond the quest prompt) to complete" : "Accept the quest to begin"}
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

          {!isCompleted && (
            <div className="space-y-3">
              {isNotStarted && (
                <Button
                  variant="default"
                  onClick={handleAccept}
                  disabled={acceptMutation.isPending}
                  className="w-full"
                >
                  {acceptMutation.isPending ? "Accepting..." : "Accept Quest"}
                </Button>
              )}
              
              {isAccepted && (
                <>
                  {!showPrompt ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowPrompt(true)}
                      className="w-full"
                    >
                      View Quest Prompt
                    </Button>
                  ) : (
                    <div className="p-4 rounded-lg bg-muted/50 border-l-4 border-primary">
                      <div className="flex items-start gap-2 mb-2">
                        <AdventureIcons.Sword size={16} className="mt-0.5 text-primary" />
                        <span className="font-medium text-sm">Quest Prompt</span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {challenge.prompt}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToJournalEntry(challenge.prompt)}
                        className="mt-3"
                      >
                        Copy to Journal Entry
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleComplete}
                    disabled={completeMutation.isPending}
                    className="w-full"
                  >
                    {completeMutation.isPending ? "Completing..." : "Mark as Complete"}
                  </Button>
                </>
              )}
            </div>
          )}

          {isCompleted && challenge.completedAt && (
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