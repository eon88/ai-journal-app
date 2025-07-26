import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: number;
  username: string;
  email?: string;
  type: 'access' | 'refresh';
}

export interface AuthenticatedRequest extends Request {
  user?: any;
}

// Generate access token
export function generateAccessToken(user: any): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    type: 'access'
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

// Generate refresh token
export function generateRefreshToken(user: any): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    type: 'refresh'
  };
  
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

// Verify access token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    if (decoded.type !== 'access') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    if (decoded.type !== 'refresh') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

// Extract token from Authorization header or cookies
export function extractTokenFromRequest(req: Request): string | null {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const token = req.cookies?.access_token;
  if (token) {
    return token;
  }
  
  return null;
}

// JWT Authentication middleware
export async function jwtAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }
    
    const payload = verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Invalid or expired access token' });
    }
    
    // Get user from database to ensure they still exist
    const user = await storage.getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Auth Error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
}

// Optional authentication (for endpoints that work with or without auth)
export async function optionalJwtAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromRequest(req);
    
    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) {
        const user = await storage.getUserById(payload.userId);
        if (user) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // Don't fail on optional auth errors, just continue without user
    next();
  }
}

// Generate both access and refresh tokens
export function generateTokens(user: any) {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    expiresIn: 900 // 15 minutes in seconds
  };
}