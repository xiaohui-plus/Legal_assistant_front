/**
 * 文书服务
 * 验证需求 6, 7, 8
 */

import type { DocumentTemplate, GeneratedDocument, FormField, ValidationResult } from '../types/document'
import { FieldType, ExportFormat } from '../types/document'
import { useDocumentStore } from '../store/document'
import * as documentApi from '../api/documentApi'

/**
 * TemplateManager - 模板管理器
 * 
 * 提供模板相关的高级功能，包括模板搜索、分类、收藏等
 * 
 * 验证需求 6：法律文书模板管理
 */
export class TemplateManager {
    private documentStore = useDocumentStore()
    private cache = new Map<string, DocumentTemplate>()
    private categoryCache = new Map<string, DocumentTemplate[]>()

    // ==================== 模板获取 ====================

    /**
     * 获取所有模板
     * 验证需求 6.1
     */
    async getTemplates(): Promise<DocumentTemplate[]> {
        try {
            const templates = await documentApi.getTemplates()
            // 更新缓存
            templates.forEach(template => {
                this.cache.set(template.id, template)
            })
            // 更新 store
            this.documentStore.setTemplates(templates)
            return templates
        } catch (error) {
            console.error('获取模板列表失败:', error)
            throw error
        }
    }

    /**
     * 按分类获取模板
     * 验证需求 6.2
     */
    async getTemplatesByCategory(category: string): Promise<DocumentTemplate[]> {
        // 检查分类缓存
        if (this.categoryCache.has(category)) {
            return this.categoryCache.get(category)!
        }

        try {
            const templates = await documentApi.getTemplatesByCategory(category)
            // 更新缓存
            this.categoryCache.set(category, templates)
            return templates
        } catch (error) {
            console.error('获取分类模板失败:', error)
            throw error
        }
    }

    /**
     * 搜索模板
     * 验证需求 6.4
     */
    async searchTemplates(keyword: string): Promise<DocumentTemplate[]> {
        if (!keyword.trim()) {
            return this.getTemplates()
        }

        try {
            const templates = await this.getTemplates()
            const lowerKeyword = keyword.toLowerCase()

            return templates.filter(template =>
                template.name.toLowerCase().includes(lowerKeyword) ||
                template.description.toLowerCase().includes(lowerKeyword) ||
                template.category.toLowerCase().includes(lowerKeyword)
            )
        } catch (error) {
            console.error('搜索模板失败:', error)
            throw error
        }
    }

    /**
     * 获取单个模板详情
     * 验证需求 6.3
     */
    async getTemplate(templateId: string): Promise<DocumentTemplate> {
        // 检查缓存
        if (this.cache.has(templateId)) {
            return this.cache.get(templateId)!
        }

        try {
            const template = await documentApi.getTemplate(templateId)
            // 更新缓存
            this.cache.set(templateId, template)
            return template
        } catch (error) {
            console.error('获取模板详情失败:', error)
            throw error
        }
    }

    // ==================== 收藏管理 ====================

    /**
     * 收藏模板
     * 验证需求 6.5
     */
    async favoriteTemplate(templateId: string): Promise<void> {
        try {
            await documentApi.favoriteTemplate(templateId)
            // 更新本地状态
            this.documentStore.favoriteTemplate(templateId)
            // 更新缓存
            const template = this.cache.get(templateId)
            if (template) {
                template.isFavorite = true
            }
        } catch (error) {
            console.error('收藏模板失败:', error)
            throw error
        }
    }

    /**
     * 取消收藏模板
     * 验证需求 6.5
     */
    async unfavoriteTemplate(templateId: string): Promise<void> {
        try {
            await documentApi.unfavoriteTemplate(templateId)
            // 更新本地状态
            this.documentStore.unfavoriteTemplate(templateId)
            // 更新缓存
            const template = this.cache.get(templateId)
            if (template) {
                template.isFavorite = false
            }
        } catch (error) {
            console.error('取消收藏模板失败:', error)
            throw error
        }
    }

    /**
     * 获取收藏的模板
     * 验证需求 6.5
     */
    async getFavoriteTemplates(): Promise<DocumentTemplate[]> {
        try {
            const allTemplates = await this.getTemplates()
            return allTemplates.filter(template => template.isFavorite)
        } catch (error) {
            console.error('获取收藏模板失败:', error)
            throw error
        }
    }

    // ==================== 缓存管理 ====================

    /**
     * 清除缓存
     */
    clearCache(): void {
        this.cache.clear()
        this.categoryCache.clear()
    }
}

/**
 * DocumentGenerator - 文书生成器
 * 
 * 提供文书生成、验证、保存、导出等功能
 * 
 * 验证需求 7, 8：法律文书生成和操作
 */
export class DocumentGenerator {
    private documentStore = useDocumentStore()

    // ==================== 文书生成 ====================

    /**
     * 生成文书
     * 验证需求 7.6
     */
    async generateDocument(templateId: string, params: Record<string, any>): Promise<GeneratedDocument> {
        try {
            // 验证参数
            const validationResult = await this.validateParams(templateId, params)
            if (!validationResult.isValid) {
                throw new Error(`参数验证失败: ${validationResult.errors.join(', ')}`)
            }

            // 调用 API 生成文书
            const document = await documentApi.generateDocument(templateId, params)

            // 更新 store
            this.documentStore.addDocument(document)

            return document
        } catch (error) {
            console.error('生成文书失败:', error)
            throw error
        }
    }

    /**
     * 验证表单参数
     * 验证需求 7.2
     */
    async validateParams(templateId: string, params: Record<string, any>): Promise<ValidationResult> {
        try {
            // 获取模板信息
            const template = await documentApi.getTemplate(templateId)
            const errors: string[] = []

            // 验证每个字段
            for (const field of template.fields) {
                const value = params[field.name]

                // 必填验证
                if (field.required && (value === undefined || value === null || value === '')) {
                    errors.push(`${field.label}为必填项`)
                    continue
                }

                // 如果字段为空且非必填，跳过后续验证
                if (value === undefined || value === null || value === '') {
                    continue
                }

                // 类型验证
                if (field.type === FieldType.NUMBER) {
                    const numValue = Number(value)
                    if (isNaN(numValue)) {
                        errors.push(`${field.label}必须是数字`)
                        continue
                    }
                    // 金额字段不能为 0（需求 7.3）
                    if (field.name.includes('amount') && numValue === 0) {
                        errors.push(`${field.label}不能为0`)
                    }
                }

                // 日期验证（需求 7.4）
                if (field.type === FieldType.DATE) {
                    const dateValue = new Date(value)
                    const now = new Date()
                    if (dateValue < now) {
                        errors.push(`${field.label}不能选择过去的日期`)
                    }
                }

                // 自定义验证规则
                if (field.validation) {
                    const rule = field.validation

                    // 正则验证
                    if (rule.pattern) {
                        const regex = new RegExp(rule.pattern)
                        if (!regex.test(String(value))) {
                            errors.push(rule.message)
                        }
                    }

                    // 最小值/最小长度
                    if (rule.min !== undefined) {
                        if (typeof value === 'number' && value < rule.min) {
                            errors.push(rule.message)
                        } else if (typeof value === 'string' && value.length < rule.min) {
                            errors.push(rule.message)
                        }
                    }

                    // 最大值/最大长度
                    if (rule.max !== undefined) {
                        if (typeof value === 'number' && value > rule.max) {
                            errors.push(rule.message)
                        } else if (typeof value === 'string' && value.length > rule.max) {
                            errors.push(rule.message)
                        }
                    }

                    // 自定义验证函数
                    if (rule.validator && !rule.validator(value)) {
                        errors.push(rule.message)
                    }
                }
            }

            return {
                isValid: errors.length === 0,
                errors
            }
        } catch (error) {
            console.error('验证参数失败:', error)
            return {
                isValid: false,
                errors: ['验证失败，请稍后重试']
            }
        }
    }

    // ==================== 草稿管理 ====================

    /**
     * 暂存表单数据
     * 验证需求 7.7
     */
    async saveDraft(templateId: string, params: Record<string, any>): Promise<void> {
        try {
            await documentApi.saveDraft(templateId, params)
            this.documentStore.saveDraft(templateId, params)
        } catch (error) {
            console.error('暂存表单失败:', error)
            throw error
        }
    }

    /**
     * 加载暂存数据
     * 验证需求 7.8
     */
    async loadDraft(templateId: string): Promise<Record<string, any> | null> {
        try {
            return await documentApi.loadDraft(templateId)
        } catch (error) {
            console.error('加载暂存数据失败:', error)
            return null
        }
    }

    // ==================== 文书操作 ====================

    /**
     * 保存生成的文书
     * 验证需求 8.3
     */
    async saveDocument(document: GeneratedDocument): Promise<void> {
        try {
            await documentApi.saveDocument(document)
            this.documentStore.saveDocument(document)
        } catch (error) {
            console.error('保存文书失败:', error)
            throw error
        }
    }

    /**
     * 导出文书
     * 验证需求 8.5
     */
    async exportDocument(documentId: string, format: ExportFormat): Promise<void> {
        try {
            await documentApi.exportDocument(documentId, format)
        } catch (error) {
            console.error('导出文书失败:', error)
            throw error
        }
    }

    /**
     * 获取已保存的文书列表
     * 验证需求 9.4
     */
    async getSavedDocuments(): Promise<GeneratedDocument[]> {
        try {
            return await documentApi.getSavedDocuments()
        } catch (error) {
            console.error('获取文书列表失败:', error)
            throw error
        }
    }

    /**
     * 删除文书
     */
    async deleteDocument(documentId: string): Promise<void> {
        try {
            await documentApi.deleteDocument(documentId)
            this.documentStore.deleteDocument(documentId)
        } catch (error) {
            console.error('删除文书失败:', error)
            throw error
        }
    }
}

// 导出单例实例
export const templateManager = new TemplateManager()
export const documentGenerator = new DocumentGenerator()