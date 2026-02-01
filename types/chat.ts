/**
 * 聊天相关类型定义
 * 验证需求 1, 2
 */

/**
 * 消息状态
 */
export enum MessageStatus {
    SENDING = 'sending',
    SENT = 'sent',
    RECEIVED = 'received',
    STREAMING = 'streaming',
    ERROR = 'error'
}

/**
 * 聊天会话
 */
export interface ChatSession {
    id: string
    title: string
    summary: string
    createdAt: number
    updatedAt: number
    messageCount: number
    isFavorite: boolean
    unreadCount: number
}

/**
 * 消息
 */
export interface Message {
    id: string
    sessionId: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number
    status: MessageStatus
    isFavorite: boolean
    attachments?: Attachment[]
}

/**
 * 附件
 */
export interface Attachment {
    id: string
    type: 'image' | 'file'
    url: string
    size: number
    name: string
}

/**
 * 会话过滤器
 */
export interface SessionFilter {
    keyword?: string
    isFavorite?: boolean
}

/**
 * 分页参数
 */
export interface Pagination {
    page: number
    pageSize: number
}
