// 用户相关类型
export interface UserInfo {
  id: string
  openid: string
  nickname: string
  avatar: string
  phone?: string
  gender: number
  city: string
  province: string
  country: string
  language: string
  createTime: string
  updateTime: string
}

// 系统信息类型
export interface SystemInfo {
  brand: string
  model: string
  system: string
  platform: string
  version: string
  SDKVersion: string
  screenWidth: number
  screenHeight: number
  windowWidth: number
  windowHeight: number
  statusBarHeight: number
  safeArea: {
    left: number
    right: number
    top: number
    bottom: number
    width: number
    height: number
  }
}

// 店铺相关类型
export interface Store {
  id: string
  name: string
  description: string
  address: string
  phone: string
  latitude: number
  longitude: number
  distance?: number
  images: string[]
  rating: number
  reviewCount: number
  price: number
  tags: string[]
  facilities: string[]
  businessHours: BusinessHour[]
  status: 'open' | 'closed' | 'busy'
  availableSeats: number
  totalSeats: number
  createTime: string
  updateTime: string
}

// 营业时间类型
export interface BusinessHour {
  dayOfWeek: number // 0-6，0表示周日
  openTime: string
  closeTime: string
  isOpen: boolean
}

// 座位相关类型
export interface Seat {
  id: string
  storeId: string
  number: string
  type: 'single' | 'double' | 'meeting'
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  price: number
  facilities: string[]
  position: {
    x: number
    y: number
  }
  createTime: string
  updateTime: string
}

// 订单相关类型
export interface Order {
  id: string
  userId: string
  storeId: string
  seatId: string
  storeName: string
  seatNumber: string
  startTime: string
  endTime: string
  duration: number // 分钟
  price: number
  actualPrice: number
  status: 'pending' | 'paid' | 'using' | 'completed' | 'cancelled' | 'refunded'
  paymentMethod: 'wechat' | 'alipay' | 'balance'
  paymentTime?: string
  cancelTime?: string
  refundTime?: string
  createTime: string
  updateTime: string
}

// 会员卡相关类型
export interface MembershipCard {
  id: string
  name: string
  type: 'time' | 'count' | 'unlimited'
  price: number
  originalPrice: number
  duration?: number // 天数，仅time类型有效
  count?: number // 次数，仅count类型有效
  description: string
  benefits: string[]
  validDays: number
  status: 'active' | 'inactive'
  createTime: string
  updateTime: string
}

// 优惠券相关类型
export interface Coupon {
  id: string
  name: string
  type: 'discount' | 'cash' | 'gift'
  value: number // 折扣率或现金金额
  minAmount: number // 最低消费金额
  maxDiscount?: number // 最大优惠金额
  validFrom: string
  validTo: string
  usageLimit: number
  usedCount: number
  status: 'active' | 'inactive' | 'expired'
  description: string
  createTime: string
  updateTime: string
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页响应类型
export interface PageResponse<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 位置信息类型
export interface LocationInfo {
  latitude: number
  longitude: number
  address: string
  city: string
  district: string
  province: string
}

// 筛选条件类型
export interface FilterOptions {
  city?: string
  district?: string
  priceRange?: [number, number]
  rating?: number
  distance?: number
  facilities?: string[]
  sortBy?: 'distance' | 'price' | 'rating' | 'default'
  sortOrder?: 'asc' | 'desc'
}

// 支付相关类型
export interface PaymentInfo {
  orderId: string
  amount: number
  method: 'wechat' | 'alipay' | 'balance'
  prepayId?: string
  paySign?: string
  timeStamp?: string
  nonceStr?: string
  signType?: string
}

// 评价相关类型
export interface Review {
  id: string
  userId: string
  storeId: string
  orderId: string
  userName: string
  userAvatar: string
  rating: number
  content: string
  images: string[]
  reply?: {
    content: string
    replyTime: string
  }
  createTime: string
  updateTime: string
}