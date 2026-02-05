<template>
	<view class="message-bubble" :class="[`message-${message.sender}`, { 'typing': isTyping }]">
		<!-- 头像 -->
		<view class="avatar" :class="message.sender">
			<text v-if="message.sender === 'ai'">⚖️</text>
			<text v-else>👤</text>
		</view>
		
		<!-- 消息内容 -->
		<view class="message-content">
			<view class="bubble" :class="message.sender">
				<!-- AI消息支持富文本 -->
				<rich-text v-if="message.sender === 'ai'" :nodes="formatContent(message.content)"></rich-text>
				<!-- 用户消息纯文本 -->
				<text v-else>{{ message.content }}</text>
				
				<!-- 打字指示器 -->
				<view v-if="isTyping" class="typing-indicator">
					<view class="typing-dots">
						<view class="dot"></view>
						<view class="dot"></view>
						<view class="dot"></view>
					</view>
				</view>
			</view>
			
			<!-- 消息时间 -->
			<view class="message-time">
				{{ formatTime(message.create_time) }}
			</view>
			
			<!-- AI消息操作按钮 -->
			<view v-if="message.sender === 'ai' && !isTyping" class="message-actions">
				<button class="action-btn" @click="copyMessage">
					<text class="icon">📋</text>
					<text>复制</text>
				</button>
				<button class="action-btn" @click="regenerateMessage">
					<text class="icon">🔄</text>
					<text>重新生成</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import { formatRelativeTime, copyToClipboard } from '@/utils/common'

export default {
	name: 'MessageBubble',
	props: {
		message: {
			type: Object,
			required: true
		},
		isTyping: {
			type: Boolean,
			default: false
		}
	},
	emits: ['regenerate'],
	methods: {
		formatTime(time) {
			return formatRelativeTime(time)
		},
		
		formatContent(content) {
			if (!content) return ''
			
			// 将Markdown格式转换为rich-text支持的格式
			let formatted = content
				.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
				.replace(/\*(.*?)\*/g, '<em>$1</em>')
				.replace(/\n/g, '<br/>')
				.replace(/•/g, '•')
			
			return formatted
		},
		
		async copyMessage() {
			try {
				await copyToClipboard(this.message.content)
			} catch (error) {
				uni.showToast({
					title: '复制失败',
					icon: 'none'
				})
			}
		},
		
		regenerateMessage() {
			this.$emit('regenerate', this.message.id)
		}
	}
}
</script>

<style lang="scss" scoped>
.message-bubble {
	display: flex;
	margin-bottom: 32rpx;
	animation: fadeIn 0.3s ease-out;
	
	&.message-user {
		flex-direction: row-reverse;
		
		.message-content {
			align-items: flex-end;
		}
		
		.bubble {
			background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
			color: white;
			margin-left: 80rpx;
		}
		
		.message-time {
			text-align: right;
		}
	}
	
	&.message-ai {
		.bubble {
			background: #f8fafc;
			border: 2rpx solid #e2e8f0;
			color: var(--text-color);
			margin-right: 80rpx;
		}
	}
}

.avatar {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	flex-shrink: 0;
	margin: 0 16rpx;
	
	&.ai {
		background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
		color: white;
	}
	
	&.user {
		background: #e5e7eb;
		color: var(--text-color);
	}
}

.message-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	max-width: calc(100% - 96rpx);
}

.bubble {
	padding: 24rpx 32rpx;
	border-radius: 32rpx;
	font-size: 32rpx;
	line-height: 1.6;
	word-wrap: break-word;
	position: relative;
	
	// 富文本样式
	:deep(strong) {
		font-weight: 600;
		color: var(--primary-color);
	}
	
	:deep(em) {
		font-style: italic;
		color: var(--text-light);
	}
}

.message-time {
	font-size: 24rpx;
	color: var(--text-light);
	margin-top: 8rpx;
	padding: 0 16rpx;
}

.typing-indicator {
	display: flex;
	align-items: center;
	margin-top: 8rpx;
}

.typing-dots {
	display: flex;
	gap: 8rpx;
	
	.dot {
		width: 8rpx;
		height: 8rpx;
		background: var(--text-light);
		border-radius: 50%;
		animation: typing 1.4s infinite;
		
		&:nth-child(2) {
			animation-delay: 0.2s;
		}
		
		&:nth-child(3) {
			animation-delay: 0.4s;
		}
	}
}

.message-actions {
	display: flex;
	gap: 16rpx;
	margin-top: 16rpx;
	padding: 0 16rpx;
}

.action-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 20rpx;
	background: #f3f4f6;
	border: none;
	border-radius: 16rpx;
	font-size: 24rpx;
	color: var(--text-light);
	transition: all 0.2s;
	
	&:active {
		background: #e5e7eb;
		transform: scale(0.98);
	}
	
	.icon {
		font-size: 20rpx;
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes typing {
	0%, 60%, 100% {
		transform: translateY(0);
		opacity: 0.4;
	}
	30% {
		transform: translateY(-12rpx);
		opacity: 1;
	}
}
</style>