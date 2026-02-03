/**
 * Document Store 单元测试
 * 验证需求 6, 7, 8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDocumentStore } from '@/store/document'
import type { DocumentTemplate, GeneratedDocument, FormField } from '@/types/document'
import { FieldType, ExportFormat } from '@/types/document'
import { STORAGE_KEYS } from '@/utils/constants'
import StorageManager from '@/utils/storage'
import * as documentApi from '@/api/documentApi'

// Mock dependencies
vi.mock('@/utils/storage')
vi.mock('@/api/documentApi')

const mockStorageManager = vi.mocked(StorageManager)
const mockDocumentApi = vi.mocked(documentApi)

describe('Document Store', () => {
    let store: ReturnType<typeof useDocumentStore>

    beforeEach(() => {
        setActivePinia(createPinia())
        store = useDocumentStore()
        vi.clearAllMocks()
    })

    describe('初始状态', () => {
        it('应该有正确的初始状态', () => {
            expect(store.templates).toEqual([])
            expect(store.favoriteTemplates).toEqual([])
            expect(store.currentTemplate).toBeNull()
            expect(store.templateFields).toEqual([])
            expect(store.savedDocuments).toEqual([])
            expect(store.currentDocument).toBeNull()
            expect(store.formData).toEqual({})
            expect(store.formValidation).toEqual({})
            expect(store.isFormValid).toBe(false)
            expect(store.searchKeyword).toBe('')
            expect(store.selectedCategory).toBe('')
            expect(store.loading).toBe(false)
            expect(store.generating).toBe(false)
            expect(store.saving).toBe(false)
            expect(store.error).toBeNull()
        })
    })

    describe('Getters', () => {
        beforeEach(() => {
            store.templates = [
                {
                    id: 'template1',
                    name: '劳动合同',
                    category: '劳动法',
                    description: '标准劳动合同模板',
                    icon: 'contract',
                    usageCount: 100,
                    isFavorite: true,
                    fields: []
                },
                {
                    id: 'template2',
                    name: '租房合同',
                    category: '房产法',
                    description: '租房合同模板',
                    icon: 'house',
                    usageCount: 50,
                    isFavorite: false,
                    fields: []
                },
                {
                    id: 'template3',
                    name: '借款合同',
                    category: '合同法',
                    description: '借款合同模板',
                    icon: 'money',
                    usageCount: 75,
                    isFavorite: true,
                    fields: []
                }
            ] as DocumentTemplate[]
        })

        describe('filteredTemplates', () => {
            it('应该返回所有模板当没有过滤条件时', () => {
                const filtered = store.filteredTemplates
                expect(filtered).toHaveLength(3)
            })

            it('应该按分类过滤模板 - 验证需求 6.2，属性 8：分类过滤正确性', () => {
                store.setSelectedCategory('劳动法')
                const filtered = store.filteredTemplates
                expect(filtered).toHaveLength(1)
                expect(filtered[0].id).toBe('template1')
            })

            it('应该按关键词搜索模板 - 验证需求 6.4，属性 2：搜索结果匹配关键词', () => {
                store.setSearchKeyword('劳动')
                const filtered = store.filteredTemplates
                expect(filtered).toHaveLength(1)
                expect(filtered[0].id).toBe('template1')
            })

            it('应该同时应用分类和关键词过滤', () => {
                store.setSelectedCategory('合同法')
                store.setSearchKeyword('借款')
                const filtered = store.filteredTemplates
                expect(filtered).toHaveLength(1)
                expect(filtered[0].id).toBe('template3')
            })

            it('应该在没有匹配结果时返回空数组', () => {
                store.setSearchKeyword('不存在的关键词')
                const filtered = store.filteredTemplates
                expect(filtered).toHaveLength(0)
            })
        })

        describe('templateCategories', () => {
            it('应该返回所有唯一的分类', () => {
                const categories = store.templateCategories
                expect(categories).toHaveLength(3)
                expect(categories).toContain('劳动法')
                expect(categories).toContain('房产法')
                expect(categories).toContain('合同法')
            })

            it('应该返回排序后的分类列表', () => {
                const categories = store.templateCategories
                expect(categories).toEqual(['劳动法', '合同法', '房产法'].sort())
            })
        })

        describe('favoriteTemplatesList', () => {
            it('应该返回收藏的模板列表 - 验证需求 6.5，属性 9：收藏操作可查询性', () => {
                const favorites = store.favoriteTemplatesList
                expect(favorites).toHaveLength(2)
                expect(favorites.every(t => t.isFavorite)).toBe(true)
            })

            it('应该在没有收藏模板时返回空数组', () => {
                store.templates.forEach(t => t.isFavorite = false)
                const favorites = store.favoriteTemplatesList
                expect(favorites).toHaveLength(0)
            })
        })

        describe('isFormComplete', () => {
            beforeEach(() => {
                store.currentTemplate = {
                    id: 'template1',
                    name: '测试模板',
                    category: '测试',
                    description: '测试描述',
                    icon: 'test',
                    usageCount: 0,
                    isFavorite: false,
                    fields: []
                }
                store.templateFields = [
                    {
                        name: 'field1',
                        label: '必填字段',
                        type: FieldType.TEXT,
                        required: true
                    },
                    {
                        name: 'field2',
                        label: '可选字段',
                        type: FieldType.TEXT,
                        required: false
                    }
                ] as FormField[]
            })

            it('应该在所有必填字段填写完成且验证通过时返回true - 验证需求 7.5，属性 13：表单完整性控制生成按钮', () => {
                store.formData = {
                    field1: '测试值',
                    field2: '可选值'
                }
                store.isFormValid = true
                store.formValidation = {}

                expect(store.isFormComplete).toBe(true)
            })

            it('应该在必填字段未填写时返回false', () => {
                store.formData = {
                    field2: '可选值'
                }
                store.isFormValid = true

                expect(store.isFormComplete).toBe(false)
            })

            it('应该在有验证错误时返回false', () => {
                store.formData = {
                    field1: '测试值'
                }
                store.isFormValid = false
                store.formValidation = {
                    field1: '验证错误'
                }

                expect(store.isFormComplete).toBe(false)
            })

            it('应该在没有当前模板时返回false', () => {
                store.currentTemplate = null
                expect(store.isFormComplete).toBe(false)
            })
        })

        describe('documentsByCategory', () => {
            beforeEach(() => {
                store.savedDocuments = [
                    {
                        id: 'doc1',
                        templateId: 'template1',
                        templateName: '劳动合同',
                        content: '内容1',
                        params: {},
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        isSaved: true
                    },
                    {
                        id: 'doc2',
                        templateId: 'template2',
                        templateName: '租房合同',
                        content: '内容2',
                        params: {},
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        isSaved: true
                    }
                ] as GeneratedDocument[]
            })

            it('应该按分类分组文书', () => {
                const grouped = store.documentsByCategory
                expect(Object.keys(grouped)).toContain('劳动法')
                expect(Object.keys(grouped)).toContain('房产法')
            })

            it('应该将未知模板的文书归类到"其他"', () => {
                store.savedDocuments.push({
                    id: 'doc3',
                    templateId: 'unknown',
                    templateName: '未知模板',
                    content: '内容3',
                    params: {},
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    isSaved: true
                })

                const grouped = store.documentsByCategory
                expect(grouped['其他']).toBeDefined()
                expect(grouped['其他']).toHaveLength(1)
            })
        })
    })

    describe('模板管理 Actions', () => {
        describe('getTemplates', () => {
            it('应该成功获取模板列表 - 验证需求 6.1', async () => {
                const mockTemplates: DocumentTemplate[] = [
                    {
                        id: 'template1',
                        name: '劳动合同',
                        category: '劳动法',
                        description: '标准劳动合同模板',
                        icon: 'contract',
                        usageCount: 100,
                        isFavorite: false,
                        fields: []
                    }
                ]

                mockDocumentApi.getTemplates.mockResolvedValue(mockTemplates)
                mockStorageManager.get.mockResolvedValue([])

                await store.getTemplates()

                expect(store.templates).toEqual(mockTemplates)
                expect(store.loading).toBe(false)
                expect(store.error).toBeNull()
            })

            it('应该在获取失败时设置错误状态', async () => {
                const error = new Error('获取失败')
                mockDocumentApi.getTemplates.mockRejectedValue(error)

                await store.getTemplates()

                expect(store.error).toBe('获取模板列表失败，请稍后重试')
                expect(store.loading).toBe(false)
            })
        })

        describe('getTemplateDetail', () => {
            it('应该成功获取模板详情 - 验证需求 6.3', async () => {
                const mockTemplate: DocumentTemplate = {
                    id: 'template1',
                    name: '劳动合同',
                    category: '劳动法',
                    description: '标准劳动合同模板',
                    icon: 'contract',
                    usageCount: 100,
                    isFavorite: false,
                    fields: []
                }
                const mockFields: FormField[] = [
                    {
                        name: 'employeeName',
                        label: '员工姓名',
                        type: FieldType.TEXT,
                        required: true
                    }
                ]

                mockDocumentApi.getTemplateDetail.mockResolvedValue({
                    template: mockTemplate,
                    fields: mockFields
                })
                mockDocumentApi.loadDraftForm.mockResolvedValue(null)

                await store.getTemplateDetail('template1')

                expect(store.currentTemplate).toEqual(mockTemplate)
                expect(store.templateFields).toEqual(mockFields)
                expect(store.formData).toEqual({})
                expect(store.loading).toBe(false)
            })

            it('应该加载暂存的表单数据 - 验证需求 7.8', async () => {
                const mockTemplate: DocumentTemplate = {
                    id: 'template1',
                    name: '劳动合同',
                    category: '劳动法',
                    description: '标准劳动合同模板',
                    icon: 'contract',
                    usageCount: 100,
                    isFavorite: false,
                    fields: []
                }
                const mockDraftData = {
                    employeeName: '张三',
                    salary: 10000
                }

                mockDocumentApi.getTemplateDetail.mockResolvedValue({
                    template: mockTemplate,
                    fields: []
                })
                mockDocumentApi.loadDraftForm.mockResolvedValue(mockDraftData)
                mockDocumentApi.validateParams.mockResolvedValue({
                    valid: true,
                    errors: {}
                })

                await store.getTemplateDetail('template1')

                expect(store.formData).toEqual(mockDraftData)
            })
        })

        describe('favoriteTemplate', () => {
            beforeEach(() => {
                store.templates = [
                    {
                        id: 'template1',
                        name: '劳动合同',
                        category: '劳动法',
                        description: '标准劳动合同模板',
                        icon: 'contract',
                        usageCount: 100,
                        isFavorite: false,
                        fields: []
                    }
                ] as DocumentTemplate[]
            })

            it('应该成功收藏模板 - 验证需求 6.5，属性 9：收藏操作可查询性', async () => {
                mockDocumentApi.favoriteTemplate.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                await store.favoriteTemplate('template1')

                expect(store.templates[0].isFavorite).toBe(true)
                expect(mockDocumentApi.favoriteTemplate).toHaveBeenCalledWith('template1')
            })

            it('应该成功取消收藏模板', async () => {
                store.templates[0].isFavorite = true
                mockDocumentApi.unfavoriteTemplate.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                await store.favoriteTemplate('template1')

                expect(store.templates[0].isFavorite).toBe(false)
                expect(mockDocumentApi.unfavoriteTemplate).toHaveBeenCalledWith('template1')
            })

            it('应该在操作失败时回滚状态', async () => {
                const error = new Error('收藏失败')
                mockDocumentApi.favoriteTemplate.mockRejectedValue(error)

                await expect(store.favoriteTemplate('template1')).rejects.toThrow(error)
                expect(store.templates[0].isFavorite).toBe(false)
            })
        })
    })

    describe('表单管理 Actions', () => {
        beforeEach(() => {
            store.currentTemplate = {
                id: 'template1',
                name: '测试模板',
                category: '测试',
                description: '测试描述',
                icon: 'test',
                usageCount: 0,
                isFavorite: false,
                fields: []
            }
        })

        describe('updateFormField', () => {
            it('应该更新表单字段值 - 验证需求 7.1', () => {
                mockDocumentApi.validateParams.mockResolvedValue({
                    valid: true,
                    errors: {}
                })

                store.updateFormField('fieldName', 'fieldValue')

                expect(store.formData.fieldName).toBe('fieldValue')
            })
        })

        describe('validateFormField', () => {
            it('应该验证表单字段 - 验证需求 7.2，属性 12：表单验证规则正确性', async () => {
                mockDocumentApi.validateParams.mockResolvedValue({
                    valid: true,
                    errors: {}
                })

                await store.validateFormField('fieldName', 'validValue')

                expect(store.isFormValid).toBe(true)
                expect(store.formValidation).toEqual({})
            })

            it('应该在验证失败时设置错误信息', async () => {
                mockDocumentApi.validateParams.mockResolvedValue({
                    valid: false,
                    errors: {
                        fieldName: '字段值无效'
                    }
                })

                await store.validateFormField('fieldName', 'invalidValue')

                expect(store.isFormValid).toBe(false)
                expect(store.formValidation.fieldName).toBe('字段值无效')
            })
        })

        describe('saveDraftForm', () => {
            it('应该暂存表单数据 - 验证需求 7.7', async () => {
                store.formData = {
                    field1: 'value1',
                    field2: 'value2'
                }
                mockDocumentApi.saveDraftForm.mockResolvedValue()

                await store.saveDraftForm()

                expect(mockDocumentApi.saveDraftForm).toHaveBeenCalledWith(
                    'template1',
                    store.formData
                )
            })

            it('应该在没有当前模板时不执行操作', async () => {
                store.currentTemplate = null

                await store.saveDraftForm()

                expect(mockDocumentApi.saveDraftForm).not.toHaveBeenCalled()
            })
        })
    })

    describe('文书生成 Actions', () => {
        beforeEach(() => {
            store.currentTemplate = {
                id: 'template1',
                name: '测试模板',
                category: '测试',
                description: '测试描述',
                icon: 'test',
                usageCount: 0,
                isFavorite: false,
                fields: []
            }
            store.formData = {
                field1: 'value1'
            }
        })

        describe('generateDocument', () => {
            it('应该成功生成文书 - 验证需求 7.6，属性 14：文书生成参数一致性', async () => {
                const mockDocument: GeneratedDocument = {
                    id: 'doc1',
                    templateId: 'template1',
                    templateName: '测试模板',
                    content: '生成的文书内容',
                    params: store.formData,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    isSaved: false
                }

                mockDocumentApi.validateParams.mockResolvedValue({
                    valid: true,
                    errors: {}
                })
                mockDocumentApi.generateDocument.mockResolvedValue(mockDocument)
                mockDocumentApi.clearDraftForm.mockResolvedValue()

                const result = await store.generateDocument()

                expect(result).toEqual(mockDocument)
                expect(store.currentDocument).toEqual(mockDocument)
                expect(store.generating).toBe(false)
            })

            it('应该在表单验证失败时抛出错误', async () => {
                mockDocumentApi.validateParams.mockResolvedValue({
                    valid: false,
                    errors: { field1: '验证失败' }
                })

                await expect(store.generateDocument()).rejects.toThrow('表单验证失败，请检查输入内容')
            })

            it('应该在没有当前模板时抛出错误', async () => {
                store.currentTemplate = null

                await expect(store.generateDocument()).rejects.toThrow('没有选择模板')
            })
        })

        describe('saveDocument', () => {
            it('应该成功保存文书 - 验证需求 8.3', async () => {
                const mockDocument: GeneratedDocument = {
                    id: 'doc1',
                    templateId: 'template1',
                    templateName: '测试模板',
                    content: '文书内容',
                    params: {},
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    isSaved: true
                }

                mockDocumentApi.saveDocument.mockResolvedValue()
                mockDocumentApi.saveDocumentToLocal.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                await store.saveDocument(mockDocument)

                expect(store.savedDocuments).toContainEqual(mockDocument)
                expect(store.saving).toBe(false)
            })
        })

        describe('updateDocument', () => {
            beforeEach(() => {
                store.savedDocuments = [
                    {
                        id: 'doc1',
                        templateId: 'template1',
                        templateName: '测试模板',
                        content: '原内容',
                        params: {},
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        isSaved: true
                    }
                ] as GeneratedDocument[]
            })

            it('应该成功更新文书内容 - 验证需求 8.2', async () => {
                mockDocumentApi.updateDocument.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                await store.updateDocument('doc1', '新内容')

                expect(store.savedDocuments[0].content).toBe('新内容')
            })
        })

        describe('deleteDocument', () => {
            beforeEach(() => {
                store.savedDocuments = [
                    {
                        id: 'doc1',
                        templateId: 'template1',
                        templateName: '测试模板',
                        content: '内容',
                        params: {},
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        isSaved: true
                    }
                ] as GeneratedDocument[]
                store.currentDocument = store.savedDocuments[0]
            })

            it('应该成功删除文书', async () => {
                mockDocumentApi.deleteDocument.mockResolvedValue()
                mockDocumentApi.deleteLocalDocument.mockResolvedValue()
                mockStorageManager.set.mockResolvedValue()

                await store.deleteDocument('doc1')

                expect(store.savedDocuments).toHaveLength(0)
                expect(store.currentDocument).toBeNull()
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
                store.currentTemplate = {
                    id: 'template1',
                    name: '测试模板',
                    category: '测试',
                    description: '测试描述',
                    icon: 'test',
                    usageCount: 0,
                    isFavorite: false,
                    fields: []
                }
                store.formData = { field1: 'value1' }
                store.formValidation = { field1: '错误' }
                store.isFormValid = true
                store.searchKeyword = '搜索'
                store.selectedCategory = '分类'
                store.error = '错误'

                store.reset()

                // 验证所有状态都被重置为初始值
                expect(store.currentTemplate).toBeNull()
                expect(store.templateFields).toEqual([])
                expect(store.currentDocument).toBeNull()
                expect(store.formData).toEqual({})
                expect(store.formValidation).toEqual({})
                expect(store.isFormValid).toBe(false)
                expect(store.searchKeyword).toBe('')
                expect(store.selectedCategory).toBe('')
                expect(store.error).toBeNull()
            })
        })
    })
})
