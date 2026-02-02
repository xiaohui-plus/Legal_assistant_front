# EmptyState 空状态组件

## 概述

EmptyState 是一个可复用的空状态组件，用于在列表、搜索结果或其他内容区域为空时显示友好的提示信息。

**验证需求 1.7**: WHEN 会话列表为空，THE 应用系统 SHALL 显示空状态引导界面

## 设计规范

- **居中布局**: 内容垂直和水平居中
- **图标颜色**: slate-300 (#CBD5E1)
- **文字颜色**: slate-500 (#64748B)
- **按钮背景**: indigo-600 (#4F46E5)
- **按钮圆角**: rounded-xl (24rpx)
- **按钮阴影**: 带有 indigo 色调的阴影效果

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| icon | string | '📭' | 显示的图标（支持 emoji 或文字图标） |
| title | string | '暂无数据' | 标题文字 |
| description | string | '' | 描述文字（可选） |
| buttonText | string | '' | 按钮文字（可选，不提供则不显示按钮） |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| buttonClick | 点击按钮时触发 | - |

## 使用示例

### 基础用法

```vue
<template>
  <EmptyState />
</template>

<script setup lang="ts">
import EmptyState from '@/components/common/EmptyState.vue'
</script>
```

### 自定义内容

```vue
<template>
  <EmptyState
    icon="💬"
    title="暂无会话"
    description="点击下方按钮开始新的法律咨询"
    buttonText="+ 新咨询"
    @buttonClick="handleNewChat"
  />
</template>

<script setup lang="ts">
import EmptyState from '@/components/common/EmptyState.vue'

const handleNewChat = () => {
  // 处理创建新会话的逻辑
  console.log('创建新会话')
}
</script>
```

### 无按钮状态

```vue
<template>
  <EmptyState
    icon="⭐"
    title="暂无收藏"
    description="您还没有收藏任何内容"
  />
</template>
```

## 常见使用场景

### 1. 空会话列表

```vue
<EmptyState
  icon="💬"
  title="暂无会话"
  description="点击下方按钮开始新的法律咨询"
  buttonText="+ 新咨询"
  @buttonClick="createNewChat"
/>
```

### 2. 空文书列表

```vue
<EmptyState
  icon="📄"
  title="暂无文书"
  description="您还没有生成任何法律文书"
  buttonText="生成文书"
  @buttonClick="navigateToTemplates"
/>
```

### 3. 空收藏列表

```vue
<EmptyState
  icon="⭐"
  title="暂无收藏"
  description="您还没有收藏任何内容"
/>
```

### 4. 搜索无结果

```vue
<EmptyState
  icon="🔍"
  title="未找到相关内容"
  description="请尝试使用其他关键词搜索"
/>
```

### 5. 空历史记录

```vue
<EmptyState
  icon="🕐"
  title="暂无历史记录"
  description="您的咨询历史将显示在这里"
/>
```

## 样式定制

组件使用 SCSS 编写样式，支持通过 CSS 变量或直接修改样式文件进行定制。

### 主要样式类

- `.empty-state`: 容器
- `.empty-state__icon`: 图标区域
- `.empty-state__title`: 标题
- `.empty-state__description`: 描述文字
- `.empty-state__button`: 操作按钮

### 自定义样式示例

```vue
<template>
  <EmptyState class="custom-empty-state" />
</template>

<style lang="scss" scoped>
.custom-empty-state {
  :deep(.empty-state__title) {
    color: #your-color;
  }
  
  :deep(.empty-state__button) {
    background-color: #your-color;
  }
}
</style>
```

## 可访问性

- 组件结构清晰，便于屏幕阅读器理解
- 按钮具有明确的点击区域和视觉反馈
- 文字对比度符合 WCAG 标准

## 测试

组件包含完整的单元测试，覆盖以下场景：

- ✅ 默认渲染
- ✅ 自定义 props
- ✅ 按钮点击事件
- ✅ 条件渲染（description 和 button）
- ✅ 边缘情况（空字符串、长文本）
- ✅ 完整使用场景

运行测试：

```bash
npm test tests/unit/components/EmptyState.test.ts
```

## 注意事项

1. **图标选择**: 建议使用 emoji 或简单的文字图标，保持视觉一致性
2. **描述文字**: 保持简洁明了，避免过长的文字
3. **按钮文字**: 使用动词开头，明确指示用户操作（如"+ 新咨询"、"生成文书"）
4. **响应式**: 组件已适配不同屏幕尺寸，使用 rpx 单位

## 相关组件

- `LoadingSpinner`: 加载状态组件
- `Disclaimer`: 免责声明组件

## 更新日志

### v1.0.0 (2024-01-XX)

- ✨ 初始版本
- ✅ 实现基础空状态展示
- ✅ 支持自定义图标、标题、描述
- ✅ 支持可选的操作按钮
- ✅ 完整的单元测试覆盖
