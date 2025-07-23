// pages/index/index.js
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { store } from '../../store/index'
import storeService from '../../services/store'
import Toast from '@vant/weapp/toast/toast'

Page({
  behaviors: [storeBindingsBehavior],
  
  storeBindings: {
    store,
    fields: {
      currentCity: 'currentCity',
      location: 'location',
      isLogin: 'isLogin'
    },
    actions: {
      setCurrentCity: 'setCurrentCity',
      setLocation: 'setLocation',
      setStoreList: 'setStoreList'
    }
  },

  data: {
    // 搜索相关
    searchKeyword: '',
    
    // 店铺数据
    storeList: [],
    recommendedStores: [],
    
    // 分页相关
    page: 1,
    hasMore: true,
    loading: false,
    loadingMore: false,
    
    // 排序筛选
    sortBy: 'distance',
    
    // 城市选择
    showCityPicker: false,
    cityList: ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉'],
    
    // 搜索防抖
    searchTimer: null
  },

  onLoad(options) {
    console.log('首页加载', options)
    this.initPage()
  },

  onShow() {
    console.log('首页显示')
    // 每次显示时刷新数据
    this.refreshData()
  },

  onReady() {
    // 页面渲染完成
  },

  onPullDownRefresh() {
    console.log('下拉刷新')
    this.refreshData()
  },

  onReachBottom() {
    console.log('上拉加载更多')
    this.loadMoreStores()
  },

  // 初始化页面
  async initPage() {
    try {
      // 获取位置信息
      await this.getCurrentLocation()
      
      // 获取推荐店铺
      this.getRecommendedStores()
      
      // 获取店铺列表
      this.getStoreList(true)
    } catch (error) {
      console.error('页面初始化失败:', error)
    }
  },

  // 获取当前位置
  async getCurrentLocation() {
    try {
      const location = await this.getLocation()
      this.setLocation(location)
      
      // 根据位置获取城市信息
      const city = await this.getCityByLocation(location)
      if (city && city !== this.data.currentCity) {
        this.setCurrentCity(city)
      }
    } catch (error) {
      console.error('获取位置失败:', error)
      Toast.fail('定位失败，请手动选择城市')
    }
  },

  // 获取位置信息
  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          const { latitude, longitude } = res
          resolve({ latitude, longitude })
        },
        fail: (error) => {
          if (error.errMsg.includes('auth deny')) {
            // 用户拒绝授权
            wx.showModal({
              title: '位置权限',
              content: '需要获取您的位置信息来推荐附近的自习室',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting()
                }
              }
            })
          }
          reject(error)
        }
      })
    })
  },

  // 根据坐标获取城市
  async getCityByLocation(location) {
    // 这里应该调用地图API进行逆地理编码
    // 简化处理，返回默认城市
    return '北京'
  },

  // 获取推荐店铺
  async getRecommendedStores() {
    try {
      const params = {
        city: this.data.currentCity,
        latitude: this.data.location?.latitude,
        longitude: this.data.location?.longitude
      }
      
      const result = await storeService.getRecommendedStores(params)
      this.setData({
        recommendedStores: result.list || []
      })
    } catch (error) {
      console.error('获取推荐店铺失败:', error)
    }
  },

  // 获取店铺列表
  async getStoreList(refresh = false) {
    if (this.data.loading || this.data.loadingMore) return
    
    const page = refresh ? 1 : this.data.page
    
    this.setData({
      loading: refresh,
      loadingMore: !refresh && page > 1
    })

    try {
      const params = {
        city: this.data.currentCity,
        page,
        limit: 10,
        keyword: this.data.searchKeyword,
        latitude: this.data.location?.latitude,
        longitude: this.data.location?.longitude,
        sortBy: this.data.sortBy
      }

      const result = await storeService.getStoreList(params)
      
      const storeList = refresh ? result.list : [...this.data.storeList, ...result.list]
      
      this.setData({
        storeList,
        page: page + 1,
        hasMore: result.hasMore,
        loading: false,
        loadingMore: false
      })
      
      // 更新全局状态
      this.setStoreList(storeList)
      
      if (refresh) {
        wx.stopPullDownRefresh()
      }
    } catch (error) {
      console.error('获取店铺列表失败:', error)
      this.setData({
        loading: false,
        loadingMore: false
      })
      
      if (refresh) {
        wx.stopPullDownRefresh()
      }
      
      Toast.fail('获取数据失败，请重试')
    }
  },

  // 刷新数据
  refreshData() {
    this.setData({
      page: 1,
      hasMore: true
    })
    this.getStoreList(true)
    this.getRecommendedStores()
  },

  // 加载更多店铺
  loadMoreStores() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.getStoreList(false)
    }
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ searchKeyword: keyword })
    
    // 防抖搜索
    clearTimeout(this.data.searchTimer)
    const timer = setTimeout(() => {
      this.performSearch()
    }, 500)
    
    this.setData({ searchTimer: timer })
  },

  // 搜索确认
  onSearchConfirm() {
    clearTimeout(this.data.searchTimer)
    this.performSearch()
  },

  // 执行搜索
  performSearch() {
    this.setData({
      page: 1,
      hasMore: true
    })
    this.getStoreList(true)
  },

  // 城市选择
  onCitySelect() {
    this.setData({ showCityPicker: true })
  },

  // 城市选择器关闭
  onCityPickerClose() {
    this.setData({ showCityPicker: false })
  },

  // 城市改变
  onCityChange(e) {
    const city = e.currentTarget.dataset.city
    this.setCurrentCity(city)
    this.setData({ showCityPicker: false })
    
    // 切换城市后刷新数据
    this.refreshData()
    
    Toast.success(`已切换到${city}`)
  },

  // 排序改变
  onSortChange(e) {
    const sortBy = e.currentTarget.dataset.sort
    if (sortBy === this.data.sortBy) return
    
    this.setData({ sortBy })
    this.refreshData()
  },

  // 店铺卡片点击
  onStoreCardTap(e) {
    const store = e.currentTarget.dataset.store
    wx.navigateTo({
      url: `/pages/store/detail/index?id=${store.id}`
    })
  },

  // 收藏点击
  async onFavoriteTap(e) {
    e.stopPropagation()
    
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/common/login/index'
      })
      return
    }
    
    const storeId = e.currentTarget.dataset.storeId
    const isFavorite = e.currentTarget.dataset.favorite
    
    try {
      if (isFavorite) {
        await storeService.unfavoriteStore(storeId)
        Toast.success('取消收藏')
      } else {
        await storeService.favoriteStore(storeId)
        Toast.success('收藏成功')
      }
      
      // 更新列表中的收藏状态
      const storeList = this.data.storeList.map(store => {
        if (store.id === storeId) {
          return { ...store, isFavorite: !isFavorite }
        }
        return store
      })
      
      this.setData({ storeList })
    } catch (error) {
      console.error('收藏操作失败:', error)
      Toast.fail('操作失败，请重试')
    }
  },

  // 电话点击
  onCallTap(e) {
    e.stopPropagation()
    const phone = e.currentTarget.dataset.phone
    
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        Toast.fail('拨打电话失败')
      }
    })
  },

  // 位置点击
  onLocationTap() {
    this.getCurrentLocation()
  },

  // 快速预订
  onQuickBook() {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/common/login/index'
      })
      return
    }
    
    // 跳转到快速预订页面
    wx.navigateTo({
      url: '/pages/store/booking/index?quick=true'
    })
  },

  // 附近门店
  onNearbyStores() {
    if (!this.data.location) {
      Toast.fail('请先获取位置信息')
      this.getCurrentLocation()
      return
    }
    
    // 筛选附近门店
    this.setData({ sortBy: 'distance' })
    this.refreshData()
  },

  // 我的订单
  onMyOrders() {
    wx.switchTab({
      url: '/pages/order/list/index'
    })
  },

  // 会员中心
  onMembership() {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/common/login/index'
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/user/membership/index'
    })
  },

  // 查看更多
  onViewMore(e) {
    const type = e.currentTarget.dataset.type
    console.log('查看更多:', type)
    // 可以跳转到专门的列表页面
  },

  // 刷新
  onRefresh() {
    this.refreshData()
  },

  onUnload() {
    // 清理定时器
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer)
    }
  }
})