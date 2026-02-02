<template>
  <view class="case-list">
    <view
      v-for="(caseItem, index) in cases"
      :key="index"
      class="case-item"
      @click="handleCaseClick(caseItem)"
    >
      <text class="case-title">{{ caseItem.title }}</text>
      <text class="case-summary">{{ caseItem.summary }}</text>
    </view>
    
    <view v-if="cases.length === 0" class="empty-state">
      <text class="empty-text">暂无相关案例</text>
    </view>
  </view>
</template>

<script setup lang="ts">
export interface CaseItem {
  title: string
  summary: string
  id?: string
}

interface Props {
  cases: CaseItem[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'case-click', caseItem: CaseItem): void
}>()

const handleCaseClick = (caseItem: CaseItem) => {
  emit('case-click', caseItem)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.case-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.case-item {
  cursor: pointer;
  transition: all 0.3s;
  padding: 16rpx 0;
  
  &:hover .case-title {
    color: #4F46E5;
  }
}

.case-title {
  font-size: 24rpx;
  font-weight: 500;
  color: #334155;
  display: block;
  margin-bottom: 8rpx;
  transition: color 0.3s;
}

.case-summary {
  font-size: 22rpx;
  color: #94A3B8;
  display: block;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty-state {
  padding: 48rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #94A3B8;
}
</style>
