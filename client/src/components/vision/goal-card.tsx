import { format } from "date-fns";
import { Calendar, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { VisionGoal } from "@shared/schema";

interface GoalCardProps {
  goal: VisionGoal;
  onClick: () => void;
}

export function GoalCard({ goal, onClick }: GoalCardProps) {
  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", 
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    completed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    paused: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4"
      style={{ borderLeftColor: goal.color }}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg line-clamp-2">{goal.title}</CardTitle>
          <div className="flex gap-2">
            <Badge 
              variant="secondary" 
              className={priorityColors[goal.priority as keyof typeof priorityColors]}
            >
              {goal.priority}
            </Badge>
            <Badge 
              variant="secondary"
              className={statusColors[goal.status as keyof typeof statusColors]}
            >
              {goal.status}
            </Badge>
          </div>
        </div>
        
        {goal.description && (
          <CardDescription className="line-clamp-2">
            {goal.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Progress
              </span>
              <span className="text-sm text-muted-foreground">
                {goal.progressPercentage}%
              </span>
            </div>
            <Progress value={goal.progressPercentage} className="h-2" />
          </div>

          {/* Target Date */}
          {goal.targetDate && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                Target: {format(new Date(goal.targetDate), "MMM d, yyyy")}
              </span>
            </div>
          )}

          {/* Category */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: goal.color }}
              />
              <span className="text-sm capitalize">{goal.category}</span>
            </div>
            
            {goal.connectionIds && goal.connectionIds.length > 0 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Target className="h-3 w-3 mr-1" />
                {goal.connectionIds.length} connected
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}