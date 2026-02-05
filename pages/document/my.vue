<template>
	<view class="my-documents">
		<!-- 页面头部 -->
		<view class="page-header">
			<view class="header-content">
				<view class="header-title">我的文书</view>
				<view class="header-subtitle">管理您生成的所有法律文书</view>
			</view>
			<view class="header-stats">
				<view class="stat-item">
					<text class="stat-number">{{ documents.length }}</text>
					<text class="stat-label">总文书</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-number">{{ recentCount }}</text>
					<text class="stat-label">本月新增</text>
				</view>
			</view>
		</view>
		
		<!-- 搜索和筛选 -->
		<view class="search-section">
			<view class="search-bar">
				<view class="search-input-wrapper">
					<text class="search-icon">🔍</text>
					<input 
						class="search-input"
						type="text"
						placeholder="搜索文书名称或类型"
						v-model="searchKeyword"
						@input="handleSearch"
					/>
					<text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
				</view>
			</view>
			
			<scroll-view class="filter-tabs" scroll-x>
				<view 
					v-for="filter in filters" 
					:key="filter.key"
					class="filter-tab"
					:class="{ 'active': currentFilter === filter.key }"
					@click="switchFilter(filter.key)"
				>
					{{ filter.name }}
				</view>
			</scroll-view>
		</view>
		
		<!-- 文书列表 -->
		<view class="documents-section">
			<view v-if="filteredDocuments.length > 0" class="documents-list">
				<view 
					v-for="document in filteredDocuments" 
					:key="document.id"
					class="document-item"
					@click="previewDocument(document)"
				>
					<view class="document-icon">
						{{ getDocumentIcon(document.template_name) }}
					</view>
					
					<view class="document-content">
						<view class="document-title">{{ document.name }}</view>
						<view class="document-meta">
							<text class="meta-type">{{ document.template_name }}</text>
							<text class="meta-divider">|</text>
							<text class="meta-time">{{ formatTime(document.create_time) }}</text>
						</view>
						<view class="document-preview">
							{{ getDocumentPreview(document.content) }}
						</view>
					</view>
					
					<view class="document-actions">
						<button class="action-btn" @click.stop="shareDocument(document)">
							<text class="action-icon">📤</text>
						</button>
						<button class="action-btn" @click.stop="showDocumentMenu(document)">
							<text class="action-icon">⋯</text>
						</button>
					</view>
				</view>
			</view>
			
			<!-- 空状态 -->
			<view v-else class="empty-state">
				<view class="empty-icon">📄</view>
				<view class="empty-title">{{ getEmptyTitle() }}</view>
				<view class="empty-subtitle">{{ getEmptySubtitle() }}</view>
				<button class="empty-btn" @click="goToGenerate">
					<text class="btn-icon">➕</text>
					<text>生成文书</text>
				</button>
			</view>
		</view>
		
		<!-- 文书操作菜单 */
		<uni-popup ref="documentMenu" type="bottom">
			<view class="document-menu">
				<view class="menu-header">
					<text class="menu-title">{{ selectedDocument?.name }}</text>
					<button class="menu-close" @click="closeDocumentMenu">✕</button>
				</view>
				
				<view class="menu-items">
					<view class="menu-item" @click="previewDocument(selectedDocument)">
						<text class="item-icon">👁️</text>
						<text class="item-text">预览文书</text>
					</view>
					
					<view class="menu-item" @click="shareDocument(selectedDocument)">
						<text class="item-icon">📤</text>
						<text class="item-text">分享文书</text>
					</view>
					
					<view class="menu-item" @click="downloadDocument(selectedDocument)">
						<text class="item-icon">📥</text>
						<text class="item-text">下载文档</text>
					</view>
					
					<view class="menu-item" @click="copyDocument(selectedDocument)">
						<text class="item-icon">📋</text>
						<text class="item-text">复制内容</text>
					</view>
					
					<view class="menu-divider"></view>
					
					<view class="menu-item danger" @click="deleteDocument(selectedDocument)">
						<text class="item-icon">🗑️</text>
						<text class="item-text">删除文书</text>
					</view>
				</view>
			</view>
		</uni-popup>
		
		<!-- 加载状态 -->
		<uni-load-more v-if="loading" status="loading"></uni-load-more>
	</view>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useDocumentStore } from '@/store/document'
import { useUserStore } from '@/store/user'
import { formatRelativeTime, copyToClipboard, showConfirm } from '@/utils/common'

export default {
	name: 'MyDocuments',
	data() {
		return {
			searchKeyword: '',
			currentFilter: 'all',
			selectedDocument: null,
			filters: [
				{ key: 'all', name: '全部' },
				{ key: 'contract', name: '合同' },
				{ key: 'agreement', name: '协议' },
				{ key: 'lawsuit', name: '诉状' },
				{ key: 'receipt', name: '凭证' }
			]
		}
	},
	computed: {
		...mapState(useDocumentStore, ['documents', 'loading']),
		...mapState(useUserStore, ['isLoggedIn']),
		
		filteredDocuments() {
			let filtered = this.documents
			
			// 按类型筛选
			if (this.currentFilter !== 'all') {
				filtered = filtered.filter(doc => {
					const templateName = doc.template_name?.toLowerCase() || ''
					return templateName.includes(this.getFilterKeyword(this.currentFilter))
				})
			}
			
			// 按关键词搜索
			if (this.searchKeyword) {
				const keyword = this.searchKeyword.toLowerCase()
				filtered = filtered.filter(doc => {
					return doc.name?.toLowerCase().includes(keyword) ||
						   doc.template_name?.toLowerCase().includes(keyword) ||
						   doc.content?.toLowerCase().includes(keyword)
				})
			}
			
			// 按创建时间倒序排列
			return filtered.sort((a, b) => new Date(b.create_time) - new Date(a.create_time))
		},
		
		recentCount() {
			const oneMonthAgo = new Date()
			oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
			
			return this.documents.filter(doc => {
				return new Date(doc.create_time) > oneMonthAgo
			}).length
		}
	},
	onLoad() {
		this.initPage()
	},
	
	onShow() {
		// 页面显示时刷新数据
		if (this.isLoggedIn) {
			this.getUserDocuments()
		}
	},
	
	onPullDownRefresh() {
		this.refreshData().finally(() => {
			uni.stopPullDownRefresh()
		})
	},
	
	methods: {
		...mapActions(useDocumentStore, ['getUserDocuments', 'deleteDocument']),
		...mapActions(useUserStore, ['checkLoginStatus']),
		
		async initPage() {
			try {
				// 检查登录状态
				await this.checkLoginStatus()
				
				if (!this.isLoggedIn) {
					this.goToLogin()
					return
				}
				
				// 获取用户文书
				await this.getUserDocuments()
			} catch (error) {
				console.error('页面初始化失败:', error)
			}
		},
		
		async refreshData() {
			try {
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
		
		handleSearch() {
			// 搜索防抖处理
			clearTimeout(this.searchTimer)
			this.searchTimer = setTimeout(() => {
				// 搜索逻辑在computed中处理
			}, 300)
		},
		
		clearSearch() {
			this.searchKeyword = ''
		},
		
		switchFilter(filterKey) {
			this.currentFilter = filterKey
		},
		
		getFilterKeyword(filterKey) {
			const keywordMap = {
				'contract': '合同',
				'agreement': '协议',
				'lawsuit': '诉状',
				'receipt': '凭证'
			}
			return keywordMap[filterKey] || ''
		},
		
		getDocumentIcon(templateName) {
			if (!templateName) return '📄'
			
			const name = templateName.toLowerCase()
			if (name.includes('合同')) return '📝'
			if (name.includes('协议')) return '🤝'
			if (name.includes('诉状')) return '⚖️'
			if (name.includes('借条') || name.includes('凭证')) return '📋'
			return '📄'
		},
		
		getDocumentPreview(content) {
			if (!content) return '暂无内容'
			return content.length > 100 ? content.substring(0, 100) + '...' : content
		},
		
		getEmptyTitle() {
			if (this.searchKeyword) return '未找到相关文书'
			if (this.currentFilter !== 'all') return '暂无此类型文书'
			return '暂无文书'
		},
		
		getEmptySubtitle() {
			if (this.searchKeyword) return '尝试使用其他关键词搜索'
			if (this.currentFilter !== 'all') return '您还没有生成过此类型的文书'
			return '开始生成您的第一份法律文书'
		},
		
		previewDocument(document) {
			if (!document) return
			
			uni.navigateTo({
				url: `/pages/document/preview?id=${document.id}`
			})
		},
		
		shareDocument(document) {
			if (!document) return
			
			// 分享逻辑
			uni.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			})
		},
		
		async downloadDocument(document) {
			if (!document) return
			
			// 下载逻辑
			uni.showToast({
				title: '下载功能开发中',
				icon: 'none'
			})
		},
		
		async copyDocument(document) {
			if (!document) return
			
			try {
				await copyToClipboard(document.content)
				this.closeDocumentMenu()
			} catch (error) {
				uni.showToast({
					title: '复制失败',
					icon: 'none'
				})
			}
		},
		
		async deleteDocument(document) {
			if (!document) return
			
			const confirmed = await showConfirm('确认删除', `确定要删除文书"${document.name}"吗？删除后无法恢复。`)
			
			if (confirmed) {
				try {
					this.deleteDocument(document.id)
					this.closeDocumentMenu()
				} catch (error) {
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					})
				}
			}
		},
		
		showDocumentMenu(document) {
			this.selectedDocument = document
			this.$refs.documentMenu.open()
		},
		
		closeDocumentMenu() {
			this.$refs.documentMenu.close()
			this.selectedDocument = null
		},
		
		goToGenerate() {
			uni.navigateTo({
				url: '/pages/document/generate'
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
.my-documents {
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

.search-section {
	background: white;
	padding: 32rpx;
	margin-bottom: 16rpx;
}

.search-bar {
	margin-bottom: 24rpx;
}

.search-input-wrapper {
	display: flex;
	align-items: center;
	background: #f8fafc;
	border: 2rpx solid #e2e8f0;
	border-radius: 16rpx;
	padding: 0 24rpx;
	transition: all 0.3s;
	
	&:focus-within {
		border-color: var(--primary-color);
		box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
	}
}

.search-icon {
	font-size: 32rpx;
	color: var(--text-light);
	margin-right: 16rpx;
}

.search-input {
	flex: 1;
	padding: 24rpx 0;
	font-size: 32rpx;
	background: transparent;
	border: none;
	outline: none;
	
	&::placeholder {
		color: #9ca3af;
	}
}

.clear-icon {
	font-size: 28rpx;
	color: var(--text-light);
	padding: 8rpx;
	margin-left: 16rpx;
}

.filter-tabs {
	white-space: nowrap;
}

.filter-tab {
	display: inline-block;
	padding: 16rpx 24rpx;
	background: #f8fafc;
	border: 2rpx solid #e2e8f0;
	border-radius: 40rpx;
	font-size: 28rpx;
	color: var(--text-color);
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

.documents-section {
	background: white;
	padding: 32rpx;
}

.documents-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.document-item {
	display: flex;
	align-items: flex-start;
	padding: 32rpx;
	background: #f8fafc;
	border-radius: 24rpx;
	border: 2rpx solid #e2e8f0;
	transition: all 0.3s;
	
	&:active {
		background: #f1f5f9;
		border-color: #cbd5e1;
		transform: scale(0.98);
	}
}

.document-icon {
	width: 80rpx;
	height: 80rpx;
	background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	margin-right: 24rpx;
	flex-shrink: 0;
}

.document-content {
	flex: 1;
	min-width: 0;
}

.document-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 8rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.document-meta {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 12rpx;
}

.meta-type,
.meta-time {
	font-size: 24rpx;
	color: var(--text-light);
}

.meta-divider {
	font-size: 20rpx;
	color: #e5e7eb;
}

.document-preview {
	font-size: 28rpx;
	color: var(--text-light);
	line-height: 1.5;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.document-actions {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	margin-left: 16rpx;
}

.action-btn {
	width: 64rpx;
	height: 64rpx;
	background: white;
	border: 2rpx solid #e2e8f0;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s;
	
	&:active {
		background: #f3f4f6;
		transform: scale(0.95);
	}
}

.action-icon {
	font-size: 24rpx;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 32rpx;
	text-align: center;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 32rpx;
	opacity: 0.5;
}

.empty-title {
	font-size: 36rpx;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 16rpx;
}

.empty-subtitle {
	font-size: 28rpx;
	color: var(--text-light);
	line-height: 1.5;
	margin-bottom: 48rpx;
}

.empty-btn {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 24rpx 48rpx;
	background: var(--primary-color);
	color: white;
	border: none;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: 600;
	
	&:active {
		background: var(--primary-light);
	}
}

.btn-icon {
	font-size: 28rpx;
}

.document-menu {
	background: white;
	border-radius: 32rpx 32rpx 0 0;
	padding-bottom: env(safe-area-inset-bottom);
}

.menu-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx;
	border-bottom: 2rpx solid #f3f4f6;
}

.menu-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-color);
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-right: 16rpx;
}

.menu-close {
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	background: #f3f4f6;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	color: var(--text-light);
}

.menu-items {
	padding: 16rpx 0;
}

.menu-item {
	display: flex;
	align-items: center;
	gap: 24rpx;
	padding: 32rpx;
	transition: all 0.3s;
	
	&:active {
		background: #f8fafc;
	}
	
	&.danger {
		.item-text {
			color: var(--error-color);
		}
	}
}

.item-icon {
	font-size: 32rpx;
	width: 48rpx;
	text-align: center;
}

.item-text {
	font-size: 32rpx;
	color: var(--text-color);
}

.menu-divider {
	height: 2rpx;
	background: #f3f4f6;
	margin: 16rpx 32rpx;
}
</style>