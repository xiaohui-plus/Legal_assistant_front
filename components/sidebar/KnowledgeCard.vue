<template>
  <view class="knowledge-card">
    <view class="card-header">
      <text class="header-icon">🔖</text>
      <text class="header-title">知识卡片</text>
    </view>

    <view class="card-content">
      <text class="content-label">相关法条</text>
      <view class="law-list">
        <view 
          v-for="(law, index) in laws" 
          :key="index"
          class="law-item"
        >
          <text class="law-text">{{ law }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  laws?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  laws: () => [
    '《劳动合同法》第40条：客观情况发生重大变化...',
    '《民法典》第一千一百六十五条...'
  ]
})
</script>

<style lang="scss" scoped>
.knowledge-card {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.header-icon {
  font-size: 32rpx;
  color: #6366F1;
}

.header-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1E293B;
}

.card-content {
  background-color: #F8FAFC;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.content-label {
  font-size: 24rpx;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.law-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.law-item {
  padding: 16rpx;
  background-color: #FFFFFF;
  border-radius: 12rpx;
  border: 1rpx solid #E2E8F0;
}

.law-text {
  font-size: 28rpx;
  color: #64748B;
  line-height: 1.5;
}
</style>
