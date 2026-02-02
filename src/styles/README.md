# Tailwind CSS 风格工具类使用指南

本项目为 uniapp 配置了 Tailwind CSS 风格的工具类，使用 rpx 单位系统以适配不同屏幕尺寸。

## 文件说明

- `variables.scss` - 全局样式变量（原有的颜色和间距定义）
- `mixins.scss` - SCSS 混入（文本省略、居中、边框等）
- `tailwind-utilities.scss` - Tailwind CSS 风格的工具类（新增）
- `common.scss` - 通用样式（导入所有样式文件）

## 颜色系统

### 主色调 (Indigo)
```scss
bg-indigo-50 到 bg-indigo-900  // 背景色
text-indigo-50 到 text-indigo-900  // 文字色
border-indigo-50 到 border-indigo-900  // 边框色
```

### 中性色 (Slate)
```scss
bg-slate-50 到 bg-slate-900
text-slate-50 到 text-slate-900
border-slate-50 到 border-slate-900
```

### 辅助色
- Blue: `bg-blue-*`, `text-blue-*`
- Orange: `bg-orange-*`, `text-orange-*`

### 特殊背景
```scss
bg-white/80  // 白色 80% 透明度
bg-white/90  // 白色 90% 透明度
bg-black/40  // 黑色 40% 透明度
```

## 间距系统

### Padding
```scss
p-0, p-1, p-2, p-3, p-4, p-5, p-6, p-8, p-10, p-12, p-16
px-{size}  // 左右内边距
py-{size}  // 上下内边距
pt-{size}, pb-{size}, pl-{size}, pr-{size}  // 单边内边距
```

### Margin
```scss
m-0, m-1, m-2, m-3, m-4, m-5, m-6, m-8, m-10, m-12
mx-{size}  // 左右外边距
my-{size}  // 上下外边距
mt-{size}, mb-{size}, ml-{size}, mr-{size}  // 单边外边距
m-auto, mx-auto, ml-auto, mr-auto  // 自动边距
```

### Space Between
```scss
space-y-{size}  // 子元素垂直间距
space-x-{size}  // 子元素水平间距
```

**间距对应关系：**
- `1` = 4rpx
- `2` = 8rpx
- `3` = 12rpx
- `4` = 16rpx
- `5` = 20rpx
- `6` = 24rpx
- `8` = 32rpx
- `10` = 40rpx
- `12` = 48rpx
- `16` = 64rpx

## 圆角

```scss
rounded-none  // 无圆角
rounded-sm    // 4rpx
rounded       // 8rpx
rounded-md    // 12rpx
rounded-lg    // 16rpx
rounded-xl    // 24rpx
rounded-2xl   // 32rpx
rounded-3xl   // 48rpx
rounded-full  // 完全圆形

// 单边圆角
rounded-t-{size}  // 顶部圆角
rounded-b-{size}  // 底部圆角
```

## 边框

```scss
border        // 1px 边框
border-0      // 无边框
border-2      // 2px 边框
border-4      // 4px 边框

// 单边边框
border-t, border-b, border-l, border-r
border-t-0, border-t-2  // 单边边框宽度

// 边框样式
border-solid, border-dashed, border-dotted, border-none
```

## 阴影

```scss
shadow-none   // 无阴影
shadow-sm     // 小阴影
shadow        // 默认阴影
shadow-md     // 中等阴影
shadow-lg     // 大阴影
shadow-xl     // 超大阴影
shadow-2xl    // 特大阴影

// 带颜色的阴影
shadow-indigo-100
shadow-indigo-200
```

## 布局

### Flexbox
```scss
flex          // display: flex
inline-flex   // display: inline-flex

// 方向
flex-row, flex-row-reverse
flex-col, flex-col-reverse

// 换行
flex-wrap, flex-wrap-reverse, flex-nowrap

// Flex 属性
flex-1, flex-auto, flex-initial, flex-none
flex-grow, flex-grow-0
flex-shrink, flex-shrink-0

// 对齐
justify-start, justify-end, justify-center
justify-between, justify-around, justify-evenly

items-start, items-end, items-center
items-baseline, items-stretch

self-auto, self-start, self-end
self-center, self-stretch
```

### Grid
```scss
grid          // display: grid
grid-cols-1, grid-cols-2, grid-cols-3, grid-cols-4

// 间隙
gap-{size}, gap-x-{size}, gap-y-{size}
```

### Position
```scss
static, fixed, absolute, relative, sticky
top-0, right-0, bottom-0, left-0
z-0, z-10, z-20, z-30, z-40, z-50
```

## 尺寸

### Width
```scss
w-0, w-auto, w-full, w-screen
w-16, w-20, w-24, w-32, w-40, w-48, w-56, w-64, w-80, w-96
```

### Height
```scss
h-0, h-auto, h-full, h-screen
h-10, h-12, h-16, h-20, h-24, h-32, h-40, h-48
```

### Max/Min Width & Height
```scss
max-w-xs, max-w-sm, max-w-md, max-w-lg, max-w-xl
max-w-2xl, max-w-3xl, max-w-4xl, max-w-full

max-h-{size}, max-h-full
min-w-0, min-w-full
min-h-0, min-h-full, min-h-screen
```

## 文字

### 字体大小
```scss
text-xs      // 24rpx
text-sm      // 28rpx
text-base    // 32rpx
text-lg      // 36rpx
text-xl      // 40rpx
text-2xl     // 48rpx
text-3xl     // 60rpx
```

### 字体粗细
```scss
font-thin, font-light, font-normal
font-medium, font-semibold, font-bold, font-extrabold
```

### 文本对齐
```scss
text-left, text-center, text-right, text-justify
```

### 文本转换
```scss
uppercase, lowercase, capitalize, normal-case
```

### 字母间距
```scss
tracking-tighter, tracking-tight, tracking-normal
tracking-wide, tracking-wider, tracking-widest
```

### 行高
```scss
leading-none, leading-tight, leading-snug
leading-normal, leading-relaxed, leading-loose
```

### 文本溢出
```scss
truncate          // 单行省略
line-clamp-1      // 单行截断
line-clamp-2      // 两行截断
line-clamp-3      // 三行截断
```

## 溢出

```scss
overflow-auto, overflow-hidden, overflow-visible, overflow-scroll
overflow-x-auto, overflow-x-hidden, overflow-x-scroll
overflow-y-auto, overflow-y-hidden, overflow-y-scroll
```

## 透明度

```scss
opacity-0, opacity-25, opacity-50, opacity-75, opacity-100
```

## 过渡和动画

```scss
transition-none, transition-all, transition
transition-colors, transition-opacity, transition-transform

// 持续时间
duration-75, duration-100, duration-150
duration-200, duration-300, duration-500

// 缓动函数
ease-linear, ease-in, ease-out, ease-in-out

// 缩放
scale-0, scale-50, scale-75, scale-90, scale-95
scale-100, scale-105, scale-110
```

## 特殊效果

### 毛玻璃效果
```scss
backdrop-blur-none, backdrop-blur-sm, backdrop-blur
backdrop-blur-md, backdrop-blur-lg, backdrop-blur-xl
```

### 鼠标样式
```scss
cursor-auto, cursor-pointer, cursor-not-allowed
```

### 指针事件
```scss
pointer-events-none, pointer-events-auto
```

### 用户选择
```scss
select-none, select-text, select-all, select-auto
```

## 使用示例

### 按钮样式
```html
<view class="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-md transition-all">
  点击按钮
</view>
```

### 卡片样式
```html
<view class="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
  <text class="text-lg font-semibold text-slate-900">卡片标题</text>
  <text class="text-sm text-slate-600 mt-2">卡片内容</text>
</view>
```

### 消息气泡（AI）
```html
<view class="flex items-start space-x-3">
  <view class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
    <text class="text-white">AI</text>
  </view>
  <view class="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
    <text class="text-slate-700">AI 回复内容</text>
  </view>
</view>
```

### 消息气泡（用户）
```html
<view class="flex items-start justify-end space-x-3">
  <view class="max-w-[80%] bg-indigo-600 rounded-2xl p-4 shadow-md shadow-indigo-100">
    <text class="text-white">用户消息内容</text>
  </view>
  <view class="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
    <text class="text-slate-600">U</text>
  </view>
</view>
```

### 输入框
```html
<view class="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-xl transition-all">
  <textarea 
    class="w-full text-base text-slate-900" 
    placeholder="输入消息..."
  />
</view>
```

### 毛玻璃效果 Header
```html
<view class="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
  <view class="flex items-center justify-between px-6 h-full">
    <text class="text-lg font-semibold text-slate-900">标题</text>
  </view>
</view>
```

## 注意事项

1. **rpx 单位**：所有尺寸使用 rpx 单位，会根据屏幕宽度自动适配
2. **组合使用**：可以组合多个工具类实现复杂样式
3. **优先级**：后面的类会覆盖前面的类（如果有冲突）
4. **性能**：避免过度使用工具类，复杂组件建议使用 SCSS 编写
5. **兼容性**：部分 CSS 属性（如 backdrop-filter）在某些平台可能不支持

## 与原有样式的关系

- 原有的 `variables.scss` 和 `mixins.scss` 保持不变
- 新增的 `tailwind-utilities.scss` 提供 Tailwind 风格的工具类
- 两套系统可以共存，根据需要选择使用
- 建议新组件优先使用 Tailwind 风格的工具类
