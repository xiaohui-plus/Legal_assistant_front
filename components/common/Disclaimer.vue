<template>
  <view class="disclaimer" :class="{ 'disclaimer--full': fullVersion }">
    <text class="disclaimer__text">{{ disclaimerText }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  fullVersion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fullVersion: false
})

const disclaimerText = computed(() => {
  if (props.fullVersion) {
    return `法律免责声明

本应用提供的法律咨询和文书生成服务仅供参考，不构成正式法律意见。

1. 本应用通过人工智能技术提供法律信息和文书模板，但不能替代专业律师的法律服务。

2. 用户在使用本应用生成的法律文书前，应当咨询专业律师进行审核和修改。

3. 本应用不对用户使用本应用提供的信息和文书所产生的任何法律后果承担责任。

4. 本应用提供的法律信息可能因法律法规的变化而过时，用户应当以最新的法律法规为准。

5. 用户在使用本应用时，应当遵守相关法律法规，不得利用本应用从事违法活动。

如有法律问题，建议咨询专业律师。`
  }
  
  return 'AI生成内容仅供参考，不构成正式法律意见'
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.disclaimer {
  text-align: center;
  padding: 16rpx 32rpx;
  
  &__text {
    font-size: 20rpx;
    color: $color-text-secondary;
    line-height: 1.6;
    text-transform: uppercase;
    letter-spacing: 2rpx;
  }
  
  &--full {
    text-align: left;
    padding: 48rpx 32rpx;
    
    .disclaimer__text {
      font-size: 28rpx;
      text-transform: none;
      letter-spacing: normal;
      white-space: pre-line;
    }
  }
}
</style>
