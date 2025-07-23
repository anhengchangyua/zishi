import { Component } from 'react'
import { Provider } from 'mobx-react'
import Taro from '@tarojs/taro'
import { store } from '@/store'
import 'taro-ui/dist/style/index.scss'
import './app.scss'

class App extends Component {

  componentDidMount() {
    console.log('意涵自习室应用启动')
    
    // 检查登录状态
    this.checkLoginStatus()
    
    // 获取系统信息
    this.getSystemInfo()
    
    // 检查更新
    this.checkForUpdate()
  }

  componentDidShow() {
    console.log('应用显示')
  }

  componentDidHide() {
    console.log('应用隐藏')
  }

  // 检查登录状态
  checkLoginStatus = () => {
    const token = Taro.getStorageSync('token')
    if (token) {
      // 验证token有效性
      Taro.checkSession({
        success: () => {
          console.log('session有效')
          this.getUserInfo()
        },
        fail: () => {
          console.log('session失效，清除本地数据')
          Taro.removeStorageSync('token')
          Taro.removeStorageSync('userInfo')
        }
      })
    }
  }

  // 获取用户信息
  getUserInfo = async () => {
    try {
      const userInfo = Taro.getStorageSync('userInfo')
      if (userInfo) {
        store.updateUserInfo(userInfo)
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  // 获取系统信息
  getSystemInfo = () => {
    Taro.getSystemInfo({
      success: (res) => {
        console.log('系统信息', res)
        // 可以将系统信息存储到store中
      }
    })
  }

  // 检查小程序更新
  checkForUpdate = () => {
    if (Taro.canIUse('getUpdateManager')) {
      const updateManager = Taro.getUpdateManager()
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('发现新版本')
        }
      })
      
      updateManager.onUpdateReady(() => {
        Taro.showModal({
          title: '更新提示',
          content: '新版本已准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })
      
      updateManager.onUpdateFailed(() => {
        Taro.showToast({
          title: '更新失败',
          icon: 'none'
        })
      })
    }
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    )
  }
}

export default App