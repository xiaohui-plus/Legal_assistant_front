<template>
  <view class="min-h-screen bg-slate-50 p-6">
    <!-- Header with backdrop blur -->
    <view class="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <view class="flex items-center justify-between px-6 h-full">
        <text class="text-lg font-semibold text-slate-900">法律助手</text>
        <view class="w-10 h-10 bg-slate-200 rounded-lg"></view>
      </view>
    </view>

    <!-- Content Area -->
    <view class="pt-20 space-y-6">
      <!-- Card Example -->
      <view class="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <text class="text-lg font-semibold text-slate-900">卡片标题</text>
        <text class="text-sm text-slate-600 mt-2 line-clamp-2">
          这是一个使用 Tailwind CSS 风格工具类的卡片示例。支持圆角、阴影、边框等样式。
        </text>
      </view>

      <!-- AI Message Bubble -->
      <view class="flex items-start space-x-3">
        <view class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <text class="text-white text-sm">AI</text>
        </view>
        <view class="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <text class="text-slate-700">这是 AI 的回复消息，使用白色背景和边框样式。</text>
        </view>
      </view>

      <!-- User Message Bubble -->
      <view class="flex items-start justify-end space-x-3">
        <view class="max-w-[80%] bg-indigo-600 rounded-2xl p-4 shadow-md shadow-indigo-100">
          <text class="text-white">这是用户的消息，使用 indigo-600 背景色。</text>
        </view>
        <view class="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
          <text class="text-slate-600 text-sm">U</text>
        </view>
      </view>

      <!-- Button Examples -->
      <view class="space-y-3">
        <view class="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-md text-center transition-all">
          <text class="text-white font-medium">主要按钮</text>
        </view>
        
        <view class="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl text-center transition-all">
          <text class="text-slate-700 font-medium">次要按钮</text>
        </view>
      </view>

      <!-- Input Example -->
      <view class="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-xl">
        <textarea 
          class="w-full text-base text-slate-900" 
          placeholder="输入消息..."
          placeholder-class="text-slate-400"
        />
      </view>

      <!-- Grid Example -->
      <view class="grid grid-cols-2 gap-4">
        <view class="bg-indigo-50 rounded-xl p-4 text-center">
          <text class="text-indigo-700 font-semibold">网格项 1</text>
        </view>
        <view class="bg-indigo-50 rounded-xl p-4 text-center">
          <text class="text-indigo-700 font-semibold">网格项 2</text>
        </view>
      </view>

      <!-- Badge Examples -->
      <view class="flex items-center space-x-2">
        <view class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
          <text class="text-xs font-medium text-indigo-700">标签 1</text>
        </view>
        <view class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
          <text class="text-xs font-medium text-slate-700">标签 2</text>
        </view>
        <view class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
          <text class="text-xs font-medium text-orange-700">警告</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 这是一个示例文件，展示如何使用 Tailwind CSS 风格的工具类
</script>

<style lang="scss">
@import './common.scss';
</style>
