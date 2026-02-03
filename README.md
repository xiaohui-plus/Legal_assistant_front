# AI 问答助手

基于 uni-ai-x 模板开发的 AI 问答应用

## 功能特性

- ✅ 支持多种 AI 模型（DeepSeek、通义千问等）
- ✅ 流式对话响应
- ✅ Markdown 渲染支持
- ✅ 代码高亮显示
- ✅ 数学公式渲染
- ✅ 对话历史管理
- ✅ 深色/浅色主题切换

## 快速开始

### 1. 配置 AI 服务

编辑 `uni_modules/uni-ai-x/config.uts` 文件，配置你的 AI 服务提供商：

```typescript
// 支持的服务商：qiniu（七牛云）、bailian（阿里云百炼）
// 需要实现 getToken() 方法来获取访问令牌
```

### 2. 运行项目

```bash
# 运行到 H5
npm run dev:h5

# 运行到微信小程序
npm run dev:mp-weixin

# 运行到 App
npm run dev:app
```

## 项目结构

```
├── pages/
│   └── index/
│       └── index.uvue          # 主页面（AI 问答界面）
├── uni_modules/
│   └── uni-ai-x/               # AI 聊天核心模块
│       ├── components/         # UI 组件
│       ├── sdk/                # SDK 工具
│       ├── config.uts          # 配置文件
│       └── types.uts           # 类型定义
├── pages.json                  # 页面配置
└── manifest.json               # 应用配置
```

## 主要组件说明

- **uni-ai-chat**: 聊天主界面组件
- **uni-ai-menu**: 左侧菜单组件（对话历史）
- **uni-ai-x-msg**: 消息展示组件
- **input-tool-bar**: 输入工具栏

## 自定义配置

### 修改默认模型

在 `uni_modules/uni-ai-x/config.uts` 中修改 `defaultLLM`：

```typescript
const defaultLLM: DefaultLLM = {
	provider: 'qiniu',  // 服务商
	model: 'deepseek-v3'  // 模型名称
}
```

### 主题配置

应用支持深色和浅色主题，会自动跟随系统设置。

## 注意事项

1. 需要配置有效的 AI 服务令牌才能正常使用
2. 建议通过云函数获取临时令牌，避免泄露密钥
3. 部分功能需要 uniCloud 支持

## 技术栈

- uni-app x
- Vue 3
- TypeScript (UTS)
- uni-ai-x 模块

## 许可证

MIT
