<template>
  <view class="home-page">
    <!-- 搜索头部 -->
    <view class="search-header">
      <view class="search-bar" @click="handleSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索自习室、地点</text>
      </view>
      <view class="location-btn" @click="handleLocationSelect">
        <text class="location-icon">📍</text>
        <text class="location-text">{{ currentCity }}</text>
        <text class="arrow-icon">▼</text>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view 
        v-for="action in quickActions" 
        :key="action.id"
        class="action-item"
        @click="handleQuickAction(action)"
      >
        <view class="action-icon">
          <text class="icon-text">{{ getActionIcon(action.icon) }}</text>
        </view>
        <text class="action-text">{{ action.text }}</text>
      </view>
    </view>

    <!-- 推荐店铺 -->
    <view class="recommend-section" v-if="recommendStores.length > 0">
      <view class="section-header">
        <text class="section-title">推荐自习室</text>
        <text class="section-more" @click="handleViewMore('recommend')">更多</text>
      </view>
      <scroll-view class="recommend-scroll" scroll-x>
        <view class="recommend-list">
          <view 
            v-for="store in recommendStores" 
            :key="store.id"
            class="recommend-item"
            @click="handleStoreDetail(store.id)"
          >
            <image class="store-image" :src="store.images[0]" mode="aspectFill"></image>
            <view class="store-info">
              <text class="store-name">{{ store.name }}</text>
              <view class="store-meta">
                <text class="store-price">¥{{ store.price }}/小时</text>
                <text class="store-distance">{{ formatDistance(store.distance) }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-left">
        <view 
          v-for="filter in filters" 
          :key="filter.key"
          class="filter-item"
          :class="{ active: filter.active }"
          @click="handleFilterSelect(filter)"
        >
          <text class="filter-text">{{ filter.text }}</text>
          <text 
            v-if="filter.hasArrow" 
            class="filter-arrow"
            :style="{ color: filter.active ? '#4A90E2' : '#999' }"
          >▼</text>
        </view>
      </view>
      <view class="filter-sort" @click="handleSortSelect">
        <text class="sort-icon">☰</text>
      </view>
    </view>

    <!-- 店铺列表 -->
    <view class="store-list">
      <view 
        v-for="store in storeList" 
        :key="store.id"
        class="store-card"
        @click="handleStoreDetail(store.id)"
      >
        <image class="store-cover" :src="store.images[0]" mode="aspectFill"></image>
        <view class="store-content">
          <view class="store-header">
            <text class="store-name">{{ store.name }}</text>
            <view class="store-status" :class="store.status">
              <text class="status-text">{{ getStatusText(store.status) }}</text>
            </view>
          </view>
          <text class="store-address">{{ store.address }}</text>
          <view class="store-tags">
            <text 
              v-for="tag in store.tags.slice(0, 3)" 
              :key="tag"
              class="tag"
            >{{ tag }}</text>
          </view>
          <view class="store-footer">
            <view class="store-rating">
              <view class="rating-stars">
                <text v-for="i in 5" :key="i" class="star">
                  {{ i <= store.rating ? '⭐' : '☆' }}
                </text>
              </view>
              <text class="rating-text">{{ store.rating }}</text>
              <text class="review-count">({{ store.reviewCount }})</text>
            </view>
            <view class="store-price-info">
              <text class="price">¥{{ store.price }}</text>
              <text class="price-unit">/小时</text>
            </view>
          </view>
          <view class="store-actions">
            <view class="seats-info">
              <text class="seats-text">剩余{{ store.availableSeats }}个座位</text>
            </view>
            <view class="action-buttons">
              <button 
                class="action-btn favorite-btn"
                :class="{ active: store.isFavorite }"
                @click.stop="handleFavorite(store)"
              >
                <text 
                  class="favorite-icon"
                  :style="{ color: store.isFavorite ? '#FF6B35' : '#999' }"
                >{{ store.isFavorite ? '❤️' : '🤍' }}</text>
              </button>
              <button class="action-btn call-btn" @click.stop="handleCall(store)">
                <text class="phone-icon">📞</text>
              </button>
              <button class="action-btn book-btn" @click.stop="handleBooking(store)">
                预订
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore">
      <view class="load-more-text">
        <text v-if="loadStatus === 'loading'">加载中...</text>
        <text v-else-if="loadStatus === 'noMore'">没有更多了</text>
        <text v-else>上拉加载更多</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && storeList.length === 0">
      <text class="empty-icon">🏪</text>
      <text class="empty-text">暂无自习室数据</text>
      <button class="empty-btn" @click="handleRefresh">刷新重试</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onReachBottom, onPullDownRefresh } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeApi } from '@/api/store'
import type { Store, FilterOptions } from '@/types'
import { STORE_STATUS_TEXT, SORT_OPTIONS } from '@/constants'

const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const loadStatus = ref<'more' | 'loading' | 'noMore'>('more')
const currentPage = ref(1)
const currentCity = ref('北京')
const storeList = ref<Store[]>([])
const recommendStores = ref<Store[]>([])

// 快捷操作
const quickActions = ref([
  { id: 1, icon: 'location', text: '附近', color: '#4A90E2' },
  { id: 2, icon: 'star', text: '收藏', color: '#FF6B35' },
  { id: 3, icon: 'calendar', text: '预约', color: '#52C41A' },
  { id: 4, icon: 'gift', text: '优惠', color: '#FAAD14' }
])

// 筛选条件
const filters = ref([
  { key: 'all', text: '全部', active: true, hasArrow: false },
  { key: 'distance', text: '距离', active: false, hasArrow: true },
  { key: 'price', text: '价格', active: false, hasArrow: true },
  { key: 'rating', text: '评分', active: false, hasArrow: true }
])

// 页面加载
onMounted(() => {
  initPage()
})

// 下拉刷新
onPullDownRefresh(() => {
  handleRefresh()
})

// 上拉加载
onReachBottom(() => {
  if (hasMore.value && loadStatus.value !== 'loading') {
    loadMore()
  }
})

// 初始化页面
const initPage = async () => {
  await getUserLocation()
  await Promise.all([
    loadStoreList(true),
    loadRecommendStores()
  ])
}

// 获取用户位置
const getUserLocation = async () => {
  try {
    const location = await userStore.getCurrentLocation()
    if (location) {
      currentCity.value = location.city
    }
  } catch (error) {
    console.error('获取位置失败:', error)
  }
}

// 加载店铺列表
const loadStoreList = async (reset = false) => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const params = {
      page: reset ? 1 : currentPage.value,
      pageSize: 10,
      city: currentCity.value,
      latitude: userStore.location?.latitude,
      longitude: userStore.location?.longitude
    }
    
    const response = await storeApi.getStoreList(params)
    const { list, total, page } = response.data
    
    if (reset) {
      storeList.value = list
      currentPage.value = 1
    } else {
      storeList.value.push(...list)
    }
    
    currentPage.value = page + 1
    hasMore.value = storeList.value.length < total
    loadStatus.value = hasMore.value ? 'more' : 'noMore'
  } catch (error) {
    console.error('加载店铺列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    refreshing.value = false
    uni.stopPullDownRefresh()
  }
}

// 加载推荐店铺
const loadRecommendStores = async () => {
  try {
    const params = {
      latitude: userStore.location?.latitude,
      longitude: userStore.location?.longitude,
      limit: 5
    }
    
    const response = await storeApi.getRecommendStores(params)
    recommendStores.value = response.data
  } catch (error) {
    console.error('加载推荐店铺失败:', error)
  }
}

// 加载更多
const loadMore = () => {
  loadStatus.value = 'loading'
  loadStoreList()
}

// 刷新数据
const handleRefresh = () => {
  refreshing.value = true
  currentPage.value = 1
  hasMore.value = true
  loadStatus.value = 'more'
  loadStoreList(true)
}

// 搜索
const handleSearch = () => {
  uni.navigateTo({
    url: '/pages/store/search/index'
  })
}

// 位置选择
const handleLocationSelect = () => {
  uni.navigateTo({
    url: '/pages/common/city-select/index'
  })
}

// 快捷操作
const handleQuickAction = (action: any) => {
  switch (action.id) {
    case 1: // 附近
      handleNearbyStores()
      break
    case 2: // 收藏
      uni.switchTab({
        url: '/pages/user/favorites/index'
      })
      break
    case 3: // 预约
      uni.navigateTo({
        url: '/pages/order/booking/index'
      })
      break
    case 4: // 优惠
      uni.navigateTo({
        url: '/pages/user/coupons/index'
      })
      break
  }
}

// 附近店铺
const handleNearbyStores = async () => {
  if (!userStore.location) {
    uni.showToast({
      title: '请先获取位置信息',
      icon: 'none'
    })
    return
  }
  
  try {
    const response = await storeApi.getNearbyStores({
      latitude: userStore.location.latitude,
      longitude: userStore.location.longitude,
      radius: 5000,
      limit: 20
    })
    
    storeList.value = response.data
    hasMore.value = false
    loadStatus.value = 'noMore'
    
    uni.showToast({
      title: `找到${response.data.length}家附近自习室`,
      icon: 'none'
    })
  } catch (error) {
    console.error('加载附近店铺失败:', error)
  }
}

// 查看更多
const handleViewMore = (type: string) => {
  uni.navigateTo({
    url: `/pages/store/list/index?type=${type}`
  })
}

// 筛选选择
const handleFilterSelect = (filter: any) => {
  // 重置其他筛选
  filters.value.forEach(f => f.active = false)
  filter.active = true
  
  // TODO: 实现筛选逻辑
  console.log('筛选:', filter.key)
}

// 排序选择
const handleSortSelect = () => {
  uni.showActionSheet({
    itemList: ['默认排序', '距离优先', '价格优先', '评分优先'],
    success: (res) => {
      console.log('选择排序:', res.tapIndex)
      // TODO: 实现排序逻辑
    }
  })
}

// 店铺详情
const handleStoreDetail = (storeId: string) => {
  uni.navigateTo({
    url: `/pages/store/detail/index?id=${storeId}`
  })
}

// 收藏店铺
const handleFavorite = async (store: Store) => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({
      url: '/pages/common/login/index'
    })
    return
  }
  
  try {
    if (store.isFavorite) {
      await storeApi.unfavoriteStore(store.id)
      store.isFavorite = false
      uni.showToast({
        title: '已取消收藏',
        icon: 'none'
      })
    } else {
      await storeApi.favoriteStore(store.id)
      store.isFavorite = true
      uni.showToast({
        title: '收藏成功',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
}

// 拨打电话
const handleCall = (store: Store) => {
  uni.makePhoneCall({
    phoneNumber: store.phone
  })
}

// 预订
const handleBooking = (store: Store) => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({
      url: '/pages/common/login/index'
    })
    return
  }
  
  uni.navigateTo({
    url: `/pages/store/booking/index?storeId=${store.id}`
  })
}

// 格式化距离
const formatDistance = (distance?: number) => {
  if (!distance) return ''
  return distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`
}

// 获取状态文本
const getStatusText = (status: string) => {
  return STORE_STATUS_TEXT[status] || status
}

// 获取操作图标
const getActionIcon = (iconType: string) => {
  const iconMap: Record<string, string> = {
    location: '📍',
    star: '⭐',
    calendar: '📅',
    gift: '🎁'
  }
  return iconMap[iconType] || '📱'
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background-color: $background-color;
}

.search-header {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  background-color: $background-color-white;
  
  .search-bar {
    flex: 1;
    display: flex;
    align-items: center;
    height: 64rpx;
    padding: 0 $spacing-md;
    background-color: $background-color;
    border-radius: $border-radius-lg;
    margin-right: $spacing-md;
    
    .search-icon {
      font-size: 18px;
      color: #999;
    }
    
    .search-placeholder {
      margin-left: $spacing-sm;
      color: $text-color-light;
      font-size: $font-size-md;
    }
  }
  
  .location-btn {
    display: flex;
    align-items: center;
    padding: 0 $spacing-sm;
    
    .location-icon {
      font-size: 16px;
      color: $primary-color;
    }
    
    .location-text {
      margin: 0 4rpx;
      color: $primary-color;
      font-size: $font-size-md;
      font-weight: $font-weight-medium;
    }
    
    .arrow-icon {
      font-size: 12px;
      color: #666;
    }
  }
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: $spacing-lg $spacing-md;
  background-color: $background-color-white;
  margin-bottom: $spacing-md;
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .action-icon {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(74, 144, 226, 0.1);
      border-radius: $border-radius-circle;
      margin-bottom: $spacing-sm;
      
      .icon-text {
        font-size: 24px;
      }
    }
    
    .action-text {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }
}

.recommend-section {
  margin-bottom: $spacing-md;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md;
    background-color: $background-color-white;
    
    .section-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-medium;
      color: $text-color;
    }
    
    .section-more {
      font-size: $font-size-sm;
      color: $text-color-light;
    }
  }
  
  .recommend-scroll {
    background-color: $background-color-white;
    
    .recommend-list {
      display: flex;
      padding: 0 $spacing-md $spacing-md;
      
      .recommend-item {
        flex-shrink: 0;
        width: 240rpx;
        margin-right: $spacing-md;
        
        .store-image {
          width: 240rpx;
          height: 160rpx;
          border-radius: $border-radius-md;
        }
        
        .store-info {
          padding-top: $spacing-sm;
          
          .store-name {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $text-color;
            @include text-ellipsis;
          }
          
          .store-meta {
            display: flex;
            justify-content: space-between;
            margin-top: 4rpx;
            
            .store-price {
              font-size: $font-size-sm;
              color: $secondary-color;
              font-weight: $font-weight-medium;
            }
            
            .store-distance {
              font-size: $font-size-sm;
              color: $text-color-light;
            }
          }
        }
      }
    }
  }
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  background-color: $background-color-white;
  border-bottom: 1rpx solid $border-color;
  
  .filter-left {
    display: flex;
    
    .filter-item {
      display: flex;
      align-items: center;
      padding: $spacing-sm $spacing-md;
      margin-right: $spacing-sm;
      border-radius: $border-radius-lg;
      
      &.active {
        background-color: rgba(74, 144, 226, 0.1);
        
        .filter-text {
          color: $primary-color;
        }
      }
      
      .filter-text {
        font-size: $font-size-md;
        color: $text-color-secondary;
        margin-right: 4rpx;
      }
    }
  }
  
  .filter-sort {
    padding: $spacing-sm;
  }
}

.store-list {
  padding: 0 $spacing-md;
}

.store-card {
  background-color: $background-color-white;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-md;
  overflow: hidden;
  box-shadow: $box-shadow-sm;
  
  .store-cover {
    width: 100%;
    height: 320rpx;
  }
  
  .store-content {
    padding: $spacing-md;
    
    .store-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-sm;
      
      .store-name {
        flex: 1;
        font-size: $font-size-lg;
        font-weight: $font-weight-medium;
        color: $text-color;
        @include text-ellipsis;
      }
      
      .store-status {
        padding: 4rpx $spacing-sm;
        border-radius: $border-radius-sm;
        
        &.open {
          background-color: rgba(82, 196, 26, 0.1);
          
          .status-text {
            color: $success-color;
          }
        }
        
        &.closed {
          background-color: rgba(245, 34, 45, 0.1);
          
          .status-text {
            color: $error-color;
          }
        }
        
        &.busy {
          background-color: rgba(250, 173, 20, 0.1);
          
          .status-text {
            color: $warning-color;
          }
        }
        
        .status-text {
          font-size: $font-size-xs;
        }
      }
    }
    
    .store-address {
      font-size: $font-size-sm;
      color: $text-color-light;
      margin-bottom: $spacing-sm;
      @include text-ellipsis;
    }
    
    .store-tags {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: $spacing-md;
      
      .tag {
        padding: 4rpx $spacing-sm;
        margin-right: $spacing-sm;
        margin-bottom: 4rpx;
        background-color: $background-color;
        border-radius: $border-radius-sm;
        font-size: $font-size-xs;
        color: $text-color-secondary;
      }
    }
    
    .store-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-md;
      
      .store-rating {
        display: flex;
        align-items: center;
        
        .rating-stars {
          display: flex;
          
          .star {
            font-size: 12px;
            margin-right: 2px;
          }
        }
        
        .rating-text {
          margin-left: 4rpx;
          font-size: $font-size-sm;
          color: $text-color;
          font-weight: $font-weight-medium;
        }
        
        .review-count {
          margin-left: 4rpx;
          font-size: $font-size-sm;
          color: $text-color-light;
        }
      }
      
      .store-price-info {
        display: flex;
        align-items: baseline;
        
        .price {
          font-size: $font-size-lg;
          color: $secondary-color;
          font-weight: $font-weight-bold;
        }
        
        .price-unit {
          font-size: $font-size-sm;
          color: $text-color-light;
          margin-left: 2rpx;
        }
      }
    }
    
    .store-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .seats-info {
        .seats-text {
          font-size: $font-size-sm;
          color: $text-color-light;
        }
      }
      
      .action-buttons {
        display: flex;
        align-items: center;
        
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56rpx;
          height: 56rpx;
          border: none;
          border-radius: $border-radius-sm;
          margin-left: $spacing-sm;
          background-color: $background-color;
          
          &.favorite-btn.active {
            background-color: rgba(255, 107, 53, 0.1);
          }
          
          &.call-btn {
            background-color: rgba(74, 144, 226, 0.1);
          }
          
          &.book-btn {
            width: 100rpx;
            background-color: $primary-color;
            color: $text-color-white;
            font-size: $font-size-sm;
          }
        }
      }
    }
  }
}

.load-more {
  padding: $spacing-md;
  
  .load-more-text {
    text-align: center;
    color: $text-color-light;
    font-size: $font-size-sm;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xxl;
  
  .empty-icon {
    font-size: 80px;
    margin-bottom: $spacing-md;
  }
  
  .empty-text {
    margin: $spacing-md 0;
    font-size: $font-size-md;
    color: $text-color-light;
  }
  
  .empty-btn {
    padding: $spacing-sm $spacing-lg;
    background-color: $primary-color;
    color: $text-color-white;
    border: none;
    border-radius: $border-radius-md;
    font-size: $font-size-md;
  }
}
</style>