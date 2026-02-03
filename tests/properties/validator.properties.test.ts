import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { validateField, validateForm } from '../../utils/validator'
import { FieldType } from '../../types/document'
import type { FormField, ValidationRule } from '../../types/document'

/**
 * 属性测试：表单验证规则正确性
 * Feature: legal-assistant-app, Property 12: 表单验证规则正确性
 * 
 * 验证需求 7.2：法律文书生成 - 实时验证输入内容的有效性
 * 
 * 对于任意表单字段和输入值，验证结果应该符合该字段定义的验证规则
 * （如必填、格式、范围等）。
 * 
 * **Validates: Requirements 7.2**
 */

describe('Validator - Property-Based Tests', () => {
    /**
     * 属性 12：表单验证规则正确性
     * 
     * 对于任意表单字段和输入值，验证结果应该符合该字段定义的验证规则
     * （如必填、格式、范围等）。
     */
    describe('Property 12: 表单验证规则正确性', () => {
        /**
         * 测试必填字段验证
         * 必填字段为空时应该返回错误，有值时应该通过验证
         */
        it('should validate required fields correctly', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }), // 字段名
                    fc.string({ minLength: 1 }), // 字段标签
                    fc.constantFrom(FieldType.TEXT, FieldType.TEXTAREA, FieldType.NUMBER, FieldType.DATE),
                    fc.constantFrom(undefined, null, ''), // 空值
                    (name, label, type, emptyValue) => {
                        const field: FormField = {
                            name,
                            label,
                            type,
                            required: true
                        }

                        const error = validateField(emptyValue, field)

                        // 必填字段为空应该返回错误
                        expect(error).toBeTruthy()
                        expect(error).toContain(label)
                        expect(error).toContain('必填')
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试非必填字段验证
         * 非必填字段为空时应该通过验证
         */
        it('should allow empty values for non-required fields', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    fc.string({ minLength: 1 }),
                    fc.constantFrom(FieldType.TEXT, FieldType.TEXTAREA, FieldType.NUMBER, FieldType.DATE),
                    fc.constantFrom(undefined, null, ''),
                    (name, label, type, emptyValue) => {
                        const field: FormField = {
                            name,
                            label,
                            type,
                            required: false
                        }

                        const error = validateField(emptyValue, field)

                        // 非必填字段为空应该通过验证
                        expect(error).toBe('')
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试数字类型验证
         * 有效数字应该通过验证，无效数字应该返回错误
         */
        it('should validate number type correctly', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    fc.string({ minLength: 1 }),
                    fc.oneof(
                        fc.integer(),
                        fc.double({ noNaN: true, noDefaultInfinity: true })
                    ),
                    (name, label, validNumber) => {
                        const field: FormField = {
                            name,
                            label,
                            type: FieldType.NUMBER,
                            required: false
                        }

                        const error = validateField(validNumber, field)

                        // 有效数字应该通过验证（除非是金额字段且为0）
                        if (validNumber === 0 && (
                            name.toLowerCase().includes('amount') ||
                            name.toLowerCase().includes('金额') ||
                            label.includes('金额')
                        )) {
                            expect(error).toBeTruthy()
                        } else {
                            expect(error).toBe('')
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试金额字段不能为0的规则（需求 7.3）
         */
        it('should reject zero for amount fields', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom('amount', 'totalAmount', 'loanAmount', '金额', '借款金额'),
                    fc.string({ minLength: 1 }),
                    (name, label) => {
                        const field: FormField = {
                            name,
                            label: label.includes('金额') ? label : `${label}金额`,
                            type: FieldType.NUMBER,
                            required: true
                        }

                        const error = validateField(0, field)

                        // 金额字段为0应该返回错误
                        expect(error).toBeTruthy()
                        expect(error).toContain('不能为0')
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试日期类型验证
         * 未来日期和今天应该通过验证，过去日期应该返回错误（需求 7.4）
         */
        it('should validate date type correctly', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    fc.string({ minLength: 1 }),
                    fc.integer({ min: 0, max: 365 }), // 未来天数
                    (name, label, daysInFuture) => {
                        const field: FormField = {
                            name,
                            label,
                            type: FieldType.DATE,
                            required: false
                        }

                        const futureDate = new Date()
                        futureDate.setDate(futureDate.getDate() + daysInFuture)

                        const error = validateField(futureDate.toISOString(), field)

                        // 未来日期和今天应该通过验证
                        expect(error).toBe('')
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试过去日期验证（需求 7.4）
         */
        it('should reject past dates', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    fc.string({ minLength: 1 }),
                    fc.integer({ min: 1, max: 365 }), // 过去天数
                    (name, label, daysInPast) => {
                        const field: FormField = {
                            name,
                            label,
                            type: FieldType.DATE,
                            required: false
                        }

                        const pastDate = new Date()
                        pastDate.setDate(pastDate.getDate() - daysInPast)

                        const error = validateField(pastDate.toISOString(), field)

                        // 过去日期应该返回错误
                        expect(error).toBeTruthy()
                        expect(error).toContain('过去')
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试最小长度验证规则
         */
        it('should validate min length rule correctly', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    fc.string({ minLength: 1 }),
                    fc.integer({ min: 1, max: 20 }), // 最小长度
                    fc.string(), // 测试字符串
                    (name, label, minLength, testString) => {
                        const field: FormField = {
                            name,
                            label,
                            type: FieldType.TEXT,
                            required: false,
                            validation: {
                                min: minLength,
                                message: `${label}至少需要${minLength}个字符`
                            }
                        }

                        // 跳过空字符串（非必填字段为空时不验证其他规则）
                        if (testString === '') {
                            return
                        }

                        const error = validateField(testString, field)

                        if (testString.length < minLength) {
                            // 长度不足应该返回错误
                            expect(error).toBeTruthy()
                            expect(error).toContain(label)
                        } else {
                            // 长度足够应该通过验证
                            expect(error).toBe('')
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试最大长度验证规则
         */
        it('should validate max length rule correctly', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    fc.string({ minLength: 1 }),
                    fc.integer({ min: 5, max: 50 }), // 最大长度
                    fc.string({ maxLength: 100 }), // 测试字符串
                    (name, label, maxLength, testString) => {
                        const field: FormField = {
                            name,
                            label,
                            type: FieldType.TEXT,
                            required: false,
                            validation: {
                                max: maxLength,
                                message: `${label}不能超过${maxLength}个字符`
                            }
                        }

                        // 跳过空字符串
                        if (testString === '') {
                            return
                        }

                        const error = validateField(testString, field)

                        if (testString.length > maxLength) {
                            // 长度超限应该返回错误
                            expect(error).toBeTruthy()
                            expect(error).toContain(label)
                        } else {
                            // 长度合适应该通过验证
                            expect(error).toBe('')
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试最小值验证规则（数字类型）
         */
        it('should validate min value rule for numbers correctly', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    fc.string({ minLength: 1 }),
                    fc.integer({ min: 0, max: 100 }), // 最小值
                    fc.integer({ min: -100, max: 200 }), // 测试值
                    (name, label, minValue, testValue) => {
                        const field: FormField = {
                            name,
                            label,
                            type: FieldType.NUMBER,
                            required: false,
                            validation: {
                                min: minValue,
                                message: `${label}必须大于等于${minValue}`
                            }
                        }

                        const error = validateField(testValue, field)

                        if (testValue < minValue) {
                            // 小于最小值应该返回错误
                            expect(error).toBeTruthy()
                            expect(error).toContain(label)
                        } else {
                            // 大于等于最小值应该通过验证
                            expect(error).toBe('')
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试最大值验证规则（数字类型）
         */
        it('should validate max value rule for numbers correctly', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    fc.string({ minLength: 1 }),
                    fc.integer({ min: 50, max: 200 }), // 最大值
                    fc.integer({ min: 0, max: 300 }), // 测试值
                    (name, label, maxValue, testValue) => {
                        const field: FormField = {
                            name,
                            label,
                            type: FieldType.NUMBER,
                            required: false,
                            validation: {
                                max: maxValue,
                                message: `${label}不能超过${maxValue}`
                            }
                        }

                        const error = validateField(testValue, field)

                        if (testValue > maxValue) {
                            // 大于最大值应该返回错误
                            expect(error).toBeTruthy()
                            expect(error).toContain(label)
                        } else {
                            // 小于等于最大值应该通过验证
                            expect(error).toBe('')
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试正则表达式验证规则
         */
        it('should validate pattern rule correctly', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    fc.string({ minLength: 1 }),
                    fc.string({ minLength: 1, maxLength: 20 }), // 测试字符串
                    (name, label, testString) => {
                        // 使用简单的数字正则
                        const field: FormField = {
                            name,
                            label,
                            type: FieldType.TEXT,
                            required: false,
                            validation: {
                                pattern: '^\\d+$',
                                message: `${label}必须是纯数字`
                            }
                        }

                        const error = validateField(testString, field)

                        const isNumeric = /^\d+$/.test(testString)

                        if (isNumeric) {
                            // 匹配正则应该通过验证
                            expect(error).toBe('')
                        } else {
                            // 不匹配正则应该返回错误
                            expect(error).toBeTruthy()
                            expect(error).toContain(label)
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试自定义验证函数
         */
        it('should validate custom validator function correctly', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    fc.string({ minLength: 1 }),
                    fc.string(), // 测试字符串
                    (name, label, testString) => {
                        // 自定义验证：字符串长度必须是偶数
                        const field: FormField = {
                            name,
                            label,
                            type: FieldType.TEXT,
                            required: false,
                            validation: {
                                validator: (value: string) => value.length % 2 === 0,
                                message: `${label}长度必须是偶数`
                            }
                        }

                        // 跳过空字符串
                        if (testString === '') {
                            return
                        }

                        const error = validateField(testString, field)

                        if (testString.length % 2 === 0) {
                            // 满足自定义条件应该通过验证
                            expect(error).toBe('')
                        } else {
                            // 不满足自定义条件应该返回错误
                            expect(error).toBeTruthy()
                            expect(error).toContain(label)
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试整个表单验证
         * 所有字段都应该按照各自的规则进行验证
         */
        it('should validate entire form according to field rules', () => {
            // 保留的JavaScript对象属性名，需要过滤
            const reservedNames = new Set([
                'toString', 'valueOf', 'constructor', 'hasOwnProperty',
                'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString',
                '__proto__', '__defineGetter__', '__defineSetter__',
                '__lookupGetter__', '__lookupSetter__'
            ])

            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            name: fc.string({ minLength: 1, maxLength: 20 }),
                            label: fc.string({ minLength: 1, maxLength: 20 }),
                            required: fc.boolean(),
                            value: fc.oneof(
                                fc.string(),
                                fc.integer(),
                                fc.constant(null),
                                fc.constant(undefined),
                                fc.constant('')
                            )
                        }),
                        { minLength: 1, maxLength: 5 }
                    ),
                    (fieldConfigs) => {
                        // 构建字段定义和表单值
                        const fields: FormField[] = []
                        const values: Record<string, any> = {}

                        // 使用 Set 确保字段名唯一，并过滤保留名称
                        const uniqueNames = new Set<string>()

                        for (const config of fieldConfigs) {
                            // 跳过重复的字段名和保留的属性名
                            if (uniqueNames.has(config.name) || reservedNames.has(config.name)) {
                                continue
                            }
                            uniqueNames.add(config.name)

                            fields.push({
                                name: config.name,
                                label: config.label,
                                type: FieldType.TEXT,
                                required: config.required
                            })

                            values[config.name] = config.value
                        }

                        // 如果没有有效字段，跳过测试
                        if (fields.length === 0) {
                            return
                        }

                        const result = validateForm(values, fields)

                        // 验证结果应该是一致的
                        let hasError = false
                        for (const field of fields) {
                            const fieldError = validateField(values[field.name], field)
                            if (fieldError) {
                                hasError = true
                                // 如果字段有错误，应该在结果中
                                expect(result.errors[field.name]).toBeTruthy()
                            } else {
                                // 如果字段没有错误，不应该在结果中
                                expect(result.errors[field.name]).toBeUndefined()
                            }
                        }

                        // valid 标志应该与是否有错误一致
                        expect(result.valid).toBe(!hasError)
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试验证规则的组合
         * 多个验证规则应该按顺序执行，第一个失败的规则返回错误
         */
        it('should apply validation rules in order', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    fc.string({ minLength: 1 }),
                    fc.integer({ min: 5, max: 10 }), // min
                    fc.integer({ min: 15, max: 20 }), // max
                    fc.string({ maxLength: 30 }), // 测试字符串
                    (name, label, minLength, maxLength, testString) => {
                        const field: FormField = {
                            name,
                            label,
                            type: FieldType.TEXT,
                            required: true,
                            validation: {
                                min: minLength,
                                max: maxLength,
                                pattern: '^[a-zA-Z]+$', // 只允许字母
                                message: '验证失败'
                            }
                        }

                        const error = validateField(testString, field)

                        // 如果字符串为空，应该返回必填错误
                        if (testString === '') {
                            expect(error).toContain('必填')
                            return
                        }

                        // 如果长度不足，应该返回长度错误
                        if (testString.length < minLength) {
                            expect(error).toBeTruthy()
                            return
                        }

                        // 如果长度超限，应该返回长度错误
                        if (testString.length > maxLength) {
                            expect(error).toBeTruthy()
                            return
                        }

                        // 如果不匹配正则，应该返回格式错误
                        if (!/^[a-zA-Z]+$/.test(testString)) {
                            expect(error).toBeTruthy()
                            return
                        }

                        // 所有规则都通过，应该没有错误
                        expect(error).toBe('')
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * 属性 13：表单完整性控制生成按钮
     * Feature: legal-assistant-app, Property 13: 表单完整性控制生成按钮
     * 
     * 验证需求 7.5：法律文书生成 - 所有必填项填写完成且验证通过后启用生成按钮
     * 
     * 对于任意文书表单，当且仅当所有必填字段都已填写且所有字段验证都通过时，
     * 「一键生成」按钮应该被启用。
     * 
     * **Validates: Requirements 7.5**
     */
    describe('Property 13: 表单完整性控制生成按钮', () => {
        /**
         * 测试表单完整性控制生成按钮
         * 当所有必填字段都已填写且所有字段验证都通过时，canSubmitForm 应该返回 true
         * 否则应该返回 false
         */
        it('should enable submit button only when all required fields are filled and all validations pass', () => {
            // 保留的JavaScript对象属性名，需要过滤
            const reservedNames = new Set([
                'toString', 'valueOf', 'constructor', 'hasOwnProperty',
                'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString',
                '__proto__', '__defineGetter__', '__defineSetter__',
                '__lookupGetter__', '__lookupSetter__'
            ])

            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            name: fc.string({ minLength: 1, maxLength: 20 }),
                            label: fc.string({ minLength: 1, maxLength: 20 }),
                            type: fc.constantFrom(
                                FieldType.TEXT,
                                FieldType.TEXTAREA,
                                FieldType.NUMBER,
                                FieldType.DATE
                            ),
                            required: fc.boolean(),
                            hasValidation: fc.boolean()
                        }),
                        { minLength: 1, maxLength: 8 }
                    ),
                    (fieldConfigs) => {
                        // 构建字段定义
                        const fields: FormField[] = []
                        const uniqueNames = new Set<string>()

                        for (const config of fieldConfigs) {
                            // 跳过重复的字段名和保留的属性名
                            if (uniqueNames.has(config.name) || reservedNames.has(config.name)) {
                                continue
                            }
                            uniqueNames.add(config.name)

                            const field: FormField = {
                                name: config.name,
                                label: config.label,
                                type: config.type,
                                required: config.required
                            }

                            // 添加验证规则（如果需要）
                            if (config.hasValidation && config.type === FieldType.TEXT) {
                                field.validation = {
                                    min: 2,
                                    max: 50,
                                    message: `${config.label}长度必须在2-50之间`
                                }
                            }

                            fields.push(field)
                        }

                        // 如果没有有效字段，跳过测试
                        if (fields.length === 0) {
                            return
                        }

                        // 场景1：所有字段都正确填写
                        const validValues: Record<string, any> = {}
                        for (const field of fields) {
                            if (field.type === FieldType.NUMBER) {
                                validValues[field.name] = 100
                            } else if (field.type === FieldType.DATE) {
                                const futureDate = new Date()
                                futureDate.setDate(futureDate.getDate() + 30)
                                validValues[field.name] = futureDate.toISOString()
                            } else {
                                validValues[field.name] = 'valid text content'
                            }
                        }

                        // 所有字段都正确填写时，应该可以提交
                        const validResult = validateForm(validValues, fields)
                        expect(validResult.valid).toBe(true)

                        // 场景2：缺少必填字段
                        const requiredFields = fields.filter(f => f.required)
                        if (requiredFields.length > 0) {
                            const missingRequiredValues = { ...validValues }
                            // 随机选择一个必填字段设为空
                            const missingField = requiredFields[0]
                            missingRequiredValues[missingField.name] = ''

                            const missingResult = validateForm(missingRequiredValues, fields)
                            expect(missingResult.valid).toBe(false)
                        }

                        // 场景3：字段值不符合验证规则
                        const fieldsWithValidation = fields.filter(f => f.validation)
                        if (fieldsWithValidation.length > 0) {
                            const invalidValues = { ...validValues }
                            // 选择一个有验证规则的字段，提供不符合规则的值
                            const fieldWithValidation = fieldsWithValidation[0]
                            if (fieldWithValidation.validation?.min) {
                                // 提供长度不足的值
                                invalidValues[fieldWithValidation.name] = 'x'
                            }

                            const invalidResult = validateForm(invalidValues, fields)
                            expect(invalidResult.valid).toBe(false)
                        }

                        // 场景4：非必填字段为空但其他字段正确
                        const optionalFields = fields.filter(f => !f.required)
                        if (optionalFields.length > 0) {
                            const partialValues = { ...validValues }
                            // 将非必填字段设为空
                            for (const field of optionalFields) {
                                partialValues[field.name] = ''
                            }

                            const partialResult = validateForm(partialValues, fields)
                            // 非必填字段为空不应该影响表单有效性
                            expect(partialResult.valid).toBe(true)
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试金额字段为0时不能提交
         * 验证需求 7.3
         */
        it('should not allow submission when amount field is zero', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom('amount', 'totalAmount', 'loanAmount', '金额', '借款金额'),
                    fc.string({ minLength: 1, maxLength: 20 }),
                    (amountFieldName, otherFieldName) => {
                        const fields: FormField[] = [
                            {
                                name: amountFieldName,
                                label: `${amountFieldName}字段`,
                                type: FieldType.NUMBER,
                                required: true
                            },
                            {
                                name: otherFieldName,
                                label: otherFieldName,
                                type: FieldType.TEXT,
                                required: true
                            }
                        ]

                        // 金额为0的情况
                        const valuesWithZero = {
                            [amountFieldName]: 0,
                            [otherFieldName]: 'valid text'
                        }

                        const resultWithZero = validateForm(valuesWithZero, fields)
                        expect(resultWithZero.valid).toBe(false)

                        // 金额为正数的情况
                        const valuesWithPositive = {
                            [amountFieldName]: 1000,
                            [otherFieldName]: 'valid text'
                        }

                        const resultWithPositive = validateForm(valuesWithPositive, fields)
                        expect(resultWithPositive.valid).toBe(true)
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试日期字段为过去日期时不能提交
         * 验证需求 7.4
         */
        it('should not allow submission when date field is in the past', () => {
            // 保留的JavaScript对象属性名，需要过滤
            const reservedNames = new Set([
                'toString', 'valueOf', 'constructor', 'hasOwnProperty',
                'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString',
                '__proto__', '__defineGetter__', '__defineSetter__',
                '__lookupGetter__', '__lookupSetter__'
            ])

            fc.assert(
                fc.property(
                    fc.string({ minLength: 1, maxLength: 20 }),
                    fc.string({ minLength: 1, maxLength: 20 }),
                    fc.integer({ min: 1, max: 365 }), // 过去天数
                    (dateFieldName, otherFieldName, daysInPast) => {
                        // 跳过保留的属性名
                        if (reservedNames.has(dateFieldName) || reservedNames.has(otherFieldName)) {
                            return
                        }

                        // 跳过相同的字段名
                        if (dateFieldName === otherFieldName) {
                            return
                        }

                        const fields: FormField[] = [
                            {
                                name: dateFieldName,
                                label: dateFieldName,
                                type: FieldType.DATE,
                                required: true
                            },
                            {
                                name: otherFieldName,
                                label: otherFieldName,
                                type: FieldType.TEXT,
                                required: true
                            }
                        ]

                        // 过去日期的情况
                        const pastDate = new Date()
                        pastDate.setDate(pastDate.getDate() - daysInPast)

                        const valuesWithPastDate = {
                            [dateFieldName]: pastDate.toISOString(),
                            [otherFieldName]: 'valid text'
                        }

                        const resultWithPastDate = validateForm(valuesWithPastDate, fields)
                        expect(resultWithPastDate.valid).toBe(false)

                        // 未来日期的情况
                        const futureDate = new Date()
                        futureDate.setDate(futureDate.getDate() + daysInPast)

                        const valuesWithFutureDate = {
                            [dateFieldName]: futureDate.toISOString(),
                            [otherFieldName]: 'valid text'
                        }

                        const resultWithFutureDate = validateForm(valuesWithFutureDate, fields)
                        expect(resultWithFutureDate.valid).toBe(true)
                    }
                ),
                { numRuns: 100 }
            )
        })

        /**
         * 测试复杂表单场景
         * 包含多种字段类型和验证规则的组合
         */
        it('should handle complex forms with multiple field types and validation rules', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 10 }), // 文本字段数量
                    fc.integer({ min: 0, max: 5 }), // 数字字段数量
                    fc.integer({ min: 0, max: 3 }), // 日期字段数量
                    (textFieldCount, numberFieldCount, dateFieldCount) => {
                        const fields: FormField[] = []
                        const validValues: Record<string, any> = {}

                        // 添加文本字段
                        for (let i = 0; i < textFieldCount; i++) {
                            const fieldName = `text_field_${i}`
                            fields.push({
                                name: fieldName,
                                label: `文本字段${i}`,
                                type: FieldType.TEXT,
                                required: i % 2 === 0, // 偶数索引为必填
                                validation: i % 3 === 0 ? {
                                    min: 3,
                                    max: 20,
                                    message: '长度必须在3-20之间'
                                } : undefined
                            })
                            validValues[fieldName] = 'valid text'
                        }

                        // 添加数字字段
                        for (let i = 0; i < numberFieldCount; i++) {
                            const fieldName = `number_field_${i}`
                            fields.push({
                                name: fieldName,
                                label: `数字字段${i}`,
                                type: FieldType.NUMBER,
                                required: true
                            })
                            validValues[fieldName] = 100
                        }

                        // 添加日期字段
                        for (let i = 0; i < dateFieldCount; i++) {
                            const fieldName = `date_field_${i}`
                            fields.push({
                                name: fieldName,
                                label: `日期字段${i}`,
                                type: FieldType.DATE,
                                required: i % 2 === 0
                            })
                            const futureDate = new Date()
                            futureDate.setDate(futureDate.getDate() + 30)
                            validValues[fieldName] = futureDate.toISOString()
                        }

                        // 所有字段都正确填写时应该可以提交
                        const validResult = validateForm(validValues, fields)
                        expect(validResult.valid).toBe(true)

                        // 如果有必填字段，测试缺少必填字段的情况
                        const requiredFields = fields.filter(f => f.required)
                        if (requiredFields.length > 0) {
                            const invalidValues = { ...validValues }
                            invalidValues[requiredFields[0].name] = ''

                            const invalidResult = validateForm(invalidValues, fields)
                            expect(invalidResult.valid).toBe(false)
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })
    })
})
