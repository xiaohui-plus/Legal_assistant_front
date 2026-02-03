<template>
  <view class="chat-window">
    <!-- 顶部 Header -->
    <view class="header">
      <view class="header-left">
        <text class="header-label">当前对话：</text>
        <text class="header-title">{{ currentSession?.title || '新对话' }}</text>
      </view>
      <view class="header-right">
        <view class="share-btn" @click="handleShare">
          <text class="icon">📤</text>
          <text class="share-text">分享报告</text>
        </view>
        <view class="divider"></view>
        <view class="avatar" @click="goToProfile">
          <image :src="userAvatar" mode="aspectFill" />
        </view>
      </view>
    </view>

    <!-- 聊天消息区 -->
    <scroll-view 
      class="messages-container" 
      scroll-y 
      :scroll-into-view="scrollToView"
      :scroll-with-animation="true"
    >
      <view class="messages-list">
        <view 
          v-for="message in messages" 
          :key="message.id"
          :id="`msg-${message.id}`"
          class="message-wrapper"
          :class="message.role === 'user' ? 'message-user' : 'message-ai'"
        >
          <MessageBubble :message="message" />
        </view>
      </view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="input-container">
      <MessageInput 
        @send="handleSendMessage"
        @attach="handleAttach"
        @voice="handleVoice"
      />
      <view class="disclaimer">
        AI 生成内容仅供参考，不构成正式法律意见
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useChatStore } from '@/store/chat'
import { useUserStore } from '@/store/user'
import MessageBubble from '@/components/chat/MessageBubble.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import type { Message } from '@/types/chat'

const chatStore = useChatStore()
const userStore = useUserStore()

const scrollToView = ref('')

const currentSession = computed(() => chatStore.currentSession)
const messages = computed(() => chatStore.currentMessages)
const userAvatar = computed(() => userStore.profile?.avatar || '/static/images/default-avatar.png')

const handleSendMessage = async (content: string) => {
  await chatStore.sendMessage(content)
  scrollToBottom()
}

const handleAttach = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      // 处理图片上传
      console.log('选择图片:', res.tempFilePaths)
    }
  })
}

const handleVoice = () => {
  uni.showToast({
    title: '语音功能开发中',
    icon: 'none'
  })
}

const handleShare = () => {
  uni.showShareMenu({
    withShareTicket: true
  })
}

const goToProfile = () => {
  uni.navigateTo({
    url: '/pages/profile/index'
  })
}

const scrollToBottom = () => {
  if (messages.value.length > 0) {
    const lastMessage = messages.value[messages.value.length - 1]
    scrollToView.value = `msg-${lastMessage.id}`
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style lang="scss" scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #F8FAFC;
}

.header {
  height: 128rpx;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24rpx);
  border-bottom: 1rpx solid #E2E8F0;
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
}

.header-label {
  font-size: 28rpx;
  color: #94A3B8;
  margin-right: 16rpx;
}

.header-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
}

.header-right {
  display: flex;
  align-items: center;
}

.share-btn {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  cursor: pointer;
}

.icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.share-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #64748B;
}

.divider {
  width: 2rpx;
  height: 32rpx;
  background-color: #E2E8F0;
  margin: 0 32rpx;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 2rpx solid #CBD5E1;
  
  image {
    width: 100%;
    height: 100%;
  }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
}

.messages-list {
  padding: 48rpx 64rpx;
  display: flex;
  flex-direction: column;
  gap: 64rpx;
}

.message-wrapper {
  animation: slideIn 0.3s ease-out forwards;
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

.input-container {
  padding: 48rpx;
  background: transparent;
}

.disclaimer {
  text-align: center;
  font-size: 20rpx;
  color: #94A3B8;
  margin-top: 24rpx;
  text-transform: uppercase;
  letter-spacing: 3rpx;
}
</style>
