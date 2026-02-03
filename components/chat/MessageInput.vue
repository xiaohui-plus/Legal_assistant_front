<template>
  <view class="message-input-wrapper">
    <view class="input-box" :class="{ 'is-focused': isFocused }">
      <view class="attach-btn" @click="handleAttach">
        <text class="icon">📎</text>
      </view>
      
      <textarea
        v-model="inputText"
        class="input-textarea"
        placeholder="在这里描述您的法律诉求或问题..."
        :auto-height="true"
        :maxlength="1000"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @confirm="handleSend"
      />
      
      <view class="action-buttons">
        <view class="voice-btn" @click="handleVoice">
          <text class="icon">🎤</text>
        </view>
        <view 
          class="send-btn" 
          :class="{ 'is-disabled': !canSend }"
          @click="handleSend"
        >
          <text class="icon">✈️</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  send: [content: string]
  attach: []
  voice: []
}>()

const inputText = ref('')
const isFocused = ref(false)

const canSend = computed(() => {
  return inputText.value.trim().length > 0
})

const handleSend = () => {
  if (!canSend.value) return
  
  emit('send', inputText.value.trim())
  inputText.value = ''
}

const handleAttach = () => {
  emit('attach')
}

const handleVoice = () => {
  emit('voice')
}
</script>

<style lang="scss" scoped>
.message-input-wrapper {
  max-width: 1200rpx;
  margin: 0 auto;
  position: relative;
}

.input-box {
  background-color: #FFFFFF;
  border: 4rpx solid #E2E8F0;
  border-radius: 32rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.08);
  padding: 16rpx;
  display: flex;
  align-items: flex-end;
  transition: border-color 0.3s;
  
  &.is-focused {
    border-color: #6366F1;
  }
}

.attach-btn {
  padding: 24rpx;
  color: #94A3B8;
  transition: color 0.3s;
  
  &:active {
    color: #6366F1;
  }
}

.input-textarea {
  flex: 1;
  padding: 16rpx 24rpx;
  font-size: 30rpx;
  color: #475569;
  line-height: 1.5;
  max-height: 320rpx;
  min-height: 48rpx;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 8rpx;
}

.voice-btn {
  padding: 24rpx;
  color: #94A3B8;
  transition: color 0.3s;
  
  &:active {
    color: #6366F1;
  }
}

.send-btn {
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  padding: 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 16rpx rgba(79, 70, 229, 0.1);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.icon {
  font-size: 48rpx;
}
</style>
