import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/database';
import { AuthRequest } from '../middleware/auth';

interface QuestionSeries {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  questionCount?: number;
}

interface SeriesQuestion {
  id: string;
  seriesId: string;
  questionId: string;
  orderIndex: number;
  question: {
    id: string;
    title: string;
    description?: string;
    category?: string;
  };
}

export const getAllSeries = async (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const series = await db.all(`
      SELECT 
        qs.*,
        COUNT(sq.question_id) as question_count
      FROM question_series qs 
      LEFT JOIN series_questions sq ON qs.id = sq.series_id 
      GROUP BY qs.id 
      ORDER BY qs.created_at ASC
    `);

    const formattedSeries = series.map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
      color: s.color,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
      questionCount: s.question_count
    }));

    res.json(formattedSeries);
  } catch (error) {
    console.error('Get series error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getSeriesById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const series = await db.get(`
      SELECT * FROM question_series WHERE id = ?
    `, [id]);

    if (!series) {
      return res.status(404).json({ message: '系列不存在' });
    }

    res.json({
      id: series.id,
      name: series.name,
      description: series.description,
      icon: series.icon,
      color: series.color,
      createdAt: series.created_at,
      updatedAt: series.updated_at
    });
  } catch (error) {
    console.error('Get series error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getSeriesQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const questions = await db.all(`
      SELECT 
        sq.id as series_question_id,
        sq.series_id,
        sq.question_id,
        sq.order_index,
        q.id,
        q.title,
        q.description,
        q.category,
        q.created_at
      FROM series_questions sq
      JOIN questions q ON sq.question_id = q.id
      WHERE sq.series_id = ?
      ORDER BY sq.order_index ASC
    `, [id]);

    const formattedQuestions = questions.map((q: any) => ({
      id: q.series_question_id,
      seriesId: q.series_id,
      questionId: q.question_id,
      orderIndex: q.order_index,
      question: {
        id: q.id,
        title: q.title,
        description: q.description,
        category: q.category,
        createdAt: q.created_at
      }
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Get series questions error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const createSeries = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: '系列名称不能为空' });
    }

    const db = getDatabase();
    const seriesId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO question_series (id, name, description, icon, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [seriesId, name, description || null, icon || null, color || null, now, now]
    );

    const newSeries = await db.get(
      'SELECT * FROM question_series WHERE id = ?',
      [seriesId]
    );

    res.status(201).json({
      id: newSeries.id,
      name: newSeries.name,
      description: newSeries.description,
      icon: newSeries.icon,
      color: newSeries.color,
      createdAt: newSeries.created_at,
      updatedAt: newSeries.updated_at
    });
  } catch (error) {
    console.error('Create series error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateSeries = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color } = req.body;

    const db = getDatabase();
    
    const existingSeries = await db.get('SELECT id FROM question_series WHERE id = ?', [id]);
    if (!existingSeries) {
      return res.status(404).json({ message: '系列不存在' });
    }

    const now = new Date().toISOString();
    await db.run(
      'UPDATE question_series SET name = COALESCE(?, name), description = COALESCE(?, description), icon = COALESCE(?, icon), color = COALESCE(?, color), updated_at = ? WHERE id = ?',
      [name, description, icon, color, now, id]
    );

    const updatedSeries = await db.get(
      'SELECT * FROM question_series WHERE id = ?',
      [id]
    );

    res.json({
      id: updatedSeries.id,
      name: updatedSeries.name,
      description: updatedSeries.description,
      icon: updatedSeries.icon,
      color: updatedSeries.color,
      createdAt: updatedSeries.created_at,
      updatedAt: updatedSeries.updated_at
    });
  } catch (error) {
    console.error('Update series error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const deleteSeries = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const db = getDatabase();
    
    const existingSeries = await db.get('SELECT id FROM question_series WHERE id = ?', [id]);
    if (!existingSeries) {
      return res.status(404).json({ message: '系列不存在' });
    }

    // 删除系列问题关联
    await db.run('DELETE FROM series_questions WHERE series_id = ?', [id]);
    
    // 删除系列
    await db.run('DELETE FROM question_series WHERE id = ?', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Delete series error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const addQuestionToSeries = async (req: AuthRequest, res: Response) => {
  try {
    const { seriesId } = req.params;
    const { questionId, orderIndex } = req.body;

    if (!questionId) {
      return res.status(400).json({ message: '问题ID不能为空' });
    }

    const db = getDatabase();
    
    // 检查系列是否存在
    const series = await db.get('SELECT id FROM question_series WHERE id = ?', [seriesId]);
    if (!series) {
      return res.status(404).json({ message: '系列不存在' });
    }

    // 检查问题是否存在
    const question = await db.get('SELECT id FROM questions WHERE id = ?', [questionId]);
    if (!question) {
      return res.status(404).json({ message: '问题不存在' });
    }

    // 如果没有指定顺序，则添加到最后
    let finalOrderIndex = orderIndex;
    if (!finalOrderIndex) {
      const maxOrder = await db.get(
        'SELECT MAX(order_index) as max_order FROM series_questions WHERE series_id = ?',
        [seriesId]
      );
      finalOrderIndex = (maxOrder.max_order || 0) + 1;
    }

    const relationId = uuidv4();
    await db.run(
      'INSERT INTO series_questions (id, series_id, question_id, order_index) VALUES (?, ?, ?, ?)',
      [relationId, seriesId, questionId, finalOrderIndex]
    );

    res.status(201).json({
      id: relationId,
      seriesId,
      questionId,
      orderIndex: finalOrderIndex
    });
  } catch (error) {
    console.error('Add question to series error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const removeQuestionFromSeries = async (req: AuthRequest, res: Response) => {
  try {
    const { seriesId, questionId } = req.params;

    const db = getDatabase();
    
    const relation = await db.get(
      'SELECT id FROM series_questions WHERE series_id = ? AND question_id = ?',
      [seriesId, questionId]
    );

    if (!relation) {
      return res.status(404).json({ message: '关联不存在' });
    }

    await db.run(
      'DELETE FROM series_questions WHERE series_id = ? AND question_id = ?',
      [seriesId, questionId]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Remove question from series error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateQuestionOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { seriesId } = req.params;
    const { questionOrders } = req.body; // [{ questionId, orderIndex }]

    if (!Array.isArray(questionOrders)) {
      return res.status(400).json({ message: '问题顺序数据格式错误' });
    }

    const db = getDatabase();
    
    // 批量更新顺序
    for (const { questionId, orderIndex } of questionOrders) {
      await db.run(
        'UPDATE series_questions SET order_index = ? WHERE series_id = ? AND question_id = ?',
        [orderIndex, seriesId, questionId]
      );
    }

    res.json({ message: '顺序更新成功' });
  } catch (error) {
    console.error('Update question order error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};