import request from '@/utils/request'
import type { Store, Seat, FilterOptions, PageResponse } from '@/types'

// 店铺相关API
export const storeApi = {
  /**
   * 获取店铺列表
   */
  getStoreList(params: {
    page?: number
    pageSize?: number
    city?: string
    latitude?: number
    longitude?: number
    keyword?: string
    filters?: FilterOptions
  }) {
    return request.get<PageResponse<Store>>('/stores', params)
  },

  /**
   * 获取店铺详情
   */
  getStoreDetail(storeId: string) {
    return request.get<Store>(`/stores/${storeId}`)
  },

  /**
   * 获取附近店铺
   */
  getNearbyStores(params: {
    latitude: number
    longitude: number
    radius?: number
    limit?: number
  }) {
    return request.get<Store[]>('/stores/nearby', params)
  },

  /**
   * 搜索店铺
   */
  searchStores(params: {
    keyword: string
    city?: string
    page?: number
    pageSize?: number
  }) {
    return request.get<PageResponse<Store>>('/stores/search', params)
  },

  /**
   * 获取店铺座位列表
   */
  getStoreSeats(storeId: string, params?: {
    date?: string
    startTime?: string
    endTime?: string
    type?: string
  }) {
    return request.get<Seat[]>(`/stores/${storeId}/seats`, params)
  },

  /**
   * 检查座位可用性
   */
  checkSeatAvailability(params: {
    storeId: string
    seatId: string
    date: string
    startTime: string
    endTime: string
  }) {
    return request.get<{ available: boolean; reason?: string }>('/stores/seats/check', params)
  },

  /**
   * 锁定座位（预订前）
   */
  lockSeat(params: {
    storeId: string
    seatId: string
    date: string
    startTime: string
    endTime: string
  }) {
    return request.post<{ lockId: string; expireTime: string }>('/stores/seats/lock', params)
  },

  /**
   * 释放座位锁定
   */
  unlockSeat(lockId: string) {
    return request.delete(`/stores/seats/unlock/${lockId}`)
  },

  /**
   * 收藏店铺
   */
  favoriteStore(storeId: string) {
    return request.post(`/stores/${storeId}/favorite`)
  },

  /**
   * 取消收藏
   */
  unfavoriteStore(storeId: string) {
    return request.delete(`/stores/${storeId}/favorite`)
  },

  /**
   * 获取收藏店铺列表
   */
  getFavoriteStores(params?: {
    page?: number
    pageSize?: number
  }) {
    return request.get<PageResponse<Store>>('/stores/favorites', params)
  },

  /**
   * 获取店铺评价
   */
  getStoreReviews(storeId: string, params?: {
    page?: number
    pageSize?: number
  }) {
    return request.get<PageResponse<any>>(`/stores/${storeId}/reviews`, params)
  },

  /**
   * 获取热门店铺
   */
  getHotStores(params?: {
    city?: string
    limit?: number
  }) {
    return request.get<Store[]>('/stores/hot', params)
  },

  /**
   * 获取推荐店铺
   */
  getRecommendStores(params?: {
    latitude?: number
    longitude?: number
    limit?: number
  }) {
    return request.get<Store[]>('/stores/recommend', params)
  }
}