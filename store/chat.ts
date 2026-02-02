/**
 * 聊天状态管理
 * 验证需求 1, 2
 */

import { defineStore } from 'pinia'
import type { ChatSession, Message, MessageStatus, SessionFilter, Attachment } from '../types/chat'
import StorageManager from '../utils/storage'
import { STORAGE_KEYS } from '../utils/constants'
import * as chatApi from '../api/chatApi'

export const useChatStore = defineStore('chat', {
    state: () => ({
        // 会话相关状态
        sessions: [] as ChatSession[],
        currentSession: null as ChatSession | null,
        
        // 消息相关状态
        messages: [] as Message[],
        currentMessage: null as Message | null,
        
        // 搜索和过滤状态
        sessionFilter: {} as SessionFilter,
        
        // 输入状态
        inputText: '',
        isInputFocused: false,
        
        // 加载状态
        loading: false,
        sending: false,
        streaming: false,
        
        // 错误状态
        error: null as string | null,
        
        // 分页状态
        hasMoreSessions: true,
        hasMoreMessages: true,
        currentPage: 1
    }),

    getters: {
        // 获取过滤后的会话列表 - 验证需求 1.5，属性 2：搜索结果匹配关键词
        filteredSessions: (state): ChatSession[] => {
            let filtered = state.sessions

            // 按关键词搜索
            if (state.sessionFilter.keyword) {
                const keyword = state.sessionFilter.keyword.toLowerCase()
                filtered = filtered.filter(session => 
                    session.title.toLowerCase().includes(keyword) ||
                    session.summary.toLowerCase().includes(keyword)
                )
            }

            // 按收藏状态过滤
            if (state.sessionFilter.isFavorite !== undefined) {
                filtered = filtered.filter(session => session.isFavorite === state.sessionFilter.isFavorite)
            }

            // 按更新时间倒序排列
            return filtered.sort((a, b) => b.updatedAt - a.updatedAt)
        },

        // 获取当前会话的消息列表
        currentSessionMessages: (state): Message[] => {
            if (!state.currentSession) return []
            
            return state.messages
                .filter(message => message.sessionId === state.currentSession!.id)
                .sort((a, b) => a.timestamp - b.timestamp)
        },

        // 检查是否可以发送消息 - 验证需求 2.8，属性 5：输入状态控制按钮
        canSendMessage: (state): boolean => {
            return !state.sending && 
                   !state.streaming && 
                   state.inputText.trim().length > 0
        },

        // 获取未读消息总数
        totalUnreadCount: (state): number => {
            return state.sessions.reduce((total, session) => total + session.unreadCount, 0)
        },

        // 获取收藏的会话列表
        favoriteSessionsList: (state): ChatSession[] => {
            return state.sessions.filter(session => session.isFavorite)
        }
    },

    actions: {
        // ==================== 会话管理 ====================

        /**
         * 获取会话列表
         * 验证需求 1.1，属性 1：会话创建增长列表
         */
        async getSessions(refresh = false): Promise<void> {
            if (refresh) {
                this.currentPage = 1
                this.hasMoreSessions = true
            }

            this.loading = true
            this.error = null

            try {
                const response = await chatApi.getChatSessions(
                    this.currentPage,
                    20
                )

                if (refresh) {
                    this.sessions = response.list
                } else {
                    this.sessions.push(...response.list)
                }

                this.hasMoreSessions = response.list.length === 20
                this.currentPage++

                // 保存到本地存储
                await this.saveSessions()
            } catch (error) {
                console.error('获取会话列表失败:', error)
                this.error = '获取会话列表失败，请稍后重试'
            } finally {
                this.loading = false
            }
        },

        /**
         * 创建新会话
         * 验证需求 1.4，属性 1：会话创建增长列表
         */
        async createSession(title?: string): Promise<ChatSession> {
            this.loading = true
            this.error = null

            try {
                const session = await chatApi.createChatSession(title)
                
                // 添加到会话列表开头
                this.sessions.unshift(session)
                this.currentSession = session

                // 保存到本地存储
                await this.saveSessions()

                return session
            } catch (error) {
                console.error('创建会话失败:', error)
                this.error = '创建会话失败，请稍后重试'
                throw error
            } finally {
                this.loading = false
            }
        },

        /**
         * 设置当前会话
         * 验证需求 1.2
         */
        async setCurrentSession(sessionId: string): Promise<void> {
            const session = this.sessions.find(s => s.id === sessionId)
            if (session) {
                this.currentSession = session
                
                // 清空未读计数
                session.unreadCount = 0
                
                // 加载会话消息
                await this.getMessages(sessionId, true)
                
                // 保存到本地存储
                await this.saveSessions()
            }
        },

        /**
         * 更新会话信息
         * 验证需求 1.3
         */
        async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
            try {
                await chatApi.updateChatSession(sessionId, updates)
                
                // 更新本地状态
                const session = this.sessions.find(s => s.id === sessionId)
                if (session) {
                    Object.assign(session, updates, { updatedAt: Date.now() })
                }

                // 更新当前会话
                if (this.currentSession && this.currentSession.id === sessionId) {
                    Object.assign(this.currentSession, updates, { updatedAt: Date.now() })
                }

                // 保存到本地存储
                await this.saveSessions()
            } catch (error) {
                console.error('更新会话失败:', error)
                this.error = '更新会话失败，请稍后重试'
                throw error
            }
        },

        /**
         * 删除会话
         * 验证需求 1.3
         */
        async deleteSession(sessionId: string): Promise<void> {
            try {
                await chatApi.deleteChatSession(sessionId)
                
                // 从会话列表中移除
                const index = this.sessions.findIndex(s => s.id === sessionId)
                if (index >= 0) {
                    this.sessions.splice(index, 1)
                }

                // 如果删除的是当前会话，清空当前状态
                if (this.currentSession && this.currentSession.id === sessionId) {
                    this.currentSession = null
                    this.messages = []
                }

                // 保存到本地存储
                await this.saveSessions()
            } catch (error) {
                console.error('删除会话失败:', error)
                this.error = '删除会话失败，请稍后重试'
                throw error
            }
        },

        /**
         * 收藏/取消收藏会话
         * 验证需求 1.3
         */
        async toggleSessionFavorite(sessionId: string): Promise<void> {
            const session = this.sessions.find(s => s.id === sessionId)
            if (!session) return

            try {
                const newFavoriteStatus = !session.isFavorite
                
                if (newFavoriteStatus) {
                    await chatApi.favoriteSession(sessionId)
                } else {
                    await chatApi.unfavoriteSession(sessionId)
                }

                // 更新本地状态
                session.isFavorite = newFavoriteStatus

                // 更新当前会话
                if (this.currentSession && this.currentSession.id === sessionId) {
                    this.currentSession.isFavorite = newFavoriteStatus
                }

                // 保存到本地存储
                await this.saveSessions()
            } catch (error) {
                console.error('收藏操作失败:', error)
                throw error
            }
        },

        /**
         * 清空会话
         * 验证需求 5.3，属性 15：清空操作清除所有数据
         */
        async clearSession(sessionId: string): Promise<void> {
            try {
                await chatApi.clearChatSession(sessionId)
                
                // 清空消息列表
                this.messages = this.messages.filter(message => message.sessionId !== sessionId)
                
                // 更新会话信息
                const session = this.sessions.find(s => s.id === sessionId)
                if (session) {
                    session.messageCount = 0
                    session.summary = ''
                    session.updatedAt = Date.now()
                }

                // 保存到本地存储
                await this.saveMessages()
                await this.saveSessions()
            } catch (error) {
                console.error('清空会话失败:', error)
                this.error = '清空会话失败，请稍后重试'
                throw error
            }
        },

        // ==================== 消息管理 ====================

        /**
         * 获取消息列表
         * 验证需求 1.2
         */
        async getMessages(sessionId: string, refresh = false): Promise<void> {
            if (refresh) {
                this.hasMoreMessages = true
            }

            this.loading = true
            this.error = null

            try {
                const response = await chatApi.getChatMessages(sessionId, 1, 50)

                if (refresh) {
                    this.messages = this.messages.filter(m => m.sessionId !== sessionId)
                }

                this.messages.push(...response.list)

                // 保存到本地存储
                await this.saveMessages()
            } catch (error) {
                console.error('获取消息列表失败:', error)
                this.error = '获取消息列表失败，请稍后重试'
            } finally {
                this.loading = false
            }
        },

        /**
         * 发送消息
         * 验证需求 2.1，属性 3：消息发送增长列表
         */
        async sendMessage(content: string, attachments?: Attachment[]): Promise<void> {
            if (!this.currentSession || !content.trim()) return

            this.sending = true
            this.error = null

            // 创建用户消息
            const userMessage: Message = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sessionId: this.currentSession.id,
                role: 'user',
                content: content.trim(),
                timestamp: Date.now(),
                status: MessageStatus.SENDING,
                isFavorite: false,
                attachments
            }

            // 添加到消息列表
            this.messages.push(userMessage)

            try {
                // 发送消息到服务器
                const response = await chatApi.sendMessage(this.currentSession.id, content)
                
                // 更新用户消息状态
                userMessage.status = MessageStatus.SENT
                userMessage.id = response.id || userMessage.id

                // 开始接收流式响应
                await this.receiveStreamingResponse(response.id)

                // 更新会话信息
                this.currentSession.messageCount += 2 // 用户消息 + 助手消息
                this.currentSession.updatedAt = Date.now()
                this.currentSession.summary = content.substring(0, 50) + (content.length > 50 ? '...' : '')

                // 清空输入框
                this.inputText = ''

                // 保存到本地存储
                await this.saveMessages()
                await this.saveSessions()
            } catch (error) {
                console.error('发送消息失败:', error)
                userMessage.status = MessageStatus.ERROR
                this.error = '发送消息失败，请稍后重试'
                throw error
            } finally {
                this.sending = false
            }
        },

        /**
         * 接收流式响应
         * 验证需求 2.2, 12，属性 19：流式数据完整性
         */
        async receiveStreamingResponse(responseId: string): Promise<void> {
            if (!this.currentSession) return

            this.streaming = true

            // 创建助手消息
            const assistantMessage: Message = {
                id: responseId,
                sessionId: this.currentSession.id,
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
                status: MessageStatus.STREAMING,
                isFavorite: false
            }

            // 添加到消息列表
            this.messages.push(assistantMessage)

            try {
                // 开始流式接收
                await chatApi.receiveStreamingResponse(responseId, (chunk: string) => {
                    // 逐步更新消息内容 - 验证需求 2.2
                    assistantMessage.content += chunk
                })

                // 流式响应完成
                assistantMessage.status = MessageStatus.RECEIVED
            } catch (error) {
                console.error('接收流式响应失败:', error)
                assistantMessage.status = MessageStatus.ERROR
                assistantMessage.content += '\n\n[消息接收失败，请重试]'
                throw error
            } finally {
                this.streaming = false
                // 保存到本地存储
                await this.saveMessages()
            }
        },

        /**
         * 取消当前响应
         * 验证需求 4.4
         */
        async cancelCurrentResponse(): Promise<void> {
            if (!this.streaming) return

            try {
                await chatApi.cancelStreamingResponse()
                
                // 更新最后一条助手消息的状态
                const lastMessage = this.messages[this.messages.length - 1]
                if (lastMessage && lastMessage.role === 'assistant' && lastMessage.status === MessageStatus.STREAMING) {
                    lastMessage.status = MessageStatus.ERROR
                    lastMessage.content += '\n\n[响应已取消]'
                }

                this.streaming = false
                await this.saveMessages()
            } catch (error) {
                console.error('取消响应失败:', error)
            }
        },

        /**
         * 收藏/取消收藏消息
         * 验证需求 2.7
         */
        async toggleMessageFavorite(messageId: string): Promise<void> {
            const message = this.messages.find(m => m.id === messageId)
            if (!message) return

            try {
                const newFavoriteStatus = !message.isFavorite
                
                if (newFavoriteStatus) {
                    await chatApi.favoriteMessage(messageId)
                } else {
                    await chatApi.unfavoriteMessage(messageId)
                }

                // 更新本地状态
                message.isFavorite = newFavoriteStatus

                // 保存到本地存储
                await this.saveMessages()
            } catch (error) {
                console.error('收藏消息失败:', error)
                throw error
            }
        },

        /**
         * 复制消息内容
         * 验证需求 2.7
         */
        async copyMessage(messageId: string): Promise<void> {
            const message = this.messages.find(m => m.id === messageId)
            if (!message) return

            try {
                await chatApi.copyMessageContent(message.content)
            } catch (error) {
                console.error('复制消息失败:', error)
                throw error
            }
        },

        // ==================== 搜索和过滤 ====================

        /**
         * 设置会话搜索关键词
         * 验证需求 1.5，属性 2：搜索结果匹配关键词
         */
        setSessionSearchKeyword(keyword: string): void {
            this.sessionFilter.keyword = keyword
        },

        /**
         * 设置收藏过滤
         */
        setFavoriteFilter(isFavorite?: boolean): void {
            this.sessionFilter.isFavorite = isFavorite
        },

        /**
         * 清除过滤条件
         */
        clearFilters(): void {
            this.sessionFilter = {}
        },

        // ==================== 输入状态管理 ====================

        /**
         * 更新输入文本
         * 验证需求 2.8, 2.9
         */
        updateInputText(text: string): void {
            this.inputText = text
        },

        /**
         * 设置输入框焦点状态
         * 验证需求 2.10
         */
        setInputFocused(focused: boolean): void {
            this.isInputFocused = focused
        },

        // ==================== 数据持久化 ====================

        /**
         * 保存会话到本地存储
         */
        async saveSessions(): Promise<void> {
            try {
                await StorageManager.set(STORAGE_KEYS.CHAT_SESSIONS, this.sessions)
            } catch (error) {
                console.error('保存会话失败:', error)
            }
        },

        /**
         * 从本地存储加载会话
         */
        async loadSessions(): Promise<void> {
            try {
                const sessions = await StorageManager.get<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS) || []
                this.sessions = sessions
            } catch (error) {
                console.error('加载会话失败:', error)
                this.sessions = []
            }
        },

        /**
         * 保存消息到本地存储
         */
        async saveMessages(): Promise<void> {
            try {
                await StorageManager.set(STORAGE_KEYS.CHAT_MESSAGES, this.messages)
            } catch (error) {
                console.error('保存消息失败:', error)
            }
        },

        /**
         * 从本地存储加载消息
         */
        async loadMessages(): Promise<void> {
            try {
                const messages = await StorageManager.get<Message[]>(STORAGE_KEYS.CHAT_MESSAGES) || []
                this.messages = messages
            } catch (error) {
                console.error('加载消息失败:', error)
                this.messages = []
            }
        },

        /**
         * 清除错误状态
         */
        clearError(): void {
            this.error = null
        },

        /**
         * 重置状态
         */
        reset(): void {
            this.currentSession = null
            this.messages = []
            this.currentMessage = null
            this.sessionFilter = {}
            this.inputText = ''
            this.isInputFocused = false
            this.error = null
            this.currentPage = 1
            this.hasMoreSessions = true
            this.hasMoreMessages = true
        }
    }
})