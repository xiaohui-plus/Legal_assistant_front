<template>
  <view class="message-bubble" :class="bubbleClass">
    <!-- AI 消息 -->
    <view v-if="message.role === 'assistant'" class="message-ai">
      <view class="avatar-ai">
        <text class="icon-sparkles">✨</text>
      </view>
      <view class="content-wrapper">
        <view class="bubble bubble-ai">
          <text class="message-text">{{ message.content }}</text>
          
          <!-- 工具卡片示例 -->
          <view v-if="message.hasToolCard" class="tool-card">
            <view class="tool-card-content">
              <text class="tool-icon">🧮</text>
              <view class="tool-info">
                <text class="tool-title">补偿金计算工具</text>
                <text class="tool-desc">输入薪资与工龄自动生成预估报告</text>
              </view>
            </view>
            <text class="chevron">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 用户消息 -->
    <view v-else class="message-user">
      <view class="avatar-user">
        <text class="icon-user">👤</text>
      </view>
      <view class="bubble bubble-user">
        <text class="message-text">{{ message.content }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types/chat'

interface Props {
  message: Message
}

const props = defineProps<Props>()

const bubbleClass = computed(() => ({
  'is-ai': props.message.role === 'assistant',
  'is-user': props.message.role === 'user'
}))
</script>

<style lang="scss" scoped>
.message-bubble {
  display: flex;
  max-width: 100%;
}

.message-ai {
  display: flex;
  align-items: flex-start;
  gap: 32rpx;
  max-width: 1200rpx;
}

.message-user {
  display: flex;
  align-items: flex-start;
  gap: 32rpx;
  flex-direction: row-reverse;
  margin-left: auto;
  max-width: 80%;
}

.avatar-ai {
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  border-radius: 16rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-user {
  width: 72rpx;
  height: 72rpx;
  background-color: #E2E8F0;
  border-radius: 16rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-sparkles,
.icon-user {
  font-size: 40rpx;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.bubble {
  padding: 40rpx;
  border-radius: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.bubble-ai {
  background-color: #FFFFFF;
  border: 1rpx solid #E2E8F0;
  color: #475569;
}

.bubble-user {
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  color: #FFFFFF;
  box-shadow: 0 8rpx 16rpx rgba(79, 70, 229, 0.1);
}

.message-text {
  font-size: 30rpx;
  line-height: 1.6;
  word-wrap: break-word;
}

.tool-card {
  margin-top: 32rpx;
  background-color: #F8FAFC;
  border-radius: 24rpx;
  padding: 32rpx;
  border: 1rpx solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s;
  
  &:active {
    border-color: #C7D2FE;
    background-color: #EEF2FF;
  }
}

.tool-card-content {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.tool-icon {
  font-size: 48rpx;
}

.tool-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.tool-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0F172A;
}

.tool-desc {
  font-size: 24rpx;
  color: #64748B;
}

.chevron {
  font-size: 40rpx;
  color: #CBD5E1;
}
</style>
