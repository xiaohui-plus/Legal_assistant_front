<template>
	<view class="app-container">
		<!-- 侧边栏 -->
		<view class="sidebar" :class="{ open: sidebarOpen }" v-if="showSidebar">
			<view class="sidebar-header">
				<view class="logo">
					<view class="logo-icon">⚖️</view>
					<view class="logo-text">法义AI</view>
				</view>
				<button class="new-chat-btn" @click="createNewChat">
					<text>➕</text>
					<text>新建对话</text>
				</button>
			</view>
			<scroll-view class="chat-list" scroll-y>
				<view 
					v-for="chat in chats" 
					:key="chat.id"
					class="chat-item"
					:class="{ active: chat.id === currentChatId }"
					@click="switchToChat(chat.id)"
				>
					<view class="chat-title">{{ chat.title }}</view>
					<view class="chat-preview">{{ getLastMessage(chat) }}</view>
					<view class="chat-time">{{ formatTime(chat.updateTime) }}</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 遮罩层 -->
		<view class="overlay" :class="{ show: sidebarOpen }" @click="closeSidebar"></view>
		
		<!-- 主内容区域 -->
		<view class="main-content">
			<view class="chat-header">
				<view class="header-left">
					<button class="mobile-menu-btn" @click="openSidebar" v-if="!showSidebar">☰</button>
					<button 
						class="back-btn" 
						@click="backToWelcome" 
						v-if="!showWelcome"
						title="返回主页"
					>
						←
					</button>
					<view class="chat-title-main">{{ chatTitle }}</view>
				</view>
				<view class="header-actions">
					<button class="header-btn" @click="showDocumentGenerator" title="生成文书">📄</button>
					<button class="header-btn" @click="showDocumentUpload" title="上传审核">📤</button>
					<button class="header-btn" @click="showUserMenu" title="用户中心">👤</button>
					<button class="header-btn" @click="clearChat" title="清空对话" v-if="currentChatId">🗑️</button>
					<button class="header-btn" @click="exportChat" title="导出对话" v-if="currentChatId">📤</button>
				</view>
			</view>
			
			<!-- 欢迎界面 -->
			<view class="welcome-screen" v-if="showWelcome">
				<view class="welcome-icon">⚖️</view>
				<view class="welcome-title">欢迎使用法义AI助手</view>
				<view class="welcome-subtitle">您的专业法律顾问，提供24小时智能法律咨询服务</view>
				<view class="welcome-features">
					<view class="feature-card" @click="startChat('智能法律咨询')">
						<view class="feature-icon">💬</view>
						<view class="feature-title">智能法律咨询</view>
						<view class="feature-desc">24小时在线法律问答服务</view>
					</view>
					<view class="feature-card" @click="showDocumentGenerator">
						<view class="feature-icon">📄</view>
						<view class="feature-title">法律文书生成</view>
						<view class="feature-desc">智能生成各类法律文书，支持合规性检查</view>
					</view>
					<view class="feature-card" @click="showDocumentUpload">
						<view class="feature-icon">🔍</view>
						<view class="feature-title">文书智能审核</view>
						<view class="feature-desc">上传现有文书进行合规性检查和优化建议</view>
					</view>
					<view class="feature-card" @click="startLegalChat">
						<view class="feature-icon">📖</view>
						<view class="feature-title">法律条文查询</view>
						<view class="feature-desc">快速查找相关法律条文和司法解释</view>
					</view>
				</view>
			</view>
			
			<!-- 消息区域 -->
			<scroll-view 
				class="messages-container" 
				v-if="!showWelcome"
				scroll-y 
				:scroll-top="scrollTop"
				scroll-with-animation
			>
				<view 
					v-for="message in currentMessages" 
					:key="message.id"
					class="message-group"
					:class="message.type"
				>
					<view class="avatar" :class="message.type">
						{{ message.type === 'ai' ? '⚖️' : '👤' }}
					</view>
					<view class="message-content">
						<view class="message-bubble" v-html="formatMessage(message.content)"></view>
						<view class="message-time">{{ formatTime(message.timestamp) }}</view>
					</view>
				</view>
				
				<!-- 打字指示器 -->
				<view class="message-group ai" v-if="isTyping">
					<view class="avatar ai">⚖️</view>
					<view class="message-content">
						<view class="typing-indicator">
							正在思考
							<view class="typing-dots">
								<view class="typing-dot"></view>
								<view class="typing-dot"></view>
								<view class="typing-dot"></view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
			
			<!-- 输入区域 -->
			<view class="input-area" v-if="!showWelcome">
				<view class="quick-questions">
					<view class="quick-question" @click="sendQuickQuestion('劳动合同试用期最长多久？')">劳动合同问题</view>
					<view class="quick-question" @click="sendQuickQuestion('离婚需要什么手续？')">离婚手续</view>
					<view class="quick-question" @click="sendQuickQuestion('交通事故如何处理？')">交通事故</view>
					<view class="quick-question" @click="sendQuickQuestion('查询民法典相关条文')">法律条文查询</view>
				</view>
				<view class="input-container">
					<view class="input-wrapper">
						<textarea 
							class="message-input" 
							v-model="messageInput"
							placeholder="请输入您的法律问题..."
							:auto-height="true"
							:maxlength="1000"
							@confirm="sendMessage"
						/>
					</view>
					<button class="send-button" @click="sendMessage" :disabled="!messageInput.trim() || isTyping">
						<text>➤</text>
					</button>
				</view>
			</view>
		</view>
		
		<!-- 用户菜单 -->
		<view class="user-menu" :class="{ show: showUserMenuFlag }" v-if="showUserMenuFlag">
			<view class="user-status" :class="{ 'logged-in': isLoggedIn }">
				{{ isLoggedIn ? `已登录: ${userInfo.nickname || userInfo.phone}` : '未登录' }}
			</view>
			<view class="user-menu-item" @click="handleLogin" v-if="!isLoggedIn">
				<text>🔑</text>
				<text>登录/注册</text>
			</view>
			<view class="user-menu-divider" v-if="isLoggedIn"></view>
			<view class="user-menu-item" @click="showProfile" v-if="isLoggedIn">
				<text>👤</text>
				<text>个人中心</text>
			</view>
			<view class="user-menu-item" @click="showHistory" v-if="isLoggedIn">
				<text>📚</text>
				<text>对话历史</text>
			</view>
			<view class="user-menu-item" @click="showDocuments" v-if="isLoggedIn">
				<text>📄</text>
				<text>我的文书</text>
			</view>
			<view class="user-menu-divider" v-if="isLoggedIn"></view>
			<view class="user-menu-item" @click="logout" v-if="isLoggedIn">
				<text>🚪</text>
				<text>退出登录</text>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
	name: 'Index',
	data() {
		return {
			// 界面状态
			sidebarOpen: false,
			showUserMenuFlag: false,
			showWelcome: true,
			isTyping: false,
			scrollTop: 0,
			
			// 聊天相关
			currentChatId: null,
			chatTitle: '法义AI助手',
			messageInput: '',
			chats: [],
			currentMessages: [],
			
			// API配置
			apiBase: 'http://localhost:8001'
		}
	},
	computed: {
		...mapState('user', ['isLoggedIn', 'userInfo']),
		showSidebar() {
			// 在较大屏幕上显示侧边栏
			return uni.getSystemInfoSync().windowWidth > 768
		}
	},
	onLoad() {
		this.init()
	},
	onShow() {
		this.checkLoginStatus()
	},
	methods: {
		...mapActions('user', ['checkLoginStatus', 'logout']),
		
		// 初始化
		init() {
			this.loadChats()
			this.checkLoginStatus()
		},
		
		// 创建新对话
		createNewChat() {
			const chatId = 'chat_' + Date.now()
			const newChat = {
				id: chatId,
				title: '新对话',
				messages: [],
				createTime: new Date(),
				updateTime: new Date()
			}
			
			this.chats.unshift(newChat)
			this.switchToChat(chatId)
			this.saveChats()
		},
		
		// 切换到指定对话
		switchToChat(chatId) {
			this.currentChatId = chatId
			this.showWelcome = false
			
			const chat = this.chats.find(c => c.id === chatId)
			if (chat) {
				this.chatTitle = chat.title
				this.currentMessages = chat.messages
			}
			
			this.closeSidebar()
			this.scrollToBottom()
		},
		
		// 开始聊天
		startChat(topic) {
			this.createNewChat()
			if (topic !== '智能法律咨询') {
				this.sendQuickQuestion(`我想了解${topic}相关的内容`)
			}
		},
		
		// 开始法律条文查询聊天
		startLegalChat() {
			console.log('开始法律条文查询聊天')
			this.createNewChat()
			this.chatTitle = '法律条文查询'
			
			// 发送法律条文查询的欢迎消息
			const welcomeMessage = {
				id: 'legal_welcome_' + Date.now(),
				type: 'ai',
				content: `欢迎使用法律条文查询功能！

📖 **功能介绍**：
• 快速查找相关法律条文
• 支持关键词搜索
• 提供司法解释和实施细则
• 涵盖民法典、劳动法、刑法等主要法律

🔍 **使用方法**：
请输入您要查询的法律条文关键词，例如：
• "试用期" - 查询劳动合同试用期相关条文
• "离婚" - 查询婚姻法相关条文  
• "交通事故" - 查询道路交通安全法相关条文

您也可以直接提问，我会为您查找相关的法律条文。`,
				timestamp: new Date()
			}
			
			const chat = this.chats.find(c => c.id === this.currentChatId)
			if (chat) {
				chat.messages.push(welcomeMessage)
				chat.title = '法律条文查询'
				this.currentMessages = [...chat.messages]
				this.saveChats()
			}
			
			uni.showToast({
				title: '法律条文查询',
				icon: 'success'
			})
		},
		
		// 发送消息
		async sendMessage() {
			const message = this.messageInput.trim()
			if (!message || this.isTyping) return
			
			if (!this.currentChatId) {
				this.createNewChat()
			}
			
			const chat = this.chats.find(c => c.id === this.currentChatId)
			if (!chat) return
			
			// 添加用户消息
			const userMessage = {
				id: 'msg_' + Date.now(),
				type: 'user',
				content: message,
				timestamp: new Date()
			}
			
			chat.messages.push(userMessage)
			this.currentMessages = [...chat.messages]
			
			// 更新对话标题
			if (chat.messages.filter(m => m.type === 'user').length === 1) {
				chat.title = message.length > 20 ? message.slice(0, 20) + '...' : message
				this.chatTitle = chat.title
			}
			
			chat.updateTime = new Date()
			this.messageInput = ''
			this.saveChats()
			this.scrollToBottom()
			
			// 显示打字指示器
			this.isTyping = true
			
			try {
				// 调用后端API
				const response = await uni.request({
					url: `${this.apiBase}/api/chat`,
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: { message }
				})
				
				this.isTyping = false
				
				if (response.data.success) {
					// 使用打字机效果显示AI回复
					await this.typewriterEffect(response.data.response, chat)
					
					chat.updateTime = new Date()
					this.saveChats()
					this.scrollToBottom()
				} else {
					throw new Error(response.data.message || '请求失败')
				}
				
			} catch (error) {
				this.isTyping = false
				console.error('发送消息失败:', error)
				
				const errorMessage = {
					id: 'msg_' + Date.now() + '_error',
					type: 'ai',
					content: '抱歉，服务暂时不可用，请稍后重试。',
					timestamp: new Date()
				}
				
				chat.messages.push(errorMessage)
				this.currentMessages = [...chat.messages]
				this.saveChats()
				this.scrollToBottom()
				
				uni.showToast({
					title: '发送失败',
					icon: 'none'
				})
			}
		},
		
		// 打字机效果
		async typewriterEffect(fullResponse, chat) {
			const aiMessage = {
				id: 'msg_' + Date.now() + '_ai',
				type: 'ai',
				content: '',
				timestamp: new Date()
			}
			
			chat.messages.push(aiMessage)
			this.currentMessages = [...chat.messages]
			
			// 逐字显示效果
			for (let i = 0; i <= fullResponse.length; i++) {
				aiMessage.content = fullResponse.slice(0, i)
				this.currentMessages = [...chat.messages]
				
				// 滚动到底部
				this.scrollToBottom()
				
				// 延迟
				await new Promise(resolve => setTimeout(resolve, 30))
			}
		},
		
		// 发送快速问题
		sendQuickQuestion(question) {
			this.messageInput = question
			this.sendMessage()
		},
		
		// 格式化消息内容
		formatMessage(content) {
			return content
				.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
				.replace(/\n/g, '<br>')
				.replace(/•/g, '•')
		},
		
		// 格式化时间
		formatTime(timestamp) {
			const now = new Date()
			const time = new Date(timestamp)
			const diff = now - time
			
			if (diff < 60000) return '刚刚'
			if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
			if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
			
			return time.toLocaleDateString()
		},
		
		// 获取最后一条消息
		getLastMessage(chat) {
			if (chat.messages.length === 0) return '暂无消息'
			const lastMsg = chat.messages[chat.messages.length - 1].content
			return lastMsg.length > 30 ? lastMsg.slice(0, 30) + '...' : lastMsg
		},
		
		// 返回欢迎界面
		backToWelcome() {
			this.showWelcome = true
			this.currentChatId = null
			this.chatTitle = '法义AI助手'
			this.currentMessages = []
		},
		
		// 滚动到底部
		scrollToBottom() {
			this.$nextTick(() => {
				this.scrollTop = 999999
			})
		},
		
		// 保存对话
		saveChats() {
			uni.setStorageSync('chats', this.chats)
		},
		
		// 加载对话
		loadChats() {
			try {
				const saved = uni.getStorageSync('chats')
				if (saved) {
					this.chats = saved.map(chat => ({
						...chat,
						createTime: new Date(chat.createTime),
						updateTime: new Date(chat.updateTime),
						messages: chat.messages.map(msg => ({
							...msg,
							timestamp: new Date(msg.timestamp)
						}))
					}))
				}
			} catch (error) {
				console.error('加载对话失败:', error)
			}
		},
		
		// 侧边栏控制
		openSidebar() {
			this.sidebarOpen = true
		},
		
		closeSidebar() {
			this.sidebarOpen = false
		},
		
		// 用户菜单
		showUserMenu() {
			this.showUserMenuFlag = !this.showUserMenuFlag
		},
		
		// 登录处理
		handleLogin() {
			this.showUserMenuFlag = false
			uni.navigateTo({
				url: '/pages/auth/login'
			})
		},
		
		// 清空对话
		clearChat() {
			if (this.currentChatId) {
				uni.showModal({
					title: '确认',
					content: '确定要清空当前对话吗？',
					success: (res) => {
						if (res.confirm) {
							const chat = this.chats.find(c => c.id === this.currentChatId)
							if (chat) {
								chat.messages = []
								this.currentMessages = []
								this.saveChats()
							}
						}
					}
				})
			}
		},
		
		// 导出对话
		exportChat() {
			if (this.currentChatId) {
				const chat = this.chats.find(c => c.id === this.currentChatId)
				if (chat && chat.messages.length > 0) {
					uni.showToast({
						title: '导出功能开发中',
						icon: 'none'
					})
				}
			}
		},
		
		// 功能占位符
		showDocumentGenerator() {
			uni.navigateTo({
				url: '/pages/document/generate'
			})
		},
		
		showDocumentUpload() {
			uni.showToast({
				title: '文书上传功能开发中',
				icon: 'none'
			})
		},
		
		showProfile() {
			this.showUserMenuFlag = false
			uni.navigateTo({
				url: '/pages/user/center'
			})
		},
		
		showHistory() {
			this.showUserMenuFlag = false
			uni.showToast({
				title: '对话历史功能开发中',
				icon: 'none'
			})
		},
		
		showDocuments() {
			this.showUserMenuFlag = false
			uni.navigateTo({
				url: '/pages/document/my'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.app-container {
	display: flex;
	height: 100vh;
	background: #f7f8fa;
}

/* 侧边栏 */
.sidebar {
	width: 280px;
	background: #ffffff;
	border-right: 1px solid #e8eaed;
	display: flex;
	flex-direction: column;
	transition: transform 0.3s ease;
	
	@media (max-width: 768px) {
		position: fixed;
		left: 0;
		top: 0;
		height: 100vh;
		z-index: 1000;
		transform: translateX(-100%);
		
		&.open {
			transform: translateX(0);
		}
	}
}

.sidebar-header {
	padding: 20px;
	border-bottom: 1px solid #e8eaed;
}

.logo {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 20px;
}

.logo-icon {
	width: 32px;
	height: 32px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-weight: bold;
	font-size: 16px;
}

.logo-text {
	font-size: 18px;
	font-weight: 600;
	color: #1f2937;
}

.new-chat-btn {
	width: 100%;
	padding: 12px 16px;
	background: #f3f4f6;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	color: #374151;
	font-size: 14px;
	display: flex;
	align-items: center;
	gap: 8px;
	justify-content: center;
}

.chat-list {
	flex: 1;
	padding: 16px;
}

.chat-item {
	padding: 12px 16px;
	border-radius: 8px;
	margin-bottom: 4px;
	position: relative;
	
	&:hover {
		background: #f3f4f6;
	}
	
	&.active {
		background: #e0e7ff;
		color: #3730a3;
	}
}

.chat-title {
	font-size: 14px;
	font-weight: 500;
	margin-bottom: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.chat-preview {
	font-size: 12px;
	color: #6b7280;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.chat-time {
	font-size: 11px;
	color: #9ca3af;
	position: absolute;
	top: 12px;
	right: 16px;
}

/* 遮罩层 */
.overlay {
	display: none;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	z-index: 999;
	
	&.show {
		display: block;
	}
}

/* 主内容区域 */
.main-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	background: #ffffff;
	position: relative;
}

.chat-header {
	padding: 16px 24px;
	border-bottom: 1px solid #e8eaed;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 12px;
	flex: 1;
}

.back-btn {
	width: 32px;
	height: 32px;
	border: none;
	background: #f3f4f6;
	border-radius: 8px;
	color: #6b7280;
	font-size: 18px;
	font-weight: bold;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
	
	&:hover {
		background: #e5e7eb;
		color: #374151;
	}
	
	&:active {
		transform: scale(0.95);
		background: #d1d5db;
	}
}

.mobile-menu-btn {
	display: none;
	width: 32px;
	height: 32px;
	border: none;
	background: #f3f4f6;
	border-radius: 8px;
	color: #6b7280;
	font-size: 16px;
	
	@media (max-width: 768px) {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	&:hover {
		background: #e5e7eb;
		color: #374151;
	}
}

.chat-title-main {
	font-size: 16px;
	font-weight: 600;
	color: #1f2937;
}

.header-actions {
	display: flex;
	gap: 8px;
}

.header-btn {
	padding: 8px;
	border: none;
	background: none;
	border-radius: 6px;
	color: #6b7280;
	font-size: 16px;
}

/* 欢迎界面 */
.welcome-screen {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 48px 24px;
	text-align: center;
}

.welcome-icon {
	width: 80px;
	height: 80px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 32px;
	margin-bottom: 24px;
}

.welcome-title {
	font-size: 24px;
	font-weight: 600;
	color: #1f2937;
	margin-bottom: 8px;
}

.welcome-subtitle {
	font-size: 16px;
	color: #6b7280;
	margin-bottom: 32px;
}

.welcome-features {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 16px;
	max-width: 600px;
	width: 100%;
}

.feature-card {
	padding: 20px;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	transition: all 0.2s;
	cursor: pointer;
	
	&:hover {
		background: #f1f5f9;
		border-color: #cbd5e1;
		transform: translateY(-2px);
	}
}

.feature-icon {
	font-size: 24px;
	margin-bottom: 12px;
}

.feature-title {
	font-size: 16px;
	font-weight: 600;
	color: #1f2937;
	margin-bottom: 8px;
}

.feature-desc {
	font-size: 14px;
	color: #6b7280;
	line-height: 1.4;
}

/* 消息区域 */
.messages-container {
	flex: 1;
	padding: 24px;
}

.message-group {
	display: flex;
	gap: 12px;
	margin-bottom: 24px;
	max-width: 100%;
	
	&.user {
		flex-direction: row-reverse;
	}
}

.avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
	font-weight: 600;
	
	&.ai {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}
	
	&.user {
		background: #e5e7eb;
		color: #374151;
	}
}

.message-content {
	flex: 1;
	max-width: calc(100% - 44px);
}

.message-bubble {
	padding: 12px 16px;
	border-radius: 16px;
	font-size: 14px;
	line-height: 1.5;
	word-wrap: break-word;
	
	.message-group.ai & {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		color: #1e293b;
	}
	
	.message-group.user & {
		background: #3b82f6;
		color: white;
		margin-left: auto;
	}
}

.message-time {
	font-size: 11px;
	color: #9ca3af;
	margin-top: 4px;
	text-align: right;
	
	.message-group.ai & {
		text-align: left;
	}
}

.typing-indicator {
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 12px 16px;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 16px;
	color: #64748b;
	font-size: 14px;
}

.typing-dots {
	display: flex;
	gap: 2px;
}

.typing-dot {
	width: 4px;
	height: 4px;
	background: #64748b;
	border-radius: 50%;
	animation: typing 1.4s infinite;
	
	&:nth-child(2) {
		animation-delay: 0.2s;
	}
	
	&:nth-child(3) {
		animation-delay: 0.4s;
	}
}

@keyframes typing {
	0%, 60%, 100% {
		transform: translateY(0);
		opacity: 0.4;
	}
	30% {
		transform: translateY(-8px);
		opacity: 1;
	}
}

/* 输入区域 */
.input-area {
	padding: 16px 24px;
	border-top: 1px solid #e8eaed;
	background: #ffffff;
}

.quick-questions {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 16px;
}

.quick-question {
	padding: 8px 12px;
	background: #f1f5f9;
	border: 1px solid #e2e8f0;
	border-radius: 20px;
	font-size: 13px;
	color: #475569;
	cursor: pointer;
}

.input-container {
	display: flex;
	align-items: flex-end;
	gap: 12px;
}

.input-wrapper {
	flex: 1;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
}

.message-input {
	width: 100%;
	min-height: 44px;
	padding: 12px 16px;
	border: none;
	background: transparent;
	font-size: 14px;
	line-height: 1.5;
	outline: none;
}

.send-button {
	width: 44px;
	height: 44px;
	border: none;
	background: #3b82f6;
	color: white;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	
	&:disabled {
		background: #d1d5db;
	}
}

/* 用户菜单 */
.user-menu {
	position: absolute;
	top: 60px;
	right: 20px;
	background: white;
	border: 1px solid #e8eaed;
	border-radius: 12px;
	box-shadow: 0 8px 24px rgba(0,0,0,0.12);
	padding: 8px 0;
	min-width: 200px;
	z-index: 1001;
	display: none;
	
	&.show {
		display: block;
	}
}

.user-status {
	padding: 12px 20px;
	font-size: 12px;
	color: #6b7280;
	border-bottom: 1px solid #e8eaed;
	
	&.logged-in {
		color: #059669;
	}
}

.user-menu-item {
	padding: 12px 20px;
	display: flex;
	align-items: center;
	gap: 12px;
	font-size: 14px;
	color: #374151;
	cursor: pointer;
}

.user-menu-divider {
	height: 1px;
	background: #e8eaed;
	margin: 8px 0;
}
</style>