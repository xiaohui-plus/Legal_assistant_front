<template>
  <view class="knowledge-card">
    <view class="card-header">
      <text class="card-icon">{{ icon }}</text>
      <text class="card-title">{{ title }}</text>
    </view>
    
    <view class="card-content">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  title: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  icon: '📌'
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.knowledge-card {
  background-color: #F8FAFC;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.card-icon {
  font-size: 32rpx;
}

.card-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
</style>
