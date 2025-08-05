import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Target, TrendingUp, Edit, Plus, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VisionGoal } from "@shared/schema";

interface GoalDetailModalProps {
  goal: VisionGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalDetailModal({ goal, open, onOpenChange }: GoalDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'progress'>('overview');

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", 
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-6 h-6 rounded-full mr-3"
                style={{ backgroundColor: goal.color }}
              />
              <div>
                <DialogTitle className="text-xl">{goal.title}</DialogTitle>
                <DialogDescription className="capitalize">
                  {goal.category} • {goal.status}
                </DialogDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge 
                variant="secondary" 
                className={priorityColors[goal.priority as keyof typeof priorityColors]}
              >
                {goal.priority} priority
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">{goal.progressPercentage}%</span>
                  </div>
                  <Progress value={goal.progressPercentage} className="h-3" />
                </div>
                
                {goal.targetDate && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Target completion: {format(new Date(goal.targetDate), "MMMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {goal.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {goal.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* AI Guidance */}
          {goal.aiGuidance && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  AI Strategic Guidance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {goal.aiGuidance}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Milestones</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Milestone
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Placeholder milestones - these would come from the goalMilestones table */}
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div className="flex-1">
                    <div className="font-medium">Research and Planning Phase</div>
                    <div className="text-sm text-muted-foreground">Define requirements and create action plan</div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Complete
                  </Badge>
                </div>
                
                <div className="flex items-center p-3 border rounded-lg">
                  <div className="h-5 w-5 border-2 border-blue-600 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="font-medium">Implementation Phase</div>
                    <div className="text-sm text-muted-foreground">Begin executing the planned actions</div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    In Progress
                  </Badge>
                </div>
                
                <div className="flex items-center p-3 border rounded-lg opacity-60">
                  <div className="h-5 w-5 border-2 border-gray-400 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="font-medium">Review and Optimization</div>
                    <div className="text-sm text-muted-foreground">Evaluate progress and make improvements</div>
                  </div>
                  <Badge variant="secondary">
                    Pending
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}