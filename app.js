// app.js
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { store } from './store/index'

App({
  behaviors: [storeBindingsBehavior],
  
  storeBindings: {
    store,
    fields: {
      userInfo: 'userInfo',
      isLogin: 'isLogin'
    },
    actions: {
      updateUserInfo: 'updateUserInfo'
    }
  },

  globalData: {
    version: '1.0.0',
    apiBase: 'https://api.zishi.com/v1'
  },

  onLaunch(options) {
    console.log('小程序启动', options)
    
    // 检查登录状态
    this.checkLoginStatus()
    
    // 获取系统信息
    this.getSystemInfo()
    
    // 检查更新
    this.checkForUpdate()
  },

  onShow(options) {
    console.log('小程序显示', options)
  },

  onHide() {
    console.log('小程序隐藏')
  },

  onError(msg) {
    console.error('小程序错误', msg)
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    if (token) {
      // 验证token有效性
      wx.checkSession({
        success: () => {
          console.log('session有效')
          // 获取用户信息
          this.getUserInfo()
        },
        fail: () => {
          console.log('session失效，清除本地数据')
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
        }
      })
    }
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.updateUserInfo(userInfo)
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  },

  // 获取系统信息
  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res
        console.log('系统信息', res)
      }
    })
  },

  // 检查小程序更新
  checkForUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('发现新版本')
        }
      })
      
      updateManager.onUpdateReady(() => {
        wx.showModal({
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
        wx.showToast({
          title: '更新失败',
          icon: 'none'
        })
      })
    }
  }
})