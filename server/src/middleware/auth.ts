import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/database';

export interface AuthRequest extends Request {
  userId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '访问令牌不存在' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const db = getDatabase();
    const user = await db.get('SELECT id FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: '无效的访问令牌' });
  }
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
};