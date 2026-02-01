import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { StorageManager } from '../../utils/storage'

/**
 * 属性测试：StorageManager
 * Feature: legal-assistant-app, Property 7: 本地存储往返一致性
 * 
 * 验证需求 10：本地数据存储
 * - 10.1: 保存消息到本地存储
 * - 10.2: 保存文书到本地存储
 * - 10.3: 保存收藏信息到本地存储
 * - 10.4: 保存表单数据到本地存储
 * - 10.5: 从本地存储加载历史数据
 */

// Mock uni API
const mockStorage = new Map<string, any>()

const mockUni = {
    setStorage: vi.fn((options: any) => {
        try {
            mockStorage.set(options.key, options.data)
            options.success()
        } catch (error) {
            options.fail({ errMsg: 'setStorage failed' })
        }
    }),
    getStorage: vi.fn((options: any) => {
        if (mockStorage.has(options.key)) {
            options.success({ data: mockStorage.get(options.key) })
        } else {
            options.fail({ errMsg: 'getStorage:fail data not found' })
        }
    }),
    removeStorage: vi.fn((options: any) => {
        mockStorage.delete(options.key)
        options.success()
    }),
    clearStorage: vi.fn((options: any) => {
        mockStorage.clear()
        options.success()
    }),
    getStorageInfo: vi.fn((options: any) => {
        options.success({
            keys: Array.from(mockStorage.keys()),
            currentSize: mockStorage.size * 10, // 模拟大小
            limitSize: 10240
        })
    })
}

// 将 mock 挂载到全局
global.uni = mockUni as any

describe('StorageManager - Property-Based Tests', () => {
    let storageManager: StorageManager

    beforeEach(() => {
        // 清空 mock 存储
        mockStorage.clear()
        vi.clearAllMocks()
        storageManager = new StorageManager()
    })

    /**
     * 属性 7：本地存储往返一致性
     * 
     * 对于任意数据对象（消息、文书、收藏、表单草稿），
     * 将其保存到本地存储后再读取，应该得到与原始对象等价的数据。
     * 
     * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**
     */
    describe('Property 7: 本地存储往返一致性', () => {
        it('should maintain round-trip consistency for strings', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }), // 存储键
                    fc.string(), // 存储值
                    async (key, value) => {
                        // 保存数据
                        await storageManager.set(key, value)

                        // 读取数据
                        const retrieved = await storageManager.get<string>(key)

                        // 验证一致性
                        expect(retrieved).toBe(value)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain round-trip consistency for numbers', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    fc.oneof(
                        fc.integer(),
                        fc.double({ noNaN: true }),
                        fc.constant(0),
                        fc.constant(-0)
                    ),
                    async (key, value) => {
                        await storageManager.set(key, value)
                        const retrieved = await storageManager.get<number>(key)

                        // 处理 -0 和 0 的特殊情况
                        if (Object.is(value, -0)) {
                            expect(Object.is(retrieved, -0) || retrieved === 0).toBe(true)
                        } else {
                            expect(retrieved).toBe(value)
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain round-trip consistency for booleans', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    fc.boolean(),
                    async (key, value) => {
                        await storageManager.set(key, value)
                        const retrieved = await storageManager.get<boolean>(key)
                        expect(retrieved).toBe(value)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain round-trip consistency for arrays', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    fc.array(fc.oneof(
                        fc.string(),
                        fc.integer(),
                        fc.boolean()
                    )),
                    async (key, value) => {
                        await storageManager.set(key, value)
                        const retrieved = await storageManager.get<any[]>(key)
                        expect(retrieved).toEqual(value)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain round-trip consistency for objects', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    fc.dictionary(
                        fc.string(),
                        fc.oneof(
                            fc.string(),
                            fc.integer(),
                            fc.boolean(),
                            fc.constant(null)
                        )
                    ),
                    async (key, value) => {
                        await storageManager.set(key, value)
                        const retrieved = await storageManager.get<Record<string, any>>(key)
                        expect(retrieved).toEqual(value)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain round-trip consistency for chat messages', async () => {
            // 生成聊天消息数据结构
            const messageArbitrary = fc.record({
                id: fc.string({ minLength: 1 }),
                sessionId: fc.string({ minLength: 1 }),
                role: fc.constantFrom('user', 'assistant'),
                content: fc.string(),
                timestamp: fc.integer({ min: 0 }),
                status: fc.constantFrom('sending', 'sent', 'received', 'streaming', 'error'),
                isFavorite: fc.boolean()
            })

            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    messageArbitrary,
                    async (key, message) => {
                        await storageManager.set(key, message)
                        const retrieved = await storageManager.get<typeof message>(key)
                        expect(retrieved).toEqual(message)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain round-trip consistency for document templates', async () => {
            // 生成文书模板数据结构
            const templateArbitrary = fc.record({
                id: fc.string({ minLength: 1 }),
                name: fc.string(),
                category: fc.string(),
                description: fc.string(),
                icon: fc.string(),
                usageCount: fc.integer({ min: 0 }),
                isFavorite: fc.boolean()
            })

            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    templateArbitrary,
                    async (key, template) => {
                        await storageManager.set(key, template)
                        const retrieved = await storageManager.get<typeof template>(key)
                        expect(retrieved).toEqual(template)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain round-trip consistency for form drafts', async () => {
            // 生成表单草稿数据结构
            const formDraftArbitrary = fc.dictionary(
                fc.string(),
                fc.oneof(
                    fc.string(),
                    fc.integer(),
                    fc.boolean(),
                    fc.date().map(d => d.toISOString())
                )
            )

            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    formDraftArbitrary,
                    async (key, draft) => {
                        await storageManager.set(key, draft)
                        const retrieved = await storageManager.get<typeof draft>(key)
                        expect(retrieved).toEqual(draft)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain round-trip consistency for nested objects', async () => {
            // 生成嵌套对象
            const nestedObjectArbitrary = fc.record({
                user: fc.record({
                    id: fc.string(),
                    name: fc.string(),
                    settings: fc.record({
                        theme: fc.constantFrom('light', 'dark'),
                        notifications: fc.boolean()
                    })
                }),
                sessions: fc.array(fc.record({
                    id: fc.string(),
                    title: fc.string(),
                    messageCount: fc.integer({ min: 0 })
                }))
            })

            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    nestedObjectArbitrary,
                    async (key, value) => {
                        await storageManager.set(key, value)
                        const retrieved = await storageManager.get<typeof value>(key)
                        expect(retrieved).toEqual(value)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should handle null and undefined values', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    fc.constantFrom(null, undefined),
                    async (key, value) => {
                        await storageManager.set(key, value)
                        const retrieved = await storageManager.get(key)
                        expect(retrieved).toBe(value)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain consistency across multiple set/get operations', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            key: fc.string({ minLength: 1 }),
                            value: fc.oneof(
                                fc.string(),
                                fc.integer(),
                                fc.boolean(),
                                fc.array(fc.string())
                            )
                        }),
                        { minLength: 1, maxLength: 10 }
                    ),
                    async (operations) => {
                        // 保存所有数据
                        for (const op of operations) {
                            await storageManager.set(op.key, op.value)
                        }

                        // 验证所有数据
                        for (const op of operations) {
                            const retrieved = await storageManager.get(op.key)
                            expect(retrieved).toEqual(op.value)
                        }
                    }
                ),
                { numRuns: 50 }
            )
        })

        it('should return null for non-existent keys', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    async (key) => {
                        // 确保键不存在
                        await storageManager.remove(key)

                        // 尝试读取
                        const retrieved = await storageManager.get(key)

                        // 应该返回 null
                        expect(retrieved).toBeNull()
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain consistency after remove operation', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    fc.string(),
                    async (key, value) => {
                        // 保存数据
                        await storageManager.set(key, value)

                        // 验证数据存在
                        let retrieved = await storageManager.get<string>(key)
                        expect(retrieved).toBe(value)

                        // 删除数据
                        await storageManager.remove(key)

                        // 验证数据已删除
                        retrieved = await storageManager.get<string>(key)
                        expect(retrieved).toBeNull()
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain consistency after clear operation', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            key: fc.string({ minLength: 1 }),
                            value: fc.string()
                        }),
                        { minLength: 1, maxLength: 5 }
                    ),
                    async (items) => {
                        // 保存所有数据
                        for (const item of items) {
                            await storageManager.set(item.key, item.value)
                        }

                        // 清空存储
                        await storageManager.clear()

                        // 验证所有数据已清除
                        for (const item of items) {
                            const retrieved = await storageManager.get(item.key)
                            expect(retrieved).toBeNull()
                        }
                    }
                ),
                { numRuns: 50 }
            )
        })
    })

    /**
     * 属性测试：存储信息准确性
     * 
     * 验证 getStorageInfo 返回的信息与实际存储状态一致
     */
    describe('Storage Info Accuracy', () => {
        it('should accurately report stored keys', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            key: fc.string({ minLength: 1 }),
                            value: fc.string()
                        }),
                        { minLength: 0, maxLength: 10 }
                    ),
                    async (items) => {
                        // 清空存储
                        await storageManager.clear()

                        // 保存数据
                        const uniqueKeys = new Set<string>()
                        for (const item of items) {
                            await storageManager.set(item.key, item.value)
                            uniqueKeys.add(item.key)
                        }

                        // 获取存储信息
                        const info = await storageManager.getStorageInfo()

                        // 验证键的数量
                        expect(info.keys.length).toBe(uniqueKeys.size)

                        // 验证所有键都存在
                        for (const key of uniqueKeys) {
                            expect(info.keys).toContain(key)
                        }
                    }
                ),
                { numRuns: 50 }
            )
        })
    })
})
