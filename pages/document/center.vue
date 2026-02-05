<template>
	<view class="document-center">
		<!-- 页面头部 -->
		<view class="page-header">
			<view class="header-content">
				<view class="header-title">文书中心</view>
				<view class="header-subtitle">智能生成各类法律文书，专业可靠</view>
			</view>
			<view class="header-stats">
				<view class="stat-item">
					<text class="stat-number">{{ templateCount }}</text>
					<text class="stat-label">模板</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-number">{{ documentCount }}</text>
					<text class="stat-label">我的文书</text>
				</view>
			</view>
		</view>
		
		<!-- 功能导航 -->
		<view class="function-nav">
			<view class="nav-item" @click="goToGenerate">
				<view class="nav-icon">📝</view>
				<view class="nav-content">
					<view class="nav-title">生成文书</view>
					<view class="nav-desc">选择模板快速生成</view>
				</view>
				<view class="nav-arrow">›</view>
			</view>
			
			<view class="nav-item" @click="goToMyDocuments">
				<view class="nav-icon">📄</view>
				<view class="nav-content">
					<view class="nav-title">我的文书</view>
					<view class="nav-desc">查看已生成的文书</view>
				</view>
				<view class="nav-arrow">›</view>
			</view>
		</view>
		
		<!-- 模板分类 -->
		<view class="template-section">
			<view class="section-header">
				<view class="section-title">文书模板</view>
				<view class="section-subtitle">选择适合的模板开始生成</view>
			</view>
			
			<!-- 分类标签 -->
			<scroll-view class="category-tabs" scroll-x>
				<view 
					v-for="category in categories" 
					:key="category.key"
					class="category-tab"
					:class="{ 'active': currentCategory === category.key }"
					@click="switchCategory(category.key)"
				>
					<text class="tab-icon">{{ category.icon }}</text>
					<text class="tab-text">{{ category.name }}</text>
				</view>
			</scroll-view>
			
			<!-- 模板列表 -->
			<view class="template-grid">
				<TemplateCard
					v-for="template in filteredTemplates"
					:key="template.id"
					:template="template"
					@select="selectTemplate"
				/>
			</view>
			
			<!-- 空状态 -->
			<view v-if="filteredTemplates.length === 0" class="empty-state">
				<view class="empty-icon">📋</view>
				<view class="empty-text">暂无该分类的模板</view>
			</view>
		</view>
		
		<!-- 最近使用 -->
		<view v-if="recentDocuments.length > 0" class="recent-section">
			<view class="section-header">
				<view class="section-title">最近生成</view>
				<text class="section-more" @click="goToMyDocuments">查看全部</text>
			</view>
			
			<scroll-view class="recent-list" scroll-x>
				<view 
					v-for="doc in recentDocuments" 
					:key="doc.id"
					class="recent-item"
					@click="previewDocument(doc)"
				>
					<view class="recent-icon">📄</view>
					<view class="recent-content">
						<view class="recent-title">{{ doc.name }}</view>
						<view class="recent-time">{{ formatTime(doc.create_time) }}</view>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 加载状态 -->
		<uni-load-more v-if="loading" status="loading"></uni-load-more>
	</view>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useDocumentStore } from '@/store/document'
import { useUserStore } from '@/store/user'
import { formatRelativeTime } from '@/utils/common'
import TemplateCard from '@/components/TemplateCard.vue'

export default {
	name: 'DocumentCenter',
	components: {
		TemplateCard
	},
	data() {
		return {
			currentCategory: 'all',
			categories: [
				{ key: 'all', name: '全部', icon: '📋' },
				{ key: 'contract', name: '合同', icon: '📝' },
				{ key: 'agreement', name: '协议', icon: '🤝' },
				{ key: 'lawsuit', name: '诉状', icon: '⚖️' },
				{ key: 'receipt', name: '凭证', icon: '📄' }
			]
		}
	},
	computed: {
		...mapState(useDocumentStore, ['templates', 'documents', 'loading']),
		...mapState(useUserStore, ['isLoggedIn']),
		
		templateCount() {
			return this.templates.length
		},
		
		documentCount() {
			return this.documents.length
		},
		
		filteredTemplates() {
			if (this.currentCategory === 'all') {
				return this.templates
			}
			return this.templates.filter(template => template.type === this.currentCategory)
		},
		
		recentDocuments() {
			return this.documents.slice(0, 5)
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
		...mapActions(useDocumentStore, ['getTemplates', 'getUserDocuments', 'selectTemplate']),
		...mapActions(useUserStore, ['checkLoginStatus']),
		
		async initPage() {
			try {
				// 检查登录状态
				await this.checkLoginStatus()
				
				// 获取模板列表
				await this.getTemplates()
				
				// 如果已登录，获取用户文书
				if (this.isLoggedIn) {
					await this.getUserDocuments()
				}
			} catch (error) {
				console.error('页面初始化失败:', error)
			}
		},
		
		async refreshData() {
			try {
				await this.getTemplates()
				
				if (this.isLoggedIn) {
					await this.getUserDocuments()
				}
				
				uni.showToast({
					title: '刷新成功',
					icon: 'success'
				})
			} catch (error) {
				uni.showToast({
					title: '刷新失败',
					icon: 'none'
				})
			}
		},
		
		switchCategory(category) {
			this.currentCategory = category
		},
		
		selectTemplate(template) {
			if (!this.isLoggedIn) {
				this.goToLogin()
				return
			}
			
			// 选择模板并跳转到生成页面
			this.selectTemplate(template)
			this.goToGenerate()
		},
		
		goToGenerate() {
			if (!this.isLoggedIn) {
				this.goToLogin()
				return
			}
			
			uni.navigateTo({
				url: '/pages/document/generate'
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
		
		previewDocument(document) {
			uni.navigateTo({
				url: `/pages/document/preview?id=${document.id}`
			})
		},
		
		goToLogin() {
			uni.navigateTo({
				url: '/pages/auth/login'
			})
		},
		
		formatTime(time) {
			return formatRelativeTime(time)
		}
	}
}
</script>

<style lang="scss" scoped>
.document-center {
	min-height: 100vh;
	background: var(--bg-color);
}

.page-header {
	background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
	padding: 48rpx 32rpx;
	color: white;
}

.header-content {
	margin-bottom: 32rpx;
}

.header-title {
	font-size: 48rpx;
	font-weight: 700;
	margin-bottom: 8rpx;
}

.header-subtitle {
	font-size: 28rpx;
	opacity: 0.9;
}

.header-stats {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 48rpx;
}

.stat-item {
	text-align: center;
}

.stat-number {
	display: block;
	font-size: 40rpx;
	font-weight: 700;
	margin-bottom: 8rpx;
}

.stat-label {
	font-size: 24rpx;
	opacity: 0.8;
}

.stat-divider {
	width: 2rpx;
	height: 60rpx;
	background: rgba(255, 255, 255, 0.3);
}

.function-nav {
	padding: 32rpx;
	background: white;
	margin-bottom: 16rpx;
}

.nav-item {
	display: flex;
	align-items: center;
	padding: 32rpx;
	background: #f8fafc;
	border-radius: 24rpx;
	margin-bottom: 16rpx;
	transition: all 0.3s;
	
	&:last-child {
		margin-bottom: 0;
	}
	
	&:active {
		background: #f1f5f9;
		transform: scale(0.98);
	}
}

.nav-icon {
	width: 80rpx;
	height: 80rpx;
	background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	margin-right: 24rpx;
}

.nav-content {
	flex: 1;
}

.nav-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 8rpx;
}

.nav-desc {
	font-size: 28rpx;
	color: var(--text-light);
}

.nav-arrow {
	font-size: 32rpx;
	color: #c0c4cc;
}

.template-section {
	background: white;
	padding: 32rpx;
	margin-bottom: 16rpx;
}

.section-header {
	margin-bottom: 32rpx;
}

.section-title {
	font-size: 36rpx;
	font-weight: 700;
	color: var(--text-color);
	margin-bottom: 8rpx;
}

.section-subtitle {
	font-size: 28rpx;
	color: var(--text-light);
}

.section-more {
	font-size: 28rpx;
	color: var(--primary-color);
}

.category-tabs {
	margin-bottom: 32rpx;
	white-space: nowrap;
}

.category-tab {
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
	padding: 16rpx 24rpx;
	background: #f8fafc;
	border: 2rpx solid #e2e8f0;
	border-radius: 40rpx;
	margin-right: 16rpx;
	transition: all 0.3s;
	
	&.active {
		background: var(--primary-color);
		border-color: var(--primary-color);
		color: white;
	}
	
	&:active {
		transform: scale(0.98);
	}
}

.tab-icon {
	font-size: 24rpx;
}

.tab-text {
	font-size: 28rpx;
	font-weight: 500;
}

.template-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300rpx, 1fr));
	gap: 24rpx;
}

.empty-state {
	text-align: center;
	padding: 80rpx 32rpx;
}

.empty-icon {
	font-size: 80rpx;
	margin-bottom: 24rpx;
	opacity: 0.5;
}

.empty-text {
	font-size: 32rpx;
	color: var(--text-light);
}

.recent-section {
	background: white;
	padding: 32rpx;
}

.recent-list {
	white-space: nowrap;
}

.recent-item {
	display: inline-flex;
	align-items: center;
	width: 280rpx;
	padding: 24rpx;
	background: #f8fafc;
	border-radius: 16rpx;
	margin-right: 16rpx;
	transition: all 0.3s;
	
	&:active {
		background: #f1f5f9;
		transform: scale(0.98);
	}
}

.recent-icon {
	width: 64rpx;
	height: 64rpx;
	background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	margin-right: 16rpx;
	flex-shrink: 0;
}

.recent-content {
	flex: 1;
	min-width: 0;
}

.recent-title {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 8rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.recent-time {
	font-size: 24rpx;
	color: var(--text-light);
}
</style>