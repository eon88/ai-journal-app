import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest('/api/login', 'POST', credentials);
      return response.json();
    },
    onSuccess: async () => {
      console.log("Login successful, clearing cache and refetching auth");
      // Clear all cached data for privacy
      queryClient.clear();
      
      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refetch auth data to get the logged-in user
      const authResult = await refetch();
      console.log("Auth refetch result:", authResult);
      
      // Show success toast
      toast({
        title: "Welcome Back!",
        description: "You're now logged in to Life Path Companion.",
      });
      
      // Only redirect if we have a valid user
      if (authResult.data) {
        console.log("Navigating to home page");
        window.location.replace('/');
      } else {
        console.warn("Auth refetch failed, staying on login page");
      }
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
      const response = await apiRequest('/api/register', 'POST', data);
      return response.json();
    },
    onSuccess: async () => {
      console.log("Registration successful, clearing cache and refetching auth");
      // Clear all cached data for privacy
      queryClient.clear();
      
      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refetch auth data to get the registered user
      const authResult = await refetch();
      console.log("Auth refetch result:", authResult);
      
      // Show success toast
      toast({
        title: "Account Created!",
        description: "Welcome to Life Path Companion. You're now logged in.",
      });
      
      // Only redirect if we have a valid user
      if (authResult.data) {
        console.log("Navigating to home page");
        window.location.replace('/');
      } else {
        console.warn("Auth refetch failed, staying on registration page");
      }
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
      await apiRequest('/api/logout', 'POST');
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Navigate to landing page
      window.location.replace('/');
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