const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8888;
const HOST = '127.0.0.1';

// 读取前端文件
const indexPath = path.join(__dirname, 'client/dist/index.html');
let indexHtml = '';

try {
  indexHtml = fs.readFileSync(indexPath, 'utf8');
  console.log('✅ 前端文件已加载');
} catch (error) {
  console.log('❌ 无法读取前端文件:', error.message);
  indexHtml = '<h1>思考工具</h1><p>正在加载...</p>';
}

const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API健康检查
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      message: '简单服务器运行正常'
    }));
    return;
  }

  // 登录API（模拟）
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.username === 'admin' && data.password === 'admin123') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            user: { id: '1', username: 'admin', email: 'admin@test.com' },
            token: 'test-token-123'
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '用户名或密码错误' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: '请求格式错误' }));
      }
    });
    return;
  }

  // 默认返回前端页面
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(indexHtml);
});

server.listen(PORT, HOST, () => {
  console.log('🚀 服务器启动成功！');
  console.log(`🌐 访问地址: http://${HOST}:${PORT}`);
  console.log(`📊 健康检查: http://${HOST}:${PORT}/api/health`);
  console.log('👤 测试账户: admin / admin123');
  console.log('');
  console.log('请在浏览器中打开上面的地址');
});

server.on('error', (error) => {
  console.error('❌ 服务器启动失败:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log(`端口 ${PORT} 被占用，尝试其他端口...`);
  }
});