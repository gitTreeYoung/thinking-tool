import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { initDatabase } from './database/database';
import { createTables } from './database/migrate';
import { createSeriesTables } from './database/series_migrate';

import authRoutes from './routes/auth';
import questionsRoutes from './routes/questions';
import thoughtsRoutes from './routes/thoughts';
import adminRoutes from './routes/admin';
import seriesRoutes from './routes/series';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // 增加到1000个请求
  message: '请求过于频繁，请稍后再试'
});

// 临时禁用helmet解决连接问题
// app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/thoughts', thoughtsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/series', seriesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 服务前端静态文件
const clientPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientPath));

// SPA fallback - 对于非API路径，返回index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ message: 'API路径不存在' });
  } else {
    res.sendFile(path.join(clientPath, 'index.html'));
  }
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

const startServer = async () => {
  try {
    await initDatabase();
    await createTables();
    await createSeriesTables();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 服务器运行在 http://127.0.0.1:${PORT}`);
      console.log(`📊 健康检查: http://127.0.0.1:${PORT}/api/health`);
      console.log(`🌐 前端界面: http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();