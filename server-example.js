/**
 * 简单的 Node.js 服务器示例
 * 用于从环境变量读取智谱 AI API Key 并提供给前端
 * 
 * 使用方法：
 * 1. 确保已安装 Node.js
 * 2. 在命令行运行：node server-example.js
 * 3. 服务器将在 http://localhost:3000 启动
 */

const http = require('http');
const url = require('url');

const PORT = 3000;

// 从环境变量读取 API Key
const ZHIPU_API_KEY = process.env.XiaoZhiai_api_key || process.env['XiaoZhiai-api-key'];

const server = http.createServer((req, res) => {
    // 设置 CORS 头，允许跨域请求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);

    // API 路由：获取智谱 AI Token
    if (parsedUrl.pathname === '/api/zhipu-token' && req.method === 'GET') {
        if (!ZHIPU_API_KEY) {
            res.writeHead(500);
            res.end(JSON.stringify({
                error: '未找到环境变量 XiaoZhiai-api-key',
                message: '请设置环境变量后重启服务器'
            }));
            return;
        }

        res.writeHead(200);
        res.end(JSON.stringify({
            token: ZHIPU_API_KEY,
            expiresAt: Date.now() + 3600000, // 1小时后过期
            provider: 'zhipu',
            timestamp: Date.now()
        }));
        return;
    }

    // 健康检查接口
    if (parsedUrl.pathname === '/health' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'ok',
            hasApiKey: !!ZHIPU_API_KEY,
            timestamp: Date.now()
        }));
        return;
    }

    // 404
    res.writeHead(404);
    res.end(JSON.stringify({
        error: 'Not Found',
        availableEndpoints: [
            'GET /api/zhipu-token',
            'GET /health'
        ]
    }));
});

server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 智谱 AI Token 服务器已启动');
    console.log('='.repeat(60));
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`🔑 API Key 状态: ${ZHIPU_API_KEY ? '✅ 已加载' : '❌ 未找到'}`);
    if (ZHIPU_API_KEY) {
        console.log(`🔑 API Key: ${ZHIPU_API_KEY.substring(0, 10)}...`);
    } else {
        console.log('⚠️  警告: 未找到环境变量 XiaoZhiai-api-key');
        console.log('');
        console.log('请设置环境变量：');
        console.log('  Windows (CMD):');
        console.log('    set XiaoZhiai-api-key=your-api-key');
        console.log('    node server-example.js');
        console.log('');
        console.log('  Windows (PowerShell):');
        console.log('    $env:XiaoZhiai-api-key="your-api-key"');
        console.log('    node server-example.js');
        console.log('');
        console.log('  Linux/Mac:');
        console.log('    export XiaoZhiai-api-key=your-api-key');
        console.log('    node server-example.js');
    }
    console.log('='.repeat(60));
    console.log('');
    console.log('📝 可用接口:');
    console.log(`  GET  http://localhost:${PORT}/api/zhipu-token  - 获取 API Key`);
    console.log(`  GET  http://localhost:${PORT}/health           - 健康检查`);
    console.log('');
    console.log('按 Ctrl+C 停止服务器');
    console.log('='.repeat(60));
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n\n👋 服务器正在关闭...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});
