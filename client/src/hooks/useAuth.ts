import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0, // Always fresh check for auth
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest('/api/login', 'POST', credentials);
      return response.json();
    },
    onSuccess: async () => {
      // Clear all cached data for privacy
      queryClient.clear();
      // Refetch auth data to get the logged-in user
      await refetch();
      // Navigate to home page
      navigate('/');
      toast({
        title: "Welcome Back!",
        description: "You're now logged in to Life Path Companion.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string; firstName?: string; lastName?: string }) => {
      const response = await apiRequest('/api/register', 'POST', data);
      return response.json();
    },
    onSuccess: async () => {
      // Clear all cached data for privacy
      queryClient.clear();
      // Refetch auth data to get the registered user
      await refetch();
      // Navigate to home page
      navigate('/');
      toast({
        title: "Account Created!",
        description: "Welcome to Life Path Companion. You're now logged in.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/logout', 'POST');
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Navigate to landing page
      navigate('/');
      toast({
        title: "Logged Out",
        description: "You've been successfully logged out.",
      });
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