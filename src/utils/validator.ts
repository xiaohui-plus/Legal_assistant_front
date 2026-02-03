/**
 * 表单验证工具
 * 验证需求 7
 */

import type { FormField, ValidationResult, ValidationRule } from '../types/document'
import { FieldType } from '../types/document'

/**
 * 验证单个字段
 * @param value 字段值
 * @param field 字段定义
 * @returns 错误信息，如果验证通过则返回空字符串
 */
export const validateField = (value: any, field: FormField): string => {
    // 必填验证
    if (field.required && (value === undefined || value === null || value === '')) {
        return `${field.label}为必填项`
    }

    // 如果字段为空且非必填，跳过其他验证
    if (value === undefined || value === null || value === '') {
        return ''
    }

    // 数字类型验证
    if (field.type === FieldType.NUMBER) {
        const numValue = Number(value)

        // 验证是否为有效数字
        if (isNaN(numValue)) {
            return `${field.label}必须是有效的数字`
        }

        // 金额字段不能为0（需求 7.3）
        if (field.name.toLowerCase().includes('amount') ||
            field.name.toLowerCase().includes('金额') ||
            field.label.includes('金额')) {
            if (numValue === 0) {
                return `${field.label}不能为0`
            }
        }
    }

    // 日期类型验证
    if (field.type === FieldType.DATE) {
        const dateValue = new Date(value)
        const now = new Date()

        // 验证是否为有效日期
        if (isNaN(dateValue.getTime())) {
            return `${field.label}必须是有效的日期`
        }

        // 日期不能是过去的日期（需求 7.4）
        // 将时间设置为当天开始，避免时分秒影响比较
        const dateOnly = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate())
        const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        if (dateOnly < nowOnly) {
            return `${field.label}不能选择过去的日期`
        }
    }

    // 自定义验证规则
    if (field.validation) {
        const rule = field.validation

        // 正则表达式验证
        if (rule.pattern) {
            const regex = new RegExp(rule.pattern)
            if (!regex.test(String(value))) {
                return rule.message
            }
        }

        // 最小值/最小长度验证
        if (rule.min !== undefined) {
            if (field.type === FieldType.NUMBER) {
                if (Number(value) < rule.min) {
                    return rule.message
                }
            } else if (typeof value === 'string') {
                if (value.length < rule.min) {
                    return rule.message
                }
            }
        }

        // 最大值/最大长度验证
        if (rule.max !== undefined) {
            if (field.type === FieldType.NUMBER) {
                if (Number(value) > rule.max) {
                    return rule.message
                }
            } else if (typeof value === 'string') {
                if (value.length > rule.max) {
                    return rule.message
                }
            }
        }

        // 自定义验证函数
        if (rule.validator) {
            if (!rule.validator(value)) {
                return rule.message
            }
        }
    }

    return ''
}

/**
 * 验证整个表单
 * @param values 表单值
 * @param fields 字段定义列表
 * @returns 验证结果
 */
export const validateForm = (
    values: Record<string, any>,
    fields: FormField[]
): ValidationResult => {
    const errors: Record<string, string> = {}

    fields.forEach(field => {
        const value = values[field.name]
        const error = validateField(value, field)

        if (error) {
            errors[field.name] = error
        }
    })

    return {
        valid: Object.keys(errors).length === 0,
        errors
    }
}

/**
 * 检查表单是否可以提交
 * 所有必填项都已填写且所有字段验证都通过（需求 7.5）
 * @param values 表单值
 * @param fields 字段定义列表
 * @returns 是否可以提交
 */
export const canSubmitForm = (
    values: Record<string, any>,
    fields: FormField[]
): boolean => {
    const result = validateForm(values, fields)
    return result.valid
}

/**
 * 获取字段的错误信息
 * @param fieldName 字段名
 * @param errors 错误对象
 * @returns 错误信息
 */
export const getFieldError = (
    fieldName: string,
    errors: Record<string, string>
): string => {
    return errors[fieldName] || ''
}

/**
 * 检查字段是否有错误
 * @param fieldName 字段名
 * @param errors 错误对象
 * @returns 是否有错误
 */
export const hasFieldError = (
    fieldName: string,
    errors: Record<string, string>
): boolean => {
    return !!errors[fieldName]
}
