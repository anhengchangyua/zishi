// API 基础配置
export const API_CONFIG = {
  BASE_URL: 'https://api.yihan-study.com',
  TIMEOUT: 10000,
  RETRY_COUNT: 3
}

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  LOCATION: 'location',
  SEARCH_HISTORY: 'searchHistory',
  FAVORITE_STORES: 'favoriteStores',
  CART: 'cart',
  THEME: 'theme'
}

// 订单状态
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  USING: 'using',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const

export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.PENDING]: '待支付',
  [ORDER_STATUS.PAID]: '已支付',
  [ORDER_STATUS.USING]: '使用中',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDED]: '已退款'
}

// 座位状态
export const SEAT_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance'
} as const

export const SEAT_STATUS_TEXT = {
  [SEAT_STATUS.AVAILABLE]: '可预订',
  [SEAT_STATUS.OCCUPIED]: '使用中',
  [SEAT_STATUS.RESERVED]: '已预订',
  [SEAT_STATUS.MAINTENANCE]: '维护中'
}

// 座位类型
export const SEAT_TYPE = {
  SINGLE: 'single',
  DOUBLE: 'double',
  MEETING: 'meeting'
} as const

export const SEAT_TYPE_TEXT = {
  [SEAT_TYPE.SINGLE]: '单人座',
  [SEAT_TYPE.DOUBLE]: '双人座',
  [SEAT_TYPE.MEETING]: '会议室'
}

// 店铺状态
export const STORE_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  BUSY: 'busy'
} as const

export const STORE_STATUS_TEXT = {
  [STORE_STATUS.OPEN]: '营业中',
  [STORE_STATUS.CLOSED]: '已关闭',
  [STORE_STATUS.BUSY]: '繁忙'
}

// 支付方式
export const PAYMENT_METHOD = {
  WECHAT: 'wechat',
  ALIPAY: 'alipay',
  BALANCE: 'balance'
} as const

export const PAYMENT_METHOD_TEXT = {
  [PAYMENT_METHOD.WECHAT]: '微信支付',
  [PAYMENT_METHOD.ALIPAY]: '支付宝',
  [PAYMENT_METHOD.BALANCE]: '余额支付'
}

// 会员卡类型
export const MEMBERSHIP_TYPE = {
  TIME: 'time',
  COUNT: 'count',
  UNLIMITED: 'unlimited'
} as const

export const MEMBERSHIP_TYPE_TEXT = {
  [MEMBERSHIP_TYPE.TIME]: '时长卡',
  [MEMBERSHIP_TYPE.COUNT]: '次数卡',
  [MEMBERSHIP_TYPE.UNLIMITED]: '无限卡'
}

// 优惠券类型
export const COUPON_TYPE = {
  DISCOUNT: 'discount',
  CASH: 'cash',
  GIFT: 'gift'
} as const

export const COUPON_TYPE_TEXT = {
  [COUPON_TYPE.DISCOUNT]: '打折券',
  [COUPON_TYPE.CASH]: '代金券',
  [COUPON_TYPE.GIFT]: '礼品券'
}

// 排序选项
export const SORT_OPTIONS = {
  DEFAULT: 'default',
  DISTANCE: 'distance',
  PRICE: 'price',
  RATING: 'rating'
} as const

export const SORT_OPTIONS_TEXT = {
  [SORT_OPTIONS.DEFAULT]: '默认排序',
  [SORT_OPTIONS.DISTANCE]: '距离优先',
  [SORT_OPTIONS.PRICE]: '价格优先',
  [SORT_OPTIONS.RATING]: '评分优先'
}

// 时间常量
export const TIME_FORMAT = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  MONTH_DAY: 'MM-DD',
  HOUR_MINUTE: 'HH:mm'
}

// 业务规则常量
export const BUSINESS_RULES = {
  MIN_BOOKING_DURATION: 60, // 最小预订时长（分钟）
  MAX_BOOKING_DURATION: 480, // 最大预订时长（分钟）
  ADVANCE_BOOKING_DAYS: 7, // 提前预订天数
  CANCEL_DEADLINE_HOURS: 2, // 取消预订截止时间（小时）
  REFUND_DEADLINE_HOURS: 24, // 退款截止时间（小时）
  MAX_SEARCH_HISTORY: 10, // 最大搜索历史记录数
  MAX_FAVORITE_STORES: 50, // 最大收藏店铺数
  DEFAULT_PAGE_SIZE: 20, // 默认分页大小
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 最大上传文件大小（5MB）
  LOCATION_CACHE_TIME: 30 * 60 * 1000 // 位置缓存时间（30分钟）
}

// 错误码
export const ERROR_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  NETWORK_ERROR: -1,
  TIMEOUT: -2,
  CANCEL: -3
}

// 主题配置
export const THEME_CONFIG = {
  PRIMARY_COLOR: '#4A90E2',
  SECONDARY_COLOR: '#FF6B35',
  SUCCESS_COLOR: '#52C41A',
  WARNING_COLOR: '#FAAD14',
  ERROR_COLOR: '#F5222D',
  TEXT_COLOR: '#333333',
  TEXT_COLOR_SECONDARY: '#666666',
  TEXT_COLOR_LIGHT: '#999999',
  BORDER_COLOR: '#E8E8E8',
  BACKGROUND_COLOR: '#F5F5F5',
  WHITE: '#FFFFFF',
  BLACK: '#000000'
}

// 设备类型
export const DEVICE_TYPE = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop'
} as const

// 平台类型
export const PLATFORM_TYPE = {
  MP_WEIXIN: 'mp-weixin',
  MP_ALIPAY: 'mp-alipay',
  MP_BAIDU: 'mp-baidu',
  MP_TOUTIAO: 'mp-toutiao',
  MP_QQ: 'mp-qq',
  H5: 'h5',
  APP: 'app'
} as const

// 正则表达式
export const REGEX = {
  PHONE: /^1[3-9]\d{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ID_CARD: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/.+/,
  NUMBER: /^\d+$/,
  DECIMAL: /^\d+(\.\d+)?$/
}