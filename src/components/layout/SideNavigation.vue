<template>
  <view class="side-navigation">
    <!-- 品牌区域 -->
    <view class="brand-section">
      <view class="brand-icon">
        <text class="icon">⚖️</text>
      </view>
      <text class="brand-text">法义AI</text>
    </view>

    <!-- 导航菜单 -->
    <view class="nav-menu">
      <view
        v-for="item in navItems"
        :key="item.id"
        class="nav-item"
        :class="{ active: activeNav === item.id }"
        @click="handleNavClick(item.id)"
      >
        <text class="nav-icon">{{ item.icon }}</text>
        <text class="nav-label">{{ item.label }}</text>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version-section">
      <view class="version-card">
        <text class="version-label">当前版本</text>
        <text class="version-number">法义AI 专业版 v2.4</text>
        <view class="version-button" @click="handleViewChangelog">
          查看更新日志
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface NavItem {
  id: string
  label: string
  icon: string
}

const props = defineProps<{
  activeNav?: string
}>()

const emit = defineEmits<{
  (e: 'nav-change', navId: string): void
  (e: 'view-changelog'): void
}>()

const activeNav = ref(props.activeNav || 'chat')

const navItems: NavItem[] = [
  { id: 'chat', label: '法律咨询', icon: '💬' },
  { id: 'document', label: '文书生成', icon: '📄' },
  { id: 'search', label: '案例库检索', icon: '🔍' },
  { id: 'history', label: '历史记录', icon: '🕐' }
]

const handleNavClick = (navId: string) => {
  activeNav.value = navId
  emit('nav-change', navId)
}

const handleViewChangelog = () => {
  emit('view-changelog')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.side-navigation {
  width: 512rpx; // 256px
  height: 100vh;
  background-color: $bg-color;
  border-right: 2rpx solid #E2E8F0;
  display: flex;
  flex-direction: column;
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
  background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 16rpx rgba(79, 70, 229, 0.2);
  
  .icon {
    font-size: 48rpx;
  }
}

.brand-text {
  font-size: 40rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  flex: 1;
  padding: 0 32rpx;
  margin-top: 32rpx;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;
  border-radius: 24rpx;
  color: #475569;
  transition: all 0.3s;
  cursor: pointer;
  
  &.active {
    background-color: #EEF2FF;
    color: #4F46E5;
    font-weight: 500;
  }
  
  &:not(.active):hover {
    background-color: #F8FAFC;
  }
}

.nav-icon {
  font-size: 40rpx;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  font-size: 28rpx;
}

.version-section {
  padding: 32rpx;
  border-top: 2rpx solid #F1F5F9;
}

.version-card {
  background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
  border-radius: 32rpx;
  padding: 32rpx;
  color: $text-color-white;
}

.version-label {
  font-size: 20rpx;
  opacity: 0.8;
  display: block;
  margin-bottom: 8rpx;
}

.version-number {
  font-size: 28rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 24rpx;
}

.version-button {
  width: 100%;
  padding: 16rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  text-align: center;
  font-size: 24rpx;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
}
</style>
