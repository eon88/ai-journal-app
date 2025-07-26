// JWT Authentication utilities for frontend
import { apiRequest } from "./queryClient";

interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

interface LoginResponse extends TokenResponse {
  success: boolean;
  user: any;
}

// Store tokens in localStorage
export class TokenManager {
  private static ACCESS_TOKEN_KEY = 'quest_journal_access_token';
  private static TOKEN_EXPIRY_KEY = 'quest_journal_token_expiry';
  
  static setTokens(accessToken: string, expiresIn: number): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    // Calculate expiry time (subtract 30 seconds for buffer)
    const expiryTime = Date.now() + (expiresIn - 30) * 1000;
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }
  
  static getAccessToken(): string | null {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) {
      return null;
    }
    
    // Check if token is expired
    if (Date.now() > parseInt(expiry)) {
      this.clearTokens();
      return null;
    }
    
    return token;
  }
  
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }
  
  static isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    return Date.now() > parseInt(expiry);
  }
  
  static getTimeToExpiry(): number {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return 0;
    
    return Math.max(0, parseInt(expiry) - Date.now());
  }
}

// Automatic token refresh
export class TokenRefresher {
  private static refreshPromise: Promise<TokenResponse> | null = null;
  private static refreshTimer: NodeJS.Timeout | null = null;
  
  static async refreshToken(): Promise<TokenResponse> {
    // Check if we even have a refresh token before attempting
    const hasTokens = TokenManager.getAccessToken() || 
                     document.cookie.includes('refresh_token');
    
    if (!hasTokens) {
      throw new Error('No tokens available for refresh');
    }
    
    // Prevent multiple concurrent refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    
    this.refreshPromise = this.performRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }
  
  private static async performRefresh(): Promise<TokenResponse> {
    try {
      const response = await fetch('/api/refresh', {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data: TokenResponse = await response.json();
      TokenManager.setTokens(data.accessToken, data.expiresIn);
      
      // Schedule next refresh
      this.scheduleRefresh(data.expiresIn);
      
      return data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      TokenManager.clearTokens();
      // Redirect to login
      window.location.href = '/login';
      throw error;
    }
  }
  
  static scheduleRefresh(expiresIn: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    // Refresh 2 minutes before expiry (or halfway through if less than 4 minutes)
    const refreshIn = Math.min(expiresIn - 120, expiresIn / 2);
    
    if (refreshIn > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken().catch(console.error);
      }, refreshIn * 1000);
    }
  }
  
  static startAutoRefresh(): void {
    const timeToExpiry = TokenManager.getTimeToExpiry();
    if (timeToExpiry > 0) {
      this.scheduleRefresh(timeToExpiry / 1000);
    }
  }
  
  static stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

// Enhanced API request with automatic token handling
export async function authenticatedApiRequest(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET', 
  data?: any
): Promise<Response> {
  let token = TokenManager.getAccessToken();
  
  // If token is expired or missing, try to refresh
  if (!token || TokenManager.isTokenExpired()) {
    try {
      const refreshResult = await TokenRefresher.refreshToken();
      token = refreshResult.accessToken;
    } catch (error) {
      // If refresh fails, redirect to login
      throw new Error('Authentication required');
    }
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };
  
  if (data && method !== 'GET') {
    requestOptions.body = JSON.stringify(data);
  }
  
  const response = await fetch(endpoint, requestOptions);
  
  // If we get 401, try to refresh token once
  if (response.status === 401 && token) {
    try {
      const refreshResult = await TokenRefresher.refreshToken();
      headers['Authorization'] = `Bearer ${refreshResult.accessToken}`;
      
      // Retry the original request
      const retryResponse = await fetch(endpoint, {
        ...requestOptions,
        headers,
      });
      
      return retryResponse;
    } catch (refreshError) {
      // If refresh fails, clear tokens and redirect
      TokenManager.clearTokens();
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  }
  
  return response;
}

// Login function
export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  const data: LoginResponse = await response.json();
  
  // Store tokens
  TokenManager.setTokens(data.accessToken, data.expiresIn);
  
  // Start auto-refresh
  TokenRefresher.startAutoRefresh();
  
  return data;
}

// Register function
export async function register(userData: {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<LoginResponse> {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }
  
  const data: LoginResponse = await response.json();
  
  // Store tokens
  TokenManager.setTokens(data.accessToken, data.expiresIn);
  
  // Start auto-refresh
  TokenRefresher.startAutoRefresh();
  
  return data;
}

// Logout function
export async function logout(): Promise<void> {
  try {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout request failed:', error);
  } finally {
    // Always clear local tokens and stop refresh
    TokenManager.clearTokens();
    TokenRefresher.stopAutoRefresh();
  }
}

// Initialize auth on app start
export function initializeAuth(): void {
  // Start auto-refresh if we have valid tokens
  if (TokenManager.getAccessToken()) {
    TokenRefresher.startAutoRefresh();
  }
}