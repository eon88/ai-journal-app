import { useQuery } from "@tanstack/react-query";

interface BetaStatus {
  isBetaTester: boolean;
  userId: number;
}

export function useBetaAccess() {
  const { data, isLoading, error } = useQuery<BetaStatus>({
    queryKey: ["/api/user/beta-status"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    isBetaTester: data?.isBetaTester || false,
    userId: data?.userId,
    isLoading,
    error
  };
}

// Component wrapper for beta-only features
export function BetaFeature({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const { isBetaTester, isLoading } = useBetaAccess();
  
  if (isLoading) return null;
  if (!isBetaTester) return <>{fallback}</>;
  
  return <>{children}</>;
}