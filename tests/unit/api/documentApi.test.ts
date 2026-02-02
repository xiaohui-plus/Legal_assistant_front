/**
 * 文书 API 测试
 * 验证需求 6, 7
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as documentApi from '../../../api/documentApi'
import httpClient from '../../../api/request'
import type { DocumentTemplate, GeneratedDocument, FormField, ValidationResult } from '../../../types/document'
import { FieldType, ExportFormat } from '../../../types/document'

// Mock httpClient
vi.mock('../../../api/request', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}))

// Mock uni API
const mockUni = {
    setClipboardData: vi.fn(),
    showToast: vi.fn(),
    share: vi.fn(),
    getFileSystemManager: vi.fn(() => ({
        writeFile: vi.fn()
    })),
    env: {
        USER_DATA_PATH: '/mock/path'
    },
    setStorage: vi.fn(),
    getStorage: vi.fn(),
    removeStorage: vi.fn()
}

// @ts-ignore
global.uni = mockUni

// Mock window for H5 tests
const mockWindow = {
    document: {
        createElement: vi.fn(() => ({
            href: '',
            download: '',
            click: vi.fn(),
            remove: vi.fn()
        })),
        body: {
            appendChild: vi.fn(),
            removeChild: vi.fn()
        }
    },
    URL: {
        createObjectURL: vi.fn(() => 'mock-url'),
        revokeObjectURL: vi.fn()
    },
    Blob: vi.fn()
}

describe('Document API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Template Management', () => {
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
            },
            {
                id: 'template2',
                name: '租赁合同',
                category: '房产法',
                description: '房屋租赁合同模板',
                icon: 'house',
                usageCount: 50,
                isFavorite: true,
                fields: []
            }
        ]

        it('should get all templates', async () => {
            const mockResponse = { data: { templates: mockTemplates } }
            vi.mocked(httpClient.get).mockResolvedValue(mockResponse)

            const result = await documentApi.getTemplates()

            expect(httpClient.get).toHaveBeenCalledWith('/api/templates')
            expect(result).toEqual(mockTemplates)
        })

        it('should get templates by category', async () => {
            const categoryTemplates = [mockTemplates[0]]
            const mockResponse = { data: { templates: categoryTemplates } }
            vi.mocked(httpClient.get).mockResolvedValue(mockResponse)

            const result = await documentApi.getTemplatesByCategory('劳动法')

            expect(httpClient.get).toHaveBeenCalledWith('/api/templates', { category: '劳动法' })
            expect(result).toEqual(categoryTemplates)
        })

        it('should search templates', async () => {
            const searchResults = [mockTemplates[0]]
            const mockResponse = { data: { templates: searchResults } }
            vi.mocked(httpClient.get).mockResolvedValue(mockResponse)

            const result = await documentApi.searchTemplates('劳动')

            expect(httpClient.get).toHaveBeenCalledWith('/api/templates/search', { keyword: '劳动' })
            expect(result).toEqual(searchResults)
        })

        it('should get template detail', async () => {
            const mockFields: FormField[] = [
                {
                    name: 'employeeName',
                    label: '员工姓名',
                    type: FieldType.TEXT,
                    required: true,
                    placeholder: '请输入员工姓名'
                }
            ]
            const mockResponse = {
                data: {
                    template: mockTemplates[0],
                    fields: mockFields
                }
            }
            vi.mocked(httpClient.get).mockResolvedValue(mockResponse)

            const result = await documentApi.getTemplateDetail('template1')

            expect(httpClient.get).toHaveBeenCalledWith('/api/templates/template1')
            expect(result).toEqual({
                template: mockTemplates[0],
                fields: mockFields
            })
        })

        it('should favorite template', async () => {
            vi.mocked(httpClient.post).mockResolvedValue({ data: null })

            await documentApi.favoriteTemplate('template1')

            expect(httpClient.post).toHaveBeenCalledWith('/api/templates/favorite', {
                templateId: 'template1'
            })
        })

        it('should unfavorite template', async () => {
            vi.mocked(httpClient.delete).mockResolvedValue({ data: null })

            await documentApi.unfavoriteTemplate('template1')

            expect(httpClient.delete).toHaveBeenCalledWith('/api/templates/favorite/template1')
        })

        it('should get favorite templates', async () => {
            const favoriteTemplates = [mockTemplates[1]]
            const mockResponse = { data: { templates: favoriteTemplates } }
            vi.mocked(httpClient.get).mockResolvedValue(mockResponse)

            const result = await documentApi.getFavoriteTemplates()

            expect(httpClient.get).toHaveBeenCalledWith('/api/templates/favorites')
            expect(result).toEqual(favoriteTemplates)
        })

        it('should handle template API errors', async () => {
            vi.mocked(httpClient.get).mockRejectedValue(new Error('Network error'))

            await expect(documentApi.getTemplates()).rejects.toThrow('获取模板列表失败，请稍后重试')
        })
    })

    describe('Form Validation', () => {
        const mockFields: FormField[] = [
            {
                name: 'employeeName',
                label: '员工姓名',
                type: FieldType.TEXT,
                required: true,
                validation: {
                    min: 2,
                    max: 20,
                    message: '员工姓名长度必须在2-20个字符之间'
                }
            },
            {
                name: 'salary',
                label: '薪资金额',
                type: FieldType.NUMBER,
                required: true,
                validation: {
                    min: 1,
                    message: '薪资金额必须大于0'
                }
            },
            {
                name: 'startDate',
                label: '入职日期',
                type: FieldType.DATE,
                required: true
            },
            {
                name: 'description',
                label: '工作描述',
                type: FieldType.TEXTAREA,
                required: false
            }
        ]

        beforeEach(() => {
            // Mock getTemplateDetail for validation tests
            vi.mocked(httpClient.get).mockResolvedValue({
                data: {
                    template: {
                        id: 'template1',
                        name: '劳动合同',
                        category: '劳动法',
                        description: '标准劳动合同模板',
                        icon: 'contract',
                        usageCount: 100,
                        isFavorite: false,
                        fields: mockFields
                    },
                    fields: mockFields
                }
            })
        })

        it('should validate required fields', async () => {
            const params = {
                employeeName: '',
                salary: 5000,
                startDate: '2024-01-01'
            }

            const result = await documentApi.validateParams('template1', params)

            expect(result.valid).toBe(false)
            expect(result.errors.employeeName).toBe('员工姓名是必填项')
        })

        it('should validate field length', async () => {
            const params = {
                employeeName: 'A', // Too short
                salary: 5000,
                startDate: '2024-01-01'
            }

            const result = await documentApi.validateParams('template1', params)

            expect(result.valid).toBe(false)
            expect(result.errors.employeeName).toBe('员工姓名长度必须在2-20个字符之间')
        })

        it('should validate amount fields (requirement 7.3)', async () => {
            const params = {
                employeeName: '张三',
                salary: 0, // Invalid amount
                startDate: '2024-01-01'
            }

            const result = await documentApi.validateParams('template1', params)

            expect(result.valid).toBe(false)
            expect(result.errors.salary).toBe('薪资金额必须大于0')
        })

        it('should validate past dates (requirement 7.4)', async () => {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            
            const params = {
                employeeName: '张三',
                salary: 5000,
                startDate: yesterday.toISOString().split('T')[0] // Past date
            }

            const result = await documentApi.validateParams('template1', params)

            expect(result.valid).toBe(false)
            expect(result.errors.startDate).toBe('入职日期不能选择过去的日期')
        })

        it('should validate valid form data', async () => {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            
            const params = {
                employeeName: '张三',
                salary: 5000,
                startDate: tomorrow.toISOString().split('T')[0],
                description: '负责前端开发工作'
            }

            const result = await documentApi.validateParams('template1', params)

            expect(result.valid).toBe(true)
            expect(Object.keys(result.errors)).toHaveLength(0)
        })

        it('should check form completeness', async () => {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            
            const validParams = {
                employeeName: '张三',
                salary: 5000,
                startDate: tomorrow.toISOString().split('T')[0]
            }

            const invalidParams = {
                employeeName: '',
                salary: 5000,
                startDate: tomorrow.toISOString().split('T')[0]
            }

            const validResult = await documentApi.isFormComplete('template1', validParams)
            const invalidResult = await documentApi.isFormComplete('template1', invalidParams)

            expect(validResult).toBe(true)
            expect(invalidResult).toBe(false)
        })
    })

    describe('Document Generation', () => {
        const mockDocument: GeneratedDocument = {
            id: 'doc1',
            templateId: 'template1',
            templateName: '劳动合同',
            content: '这是生成的劳动合同内容...',
            params: { employeeName: '张三', salary: 5000 },
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isSaved: false
        }

        it('should generate document', async () => {
            vi.mocked(httpClient.post).mockResolvedValue({ data: mockDocument })

            const params = { employeeName: '张三', salary: 5000 }
            const result = await documentApi.generateDocument('template1', params)

            expect(httpClient.post).toHaveBeenCalledWith('/api/documents/generate', {
                templateId: 'template1',
                params
            })
            expect(result).toEqual(mockDocument)
        })

        it('should save document', async () => {
            vi.mocked(httpClient.post).mockResolvedValue({ data: null })

            await documentApi.saveDocument(mockDocument)

            expect(httpClient.post).toHaveBeenCalledWith('/api/documents/save', {
                document: mockDocument
            })
        })

        it('should get saved documents', async () => {
            const mockResponse = { data: { documents: [mockDocument] } }
            vi.mocked(httpClient.get).mockResolvedValue(mockResponse)

            const result = await documentApi.getSavedDocuments()

            expect(httpClient.get).toHaveBeenCalledWith('/api/documents/saved')
            expect(result).toEqual([mockDocument])
        })

        it('should update document', async () => {
            vi.mocked(httpClient.put).mockResolvedValue({ data: null })

            const newContent = '更新后的文书内容'
            await documentApi.updateDocument('doc1', newContent)

            expect(httpClient.put).toHaveBeenCalledWith('/api/documents/doc1', {
                content: newContent
            })
        })

        it('should delete document', async () => {
            vi.mocked(httpClient.delete).mockResolvedValue({ data: null })

            await documentApi.deleteDocument('doc1')

            expect(httpClient.delete).toHaveBeenCalledWith('/api/documents/doc1')
        })
    })

    describe('Document Operations', () => {
        const mockDocument: GeneratedDocument = {
            id: 'doc1',
            templateId: 'template1',
            templateName: '劳动合同',
            content: '这是生成的劳动合同内容...',
            params: { employeeName: '张三', salary: 5000 },
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isSaved: false
        }

        it('should copy document content to clipboard', async () => {
            mockUni.setClipboardData.mockResolvedValue({})

            await documentApi.copyDocumentContent(mockDocument.content)

            expect(mockUni.setClipboardData).toHaveBeenCalledWith({
                data: mockDocument.content
            })
            expect(mockUni.showToast).toHaveBeenCalledWith({
                title: '复制成功',
                icon: 'success',
                duration: 2000
            })
        })

        it('should handle clipboard copy error', async () => {
            mockUni.setClipboardData.mockRejectedValue(new Error('Copy failed'))

            await expect(documentApi.copyDocumentContent(mockDocument.content))
                .rejects.toThrow('复制文书内容失败')

            expect(mockUni.showToast).toHaveBeenCalledWith({
                title: '复制失败',
                icon: 'error',
                duration: 2000
            })
        })

        it('should export document with different formats', async () => {
            // Mock H5 environment
            // @ts-ignore
            global.window = mockWindow

            await documentApi.exportDocument(mockDocument, ExportFormat.PDF)

            expect(mockWindow.Blob).toHaveBeenCalledWith(
                [mockDocument.content],
                { type: 'application/pdf' }
            )
        })
    })

    describe('Local Storage Operations', () => {
        it('should save draft form', async () => {
            mockUni.setStorage.mockResolvedValue({})

            const formData = { employeeName: '张三', salary: 5000 }
            await documentApi.saveDraftForm('template1', formData)

            expect(mockUni.setStorage).toHaveBeenCalledWith({
                key: 'form_draft_template1',
                data: {
                    templateId: 'template1',
                    formData,
                    savedAt: expect.any(Number)
                }
            })
        })

        it('should load draft form', async () => {
            const formData = { employeeName: '张三', salary: 5000 }
            mockUni.getStorage.mockResolvedValue({
                data: {
                    templateId: 'template1',
                    formData,
                    savedAt: Date.now()
                }
            })

            const result = await documentApi.loadDraftForm('template1')

            expect(mockUni.getStorage).toHaveBeenCalledWith({
                key: 'form_draft_template1'
            })
            expect(result).toEqual(formData)
        })

        it('should return null when no draft exists', async () => {
            mockUni.getStorage.mockRejectedValue(new Error('No data'))

            const result = await documentApi.loadDraftForm('template1')

            expect(result).toBeNull()
        })

        it('should clear draft form', async () => {
            mockUni.removeStorage.mockResolvedValue({})

            await documentApi.clearDraftForm('template1')

            expect(mockUni.removeStorage).toHaveBeenCalledWith({
                key: 'form_draft_template1'
            })
        })

        it('should save document to local storage', async () => {
            const mockDocument: GeneratedDocument = {
                id: 'doc1',
                templateId: 'template1',
                templateName: '劳动合同',
                content: '这是生成的劳动合同内容...',
                params: { employeeName: '张三', salary: 5000 },
                createdAt: Date.now(),
                updatedAt: Date.now(),
                isSaved: false
            }

            // Mock existing documents
            mockUni.getStorage.mockResolvedValue({ data: [] })
            mockUni.setStorage.mockResolvedValue({})

            await documentApi.saveDocumentToLocal(mockDocument)

            expect(mockUni.setStorage).toHaveBeenCalledWith({
                key: 'saved_documents',
                data: [expect.objectContaining({
                    ...mockDocument,
                    isSaved: true,
                    updatedAt: expect.any(Number)
                })]
            })
        })

        it('should get local saved documents', async () => {
            const mockDocuments = [
                {
                    id: 'doc1',
                    templateId: 'template1',
                    templateName: '劳动合同',
                    content: '内容...',
                    params: {},
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    isSaved: true
                }
            ]

            mockUni.getStorage.mockResolvedValue({ data: mockDocuments })

            const result = await documentApi.getLocalSavedDocuments()

            expect(result).toEqual(mockDocuments)
        })

        it('should delete local document', async () => {
            const mockDocuments = [
                { id: 'doc1', templateName: '劳动合同' },
                { id: 'doc2', templateName: '租赁合同' }
            ]

            mockUni.getStorage.mockResolvedValue({ data: mockDocuments })
            mockUni.setStorage.mockResolvedValue({})

            await documentApi.deleteLocalDocument('doc1')

            expect(mockUni.setStorage).toHaveBeenCalledWith({
                key: 'saved_documents',
                data: [{ id: 'doc2', templateName: '租赁合同' }]
            })
        })
    })
})