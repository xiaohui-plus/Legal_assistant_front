# 左侧菜单可调整宽度功能

## ✨ 新功能说明

现在左侧菜单支持拖动调整宽度了！

## 🎯 功能特性

### 1. 拖动调整宽度
- 📏 在菜单右侧边缘可以看到一个可拖动的区域
- 🖱️ 鼠标悬停时会高亮显示
- ↔️ 拖动即可调整菜单宽度

### 2. 宽度限制
- 最小宽度：200px
- 最大宽度：500px
- 默认宽度：260px

### 3. 自动保存
- ✅ 调整后的宽度会自动保存到本地存储
- ✅ 下次打开应用时会恢复上次的宽度设置

## 🎮 使用方法

### 桌面端（鼠标）

1. **找到调整手柄**
   - 打开左侧菜单
   - 将鼠标移到菜单右侧边缘
   - 会看到一个半透明的蓝色区域

2. **拖动调整**
   - 鼠标悬停在边缘时，光标会变成 ↔️
   - 按住鼠标左键并拖动
   - 向右拖动增加宽度，向左拖动减小宽度

3. **释放保存**
   - 松开鼠标，宽度自动保存

### 移动端（触摸）

1. **找到调整手柄**
   - 打开左侧菜单
   - 在菜单右侧边缘有一个 8px 宽的触摸区域

2. **拖动调整**
   - 手指按住边缘区域
   - 左右滑动调整宽度

3. **释放保存**
   - 松开手指，宽度自动保存

## 🎨 视觉效果

### 正常状态
- 边缘区域透明，不影响视觉

### 悬停状态（鼠标）
- 边缘区域显示半透明蓝色（rgba(64, 158, 255, 0.3)）
- 中间有一个灰色的竖线指示器

### 拖动状态
- 边缘区域显示更深的蓝色（rgba(64, 158, 255, 0.5)）
- 实时显示宽度变化

## 💾 数据存储

### 存储位置
- 使用 `uni.setStorageSync` 保存到本地存储
- 存储键名：`menu-width`
- 存储值：数字（宽度像素值）

### 加载逻辑
```typescript
// 应用启动时自动加载
onMounted(() => {
    loadMenuWidth()
})

// 如果没有保存的宽度，使用默认值 260px
```

### 保存逻辑
```typescript
// 拖动结束时自动保存
handleResizeEnd() {
    saveMenuWidth(menuWidth.value)
}
```

## 🔧 技术实现

### 核心代码

#### 1. 拖动手柄
```vue
<view 
    class="resize-handle" 
    :style="{left: menuWidth + 'px'}"
    @touchstart="handleResizeStart"
    @touchmove="handleResizeMove"
    @touchend="handleResizeEnd"
    @mousedown="handleResizeStart"
></view>
```

#### 2. 宽度计算
```typescript
const handleResizeMove = (event: any) => {
    const currentX = event.touches ? event.touches[0].pageX : event.pageX
    const diffX = currentX - resizeStartX.value
    let newWidth = resizeStartWidth.value + diffX
    
    // 限制范围
    if (newWidth < MIN_MENU_WIDTH) newWidth = MIN_MENU_WIDTH
    if (newWidth > MAX_MENU_WIDTH) newWidth = MAX_MENU_WIDTH
    
    menuWidth.value = newWidth
}
```

#### 3. 动态样式
```vue
<uni-ai-menu :menu-width="menuWidth"></uni-ai-menu>
```

## 🎯 适配说明

### H5 端
- ✅ 完全支持
- ✅ 鼠标拖动流畅
- ✅ 光标样式正确显示

### App 端
- ✅ 支持触摸拖动
- ✅ 宽度自动保存

### 小程序端
- ✅ 支持触摸拖动
- ⚠️ 可能需要额外适配

## 🐛 已知问题

### 问题 1：拖动时可能选中文本

**解决方案：**
已在代码中添加：
```typescript
// 拖动开始时禁用文本选择
document.body.style.userSelect = 'none'

// 拖动结束时恢复
document.body.style.userSelect = ''
```

### 问题 2：快速拖动可能超出范围

**解决方案：**
已添加宽度限制：
```typescript
if (newWidth < MIN_MENU_WIDTH) newWidth = MIN_MENU_WIDTH
if (newWidth > MAX_MENU_WIDTH) newWidth = MAX_MENU_WIDTH
```

## 🎨 自定义配置

### 修改宽度范围

在 `pages/index/index.uvue` 中修改：

```typescript
const MIN_MENU_WIDTH = 200  // 最小宽度
const MAX_MENU_WIDTH = 500  // 最大宽度
const DEFAULT_MENU_WIDTH = 260  // 默认宽度
```

### 修改手柄样式

在 `pages/index/index.uvue` 的样式中修改：

```scss
.resize-handle {
    width: 8px;  // 手柄宽度
    
    &:hover {
        background-color: rgba(64, 158, 255, 0.3);  // 悬停颜色
    }
    
    &:active {
        background-color: rgba(64, 158, 255, 0.5);  // 拖动颜色
    }
}
```

### 修改指示器样式

```scss
.resize-handle::after {
    width: 2px;  // 指示器宽度
    height: 40px;  // 指示器高度
    background-color: rgba(128, 128, 128, 0.3);  // 指示器颜色
}
```

## 💡 使用建议

### 推荐宽度设置

- **窄屏设备**：200-260px
- **普通屏幕**：260-320px
- **宽屏显示**：320-400px
- **超宽屏**：400-500px

### 最佳实践

1. **根据内容调整**
   - 如果对话标题较长，可以增加宽度
   - 如果需要更多聊天区域，可以减小宽度

2. **根据屏幕调整**
   - 小屏幕设备建议使用较窄的菜单
   - 大屏幕设备可以使用较宽的菜单

3. **个性化设置**
   - 每个用户可以根据自己的习惯调整
   - 设置会自动保存，无需重复调整

## 🚀 未来改进

可能的功能增强：

1. ✨ 双击边缘恢复默认宽度
2. ✨ 添加宽度预设选项（小、中、大）
3. ✨ 显示当前宽度数值
4. ✨ 添加动画效果
5. ✨ 支持键盘快捷键调整

## 📞 反馈

如果遇到问题或有改进建议：
1. 检查浏览器控制台是否有错误
2. 确认本地存储是否正常工作
3. 尝试清除缓存后重试

---

**享受可自定义的菜单宽度吧！** 🎉
