/**
 * 文书 API 接口
 * 验证需求 6, 7
 * 
 * 提供完整的文书模板管理和文书生成功能，包括：
 * - 模板获取、搜索、分类、收藏
 * - 表单验证和数据暂存
 * - 文书生成、保存、编辑、导出
 * - 本地存储管理
 */

import httpClient from './request'
import type { DocumentTemplate, GeneratedDocument, FormField, ValidationResult } from '../types/document'
import { ExportFormat } from '../types/document'
import type { ApiResponse } from '../types/api'

// 声明 uni 全局变量
declare const uni: any

// ==================== 表单验证接口 ====================

/**
 * 验证表单参数
 * 验证需求 7.2 - 实时验证输入内容的有效性
 */
export const validateParams = async (templateId: string, params: Record<string, any>): Promise<ValidationResult> => {
    try {
        // 获取模板详情以获取字段定义
        const { fields } = await getTemplateDetail(templateId)
        
        const errors: Record<string, string> = {}
        
        // 验证每个字段
        for (const field of fields) {
            const value = params[field.name]
            
            // 检查必填字段
            if (field.required && (value === undefined || value === null || value === '')) {
                errors[field.name] = `${field.label}是必填项`
                continue
            }
            
            // 如果字段有值，进行进一步验证
            if (value !== undefined && value !== null && value !== '') {
                // 验证规则检查
                if (field.validation) {
                    const validation = field.validation
                    
                    // 正则表达式验证
                    if (validation.pattern) {
                        const regex = new RegExp(validation.pattern)
                        if (!regex.test(String(value))) {
                            errors[field.name] = validation.message
                            continue
                        }
                    }
                    
                    // 最小值/最小长度验证
                    if (validation.min !== undefined) {
                        if (field.type === 'number' && Number(value) < validation.min) {
                            errors[field.name] = validation.message
                            continue
                        }
                        if (field.type === 'text' || field.type === 'textarea') {
                            if (String(value).length < validation.min) {
                                errors[field.name] = validation.message
                                continue
                            }
                        }
                    }
                    
                    // 最大值/最大长度验证
                    if (validation.max !== undefined) {
                        if (field.type === 'number' && Number(value) > validation.max) {
                            errors[field.name] = validation.message
                            continue
                        }
                        if (field.type === 'text' || field.type === 'textarea') {
                            if (String(value).length > validation.max) {
                                errors[field.name] = validation.message
                                continue
                            }
                        }
                    }
                    
                    // 自定义验证函数
                    if (validation.validator && !validation.validator(value)) {
                        errors[field.name] = validation.message
                        continue
                    }
                }
                
                // 特殊字段类型验证
                if (field.type === 'number') {
                    const numValue = Number(value)
                    if (isNaN(numValue)) {
                        errors[field.name] = `${field.label}必须是有效的数字`
                        continue
                    }
                    
                    // 验证需求 7.3 - 金额字段的值为 0 时显示验证错误提示
                    if (field.name.includes('金额') || field.name.includes('amount')) {
                        if (numValue <= 0) {
                            errors[field.name] = `${field.label}必须大于0`
                            continue
                        }
                    }
                }
                
                if (field.type === 'date') {
                    const dateValue = new Date(value)
                    if (isNaN(dateValue.getTime())) {
                        errors[field.name] = `${field.label}必须是有效的日期`
                        continue
                    }
                    
                    // 验证需求 7.4 - 日期字段选择过去的日期时显示验证错误提示
                    if (field.name.includes('日期') || field.name.includes('date')) {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0) // 设置为当天开始时间
                        
                        if (dateValue < today) {
                            errors[field.name] = `${field.label}不能选择过去的日期`
                            continue
                        }
                    }
                }
            }
        }
        
        return {
            valid: Object.keys(errors).length === 0,
            errors
        }
    } catch (error) {
        console.error('验证表单参数失败:', error)
        return {
            valid: false,
            errors: { _global: '表单验证失败，请稍后重试' }
        }
    }
}

/**
 * 检查表单是否完整且有效
 * 验证需求 7.5 - 当且仅当所有必填项填写完成且验证通过时，启用「一键生成」按钮
 */
export const isFormComplete = async (templateId: string, params: Record<string, any>): Promise<boolean> => {
    try {
        const validationResult = await validateParams(templateId, params)
        return validationResult.valid
    } catch (error) {
        console.error('检查表单完整性失败:', error)
        return false
    }
}

// ==================== 模板管理接口 ====================

/**
 * 获取所有模板
 * 验证需求 6.1 - 显示所有可用的文书模板，按分类组织
 */
export const getTemplates = async (): Promise<DocumentTemplate[]> => {
    try {
        const response = await httpClient.get<ApiResponse<{ templates: DocumentTemplate[] }>>('/api/templates')
        return response.data.templates
    } catch (error) {
        console.error('获取模板列表失败:', error)
        throw new Error('获取模板列表失败，请稍后重试')
    }
}

/**
 * 按分类获取模板
 * 验证需求 6.2 - 过滤并显示该分类下的所有模板
 */
export const getTemplatesByCategory = async (category: string): Promise<DocumentTemplate[]> => {
    try {
        const response = await httpClient.get<ApiResponse<{ templates: DocumentTemplate[] }>>('/api/templates', {
            category
        })
        return response.data.templates
    } catch (error) {
        console.error('获取分类模板失败:', error)
        throw new Error('获取分类模板失败，请稍后重试')
    }
}

/**
 * 获取模板详情
 * 验证需求 6.3 - 打开该模板的参数填写页
 */
export const getTemplateDetail = async (templateId: string): Promise<{ template: DocumentTemplate; fields: FormField[] }> => {
    try {
        const response = await httpClient.get<ApiResponse<{ template: DocumentTemplate; fields: FormField[] }>>(`/api/templates/${templateId}`)
        return response.data
    } catch (error) {
        console.error('获取模板详情失败:', error)
        throw new Error('获取模板详情失败，请稍后重试')
    }
}

/**
 * 搜索模板
 * 验证需求 6.4 - 过滤并显示匹配的模板
 */
export const searchTemplates = async (keyword: string): Promise<DocumentTemplate[]> => {
    try {
        const response = await httpClient.get<ApiResponse<{ templates: DocumentTemplate[] }>>('/api/templates/search', {
            keyword
        })
        return response.data.templates
    } catch (error) {
        console.error('搜索模板失败:', error)
        throw new Error('搜索模板失败，请稍后重试')
    }
}

/**
 * 收藏模板
 * 验证需求 6.5 - 将该模板添加到收藏列表
 */
export const favoriteTemplate = async (templateId: string): Promise<void> => {
    try {
        await httpClient.post<ApiResponse<void>>('/api/templates/favorite', {
            templateId
        })
    } catch (error) {
        console.error('收藏模板失败:', error)
        throw new Error('收藏模板失败，请稍后重试')
    }
}

/**
 * 取消收藏模板
 * 验证需求 6.5 - 从收藏列表中移除模板
 */
export const unfavoriteTemplate = async (templateId: string): Promise<void> => {
    try {
        await httpClient.delete<ApiResponse<void>>(`/api/templates/favorite/${templateId}`)
    } catch (error) {
        console.error('取消收藏失败:', error)
        throw new Error('取消收藏失败，请稍后重试')
    }
}

/**
 * 批量获取模板详情
 * 验证需求 6 - 优化性能，减少网络请求
 */
export const getBatchTemplateDetails = async (templateIds: string[]): Promise<{ template: DocumentTemplate; fields: FormField[] }[]> => {
    try {
        const response = await httpClient.post<ApiResponse<{ templates: { template: DocumentTemplate; fields: FormField[] }[] }>>('/api/templates/batch', {
            templateIds
        })
        return response.data.templates
    } catch (error) {
        console.error('批量获取模板详情失败:', error)
        throw new Error('批量获取模板详情失败，请稍后重试')
    }
}

/**
 * 获取收藏的模板
 * 验证需求 6.5 - 获取用户收藏的模板列表
 */
export const getFavoriteTemplates = async (): Promise<DocumentTemplate[]> => {
    try {
        const response = await httpClient.get<ApiResponse<{ templates: DocumentTemplate[] }>>('/api/templates/favorites')
        return response.data.templates
    } catch (error) {
        console.error('获取收藏模板失败:', error)
        throw new Error('获取收藏模板失败，请稍后重试')
    }
}

/**
 * 获取模板使用统计
 * 验证需求 6 - 显示模板使用次数和热门程度
 */
export const getTemplateStats = async (templateId: string): Promise<{ usageCount: number; lastUsed: number; rating: number }> => {
    try {
        const response = await httpClient.get<ApiResponse<{ usageCount: number; lastUsed: number; rating: number }>>(`/api/templates/${templateId}/stats`)
        return response.data
    } catch (error) {
        console.error('获取模板统计失败:', error)
        throw new Error('获取模板统计失败，请稍后重试')
    }
}

/**
 * 更新模板使用次数
 * 验证需求 6 - 记录模板使用情况
 */
export const updateTemplateUsage = async (templateId: string): Promise<void> => {
    try {
        await httpClient.post<ApiResponse<void>>(`/api/templates/${templateId}/usage`)
    } catch (error) {
        console.error('更新模板使用次数失败:', error)
        // 使用次数更新失败不影响主要功能，只记录日志
    }
}

// ==================== 文书生成接口 ====================

/**
 * 预览文书生成（不实际生成）
 * 验证需求 7 - 允许用户预览生成效果
 */
export const previewDocument = async (templateId: string, params: Record<string, any>): Promise<{ preview: string; estimatedLength: number }> => {
    try {
        const response = await httpClient.post<ApiResponse<{ preview: string; estimatedLength: number }>>('/api/documents/preview', {
            templateId,
            params
        })
        return response.data
    } catch (error) {
        console.error('预览文书失败:', error)
        throw new Error('预览文书失败，请稍后重试')
    }
}

/**
 * 生成文书
 * 验证需求 7.6 - 根据填写的参数生成法律文书
 */
export const generateDocument = async (templateId: string, params: Record<string, any>): Promise<GeneratedDocument> => {
    try {
        const response = await httpClient.post<ApiResponse<GeneratedDocument>>('/api/documents/generate', {
            templateId,
            params
        })
        return response.data
    } catch (error) {
        console.error('生成文书失败:', error)
        throw new Error('生成文书失败，请稍后重试')
    }
}

/**
 * 保存生成的文书
 * 验证需求 8.3 - 将文书保存到「我的文书」列表
 */
export const saveDocument = async (document: GeneratedDocument): Promise<void> => {
    try {
        await httpClient.post<ApiResponse<void>>('/api/documents/save', {
            document
        })
    } catch (error) {
        console.error('保存文书失败:', error)
        throw new Error('保存文书失败，请稍后重试')
    }
}

/**
 * 获取文书生成历史
 * 验证需求 8 - 获取用户的文书生成历史记录
 */
export const getDocumentHistory = async (limit: number = 20, offset: number = 0): Promise<{ documents: GeneratedDocument[]; total: number }> => {
    try {
        const response = await httpClient.get<ApiResponse<{ documents: GeneratedDocument[]; total: number }>>('/api/documents/history', {
            limit,
            offset
        })
        return response.data
    } catch (error) {
        console.error('获取文书历史失败:', error)
        throw new Error('获取文书历史失败，请稍后重试')
    }
}

/**
 * 获取已保存的文书列表
 * 验证需求 8.3 - 获取用户保存的文书列表
 */
export const getSavedDocuments = async (): Promise<GeneratedDocument[]> => {
    try {
        const response = await httpClient.get<ApiResponse<{ documents: GeneratedDocument[] }>>('/api/documents/saved')
        return response.data.documents
    } catch (error) {
        console.error('获取已保存文书失败:', error)
        throw new Error('获取已保存文书失败，请稍后重试')
    }
}

/**
 * 更新文书内容
 * 验证需求 8.2 - 允许用户修改文书内容
 */
export const updateDocument = async (documentId: string, content: string): Promise<void> => {
    try {
        await httpClient.put<ApiResponse<void>>(`/api/documents/${documentId}`, {
            content
        })
    } catch (error) {
        console.error('更新文书失败:', error)
        throw new Error('更新文书失败，请稍后重试')
    }
}

/**
 * 删除文书
 * 验证需求 8 - 删除已保存的文书
 */
export const deleteDocument = async (documentId: string): Promise<void> => {
    try {
        await httpClient.delete<ApiResponse<void>>(`/api/documents/${documentId}`)
    } catch (error) {
        console.error('删除文书失败:', error)
        throw new Error('删除文书失败，请稍后重试')
    }
}

/**
 * 分享文书
 * 验证需求 8.5 - 提供文书分享功能
 */
export const shareDocument = async (document: GeneratedDocument, shareType: 'link' | 'qr' | 'email' = 'link'): Promise<{ shareUrl?: string; qrCode?: string; success: boolean }> => {
    try {
        // 根据平台和分享类型处理
        if (shareType === 'link') {
            // 生成分享链接
            const response = await httpClient.post<ApiResponse<{ shareUrl: string }>>('/api/documents/share', {
                documentId: document.id,
                type: 'link'
            })
            return { shareUrl: response.data.shareUrl, success: true }
        } else if (shareType === 'qr') {
            // 生成二维码
            const response = await httpClient.post<ApiResponse<{ qrCode: string }>>('/api/documents/share', {
                documentId: document.id,
                type: 'qr'
            })
            return { qrCode: response.data.qrCode, success: true }
        } else if (shareType === 'email') {
            // 邮件分享
            await httpClient.post<ApiResponse<void>>('/api/documents/share', {
                documentId: document.id,
                type: 'email'
            })
            return { success: true }
        }
        
        return { success: false }
    } catch (error) {
        console.error('分享文书失败:', error)
        throw new Error('分享文书失败，请稍后重试')
    }
}

// ==================== 文书操作接口 ====================

/**
 * 验证文书完整性
 * 验证需求 8 - 确保文书内容的完整性和正确性
 */
export const validateDocumentIntegrity = async (document: GeneratedDocument): Promise<{ valid: boolean; issues: string[] }> => {
    try {
        const response = await httpClient.post<ApiResponse<{ valid: boolean; issues: string[] }>>('/api/documents/validate', {
            documentId: document.id,
            content: document.content,
            params: document.params
        })
        return response.data
    } catch (error) {
        console.error('验证文书完整性失败:', error)
        throw new Error('验证文书完整性失败，请稍后重试')
    }
}

/**
 * 复制文书内容到剪贴板
 * 验证需求 8.4 - 将文书内容复制到剪贴板
 */
export const copyDocumentContent = async (content: string): Promise<void> => {
    try {
        // 使用 uni-app 的剪贴板 API
        await uni.setClipboardData({
            data: content
        })
        
        // 显示成功提示
        uni.showToast({
            title: '复制成功',
            icon: 'success',
            duration: 2000
        })
    } catch (error) {
        console.error('复制文书内容失败:', error)
        uni.showToast({
            title: '复制失败',
            icon: 'error',
            duration: 2000
        })
        throw new Error('复制文书内容失败')
    }
}

/**
 * 导出文书
 * 验证需求 8.5 - 根据当前平台提供相应的导出方式
 */
export const exportDocument = async (document: GeneratedDocument, format: ExportFormat = ExportFormat.TEXT): Promise<void> => {
    try {
        // 根据平台判断导出方式
        // #ifdef MP-WEIXIN
        // 微信小程序：使用分享功能
        await uni.share({
            provider: 'weixin',
            scene: 'WXSceneSession',
            type: 0,
            summary: `${document.templateName}\n\n${document.content}`
        })
        // #endif
        
        // #ifdef APP-PLUS
        // App：保存到本地文件
        const fileExtension = format === ExportFormat.PDF ? 'pdf' : 
                             format === ExportFormat.WORD ? 'docx' : 'txt'
        const fileName = `${document.templateName}_${new Date().getTime()}.${fileExtension}`
        const filePath = `${uni.env.USER_DATA_PATH}/${fileName}`
        
        await uni.getFileSystemManager().writeFile({
            filePath,
            data: document.content,
            encoding: 'utf8'
        })
        
        uni.showToast({
            title: `已保存到 ${fileName}`,
            icon: 'success',
            duration: 3000
        })
        // #endif
        
        // #ifdef H5
        // H5：下载文件
        if (typeof window !== 'undefined' && window.document) {
            const mimeType = format === ExportFormat.PDF ? 'application/pdf' :
                            format === ExportFormat.WORD ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                            'text/plain;charset=utf-8'
            const fileExtension = format === ExportFormat.PDF ? 'pdf' : 
                                 format === ExportFormat.WORD ? 'docx' : 'txt'
            
            const blob = new Blob([document.content], { type: mimeType })
            const url = URL.createObjectURL(blob)
            const link = window.document.createElement('a')
            link.href = url
            link.download = `${document.templateName}_${new Date().getTime()}.${fileExtension}`
            window.document.body.appendChild(link)
            link.click()
            window.document.body.removeChild(link)
            URL.revokeObjectURL(url)
        }
        // #endif
        
    } catch (error) {
        console.error('导出文书失败:', error)
        uni.showToast({
            title: '导出失败',
            icon: 'error',
            duration: 2000
        })
        throw new Error('导出文书失败')
    }
}

/**
 * 带重试的文书生成
 * 验证需求 7.6 - 提供更可靠的文书生成功能
 */
export const generateDocumentWithRetry = async (
    templateId: string, 
    params: Record<string, any>, 
    maxRetries: number = 3
): Promise<GeneratedDocument> => {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await generateDocument(templateId, params)
        } catch (error) {
            lastError = error as Error
            console.warn(`文书生成失败，第 ${attempt} 次尝试:`, error)
            
            if (attempt < maxRetries) {
                // 等待一段时间后重试
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            }
        }
    }
    
    throw lastError || new Error('文书生成失败，已达到最大重试次数')
}

// ==================== 本地存储相关接口 ====================

/**
 * 暂存表单数据
 * 验证需求 7.7 - 将当前填写的内容保存到本地存储
 */
export const saveDraftForm = async (templateId: string, formData: Record<string, any>): Promise<void> => {
    try {
        const key = `form_draft_${templateId}`
        await uni.setStorage({
            key,
            data: {
                templateId,
                formData,
                savedAt: Date.now()
            }
        })
    } catch (error) {
        console.error('暂存表单失败:', error)
        throw new Error('暂存表单失败')
    }
}

/**
 * 加载暂存的表单数据
 * 验证需求 7.8 - 恢复之前暂存的表单内容
 */
export const loadDraftForm = async (templateId: string): Promise<Record<string, any> | null> => {
    try {
        const key = `form_draft_${templateId}`
        const result = await uni.getStorage({ key })
        
        if (result.data && result.data.formData) {
            return result.data.formData
        }
        
        return null
    } catch (error) {
        // 如果没有暂存数据，返回 null 而不是抛出错误
        console.log('没有找到暂存的表单数据:', error)
        return null
    }
}

/**
 * 清除暂存的表单数据
 * 验证需求 7 - 清除指定模板的暂存数据
 */
export const clearDraftForm = async (templateId: string): Promise<void> => {
    try {
        const key = `form_draft_${templateId}`
        await uni.removeStorage({ key })
    } catch (error) {
        console.error('清除暂存表单失败:', error)
        // 清除失败不抛出错误，因为可能本来就没有数据
    }
}

/**
 * 保存文书到本地存储
 * 验证需求 8.3 - 将文书保存到本地存储
 */
export const saveDocumentToLocal = async (document: GeneratedDocument): Promise<void> => {
    try {
        // 获取现有的本地文书列表
        let savedDocuments: GeneratedDocument[] = []
        try {
            const result = await uni.getStorage({ key: 'saved_documents' })
            if (result.data && Array.isArray(result.data)) {
                savedDocuments = result.data
            }
        } catch (e) {
            // 如果没有现有数据，使用空数组
            savedDocuments = []
        }
        
        // 检查是否已存在相同ID的文书
        const existingIndex = savedDocuments.findIndex(doc => doc.id === document.id)
        
        if (existingIndex >= 0) {
            // 更新现有文书
            savedDocuments[existingIndex] = {
                ...document,
                updatedAt: Date.now(),
                isSaved: true
            }
        } else {
            // 添加新文书
            savedDocuments.push({
                ...document,
                updatedAt: Date.now(),
                isSaved: true
            })
        }
        
        // 保存到本地存储
        await uni.setStorage({
            key: 'saved_documents',
            data: savedDocuments
        })
        
        uni.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
        })
    } catch (error) {
        console.error('保存文书到本地失败:', error)
        uni.showToast({
            title: '保存失败',
            icon: 'error',
            duration: 2000
        })
        throw new Error('保存文书到本地失败')
    }
}

/**
 * 从本地存储获取已保存的文书
 * 验证需求 8.3 - 从本地存储获取文书列表
 */
export const getLocalSavedDocuments = async (): Promise<GeneratedDocument[]> => {
    try {
        const result = await uni.getStorage({ key: 'saved_documents' })
        
        if (result.data && Array.isArray(result.data)) {
            return result.data
        }
        
        return []
    } catch (error) {
        console.log('没有找到本地保存的文书:', error)
        return []
    }
}

/**
 * 从本地存储删除文书
 * 验证需求 8 - 从本地存储删除指定文书
 */
export const deleteLocalDocument = async (documentId: string): Promise<void> => {
    try {
        const savedDocuments = await getLocalSavedDocuments()
        const filteredDocuments = savedDocuments.filter(doc => doc.id !== documentId)
        
        await uni.setStorage({
            key: 'saved_documents',
            data: filteredDocuments
        })
        
        uni.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
        })
    } catch (error) {
        console.error('删除本地文书失败:', error)
        uni.showToast({
            title: '删除失败',
            icon: 'error',
            duration: 2000
        })
        throw new Error('删除本地文书失败')
    }
}

// ==================== 额外的实用功能 ====================

/**
 * 获取模板分类列表
 * 验证需求 6.2 - 支持按分类浏览模板
 */
export const getTemplateCategories = async (): Promise<string[]> => {
    try {
        const response = await httpClient.get<ApiResponse<{ categories: string[] }>>('/api/templates/categories')
        return response.data.categories
    } catch (error) {
        console.error('获取模板分类失败:', error)
        // 如果服务器请求失败，从本地模板中提取分类
        try {
            const templates = await getTemplates()
            const categories = new Set(templates.map(template => template.category))
            return Array.from(categories).sort()
        } catch (localError) {
            console.error('从本地提取分类失败:', localError)
            return []
        }
    }
}

/**
 * 批量收藏/取消收藏模板
 * 验证需求 6.5 - 支持批量操作收藏
 */
export const batchFavoriteTemplates = async (templateIds: string[], favorite: boolean): Promise<void> => {
    try {
        await httpClient.post<ApiResponse<void>>('/api/templates/batch-favorite', {
            templateIds,
            favorite
        })
    } catch (error) {
        console.error('批量收藏操作失败:', error)
        throw new Error('批量收藏操作失败，请稍后重试')
    }
}

/**
 * 获取热门模板
 * 验证需求 6 - 提供热门模板推荐
 */
export const getPopularTemplates = async (limit: number = 10): Promise<DocumentTemplate[]> => {
    try {
        const response = await httpClient.get<ApiResponse<{ templates: DocumentTemplate[] }>>('/api/templates/popular', {
            limit
        })
        return response.data.templates
    } catch (error) {
        console.error('获取热门模板失败:', error)
        throw new Error('获取热门模板失败，请稍后重试')
    }
}

/**
 * 获取最近使用的模板
 * 验证需求 6 - 提供最近使用模板快速访问
 */
export const getRecentTemplates = async (limit: number = 5): Promise<DocumentTemplate[]> => {
    try {
        const response = await httpClient.get<ApiResponse<{ templates: DocumentTemplate[] }>>('/api/templates/recent', {
            limit
        })
        return response.data.templates
    } catch (error) {
        console.error('获取最近使用模板失败:', error)
        throw new Error('获取最近使用模板失败，请稍后重试')
    }
}

/**
 * 检查模板更新
 * 验证需求 6 - 检查模板是否有新版本
 */
export const checkTemplateUpdates = async (templateIds: string[]): Promise<{ templateId: string; hasUpdate: boolean; version: string }[]> => {
    try {
        const response = await httpClient.post<ApiResponse<{ updates: { templateId: string; hasUpdate: boolean; version: string }[] }>>('/api/templates/check-updates', {
            templateIds
        })
        return response.data.updates
    } catch (error) {
        console.error('检查模板更新失败:', error)
        throw new Error('检查模板更新失败，请稍后重试')
    }
}

/**
 * 获取文书生成进度
 * 验证需求 7.6 - 提供文书生成进度反馈
 */
export const getDocumentGenerationProgress = async (taskId: string): Promise<{ progress: number; status: string; message?: string }> => {
    try {
        const response = await httpClient.get<ApiResponse<{ progress: number; status: string; message?: string }>>(`/api/documents/generation-progress/${taskId}`)
        return response.data
    } catch (error) {
        console.error('获取生成进度失败:', error)
        throw new Error('获取生成进度失败，请稍后重试')
    }
}

/**
 * 取消文书生成
 * 验证需求 7.6 - 允许用户取消正在进行的文书生成
 */
export const cancelDocumentGeneration = async (taskId: string): Promise<void> => {
    try {
        await httpClient.post<ApiResponse<void>>(`/api/documents/cancel-generation/${taskId}`)
    } catch (error) {
        console.error('取消文书生成失败:', error)
        throw new Error('取消文书生成失败，请稍后重试')
    }
}

/**
 * 获取文书生成统计
 * 验证需求 7, 8 - 提供用户文书生成统计信息
 */
export const getDocumentStats = async (): Promise<{ totalGenerated: number; totalSaved: number; favoriteTemplates: number; recentActivity: any[] }> => {
    try {
        const response = await httpClient.get<ApiResponse<{ totalGenerated: number; totalSaved: number; favoriteTemplates: number; recentActivity: any[] }>>('/api/documents/stats')
        return response.data
    } catch (error) {
        console.error('获取文书统计失败:', error)
        throw new Error('获取文书统计失败，请稍后重试')
    }
}

/**
 * 清理过期的草稿数据
 * 验证需求 7.7 - 定期清理过期的表单草稿
 */
export const cleanupExpiredDrafts = async (maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> => {
    try {
        // 获取所有存储的键
        const storageInfo = await uni.getStorageInfo()
        const draftKeys = storageInfo.keys.filter((key: string) => key.startsWith('form_draft_'))
        
        const now = Date.now()
        const cleanupPromises = draftKeys.map(async (key: string) => {
            try {
                const result = await uni.getStorage({ key })
                if (result.data && result.data.savedAt) {
                    const age = now - result.data.savedAt
                    if (age > maxAge) {
                        await uni.removeStorage({ key })
                        console.log(`清理过期草稿: ${key}`)
                    }
                }
            } catch (error) {
                // 如果读取失败，直接删除该键
                await uni.removeStorage({ key })
                console.log(`清理无效草稿: ${key}`)
            }
        })
        
        await Promise.all(cleanupPromises)
    } catch (error) {
        console.error('清理过期草稿失败:', error)
        // 清理失败不抛出错误，因为这不是关键功能
    }
}

/**
 * 导入文书模板
 * 验证需求 6 - 支持导入自定义模板
 */
export const importTemplate = async (templateData: any): Promise<DocumentTemplate> => {
    try {
        const response = await httpClient.post<ApiResponse<DocumentTemplate>>('/api/templates/import', {
            templateData
        })
        return response.data
    } catch (error) {
        console.error('导入模板失败:', error)
        throw new Error('导入模板失败，请稍后重试')
    }
}

/**
 * 导出文书模板
 * 验证需求 6 - 支持导出模板配置
 */
export const exportTemplate = async (templateId: string): Promise<any> => {
    try {
        const response = await httpClient.get<ApiResponse<any>>(`/api/templates/${templateId}/export`)
        return response.data
    } catch (error) {
        console.error('导出模板失败:', error)
        throw new Error('导出模板失败，请稍后重试')
    }
}
