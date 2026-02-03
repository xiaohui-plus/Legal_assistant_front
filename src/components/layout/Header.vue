<template>
  <header class="header">
    <div class="header-content">
      <!-- 左侧标题 -->
      <div class="header-left">
        <div class="conversation-info">
          <span class="conversation-label">当前对话：</span>
          <span class="conversation-title">{{ title || '新的法律咨询' }}</span>
        </div>
      </div>

      <!-- 右侧操作区 -->
      <div class="header-right">
        <button class="share-button" @click="handleShare">
          <Icon icon="heroicons:share-20-solid" />
          <span>分享报告</span>
        </button>
        
        <div class="user-avatar" @click="handleUserClick">
          <Icon icon="heroicons:user-20-solid" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// import { Icon } from '@iconify/vue' // 微信小程序不支持

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: ''
})

const handleShare = () => {
  // 分享功能实现
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  })
}

const handleUserClick = () => {
  // 跳转到个人中心
  uni.navigateTo({
    url: '/pages/profile/index'
  })
}
</script>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #E2E8F0;
  height: 64px;
}

.header-content {
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.conversation-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.conversation-label {
  font-size: 14px;
  color: #94A3B8;
}

.conversation-title {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.share-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #F8FAFC;
    border-color: #CBD5E1;
    color: #334155;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #F1F5F9;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #E2E8F0;
    border-color: #CBD5E1;
    color: #475569;
  }
  
  &:active {
    transform: scale(0.95);
  }
}
</style>