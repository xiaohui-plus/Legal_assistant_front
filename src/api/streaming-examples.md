# 流式请求使用示例

本文档展示如何使用 HttpClient 的增强流式请求功能。

## 基本用法

### 简单的流式请求

```typescript
import httpClient from '@/api/request'

// 基本流式请求
await httpClient.stream(
  '/api/chat/stream',
  { message: '你好，请介绍一下劳动法' },
  (chunk) => {
    // 处理每个接收到的文本片段
    console.log('收到片段:', chunk)
    // 更新UI显示
    displayText += chunk
  }
)
```

## 增强功能

### 1. 完成回调

在流式响应完成时执行特定操作：

```typescript
await httpClient.stream(
  '/api/chat/stream',
  { message: '你好' },
  (chunk) => {
    displayText += chunk
  },
  {
    onComplete: () => {
      console.log('流式响应完成')
      // 保存完整消息到本地存储
      saveMessage(displayText)
      // 隐藏加载指示器
      hideLoadingIndicator()
    }
  }
)
```

### 2. 错误处理

处理流式请求过程中的错误：

```typescript
await httpClient.stream(
  '/api/chat/stream',
  { message: '你好' },
  (chunk) => {
    displayText += chunk
  },
  {
    onError: (error) => {
      console.error('流式请求错误:', error)
      // 显示错误提示
      showErrorToast(error.message)
      // 如果有部分内容，仍然保存
      if (error.data?.partialContent) {
        displayText = error.data.partialContent
        savePartialMessage(displayText)
      }
    },
    onComplete: () => {
      console.log('流式响应成功完成')
    }
  }
)
```

### 3. 请求取消

取消正在进行的流式请求：

```typescript
// 启动流式请求时指定requestId
const requestId = 'chat-stream-123'

const streamPromise = httpClient.stream(
  '/api/chat/stream',
  { message: '请详细介绍劳动法的所有内容...' },
  (chunk) => {
    displayText += chunk
  },
  {
    requestId,
    onComplete: () => {
      console.log('完成')
    }
  }
)

// 用户点击"取消回复"按钮时
function onCancelClick() {
  const cancelled = httpClient.cancelStream(requestId)
  if (cancelled) {
    console.log('已取消流式请求')
    showToast('已取消回复')
  }
}
```

### 4. 自定义超时

设置更长的超时时间用于复杂查询：

```typescript
await httpClient.stream(
  '/api/chat/stream',
  { message: '请分析这个复杂的法律案例...' },
  (chunk) => {
    displayText += chunk
  },
  {
    timeout: 120000, // 2分钟超时
    onComplete: () => {
      console.log('分析完成')
    }
  }
)
```

## 完整示例：聊天窗口集成

```typescript
import { ref } from 'vue'
import httpClient from '@/api/request'

export function useChatStream() {
  const currentMessage = ref('')
  const isStreaming = ref(false)
  const currentRequestId = ref<string | null>(null)

  async function sendMessage(message: string) {
    currentMessage.value = ''
    isStreaming.value = true
    currentRequestId.value = `stream-${Date.now()}`

    try {
      await httpClient.stream(
        '/api/chat/stream',
        { message },
        (chunk) => {
          // 逐字显示（打字机效果）
          currentMessage.value += chunk
        },
        {
          requestId: currentRequestId.value,
          timeout: 60000,
          onComplete: () => {
            console.log('回复完成')
            isStreaming.value = false
            currentRequestId.value = null
            // 保存完整消息
            saveMessageToHistory(currentMessage.value)
          },
          onError: (error) => {
            console.error('流式请求失败:', error)
            isStreaming.value = false
            currentRequestId.value = null
            
            // 如果有部分内容，仍然显示
            if (error.data?.partialContent) {
              currentMessage.value = error.data.partialContent
              showToast('回复被中断，已保存部分内容')
            } else {
              showToast('回复失败，请重试')
            }
          }
        }
      )
    } catch (error) {
      console.error('发送消息失败:', error)
      isStreaming.value = false
      currentRequestId.value = null
    }
  }

  function cancelCurrentStream() {
    if (currentRequestId.value) {
      const cancelled = httpClient.cancelStream(currentRequestId.value)
      if (cancelled) {
        isStreaming.value = false
        currentRequestId.value = null
        showToast('已取消回复')
      }
    }
  }

  return {
    currentMessage,
    isStreaming,
    sendMessage,
    cancelCurrentStream
  }
}
```

## 支持的响应格式

HttpClient 的流式请求支持多种响应格式：

### 1. SSE (Server-Sent Events) 格式

```
data: {"chunk":"你好"}
data: {"chunk":"，"}
data: {"chunk":"世界"}
data: [DONE]
```

或者：

```
data: {"content":"完整消息"}
data: [DONE]
```

### 2. 分块数组格式

```json
{
  "chunks": ["你好", "，", "世界"]
}
```

### 3. 完整内容格式

```json
{
  "content": "完整的响应内容"
}
```

### 4. 平台特定的真实流式传输

在支持 `onChunkReceived` 的平台上（如某些 App 环境），HttpClient 会自动使用真实的流式传输，实时接收数据块。

## 错误处理和部分内容恢复

当流式请求失败时，HttpClient 会保存已接收的部分内容：

```typescript
try {
  await httpClient.stream(
    '/api/chat/stream',
    { message: '你好' },
    (chunk) => {
      displayText += chunk
    },
    {
      onError: (error) => {
        // error.data 可能包含 partialContent
        if (error.data?.partialContent) {
          console.log('已接收部分内容:', error.data.partialContent)
          // 可以选择显示部分内容
          displayText = error.data.partialContent
        }
      }
    }
  )
} catch (error) {
  // 错误已经通过 onError 回调处理
}
```

## 最佳实践

1. **总是提供 onError 回调**：确保能够优雅地处理错误情况
2. **使用 requestId 支持取消**：对于长时间运行的请求，提供取消功能
3. **保存部分内容**：在错误情况下，尝试保存已接收的部分内容
4. **设置合理的超时**：根据预期响应时间设置超时值
5. **提供用户反馈**：使用 onComplete 回调更新 UI 状态

## 验证需求

此实现验证以下需求：

- **需求 2.2**: 大模型服务返回流式响应，应用系统以打字机效果逐字显示回复内容
- **需求 4.3**: 大模型正在生成回复时，显示加载动效和「取消回复」按钮
- **需求 4.4**: 用户点击「取消回复」，终止当前请求并恢复输入状态
- **需求 12**: 大模型流式响应集成的所有验收标准
