<template>
  <view class="chat-main-layout">
    <!-- 遮罩层 -->
    <view 
      v-if="showLeftSidebar" 
      class="sidebar-mask"
      @click="closeSidebars"
    ></view>

    <!-- 左侧导航栏 -->
    <view class="left-sidebar" :class="{ 'show': showLeftSidebar }">
      <SideNavigation />
    </view>

    <!-- 主内容区 -->
    <view class="main-content">
      <!-- 顶部 Header -->
      <view class="header">
        <view class="menu-btn" @click="toggleLeftSidebar">
          <view class="menu-icon-wrapper">
            <view class="menu-line"></view>
            <view class="menu-line"></view>
            <view class="menu-line"></view>
          </view>
        </view>
        <view class="header-title">{{ currentSession?.title || '法律助手' }}</view>
        <view class="header-spacer"></view>
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
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SideNavigation from '@/components/layout/SideNavigation.vue'
import MessageBubble from '@/components/chat/MessageBubble.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import type { Message } from '@/types/chat'

const scrollToView = ref('')
const showLeftSidebar = ref(false)

const currentSession = ref({
  id: '1',
  title: '劳动争议补偿标准咨询'
})

const messages = ref<Message[]>([
  {
    id: '1',
    sessionId: '1',
    role: 'assistant',
    content: '您好！我是您的法律助手。根据 2026年02月01日 最新的法律法规，关于您提到的劳动争议补偿，主要参考《中华人民共和国劳动合同法》第47条。',
    timestamp: Date.now(),
    status: 'received',
    isFavorite: false,
    hasToolCard: true
  },
  {
    id: '2',
    sessionId: '1',
    role: 'user',
    content: '帮我草拟一份关于因客观情况发生重大变化导致合同无法履行的解除协议。',
    timestamp: Date.now(),
    status: 'sent',
    isFavorite: false
  }
])

const toggleLeftSidebar = () => {
  showLeftSidebar.value = !showLeftSidebar.value
}

const closeSidebars = () => {
  showLeftSidebar.value = false
}

const handleSendMessage = (content: string) => {
  const newMessage: Message = {
    id: String(Date.now()),
    sessionId: currentSession.value.id,
    role: 'user',
    content,
    timestamp: Date.now(),
    status: 'sent',
    isFavorite: false
  }
  
  messages.value.push(newMessage)
  scrollToBottom()
  
  // 模拟 AI 回复
  setTimeout(() => {
    const aiMessage: Message = {
      id: String(Date.now()),
      sessionId: currentSession.value.id,
      role: 'assistant',
      content: '我已经收到您的请求，正在为您生成文书...',
      timestamp: Date.now(),
      status: 'received',
      isFavorite: false
    }
    messages.value.push(aiMessage)
    scrollToBottom()
  }, 1000)
}

const handleAttach = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
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

const scrollToBottom = () => {
  if (messages.value.length > 0) {
    const lastMessage = messages.value[messages.value.length - 1]
    scrollToView.value = `msg-${lastMessage.id}`
  }
}
</script>

<style lang="scss" scoped>
.chat-main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #F8FAFC;
  position: relative;
}

.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 99;
}

.left-sidebar {
  position: fixed;
  left: -512rpx;
  top: 0;
  bottom: 0;
  width: 512rpx;
  background-color: #FFFFFF;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  box-shadow: 4rpx 0 24rpx rgba(0, 0, 0, 0.15);
  
  &.show {
    left: 0;
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #F8FAFC;
  position: relative;
  width: 100%;
}

.header {
  height: 96rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #E2E8F0;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.menu-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  transition: all 0.2s;
  margin-right: 16rpx;
  
  &:active {
    background-color: #F1F5F9;
  }
}

.menu-icon-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  width: 36rpx;
}

.menu-line {
  width: 100%;
  height: 4rpx;
  background-color: #475569;
  border-radius: 2rpx;
  transition: all 0.3s;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1E293B;
  flex: 1;
}

.header-spacer {
  width: 64rpx;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
}

.messages-list {
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
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
  padding: 24rpx;
  background: #FFFFFF;
  border-top: 1rpx solid #E2E8F0;
}

.disclaimer {
  text-align: center;
  font-size: 22rpx;
  color: #94A3B8;
  margin-top: 16rpx;
}
</style>
