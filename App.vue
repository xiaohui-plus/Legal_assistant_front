<template>
	<view id="app">
		<!-- 全局加载提示 -->
		<uni-load-more v-if="globalLoading" status="loading" :content-text="loadingText"></uni-load-more>
	</view>
</template>

<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/store/user'

export default {
	name: 'App',
	data() {
		return {
			globalLoading: false,
			loadingText: {
				contentdown: '上拉显示更多',
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了'
			}
		}
	},
	computed: {
		...mapState(useUserStore, ['isLoggedIn', 'userInfo'])
	},
	onLaunch: function() {
		console.log('App Launch')
		this.initApp()
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	},
	methods: {
		async initApp() {
			// 初始化应用
			try {
				// 检查登录状态
				const userStore = useUserStore()
				await userStore.checkLoginStatus()
				
				// 检查网络状态
				this.checkNetworkStatus()
				
			} catch (error) {
				console.error('应用初始化失败:', error)
			}
		},
		
		checkNetworkStatus() {
			uni.getNetworkType({
				success: (res) => {
					if (res.networkType === 'none') {
						uni.showToast({
							title: '网络连接失败',
							icon: 'none'
						})
					}
				}
			})
		}
	}
}
</script>

<style lang="scss">
/* 全局样式 */
@import '@/static/css/common.scss';

/* 应用主题色 */
:root {
	--primary-color: #667eea;
	--primary-light: #764ba2;
	--success-color: #07c160;
	--warning-color: #ff976a;
	--error-color: #ee0a24;
	--text-color: #1f2937;
	--text-light: #6b7280;
	--border-color: #e8eaed;
	--bg-color: #f7f8fa;
}

/* 全局字体 */
page {
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
	background-color: var(--bg-color);
	color: var(--text-color);
}

/* 全局容器 */
.container {
	padding: 0 32rpx;
}

/* 全局按钮样式 */
.btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24rpx 48rpx;
	border-radius: 24rpx;
	font-size: 32rpx;
	font-weight: 600;
	transition: all 0.3s;
	border: none;
	
	&.btn-primary {
		background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
		color: white;
		
		&:active {
			transform: scale(0.98);
		}
		
		&.disabled {
			opacity: 0.6;
			transform: none;
		}
	}
	
	&.btn-secondary {
		background: #f3f4f6;
		color: var(--text-color);
		border: 2rpx solid var(--border-color);
		
		&:active {
			background: #e5e7eb;
		}
	}
}

/* 全局卡片样式 */
.card {
	background: white;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 全局输入框样式 */
.input {
	width: 100%;
	padding: 24rpx 32rpx;
	border: 2rpx solid var(--border-color);
	border-radius: 16rpx;
	font-size: 32rpx;
	background: white;
	
	&:focus {
		border-color: var(--primary-color);
		box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
	}
}

/* 全局文本样式 */
.text-primary { color: var(--primary-color); }
.text-success { color: var(--success-color); }
.text-warning { color: var(--warning-color); }
.text-error { color: var(--error-color); }
.text-light { color: var(--text-light); }

/* 全局间距 */
.mt-sm { margin-top: 16rpx; }
.mt-md { margin-top: 32rpx; }
.mt-lg { margin-top: 48rpx; }
.mb-sm { margin-bottom: 16rpx; }
.mb-md { margin-bottom: 32rpx; }
.mb-lg { margin-bottom: 48rpx; }
.p-sm { padding: 16rpx; }
.p-md { padding: 32rpx; }
.p-lg { padding: 48rpx; }

/* 全局布局 */
.flex { display: flex; }
.flex-column { flex-direction: column; }
.flex-center { align-items: center; justify-content: center; }
.flex-between { justify-content: space-between; }
.flex-around { justify-content: space-around; }
.flex-1 { flex: 1; }

/* 全局文本对齐 */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* 全局圆角 */
.rounded-sm { border-radius: 8rpx; }
.rounded-md { border-radius: 16rpx; }
.rounded-lg { border-radius: 24rpx; }
.rounded-full { border-radius: 50%; }

/* 全局阴影 */
.shadow-sm { box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05); }
.shadow-md { box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1); }
.shadow-lg { box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15); }
</style>