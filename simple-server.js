const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'client/dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 前端服务器运行在 http://127.0.0.1:${PORT}`);
});