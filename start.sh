#!/bin/bash

echo "🚀 启动思考工具应用..."

# 构建前端
echo "📦 构建前端..."
cd client && npm run build && cd ..

# 启动后端（包含静态文件服务）
echo "🖥️ 启动服务器..."
cd server && npm run dev

echo "✅ 应用已启动"
echo "🌐 请访问: http://127.0.0.1:3000"
echo "👤 测试账户: admin / admin123"