import { describe, it, expect } from 'vitest'
import {
    validateField,
    validateForm,
    canSubmitForm,
    getFieldError,
    hasFieldError
} from '../../../utils/validator'
import { FieldType } from '../../../types/document'
import type { FormField } from '../../../types/document'

/**
 * 单元测试：表单验证工具
 * 验证需求 7：法律文书生成
 */

describe('Validator Utils', () => {
    describe('validateField', () => {
        describe('Required field validation', () => {
            it('should return error for empty required text field', () => {
                const field: FormField = {
                    name: 'name',
                    label: '姓名',
                    type: FieldType.TEXT,
                    required: true
                }

                expect(validateField('', field)).toBe('姓名为必填项')
                expect(validateField(null, field)).toBe('姓名为必填项')
                expect(validateField(undefined, field)).toBe('姓名为必填项')
            })

            it('should pass validation for filled required field', () => {
                const field: FormField = {
                    name: 'name',
                    label: '姓名',
                    type: FieldType.TEXT,
                    required: true
                }

                expect(validateField('张三', field)).toBe('')
            })

            it('should pass validation for empty non-required field', () => {
                const field: FormField = {
                    name: 'nickname',
                    label: '昵称',
                    type: FieldType.TEXT,
                    required: false
                }

                expect(validateField('', field)).toBe('')
                expect(validateField(null, field)).toBe('')
                expect(validateField(undefined, field)).toBe('')
            })
        })

        describe('Number field validation', () => {
            it('should validate number field correctly', () => {
                const field: FormField = {
                    name: 'age',
                    label: '年龄',
                    type: FieldType.NUMBER,
                    required: true
                }

                expect(validateField(25, field)).toBe('')
                expect(validateField('25', field)).toBe('')
            })

            it('should return error for invalid number', () => {
                const field: FormField = {
                    name: 'age',
                    label: '年龄',
                    type: FieldType.NUMBER,
                    required: true
                }

                expect(validateField('abc', field)).toBe('年龄必须是有效的数字')
                expect(validateField('12abc', field)).toBe('年龄必须是有效的数字')
            })

            it('should reject zero for amount fields (需求 7.3)', () => {
                const amountField: FormField = {
                    name: 'amount',
                    label: '金额',
                    type: FieldType.NUMBER,
                    required: true
                }

                expect(validateField(0, amountField)).toBe('金额不能为0')
                expect(validateField('0', amountField)).toBe('金额不能为0')
            })

            it('should reject zero for fields with "金额" in label', () => {
                const field: FormField = {
                    name: 'loanAmount',
                    label: '借款金额',
                    type: FieldType.NUMBER,
                    required: true
                }

                expect(validateField(0, field)).toBe('借款金额不能为0')
            })

            it('should accept non-zero amounts', () => {
                const field: FormField = {
                    name: 'amount',
                    label: '金额',
                    type: FieldType.NUMBER,
                    required: true
                }

                expect(validateField(100, field)).toBe('')
                expect(validateField(0.01, field)).toBe('')
                expect(validateField(-100, field)).toBe('')
            })

            it('should accept zero for non-amount number fields', () => {
                const field: FormField = {
                    name: 'count',
                    label: '数量',
                    type: FieldType.NUMBER,
                    required: true
                }

                expect(validateField(0, field)).toBe('')
            })
        })

        describe('Date field validation', () => {
            it('should validate valid future date', () => {
                const field: FormField = {
                    name: 'deadline',
                    label: '截止日期',
                    type: FieldType.DATE,
                    required: true
                }

                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)

                expect(validateField(tomorrow.toISOString(), field)).toBe('')
            })

            it('should validate today as valid date', () => {
                const field: FormField = {
                    name: 'deadline',
                    label: '截止日期',
                    type: FieldType.DATE,
                    required: true
                }

                const today = new Date()
                expect(validateField(today.toISOString(), field)).toBe('')
            })

            it('should reject past dates (需求 7.4)', () => {
                const field: FormField = {
                    name: 'deadline',
                    label: '截止日期',
                    type: FieldType.DATE,
                    required: true
                }

                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)

                expect(validateField(yesterday.toISOString(), field)).toBe('截止日期不能选择过去的日期')
            })

            it('should return error for invalid date', () => {
                const field: FormField = {
                    name: 'deadline',
                    label: '截止日期',
                    type: FieldType.DATE,
                    required: true
                }

                expect(validateField('invalid-date', field)).toBe('截止日期必须是有效的日期')
            })
        })

        describe('Custom validation rules', () => {
            it('should validate pattern rule', () => {
                const field: FormField = {
                    name: 'phone',
                    label: '手机号',
                    type: FieldType.TEXT,
                    required: true,
                    validation: {
                        pattern: '^1[3-9]\\d{9}$',
                        message: '请输入有效的手机号'
                    }
                }

                expect(validateField('13800138000', field)).toBe('')
                expect(validateField('12345678901', field)).toBe('请输入有效的手机号')
                expect(validateField('138001380', field)).toBe('请输入有效的手机号')
            })

            it('should validate min length for text', () => {
                const field: FormField = {
                    name: 'description',
                    label: '描述',
                    type: FieldType.TEXTAREA,
                    required: true,
                    validation: {
                        min: 10,
                        message: '描述至少需要10个字符'
                    }
                }

                expect(validateField('这是一段足够长的描述内容', field)).toBe('')
                expect(validateField('太短', field)).toBe('描述至少需要10个字符')
            })

            it('should validate max length for text', () => {
                const field: FormField = {
                    name: 'title',
                    label: '标题',
                    type: FieldType.TEXT,
                    required: true,
                    validation: {
                        max: 20,
                        message: '标题不能超过20个字符'
                    }
                }

                expect(validateField('合适的标题', field)).toBe('')
                expect(validateField('这是一个非常非常非常非常长的标题内容超过限制', field)).toBe('标题不能超过20个字符')
            })

            it('should validate min value for number', () => {
                const field: FormField = {
                    name: 'age',
                    label: '年龄',
                    type: FieldType.NUMBER,
                    required: true,
                    validation: {
                        min: 18,
                        message: '年龄必须大于等于18岁'
                    }
                }

                expect(validateField(18, field)).toBe('')
                expect(validateField(25, field)).toBe('')
                expect(validateField(17, field)).toBe('年龄必须大于等于18岁')
            })

            it('should validate max value for number', () => {
                const field: FormField = {
                    name: 'age',
                    label: '年龄',
                    type: FieldType.NUMBER,
                    required: true,
                    validation: {
                        max: 100,
                        message: '年龄不能超过100岁'
                    }
                }

                expect(validateField(100, field)).toBe('')
                expect(validateField(50, field)).toBe('')
                expect(validateField(101, field)).toBe('年龄不能超过100岁')
            })

            it('should validate custom validator function', () => {
                const field: FormField = {
                    name: 'idCard',
                    label: '身份证号',
                    type: FieldType.TEXT,
                    required: true,
                    validation: {
                        validator: (value: string) => value.length === 18,
                        message: '身份证号必须是18位'
                    }
                }

                expect(validateField('123456789012345678', field)).toBe('')
                expect(validateField('12345678901234567', field)).toBe('身份证号必须是18位')
            })

            it('should apply multiple validation rules', () => {
                const field: FormField = {
                    name: 'password',
                    label: '密码',
                    type: FieldType.TEXT,
                    required: true,
                    validation: {
                        min: 6,
                        max: 20,
                        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$',
                        message: '密码必须包含大小写字母和数字'
                    }
                }

                expect(validateField('Abc123', field)).toBe('')
                expect(validateField('abc', field)).toBe('密码必须包含大小写字母和数字')
            })
        })

        describe('Edge cases', () => {
            it('should handle empty string for non-required field', () => {
                const field: FormField = {
                    name: 'optional',
                    label: '可选项',
                    type: FieldType.TEXT,
                    required: false
                }

                expect(validateField('', field)).toBe('')
            })

            it('should handle whitespace-only string for required field', () => {
                const field: FormField = {
                    name: 'name',
                    label: '姓名',
                    type: FieldType.TEXT,
                    required: true
                }

                // Whitespace is considered as valid content
                expect(validateField('   ', field)).toBe('')
            })

            it('should handle zero as valid number for non-amount fields', () => {
                const field: FormField = {
                    name: 'score',
                    label: '分数',
                    type: FieldType.NUMBER,
                    required: true
                }

                expect(validateField(0, field)).toBe('')
            })

            it('should handle negative numbers', () => {
                const field: FormField = {
                    name: 'temperature',
                    label: '温度',
                    type: FieldType.NUMBER,
                    required: true
                }

                expect(validateField(-10, field)).toBe('')
            })
        })
    })

    describe('validateForm', () => {
        it('should validate all fields and return no errors for valid form', () => {
            const fields: FormField[] = [
                {
                    name: 'name',
                    label: '姓名',
                    type: FieldType.TEXT,
                    required: true
                },
                {
                    name: 'age',
                    label: '年龄',
                    type: FieldType.NUMBER,
                    required: true
                }
            ]

            const values = {
                name: '张三',
                age: 25
            }

            const result = validateForm(values, fields)

            expect(result.valid).toBe(true)
            expect(result.errors).toEqual({})
        })

        it('should return errors for invalid fields', () => {
            const fields: FormField[] = [
                {
                    name: 'name',
                    label: '姓名',
                    type: FieldType.TEXT,
                    required: true
                },
                {
                    name: 'amount',
                    label: '金额',
                    type: FieldType.NUMBER,
                    required: true
                },
                {
                    name: 'deadline',
                    label: '截止日期',
                    type: FieldType.DATE,
                    required: true
                }
            ]

            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)

            const values = {
                name: '',
                amount: 0,
                deadline: yesterday.toISOString()
            }

            const result = validateForm(values, fields)

            expect(result.valid).toBe(false)
            expect(result.errors).toEqual({
                name: '姓名为必填项',
                amount: '金额不能为0',
                deadline: '截止日期不能选择过去的日期'
            })
        })

        it('should validate multiple fields with mixed results', () => {
            const fields: FormField[] = [
                {
                    name: 'name',
                    label: '姓名',
                    type: FieldType.TEXT,
                    required: true
                },
                {
                    name: 'email',
                    label: '邮箱',
                    type: FieldType.TEXT,
                    required: true,
                    validation: {
                        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
                        message: '请输入有效的邮箱地址'
                    }
                },
                {
                    name: 'age',
                    label: '年龄',
                    type: FieldType.NUMBER,
                    required: false
                }
            ]

            const values = {
                name: '张三',
                email: 'invalid-email',
                age: ''
            }

            const result = validateForm(values, fields)

            expect(result.valid).toBe(false)
            expect(result.errors).toEqual({
                email: '请输入有效的邮箱地址'
            })
        })

        it('should handle empty form values', () => {
            const fields: FormField[] = [
                {
                    name: 'name',
                    label: '姓名',
                    type: FieldType.TEXT,
                    required: true
                }
            ]

            const values = {}

            const result = validateForm(values, fields)

            expect(result.valid).toBe(false)
            expect(result.errors).toEqual({
                name: '姓名为必填项'
            })
        })

        it('should handle form with only optional fields', () => {
            const fields: FormField[] = [
                {
                    name: 'nickname',
                    label: '昵称',
                    type: FieldType.TEXT,
                    required: false
                },
                {
                    name: 'bio',
                    label: '简介',
                    type: FieldType.TEXTAREA,
                    required: false
                }
            ]

            const values = {}

            const result = validateForm(values, fields)

            expect(result.valid).toBe(true)
            expect(result.errors).toEqual({})
        })
    })

    describe('canSubmitForm', () => {
        it('should return true when all validations pass (需求 7.5)', () => {
            const fields: FormField[] = [
                {
                    name: 'name',
                    label: '姓名',
                    type: FieldType.TEXT,
                    required: true
                },
                {
                    name: 'amount',
                    label: '金额',
                    type: FieldType.NUMBER,
                    required: true
                }
            ]

            const values = {
                name: '张三',
                amount: 1000
            }

            expect(canSubmitForm(values, fields)).toBe(true)
        })

        it('should return false when any validation fails', () => {
            const fields: FormField[] = [
                {
                    name: 'name',
                    label: '姓名',
                    type: FieldType.TEXT,
                    required: true
                },
                {
                    name: 'amount',
                    label: '金额',
                    type: FieldType.NUMBER,
                    required: true
                }
            ]

            const values = {
                name: '张三',
                amount: 0
            }

            expect(canSubmitForm(values, fields)).toBe(false)
        })

        it('should return false when required fields are missing', () => {
            const fields: FormField[] = [
                {
                    name: 'name',
                    label: '姓名',
                    type: FieldType.TEXT,
                    required: true
                },
                {
                    name: 'email',
                    label: '邮箱',
                    type: FieldType.TEXT,
                    required: true
                }
            ]

            const values = {
                name: '张三'
            }

            expect(canSubmitForm(values, fields)).toBe(false)
        })

        it('should return true when only optional fields are empty', () => {
            const fields: FormField[] = [
                {
                    name: 'name',
                    label: '姓名',
                    type: FieldType.TEXT,
                    required: true
                },
                {
                    name: 'nickname',
                    label: '昵称',
                    type: FieldType.TEXT,
                    required: false
                }
            ]

            const values = {
                name: '张三',
                nickname: ''
            }

            expect(canSubmitForm(values, fields)).toBe(true)
        })
    })

    describe('getFieldError', () => {
        it('should return error message for field with error', () => {
            const errors = {
                name: '姓名为必填项',
                email: '请输入有效的邮箱地址'
            }

            expect(getFieldError('name', errors)).toBe('姓名为必填项')
            expect(getFieldError('email', errors)).toBe('请输入有效的邮箱地址')
        })

        it('should return empty string for field without error', () => {
            const errors = {
                name: '姓名为必填项'
            }

            expect(getFieldError('email', errors)).toBe('')
        })

        it('should return empty string for empty errors object', () => {
            const errors = {}

            expect(getFieldError('name', errors)).toBe('')
        })
    })

    describe('hasFieldError', () => {
        it('should return true for field with error', () => {
            const errors = {
                name: '姓名为必填项',
                email: '请输入有效的邮箱地址'
            }

            expect(hasFieldError('name', errors)).toBe(true)
            expect(hasFieldError('email', errors)).toBe(true)
        })

        it('should return false for field without error', () => {
            const errors = {
                name: '姓名为必填项'
            }

            expect(hasFieldError('email', errors)).toBe(false)
        })

        it('should return false for empty errors object', () => {
            const errors = {}

            expect(hasFieldError('name', errors)).toBe(false)
        })
    })

    describe('Integration scenarios', () => {
        it('should validate a complete legal document form', () => {
            const fields: FormField[] = [
                {
                    name: 'partyA',
                    label: '甲方',
                    type: FieldType.TEXT,
                    required: true
                },
                {
                    name: 'partyB',
                    label: '乙方',
                    type: FieldType.TEXT,
                    required: true
                },
                {
                    name: 'amount',
                    label: '合同金额',
                    type: FieldType.NUMBER,
                    required: true
                },
                {
                    name: 'signDate',
                    label: '签署日期',
                    type: FieldType.DATE,
                    required: true
                },
                {
                    name: 'description',
                    label: '合同描述',
                    type: FieldType.TEXTAREA,
                    required: false
                }
            ]

            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)

            const values = {
                partyA: '张三',
                partyB: '李四',
                amount: 10000,
                signDate: tomorrow.toISOString(),
                description: ''
            }

            const result = validateForm(values, fields)

            expect(result.valid).toBe(true)
            expect(canSubmitForm(values, fields)).toBe(true)
        })

        it('should handle real-time validation workflow (需求 7.2)', () => {
            const field: FormField = {
                name: 'amount',
                label: '金额',
                type: FieldType.NUMBER,
                required: true
            }

            // User starts typing
            expect(validateField('', field)).toBe('金额为必填项')

            // User enters 0
            expect(validateField(0, field)).toBe('金额不能为0')

            // User enters valid amount
            expect(validateField(1000, field)).toBe('')
        })
    })
})
