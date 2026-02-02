<template>
  <view class="message-input-container">
    <view class="input-wrapper" :class="{ focused: isFocused }">
      <!-- 附件按钮 -->
      <view class="action-button" @click="handleAttachment">
        <text class="button-icon">📎</text>
      </view>
      
      <!-- 输入框 -->
      <textarea
        v-model="inputValue"
        class="input-field"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :auto-height="true"
        :show-confirm-bar="false"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @confirm="handleSend"
      />
      
      <!-- 右侧操作按钮 -->
      <view class="right-actions">
        <!-- 语音按钮 -->
        <view class="action-button" @click="handleVoice">
          <text class="button-icon">🎤</text>
        </view>
        
        <!-- 发送按钮 -->
        <view
          class="send-button"
          :class="{ disabled: !canSend }"
          @click="handleSend"
        >
          <text class="send-icon">✈️</text>
        </view>
      </view>
    </view>
    
    <!-- 免责声明 -->
    <view class="disclaimer">
      <text class="disclaimer-text">AI 生成内容仅供参考，不构成正式法律意见</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  placeholder?: string
  maxLength?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '在这里描述您的法律诉求或问题...',
  maxLength: 1000,
  loading: false
})

const emit = defineEmits<{
  (e: 'send', content: string): void
  (e: 'attachment'): void
  (e: 'voice'): void
}>()

const inputValue = ref('')
const isFocused = ref(false)

const canSend = computed(() => {
  return inputValue.value.trim().length > 0 && !props.loading
})

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}

const handleInput = (e: any) => {
  inputValue.value = e.detail.value
}

const handleSend = () => {
  if (!canSend.value) return
  
  const content = inputValue.value.trim()
  if (content) {
    emit('send', content)
    inputValue.value = ''
  }
}

const handleAttachment = () => {
  emit('attachment')
}

const handleVoice = () => {
  emit('voice')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.message-input-container {
  padding: 48rpx;
  background-color: transparent;
}

.input-wrapper {
  max-width: 1280rpx; // max-w-4xl
  margin: 0 auto;
  background-color: $bg-color;
  border: 4rpx solid #E2E8F0;
  border-radius: 32rpx;
  padding: 16rpx;
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
  transition: border-color 0.3s;
  box-shadow: 0 16rpx 32rpx rgba(0, 0, 0, 0.1);
  
  &.focused {
    border-color: #4F46E5;
  }
}

.action-button {
  padding: 24rpx;
  color: #94A3B8;
  transition: color 0.3s;
  cursor: pointer;
  
  &:hover {
    color: #4F46E5;
  }
}

.button-icon {
  font-size: 48rpx;
  display: block;
}

.input-field {
  flex: 1;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  color: #334155;
  line-height: 1.6;
  max-height: 320rpx; // max-h-40
  min-height: 48rpx;
  border: none;
  background-color: transparent;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 8rpx;
}

.send-button {
  background-color: #4F46E5;
  color: $text-color-white;
  padding: 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 16rpx rgba(79, 70, 229, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.disabled {
    background-color: #CBD5E1;
    cursor: not-allowed;
    
    &:active {
      transform: none;
    }
  }
}

.send-icon {
  font-size: 48rpx;
  display: block;
}

.disclaimer {
  text-align: center;
  margin-top: 24rpx;
}

.disclaimer-text {
  font-size: 20rpx;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 4rpx;
}
</style>
