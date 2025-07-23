// services/store.js
import request from '../utils/request'

class StoreService {
  // 获取店铺列表
  async getStoreList(params = {}) {
    const {
      city = '北京',
      page = 1,
      limit = 10,
      keyword = '',
      latitude,
      longitude,
      sortBy = 'distance' // distance, rating, price
    } = params

    try {
      const result = await request.get('/stores', {
        city,
        page,
        limit,
        keyword,
        latitude,
        longitude,
        sort_by: sortBy
      })
      return result
    } catch (error) {
      throw error
    }
  }

  // 获取附近店铺
  async getNearbyStores(location, radius = 5000) {
    const { latitude, longitude } = location
    
    try {
      const result = await request.get('/stores/nearby', {
        latitude,
        longitude,
        radius
      })
      return result
    } catch (error) {
      throw error
    }
  }

  // 获取店铺详情
  async getStoreDetail(storeId) {
    try {
      const result = await request.get(`/stores/${storeId}`)
      return result
    } catch (error) {
      throw error
    }
  }

  // 获取店铺座位列表
  async getSeatList(storeId, params = {}) {
    const {
      date,
      startTime,
      endTime,
      seatType = 'all' // all, single, double, group
    } = params

    try {
      const result = await request.get(`/stores/${storeId}/seats`, {
        date,
        start_time: startTime,
        end_time: endTime,
        seat_type: seatType
      })
      return result
    } catch (error) {
      throw error
    }
  }

  // 获取可用座位
  async getAvailableSeats(storeId, params) {
    const {
      date,
      startTime,
      endTime,
      duration
    } = params

    try {
      const result = await request.get(`/stores/${storeId}/available-seats`, {
        date,
        start_time: startTime,
        end_time: endTime,
        duration
      })
      return result
    } catch (error) {
      throw error
    }
  }

  // 获取座位详情
  async getSeatDetail(storeId, seatId) {
    try {
      const result = await request.get(`/stores/${storeId}/seats/${seatId}`)
      return result
    } catch (error) {
      throw error
    }
  }

  // 检查座位可用性
  async checkSeatAvailability(storeId, seatId, params) {
    const {
      date,
      startTime,
      endTime
    } = params

    try {
      const result = await request.post(`/stores/${storeId}/seats/${seatId}/check`, {
        date,
        start_time: startTime,
        end_time: endTime
      })
      return result
    } catch (error) {
      throw error
    }
  }

  // 预锁定座位（临时占用）
  async lockSeat(storeId, seatId, params) {
    const {
      date,
      startTime,
      endTime,
      duration = 300 // 锁定时长，秒
    } = params

    try {
      const result = await request.post(`/stores/${storeId}/seats/${seatId}/lock`, {
        date,
        start_time: startTime,
        end_time: endTime,
        lock_duration: duration
      })
      return result
    } catch (error) {
      throw error
    }
  }

  // 释放座位锁定
  async unlockSeat(storeId, seatId, lockId) {
    try {
      const result = await request.post(`/stores/${storeId}/seats/${seatId}/unlock`, {
        lock_id: lockId
      })
      return result
    } catch (error) {
      throw error
    }
  }

  // 获取店铺营业时间
  async getBusinessHours(storeId, date) {
    try {
      const result = await request.get(`/stores/${storeId}/business-hours`, {
        date
      })
      return result
    } catch (error) {
      throw error
    }
  }

  // 获取店铺设施信息
  async getStoreFacilities(storeId) {
    try {
      const result = await request.get(`/stores/${storeId}/facilities`)
      return result
    } catch (error) {
      throw error
    }
  }

  // 获取店铺评价
  async getStoreReviews(storeId, params = {}) {
    const {
      page = 1,
      limit = 10,
      rating = 0 // 0表示所有评分
    } = params

    try {
      const result = await request.get(`/stores/${storeId}/reviews`, {
        page,
        limit,
        rating
      })
      return result
    } catch (error) {
      throw error
    }
  }

  // 搜索店铺
  async searchStores(params) {
    const {
      keyword,
      city,
      latitude,
      longitude,
      filters = {} // 筛选条件：价格范围、设施等
    } = params

    try {
      const result = await request.get('/stores/search', {
        keyword,
        city,
        latitude,
        longitude,
        ...filters
      })
      return result
    } catch (error) {
      throw error
    }
  }

  // 获取热门店铺
  async getPopularStores(city) {
    try {
      const result = await request.get('/stores/popular', {
        city
      })
      return result
    } catch (error) {
      throw error
    }
  }

  // 获取推荐店铺
  async getRecommendedStores(params = {}) {
    const {
      city,
      latitude,
      longitude,
      userPreferences = {} // 用户偏好
    } = params

    try {
      const result = await request.get('/stores/recommended', {
        city,
        latitude,
        longitude,
        preferences: userPreferences
      })
      return result
    } catch (error) {
      throw error
    }
  }

  // 收藏店铺
  async favoriteStore(storeId) {
    try {
      const result = await request.post(`/stores/${storeId}/favorite`)
      return result
    } catch (error) {
      throw error
    }
  }

  // 取消收藏
  async unfavoriteStore(storeId) {
    try {
      const result = await request.delete(`/stores/${storeId}/favorite`)
      return result
    } catch (error) {
      throw error
    }
  }

  // 获取收藏的店铺列表
  async getFavoriteStores(params = {}) {
    const { page = 1, limit = 10 } = params

    try {
      const result = await request.get('/stores/favorites', {
        page,
        limit
      })
      return result
    } catch (error) {
      throw error
    }
  }

  // 举报店铺
  async reportStore(storeId, reason) {
    try {
      const result = await request.post(`/stores/${storeId}/report`, {
        reason
      })
      return result
    } catch (error) {
      throw error
    }
  }
}

export default new StoreService()