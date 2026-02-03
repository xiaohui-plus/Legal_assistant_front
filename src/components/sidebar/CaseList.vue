<template>
  <div class="case-list">
    <div class="list-header">
      <Icon icon="heroicons:academic-cap-20-solid" class="header-icon" />
      <h3 class="list-title">典型案例</h3>
    </div>
    
    <div class="list-content">
      <div 
        v-for="case_ in cases" 
        :key="case_.id"
        class="case-item"
        @click="handleCaseClick(case_)"
      >
        <div class="case-title">{{ case_.title }}</div>
        <div class="case-summary">{{ case_.summary }}</div>
      </div>
      
      <div v-if="cases.length === 0" class="empty-state">
        <Icon icon="heroicons:folder-open-20-solid" class="empty-icon" />
        <div class="empty-text">暂无相关案例</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { Icon } from '@iconify/vue' // 微信小程序不支持

interface CaseItem {
  id: string
  title: string
  summary: string
  court: string
  date: string
  category?: string
}

const cases = ref<CaseItem[]>([
  {
    id: '1',
    title: '某互联网公司架构调整裁员争议案',
    summary: '法院认定企业战略收缩不属于"客观情况发生重大变化"...',
    court: '北京市朝阳区人民法院',
    date: '2023-08-15'
  },
  {
    id: '2',
    title: '自然灾害导致合同无法履行支持案',
    summary: '最高院发布典型指导案例，界定了不可抗力适用范围...',
    court: '上海市浦东新区人民法院',
    date: '2023-07-22'
  }
])

const handleCaseClick = (case_: CaseItem) => {
  // 点击案例的处理逻辑
  uni.showToast({
    title: `查看案例：${case_.title}`,
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.case-list {
  flex: 1;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.header-icon {
  font-size: 16px;
  color: #4F46E5;
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
}

.list-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.case-item {
  cursor: pointer;
  padding: 0;
  border: none;
  background: transparent;
  
  &:hover {
    .case-title {
      color: #4F46E5;
    }
  }
}

.case-title {
  font-size: 12px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 4px;
  transition: color 0.2s ease;
}

.case-summary {
  font-size: 11px;
  color: #94A3B8;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.case-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #94A3B8;
}

.case-court {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.case-date {
  flex-shrink: 0;
  margin-left: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  color: #94A3B8;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 12px;
  text-align: center;
}
</style>