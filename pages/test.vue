<template>
  <view class="test-page">
    <view class="header">
      <text class="title">法律助手 - 测试页面</text>
    </view>
    <view class="content">
      <text class="message">✅ 页面加载成功！</text>
      <text class="info">如果你能看到这个页面，说明基本配置正常。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
console.log('测试页面已加载')
</script>

<style lang="scss" scoped>
.test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}

.header {
  margin-bottom: 64rpx;
}

.title {
  font-size: 48rpx;
  font-weight: 700;
  color: #FFFFFF;
  text-align: center;
}

.content {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 64rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  align-items: center;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
}

.message {
  font-size: 40rpx;
  font-weight: 600;
  color: #10B981;
}

.info {
  font-size: 28rpx;
  color: #64748B;
  text-align: center;
  line-height: 1.6;
}
</style>
