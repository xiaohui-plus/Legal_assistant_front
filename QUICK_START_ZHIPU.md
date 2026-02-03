# 智谱 AI 快速开始（3 分钟配置）

## 🚀 快速配置步骤

### 第 1 步：获取智谱 AI API Key（1 分钟）

1. 访问：https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入控制台 -> API Keys
4. 点击"创建新的 API Key"
5. 复制生成的 API Key

**API Key 格式示例：**
```
1234567890abcdef1234567890abcdef.12345678
```

### 第 2 步：配置项目（1 分钟）

打开文件：`uni_modules/uni-ai-x/config.uts`

找到这一行：
```typescript
return 'your-zhipu-api-key'
```

替换为你的 API Key：
```typescript
return '1234567890abcdef1234567890abcdef.12345678'
```

保存文件。

### 第 3 步：运行项目（1 分钟）

在 HBuilderX 中：
```
运行 -> 运行到浏览器 -> Chrome
```

等待编译完成，浏览器会自动打开。

## ✅ 测试对话

在聊天界面输入：
```
你好，请用一句话介绍智谱 AI
```

如果 AI 正常响应，说明配置成功！🎉

## 📝 当前配置

你的项目已经配置为使用智谱 AI，包含以下模型：

| 模型 | 特点 | 推荐场景 |
|------|------|----------|
| glm-4-plus | 最强大 | 复杂任务、专业领域 |
| glm-4-flash | 快速响应 ⭐ | 日常对话（推荐） |
| glm-4-air | 超快响应 | 简单问答 |
| glm-4-long | 长文本 | 文档分析 |
| glm-4v-plus | 支持图片 | 图片理解 |

默认使用：**glm-4-plus**（可在配置中修改）

## 🔧 切换默认模型

如果想使用更快的模型，编辑 `uni_modules/uni-ai-x/config.uts`：

找到文件末尾的：
```typescript
const defaultLLM: DefaultLLM = {
    provider: providerNameList[0]!,
    model: llmModelMap.get(providerNameList[0])?.models?.[0].name!
}
```

改为：
```typescript
const defaultLLM: DefaultLLM = {
    provider: 'zhipu',
    model: 'glm-4-flash'  // 推荐：速度快且性价比高
}
```

## 💰 费用说明

智谱 AI 按使用量计费：

- 新用户通常有免费额度
- glm-4-flash 和 glm-4-air 价格最低
- 可在控制台查看余额和使用情况

## ❓ 遇到问题？

### 问题 1：提示 "API Key 无效"

**检查：**
- API Key 是否完整复制（包含点号）
- 是否有多余的空格
- API Key 是否在智谱 AI 控制台中有效

### 问题 2：没有响应

**检查：**
- 网络连接是否正常
- 控制台是否有错误信息
- 智谱 AI 账户余额是否充足

### 问题 3：响应很慢

**解决：**
切换到更快的模型：
```typescript
model: 'glm-4-flash'  // 或 'glm-4-air'
```

## 📚 更多信息

- 详细配置：查看 `ZHIPU_AI_CONFIG.md`
- 项目说明：查看 `README.md`
- 运行指南：查看 `RUN_GUIDE.md`

## 🎯 下一步

配置成功后，你可以：

1. ✅ 测试不同的问题
2. ✅ 尝试不同的模型
3. ✅ 自定义界面样式
4. ✅ 添加更多功能

---

**提示：** 记得保存配置文件后重新运行项目！
