import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/database';
import { AuthRequest } from '../middleware/auth';
import { ThoughtEntry, CreateThoughtRequest } from '../types';

export const getThoughtsByQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { questionId } = req.params;
    const userId = req.userId;

    const db = getDatabase();
    const thoughts = await db.all(
      `SELECT id, question_id, user_id, content, created_at, updated_at 
       FROM thought_entries 
       WHERE question_id = ? AND user_id = ? 
       ORDER BY updated_at DESC`,
      [questionId, userId]
    );

    const formattedThoughts: ThoughtEntry[] = thoughts.map((t: any) => ({
      id: t.id,
      questionId: t.question_id,
      userId: t.user_id,
      content: t.content,
      createdAt: t.created_at,
      updatedAt: t.updated_at
    }));

    res.json(formattedThoughts);
  } catch (error) {
    console.error('Get thoughts error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const createThought = async (req: AuthRequest, res: Response) => {
  try {
    const { questionId, content }: CreateThoughtRequest = req.body;
    const userId = req.userId!;

    if (!questionId || !content) {
      return res.status(400).json({ message: '问题ID和内容不能为空' });
    }

    const db = getDatabase();
    
    const question = await db.get('SELECT id FROM questions WHERE id = ?', [questionId]);
    if (!question) {
      return res.status(404).json({ message: '问题不存在' });
    }

    const thoughtId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO thought_entries (id, question_id, user_id, content, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [thoughtId, questionId, userId, content, now, now]
    );

    const newThought = await db.get(
      'SELECT id, question_id, user_id, content, created_at, updated_at FROM thought_entries WHERE id = ?',
      [thoughtId]
    );

    res.status(201).json({
      id: newThought.id,
      questionId: newThought.question_id,
      userId: newThought.user_id,
      content: newThought.content,
      createdAt: newThought.created_at,
      updatedAt: newThought.updated_at
    });
  } catch (error) {
    console.error('Create thought error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateThought = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId!;

    if (!content) {
      return res.status(400).json({ message: '内容不能为空' });
    }

    const db = getDatabase();
    
    const existingThought = await db.get(
      'SELECT id FROM thought_entries WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!existingThought) {
      return res.status(404).json({ message: '思考记录不存在或无权限' });
    }

    const now = new Date().toISOString();
    await db.run(
      'UPDATE thought_entries SET content = ?, updated_at = ? WHERE id = ?',
      [content, now, id]
    );

    const updatedThought = await db.get(
      'SELECT id, question_id, user_id, content, created_at, updated_at FROM thought_entries WHERE id = ?',
      [id]
    );

    res.json({
      id: updatedThought.id,
      questionId: updatedThought.question_id,
      userId: updatedThought.user_id,
      content: updatedThought.content,
      createdAt: updatedThought.created_at,
      updatedAt: updatedThought.updated_at
    });
  } catch (error) {
    console.error('Update thought error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const deleteThought = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const db = getDatabase();
    
    const existingThought = await db.get(
      'SELECT id FROM thought_entries WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!existingThought) {
      return res.status(404).json({ message: '思考记录不存在或无权限' });
    }

    await db.run('DELETE FROM thought_entries WHERE id = ?', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Delete thought error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};