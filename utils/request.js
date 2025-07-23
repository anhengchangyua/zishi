// utils/request.js
import { store } from '../store/index'

class Request {
  constructor() {
    this.baseURL = 'https://api.zishi.com/v1'
    this.timeout = 10000
    this.requestQueue = new Map() // 请求队列，用于防重复请求
  }

  // 生成请求key
  generateRequestKey(config) {
    const { url, method = 'GET', data = {} } = config
    return `${method}:${url}:${JSON.stringify(data)}`
  }

  // 请求拦截器
  interceptRequest(config) {
    // 添加token
    const token = wx.getStorageSync('token')
    if (token) {
      config.header = {
        ...config.header,
        'Authorization': `Bearer ${token}`
      }
    }
    
    // 添加通用header
    config.header = {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Client-Platform': 'miniprogram',
      ...config.header
    }
    
    // 显示loading
    if (config.loading !== false) {
      wx.showLoading({
        title: config.loadingText || '加载中...',
        mask: true
      })
    }
    
    return config
  }

  // 响应拦截器
  interceptResponse(response, config) {
    // 隐藏loading
    if (config.loading !== false) {
      wx.hideLoading()
    }

    const { statusCode, data } = response
    
    if (statusCode === 200) {
      if (data.code === 200) {
        return data.data
      } else if (data.code === 401) {
        // token过期，清除登录状态
        store.logout()
        this.redirectToLogin()
        return Promise.reject(data)
      } else if (data.code === 403) {
        // 权限不足
        wx.showModal({
          title: '提示',
          content: '权限不足，请联系客服',
          showCancel: false
        })
        return Promise.reject(data)
      } else {
        // 业务错误
        if (config.showError !== false) {
          wx.showToast({
            title: data.message || '请求失败',
            icon: 'none',
            duration: 2000
          })
        }
        return Promise.reject(data)
      }
    } else if (statusCode === 404) {
      wx.showToast({
        title: '接口不存在',
        icon: 'none'
      })
      return Promise.reject(response)
    } else if (statusCode >= 500) {
      wx.showToast({
        title: '服务器错误',
        icon: 'none'
      })
      return Promise.reject(response)
    } else {
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
      return Promise.reject(response)
    }
  }

  // 基础请求方法
  request(config) {
    return new Promise((resolve, reject) => {
      // 防重复请求
      const requestKey = this.generateRequestKey(config)
      if (this.requestQueue.has(requestKey)) {
        console.warn('重复请求被阻止:', requestKey)
        return reject(new Error('重复请求'))
      }
      
      // 请求拦截
      const finalConfig = this.interceptRequest({
        url: this.baseURL + config.url,
        method: config.method || 'GET',
        data: config.data || {},
        timeout: config.timeout || this.timeout,
        ...config
      })

      // 添加到请求队列
      this.requestQueue.set(requestKey, true)

      wx.request({
        ...finalConfig,
        success: (response) => {
          try {
            const result = this.interceptResponse(response, config)
            resolve(result)
          } catch (error) {
            reject(error)
          }
        },
        fail: (error) => {
          if (config.loading !== false) {
            wx.hideLoading()
          }
          
          // 网络错误处理
          if (error.errMsg.includes('timeout')) {
            wx.showToast({
              title: '请求超时',
              icon: 'none'
            })
          } else if (error.errMsg.includes('fail')) {
            // 检查网络状态
            wx.getNetworkType({
              success: (res) => {
                if (res.networkType === 'none') {
                  wx.showToast({
                    title: '网络连接失败',
                    icon: 'none'
                  })
                  store.setNetworkStatus(false)
                } else {
                  wx.showToast({
                    title: '请求失败，请重试',
                    icon: 'none'
                  })
                }
              }
            })
          }
          
          reject(error)
        },
        complete: () => {
          // 从请求队列中移除
          this.requestQueue.delete(requestKey)
        }
      })
    })
  }

  // GET请求
  get(url, params = {}, config = {}) {
    // 处理查询参数
    if (Object.keys(params).length > 0) {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      url += (url.includes('?') ? '&' : '?') + queryString
    }
    
    return this.request({
      url,
      method: 'GET',
      ...config
    })
  }

  // POST请求
  post(url, data = {}, config = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...config
    })
  }

  // PUT请求
  put(url, data = {}, config = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...config
    })
  }

  // DELETE请求
  delete(url, config = {}) {
    return this.request({
      url,
      method: 'DELETE',
      ...config
    })
  }

  // 文件上传
  upload(url, filePath, formData = {}, config = {}) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token')
      
      if (config.loading !== false) {
        wx.showLoading({
          title: '上传中...',
          mask: true
        })
      }

      wx.uploadFile({
        url: this.baseURL + url,
        filePath,
        name: 'file',
        formData,
        header: {
          'Authorization': token ? `Bearer ${token}` : '',
          ...config.header
        },
        success: (response) => {
          if (config.loading !== false) {
            wx.hideLoading()
          }
          
          try {
            const data = JSON.parse(response.data)
            if (data.code === 200) {
              resolve(data.data)
            } else {
              wx.showToast({
                title: data.message || '上传失败',
                icon: 'none'
              })
              reject(data)
            }
          } catch (error) {
            wx.showToast({
              title: '上传失败',
              icon: 'none'
            })
            reject(error)
          }
        },
        fail: (error) => {
          if (config.loading !== false) {
            wx.hideLoading()
          }
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          })
          reject(error)
        }
      })
    })
  }

  // 重定向到登录页
  redirectToLogin() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentRoute = currentPage ? currentPage.route : ''
    
    // 避免在登录页重复跳转
    if (currentRoute !== 'pages/common/login/index') {
      wx.navigateTo({
        url: '/pages/common/login/index'
      })
    }
  }

  // 取消所有请求
  cancelAllRequests() {
    this.requestQueue.clear()
  }
}

export default new Request()