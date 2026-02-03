# PowerShell 脚本 - 启动智谱 AI Token 服务器

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 启动智谱 AI Token 服务器" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js 是否安装
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到 Node.js" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装 Node.js: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""

# 检查环境变量
$apiKey = $env:XiaoZhiai_api_key
if (-not $apiKey) {
    $apiKey = $env:'XiaoZhiai-api-key'
}

if ($apiKey) {
    Write-Host "✅ 环境变量已设置" -ForegroundColor Green
    $maskedKey = $apiKey.Substring(0, [Math]::Min(10, $apiKey.Length)) + "..."
    Write-Host "🔑 API Key: $maskedKey" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  警告: 未找到环境变量 XiaoZhiai-api-key" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请先设置环境变量，或者在下面输入 API Key:" -ForegroundColor Yellow
    Write-Host ""
    $tempApiKey = Read-Host "请输入智谱 AI API Key (或按 Ctrl+C 取消)"
    
    if ($tempApiKey) {
        $env:'XiaoZhiai-api-key' = $tempApiKey
        Write-Host ""
        Write-Host "✅ 临时 API Key 已设置" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ 未输入 API Key，退出" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🎯 服务器即将启动..." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 服务地址: http://localhost:3000" -ForegroundColor White
Write-Host "📝 API 接口: http://localhost:3000/api/zhipu-token" -ForegroundColor White
Write-Host "🏥 健康检查: http://localhost:3000/health" -ForegroundColor White
Write-Host ""
Write-Host "按 Ctrl+C 可以停止服务器" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 启动服务器
try {
    node server-example.js
} catch {
    Write-Host ""
    Write-Host "❌ 服务器启动失败" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}
