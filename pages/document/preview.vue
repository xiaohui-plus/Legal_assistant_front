<template>
	<view class="preview-page">
		<!-- 文书头部信息 -->
		<view class="document-header">
			<view class="header-content">
				<view class="document-title">{{ document.name }}</view>
				<view class="document-meta">
					<text class="meta-item">{{ document.template_name }}</text>
					<text class="meta-divider">|</text>
					<text class="meta-item">{{ formatTime(document.create_time) }}</text>
				</view>
			</view>
			
			<view class="header-actions">
				<button class="action-btn" @click="shareDocument">
					<text class="btn-icon">📤</text>
					<text>分享</text>
				</button>
				<button class="action-btn" @click="editDocument">
					<text class="btn-icon">✏️</text>
					<text>编辑</text>
				</button>
			</view>
		</view>
		
		<!-- 文书内容 -->
		<view class="document-content">
			<view class="content-container">
				<text class="content-text">{{ document.content }}</text>
			</view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-actions">
			<button class="action-button secondary" @click="copyContent">
				<text class="button-icon">📋</text>
				<text>复制</text>
			</button>
			
			<button class="action-button secondary" @click="downloadDocument">
				<text class="button-icon">📥</text>
				<text>下载</text>
			</button>
			
			<button class="action-button primary" @click="printDocument">
				<text class="button-icon">🖨️</text>
				<text>打印</text>
			</button>
		</view>
		
		<!-- 操作菜单 -->
		<uni-popup ref="actionMenu" type="bottom">
			<view class="action-menu">
				<view class="menu-header">
					<text class="menu-title">文书操作</text>
					<button class="menu-close" @click="closeActionMenu">✕</button>
				</view>
				
				<view class="menu-items">
					<view class="menu-item" @click="copyContent">
						<text class="item-icon">📋</text>
						<text class="item-text">复制内容</text>
					</view>
					
					<view class="menu-item" @click="shareDocument">
						<text class="item-icon">📤</text>
						<text class="item-text">分享文书</text>
					</view>
					
					<view class="menu-item" @click="downloadDocument">
						<text class="item-icon">📥</text>
						<text class="item-text">下载文档</text>
					</view>
					
					<view class="menu-item" @click="printDocument">
						<text class="item-icon">🖨️</text>
						<text class="item-text">打印文书</text>
					</view>
					
					<view class="menu-divider"></view>
					
					<view class="menu-item danger" @click="deleteDocument">
						<text class="item-icon">🗑️</text>
						<text class="item-text">删除文书</text>
					</view>
				</view>
			</view>
		</uni-popup>
		
		<!-- 加载状态 -->
		<uni-load-more v-if="loading" status="loading"></uni-load-more>
		
		<!-- 空状态 -->
		<view v-if="!document && !loading" class="empty-state">
			<view class="empty-icon">📄</view>
			<view class="empty-text">文书不存在</view>
			<button class="empty-btn" @click="goBack">返回</button>
		</view>
	</view>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useDocumentStore } from '@/store/document'
import { formatRelativeTime, copyToClipboard, showConfirm } from '@/utils/common'

export default {
	name: 'DocumentPreview',
	data() {
		return {
			documentId: null,
			document: null,
			loading: false
		}
	},
	computed: {
		...mapState(useDocumentStore, ['documents'])
	},
	onLoad(options) {
		this.documentId = options.id
		
		if (!this.documentId) {
			uni.showToast({
				title: '文书ID不存在',
				icon: 'none'
			})
			this.goBack()
			return
		}
		
		this.loadDocument()
	},
	
	// 设置分享信息
	onShareAppMessage() {
		return {
			title: `${this.document?.name || '法律文书'} - 法义AI助手`,
			path: `/pages/document/preview?id=${this.documentId}`,
			imageUrl: '/static/images/share-document.png'
		}
	},
	
	methods: {
		...mapActions(useDocumentStore, ['deleteDocument']),
		
		loadDocument() {
			// 从store中查找文书
			this.document = this.documents.find(doc => doc.id === this.documentId)
			
			if (!this.document) {
				// 如果store中没有，尝试从本地存储获取
				const localDocuments = uni.getStorageSync('userDocuments') || []
				this.document = localDocuments.find(doc => doc.id === this.documentId)
			}
			
			if (!this.document) {
				uni.showToast({
					title: '文书不存在',
					icon: 'none'
				})
				setTimeout(() => {
					this.goBack()
				}, 1500)
			}
		},
		
		async copyContent() {
			try {
				await copyToClipboard(this.document.content)
			} catch (error) {
				uni.showToast({
					title: '复制失败',
					icon: 'none'
				})
			}
		},
		
		shareDocument() {
			// #ifdef MP-WEIXIN
			// 微信小程序使用原生分享
			uni.showShareMenu({
				withShareTicket: true
			})
			// #endif
			
			// #ifdef H5
			// H5使用Web Share API或复制链接
			if (navigator.share) {
				navigator.share({
					title: this.document.name,
					text: '我用法义AI助手生成了一份法律文书',
					url: window.location.href
				})
			} else {
				this.copyContent()
				uni.showToast({
					title: '链接已复制',
					icon: 'success'
				})
			}
			// #endif
			
			// #ifdef APP-PLUS
			// App使用原生分享
			uni.share({
				provider: 'weixin',
				scene: 'WXSceneSession',
				type: 0,
				href: `https://legal-ai.com/document/${this.documentId}`,
				title: this.document.name,
				summary: '我用法义AI助手生成了一份法律文书',
				imageUrl: '/static/images/share-document.png'
			})
			// #endif
		},
		
		editDocument() {
			// 跳转到编辑页面（如果有的话）
			uni.showToast({
				title: '编辑功能开发中',
				icon: 'none'
			})
		},
		
		downloadDocument() {
			// #ifdef H5
			// H5下载
			const blob = new Blob([this.document.content], { type: 'text/plain;charset=utf-8' })
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `${this.document.name}.txt`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(url)
			
			uni.showToast({
				title: '下载成功',
				icon: 'success'
			})
			// #endif
			
			// #ifdef MP
			// 小程序保存到相册或分享
			uni.showActionSheet({
				itemList: ['保存到相册', '分享给朋友'],
				success: (res) => {
					if (res.tapIndex === 0) {
						this.saveToAlbum()
					} else {
						this.shareDocument()
					}
				}
			})
			// #endif
			
			// #ifdef APP-PLUS
			// App保存到本地
			uni.saveFile({
				tempFilePath: this.document.content,
				success: () => {
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					})
				},
				fail: () => {
					uni.showToast({
						title: '保存失败',
						icon: 'none'
					})
				}
			})
			// #endif
		},
		
		printDocument() {
			// #ifdef H5
			// H5打印
			const printWindow = window.open('', '_blank')
			printWindow.document.write(`
				<html>
					<head>
						<title>${this.document.name}</title>
						<style>
							body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
							h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
							.content { white-space: pre-wrap; }
						</style>
					</head>
					<body>
						<h1>${this.document.name}</h1>
						<div class="content">${this.document.content}</div>
					</body>
				</html>
			`)
			printWindow.document.close()
			printWindow.print()
			// #endif
			
			// #ifdef MP || APP-PLUS
			uni.showToast({
				title: '请在浏览器中打开进行打印',
				icon: 'none'
			})
			// #endif
		},
		
		async deleteDocument() {
			const confirmed = await showConfirm('确认删除', '确定要删除这份文书吗？删除后无法恢复。')
			
			if (confirmed) {
				try {
					this.deleteDocument(this.documentId)
					
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
					
					setTimeout(() => {
						this.goBack()
					}, 1500)
				} catch (error) {
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					})
				}
			}
		},
		
		saveToAlbum() {
			// 将文书内容转换为图片保存（需要canvas实现）
			uni.showToast({
				title: '保存功能开发中',
				icon: 'none'
			})
		},
		
		showActionMenu() {
			this.$refs.actionMenu.open()
		},
		
		closeActionMenu() {
			this.$refs.actionMenu.close()
		},
		
		goBack() {
			uni.navigateBack({
				fail: () => {
					uni.switchTab({
						url: '/pages/document/center'
					})
				}
			})
		},
		
		formatTime(time) {
			return formatRelativeTime(time)
		}
	}
}
</script>

<style lang="scss" scoped>
.preview-page {
	min-height: 100vh;
	background: var(--bg-color);
	padding-bottom: 120rpx;
}

.document-header {
	background: white;
	padding: 32rpx;
	margin-bottom: 16rpx;
	border-bottom: 2rpx solid #f3f4f6;
}

.header-content {
	margin-bottom: 24rpx;
}

.document-title {
	font-size: 40rpx;
	font-weight: 700;
	color: var(--text-color);
	margin-bottom: 12rpx;
}

.document-meta {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.meta-item {
	font-size: 28rpx;
	color: var(--text-light);
}

.meta-divider {
	font-size: 24rpx;
	color: #e5e7eb;
}

.header-actions {
	display: flex;
	gap: 16rpx;
}

.action-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 16rpx 24rpx;
	background: #f8fafc;
	border: 2rpx solid #e2e8f0;
	border-radius: 16rpx;
	font-size: 28rpx;
	color: var(--text-color);
	transition: all 0.3s;
	
	&:active {
		background: #f1f5f9;
		transform: scale(0.98);
	}
}

.btn-icon {
	font-size: 24rpx;
}

.document-content {
	background: white;
	margin-bottom: 16rpx;
}

.content-container {
	padding: 48rpx 32rpx;
}

.content-text {
	font-size: 32rpx;
	line-height: 1.8;
	color: var(--text-color);
	white-space: pre-wrap;
	word-wrap: break-word;
}

.bottom-actions {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: white;
	border-top: 2rpx solid #f3f4f6;
	padding: 24rpx 32rpx;
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
	display: flex;
	gap: 16rpx;
}

.action-button {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	padding: 24rpx 16rpx;
	border: none;
	border-radius: 16rpx;
	font-size: 28rpx;
	transition: all 0.3s;
	
	&.primary {
		background: var(--primary-color);
		color: white;
		
		&:active {
			background: var(--primary-light);
		}
	}
	
	&.secondary {
		background: #f8fafc;
		color: var(--text-color);
		border: 2rpx solid #e2e8f0;
		
		&:active {
			background: #f1f5f9;
		}
	}
}

.button-icon {
	font-size: 32rpx;
}

.action-menu {
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
	font-size: 36rpx;
	font-weight: 600;
	color: var(--text-color);
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

.empty-text {
	font-size: 32rpx;
	color: var(--text-light);
	margin-bottom: 48rpx;
}

.empty-btn {
	padding: 24rpx 48rpx;
	background: var(--primary-color);
	color: white;
	border: none;
	border-radius: 16rpx;
	font-size: 32rpx;
	
	&:active {
		background: var(--primary-light);
	}
}
</style>