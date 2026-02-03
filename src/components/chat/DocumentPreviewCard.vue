<template>
  <view class="document-preview-card">
    <!-- 标题栏 -->
    <view class="card-header">
      <text class="card-title">{{ title }}</text>
      <view class="header-actions">
        <view class="action-icon" @click="handleDownload">
          <Icon icon="heroicons:arrow-down-tray-20-solid" />
        </view>
        <view class="action-icon" @click="handleEdit">
          <Icon icon="heroicons:pencil-square-20-solid" />
        </view>
      </view>
    </view>
    
    <!-- 内容区 -->
    <view class="card-content">
      <text class="content-title">{{ documentTitle }}</text>
      
      <!-- 文书内容预览（骨架屏） -->
      <view class="content-skeleton">
        <view class="skeleton-line short"></view>
        <view class="skeleton-line"></view>
        <view class="skeleton-line"></view>
        <view class="skeleton-line medium"></view>
      </view>
      
      <!-- 风险提示 -->
      <view v-if="riskWarning" class="risk-warning">
        <text class="warning-label">风险提示：</text>
        <text class="warning-text">{{ riskWarning }}</text>
      </view>
    </view>
    
    <!-- 快捷操作标签 -->
    <view class="action-tags">
      <view
        v-for="(tag, index) in actionTags"
        :key="index"
        class="action-tag"
        @click="handleTagClick(tag)"
      >
        {{ tag }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// import { Icon } from '@iconify/vue' // 微信小程序不支持

interface Props {
  title?: string
  documentTitle?: string
  riskWarning?: string
  actionTags?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '文书预览：劳动合同解除协议书',
  documentTitle: '劳动合同解除协议书',
  riskWarning: '',
  actionTags: () => ['修改赔偿金额', '添加离职证明条款', '重新生成预览']
})

const emit = defineEmits<{
  (e: 'download'): void
  (e: 'edit'): void
  (e: 'tag-click', tag: string): void
}>()

const handleDownload = () => {
  emit('download')
}

const handleEdit = () => {
  emit('edit')
}

const handleTagClick = (tag: string) => {
  emit('tag-click', tag)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.document-preview-card {
  background-color: white;
  border: 2rpx solid #E2E8F0;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  background-color: #F8FAFC;
  border-bottom: 2rpx solid #F1F5F9;
  padding: 24rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #334155;
}

.header-actions {
  display: flex;
  gap: 16rpx;
}

.action-icon {
  padding: 12rpx;
  cursor: pointer;
  transition: all 0.3s;
  color: #94A3B8;
  font-size: 32rpx;
  
  &:hover {
    background-color: white;
    border-radius: 12rpx;
    color: #4F46E5;
  }
}

.card-content {
  padding: 48rpx;
  color: #475569;
  font-size: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.content-title {
  font-weight: bold;
  text-align: center;
  font-size: 36rpx;
  margin-bottom: 48rpx;
}

.content-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.skeleton-line {
  height: 32rpx;
  background-color: #F1F5F9;
  border-radius: 8rpx;
  
  &.short {
    width: 25%;
  }
  
  &.medium {
    width: 83.33%; // 5/6
  }
}

.risk-warning {
  padding-top: 32rpx;
  border-top: 2rpx dashed #E2E8F0;
  line-height: 1.6;
}

.warning-label {
  color: #4F46E5;
  font-weight: 500;
}

.warning-text {
  color: #475569;
}

.action-tags {
  margin-top: 32rpx;
  padding: 0 40rpx 40rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.action-tag {
  padding: 12rpx 24rpx;
  background-color: white;
  border: 2rpx solid #E2E8F0;
  border-radius: 999rpx; // rounded-full
  font-size: 24rpx;
  color: #64748B;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #4F46E5;
    color: #4F46E5;
  }
}
</style>
