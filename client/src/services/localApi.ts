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


// 本地存储键名
const STORAGE_KEYS = {
  USER: 'thinking_tool_user',
  TOKEN: 'thinking_tool_token',
  QUESTIONS: 'thinking_tool_questions',
  THOUGHTS: 'thinking_tool_thoughts',
};

// 初始化默认数据
const initializeDefaultData = () => {
  // 检查是否需要扩展问题库
  const existingQuestions = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
  
  if (existingQuestions.length === 0) {
    // 全新用户，添加完整的默认问题库
    const defaultQuestions: Question[] = [
      // 日常思考类
      {
        id: uuidv4(),
        title: "今天最让你印象深刻的事情是什么？",
        description: "可以是一个人、一件事、一个想法，或者任何触动你的瞬间。",
        category: "日常思考",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "今天你做了什么让自己感到骄傲的事情？",
        description: "无论大小，回顾一下你今天的成就和进步。",
        category: "日常思考",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "你今天遇到的最大挑战是什么，你是如何应对的？",
        description: "思考一下困难时刻和你的解决方案。",
        category: "日常思考",
        createdAt: new Date().toISOString()
      },
      
      // 价值观类
      {
        id: uuidv4(),
        title: "如果你可以改变世界上的一件事，你会选择什么？",
        description: "思考一下你认为最重要的社会、环境或个人问题。",
        category: "价值观",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "什么是你生活中最重要的三个价值观？",
        description: "想想什么原则指导着你的决定和行为。",
        category: "价值观",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "你认为什么样的人生才算有意义？",
        description: "思考一下你对人生意义和目的的理解。",
        category: "价值观",
        createdAt: new Date().toISOString()
      },
      
      // 生活愿景类
      {
        id: uuidv4(),
        title: "描述一下你理想中的一天是什么样的？",
        description: "从早晨醒来到晚上入睡，你希望如何度过完美的一天？",
        category: "生活愿景",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "5年后你希望自己变成什么样的人？",
        description: "想象一下未来的你，包括性格、技能、生活状态等。",
        category: "生活愿景",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "如果金钱不是问题，你最想做什么？",
        description: "去除经济限制，思考你真正的兴趣和梦想。",
        category: "生活愿景",
        createdAt: new Date().toISOString()
      },
      
      // 学习成长类
      {
        id: uuidv4(),
        title: "你最近学到的最有价值的一课是什么？",
        description: "可以是从经历、书籍、他人或任何地方学到的。",
        category: "学习成长",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "你想要培养的下一个技能或习惯是什么？",
        description: "思考一下你想要改进或学习的新东西。",
        category: "学习成长",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "最近有什么事情让你走出了舒适圈？",
        description: "回顾一下那些挑战你、让你成长的经历。",
        category: "学习成长",
        createdAt: new Date().toISOString()
      },
      
      // 感恩类
      {
        id: uuidv4(),
        title: "现在最让你感激的三件事是什么？",
        description: "可以是大事也可以是小事，重要的是它们带给你的感受。",
        category: "感恩",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "今天有哪个人让你的生活变得更美好？",
        description: "想想那些给你带来正面影响的人。",
        category: "感恩",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "你拥有的哪些看似平凡的东西其实很珍贵？",
        description: "重新审视那些容易被忽视的美好。",
        category: "感恩",
        createdAt: new Date().toISOString()
      },
      
      // 人际关系类
      {
        id: uuidv4(),
        title: "描述一个对你很重要的人，以及他们为什么特别？",
        description: "思考一下那些在你生命中留下深刻印记的人。",
        category: "人际关系",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "你希望别人如何记住你？",
        description: "想想你想在他人心中留下什么样的印象。",
        category: "人际关系",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "最近你有没有主动关心或帮助过别人？",
        description: "回顾一下你的善举和对他人的影响。",
        category: "人际关系",
        createdAt: new Date().toISOString()
      },
      
      // 创造力类
      {
        id: uuidv4(),
        title: "如果你要写一本书，会是关于什么的？",
        description: "发挥想象力，思考你想要分享的故事或知识。",
        category: "创造力",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "用三个词描述今天的心情，并解释为什么？",
        description: "练习情感表达和自我觉察。",
        category: "创造力",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "如果你能发明一样东西来改善人们的生活，会是什么？",
        description: "发挥创造力，思考解决问题的新方法。",
        category: "创造力",
        createdAt: new Date().toISOString()
      },
      
      // 早安日记类
      {
        id: uuidv4(),
        title: "今天早晨醒来时的第一个想法是什么？",
        description: "记录清晨第一缕思绪，观察内心的声音。",
        category: "早安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "今天你最期待的一件事是什么？",
        description: "想想今天有什么让你充满期待和兴奋的事情。",
        category: "早安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "如果今天只能完成三件事，你会选择哪三件？",
        description: "思考今天的优先级，明确最重要的任务。",
        category: "早安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "今天你想给自己设定什么样的心情基调？",
        description: "主动选择今天的情绪状态和精神面貌。",
        category: "早安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "昨晚的梦境中有什么特别的画面吗？",
        description: "回顾梦境，探索潜意识的信息。",
        category: "早安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "今天你想要学习或尝试什么新的东西？",
        description: "为今天设定一个小小的成长目标。",
        category: "早安日记",
        createdAt: new Date().toISOString()
      },
      
      // 晚安日记类
      {
        id: uuidv4(),
        title: "今天最让你感到满足的时刻是什么？",
        description: "回顾今天，找到那个让你内心充实的瞬间。",
        category: "晚安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "今天你克服了什么困难或挑战？",
        description: "认可自己今天的努力和成长。",
        category: "晚安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "今天有什么事情让你感到意外或惊喜？",
        description: "发现生活中的小惊喜和美好瞬间。",
        category: "晚安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "如果可以重新来过，今天你会做什么不同的选择？",
        description: "反思今天的决定，为明天积累智慧。",
        category: "晚安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "今天你感谢生活中的哪个人或事？",
        description: "在一天结束时表达感恩之心。",
        category: "晚安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "明天你最想做的一件事是什么？",
        description: "带着期待和计划进入梦乡。",
        category: "晚安日记",
        createdAt: new Date().toISOString()
      },
      
      // 反思类
      {
        id: uuidv4(),
        title: "你觉得自己最大的优点和最需要改进的地方是什么？",
        description: "诚实地评估自己的长处和成长空间。",
        category: "自我反思",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "如果可以给一年前的自己一个建议，会是什么？",
        description: "回顾过去，总结经验和教训。",
        category: "自我反思",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "什么时候你感到最像真正的自己？",
        description: "思考那些让你感到真实和自在的时刻。",
        category: "自我反思",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(defaultQuestions));
  } else if (existingQuestions.length <= 15) {
    // 如果问题数量较少，说明是老用户，扩展问题库但保留现有数据
    const additionalQuestions: Question[] = [
      // 添加更多问题但保留现有的思考历史
      {
        id: uuidv4(),
        title: "今天你做了什么让自己感到骄傲的事情？",
        description: "无论大小，回顾一下你今天的成就和进步。",
        category: "日常思考",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "你今天遇到的最大挑战是什么，你是如何应对的？",
        description: "思考一下困难时刻和你的解决方案。",
        category: "日常思考",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "什么是你生活中最重要的三个价值观？",
        description: "想想什么原则指导着你的决定和行为。",
        category: "价值观",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "5年后你希望自己变成什么样的人？",
        description: "想象一下未来的你，包括性格、技能、生活状态等。",
        category: "生活愿景",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "你想要培养的下一个技能或习惯是什么？",
        description: "思考一下你想要改进或学习的新东西。",
        category: "学习成长",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "今天有哪个人让你的生活变得更美好？",
        description: "想想那些给你带来正面影响的人。",
        category: "感恩",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "描述一个对你很重要的人，以及他们为什么特别？",
        description: "思考一下那些在你生命中留下深刻印记的人。",
        category: "人际关系",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "如果你要写一本书，会是关于什么的？",
        description: "发挥想象力，思考你想要分享的故事或知识。",
        category: "创造力",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "你觉得自己最大的优点和最需要改进的地方是什么？",
        description: "诚实地评估自己的长处和成长空间。",
        category: "自我反思",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "什么时候你感到最像真正的自己？",
        description: "思考那些让你感到真实和自在的时刻。",
        category: "自我反思",
        createdAt: new Date().toISOString()
      },
      
      // 早安日记类
      {
        id: uuidv4(),
        title: "今天早晨醒来时的第一个想法是什么？",
        description: "记录清晨第一缕思绪，观察内心的声音。",
        category: "早安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "今天你最期待的一件事是什么？",
        description: "想想今天有什么让你充满期待和兴奋的事情。",
        category: "早安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "如果今天只能完成三件事，你会选择哪三件？",
        description: "思考今天的优先级，明确最重要的任务。",
        category: "早安日记",
        createdAt: new Date().toISOString()
      },
      
      // 晚安日记类
      {
        id: uuidv4(),
        title: "今天最让你感到满足的时刻是什么？",
        description: "回顾今天，找到那个让你内心充实的瞬间。",
        category: "晚安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "今天你克服了什么困难或挑战？",
        description: "认可自己今天的努力和成长。",
        category: "晚安日记",
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "今天有什么事情让你感到意外或惊喜？",
        description: "发现生活中的小惊喜和美好瞬间。",
        category: "晚安日记",
        createdAt: new Date().toISOString()
      }
    ];
    
    // 合并现有和新增的问题
    const allQuestions = [...existingQuestions, ...additionalQuestions];
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(allQuestions));
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