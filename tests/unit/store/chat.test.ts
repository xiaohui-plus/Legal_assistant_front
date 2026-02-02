/**
 * Chat Store 单元测试
 * 验证需求 1, 2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChatStore } from '@/store/chat'
import type { ChatSession, Message, MessageStatus } from '@/types/chat'
import { STORAGE_KEYS } from '@/utils/constants'
import StorageManager from '@/utils/storage'
import * as chatApi from '@/api/chatApi'

// Mock dependencies
vi.mock('@/utils/storage')
vi.mock('@/api/chatApi')

const mockStorageManager = vi.mocked(StorageManager)
const mockChatApi = vi.mocked(chatApi)

describe('Chat Store', () => {
    let store: ReturnType<typeof useChatStore>

    beforeEach(() => {
        setActivePinia(createPinia())
        store = useChatStore()
        vi.clearAllMocks()
        
        // Mock uni API for uniapp environment
        global.uni = {
            setClipboardData: vi.fn().mockImplementation((options: any) => {
                options.success?.()
            })
        } as any
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('初始状态', () => {
        it('应该有正确的初始状态', () => {
            expect(store.sessions).toEqual([])
            expect(store.currentSession).toBeNull()
            expect(store.messages).toEqual([])
            expect(store.currentMessage).toBeNull()
            expect(store.sessionFilter).toEqual({})
            expect(store.inputText).toBe('')
            expect(store.isInputFocused).toBe(false)
            expect(store.loading).toBe(false)
            expect(store.sending).toBe(false)
            expect(store.streaming).toBe(false)
            expect(store.error).toBeNull()
            expect(store.hasMoreSessions).toBe(true)
            expect(store.hasMoreMessages).toBe(true)
            expect(store.currentPage).toBe(1)
        })
    })

    describe('Getters', () => {
        beforeEach(() => {
            // 设置测试数据
            store.sessions = [
                {
                    id: 'session1',
                    title: '法律咨询1',
                    summary: '关于合同纠纷的咨询',
                    createdAt: 1000,
                    updatedAt: 2000,
                    messageCount: 5,
                    isFavorite: true,
                    unreadCount: 2
                },
                {
                    id: 'session2',
                    title: '劳动法咨询',
                    summary: '工资纠纷问题',
                    createdAt: 2000,
                    updatedAt: 3000,
                    messageCount: 3,
                    isFavorite: false,
                    unreadCount: 1
                },
                {
                    id: 'session3',
                    title: '房产纠纷',
                    summary: '租房合同问题',
                    createdAt: 3000,
                    updatedAt: 1000,
                    messageCount: 2,
                    isFavorite: true,
                    unreadCount: 0
                }
            ]

            store.messages = [
                {
                    id: 'msg1',
                    sessionId: 'session1',
                    role: 'user',
                    content: '我有一个合同纠纷问题',
                    timestamp: 1000,
                    status: MessageStatus.SENT,
                    isFavorite: false
                },
                {
                    id: 'msg2',
                    sessionId: 'session1',
                    role: 'assistant',
                    content: '请详细描述您的问题',
                    timestamp: 1100,
                    status: MessageStatus.RECEIVED,
                    isFavorite: false
                },
                {
                    id: 'msg3',
                    sessionId: 'session2',
                    role: 'user',
                    content: '工资被拖欠了',
                    timestamp: 2000,
                    status: MessageStatus.SENT,
                    isFavorite: true
                }
            ]
        })

        describe('filteredSessions', () => {
            it('应该返回按更新时间倒序排列的会话列表', () => {
                const filtered = store.filteredSessions
                expect(filtered).toHaveLength(3)
                expect(filtered[0].id).toBe('session2') // updatedAt: 3000
                expect(filtered[1].id).toBe('session1') // updatedAt: 2000
                expect(filtered[2].id).toBe('session3') // updatedAt: 1000
            })

            it('应该根据关键词过滤会话 - 验证需求 1.5，属性 2：搜索结果匹配关键词', () => {
                store.sessionFilter.keyword = '合同'
                const filtered = store.filteredSessions
                expect(filtered).toHaveLength(2)
                expect(filtered.some(s => s.id === 'session1')).toBe(true) // 标题包含"合同"
                expect(filtered.some(s => s.id === 'session3')).toBe(true) // 摘要包含"合同"
            })

            it('应该根据收藏状态过滤会话', () => {
                store.sessionFilter.isFavorite = true
                const filtered = store.filteredSessions
                expect(filtered).toHaveLength(2)
                expect(filtered.every(s => s.isFavorite)).toBe(true)
            })

            it('应该支持关键词不区分大小写搜索', () => {
                store.sessionFilter.keyword = '法律'
                const filtered = store.filteredSessions
                expect(filtered).toHaveLength(1)
                expect(filtered[0].id).toBe('session1')
            })

            it('应该在没有匹配结果时返回空数组', () => {
                store.sessionFilter.keyword = '不存在的关键词'
                const filtered = store.filteredSessions
                expect(filtered).toHaveLength(0)
            })
        })

        describe('currentSessionMessages', () => {
            it('应该返回当前会话的消息列表', () => {
                store.currentSession = store.sessions[0] // session1
                const messages = store.currentSessionMessages
                expect(messages).toHaveLength(2)
                expect(messages[0].id).toBe('msg1')
                expect(messages[1].id).toBe('msg2')
            })

            it('应该按时间戳正序排列消息', () => {
                store.currentSession = store.sessions[0] // session1
                const messages = store.currentSessionMessages
                expect(messages[0].timestamp).toBeLessThan(messages[1].timestamp)
            })

            it('应该在没有当前会话时返回空数组', () => {
                store.currentSession = null
                const messages = store.currentSessionMessages
                expect(messages).toHaveLength(0)
            })
        })

        describe('canSendMessage', () => {
            it('应该在输入框有内容且不在发送/流式状态时返回true - 验证需求 2.8，属性 5：输入状态控制按钮', () => {
                store.inputText = '测试消息'
                store.sending = false
                store.streaming = false
                expect(store.canSendMessage).toBe(true)
            })

            it('应该在输入框为空时返回false', () => {
                store.inputText = ''
                store.sending = false
                store.streaming = false
                expect(store.canSendMessage).toBe(false)
            })

            it('应该在输入框只有空格时返回false', () => {
                store.inputText = '   '
                store.sending = false
                store.streaming = false
                expect(store.canSendMessage).toBe(false)
            })

            it('应该在发送中时返回false', () => {
                store.inputText = '测试消息'
                store.sending = true
                store.streaming = false
                expect(store.canSendMessage).toBe(false)
            })

            it('应该在流式响应中时返回false', () => {
                store.inputText = '测试消息'
                store.sending = false
                store.streaming = true
                expect(store.canSendMessage).toBe(false)
            })
        })

        describe('totalUnreadCount', () => {
            it('应该返回所有会话的未读消息总数', () => {
                expect(store.totalUnreadCount).toBe(3) // 2 + 1 + 0
            })

            it('应该在没有未读消息时返回0', () => {
                store.sessions.forEach(session => {
                    session.unreadCount = 0
                })
                expect(store.totalUnreadCount).toBe(0)
            })
        })

        describe('favoriteSessionsList', () => {
            it('应该返回收藏的会话列表', () => {
                const favorites = store.favoriteSessionsList
                expect(favorites).toHaveLength(2)
                expect(favorites.every(s => s.isFavorite)).toBe(true)
            })

            it('应该在没有收藏会话时返回空数组', () => {
                store.sessions.forEach(session => {
                    session.isFavorite = false
                })
                const favorites = store.favoriteSessionsList
                expect(favorites).toHaveLength(0)
            })
        })
    })

    describe('会话管理 Actions', () => {
        describe('createSession', () => {
            it('应该成功创建新会话 - 验证需求 1.4，属性 1：会话创建增长列表', async () => {
                const mockSession: ChatSession = {
                    id: 'new-session',
                    title: '新会话',
                    summary: '',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    messageCount: 0,
                    isFavorite: false,
                    unreadCount: 0
                }

                mockChatApi.createChatSession.mockResolvedValue(mockSession)
                mockStorageManager.set.mockResolvedValue()

                const initialLength = store.sessions.length
                const result = await store.createSession('新会话')

                expect(result).toEqual(mockSession)
                expect(store.sessions).toHaveLength(initialLength + 1)
                expect(store.sessions[0]).toEqual(mockSession) // 应该添加到开头
                expect(store.currentSession).toEqual(mockSession)
                expect(mockStorageManager.set).toHaveBeenCalledWith(
                    STORAGE_KEYS.CHAT_SESSIONS,
                    store.sessions
                )
            })

            it('应该在创建失败时抛出错误', async () => {
                const error = new Error('创建失败')
                mockChatApi.createChatSession.mockRejectedValue(error)

                await expect(store.createSession()).rejects.toThrow(error)
                expect(store.error).toBe('创建会话失败，请稍后重试')
                expect(store.loading).toBe(false)
            })
        })

        describe('deleteSession', () => {
            beforeEach(() => {
                store.sessions = [
                    {
                        id: 'session1',
                        title: '会话1',
                        summary: '摘要1',
                        createdAt: 1000,
                        updatedAt: 2000,
                        messageCount: 5,
                        isFavorite: false,
                        unreadCount: 0
                    },
                    {
                        id: 'session2',
                        title: '会话2',
                        summary: '摘要2',
                        createdAt: 2000,
                        updatedAt: 3000,
                        messageCount: 3,
                        isFavorite: false,
                        unreadCount: 0
                    }
                ]
                store.currentSession = store.sessions[0]
            })

            it('应该成功删除会话 - 验证需求 1.3', async () => {
                mockChatApi.deleteChatSession.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                const initialLength = store.sessions.length
                await store.deleteSession('session1')

                expect(store.sessions).toHaveLength(initialLength - 1)
                expect(store.sessions.find(s => s.id === 'session1')).toBeUndefined()
                expect(store.currentSession).toBeNull() // 删除的是当前会话
                expect(store.messages).toEqual([]) // 应该清空消息
            })

            it('应该在删除非当前会话时保持当前会话状态', async () => {
                mockChatApi.deleteChatSession.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                await store.deleteSession('session2')

                expect(store.currentSession).toEqual(store.sessions[0]) // 仍然是session1
                expect(store.sessions).toHaveLength(1)
            })

            it('应该在删除失败时抛出错误', async () => {
                const error = new Error('删除失败')
                mockChatApi.deleteChatSession.mockRejectedValue(error)

                await expect(store.deleteSession('session1')).rejects.toThrow(error)
                expect(store.error).toBe('删除会话失败，请稍后重试')
            })
        })

        describe('clearSession', () => {
            beforeEach(() => {
                store.sessions = [
                    {
                        id: 'session1',
                        title: '会话1',
                        summary: '原摘要',
                        createdAt: 1000,
                        updatedAt: 2000,
                        messageCount: 5,
                        isFavorite: false,
                        unreadCount: 0
                    }
                ]
                store.messages = [
                    {
                        id: 'msg1',
                        sessionId: 'session1',
                        role: 'user',
                        content: '测试消息',
                        timestamp: 1000,
                        status: MessageStatus.SENT,
                        isFavorite: false
                    },
                    {
                        id: 'msg2',
                        sessionId: 'session2',
                        role: 'user',
                        content: '其他会话消息',
                        timestamp: 2000,
                        status: MessageStatus.SENT,
                        isFavorite: false
                    }
                ]
            })

            it('应该成功清空会话 - 验证需求 5.3，属性 15：清空操作清除所有数据', async () => {
                mockChatApi.clearChatSession.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                await store.clearSession('session1')

                // 应该清空该会话的消息
                expect(store.messages.filter(m => m.sessionId === 'session1')).toHaveLength(0)
                // 其他会话的消息应该保留
                expect(store.messages.filter(m => m.sessionId === 'session2')).toHaveLength(1)
                
                // 应该更新会话信息
                expect(store.sessions[0].messageCount).toBe(0)
                expect(store.sessions[0].summary).toBe('')
                expect(store.sessions[0].updatedAt).toBeGreaterThan(2000)
            })

            it('应该在清空失败时抛出错误', async () => {
                const error = new Error('清空失败')
                mockChatApi.clearChatSession.mockRejectedValue(error)

                await expect(store.clearSession('session1')).rejects.toThrow(error)
                expect(store.error).toBe('清空会话失败，请稍后重试')
            })
        })
    })

    describe('会话管理 Actions - 补充测试', () => {
        describe('getSessions', () => {
            it('应该成功获取会话列表 - 验证需求 1.1', async () => {
                const mockSessions: ChatSession[] = [
                    {
                        id: 'session1',
                        title: '法律咨询1',
                        summary: '合同纠纷咨询',
                        createdAt: 1000,
                        updatedAt: 2000,
                        messageCount: 5,
                        isFavorite: false,
                        unreadCount: 2
                    },
                    {
                        id: 'session2',
                        title: '劳动法咨询',
                        summary: '工资纠纷问题',
                        createdAt: 2000,
                        updatedAt: 3000,
                        messageCount: 3,
                        isFavorite: true,
                        unreadCount: 1
                    }
                ]

                mockChatApi.getChatSessions.mockResolvedValue(mockSessions)
                mockStorageManager.set.mockResolvedValue()

                await store.getSessions(true)

                expect(store.sessions).toEqual(mockSessions)
                expect(store.loading).toBe(false)
                expect(store.error).toBeNull()
                expect(mockStorageManager.set).toHaveBeenCalledWith(
                    STORAGE_KEYS.CHAT_SESSIONS,
                    mockSessions
                )
            })

            it('应该在刷新时重置分页状态', async () => {
                store.currentPage = 5
                store.hasMoreSessions = false
                mockChatApi.getChatSessions.mockResolvedValue([])
                mockStorageManager.set.mockResolvedValue()

                await store.getSessions(true)

                expect(store.currentPage).toBe(2) // 应该从1开始，调用后变为2
                expect(store.hasMoreSessions).toBe(false) // 空结果，应该为false
            })

            it('应该在非刷新时追加会话', async () => {
                const existingSessions: ChatSession[] = [
                    {
                        id: 'existing',
                        title: '已存在会话',
                        summary: '已存在摘要',
                        createdAt: 1000,
                        updatedAt: 2000,
                        messageCount: 1,
                        isFavorite: false,
                        unreadCount: 0
                    }
                ]
                const newSessions: ChatSession[] = [
                    {
                        id: 'new',
                        title: '新会话',
                        summary: '新摘要',
                        createdAt: 3000,
                        updatedAt: 4000,
                        messageCount: 2,
                        isFavorite: false,
                        unreadCount: 1
                    }
                ]

                store.sessions = existingSessions
                mockChatApi.getChatSessions.mockResolvedValue(newSessions)
                mockStorageManager.set.mockResolvedValue()

                await store.getSessions(false)

                expect(store.sessions).toHaveLength(2)
                expect(store.sessions[0]).toEqual(existingSessions[0])
                expect(store.sessions[1]).toEqual(newSessions[0])
            })

            it('应该在获取失败时设置错误状态', async () => {
                const error = new Error('网络错误')
                mockChatApi.getChatSessions.mockRejectedValue(error)

                await store.getSessions()

                expect(store.error).toBe('获取会话列表失败，请稍后重试')
                expect(store.loading).toBe(false)
            })
        })

        describe('setCurrentSession', () => {
            beforeEach(() => {
                store.sessions = [
                    {
                        id: 'session1',
                        title: '会话1',
                        summary: '摘要1',
                        createdAt: 1000,
                        updatedAt: 2000,
                        messageCount: 5,
                        isFavorite: false,
                        unreadCount: 3
                    },
                    {
                        id: 'session2',
                        title: '会话2',
                        summary: '摘要2',
                        createdAt: 2000,
                        updatedAt: 3000,
                        messageCount: 2,
                        isFavorite: true,
                        unreadCount: 1
                    }
                ]
            })

            it('应该成功设置当前会话 - 验证需求 1.2', async () => {
                mockChatApi.getChatMessages.mockResolvedValue([])
                mockStorageManager.set.mockResolvedValue()

                await store.setCurrentSession('session1')

                expect(store.currentSession).toEqual(store.sessions[0])
                expect(store.sessions[0].unreadCount).toBe(0) // 应该清空未读计数
                expect(mockChatApi.getChatMessages).toHaveBeenCalledWith('session1', {
                    page: 1,
                    pageSize: 50
                })
            })

            it('应该在会话不存在时不设置当前会话', async () => {
                await store.setCurrentSession('nonexistent')

                expect(store.currentSession).toBeNull()
                expect(mockChatApi.getChatMessages).not.toHaveBeenCalled()
            })
        })

        describe('updateSession', () => {
            beforeEach(() => {
                store.sessions = [
                    {
                        id: 'session1',
                        title: '原标题',
                        summary: '原摘要',
                        createdAt: 1000,
                        updatedAt: 2000,
                        messageCount: 5,
                        isFavorite: false,
                        unreadCount: 0
                    }
                ]
                store.currentSession = store.sessions[0]
            })

            it('应该成功更新会话信息 - 验证需求 1.3', async () => {
                const updates = {
                    title: '新标题',
                    isFavorite: true
                }
                mockChatApi.updateChatSession.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                await store.updateSession('session1', updates)

                expect(store.sessions[0].title).toBe('新标题')
                expect(store.sessions[0].isFavorite).toBe(true)
                expect(store.sessions[0].updatedAt).toBeGreaterThan(2000)
                expect(store.currentSession!.title).toBe('新标题')
                expect(store.currentSession!.isFavorite).toBe(true)
            })

            it('应该在更新失败时抛出错误', async () => {
                const error = new Error('更新失败')
                mockChatApi.updateChatSession.mockRejectedValue(error)

                await expect(store.updateSession('session1', { title: '新标题' })).rejects.toThrow(error)
                expect(store.error).toBe('更新会话失败，请稍后重试')
            })
        })

        describe('toggleSessionFavorite', () => {
            beforeEach(() => {
                store.sessions = [
                    {
                        id: 'session1',
                        title: '会话1',
                        summary: '摘要1',
                        createdAt: 1000,
                        updatedAt: 2000,
                        messageCount: 5,
                        isFavorite: false,
                        unreadCount: 0
                    }
                ]
                store.currentSession = store.sessions[0]
            })

            it('应该成功收藏会话 - 验证需求 1.3', async () => {
                mockChatApi.favoriteSession.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                await store.toggleSessionFavorite('session1')

                expect(store.sessions[0].isFavorite).toBe(true)
                expect(store.currentSession!.isFavorite).toBe(true)
                expect(mockChatApi.favoriteSession).toHaveBeenCalledWith('session1')
            })

            it('应该成功取消收藏会话', async () => {
                store.sessions[0].isFavorite = true
                store.currentSession!.isFavorite = true
                mockChatApi.unfavoriteSession.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                await store.toggleSessionFavorite('session1')

                expect(store.sessions[0].isFavorite).toBe(false)
                expect(store.currentSession!.isFavorite).toBe(false)
                expect(mockChatApi.unfavoriteSession).toHaveBeenCalledWith('session1')
            })

            it('应该在会话不存在时不做任何操作', async () => {
                await store.toggleSessionFavorite('nonexistent')

                expect(mockChatApi.favoriteSession).not.toHaveBeenCalled()
                expect(mockChatApi.unfavoriteSession).not.toHaveBeenCalled()
            })
        })
    })

    describe('消息管理 Actions', () => {
        beforeEach(() => {
            store.currentSession = {
                id: 'session1',
                title: '测试会话',
                summary: '测试摘要',
                createdAt: 1000,
                updatedAt: 2000,
                messageCount: 0,
                isFavorite: false,
                unreadCount: 0
            }
        })

        describe('getMessages', () => {
            it('应该成功获取消息列表 - 验证需求 1.2', async () => {
                const mockMessages: Message[] = [
                    {
                        id: 'msg1',
                        sessionId: 'session1',
                        role: 'user',
                        content: '用户消息',
                        timestamp: 1000,
                        status: MessageStatus.SENT,
                        isFavorite: false
                    },
                    {
                        id: 'msg2',
                        sessionId: 'session1',
                        role: 'assistant',
                        content: '助手回复',
                        timestamp: 1100,
                        status: MessageStatus.RECEIVED,
                        isFavorite: false
                    }
                ]

                mockChatApi.getChatMessages.mockResolvedValue(mockMessages)
                mockStorageManager.set.mockResolvedValue()

                await store.getMessages('session1', true)

                expect(store.messages).toEqual(mockMessages)
                expect(store.loading).toBe(false)
                expect(store.error).toBeNull()
                expect(mockStorageManager.set).toHaveBeenCalledWith(
                    STORAGE_KEYS.CHAT_MESSAGES,
                    mockMessages
                )
            })

            it('应该在刷新时清空该会话的现有消息', async () => {
                store.messages = [
                    {
                        id: 'old-msg',
                        sessionId: 'session1',
                        role: 'user',
                        content: '旧消息',
                        timestamp: 500,
                        status: MessageStatus.SENT,
                        isFavorite: false
                    },
                    {
                        id: 'other-msg',
                        sessionId: 'session2',
                        role: 'user',
                        content: '其他会话消息',
                        timestamp: 600,
                        status: MessageStatus.SENT,
                        isFavorite: false
                    }
                ]

                const newMessages: Message[] = [
                    {
                        id: 'new-msg',
                        sessionId: 'session1',
                        role: 'user',
                        content: '新消息',
                        timestamp: 1000,
                        status: MessageStatus.SENT,
                        isFavorite: false
                    }
                ]

                mockChatApi.getChatMessages.mockResolvedValue(newMessages)
                mockStorageManager.set.mockResolvedValue()

                await store.getMessages('session1', true)

                // 应该只保留其他会话的消息和新获取的消息
                expect(store.messages).toHaveLength(2)
                expect(store.messages.find(m => m.id === 'old-msg')).toBeUndefined()
                expect(store.messages.find(m => m.id === 'other-msg')).toBeDefined()
                expect(store.messages.find(m => m.id === 'new-msg')).toBeDefined()
            })

            it('应该在获取失败时设置错误状态', async () => {
                const error = new Error('获取消息失败')
                mockChatApi.getChatMessages.mockRejectedValue(error)

                await store.getMessages('session1')

                expect(store.error).toBe('获取消息列表失败，请稍后重试')
                expect(store.loading).toBe(false)
            })
        })

        describe('sendMessage', () => {
            it('应该成功发送消息 - 验证需求 2.1，属性 3：消息发送增长列表', async () => {
                const mockResponse: Message = {
                    id: 'response-123',
                    sessionId: 'session1',
                    role: 'assistant',
                    content: '这是助手的回复',
                    timestamp: Date.now(),
                    status: MessageStatus.RECEIVED,
                    isFavorite: false
                }
                
                mockChatApi.sendMessage.mockResolvedValue(mockResponse)
                mockChatApi.receiveStreamingResponse.mockImplementation(async (responseId, onChunk) => {
                    // 模拟流式响应
                    onChunk('这是')
                    onChunk('助手的')
                    onChunk('回复')
                })
                mockStorageManager.set.mockResolvedValue()

                store.inputText = '测试消息内容'
                const initialMessageCount = store.messages.length

                await store.sendMessage('测试消息内容')

                // 验证消息列表增长
                expect(store.messages).toHaveLength(initialMessageCount + 2) // 用户消息 + 助手消息
                
                // 验证用户消息
                const userMessage = store.messages[store.messages.length - 2]
                expect(userMessage.role).toBe('user')
                expect(userMessage.content).toBe('测试消息内容')
                expect(userMessage.status).toBe(MessageStatus.SENT)
                expect(userMessage.sessionId).toBe('session1')

                // 验证助手消息
                const assistantMessage = store.messages[store.messages.length - 1]
                expect(assistantMessage.role).toBe('assistant')
                expect(assistantMessage.content).toBe('这是助手的回复')
                expect(assistantMessage.status).toBe(MessageStatus.RECEIVED)
                expect(assistantMessage.id).toBe('response-123')

                // 验证会话状态更新
                expect(store.currentSession!.messageCount).toBe(2)
                expect(store.currentSession!.summary).toBe('测试消息内容')
                expect(store.inputText).toBe('') // 应该清空输入框
                expect(store.sending).toBe(false)
            })

            it('应该支持发送带附件的消息', async () => {
                const attachments: Attachment[] = [
                    {
                        id: 'att1',
                        type: 'image',
                        url: 'https://example.com/image.jpg',
                        size: 1024,
                        name: 'evidence.jpg'
                    }
                ]

                const mockResponse: Message = {
                    id: 'response-123',
                    sessionId: 'session1',
                    role: 'assistant',
                    content: '收到您的图片',
                    timestamp: Date.now(),
                    status: MessageStatus.RECEIVED,
                    isFavorite: false
                }

                mockChatApi.sendMessage.mockResolvedValue(mockResponse)
                mockChatApi.receiveStreamingResponse.mockImplementation(async (responseId, onChunk) => {
                    onChunk('收到您的图片')
                })
                mockStorageManager.set.mockResolvedValue()

                await store.sendMessage('请看这张图片', attachments)

                const userMessage = store.messages[store.messages.length - 2]
                expect(userMessage.attachments).toEqual(attachments)
                expect(mockChatApi.sendMessage).toHaveBeenCalledWith('session1', '请看这张图片', attachments)
            })

            it('应该在没有当前会话时不发送消息', async () => {
                store.currentSession = null

                await store.sendMessage('测试消息')

                expect(mockChatApi.sendMessage).not.toHaveBeenCalled()
                expect(store.messages).toHaveLength(0)
            })

            it('应该在消息内容为空时不发送消息', async () => {
                await store.sendMessage('')
                await store.sendMessage('   ')

                expect(mockChatApi.sendMessage).not.toHaveBeenCalled()
                expect(store.messages).toHaveLength(0)
            })

            it('应该在发送失败时设置错误状态', async () => {
                const error = new Error('发送失败')
                mockChatApi.sendMessage.mockRejectedValue(error)

                await expect(store.sendMessage('测试消息')).rejects.toThrow(error)

                // 验证用户消息状态被设置为错误
                const userMessage = store.messages[store.messages.length - 1]
                expect(userMessage.status).toBe(MessageStatus.ERROR)
                expect(store.error).toBe('发送消息失败，请稍后重试')
                expect(store.sending).toBe(false)
            })
        })

        describe('receiveStreamingResponse', () => {
            it('应该成功接收流式响应 - 验证需求 2.2, 12，属性 19：流式数据完整性', async () => {
                const chunks = ['这是', '一个', '完整的', '流式', '响应']
                let chunkIndex = 0

                mockChatApi.receiveStreamingResponse.mockImplementation(async (responseId, onChunk) => {
                    for (const chunk of chunks) {
                        onChunk(chunk)
                    }
                })
                mockStorageManager.set.mockResolvedValue()

                await store.receiveStreamingResponse('response-123')

                // 验证助手消息被添加
                const assistantMessage = store.messages[store.messages.length - 1]
                expect(assistantMessage.role).toBe('assistant')
                expect(assistantMessage.id).toBe('response-123')
                expect(assistantMessage.content).toBe('这是一个完整的流式响应')
                expect(assistantMessage.status).toBe(MessageStatus.RECEIVED)
                expect(store.streaming).toBe(false)
            })

            it('应该在没有当前会话时不处理流式响应', async () => {
                store.currentSession = null

                await store.receiveStreamingResponse('response-123')

                expect(mockChatApi.receiveStreamingResponse).not.toHaveBeenCalled()
                expect(store.messages).toHaveLength(0)
            })

            it('应该在流式响应失败时设置错误状态', async () => {
                const error = new Error('流式响应失败')
                mockChatApi.receiveStreamingResponse.mockRejectedValue(error)
                mockStorageManager.set.mockResolvedValue()

                await expect(store.receiveStreamingResponse('response-123')).rejects.toThrow(error)

                // 验证助手消息状态被设置为错误
                const assistantMessage = store.messages[store.messages.length - 1]
                expect(assistantMessage.status).toBe(MessageStatus.ERROR)
                expect(assistantMessage.content).toContain('[消息接收失败，请重试]')
                expect(store.streaming).toBe(false)
            })
        })

        describe('cancelCurrentResponse', () => {
            beforeEach(() => {
                store.streaming = true
                store.messages = [
                    {
                        id: 'streaming-msg',
                        sessionId: 'session1',
                        role: 'assistant',
                        content: '部分内容',
                        timestamp: Date.now(),
                        status: MessageStatus.STREAMING,
                        isFavorite: false
                    }
                ]
            })

            it('应该成功取消当前响应 - 验证需求 4.4', async () => {
                mockChatApi.cancelStreamingResponse.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                await store.cancelCurrentResponse()

                expect(store.streaming).toBe(false)
                expect(store.messages[0].status).toBe(MessageStatus.ERROR)
                expect(store.messages[0].content).toContain('[响应已取消]')
                expect(mockChatApi.cancelStreamingResponse).toHaveBeenCalled()
            })

            it('应该在不在流式状态时不执行取消操作', async () => {
                store.streaming = false

                await store.cancelCurrentResponse()

                expect(mockChatApi.cancelStreamingResponse).not.toHaveBeenCalled()
            })

            it('应该处理取消操作失败的情况', async () => {
                const error = new Error('取消失败')
                mockChatApi.cancelStreamingResponse.mockRejectedValue(error)
                const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

                await store.cancelCurrentResponse()

                expect(consoleSpy).toHaveBeenCalledWith('取消响应失败:', error)
                consoleSpy.mockRestore()
            })
        })

        describe('toggleMessageFavorite', () => {
            beforeEach(() => {
                store.messages = [
                    {
                        id: 'msg1',
                        sessionId: 'session1',
                        role: 'user',
                        content: '测试消息',
                        timestamp: 1000,
                        status: MessageStatus.SENT,
                        isFavorite: false
                    }
                ]
            })

            it('应该成功收藏消息 - 验证需求 2.7', async () => {
                mockChatApi.favoriteMessage.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                await store.toggleMessageFavorite('msg1')

                expect(store.messages[0].isFavorite).toBe(true)
                expect(mockChatApi.favoriteMessage).toHaveBeenCalledWith('msg1')
            })

            it('应该成功取消收藏消息', async () => {
                store.messages[0].isFavorite = true
                mockChatApi.unfavoriteMessage.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                await store.toggleMessageFavorite('msg1')

                expect(store.messages[0].isFavorite).toBe(false)
                expect(mockChatApi.unfavoriteMessage).toHaveBeenCalledWith('msg1')
            })

            it('应该在消息不存在时不做任何操作', async () => {
                await store.toggleMessageFavorite('nonexistent')

                expect(mockChatApi.favoriteMessage).not.toHaveBeenCalled()
                expect(mockChatApi.unfavoriteMessage).not.toHaveBeenCalled()
            })
        })

        describe('copyMessage', () => {
            beforeEach(() => {
                store.messages = [
                    {
                        id: 'msg1',
                        sessionId: 'session1',
                        role: 'assistant',
                        content: '要复制的消息内容',
                        timestamp: 1000,
                        status: MessageStatus.RECEIVED,
                        isFavorite: false
                    }
                ]
            })

            it('应该成功复制消息内容 - 验证需求 2.7', async () => {
                await store.copyMessage('msg1')

                expect(global.uni.setClipboardData).toHaveBeenCalledWith({
                    data: '要复制的消息内容',
                    success: expect.any(Function),
                    fail: expect.any(Function)
                })
            })

            it('应该在消息不存在时不做任何操作', async () => {
                vi.clearAllMocks()

                await store.copyMessage('nonexistent')

                expect(global.uni.setClipboardData).not.toHaveBeenCalled()
            })
        })
    })

    describe('搜索和过滤 Actions', () => {
        describe('setSessionSearchKeyword', () => {
            it('应该设置会话搜索关键词 - 验证需求 1.5', () => {
                store.setSessionSearchKeyword('法律咨询')

                expect(store.sessionFilter.keyword).toBe('法律咨询')
            })

            it('应该支持清空搜索关键词', () => {
                store.sessionFilter.keyword = '原关键词'
                store.setSessionSearchKeyword('')

                expect(store.sessionFilter.keyword).toBe('')
            })
        })

        describe('setFavoriteFilter', () => {
            it('应该设置收藏过滤条件', () => {
                store.setFavoriteFilter(true)

                expect(store.sessionFilter.isFavorite).toBe(true)
            })

            it('应该支持清除收藏过滤条件', () => {
                store.setFavoriteFilter(undefined)

                expect(store.sessionFilter.isFavorite).toBeUndefined()
            })
        })

        describe('clearFilters', () => {
            it('应该清除所有过滤条件', () => {
                store.sessionFilter = {
                    keyword: '测试',
                    isFavorite: true
                }

                store.clearFilters()

                expect(store.sessionFilter).toEqual({})
            })
        })
    })

    describe('输入状态管理 Actions', () => {
        describe('updateInputText', () => {
            it('应该更新输入文本 - 验证需求 2.8, 2.9', () => {
                store.updateInputText('新的输入内容')

                expect(store.inputText).toBe('新的输入内容')
            })

            it('应该支持清空输入文本', () => {
                store.inputText = '原内容'
                store.updateInputText('')

                expect(store.inputText).toBe('')
            })
        })

        describe('setInputFocused', () => {
            it('应该设置输入框焦点状态 - 验证需求 2.10', () => {
                store.setInputFocused(true)

                expect(store.isInputFocused).toBe(true)

                store.setInputFocused(false)

                expect(store.isInputFocused).toBe(false)
            })
        })
    })

    describe('数据持久化 Actions', () => {
        describe('saveSessions', () => {
            it('应该保存会话到本地存储', async () => {
                const testSessions = [
                    {
                        id: 'session1',
                        title: '测试会话',
                        summary: '测试摘要',
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        messageCount: 0,
                        isFavorite: false,
                        unreadCount: 0
                    }
                ]
                store.sessions = testSessions
                mockStorageManager.set.mockResolvedValue()

                await store.saveSessions()

                expect(mockStorageManager.set).toHaveBeenCalledWith(
                    STORAGE_KEYS.CHAT_SESSIONS,
                    testSessions
                )
            })

            it('应该处理保存失败的情况', async () => {
                const error = new Error('存储失败')
                mockStorageManager.set.mockRejectedValue(error)
                const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

                await store.saveSessions()

                expect(consoleSpy).toHaveBeenCalledWith('保存会话失败:', error)
                consoleSpy.mockRestore()
            })
        })

        describe('loadSessions', () => {
            it('应该从本地存储加载会话', async () => {
                const testSessions = [
                    {
                        id: 'session1',
                        title: '测试会话',
                        summary: '测试摘要',
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        messageCount: 0,
                        isFavorite: false,
                        unreadCount: 0
                    }
                ]
                mockStorageManager.get.mockResolvedValue(testSessions)

                await store.loadSessions()

                expect(mockStorageManager.get).toHaveBeenCalledWith(STORAGE_KEYS.CHAT_SESSIONS)
                expect(store.sessions).toEqual(testSessions)
            })

            it('应该在没有存储数据时使用空数组', async () => {
                mockStorageManager.get.mockResolvedValue(null)

                await store.loadSessions()

                expect(store.sessions).toEqual([])
            })

            it('应该处理加载失败的情况', async () => {
                const error = new Error('加载失败')
                mockStorageManager.get.mockRejectedValue(error)
                const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

                await store.loadSessions()

                expect(store.sessions).toEqual([])
                expect(consoleSpy).toHaveBeenCalledWith('加载会话失败:', error)
                consoleSpy.mockRestore()
            })
        })

        describe('saveMessages', () => {
            it('应该保存消息到本地存储', async () => {
                const testMessages = [
                    {
                        id: 'msg1',
                        sessionId: 'session1',
                        role: 'user' as const,
                        content: '测试消息',
                        timestamp: Date.now(),
                        status: MessageStatus.SENT,
                        isFavorite: false
                    }
                ]
                store.messages = testMessages
                mockStorageManager.set.mockResolvedValue()

                await store.saveMessages()

                expect(mockStorageManager.set).toHaveBeenCalledWith(
                    STORAGE_KEYS.CHAT_MESSAGES,
                    testMessages
                )
            })
        })

        describe('loadMessages', () => {
            it('应该从本地存储加载消息', async () => {
                const testMessages = [
                    {
                        id: 'msg1',
                        sessionId: 'session1',
                        role: 'user' as const,
                        content: '测试消息',
                        timestamp: Date.now(),
                        status: MessageStatus.SENT,
                        isFavorite: false
                    }
                ]
                mockStorageManager.get.mockResolvedValue(testMessages)

                await store.loadMessages()

                expect(mockStorageManager.get).toHaveBeenCalledWith(STORAGE_KEYS.CHAT_MESSAGES)
                expect(store.messages).toEqual(testMessages)
            })

            it('应该在没有存储数据时使用空数组', async () => {
                mockStorageManager.get.mockResolvedValue(null)

                await store.loadMessages()

                expect(store.messages).toEqual([])
            })
        })
    })

    describe('工具方法 Actions', () => {
        describe('clearError', () => {
            it('应该清除错误状态', () => {
                store.error = '测试错误'

                store.clearError()

                expect(store.error).toBeNull()
            })
        })

        describe('reset', () => {
            it('应该重置所有状态', () => {
                // 设置一些非默认状态
                store.currentSession = {
                    id: 'session1',
                    title: '测试会话',
                    summary: '测试摘要',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    messageCount: 5,
                    isFavorite: true,
                    unreadCount: 2
                }
                store.messages = [
                    {
                        id: 'msg1',
                        sessionId: 'session1',
                        role: 'user',
                        content: '测试消息',
                        timestamp: Date.now(),
                        status: MessageStatus.SENT,
                        isFavorite: false
                    }
                ]
                store.sessionFilter = { keyword: '测试', isFavorite: true }
                store.inputText = '输入内容'
                store.isInputFocused = true
                store.error = '测试错误'
                store.currentPage = 5
                store.hasMoreSessions = false
                store.hasMoreMessages = false

                store.reset()

                // 验证所有状态都被重置为初始值
                expect(store.currentSession).toBeNull()
                expect(store.messages).toEqual([])
                expect(store.currentMessage).toBeNull()
                expect(store.sessionFilter).toEqual({})
                expect(store.inputText).toBe('')
                expect(store.isInputFocused).toBe(false)
                expect(store.error).toBeNull()
                expect(store.currentPage).toBe(1)
                expect(store.hasMoreSessions).toBe(true)
                expect(store.hasMoreMessages).toBe(true)
            })
        })
    })

    describe('边缘情况和错误处理', () => {
        it('应该处理空的会话列表', () => {
            store.sessions = []

            expect(store.filteredSessions).toEqual([])
            expect(store.totalUnreadCount).toBe(0)
            expect(store.favoriteSessionsList).toEqual([])
        })

        it('应该处理空的消息列表', () => {
            store.messages = []
            store.currentSession = {
                id: 'session1',
                title: '测试会话',
                summary: '测试摘要',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                messageCount: 0,
                isFavorite: false,
                unreadCount: 0
            }

            expect(store.currentSessionMessages).toEqual([])
        })

        it('应该处理无效的会话ID', async () => {
            await store.setCurrentSession('invalid-id')
            expect(store.currentSession).toBeNull()

            await store.deleteSession('invalid-id')
            // 应该不抛出错误，但也不会删除任何内容
        })

        it('应该处理存储空间不足的情况', async () => {
            const storageError = new Error('Storage quota exceeded')
            mockStorageManager.set.mockRejectedValue(storageError)
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

            await store.saveSessions()

            expect(consoleSpy).toHaveBeenCalledWith('保存会话失败:', storageError)
            consoleSpy.mockRestore()
        })
    })
})