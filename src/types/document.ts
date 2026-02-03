/**
 * 文书相关类型定义
 * 验证需求 6, 7, 8
 */

/**
 * 字段类型
 */
export enum FieldType {
    TEXT = 'text',
    TEXTAREA = 'textarea',
    NUMBER = 'number',
    DATE = 'date',
    SELECT = 'select',
    RADIO = 'radio',
    CHECKBOX = 'checkbox'
}

/**
 * 验证规则
 */
export interface ValidationRule {
    pattern?: string
    min?: number
    max?: number
    message: string
    validator?: (value: any) => boolean
}

/**
 * 选项
 */
export interface SelectOption {
    label: string
    value: any
}

/**
 * 表单字段
 */
export interface FormField {
    name: string
    label: string
    type: FieldType
    required: boolean
    placeholder?: string
    defaultValue?: any
    validation?: ValidationRule
    options?: SelectOption[]
}

/**
 * 文书模板
 */
export interface DocumentTemplate {
    id: string
    name: string
    category: string
    description: string
    icon: string
    usageCount: number
    isFavorite: boolean
    fields: FormField[]
}

/**
 * 生成的文书
 */
export interface GeneratedDocument {
    id: string
    templateId: string
    templateName: string
    content: string
    params: Record<string, any>
    createdAt: number
    updatedAt: number
    isSaved: boolean
}

/**
 * 验证结果
 */
export interface ValidationResult {
    valid: boolean
    errors: Record<string, string>
}

/**
 * 导出格式
 */
export enum ExportFormat {
    PDF = 'pdf',
    WORD = 'word',
    TEXT = 'text'
}
