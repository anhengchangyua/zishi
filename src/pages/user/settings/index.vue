<template>
  <view class="settings-page">
    <view class="page-content">
      <text class="title">设置</text>
      <text class="subtitle">正在开发中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('设置页面加载')
})
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background-color: $background-color;
  
  .page-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-xxl;
    
    .title {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $text-color;
      margin-bottom: $spacing-md;
    }
    
    .subtitle {
      font-size: $font-size-md;
      color: $text-color-light;
    }
  }
}
</style>