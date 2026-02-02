<template>
  <view class="chat-window-page">
    <!-- 三栏布局 -->
    <view class="layout-container">
      <!-- 左侧导航栏 -->
      <Sidebar />
      
      <!-- 主内容区 -->
      <view class="main-content">
        <!-- 顶部 Header -->
        <Header :title="currentTitle" />
        
        <!-- 聊天消息区域 -->
        <scroll-view
          class="messages-container hide-scrollbar"
          scroll-y
          :scroll-into-view="scrollToView"
        >
          <view class="messages-list">
            <!-- AI 消息示例 -->
            <MessageBubble
              role="assistant"
              content="您好！我是您的法律助手。根据 2026年02月01日 最新的法律法规，关于您提到的劳动争议补偿，主要参考《中华人民共和国劳动合同法》第47条。"
              :animate="true"
            />
            
            <!-- 用户消息示例 -->
            <MessageBubble
              role="user"
              content="帮我草拟一份关于"因客观情况发生重大变化导致合同无法履行"的解除协议。"
              :animate="true"
            />
            
            <!-- 文书预览卡片示例 -->
            <view class="message-bubble message-assistant">
              <view class="message-avatar ai-avatar">
                <Icon icon="heroicons:document-text-20-solid" class="avatar-icon" />
              </view>
              <view class="message-content-wrapper">
                <DocumentPreviewCard
                  title="文书预览：劳动合同解除协议书"
                  document-title="劳动合同解除协议书"
                  risk-warning="此场景下解除合同需按《劳动法》支付 N+1 经济补偿金，请确认已足额计算。"
                  @download="handleDownload"
                  @edit="handleEdit"
                  @tag-click="handleTagClick"
                />
              </view>
            </view>
          </view>
        </scroll-view>
        
        <!-- 消息输入区 -->
        <MessageInput
          :loading="isLoading"
          @send="handleSend"
          @attachment="handleAttachment"
          @voice="handleVoice"
        />
      </view>
      
      <!-- 右侧工具栏 -->
      <RightSidebar />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import RightSidebar from '@/components/layout/RightSidebar.vue'
import MessageBubble from '@/components/chat/MessageBubble.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import DocumentPreviewCard from '@/components/chat/DocumentPreviewCard.vue'

// 状态
const currentTitle = ref('劳动争议补偿标准咨询')
const isLoading = ref(false)
const scrollToView = ref('')

// 发送消息
const handleSend = (content: string) => {
  console.log('发送消息:', content)
  // TODO: 实现发送消息逻辑
}

// 附件上传
const handleAttachment = () => {
  console.log('上传附件')
  // TODO: 实现附件上传
}

// 语音输入
const handleVoice = () => {
  console.log('语音输入')
  // TODO: 实现语音输入
}

// 下载文书
const handleDownload = () => {
  console.log('下载文书')
  // TODO: 实现下载功能
}

// 编辑文书
const handleEdit = () => {
  console.log('编辑文书')
  // TODO: 实现编辑功能
}

// 标签点击
const handleTagClick = (tag: string) => {
  console.log('标签点击:', tag)
  // TODO: 实现标签操作
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.chat-window-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.layout-container {
  display: flex;
  height: 100vh;
  background-color: #F8FAFC;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #F8FAFC;
  position: relative;
  margin-left: 256px; /* 左侧边栏宽度 */
  margin-right: 320px; /* 右侧边栏宽度 */
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 48rpx 64rpx;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 64rpx;
}

// 消息气泡样式（用于文书预览卡片）
.message-bubble {
  display: flex;
  align-items: flex-start;
  gap: 32rpx;
}

.message-assistant {
  justify-content: flex-start;
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

.message-content-wrapper {
  flex: 1;
  max-width: 1280rpx;
}
</style>
