<template>
  <view class="page">
    <text class="title">Simple Test Page</text>
    <text class="message">If you see this, Vue is working!</text>
  </view>
</template>

<script setup lang="ts">
console.log('Simple test page loaded')
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #4F46E5;
  padding: 20px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
}

.message {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
}
</style>
