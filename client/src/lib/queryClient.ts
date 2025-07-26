import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { TokenManager, TokenRefresher } from "./auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const text = await res.text();
      const parsed = JSON.parse(text);
      // Check if it's a JSON error response with an error field
      if (parsed && parsed.error) {
        errorMessage = parsed.error;
      } else {
        errorMessage = text || res.statusText;
      }
    } catch {
      // If parsing fails, use the raw text or statusText
      errorMessage = res.statusText;
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
): Promise<Response> {
  let token = TokenManager.getAccessToken();
  
  // If token is expired or missing, try to refresh (only if we had tokens before)
  if (!token || TokenManager.isTokenExpired()) {
    const hadTokens = TokenManager.getAccessToken() || 
                     document.cookie.includes('refresh_token');
    
    if (hadTokens) {
      try {
        const refreshResult = await TokenRefresher.refreshToken();
        token = refreshResult.accessToken;
      } catch (error) {
        // If refresh fails, clear tokens and throw authentication error
        TokenManager.clearTokens();
        throw new Error('Authentication required');
      }
    } else {
      // No tokens exist, this is a fresh user - don't try to authenticate
      throw new Error('Authentication required');
    }
  }
  
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // If we get 401, try to refresh token once
  if (res.status === 401 && token) {
    try {
      const refreshResult = await TokenRefresher.refreshToken();
      headers["Authorization"] = `Bearer ${refreshResult.accessToken}`;
      
      // Retry the original request
      const retryRes = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      
      await throwIfResNotOk(retryRes);
      return retryRes;
    } catch (refreshError) {
      // If refresh fails, clear tokens
      TokenManager.clearTokens();
      throw new Error('Authentication failed');
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let token = TokenManager.getAccessToken();
    
    // If token is expired or missing, try to refresh (only if we had tokens before)
    if (!token || TokenManager.isTokenExpired()) {
      const hadTokens = TokenManager.getAccessToken() || 
                       document.cookie.includes('refresh_token');
      
      if (hadTokens) {
        try {
          const refreshResult = await TokenRefresher.refreshToken();
          token = refreshResult.accessToken;
        } catch (error) {
          if (unauthorizedBehavior === "returnNull") {
            return null;
          }
          TokenManager.clearTokens();
          throw new Error('Authentication required');
        }
      } else if (unauthorizedBehavior === "returnNull") {
        // No tokens exist and we should return null for unauthenticated state
        return null;
      }
    }
    
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    // If we get 401, try to refresh token once
    if (res.status === 401 && token) {
      try {
        const refreshResult = await TokenRefresher.refreshToken();
        headers["Authorization"] = `Bearer ${refreshResult.accessToken}`;
        
        // Retry the original request
        const retryRes = await fetch(queryKey[0] as string, {
          headers,
          credentials: "include",
        });
        
        if (unauthorizedBehavior === "returnNull" && retryRes.status === 401) {
          return null;
        }
        
        await throwIfResNotOk(retryRes);
        return await retryRes.json();
      } catch (refreshError) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        TokenManager.clearTokens();
        throw new Error('Authentication failed');
      }
    }

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity - prevents stale data privacy issues
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
