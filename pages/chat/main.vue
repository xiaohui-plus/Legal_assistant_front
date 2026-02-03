<template>
  <view class="chat-main-layout">
    <!-- 左侧导航栏 -->
    <view class="left-sidebar">
      <SideNavigation />
    </view>

    <!-- 主内容区 -->
    <view class="main-content">
      <!-- 顶部 Header -->
      <view class="header">
        <view class="header-left">
          <text class="header-label">当前对话：</text>
          <text class="header-title">{{ currentSession?.title || '劳动争议补偿标准咨询' }}</text>
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

    <!-- 右侧工具栏 -->
    <view class="right-sidebar">
      <view class="sidebar-content">
        <KnowledgeCard :laws="relatedLaws" />
        <CaseList :cases="relatedCases" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SideNavigation from '@/components/layout/SideNavigation.vue'
import MessageBubble from '@/components/chat/MessageBubble.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import KnowledgeCard from '@/components/sidebar/KnowledgeCard.vue'
import CaseList from '@/components/sidebar/CaseList.vue'
import type { Message } from '@/types/chat'

const scrollToView = ref('')
const userAvatar = ref('/static/images/default-avatar.png')

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
    content: '帮我草拟一份关于"因客观情况发生重大变化导致合同无法履行"的解除协议。',
    timestamp: Date.now(),
    status: 'sent',
    isFavorite: false
  }
])

const relatedLaws = ref([
  '《劳动合同法》第40条：客观情况发生重大变化...',
  '《民法典》第一千一百六十五条...'
])

const relatedCases = ref([
  {
    title: '某互联网公司架构调整裁员争议案',
    description: '法院认定企业战略收缩不属于"客观情况发生重大变化"...'
  },
  {
    title: '自然灾害导致合同无法履行支持案',
    description: '最高院发布典型指导案例，界定了不可抗力适用范围...'
  }
])

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
</script>

<style lang="scss" scoped>
.chat-main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #F8FAFC;
}

.left-sidebar {
  width: 512rpx;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #F8FAFC;
  position: relative;
}

.right-sidebar {
  width: 640rpx;
  flex-shrink: 0;
  background-color: #FFFFFF;
  border-left: 1rpx solid #E2E8F0;
  overflow-y: auto;
}

.sidebar-content {
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  gap: 48rpx;
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
