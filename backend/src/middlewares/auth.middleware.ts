import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// This ensures req.user is recognized throughout your app
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    profileId: string;
    email?: string;
  };
}

// 👈 CHANGED NAME TO 'authenticate' to match your routes
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);

  if (!token) {
    return res.status(401).json({ error: "No token provided. Please log in." });
  }

  try {
    // Fallback secret for development if .env is not loaded
    const secret = process.env.JWT_SECRET || 'fallback_secret_keep_it_safe';
    const decoded = jwt.verify(token, secret) as any;
    
    req.user = {
      id: decoded.id, 
      role: decoded.role,
      profileId: decoded.profileId
    };

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ error: "Session expired or invalid token" });
  }
};

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied: This action requires one of the following roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};