import { Request, Response, NextFunction } from 'express';
import { getUserById } from '../db';
import { verifyToken } from '../utils/jwt';


export async function authenticateUser(req: any, res: Response, next: NextFunction) {
  try {
    let token: string | null = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized. Token required.' });
    }
    const userId = verifyToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
    }
    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. User profile not found.' });
    }
    req.user = user;
    next();
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
}

export function requireAdmin(req: any, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden. Admin role required.' });
  }
  next();
}
