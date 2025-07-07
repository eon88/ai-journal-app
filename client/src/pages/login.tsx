import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, User, Lock, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/login', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome Back!",
        description: "You're now logged in to Life Path Companion.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Force a page refresh to update auth state
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Life Path Companion</h1>
          </div>
          <p className="text-gray-300">Welcome back to your journey</p>
        </div>

        {/* Login Form */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-300">
              Continue your personal growth journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-gray-300">Username or Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder="Enter username or email"
                    className="bg-gray-800 border-gray-600 text-white pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter password"
                    className="bg-gray-800 border-gray-600 text-white pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center pt-4">
                <p className="text-gray-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => window.location.href = '/register'}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Create one here
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}