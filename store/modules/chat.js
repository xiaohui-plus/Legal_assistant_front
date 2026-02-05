/**
 * 对话状态管理 - Vuex版本
 */
import { get, post } from '@/utils/request'
import { generateId } from '@/utils/common'

const state = {
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
}

const getters = {
	// 当前对话
	currentChat: (state) => {
		return state.conversations.find(conv => conv.id === state.currentConversationId)
	},
	
	// 是否有对话
	hasConversations: (state) => state.conversations.length > 0,
	
	// 消息数量
	messageCount: (state) => state.messages.length
}

const mutations = {
	SET_CONVERSATIONS(state, conversations) {
		state.conversations = conversations
	},
	SET_CURRENT_CONVERSATION_ID(state, id) {
		state.currentConversationId = id
	},
	SET_CURRENT_CONVERSATION(state, conversation) {
		state.currentConversation = conversation
	},
	SET_MESSAGES(state, messages) {
		state.messages = messages
	},
	ADD_MESSAGE(state, message) {
		state.messages.push(message)
	},
	UPDATE_MESSAGE(state, { index, message }) {
		if (index !== -1) {
			state.messages.splice(index, 1, message)
		}
	},
	SET_SENDING(state, status) {
		state.sending = status
	},
	SET_LOADING(state, status) {
		state.loading = status
	},
	SET_AI_TYPING(state, status) {
		state.aiTyping = status
	},
	ADD_CONVERSATION(state, conversation) {
		state.conversations.unshift(conversation)
	},
	UPDATE_CONVERSATION(state, { index, conversation }) {
		if (index !== -1) {
			state.conversations.splice(index, 1, conversation)
		}
	},
	REMOVE_CONVERSATION(state, index) {
		state.conversations.splice(index, 1)
	},
	CLEAR_CONVERSATIONS(state) {
		state.conversations = []
		state.currentConversationId = null
		state.currentConversation = null
		state.messages = []
	}
}

const actions = {
	/**
	 * 获取对话列表
	 */
	async getConversations({ commit }) {
		try {
			commit('SET_LOADING', true)
			
			const response = await get('/api/conversations', {}, {
				loading: false
			})
			
			commit('SET_CONVERSATIONS', response.conversations || [])
			
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
			commit('SET_LOADING', false)
		}
	},
	
	/**
	 * 创建新对话
	 */
	async createConversation({ commit }, name = '新对话') {
		try {
			const response = await post('/api/conversations', {
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
			commit('ADD_CONVERSATION', newConversation)
			
			// 设置为当前对话
			commit('SET_CURRENT_CONVERSATION_ID', response.id)
			commit('SET_CURRENT_CONVERSATION', newConversation)
			commit('SET_MESSAGES', [])
			
			return response
		} catch (error) {
			uni.showToast({
				title: error.message || '创建对话失败',
				icon: 'none'
			})
			throw error
		}
	},
	
	/**
	 * 设置当前对话
	 */
	async setCurrentConversation({ commit, dispatch }, conversationId) {
		commit('SET_CURRENT_CONVERSATION_ID', conversationId)
		
		const conversation = state.conversations.find(conv => conv.id === conversationId)
		commit('SET_CURRENT_CONVERSATION', conversation)
		
		// 清空消息列表
		commit('SET_MESSAGES', [])
		
		// 获取对话消息
		if (conversationId) {
			await dispatch('getMessages', conversationId)
		}
	},
	
	/**
	 * 获取对话消息
	 */
	async getMessages({ commit }, conversationId) {
		try {
			commit('SET_LOADING', true)
			
			const response = await get(`/api/conversations/${conversationId}/messages`, {}, {
				loading: false
			})
			
			commit('SET_MESSAGES', response.messages || [])
			
			return response
		} catch (error) {
			console.error('获取消息失败:', error)
			uni.showToast({
				title: '获取消息失败',
				icon: 'none'
			})
			throw error
		} finally {
			commit('SET_LOADING', false)
		}
	},
	
	/**
	 * 发送消息
	 */
	async sendMessage({ commit, dispatch }, { content, useStream = true }) {
		if (!state.currentConversationId) {
			throw new Error('没有当前对话')
		}
		
		try {
			commit('SET_SENDING', true)
			
			// 添加用户消息到本地
			const userMessage = {
				id: generateId(),
				conversation_id: state.currentConversationId,
				sender: 'user',
				content,
				create_time: new Date().toISOString()
			}
			
			commit('ADD_MESSAGE', userMessage)
			
			// 更新对话信息
			dispatch('updateConversationLastMessage', content)
			
			// 生成AI回复
			const aiResponse = await dispatch('generateAIResponse', content)
			
			// 添加AI回复
			const aiMessage = {
				id: generateId(),
				conversation_id: state.currentConversationId,
				sender: 'ai',
				content: aiResponse,
				create_time: new Date().toISOString()
			}
			
			commit('ADD_MESSAGE', aiMessage)
			dispatch('updateConversationLastMessage', aiResponse)
			
			return true
		} catch (error) {
			console.error('发送消息失败:', error)
			uni.showToast({
				title: error.message || '发送失败',
				icon: 'none'
			})
			throw error
		} finally {
			commit('SET_SENDING', false)
			commit('SET_AI_TYPING', false)
		}
	},
	
	/**
	 * 生成AI回复
	 */
	async generateAIResponse({ commit }, userContent) {
		try {
			commit('SET_AI_TYPING', true)
			
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
			return getLocalResponse(userContent)
		} finally {
			commit('SET_AI_TYPING', false)
		}
	},
	
	/**
	 * 更新对话最后消息
	 */
	updateConversationLastMessage({ commit }, content) {
		if (state.currentConversation) {
			const updatedConversation = {
				...state.currentConversation,
				last_message: content.length > 50 
					? content.substring(0, 50) + '...' 
					: content,
				last_message_time: new Date().toISOString(),
				update_time: new Date().toISOString()
			}
			
			commit('SET_CURRENT_CONVERSATION', updatedConversation)
			
			// 更新对话列表中的对话
			const index = state.conversations.findIndex(conv => conv.id === state.currentConversationId)
			if (index !== -1) {
				commit('UPDATE_CONVERSATION', { index, conversation: updatedConversation })
				
				// 将当前对话移到列表顶部
				if (index > 0) {
					commit('REMOVE_CONVERSATION', index)
					commit('ADD_CONVERSATION', updatedConversation)
				}
			}
		}
	},
	
	/**
	 * 删除对话
	 */
	async deleteConversation({ commit }, conversationId) {
		try {
			// 从本地列表中删除
			const index = state.conversations.findIndex(conv => conv.id === conversationId)
			if (index !== -1) {
				commit('REMOVE_CONVERSATION', index)
			}
			
			// 如果删除的是当前对话，清空当前对话
			if (state.currentConversationId === conversationId) {
				commit('SET_CURRENT_CONVERSATION_ID', null)
				commit('SET_CURRENT_CONVERSATION', null)
				commit('SET_MESSAGES', [])
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
	clearAllConversations({ commit }) {
		commit('CLEAR_CONVERSATIONS')
	}
}

/**
 * 本地模拟回复（后备方案）
 */
function getLocalResponse(userContent) {
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
}

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
}