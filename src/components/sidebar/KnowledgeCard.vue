<template>
  <div class="knowledge-card">
    <div class="card-header">
      <Icon icon="heroicons:bookmark-20-solid" class="header-icon" />
      <h3 class="card-title">知识卡片</h3>
    </div>
    
    <div class="card-content">
      <h4 class="section-title">相关法条</h4>
      <div 
        v-for="law in laws" 
        :key="law.id"
        class="law-item"
        @click="handleLawClick(law)"
      >
        <div class="law-content">{{ law.content }}</div>
      </div>
      
      <div v-if="laws.length === 0" class="empty-state">
        <Icon icon="heroicons:document-text-20-solid" class="empty-icon" />
        <div class="empty-text">暂无相关法条</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

interface LawItem {
  id: string
  title: string
  content: string
  article?: string
}

const laws = ref<LawItem[]>([
  {
    id: '1',
    title: '劳动合同法第40条',
    content: '《劳动合同法》第40条：客观情况发生重大变化...'
  },
  {
    id: '2', 
    title: '民法典第一千一百六十五条',
    content: '《民法典》第一千一百六十五条...'
  }
])

const handleLawClick = (law: LawItem) => {
  // 点击法条的处理逻辑
  uni.showToast({
    title: `查看${law.title}`,
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.knowledge-card {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.header-icon {
  font-size: 16px;
  color: #4F46E5;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.law-item {
  background: white;
  border: 1px solid #F1F5F9;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #E2E8F0;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }
}

.law-content {
  font-size: 14px;
  color: #64748B;
  line-height: 1.4;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
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