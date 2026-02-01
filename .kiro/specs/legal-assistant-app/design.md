# 设计文档：法律助手应用

## 概述

本文档描述了基于 uniapp 开发的跨端法律助手应用的技术设计。该应用采用前后端分离架构，前端使用 uniapp 框架实现跨平台支持（微信小程序、App、H5），后端通过 RESTful API 提供大模型法律咨询和文书生成服务。

### 设计目标

- **跨端一致性**：在微信小程序、iOS/Android App、H5 浏览器中提供一致的用户体验
- **性能优化**：通过虚拟列表、图片压缩、流式响应等技术保证流畅体验
- **离线能力**：本地存储聊天记录和文书，支持离线查看
- **可扩展性**：模块化设计，便于后续功能扩展
- **专业严谨**：符合法律行业的专业性和严谨性要求

### 技术栈

- **前端框架**：uniapp (Vue 3 + TypeScript)
- **UI 组件库**：uni-ui
- **状态管理**：Pinia
- **本地存储**：uni.setStorage API
- **网络请求**：封装的 uni.request
- **样式方案**：SCSS + rpx 响应式单位
- **构建工具**：HBuilderX / CLI

## 架构

### 整体架构

应用采用经典的三层架构：

```
┌─────────────────────────────────────────┐
│           展示层 (Presentation)          │
│  ┌─────────┬─────────┬─────────────┐   │
│  │ 聊天页面 │ 文书页面 │ 个人中心页面 │   │
│  └─────────┴─────────┴─────────────┘   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          业务逻辑层 (Business)           │
│  ┌──────────┬──────────┬──────────┐    │
│  │ 聊天管理  │ 文书管理  │ 用户管理  │    │
│  └──────────┴──────────┴──────────┘    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          数据访问层 (Data Access)        │
│  ┌──────────┬──────────┬──────────┐    │
│  │ 本地存储  │ 网络请求  │ 缓存管理  │    │
│  └──────────┴──────────┴──────────┘    │
└─────────────────────────────────────────┘
```

### 目录结构

```
legal-assistant-app/
├── pages/                    # 页面目录
│   ├── chat/                # 聊天模块
│   │   ├── list.vue        # 聊天列表页
│   │   └── window.vue      # 聊天窗口页
│   ├── document/            # 文书模块
│   │   ├── templates.vue   # 模板列表页
│   │   ├── form.vue        # 参数填写页
│   │   └── preview.vue     # 文书预览页
│   └── profile/             # 个人中心模块
│       ├── index.vue       # 个人中心首页
│       ├── favorites.vue   # 我的收藏
│       ├── documents.vue   # 我的文书
│       └── settings.vue    # 设置页
├── components/              # 组件目录
│   ├── chat/               # 聊天相关组件
│   │   ├── MessageBubble.vue    # 消息气泡
│   │   ├── MessageInput.vue     # 消息输入框
│   │   └── StreamingText.vue    # 流式文本显示
│   ├── document/           # 文书相关组件
│   │   ├── TemplateCard.vue     # 模板卡片
│   │   ├── DynamicForm.vue      # 动态表单
│   │   └── DocumentEditor.vue   # 文书编辑器
│   └── common/             # 通用组件
│       ├── EmptyState.vue       # 空状态
│       ├── LoadingSpinner.vue   # 加载动画
│       └── Disclaimer.vue       # 免责声明
├── store/                   # 状态管理
│   ├── chat.ts             # 聊天状态
│   ├── document.ts         # 文书状态
│   └── user.ts             # 用户状态
├── services/                # 业务服务层
│   ├── chatService.ts      # 聊天服务
│   ├── documentService.ts  # 文书服务
│   └── userService.ts      # 用户服务
├── api/                     # API 接口层
│   ├── request.ts          # 请求封装
│   ├── chatApi.ts          # 聊天接口
│   ├── documentApi.ts      # 文书接口
│   └── userApi.ts          # 用户接口
├── utils/                   # 工具函数
│   ├── storage.ts          # 本地存储工具
│   ├── validator.ts        # 表单验证工具
│   ├── formatter.ts        # 格式化工具
│   └── platform.ts         # 平台判断工具
├── types/                   # TypeScript 类型定义
│   ├── chat.ts             # 聊天类型
│   ├── document.ts         # 文书类型
│   └── user.ts             # 用户类型
├── static/                  # 静态资源
│   ├── images/             # 图片资源
│   └── icons/              # 图标资源
├── styles/                  # 全局样式
│   ├── variables.scss      # 样式变量
│   ├── mixins.scss         # 样式混入
│   └── common.scss         # 通用样式
├── App.vue                  # 应用入口
├── main.ts                  # 主入口文件
├── manifest.json            # 应用配置
├── pages.json               # 页面配置
└── uni.scss                 # uni-app 样式变量
```

## 组件和接口

### 核心组件

#### 1. 聊天管理组件 (ChatManager)

**职责**：管理聊天会话的创建、更新、删除和查询

**接口**：

```typescript
interface ChatManager {
  // 创建新会话
  createSession(): Promise<ChatSession>
  
  // 获取会话列表
  getSessions(filter?: SessionFilter): Promise<ChatSession[]>
  
  // 获取单个会话
  getSession(sessionId: string): Promise<ChatSession>
  
  // 更新会话
  updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<void>
  
  // 删除会话
  deleteSession(sessionId: string): Promise<void>
  
  // 发送消息
  sendMessage(sessionId: string, content: string): Promise<Message>
  
  // 接收流式响应
  receiveStreamingResponse(sessionId: string, onChunk: (chunk: string) => void): Promise<void>
  
  // 取消当前请求
  cancelRequest(sessionId: string): void
}
```

#### 2. 消息处理组件 (MessageHandler)

**职责**：处理消息的发送、接收、存储和渲染

**接口**：

```typescript
interface MessageHandler {
  // 添加消息到会话
  addMessage(sessionId: string, message: Message): Promise<void>
  
  // 获取会话消息列表
  getMessages(sessionId: string, pagination?: Pagination): Promise<Message[]>
  
  // 更新消息状态
  updateMessageStatus(messageId: string, status: MessageStatus): Promise<void>
  
  // 收藏消息
  favoriteMessage(messageId: string): Promise<void>
  
  // 复制消息内容
  copyMessage(messageId: string): Promise<void>
  
  // 渲染 Markdown 内容
  renderMarkdown(content: string): string
}
```

#### 3. 文书模板管理组件 (TemplateManager)

**职责**：管理法律文书模板的加载、分类和搜索

**接口**：

```typescript
interface TemplateManager {
  // 获取所有模板
  getTemplates(): Promise<DocumentTemplate[]>
  
  // 按分类获取模板
  getTemplatesByCategory(category: string): Promise<DocumentTemplate[]>
  
  // 搜索模板
  searchTemplates(keyword: string): Promise<DocumentTemplate[]>
  
  // 获取单个模板详情
  getTemplate(templateId: string): Promise<DocumentTemplate>
  
  // 收藏模板
  favoriteTemplate(templateId: string): Promise<void>
  
  // 取消收藏
  unfavoriteTemplate(templateId: string): Promise<void>
  
  // 获取收藏的模板
  getFavoriteTemplates(): Promise<DocumentTemplate[]>
}
```

#### 4. 文书生成组件 (DocumentGenerator)

**职责**：根据模板和参数生成法律文书

**接口**：

```typescript
interface DocumentGenerator {
  // 生成文书
  generateDocument(templateId: string, params: Record<string, any>): Promise<GeneratedDocument>
  
  // 验证表单参数
  validateParams(templateId: string, params: Record<string, any>): ValidationResult
  
  // 暂存表单数据
  saveDraft(templateId: string, params: Record<string, any>): Promise<void>
  
  // 加载暂存数据
  loadDraft(templateId: string): Promise<Record<string, any> | null>
  
  // 保存生成的文书
  saveDocument(document: GeneratedDocument): Promise<void>
  
  // 导出文书
  exportDocument(documentId: string, format: ExportFormat): Promise<void>
}
```

#### 5. 本地存储管理组件 (StorageManager)

**职责**：统一管理本地数据的存储和读取

**接口**：

```typescript
interface StorageManager {
  // 保存数据
  set<T>(key: string, value: T): Promise<void>
  
  // 读取数据
  get<T>(key: string): Promise<T | null>
  
  // 删除数据
  remove(key: string): Promise<void>
  
  // 清空所有数据
  clear(): Promise<void>
  
  // 获取存储大小
  getStorageInfo(): Promise<StorageInfo>
}
```

#### 6. 网络请求组件 (HttpClient)

**职责**：封装统一的网络请求方法

**接口**：

```typescript
interface HttpClient {
  // GET 请求
  get<T>(url: string, params?: Record<string, any>, config?: RequestConfig): Promise<T>
  
  // POST 请求
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>
  
  // 流式请求
  stream(url: string, data: any, onChunk: (chunk: string) => void, config?: RequestConfig): Promise<void>
  
  // 上传文件
  upload(url: string, filePath: string, config?: UploadConfig): Promise<UploadResult>
  
  // 取消请求
  cancel(requestId: string): void
}
```

### API 接口定义

#### 1. 法律咨询接口

```typescript
// 发送咨询消息
POST /api/chat/send
Request: {
  sessionId: string
  message: string
  context?: string[]  // 上下文消息 ID
}
Response: {
  messageId: string
  content: string
  timestamp: number
}

// 流式咨询接口
POST /api/chat/stream
Request: {
  sessionId: string
  message: string
  context?: string[]
}
Response: Server-Sent Events (SSE)
data: {"chunk": "文本片段"}
data: {"done": true}
```

#### 2. 文书生成接口

```typescript
// 获取模板列表
GET /api/templates
Response: {
  templates: DocumentTemplate[]
}

// 获取模板详情
GET /api/templates/:id
Response: {
  template: DocumentTemplate
  fields: FormField[]
}

// 生成文书
POST /api/documents/generate
Request: {
  templateId: string
  params: Record<string, any>
}
Response: {
  documentId: string
  content: string
  createdAt: number
}
```

#### 3. 用户数据接口（可选）

```typescript
// 同步聊天记录
POST /api/user/sync/chats
Request: {
  sessions: ChatSession[]
}
Response: {
  success: boolean
}

// 同步文书记录
POST /api/user/sync/documents
Request: {
  documents: GeneratedDocument[]
}
Response: {
  success: boolean
}
```

## 数据模型

### 聊天相关数据模型

```typescript
// 聊天会话
interface ChatSession {
  id: string                    // 会话 ID
  title: string                 // 会话标题
  summary: string               // 消息摘要
  createdAt: number             // 创建时间戳
  updatedAt: number             // 更新时间戳
  messageCount: number          // 消息数量
  isFavorite: boolean           // 是否收藏
  unreadCount: number           // 未读消息数
}

// 消息
interface Message {
  id: string                    // 消息 ID
  sessionId: string             // 所属会话 ID
  role: 'user' | 'assistant'    // 角色
  content: string               // 消息内容
  timestamp: number             // 时间戳
  status: MessageStatus         // 消息状态
  isFavorite: boolean           // 是否收藏
  attachments?: Attachment[]    // 附件（图片等）
}

// 消息状态
enum MessageStatus {
  SENDING = 'sending',          // 发送中
  SENT = 'sent',                // 已发送
  RECEIVED = 'received',        // 已接收
  STREAMING = 'streaming',      // 流式接收中
  ERROR = 'error'               // 错误
}

// 附件
interface Attachment {
  id: string                    // 附件 ID
  type: 'image' | 'file'        // 附件类型
  url: string                   // 附件 URL
  size: number                  // 文件大小
  name: string                  // 文件名
}
```

### 文书相关数据模型

```typescript
// 文书模板
interface DocumentTemplate {
  id: string                    // 模板 ID
  name: string                  // 模板名称
  category: string              // 分类
  description: string           // 描述
  icon: string                  // 图标
  usageCount: number            // 使用次数
  isFavorite: boolean           // 是否收藏
  fields: FormField[]           // 表单字段
}

// 表单字段
interface FormField {
  name: string                  // 字段名
  label: string                 // 字段标签
  type: FieldType               // 字段类型
  required: boolean             // 是否必填
  placeholder?: string          // 占位符
  defaultValue?: any            // 默认值
  validation?: ValidationRule   // 验证规则
  options?: SelectOption[]      // 选项（用于下拉框等）
}

// 字段类型
enum FieldType {
  TEXT = 'text',                // 文本
  TEXTAREA = 'textarea',        // 多行文本
  NUMBER = 'number',            // 数字
  DATE = 'date',                // 日期
  SELECT = 'select',            // 下拉选择
  RADIO = 'radio',              // 单选
  CHECKBOX = 'checkbox'         // 多选
}

// 验证规则
interface ValidationRule {
  pattern?: string              // 正则表达式
  min?: number                  // 最小值/最小长度
  max?: number                  // 最大值/最大长度
  message: string               // 错误提示
  validator?: (value: any) => boolean  // 自定义验证函数
}

// 生成的文书
interface GeneratedDocument {
  id: string                    // 文书 ID
  templateId: string            // 模板 ID
  templateName: string          // 模板名称
  content: string               // 文书内容
  params: Record<string, any>   // 生成参数
  createdAt: number             // 创建时间
  updatedAt: number             // 更新时间
  isSaved: boolean              // 是否已保存
}
```

### 用户相关数据模型

```typescript
// 用户信息
interface UserProfile {
  id: string                    // 用户 ID
  nickname: string              // 昵称
  avatar: string                // 头像 URL
  memberLevel: MemberLevel      // 会员等级
  remainingQuota: number        // 剩余文书生成次数
}

// 会员等级
enum MemberLevel {
  FREE = 'free',                // 免费用户
  BASIC = 'basic',              // 基础会员
  PREMIUM = 'premium'           // 高级会员
}

// 用户设置
interface UserSettings {
  enableNotification: boolean   // 是否启用消息通知
  autoSaveChat: boolean         // 是否自动保存聊天
  theme: 'light' | 'dark'       // 主题
}
```

### 本地存储键值定义

```typescript
// 存储键常量
const STORAGE_KEYS = {
  CHAT_SESSIONS: 'chat_sessions',           // 聊天会话列表
  CHAT_MESSAGES: 'chat_messages_',          // 聊天消息（后缀为 sessionId）
  FAVORITE_TEMPLATES: 'favorite_templates', // 收藏的模板
  SAVED_DOCUMENTS: 'saved_documents',       // 保存的文书
  FORM_DRAFTS: 'form_drafts_',              // 表单草稿（后缀为 templateId）
  USER_PROFILE: 'user_profile',             // 用户信息
  USER_SETTINGS: 'user_settings',           // 用户设置
  AGREED_TERMS: 'agreed_terms'              // 是否同意用户协议
}
```


## 正确性属性

属性是一种特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性是人类可读规范和机器可验证正确性保证之间的桥梁。

### 属性 1：会话创建增长列表

*对于任意*初始会话列表状态，当创建新会话时，会话列表的长度应该增加 1，且新会话应该出现在列表中。

**验证需求：1.4**

### 属性 2：搜索结果匹配关键词

*对于任意*搜索关键词和数据集合（会话列表或模板列表），搜索返回的所有结果都应该在其标题、摘要或描述中包含该关键词（不区分大小写）。

**验证需求：1.5, 6.4**

### 属性 3：消息发送增长列表

*对于任意*聊天会话和有效消息内容，发送消息后，该会话的消息列表长度应该增加 1，且新消息应该出现在消息列表中。

**验证需求：2.1**

### 属性 4：Markdown 渲染保留内容

*对于任意*包含 Markdown 格式的文本，渲染后的 HTML 应该包含对应的格式标签（如 `<strong>` 对应 `**粗体**`，`<br>` 对应换行），且文本内容应该保持不变。

**验证需求：2.3**

### 属性 5：输入状态控制按钮

*对于任意*输入框状态，当输入框为空或系统正在加载时，发送按钮应该被禁用；当输入框有内容且系统空闲时，发送按钮应该被启用。

**验证需求：2.8**

### 属性 6：图片压缩减小大小

*对于任意*图片文件，压缩后的图片文件大小应该小于或等于原始文件大小，且压缩后的图片应该是有效的图片格式。

**验证需求：3.2, 15.2**

### 属性 7：本地存储往返一致性

*对于任意*数据对象（消息、文书、收藏、表单草稿），将其保存到本地存储后再读取，应该得到与原始对象等价的数据。

**验证需求：5.1, 7.7, 7.8, 8.3, 10.1, 10.2, 10.3, 10.4, 10.5**

### 属性 8：分类过滤正确性

*对于任意*分类标签和模板列表，按分类过滤后返回的所有模板都应该属于该分类，且该分类下的所有模板都应该被返回。

**验证需求：6.2**

### 属性 9：收藏操作可查询性

*对于任意*可收藏对象（模板或聊天），收藏操作后，该对象应该出现在收藏列表中；取消收藏后，该对象不应该出现在收藏列表中。

**验证需求：6.5**

### 属性 10：模板卡片显示完整信息

*对于任意*文书模板，渲染的模板卡片应该包含模板名称、图标 URL 和使用次数这三项信息。

**验证需求：6.6**

### 属性 11：动态表单字段匹配模板

*对于任意*文书模板，动态生成的表单字段数量应该等于模板定义的字段数量，且每个表单字段的属性（名称、类型、验证规则）应该与模板定义一致。

**验证需求：7.1**

### 属性 12：表单验证规则正确性

*对于任意*表单字段和输入值，验证结果应该符合该字段定义的验证规则（如必填、格式、范围等）。

**验证需求：7.2**

### 属性 13：表单完整性控制生成按钮

*对于任意*文书表单，当且仅当所有必填字段都已填写且所有字段验证都通过时，「一键生成」按钮应该被启用。

**验证需求：7.5**

### 属性 14：文书生成参数一致性

*对于任意*有效的表单参数，生成的文书内容应该包含所有填写的参数值，且参数值在文书中的呈现应该与填写的值一致。

**验证需求：7.6**

### 属性 15：清空操作清除所有数据

*对于任意*聊天会话，执行清空操作后，该会话的消息列表应该为空。

**验证需求：5.3**

### 属性 16：缓存清除删除所有存储

*对于任意*本地存储状态，执行清除缓存操作后，所有数据存储键（除用户设置外）对应的值应该被删除或为空。

**验证需求：10.6**

### 属性 17：网络请求统一处理

*对于任意*网络请求，封装后的请求应该自动包含通用请求头和认证信息；成功响应应该返回标准化的数据格式；失败响应应该返回标准化的错误格式。

**验证需求：11.2, 11.3, 11.4**

### 属性 18：请求重试幂等性

*对于任意*可重试的网络请求，多次重试应该产生与单次成功请求相同的结果（幂等性）。

**验证需求：11.6**

### 属性 19：流式数据完整性

*对于任意*流式响应，接收到的所有数据块按顺序拼接后，应该等于完整的响应内容。

**验证需求：12.1, 12.4**

## 错误处理

### 网络错误处理

1. **连接超时**：显示"网络连接超时，请检查网络设置"，提供重试按钮
2. **请求失败**：显示"请求失败，请稍后重试"，记录错误日志
3. **服务器错误**：显示"服务暂时不可用，请稍后重试"，提供客服联系方式
4. **流式响应中断**：保存已接收内容，显示"回复被中断"提示

### 数据错误处理

1. **本地存储失败**：提示用户存储空间不足，建议清理缓存
2. **数据解析失败**：使用默认值或空状态，记录错误日志
3. **数据版本不兼容**：执行数据迁移或清空旧数据

### 用户输入错误处理

1. **表单验证失败**：在字段下方显示红色错误提示
2. **文件上传失败**：显示具体错误原因（格式不支持、大小超限等）
3. **非法操作**：显示友好提示，引导用户正确操作

### 平台兼容性错误处理

1. **API 不支持**：降级到替代方案或禁用该功能
2. **权限不足**：提示用户授权，提供授权引导
3. **平台限制**：根据平台调整功能实现

## 测试策略

### 双重测试方法

本应用采用单元测试和属性测试相结合的测试策略：

- **单元测试**：验证特定示例、边缘情况和错误条件
- **属性测试**：验证所有输入的通用属性
- 两者互补，共同确保全面覆盖

### 单元测试策略

单元测试应该专注于：

1. **具体示例**：验证典型使用场景的正确行为
2. **边缘情况**：空列表、空字符串、边界值等
3. **错误条件**：网络失败、验证失败、异常输入等
4. **集成点**：组件之间的交互和数据流

**测试框架**：使用 Vitest 作为测试框架

**测试覆盖目标**：
- 核心业务逻辑：80% 以上
- 工具函数：90% 以上
- UI 组件：60% 以上（重点测试交互逻辑）

### 属性测试策略

属性测试用于验证通用正确性属性：

1. **配置**：每个属性测试至少运行 100 次迭代
2. **标注**：每个测试必须引用设计文档中的属性
3. **标签格式**：`Feature: legal-assistant-app, Property {number}: {property_text}`
4. **实现**：每个正确性属性对应一个属性测试

**属性测试库**：使用 fast-check（JavaScript/TypeScript 的属性测试库）

**测试数据生成**：
- 使用 fast-check 的内置生成器（字符串、数字、数组等）
- 为复杂数据模型编写自定义生成器
- 确保生成的数据覆盖边缘情况

### 测试组织

```
tests/
├── unit/                      # 单元测试
│   ├── services/             # 服务层测试
│   ├── utils/                # 工具函数测试
│   └── components/           # 组件测试
├── properties/               # 属性测试
│   ├── chat.properties.test.ts
│   ├── document.properties.test.ts
│   └── storage.properties.test.ts
└── fixtures/                 # 测试数据
    ├── mockData.ts
    └── generators.ts         # 数据生成器
```

### 持续集成

- 所有测试在提交前必须通过
- CI 流程自动运行所有单元测试和属性测试
- 测试失败时阻止合并

### 手动测试

除自动化测试外，还需要进行以下手动测试：

1. **多端兼容性测试**：在微信小程序、iOS App、Android App、H5 浏览器中测试
2. **用户体验测试**：验证交互流畅性、视觉一致性
3. **性能测试**：验证首屏加载时间、长列表滚动性能
4. **可访问性测试**：验证屏幕阅读器支持、键盘导航

## 部署和发布

### 构建配置

```javascript
// manifest.json 配置要点
{
  "name": "法律助手",
  "appid": "__UNI__XXXXXXX",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false,  // 不转换 px
  "h5": {
    "router": {
      "mode": "hash"
    },
    "optimization": {
      "treeShaking": {
        "enable": true
      }
    }
  },
  "mp-weixin": {
    "appid": "wx_appid",
    "setting": {
      "urlCheck": false,
      "minified": true
    },
    "permission": {
      "scope.userLocation": {
        "desc": "用于提供本地法律服务"
      }
    }
  },
  "app-plus": {
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "autoclose": true
    },
    "modules": {},
    "distribute": {
      "android": {
        "permissions": [
          "<uses-permission android:name=\"android.permission.INTERNET\"/>",
          "<uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\"/>"
        ]
      },
      "ios": {
        "privacyDescription": {
          "NSPhotoLibraryUsageDescription": "用于上传法律证据图片"
        }
      }
    }
  }
}
```

### 发布流程

1. **微信小程序**：
   - 使用 HBuilderX 或 CLI 构建小程序包
   - 上传到微信公众平台
   - 提交审核（注意法律服务类目资质要求）

2. **App**：
   - 使用 HBuilderX 云打包或本地打包
   - iOS：提交到 App Store Connect
   - Android：发布到各大应用市场

3. **H5**：
   - 构建 H5 包
   - 部署到 Web 服务器
   - 配置 HTTPS 和域名

### 监控和维护

1. **错误监控**：集成错误追踪服务（如 Sentry）
2. **性能监控**：监控页面加载时间、API 响应时间
3. **用户反馈**：提供反馈渠道，及时响应用户问题
4. **版本更新**：定期发布更新，修复 bug 和优化性能
