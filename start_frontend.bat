@echo off
echo Starting Legal AI Frontend...
echo.

REM 检查是否安装了Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM 检查是否安装了依赖
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM 启动开发服务器
echo Starting development server...
echo Frontend will be available at: http://localhost:8080
echo.
npm run serve

pause