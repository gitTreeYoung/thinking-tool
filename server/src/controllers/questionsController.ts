import { Response } from 'express';
import { getDatabase } from '../database/database';
import { AuthRequest } from '../middleware/auth';
import { Question } from '../types';

export const getAllQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const questions = await db.all(
      'SELECT id, title, description, category, created_at FROM questions ORDER BY created_at ASC'
    );

    const formattedQuestions: Question[] = questions.map((q: any) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      createdAt: q.created_at
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getQuestionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const question = await db.get(
      'SELECT id, title, description, category, created_at FROM questions WHERE id = ?',
      [id]
    );

    if (!question) {
      return res.status(404).json({ message: '问题不存在' });
    }

    res.json({
      id: question.id,
      title: question.title,
      description: question.description,
      category: question.category,
      createdAt: question.created_at
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};