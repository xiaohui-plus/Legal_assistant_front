<template>
  <view class="message-card" @click="handleClick">
    <view class="card-icon">
      <Icon :icon="icon" />
    </view>
    <view class="card-content">
      <view class="card-title">{{ title }}</view>
      <view class="card-description">{{ description }}</view>
    </view>
    <view class="card-arrow">
      <Icon icon="heroicons:chevron-right-20-solid" />
    </view>
  </view>
</template>

<script setup lang="ts">
// import { Icon } from '@iconify/vue' // 微信小程序不支持

interface Props {
  title: string
  description: string
  icon: string
  onClick?: () => void
}

const props = defineProps<Props>()

const handleClick = () => {
  if (props.onClick) {
    props.onClick()
  }
}
</script>

<style lang="scss" scoped>
.message-card {
  background: #F8FAFC;
  border: 2rpx solid #F1F5F9;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #C7D2FE;
    background: #FAFBFF;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.card-icon {
  width: 80rpx;
  height: 80rpx;
  background: #EEF2FF;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4F46E5;
  font-size: 40rpx;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 8rpx;
}

.card-description {
  font-size: 24rpx;
  color: #64748B;
  line-height: 1.4;
}

.card-arrow {
  color: #94A3B8;
  font-size: 32rpx;
  flex-shrink: 0;
}
</style>