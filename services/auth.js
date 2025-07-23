// services/auth.js
import request from '../utils/request'

class AuthService {
  // 微信登录
  async wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: async (loginRes) => {
          if (loginRes.code) {
            try {
              // 发送code到后端换取token
              const result = await request.post('/auth/wx-login', {
                code: loginRes.code
              })
              resolve(result)
            } catch (error) {
              reject(error)
            }
          } else {
            reject(new Error('获取登录凭证失败'))
          }
        },
        fail: reject
      })
    })
  }

  // 获取用户信息授权
  async getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo)
        },
        fail: (error) => {
          if (error.errMsg.includes('auth deny')) {
            wx.showToast({
              title: '需要授权才能使用',
              icon: 'none'
            })
          }
          reject(error)
        }
      })
    })
  }

  // 检查session有效性
  async checkSession() {
    return new Promise((resolve, reject) => {
      wx.checkSession({
        success: resolve,
        fail: reject
      })
    })
  }

  // 完整的登录流程
  async login() {
    try {
      // 1. 微信登录获取code
      const loginResult = await this.wxLogin()
      
      // 2. 如果需要用户信息，获取用户授权
      if (loginResult.needUserInfo) {
        const userInfo = await this.getUserProfile()
        
        // 3. 将用户信息发送到后端
        const completeResult = await request.post('/auth/complete-profile', {
          token: loginResult.token,
          userInfo
        })
        
        return completeResult
      }
      
      return loginResult
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 刷新token
  async refreshToken() {
    try {
      const result = await request.post('/auth/refresh-token')
      return result
    } catch (error) {
      // token刷新失败，需要重新登录
      throw error
    }
  }

  // 获取用户详细信息
  async getUserInfo() {
    try {
      const result = await request.get('/auth/user-info')
      return result
    } catch (error) {
      throw error
    }
  }

  // 更新用户信息
  async updateUserInfo(userInfo) {
    try {
      const result = await request.put('/auth/user-info', userInfo)
      return result
    } catch (error) {
      throw error
    }
  }

  // 绑定手机号
  async bindPhone(phoneData) {
    try {
      const result = await request.post('/auth/bind-phone', phoneData)
      return result
    } catch (error) {
      throw error
    }
  }

  // 解绑手机号
  async unbindPhone() {
    try {
      const result = await request.post('/auth/unbind-phone')
      return result
    } catch (error) {
      throw error
    }
  }

  // 注销账号
  async deleteAccount() {
    try {
      const result = await request.post('/auth/delete-account')
      return result
    } catch (error) {
      throw error
    }
  }

  // 登出
  async logout() {
    try {
      await request.post('/auth/logout')
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 清除本地数据
      wx.removeStorageSync('token')
      wx.removeStorageSync('userInfo')
    }
  }
}

export default new AuthService()