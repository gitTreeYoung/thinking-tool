import { initDatabase } from './database';

const createTables = async () => {
  const db = await initDatabase();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS thought_entries (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_thought_entries_question_user 
    ON thought_entries (question_id, user_id);
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_thought_entries_user 
    ON thought_entries (user_id);
  `);

  console.log('Database tables created successfully');

  await seedData(db);
};

const seedData = async (db: any) => {
  const existingQuestions = await db.get('SELECT COUNT(*) as count FROM questions');
  
  if (existingQuestions.count === 0) {
    const sampleQuestions = [
      {
        id: 'q1',
        title: '今天最让你印象深刻的事情是什么？',
        description: '可以是一个人、一件事、一个想法，或者任何触动你的瞬间。',
        category: '日常思考'
      },
      {
        id: 'q2',
        title: '如果你可以改变世界上的一件事，你会选择什么？',
        description: '思考一下你认为最重要的社会、环境或个人问题。',
        category: '价值观'
      },
      {
        id: 'q3',
        title: '描述一下你理想中的一天是什么样的？',
        description: '从早晨醒来到晚上入睡，你希望如何度过完美的一天？',
        category: '生活愿景'
      },
      {
        id: 'q4',
        title: '最近你学到了什么新东西？',
        description: '可以是技能、知识、对自己或他人的理解等。',
        category: '学习成长'
      },
      {
        id: 'q5',
        title: '你最感激的三件事是什么？',
        description: '花些时间思考生活中值得感恩的事物。',
        category: '感恩'
      },
      {
        id: 'q6',
        title: '如果失败不是问题，你会尝试做什么？',
        description: '想象一下没有失败恐惧的情况下，你最想追求的目标。',
        category: '梦想目标'
      },
      {
        id: 'q7',
        title: '你希望别人记住你的什么特质？',
        description: '思考你想要留给世界的印象和影响。',
        category: '自我认知'
      },
      {
        id: 'q8',
        title: '最近有什么事情让你感到困惑或不确定？',
        description: '探讨那些让你思考和质疑的问题。',
        category: '困惑思考'
      }
    ];

    for (const question of sampleQuestions) {
      await db.run(
        'INSERT INTO questions (id, title, description, category) VALUES (?, ?, ?, ?)',
        [question.id, question.title, question.description, question.category]
      );
    }

    console.log('Sample questions seeded successfully');
  }
};

if (require.main === module) {
  createTables().catch(console.error);
}

export { createTables };