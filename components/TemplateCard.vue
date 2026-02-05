<template>
	<view class="template-card" :class="{ 'selected': isSelected }" @click="selectTemplate">
		<view class="card-header">
			<view class="template-icon">{{ template.icon }}</view>
			<view class="template-badge" v-if="template.type">{{ getTypeName(template.type) }}</view>
		</view>
		
		<view class="card-body">
			<view class="template-name">{{ template.name }}</view>
			<view class="template-desc">{{ template.description }}</view>
		</view>
		
		<view class="card-footer">
			<view class="template-info">
				<text class="info-item">{{ getFieldCount() }}个字段</text>
				<text class="info-item">{{ getDifficulty() }}</text>
			</view>
		</view>
		
		<!-- 选中指示器 -->
		<view v-if="isSelected" class="selected-indicator">
			<text class="check-icon">✓</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'TemplateCard',
	props: {
		template: {
			type: Object,
			required: true
		},
		isSelected: {
			type: Boolean,
			default: false
		}
	},
	emits: ['select'],
	methods: {
		selectTemplate() {
			this.$emit('select', this.template)
		},
		
		getTypeName(type) {
			const typeMap = {
				'contract': '合同',
				'agreement': '协议',
				'lawsuit': '诉状',
				'receipt': '凭证',
				'application': '申请'
			}
			return typeMap[type] || '文书'
		},
		
		getFieldCount() {
			return this.template.form_config ? this.template.form_config.length : 0
		},
		
		getDifficulty() {
			const fieldCount = this.getFieldCount()
			if (fieldCount <= 5) return '简单'
			if (fieldCount <= 10) return '中等'
			return '复杂'
		}
	}
}
</script>

<style lang="scss" scoped>
.template-card {
	background: white;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	border: 4rpx solid transparent;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
	
	&:active {
		transform: scale(0.98);
	}
	
	&.selected {
		border-color: var(--primary-color);
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
		box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.15);
	}
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.template-icon {
	width: 80rpx;
	height: 80rpx;
	background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 40rpx;
}

.template-badge {
	padding: 8rpx 16rpx;
	background: var(--primary-color);
	color: white;
	border-radius: 12rpx;
	font-size: 24rpx;
	font-weight: 500;
}

.card-body {
	margin-bottom: 24rpx;
}

.template-name {
	font-size: 36rpx;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 12rpx;
}

.template-desc {
	font-size: 28rpx;
	color: var(--text-light);
	line-height: 1.5;
}

.card-footer {
	border-top: 2rpx solid #f3f4f6;
	padding-top: 20rpx;
}

.template-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.info-item {
	font-size: 24rpx;
	color: var(--text-light);
	padding: 6rpx 12rpx;
	background: #f8fafc;
	border-radius: 8rpx;
}

.selected-indicator {
	position: absolute;
	top: 24rpx;
	right: 24rpx;
	width: 48rpx;
	height: 48rpx;
	background: var(--primary-color);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: bounce 0.6s ease-out;
}

.check-icon {
	color: white;
	font-size: 28rpx;
	font-weight: bold;
}

@keyframes bounce {
	0%, 20%, 53%, 80%, 100% {
		transform: translate3d(0, 0, 0);
	}
	40%, 43% {
		transform: translate3d(0, -12rpx, 0);
	}
	70% {
		transform: translate3d(0, -6rpx, 0);
	}
	90% {
		transform: translate3d(0, -2rpx, 0);
	}
}
</style>