<template>
	<view class="generate-page">
		<!-- 步骤指示器 -->
		<view class="step-indicator">
			<view class="step-item" :class="{ 'active': currentStep >= 1, 'completed': currentStep > 1 }">
				<view class="step-number">1</view>
				<text class="step-text">选择模板</text>
			</view>
			<view class="step-line" :class="{ 'active': currentStep > 1 }"></view>
			<view class="step-item" :class="{ 'active': currentStep >= 2, 'completed': currentStep > 2 }">
				<view class="step-number">2</view>
				<text class="step-text">填写信息</text>
			</view>
			<view class="step-line" :class="{ 'active': currentStep > 2 }"></view>
			<view class="step-item" :class="{ 'active': currentStep >= 3 }">
				<view class="step-number">3</view>
				<text class="step-text">生成文书</text>
			</view>
		</view>
		
		<!-- 步骤1: 选择模板 -->
		<view v-if="currentStep === 1" class="step-content">
			<view class="step-header">
				<view class="step-title">选择文书模板</view>
				<view class="step-subtitle">请选择您需要生成的文书类型</view>
			</view>
			
			<view class="template-list">
				<TemplateCard
					v-for="template in templates"
					:key="template.id"
					:template="template"
					:isSelected="selectedTemplate && selectedTemplate.id === template.id"
					@select="selectTemplate"
				/>
			</view>
			
			<view class="step-actions">
				<button 
					class="next-btn"
					:disabled="!selectedTemplate"
					@click="nextStep"
				>
					下一步
				</button>
			</view>
		</view>
		
		<!-- 步骤2: 填写表单 -->
		<view v-if="currentStep === 2" class="step-content">
			<view class="step-header">
				<view class="step-title">填写文书信息</view>
				<view class="step-subtitle">请完整填写以下信息，确保文书的准确性</view>
			</view>
			
			<view class="form-container">
				<view class="form-section" v-for="(section, index) in formSections" :key="index">
					<view v-if="section.title" class="section-title">{{ section.title }}</view>
					
					<FormField
						v-for="field in section.fields"
						:key="field.name"
						:field="field"
						v-model="formData[field.name]"
						:ref="`field_${field.name}`"
					/>
				</view>
			</view>
			
			<view class="step-actions">
				<button class="prev-btn" @click="prevStep">上一步</button>
				<button 
					class="next-btn"
					:disabled="!isFormValid"
					@click="nextStep"
				>
					下一步
				</button>
			</view>
		</view>
		
		<!-- 步骤3: 生成预览 -->
		<view v-if="currentStep === 3" class="step-content">
			<view class="step-header">
				<view class="step-title">确认信息并生成</view>
				<view class="step-subtitle">请确认填写的信息无误，点击生成文书</view>
			</view>
			
			<!-- 信息确认 -->
			<view class="confirm-info">
				<view class="info-section">
					<view class="info-title">文书类型</view>
					<view class="info-value">{{ selectedTemplate.name }}</view>
				</view>
				
				<view class="info-section" v-for="field in requiredFields" :key="field.name">
					<view class="info-title">{{ field.label }}</view>
					<view class="info-value">{{ formData[field.name] || '未填写' }}</view>
				</view>
			</view>
			
			<!-- 生成结果 -->
			<view v-if="generatedDocument" class="generated-result">
				<view class="result-header">
					<view class="result-title">生成成功</view>
					<view class="result-subtitle">文书已生成完成，您可以预览或保存</view>
				</view>
				
				<view class="document-preview">
					<view class="preview-header">
						<text class="document-title">{{ generatedDocument.name }}</text>
						<text class="document-time">{{ formatTime(generatedDocument.create_time) }}</text>
					</view>
					<view class="preview-content">
						{{ generatedDocument.content.substring(0, 200) }}...
					</view>
				</view>
				
				<view class="result-actions">
					<button class="preview-btn" @click="previewDocument">预览文书</button>
					<button class="save-btn" @click="saveDocument">保存文书</button>
				</view>
			</view>
			
			<view class="step-actions">
				<button class="prev-btn" @click="prevStep">上一步</button>
				<button 
					v-if="!generatedDocument"
					class="generate-btn"
					:class="{ 'loading': generating }"
					:disabled="generating"
					@click="generateDocument"
				>
					<text v-if="!generating">生成文书</text>
					<text v-else>生成中...</text>
				</button>
				<button v-else class="new-btn" @click="createNew">重新生成</button>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<uni-load-more v-if="loading" status="loading"></uni-load-more>
	</view>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useDocumentStore } from '@/store/document'
import { formatRelativeTime } from '@/utils/common'
import TemplateCard from '@/components/TemplateCard.vue'
import FormField from '@/components/FormField.vue'

export default {
	name: 'DocumentGenerate',
	components: {
		TemplateCard,
		FormField
	},
	data() {
		return {
			currentStep: 1
		}
	},
	computed: {
		...mapState(useDocumentStore, [
			'templates', 
			'selectedTemplate', 
			'formData', 
			'generatedDocument',
			'loading',
			'generating'
		]),
		
		formSections() {
			if (!this.selectedTemplate || !this.selectedTemplate.form_config) {
				return []
			}
			
			// 根据字段类型分组
			const sections = []
			const fields = this.selectedTemplate.form_config
			
			// 基本信息
			const basicFields = fields.filter(field => 
				field.name.includes('name') || 
				field.name.includes('id') || 
				field.name.includes('phone')
			)
			
			if (basicFields.length > 0) {
				sections.push({
					title: '基本信息',
					fields: basicFields
				})
			}
			
			// 其他字段
			const otherFields = fields.filter(field => !basicFields.includes(field))
			if (otherFields.length > 0) {
				sections.push({
					title: '详细信息',
					fields: otherFields
				})
			}
			
			return sections
		},
		
		requiredFields() {
			if (!this.selectedTemplate || !this.selectedTemplate.form_config) {
				return []
			}
			
			return this.selectedTemplate.form_config.filter(field => field.required)
		},
		
		isFormValid() {
			return this.requiredFields.every(field => {
				const value = this.formData[field.name]
				return value && value.toString().trim()
			})
		}
	},
	onLoad() {
		this.initPage()
	},
	
	onUnload() {
		// 清空表单数据
		this.clearFormData()
	},
	
	methods: {
		...mapActions(useDocumentStore, [
			'getTemplates',
			'selectTemplate',
			'setFormData',
			'generateDocument',
			'clearFormData'
		]),
		
		async initPage() {
			try {
				// 获取模板列表
				await this.getTemplates()
				
				// 如果已有选中的模板，跳到第二步
				if (this.selectedTemplate) {
					this.currentStep = 2
				}
			} catch (error) {
				console.error('页面初始化失败:', error)
			}
		},
		
		selectTemplate(template) {
			this.selectTemplate(template)
		},
		
		nextStep() {
			if (this.currentStep < 3) {
				// 验证当前步骤
				if (this.currentStep === 1 && !this.selectedTemplate) {
					uni.showToast({
						title: '请选择文书模板',
						icon: 'none'
					})
					return
				}
				
				if (this.currentStep === 2 && !this.validateForm()) {
					return
				}
				
				this.currentStep++
			}
		},
		
		prevStep() {
			if (this.currentStep > 1) {
				this.currentStep--
			}
		},
		
		validateForm() {
			// 验证必填字段
			const errors = []
			
			this.requiredFields.forEach(field => {
				const value = this.formData[field.name]
				if (!value || !value.toString().trim()) {
					errors.push(`${field.label}不能为空`)
				}
			})
			
			if (errors.length > 0) {
				uni.showToast({
					title: errors[0],
					icon: 'none'
				})
				return false
			}
			
			// 调用字段组件的验证方法
			const fieldRefs = Object.keys(this.formData).map(name => this.$refs[`field_${name}`])
			const fieldErrors = fieldRefs.filter(ref => {
				if (ref && ref[0] && typeof ref[0].validate === 'function') {
					return !ref[0].validate()
				}
				return false
			})
			
			if (fieldErrors.length > 0) {
				return false
			}
			
			return true
		},
		
		async generateDocument() {
			try {
				await this.generateDocument()
				
				uni.showToast({
					title: '文书生成成功',
					icon: 'success'
				})
			} catch (error) {
				console.error('生成文书失败:', error)
			}
		},
		
		previewDocument() {
			if (this.generatedDocument) {
				uni.navigateTo({
					url: `/pages/document/preview?id=${this.generatedDocument.id}`
				})
			}
		},
		
		saveDocument() {
			uni.showToast({
				title: '文书已保存',
				icon: 'success'
			})
			
			// 跳转到我的文书
			setTimeout(() => {
				uni.navigateTo({
					url: '/pages/document/my'
				})
			}, 1500)
		},
		
		createNew() {
			this.clearFormData()
			this.currentStep = 1
		},
		
		formatTime(time) {
			return formatRelativeTime(time)
		}
	}
}
</script>

<style lang="scss" scoped>
.generate-page {
	min-height: 100vh;
	background: var(--bg-color);
}

.step-indicator {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 48rpx 32rpx;
	background: white;
	margin-bottom: 16rpx;
}

.step-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
}

.step-number {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: #f3f4f6;
	color: #9ca3af;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: 600;
	transition: all 0.3s;
	
	.step-item.active & {
		background: var(--primary-color);
		color: white;
	}
	
	.step-item.completed & {
		background: var(--success-color);
		color: white;
	}
}

.step-text {
	font-size: 24rpx;
	color: #9ca3af;
	transition: all 0.3s;
	
	.step-item.active & {
		color: var(--primary-color);
		font-weight: 600;
	}
}

.step-line {
	width: 80rpx;
	height: 4rpx;
	background: #f3f4f6;
	margin: 0 24rpx;
	transition: all 0.3s;
	
	&.active {
		background: var(--primary-color);
	}
}

.step-content {
	background: white;
	margin-bottom: 16rpx;
}

.step-header {
	padding: 48rpx 32rpx 32rpx;
	text-align: center;
	border-bottom: 2rpx solid #f3f4f6;
}

.step-title {
	font-size: 40rpx;
	font-weight: 700;
	color: var(--text-color);
	margin-bottom: 12rpx;
}

.step-subtitle {
	font-size: 28rpx;
	color: var(--text-light);
	line-height: 1.5;
}

.template-list {
	padding: 32rpx;
}

.form-container {
	padding: 32rpx;
}

.form-section {
	margin-bottom: 48rpx;
	
	&:last-child {
		margin-bottom: 0;
	}
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 32rpx;
	padding-bottom: 16rpx;
	border-bottom: 2rpx solid #f3f4f6;
}

.confirm-info {
	padding: 32rpx;
}

.info-section {
	display: flex;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 2rpx solid #f8fafc;
	
	&:last-child {
		border-bottom: none;
	}
}

.info-title {
	width: 200rpx;
	font-size: 28rpx;
	color: var(--text-light);
	flex-shrink: 0;
}

.info-value {
	flex: 1;
	font-size: 32rpx;
	color: var(--text-color);
	font-weight: 500;
}

.generated-result {
	padding: 32rpx;
	border-top: 2rpx solid #f3f4f6;
}

.result-header {
	text-align: center;
	margin-bottom: 32rpx;
}

.result-title {
	font-size: 36rpx;
	font-weight: 700;
	color: var(--success-color);
	margin-bottom: 8rpx;
}

.result-subtitle {
	font-size: 28rpx;
	color: var(--text-light);
}

.document-preview {
	background: #f8fafc;
	border: 2rpx solid #e2e8f0;
	border-radius: 16rpx;
	padding: 32rpx;
	margin-bottom: 32rpx;
}

.preview-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
	padding-bottom: 16rpx;
	border-bottom: 2rpx solid #e2e8f0;
}

.document-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-color);
}

.document-time {
	font-size: 24rpx;
	color: var(--text-light);
}

.preview-content {
	font-size: 28rpx;
	color: var(--text-color);
	line-height: 1.6;
}

.result-actions {
	display: flex;
	gap: 16rpx;
	margin-bottom: 32rpx;
}

.preview-btn,
.save-btn {
	flex: 1;
	padding: 24rpx;
	border: none;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: 600;
	transition: all 0.3s;
}

.preview-btn {
	background: #f3f4f6;
	color: var(--text-color);
	
	&:active {
		background: #e5e7eb;
	}
}

.save-btn {
	background: var(--success-color);
	color: white;
	
	&:active {
		background: #059669;
	}
}

.step-actions {
	display: flex;
	gap: 16rpx;
	padding: 32rpx;
	border-top: 2rpx solid #f3f4f6;
}

.prev-btn,
.next-btn,
.generate-btn,
.new-btn {
	flex: 1;
	padding: 32rpx;
	border: none;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: 600;
	transition: all 0.3s;
}

.prev-btn {
	background: #f3f4f6;
	color: var(--text-color);
	
	&:active {
		background: #e5e7eb;
	}
}

.next-btn,
.generate-btn {
	background: var(--primary-color);
	color: white;
	
	&:active:not(:disabled) {
		background: var(--primary-light);
	}
	
	&:disabled {
		background: #d1d5db;
		color: #9ca3af;
	}
	
	&.loading {
		opacity: 0.8;
	}
}

.new-btn {
	background: var(--warning-color);
	color: white;
	
	&:active {
		background: #f59e0b;
	}
}
</style>