/**
 * 文书状态管理 - 属性测试
 * Feature: legal-assistant-app
 * 
 * 验证需求 6, 7, 8
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { setActivePinia, createPinia } from 'pinia'
import { useDocumentStore } from '../../src/store/document'
import type { DocumentTemplate, GeneratedDocument } from '../../src/types/document'
import * as documentApi from '../../src/api/documentApi'
import StorageManager from '../../src/utils/storage'

// Mock dependencies
vi.mock('../../src/utils/storage')
vi.mock('../../src/api/documentApi')

const mockStorageManager = vi.mocked(StorageManager)
const mockDocumentApi = vi.mocked(documentApi)

describe('Document Store - Property-Based Tests', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
        mockStorageManager.set.mockResolvedValue()
        mockStorageManager.get.mockResolvedValue(null)
    })

    /**
     * 属性 8：分类过滤正确性
     * 
     * 对于任意分类标签和模板列表，按分类过滤后返回的所有模板都应该属于该分类，
     * 且该分类下的所有模板都应该被返回。
     * 
     * **Validates: Requirements 6.2**
     */
    describe('Property 8: 分类过滤正确性', () => {
        it('should return only templates that belong to the selected category', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // 生成模板列表
                    fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1 }),
                            name: fc.string({ minLength: 1 }),
                            category: fc.constantFrom('劳动法', '合同法', '房产法', '刑法', '民法'),
                            description: fc.string(),
                            icon: fc.string(),
                            usageCount: fc.integer({ min: 0 }),
                            isFavorite: fc.boolean(),
                            fields: fc.constant([])
                        }),
                        { minLength: 10, maxLength: 50 }
                    ),
                    // 生成分类标签
                    fc.constantFrom('劳动法', '合同法', '房产法', '刑法', '民法'),
                    async (templates, category) => {
                        const store = useDocumentStore()

                        // 设置模板列表
                        store.templates = templates as DocumentTemplate[]

                        // 设置分类过滤
                        store.setSelectedCategory(category)

                        // 获取过滤结果
                        const filtered = store.filteredTemplates

                        // 验证：所有结果都属于该分类
                        for (const template of filtered) {
                            expect(template.category).toBe(category)
                        }

                        // 验证：该分类下的所有模板都被返回
                        const expectedTemplates = templates.filter(t => t.category === category)
                        expect(filtered.length).toBe(expectedTemplates.length)

                        // 验证：所有预期的模板都在结果中
                        for (const expected of expectedTemplates) {
                            expect(filtered.some(t => t.id === expected.id)).toBe(true)
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should not return templates from other categories', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1 }),
                            name: fc.string({ minLength: 1 }),
                            category: fc.constantFrom('劳动法', '合同法', '房产法', '刑法', '民法'),
                            description: fc.string(),
                            icon: fc.string(),
                            usageCount: fc.integer({ min: 0 }),
                            isFavorite: fc.boolean(),
                            fields: fc.constant([])
                        }),
                        { minLength: 10, maxLength: 50 }
                    ),
                    fc.constantFrom('劳动法', '合同法', '房产法', '刑法', '民法'),
                    async (templates, category) => {
                        const store = useDocumentStore()

                        store.templates = templates as DocumentTemplate[]
                        store.setSelectedCategory(category)

                        const filtered = store.filteredTemplates

                        // 验证：没有其他分类的模板
                        const otherCategoryTemplates = templates.filter(t => t.category !== category)
                        for (const other of otherCategoryTemplates) {
                            expect(filtered.some(t => t.id === other.id)).toBe(false)
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should return empty array when no templates match the category', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1 }),
                            name: fc.string({ minLength: 1 }),
                            category: fc.constantFrom('劳动法', '合同法'),
                            description: fc.string(),
                            icon: fc.string(),
                            usageCount: fc.integer({ min: 0 }),
                            isFavorite: fc.boolean(),
                            fields: fc.constant([])
                        }),
                        { minLength: 5, maxLength: 20 }
                    ),
                    async (templates) => {
                        const store = useDocumentStore()

                        store.templates = templates as DocumentTemplate[]
                        // 选择一个不存在的分类
                        store.setSelectedCategory('不存在的分类')

                        const filtered = store.filteredTemplates

                        // 验证：返回空数组
                        expect(filtered.length).toBe(0)
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * 属性 9：收藏操作可查询性
     * 
     * 对于任意可收藏对象（模板），收藏操作后，该对象应该出现在收藏列表中；
     * 取消收藏后，该对象不应该出现在收藏列表中。
     * 
     * **Validates: Requirements 6.5**
     */
    describe('Property 9: 收藏操作可查询性', () => {
        it('should add template to favorites list after favoriting', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // 生成模板列表
                    fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1 }),
                            name: fc.string({ minLength: 1 }),
                            category: fc.string(),
                            description: fc.string(),
                            icon: fc.string(),
                            usageCount: fc.integer({ min: 0 }),
                            isFavorite: fc.boolean(),
                            fields: fc.constant([])
                        }),
                        { minLength: 5, maxLength: 20 }
                    ),
                    // 选择一个要收藏的模板索引
                    fc.integer({ min: 0, max: 19 }),
                    async (templates, targetIndex) => {
                        if (targetIndex >= templates.length) return

                        const store = useDocumentStore()

                        // 设置模板列表（确保目标模板未收藏）
                        const templatesWithTarget = templates.map((t, i) => ({
                            ...t,
                            isFavorite: i === targetIndex ? false : t.isFavorite
                        }))
                        store.templates = templatesWithTarget as DocumentTemplate[]

                        const targetTemplate = store.templates[targetIndex]
                        const targetId = targetTemplate.id

                        // Mock API
                        mockDocumentApi.favoriteTemplate.mockResolvedValue()

                        // 收藏模板
                        await store.favoriteTemplate(targetId)

                        // 验证：模板出现在收藏列表中
                        const favorites = store.favoriteTemplatesList
                        expect(favorites.some(t => t.id === targetId)).toBe(true)

                        // 验证：模板的 isFavorite 属性为 true
                        const template = store.templates.find(t => t.id === targetId)
                        expect(template!.isFavorite).toBe(true)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should remove template from favorites list after unfavoriting', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1 }),
                            name: fc.string({ minLength: 1 }),
                            category: fc.string(),
                            description: fc.string(),
                            icon: fc.string(),
                            usageCount: fc.integer({ min: 0 }),
                            isFavorite: fc.boolean(),
                            fields: fc.constant([])
                        }),
                        { minLength: 5, maxLength: 20 }
                    ),
                    fc.integer({ min: 0, max: 19 }),
                    async (templates, targetIndex) => {
                        if (targetIndex >= templates.length) return

                        const store = useDocumentStore()

                        // 设置模板列表（确保目标模板已收藏）
                        const templatesWithTarget = templates.map((t, i) => ({
                            ...t,
                            isFavorite: i === targetIndex ? true : t.isFavorite
                        }))
                        store.templates = templatesWithTarget as DocumentTemplate[]

                        const targetTemplate = store.templates[targetIndex]
                        const targetId = targetTemplate.id

                        // Mock API
                        mockDocumentApi.unfavoriteTemplate.mockResolvedValue()

                        // 取消收藏
                        await store.favoriteTemplate(targetId)

                        // 验证：模板不在收藏列表中
                        const favorites = store.favoriteTemplatesList
                        expect(favorites.some(t => t.id === targetId)).toBe(false)

                        // 验证：模板的 isFavorite 属性为 false
                        const template = store.templates.find(t => t.id === targetId)
                        expect(template!.isFavorite).toBe(false)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain favorite status across multiple operations', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        id: fc.string({ minLength: 1 }),
                        name: fc.string({ minLength: 1 }),
                        category: fc.string(),
                        description: fc.string(),
                        icon: fc.string(),
                        usageCount: fc.integer({ min: 0 }),
                        isFavorite: fc.constant(false),
                        fields: fc.constant([])
                    }),
                    async (template) => {
                        const store = useDocumentStore()

                        store.templates = [template] as DocumentTemplate[]

                        mockDocumentApi.favoriteTemplate.mockResolvedValue()
                        mockDocumentApi.unfavoriteTemplate.mockResolvedValue()

                        // 收藏
                        await store.favoriteTemplate(template.id)
                        expect(store.favoriteTemplatesList.length).toBe(1)

                        // 取消收藏
                        await store.favoriteTemplate(template.id)
                        expect(store.favoriteTemplatesList.length).toBe(0)

                        // 再次收藏
                        await store.favoriteTemplate(template.id)
                        expect(store.favoriteTemplatesList.length).toBe(1)
                    }
                ),
                { numRuns: 100 }
            )
        })
    })
})
