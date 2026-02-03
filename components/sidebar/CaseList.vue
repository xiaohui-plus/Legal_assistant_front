<template>
  <view class="case-list">
    <view class="list-header">
      <text class="header-icon">🎓</text>
      <text class="header-title">典型案例</text>
    </view>

    <view class="cases">
      <view 
        v-for="(caseItem, index) in cases" 
        :key="index"
        class="case-item"
        @click="handleCaseClick(caseItem)"
      >
        <text class="case-title">{{ caseItem.title }}</text>
        <text class="case-desc">{{ caseItem.description }}</text>
      </view>
    </view>

    <!-- 底部认证标识 -->
    <view class="certification">
      <image 
        class="cert-image" 
        src="/static/images/certification.png" 
        mode="aspectFit"
      />
      <text class="cert-text">已通过2026年度法律知识库权威审计</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface CaseItem {
  title: string
  description: string
  id?: string
}

interface Props {
  cases?: CaseItem[]
}

const props = withDefaults(defineProps<Props>(), {
  cases: () => [
    {
      title: '某互联网公司架构调整裁员争议案',
      description: '法院认定企业战略收缩不属于"客观情况发生重大变化"...'
    },
    {
      title: '自然灾害导致合同无法履行支持案',
      description: '最高院发布典型指导案例，界定了不可抗力适用范围...'
    }
  ]
})

const handleCaseClick = (caseItem: CaseItem) => {
  uni.showToast({
    title: '查看案例详情',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.case-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.header-icon {
  font-size: 32rpx;
  color: #6366F1;
}

.header-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1E293B;
}

.cases {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.case-item {
  cursor: pointer;
  transition: all 0.3s;
  
  &:active {
    opacity: 0.7;
  }
}

.case-title {
  font-size: 24rpx;
  font-weight: 500;
  color: #475569;
  line-height: 1.5;
  display: block;
  margin-bottom: 8rpx;
  transition: color 0.3s;
  
  .case-item:active & {
    color: #6366F1;
  }
}

.case-desc {
  font-size: 22rpx;
  color: #94A3B8;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.certification {
  margin-top: 48rpx;
  padding-top: 48rpx;
  border-top: 1rpx solid #E2E8F0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.cert-image {
  width: 128rpx;
  height: 128rpx;
  opacity: 0.2;
  filter: grayscale(100%);
}

.cert-text {
  font-size: 20rpx;
  color: #94A3B8;
}
</style>
