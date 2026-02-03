# 智谱 AI 配置指南

## 📝 关于智谱 AI

智谱 AI 是由清华大学技术成果转化的人工智能公司，提供 GLM 系列大语言模型服务。

官网：https://open.bigmodel.cn/

## 🔑 获取 API Key

### 1. 注册账号

访问：https://open.bigmodel.cn/
- 点击"注册/登录"
- 使用手机号或邮箱注册

### 2. 获取 API Key

1. 登录后进入控制台
2. 点击左侧菜单"API Keys"
3. 点击"创建新的 API Key"
4. 复制生成的 API Key（格式类似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxx`）

⚠️ **重要：** API Key 只显示一次，请妥善保存！

### 3. 查看额度

- 新用户通常有免费额度
- 在控制台可以查看剩余额度
- 可以充值购买更多额度

## ⚙️ 配置步骤

### 方式一：直接配置 API Key（开发测试）

编辑 `uni_modules/uni-ai-x/config.uts` 文件：

```typescript
[
    'zhipu', {
        models: [
            { name: 'glm-4-plus'},
            { name: 'glm-4-flash'},
            { name: 'glm-4-air'},
            { name: 'glm-4-long'},
            { name: 'glm-4v-plus', image: true}
        ],
        description: '智谱AI - 清华技术成果转化的人工智能公司',
        baseURL: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
        async getToken(): Promise<string> {
            // 将下面的字符串替换为你的 API Key
            return 'your-zhipu-api-key'
        }
    }
]
```

**替换步骤：**
1. 找到 `return 'your-zhipu-api-key'` 这一行
2. 将 `your-zhipu-api-key` 替换为你的实际 API Key
3. 保存文件

**示例：**
```typescript
return '1234567890abcdef1234567890abcdef.12345678'
```

### 方式二：从服务器获取 Token（生产环境推荐）

如果你有自己的后端服务器：

```typescript
async getToken(): Promise<string> {
    const res = await uni.request({
        url: 'https://your-backend.com/api/zhipu-token',
        method: 'GET',
        header: {
            'Authorization': 'Bearer ' + uni.getStorageSync('userToken')
        }
    })
    
    if (res.statusCode != 200) {
        throw new Error('获取智谱AI token失败')
    }
    
    return res.data.token
}
```

**后端接口示例（Node.js）：**
```javascript
app.get('/api/zhipu-token', (req, res) => {
    // 验证用户身份
    const userToken = req.headers.authorization;
    
    // 返回智谱 API Key
    res.json({
        token: process.env.ZHIPU_API_KEY,
        expiresAt: Date.now() + 3600000 // 1小时后过期
    });
});
```

## 🎯 支持的模型

智谱 AI 提供多个模型，已在配置中添加：

### 1. GLM-4-Plus
- **特点：** 最强大的模型，综合能力最佳
- **适用：** 复杂任务、专业领域
- **速度：** 较慢
- **成本：** 较高

### 2. GLM-4-Flash
- **特点：** 快速响应，性价比高
- **适用：** 日常对话、简单任务
- **速度：** 很快
- **成本：** 较低

### 3. GLM-4-Air
- **特点：** 轻量级，超快响应
- **适用：** 简单对话、快速问答
- **速度：** 极快
- **成本：** 最低

### 4. GLM-4-Long
- **特点：** 支持超长上下文（128K tokens）
- **适用：** 长文本分析、文档处理
- **速度：** 较慢
- **成本：** 较高

### 5. GLM-4V-Plus
- **特点：** 支持图像理解（多模态）
- **适用：** 图片分析、视觉问答
- **速度：** 较慢
- **成本：** 最高

## 🔧 完整配置示例

```typescript
// uni_modules/uni-ai-x/config.uts

import {reactive} from 'vue';
import {LLMModel, Provider, DefaultLLM, LLmTokenInfo, Userinfo} from '@/uni_modules/uni-ai-x/types.uts';

// 用户信息配置
export const currentUser: Userinfo = reactive<Userinfo>({
    _id: 'user-001',
    nickname: '智谱用户',
    avatar_file: {
        url: '/static/logo.png'
    }
})

export const userCenterPage = '/pages/user/user'

// 智谱 AI Token 缓存
const zhipuTokenInfo: LLmTokenInfo = {token: '', expireTime: 0}

const llmModelMap = new Map<string, Provider>([
    [
        'zhipu', {
            models: [
                { name: 'glm-4-plus'},
                { name: 'glm-4-flash'},
                { name: 'glm-4-air'},
                { name: 'glm-4-long'},
                { name: 'glm-4v-plus', image: true}
            ],
            description: '智谱AI - 清华技术成果转化的人工智能公司',
            baseURL: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
            async getToken(): Promise<string> {
                // 替换为你的 API Key
                return 'your-zhipu-api-key-here'
            }
        }
    ]
])

const providerNameList: string[] = []
llmModelMap.forEach((_, key: string) => {
    providerNameList.push(key)
})

// 设置默认模型为智谱 AI
const defaultLLM: DefaultLLM = {
    provider: 'zhipu',
    model: 'glm-4-flash'  // 推荐使用 flash 版本，速度快且性价比高
}

export default llmModelMap
export { llmModelMap, type LLMModel, providerNameList, defaultLLM }
```

## 🖼️ 添加 Logo（可选）

为了在界面上显示智谱 AI 的 logo：

1. 下载智谱 AI 的 logo 图片
2. 重命名为 `zhipu.png`
3. 放到目录：`uni_modules/uni-ai-x/static/ai-provider/`

**临时方案：**
如果暂时没有 logo，可以复制其他 logo：
```bash
# 在项目目录执行
copy uni_modules\uni-ai-x\static\ai-provider\openai.png uni_modules\uni-ai-x\static\ai-provider\zhipu.png
```

## ✅ 测试配置

配置完成后，测试是否正常工作：

### 1. 运行项目

```
在 HBuilderX 中：
运行 -> 运行到浏览器 -> Chrome
```

### 2. 发送测试消息

在聊天界面输入：
```
你好，请介绍一下你自己
```

### 3. 检查响应

- ✅ AI 正常响应 → 配置成功
- ❌ 提示错误 → 检查以下内容：
  - API Key 是否正确
  - 网络是否正常
  - 控制台错误信息

## 🐛 常见问题

### Q1: 提示 "API Key 无效"

**原因：**
- API Key 输入错误
- API Key 已过期或被删除

**解决：**
1. 重新检查 API Key 是否正确
2. 确认 API Key 格式：`xxxxxxxx.xxxxxxxx`
3. 在智谱 AI 控制台重新生成

### Q2: 提示 "余额不足"

**原因：**
- 免费额度用完
- 账户余额为 0

**解决：**
1. 登录智谱 AI 控制台
2. 查看余额
3. 充值或等待免费额度刷新

### Q3: 响应很慢

**原因：**
- 使用了较慢的模型（如 glm-4-plus）
- 网络延迟

**解决：**
1. 切换到 `glm-4-flash` 或 `glm-4-air`
2. 检查网络连接

### Q4: 无法连接服务器

**原因：**
- 网络问题
- 防火墙拦截
- baseURL 配置错误

**解决：**
1. 检查网络连接
2. 确认 baseURL 为：`https://open.bigmodel.cn/api/paas/v4/chat/completions`
3. 尝试在浏览器访问智谱 AI 官网

## 💡 使用建议

### 1. 模型选择

- **日常对话：** 使用 `glm-4-flash`（推荐）
- **复杂任务：** 使用 `glm-4-plus`
- **快速问答：** 使用 `glm-4-air`
- **长文本：** 使用 `glm-4-long`
- **图片分析：** 使用 `glm-4v-plus`

### 2. 成本优化

- 优先使用 flash 和 air 版本
- 避免频繁调用 plus 版本
- 合理设置对话历史长度

### 3. 安全建议

- ⚠️ 不要在客户端代码中硬编码 API Key（生产环境）
- ✅ 使用服务器端接口获取 token
- ✅ 定期更换 API Key
- ✅ 监控 API 使用情况

## 📊 价格参考

智谱 AI 采用按量计费：

- **GLM-4-Air：** 约 ¥0.001/千tokens
- **GLM-4-Flash：** 约 ¥0.001/千tokens
- **GLM-4-Plus：** 约 ¥0.05/千tokens
- **GLM-4-Long：** 约 ¥0.05/千tokens
- **GLM-4V-Plus：** 约 ¥0.05/千tokens

*注：具体价格以官网为准*

## 🔗 相关链接

- 官网：https://open.bigmodel.cn/
- 文档：https://open.bigmodel.cn/dev/api
- 控制台：https://open.bigmodel.cn/usercenter/apikeys
- 定价：https://open.bigmodel.cn/pricing

## 📞 获取帮助

- 智谱 AI 官方文档
- 智谱 AI 技术支持
- uni-app 社区：https://ask.dcloud.net.cn/

---

**配置完成后，记得保存文件并重新运行项目！**
