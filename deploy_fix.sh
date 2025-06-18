#!/bin/bash

echo "🔧 部署工作流修复脚本"
echo "📁 当前目录: $(pwd)"
echo ""

echo "🔍 检查当前提交状态:"
git log --oneline -3

echo ""
echo "📋 检查工作流文件:"
ls -la .github/workflows/

echo ""
echo "🚀 推送修复到GitHub..."
echo "注意：这次推送包含了全新的 pages.yml 工作流文件，应该能解决弃用警告问题"
echo ""

# 尝试推送
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "📋 接下来检查部署状态："
    echo "1. 访问 Actions 页面查看新的工作流运行："
    echo "   https://github.com/gitTreeYoung/thinking-tool/actions"
    echo ""
    echo "2. 确认 GitHub Pages 设置正确："
    echo "   https://github.com/gitTreeYoung/thinking-tool/settings/pages"
    echo "   确保 Source 设置为 'GitHub Actions'"
    echo ""
    echo "3. 等待部署完成后访问您的网站："
    echo "   https://gittreeyoung.github.io/thinking-tool/"
    echo ""
    echo "🔧 工作流修复内容："
    echo "- 使用全新的 pages.yml 替代旧的 deploy.yml"
    echo "- 简化为单作业部署模式"
    echo "- 使用最新版本的所有 GitHub Actions"
    echo "- 应该完全解决弃用警告问题"
    echo ""
else
    echo ""
    echo "❌ 推送失败！"
    echo ""
    echo "🔄 备选方案："
    echo "1. 检查网络连接"
    echo "2. 稍后重试推送"
    echo "3. 使用 GitHub Desktop 客户端推送"
    echo ""
    echo "📝 或者手动在 GitHub 网页上创建工作流文件："
    echo "1. 访问 https://github.com/gitTreeYoung/thinking-tool"
    echo "2. 进入 .github/workflows/ 目录"
    echo "3. 删除 deploy.yml，创建新的 pages.yml"
    echo "4. 复制下面的内容到 pages.yml:"
    echo ""
    cat .github/workflows/pages.yml
fi