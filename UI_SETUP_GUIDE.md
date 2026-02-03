# UI 设置指南

## 概述

本指南说明如何启动和使用基于 HTML 原型实现的新 UI 界面。新 UI 采用现代化的三栏布局设计，提供更专业的法律助手体验。

## 新增文件

### 页面文件
- `pages/chat/main.vue` - 主聊天页面（三栏布局）
- `pages/chat/window.vue` - 聊天窗口页面（更新）

### 组件文件
- `components/layout/SideNavigation.vue` - 左侧导航栏
- `components/chat/MessageBubble.vue` - 消息气泡组件
- `components/chat/MessageInput.vue` - 消息输入框
- `components/chat/DocumentPreviewCard.vue` - 文书预览卡片
- `components/sidebar/KnowledgeCard.vue` - 知识卡片
- `components/sidebar/CaseList.vue` - 案例列表

### 样式文件
- `styles/tailwind-utilities.scss` - Tailwind 风格工具类

### 文档文件
- `docs/UI_DESIGN_IMPLEMENTATION.md` - UI 设计实现文档

## 快速开始

### 1. 查看新 UI

新的主页面路径为 `pages/chat/main`，已在 `pages.json` 中配置为首页。

**启动应用**：
```bash
# 微信小程序
npm run dev:mp-weixin

# H5
npm run dev:h5

# App
npm run dev:app
```

### 2. 页面导航

应用启动后会直接进入三栏布局的主聊天页面：

```
┌──────────────┬─────────────────────┬──────────────┐
│              │                     │              │
│  左侧导航栏   │     聊天内容区       │  右侧工具栏   │
│              │                     │              │
│  - 法律咨询   │  - 消息列表          │  - 知识卡片   │
│  - 文书生成   │  - 输入框            │  - 典型案例   │
│  - 案例检索   │                     │              │
│  - 历史记录   │                     │              │
│              │                     │              │
└──────────────┴─────────────────────┴──────────────┘
```

### 3. 功能演示

#### 发送消息
1. 在底部输入框输入文本
2. 点击发送按钮（✈️）
3. 消息会以动画形式出现在聊天区

#### 附件上传
1. 点击输入框左侧的附件按钮（📎）
2. 选择图片
3. 图片会上传并显示在聊天中

#### 导航切换
1. 点击左侧导航栏的菜单项
2. 应用会跳转到对应页面

#### 查看知识卡片
右侧工具栏显示：
- 相关法条
- 典型案例

## 设计特点

### 1. 现代化设计

- **渐变色彩**：Indigo 到 Blue 的渐变，专业且现代
- **圆角设计**：大圆角（32rpx）营造柔和感
- **阴影层次**：多层次阴影增强立体感
- **毛玻璃效果**：顶部 Header 使用半透明毛玻璃

### 2. 动画效果

- **消息滑入**：新消息从下方滑入
- **按钮反馈**：点击时缩放效果
- **过渡动画**：颜色、边框的平滑过渡

### 3. 响应式布局

- **自适应宽度**：主内容区自动填充
- **固定侧边栏**：左右侧边栏固定宽度
- **滚动优化**：隐藏滚动条，保持界面整洁

## 组件使用示例

### MessageBubble 组件

```vue
<template>
  <MessageBubble :message="message" />
</template>

<script setup>
import MessageBubble from '@/components/chat/MessageBubble.vue'

const message = {
  id: '1',
  role: 'assistant',  // 'assistant' 或 'user'
  content: '您好！我是您的法律助手。',
  timestamp: Date.now(),
  status: 'received',
  isFavorite: false,
  hasToolCard: true  // 是否显示工具卡片
}
</script>
```

### MessageInput 组件

```vue
<template>
  <MessageInput 
    @send="handleSend"
    @attach="handleAttach"
    @voice="handleVoice"
  />
</template>

<script setup>
import MessageInput from '@/components/chat/MessageInput.vue'

const handleSend = (content) => {
  console.log('发送消息:', content)
}

const handleAttach = () => {
  console.log('上传附件')
}

const handleVoice = () => {
  console.log('语音输入')
}
</script>
```

### DocumentPreviewCard 组件

```vue
<template>
  <DocumentPreviewCard 
    document-title="劳动合同解除协议书"
    :quick-actions="['修改金额', '添加条款', '重新生成']"
    @download="handleDownload"
    @edit="handleEdit"
    @quick-action="handleQuickAction"
  />
</template>

<script setup>
import DocumentPreviewCard from '@/components/chat/DocumentPreviewCard.vue'

const handleDownload = () => {
  console.log('下载文书')
}

const handleEdit = () => {
  console.log('编辑文书')
}

const handleQuickAction = (action) => {
  console.log('快捷操作:', action)
}
</script>
```

## 样式系统

### 使用 Tailwind 风格工具类

```vue
<template>
  <!-- Flexbox 布局 -->
  <view class="flex items-center justify-between gap-3">
    <!-- 背景和圆角 -->
    <view class="bg-white rounded-xl p-4 shadow-sm">
      <!-- 文字样式 -->
      <text class="text-slate-600 text-sm font-medium">示例文本</text>
    </view>
  </view>
</template>
```

### 常用工具类

**布局**：
- `flex`, `flex-col` - Flexbox
- `items-center`, `justify-between` - 对齐
- `gap-2`, `gap-3`, `gap-4` - 间隙

**颜色**：
- `bg-white`, `bg-slate-50`, `bg-indigo-600` - 背景
- `text-slate-600`, `text-indigo-600` - 文字
- `border-slate-200` - 边框

**间距**：
- `p-4`, `px-4`, `py-3` - 内边距
- `m-4`, `mt-3`, `mb-6` - 外边距

**圆角和阴影**：
- `rounded-xl`, `rounded-2xl`, `rounded-full` - 圆角
- `shadow-sm`, `shadow-md`, `shadow-xl` - 阴影

**动画**：
- `transition-all` - 过渡
- `animate-slide-in` - 滑入动画

## 自定义配置

### 修改颜色方案

编辑 `styles/tailwind-utilities.scss`：

```scss
// 修改主色调
$indigo-600: #4F46E5;  // 改为你的品牌色

// 修改中性色
$slate-50: #F8FAFC;    // 改为你的背景色
```

### 修改导航菜单

编辑 `components/layout/SideNavigation.vue`：

```typescript
const navItems = [
  { key: 'chat', label: '法律咨询', icon: '💬', route: '/pages/chat/window' },
  { key: 'document', label: '文书生成', icon: '📄', route: '/pages/document/templates' },
  // 添加更多菜单项...
]
```

### 修改知识卡片内容

编辑 `components/sidebar/KnowledgeCard.vue`：

```typescript
const props = withDefaults(defineProps<Props>(), {
  laws: () => [
    '《劳动合同法》第40条：...',
    '《民法典》第一千一百六十五条：...',
    // 添加更多法条...
  ]
})
```

## 常见问题

### Q: 如何隐藏侧边栏？

A: 在页面样式中添加条件渲染：

```vue
<view v-if="showSidebar" class="left-sidebar">
  <SideNavigation />
</view>
```

### Q: 如何适配移动端？

A: 使用媒体查询或条件渲染：

```scss
// 小屏幕隐藏侧边栏
@media (max-width: 750rpx) {
  .left-sidebar,
  .right-sidebar {
    display: none;
  }
}
```

### Q: 如何更换图标？

A: 当前使用 Emoji，可替换为：

1. **Iconify**：
```vue
<iconify-icon icon="heroicons:sparkles" />
```

2. **uni-icons**：
```vue
<uni-icons type="chat" size="20" />
```

3. **自定义 SVG**：
```vue
<image src="/static/icons/chat.svg" />
```

### Q: 如何实现流式响应？

A: 参考 `api/streaming-examples.md` 中的示例代码。

## 下一步

1. **集成后端 API**
   - 连接真实的聊天接口
   - 实现流式响应
   - 处理错误状态

2. **完善功能**
   - Markdown 渲染
   - 图片上传和预览
   - 语音输入
   - 消息收藏

3. **性能优化**
   - 虚拟列表
   - 图片懒加载
   - 代码分割

4. **测试**
   - 单元测试
   - 集成测试
   - 多端测试

## 参考文档

- [UI 设计实现文档](./docs/UI_DESIGN_IMPLEMENTATION.md)
- [需求文档](./.kiro/specs/legal-assistant-app/requirements.md)
- [设计文档](./.kiro/specs/legal-assistant-app/design.md)
- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)

## 技术支持

如有问题，请参考：
1. 项目文档
2. uni-app 官方文档
3. Vue 3 官方文档
4. 提交 Issue

---

**祝开发顺利！** 🚀
