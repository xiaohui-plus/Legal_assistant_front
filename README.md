# 法律助手应用

基于 uniapp 开发的跨端法律助手应用，支持微信小程序、App、H5 等多端，提供智能法律咨询和法律文书生成两大核心功能。

## 技术栈

- **前端框架**: uniapp (Vue 3 + TypeScript)
- **UI 组件库**: uni-ui
- **状态管理**: Pinia
- **测试框架**: Vitest + fast-check
- **样式方案**: SCSS + rpx

## 项目结构

```
legal-assistant-app/
├── pages/                    # 页面目录
│   ├── chat/                # 聊天模块
│   ├── document/            # 文书模块
│   └── profile/             # 个人中心模块
├── components/              # 组件目录
│   ├── chat/               # 聊天相关组件
│   ├── document/           # 文书相关组件
│   └── common/             # 通用组件
├── store/                   # 状态管理
├── services/                # 业务服务层
├── api/                     # API 接口层
├── utils/                   # 工具函数
├── types/                   # TypeScript 类型定义
├── static/                  # 静态资源
└── styles/                  # 全局样式
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 运行开发环境

```bash
# 微信小程序
npm run dev:mp-weixin

# H5
npm run dev:h5

# App
npm run dev:app
```

### 构建生产版本

```bash
# 微信小程序
npm run build:mp-weixin

# H5
npm run build:h5

# App
npm run build:app
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并查看覆盖率
npm run test:coverage

# 运行测试 UI
npm run test:ui
```

## 功能特性

### 智能法律咨询
- 聊天会话管理
- 流式响应显示
- 消息收藏和搜索
- 图片上传支持

### 法律文书生成
- 多种文书模板
- 动态表单填写
- 参数验证
- 文书预览和编辑
- 导出功能

### 个人中心
- 用户信息管理
- 我的收藏
- 我的文书
- 历史咨询
- 设置选项

## 开发规范

- 使用 TypeScript 严格模式
- 遵循 Vue 3 Composition API 规范
- 使用 rpx 单位适配不同屏幕
- 所有网络请求必须有错误处理
- 所有用户输入必须进行验证
- 核心业务逻辑测试覆盖率 ≥ 80%

## 性能要求

- 首屏加载时间 < 3 秒
- 用户操作响应时间 < 100ms
- 长列表使用虚拟滚动
- 图片上传前必须压缩

## 兼容性

- 微信小程序基础库 2.10.0+
- iOS 10.0+
- Android 5.0+
- 主流浏览器（Chrome, Safari, Firefox）

## 许可证

Copyright © 2024 法律助手团队
