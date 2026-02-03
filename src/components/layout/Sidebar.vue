<template>
  <div class="sidebar">
    <!-- 品牌Logo区域 -->
    <div class="brand-section">
      <div class="brand-icon">
        <Icon icon="heroicons:scale-20-solid" />
      </div>
      <div class="brand-text">
        <div class="brand-title">法义AI</div>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="navigation">
      <div 
        v-for="item in navigationItems" 
        :key="item.key"
        class="nav-item"
        :class="{ 'nav-item-active': activeItem === item.key }"
        @click="handleNavClick(item.key)"
      >
        <Icon :icon="item.icon" class="nav-icon" />
        <span class="nav-text">{{ item.label }}</span>
      </div>
    </nav>

    <!-- 底部版本信息卡片 -->
    <div class="version-card">
      <div class="version-content">
        <div class="version-label">当前版本</div>
        <div class="version-title">法义AI 专业版 v2.4</div>
        <button class="version-button" @click="handleViewChangelog">
          查看更新日志
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { Icon } from '@iconify/vue' // 微信小程序不支持

interface NavigationItem {
  key: string
  label: string
  icon: string
  path?: string
}

const activeItem = ref('chat')

const navigationItems: NavigationItem[] = [
  {
    key: 'chat',
    label: '法律咨询',
    icon: 'heroicons:chat-bubble-left-right-20-solid',
    path: '/pages/chat/window'
  },
  {
    key: 'document',
    label: '文书生成',
    icon: 'heroicons:document-text-20-solid',
    path: '/pages/document/templates'
  },
  {
    key: 'search',
    label: '案例库检索',
    icon: 'heroicons:magnifying-glass-circle-20-solid',
    path: '/pages/search/index'
  },
  {
    key: 'history',
    label: '历史记录',
    icon: 'heroicons:clock-20-solid',
    path: '/pages/chat/list'
  }
]

const handleNavClick = (key: string) => {
  activeItem.value = key
  const item = navigationItems.find(nav => nav.key === key)
  if (item?.path) {
    uni.navigateTo({
      url: item.path
    })
  }
}

const handleViewChangelog = () => {
  uni.showToast({
    title: '查看更新日志',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: 256px;
  height: 100vh;
  background: white;
  border-right: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.brand-section {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #E2E8F0;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: #4F46E5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.brand-text {
  flex: 1;
}

.brand-title {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
  background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 12px;
  color: #64748B;
  margin-top: 2px;
}

.navigation {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748B;
  
  &:hover {
    background: #F8FAFC;
    color: #475569;
  }
  
  &.nav-item-active {
    background: #EEF2FF;
    color: #4338CA;
    
    .nav-icon {
      color: #4338CA;
    }
  }
}

.nav-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.version-card {
  margin: 16px 12px 24px;
  padding: 16px;
  background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
  border-radius: 16px;
  color: white;
}

.version-content {
  width: 100%;
}

.version-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.version-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.version-button {
  width: 100%;
  padding: 8px 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>