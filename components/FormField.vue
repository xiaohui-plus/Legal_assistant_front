<template>
	<view class="form-field">
		<view class="field-label" :class="{ 'required': field.required }">
			{{ field.label }}
		</view>
		
		<!-- 文本输入 -->
		<input 
			v-if="field.type === 'text'" 
			class="field-input"
			type="text"
			:placeholder="`请输入${field.label}`"
			:value="modelValue"
			@input="handleInput"
		/>
		
		<!-- 数字输入 -->
		<input 
			v-else-if="field.type === 'number'" 
			class="field-input"
			type="number"
			:placeholder="`请输入${field.label}`"
			:value="modelValue"
			@input="handleInput"
		/>
		
		<!-- 日期输入 -->
		<picker 
			v-else-if="field.type === 'date'" 
			mode="date"
			:value="modelValue"
			@change="handleDateChange"
		>
			<view class="field-input picker-input" :class="{ 'placeholder': !modelValue }">
				{{ modelValue || `请选择${field.label}` }}
			</view>
		</picker>
		
		<!-- 选择器 -->
		<picker 
			v-else-if="field.type === 'select'" 
			:range="field.options"
			:value="getSelectedIndex()"
			@change="handleSelectChange"
		>
			<view class="field-input picker-input" :class="{ 'placeholder': !modelValue }">
				{{ modelValue || `请选择${field.label}` }}
			</view>
		</picker>
		
		<!-- 多行文本 -->
		<textarea 
			v-else-if="field.type === 'textarea'" 
			class="field-textarea"
			:placeholder="`请输入${field.label}`"
			:value="modelValue"
			@input="handleInput"
			auto-height
		></textarea>
		
		<!-- 验证错误提示 -->
		<view v-if="error" class="field-error">
			{{ error }}
		</view>
		
		<!-- 字段说明 -->
		<view v-if="field.help" class="field-help">
			{{ field.help }}
		</view>
	</view>
</template>

<script>
import { validatePhone, validateIdCard, validateEmail } from '@/utils/common'

export default {
	name: 'FormField',
	props: {
		field: {
			type: Object,
			required: true
		},
		modelValue: {
			type: [String, Number],
			default: ''
		}
	},
	emits: ['update:modelValue'],
	data() {
		return {
			error: ''
		}
	},
	watch: {
		modelValue: {
			handler(newValue) {
				this.validateField(newValue)
			},
			immediate: true
		}
	},
	methods: {
		handleInput(e) {
			const value = e.detail.value
			this.$emit('update:modelValue', value)
		},
		
		handleDateChange(e) {
			const value = e.detail.value
			this.$emit('update:modelValue', value)
		},
		
		handleSelectChange(e) {
			const index = e.detail.value
			const value = this.field.options[index]
			this.$emit('update:modelValue', value)
		},
		
		getSelectedIndex() {
			if (!this.modelValue || !this.field.options) return 0
			return this.field.options.indexOf(this.modelValue)
		},
		
		validateField(value) {
			this.error = ''
			
			// 必填验证
			if (this.field.required && !value) {
				this.error = `${this.field.label}不能为空`
				return false
			}
			
			if (!value) return true
			
			// 根据字段名称进行特殊验证
			const fieldName = this.field.name.toLowerCase()
			
			// 手机号验证
			if (fieldName.includes('phone') || fieldName.includes('mobile')) {
				if (!validatePhone(value)) {
					this.error = '请输入正确的手机号'
					return false
				}
			}
			
			// 身份证验证
			if (fieldName.includes('id') && fieldName.includes('card') || fieldName.includes('id_card')) {
				if (!validateIdCard(value)) {
					this.error = '请输入正确的身份证号'
					return false
				}
			}
			
			// 邮箱验证
			if (fieldName.includes('email') || fieldName.includes('mail')) {
				if (!validateEmail(value)) {
					this.error = '请输入正确的邮箱地址'
					return false
				}
			}
			
			// 金额验证
			if (fieldName.includes('amount') || fieldName.includes('money') || fieldName.includes('salary')) {
				if (this.field.type === 'number' && value <= 0) {
					this.error = '金额必须大于0'
					return false
				}
			}
			
			// 利率验证
			if (fieldName.includes('rate') || fieldName.includes('interest')) {
				if (this.field.type === 'number' && (value < 0 || value > 24)) {
					this.error = '利率应在0-24%之间'
					return false
				}
			}
			
			// 期限验证
			if (fieldName.includes('term') || fieldName.includes('period')) {
				if (this.field.type === 'number' && value <= 0) {
					this.error = '期限必须大于0'
					return false
				}
			}
			
			return true
		},
		
		// 外部调用验证方法
		validate() {
			return this.validateField(this.modelValue)
		}
	}
}
</script>

<style lang="scss" scoped>
.form-field {
	margin-bottom: 32rpx;
}

.field-label {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 16rpx;
	
	&.required::after {
		content: ' *';
		color: var(--error-color);
	}
}

.field-input,
.field-textarea {
	width: 100%;
	padding: 24rpx 32rpx;
	border: 2rpx solid var(--border-color);
	border-radius: 16rpx;
	font-size: 32rpx;
	background: white;
	color: var(--text-color);
	transition: all 0.3s;
	
	&:focus {
		border-color: var(--primary-color);
		box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
	}
	
	&.placeholder {
		color: #c0c4cc;
	}
}

.field-textarea {
	min-height: 120rpx;
	resize: none;
}

.picker-input {
	display: flex;
	align-items: center;
	min-height: 88rpx;
	cursor: pointer;
	
	&::after {
		content: '';
		width: 0;
		height: 0;
		border-left: 12rpx solid transparent;
		border-right: 12rpx solid transparent;
		border-top: 12rpx solid #c0c4cc;
		margin-left: auto;
	}
}

.field-error {
	font-size: 24rpx;
	color: var(--error-color);
	margin-top: 8rpx;
	padding-left: 16rpx;
}

.field-help {
	font-size: 24rpx;
	color: var(--text-light);
	margin-top: 8rpx;
	padding-left: 16rpx;
	line-height: 1.4;
}

/* 输入框错误状态 */
.form-field:has(.field-error) {
	.field-input,
	.field-textarea {
		border-color: var(--error-color);
		
		&:focus {
			box-shadow: 0 0 0 6rpx rgba(238, 10, 36, 0.1);
		}
	}
}
</style>