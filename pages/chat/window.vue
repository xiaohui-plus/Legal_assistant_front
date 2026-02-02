<template>
  <view class="chat-window-page">
    <!-- 三栏布局 -->
    <view class="layout-container">
      <!-- 左侧导航栏 -->
      <SideNavigation
        :active-nav="activeNav"
        @nav-change="handleNavChange"
        @view-changelog="handleViewChangelog"
      />
      
      <!-- 主内容区 -->
      <view class="main-content">
        <!-- 顶部 Header -->
        <TopHeader
          :title="currentTitle"
          :user-avatar="userAvatar"
          @share="handleShare"
          @avatar-click="handleAvatarClick"
        />
        
        <!-- 聊天消息区域 -->
        <scroll-view
          class="messages-container"
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
                <text class="avatar-icon">📄</text>
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
      <RightSidebar
        :laws="relatedLaws"
        :cases="typicalCases"
        @law-click="handleLawClick"
        @case-click="handleCaseClick"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SideNavigation from '@/components/layout/SideNavigation.vue'
import TopHeader from '@/components/layout/TopHeader.vue'
import RightSidebar from '@/components/layout/RightSidebar.vue'
import MessageBubble from '@/components/chat/MessageBubble.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import DocumentPreviewCard from '@/components/chat/DocumentPreviewCard.vue'

// 状态
const activeNav = ref('chat')
const currentTitle = ref('劳动争议补偿标准咨询')
const userAvatar = ref('')
const isLoading = ref(false)
const scrollToView = ref('')

// 相关法条
const relatedLaws = ref([
  '《劳动合同法》第40条：客观情况发生重大变化...',
  '《民法典》第一千一百六十五条...'
])

// 典型案例
const typicalCases = ref([
  {
    title: '某互联网公司架构调整裁员争议案',
    summary: '法院认定企业战略收缩不属于"客观情况发生重大变化"...'
  },
  {
    title: '自然灾害导致合同无法履行支持案',
    summary: '最高院发布典型指导案例，界定了不可抗力适用范围...'
  }
])

// 导航切换
const handleNavChange = (navId: string) => {
  console.log('导航切换:', navId)
  // TODO: 实现导航切换逻辑
}

// 查看更新日志
const handleViewChangelog = () => {
  console.log('查看更新日志')
  // TODO: 实现查看更新日志
}

// 分享
const handleShare = () => {
  console.log('分享报告')
  // TODO: 实现分享功能
}

// 头像点击
const handleAvatarClick = () => {
  console.log('头像点击')
  // TODO: 跳转到个人中心
}

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

// 法条点击
const handleLawClick = (law: string) => {
  console.log('法条点击:', law)
  // TODO: 显示法条详情
}

// 案例点击
const handleCaseClick = (caseItem: any) => {
  console.log('案例点击:', caseItem)
  // TODO: 显示案例详情
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
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background-color: #4F46E5;
  color: $text-color-white;
  
  .avatar-icon {
    font-size: 40rpx;
  }
}

.message-content-wrapper {
  flex: 1;
  max-width: 1280rpx;
}
</style>
