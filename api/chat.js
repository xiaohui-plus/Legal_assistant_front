/**
 * 对话相关API
 */
import { get, post } from '@/utils/request'

/**
 * 获取对话列表
 */
export const getConversations = () => {
	return get('/api/conversations')
}

/**
 * 创建新对话
 */
export const createConversation = (name) => {
	return post('/api/conversations', { name })
}

/**
 * 获取对话消息
 */
export const getMessages = (conversationId) => {
	return get(`/api/conversations/${conversationId}/messages`)
}

/**
 * 发送消息到后端API
 */
export const sendMessage = (message) => {
	return post('/api/chat', {
		message: message
	})
}

/**
 * 发送消息（流式）- 暂时使用同步方式
 */
export const sendStreamMessage = (message) => {
	return sendMessage(message)
}