<template>
  <view class="message-bubble" :class="[`message-${role}`, { 'animate-slide-in': animate }]">
    <!-- AI 消息 -->
    <template v-if="role === 'assistant'">
      <view class="message-avatar ai-avatar">
        <Icon icon="heroicons:sparkles-20-solid" class="avatar-icon" />
      </view>
      <view class="message-content-wrapper">
        <view class="message-content ai-content">
          <text class="message-text">{{ content }}</text>
          
          <!-- 特殊卡片（如工具卡片） -->
          <slot name="card"></slot>
        </view>
      </view>
    </template>
    
    <!-- 用户消息 -->
    <template v-else>
      <view class="message-content-wrapper user-wrapper">
        <view class="message-content user-content">
          <text class="message-text">{{ content }}</text>
        </view>
      </view>
      <view class="message-avatar user-avatar">
        <Icon icon="heroicons:user-20-solid" class="avatar-icon" />
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  role: 'user' | 'assistant'
  content: string
  animate?: boolean
}

withDefaults(defineProps<Props>(), {
  animate: false
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.message-bubble {
  display: flex;
  align-items: flex-start;
  gap: 32rpx;
  margin-bottom: 64rpx;
  
  &.animate-slide-in {
    animation: slideIn 0.3s ease-out forwards;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(20rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.message-avatar {
  width: 36rpx;
  height: 36rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background-color: #4F46E5;
  color: white;
  
  .avatar-icon {
    font-size: 20rpx;
  }
}

.user-avatar {
  background-color: #E2E8F0;
  color: #64748B;
  
  .avatar-icon {
    font-size: 20rpx;
  }
}

.message-content-wrapper {
  flex: 1;
  max-width: 1280rpx; // max-w-4xl
}

.user-wrapper {
  max-width: 80%;
  margin-left: auto;
}

.message-content {
  border-radius: 32rpx;
  padding: 40rpx;
}

.ai-content {
  background-color: white;
  border: 2rpx solid #E2E8F0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  color: #334155;
}

.user-content {
  background-color: #4F46E5;
  color: white;
  box-shadow: 0 16rpx 32rpx rgba(79, 70, 229, 0.1);
}

.message-text {
  font-size: 28rpx;
  line-height: 1.6;
  word-wrap: break-word;
}

.message-assistant {
  justify-content: flex-start;
}

.message-user {
  justify-content: flex-end;
  flex-direction: row-reverse;
}
</style>
