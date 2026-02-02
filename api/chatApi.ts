/**
 * 聊天 API 接口
 * 验证需求 2, 12
 */

import httpClient from './request'
import type { Message, ChatSession } from '../types/chat'
import type { ApiResponse } from '../types/api'

/**
 * 发送咨询消息
 * 验证需求 2.1 - 将消息发送到大模型服务
 * 
 * @param sessionId 会话ID
 * @param message 消息内容
 * @param attachments 附件列表（可选）
 * @returns 返回助手的回复消息
 */
export const sendMessage = async (sessionId: string, message: string, attachments?: any[]): Promise<Message> => {
    const response = await httpClient.post<ApiResponse<Message>>('/api/chat/send', {
        sessionId,
        message,
        attachments
    })

    return response.data
}

/**
 * 流式咨询接口
 * 验证需求 2.2, 12 - 支持流式响应，逐字显示回复内容
 * 
 * @param sessionId 会话ID
 * @param message 消息内容
 * @param onChunk 接收到数据块时的回调函数
 * @param onComplete 流式响应完成时的回调函数
 * @param onError 发生错误时的回调函数
 * @returns 返回取消请求的函数
 */
export const streamChat = async (
    sessionId: string,
    message: string,
    onChunk: (chunk: string) => void,
    onComplete?: (fullMessage: string) => void,
    onError?: (error: Error) => void
): Promise<() => void> => {
    let fullMessage = ''
    let aborted = false

    try {
        // 使用流式请求
        const cancelFn = await httpClient.stream(
            '/api/chat/stream',
            {
                sessionId,
                message
            },
            (chunk: string) => {
                if (aborted) return

                fullMessage += chunk
                onChunk(chunk)
            }
        )

        // 返回取消函数
        return () => {
            aborted = true
            cancelFn()
        }
    } catch (error) {
        if (onError) {
            onError(error as Error)
        }
        throw error
    } finally {
        if (!aborted && onComplete) {
            onComplete(fullMessage)
        }
    }
}

/**
 * 获取会话列表
 * 验证需求 1.1 - 显示所有历史聊天会话
 * 
 * @param page 页码
 * @param pageSize 每页数量
 * @param keyword 搜索关键词
 * @returns 返回会话列表
 */
export const getChatSessions = async (
    page: number = 1,
    pageSize: number = 20,
    keyword?: string
): Promise<{ list: ChatSession[]; total: number }> => {
    const response = await httpClient.get<ApiResponse<{ list: ChatSession[]; total: number }>>(
        '/api/chat/sessions',
        {
            page,
            pageSize,
            keyword
        }
    )

    return response.data
}

/**
 * 获取会话详情
 * 验证需求 1.2 - 打开对应的聊天窗口并加载历史消息
 * 
 * @param sessionId 会话ID
 * @returns 返回会话详情
 */
export const getChatSession = async (sessionId: string): Promise<ChatSession> => {
    const response = await httpClient.get<ApiResponse<ChatSession>>(
        `/api/chat/sessions/${sessionId}`
    )

    return response.data
}

/**
 * 获取会话消息列表
 * 验证需求 1.2 - 加载历史消息
 * 
 * @param sessionId 会话ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 返回消息列表
 */
export const getChatMessages = async (
    sessionId: string,
    page: number = 1,
    pageSize: number = 50
): Promise<{ list: Message[]; total: number }> => {
    const response = await httpClient.get<ApiResponse<{ list: Message[]; total: number }>>(
        `/api/chat/sessions/${sessionId}/messages`,
        {
            page,
            pageSize
        }
    )

    return response.data
}

/**
 * 创建新会话
 * 验证需求 1.4 - 创建新的聊天会话
 * 
 * @param title 会话标题（可选）
 * @returns 返回新创建的会话
 */
export const createChatSession = async (title?: string): Promise<ChatSession> => {
    const response = await httpClient.post<ApiResponse<ChatSession>>('/api/chat/sessions', {
        title
    })

    return response.data
}

/**
 * 删除会话
 * 验证需求 1.3 - 删除会话
 * 
 * @param sessionId 会话ID
 */
export const deleteChatSession = async (sessionId: string): Promise<void> => {
    await httpClient.delete(`/api/chat/sessions/${sessionId}`)
}

/**
 * 重命名会话
 * 验证需求 1.3 - 重命名会话
 * 
 * @param sessionId 会话ID
 * @param title 新标题
 */
export const renameChatSession = async (sessionId: string, title: string): Promise<void> => {
    await httpClient.put(`/api/chat/sessions/${sessionId}`, {
        title
    })
}

/**
 * 清空会话消息
 * 验证需求 1.3, 5.3 - 清空会话消息
 * 
 * @param sessionId 会话ID
 */
export const clearChatSession = async (sessionId: string): Promise<void> => {
    await httpClient.delete(`/api/chat/sessions/${sessionId}/messages`)
}

/**
 * 上传图片
 * 验证需求 3.2 - 压缩图片并上传到服务器
 * 
 * @param filePath 文件路径
 * @returns 返回上传结果
 */
export const uploadImage = async (filePath: string): Promise<{ url: string; size: number }> => {
    const response = await httpClient.upload<ApiResponse<{ url: string; size: number }>>(
        '/api/chat/upload',
        filePath,
        {
            name: 'file'
        }
    )

    return response.data
}

/**
 * 收藏消息
 * 验证需求 2.7 - 收藏消息
 * 
 * @param messageId 消息ID
 */
export const favoriteMessage = async (messageId: string): Promise<void> => {
    await httpClient.post(`/api/chat/messages/${messageId}/favorite`)
}

/**
 * 取消收藏消息
 * 验证需求 2.7 - 取消收藏消息
 * 
 * @param messageId 消息ID
 */
export const unfavoriteMessage = async (messageId: string): Promise<void> => {
    await httpClient.delete(`/api/chat/messages/${messageId}/favorite`)
}

/**
 * 举报消息
 * 验证需求 2.7 - 举报消息
 * 
 * @param messageId 消息ID
 * @param reason 举报原因
 */
export const reportMessage = async (messageId: string, reason: string): Promise<void> => {
    await httpClient.post(`/api/chat/messages/${messageId}/report`, {
        reason
    })
}

/**
 * 更新会话信息
 * 验证需求 1.3 - 更新会话
 * 
 * @param sessionId 会话ID
 * @param updates 更新的字段
 */
export const updateChatSession = async (sessionId: string, updates: Partial<ChatSession>): Promise<void> => {
    await httpClient.put(`/api/chat/sessions/${sessionId}`, updates)
}

/**
 * 收藏会话
 * 验证需求 1.3 - 收藏会话
 * 
 * @param sessionId 会话ID
 */
export const favoriteSession = async (sessionId: string): Promise<void> => {
    await httpClient.post(`/api/chat/sessions/${sessionId}/favorite`)
}

/**
 * 取消收藏会话
 * 验证需求 1.3 - 取消收藏会话
 * 
 * @param sessionId 会话ID
 */
export const unfavoriteSession = async (sessionId: string): Promise<void> => {
    await httpClient.delete(`/api/chat/sessions/${sessionId}/favorite`)
}

/**
 * 接收流式响应
 * 验证需求 2.2, 12 - 接收流式响应数据
 * 
 * @param responseId 响应ID
 * @param onChunk 接收数据块的回调函数
 */
export const receiveStreamingResponse = async (
    responseId: string, 
    onChunk: (chunk: string) => void
): Promise<void> => {
    return httpClient.stream(`/api/chat/stream/${responseId}`, {}, onChunk)
}

/**
 * 取消流式响应
 * 验证需求 4.4 - 取消当前流式响应
 */
export const cancelStreamingResponse = async (): Promise<void> => {
    await httpClient.post('/api/chat/cancel')
}

/**
 * 复制消息内容到剪贴板
 * 验证需求 2.7 - 复制消息内容
 * 
 * @param content 要复制的内容
 */
export const copyMessageContent = async (content: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        uni.setClipboardData({
            data: content,
            success: () => resolve(),
            fail: (error) => reject(new Error('复制失败'))
        })
    })
}
