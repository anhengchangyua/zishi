export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/store/detail/index',
    'pages/store/booking/index',
    'pages/order/list/index',
    'pages/order/detail/index',
    'pages/order/payment/index',
    'pages/user/profile/index',
    'pages/user/membership/index',
    'pages/user/settings/index',
    'pages/common/login/index',
    'pages/common/webview/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4A90E2',
    navigationBarTitleText: '意涵自习室',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F5F5',
    enablePullDownRefresh: true,
    onReachBottomDistance: 50
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#4A90E2',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    position: 'bottom',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/images/tab-home.png',
        selectedIconPath: 'assets/images/tab-home-active.png'
      },
      {
        pagePath: 'pages/order/list/index',
        text: '我的订单',
        iconPath: 'assets/images/tab-order.png',
        selectedIconPath: 'assets/images/tab-order-active.png'
      },
      {
        pagePath: 'pages/user/profile/index',
        text: '个人中心',
        iconPath: 'assets/images/tab-profile.png',
        selectedIconPath: 'assets/images/tab-profile-active.png'
      }
    ]
  },
  networkTimeout: {
    request: 10000,
    downloadFile: 10000
  },
  debug: false,
  navigateToMiniProgramAppIdList: [],
  permission: {
    'scope.userLocation': {
      desc: '您的位置信息将用于为您推荐附近的自习室'
    }
  },
  requiredBackgroundModes: ['location'],
  plugins: {},
  resizable: true,
  style: 'v2',
  sitemapLocation: 'sitemap.json',
  lazyCodeLoading: 'requiredComponents'
})

function defineAppConfig(config: any) {
  return config
}