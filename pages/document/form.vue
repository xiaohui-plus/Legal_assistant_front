<template>
  <view class="document-form">
    <!-- 表单内容区域 -->
    <scroll-view class="form-content" scroll-y>
      <view class="form-container">
        <!-- 模板信息 -->
        <view v-if="template" class="template-info">
          <text class="template-name">{{ template.name }}</text>
          <text class="template-desc">{{ template.description }}</text>
        </view>

        <!-- 动态表单 -->
        <view v-if="template" class="form-fields">
          <view
            v-for="field in template.fields"
            :key="field.name"
            class="form-field"
          >
            <!-- 字段标签 -->
            <view class="field-label">
              <text class="label-text">{{ field.label }}</text>
              <text v-if="field.required" class="required-mark">*</text>
            </view>

            <!-- 文本输入 -->
            <input
              v-if="field.type === 'text'"
              v-model="formData[field.name]"
              class="field-input"
              :placeholder="field.placeholder || `请输入${field.label}`"
              @blur="validateField(field.name)"
            />

            <!-- 多行文本输入 -->
            <textarea
              v-else-if="field.type === 'textarea'"
              v-model="formData[field.name]"
              class="field-textarea"
              :placeholder="field.placeholder || `请输入${field.label}`"
              @blur="validateField(field.name)"
            />

            <!-- 数字输入 -->
            <input
              v-else-if="field.type === 'number'"
              v-model.number="formData[field.name]"
              type="number"
              class="field-input"
              :placeholder="field.placeholder || `请输入${field.label}`"
              @blur="validateField(field.name)"
            />

            <!-- 日期选择 -->
            <picker
              v-else-if="field.type === 'date'"
              mode="date"
              :value="formData[field.name]"
              @change="onDateChange($event, field.name)"
            >
              <view class="field-picker">
                <text :class="formData[field.name] ? 'picker-value' : 'picker-placeholder'">
                  {{ formData[field.name] || field.placeholder || `请选择${field.label}` }}
                </text>
              </view>
            </picker>

            <!-- 下拉选择 -->
            <picker
              v-else-if="field.type === 'select'"
              :range="field.options"
              range-key="label"
              :value="getPickerIndex(field)"
              @change="onSelectChange($event, field)"
            >
              <view class="field-picker">
                <text :class="formData[field.name] !== undefined ? 'picker-value' : 'picker-placeholder'">
                  {{ getSelectLabel(field) || field.placeholder || `请选择${field.label}` }}
                </text>
              </view>
            </picker>

            <!-- 单选 -->
            <radio-group
              v-else-if="field.type === 'radio'"
              @change="onRadioChange($event, field.name)"
            >
              <label
                v-for="option in field.options"
                :key="option.value"
                class="radio-item"
              >
                <radio
                  :value="option.value"
                  :checked="formData[field.name] === option.value"
                />
                <text class="radio-label">{{ option.label }}</text>
              </label>
            </radio-group>

            <!-- 多选 -->
            <checkbox-group
              v-else-if="field.type === 'checkbox'"
              @change="onCheckboxChange($event, field.name)"
            >
              <label
                v-for="option in field.options"
                :key="option.value"
                class="checkbox-item"
              >
                <checkbox
                  :value="option.value"
                  :checked="isCheckboxChecked(field.name, option.value)"
                />
                <text class="checkbox-label">{{ option.label }}</text>
              </label>
            </checkbox-group>

            <!-- 错误提示 -->
            <text v-if="errors[field.name]" class="field-error">
              {{ errors[field.name] }}
            </text>
          </view>
        </view>

        <!-- 加载状态 -->
        <view v-else class="loading-state">
          <text>加载中...</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="form-actions">
      <button class="btn-secondary" @click="saveDraft">暂存表单</button>
      <button
        class="btn-primary"
        :disabled="!isFormValid"
        @click="generateDocument"
      >
        一键生成
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { DocumentTemplate, FormField } from '@/types/document'
import { FieldType } from '@/types/document'
import storageManager from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'

// 模板数据
const template = ref<DocumentTemplate | null>(null)
const templateId = ref<string>('')

// 表单数据
const formData = ref<Record<string, any>>({})

// 验证错误
const errors = ref<Record<string, string>>({})

// 加载状态
const isLoading = ref(false)

/**
 * 页面加载时获取模板ID
 */
onLoad((options: any) => {
  if (options.templateId) {
    templateId.value = options.templateId
    loadTemplate(options.templateId)
    loadDraft(options.templateId)
  }
})

/**
 * 加载模板数据
 */
const loadTemplate = async (id: string) => {
  try {
    // TODO: 从API或store获取模板数据
    // 这里使用模拟数据
    template.value = getMockTemplate(id)
    
    // 初始化表单数据
    if (template.value) {
      template.value.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          formData.value[field.name] = field.defaultValue
        }
      })
    }
  } catch (error) {
    console.error('加载模板失败:', error)
    uni.showToast({
      title: '加载模板失败',
      icon: 'none'
    })
  }
}

/**
 * 加载暂存的表单数据
 */
const loadDraft = async (id: string) => {
  try {
    const draftKey = `${STORAGE_KEYS.FORM_DRAFTS}${id}`
    const draft = await storageManager.get<Record<string, any>>(draftKey)
    
    if (draft) {
      formData.value = { ...formData.value, ...draft }
      uni.showToast({
        title: '已恢复暂存内容',
        icon: 'none',
        duration: 1500
      })
    }
  } catch (error) {
    console.error('加载暂存数据失败:', error)
  }
}

/**
 * 验证单个字段
 */
const validateField = (fieldName: string) => {
  const field = template.value?.fields.find(f => f.name === fieldName)
  if (!field) return

  const value = formData.value[fieldName]

  // 清除之前的错误
  delete errors.value[fieldName]

  // 必填验证
  if (field.required && (value === undefined || value === null || value === '')) {
    errors.value[fieldName] = `${field.label}不能为空`
    return
  }

  // 如果字段为空且非必填，跳过其他验证
  if (!value && !field.required) {
    return
  }

  // 验证规则
  if (field.validation) {
    const rule = field.validation

    // 正则验证
    if (rule.pattern && typeof value === 'string') {
      const regex = new RegExp(rule.pattern)
      if (!regex.test(value)) {
        errors.value[fieldName] = rule.message
        return
      }
    }

    // 最小值/最小长度验证
    if (rule.min !== undefined) {
      if (typeof value === 'number' && value < rule.min) {
        errors.value[fieldName] = rule.message
        return
      }
      if (typeof value === 'string' && value.length < rule.min) {
        errors.value[fieldName] = rule.message
        return
      }
    }

    // 最大值/最大长度验证
    if (rule.max !== undefined) {
      if (typeof value === 'number' && value > rule.max) {
        errors.value[fieldName] = rule.message
        return
      }
      if (typeof value === 'string' && value.length > rule.max) {
        errors.value[fieldName] = rule.message
        return
      }
    }

    // 自定义验证函数
    if (rule.validator && !rule.validator(value)) {
      errors.value[fieldName] = rule.message
      return
    }
  }

  // 特殊字段验证
  // 金额字段不能为0
  if (field.name.includes('amount') || field.name.includes('金额')) {
    if (field.type === FieldType.NUMBER && value === 0) {
      errors.value[fieldName] = '金额不能为0'
      return
    }
  }

  // 日期字段不能选择过去的日期
  if (field.type === FieldType.DATE && value) {
    const selectedDate = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      errors.value[fieldName] = '不能选择过去的日期'
      return
    }
  }
}

/**
 * 验证整个表单
 */
const validateForm = (): boolean => {
  if (!template.value) return false

  // 清空所有错误
  errors.value = {}

  // 验证所有字段
  template.value.fields.forEach(field => {
    validateField(field.name)
  })

  // 返回是否有错误
  return Object.keys(errors.value).length === 0
}

/**
 * 计算表单是否有效
 */
const isFormValid = computed(() => {
  if (!template.value) return false

  // 检查所有必填字段是否已填写
  const allRequiredFilled = template.value.fields
    .filter(field => field.required)
    .every(field => {
      const value = formData.value[field.name]
      return value !== undefined && value !== null && value !== ''
    })

  // 检查是否有验证错误
  const noErrors = Object.keys(errors.value).length === 0

  return allRequiredFilled && noErrors
})

/**
 * 日期选择变化
 */
const onDateChange = (event: any, fieldName: string) => {
  formData.value[fieldName] = event.detail.value
  validateField(fieldName)
}

/**
 * 下拉选择变化
 */
const onSelectChange = (event: any, field: FormField) => {
  const index = event.detail.value
  if (field.options && field.options[index]) {
    formData.value[field.name] = field.options[index].value
    validateField(field.name)
  }
}

/**
 * 单选变化
 */
const onRadioChange = (event: any, fieldName: string) => {
  formData.value[fieldName] = event.detail.value
  validateField(fieldName)
}

/**
 * 多选变化
 */
const onCheckboxChange = (event: any, fieldName: string) => {
  formData.value[fieldName] = event.detail.value
  validateField(fieldName)
}

/**
 * 获取选择器索引
 */
const getPickerIndex = (field: FormField): number => {
  if (!field.options) return 0
  const value = formData.value[field.name]
  const index = field.options.findIndex(opt => opt.value === value)
  return index >= 0 ? index : 0
}

/**
 * 获取选择器显示标签
 */
const getSelectLabel = (field: FormField): string => {
  if (!field.options) return ''
  const value = formData.value[field.name]
  const option = field.options.find(opt => opt.value === value)
  return option ? option.label : ''
}

/**
 * 检查复选框是否选中
 */
const isCheckboxChecked = (fieldName: string, value: any): boolean => {
  const values = formData.value[fieldName]
  return Array.isArray(values) && values.includes(value)
}

/**
 * 暂存表单
 */
const saveDraft = async () => {
  try {
    const draftKey = `${STORAGE_KEYS.FORM_DRAFTS}${templateId.value}`
    await storageManager.set(draftKey, formData.value)
    
    uni.showToast({
      title: '暂存成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('暂存失败:', error)
    uni.showToast({
      title: '暂存失败',
      icon: 'none'
    })
  }
}

/**
 * 生成文书
 */
const generateDocument = async () => {
  // 验证表单
  if (!validateForm()) {
    uni.showToast({
      title: '请检查表单填写',
      icon: 'none'
    })
    return
  }

  try {
    isLoading.value = true

    // TODO: 调用API生成文书
    // 这里模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 生成文书ID
    const documentId = `doc_${Date.now()}`

    // 跳转到预览页
    uni.navigateTo({
      url: `/pages/document/preview?documentId=${documentId}&templateId=${templateId.value}`
    })

    // 清除暂存数据
    const draftKey = `${STORAGE_KEYS.FORM_DRAFTS}${templateId.value}`
    await storageManager.remove(draftKey)

  } catch (error) {
    console.error('生成文书失败:', error)
    uni.showToast({
      title: '生成失败，请重试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

/**
 * 获取模拟模板数据
 */
const getMockTemplate = (id: string): DocumentTemplate => {
  return {
    id,
    name: '借款合同',
    category: '合同类',
    description: '用于个人或企业之间的借款协议',
    icon: '/static/icons/contract.png',
    usageCount: 128,
    isFavorite: false,
    fields: [
      {
        name: 'lenderName',
        label: '出借人姓名',
        type: FieldType.TEXT,
        required: true,
        placeholder: '请输入出借人姓名',
        validation: {
          min: 2,
          max: 20,
          message: '姓名长度应在2-20个字符之间'
        }
      },
      {
        name: 'borrowerName',
        label: '借款人姓名',
        type: FieldType.TEXT,
        required: true,
        placeholder: '请输入借款人姓名',
        validation: {
          min: 2,
          max: 20,
          message: '姓名长度应在2-20个字符之间'
        }
      },
      {
        name: 'amount',
        label: '借款金额',
        type: FieldType.NUMBER,
        required: true,
        placeholder: '请输入借款金额（元）',
        validation: {
          min: 1,
          message: '借款金额必须大于0'
        }
      },
      {
        name: 'startDate',
        label: '借款日期',
        type: FieldType.DATE,
        required: true
      },
      {
        name: 'endDate',
        label: '还款日期',
        type: FieldType.DATE,
        required: true
      },
      {
        name: 'interestRate',
        label: '年利率（%）',
        type: FieldType.NUMBER,
        required: false,
        placeholder: '请输入年利率',
        defaultValue: 0,
        validation: {
          min: 0,
          max: 36,
          message: '年利率应在0-36%之间'
        }
      },
      {
        name: 'purpose',
        label: '借款用途',
        type: FieldType.TEXTAREA,
        required: true,
        placeholder: '请详细说明借款用途',
        validation: {
          min: 10,
          max: 500,
          message: '借款用途应在10-500个字符之间'
        }
      },
      {
        name: 'repaymentMethod',
        label: '还款方式',
        type: FieldType.SELECT,
        required: true,
        options: [
          { label: '一次性还款', value: 'lump_sum' },
          { label: '分期还款', value: 'installment' },
          { label: '按月付息到期还本', value: 'monthly_interest' }
        ]
      }
    ]
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.document-form {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-color-grey;
}

.form-content {
  flex: 1;
  overflow-y: auto;
}

.form-container {
  padding: $spacing-md;
}

// 模板信息
.template-info {
  background-color: $bg-color;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  border-radius: $border-radius-base;

  .template-name {
    display: block;
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-color;
    margin-bottom: $spacing-xs;
  }

  .template-desc {
    display: block;
    font-size: $font-size-sm;
    color: $text-color-grey;
  }
}

// 表单字段
.form-fields {
  background-color: $bg-color;
  padding: $spacing-md;
  border-radius: $border-radius-base;
}

.form-field {
  margin-bottom: $spacing-lg;

  &:last-child {
    margin-bottom: 0;
  }
}

// 字段标签
.field-label {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-sm;

  .label-text {
    font-size: $font-size-base;
    color: $text-color;
  }

  .required-mark {
    color: $color-error;
    margin-left: 4rpx;
  }
}

// 输入框
.field-input {
  width: 100%;
  height: 80rpx;
  padding: 0 $spacing-md;
  font-size: $font-size-base;
  color: $text-color;
  background-color: $bg-color-grey;
  border: 2rpx solid $border-color;
  border-radius: $border-radius-base;
  box-sizing: border-box;

  &:focus {
    border-color: $color-primary;
  }
}

// 多行文本框
.field-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: $spacing-md;
  font-size: $font-size-base;
  color: $text-color;
  background-color: $bg-color-grey;
  border: 2rpx solid $border-color;
  border-radius: $border-radius-base;
  box-sizing: border-box;

  &:focus {
    border-color: $color-primary;
  }
}

// 选择器
.field-picker {
  height: 80rpx;
  padding: 0 $spacing-md;
  display: flex;
  align-items: center;
  background-color: $bg-color-grey;
  border: 2rpx solid $border-color;
  border-radius: $border-radius-base;

  .picker-value {
    font-size: $font-size-base;
    color: $text-color;
  }

  .picker-placeholder {
    font-size: $font-size-base;
    color: $text-color-placeholder;
  }
}

// 单选项
.radio-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm 0;

  .radio-label {
    margin-left: $spacing-sm;
    font-size: $font-size-base;
    color: $text-color;
  }
}

// 多选项
.checkbox-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm 0;

  .checkbox-label {
    margin-left: $spacing-sm;
    font-size: $font-size-base;
    color: $text-color;
  }
}

// 错误提示
.field-error {
  display: block;
  margin-top: $spacing-xs;
  font-size: $font-size-sm;
  color: $color-error;
}

// 加载状态
.loading-state {
  padding: $spacing-xl;
  text-align: center;
  color: $text-color-grey;
}

// 底部操作栏
.form-actions {
  display: flex;
  padding: $spacing-md;
  background-color: $bg-color;
  border-top: 2rpx solid $border-color;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);

  button {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    font-size: $font-size-base;
    border-radius: $border-radius-base;
    border: none;

    &:first-child {
      margin-right: $spacing-md;
    }
  }

  .btn-secondary {
    background-color: $bg-color-grey;
    color: $text-color;
  }

  .btn-primary {
    background-color: $color-primary;
    color: $text-color-white;

    &:disabled {
      background-color: $text-color-placeholder;
      color: $text-color-white;
    }
  }
}
</style>
