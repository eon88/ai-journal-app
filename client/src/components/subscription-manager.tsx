import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Zap, Star, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  isActive: boolean;
  popular?: boolean;
}

interface Account {
  id: number;
  email: string;
  name: string;
  accountType: string;
  subscriptionStatus: string;
  betaAccessGranted: boolean;
  features: string[];
}

export function SubscriptionManager() {
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Fetch account status
  const { data: accountData, isLoading: accountLoading } = useQuery({
    queryKey: ["/api/account/status"],
  });

  // Fetch subscription plans
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/subscription/plans"],
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await apiRequest("POST", "/api/subscription/create-checkout", { planId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        if (data.checkoutUrl.startsWith('http')) {
          // External Stripe checkout URL
          window.location.href = data.checkoutUrl;
        } else {
          // Internal redirect for beta users - success message will be shown on profile page
          window.location.href = data.checkoutUrl;
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = async (planId: number) => {
    setIsUpgrading(true);
    try {
      await createCheckoutMutation.mutateAsync(planId);
    } finally {
      setIsUpgrading(false);
    }
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    const dollars = price / 100;
    return `$${dollars.toFixed(2)}/${interval}`;
  };

  if (accountLoading || plansLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const account: Account = accountData?.account;
  const plans: SubscriptionPlan[] = plansData?.plans || [];

  return (
    <div className="space-y-6">
      {/* Current Account Status */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            {account?.accountType === "free_beta" ? (
              <Star className="w-5 h-5 text-amber-500" />
            ) : (
              <Crown className="w-5 h-5 text-purple-500" />
            )}
            Current Plan
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your current subscription and features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {account?.accountType === "free_beta" ? "Free Beta Account" : "Premium Account"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {account?.accountType === "free_beta" 
                  ? "Full access during beta period" 
                  : "Full premium features"}
              </p>
            </div>
            <Badge 
              variant={account?.accountType === "free_beta" ? "default" : "secondary"}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
            >
              {account?.subscriptionStatus === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium text-foreground mb-2">Current Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {account?.features?.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {account?.accountType === "free_beta" && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Star className="w-4 h-4" />
                <span className="font-medium">Beta Access</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                You currently have full access to all features during our beta period. 
                Consider upgrading to premium to continue enjoying unlimited access after beta ends.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      {account?.accountType === "free_beta" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Upgrade Options</h2>
            <p className="text-muted-foreground">
              Choose a plan to continue your journey after the beta period
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`glass-card relative ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                  <div className="text-2xl font-bold text-foreground">
                    {formatPrice(plan.price, plan.currency, plan.interval)}
                    {plan.interval === "year" && (
                      <span className="text-sm font-normal text-green-600 ml-2">
                        Save 2 months!
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isUpgrading || createCheckoutMutation.isPending}
                    className={`w-full ${plan.popular 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                      : ''
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isUpgrading ? "Creating checkout..." : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}