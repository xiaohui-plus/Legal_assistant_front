# 调试"获取临时token失败"错误

## 🔍 问题分析

"获取临时token失败"错误通常由以下原因引起：

### 1. API Key 配置问题
- API Key 格式错误
- API Key 未正确配置
- API Key 已过期或无效

### 2. 网络问题
- 无法连接到智谱 AI 服务器
- 请求被防火墙拦截

### 3. 代码逻辑问题
- getToken 方法执行出错
- 异步调用问题

## ✅ 已应用的修复

### 修复 1：简化 getToken 方法

**修复前：**
```typescript
async getToken(): Promise<string> {
    if (zhipuTokenInfo.expireTime > Date.now()) {
        return zhipuTokenInfo.token
    }
    return '33a5b411722d4a4f874779284c28befc.UjaUPpNOylKsklQh'
}
```

**修复后：**
```typescript
async getToken(): Promise<string> {
    const apiKey = '33a5b411722d4a4f874779284c28befc.UjaUPpNOylKsklQh'
    console.log('智谱 AI - 获取 token:', apiKey.substring(0, 10) + '...')
    
    // 更新缓存
    zhipuTokenInfo.token = apiKey
    zhipuTokenInfo.expireTime = Date.now() + 3600000
    
    return apiKey
}
```

**改进点：**
- ✅ 添加了日志输出，方便调试
- ✅ 每次都更新缓存
- ✅ 移除了可能导致问题的条件判断

### 修复 2：明确指定默认模型

```typescript
const defaultLLM: DefaultLLM = {
    provider: 'zhipu',      // 明确指定
    model: 'glm-4-plus'     // 明确指定
}
```

## 🔧 调试步骤

### 步骤 1：清理缓存

在 HBuilderX 中：
```
运行 -> 清理项目缓存
```

### 步骤 2：重新运行项目

```
运行 -> 运行到浏览器 -> Chrome
```

### 步骤 3：查看控制台日志

打开浏览器控制台（F12），查找：
```
智谱 AI - 获取 token: 33a5b411...
```

如果看到这条日志，说明 token 获取成功。

### 步骤 4：发送测试消息

在聊天界面输入：
```
你好
```

### 步骤 5：检查网络请求

在浏览器控制台的 Network 标签中：

1. 查找请求到：`https://open.bigmodel.cn/api/paas/v4/chat/completions`
2. 检查请求头中的 Authorization
3. 查看响应状态码

## 🐛 常见错误及解决方案

### 错误 1：API Key 无效

**错误信息：**
```
获取临时token失败
```

**可能原因：**
- API Key 格式错误
- API Key 已过期
- API Key 被删除

**解决方案：**
1. 登录智谱 AI 控制台：https://open.bigmodel.cn/
2. 进入 API Keys 页面
3. 检查 API Key 是否有效
4. 如果无效，创建新的 API Key
5. 更新配置文件中的 API Key

### 错误 2：网络连接失败

**错误信息：**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**可能原因：**
- 网络连接问题
- 防火墙拦截
- DNS 解析失败

**解决方案：**
1. 检查网络连接
2. 尝试访问：https://open.bigmodel.cn/
3. 检查防火墙设置
4. 尝试使用 VPN

### 错误 3：余额不足

**错误信息：**
```
insufficient_quota
```

**可能原因：**
- 智谱 AI 账户余额不足
- 免费额度用完

**解决方案：**
1. 登录智谱 AI 控制台
2. 查看账户余额
3. 充值或等待免费额度刷新

### 错误 4：请求频率限制

**错误信息：**
```
rate_limit_exceeded
```

**可能原因：**
- 请求过于频繁
- 超过了 API 调用限制

**解决方案：**
1. 等待一段时间后重试
2. 检查是否有重复请求
3. 优化请求频率

## 📊 调试检查清单

运行项目前，确认以下事项：

- [ ] API Key 已正确配置
- [ ] API Key 格式正确（包含点号）
- [ ] 网络连接正常
- [ ] 可以访问 https://open.bigmodel.cn/
- [ ] 智谱 AI 账户有余额
- [ ] 项目缓存已清理
- [ ] 使用最新的代码

## 🔍 详细调试方法

### 方法 1：查看完整错误信息

在浏览器控制台中，查看完整的错误堆栈：

```javascript
// 错误示例
Error: 获取临时token失败
    at requestAiWorker.uts:308
    at ...
```

### 方法 2：测试 API Key

在浏览器控制台中直接测试：

```javascript
fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 33a5b411722d4a4f874779284c28befc.UjaUPpNOylKsklQh'
    },
    body: JSON.stringify({
        model: 'glm-4-plus',
        messages: [{role: 'user', content: '你好'}]
    })
})
.then(res => res.json())
.then(data => console.log('测试结果:', data))
.catch(err => console.error('测试失败:', err))
```

### 方法 3：检查配置加载

在 `uni_modules/uni-ai-x/config.uts` 的 getToken 方法中添加更多日志：

```typescript
async getToken(): Promise<string> {
    console.log('=== 开始获取 token ===')
    const apiKey = '33a5b411722d4a4f874779284c28befc.UjaUPpNOylKsklQh'
    console.log('API Key 长度:', apiKey.length)
    console.log('API Key 前10位:', apiKey.substring(0, 10))
    console.log('=== token 获取完成 ===')
    return apiKey
}
```

## 💡 预防措施

### 1. 定期检查 API Key

- 每月检查一次 API Key 是否有效
- 设置余额预警
- 备份 API Key

### 2. 错误处理

在代码中添加更详细的错误处理：

```typescript
try {
    tmpToken = await config.getToken?.()!
    console.log('Token 获取成功')
} catch (e) {
    console.error('Token 获取失败，详细错误:', e)
    // 显示用户友好的错误信息
}
```

### 3. 监控日志

- 定期查看控制台日志
- 记录 API 调用情况
- 监控错误频率

## 📞 获取帮助

如果问题仍然存在：

1. **查看智谱 AI 文档**
   - https://open.bigmodel.cn/dev/api

2. **检查智谱 AI 状态**
   - 访问官网查看服务状态
   - 查看是否有维护公告

3. **联系技术支持**
   - 智谱 AI 官方技术支持
   - 提供详细的错误日志

## 🎯 快速解决方案

如果急需解决，尝试以下步骤：

1. **重新生成 API Key**
   ```
   1. 登录智谱 AI 控制台
   2. 删除旧的 API Key
   3. 创建新的 API Key
   4. 更新配置文件
   5. 清理缓存并重新运行
   ```

2. **切换到备用模型**
   ```typescript
   // 临时使用更简单的模型
   model: 'glm-4-air'
   ```

3. **检查网络**
   ```
   1. 尝试访问智谱 AI 官网
   2. 检查是否需要 VPN
   3. 尝试使用手机热点
   ```

---

**修复后请重新运行项目并测试！** 🚀
