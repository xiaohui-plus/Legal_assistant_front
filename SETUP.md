# 安装和配置指南

## 前置要求

本项目依赖以下 uni_modules 模块，需要先安装：

### 1. 安装 uni-cmark（Markdown 解析器）

uni-cmark 是 Markdown 解析模块，用于渲染 AI 返回的 Markdown 格式内容。

**安装方式：**

1. 打开 HBuilderX
2. 在项目根目录右键 -> uni_modules -> 从插件市场导入
3. 搜索 "uni-cmark" 并安装

或者访问：https://ext.dcloud.net.cn/plugin?name=uni-cmark

### 2. 确认已安装的模块

项目已包含以下模块：
- ✅ uni-ai-x（AI 聊天核心模块）
- ✅ uni-highlight（代码高亮）
- ✅ uni-config-center（配置中心）
- ✅ uni-id-common（用户身份）

## 配置步骤

### 步骤 1：配置 AI 服务

编辑 `uni_modules/uni-ai-x/config.uts`：

```typescript
// 1. 选择你的 AI 服务提供商
// 目前支持：qiniu（七牛云）、bailian（阿里云百炼）

// 2. 实现 getToken() 方法
// 如果使用 uniCloud，可以通过云函数获取临时令牌
// 如果不使用 uniCloud，需要请求自己的服务器接口

// 示例：非 uniCloud 项目配置
async getToken(): Promise<string> {
    const res = await uni.request({
        url: 'https://your-server.com/api/get-ai-token',
        method: 'GET'
    })
    if (res.statusCode != 200) {
        throw new Error('获取临时token失败')
    }
    return res.data.token
}
```

### 步骤 2：配置用户信息（可选）

如果需要显示用户头像和昵称，编辑 `uni_modules/uni-ai-x/config.uts`：

```typescript
export const currentUser: Userinfo = reactive<Userinfo>({
    _id: 'user-001',
    nickname: '用户昵称',
    avatar_file: {
        url: '/static/default-avatar.png'
    }
})
```

### 步骤 3：配置 uniCloud（如果使用）

如果你的项目使用 uniCloud：

1. 在 HBuilderX 中关联云服务空间
2. 上传云函数 `uni-ai-x-co`
3. 在云函数中配置 AI 服务的 API Key

云函数位置：`uni_modules/uni-ai-x/uniCloud/cloudfunctions/uni-ai-x-co/`

## 运行项目

### H5 端

```bash
# 在 HBuilderX 中
运行 -> 运行到浏览器 -> Chrome
```

### 微信小程序

```bash
# 在 HBuilderX 中
运行 -> 运行到小程序模拟器 -> 微信开发者工具
```

### App 端

```bash
# 在 HBuilderX 中
运行 -> 运行到手机或模拟器 -> 运行到 Android App 基座
```

## 常见问题

### Q1: 提示找不到 uni-cmark 模块

**解决方案：** 按照上面的步骤安装 uni-cmark 模块

### Q2: AI 无法响应

**检查项：**
1. 确认已正确配置 AI 服务的 token
2. 检查网络连接
3. 查看控制台错误信息

### Q3: Markdown 渲染异常

**解决方案：**
1. 确认 uni-cmark 模块已正确安装
2. 检查 proxy-web 是否正常加载（用于渲染复杂内容）

### Q4: 如何更换 AI 模型

编辑 `uni_modules/uni-ai-x/config.uts`，修改 `defaultLLM`：

```typescript
const defaultLLM: DefaultLLM = {
    provider: 'qiniu',  // 服务商
    model: 'deepseek-v3'  // 改为你想要的模型
}
```

## 开发建议

1. **本地开发**：建议先在 H5 端调试，开发效率更高
2. **真机测试**：部分功能需要在真机上测试（如图片上传）
3. **性能优化**：大量消息时注意虚拟列表优化

## 技术支持

- uni-app 官方文档：https://uniapp.dcloud.net.cn/
- uni-ai-x 插件地址：https://ext.dcloud.net.cn/plugin?name=uni-ai-x
- DCloud 社区：https://ask.dcloud.net.cn/

## 下一步

配置完成后，你可以：

1. 自定义欢迎消息（在 `uni-ai-chat.uvue` 中）
2. 添加更多 AI 模型选项
3. 自定义主题样式
4. 添加更多功能（如语音输入、图片识别等）
