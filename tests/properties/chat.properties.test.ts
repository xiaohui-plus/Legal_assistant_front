/**
 * 聊天状态管理 - 属性测试
 * Feature: legal-assistant-app
 * 
 * 验证需求 1, 2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { setActivePinia, createPinia } from 'pinia'
import { useChatStore } from '../../src/store/chat'
import type { ChatSession, Message } from '../../src/types/chat'
import { MessageStatus } from '../../src/types/chat'
import * as chatApi from '../../src/api/chatApi'
import StorageManager from '../../src/utils/storage'

// Mock dependencies
vi.mock('../../src/utils/storage')
vi.mock('../../src/api/chatApi')

const mockStorageManager = vi.mocked(StorageManager)
const mockChatApi = vi.mocked(chatApi)

// Mock uni API
global.uni = {
    setClipboardData: vi.fn().mockImplementation((options: any) => {
        options.success?.()
    })
} as any

describe('Chat Store - Property-Based Tests', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
        mockStorageManager.set.mockResolvedValue()
        mockStorageManager.get.mockResolvedValue(null)
    })

    /**
     * 属性 1：会话创建增长列表
     * 
     * 对于任意初始会话列表状态，当创建新会话时，
     * 会话列表的长度应该增加 1，且新会话应该出现在列表中。
     * 
     * **Validates: Requirements 1.4**
     */
    describe('Property 1: 会话创建增长列表', () => {
        it('should increase session list length by 1 when creating a new session', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // 生成初始会话列表
                    fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1 }),
                            title: fc.string(),
                            summary: fc.string(),
                            createdAt: fc.integer({ min: 0 }),
                            updatedAt: fc.integer({ min: 0 }),
                            messageCount: fc.integer({ min: 0 }),
                            isFavorite: fc.boolean(),
                            unreadCount: fc.integer({ min: 0 })
                        }),
                        { maxLength: 20 }
                    ),
                    // 生成新会话数据
                    fc.record({
                        id: fc.string({ minLength: 1 }),
                        title: fc.string(),
                        summary: fc.string(),
                        createdAt: fc.integer({ min: 0 }),
                        updatedAt: fc.integer({ min: 0 }),
                        messageCount: fc.integer({ min: 0 }),
                        isFavorite: fc.boolean(),
                        unreadCount: fc.integer({ min: 0 })
                    }),
                    async (initialSessions, newSession) => {
                        const store = useChatStore()

                        // 设置初始状态
                        store.sessions = [...initialSessions] as ChatSession[]
                        const initialLength = store.sessions.length

                        // Mock API 返回新会话
                        mockChatApi.createChatSession.mockResolvedValue(newSession as ChatSession)

                        // 创建新会话
                        const result = await store.createSession(newSession.title)

                        // 验证：列表长度增加 1
                        expect(store.sessions.length).toBe(initialLength + 1)

                        // 验证：新会话出现在列表中（应该在开头）
                        expect(store.sessions[0]).toEqual(newSession)

                        // 验证：返回的会话与新会话一致
                        expect(result).toEqual(newSession)

                        // 验证：新会话被设置为当前会话
                        expect(store.currentSession).toEqual(newSession)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain all existing sessions when creating a new one', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1 }),
                            title: fc.string(),
                            summary: fc.string(),
                            createdAt: fc.integer({ min: 0 }),
                            updatedAt: fc.integer({ min: 0 }),
                            messageCount: fc.integer({ min: 0 }),
                            isFavorite: fc.boolean(),
                            unreadCount: fc.integer({ min: 0 })
                        }),
                        { minLength: 1, maxLength: 10 }
                    ),
                    fc.record({
                        id: fc.string({ minLength: 1 }),
                        title: fc.string(),
                        summary: fc.string(),
                        createdAt: fc.integer({ min: 0 }),
                        updatedAt: fc.integer({ min: 0 }),
                        messageCount: fc.integer({ min: 0 }),
                        isFavorite: fc.boolean(),
                        unreadCount: fc.integer({ min: 0 })
                    }),
                    async (initialSessions, newSession) => {
                        const store = useChatStore()

                        // 设置初始状态
                        store.sessions = [...initialSessions] as ChatSession[]
                        const sessionIds = initialSessions.map(s => s.id)

                        // Mock API
                        mockChatApi.createChatSession.mockResolvedValue(newSession as ChatSession)

                        // 创建新会话
                        await store.createSession(newSession.title)

                        // 验证：所有原有会话仍然存在
                        for (const id of sessionIds) {
                            expect(store.sessions.some(s => s.id === id)).toBe(true)
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * 属性 2：搜索结果匹配关键词
     * 
     * 对于任意搜索关键词和数据集合（会话列表），
     * 搜索返回的所有结果都应该在其标题、摘要中包含该关键词（不区分大小写）。
     * 
     * **Validates: Requirements 1.5**
     */
    describe('Property 2: 搜索结果匹配关键词', () => {
        it('should return only sessions that match the search keyword', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // 生成会话列表
                    fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1 }),
                            title: fc.string({ minLength: 1 }),
                            summary: fc.string({ minLength: 1 }),
                            createdAt: fc.integer({ min: 0 }),
                            updatedAt: fc.integer({ min: 0 }),
                            messageCount: fc.integer({ min: 0 }),
                            isFavorite: fc.boolean(),
                            unreadCount: fc.integer({ min: 0 })
                        }),
                        { minLength: 5, maxLength: 20 }
                    ),
                    // 生成搜索关键词
                    fc.string({ minLength: 1, maxLength: 10 }),
                    async (sessions, keyword) => {
                        const store = useChatStore()

                        // 设置会话列表
                        store.sessions = sessions as ChatSession[]

                        // 设置搜索关键词
                        store.setSessionSearchKeyword(keyword)

                        // 获取过滤结果
                        const filtered = store.filteredSessions

                        // 验证：所有结果都包含关键词（不区分大小写）
                        const lowerKeyword = keyword.toLowerCase()
                        for (const session of filtered) {
                            const matchesTitle = session.title.toLowerCase().includes(lowerKeyword)
                            const matchesSummary = session.summary.toLowerCase().includes(lowerKeyword)
                            expect(matchesTitle || matchesSummary).toBe(true)
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should not return sessions that do not match the keyword', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1 }),
                            title: fc.string({ minLength: 1 }),
                            summary: fc.string({ minLength: 1 }),
                            createdAt: fc.integer({ min: 0 }),
                            updatedAt: fc.integer({ min: 0 }),
                            messageCount: fc.integer({ min: 0 }),
                            isFavorite: fc.boolean(),
                            unreadCount: fc.integer({ min: 0 })
                        }),
                        { minLength: 5, maxLength: 20 }
                    ),
                    fc.string({ minLength: 1, maxLength: 10 }),
                    async (sessions, keyword) => {
                        const store = useChatStore()

                        store.sessions = sessions as ChatSession[]
                        store.setSessionSearchKeyword(keyword)

                        const filtered = store.filteredSessions
                        const lowerKeyword = keyword.toLowerCase()

                        // 验证：所有未匹配的会话都不在结果中
                        const unmatchedSessions = sessions.filter(s => {
                            const matchesTitle = s.title.toLowerCase().includes(lowerKeyword)
                            const matchesSummary = s.summary.toLowerCase().includes(lowerKeyword)
                            return !matchesTitle && !matchesSummary
                        })

                        for (const unmatched of unmatchedSessions) {
                            expect(filtered.some(s => s.id === unmatched.id)).toBe(false)
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should be case-insensitive', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1, maxLength: 10 }),
                    async (baseKeyword) => {
                        const store = useChatStore()

                        // 创建包含关键词的会话（不同大小写）
                        const sessions: ChatSession[] = [
                            {
                                id: '1',
                                title: baseKeyword.toLowerCase(),
                                summary: '',
                                createdAt: 1000,
                                updatedAt: 1000,
                                messageCount: 0,
                                isFavorite: false,
                                unreadCount: 0
                            },
                            {
                                id: '2',
                                title: baseKeyword.toUpperCase(),
                                summary: '',
                                createdAt: 2000,
                                updatedAt: 2000,
                                messageCount: 0,
                                isFavorite: false,
                                unreadCount: 0
                            },
                            {
                                id: '3',
                                title: '',
                                summary: baseKeyword.toLowerCase(),
                                createdAt: 3000,
                                updatedAt: 3000,
                                messageCount: 0,
                                isFavorite: false,
                                unreadCount: 0
                            }
                        ]

                        store.sessions = sessions

                        // 使用不同大小写的关键词搜索
                        store.setSessionSearchKeyword(baseKeyword.toLowerCase())
                        const lowerResults = store.filteredSessions.length

                        store.setSessionSearchKeyword(baseKeyword.toUpperCase())
                        const upperResults = store.filteredSessions.length

                        // 验证：不同大小写的搜索结果数量相同
                        expect(lowerResults).toBe(upperResults)
                        expect(lowerResults).toBeGreaterThan(0)
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * 属性 3：消息发送增长列表
     * 
     * 对于任意聊天会话和有效消息内容，发送消息后，
     * 该会话的消息列表长度应该增加 1，且新消息应该出现在消息列表中。
     * 
     * **Validates: Requirements 2.1**
     */
    describe('Property 3: 消息发送增长列表', () => {
        it('should increase message list length when sending a message', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // 生成初始消息列表
                    fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1 }),
                            sessionId: fc.constant('test-session'),
                            role: fc.constantFrom('user' as const, 'assistant' as const),
                            content: fc.string(),
                            timestamp: fc.integer({ min: 0 }),
                            status: fc.constantFrom(
                                MessageStatus.SENDING,
                                MessageStatus.SENT,
                                MessageStatus.RECEIVED,
                                MessageStatus.ERROR
                            ),
                            isFavorite: fc.boolean()
                        }),
                        { maxLength: 20 }
                    ),
                    // 生成消息内容（确保trim后不为空）
                    fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
                    async (initialMessages, messageContent) => {
                        const store = useChatStore()

                        // 设置当前会话
                        store.currentSession = {
                            id: 'test-session',
                            title: '测试会话',
                            summary: '',
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                            messageCount: 0,
                            isFavorite: false,
                            unreadCount: 0
                        }

                        // 设置初始消息列表
                        store.messages = [...initialMessages] as Message[]
                        const initialLength = store.messages.length

                        // Mock API 响应
                        const mockResponse: Message = {
                            id: 'response-id',
                            sessionId: 'test-session',
                            role: 'assistant',
                            content: '助手回复',
                            timestamp: Date.now(),
                            status: MessageStatus.RECEIVED,
                            isFavorite: false
                        }
                        mockChatApi.sendMessage.mockResolvedValue(mockResponse)
                        mockChatApi.receiveStreamingResponse.mockImplementation(async (id, onChunk) => {
                            onChunk('助手回复')
                        })

                        // 发送消息
                        await store.sendMessage(messageContent)

                        // 验证：消息列表长度增加（用户消息 + 助手消息）
                        expect(store.messages.length).toBeGreaterThanOrEqual(initialLength + 2)

                        // 验证：用户消息出现在列表中
                        const userMessage = store.messages.find(
                            m => m.role === 'user' && m.content === messageContent.trim()
                        )
                        expect(userMessage).toBeDefined()
                        expect(userMessage!.sessionId).toBe('test-session')
                    }
                ),
                { numRuns: 50 }
            )
        })

        it('should not send message when content is empty or whitespace', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc.constant(''),
                        fc.constant('   '),
                        fc.constant('\t'),
                        fc.constant('\n')
                    ),
                    async (emptyContent) => {
                        const store = useChatStore()

                        store.currentSession = {
                            id: 'test-session',
                            title: '测试会话',
                            summary: '',
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                            messageCount: 0,
                            isFavorite: false,
                            unreadCount: 0
                        }

                        const initialLength = store.messages.length

                        // 尝试发送空消息
                        await store.sendMessage(emptyContent)

                        // 验证：消息列表长度不变
                        expect(store.messages.length).toBe(initialLength)

                        // 验证：API 未被调用
                        expect(mockChatApi.sendMessage).not.toHaveBeenCalled()
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * 属性 5：输入状态控制按钮
     * 
     * 对于任意输入框状态，当输入框为空或系统正在加载时，发送按钮应该被禁用；
     * 当输入框有内容且系统空闲时，发送按钮应该被启用。
     * 
     * **Validates: Requirements 2.8**
     */
    describe('Property 5: 输入状态控制按钮', () => {
        it('should disable send button when input is empty', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc.constant(''),
                        fc.constant('   '),
                        fc.constant('\t\n  ')
                    ),
                    fc.boolean(), // sending state
                    fc.boolean(), // streaming state
                    async (emptyInput, sending, streaming) => {
                        const store = useChatStore()

                        store.inputText = emptyInput
                        store.sending = sending
                        store.streaming = streaming

                        // 验证：输入为空时，按钮应该被禁用
                        expect(store.canSendMessage).toBe(false)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should disable send button when sending or streaming', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    fc.boolean(),
                    fc.boolean(),
                    async (input, sending, streaming) => {
                        const store = useChatStore()

                        store.inputText = input
                        store.sending = sending
                        store.streaming = streaming

                        // 验证：发送中或流式响应中时，按钮应该被禁用
                        if (sending || streaming) {
                            expect(store.canSendMessage).toBe(false)
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should enable send button when input has content and system is idle', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
                    async (input) => {
                        const store = useChatStore()

                        store.inputText = input
                        store.sending = false
                        store.streaming = false

                        // 验证：有内容且系统空闲时，按钮应该被启用
                        expect(store.canSendMessage).toBe(true)
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * 属性 15：清空操作清除所有数据
     * 
     * 对于任意聊天会话，执行清空操作后，该会话的消息列表应该为空。
     * 
     * **Validates: Requirements 5.3**
     */
    describe('Property 15: 清空操作清除所有数据', () => {
        it('should clear all messages for the specified session', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }), // session ID
                    fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1 }),
                            sessionId: fc.string({ minLength: 1 }),
                            role: fc.constantFrom('user' as const, 'assistant' as const),
                            content: fc.string(),
                            timestamp: fc.integer({ min: 0 }),
                            status: fc.constantFrom(
                                MessageStatus.SENT,
                                MessageStatus.RECEIVED
                            ),
                            isFavorite: fc.boolean()
                        }),
                        { minLength: 1, maxLength: 50 }
                    ),
                    async (sessionId, messages) => {
                        const store = useChatStore()

                        // 设置消息列表（包含目标会话和其他会话的消息）
                        const targetMessages = messages.map(m => ({ ...m, sessionId }))
                        const otherMessages = messages.map(m => ({ ...m, sessionId: 'other-session' }))
                        store.messages = [...targetMessages, ...otherMessages] as Message[]

                        // 设置会话列表
                        store.sessions = [{
                            id: sessionId,
                            title: '测试会话',
                            summary: '原摘要',
                            createdAt: 1000,
                            updatedAt: 2000,
                            messageCount: targetMessages.length,
                            isFavorite: false,
                            unreadCount: 0
                        }]

                        // Mock API
                        mockChatApi.clearChatSession.mockResolvedValue()

                        // 清空会话
                        await store.clearSession(sessionId)

                        // 验证：目标会话的消息已清空
                        const remainingTargetMessages = store.messages.filter(m => m.sessionId === sessionId)
                        expect(remainingTargetMessages.length).toBe(0)

                        // 验证：其他会话的消息保留
                        const remainingOtherMessages = store.messages.filter(m => m.sessionId === 'other-session')
                        expect(remainingOtherMessages.length).toBe(otherMessages.length)

                        // 验证：会话信息已更新
                        const session = store.sessions.find(s => s.id === sessionId)
                        expect(session!.messageCount).toBe(0)
                        expect(session!.summary).toBe('')
                    }
                ),
                { numRuns: 50 }
            )
        })
    })
})
