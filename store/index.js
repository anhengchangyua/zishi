// store/index.js
import { observable, action } from 'mobx-miniprogram'

export const store = observable({
  // 用户状态
  userInfo: null,
  isLogin: false,
  token: '',
  
  // 位置信息
  currentCity: '北京',
  location: null,
  
  // 应用状态
  loading: false,
  networkStatus: true,
  
  // 订单状态
  currentOrder: null,
  orderList: [],
  
  // 店铺状态
  storeList: [],
  currentStore: null,
  
  // Actions - 用户相关
  updateUserInfo: action(function(userInfo) {
    this.userInfo = userInfo
    this.isLogin = !!userInfo
    if (userInfo) {
      wx.setStorageSync('userInfo', userInfo)
    }
  }),
  
  setToken: action(function(token) {
    this.token = token
    if (token) {
      wx.setStorageSync('token', token)
    } else {
      wx.removeStorageSync('token')
    }
  }),
  
  logout: action(function() {
    this.userInfo = null
    this.isLogin = false
    this.token = ''
    this.orderList = []
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
  }),
  
  // Actions - 位置相关
  setCurrentCity: action(function(city) {
    this.currentCity = city
    wx.setStorageSync('currentCity', city)
  }),
  
  setLocation: action(function(location) {
    this.location = location
    wx.setStorageSync('location', location)
  }),
  
  // Actions - 应用状态
  setLoading: action(function(loading) {
    this.loading = loading
  }),
  
  setNetworkStatus: action(function(status) {
    this.networkStatus = status
  }),
  
  // Actions - 订单相关
  setCurrentOrder: action(function(order) {
    this.currentOrder = order
  }),
  
  setOrderList: action(function(orders) {
    this.orderList = orders
  }),
  
  addOrder: action(function(order) {
    this.orderList.unshift(order)
  }),
  
  updateOrder: action(function(orderId, updates) {
    const index = this.orderList.findIndex(order => order.id === orderId)
    if (index !== -1) {
      Object.assign(this.orderList[index], updates)
    }
  }),
  
  // Actions - 店铺相关
  setStoreList: action(function(stores) {
    this.storeList = stores
  }),
  
  setCurrentStore: action(function(store) {
    this.currentStore = store
  }),
  
  // 初始化数据
  initStore: action(function() {
    // 从缓存恢复数据
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    const currentCity = wx.getStorageSync('currentCity')
    const location = wx.getStorageSync('location')
    
    if (token) {
      this.setToken(token)
    }
    
    if (userInfo) {
      this.updateUserInfo(userInfo)
    }
    
    if (currentCity) {
      this.setCurrentCity(currentCity)
    }
    
    if (location) {
      this.setLocation(location)
    }
  })
})