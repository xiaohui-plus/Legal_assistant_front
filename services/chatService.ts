/**
 * 聊天服务
 * 验证需求 1, 2, 4, 5
 */

import type { ChatSession, Message, MessageStatus, Attachment } from '../types/chat'
import { useChatStore } from '../store/chat'
import * as chatApi from '../api/chatApi'

/**
 * ChatManager - 聊天管理器
 * 
 * 提供高级聊天功能，包括会话管理、消息处理、错误恢复等
 * 
 * 验证需求：
 * - 需求 1: 聊天会话管理
 * - 需求 2: 智能法律咨询
 * - 需求 4: 聊天异常处理
 * - 需求 5: 聊天会话操作
 */
export class ChatManager {
    private chatStore = useChatStore()
    private currentStreamingController: AbortController | null = null
    private retryCount = 0
    private maxRetries = 3

    // ==================== 会话管理 ====================

    /**
     * 初始化聊天管理器
     * 验证需求 1.6 - 重新加载会话列表数据
     */
    async initialize(): Promise<void> {
        try {
            // 从本地存储加载数据
            await this.chatStore.loadSessions()
            await this.chatStore.loadMessages()
            
            // 尝试从服务器同步最新数据
            await this.syncWithServer()
        } catch (error) {
            console.error('初始化聊天管理器失败:', error)
        }
    }

    /**
     * 与服务器同步数据
     */
    private async syncWithServer(): Promise<void> {
        try {
            await this.chatStore.getSessions(true)
        } catch (error) {
            console.log('服务器同步失败，使用本地数据:', error)
        }
    }

    /**
     * 创建新的聊天会话
     * 验证需求 1.4 - 创建新的聊天会话并打开聊天窗口
     */
    async createNewSession(title?: string): Promise<ChatSession> {
        try {
            const session = await this.chatStore.createSession(title)
            return session
        } catch (error) {
            console.error('创建会话失败:', error)
            throw new Error('创建会话失败，请稍后重试')
        }
    }

    /**
     * 切换到指定会话
     * 验证需求 1.2 - 打开对应的聊天窗口并加载历史消息
     */
    async switchToSession(sessionId: string): Promise<void> {
        try {
            await this.chatStore.setCurrentSession(sessionId)
        } catch (error) {
            console.error('切换会话失败:', error)
            throw new Error('切换会话失败，请稍后重试')
        }
    }

    /**
     * 重命名会话
     * 验证需求 1.3 - 提供重命名选项
     */
    async renameSession(sessionId: string, newTitle: string): Promise<void> {
        try {
            await this.chatStore.updateSession(sessionId, { title: newTitle })
        } catch (error) {
            console.error('重命名会话失败:', error)
            throw new Error('重命名会话失败，请稍后重试')
        }
    }

    /**
     * 删除会话
     * 验证需求 1.3 - 提供删除选项
     */
    async deleteSession(sessionId: string): Promise<void> {
        try {
            await this.chatStore.deleteSession(sessionId)
        } catch (error) {
            console.error('删除会话失败:', error)
            throw new Error('删除会话失败，请稍后重试')
        }
    }

    /**
     * 清空会话
     * 验证需求 1.3, 5.3 - 提供清空选项，删除当前会话的所有消息记录
     */
    async clearSession(sessionId: string): Promise<void> {
        try {
            await this.chatStore.clearSession(sessionId)
        } catch (error) {
            console.error('清空会话失败:', error)
            throw new Error('清空会话失败，请稍后重试')
        }
    }

    /**
     * 收藏/取消收藏会话
     * 验证需求 1.3 - 提供收藏功能
     */
    async toggleSessionFavorite(sessionId: string): Promise<void> {
        try {
            await this.chatStore.toggleSessionFavorite(sessionId)
        } catch (error) {
            console.error('收藏操作失败:', error)
            throw new Error('收藏操作失败，请稍后重试')
        }
    }

    /**
     * 保存对话
     * 验证需求 5.1 - 将当前会话标记为已保存并存储到本地
     */
    async saveSession(sessionId: string): Promise<void> {
        try {
            await this.chatStore.updateSession(sessionId, { 
                isFavorite: true,
                updatedAt: Date.now()
            })
        } catch (error) {
            console.error('保存对话失败:', error)
            throw new Error('保存对话失败，请稍后重试')
        }
    }

    // ==================== 消息处理 ====================

    /**
     * 发送消息
     * 验证需求 2.1 - 将消息添加到聊天记录并发送到大模型服务
     */
    async sendMessage(content: string, attachments?: Attachment[]): Promise<void> {
        if (!content.trim()) {
            throw new Error('消息内容不能为空')
        }

        if (!this.chatStore.currentSession) {
            throw new Error('请先选择或创建一个会话')
        }

        try {
            this.retryCount = 0
            await this.chatStore.sendMessage(content, attachments)
        } catch (error) {
            console.error('发送消息失败:', error)
            await this.handleSendError(content, attachments, error)
        }
    }

    /**
     * 处理发送错误
     * 验证需求 4.1, 4.2 - 显示网络异常提示并提供重试选项
     */
    private async handleSendError(content: string, attachments: Attachment[] | undefined, error: any): Promise<void> {
        this.retryCount++

        if (this.retryCount <= this.maxRetries) {
            // 自动重试
            console.log(`消息发送失败，正在重试 (${this.retryCount}/${this.maxRetries})...`)
            
            try {
                await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount)) // 递增延迟
                await this.chatStore.sendMessage(content, attachments)
            } catch (retryError) {
                await this.handleSendError(content, attachments, retryError)
            }
        } else {
            // 超过最大重试次数
            const errorMessage = this.getErrorMessage(error)
            throw new Error(errorMessage)
        }
    }

    /**
     * 获取错误消息
     * 验证需求 4.2 - 显示友好的错误提示信息
     */
    private getErrorMessage(error: any): string {
        if (error.message?.includes('network') || error.message?.includes('timeout')) {
            return '网络连接失败，请检查网络后重试'
        } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
            return '使用次数已达上限，请升级会员或明天再试'
        } else if (error.message?.includes('content')) {
            return '消息内容不符合规范，请修改后重试'
        } else {
            return '发送失败，请稍后重试'
        }
    }

    /**
     * 取消当前响应
     * 验证需求 4.4 - 终止当前请求并恢复输入状态
     */
    async cancelCurrentResponse(): Promise<void> {
        try {
            if (this.currentStreamingController) {
                this.currentStreamingController.abort()
                this.currentStreamingController = null
            }
            
            await this.chatStore.cancelCurrentResponse()
        } catch (error) {
            console.error('取消响应失败:', error)
        }
    }

    /**
     * 重新发送消息
     * 验证需求 4 - 提供重试功能
     */
    async resendMessage(messageId: string): Promise<void> {
        const message = this.chatStore.messages.find(m => m.id === messageId)
        if (!message || message.role !== 'user') {
            throw new Error('无法重新发送此消息')
        }

        try {
            await this.sendMessage(message.content, message.attachments)
        } catch (error) {
            console.error('重新发送消息失败:', error)
            throw error
        }
    }

    // ==================== 消息操作 ====================

    /**
     * 收藏/取消收藏消息
     * 验证需求 2.7 - 提供收藏选项
     */
    async toggleMessageFavorite(messageId: string): Promise<void> {
        try {
            await this.chatStore.toggleMessageFavorite(messageId)
        } catch (error) {
            console.error('收藏消息失败:', error)
            throw new Error('收藏消息失败，请稍后重试')
        }
    }

    /**
     * 复制消息内容
     * 验证需求 2.7 - 提供复制选项
     */
    async copyMessage(messageId: string): Promise<void> {
        try {
            await this.chatStore.copyMessage(messageId)
        } catch (error) {
            console.error('复制消息失败:', error)
            throw new Error('复制消息失败，请稍后重试')
        }
    }

    /**
     * 举报消息
     * 验证需求 2.7 - 提供举报选项
     */
    async reportMessage(messageId: string, reason: string): Promise<void> {
        try {
            await chatApi.reportMessage(messageId, reason)
        } catch (error) {
            console.error('举报消息失败:', error)
            throw new Error('举报消息失败，请稍后重试')
        }
    }

    // ==================== 搜索和过滤 ====================

    /**
     * 搜索会话
     * 验证需求 1.5 - 过滤并显示匹配的历史会话
     */
    searchSessions(keyword: string): void {
        this.chatStore.setSessionSearchKeyword(keyword)
    }

    /**
     * 过滤收藏会话
     */
    filterFavoriteSessions(showFavoriteOnly: boolean): void {
        this.chatStore.setFavoriteFilter(showFavoriteOnly ? true : undefined)
    }

    /**
     * 清除搜索过滤
     */
    clearSearchFilters(): void {
        this.chatStore.clearFilters()
    }

    // ==================== 输入处理 ====================

    /**
     * 更新输入文本
     * 验证需求 2.8, 2.9 - 处理输入框内容
     */
    updateInput(text: string): void {
        this.chatStore.updateInputText(text)
    }

    /**
     * 设置输入焦点
     * 验证需求 2.10 - 调整聊天窗口布局以适配键盘高度
     */
    setInputFocus(focused: boolean): void {
        this.chatStore.setInputFocused(focused)
    }

    /**
     * 检查是否可以发送消息
     * 验证需求 2.8 - 禁用发送按钮的条件
     */
    canSendMessage(): boolean {
        return this.chatStore.canSendMessage
    }

    // ==================== 数据管理 ====================

    /**
     * 刷新会话列表
     * 验证需求 1.6 - 重新加载会话列表数据
     */
    async refreshSessions(): Promise<void> {
        try {
            await this.chatStore.getSessions(true)
        } catch (error) {
            console.error('刷新会话列表失败:', error)
            throw new Error('刷新失败，请稍后重试')
        }
    }

    /**
     * 加载更多会话
     */
    async loadMoreSessions(): Promise<void> {
        try {
            await this.chatStore.getSessions(false)
        } catch (error) {
            console.error('加载更多会话失败:', error)
            throw new Error('加载失败，请稍后重试')
        }
    }

    /**
     * 获取会话统计信息
     */
    getSessionStats(): {
        totalSessions: number
        favoriteSessions: number
        totalMessages: number
        unreadCount: number
    } {
        return {
            totalSessions: this.chatStore.sessions.length,
            favoriteSessions: this.chatStore.favoriteSessionsList.length,
            totalMessages: this.chatStore.messages.length,
            unreadCount: this.chatStore.totalUnreadCount
        }
    }

    // ==================== 错误恢复 ====================

    /**
     * 恢复中断的会话
     * 验证需求 4 - 数据错误恢复机制
     */
    async recoverInterruptedSession(): Promise<void> {
        try {
            // 检查是否有未完成的流式响应
            const streamingMessage = this.chatStore.messages.find(
                m => m.status === MessageStatus.STREAMING
            )

            if (streamingMessage) {
                // 标记为错误状态
                streamingMessage.status = MessageStatus.ERROR
                streamingMessage.content += '\n\n[连接中断，请重新发送]'
                
                await this.chatStore.saveMessages()
            }
        } catch (error) {
            console.error('恢复中断会话失败:', error)
        }
    }

    /**
     * 清理无效数据
     */
    async cleanupInvalidData(): Promise<void> {
        try {
            // 清理状态异常的消息
            const validMessages = this.chatStore.messages.filter(message => {
                return message.content && message.sessionId && message.timestamp
            })

            if (validMessages.length !== this.chatStore.messages.length) {
                this.chatStore.messages = validMessages
                await this.chatStore.saveMessages()
            }

            // 清理空会话
            const validSessions = this.chatStore.sessions.filter(session => {
                return session.title && session.id
            })

            if (validSessions.length !== this.chatStore.sessions.length) {
                this.chatStore.sessions = validSessions
                await this.chatStore.saveSessions()
            }
        } catch (error) {
            console.error('清理无效数据失败:', error)
        }
    }

    // ==================== 工具方法 ====================

    /**
     * 获取当前会话
     */
    getCurrentSession(): ChatSession | null {
        return this.chatStore.currentSession
    }

    /**
     * 获取当前会话的消息列表
     */
    getCurrentMessages(): Message[] {
        return this.chatStore.currentSessionMessages
    }

    /**
     * 获取过滤后的会话列表
     */
    getFilteredSessions(): ChatSession[] {
        return this.chatStore.filteredSessions
    }

    /**
     * 检查是否正在发送消息
     */
    isSending(): boolean {
        return this.chatStore.sending
    }

    /**
     * 检查是否正在接收流式响应
     */
    isStreaming(): boolean {
        return this.chatStore.streaming
    }

    /**
     * 获取错误信息
     */
    getError(): string | null {
        return this.chatStore.error
    }

    /**
     * 清除错误信息
     */
    clearError(): void {
        this.chatStore.clearError()
    }
}

// 创建单例实例
export const chatManager = new ChatManager()

// 默认导出
export default chatManager

/**
 * MessageHandler - 消息处理器
 * 
 * 专门处理消息相关的业务逻辑，包括消息格式化、验证、转换等
 * 
 * 验证需求：
 * - 需求 2: 智能法律咨询
 * - 需求 3: 消息上传功能
 * - 需求 4: 聊天异常处理
 */
export class MessageHandler {
    private maxMessageLength = 2000
    private maxAttachmentSize = 10 * 1024 * 1024 // 10MB
    private allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    // ==================== 消息验证 ====================

    /**
     * 验证消息内容
     * 验证需求 2.1 - 验证用户输入的消息内容
     */
    validateMessage(content: string): { valid: boolean; error?: string } {
        if (!content || !content.trim()) {
            return { valid: false, error: '消息内容不能为空' }
        }

        if (content.length > this.maxMessageLength) {
            return { valid: false, error: `消息长度不能超过 ${this.maxMessageLength} 个字符` }
        }

        // 检查是否包含敏感内容
        if (this.containsSensitiveContent(content)) {
            return { valid: false, error: '消息包含敏感内容，请修改后重试' }
        }

        return { valid: true }
    }

    /**
     * 验证附件
     * 验证需求 3.1, 3.2 - 验证上传的图片附件
     */
    validateAttachments(attachments: Attachment[]): { valid: boolean; error?: string } {
        if (!attachments || attachments.length === 0) {
            return { valid: true }
        }

        if (attachments.length > 5) {
            return { valid: false, error: '最多只能上传 5 个附件' }
        }

        for (const attachment of attachments) {
            // 检查文件大小
            if (attachment.size > this.maxAttachmentSize) {
                return { valid: false, error: `文件 ${attachment.name} 大小超过限制 (10MB)` }
            }

            // 检查图片类型
            if (attachment.type === 'image' && !this.allowedImageTypes.includes(this.getImageMimeType(attachment.url))) {
                return { valid: false, error: `不支持的图片格式: ${attachment.name}` }
            }
        }

        return { valid: true }
    }

    /**
     * 检查敏感内容
     */
    private containsSensitiveContent(content: string): boolean {
        const sensitiveWords = [
            '违法', '犯罪', '暴力', '色情', '赌博', '毒品',
            '政治敏感', '恐怖主义', '分裂国家'
        ]

        const lowerContent = content.toLowerCase()
        return sensitiveWords.some(word => lowerContent.includes(word))
    }

    /**
     * 获取图片 MIME 类型
     */
    private getImageMimeType(url: string): string {
        const extension = url.split('.').pop()?.toLowerCase()
        switch (extension) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg'
            case 'png':
                return 'image/png'
            case 'gif':
                return 'image/gif'
            case 'webp':
                return 'image/webp'
            default:
                return 'image/jpeg'
        }
    }

    // ==================== 消息格式化 ====================

    /**
     * 格式化消息内容
     * 验证需求 2.3 - 正确渲染 markdown 格式
     */
    formatMessageContent(content: string): string {
        if (!content) return ''

        // 处理换行
        let formatted = content.replace(/\n/g, '<br>')

        // 处理 markdown 格式
        formatted = this.processMarkdown(formatted)

        // 处理链接
        formatted = this.processLinks(formatted)

        // 处理提及
        formatted = this.processMentions(formatted)

        return formatted
    }

    /**
     * 处理 Markdown 格式
     */
    private processMarkdown(content: string): string {
        // 粗体
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        content = content.replace(/__(.*?)__/g, '<strong>$1</strong>')

        // 斜体
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>')
        content = content.replace(/_(.*?)_/g, '<em>$1</em>')

        // 代码
        content = content.replace(/`(.*?)`/g, '<code>$1</code>')

        // 列表
        content = content.replace(/^\* (.+)$/gm, '<li>$1</li>')
        content = content.replace(/^- (.+)$/gm, '<li>$1</li>')
        content = content.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')

        // 包装列表
        content = content.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')

        return content
    }

    /**
     * 处理链接
     */
    private processLinks(content: string): string {
        const urlRegex = /(https?:\/\/[^\s]+)/g
        return content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>')
    }

    /**
     * 处理提及
     */
    private processMentions(content: string): string {
        const mentionRegex = /@(\w+)/g
        return content.replace(mentionRegex, '<span class="mention">@$1</span>')
    }

    // ==================== 消息转换 ====================

    /**
     * 将消息转换为显示格式
     */
    toDisplayMessage(message: Message): {
        id: string
        role: 'user' | 'assistant'
        content: string
        formattedContent: string
        timestamp: string
        status: MessageStatus
        isFavorite: boolean
        attachments?: Attachment[]
        canRetry: boolean
        canCopy: boolean
        canFavorite: boolean
    } {
        return {
            id: message.id,
            role: message.role,
            content: message.content,
            formattedContent: this.formatMessageContent(message.content),
            timestamp: this.formatTimestamp(message.timestamp),
            status: message.status,
            isFavorite: message.isFavorite,
            attachments: message.attachments,
            canRetry: message.role === 'user' && message.status === MessageStatus.ERROR,
            canCopy: message.content.length > 0,
            canFavorite: message.status === MessageStatus.RECEIVED || message.status === MessageStatus.SENT
        }
    }

    /**
     * 格式化时间戳
     */
    private formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 1) {
            return '刚刚'
        } else if (diffMins < 60) {
            return `${diffMins}分钟前`
        } else if (diffHours < 24) {
            return `${diffHours}小时前`
        } else if (diffDays < 7) {
            return `${diffDays}天前`
        } else {
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    }

    // ==================== 消息搜索 ====================

    /**
     * 搜索消息
     */
    searchMessages(messages: Message[], keyword: string): Message[] {
        if (!keyword || !keyword.trim()) {
            return messages
        }

        const searchTerm = keyword.toLowerCase().trim()
        return messages.filter(message => 
            message.content.toLowerCase().includes(searchTerm)
        )
    }

    /**
     * 按日期分组消息
     */
    groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
        const grouped: Record<string, Message[]> = {}

        messages.forEach(message => {
            const date = new Date(message.timestamp)
            const dateKey = date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })

            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }
            grouped[dateKey].push(message)
        })

        return grouped
    }

    // ==================== 消息统计 ====================

    /**
     * 获取消息统计信息
     */
    getMessageStats(messages: Message[]): {
        total: number
        userMessages: number
        assistantMessages: number
        favoriteMessages: number
        errorMessages: number
        averageLength: number
    } {
        const userMessages = messages.filter(m => m.role === 'user')
        const assistantMessages = messages.filter(m => m.role === 'assistant')
        const favoriteMessages = messages.filter(m => m.isFavorite)
        const errorMessages = messages.filter(m => m.status === MessageStatus.ERROR)

        const totalLength = messages.reduce((sum, m) => sum + m.content.length, 0)
        const averageLength = messages.length > 0 ? Math.round(totalLength / messages.length) : 0

        return {
            total: messages.length,
            userMessages: userMessages.length,
            assistantMessages: assistantMessages.length,
            favoriteMessages: favoriteMessages.length,
            errorMessages: errorMessages.length,
            averageLength
        }
    }

    // ==================== 消息导出 ====================

    /**
     * 导出消息为文本格式
     */
    exportMessagesToText(messages: Message[], sessionTitle: string): string {
        const header = `# ${sessionTitle}\n导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`
        
        const content = messages.map(message => {
            const timestamp = new Date(message.timestamp).toLocaleString('zh-CN')
            const role = message.role === 'user' ? '用户' : '助手'
            return `## ${role} (${timestamp})\n${message.content}\n`
        }).join('\n')

        return header + content
    }

    /**
     * 导出消息为 JSON 格式
     */
    exportMessagesToJSON(messages: Message[], sessionTitle: string): string {
        const exportData = {
            title: sessionTitle,
            exportTime: new Date().toISOString(),
            messages: messages.map(message => ({
                id: message.id,
                role: message.role,
                content: message.content,
                timestamp: message.timestamp,
                status: message.status,
                isFavorite: message.isFavorite,
                attachments: message.attachments
            }))
        }

        return JSON.stringify(exportData, null, 2)
    }
}

// 创建单例实例
export const messageHandler = new MessageHandler()

// 导出 MessageHandler 类
export { MessageHandler }