import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SubscriptionCancellation() {
  const { toast } = useToast();
  const [isCanceled, setIsCanceled] = useState(false);

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/subscription/cancel", "POST", { 
        hasPremiumSubscription: true 
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setIsCanceled(true);
        toast({
          title: "Subscription Canceled",
          description: data.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Cancellation Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error("Cancellation error:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const handleCancelSubscription = async () => {
    await cancelSubscriptionMutation.mutateAsync();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Subscription
          </h3>
          <p className="text-sm text-gray-600 dark:text-white">
            Life Path Light Monthly Plan
          </p>
        </div>
        <Badge 
          variant={isCanceled ? "destructive" : "default"}
          className={isCanceled 
            ? "bg-orange-500 text-white" 
            : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"}
        >
          {isCanceled ? "Canceling" : "Active"}
        </Badge>
      </div>

      <Separator />

      {isCanceled ? (
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Subscription Canceled</span>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Your subscription has been canceled and will not renew. You'll continue to have access 
            to all premium features until the end of your current billing period.
          </p>
          <div className="mt-3 text-sm text-orange-700 dark:text-orange-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              <span>Access continues until: End of current billing period</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Current Features:
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Unlimited journal entries
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
                <CheckCircle className="w-4 h-4 text-green-500" />
                AI-powered weekly insights
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Advanced mood tracking
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Priority support
              </div>
            </div>
          </div>

          <Separator />

          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">Cancel Subscription</span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              Canceling will disable auto-renewal, but you'll keep access to all premium features 
              until the end of your current billing period.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto"
                  disabled={cancelSubscriptionMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {cancelSubscriptionMutation.isPending ? "Canceling..." : "Cancel Subscription"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel your Life Path Light Monthly subscription. You'll continue to have 
                    access to all premium features until the end of your current billing period, but your 
                    subscription will not renew automatically.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelSubscription}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, Cancel Subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
}