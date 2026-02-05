<template>
	<view class="legal-articles">
		<!-- 搜索头部 -->
		<view class="search-header">
			<view class="search-container">
				<view class="search-box">
					<input 
						class="search-input" 
						type="text" 
						v-model="searchKeyword"
						placeholder="搜索法律条文..."
						@confirm="handleSearch"
					/>
					<button class="search-btn" @click="handleSearch">
						<text>🔍</text>
					</button>
				</view>
			</view>
		</view>
		
		<!-- 法律分类 -->
		<view class="categories-section">
			<view class="section-title">法律分类</view>
			<scroll-view class="categories-scroll" scroll-x>
				<view 
					v-for="category in categories" 
					:key="category.id"
					class="category-card"
					:class="{ active: selectedCategory === category.id }"
					@click="selectCategory(category)"
				>
					<view class="category-icon">{{ category.icon }}</view>
					<view class="category-info">
						<view class="category-name">{{ category.name }}</view>
						<view class="category-count">{{ category.articles_count }}条</view>
					</view>
				</view>
			</scroll-view>
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
					@click="viewArticle(article)"
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
		
		<!-- 热门条文 -->
		<view class="popular-section" v-if="searchResults.length === 0">
			<view class="section-title">热门条文</view>
			<view class="popular-list">
				<view 
					v-for="item in popularArticles" 
					:key="item.id"
					class="popular-item"
					@click="searchPopular(item.keyword)"
				>
					<view class="popular-icon">{{ item.icon }}</view>
					<view class="popular-content">
						<view class="popular-title">{{ item.title }}</view>
						<view class="popular-desc">{{ item.description }}</view>
					</view>
					<view class="popular-arrow">›</view>
				</view>
			</view>
		</view>
		
		<!-- 最近查询 -->
		<view class="recent-section" v-if="recentSearches.length > 0 && searchResults.length === 0">
			<view class="section-header">
				<view class="section-title">最近查询</view>
				<button class="clear-btn" @click="clearRecentSearches">清空</button>
			</view>
			<view class="recent-tags">
				<view 
					v-for="search in recentSearches" 
					:key="search"
					class="recent-tag"
					@click="searchKeyword = search; handleSearch()"
				>
					{{ search }}
				</view>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<uni-load-more v-if="loading" status="loading" :content-text="{ contentrefresh: '正在搜索...' }"></uni-load-more>
		
		<!-- 空状态 -->
		<view class="empty-state" v-if="!loading && searchKeyword && searchResults.length === 0">
			<view class="empty-icon">📖</view>
			<view class="empty-title">未找到相关条文</view>
			<view class="empty-desc">请尝试其他关键词或浏览分类</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'LegalArticles',
	data() {
		return {
			searchKeyword: '',
			selectedCategory: null,
			loading: false,
			searchResults: [],
			totalResults: 0,
			recentSearches: [],
			
			categories: [
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
			
			popularArticles: [
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
				}
			]
		}
	},
	
	onLoad() {
		this.loadRecentSearches()
		this.loadCategories()
	},
	
	methods: {
		async loadCategories() {
			try {
				const { get } = await import('@/utils/request.js')
				const response = await get('/api/legal-articles')
				
				if (response.success) {
					this.categories = response.data
				}
			} catch (error) {
				console.error('加载分类失败:', error)
			}
		},
		
		async handleSearch() {
			if (!this.searchKeyword.trim()) {
				uni.showToast({
					title: '请输入搜索关键词',
					icon: 'none'
				})
				return
			}
			
			this.loading = true
			
			try {
				const { post } = await import('@/utils/request.js')
				const response = await post('/api/legal-articles/search', {
					keyword: this.searchKeyword,
					category: this.selectedCategory
				})
				
				if (response.success) {
					this.searchResults = response.data.articles
					this.totalResults = response.data.total
					
					// 保存搜索历史
					this.saveRecentSearch(this.searchKeyword)
				} else {
					uni.showToast({
						title: response.message || '搜索失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('搜索失败:', error)
				uni.showToast({
					title: '搜索失败，请检查网络连接',
					icon: 'none'
				})
			} finally {
				this.loading = false
			}
		},
		
		selectCategory(category) {
			this.selectedCategory = category.id
			if (this.searchKeyword) {
				this.handleSearch()
			}
		},
		
		searchPopular(keyword) {
			this.searchKeyword = keyword
			this.handleSearch()
		},
		
		viewArticle(article) {
			// 跳转到条文详情页面或显示详情
			uni.showModal({
				title: article.title,
				content: article.content,
				showCancel: false,
				confirmText: '知道了'
			})
		},
		
		saveRecentSearch(keyword) {
			if (!this.recentSearches.includes(keyword)) {
				this.recentSearches.unshift(keyword)
				if (this.recentSearches.length > 10) {
					this.recentSearches = this.recentSearches.slice(0, 10)
				}
				uni.setStorageSync('recentSearches', this.recentSearches)
			}
		},
		
		loadRecentSearches() {
			try {
				const recent = uni.getStorageSync('recentSearches')
				if (recent) {
					this.recentSearches = recent
				}
			} catch (error) {
				console.error('加载搜索历史失败:', error)
			}
		},
		
		clearRecentSearches() {
			this.recentSearches = []
			uni.removeStorageSync('recentSearches')
		}
	}
}
</script>

<style lang="scss" scoped>
.legal-articles {
	min-height: 100vh;
	background: var(--bg-color);
}

.search-header {
	background: white;
	padding: 32rpx;
	border-bottom: 2rpx solid #f3f4f6;
}

.search-container {
	max-width: 600rpx;
	margin: 0 auto;
}

.search-box {
	display: flex;
	align-items: center;
	background: #f8fafc;
	border: 2rpx solid #e2e8f0;
	border-radius: 24rpx;
	overflow: hidden;
}

.search-input {
	flex: 1;
	padding: 24rpx 32rpx;
	border: none;
	background: transparent;
	font-size: 28rpx;
}

.search-btn {
	width: 80rpx;
	height: 80rpx;
	background: var(--primary-color);
	color: white;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
}

.categories-section {
	background: white;
	padding: 32rpx;
	margin-bottom: 16rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 700;
	color: var(--text-color);
	margin-bottom: 24rpx;
}

.categories-scroll {
	white-space: nowrap;
}

.category-card {
	display: inline-flex;
	align-items: center;
	gap: 16rpx;
	padding: 24rpx;
	background: #f8fafc;
	border: 2rpx solid #e2e8f0;
	border-radius: 16rpx;
	margin-right: 16rpx;
	min-width: 200rpx;
	transition: all 0.3s;
	
	&.active {
		background: var(--primary-color);
		border-color: var(--primary-color);
		color: white;
	}
}

.category-icon {
	font-size: 32rpx;
}

.category-name {
	font-size: 28rpx;
	font-weight: 600;
	margin-bottom: 4rpx;
}

.category-count {
	font-size: 24rpx;
	opacity: 0.8;
}

.results-section {
	background: white;
	margin-bottom: 16rpx;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx;
	border-bottom: 2rpx solid #f3f4f6;
}

.result-count {
	font-size: 24rpx;
	color: var(--text-light);
}

.articles-list {
	padding: 0 32rpx 32rpx;
}

.article-card {
	padding: 32rpx;
	border: 2rpx solid #f3f4f6;
	border-radius: 16rpx;
	margin-bottom: 16rpx;
	transition: all 0.3s;
	
	&:active {
		background: #f8fafc;
		transform: scale(0.98);
	}
}

.article-header {
	margin-bottom: 16rpx;
}

.article-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 8rpx;
}

.article-meta {
	display: flex;
	gap: 16rpx;
}

.law-name {
	font-size: 24rpx;
	color: var(--primary-color);
	background: rgba(102, 126, 234, 0.1);
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
}

.chapter {
	font-size: 24rpx;
	color: var(--text-light);
}

.article-content {
	font-size: 28rpx;
	line-height: 1.6;
	color: var(--text-color);
	margin-bottom: 16rpx;
}

.article-footer {
	text-align: right;
}

.effective-date {
	font-size: 24rpx;
	color: var(--text-light);
}

.popular-section,
.recent-section {
	background: white;
	padding: 32rpx;
	margin-bottom: 16rpx;
}

.popular-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.popular-item {
	display: flex;
	align-items: center;
	gap: 24rpx;
	padding: 24rpx;
	background: #f8fafc;
	border-radius: 16rpx;
	transition: all 0.3s;
	
	&:active {
		background: #f1f5f9;
		transform: scale(0.98);
	}
}

.popular-icon {
	width: 64rpx;
	height: 64rpx;
	background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	color: white;
}

.popular-content {
	flex: 1;
}

.popular-title {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 8rpx;
}

.popular-desc {
	font-size: 24rpx;
	color: var(--text-light);
}

.popular-arrow {
	font-size: 32rpx;
	color: #c0c4cc;
}

.clear-btn {
	padding: 8rpx 16rpx;
	background: #f3f4f6;
	color: var(--text-light);
	border: none;
	border-radius: 8rpx;
	font-size: 24rpx;
}

.recent-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.recent-tag {
	padding: 12rpx 24rpx;
	background: #f1f5f9;
	color: var(--text-color);
	border-radius: 20rpx;
	font-size: 26rpx;
	transition: all 0.3s;
	
	&:active {
		background: #e2e8f0;
	}
}

.empty-state {
	text-align: center;
	padding: 120rpx 32rpx;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 32rpx;
	opacity: 0.5;
}

.empty-title {
	font-size: 32rpx;
	color: var(--text-color);
	margin-bottom: 16rpx;
}

.empty-desc {
	font-size: 28rpx;
	color: var(--text-light);
}
</style>