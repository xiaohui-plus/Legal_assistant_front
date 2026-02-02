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
     * 初始化模板管理器
     * 验证需