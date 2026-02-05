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
						@click="goToWelcome" 
						v-if="currentView !== 'welcome'"
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
			<view class="welcome-screen" v-if="currentView === 'welcome'">
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
					<view class="feature-card" @click="goToLegalArticles">
						<view class="feature-icon">📖</view>
						<view class="feature-title">法律条文查询</view>
						<view class="feature-desc">快速查找相关法律条文和司法解释</view>
					</view>
				</view>
			</view>
			
			<!-- 法律条文查询界面 -->
			<view class="legal-articles-screen" v-if="currentView === 'legal-articles'">
				<view class="legal-header">
					<view class="legal-icon">📖</view>
					<view class="legal-title">法律条文查询</view>
					<view class="legal-subtitle">快速查找相关法律条文和司法解释</view>
				</view>
				
				<!-- 搜索区域 -->
				<view class="search-section">
					<view class="search-container">
						<view class="search-box">
							<input 
								class="search-input" 
								type="text" 
								v-model="searchKeyword"
								placeholder="请输入法律条文关键词..."
								@confirm="handleLegalSearch"
							/>
							<button class="search-btn" @click="handleLegalSearch">
								<text>🔍</text>
							</button>
						</view>
					</view>
				</view>
				
				<!-- 法律分类 -->
				<view class="categories-section">
					<view class="section-title">热门法律分类</view>
					<view class="categories-grid">
						<view 
							v-for="category in legalCategories" 
							:key="category.id"
							class="category-card"
							:class="{ active: selectedCategory === category.id }"
							@click="selectLegalCategory(category)"
						>
							<view class="category-icon">{{ category.icon }}</view>
							<view class="category-info">
								<view class="category-name">{{ category.name }}</view>
								<view class="category-count">{{ category.articles_count }}条</view>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 热门查询 -->
				<view class="popular-section">
					<view class="section-title">热门查询</view>
					<view class="popular-grid">
						<view 
							v-for="item in popularQueries" 
							:key="item.id"
							class="popular-card"
							@click="searchPopularQuery(item.keyword)"
						>
							<view class="popular-icon">{{ item.icon }}</view>
							<view class="popular-content">
								<view class="popular-title">{{ item.title }}</view>
								<view class="popular-desc">{{ item.description }}</view>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 搜索结果 -->
				<view class="results-section" v-if="searchResults.length > 0">
					<view class="section-header">
						<view class="section-title">搜索结果</view>
						<view class="result-count">共找到 {{ totalResults }} 条相关条文</view>
					</view>
					
					<view class="articles-list">
						<view 
							v-for="article in searchResults" 
							:key="article.id"
							class="article-card"
							@click="viewArticleDetail(article)"
						>
							<view class="article-header">
								<view class="article-title">{{ article.title }}</view>
								<view class="article-meta">
									<text class="law-name">{{ article.law_name }}</text>
									<text class="chapter">{{ article.chapter }}</text>
								</view>
							</view>
							<view class="article-content">{{ article.content }}</view>
							<view class="article-footer">
								<text class="effective-date">生效日期：{{ article.effective_date }}</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 加载状态 -->
				<view class="loading-state" v-if="isSearching">
					<view class="loading-icon">🔍</view>
					<view class="loading-text">正在搜索法律条文...</view>
				</view>
				
				<!-- 空状态 -->
				<view class="empty-state" v-if="!isSearching && searchKeyword && searchResults.length === 0">
					<view class="empty-icon">📖</view>
					<view class="empty-title">未找到相关条文</view>
					<view class="empty-desc">请尝试其他关键词或浏览分类</view>
				</view>
			</view>
			
			<!-- 消息区域 -->
			<scroll-view 
				class="messages-container" 
				v-if="currentView === 'chat'"
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
			<view class="input-area" v-if="currentView === 'chat'">
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
			currentView: 'welcome', // 'welcome', 'legal-articles', 'chat'
			isTyping: false,
			scrollTop: 0,
			
			// 聊天相关
			currentChatId: null,
			chatTitle: '法义AI助手',
			messageInput: '',
			chats: [],
			currentMessages: [],
			
			// 法律查询相关
			searchKeyword: '',
			selectedCategory: null,
			isSearching: false,
			searchResults: [],
			totalResults: 0,
			
			legalCategories: [
				{
					id: 1,
					name: '民法典',
					description: '中华人民共和国民法典',
					icon: '📖',
					articles_count: 1260
				},
				{
					id: 2,
					name: '劳动法',
					description: '中华人民共和国劳动法',
					icon: '💼',
					articles_count: 107
				},
				{
					id: 3,
					name: '刑法',
					description: '中华人民共和国刑法',
					icon: '⚖️',
					articles_count: 452
				},
				{
					id: 4,
					name: '行政法',
					description: '行政法律法规',
					icon: '🏛️',
					articles_count: 328
				}
			],
			
			popularQueries: [
				{
					id: 1,
					title: '劳动合同试用期',
					description: '试用期长度、工资、解除等规定',
					keyword: '试用期',
					icon: '💼'
				},
				{
					id: 2,
					title: '婚姻登记离婚',
					description: '结婚、离婚的法定程序',
					keyword: '离婚',
					icon: '💒'
				},
				{
					id: 3,
					title: '交通事故处理',
					description: '事故责任、赔偿标准',
					keyword: '交通事故',
					icon: '🚗'
				},
				{
					id: 4,
					title: '房屋买卖租赁',
					description: '房产交易、租赁合同',
					keyword: '房屋',
					icon: '🏠'
				},
				{
					id: 5,
					title: '合同纠纷处理',
					description: '合同违约、解除、赔偿',
					keyword: '合同',
					icon: '📄'
				},
				{
					id: 6,
					title: '知识产权保护',
					description: '专利、商标、著作权',
					keyword: '知识产权',
					icon: '💡'
				}
			],
			
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
		
		// 跳转到法律条文查询页面 - 主要方法
		goToLegalArticles() {
			console.log('=== 跳转到法律条文查询 ===');
			console.log('当前视图:', this.currentView);
			
			// 设置当前视图
			this.currentView = 'legal-articles';
			this.showWelcome = false;
			this.chatTitle = '法律条文查询';
			
			// 清理聊天相关状态
			this.currentChatId = null;
			this.currentMessages = [];
			this.isTyping = false;
			
			// 重置搜索状态
			this.searchResults = [];
			this.searchKeyword = '';
			this.selectedCategory = null;
			this.isSearching = false;
			
			console.log('跳转完成，当前视图:', this.currentView);
			
			uni.showToast({
				title: '法律条文查询',
				icon: 'success',
				duration: 1000
			});
		},
		
		// 返回欢迎界面
		goToWelcome() {
			console.log('返回欢迎界面');
			this.currentView = 'welcome';
			this.showWelcome = true;
			this.chatTitle = '法义AI助手';
			this.currentChatId = null;
			this.currentMessages = [];
			this.searchResults = [];
			this.searchKeyword = '';
			this.selectedCategory = null;
		},
		
		// 开始聊天
		startChat(topic) {
			console.log('=== startChat 被调用 ===');
			console.log('topic:', topic);
			
			this.currentView = 'chat';
			this.showWelcome = false;
			this.createNewChat();
			if (topic !== '智能法律咨询') {
				this.sendQuickQuestion(`我想了解${topic}相关的内容`);
			}
		},
		
		// 法律条文搜索
		async handleLegalSearch() {
			if (!this.searchKeyword.trim()) {
				uni.showToast({
					title: '请输入搜索关键词',
					icon: 'none'
				});
				return;
			}
			
			this.isSearching = true;
			
			try {
				const response = await uni.request({
					url: `${this.apiBase}/api/legal-articles/search`,
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						keyword: this.searchKeyword,
						category: this.selectedCategory
					}
				});
				
				if (response.data.success) {
					this.searchResults = response.data.data.articles;
					this.totalResults = response.data.data.total;
					
					if (this.searchResults.length === 0) {
						uni.showToast({
							title: '未找到相关条文',
							icon: 'none'
						});
					}
				} else {
					throw new Error(response.data.message || '搜索失败');
				}
			} catch (error) {
				console.error('搜索失败:', error);
				uni.showToast({
					title: '搜索失败，请重试',
					icon: 'none'
				});
			} finally {
				this.isSearching = false;
			}
		},
		
		// 选择法律分类
		selectLegalCategory(category) {
			if (this.selectedCategory === category.id) {
				this.selectedCategory = null;
			} else {
				this.selectedCategory = category.id;
			}
			
			if (this.searchKeyword) {
				this.handleLegalSearch();
			}
		},
		
		// 搜索热门查询
		searchPopularQuery(keyword) {
			this.searchKeyword = keyword;
			this.handleLegalSearch();
		},
		
		// 查看条文详情
		viewArticleDetail(article) {
			uni.showModal({
				title: article.title,
				content: `${article.content}\n\n法律名称：${article.law_name}\n章节：${article.chapter}\n生效日期：${article.effective_date}`,
				showCancel: false,
				confirmText: '知道了'
			});
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
			this.currentChatId = chatId;
			this.currentView = 'chat';
			this.showWelcome = false;
			
			const chat = this.chats.find(c => c.id === chatId);
			if (chat) {
				this.chatTitle = chat.title;
				this.currentMessages = chat.messages;
			}
			
			this.closeSidebar();
			this.scrollToBottom();
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

/* 法律条文查询界面样式 */
.legal-articles-screen {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 24px;
	overflow-y: auto;
}

.legal-header {
	text-align: center;
	margin-bottom: 32px;
}

.legal-icon {
	width: 80px;
	height: 80px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 32px;
	margin: 0 auto 24px;
}

.legal-title {
	font-size: 24px;
	font-weight: 600;
	color: #1f2937;
	margin-bottom: 8px;
}

.legal-subtitle {
	font-size: 16px;
	color: #6b7280;
}

.search-section {
	margin-bottom: 32px;
}

.search-container {
	max-width: 600px;
	margin: 0 auto;
}

.search-box {
	display: flex;
	align-items: center;
	background: #f8fafc;
	border: 2px solid #e2e8f0;
	border-radius: 24px;
	overflow: hidden;
	transition: border-color 0.3s;
}

.search-box:focus-within {
	border-color: #667eea;
}

.search-input {
	flex: 1;
	padding: 16px 24px;
	border: none;
	background: transparent;
	font-size: 16px;
	outline: none;
}

.search-btn {
	width: 56px;
	height: 56px;
	background: #667eea;
	color: white;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	transition: background 0.3s;
}

.search-btn:hover {
	background: #5a6fd8;
}

.categories-section,
.popular-section,
.results-section {
	margin-bottom: 32px;
}

.section-title {
	font-size: 20px;
	font-weight: 600;
	color: #1f2937;
	margin-bottom: 16px;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.result-count {
	font-size: 14px;
	color: #6b7280;
}

.categories-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 16px;
}

.category-card {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 20px;
	background: #f8fafc;
	border: 2px solid #e2e8f0;
	border-radius: 16px;
	cursor: pointer;
	transition: all 0.3s;
}

.category-card:hover {
	background: #f1f5f9;
	border-color: #cbd5e1;
	transform: translateY(-2px);
}

.category-card.active {
	background: #667eea;
	border-color: #667eea;
	color: white;
}

.category-icon {
	width: 48px;
	height: 48px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	color: white;
}

.category-card.active .category-icon {
	background: rgba(255, 255, 255, 0.2);
}

.category-name {
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 4px;
}

.category-count {
	font-size: 14px;
	opacity: 0.8;
}

.popular-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 16px;
}

.popular-card {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 20px;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 16px;
	cursor: pointer;
	transition: all 0.3s;
}

.popular-card:hover {
	background: #f1f5f9;
	border-color: #cbd5e1;
	transform: translateY(-2px);
}

.popular-icon {
	width: 48px;
	height: 48px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	color: white;
	flex-shrink: 0;
}

.popular-title {
	font-size: 16px;
	font-weight: 600;
	color: #1f2937;
	margin-bottom: 4px;
}

.popular-desc {
	font-size: 14px;
	color: #6b7280;
	line-height: 1.4;
}

.articles-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.article-card {
	padding: 24px;
	background: white;
	border: 1px solid #e2e8f0;
	border-radius: 16px;
	cursor: pointer;
	transition: all 0.3s;
}

.article-card:hover {
	border-color: #cbd5e1;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	transform: translateY(-2px);
}

.article-header {
	margin-bottom: 12px;
}

.article-title {
	font-size: 18px;
	font-weight: 600;
	color: #1f2937;
	margin-bottom: 8px;
}

.article-meta {
	display: flex;
	gap: 12px;
	flex-wrap: wrap;
}

.law-name {
	font-size: 12px;
	color: #667eea;
	background: rgba(102, 126, 234, 0.1);
	padding: 4px 8px;
	border-radius: 8px;
}

.chapter {
	font-size: 12px;
	color: #6b7280;
}

.article-content {
	font-size: 14px;
	line-height: 1.6;
	color: #374151;
	margin-bottom: 12px;
}

.article-footer {
	text-align: right;
}

.effective-date {
	font-size: 12px;
	color: #9ca3af;
}

.loading-state,
.empty-state {
	text-align: center;
	padding: 60px 24px;
}

.loading-icon,
.empty-icon {
	font-size: 48px;
	margin-bottom: 16px;
	opacity: 0.6;
}

.loading-text,
.empty-title {
	font-size: 18px;
	color: #374151;
	margin-bottom: 8px;
}

.empty-desc {
	font-size: 14px;
	color: #6b7280;
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
}

.user-menu-divider {
	height: 1px;
	background: #e8eaed;
	margin: 8px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
	.legal-articles-screen {
		padding: 16px;
	}
	
	.legal-icon {
		width: 60px;
		height: 60px;
		font-size: 24px;
	}
	
	.legal-title {
		font-size: 20px;
	}
	
	.categories-grid,
	.popular-grid {
		grid-template-columns: 1fr;
	}
	
	.search-input {
		padding: 12px 16px;
		font-size: 14px;
	}
	
	.search-btn {
		width: 48px;
		height: 48px;
	}
}
</style>