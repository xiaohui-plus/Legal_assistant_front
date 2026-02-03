# 法律AI系统前后端对接文档

## 📋 概述

本项目已完成与法律AI系统后端API的对接，实现了以下功能：
- ✅ 用户认证（注册/登录）
- ✅ 法律问答（对接后端API）
- ✅ 文书生成（交互式问答流程）
- ✅ 文件上传与管理
- ✅ 用户反馈

## 🔧 配置说明

### 1. 后端API地址配置

在 `uni_modules/uni-ai-x/sdk/api.uts` 文件中修改 API 基础地址：

```typescript
// 开发环境
const BASE_URL = 'http://localhost:8001'

// 生产环境（部署时修改）
// const BASE_URL = 'https://api.your-domain.com'
```

### 2. 启动后端服务

确保后端服务已启动并运行在 `http://localhost:8001`

```bash
# 启动后端服务（根据你的后端项目）
python main.py
# 或
uvicorn main:app --host 0.0.0.0 --port 8001
```

### 3. 运行前端项目

```bash
# 在 HBuilderX 中运行到浏览器或手机
# 或使用命令行
npm run dev:h5
```

## 📱 功能说明

### 1. 用户认证

#### 登录/注册页面
- 路径：`/uni_modules/uni-ai-x/pages/login/login`
- 功能：
  - 用户注册（用户名、密码、邮箱）
  - 用户登录
  - Token 自动保存到本地存储
  - 登录状态持久化

#### 使用方式
1. 点击左侧菜单的"登录/注册"按钮
2. 输入用户名和密码
3. 首次使用需要先注册
4. 登录成功后自动返回主页

### 2. 法律问答

#### 对话功能
- 已替换原有的智谱AI请求为后端API
- 支持多轮对话（session_id 自动管理）
- 显示法律依据和建议

#### 使用方式
1. 确保已登录
2. 在主页输入法律问题
3. 系统自动调用后端 `/api/v1/qa/ask` 接口
4. 显示AI回答、法律依据和建议

#### 响应格式
```json
{
  "answer": "AI回答内容",
  "legal_basis": [
    {
      "law_name": "法律名称",
      "article": "条款",
      "content": "内容",
      "relevance_score": 0.95
    }
  ],
  "suggestions": ["建议1", "建议2"],
  "session_id": "会话ID",
  "response_time": 3.5
}
```

### 3. 文书生成

#### 文书生成页面
- 路径：`/uni_modules/uni-ai-x/pages/document/document`
- 功能：
  - 查看文书模板列表
  - 交互式问答填写信息
  - 生成并下载Word文档

#### 使用流程
1. 点击左侧菜单的"文书生成"按钮
2. 选择需要的文书模板（如：房屋租赁合同、劳动合同等）
3. 按照提示逐步回答问题
4. 完成后自动生成Word文档
5. 点击下载按钮保存文档

#### 支持的模板
- 房屋租赁合同
- 劳动合同
- 离婚协议书
- 遗嘱
- 更多模板...

### 4. 文件上传

#### API调用示例
```typescript
import { legalAiApi } from '@/uni_modules/uni-ai-x/sdk/api.uts'

// 上传文件
const result = await legalAiApi.uploadFile(filePath)
console.log('文件ID:', result.file_id)
```

### 5. 用户反馈

#### API调用示例
```typescript
import { legalAiApi } from '@/uni_modules/uni-ai-x/sdk/api.uts'

// 提交反馈
await legalAiApi.submitFeedback('bug', '反馈内容', 5, 'user@example.com')
```

## 🔑 API 接口说明

### 认证相关

#### 注册
```typescript
await legalAiApi.register(username, password, email?)
```

#### 登录
```typescript
const response = await legalAiApi.login(username, password)
// response.access_token - JWT Token
// response.user_id - 用户ID
// response.username - 用户名
```

#### 刷新Token
```typescript
const newToken = await legalAiApi.refreshToken()
```

#### 登出
```typescript
legalAiApi.logout()
```

#### 检查登录状态
```typescript
const isLoggedIn = legalAiApi.isLoggedIn()
```

### 问答相关

#### 提问
```typescript
const response = await legalAiApi.ask(question, sessionId?)
// response.answer - AI回答
// response.legal_basis - 法律依据数组
// response.suggestions - 建议数组
// response.session_id - 会话ID（用于多轮对话）
```

#### 获取对话历史
```typescript
const conversation = await legalAiApi.getConversation(sessionId)
// conversation.messages - 消息列表
```

### 文书生成相关

#### 获取模板列表
```typescript
const templates = await legalAiApi.getTemplates()
```

#### 开始生成
```typescript
const session = await legalAiApi.startDocumentGeneration(templateId)
// session.session_id - 会话ID
// session.question - 当前问题
// session.progress - 进度信息
```

#### 回答问题
```typescript
const response = await legalAiApi.answerQuestion(sessionId, answer)
// 如果 response.completed == true，表示完成
// 否则 response.question 包含下一个问题
```

#### 完成并生成文档
```typescript
const docInfo = await legalAiApi.finishDocument(sessionId)
// docInfo.document_id - 文档ID
// docInfo.filename - 文件名
// docInfo.download_url - 下载地址
```

#### 下载文档
```typescript
const downloadUrl = legalAiApi.getDownloadUrl(documentId)
// 使用 uni.downloadFile 下载
```

## 🔄 数据流程

### 问答流程
```
用户输入问题
    ↓
检查登录状态
    ↓
调用 legalAiApi.ask()
    ↓
发送请求到后端 /api/v1/qa/ask
    ↓
接收响应（answer + legal_basis + suggestions）
    ↓
模拟流式输出显示
    ↓
保存到本地对话历史
```

### 文书生成流程
```
选择模板
    ↓
调用 startDocumentGeneration()
    ↓
循环：回答问题 → answerQuestion()
    ↓
完成后调用 finishDocument()
    ↓
获取文档下载链接
    ↓
下载Word文档
```

## 🛠️ 核心文件说明

### 1. API封装层
- **文件**: `uni_modules/uni-ai-x/sdk/api.uts`
- **作用**: 封装所有后端API接口
- **包含**: 认证、问答、文书生成、文件管理等

### 2. 请求处理器
- **文件**: `uni_modules/uni-ai-x/sdk/requestAiWorker-legal.uts`
- **作用**: 替代原有的智谱AI请求，对接后端API
- **特点**: 模拟流式输出，兼容原有UI

### 3. 登录页面
- **文件**: `uni_modules/uni-ai-x/pages/login/login.uvue`
- **功能**: 用户注册和登录

### 4. 文书生成页面
- **文件**: `uni_modules/uni-ai-x/pages/document/document.uvue`
- **功能**: 文书模板选择、问答填写、文档下载

### 5. 菜单组件
- **文件**: `uni_modules/uni-ai-x/components/uni-ai-menu.uvue`
- **修改**: 添加了"登录/注册"和"文书生成"入口

### 6. 主逻辑
- **文件**: `uni_modules/uni-ai-x/sdk/index.uts`
- **修改**: 引入法律AI请求处理器

## 🔐 安全说明

### Token管理
- Token 存储在本地 Storage
- 自动在请求头中添加 `Authorization: Bearer <token>`
- Token 过期自动清除并提示重新登录

### 错误处理
- 401 错误：自动清除 Token，提示重新登录
- 网络错误：显示友好的错误提示
- 表单验证：前端验证用户输入

## 📝 开发建议

### 1. 调试模式
在 `api.uts` 中添加日志：
```typescript
console.log('API请求:', url, data)
console.log('API响应:', res)
```

### 2. 错误处理
所有 API 调用都应该使用 try-catch：
```typescript
try {
  const result = await legalAiApi.ask(question)
  // 处理结果
} catch (e) {
  console.error('请求失败:', e)
  uni.showToast({
    title: e instanceof Error ? e.message : '请求失败',
    icon: 'none'
  })
}
```

### 3. 生产环境配置
部署前修改 `api.uts` 中的 BASE_URL：
```typescript
const BASE_URL = 'https://api.your-domain.com'
```

## 🐛 常见问题

### 1. 登录失败
- 检查后端服务是否启动
- 检查 BASE_URL 配置是否正确
- 查看浏览器控制台网络请求

### 2. 问答无响应
- 确保已登录
- 检查 Token 是否有效
- 查看后端日志

### 3. 文书生成失败
- 确保已登录
- 检查模板ID是否正确
- 查看后端API文档

### 4. 跨域问题（H5）
如果遇到跨域问题，需要在后端配置CORS：
```python
# FastAPI 示例
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📞 技术支持

如有问题，请检查：
1. 后端服务是否正常运行
2. API 地址配置是否正确
3. 网络连接是否正常
4. 浏览器控制台错误信息

---

**版本**: v1.0  
**更新日期**: 2026-02-03  
**维护者**: 开发团队
