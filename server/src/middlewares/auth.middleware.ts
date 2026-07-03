import { Request, Response, NextFunction } from 'express';
import { getUserById } from '../db';
import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || 'arcus_auth_default_secret_key_long_and_secure';

function verifyToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [userId, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || expiresAt < Date.now()) return null;

    const payload = `${userId}.${expiresAtStr}`;
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
    if (signature !== expectedSignature) return null;
    return userId;
  } catch {
    return null;
  }
}

export async function authenticateUser(req: any, res: Response, next: NextFunction) {
  try {
    let token: string | null = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token as string;
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
