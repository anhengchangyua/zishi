import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, SystemInfo, LocationInfo } from '@/types'
import { STORAGE_KEYS } from '@/constants'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const systemInfo = ref<SystemInfo | null>(null)
  const location = ref<LocationInfo | null>(null)
  const token = ref<string>('')
  const isLogin = ref<boolean>(false)

  // 计算属性
  const isLoggedIn = computed(() => {
    return !!token.value && !!userInfo.value
  })

  const userName = computed(() => {
    return userInfo.value?.nickname || '未登录'
  })

  const userAvatar = computed(() => {
    return userInfo.value?.avatar || '/static/images/default-avatar.png'
  })

  // 方法
  const setToken = (newToken: string) => {
    token.value = newToken
    isLogin.value = !!newToken
    if (newToken) {
      uni.setStorageSync(STORAGE_KEYS.TOKEN, newToken)
    } else {
      uni.removeStorageSync(STORAGE_KEYS.TOKEN)
    }
  }

  const setUserInfo = (info: UserInfo | null) => {
    userInfo.value = info
    if (info) {
      uni.setStorageSync(STORAGE_KEYS.USER_INFO, info)
    } else {
      uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
    }
  }

  const setSystemInfo = (info: SystemInfo) => {
    systemInfo.value = info
  }

  const setLocation = (locationInfo: LocationInfo) => {
    location.value = locationInfo
    uni.setStorageSync(STORAGE_KEYS.LOCATION, locationInfo)
  }

  const login = async (loginData: { token: string; userInfo: UserInfo }) => {
    setToken(loginData.token)
    setUserInfo(loginData.userInfo)
  }

  const logout = () => {
    setToken('')
    setUserInfo(null)
    // 清除其他相关缓存
    uni.removeStorageSync(STORAGE_KEYS.SEARCH_HISTORY)
    uni.removeStorageSync(STORAGE_KEYS.CART)
  }

  const updateUserInfo = (updates: Partial<UserInfo>) => {
    if (userInfo.value) {
      const newUserInfo = { ...userInfo.value, ...updates }
      setUserInfo(newUserInfo)
    }
  }

  const initFromStorage = () => {
    try {
      const storedToken = uni.getStorageSync(STORAGE_KEYS.TOKEN)
      const storedUserInfo = uni.getStorageSync(STORAGE_KEYS.USER_INFO)
      const storedLocation = uni.getStorageSync(STORAGE_KEYS.LOCATION)

      if (storedToken) {
        setToken(storedToken)
      }
      
      if (storedUserInfo) {
        setUserInfo(storedUserInfo)
      }

      if (storedLocation) {
        setLocation(storedLocation)
      }
    } catch (error) {
      console.error('初始化用户数据失败:', error)
    }
  }

  const getCurrentLocation = async (): Promise<LocationInfo | null> => {
    return new Promise((resolve) => {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          // 获取详细地址信息
          uni.request({
            url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${res.latitude},${res.longitude}&key=YOUR_TENCENT_MAP_KEY`,
            success: (addressRes: any) => {
              const result = addressRes.data?.result
              if (result) {
                const locationInfo: LocationInfo = {
                  latitude: res.latitude,
                  longitude: res.longitude,
                  address: result.address,
                  city: result.address_component.city,
                  district: result.address_component.district,
                  province: result.address_component.province
                }
                setLocation(locationInfo)
                resolve(locationInfo)
              } else {
                resolve(null)
              }
            },
            fail: () => {
              resolve(null)
            }
          })
        },
        fail: () => {
          resolve(null)
        }
      })
    })
  }

  return {
    // 状态
    userInfo,
    systemInfo,
    location,
    token,
    isLogin,
    
    // 计算属性
    isLoggedIn,
    userName,
    userAvatar,
    
    // 方法
    setToken,
    setUserInfo,
    setSystemInfo,
    setLocation,
    login,
    logout,
    updateUserInfo,
    initFromStorage,
    getCurrentLocation
  }
})