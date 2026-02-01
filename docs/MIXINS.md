# 样式混入文档 (Mixins Documentation)

本文档详细说明 `styles/mixins.scss` 中定义的所有样式混入及其使用方法。

## 目录

1. [文本省略 (Text Ellipsis)](#文本省略)
2. [Flexbox 居中工具 (Flexbox Centering)](#flexbox-居中工具)
3. [清除浮动 (Clearfix)](#清除浮动)
4. [1px 细线边框 (Hairline Borders)](#1px-细线边框)

---

## 文本省略

### `@mixin ellipsis($lines: 1)`

用于实现单行或多行文本溢出省略效果。

#### 参数

- `$lines` (number): 显示的行数，默认为 1
  - `1`: 单行省略
  - `>1`: 多行省略

#### 使用示例

```scss
// 单行省略
.title {
  @include ellipsis(1);
  // 或者
  @include ellipsis();
}

// 多行省略（显示3行）
.description {
  @include ellipsis(3);
}
```

#### 生成的 CSS

**单行省略：**
```css
.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**多行省略：**
```css
.description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

#### 注意事项

- 单行省略适用于所有浏览器
- 多行省略主要依赖 `-webkit-line-clamp`，在现代浏览器中支持良好
- 使用多行省略时，元素需要有固定宽度或最大宽度

---

## Flexbox 居中工具

### `@mixin flex-center`

实现元素的水平和垂直完全居中。

#### 使用示例

```scss
.modal {
  @include flex-center;
}
```

#### 生成的 CSS

```css
.modal {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

### `@mixin flex-v-center`

实现元素的垂直居中（交叉轴居中）。

#### 使用示例

```scss
.nav-item {
  @include flex-v-center;
}
```

#### 生成的 CSS

```css
.nav-item {
  display: flex;
  align-items: center;
}
```

---

### `@mixin flex-h-center`

实现元素的水平居中（主轴居中）。

#### 使用示例

```scss
.button-group {
  @include flex-h-center;
}
```

#### 生成的 CSS

```css
.button-group {
  display: flex;
  justify-content: center;
}
```

---

## 清除浮动

### `@mixin clearfix`

清除浮动，防止父元素高度塌陷。

#### 使用示例

```scss
.container {
  @include clearfix;
}
```

#### 生成的 CSS

```css
.container::after {
  content: '';
  display: table;
  clear: both;
}
```

#### 使用场景

- 当子元素使用 `float` 布局时
- 需要父元素包含浮动子元素的高度时

#### 注意事项

- 现代布局推荐使用 Flexbox 或 Grid，减少对浮动的依赖
- 此混入主要用于兼容旧代码或特殊布局需求

---

## 1px 细线边框

### `@mixin hairline($direction: all, $color: $border-color)`

在高清屏幕上实现真正的 1 物理像素边框效果。

#### 参数

- `$direction` (string): 边框方向，默认为 `all`
  - `all`: 四周边框
  - `top`: 顶部边框
  - `bottom`: 底部边框
  - `left`: 左侧边框
  - `right`: 右侧边框
- `$color` (color): 边框颜色，默认为 `$border-color`

#### 使用示例

```scss
// 四周边框
.card {
  @include hairline(all, $border-color);
}

// 底部边框
.list-item {
  @include hairline(bottom, #e5e5e5);
}

// 顶部边框（使用主色调）
.header {
  @include hairline(top, $color-primary);
}

// 左侧边框
.sidebar {
  @include hairline(left, $border-color);
}

// 右侧边框
.divider {
  @include hairline(right, $border-color);
}
```

#### 生成的 CSS

**四周边框 (all)：**
```css
.card {
  position: relative;
}
.card::after {
  content: '';
  position: absolute;
  pointer-events: none;
  box-sizing: border-box;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  border: 1px solid #e5e5e5;
  transform: scale(0.5);
  transform-origin: 0 0;
}
```

**单边边框 (top/bottom/left/right)：**
```css
.list-item {
  position: relative;
}
.list-item::after {
  content: '';
  position: absolute;
  pointer-events: none;
  box-sizing: border-box;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #e5e5e5;
  transform: scaleY(0.5);
}
```

#### 实现原理

1. **四周边框**：创建一个 2 倍大小的伪元素，然后缩放到 0.5 倍，实现真正的 1px 边框
2. **单边边框**：创建 1px 高度/宽度的伪元素，然后在对应方向缩放到 0.5 倍

#### 注意事项

- 使用 `::after` 伪元素实现，确保元素没有其他 `::after` 使用
- 元素需要设置 `position: relative`（混入会自动添加）
- `pointer-events: none` 确保伪元素不影响点击事件
- 在 Retina 屏幕上效果最佳

#### 使用场景

- 列表项分隔线
- 卡片边框
- 表单输入框边框
- 任何需要精细边框的场景

---

## 完整使用示例

### 消息气泡组件

```scss
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.message-bubble {
  padding: $spacing-md;
  border-radius: $border-radius-base;
  background-color: $bg-color;
  @include hairline(all, $border-color);
  
  &.user-message {
    background-color: $color-primary;
    color: $text-color-white;
    @include flex-h-center;
  }
  
  &.assistant-message {
    @include flex-v-center;
    gap: $spacing-sm;
  }
  
  .message-text {
    @include ellipsis(5); // 最多显示5行
    font-size: $font-size-base;
  }
}
```

### 卡片列表

```scss
.card-list {
  @include clearfix;
  
  .card-item {
    float: left;
    width: 48%;
    margin-bottom: $spacing-md;
    padding: $spacing-lg;
    background-color: $bg-color;
    border-radius: $border-radius-lg;
    @include hairline(all, $border-color);
    
    .card-title {
      @include ellipsis(1);
      @include flex-v-center;
      font-size: $font-size-lg;
      margin-bottom: $spacing-sm;
    }
    
    .card-content {
      @include ellipsis(3);
      color: $text-color-grey;
      font-size: $font-size-base;
    }
  }
}
```

### 按钮组

```scss
.button-group {
  @include flex-center;
  gap: $spacing-md;
  
  .button {
    @include flex-center;
    height: 80rpx;
    padding: 0 $spacing-lg;
    border-radius: $border-radius-base;
    
    &.primary {
      background-color: $color-primary;
      color: $text-color-white;
    }
    
    &.outline {
      background-color: transparent;
      color: $color-primary;
      @include hairline(all, $color-primary);
    }
  }
}
```

---

## 最佳实践

1. **优先使用 Flexbox**：现代布局优先使用 `flex-center`、`flex-v-center`、`flex-h-center`
2. **合理使用省略**：根据设计需求选择单行或多行省略
3. **统一边框样式**：使用 `hairline` 混入确保全局边框一致性
4. **避免过度嵌套**：混入应该在最终样式类中使用，避免在混入中嵌套混入
5. **性能考虑**：`hairline` 使用伪元素，注意不要过度使用

---

## 相关文件

- `styles/variables.scss` - 全局样式变量
- `styles/common.scss` - 通用样式类
- `styles/mixins-examples.scss` - 混入使用示例

---

## 验证需求

本混入文件验证以下需求：

- **需求 13**：UI 视觉规范 - 提供统一的样式工具
- **需求 15**：性能优化 - 通过混入减少重复代码

---

## 更新日志

- **2024-01-XX**: 初始版本，包含所有基础混入
