#!/bin/bash

echo "🔧 GitHub Pages 配置修复脚本"
echo ""

# 推送修复
echo "📤 推送工作流修复..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "🎯 现在请手动检查和配置 GitHub Pages："
    echo ""
    echo "📋 必要步骤："
    echo "1. 访问仓库设置页面："
    echo "   https://github.com/gitTreeYoung/thinking-tool/settings"
    echo ""
    echo "2. 确认仓库是公开的 (Public)："
    echo "   - 滚动到页面最下方 'Danger Zone'"
    echo "   - 如果显示 'Make public'，点击它将仓库改为公开"
    echo "   - GitHub Pages 免费版只支持公开仓库"
    echo ""
    echo "3. 配置 GitHub Pages："
    echo "   访问: https://github.com/gitTreeYoung/thinking-tool/settings/pages"
    echo "   - 在 'Source' 下拉菜单中选择 'GitHub Actions'"
    echo "   - 点击 'Save' 保存设置"
    echo ""
    echo "4. 等待部署完成："
    echo "   访问: https://github.com/gitTreeYoung/thinking-tool/actions"
    echo "   等待绿色的 ✅ 表示部署成功"
    echo ""
    echo "5. 访问您的网站："
    echo "   https://gittreeyoung.github.io/thinking-tool/"
    echo ""
    echo "💡 提示："
    echo "- 如果仍有问题，可能需要等待几分钟让 GitHub 处理设置"
    echo "- 首次启用 Pages 可能需要 5-10 分钟生效"
    echo ""
else
    echo ""
    echo "❌ 推送失败！请检查网络连接或使用 GitHub Desktop"
fi

echo ""
echo "🔍 当前工作流配置："
echo "文件: .github/workflows/pages.yml"
echo "已添加自动启用功能，应该能自动配置 GitHub Pages"