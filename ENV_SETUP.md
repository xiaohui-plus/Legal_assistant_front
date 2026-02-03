# 使用环境变量配置智谱 AI

## 📋 概述

你的智谱 AI API Key 存储在系统环境变量 `XiaoZhiai-api-key` 中。由于 uni-app x 无法直接读取系统环境变量，我们需要通过一个简单的服务器来中转。

## 🎯 解决方案

### 方案一：使用 Node.js 服务器（推荐）

我已经为你创建了一个简单的服务器：`server-example.js`

#### 步骤 1：启动服务器

在项目根目录打开命令行，运行：

```bash
node server-example.js
```

你会看到类似的输出：
```
============================================================
🚀 智谱 AI Token 服务器已启动
============================================================
📍 服务地址: http://localhost:3000
🔑 API Key 状态: ✅ 已加载
🔑 API Key: 1234567890...
============================================================
```

#### 步骤 2：测试服务器

在浏览器访问：
```
http://localhost:3000/health
```

应该看到：
```json
{
  "status": "ok",
  "hasApiKey": true,
  "timestamp": 1234567890
}
```

#### 步骤 3：运行项目

保持服务器运行，然后在 HBuilderX 中运行项目：
```
运行 -> 运行到浏览器 -> Chrome
```

### 方案二：临时硬编码（仅用于测试）

如果只是快速测试，可以临时硬编码 API Key。

#### 步骤 1：获取环境变量的值

在命令行运行：

**Windows (CMD):**
```cmd
echo %XiaoZhiai-api-key%
```

**Windows (PowerShell):**
```powershell
$env:XiaoZhiai-api-key
```

**Linux/Mac:**
```bash
echo $XiaoZhiai-api-key
```

#### 步骤 2：配置到项目

复制输出的 API Key，然后编辑 `uni_modules/uni-ai-x/config.uts`：

找到第 50 行左右：
```typescript
// return 'your-zhipu-api-key'
```

取消注释并替换为你的 API Key：
```typescript
return '你的API-Key'
```

然后注释掉下面的服务器请求代码（第 53-63 行）。

## 🔧 服务器配置详解

### 修改服务器端口

如果 3000 端口被占用，可以修改 `server-example.js`：

```javascript
const PORT = 3000;  // 改为其他端口，如 8080
```

同时修改 `uni_modules/uni-ai-x/config.uts` 中的 URL：
```typescript
url: 'http://localhost:8080/api/zhipu-token',
```

### 添加身份验证（可选）

如果需要更安全的配置，可以在服务器中添加身份验证：

```javascript
// server-example.js
if (parsedUrl.pathname === '/api/zhipu-token' && req.method === 'GET') {
    // 检查 Authorization 头
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer your-secret-token') {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
    }
    
    // ... 返回 API Key
}
```

客户端配置：
```typescript
const res = await uni.request({
    url: 'http://localhost:3000/api/zhipu-token',
    method: 'GET',
    header: {
        'Authorization': 'Bearer your-secret-token'
    }
})
```

## 🐛 常见问题

### Q1: 服务器提示 "未找到环境变量"

**原因：** 环境变量未正确设置或服务器未重启

**解决方案：**

1. 确认环境变量已设置：
   ```cmd
   echo %XiaoZhiai-api-key%
   ```

2. 如果未设置，设置环境变量：
   
   **Windows (CMD) - 临时设置：**
   ```cmd
   set XiaoZhiai-api-key=your-api-key
   node server-example.js
   ```
   
   **Windows (PowerShell) - 临时设置：**
   ```powershell
   $env:XiaoZhiai-api-key="your-api-key"
   node server-example.js
   ```
   
   **Windows - 永久设置：**
   ```
   1. 右键"此电脑" -> 属性
   2. 高级系统设置 -> 环境变量
   3. 新建用户变量：
      变量名: XiaoZhiai-api-key
      变量值: your-api-key
   4. 重启命令行
   ```

3. 重启服务器

### Q2: 前端提示 "网络请求失败"

**原因：** 服务器未启动或端口不对

**解决方案：**
1. 确认服务器正在运行
2. 检查端口是否正确（默认 3000）
3. 检查防火墙是否拦截

### Q3: CORS 跨域错误

**原因：** 浏览器安全策略

**解决方案：**
服务器已经配置了 CORS，如果还有问题：
1. 确认服务器代码中有 CORS 头设置
2. 尝试使用 Chrome 的 CORS 插件
3. 或在 Chrome 启动时添加参数：`--disable-web-security`

### Q4: 环境变量名称中的横线问题

**问题：** `XiaoZhiai-api-key` 中的横线可能导致问题

**解决方案：**

服务器代码已经处理了这个问题：
```javascript
const ZHIPU_API_KEY = process.env.XiaoZhiai_api_key || process.env['XiaoZhiai-api-key'];
```

如果还有问题，可以尝试：
1. 使用下划线：`XiaoZhiai_api_key`
2. 或使用方括号访问：`process.env['XiaoZhiai-api-key']`

## 📝 完整工作流程

### 开发环境

```bash
# 1. 启动服务器（终端 1）
node server-example.js

# 2. 运行项目（HBuilderX）
运行 -> 运行到浏览器 -> Chrome

# 3. 测试对话
在聊天界面输入消息
```

### 生产环境

生产环境建议：
1. 将服务器部署到云服务器
2. 使用 HTTPS
3. 添加身份验证
4. 使用环境变量管理工具（如 dotenv）

## 🔒 安全建议

1. ✅ **不要**在客户端代码中硬编码 API Key
2. ✅ **使用**服务器中转获取 API Key
3. ✅ **添加**身份验证保护服务器接口
4. ✅ **使用** HTTPS 传输（生产环境）
5. ✅ **定期**更换 API Key
6. ✅ **监控** API 使用情况

## 🚀 快速开始

最快的方式：

```bash
# 1. 打开命令行，进入项目目录
cd your-project-path

# 2. 启动服务器
node server-example.js

# 3. 保持服务器运行，打开 HBuilderX 运行项目
```

## 📞 需要帮助？

如果遇到问题：
1. 检查服务器是否正常运行
2. 检查环境变量是否正确设置
3. 查看浏览器控制台的错误信息
4. 查看服务器终端的日志

---

**提示：** 开发时保持服务器运行，每次修改代码后无需重启服务器。
