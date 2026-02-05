<template>
	<view class="chat-page">
		<!-- 消息列表 -->
		<scroll-view 
			class="messages-container" 
			scroll-y 
			:scroll-top="scrollTop"
			:scroll-with-animation="true"
			@scrolltoupper="loadMoreMessages"
		>
			<!-- 加载更多提示 -->
			<view v-if="loading" class="loading-more">
				<uni-load-more status="loading"></uni-load-more>
			</view>
			
			<!-- 消息列表 -->
			<view class="messages-list">
				<MessageBubble
					v-for="message in messages"
					:key="message.id"
					:message="message"
					:isTyping="message.id === typingMessageId"
					@regenerate="regenerateMessage"
				/>
				
				<!-- AI正在输入指示器 -->
				<view v-if="aiTyping && !typingMessageId" class="typing-indicator">
					<view class="typing-avatar">⚖️</view>
					<view class="typing-content">
						<view class="typing-bubble">
							<text>正在思考</text>
							<view class="typing-dots">
								<view class="dot"></view>
								<view class="dot"></view>
								<view class="dot"></view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 快速问题 -->
		<view v-if="showQuickQuestions" class="quick-questions">
			<scroll-view class="questions-scroll" scroll-x>
				<view 
					v-for="question in quickQuestions" 
					:key="question"
					class="question-item"
					@click="sendQuickQuestion(question)"
				>
					{{ question }}
				</view>
			</scroll-view>
		</view>
		
		<!-- 输入区域 -->
		<view class="input-area">
			<view class="input-container">
				<view class="input-wrapper">
					<textarea 
						class="message-input"
						placeholder="请输入您的法律问题..."
						v-model="inputMessage"
						:auto-height="true"
						:maxlength="1000"
						@input="handleInput"
						@confirm="sendMessage"
					></textarea>
				</view>
				
				<button 
					class="send-btn"
					:class="{ 'active': canSend, 'disabled': !canSend }"
					:disabled="!canSend"
					@click="sendMessage"
				>
					<text class="send-icon">➤</text>
				</button>
			</view>
			
			<!-- 输入提示 -->
			<view class="input-tips">
				<text class="tip-text">{{ inputMessage.length }}/1000</text>
				<text class="tip-divider">|</text>
				<text class="tip-text">支持语音输入</text>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useChatStore } from '@/store/chat'
import { useUserStore } from '@/store/user'
import MessageBubble from '@/components/MessageBubble.vue'

export default {
	name: 'ChatDetail',
	components: {
		MessageBubble
	},
	data() {
		return {
			conversationId: null,
			inputMessage: '',
			scrollTop: 0,
			typingMessageId: null,
			quickQuestions: [
				'劳动合同试用期最长多久？',
				'离婚需要什么手续？',
				'交通事故如何处理？',
				'房屋租赁纠纷怎么办？',
				'借款合同怎么写？',
				'工伤赔偿标准是什么？'
			]
		}
	},
	computed: {
		...mapState(useChatStore, ['messages', 'sending', 'loading', 'aiTyping']),
		...mapState(useUserStore, ['isLoggedIn']),
		
		canSend() {
			return this.inputMessage.trim() && !this.sending && this.isLoggedIn
		},
		
		showQuickQuestions() {
			return this.messages.length === 0 && !this.aiTyping
		}
	},
	onLoad(options) {
		this.conversationId = options.id
		
		if (!this.conversationId) {
			uni.showToast({
				title: '对话ID不存在',
				icon: 'none'
			})
			uni.navigateBack()
			return
		}
		
		// 设置当前对话
		this.setCurrentConversation(this.conversationId)
		
		// 如果有初始消息，自动发送
		if (options.message) {
			this.inputMessage = decodeURIComponent(options.message)
			this.$nextTick(() => {
				this.sendMessage()
			})
		}
	},
	
	onShow() {
		// 滚动到底部
		this.$nextTick(() => {
			this.scrollToBottom()
		})
	},
	
	onUnload() {
		// 清空当前对话
		this.setCurrentConversation(null)
	},
	
	watch: {
		messages: {
			handler() {
				// 消息更新时滚动到底部
				this.$nextTick(() => {
					this.scrollToBottom()
				})
			},
			deep: true
		}
	},
	
	methods: {
		...mapActions(useChatStore, [
			'setCurrentConversation', 
			'sendMessage', 
			'regenerateResponse'
		]),
		
		async sendMessage() {
			if (!this.canSend) return
			
			const message = this.inputMessage.trim()
			this.inputMessage = ''
			
			try {
				await this.sendMessage(message)
			} catch (error) {
				console.error('发送消息失败:', error)
				// 发送失败时恢复输入内容
				this.inputMessage = message
			}
		},
		
		sendQuickQuestion(question) {
			this.inputMessage = question
			this.sendMessage()
		},
		
		async regenerateMessage(messageId) {
			try {
				this.typingMessageId = messageId
				await this.regenerateResponse(messageId)
			} catch (error) {
				console.error('重新生成失败:', error)
			} finally {
				this.typingMessageId = null
			}
		},
		
		handleInput(e) {
			this.inputMessage = e.detail.value
		},
		
		scrollToBottom() {
			// 计算滚动高度
			const query = uni.createSelectorQuery().in(this)
			query.select('.messages-list').boundingClientRect((rect) => {
				if (rect) {
					this.scrollTop = rect.height
				}
			}).exec()
		},
		
		loadMoreMessages() {
			// 加载更多历史消息
			console.log('加载更多消息')
		}
	}
}
</script>

<style lang="scss" scoped>
.chat-page {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: var(--bg-color);
}

.messages-container {
	flex: 1;
	padding: 32rpx;
	overflow: hidden;
}

.loading-more {
	padding: 32rpx;
	text-align: center;
}

.messages-list {
	min-height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
}

.typing-indicator {
	display: flex;
	margin-bottom: 32rpx;
	animation: fadeIn 0.3s ease-out;
}

.typing-avatar {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	margin-right: 16rpx;
	flex-shrink: 0;
}

.typing-content {
	flex: 1;
}

.typing-bubble {
	background: #f8fafc;
	border: 2rpx solid #e2e8f0;
	border-radius: 32rpx;
	padding: 24rpx 32rpx;
	display: flex;
	align-items: center;
	gap: 16rpx;
	max-width: calc(100% - 80rpx);
	
	text {
		font-size: 32rpx;
		color: var(--text-light);
	}
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

.quick-questions {
	padding: 24rpx 32rpx;
	background: white;
	border-top: 2rpx solid #f3f4f6;
}

.questions-scroll {
	white-space: nowrap;
}

.question-item {
	display: inline-block;
	padding: 16rpx 24rpx;
	background: #f8fafc;
	border: 2rpx solid #e2e8f0;
	border-radius: 40rpx;
	font-size: 28rpx;
	color: var(--text-color);
	margin-right: 16rpx;
	transition: all 0.3s;
	
	&:active {
		background: var(--primary-color);
		color: white;
		border-color: var(--primary-color);
		transform: scale(0.98);
	}
}

.input-area {
	background: white;
	border-top: 2rpx solid #f3f4f6;
	padding: 24rpx 32rpx;
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.input-container {
	display: flex;
	align-items: flex-end;
	gap: 16rpx;
}

.input-wrapper {
	flex: 1;
	background: #f8fafc;
	border: 2rpx solid #e2e8f0;
	border-radius: 24rpx;
	padding: 16rpx 24rpx;
	transition: all 0.3s;
	
	&:focus-within {
		border-color: var(--primary-color);
		box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
	}
}

.message-input {
	width: 100%;
	min-height: 80rpx;
	max-height: 200rpx;
	font-size: 32rpx;
	line-height: 1.5;
	background: transparent;
	border: none;
	outline: none;
	resize: none;
	
	&::placeholder {
		color: #9ca3af;
	}
}

.send-btn {
	width: 88rpx;
	height: 88rpx;
	border-radius: 50%;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s;
	flex-shrink: 0;
	
	&.active {
		background: var(--primary-color);
		color: white;
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
		
		&:active {
			transform: scale(0.95);
		}
	}
	
	&.disabled {
		background: #f3f4f6;
		color: #c0c4cc;
	}
}

.send-icon {
	font-size: 32rpx;
	font-weight: bold;
}

.input-tips {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	margin-top: 16rpx;
}

.tip-text {
	font-size: 24rpx;
	color: var(--text-light);
}

.tip-divider {
	font-size: 24rpx;
	color: #e5e7eb;
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