<template>
  <view class="document-preview-card">
    <!-- 标题栏 -->
    <view class="card-header">
      <text class="header-title">文书预览：{{ documentTitle }}</text>
      <view class="header-actions">
        <view class="action-btn" @click="handleDownload">
          <text class="icon">⬇️</text>
        </view>
        <view class="action-btn" @click="handleEdit">
          <text class="icon">✏️</text>
        </view>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="card-body">
      <text class="document-title">{{ documentTitle }}</text>
      
      <!-- 模拟文书内容 -->
      <view class="content-skeleton">
        <view class="skeleton-line short"></view>
        <view class="skeleton-line"></view>
        <view class="skeleton-line"></view>
        <view class="skeleton-line medium"></view>
      </view>

      <!-- 风险提示 -->
      <view class="risk-notice">
        <text class="risk-label">风险提示：</text>
        <text class="risk-text">此场景下解除合同需按《劳动法》支付 N+1 经济补偿金，请确认已足额计算。</text>
      </view>
    </view>

    <!-- 快捷操作标签 -->
    <view class="quick-actions">
      <view 
        v-for="(action, index) in quickActions" 
        :key="index"
        class="action-tag"
        @click="handleQuickAction(action)"
      >
        <text class="action-text">{{ action }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  documentTitle?: string
  quickActions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  documentTitle: '劳动合同解除协议书',
  quickActions: () => ['修改赔偿金额', '添加离职证明条款', '重新生成预览']
})

const emit = defineEmits<{
  download: []
  edit: []
  quickAction: [action: string]
}>()

const handleDownload = () => {
  emit('download')
  uni.showToast({
    title: '下载文书',
    icon: 'none'
  })
}

const handleEdit = () => {
  emit('edit')
  uni.showToast({
    title: '编辑文书',
    icon: 'none'
  })
}

const handleQuickAction = (action: string) => {
  emit('quickAction', action)
  uni.showToast({
    title: action,
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.document-preview-card {
  background-color: #FFFFFF;
  border: 1rpx solid #E2E8F0;
  border-radius: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.card-header {
  background-color: #F8FAFC;
  border-bottom: 1rpx solid #E2E8F0;
  padding: 24rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #475569;
}

.header-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx;
  border-radius: 12rpx;
  transition: all 0.3s;
  
  &:active {
    background-color: #FFFFFF;
  }
}

.icon {
  font-size: 32rpx;
  color: #94A3B8;
}

.card-body {
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.document-title {
  font-size: 36rpx;
  font-weight: 700;
  text-align: center;
  color: #0F172A;
  margin-bottom: 48rpx;
}

.content-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.skeleton-line {
  height: 32rpx;
  background-color: #E2E8F0;
  border-radius: 8rpx;
  
  &.short {
    width: 25%;
  }
  
  &.medium {
    width: 85%;
  }
}

.risk-notice {
  padding-top: 32rpx;
  border-top: 2rpx dashed #E2E8F0;
  line-height: 1.6;
}

.risk-label {
  font-size: 28rpx;
  color: #6366F1;
  font-weight: 600;
}

.risk-text {
  font-size: 28rpx;
  color: #475569;
}

.quick-actions {
  margin-top: 32rpx;
  padding: 0 48rpx 48rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.action-tag {
  padding: 16rpx 24rpx;
  background-color: #FFFFFF;
  border: 1rpx solid #E2E8F0;
  border-radius: 999rpx;
  transition: all 0.3s;
  
  &:active {
    border-color: #C7D2FE;
    background-color: #EEF2FF;
  }
}

.action-text {
  font-size: 24rpx;
  color: #64748B;
}
</style>
