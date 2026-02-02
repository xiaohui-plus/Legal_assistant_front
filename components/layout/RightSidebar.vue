<template>
  <view class="right-sidebar">
    <!-- 知识卡片区域 -->
    <view class="section knowledge-section">
      <view class="section-header">
        <text class="section-icon">🔖</text>
        <text class="section-title">知识卡片</text>
      </view>
      
      <view class="knowledge-content">
        <text class="knowledge-subtitle">相关法条</text>
        <view class="law-list">
          <view
            v-for="(law, index) in laws"
            :key="index"
            class="law-item"
            @click="handleLawClick(law)"
          >
            {{ law }}
          </view>
        </view>
      </view>
    </view>

    <!-- 典型案例区域 -->
    <view class="section cases-section">
      <view class="section-header">
        <text class="section-icon">🎓</text>
        <text class="section-title">典型案例</text>
      </view>
      
      <view class="cases-list">
        <view
          v-for="(caseItem, index) in cases"
          :key="index"
          class="case-item"
          @click="handleCaseClick(caseItem)"
        >
          <text class="case-title">{{ caseItem.title }}</text>
          <text class="case-summary">{{ caseItem.summary }}</text>
        </view>
      </view>
    </view>

    <!-- 底部认证信息 -->
    <view class="certification-section">
      <image
        src="/static/images/certification.png"
        class="certification-image"
        mode="aspectFit"
      />
      <text class="certification-text">已通过2026年度法律知识库权威审计</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface CaseItem {
  title: string
  summary: string
}

interface Props {
  laws?: string[]
  cases?: CaseItem[]
}

const props = withDefaults(defineProps<Props>(), {
  laws: () => [
    '《劳动合同法》第40条：客观情况发生重大变化...',
    '《民法典》第一千一百六十五条...'
  ],
  cases: () => [
    {
      title: '某互联网公司架构调整裁员争议案',
      summary: '法院认定企业战略收缩不属于"客观情况发生重大变化"...'
    },
    {
      title: '自然灾害导致合同无法履行支持案',
      summary: '最高院发布典型指导案例，界定了不可抗力适用范围...'
    }
  ]
})

const emit = defineEmits<{
  (e: 'law-click', law: string): void
  (e: 'case-click', caseItem: CaseItem): void
}>()

const handleLawClick = (law: string) => {
  emit('law-click', law)
}

const handleCaseClick = (caseItem: CaseItem) => {
  emit('case-click', caseItem)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.right-sidebar {
  width: 640rpx; // 320px
  height: 100vh;
  background-color: $bg-color;
  border-left: 2rpx solid #E2E8F0;
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  gap: 48rpx;
  overflow-y: auto;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.section-icon {
  font-size: 32rpx;
  color: #4F46E5;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #1E293B;
}

.knowledge-content {
  background-color: #F8FAFC;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.knowledge-subtitle {
  font-size: 24rpx;
  font-weight: bold;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.law-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.law-item {
  font-size: 28rpx;
  padding: 16rpx;
  background-color: $bg-color;
  border-radius: 16rpx;
  border: 2rpx solid #F1F5F9;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #4F46E5;
    color: #4F46E5;
  }
}

.cases-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.case-item {
  cursor: pointer;
  transition: all 0.3s;
  
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

.certification-section {
  margin-top: auto;
  padding-top: 48rpx;
  border-top: 2rpx solid #F1F5F9;
  text-align: center;
}

.certification-image {
  width: 128rpx;
  height: 128rpx;
  opacity: 0.2;
  filter: grayscale(100%);
  margin: 0 auto 16rpx;
}

.certification-text {
  font-size: 20rpx;
  color: #94A3B8;
  display: block;
}
</style>
