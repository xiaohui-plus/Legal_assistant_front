# 法义AI助手 - UniApp版本

## 项目简介

法义AI助手是一款专业的法律AI咨询和文书生成应用，基于UniApp框架开发，支持多端部署（微信小程序、支付宝小程序、H5、App等）。

## 主要功能

### 🤖 智能法律咨询
- 24小时在线AI法律顾问
- 支持实时对话和流式回复
- 专业的法律问题解答
- 对话历史记录管理

### 📄 法律文书生成
- 多种文书模板（借款合同、离婚协议、劳动合同等）
- 智能表单填写和验证
- 一键生成专业法律文书
- 文书预览、编辑和分享

### 👤 用户管理
- 手机号注册登录
- 验证码安全验证
- 个人信息管理
- 使用数据统计

## 技术栈

- **框架**: UniApp + Vue3
- **状态管理**: Pinia
- **样式**: SCSS + 响应式设计
- **网络请求**: 封装的uni.request
- **组件库**: 自定义组件 + uni-ui

## 项目结构

```
Legal_uniapp/
├── pages/                  # 页面文件
│   ├── index/             # 首页
│   ├── auth/              # 认证相关
│   ├── chat/              # 对话相关
│   ├── document/          # 文书相关
│   └── user/              # 用户中心
├── components/            # 公共组件
│   ├── MessageBubble.vue  # 消息气泡
│   ├── TemplateCard.vue   # 模板卡片
│   └── FormField.vue      # 表单字段
├── store/                 # 状态管理
│   ├── user.js           # 用户状态
│   ├── chat.js           # 对话状态
│   └── document.js       # 文书状态
├── utils/                 # 工具函数
│   ├── request.js        # 网络请求
│   └── common.js         # 通用工具
├── api/                   # API接口
│   ├── auth.js           # 认证接口
│   ├── chat.js           # 对话接口
│   └── document.js       # 文书接口
├── static/               # 静态资源
│   └── css/              # 样式文件
├── App.vue               # 应用入口
├── main.js               # 主文件
├── pages.json            # 页面配置
├── manifest.json         # 应用配置
└── uni.scss              # 全局样式变量
```

## 开发指南

### 环境要求

- Node.js >= 14.0.0
- HBuilderX 或 Vue CLI
- 微信开发者工具（小程序开发）

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
# H5开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

# 支付宝小程序开发
npm run dev:mp-alipay

# App开发
npm run dev:app-plus
```

### 构建打包

```bash
# H5打包
npm run build:h5

# 微信小程序打包
npm run build:mp-weixin

# 支付宝小程序打包
npm run build:mp-alipay

# App打包
npm run build:app-plus
```

## 配置说明

### 后端接口配置

在 `utils/request.js` 中修改 `BASE_URL` 为你的后端服务地址：

```javascript
const BASE_URL = 'http://localhost:8001'  // 修改为实际后端地址
```

### 小程序配置

1. 在 `manifest.json` 中配置小程序的 `appid`
2. 在各平台开发者工具中导入项目
3. 配置服务器域名白名单

### 主题定制

在 `uni.scss` 中修改主题色彩：

```scss
$uni-color-primary: #667eea;  // 主色调
$uni-color-success: #07c160;  // 成功色
$uni-color-warning: #ff976a;  // 警告色
$uni-color-error: #ee0a24;    // 错误色
```

## 功能特性

### 🔐 用户认证
- 手机号注册登录
- 短信验证码验证
- JWT Token认证
- 自动登录状态保持

### 💬 智能对话
- 实时消息发送
- AI流式回复
- 消息历史记录
- 对话管理

### 📝 文书生成
- 多种法律文书模板
- 智能表单验证
- 实时预览
- 一键生成

### 📱 响应式设计
- 适配多种屏幕尺寸
- 支持横竖屏切换
- 优化触摸交互
- 流畅动画效果

## API接口

项目使用RESTful API与后端通信，主要接口包括：

- **认证接口**: 登录、注册、验证码
- **对话接口**: 创建对话、发送消息、获取历史
- **文书接口**: 获取模板、生成文书、管理文书

详细API文档请参考后端项目的 `API_DOCUMENTATION.md`。

## 部署说明

### H5部署
1. 运行 `npm run build:h5`
2. 将 `dist/build/h5` 目录部署到Web服务器

### 小程序发布
1. 使用对应平台开发者工具打开项目
2. 预览测试无误后提交审核
3. 审核通过后发布上线

### App打包
1. 配置原生插件和证书
2. 使用HBuilderX云打包
3. 生成安装包并发布到应用商店

## 注意事项

1. **网络请求**: 小程序需要配置合法域名
2. **存储限制**: 小程序本地存储有大小限制
3. **权限申请**: App需要申请相应的设备权限
4. **性能优化**: 注意图片压缩和代码分包

## 开发规范

### 代码规范
- 使用ESLint进行代码检查
- 遵循Vue3 Composition API规范
- 组件命名使用PascalCase
- 文件命名使用kebab-case

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 常见问题

### Q: 小程序真机预览白屏？
A: 检查网络请求域名是否已配置，确保后端接口可访问。

### Q: App打包失败？
A: 检查manifest.json配置，确保应用标识和证书配置正确。

### Q: 样式在某些平台显示异常？
A: 使用条件编译处理平台差异，避免使用平台不支持的CSS属性。

## 更新日志

### v1.0.0 (2024-02-05)
- 🎉 项目初始版本
- ✨ 完成用户认证功能
- ✨ 完成智能对话功能
- ✨ 完成文书生成功能
- ✨ 完成用户中心功能
- 🎨 优化UI设计和交互体验
- 📱 适配多端平台

## 许可证

MIT License

## 联系我们

如有问题或建议，请联系开发团队：

- 邮箱: legal-ai@example.com
- 官网: https://legal-ai.com
- 技术支持: https://legal-ai.com/support