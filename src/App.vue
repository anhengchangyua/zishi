<template>
  <view class="app">
    <!-- 这里是应用的根容器 -->
  </view>
</template>

<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onLaunch(() => {
  console.log('意涵自习室应用启动')
  
  // 检查登录状态
  checkLoginStatus()
  
  // 获取系统信息
  getSystemInfo()
  
  // 检查更新
  checkForUpdate()
})

onShow(() => {
  console.log('应用显示')
})

onHide(() => {
  console.log('应用隐藏')
})

// 检查登录状态
const checkLoginStatus = () => {
  const token = uni.getStorageSync('token')
  if (token) {
    // 验证token有效性
    uni.checkSession({
      success: () => {
        console.log('session有效')
        getUserInfo()
      },
      fail: () => {
        console.log('session失效，清除本地数据')
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
      }
    })
  }
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      userStore.setUserInfo(userInfo)
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

// 获取系统信息
const getSystemInfo = () => {
  uni.getSystemInfo({
    success: (res) => {
      console.log('系统信息', res)
      userStore.setSystemInfo(res)
    }
  })
}

// 检查应用更新
const checkForUpdate = () => {
  // #ifdef MP-WEIXIN
  if (uni.canIUse('getUpdateManager')) {
    const updateManager = uni.getUpdateManager()

    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        console.log('发现新版本')
      }
    })

    updateManager.onUpdateReady(() => {
      uni.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(() => {
      uni.showToast({
        title: '更新失败',
        icon: 'none'
      })
    })
  }
  // #endif
}
</script>

<style lang="scss">
/* 应用全局样式 */
.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
</style>