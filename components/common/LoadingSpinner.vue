<template>
  <view class="loading-spinner" :class="sizeClass">
    <view class="spinner-circle"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClass = computed(() => `loading-spinner--${props.size}`)
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.loading-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &--sm {
    width: 32rpx;
    height: 32rpx;
    
    .spinner-circle {
      width: 32rpx;
      height: 32rpx;
      border-width: 4rpx;
    }
  }
  
  &--md {
    width: 48rpx;
    height: 48rpx;
    
    .spinner-circle {
      width: 48rpx;
      height: 48rpx;
      border-width: 6rpx;
    }
  }
  
  &--lg {
    width: 64rpx;
    height: 64rpx;
    
    .spinner-circle {
      width: 64rpx;
      height: 64rpx;
      border-width: 8rpx;
    }
  }
}

.spinner-circle {
  border-radius: 50%;
  border-style: solid;
  border-color: $color-primary transparent transparent transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
