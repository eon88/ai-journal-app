import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { login, register, logout, TokenManager, TokenRefresher, initializeAuth } from "@/lib/auth";
import { useEffect } from "react";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0, // Always fresh check for auth
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const result = await login(credentials.username, credentials.password);
      return result;
    },
    onSuccess: async () => {
      console.log("Login successful with JWT tokens");
      
      // Show success toast
      toast({
        title: "Welcome Back!",
        description: "You're now logged in to Quest Journal.",
      });
      
      // Clear all cached data for privacy
      queryClient.clear();
      
      // Refetch user data with new token
      await refetch();
      
      // Navigate to home page
      window.location.replace('/');
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string; firstName?: string; lastName?: string }) => {
      const result = await register(data);
      return result;
    },
    onSuccess: async () => {
      console.log("Registration successful with JWT tokens");
      
      // Show success toast
      toast({
        title: "Account Created!",
        description: "Welcome to Quest Journal. You're now logged in.",
      });
      
      // Clear all cached data for privacy
      queryClient.clear();
      
      // Refetch user data with new token
      await refetch();
      
      // Navigate to home page
      window.location.replace('/');
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      toast({
        title: "Logged Out",
        description: "You've been successfully logged out.",
      });
      
      // Navigate to landing page
      window.location.replace('/');
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}