# 使用环境变量快速开始（2 分钟）

## 🎯 你的情况

- ✅ 智谱 AI API Key 已存储在环境变量 `XiaoZhiai-api-key` 中
- ✅ 项目已配置为从服务器获取 API Key
- ✅ 服务器代码已准备好（`server-example.js`）

## 🚀 快速启动（3 步）

### 第 1 步：启动服务器

**方式 A：使用批处理脚本（最简单）**

双击运行：
```
start-server.bat
```

**方式 B：使用 PowerShell 脚本**

右键 `start-server.ps1` -> 使用 PowerShell 运行

**方式 C：手动启动**

打开命令行，运行：
```bash
node server-example.js
```

### 第 2 步：验证服务器

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

### 第 3 步：运行项目

保持服务器运行，在 HBuilderX 中：
```
运行 -> 运行到浏览器 -> Chrome
```

## ✅ 测试对话

在聊天界面输入：
```
你好，请介绍一下智谱 AI
```

如果 AI 正常响应，说明配置成功！🎉

## 📊 工作流程图

```
┌─────────────────┐
│  环境变量       │
│ XiaoZhiai-api-key│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Node.js 服务器 │  ← 第 1 步：启动
│  (localhost:3000)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  uni-app x 项目 │  ← 第 2 步：运行
│  (浏览器)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  智谱 AI 服务   │  ← 第 3 步：对话
│  (GLM 模型)     │
└─────────────────┘
```

## 🔧 配置说明

### 当前配置

项目已配置为：
- 🌐 服务器地址：`http://localhost:3000`
- 📡 API 接口：`/api/zhipu-token`
- 🤖 默认模型：`glm-4-plus`

### 修改服务器地址

如果需要修改端口，编辑两个文件：

**1. server-example.js**
```javascript
const PORT = 3000;  // 改为其他端口
```

**2. uni_modules/uni-ai-x/config.uts**
```typescript
url: 'http://localhost:3000/api/zhipu-token',  // 改为对应端口
```

### 切换模型

编辑 `uni_modules/uni-ai-x/config.uts`，找到文件末尾：

```typescript
const defaultLLM: DefaultLLM = {
    provider: 'zhipu',
    model: 'glm-4-flash'  // 改为其他模型
}
```

可选模型：
- `glm-4-plus` - 最强大（默认）
- `glm-4-flash` - 快速响应（推荐）
- `glm-4-air` - 超快响应
- `glm-4-long` - 长文本支持
- `glm-4v-plus` - 支持图片

## 🐛 常见问题

### Q1: 服务器提示 "未找到环境变量"

**检查环境变量：**
```cmd
echo %XiaoZhiai-api-key%
```

如果显示 `%XiaoZhiai-api-key%`，说明未设置。

**临时设置：**
```cmd
set XiaoZhiai-api-key=your-api-key
node server-example.js
```

### Q2: 前端提示 "网络请求失败"

**检查清单：**
- [ ] 服务器是否正在运行？
- [ ] 端口是否正确（默认 3000）？
- [ ] 防火墙是否拦截？

**测试服务器：**
```
浏览器访问: http://localhost:3000/health
```

### Q3: 服务器启动后立即关闭

**原因：** 可能是端口被占用

**解决：**
1. 修改 `server-example.js` 中的端口
2. 或关闭占用 3000 端口的程序

**查看端口占用（Windows）：**
```cmd
netstat -ano | findstr :3000
```

### Q4: API Key 格式错误

**正确格式：**
```
1234567890abcdef1234567890abcdef.12345678
```

包含一个点号（.），前后都是字母数字。

## 💡 开发建议

### 1. 保持服务器运行

开发时保持服务器运行，无需每次都重启。

### 2. 使用快捷脚本

将 `start-server.bat` 固定到任务栏，方便快速启动。

### 3. 查看日志

服务器会显示每次请求的日志，方便调试。

### 4. 测试接口

可以用 Postman 或浏览器测试接口：
```
GET http://localhost:3000/api/zhipu-token
```

## 📝 完整命令

### 启动开发环境

```bash
# 终端 1：启动服务器
node server-example.js

# 终端 2：或使用脚本
start-server.bat

# HBuilderX：运行项目
运行 -> 运行到浏览器 -> Chrome
```

### 停止服务器

在服务器终端按 `Ctrl + C`

## 🎯 下一步

配置成功后，你可以：

1. ✅ 测试不同的问题
2. ✅ 尝试不同的模型
3. ✅ 查看 `ZHIPU_AI_CONFIG.md` 了解更多配置
4. ✅ 查看 `ENV_SETUP.md` 了解详细说明

## 📞 需要帮助？

- 📖 详细配置：`ENV_SETUP.md`
- 🔧 智谱 AI 配置：`ZHIPU_AI_CONFIG.md`
- 🚀 项目说明：`README.md`

---

**提示：** 开发时保持服务器运行，修改代码后只需刷新浏览器即可！
