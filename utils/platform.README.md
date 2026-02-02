# 平台判断工具 (Platform Utility)

## 概述

平台判断工具提供了跨平台检测和平台特定功能适配的能力，支持微信小程序、App（iOS/Android）和 H5 平台。

**验证需求 14：多端适配**

## 功能特性

### 1. 基础平台判断

```typescript
import { isWeixin, isApp, isH5, getPlatform, PlatformType } from '@/utils/platform'

// 判断是否为微信小程序 (需求 14.1)
if (isWeixin()) {
    console.log('Running on WeChat Mini Program')
}

// 判断是否为 App (需求 14.2)
if (isApp()) {
    console.log('Running on App')
}

// 判断是否为 H5 (需求 14.3)
if (isH5()) {
    console.log('Running on H5')
}

// 获取当前平台
const platform = getPlatform()
console.log('Current platform:', platform) // 'weixin' | 'app' | 'h5' | 'unknown'
```

### 2. App 平台细分判断

```typescript
import { isIOS, isAndroid } from '@/utils/platform'

// 判断是否为 iOS App (需求 14.2)
if (isIOS()) {
    console.log('Running on iOS')
}

// 判断是否为 Android App (需求 14.2)
if (isAndroid()) {
    console.log('Running on Android')
}
```

### 3. 获取详细平台信息

```typescript
import { getPlatformInfo } from '@/utils/platform'

const info = getPlatformInfo()
console.log(info)
// {
//   platform: 'app',
//   isWeixin: false,
//   isApp: true,
//   isIOS: true,
//   isAndroid: false,
//   isH5: false,
//   system: 'iOS 15.0',
//   version: '15.0',
//   model: 'iPhone 13',
//   pixelRatio: 3,
//   screenWidth: 390,
//   screenHeight: 844,
//   windowWidth: 390,
//   windowHeight: 844,
//   statusBarHeight: 44,
//   safeArea: {...},
//   safeAreaInsets: {...}
// }
```

### 4. 平台特定选项 (需求 14.4)

根据平台返回不同的配置选项：

```typescript
import { getPlatformSpecificOption } from '@/utils/platform'

// 获取平台特定的按钮文字
const buttonText = getPlatformSpecificOption({
    weixin: '分享给好友',
    app: '分享',
    h5: '下载',
    default: '导出'
})

// 获取平台特定的样式
const styles = getPlatformSpecificOption({
    ios: { padding: 20, fontSize: 16 },
    android: { padding: 16, fontSize: 14 },
    default: { padding: 18, fontSize: 15 }
})

// 优先级：具体平台 (ios/android) > 通用平台 (weixin/app/h5) > 默认值
```

### 5. 功能支持检测 (需求 14.4)

检查当前平台是否支持特定功能：

```typescript
import { isPlatformFeatureSupported } from '@/utils/platform'

// 检查是否支持下载
if (isPlatformFeatureSupported('download')) {
    // 执行下载操作
}

// 检查是否支持分享到朋友圈
if (isPlatformFeatureSupported('shareTimeline')) {
    // 显示分享到朋友圈按钮
}

// 支持的功能列表：
// - download: 文件下载
// - shareTimeline: 分享到朋友圈
// - shareMessage: 分享给好友
// - saveToAlbum: 保存到相册
// - openDocument: 打开文档
// - clipboard: 复制到剪贴板
// - scanCode: 扫码
// - chooseImage: 选择图片
// - record: 录音
// - payment: 支付
// - location: 获取位置
```

### 6. 导出方式适配 (需求 14.4)

根据平台特性返回合适的导出方式：

```typescript
import { getExportMethod } from '@/utils/platform'

const exportMethod = getExportMethod()
// 微信小程序: 'share'
// App: 'share'
// H5: 'download'
// 其他: 'copy'

switch (exportMethod) {
    case 'download':
        // 执行下载
        break
    case 'share':
        // 执行分享
        break
    case 'copy':
        // 复制到剪贴板
        break
}
```

### 7. 平台样式适配 (需求 14.5)

获取平台特定的样式配置，保持一致的视觉风格：

```typescript
import { getPlatformStyles } from '@/utils/platform'

const styles = getPlatformStyles()
console.log(styles)
// {
//   statusBarHeight: 44,        // 状态栏高度
//   navigationBarHeight: 44,    // 导航栏高度
//   safeAreaBottom: 34,         // 底部安全区域高度
//   hasNotch: true              // 是否有刘海屏
// }

// 在样式中使用
const headerStyle = {
    paddingTop: `${styles.statusBarHeight}px`,
    height: `${styles.navigationBarHeight}px`
}

const footerStyle = {
    paddingBottom: `${styles.safeAreaBottom}px`
}
```

### 8. 执行平台特定操作 (需求 14.4)

根据平台执行不同的处理逻辑：

```typescript
import { executePlatformSpecific } from '@/utils/platform'

// 执行平台特定的分享逻辑
const shareResult = executePlatformSpecific({
    weixin: () => {
        // 微信小程序分享
        return uni.shareAppMessage({
            title: '法律助手',
            path: '/pages/index/index'
        })
    },
    app: () => {
        // App 分享
        return uni.share({
            provider: 'weixin',
            type: 0,
            title: '法律助手'
        })
    },
    h5: () => {
        // H5 使用 Web Share API
        if (navigator.share) {
            return navigator.share({
                title: '法律助手',
                url: window.location.href
            })
        }
        return Promise.reject('不支持分享')
    },
    default: () => {
        // 默认复制链接
        uni.setClipboardData({
            data: window.location.href
        })
        return Promise.resolve()
    }
})

// 优先级：具体平台 (ios/android) > 通用平台 (weixin/app/h5) > 默认处理
```

## 使用场景

### 场景 1：文书导出功能

```typescript
import { getExportMethod, executePlatformSpecific } from '@/utils/platform'

async function exportDocument(content: string) {
    const method = getExportMethod()
    
    return executePlatformSpecific({
        weixin: async () => {
            // 微信小程序：分享
            await uni.shareAppMessage({
                title: '法律文书',
                path: '/pages/document/preview'
            })
        },
        app: async () => {
            // App：保存到本地并分享
            const filePath = await saveToLocal(content)
            await uni.share({ href: filePath })
        },
        h5: async () => {
            // H5：下载文件
            downloadFile(content, 'document.txt')
        },
        default: async () => {
            // 默认：复制到剪贴板
            await uni.setClipboardData({ data: content })
            uni.showToast({ title: '已复制到剪贴板' })
        }
    })
}
```

### 场景 2：适配安全区域

```typescript
import { getPlatformStyles } from '@/utils/platform'

// 在 Vue 组件中使用
<template>
    <view class="page" :style="pageStyle">
        <view class="header" :style="headerStyle">
            <!-- 头部内容 -->
        </view>
        <view class="content">
            <!-- 主要内容 -->
        </view>
        <view class="footer" :style="footerStyle">
            <!-- 底部内容 -->
        </view>
    </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPlatformStyles } from '@/utils/platform'

const styles = getPlatformStyles()

const headerStyle = computed(() => ({
    paddingTop: `${styles.statusBarHeight}px`,
    height: `${styles.statusBarHeight + styles.navigationBarHeight}px`
}))

const footerStyle = computed(() => ({
    paddingBottom: `${styles.safeAreaBottom}px`
}))
</script>
```

### 场景 3：条件渲染功能

```typescript
import { isPlatformFeatureSupported } from '@/utils/platform'

<template>
    <view class="actions">
        <!-- 只在支持扫码的平台显示扫码按钮 -->
        <button v-if="supportsScanCode" @click="scanCode">
            扫码
        </button>
        
        <!-- 只在支持分享的平台显示分享按钮 -->
        <button v-if="supportsShare" @click="share">
            分享
        </button>
        
        <!-- 所有平台都显示复制按钮 -->
        <button @click="copy">
            复制
        </button>
    </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isPlatformFeatureSupported } from '@/utils/platform'

const supportsScanCode = computed(() => 
    isPlatformFeatureSupported('scanCode')
)

const supportsShare = computed(() => 
    isPlatformFeatureSupported('shareMessage')
)
</script>
```

## 测试

平台工具包含完整的单元测试，覆盖所有功能：

```bash
# 运行平台工具测试
npm test tests/unit/utils/platform.test.ts

# 运行所有测试
npm test

# 查看测试覆盖率
npm run test:coverage
```

测试覆盖：
- ✅ 基础平台判断
- ✅ App 平台细分判断
- ✅ 平台信息获取
- ✅ 平台特定选项
- ✅ 功能支持检测
- ✅ 导出方式适配
- ✅ 样式适配
- ✅ 平台特定操作执行
- ✅ 边缘情况处理
- ✅ 类型安全
- ✅ 性能测试

## 注意事项

1. **条件编译**：平台判断函数使用 uniapp 的条件编译指令，在编译时会根据目标平台生成不同的代码。

2. **优先级**：在使用 `getPlatformSpecificOption` 和 `executePlatformSpecific` 时，优先级为：
   - 具体平台 (ios/android) > 通用平台 (weixin/app/h5) > 默认值

3. **功能检测**：使用 `isPlatformFeatureSupported` 在运行时检测功能支持，而不是硬编码平台判断。

4. **样式适配**：使用 `getPlatformStyles` 获取安全区域信息，确保在刘海屏等特殊设备上正确显示。

5. **一致性**：虽然不同平台有不同的交互方式，但应保持一致的视觉风格和用户体验（需求 14.5）。

## 相关需求

- **需求 14.1**：微信小程序平台支持
- **需求 14.2**：iOS 和 Android App 平台支持
- **需求 14.3**：H5 浏览器环境支持
- **需求 14.4**：根据平台特性调整交互方式
- **需求 14.5**：保持一致的视觉风格和用户体验

## 更新日志

### v1.0.0 (2024)
- ✅ 实现基础平台判断功能
- ✅ 添加 iOS/Android 细分判断
- ✅ 实现平台信息获取
- ✅ 实现平台特定选项和操作
- ✅ 实现功能支持检测
- ✅ 实现导出方式和样式适配
- ✅ 完整的单元测试覆盖
