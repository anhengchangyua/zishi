import React, { Component } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import Taro from '@tarojs/taro'
import {
  AtSearchBar,
  AtTabs,
  AtTabsPane,
  AtButton,
  AtIcon,
  AtTag,
  AtActionSheet,
  AtActionSheetItem,
  AtToast
} from 'taro-ui'
import storeService from '@/services/store'
import { store } from '@/store'
import type { StoreInfo } from '@/store'
import './index.scss'

interface IndexState {
  // 搜索相关
  searchKeyword: string
  
  // 店铺数据
  storeList: StoreInfo[]
  recommendedStores: StoreInfo[]
  
  // 分页相关
  page: number
  hasMore: boolean
  loading: boolean
  loadingMore: boolean
  
  // 排序筛选
  sortBy: 'distance' | 'rating' | 'price'
  
  // 城市选择
  showCityPicker: boolean
  cityList: string[]
  
  // Toast状态
  showToast: boolean
  toastText: string
  toastStatus: 'success' | 'error' | 'loading'
}

@inject('store')
@observer
class Index extends Component<any, IndexState> {
  private searchTimer: NodeJS.Timeout | null = null

  constructor(props: any) {
    super(props)
    this.state = {
      searchKeyword: '',
      storeList: [],
      recommendedStores: [],
      page: 1,
      hasMore: true,
      loading: false,
      loadingMore: false,
      sortBy: 'distance',
      showCityPicker: false,
      cityList: ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉'],
      showToast: false,
      toastText: '',
      toastStatus: 'success'
    }
  }

  componentDidMount() {
    console.log('首页加载')
    this.initPage()
  }

  componentDidShow() {
    console.log('首页显示')
    this.refreshData()
  }

  // 下拉刷新
  onPullDownRefresh = () => {
    console.log('下拉刷新')
    this.refreshData()
  }

  // 上拉加载更多
  onReachBottom = () => {
    console.log('上拉加载更多')
    this.loadMoreStores()
  }

  // 初始化页面
  initPage = async () => {
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
  }

  // 获取当前位置
  getCurrentLocation = async () => {
    try {
      const location = await this.getLocation()
      store.setLocation(location)
      
      // 根据位置获取城市信息
      const city = await this.getCityByLocation(location)
      if (city && city !== store.currentCity) {
        store.setCurrentCity(city)
      }
    } catch (error) {
      console.error('获取位置失败:', error)
      this.showToast('定位失败，请手动选择城市', 'error')
    }
  }

  // 获取位置信息
  getLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      Taro.getLocation({
        type: 'gcj02',
        success: (res) => {
          const { latitude, longitude } = res
          resolve({ latitude, longitude })
        },
        fail: (error) => {
          if (error.errMsg?.includes('auth deny')) {
            Taro.showModal({
              title: '位置权限',
              content: '需要获取您的位置信息来推荐附近的自习室',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  Taro.openSetting()
                }
              }
            })
          }
          reject(error)
        }
      })
    })
  }

  // 根据坐标获取城市
  getCityByLocation = async (location: { latitude: number; longitude: number }) => {
    // 这里应该调用地图API进行逆地理编码
    // 简化处理，返回默认城市
    return '北京'
  }

  // 获取推荐店铺
  getRecommendedStores = async () => {
    try {
      const params = {
        city: store.currentCity,
        latitude: store.location?.latitude,
        longitude: store.location?.longitude
      }
      
      const result = await storeService.getRecommendedStores(params)
      this.setState({
        recommendedStores: result.list || []
      })
    } catch (error) {
      console.error('获取推荐店铺失败:', error)
    }
  }

  // 获取店铺列表
  getStoreList = async (refresh = false) => {
    if (this.state.loading || this.state.loadingMore) return
    
    const page = refresh ? 1 : this.state.page
    
    this.setState({
      loading: refresh,
      loadingMore: !refresh && page > 1
    })

    try {
      const params = {
        city: store.currentCity,
        page,
        limit: 10,
        keyword: this.state.searchKeyword,
        latitude: store.location?.latitude,
        longitude: store.location?.longitude,
        sortBy: this.state.sortBy
      }

      const result = await storeService.getStoreList(params)
      
      const storeList = refresh ? result.list : [...this.state.storeList, ...result.list]
      
      this.setState({
        storeList,
        page: page + 1,
        hasMore: result.hasMore,
        loading: false,
        loadingMore: false
      })
      
      // 更新全局状态
      store.setStoreList(storeList)
      
      if (refresh) {
        Taro.stopPullDownRefresh()
      }
    } catch (error) {
      console.error('获取店铺列表失败:', error)
      this.setState({
        loading: false,
        loadingMore: false
      })
      
      if (refresh) {
        Taro.stopPullDownRefresh()
      }
      
      this.showToast('获取数据失败，请重试', 'error')
    }
  }

  // 刷新数据
  refreshData = () => {
    this.setState({
      page: 1,
      hasMore: true
    })
    this.getStoreList(true)
    this.getRecommendedStores()
  }

  // 加载更多店铺
  loadMoreStores = () => {
    if (this.state.hasMore && !this.state.loadingMore) {
      this.getStoreList(false)
    }
  }

  // 搜索输入
  onSearchChange = (value: string) => {
    this.setState({ searchKeyword: value })
    
    // 防抖搜索
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
    this.searchTimer = setTimeout(() => {
      this.performSearch()
    }, 500)
  }

  // 搜索确认
  onSearchActionClick = () => {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
    this.performSearch()
  }

  // 执行搜索
  performSearch = () => {
    this.setState({
      page: 1,
      hasMore: true
    })
    this.getStoreList(true)
  }

  // 城市选择
  onCitySelect = () => {
    this.setState({ showCityPicker: true })
  }

  // 城市选择器关闭
  onCityPickerClose = () => {
    this.setState({ showCityPicker: false })
  }

  // 城市改变
  onCityChange = (city: string) => {
    store.setCurrentCity(city)
    this.setState({ showCityPicker: false })
    
    // 切换城市后刷新数据
    this.refreshData()
    
    this.showToast(`已切换到${city}`, 'success')
  }

  // 排序改变
  onSortChange = (sortBy: 'distance' | 'rating' | 'price') => {
    if (sortBy === this.state.sortBy) return
    
    this.setState({ sortBy })
    this.refreshData()
  }

  // 店铺卡片点击
  onStoreCardClick = (store: StoreInfo) => {
    Taro.navigateTo({
      url: `/pages/store/detail/index?id=${store.id}`
    })
  }

  // 收藏点击
  onFavoriteClick = async (e: any, storeId: number, isFavorite: boolean) => {
    e.stopPropagation()
    
    if (!store.isLogin) {
      Taro.navigateTo({
        url: '/pages/common/login/index'
      })
      return
    }
    
    try {
      if (isFavorite) {
        await storeService.unfavoriteStore(storeId)
        this.showToast('取消收藏', 'success')
      } else {
        await storeService.favoriteStore(storeId)
        this.showToast('收藏成功', 'success')
      }
      
      // 更新列表中的收藏状态
      const storeList = this.state.storeList.map(item => {
        if (item.id === storeId) {
          return { ...item, isFavorite: !isFavorite }
        }
        return item
      })
      
      this.setState({ storeList })
    } catch (error) {
      console.error('收藏操作失败:', error)
      this.showToast('操作失败，请重试', 'error')
    }
  }

  // 电话点击
  onCallClick = (e: any, phone: string) => {
    e.stopPropagation()
    
    Taro.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        this.showToast('拨打电话失败', 'error')
      }
    })
  }

  // 快捷功能点击
  onQuickActionClick = (action: string) => {
    switch (action) {
      case 'quickBook':
        if (!store.isLogin) {
          Taro.navigateTo({
            url: '/pages/common/login/index'
          })
          return
        }
        Taro.navigateTo({
          url: '/pages/store/booking/index?quick=true'
        })
        break
      case 'nearby':
        if (!store.hasLocation) {
          this.showToast('请先获取位置信息', 'error')
          this.getCurrentLocation()
          return
        }
        this.setState({ sortBy: 'distance' })
        this.refreshData()
        break
      case 'orders':
        Taro.switchTab({
          url: '/pages/order/list/index'
        })
        break
      case 'membership':
        if (!store.isLogin) {
          Taro.navigateTo({
            url: '/pages/common/login/index'
          })
          return
        }
        Taro.navigateTo({
          url: '/pages/user/membership/index'
        })
        break
    }
  }

  // 显示Toast
  showToast = (text: string, status: 'success' | 'error' | 'loading' = 'success') => {
    this.setState({
      showToast: true,
      toastText: text,
      toastStatus: status
    })
    
    setTimeout(() => {
      this.setState({ showToast: false })
    }, 2000)
  }

  componentWillUnmount() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  }

  render() {
    const {
      searchKeyword,
      storeList,
      recommendedStores,
      loading,
      loadingMore,
      hasMore,
      sortBy,
      showCityPicker,
      cityList,
      showToast,
      toastText,
      toastStatus
    } = this.state

    return (
      <View className='index-container'>
        {/* 顶部搜索区域 */}
        <View className='search-header'>
          <View className='city-selector' onClick={this.onCitySelect}>
            <Text className='city-name'>{store.currentCity}</Text>
            <AtIcon value='chevron-down' size='16' />
          </View>
          
          <View className='search-box'>
            <AtSearchBar
              value={searchKeyword}
              placeholder='搜索门店'
              onChange={this.onSearchChange}
              onActionClick={this.onSearchActionClick}
            />
          </View>
        </View>

        {/* 位置信息 */}
        {store.location && (
          <View className='location-info' onClick={this.getCurrentLocation}>
            <AtIcon value='map-pin' size='16' color='#4A90E2' />
            <Text className='location-text'>{store.location.address || '定位中...'}</Text>
            <AtIcon value='chevron-right' size='12' />
          </View>
        )}

        {/* 快捷功能 */}
        <View className='quick-actions'>
          <View className='action-item' onClick={() => this.onQuickActionClick('quickBook')}>
            <AtIcon value='clock' size='24' color='#4A90E2' />
            <Text>快速预订</Text>
          </View>
          <View className='action-item' onClick={() => this.onQuickActionClick('nearby')}>
            <AtIcon value='map-pin' size='24' color='#4A90E2' />
            <Text>附近门店</Text>
          </View>
          <View className='action-item' onClick={() => this.onQuickActionClick('orders')}>
            <AtIcon value='list' size='24' color='#4A90E2' />
            <Text>我的订单</Text>
          </View>
          <View className='action-item' onClick={() => this.onQuickActionClick('membership')}>
            <AtIcon value='star-2' size='24' color='#4A90E2' />
            <Text>会员中心</Text>
          </View>
        </View>

        {/* 推荐店铺 */}
        {recommendedStores.length > 0 && (
          <View className='section'>
            <View className='section-header'>
              <Text className='section-title'>为您推荐</Text>
              <Text className='section-more'>更多</Text>
            </View>
            <ScrollView className='horizontal-scroll' scrollX>
              {recommendedStores.map(item => (
                <View 
                  key={item.id} 
                  className='store-card-horizontal'
                  onClick={() => this.onStoreCardClick(item)}
                >
                  <Image
                    className='store-image'
                    src={item.images?.[0] || ''}
                    mode='aspectFill'
                    lazyLoad
                  />
                  <View className='store-info'>
                    <Text className='store-name'>{item.name}</Text>
                    <Text className='store-address'>{item.address}</Text>
                    <View className='store-meta'>
                      <Text className='price'>¥{item.minPrice}/小时起</Text>
                      <Text className='distance'>{item.distance}m</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 店铺列表 */}
        <View className='section'>
          <View className='section-header'>
            <Text className='section-title'>全部门店</Text>
            <View className='filter-buttons'>
              <Text 
                className={`filter-btn ${sortBy === 'distance' ? 'active' : ''}`}
                onClick={() => this.onSortChange('distance')}
              >
                距离
              </Text>
              <Text 
                className={`filter-btn ${sortBy === 'rating' ? 'active' : ''}`}
                onClick={() => this.onSortChange('rating')}
              >
                评分
              </Text>
              <Text 
                className={`filter-btn ${sortBy === 'price' ? 'active' : ''}`}
                onClick={() => this.onSortChange('price')}
              >
                价格
              </Text>
            </View>
          </View>

          {/* 店铺卡片列表 */}
          <View className='store-list'>
            {storeList.map(item => (
              <View 
                key={item.id} 
                className='store-card'
                onClick={() => this.onStoreCardClick(item)}
              >
                <View className='store-image-container'>
                  <Image
                    className='store-image'
                    src={item.images?.[0] || ''}
                    mode='aspectFill'
                    lazyLoad
                  />
                  <View className={`store-status ${item.status === 'open' ? 'open' : 'closed'}`}>
                    {item.status === 'open' ? '营业中' : '已打烊'}
                  </View>
                </View>
                
                <View className='store-content'>
                  <View className='store-header'>
                    <Text className='store-name'>{item.name}</Text>
                    <View className='store-actions'>
                      <AtIcon
                        value={item.isFavorite ? 'heart-2' : 'heart'}
                        size='20'
                        color={item.isFavorite ? '#FF6B35' : '#999999'}
                        onClick={(e) => this.onFavoriteClick(e, item.id, !!item.isFavorite)}
                      />
                      <AtIcon
                        value='phone'
                        size='20'
                        color='#4A90E2'
                        onClick={(e) => this.onCallClick(e, item.phone || '')}
                      />
                    </View>
                  </View>
                  
                  <View className='store-address'>
                    <AtIcon value='map-pin' size='12' color='#999999' />
                    <Text>{item.address}</Text>
                  </View>
                  
                  <View className='store-facilities'>
                    {item.facilities?.map((facility, index) => (
                      <AtTag key={index} size='small' type='primary'>
                        {facility}
                      </AtTag>
                    ))}
                  </View>
                  
                  <View className='store-footer'>
                    <View className='store-rating'>
                      <AtIcon value='star-2' size='12' color='#FFD700' />
                      <Text className='rating-score'>{item.rating}</Text>
                    </View>
                    
                    <View className='store-price'>
                      <Text className='price-label'>¥{item.minPrice}/小时起</Text>
                    </View>
                    
                    <View className='store-distance'>
                      <Text className='distance-text'>{item.distance}m</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* 加载更多 */}
          {hasMore && (
            <View className='load-more'>
              {loadingMore ? (
                <AtIcon value='loading-3' size='16' />
              ) : (
                <Text onClick={this.loadMoreStores}>加载更多</Text>
              )}
            </View>
          )}

          {/* 空状态 */}
          {!loading && storeList.length === 0 && (
            <View className='empty-state'>
              <AtIcon value='file-generic' size='60' color='#CCCCCC' />
              <Text className='empty-text'>暂无门店信息</Text>
              <AtButton type='primary' size='small' onClick={this.refreshData}>
                刷新
              </AtButton>
            </View>
          )}
        </View>

        {/* 城市选择弹窗 */}
        <AtActionSheet
          isOpened={showCityPicker}
          onClose={this.onCityPickerClose}
          title='选择城市'
        >
          {cityList.map(city => (
            <AtActionSheetItem key={city} onClick={() => this.onCityChange(city)}>
              {city}
            </AtActionSheetItem>
          ))}
        </AtActionSheet>

        {/* Toast提示 */}
        <AtToast
          isOpened={showToast}
          text={toastText}
          status={toastStatus}
          duration={2000}
          onClose={() => this.setState({ showToast: false })}
        />
      </View>
    )
  }
}

export default Index