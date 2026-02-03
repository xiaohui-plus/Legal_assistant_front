<template>
  <view class="side-navigation">
    <!-- 品牌区 -->
    <view class="brand-section">
      <view class="brand-icon">
        <text class="icon">⚖️</text>
      </view>
      <text class="brand-name">法义AI</text>
    </view>

    <!-- 导航菜单 -->
    <view class="nav-menu">
      <view 
        v-for="item in navItems" 
        :key="item.key"
        class="nav-item"
        :class="{ 'is-active': currentRoute === item.route }"
        @click="handleNavigate(item.route)"
      >
        <text class="nav-icon">{{ item.icon }}</text>
        <text class="nav-label">{{ item.label }}</text>
      </view>
    </view>

    <!-- 底部信息卡 -->
    <view class="bottom-card">
      <view class="version-card">
        <text class="version-label">当前版本</text>
        <text class="version-number">法义AI 专业版 v2.4</text>
        <view class="update-btn">
          <text class="update-text">查看更新日志</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface NavItem {
  key: string
  label: string
  icon: string
  route: string
}

const currentRoute = ref('/pages/chat/window')

const navItems: NavItem[] = [
  { key: 'chat', label: '法律咨询', icon: '💬', route: '/pages/chat/window' },
  { key: 'document', label: '文书生成', icon: '📄', route: '/pages/document/templates' },
  { key: 'cases', label: '案例库检索', icon: '🔍', route: '/pages/cases/search' },
  { key: 'history', label: '历史记录', icon: '🕐', route: '/pages/chat/list' }
]

const handleNavigate = (route: string) => {
  currentRoute.value = route
  uni.navigateTo({ url: route })
}
</script>

<style lang="scss" scoped>
.side-navigation {
  width: 512rpx;
  background-color: #FFFFFF;
  border-right: 1rpx solid #E2E8F0;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.brand-section {
  padding: 48rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.brand-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(79, 70, 229, 0.2);
  
  .icon {
    font-size: 48rpx;
  }
}

.brand-name {
  font-size: 40rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  flex: 1;
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 32rpx;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-radius: 24rpx;
  transition: all 0.3s;
  cursor: pointer;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.is-active {
    background-color: #EEF2FF;
    color: #4F46E5;
    font-weight: 500;
  }
  
  &:not(.is-active) {
    color: #64748B;
    
    &:hover {
      background-color: #F8FAFC;
    }
  }
}

.nav-icon {
  font-size: 40rpx;
}

.nav-label {
  font-size: 30rpx;
}

.bottom-card {
  padding: 32rpx;
  border-top: 1rpx solid #F1F5F9;
}

.version-card {
  background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
  border-radius: 32rpx;
  padding: 32rpx;
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.version-label {
  font-size: 24rpx;
  opacity: 0.8;
}

.version-number {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.update-btn {
  width: 100%;
  padding: 16rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  text-align: center;
  transition: all 0.3s;
  
  &:active {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.update-text {
  font-size: 24rpx;
}
</style>
