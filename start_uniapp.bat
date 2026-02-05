@echo off
title 法义AI助手 - UniApp开发环境
color 0A

echo ========================================
echo    法义AI助手 - UniApp开发环境启动
echo ========================================
echo.

REM 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未安装Node.js
    echo 请从 https://nodejs.org/ 下载安装Node.js
    pause
    exit /b 1
)

echo ✅ Node.js 版本:
node --version

REM 检查npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: npm不可用
    pause
    exit /b 1
)

echo ✅ npm 版本:
npm --version

echo.
echo 🔍 检查开发环境...

REM 检查HBuilderX CLI
where uni >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  未检测到HBuilderX CLI
    echo 💡 建议安装HBuilderX或使用在线开发
    echo.
    echo 🌐 使用备用方案: Python HTTP服务器
    echo 📱 访问地址: http://localhost:8080/index.html
    echo.
    python serve.py
    goto :end
)

echo ✅ HBuilderX CLI 已安装

REM 检查依赖
if not exist node_modules (
    echo.
    echo 📦 正在安装UniApp依赖...
    echo 这可能需要几分钟时间...
    
    npm install --registry=https://registry.npmmirror.com --legacy-peer-deps
    
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败，使用备用方案
        echo.
        python serve.py
        goto :end
    )
    
    echo ✅ 依赖安装完成
)

echo.
echo 🚀 启动UniApp开发服务器...
echo.
echo 📱 支持平台:
echo    H5: http://localhost:8080
echo    微信小程序: 开发者工具导入 dist/dev/mp-weixin
echo    App: HBuilderX真机调试
echo.
echo 📖 开发文档: https://uniapp.dcloud.net.cn/
echo.

REM 启动H5开发服务器
echo 正在启动H5版本...
uni serve --platform h5 --port 8080

:end
echo.
echo 按任意键退出...
pause >nul