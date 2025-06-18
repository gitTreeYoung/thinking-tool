#!/bin/bash

echo "🚀 开始部署思考工具到GitHub..."
echo "📁 当前目录: $(pwd)"
echo ""

# 检查git状态
echo "📋 检查git状态..."
git status

echo ""
echo "🔍 检查远程仓库..."
git remote -v

echo ""
echo "📤 推送代码到GitHub..."
echo "注意：如果提示输入用户名和密码："
echo "- 用户名：gitTreeYoung"
echo "- 密码：请使用GitHub个人访问令牌 (不是您的账号密码)"
echo ""
echo "获取个人访问令牌："
echo "1. 访问 https://github.com/settings/tokens"
echo "2. 点击 'Generate new token (classic)'"
echo "3. 选择 'repo' 权限"
echo "4. 复制生成的令牌作为密码使用"
echo ""

# 推送代码
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码推送成功！"
    echo ""
    echo "🔧 接下来需要在GitHub仓库设置中启用GitHub Pages："
    echo "1. 访问 https://github.com/gitTreeYoung/thinking-tool/settings/pages"
    echo "2. 在 'Source' 下选择 'GitHub Actions'"
    echo "3. 保存设置"
    echo ""
    echo "⏳ 等待几分钟后，您的网站将在以下地址可用："
    echo "🌐 https://gittreeyoung.github.io/thinking-tool/"
    echo ""
else
    echo ""
    echo "❌ 推送失败，请检查网络连接或认证信息"
    echo ""
    echo "💡 建议使用GitHub Desktop客户端进行推送："
    echo "1. 下载 https://desktop.github.com/"
    echo "2. 登录您的GitHub账号"
    echo "3. 添加现有仓库并推送"
fi