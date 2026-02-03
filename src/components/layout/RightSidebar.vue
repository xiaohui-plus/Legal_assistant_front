<template>
  <div class="right-sidebar">
    <div class="sidebar-content">
      <!-- 知识卡片区域 -->
      <KnowledgeCard />
      
      <!-- 典型案例区域 -->
      <CaseList />
    </div>
    
    <!-- 底部认证标识 -->
    <div class="certification-footer">
      <div class="cert-image">
        <Icon icon="heroicons:shield-check-20-solid" />
      </div>
      <div class="cert-text">
        已通过2026年度法律知识库权威审计
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { Icon } from '@iconify/vue' // 微信小程序不支持
import KnowledgeCard from '../sidebar/KnowledgeCard.vue'
import CaseList from '../sidebar/CaseList.vue'
</script>

<style lang="scss" scoped>
.right-sidebar {
  width: 320px;
  height: 100vh;
  background: white;
  border-left: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 100;
}

.sidebar-content {
  flex: 1;
  padding: 24px 20px 0;
  overflow-y: auto;
  
  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }
  
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.certification-footer {
  padding: 24px 20px;
  border-top: 1px solid #F1F5F9;
  background: #FAFBFC;
  text-align: center;
}

.cert-image {
  width: 64px;
  height: 64px;
  margin: 0 auto 8px;
  opacity: 0.2;
  filter: grayscale(100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #64748B;
}

.cert-text {
  font-size: 10px;
  color: #94A3B8;
  line-height: 1.4;
}
</style>