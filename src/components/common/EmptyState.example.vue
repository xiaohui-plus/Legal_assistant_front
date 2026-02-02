<template>
  <view class="example-container">
    <view class="example-section">
      <text class="example-title">空状态组件示例</text>
      
      <!-- 示例 1: 空会话列表 -->
      <view class="example-item">
        <text class="example-label">1. 空会话列表（带按钮）</text>
        <EmptyState
          icon="💬"
          title="暂无会话"
          description="点击下方按钮开始新的法律咨询"
          buttonText="+ 新咨询"
          @buttonClick="handleNewChat"
        />
      </view>

      <!-- 示例 2: 空文书列表 -->
      <view class="example-item">
        <text class="example-label">2. 空文书列表</text>
        <EmptyState
          icon="📄"
          title="暂无文书"
          description="您还没有生成任何法律文书"
          buttonText="生成文书"
          @buttonClick="handleGenerateDoc"
        />
      </view>

      <!-- 示例 3: 空收藏列表（无按钮） -->
      <view class="example-item">
        <text class="example-label">3. 空收藏列表（无按钮）</text>
        <EmptyState
          icon="⭐"
          title="暂无收藏"
          description="您还没有收藏任何内容"
        />
      </view>

      <!-- 示例 4: 搜索无结果 -->
      <view class="example-item">
        <text class="example-label">4. 搜索无结果</text>
        <EmptyState
          icon="🔍"
          title="未找到相关内容"
          description="请尝试使用其他关键词搜索"
        />
      </view>

      <!-- 示例 5: 默认状态 -->
      <view class="example-item">
        <text class="example-label">5. 默认状态</text>
        <EmptyState />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import EmptyState from './EmptyState.vue'

const handleNewChat = () => {
  console.log('创建新会话')
  uni.showToast({
    title: '创建新会话',
    icon: 'none'
  })
}

const handleGenerateDoc = () => {
  console.log('生成文书')
  uni.showToast({
    title: '生成文书',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.example-container {
  padding: 40rpx;
  background-color: #F8FAFC;
  min-height: 100vh;
}

.example-section {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.example-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 20rpx;
}

.example-item {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.example-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1px solid #E2E8F0;
}
</style>
