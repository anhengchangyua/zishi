import { makeAutoObservable, runInAction } from 'mobx'
import Taro from '@tarojs/taro'

interface UserInfo {
  id?: number
  openid?: string
  nickname?: string
  avatar?: string
  phone?: string
  points?: number
  membershipLevel?: string
}

interface Location {
  latitude: number
  longitude: number
  address?: string
}

interface StoreInfo {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  phone?: string
  rating?: number
  distance?: number
  images?: string[]
  facilities?: string[]
  isFavorite?: boolean
  status?: 'open' | 'closed'
  businessHours?: string
  minPrice?: number
}

interface OrderInfo {
  id: number
  orderNo: string
  storeId: number
  storeName: string
  seatId: number
  startTime: string
  endTime: string
  amount: number
  status: string
  createdAt: string
}

class Store {
  // 用户状态
  userInfo: UserInfo | null = null
  isLogin: boolean = false
  token: string = ''
  
  // 位置信息
  currentCity: string = '北京'
  location: Location | null = null
  
  // 应用状态
  loading: boolean = false
  networkStatus: boolean = true
  
  // 订单状态
  currentOrder: OrderInfo | null = null
  orderList: OrderInfo[] = []
  
  // 店铺状态
  storeList: StoreInfo[] = []
  currentStore: StoreInfo | null = null

  constructor() {
    makeAutoObservable(this)
    this.initStore()
  }

  // Actions - 用户相关
  updateUserInfo = (userInfo: UserInfo | null) => {
    this.userInfo = userInfo
    this.isLogin = !!userInfo
    if (userInfo) {
      Taro.setStorageSync('userInfo', userInfo)
    }
  }

  setToken = (token: string) => {
    this.token = token
    if (token) {
      Taro.setStorageSync('token', token)
    } else {
      Taro.removeStorageSync('token')
    }
  }

  logout = () => {
    this.userInfo = null
    this.isLogin = false
    this.token = ''
    this.orderList = []
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('userInfo')
  }

  // Actions - 位置相关
  setCurrentCity = (city: string) => {
    this.currentCity = city
    Taro.setStorageSync('currentCity', city)
  }

  setLocation = (location: Location | null) => {
    this.location = location
    if (location) {
      Taro.setStorageSync('location', location)
    }
  }

  // Actions - 应用状态
  setLoading = (loading: boolean) => {
    this.loading = loading
  }

  setNetworkStatus = (status: boolean) => {
    this.networkStatus = status
  }

  // Actions - 订单相关
  setCurrentOrder = (order: OrderInfo | null) => {
    this.currentOrder = order
  }

  setOrderList = (orders: OrderInfo[]) => {
    this.orderList = orders
  }

  addOrder = (order: OrderInfo) => {
    this.orderList.unshift(order)
  }

  updateOrder = (orderId: number, updates: Partial<OrderInfo>) => {
    const index = this.orderList.findIndex(order => order.id === orderId)
    if (index !== -1) {
      Object.assign(this.orderList[index], updates)
    }
  }

  // Actions - 店铺相关
  setStoreList = (stores: StoreInfo[]) => {
    this.storeList = stores
  }

  setCurrentStore = (store: StoreInfo | null) => {
    this.currentStore = store
  }

  updateStoreInList = (storeId: number, updates: Partial<StoreInfo>) => {
    const index = this.storeList.findIndex(store => store.id === storeId)
    if (index !== -1) {
      Object.assign(this.storeList[index], updates)
    }
  }

  // 初始化数据
  initStore = () => {
    runInAction(() => {
      // 从缓存恢复数据
      const token = Taro.getStorageSync('token')
      const userInfo = Taro.getStorageSync('userInfo')
      const currentCity = Taro.getStorageSync('currentCity')
      const location = Taro.getStorageSync('location')

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
  }

  // 计算属性
  get isVip() {
    return this.userInfo?.membershipLevel === 'vip'
  }

  get hasLocation() {
    return !!this.location
  }

  get pendingOrders() {
    return this.orderList.filter(order => 
      ['pending_payment', 'paid', 'confirmed'].includes(order.status)
    )
  }

  get completedOrders() {
    return this.orderList.filter(order => 
      ['completed', 'cancelled', 'refunded'].includes(order.status)
    )
  }
}

// 创建store实例
export const store = new Store()

// 导出store类型，用于TypeScript类型推断
export type RootStore = Store