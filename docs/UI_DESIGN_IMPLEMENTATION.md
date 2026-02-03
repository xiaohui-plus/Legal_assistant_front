# UI 设计实现文档

## 概述

本文档说明如何使用基于 HTML 原型实现的 UI 组件系统。设计采用现代化的三栏布局，使用 Tailwind CSS 风格的样式系统。

## 设计系统

### 颜色方案

#### 主色调
- **Indigo 600** (#4F46E5) - 主要按钮、激活状态
- **Indigo 700** (#4338CA) - 深色变体
- **Blue 500** (#3B82F6) - 渐变辅助色

#### 中性色
- **Slate 50** (#F8FAFC) - 主背景
- **Slate 200** (#E2E8F0) - 边框
- **Slate 400** (#94A3B8) - 辅助文本
- **Slate 600** (#475569) - 次要文本
- **Slate 900** (#0F172A) - 主要文本

#### 功能色
- **Orange 500** (#F97316) - 警告提示

### 布局规范

#### 三栏布局
```
┌──────────────┬─────────────────────┬──────────────┐
│              │                     │              │
│  左侧导航栏   │     主内容区         │  右侧工具栏   │
│  512rpx     │     flex-1          │  640rpx     │
│              │                     │              │
└──────────────┴─────────────────────┴──────────────┘
```

#### 圆角规范
- 卡片：32rpx (rounded-2xl)
- 按钮：24rpx (rounded-xl)
- 小元素：16rpx (rounded-lg)
- 圆形：999rpx (rounded-full)

#### 阴影规范
- 卡片：shadow-sm (0 2rpx 8rpx rgba(0,0,0,0.04))
- 按钮：shadow-md (0 8rpx 16rpx rgba(0,0,0,0.08))
- 浮动元素：shadow-xl (0 16rpx 48rpx rgba(0,0,0,0.16))

#### 间距规范
基于 8rpx 基础单位：
- p-2: 16rpx
- p-3: 24rpx
- p-4: 32rpx
- p-5: 40rpx
- p-6: 48rpx

## 组件使用指南

### 1. 主布局页面 (pages/chat/main.vue)

完整的三栏布局页面，整合了所有核心组件。

**使用方式**：
```vue
<template>
  <view class="chat-main-layout">
    <view class="left-sidebar">
      <SideNavigation />
    </view>
    <view class="main-content">
      <!-- 聊天内容 -->
    </view>
    <view class="right-sidebar">
      <KnowledgeCard />
      <CaseList />
    </view>
  </view>
</template>
```

**特点**：
- 自适应布局
- 左右侧边栏固定宽度
- 主内容区自动填充剩余空间

### 2. 侧边导航栏 (SideNavigation)

**路径**：`components/layout/SideNavigation.vue`

**功能**：
- 品牌标识展示
- 主导航菜单
- 版本信息卡片

**导航项配置**：
```typescript
const navItems = [
  { key: 'chat', label: '法律咨询', icon: '💬', route: '/pages/chat/window' },
  { key: 'document', label: '文书生成', icon: '📄', route: '/pages/document/templates' },
  { key: 'cases', label: '案例库检索', icon: '🔍', route: '/pages/cases/search' },
  { key: 'history', label: '历史记录', icon: '🕐', route: '/pages/chat/list' }
]
```

### 3. 消息气泡 (MessageBubble)

**路径**：`components/chat/MessageBubble.vue`

**Props**：
```typescript
interface Props {
  message: Message  // 消息对象
}
```

**消息类型**：
- **AI 消息**：左对齐，白色背景，带 sparkles 图标
- **用户消息**：右对齐，indigo 渐变背景，带 user 图标

**特殊功能**：
- 支持工具卡片展示
- 支持 Markdown 渲染（待实现）
- 长按操作菜单（待实现）

### 4. 消息输入框 (MessageInput)

**路径**：`components/chat/MessageInput.vue`

**Events**：
```typescript
emit('send', content: string)    // 发送消息
emit('attach')                   // 附件上传
emit('voice')                    // 语音输入
```

**特点**：
- 自动扩展高度
- focus 状态边框高亮
- 发送按钮状态控制

### 5. 文书预览卡片 (DocumentPreviewCard)

**路径**：`components/chat/DocumentPreviewCard.vue`

**Props**：
```typescript
interface Props {
  documentTitle?: string      // 文书标题
  quickActions?: string[]     // 快捷操作列表
}
```

**Events**：
```typescript
emit('download')                    // 下载文书
emit('edit')                        // 编辑文书
emit('quickAction', action: string) // 快捷操作
```

**布局结构**：
```
┌─────────────────────────────────┐
│ 标题栏 (下载、编辑按钮)           │
├─────────────────────────────────┤
│                                 │
│ 文书内容区                       │
│ (支持 Markdown)                 │
│                                 │
│ 风险提示                         │
│                                 │
├─────────────────────────────────┤
│ 快捷操作标签                     │
└─────────────────────────────────┘
```

### 6. 知识卡片 (KnowledgeCard)

**路径**：`components/sidebar/KnowledgeCard.vue`

**Props**：
```typescript
interface Props {
  laws?: string[]  // 相关法条列表
}
```

**用途**：
- 展示相关法律条文
- 提供法律知识参考

### 7. 案例列表 (CaseList)

**路径**：`components/sidebar/CaseList.vue`

**Props**：
```typescript
interface Props {
  cases?: CaseItem[]
}

interface CaseItem {
  title: string
  description: string
  id?: string
}
```

**特点**：
- 典型案例展示
- 点击查看详情
- 底部认证标识

## 样式系统

### Tailwind 风格工具类

项目提供了一套 Tailwind CSS 风格的工具类，位于 `styles/tailwind-utilities.scss`。

**使用示例**：
```vue
<view class="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
  <text class="text-slate-600 text-sm">示例文本</text>
</view>
```

### 常用工具类

#### 布局
- `flex`, `flex-col` - Flexbox 布局
- `items-center`, `justify-between` - 对齐方式
- `gap-2`, `gap-3`, `gap-4` - 间隙

#### 颜色
- `bg-white`, `bg-slate-50`, `bg-indigo-600` - 背景色
- `text-slate-600`, `text-indigo-600` - 文字颜色
- `border-slate-200` - 边框颜色

#### 间距
- `p-4`, `px-4`, `py-3` - 内边距
- `m-4`, `mt-3`, `mb-6` - 外边距

#### 圆角和阴影
- `rounded-xl`, `rounded-2xl`, `rounded-full` - 圆角
- `shadow-sm`, `shadow-md`, `shadow-xl` - 阴影

#### 动画
- `transition-all` - 过渡动画
- `animate-slide-in` - 滑入动画

## 响应式设计

### rpx 单位

所有尺寸使用 rpx 单位，自动适配不同屏幕：
- 1rpx = 屏幕宽度 / 750
- 设计稿基准：750px

### 布局适配

三栏布局在小屏幕上的适配策略：
1. **平板**：保持三栏布局
2. **手机**：隐藏侧边栏，使用底部导航
3. **H5**：响应式调整侧边栏宽度

## 动画效果

### 消息滑入动画

```scss
@keyframes slideIn {
  from {
    transform: translateY(20rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out forwards;
}
```

### 按钮点击效果

```scss
.button {
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.95);
  }
}
```

### 毛玻璃效果

```scss
.header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24rpx);
}
```

## 图标系统

当前使用 Emoji 作为图标，后续可替换为：
- Iconify
- uni-icons
- 自定义 SVG 图标

**图标映射**：
- ✨ sparkles - AI 助手
- 👤 user - 用户
- 📎 paper-clip - 附件
- 🎤 microphone - 语音
- ✈️ paper-airplane - 发送
- 📤 share - 分享
- ⬇️ arrow-down-tray - 下载
- ✏️ pencil-square - 编辑
- 🔖 bookmark - 收藏
- 🎓 academic-cap - 学习

## 最佳实践

### 1. 组件复用

优先使用已有组件，避免重复开发：
```vue
<!-- 好的做法 -->
<MessageBubble :message="message" />

<!-- 避免 -->
<view class="custom-message-bubble">...</view>
```

### 2. 样式一致性

使用工具类保持样式一致：
```vue
<!-- 好的做法 -->
<view class="p-4 bg-white rounded-xl shadow-sm">

<!-- 避免 -->
<view style="padding: 32rpx; background: white; border-radius: 24rpx;">
```

### 3. 响应式单位

始终使用 rpx 单位：
```scss
// 好的做法
.container {
  padding: 32rpx;
  font-size: 28rpx;
}

// 避免
.container {
  padding: 16px;
  font-size: 14px;
}
```

### 4. 动画性能

使用 transform 和 opacity 实现动画：
```scss
// 好的做法
.animate {
  transform: translateY(20rpx);
  opacity: 0;
  transition: all 0.3s;
}

// 避免
.animate {
  top: 20rpx;
  transition: top 0.3s;
}
```

## 下一步开发

### 待实现功能

1. **Markdown 渲染**
   - 集成 markdown-it 或类似库
   - 支持代码高亮
   - 支持表格、列表等格式

2. **图片上传**
   - 图片压缩
   - 上传进度显示
   - 图片预览

3. **语音输入**
   - 录音功能
   - 语音转文字
   - 播放控制

4. **流式响应**
   - SSE 或 WebSocket 集成
   - 打字机效果
   - 取消请求

5. **响应式适配**
   - 移动端布局
   - 平板适配
   - 横屏支持

### 性能优化

1. **虚拟列表**
   - 长消息列表优化
   - 滚动性能提升

2. **图片懒加载**
   - 延迟加载图片
   - 占位符显示

3. **代码分割**
   - 按需加载组件
   - 减小首屏体积

## 参考资源

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Vue 3 文档](https://vuejs.org/)
- [Iconify 图标库](https://iconify.design/)
