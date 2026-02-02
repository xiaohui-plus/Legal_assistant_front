import { defineStore } from 'pinia'
import type { DocumentTemplate, GeneratedDocument, FormField } from '../types/document'
import { ExportFormat } from '../types/document'
import StorageManager from '../utils/storage'
import { STORAGE_KEYS } from '../utils/constants'
import * as documentApi from '../api/documentApi'

/**
 * 文书状态管理
 * 验证需求 6, 7, 8
 */
export const useDocumentStore = defineStore('document', {
    state: () => ({
        // 模板相关状态
        templates: [] as DocumentTemplate[],
        favoriteTemplates: [] as DocumentTemplate[],
        currentTemplate: null as DocumentTemplate | null,
        templateFields: [] as FormField[],
        
        // 文书相关状态
        savedDocuments: [] as GeneratedDocument[],
        currentDocument: null as GeneratedDocument | null,
        
        // 表单相关状态
        formData: {} as Record<string, any>,
        formValidation: {} as Record<string, string>,
        isFormValid: false,
        
        // 搜索和过滤状态
        searchKeyword: '',
        selectedCategory: '',
        
        // 加载状态
        loading: false,
        generating: false,
        saving: false,
        
        // 错误状态
        error: null as string | null
    }),

    getters: {
        // 获取过滤后的模板列表
        filteredTemplates(): DocumentTemplate[] {
            let filtered = this.templates

            // 按分类过滤 - 验证需求 6.2，属性 8：分类过滤正确性
            if (this.selectedCategory) {
                filtered = filtered.filter((template: DocumentTemplate) => template.category === this.selectedCategory)
            }

            // 按关键词搜索 - 验证需求 6.4，属性 2：搜索结果匹配关键词
            if (this.searchKeyword) {
                const keyword = this.searchKeyword.toLowerCase()
                filtered = filtered.filter((template: DocumentTemplate) => 
                    template.name.toLowerCase().includes(keyword) ||
                    template.description.toLowerCase().includes(keyword)
                )
            }

            return filtered
        },

        // 获取模板分类列表
        templateCategories(): string[] {
            const categories = new Set(this.templates.map((template: DocumentTemplate) => template.category))
            return Array.from(categories).sort()
        },

        // 获取收藏的模板 - 验证需求 6.5，属性 9：收藏操作可查询性
        favoriteTemplatesList(): DocumentTemplate[] {
            return this.templates.filter((template: DocumentTemplate) => template.isFavorite)
        },

        // 检查表单是否完整且有效 - 验证需求 7.5，属性 13：表单完整性控制生成按钮
        isFormComplete(): boolean {
            if (!this.currentTemplate || this.templateFields.length === 0) {
                return false
            }

            // 检查所有必填字段是否已填写
            for (const field of this.templateFields) {
                if (field.required) {
                    const value = this.formData[field.name]
                    if (value === undefined || value === null || value === '') {
                        return false
                    }
                }
            }

            // 检查是否有验证错误
            return this.isFormValid && Object.keys(this.formValidation).length === 0
        },

        // 获取按分类分组的已保存文书
        documentsByCategory(): Record<string, GeneratedDocument[]> {
            const grouped: Record<string, GeneratedDocument[]> = {}
            
            this.savedDocuments.forEach((doc: GeneratedDocument) => {
                const template = this.templates.find((t: DocumentTemplate) => t.id === doc.templateId)
                const category = template?.category || '其他'
                
                if (!grouped[category]) {
                    grouped[category] = []
                }
                grouped[category].push(doc)
            })

            return grouped
        }
    },

    actions: {
        // ==================== 模板管理 ====================

        /**
         * 获取所有模板
         * 验证需求 6.1
         */
        async getTemplates(): Promise<void> {
            this.loading = true
            this.error = null

            try {
                this.templates = await documentApi.getTemplates()
                
                // 加载收藏状态
                await this.loadFavoriteTemplates()
            } catch (error) {
                console.error('获取模板列表失败:', error)
                this.error = '获取模板列表失败，请稍后重试'
            } finally {
                this.loading = false
            }
        },

        /**
         * 获取模板详情
         * 验证需求 6.3
         */
        async getTemplateDetail(templateId: string): Promise<void> {
            this.loading = true
            this.error = null

            try {
                const { template, fields } = await documentApi.getTemplateDetail(templateId)
                this.currentTemplate = template
                this.templateFields = fields
                
                // 清空之前的表单数据
                this.formData = {}
                this.formValidation = {}
                this.isFormValid = false
                
                // 尝试加载暂存的表单数据 - 验证需求 7.8
                await this.loadDraftForm(templateId)
            } catch (error) {
                console.error('获取模板详情失败:', error)
                this.error = '获取模板详情失败，请稍后重试'
            } finally {
                this.loading = false
            }
        },

        /**
         * 搜索模板
         * 验证需求 6.4，属性 2：搜索结果匹配关键词
         */
        setSearchKeyword(keyword: string): void {
            this.searchKeyword = keyword
        },

        /**
         * 设置分类过滤
         * 验证需求 6.2，属性 8：分类过滤正确性
         */
        setSelectedCategory(category: string): void {
            this.selectedCategory = category
        },

        /**
         * 收藏模板
         * 验证需求 6.5，属性 9：收藏操作可查询性
         */
        async favoriteTemplate(templateId: string): Promise<void> {
            try {
                const template = this.templates.find(t => t.id === templateId)
                if (template) {
                    template.isFavorite = !template.isFavorite
                    
                    if (template.isFavorite) {
                        await documentApi.favoriteTemplate(templateId)
                    } else {
                        await documentApi.unfavoriteTemplate(templateId)
                    }
                    
                    // 保存收藏状态到本地
                    await this.saveFavoriteTemplates()
                }
            } catch (error) {
                console.error('收藏操作失败:', error)
                // 回滚状态
                const template = this.templates.find(t => t.id === templateId)
                if (template) {
                    template.isFavorite = !template.isFavorite
                }
                throw error
            }
        },

        // ==================== 表单管理 ====================

        /**
         * 更新表单字段值
         * 验证需求 7.1，属性 11：动态表单字段匹配模板
         */
        updateFormField(fieldName: string, value: any): void {
            this.formData[fieldName] = value
            
            // 实时验证 - 验证需求 7.2
            this.validateFormField(fieldName, value)
        },

        /**
         * 验证表单字段
         * 验证需求 7.2，属性 12：表单验证规则正确性
         */
        async validateFormField(fieldName: string, value: any): Promise<void> {
            if (!this.currentTemplate) return

            try {
                const validationResult = await documentApi.validateParams(this.currentTemplate.id, {
                    ...this.formData,
                    [fieldName]: value
                })

                // 更新验证状态
                if (validationResult.errors[fieldName]) {
                    this.formValidation[fieldName] = validationResult.errors[fieldName]
                } else {
                    delete this.formValidation[fieldName]
                }

                this.isFormValid = validationResult.valid
            } catch (error) {
                console.error('表单验证失败:', error)
                this.formValidation[fieldName] = '验证失败，请稍后重试'
                this.isFormValid = false
            }
        },

        /**
         * 验证整个表单
         * 验证需求 7.2，7.5
         */
        async validateForm(): Promise<boolean> {
            if (!this.currentTemplate) return false

            try {
                const validationResult = await documentApi.validateParams(this.currentTemplate.id, this.formData)
                this.formValidation = validationResult.errors
                this.isFormValid = validationResult.valid
                return validationResult.valid
            } catch (error) {
                console.error('表单验证失败:', error)
                this.error = '表单验证失败，请稍后重试'
                return false
            }
        },

        /**
         * 暂存表单数据
         * 验证需求 7.7，属性 7：本地存储往返一致性
         */
        async saveDraftForm(): Promise<void> {
            if (!this.currentTemplate) return

            try {
                await documentApi.saveDraftForm(this.currentTemplate.id, this.formData)
            } catch (error) {
                console.error('暂存表单失败:', error)
                throw error
            }
        },

        /**
         * 加载暂存的表单数据
         * 验证需求 7.8，属性 7：本地存储往返一致性
         */
        async loadDraftForm(templateId: string): Promise<void> {
            try {
                const draftData = await documentApi.loadDraftForm(templateId)
                if (draftData) {
                    this.formData = draftData
                    // 重新验证表单
                    await this.validateForm()
                }
            } catch (error) {
                console.error('加载暂存表单失败:', error)
                // 加载失败不影响正常流程
            }
        },

        /**
         * 清除表单数据
         */
        clearForm(): void {
            this.formData = {}
            this.formValidation = {}
            this.isFormValid = false
        },

        // ==================== 文书生成 ====================

        /**
         * 生成文书
         * 验证需求 7.6，属性 14：文书生成参数一致性
         */
        async generateDocument(): Promise<GeneratedDocument> {
            if (!this.currentTemplate) {
                throw new Error('没有选择模板')
            }

            // 验证表单
            const isValid = await this.validateForm()
            if (!isValid) {
                throw new Error('表单验证失败，请检查输入内容')
            }

            this.generating = true
            this.error = null

            try {
                const document = await documentApi.generateDocument(this.currentTemplate.id, this.formData)
                this.currentDocument = document
                
                // 清除暂存的表单数据
                await documentApi.clearDraftForm(this.currentTemplate.id)
                
                return document
            } catch (error) {
                console.error('生成文书失败:', error)
                this.error = '生成文书失败，请稍后重试'
                throw error
            } finally {
                this.generating = false
            }
        },

        /**
         * 保存文书
         * 验证需求 8.3，属性 7：本地存储往返一致性
         */
        async saveDocument(document: GeneratedDocument): Promise<void> {
            this.saving = true
            this.error = null

            try {
                // 保存到服务器（如果有）
                await documentApi.saveDocument(document)
                
                // 保存到本地存储
                await documentApi.saveDocumentToLocal(document)
                
                // 更新本地状态
                const existingIndex = this.savedDocuments.findIndex(doc => doc.id === document.id)
                if (existingIndex >= 0) {
                    this.savedDocuments[existingIndex] = document
                } else {
                    this.savedDocuments.push(document)
                }
                
                // 保存到本地存储
                await this.saveSavedDocuments()
            } catch (error) {
                console.error('保存文书失败:', error)
                this.error = '保存文书失败，请稍后重试'
                throw error
            } finally {
                this.saving = false
            }
        },

        /**
         * 更新文书内容
         * 验证需求 8.2
         */
        async updateDocument(documentId: string, content: string): Promise<void> {
            try {
                await documentApi.updateDocument(documentId, content)
                
                // 更新本地状态
                const document = this.savedDocuments.find(doc => doc.id === documentId)
                if (document) {
                    document.content = content
                    document.updatedAt = Date.now()
                }
                
                // 更新当前文书
                if (this.currentDocument && this.currentDocument.id === documentId) {
                    this.currentDocument.content = content
                    this.currentDocument.updatedAt = Date.now()
                }
                
                // 保存到本地存储
                await this.saveSavedDocuments()
            } catch (error) {
                console.error('更新文书失败:', error)
                this.error = '更新文书失败，请稍后重试'
                throw error
            }
        },

        /**
         * 删除文书
         * 验证需求 8
         */
        async deleteDocument(documentId: string): Promise<void> {
            try {
                await documentApi.deleteDocument(documentId)
                
                // 从本地删除
                await documentApi.deleteLocalDocument(documentId)
                
                // 更新本地状态
                const index = this.savedDocuments.findIndex(doc => doc.id === documentId)
                if (index >= 0) {
                    this.savedDocuments.splice(index, 1)
                }
                
                // 如果删除的是当前文书，清空当前状态
                if (this.currentDocument && this.currentDocument.id === documentId) {
                    this.currentDocument = null
                }
                
                // 保存到本地存储
                await this.saveSavedDocuments()
            } catch (error) {
                console.error('删除文书失败:', error)
                this.error = '删除文书失败，请稍后重试'
                throw error
            }
        },

        /**
         * 复制文书内容
         * 验证需求 8.4
         */
        async copyDocumentContent(content: string): Promise<void> {
            try {
                await documentApi.copyDocumentContent(content)
            } catch (error) {
                console.error('复制文书内容失败:', error)
                throw error
            }
        },

        /**
         * 导出文书
         * 验证需求 8.5
         */
        async exportDocument(document: GeneratedDocument, format: ExportFormat = ExportFormat.TEXT): Promise<void> {
            try {
                await documentApi.exportDocument(document, format)
            } catch (error) {
                console.error('导出文书失败:', error)
                throw error
            }
        },

        // ==================== 数据加载和保存 ====================

        /**
         * 加载已保存的文书
         * 验证需求 8.3
         */
        async loadSavedDocuments(): Promise<void> {
            this.loading = true
            try {
                // 优先从服务器加载
                try {
                    this.savedDocuments = await documentApi.getSavedDocuments()
                } catch (error) {
                    // 服务器加载失败，从本地加载
                    this.savedDocuments = await documentApi.getLocalSavedDocuments()
                }
            } catch (error) {
                console.error('加载已保存文书失败:', error)
                this.savedDocuments = []
            } finally {
                this.loading = false
            }
        },

        /**
         * 保存文书列表到本地存储
         */
        async saveSavedDocuments(): Promise<void> {
            try {
                await StorageManager.set(STORAGE_KEYS.SAVED_DOCUMENTS, this.savedDocuments)
            } catch (error) {
                console.error('保存文书列表失败:', error)
            }
        },

        /**
         * 加载收藏的模板
         */
        async loadFavoriteTemplates(): Promise<void> {
            try {
                const favoriteIds = await StorageManager.get<string[]>(STORAGE_KEYS.FAVORITE_TEMPLATES) || []
                
                // 更新模板的收藏状态
                this.templates.forEach((template: DocumentTemplate) => {
                    template.isFavorite = favoriteIds.includes(template.id)
                })
            } catch (error) {
                console.error('加载收藏模板失败:', error)
            }
        },

        /**
         * 保存收藏的模板
         */
        async saveFavoriteTemplates(): Promise<void> {
            try {
                const favoriteIds = this.templates
                    .filter((template: DocumentTemplate) => template.isFavorite)
                    .map((template: DocumentTemplate) => template.id)
                
                await StorageManager.set(STORAGE_KEYS.FAVORITE_TEMPLATES, favoriteIds)
            } catch (error) {
                console.error('保存收藏模板失败:', error)
            }
        },

        /**
         * 设置当前文书
         */
        setCurrentDocument(document: GeneratedDocument | null): void {
            this.currentDocument = document
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
            this.currentTemplate = null
            this.templateFields = []
            this.currentDocument = null
            this.formData = {}
            this.formValidation = {}
            this.isFormValid = false
            this.searchKeyword = ''
            this.selectedCategory = ''
            this.error = null
        }
    }
})
