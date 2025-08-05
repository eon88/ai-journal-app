import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Check if user is admin (assuming admin role is stored in user object)
  if (!user || user.role !== 'admin') {
    setLocation('/');
    return null;
  }

  return <>{children}</>;
}