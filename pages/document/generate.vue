<template>
	<view class="document-generate">
		<!-- 步骤指示器 -->
		<view class="step-indicator">
			<view 
				v-for="(step, index) in steps" 
				:key="index"
				class="step-item"
				:class="{ active: currentStep === index, completed: currentStep > index }"
			>
				<view class="step-number">{{ index + 1 }}</view>
				<view class="step-title">{{ step.title }}</view>
			</view>
		</view>
		
		<!-- 步骤内容 -->
		<view class="step-content">
			<!-- 步骤1: 选择模板 -->
			<view v-if="currentStep === 0" class="step-panel">
				<view class="panel-header">
					<view class="panel-title">选择文书模板</view>
					<view class="panel-subtitle">请选择您需要生成的文书类型</view>
				</view>
				
				<view class="template-grid">
					<view 
						v-for="template in templates" 
						:key="template.id"
						class="template-card"
						:class="{ selected: selectedTemplate?.id === template.id }"
						@click="selectTemplate(template)"
					>
						<view class="template-icon">{{ template.icon }}</view>
						<view class="template-info">
							<view class="template-title">{{ template.title }}</view>
							<view class="template-desc">{{ template.description }}</view>
						</view>
						<view class="template-badge" v-if="template.recommended">推荐</view>
					</view>
				</view>
			</view>
			
			<!-- 步骤2: 填写信息 -->
			<view v-if="currentStep === 1" class="step-panel">
				<view class="panel-header">
					<view class="panel-title">填写文书信息</view>
					<view class="panel-subtitle">请根据提示填写相关信息</view>
				</view>
				
				<view class="form-container">
					<view 
						v-for="field in formFields" 
						:key="field.key"
						class="form-group"
					>
						<view class="field-label">
							{{ field.label }}
							<text class="required" v-if="field.required">*</text>
						</view>
						
						<!-- 文本输入 -->
						<input 
							v-if="field.type === 'text'"
							class="form-input"
							:placeholder="field.placeholder"
							v-model="formData[field.key]"
						/>
						
						<!-- 多行文本 -->
						<textarea 
							v-if="field.type === 'textarea'"
							class="form-textarea"
							:placeholder="field.placeholder"
							v-model="formData[field.key]"
							:auto-height="true"
						/>
						
						<!-- 日期选择 -->
						<picker 
							v-if="field.type === 'date'"
							mode="date"
							:value="formData[field.key]"
							@change="handleDateChange(field.key, $event)"
						>
							<view class="form-input date-input">
								{{ formData[field.key] || field.placeholder }}
							</view>
						</picker>
						
						<!-- 选择器 -->
						<picker 
							v-if="field.type === 'select'"
							:range="field.options"
							range-key="label"
							:value="getSelectIndex(field.key, field.options)"
							@change="handleSelectChange(field.key, field.options, $event)"
						>
							<view class="form-input select-input">
								{{ getSelectLabel(field.key, field.options) || field.placeholder }}
							</view>
						</picker>
						
						<view class="field-tip" v-if="field.tip">{{ field.tip }}</view>
					</view>
				</view>
			</view>
			
			<!-- 步骤3: 预览确认 -->
			<view v-if="currentStep === 2" class="step-panel">
				<view class="panel-header">
					<view class="panel-title">预览文书内容</view>
					<view class="panel-subtitle">请确认文书信息无误后生成</view>
				</view>
				
				<view class="preview-container">
					<view class="preview-header">
						<view class="document-title">{{ selectedTemplate?.title }}</view>
						<view class="document-info">
							<text>生成时间: {{ formatDate(new Date()) }}</text>
						</view>
					</view>
					
					<view class="preview-content">
						<view 
							v-for="(value, key) in formData" 
							:key="key"
							class="preview-item"
							v-if="value"
						>
							<view class="item-label">{{ getFieldLabel(key) }}:</view>
							<view class="item-value">{{ value }}</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 步骤4: 生成结果 -->
			<view v-if="currentStep === 3" class="step-panel">
				<view class="panel-header">
					<view class="panel-title">文书生成完成</view>
					<view class="panel-subtitle">您的文书已成功生成</view>
				</view>
				
				<view class="result-container">
					<view class="success-icon">✅</view>
					<view class="success-title">文书生成成功！</view>
					<view class="success-desc">您可以下载或分享生成的文书</view>
					
					<view class="result-actions">
						<button class="action-btn primary" @click="downloadDocument">
							<text>📄</text>
							<text>下载文书</text>
						</button>
						<button class="action-btn secondary" @click="previewDocument">
							<text>👁️</text>
							<text>预览文书</text>
						</button>
						<button class="action-btn secondary" @click="shareDocument">
							<text>📤</text>
							<text>分享文书</text>
						</button>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-actions">
			<button 
				class="action-btn secondary" 
				@click="prevStep"
				v-if="currentStep > 0 && currentStep < 3"
			>
				上一步
			</button>
			
			<button 
				class="action-btn primary" 
				@click="nextStep"
				v-if="currentStep < 2"
				:disabled="!canProceed"
			>
				下一步
			</button>
			
			<button 
				class="action-btn primary" 
				@click="generateDocument"
				v-if="currentStep === 2"
				:disabled="generating"
			>
				{{ generating ? '生成中...' : '生成文书' }}
			</button>
			
			<button 
				class="action-btn primary" 
				@click="createNew"
				v-if="currentStep === 3"
			>
				生成新文书
			</button>
		</view>
		
		<!-- 加载提示 -->
		<uni-load-more v-if="generating" status="loading" :content-text="{ contentrefresh: '正在生成文书...' }"></uni-load-more>
	</view>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
	name: 'DocumentGenerate',
	data() {
		return {
			currentStep: 0,
			generating: false,
			selectedTemplate: null,
			formData: {},
			generatedDocument: null,
			
			steps: [
				{ title: '选择模板' },
				{ title: '填写信息' },
				{ title: '预览确认' },
				{ title: '生成完成' }
			],
			
			templates: [
				{
					id: 1,
					title: '租赁合同',
					description: '房屋租赁合同模板',
					icon: '🏠',
					recommended: true
				},
				{
					id: 2,
					title: '劳动合同',
					description: '标准劳动合同模板',
					icon: '💼'
				},
				{
					id: 3,
					title: '离婚协议',
					description: '离婚协议书模板',
					icon: '📋'
				},
				{
					id: 4,
					title: '遗嘱',
					description: '个人遗嘱模板',
					icon: '📜'
				}
			],
			
			// 表单字段配置
			formFieldsConfig: {
				1: [ // 租赁合同
					{ key: 'landlord_name', label: '出租方姓名', type: 'text', required: true, placeholder: '请输入出租方姓名' },
					{ key: 'tenant_name', label: '承租方姓名', type: 'text', required: true, placeholder: '请输入承租方姓名' },
					{ key: 'property_address', label: '房屋地址', type: 'textarea', required: true, placeholder: '请输入详细房屋地址' },
					{ key: 'rent_amount', label: '租金金额', type: 'text', required: true, placeholder: '请输入月租金金额' },
					{ key: 'lease_start', label: '租赁开始日期', type: 'date', required: true, placeholder: '选择开始日期' },
					{ key: 'lease_end', label: '租赁结束日期', type: 'date', required: true, placeholder: '选择结束日期' }
				],
				2: [ // 劳动合同
					{ key: 'company_name', label: '用人单位', type: 'text', required: true, placeholder: '请输入公司名称' },
					{ key: 'employee_name', label: '员工姓名', type: 'text', required: true, placeholder: '请输入员工姓名' },
					{ key: 'position', label: '工作岗位', type: 'text', required: true, placeholder: '请输入工作岗位' },
					{ key: 'salary', label: '薪资待遇', type: 'text', required: true, placeholder: '请输入薪资金额' },
					{ key: 'contract_start', label: '合同开始日期', type: 'date', required: true, placeholder: '选择开始日期' },
					{ key: 'contract_period', label: '合同期限', type: 'select', required: true, placeholder: '选择合同期限',
					  options: [
						  { value: '1year', label: '一年' },
						  { value: '2year', label: '两年' },
						  { value: '3year', label: '三年' },
						  { value: 'indefinite', label: '无固定期限' }
					  ]
					}
				]
			}
		}
	},
	
	computed: {
		...mapState('user', ['isLoggedIn']),
		
		formFields() {
			return this.selectedTemplate ? this.formFieldsConfig[this.selectedTemplate.id] || [] : []
		},
		
		canProceed() {
			if (this.currentStep === 0) {
				return !!this.selectedTemplate
			}
			if (this.currentStep === 1) {
				return this.validateForm()
			}
			return true
		}
	},
	
	onLoad() {
		this.checkLoginStatus()
	},
	
	methods: {
		...mapActions('user', ['checkLoginStatus']),
		
		selectTemplate(template) {
			this.selectedTemplate = template
			this.formData = {}
		},
		
		nextStep() {
			if (this.canProceed && this.currentStep < 3) {
				this.currentStep++
			}
		},
		
		prevStep() {
			if (this.currentStep > 0) {
				this.currentStep--
			}
		},
		
		validateForm() {
			const requiredFields = this.formFields.filter(field => field.required)
			return requiredFields.every(field => this.formData[field.key])
		},
		
		handleDateChange(key, event) {
			this.formData[key] = event.detail.value
		},
		
		handleSelectChange(key, options, event) {
			const index = event.detail.value
			this.formData[key] = options[index].value
		},
		
		getSelectIndex(key, options) {
			const value = this.formData[key]
			return options.findIndex(option => option.value === value)
		},
		
		getSelectLabel(key, options) {
			const value = this.formData[key]
			const option = options.find(option => option.value === value)
			return option ? option.label : ''
		},
		
		getFieldLabel(key) {
			const field = this.formFields.find(f => f.key === key)
			return field ? field.label : key
		},
		
		async generateDocument() {
			if (!this.isLoggedIn) {
				uni.showModal({
					title: '提示',
					content: '请先登录后再生成文书',
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({
								url: '/pages/auth/login'
							})
						}
					}
				})
				return
			}
			
			this.generating = true
			
			try {
				const response = await uni.request({
					url: 'http://localhost:8002/api/documents/generate',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						template_id: this.selectedTemplate.id,
						form_data: this.formData
					}
				})
				
				if (response.data.success) {
					this.generatedDocument = response.data.data
					this.currentStep = 3
					
					uni.showToast({
						title: '生成成功',
						icon: 'success'
					})
				} else {
					throw new Error(response.data.message || '生成失败')
				}
				
			} catch (error) {
				console.error('生成文书失败:', error)
				uni.showToast({
					title: '生成失败',
					icon: 'none'
				})
			} finally {
				this.generating = false
			}
		},
		
		downloadDocument() {
			if (this.generatedDocument) {
				uni.showToast({
					title: '下载功能开发中',
					icon: 'none'
				})
			}
		},
		
		previewDocument() {
			if (this.generatedDocument) {
				uni.navigateTo({
					url: `/pages/document/preview?id=${this.generatedDocument.id}`
				})
			}
		},
		
		shareDocument() {
			uni.showToast({
				title: '分享功能开发中',
				icon: 'none'
			})
		},
		
		createNew() {
			this.currentStep = 0
			this.selectedTemplate = null
			this.formData = {}
			this.generatedDocument = null
		},
		
		formatDate(date) {
			return date.toLocaleDateString('zh-CN')
		}
	}
}
</script>

<style lang="scss" scoped>
.document-generate {
	min-height: 100vh;
	background: var(--bg-color);
	padding-bottom: 120rpx;
}

.step-indicator {
	display: flex;
	justify-content: space-between;
	padding: 32rpx;
	background: white;
	margin-bottom: 16rpx;
}

.step-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	position: relative;
	
	&:not(:last-child)::after {
		content: '';
		position: absolute;
		top: 20rpx;
		right: -50%;
		width: 100%;
		height: 2rpx;
		background: #e5e7eb;
		z-index: 1;
	}
	
	&.active::after,
	&.completed::after {
		background: var(--primary-color);
	}
}

.step-number {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	background: #e5e7eb;
	color: #9ca3af;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	font-weight: 600;
	margin-bottom: 8rpx;
	position: relative;
	z-index: 2;
	
	.step-item.active & {
		background: var(--primary-color);
		color: white;
	}
	
	.step-item.completed & {
		background: var(--success-color);
		color: white;
	}
}

.step-title {
	font-size: 24rpx;
	color: #6b7280;
	
	.step-item.active & {
		color: var(--primary-color);
		font-weight: 600;
	}
}

.step-content {
	flex: 1;
}

.step-panel {
	background: white;
	margin: 0 32rpx 32rpx;
	border-radius: 24rpx;
	padding: 32rpx;
}

.panel-header {
	margin-bottom: 32rpx;
}

.panel-title {
	font-size: 36rpx;
	font-weight: 700;
	color: var(--text-color);
	margin-bottom: 8rpx;
}

.panel-subtitle {
	font-size: 28rpx;
	color: var(--text-light);
}

.template-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300rpx, 1fr));
	gap: 24rpx;
}

.template-card {
	padding: 32rpx;
	border: 2rpx solid #e5e7eb;
	border-radius: 16rpx;
	transition: all 0.3s;
	position: relative;
	
	&:active {
		transform: scale(0.98);
	}
	
	&.selected {
		border-color: var(--primary-color);
		background: #f0f9ff;
	}
}

.template-icon {
	font-size: 48rpx;
	margin-bottom: 16rpx;
}

.template-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 8rpx;
}

.template-desc {
	font-size: 28rpx;
	color: var(--text-light);
}

.template-badge {
	position: absolute;
	top: 16rpx;
	right: 16rpx;
	background: var(--primary-color);
	color: white;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	font-size: 20rpx;
}

.form-container {
	display: flex;
	flex-direction: column;
	gap: 32rpx;
}

.form-group {
	display: flex;
	flex-direction: column;
}

.field-label {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 12rpx;
}

.required {
	color: var(--error-color);
	margin-left: 4rpx;
}

.form-input,
.form-textarea {
	padding: 24rpx;
	border: 2rpx solid #e5e7eb;
	border-radius: 12rpx;
	font-size: 28rpx;
	background: white;
	
	&:focus {
		border-color: var(--primary-color);
	}
}

.form-textarea {
	min-height: 120rpx;
}

.date-input,
.select-input {
	color: var(--text-color);
	
	&:empty {
		color: #9ca3af;
	}
}

.field-tip {
	font-size: 24rpx;
	color: var(--text-light);
	margin-top: 8rpx;
}

.preview-container {
	border: 2rpx solid #e5e7eb;
	border-radius: 16rpx;
	overflow: hidden;
}

.preview-header {
	background: #f8fafc;
	padding: 24rpx;
	border-bottom: 2rpx solid #e5e7eb;
}

.document-title {
	font-size: 32rpx;
	font-weight: 700;
	color: var(--text-color);
	margin-bottom: 8rpx;
}

.document-info {
	font-size: 24rpx;
	color: var(--text-light);
}

.preview-content {
	padding: 24rpx;
}

.preview-item {
	display: flex;
	margin-bottom: 16rpx;
	
	&:last-child {
		margin-bottom: 0;
	}
}

.item-label {
	font-size: 28rpx;
	color: var(--text-light);
	min-width: 120rpx;
	margin-right: 16rpx;
}

.item-value {
	font-size: 28rpx;
	color: var(--text-color);
	flex: 1;
}

.result-container {
	text-align: center;
	padding: 48rpx 0;
}

.success-icon {
	font-size: 120rpx;
	margin-bottom: 24rpx;
}

.success-title {
	font-size: 36rpx;
	font-weight: 700;
	color: var(--text-color);
	margin-bottom: 16rpx;
}

.success-desc {
	font-size: 28rpx;
	color: var(--text-light);
	margin-bottom: 48rpx;
}

.result-actions {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	max-width: 400rpx;
	margin: 0 auto;
}

.bottom-actions {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: white;
	padding: 24rpx 32rpx;
	border-top: 2rpx solid #e5e7eb;
	display: flex;
	gap: 16rpx;
}

.action-btn {
	flex: 1;
	padding: 24rpx;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	transition: all 0.3s;
	
	&.primary {
		background: var(--primary-color);
		color: white;
		border: none;
		
		&:disabled {
			background: #d1d5db;
			color: #9ca3af;
		}
	}
	
	&.secondary {
		background: white;
		color: var(--text-color);
		border: 2rpx solid #e5e7eb;
		
		&:active {
			background: #f3f4f6;
		}
	}
}
</style>