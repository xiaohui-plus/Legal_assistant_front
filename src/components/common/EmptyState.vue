<template>
  <view class="empty-state">
    <!-- 图标 -->
    <view class="empty-state__icon">
      <text class="icon-text">{{ icon }}</text>
    </view>

    <!-- 标题 -->
    <view v-if="title" class="empty-state__title">
      {{ title }}
    </view>

    <!-- 描述文字 -->
    <view v-if="description" class="empty-state__description">
      {{ description }}
    </view>

    <!-- 操作按钮 -->
    <view v-if="buttonText" class="empty-state__button" @click="handleButtonClick">
      {{ buttonText }}
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 空状态组件
 * 验证需求 1.7: WHEN 会话列表为空，THE 应用系统 SHALL 显示空状态引导界面
 * 
 * 设计规范：
 * - 居中布局
 * - 图标：slate-300 颜色
 * - 文字：slate-500
 * - 引导按钮：indigo-600 背景
 */

interface Props {
  // 图标（使用 emoji 或文字图标）
  icon?: string
  // 标题
  title?: string
  // 描述文字
  description?: string
  // 按钮文字
  buttonText?: string
}

interface Emits {
  (e: 'buttonClick'): void
}

const props = withDefaults(defineProps<Props>(), {
  icon: '📭',
  title: '暂无数据',
  description: '',
  buttonText: ''
})

const emit = defineEmits<Emits>()

const handleButtonClick = () => {
  emit('buttonClick')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  min-height: 400rpx;

  &__icon {
    font-size: 120rpx;
    margin-bottom: 32rpx;
    color: #CBD5E1; // slate-300
    
    .icon-text {
      font-size: 120rpx;
    }
  }

  &__title {
    font-size: 32rpx;
    font-weight: 500;
    color: #64748B; // slate-500
    margin-bottom: 16rpx;
    text-align: center;
  }

  &__description {
    font-size: 28rpx;
    color: #64748B; // slate-500
    text-align: center;
    line-height: 1.6;
    margin-bottom: 32rpx;
    max-width: 500rpx;
  }

  &__button {
    background-color: #4F46E5; // indigo-600
    color: #FFFFFF;
    padding: 24rpx 48rpx;
    border-radius: 24rpx; // rounded-xl
    font-size: 30rpx;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 8rpx 16rpx -4rpx rgba(79, 70, 229, 0.2);

    &:active {
      transform: scale(0.95);
      background-color: #4338CA; // indigo-700
    }
  }
}
</style>
