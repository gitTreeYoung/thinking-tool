import { initDatabase } from './database';

const createSeriesTables = async () => {
  const db = await initDatabase();

  // 创建系列表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS question_series (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 创建系列问题关联表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS series_questions (
      id TEXT PRIMARY KEY,
      series_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (series_id) REFERENCES question_series (id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
      UNIQUE(series_id, question_id),
      UNIQUE(series_id, order_index)
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_series_questions_series 
    ON series_questions (series_id, order_index);
  `);

  console.log('Series tables created successfully');

  await seedSeriesData(db);
};

const seedSeriesData = async (db: any) => {
  const existingSeries = await db.get('SELECT COUNT(*) as count FROM question_series');
  
  if (existingSeries.count === 0) {
    // 创建晚安日记系列
    const eveningSeriesId = 'evening-diary';
    await db.run(
      'INSERT INTO question_series (id, name, description, icon, color) VALUES (?, ?, ?, ?, ?)',
      [
        eveningSeriesId, 
        '晚安日记', 
        '通过引导性问题帮助你回顾一天，培养感恩心态，为明天做好准备', 
        '🌙',
        '#4f46e5'
      ]
    );

    // 晚安日记问题
    const eveningQuestions = [
      {
        id: 'evening-q1',
        title: '今日三美好',
        description: '请回顾今天发生的三件美好事情，可以是大事小事，重要的是感受到的美好。',
        category: '感恩回顾'
      },
      {
        id: 'evening-q2', 
        title: '明天期待',
        description: '明天你最期待做什么事情？为什么期待？这会给你带来什么感受？',
        category: '未来期待'
      },
      {
        id: 'evening-q3',
        title: '情绪反思', 
        description: '今天你的主要情绪是什么？什么事情影响了你的情绪？你是如何处理的？',
        category: '情绪管理'
      },
      {
        id: 'evening-q4',
        title: '学习与成长',
        description: '今天你学到了什么？有哪些方面觉得可以做得更好？',
        category: '成长反思'
      }
    ];

    // 创建早安日记系列
    const morningSeriesId = 'morning-diary';
    await db.run(
      'INSERT INTO question_series (id, name, description, icon, color) VALUES (?, ?, ?, ?, ?)',
      [
        morningSeriesId,
        '早安日记', 
        '用5-10分钟为新的一天设定方向，明确目标，培养积极心态',
        '☀️',
        '#f59e0b'
      ]
    );

    // 早安日记问题
    const morningQuestions = [
      {
        id: 'morning-q1',
        title: '今日三个主要目标',
        description: '今天你想要完成的三个最重要的目标是什么？请确保它们具体、可行。',
        category: '目标设定'
      },
      {
        id: 'morning-q2',
        title: '优先事项排序', 
        description: '在你的待办事项中，哪些是今天"必须完成"的？请按重要性排序。',
        category: '优先级管理'
      },
      {
        id: 'morning-q3',
        title: '能量管理规划',
        description: '评估一下今天的精力状况，计划何时处理需要高度专注的任务？',
        category: '能量管理'
      },
      {
        id: 'morning-q4',
        title: '积极心态设定',
        description: '今天你感恩的事情是什么？什么会让今天变得美好？',
        category: '积极心态'
      },
      {
        id: 'morning-q5',
        title: '学习成长计划',
        description: '今天你想学习什么？可以突破哪个舒适区？',
        category: '学习成长'
      }
    ];

    // 插入所有问题
    const allQuestions = [...eveningQuestions, ...morningQuestions];
    for (const question of allQuestions) {
      const now = new Date().toISOString();
      await db.run(
        'INSERT INTO questions (id, title, description, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [question.id, question.title, question.description, question.category, now, now]
      );
    }

    // 关联晚安日记问题
    for (let i = 0; i < eveningQuestions.length; i++) {
      await db.run(
        'INSERT INTO series_questions (id, series_id, question_id, order_index) VALUES (?, ?, ?, ?)',
        [`${eveningSeriesId}-${i + 1}`, eveningSeriesId, eveningQuestions[i].id, i + 1]
      );
    }

    // 关联早安日记问题
    for (let i = 0; i < morningQuestions.length; i++) {
      await db.run(
        'INSERT INTO series_questions (id, series_id, question_id, order_index) VALUES (?, ?, ?, ?)',
        [`${morningSeriesId}-${i + 1}`, morningSeriesId, morningQuestions[i].id, i + 1]
      );
    }

    console.log('Series data seeded successfully');
  }
};

if (require.main === module) {
  createSeriesTables().catch(console.error);
}

export { createSeriesTables };