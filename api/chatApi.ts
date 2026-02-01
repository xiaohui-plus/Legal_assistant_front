/**
 * 聊天 API 接口
 * 验证需求 2, 12
 */

import httpClient from './request'

/**
 * 发送咨询消息
 */
export const sendMessage = async (sessionId: string, message: string) => {
    // 实现待完成
}

/**
 * 流式咨询接口
 */
export const streamChat = async (sessionId: string, message: string, onChunk: (chunk: string) => void) => {
    // 实现待完成
}
