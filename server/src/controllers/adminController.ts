import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/database';
import { AuthRequest } from '../middleware/auth';

interface CreateQuestionRequest {
  title: string;
  description?: string;
  category?: string;
}

interface UpdateQuestionRequest {
  title?: string;
  description?: string;
  category?: string;
}

interface BatchImportRequest {
  questions: CreateQuestionRequest[];
}

interface AIGenerateRequest {
  baseUrl: string;
  apiKey: string;
  modelName: string;
  prompt: string;
  count: number;
}

export const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category }: CreateQuestionRequest = req.body;

    if (!title) {
      return res.status(400).json({ message: '问题标题不能为空' });
    }

    const db = getDatabase();
    const questionId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO questions (id, title, description, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [questionId, title, description || null, category || null, now, now]
    );

    const newQuestion = await db.get(
      'SELECT id, title, description, category, created_at FROM questions WHERE id = ?',
      [questionId]
    );

    res.status(201).json({
      id: newQuestion.id,
      title: newQuestion.title,
      description: newQuestion.description,
      category: newQuestion.category,
      createdAt: newQuestion.created_at
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, category }: UpdateQuestionRequest = req.body;

    const db = getDatabase();
    
    const existingQuestion = await db.get('SELECT id FROM questions WHERE id = ?', [id]);
    if (!existingQuestion) {
      return res.status(404).json({ message: '问题不存在' });
    }

    const now = new Date().toISOString();
    await db.run(
      'UPDATE questions SET title = COALESCE(?, title), description = COALESCE(?, description), category = COALESCE(?, category), updated_at = ? WHERE id = ?',
      [title, description, category, now, id]
    );

    const updatedQuestion = await db.get(
      'SELECT id, title, description, category, created_at, updated_at FROM questions WHERE id = ?',
      [id]
    );

    res.json({
      id: updatedQuestion.id,
      title: updatedQuestion.title,
      description: updatedQuestion.description,
      category: updatedQuestion.category,
      createdAt: updatedQuestion.created_at,
      updatedAt: updatedQuestion.updated_at
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const db = getDatabase();
    
    const existingQuestion = await db.get('SELECT id FROM questions WHERE id = ?', [id]);
    if (!existingQuestion) {
      return res.status(404).json({ message: '问题不存在' });
    }

    // 删除相关的思考记录
    await db.run('DELETE FROM thought_entries WHERE question_id = ?', [id]);
    
    // 删除问题
    await db.run('DELETE FROM questions WHERE id = ?', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const batchImportQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { questions }: BatchImportRequest = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: '请提供有效的问题列表' });
    }

    const db = getDatabase();
    const now = new Date().toISOString();
    const createdQuestions = [];

    for (const question of questions) {
      if (!question.title?.trim()) continue;

      const questionId = uuidv4();
      await db.run(
        'INSERT INTO questions (id, title, description, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [questionId, question.title.trim(), question.description || null, question.category || null, now, now]
      );

      createdQuestions.push({
        id: questionId,
        title: question.title.trim(),
        description: question.description,
        category: question.category,
        createdAt: now
      });
    }

    res.json({
      message: `成功导入 ${createdQuestions.length} 个问题`,
      questions: createdQuestions
    });
  } catch (error) {
    console.error('Batch import error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const generateQuestionsWithAI = async (req: AuthRequest, res: Response) => {
  try {
    const { baseUrl, apiKey, modelName, prompt, count }: AIGenerateRequest = req.body;

    if (!baseUrl || !apiKey || !modelName || !prompt || !count) {
      return res.status(400).json({ message: '请提供所有必需的AI配置参数' });
    }

    // 调用OpenAI兼容的API
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的思考问题生成助手。请根据用户的要求生成高质量的思考问题。每个问题应该包含：标题、描述、分类。请以JSON格式返回，格式为：[{"title": "问题标题", "description": "问题描述", "category": "分类"}]'
          },
          {
            role: 'user',
            content: `${prompt}\n\n请生成${count}个思考问题，以JSON数组格式返回。`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`AI API调用失败: ${response.status} ${response.statusText}`);
    }

    const aiResult: any = await response.json();
    const aiContent = aiResult.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('AI返回内容为空');
    }

    // 尝试解析AI返回的JSON
    let generatedQuestions;
    try {
      // 提取JSON部分（可能包含其他文本）
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        generatedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        generatedQuestions = JSON.parse(aiContent);
      }
    } catch (parseError) {
      // 如果解析失败，尝试简单的文本解析
      const lines = aiContent.split('\n').filter((line: string) => line.trim());
      generatedQuestions = lines.map((line: string, index: number) => ({
        title: line.replace(/^\d+\.\s*/, '').trim(),
        description: '由AI生成的思考问题',
        category: 'AI生成'
      }));
    }

    if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
      throw new Error('AI生成的内容格式不正确');
    }

    // 保存到数据库
    const db = getDatabase();
    const now = new Date().toISOString();
    const createdQuestions = [];

    for (const question of generatedQuestions) {
      if (!question.title?.trim()) continue;

      const questionId = uuidv4();
      await db.run(
        'INSERT INTO questions (id, title, description, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          questionId, 
          question.title.trim(), 
          question.description || '由AI生成的思考问题', 
          question.category || 'AI生成', 
          now, 
          now
        ]
      );

      createdQuestions.push({
        id: questionId,
        title: question.title.trim(),
        description: question.description || '由AI生成的思考问题',
        category: question.category || 'AI生成',
        createdAt: now
      });
    }

    res.json({
      message: `成功生成并导入 ${createdQuestions.length} 个问题`,
      questions: createdQuestions,
      aiResponse: aiContent
    });
  } catch (error) {
    console.error('AI generate error:', error);
    res.status(500).json({ 
      message: 'AI生成失败', 
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};