# 配置示例

## 方案一：使用智谱 AI（推荐 - 国内访问快）

智谱 AI 是清华大学技术成果转化的人工智能公司，提供 GLM 系列模型。

### 1. 获取 API Key

1. 注册智谱 AI 账号：https://open.bigmodel.cn/
2. 进入控制台 -> API Keys
3. 创建新的 API Key
4. 复制 API Key（格式：`xxxxxxxx.xxxxxxxx`）

### 2. 配置示例

在 `uni_modules/uni-ai-x/config.uts` 中：

```typescript
[
    'zhipu', {
        models: [
            { name: 'glm-4-plus'},        // 最强模型
            { name: 'glm-4-flash'},       // 快速响应（推荐）
            { name: 'glm-4-air'},         // 超快响应
            { name: 'glm-4-long'},        // 长文本支持
            { name: 'glm-4v-plus', image: true}  // 支持图片
        ],
        description: '智谱AI - 清华技术成果转化的人工智能公司',
        baseURL: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
        async getToken(): Promise<string> {
            // 方式1：直接返回 API Key（仅用于开发测试）
            return 'your-zhipu-api-key-here'
            
            // 方式2：从你的服务器获取 token（推荐用于生产）
            /*
            const res = await uni.request({
                url: 'https://your-backend.com/api/zhipu-token',
                method: 'GET'
            })
            return res.data.token
            */
        }
    }
]
```

**完整配置请查看：`ZHIPU_AI_CONFIG.md`**

## 方案二：使用七牛云

七牛云提供了简单易用的 AI 服务接口。

### 1. 获取 API Key

1. 注册七牛云账号：https://portal.qiniu.com/
2. 进入控制台 -> AI 服务
3. 创建应用并获取 API Key

### 2. 配置示例（非 uniCloud 项目）

在 `uni_modules/uni-ai-x/config.uts` 中：

```typescript
[
    'qiniu', {
        models: [
            { name: 'deepseek-v3'},
            { name: 'deepseek-r1', thinking: true},
            { name: 'doubao-seed-1.6', image: true},
            { name: 'gpt-oss-120b'}
        ],
        description: '七牛云-专注云计算和大数据',
        baseURL: "https://openai.qiniu.com/v1/chat/completions",
        async getToken(): Promise<string> {
            // 方式1：直接返回 API Key（仅用于开发测试）
            // 注意：生产环境不要这样做！
            return 'your-api-key-here'
            
            // 方式2：从你的服务器获取临时 token（推荐）
            /*
            const res = await uni.request({
                url: 'https://your-backend.com/api/ai-token',
                method: 'POST',
                header: {
                    'Authorization': 'Bearer your-user-token'
                }
            })
            return res.data.token
            */
        }
    }
]
```

## 方案二：使用阿里云百炼

### 1. 获取 API Key

1. 注册阿里云账号：https://www.aliyun.com/
2. 开通百炼服务：https://bailian.console.aliyun.com/
3. 获取 API Key

### 2. 配置示例

```typescript
[
    'bailian', {
        models: [
            { name: 'deepseek-v3'},
            { name: 'deepseek-r1', thinking: true },
            { name: 'qwen-turbo'},
            { name: 'qwen-plus', thinking: true }
        ],
        description: '阿里云百炼 - 专注AI技术研究和应用',
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
        async getToken(): Promise<string> {
            return 'your-dashscope-api-key'
        }
    }
]
```

## 方案三：使用 uniCloud（最安全）

如果你的项目使用 uniCloud，可以通过云函数来管理 API Key。

### 1. 配置云函数

在 `uniCloud-alipay/cloudfunctions/uni-ai-x-co/index.obj.js` 中配置：

```javascript
module.exports = {
    async getTmpToken({provider}) {
        // 根据 provider 返回对应的 token
        const tokens = {
            'qiniu': 'your-qiniu-api-key',
            'aliyun-bailian': 'your-aliyun-api-key'
        }
        
        return {
            errCode: 0,
            data: {
                token: tokens[provider],
                expiresAt: Date.now() + 3600000 // 1小时后过期
            }
        }
    }
}
```

### 2. 客户端配置

保持 `uni_modules/uni-ai-x/config.uts` 中的默认配置即可，它会自动调用云函数。

## 完整配置文件示例

```typescript
// uni_modules/uni-ai-x/config.uts
import {reactive} from 'vue';
import {LLMModel, Provider, DefaultLLM, LLmTokenInfo, Userinfo} from '@/uni_modules/uni-ai-x/types.uts';

// 1. 配置用户信息
export const currentUser: Userinfo = reactive<Userinfo>({
    _id: 'demo-user',
    nickname: 'AI 助手用户',
    avatar_file: {
        url: '/static/logo.png'
    }
})

// 2. 用户中心页面（可选）
export const userCenterPage = '/pages/user/user'

// 3. 配置 AI 模型
const llmModelMap = new Map<string, Provider>([
    [
        'qiniu', {
            models: [
                { name: 'deepseek-v3'},
                { name: 'gpt-oss-120b'}
            ],
            description: '七牛云 AI 服务',
            baseURL: "https://openai.qiniu.com/v1/chat/completions",
            async getToken(): Promise<string> {
                // 开发环境：直接返回 API Key
                if (process.env.NODE_ENV === 'development') {
                    return 'your-dev-api-key'
                }
                
                // 生产环境：从服务器获取
                const res = await uni.request({
                    url: 'https://your-api.com/token',
                    method: 'GET'
                })
                return res.data.token
            }
        }
    ]
])

// 4. 设置默认模型
const providerNameList: string[] = []
llmModelMap.forEach((_, key: string) => {
    providerNameList.push(key)
})

const defaultLLM: DefaultLLM = {
    provider: 'qiniu',
    model: 'deepseek-v3'
}

export default llmModelMap
export { llmModelMap, type LLMModel, providerNameList, defaultLLM }
```

## 环境变量配置（可选）

创建 `.env` 文件：

```bash
# 开发环境
VUE_APP_AI_PROVIDER=qiniu
VUE_APP_AI_MODEL=deepseek-v3
VUE_APP_API_KEY=your-api-key-here

# 生产环境使用服务器获取 token
VUE_APP_TOKEN_URL=https://your-api.com/ai-token
```

## 安全建议

1. ⚠️ **永远不要**在客户端代码中硬编码生产环境的 API Key
2. ✅ 使用服务器端接口来获取临时 token
3. ✅ 为 token 设置合理的过期时间
4. ✅ 实现 token 刷新机制
5. ✅ 使用 HTTPS 传输

## 测试配置

配置完成后，运行项目并测试：

1. 打开应用
2. 在输入框输入："你好，请介绍一下自己"
3. 点击发送
4. 查看 AI 是否正常响应

如果遇到问题，检查：
- 控制台是否有错误信息
- API Key 是否正确
- 网络请求是否成功
- token 是否过期
