import { Request, Response, NextFunction } from 'express';

// Extended Request interface for Clerk auth
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
}

// Simple auth middleware (will be replaced with actual Clerk integration)
export const requireAuth = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // For now, we'll use a mock user ID
    // In production, this should verify the Clerk JWT token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Mock user data - replace with actual Clerk verification
    req.userId = 'user_mock_id';
    req.userEmail = 'user@example.com';
    req.userFirstName = 'Test';
    req.userLastName = 'User';

    next();
  };
};
