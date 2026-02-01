# TypeScript 和 Vue 3 配置文档

## 概述

本文档描述了法律助手应用的 TypeScript 和 Vue 3 配置。

## 配置文件

### 1. TypeScript 配置 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,              // 启用严格模式
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "types": [
      "@dcloudio/types",         // uni-app 类型定义
      "vite/client",             // Vite 类型定义
      "vitest/globals"           // Vitest 全局类型
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]             // 路径别名
    }
  }
}
```

**关键配置说明：**
- `strict: true` - 启用 TypeScript 严格模式，确保类型安全
- `jsx: "preserve"` - 保留 JSX 语法，由 Vue 编译器处理
- `types` - 包含 uni-app、Vite 和 Vitest 的类型定义
- `paths` - 配置 `@` 别名指向项目根目录

### 2. Vue 3 配置

#### main.ts - 应用入口

```typescript
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  
  app.use(pinia)
  
  return {
    app,
    pinia
  }
}
```

**关键点：**
- 使用 `createSSRApp` 支持服务端渲染（uni-app 要求）
- 集成 Pinia 状态管理
- 导出工厂函数以支持多端

#### App.vue - 根组件

```vue
<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import '@/styles/common.scss';
</style>
```

**关键点：**
- 使用 `<script setup lang="ts">` 语法（Vue 3 Composition API）
- 使用 uni-app 生命周期钩子
- 支持 SCSS 样式预处理

### 3. 类型声明文件

#### shims-vue.d.ts - Vue 组件类型声明

```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

#### env.d.ts - 环境变量类型声明

```typescript
/// <reference types="vite/client" />
/// <reference types="@dcloudio/types" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 4. Vite 配置 (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      }
    }
  }
})
```

**关键配置：**
- `@dcloudio/vite-plugin-uni` - uni-app Vite 插件
- 路径别名配置
- SCSS 全局变量自动导入

### 5. Vitest 配置 (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './')
    }
  }
})
```

## 依赖包

### 核心依赖

- `vue@^3.3.4` - Vue 3 框架
- `pinia@^2.1.7` - 状态管理
- `@dcloudio/uni-app@^3.0.0` - uni-app 核心
- `@dcloudio/vite-plugin-uni@^3.0.0` - uni-app Vite 插件

### 开发依赖

- `typescript@^5.1.6` - TypeScript 编译器
- `vite@^5.2.8` - 构建工具
- `vitest@^1.0.0` - 测试框架
- `@dcloudio/types@^3.3.2` - uni-app 类型定义
- `@vue/test-utils@^2.4.1` - Vue 测试工具
- `fast-check@^3.13.0` - 属性测试库
- `jsdom@^23.0.0` - DOM 环境模拟
- `sass@^1.66.1` - SCSS 预处理器

## 验证配置

### 1. TypeScript 编译检查

```bash
npx tsc --noEmit
```

应该没有任何错误输出。

### 2. 运行测试

```bash
npm test
```

所有测试应该通过。

### 3. 开发服务器

```bash
# 微信小程序
npm run dev:mp-weixin

# H5
npm run dev:h5

# App
npm run dev:app
```

## TypeScript 严格模式

项目启用了 TypeScript 严格模式，包括：

- `noImplicitAny` - 禁止隐式 any 类型
- `strictNullChecks` - 严格的 null 检查
- `strictFunctionTypes` - 严格的函数类型检查
- `strictBindCallApply` - 严格的 bind/call/apply 检查
- `strictPropertyInitialization` - 严格的属性初始化检查
- `noImplicitThis` - 禁止隐式 this
- `alwaysStrict` - 始终使用严格模式

## Vue 3 Composition API

项目使用 Vue 3 Composition API，主要特性：

- `<script setup>` 语法糖
- `ref` 和 `reactive` 响应式 API
- `computed` 计算属性
- `watch` 和 `watchEffect` 监听器
- 生命周期钩子（`onMounted`, `onUnmounted` 等）
- 组合式函数（Composables）

## 最佳实践

1. **类型定义**：为所有函数参数和返回值添加类型注解
2. **组件 Props**：使用 `defineProps<T>()` 定义类型化的 props
3. **组件 Emits**：使用 `defineEmits<T>()` 定义类型化的事件
4. **状态管理**：在 Pinia store 中使用 TypeScript 类型
5. **API 接口**：为所有 API 请求和响应定义接口类型
6. **避免 any**：尽量避免使用 `any` 类型，使用 `unknown` 或具体类型

## 故障排除

### 问题：找不到模块 '*.vue'

**解决方案**：确保 `shims-vue.d.ts` 文件存在且被 tsconfig.json 包含。

### 问题：uni-app API 没有类型提示

**解决方案**：确保安装了 `@dcloudio/types` 并在 tsconfig.json 的 types 中引用。

### 问题：Vite 插件版本冲突

**解决方案**：使用 `--legacy-peer-deps` 安装依赖，或更新到兼容的版本。

## 参考资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vite 官方文档](https://cn.vitejs.dev/)
- [Vitest 官方文档](https://vitest.dev/)
- [Pinia 官方文档](https://pinia.vuejs.org/zh/)
