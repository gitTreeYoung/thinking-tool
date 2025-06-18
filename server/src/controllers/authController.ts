import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/database';
import { generateToken, AuthRequest } from '../middleware/auth';
import { LoginRequest, RegisterRequest, User } from '../types';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password }: RegisterRequest = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: '密码长度至少6位' });
    }

    const db = getDatabase();
    
    const existingUser = await db.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await db.run(
      'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [userId, username, email, hashedPassword]
    );

    const user = await db.get(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    const token = generateToken(userId);

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '请输入用户名和密码' });
    }

    const db = getDatabase();
    const user = await db.get(
      'SELECT id, username, email, password_hash, created_at FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const user = await db.get(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};