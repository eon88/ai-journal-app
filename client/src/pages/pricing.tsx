import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Check, Crown, Star, Zap, CreditCard, ArrowRight } from "lucide-react";
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

export default function Pricing() {
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

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
    onError: (error: any) => {
      console.error("Checkout error:", error);
      const errorMessage = error.message || "Failed to create checkout session. Please try again.";
      
      if (errorMessage.includes("stripe_not_configured") || errorMessage.includes("Payment processing is not yet configured")) {
        toast({
          title: "Payment Not Available",
          description: "Payment processing is not yet configured. Please contact support to enable payments.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
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

  const plans: SubscriptionPlan[] = plansData?.plans || [];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your Life Path Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Start with our free beta account or upgrade to premium for unlimited access to 
            advanced AI insights and features
          </p>
          
          <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
            <Star className="w-5 h-5" />
            <span className="font-medium">Currently in Beta - Free access to all features</span>
            <Star className="w-5 h-5" />
          </div>
        </div>

        {/* Beta Notice */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-12">
          <div className="flex items-start gap-3">
            <Star className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Free Beta Access Available
              </h3>
              <p className="text-amber-700 dark:text-amber-300 mb-4">
                Join our beta program and get unlimited access to all premium features at no cost. 
                Help us improve the platform while discovering your life path with AI-powered insights.
              </p>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <ArrowRight className="w-4 h-4 mr-2" />
                Start Free Beta Journey
              </Button>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Free Beta Plan */}
          <Card className="glass-card relative border-2 border-amber-500">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                Beta Access
              </Badge>
            </div>

            <CardHeader className="text-center">
              <CardTitle className="text-foreground flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-amber-500" />
                Free Beta
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Full access during beta period
              </CardDescription>
              <div className="text-3xl font-bold text-foreground">
                Free
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  Limited time
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                {[
                  "Unlimited journal entries",
                  "AI-powered reflections",
                  "Weekly & monthly insights",
                  "Growth dashboard",
                  "Daily challenges",
                  "Community access",
                  "Merlin AI assistant",
                  "All beta features"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                <Star className="w-4 h-4 mr-2" />
                Join Beta Now
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plans */}
          {plansLoading ? (
            <>
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
            </>
          ) : (
            plans.map((plan) => (
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

                <CardHeader className="text-center">
                  <CardTitle className="text-foreground flex items-center justify-center gap-2">
                    <Crown className="w-6 h-6 text-purple-500" />
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                  <div className="text-3xl font-bold text-foreground">
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
                    {isUpgrading ? "Creating checkout..." : `Choose ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Features Comparison */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Why Choose Life Path Premium?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Advanced AI Insights</h3>
              <p className="text-muted-foreground">
                Get deeper, more personalized reflections and life path guidance
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Priority Support</h3>
              <p className="text-muted-foreground">
                Get help when you need it with premium customer support
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Early Access</h3>
              <p className="text-muted-foreground">
                Be the first to experience new features and improvements
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}