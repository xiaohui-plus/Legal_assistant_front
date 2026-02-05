/**
 * 对话状态管理
 */
import { defineStore } from 'pinia'
import { get, post } from '@/utils/request'
import { generateId } from '@/utils/common'

export const useChatStore = defineStore('chat', {
	state: () => ({
		// 对话列表
		conversations: [],
		// 当前对话ID
		currentConversationId: null,
		// 当前对话信息
		currentConversation: null,
		// 消息列表
		messages: [],
		// 是否正在发送消息
		sending: false,
		// 是否正在加载
		loading: false,
		// AI是否正在输入
		aiTyping: false
	}),
	
	getters: {
		// 当前对话
		currentChat: (state) => {
			return state.conversations.find(conv => conv.id === state.currentConversationId)
		},
		
		// 是否有对话
		hasConversations: (state) => state.conversations.length > 0,
		
		// 消息数量
		messageCount: (state) => state.messages.length
	},
	
	actions: {
		/**
		 * 获取对话列表
		 */
		async getConversations() {
			try {
				this.loading = true
				
				const response = await get('/v1/conversations', {}, {
					loading: false
				})
				
				this.conversations = response.conversations || []
				
				return response
			} catch (error) {
				console.error('获取对话列表失败:', error)
				// 如果是未登录错误，不显示错误提示
				if (error.status_code !== 401) {
					uni.showToast({
						title: '获取对话列表失败',
						icon: 'none'
					})
				}
				throw error
			} finally {
				this.loading = false
			}
		},
		
		/**
		 * 创建新对话
		 */
		async createConversation(name = '新对话') {
			try {
				const response = await post('/v1/conversations', {
					name
				}, {
					loadingText: '创建对话中...'
				})
				
				const newConversation = {
					id: response.id,
					name: response.name,
					create_time: new Date().toISOString(),
					update_time: new Date().toISOString(),
					last_message: '',
					last_message_time: ''
				}
				
				// 添加到对话列表开头
				this.conversations.unshift(newConversation)
				
				// 设置为当前对话
				this.setCurrentConversation(response.id)
				
				return response
			} catch (error) {
				uni.showToast({
					title: error.detail || '创建对话失败',
					icon: 'none'
				})
				throw error
			}
		},
		
		/**
		 * 设置当前对话
		 */
		setCurrentConversation(conversationId) {
			this.currentConversationId = conversationId
			this.currentConversation = this.conversations.find(conv => conv.id === conversationId)
			
			// 清空消息列表
			this.messages = []
			
			// 获取对话消息
			if (conversationId) {
				this.getMessages(conversationId)
			}
		},
		
		/**
		 * 获取对话消息
		 */
		async getMessages(conversationId) {
			try {
				this.loading = true
				
				const response = await get(`/v1/conversations/${conversationId}/messages`, {}, {
					loading: false
				})
				
				this.messages = response.messages || []
				
				return response
			} catch (error) {
				console.error('获取消息失败:', error)
				uni.showToast({
					title: '获取消息失败',
					icon: 'none'
				})
				throw error
			} finally {
				this.loading = false
			}
		},
		
		/**
		 * 发送消息
		 */
		async sendMessage(content, useStream = true) {
			if (!this.currentConversationId) {
				throw new Error('没有当前对话')
			}
			
			try {
				this.sending = true
				
				// 添加用户消息到本地
				const userMessage = {
					id: generateId(),
					conversation_id: this.currentConversationId,
					sender: 'user',
					content,
					create_time: new Date().toISOString()
				}
				
				this.messages.push(userMessage)
				
				// 更新对话信息
				this.updateConversationLastMessage(content)
				
				// 发送消息到服务器
				const endpoint = useStream ? '/v1/qa/ask-stream' : '/v1/qa/ask'
				
				if (useStream) {
					// 流式响应
					await this.sendStreamMessage(content)
				} else {
					// 同步响应
					const response = await post(endpoint, {
						conversation_id: this.currentConversationId,
						content
					}, {
						loadingText: '发送中...'
					})
					
					// 添加AI回复
					if (response.ai_message) {
						this.messages.push({
							...response.ai_message,
							id: generateId()
						})
						
						this.updateConversationLastMessage(response.ai_message.content)
					}
				}
				
				return true
			} catch (error) {
				console.error('发送消息失败:', error)
				uni.showToast({
					title: error.detail || '发送失败',
					icon: 'none'
				})
				throw error
			} finally {
				this.sending = false
				this.aiTyping = false
			}
		},
		
		/**
		 * 发送流式消息
		 */
		async sendStreamMessage(content) {
			return new Promise((resolve, reject) => {
				// 显示AI正在输入
				this.aiTyping = true
				
				// 创建AI消息占位符
				const aiMessage = {
					id: generateId(),
					conversation_id: this.currentConversationId,
					sender: 'ai',
					content: '',
					create_time: new Date().toISOString()
				}
				
				this.messages.push(aiMessage)
				
				// 模拟流式响应（实际项目中应该使用SSE或WebSocket）
				this.simulateStreamResponse(content, aiMessage)
					.then(resolve)
					.catch(reject)
			})
		},
		
		/**
		 * 模拟流式响应
		 */
		async simulateStreamResponse(userContent, aiMessage) {
			// 生成AI回复内容
			const aiResponse = await this.generateAIResponse(userContent)
			
			// 模拟打字机效果
			let currentIndex = 0
			const typeSpeed = 50 // 打字速度（毫秒）
			
			return new Promise((resolve) => {
				const typeWriter = () => {
					if (currentIndex < aiResponse.length) {
						aiMessage.content += aiResponse[currentIndex]
						currentIndex++
						
						// 更新消息
						const messageIndex = this.messages.findIndex(msg => msg.id === aiMessage.id)
						if (messageIndex !== -1) {
							this.messages[messageIndex] = { ...aiMessage }
						}
						
						setTimeout(typeWriter, typeSpeed)
					} else {
						// 打字完成
						this.aiTyping = false
						this.updateConversationLastMessage(aiMessage.content)
						resolve()
					}
				}
				
				typeWriter()
			})
		},
		
		/**
		 * 生成AI回复
		 */
		async generateAIResponse(userContent) {
			try {
				// 调用后端API
				const response = await post('/api/chat', {
					message: userContent
				}, {
					loading: false
				})
				
				if (response.success) {
					return response.response
				} else {
					throw new Error(response.message || '生成回复失败')
				}
			} catch (error) {
				console.error('调用后端API失败:', error)
				
				// 如果后端调用失败，使用本地模拟回复
				return this.getLocalResponse(userContent)
			}
		},
		
		/**
		 * 本地模拟回复（后备方案）
		 */
		getLocalResponse(userContent) {
			const q = userContent.toLowerCase()
			
			if (q.includes('借款') || q.includes('欠钱') || q.includes('债务')) {
				return `**借贷纠纷法律分析**

根据您的描述，这属于民间借贷纠纷。建议您：

1. **收集证据**
   • 借条或欠条
   • 转账记录
   • 聊天记录
   • 催收记录

2. **协商解决**
   • 先尝试友好协商
   • 可适当减免利息
   • 制定还款计划

3. **法律途径**
   • 向法院起诉
   • 申请财产保全
   • 申请强制执行

**注意事项：**
• 诉讼时效为3年
• 利息不得超过年化15.4%
• 保留所有相关证据

如需更详细的分析，请提供具体情况。`
			}
			
			if (q.includes('劳动') || q.includes('工作') || q.includes('工资')) {
				return `**劳动争议法律指导**

根据《劳动合同法》相关规定：

**试用期规定：**
• 3个月以上不满1年：试用期≤1个月
• 1年以上不满3年：试用期≤2个月  
• 3年以上或无固定期限：试用期≤6个月

**工资保障：**
• 试用期工资≥正式工资的80%
• 工资应按时足额发放
• 加班费按法定标准计算

**维权途径：**
1. 与用人单位协商
2. 向劳动监察部门投诉
3. 申请劳动仲裁
4. 向法院起诉

建议保留劳动合同、工资条等证据材料。`
			}
			
			if (q.includes('离婚') || q.includes('婚姻') || q.includes('夫妻')) {
				return `**离婚相关法律指导**

**协议离婚（推荐）：**
• 适用条件：双方自愿，对子女抚养、财产分割、债务处理达成一致
• 办理流程：准备材料→民政局申请→30天冷静期→领取离婚证

**财产分割原则：**
• 夫妻共同财产平等分割
• 照顾子女和女方权益
• 照顾无过错方
• 个人财产归个人所有

**重要提醒：**
建议先尝试协议离婚，成本低、时间短、对双方伤害小。`
			}
			
			// 默认回复
			return `感谢您的咨询。为了给您提供更准确的法律建议，请详细描述：

**基本情况：**
• 具体发生了什么事情？
• 涉及哪些当事人？
• 有什么证据材料？

**您的诉求：**
• 希望达到什么目标？
• 可接受的解决方案？

**常见法律问题：**
• 合同纠纷、债权债务
• 婚姻家庭、继承纠纷  
• 劳动争议、工伤赔偿
• 交通事故、人身损害

我会根据您提供的具体信息，给出专业的法律分析和建议。`
		},
		
		/**
		 * 更新对话最后消息
		 */
		updateConversationLastMessage(content) {
			if (this.currentConversation) {
				this.currentConversation.last_message = content.length > 50 
					? content.substring(0, 50) + '...' 
					: content
				this.currentConversation.last_message_time = new Date().toISOString()
				this.currentConversation.update_time = new Date().toISOString()
				
				// 更新对话列表中的对话
				const index = this.conversations.findIndex(conv => conv.id === this.currentConversationId)
				if (index !== -1) {
					this.conversations[index] = { ...this.currentConversation }
					
					// 将当前对话移到列表顶部
					if (index > 0) {
						this.conversations.splice(index, 1)
						this.conversations.unshift(this.currentConversation)
					}
				}
			}
		},
		
		/**
		 * 删除对话
		 */
		async deleteConversation(conversationId) {
			try {
				// 这里应该调用删除接口
				// await del(`/v1/conversations/${conversationId}`)
				
				// 从本地列表中删除
				const index = this.conversations.findIndex(conv => conv.id === conversationId)
				if (index !== -1) {
					this.conversations.splice(index, 1)
				}
				
				// 如果删除的是当前对话，清空当前对话
				if (this.currentConversationId === conversationId) {
					this.currentConversationId = null
					this.currentConversation = null
					this.messages = []
				}
				
				uni.showToast({
					title: '删除成功',
					icon: 'success'
				})
			} catch (error) {
				uni.showToast({
					title: '删除失败',
					icon: 'none'
				})
				throw error
			}
		},
		
		/**
		 * 清空所有对话
		 */
		clearAllConversations() {
			this.conversations = []
			this.currentConversationId = null
			this.currentConversation = null
			this.messages = []
		},
		
		/**
		 * 重新生成回复
		 */
		async regenerateResponse(messageId) {
			try {
				// 找到要重新生成的消息
				const messageIndex = this.messages.findIndex(msg => msg.id === messageId)
				if (messageIndex === -1) return
				
				const message = this.messages[messageIndex]
				if (message.sender !== 'ai') return
				
				// 找到对应的用户消息
				const userMessage = this.messages[messageIndex - 1]
				if (!userMessage || userMessage.sender !== 'user') return
				
				this.aiTyping = true
				
				// 重新生成回复
				const newResponse = await this.generateAIResponse(userMessage.content)
				
				// 更新消息内容
				message.content = newResponse
				this.messages[messageIndex] = { ...message }
				
				this.aiTyping = false
				
				uni.showToast({
					title: '重新生成成功',
					icon: 'success'
				})
			} catch (error) {
				this.aiTyping = false
				uni.showToast({
					title: '重新生成失败',
					icon: 'none'
				})
			}
		}
	}
})