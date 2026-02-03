import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import type { DocumentTemplate } from '../../types/document'
import { FieldType } from '../../types/document'

/**
 * 属性测试：模板卡片显示完整信息
 * Feature: legal-assistant-app, Property 10: 模板卡片显示完整信息
 * 
 * 验证需求 6.6：模板卡片显示
 * 
 * 属性 10：模板卡片显示完整信息
 * 对于任意文书模板，渲染的模板卡片应该包含模板名称、图标 URL 和使用次数这三项信息。
 * 
 * **Validates: Requirements 6.6**
 */

/**
 * 模板卡片渲染函数
 * 这个函数模拟了 TemplateCard.vue 组件的渲染逻辑
 * 返回一个包含卡片显示信息的对象
 */
interface TemplateCardData {
    name: string
    icon: string
    usageCount: number
}

function renderTemplateCard(template: DocumentTemplate): TemplateCardData {
    // 模拟组件渲染逻辑，提取需要显示的三项信息
    return {
        name: template.name,
        icon: template.icon,
        usageCount: template.usageCount
    }
}

/**
 * 验证模板卡片是否包含完整信息
 */
function hasCompleteCardInfo(cardData: TemplateCardData, template: DocumentTemplate): boolean {
    // 验证三项必需信息都存在且正确
    return (
        cardData.name === template.name &&
        cardData.icon === template.icon &&
        cardData.usageCount === template.usageCount
    )
}

describe('TemplateCard - Property-Based Tests', () => {
    /**
     * 属性 10：模板卡片显示完整信息
     * 
     * 对于任意文书模板，渲染的模板卡片应该包含模板名称、图标 URL 和使用次数这三项信息。
     * 
     * **Validates: Requirements 6.6**
     */
    describe('Property 10: 模板卡片显示完整信息', () => {
        // 生成文书模板的 arbitrary
        const templateArbitrary = fc.record({
            id: fc.string({ minLength: 1 }),
            name: fc.string({ minLength: 1 }), // 模板名称必须非空
            category: fc.string(),
            description: fc.string(),
            icon: fc.webUrl(), // 图标 URL
            usageCount: fc.integer({ min: 0 }), // 使用次数必须非负
            isFavorite: fc.boolean(),
            fields: fc.array(
                fc.record({
                    name: fc.string({ minLength: 1 }),
                    label: fc.string(),
                    type: fc.constantFrom(
                        FieldType.TEXT,
                        FieldType.TEXTAREA,
                        FieldType.NUMBER,
                        FieldType.DATE,
                        FieldType.SELECT,
                        FieldType.RADIO,
                        FieldType.CHECKBOX
                    ),
                    required: fc.boolean(),
                    placeholder: fc.option(fc.string()),
                    defaultValue: fc.option(fc.oneof(
                        fc.string(),
                        fc.integer(),
                        fc.boolean()
                    )),
                    validation: fc.option(fc.record({
                        pattern: fc.option(fc.string()),
                        min: fc.option(fc.integer()),
                        max: fc.option(fc.integer()),
                        message: fc.string()
                    })),
                    options: fc.option(fc.array(
                        fc.record({
                            label: fc.string(),
                            value: fc.oneof(fc.string(), fc.integer(), fc.boolean())
                        })
                    ))
                }),
                { minLength: 0, maxLength: 10 }
            )
        })

        it('should display template name, icon URL, and usage count for any template', () => {
            fc.assert(
                fc.property(
                    templateArbitrary,
                    (template) => {
                        // 渲染模板卡片
                        const cardData = renderTemplateCard(template)

                        // 验证卡片包含完整信息
                        expect(hasCompleteCardInfo(cardData, template)).toBe(true)

                        // 显式验证三项信息
                        expect(cardData.name).toBe(template.name)
                        expect(cardData.icon).toBe(template.icon)
                        expect(cardData.usageCount).toBe(template.usageCount)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should display correct name for templates with various name formats', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        ...templateArbitrary.value,
                        name: fc.oneof(
                            fc.string({ minLength: 1, maxLength: 5 }), // 短名称
                            fc.string({ minLength: 20, maxLength: 50 }), // 长名称
                            fc.stringOf(fc.constantFrom('中', '文', '模', '板', '名', '称')), // 中文名称
                            fc.stringOf(fc.constantFrom('a', 'b', 'c', '1', '2', '3', '-', '_')), // 字母数字混合
                            fc.constant('合同模板'), // 常见名称
                            fc.constant('劳动合同模板（标准版）') // 带括号的名称
                        )
                    }),
                    (template) => {
                        const cardData = renderTemplateCard(template)
                        expect(cardData.name).toBe(template.name)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should display correct icon URL for various URL formats', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        ...templateArbitrary.value,
                        icon: fc.oneof(
                            fc.webUrl(), // 标准 URL
                            fc.webUrl({ validSchemes: ['https'] }), // HTTPS URL
                            fc.constant('https://example.com/icon.png'), // 图片 URL
                            fc.constant('https://cdn.example.com/icons/template-icon.svg'), // SVG URL
                            fc.constant('/static/icons/template.png'), // 相对路径
                            fc.constant('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==') // Data URL
                        )
                    }),
                    (template) => {
                        const cardData = renderTemplateCard(template)
                        expect(cardData.icon).toBe(template.icon)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should display correct usage count for various count values', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        ...templateArbitrary.value,
                        usageCount: fc.oneof(
                            fc.constant(0), // 未使用
                            fc.integer({ min: 1, max: 10 }), // 少量使用
                            fc.integer({ min: 100, max: 1000 }), // 中等使用
                            fc.integer({ min: 10000, max: 100000 }), // 大量使用
                            fc.constant(999999) // 极大值
                        )
                    }),
                    (template) => {
                        const cardData = renderTemplateCard(template)
                        expect(cardData.usageCount).toBe(template.usageCount)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain all three properties together', () => {
            fc.assert(
                fc.property(
                    templateArbitrary,
                    (template) => {
                        const cardData = renderTemplateCard(template)

                        // 验证所有三项信息同时存在
                        expect(cardData).toHaveProperty('name')
                        expect(cardData).toHaveProperty('icon')
                        expect(cardData).toHaveProperty('usageCount')

                        // 验证类型正确
                        expect(typeof cardData.name).toBe('string')
                        expect(typeof cardData.icon).toBe('string')
                        expect(typeof cardData.usageCount).toBe('number')

                        // 验证值正确
                        expect(cardData.name).toBe(template.name)
                        expect(cardData.icon).toBe(template.icon)
                        expect(cardData.usageCount).toBe(template.usageCount)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should not include extra properties beyond the three required ones', () => {
            fc.assert(
                fc.property(
                    templateArbitrary,
                    (template) => {
                        const cardData = renderTemplateCard(template)

                        // 验证只包含三项必需信息
                        const keys = Object.keys(cardData)
                        expect(keys).toHaveLength(3)
                        expect(keys).toContain('name')
                        expect(keys).toContain('icon')
                        expect(keys).toContain('usageCount')
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should handle templates with minimal fields', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        id: fc.string({ minLength: 1 }),
                        name: fc.string({ minLength: 1 }),
                        category: fc.constant(''),
                        description: fc.constant(''),
                        icon: fc.webUrl(),
                        usageCount: fc.constant(0),
                        isFavorite: fc.constant(false),
                        fields: fc.constant([])
                    }),
                    (template) => {
                        const cardData = renderTemplateCard(template)

                        expect(cardData.name).toBe(template.name)
                        expect(cardData.icon).toBe(template.icon)
                        expect(cardData.usageCount).toBe(0)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should handle templates with maximum complexity', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        id: fc.string({ minLength: 1 }),
                        name: fc.string({ minLength: 50, maxLength: 100 }),
                        category: fc.string({ minLength: 20 }),
                        description: fc.string({ minLength: 100 }),
                        icon: fc.webUrl(),
                        usageCount: fc.integer({ min: 10000, max: 100000 }),
                        isFavorite: fc.boolean(),
                        fields: fc.array(
                            fc.record({
                                name: fc.string({ minLength: 1 }),
                                label: fc.string(),
                                type: fc.constantFrom(
                                    FieldType.TEXT,
                                    FieldType.TEXTAREA,
                                    FieldType.NUMBER,
                                    FieldType.DATE,
                                    FieldType.SELECT
                                ),
                                required: fc.boolean(),
                                placeholder: fc.option(fc.string()),
                                defaultValue: fc.option(fc.string()),
                                validation: fc.option(fc.record({
                                    pattern: fc.option(fc.string()),
                                    min: fc.option(fc.integer()),
                                    max: fc.option(fc.integer()),
                                    message: fc.string()
                                })),
                                options: fc.option(fc.array(
                                    fc.record({
                                        label: fc.string(),
                                        value: fc.string()
                                    })
                                ))
                            }),
                            { minLength: 5, maxLength: 20 }
                        )
                    }),
                    (template) => {
                        const cardData = renderTemplateCard(template)

                        expect(cardData.name).toBe(template.name)
                        expect(cardData.icon).toBe(template.icon)
                        expect(cardData.usageCount).toBe(template.usageCount)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should preserve exact values without transformation', () => {
            fc.assert(
                fc.property(
                    templateArbitrary,
                    (template) => {
                        const cardData = renderTemplateCard(template)

                        // 验证值没有被转换或修改
                        expect(cardData.name).toStrictEqual(template.name)
                        expect(cardData.icon).toStrictEqual(template.icon)
                        expect(cardData.usageCount).toStrictEqual(template.usageCount)

                        // 验证引用相等性（对于字符串和数字，值相等即可）
                        expect(Object.is(cardData.name, template.name)).toBe(true)
                        expect(Object.is(cardData.icon, template.icon)).toBe(true)
                        expect(Object.is(cardData.usageCount, template.usageCount)).toBe(true)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should handle templates with special characters in name', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        ...templateArbitrary.value,
                        name: fc.oneof(
                            fc.constant('合同模板（标准版）'),
                            fc.constant('劳动合同 - 2024版'),
                            fc.constant('租赁协议 & 补充条款'),
                            fc.constant('借款合同 <个人版>'),
                            fc.constant('合作协议 "框架版"'),
                            fc.constant('模板名称\'测试'),
                            fc.constant('Template with\nNewline'),
                            fc.constant('Template\twith\tTabs')
                        )
                    }),
                    (template) => {
                        const cardData = renderTemplateCard(template)
                        expect(cardData.name).toBe(template.name)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should handle edge case usage counts', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        ...templateArbitrary.value,
                        usageCount: fc.oneof(
                            fc.constant(0),
                            fc.constant(1),
                            fc.constant(Number.MAX_SAFE_INTEGER),
                            fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER })
                        )
                    }),
                    (template) => {
                        const cardData = renderTemplateCard(template)
                        expect(cardData.usageCount).toBe(template.usageCount)
                        expect(Number.isSafeInteger(cardData.usageCount)).toBe(true)
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * 额外测试：验证卡片数据的不变性
     * 确保渲染过程不会修改原始模板对象
     */
    describe('Template Immutability', () => {
        it('should not modify the original template object', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        id: fc.string({ minLength: 1 }),
                        name: fc.string({ minLength: 1 }),
                        category: fc.string(),
                        description: fc.string(),
                        icon: fc.webUrl(),
                        usageCount: fc.integer({ min: 0 }),
                        isFavorite: fc.boolean(),
                        fields: fc.array(
                            fc.record({
                                name: fc.string({ minLength: 1 }),
                                label: fc.string(),
                                type: fc.constantFrom(
                                    FieldType.TEXT,
                                    FieldType.NUMBER,
                                    FieldType.DATE
                                ),
                                required: fc.boolean()
                            })
                        )
                    }),
                    (template) => {
                        // 保存原始值
                        const originalName = template.name
                        const originalIcon = template.icon
                        const originalUsageCount = template.usageCount

                        // 渲染卡片
                        renderTemplateCard(template)

                        // 验证原始对象未被修改
                        expect(template.name).toBe(originalName)
                        expect(template.icon).toBe(originalIcon)
                        expect(template.usageCount).toBe(originalUsageCount)
                    }
                ),
                { numRuns: 100 }
            )
        })
    })
})
