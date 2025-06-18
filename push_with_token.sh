#!/bin/bash

echo "🔄 准备推送代码到GitHub..."
echo "📁 当前目录: $(pwd)"
echo "🔗 远程仓库: $(git remote get-url origin)"
echo ""

echo "📋 当前提交状态:"
git log --oneline -3
echo ""

echo "🚀 开始推送代码..."
echo ""
echo "⚠️  重要提示："
echo "   当提示输入用户名时，输入：gitTreeYoung"
echo "   当提示输入密码时，粘贴您的新个人访问令牌（不是GitHub密码）"
echo ""
echo "🔑 如果您还没有创建新令牌，请："
echo "   1. 访问 https://github.com/settings/tokens"
echo "   2. 点击 'Generate new token (classic)'"
echo "   3. 在 'Select scopes' 中勾选 'repo' (完整仓库访问权限)"
echo "   4. 点击 'Generate token'"
echo "   5. 复制生成的令牌（例如：ghp_xxxxxxxxxxxxxxxxxxxx）"
echo ""
echo "按 Enter 继续推送..."
read

# 推送代码
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 代码推送成功！"
    echo ""
    echo "📋 接下来的步骤："
    echo "1. 访问 https://github.com/gitTreeYoung/thinking-tool/settings/pages"
    echo "2. 在 'Source' 下选择 'GitHub Actions'"
    echo "3. 保存设置"
    echo ""
    echo "⏳ 等待几分钟后，GitHub Actions 会自动部署您的网站"
    echo "📊 查看部署进度：https://github.com/gitTreeYoung/thinking-tool/actions"
    echo ""
    echo "🌐 部署完成后，您的网站将在这里可用："
    echo "   https://gittreeyoung.github.io/thinking-tool/"
    echo ""
else
    echo ""
    echo "❌ 推送失败！"
    echo ""
    echo "💡 常见问题和解决方案："
    echo "1. 确保令牌有正确的权限（repo权限）"
    echo "2. 确保令牌没有过期"
    echo "3. 确保用户名输入正确：gitTreeYoung"
    echo "4. 确保粘贴的是令牌而不是密码"
    echo ""
    echo "如果仍有问题，可以尝试使用 GitHub Desktop 客户端："
    echo "https://desktop.github.com/"
fi