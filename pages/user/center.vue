<template>
	<view class="user-center">
		<!-- 用户信息头部 -->
		<view class="user-header">
			<view v-if="isLoggedIn" class="user-info">
				<view class="user-avatar">
					<text class="avatar-text">{{ nickname.charAt(0) }}</text>
				</view>
				<view class="user-details">
					<view class="user-name">{{ nickname }}</view>
					<view class="user-phone">{{ formatPhone(phone) }}</view>
				</view>
				<button class="edit-btn" @click="editProfile">
					<text class="edit-icon">✏️</text>
				</button>
			</view>
			
			<view v-else class="login-prompt">
				<view class="prompt-icon">👤</view>
				<view class="prompt-text">登录后享受更多服务</view>
				<button class="login-btn" @click="goToLogin">立即登录</button>
			</view>
		</view>
		
		<!-- 数据统计 -->
		<view v-if="isLoggedIn" class="stats-section">
			<view class="stats-grid">
				<view class="stat-item" @click="goToMyDocuments">
					<text class="stat-number">{{ documentCount }}</text>
					<text class="stat-label">我的文书</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item" @click="goToChatList">
					<text class="stat-number">{{ conversationCount }}</text>
					<text class="stat-label">咨询记录</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-number">{{ usageDays }}</text>
					<text class="stat-label">使用天数</text>
				</view>
			</view>
		</view>
		
		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-group">
				<view class="group-title">我的服务</view>
				
				<view class="menu-item" @click="goToMyDocuments">
					<view class="item-icon">📄</view>
					<view class="item-content">
						<text class="item-title">我的文书</text>
						<text class="item-desc">查看和管理生成的文书</text>
					</view>
					<view class="item-arrow">›</view>
				</view>
				
				<view class="menu-item" @click="goToChatList">
					<view class="item-icon">💬</view>
					<view class="item-content">
						<text class="item-title">咨询记录</text>
						<text class="item-desc">查看历史法律咨询</text>
					</view>
					<view class="item-arrow">›</view>
				</view>
				
				<view class="menu-item" @click="goToFavorites">
					<view class="item-icon">⭐</view>
					<view class="item-content">
						<text class="item-title">我的收藏</text>
						<text class="item-desc">收藏的法律知识和案例</text>
					</view>
					<view class="item-arrow">›</view>
				</view>
			</view>
			
			<view class="menu-group">
				<view class="group-title">设置与帮助</view>
				
				<view class="menu-item" @click="goToSettings">
					<view class="item-icon">⚙️</view>
					<view class="item-content">
						<text class="item-title">应用设置</text>
						<text class="item-desc">个性化设置和偏好</text>
					</view>
					<view class="item-arrow">›</view>
				</view>
				
				<view class="menu-item" @click="goToHelp">
					<view class="item-icon">❓</view>
					<view class="item-content">
						<text class="item-title">帮助中心</text>
						<text class="item-desc">使用指南和常见问题</text>
					</view>
					<view class="item-arrow">›</view>
				</view>
				
				<view class="menu-item" @click="goToFeedback">
					<view class="item-icon">💌</view>
					<view class="item-content">
						<text class="item-title">意见反馈</text>
						<text class="item-desc">帮助我们改进产品</text>
					</view>
					<view class="item-arrow">›</view>
				</view>
				
				<view class="menu-item" @click="goToAbout">
					<view class="item-icon">ℹ️</view>
					<view class="item-content">
						<text class="item-title">关于我们</text>
						<text class="item-desc">了解法义AI助手</text>
					</view>
					<view class="item-arrow">›</view>
				</view>
			</view>
		</view>
		
		<!-- 退出登录 -->
		<view v-if="isLoggedIn" class="logout-section">
			<button class="logout-btn" @click="handleLogout">
				<text class="logout-icon">🚪</text>
				<text>退出登录</text>
			</button>
		</view>
		
		<!-- 版本信息 -->
		<view class="version-info">
			<text class="version-text">法义AI助手 v1.0.0</text>
			<text class="copyright-text">© 2024 Legal AI. All rights reserved.</text>
		</view>
	</view>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useUserStore } from '@/store/user'
import { useChatStore } from '@/store/chat'
import { useDocumentStore } from '@/store/document'
import { showConfirm } from '@/utils/common'

export default {
	name: 'UserCenter',
	computed: {
		...mapState(useUserStore, ['isLoggedIn', 'nickname', 'phone', 'userInfo']),
		...mapState(useChatStore, ['conversations']),
		...mapState(useDocumentStore, ['documents']),
		
		documentCount() {
			return this.documents.length
		},
		
		conversationCount() {
			return this.conversations.length
		},
		
		usageDays() {
			if (!this.userInfo?.create_time) return 0
			
			const createTime = new Date(this.userInfo.create_time)
			const now = new Date()
			const diffTime = Math.abs(now - createTime)
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
			
			return diffDays
		}
	},
	onLoad() {
		this.initPage()
	},
	
	onShow() {
		// 页面显示时刷新数据
		this.refreshData()
	},
	
	onPullDownRefresh() {
		this.refreshData().finally(() => {
			uni.stopPullDownRefresh()
		})
	},
	
	methods: {
		...mapActions(useUserStore, ['checkLoginStatus', 'logout']),
		...mapActions(useChatStore, ['getConversations']),
		...mapActions(useDocumentStore, ['getUserDocuments']),
		
		async initPage() {
			try {
				// 检查登录状态
				await this.checkLoginStatus()
				
				if (this.isLoggedIn) {
					// 获取用户数据
					await this.loadUserData()
				}
			} catch (error) {
				console.error('页面初始化失败:', error)
			}
		},
		
		async refreshData() {
			try {
				if (this.isLoggedIn) {
					await this.loadUserData()
				}
			} catch (error) {
				console.error('刷新数据失败:', error)
			}
		},
		
		async loadUserData() {
			try {
				// 并行加载数据
				await Promise.all([
					this.getConversations().catch(() => {}),
					this.getUserDocuments().catch(() => {})
				])
			} catch (error) {
				console.error('加载用户数据失败:', error)
			}
		},
		
		formatPhone(phone) {
			if (!phone) return ''
			return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
		},
		
		editProfile() {
			uni.showToast({
				title: '编辑功能开发中',
				icon: 'none'
			})
		},
		
		goToLogin() {
			uni.navigateTo({
				url: '/pages/auth/login'
			})
		},
		
		goToMyDocuments() {
			if (!this.isLoggedIn) {
				this.goToLogin()
				return
			}
			
			uni.navigateTo({
				url: '/pages/document/my'
			})
		},
		
		goToChatList() {
			if (!this.isLoggedIn) {
				this.goToLogin()
				return
			}
			
			uni.navigateTo({
				url: '/pages/chat/list'
			})
		},
		
		goToFavorites() {
			uni.showToast({
				title: '收藏功能开发中',
				icon: 'none'
			})
		},
		
		goToSettings() {
			uni.showToast({
				title: '设置功能开发中',
				icon: 'none'
			})
		},
		
		goToHelp() {
			uni.showToast({
				title: '帮助中心开发中',
				icon: 'none'
			})
		},
		
		goToFeedback() {
			uni.showToast({
				title: '反馈功能开发中',
				icon: 'none'
			})
		},
		
		goToAbout() {
			uni.showModal({
				title: '关于法义AI助手',
				content: '法义AI助手是一款专业的法律咨询和文书生成应用，致力于为用户提供便捷、准确的法律服务。\n\n版本：v1.0.0\n开发者：Legal AI Team',
				showCancel: false,
				confirmText: '知道了'
			})
		},
		
		async handleLogout() {
			const confirmed = await showConfirm('确认退出', '确定要退出登录吗？')
			
			if (confirmed) {
				this.logout()
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.user-center {
	min-height: 100vh;
	background: var(--bg-color);
}

.user-header {
	background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
	padding: 48rpx 32rpx;
	color: white;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.user-avatar {
	width: 120rpx;
	height: 120rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-text {
	font-size: 48rpx;
	font-weight: 700;
	color: white;
}

.user-details {
	flex: 1;
}

.user-name {
	font-size: 40rpx;
	font-weight: 700;
	margin-bottom: 8rpx;
}

.user-phone {
	font-size: 28rpx;
	opacity: 0.8;
}

.edit-btn {
	width: 64rpx;
	height: 64rpx;
	background: rgba(255, 255, 255, 0.2);
	border: none;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	
	&:active {
		background: rgba(255, 255, 255, 0.3);
	}
}

.edit-icon {
	font-size: 28rpx;
	color: white;
}

.login-prompt {
	text-align: center;
	padding: 40rpx 0;
}

.prompt-icon {
	font-size: 80rpx;
	margin-bottom: 24rpx;
	opacity: 0.8;
}

.prompt-text {
	font-size: 32rpx;
	margin-bottom: 32rpx;
	opacity: 0.9;
}

.login-btn {
	padding: 24rpx 48rpx;
	background: rgba(255, 255, 255, 0.2);
	color: white;
	border: 2rpx solid rgba(255, 255, 255, 0.3);
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: 600;
	
	&:active {
		background: rgba(255, 255, 255, 0.3);
	}
}

.stats-section {
	background: white;
	margin: 16rpx 32rpx;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.stats-grid {
	display: flex;
	align-items: center;
	justify-content: space-around;
}

.stat-item {
	text-align: center;
	cursor: pointer;
	transition: all 0.3s;
	
	&:active {
		transform: scale(0.95);
	}
}

.stat-number {
	display: block;
	font-size: 48rpx;
	font-weight: 700;
	color: var(--primary-color);
	margin-bottom: 8rpx;
}

.stat-label {
	font-size: 28rpx;
	color: var(--text-light);
}

.stat-divider {
	width: 2rpx;
	height: 60rpx;
	background: #f3f4f6;
}

.menu-section {
	padding: 0 32rpx;
}

.menu-group {
	background: white;
	border-radius: 24rpx;
	margin-bottom: 24rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.group-title {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-light);
	padding: 32rpx 32rpx 16rpx;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 32rpx;
	border-bottom: 2rpx solid #f8fafc;
	transition: all 0.3s;
	
	&:last-child {
		border-bottom: none;
	}
	
	&:active {
		background: #f8fafc;
	}
}

.item-icon {
	width: 80rpx;
	height: 80rpx;
	background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	margin-right: 24rpx;
}

.item-content {
	flex: 1;
}

.item-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 8rpx;
	display: block;
}

.item-desc {
	font-size: 28rpx;
	color: var(--text-light);
	display: block;
}

.item-arrow {
	font-size: 32rpx;
	color: #c0c4cc;
	margin-left: 16rpx;
}

.logout-section {
	padding: 32rpx;
}

.logout-btn {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	padding: 32rpx;
	background: white;
	border: 2rpx solid #fecaca;
	border-radius: 24rpx;
	font-size: 32rpx;
	color: var(--error-color);
	font-weight: 600;
	transition: all 0.3s;
	
	&:active {
		background: #fef2f2;
		transform: scale(0.98);
	}
}

.logout-icon {
	font-size: 28rpx;
}

.version-info {
	text-align: center;
	padding: 48rpx 32rpx;
}

.version-text {
	display: block;
	font-size: 28rpx;
	color: var(--text-light);
	margin-bottom: 8rpx;
}

.copyright-text {
	font-size: 24rpx;
	color: #c0c4cc;
}
</style>