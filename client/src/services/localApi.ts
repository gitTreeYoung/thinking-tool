// 本地存储模拟API，用于静态部署
import { v4 as uuidv4 } from 'uuid';

// 接口定义
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface Question {
  id: string;
  title: string;
  description?: string;
  category?: string;
  createdAt: string;
}

interface ThoughtEntry {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface QuestionSeries {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  questionCount: number;
  createdAt: string;
}

interface SeriesQuestion {
  id: string;
  seriesId: string;
  questionId: string;
  orderIndex: number;
  question: Question;
}

// 本地存储键名
const STORAGE_KEYS = {
  USER: 'thinking_tool_user',
  TOKEN: 'thinking_tool_token',
  QUESTIONS: 'thinking_tool_questions',
  THOUGHTS: 'thinking_tool_thoughts',
  SERIES: 'thinking_tool_series',
  SERIES_QUESTIONS: 'thinking_tool_series_questions',
};

// 初始化默认数据
const initializeDefaultData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
    const defaultQuestions: Question[] = [
      {
        id: uuidv4(),
        title: "今天最让你印象深刻的事情是什么？",
        description: "可以是一个人、一件事、一个想法，或者任何触动你的瞬间。",
        category: "日常思考",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "如果你可以改变世界上的一件事，你会选择什么？",
        description: "思考一下你认为最重要的社会、环境或个人问题。",
        category: "价值观",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "描述一下你理想中的一天是什么样的？",
        description: "从早晨醒来到晚上入睡，你希望如何度过完美的一天？",
        category: "生活愿景",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "你最近学到的最有价值的一课是什么？",
        description: "可以是从经历、书籍、他人或任何地方学到的。",
        category: "学习成长",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "现在最让你感激的三件事是什么？",
        description: "可以是大事也可以是小事，重要的是它们带给你的感受。",
        category: "感恩",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(defaultQuestions));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SERIES)) {
    const questionsList = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
    const defaultSeries: QuestionSeries[] = [
      {
        id: uuidv4(),
        name: "早安日记",
        description: "用积极的心态开始新的一天",
        icon: "☀️",
        color: "#f59e0b",
        questionCount: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: "晚安日记",
        description: "回顾今天，准备迎接明天",
        icon: "🌙",
        color: "#4f46e5",
        questionCount: 2,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(defaultSeries));

    // 创建系列问题关联
    if (questionsList.length >= 4) {
      const seriesQuestions: SeriesQuestion[] = [
        {
          id: uuidv4(),
          seriesId: defaultSeries[0].id,
          questionId: questionsList[0].id,
          orderIndex: 1,
          question: questionsList[0]
        },
        {
          id: uuidv4(),
          seriesId: defaultSeries[0].id,
          questionId: questionsList[3].id,
          orderIndex: 2,
          question: questionsList[3]
        },
        {
          id: uuidv4(),
          seriesId: defaultSeries[1].id,
          questionId: questionsList[1].id,
          orderIndex: 1,
          question: questionsList[1]
        },
        {
          id: uuidv4(),
          seriesId: defaultSeries[1].id,
          questionId: questionsList[4].id,
          orderIndex: 2,
          question: questionsList[4]
        }
      ];
      localStorage.setItem(STORAGE_KEYS.SERIES_QUESTIONS, JSON.stringify(seriesQuestions));
    }
  }
};

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 获取当前用户
const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER);
  return userData ? JSON.parse(userData) : null;
};

// API 实现
export const localAuthAPI = {
  login: async (data: { username: string; password: string }) => {
    await delay(500);
    
    // 简单的用户验证（实际使用中应该有更安全的方式）
    if (data.username && data.password) {
      const user: User = {
        id: uuidv4(),
        username: data.username,
        email: `${data.username}@thinking-tool.local`,
        createdAt: new Date().toISOString()
      };
      
      const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 24 * 60 * 60 * 1000 }));
      
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      return { user, token };
    } else {
      throw new Error('用户名或密码错误');
    }
  },

  register: async (data: { username: string; email: string; password: string }) => {
    await delay(500);
    
    if (data.username && data.email && data.password) {
      const user: User = {
        id: uuidv4(),
        username: data.username,
        email: data.email,
        createdAt: new Date().toISOString()
      };
      
      const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 24 * 60 * 60 * 1000 }));
      
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      return { user, token };
    } else {
      throw new Error('注册信息不完整');
    }
  },

  me: async () => {
    await delay(200);
    const user = getCurrentUser();
    if (!user) throw new Error('未登录');
    return user;
  }
};

export const localQuestionsAPI = {
  getAll: async (): Promise<Question[]> => {
    await delay(300);
    initializeDefaultData();
    const questions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return questions ? JSON.parse(questions) : [];
  },

  getById: async (id: string): Promise<Question> => {
    await delay(200);
    const questions = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
    const question = questions.find((q: Question) => q.id === id);
    if (!question) throw new Error('问题不存在');
    return question;
  }
};

export const localThoughtsAPI = {
  getByQuestion: async (questionId: string): Promise<ThoughtEntry[]> => {
    await delay(200);
    const thoughts = JSON.parse(localStorage.getItem(STORAGE_KEYS.THOUGHTS) || '[]');
    return thoughts.filter((t: ThoughtEntry) => t.questionId === questionId);
  },

  create: async (data: { questionId: string; content: string }): Promise<ThoughtEntry> => {
    await delay(300);
    const user = getCurrentUser();
    if (!user) throw new Error('未登录');

    const thought: ThoughtEntry = {
      id: uuidv4(),
      questionId: data.questionId,
      userId: user.id,
      content: data.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const thoughts = JSON.parse(localStorage.getItem(STORAGE_KEYS.THOUGHTS) || '[]');
    thoughts.unshift(thought);
    localStorage.setItem(STORAGE_KEYS.THOUGHTS, JSON.stringify(thoughts));

    return thought;
  },

  update: async (id: string, content: string): Promise<ThoughtEntry> => {
    await delay(300);
    const thoughts = JSON.parse(localStorage.getItem(STORAGE_KEYS.THOUGHTS) || '[]');
    const index = thoughts.findIndex((t: ThoughtEntry) => t.id === id);
    
    if (index === -1) throw new Error('思考记录不存在');
    
    thoughts[index].content = content;
    thoughts[index].updatedAt = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEYS.THOUGHTS, JSON.stringify(thoughts));
    return thoughts[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(200);
    const thoughts = JSON.parse(localStorage.getItem(STORAGE_KEYS.THOUGHTS) || '[]');
    const filtered = thoughts.filter((t: ThoughtEntry) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.THOUGHTS, JSON.stringify(filtered));
  }
};

export const localSeriesAPI = {
  getAll: async (): Promise<QuestionSeries[]> => {
    await delay(300);
    initializeDefaultData();
    const series = localStorage.getItem(STORAGE_KEYS.SERIES);
    return series ? JSON.parse(series) : [];
  },

  getById: async (id: string): Promise<QuestionSeries> => {
    await delay(200);
    const series = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIES) || '[]');
    const item = series.find((s: QuestionSeries) => s.id === id);
    if (!item) throw new Error('系列不存在');
    return item;
  },

  getQuestions: async (id: string): Promise<SeriesQuestion[]> => {
    await delay(200);
    const seriesQuestions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIES_QUESTIONS) || '[]');
    return seriesQuestions.filter((sq: SeriesQuestion) => sq.seriesId === id);
  },

  create: async (data: { name: string; description?: string; icon?: string; color?: string }): Promise<QuestionSeries> => {
    await delay(300);
    const newSeries: QuestionSeries = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      questionCount: 0,
      createdAt: new Date().toISOString()
    };

    const series = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIES) || '[]');
    series.push(newSeries);
    localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(series));

    return newSeries;
  },

  update: async (id: string, data: { name?: string; description?: string; icon?: string; color?: string }): Promise<QuestionSeries> => {
    await delay(300);
    const series = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIES) || '[]');
    const index = series.findIndex((s: QuestionSeries) => s.id === id);
    
    if (index === -1) throw new Error('系列不存在');
    
    series[index] = { ...series[index], ...data };
    localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(series));
    return series[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(200);
    const series = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIES) || '[]');
    const filtered = series.filter((s: QuestionSeries) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(filtered));

    // 同时删除相关的系列问题
    const seriesQuestions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIES_QUESTIONS) || '[]');
    const filteredQuestions = seriesQuestions.filter((sq: SeriesQuestion) => sq.seriesId !== id);
    localStorage.setItem(STORAGE_KEYS.SERIES_QUESTIONS, JSON.stringify(filteredQuestions));
  },

  addQuestion: async (seriesId: string, data: { questionId: string; orderIndex?: number }): Promise<SeriesQuestion> => {
    await delay(300);
    const questions = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
    const question = questions.find((q: Question) => q.id === data.questionId);
    
    if (!question) throw new Error('问题不存在');

    const seriesQuestions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIES_QUESTIONS) || '[]');
    const maxOrder = Math.max(0, ...seriesQuestions.filter((sq: SeriesQuestion) => sq.seriesId === seriesId).map((sq: SeriesQuestion) => sq.orderIndex));
    
    const newSeriesQuestion: SeriesQuestion = {
      id: uuidv4(),
      seriesId,
      questionId: data.questionId,
      orderIndex: data.orderIndex || maxOrder + 1,
      question
    };

    seriesQuestions.push(newSeriesQuestion);
    localStorage.setItem(STORAGE_KEYS.SERIES_QUESTIONS, JSON.stringify(seriesQuestions));

    // 更新系列的问题数量
    const series = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIES) || '[]');
    const seriesIndex = series.findIndex((s: QuestionSeries) => s.id === seriesId);
    if (seriesIndex !== -1) {
      series[seriesIndex].questionCount = seriesQuestions.filter((sq: SeriesQuestion) => sq.seriesId === seriesId).length;
      localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(series));
    }

    return newSeriesQuestion;
  },

  removeQuestion: async (seriesId: string, questionId: string): Promise<void> => {
    await delay(200);
    const seriesQuestions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIES_QUESTIONS) || '[]');
    const filtered = seriesQuestions.filter((sq: SeriesQuestion) => !(sq.seriesId === seriesId && sq.question.id === questionId));
    localStorage.setItem(STORAGE_KEYS.SERIES_QUESTIONS, JSON.stringify(filtered));

    // 更新系列的问题数量
    const series = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIES) || '[]');
    const seriesIndex = series.findIndex((s: QuestionSeries) => s.id === seriesId);
    if (seriesIndex !== -1) {
      series[seriesIndex].questionCount = filtered.filter((sq: SeriesQuestion) => sq.seriesId === seriesId).length;
      localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(series));
    }
  },

  updateQuestion: async (_seriesId: string, seriesQuestionId: string, data: { questionId?: string; orderIndex?: number }): Promise<SeriesQuestion> => {
    await delay(300);
    const seriesQuestions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIES_QUESTIONS) || '[]');
    const index = seriesQuestions.findIndex((sq: SeriesQuestion) => sq.id === seriesQuestionId);
    
    if (index === -1) throw new Error('系列问题不存在');

    if (data.questionId) {
      const questions = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
      const question = questions.find((q: Question) => q.id === data.questionId);
      if (!question) throw new Error('问题不存在');
      seriesQuestions[index].question = question;
      seriesQuestions[index].questionId = data.questionId;
    }

    if (data.orderIndex) {
      seriesQuestions[index].orderIndex = data.orderIndex;
    }

    localStorage.setItem(STORAGE_KEYS.SERIES_QUESTIONS, JSON.stringify(seriesQuestions));
    return seriesQuestions[index];
  }
};

export const localAdminAPI = {
  createQuestion: async (data: { title: string; description?: string; category?: string }): Promise<Question> => {
    await delay(300);
    const newQuestion: Question = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      category: data.category,
      createdAt: new Date().toISOString()
    };

    const questions = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
    questions.push(newQuestion);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));

    return newQuestion;
  },

  updateQuestion: async (id: string, data: { title?: string; description?: string; category?: string }): Promise<Question> => {
    await delay(300);
    const questions = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
    const index = questions.findIndex((q: Question) => q.id === id);
    
    if (index === -1) throw new Error('问题不存在');
    
    questions[index] = { ...questions[index], ...data };
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    return questions[index];
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await delay(200);
    const questions = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
    const filtered = questions.filter((q: Question) => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(filtered));

    // 同时删除相关的思考记录
    const thoughts = JSON.parse(localStorage.getItem(STORAGE_KEYS.THOUGHTS) || '[]');
    const filteredThoughts = thoughts.filter((t: ThoughtEntry) => t.questionId !== id);
    localStorage.setItem(STORAGE_KEYS.THOUGHTS, JSON.stringify(filteredThoughts));
  },

  batchImportQuestions: async (questions: Array<{ title: string; description?: string; category?: string }>) => {
    await delay(500);
    const existingQuestions = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
    
    const newQuestions = questions.map(q => ({
      id: uuidv4(),
      title: q.title,
      description: q.description,
      category: q.category,
      createdAt: new Date().toISOString()
    }));

    existingQuestions.push(...newQuestions);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(existingQuestions));

    return { message: `成功导入 ${newQuestions.length} 个问题` };
  },

  generateQuestionsWithAI: async () => {
    await delay(1000);
    // 模拟AI生成（实际部署时这个功能不可用）
    throw new Error('AI生成功能在静态部署中不可用');
  }
};