@echo off
chcp 65001 >nul
echo ============================================================
echo 🚀 启动智谱 AI Token 服务器
echo ============================================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未找到 Node.js
    echo.
    echo 请先安装 Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
node --version
echo.

REM 检查环境变量
if defined XiaoZhiai-api-key (
    echo ✅ 环境变量已设置
    echo 🔑 API Key: %XiaoZhiai-api-key:~0,10%...
) else (
    echo ⚠️  警告: 未找到环境变量 XiaoZhiai-api-key
    echo.
    echo 请先设置环境变量，或者在下面输入 API Key:
    echo.
    set /p TEMP_API_KEY="请输入智谱 AI API Key (或按 Ctrl+C 取消): "
    set XiaoZhiai-api-key=%TEMP_API_KEY%
    echo.
    echo ✅ 临时 API Key 已设置
)

echo.
echo ============================================================
echo 🎯 服务器即将启动...
echo ============================================================
echo.
echo 📍 服务地址: http://localhost:3000
echo 📝 API 接口: http://localhost:3000/api/zhipu-token
echo 🏥 健康检查: http://localhost:3000/health
echo.
echo 按 Ctrl+C 可以停止服务器
echo ============================================================
echo.

REM 启动服务器
node server-example.js

pause
