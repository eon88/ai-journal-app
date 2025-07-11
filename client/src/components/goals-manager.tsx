import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Target, Plus, Calendar, Star, CheckCircle2, Pause, Play, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface UserGoal {
  id: number;
  title: string;
  description?: string;
  category: string;
  targetDate?: string;
  status: "active" | "completed" | "paused";
  priority: "low" | "medium" | "high";
  progressNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const goalFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be under 200 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  targetDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  progressNotes: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalFormSchema>;

export function GoalsManager() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<UserGoal | null>(null);

  // Fetch user goals
  const { data: goalsData, isLoading } = useQuery({
    queryKey: ["/api/goals"],
  });

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      targetDate: "",
      priority: "medium",
      progressNotes: "",
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: GoalFormData) => {
      const response = await apiRequest("/api/goals", "POST", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Goal created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<GoalFormData> }) => {
      const response = await apiRequest("PATCH", `/api/goals/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setEditingGoal(null);
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Goal updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/goals/${id}`, "DELETE");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Success",
        description: "Goal deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GoalFormData) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, data });
    } else {
      createGoalMutation.mutate(data);
    }
  };

  const handleEdit = (goal: UserGoal) => {
    setEditingGoal(goal);
    form.reset({
      title: goal.title,
      description: goal.description || "",
      category: goal.category,
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : "",
      priority: goal.priority,
      progressNotes: goal.progressNotes || "",
    });
    setDialogOpen(true);
  };

  const handleStatusChange = (goalId: number, newStatus: "active" | "completed" | "paused") => {
    updateGoalMutation.mutate({ id: goalId, data: { status: newStatus } });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 dark:text-red-400";
      case "medium": return "text-yellow-600 dark:text-yellow-400";
      case "low": return "text-green-600 dark:text-green-400";
      default: return "text-gray-600 dark:text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "paused": return <Pause className="w-4 h-4 text-yellow-500" />;
      default: return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const goals: UserGoal[] = goalsData?.goals || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-500" />
            Personal Goals
          </h2>
          <p className="text-gray-600 dark:text-white">
            Set and track your life goals with AI-powered progress assessment
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingGoal(null);
                form.reset();
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? "Edit Goal" : "Create New Goal"}
              </DialogTitle>
              <DialogDescription>
                {editingGoal 
                  ? "Update your goal details and progress notes."
                  : "Define a new personal goal to track your progress with AI insights."
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Learn a new language, Exercise regularly..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your goal in detail..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="health">Health & Fitness</SelectItem>
                            <SelectItem value="career">Career & Work</SelectItem>
                            <SelectItem value="personal">Personal Development</SelectItem>
                            <SelectItem value="relationships">Relationships</SelectItem>
                            <SelectItem value="education">Education & Learning</SelectItem>
                            <SelectItem value="financial">Financial</SelectItem>
                            <SelectItem value="creative">Creative & Hobbies</SelectItem>
                            <SelectItem value="spiritual">Spiritual & Mindfulness</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        When do you want to achieve this goal?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="progressNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Progress Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any notes about your current progress or specific steps you're taking..."
                          className="min-h-[60px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                  >
                    {editingGoal ? "Update Goal" : "Create Goal"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-gray-600 dark:text-white mb-4" />
            <CardTitle className="text-xl text-center text-gray-900 dark:text-white mb-2">
              No Goals Yet
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-white mb-4">
              Start your journey by creating your first personal goal. AI will help track your progress in weekly and monthly reflections.
            </CardDescription>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(goal.status)}
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{goal.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                      {goal.priority}
                    </Badge>
                  </div>
                </div>
                {goal.description && (
                  <CardDescription className="text-gray-600 dark:text-white">
                    {goal.description}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-white">Category:</span>
                  <Badge variant="secondary">{goal.category}</Badge>
                </div>
                
                {goal.targetDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-white">Target Date:</span>
                    <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4" />
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                {goal.progressNotes && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-white mb-1">Progress Notes:</p>
                    <p className="text-sm text-gray-900 dark:text-white bg-muted p-2 rounded-md">
                      {goal.progressNotes}
                    </p>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {goal.status === "active" ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(goal.id, "completed")}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(goal.id, "paused")}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      </>
                    ) : goal.status === "paused" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(goal.id, "active")}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Resume
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(goal.id, "active")}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Reactivate
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(goal)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteGoalMutation.mutate(goal.id)}
                      disabled={deleteGoalMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}