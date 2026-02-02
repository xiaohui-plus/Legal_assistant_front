<template>
  <view class="top-header">
    <!-- 左侧：当前对话信息 -->
    <view class="header-left">
      <text class="current-label">当前对话：</text>
      <text class="current-title">{{ title }}</text>
    </view>

    <!-- 右侧：操作按钮和用户头像 -->
    <view class="header-right">
      <view class="share-button" @click="handleShare">
        <text class="share-icon">🔗</text>
        <text class="share-text">分享报告</text>
      </view>
      
      <view class="divider"></view>
      
      <view class="user-avatar" @click="handleAvatarClick">
        <image
          v-if="userAvatar"
          :src="userAvatar"
          class="avatar-image"
          mode="aspectFill"
        />
        <text v-else class="avatar-placeholder">👤</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  userAvatar?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '新对话',
  userAvatar: ''
})

const emit = defineEmits<{
  (e: 'share'): void
  (e: 'avatar-click'): void
}>()

const handleShare = () => {
  emit('share')
}

const handleAvatarClick = () => {
  emit('avatar-click')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.top-header {
  height: 128rpx; // 64px
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24rpx);
  border-bottom: 2rpx solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 64rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.current-label {
  font-size: 28rpx;
  color: #94A3B8;
}

.current-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #334155;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.share-button {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #64748B;
  transition: color 0.3s;
  cursor: pointer;
  
  &:hover {
    color: #4F46E5;
  }
}

.share-icon {
  font-size: 32rpx;
}

.share-text {
  font-size: 28rpx;
  font-weight: 500;
}

.divider {
  width: 2rpx;
  height: 32rpx;
  background-color: #E2E8F0;
}

.user-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: #E2E8F0;
  border: 2rpx solid #CBD5E1;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  font-size: 32rpx;
}
</style>
