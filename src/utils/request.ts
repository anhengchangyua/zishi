import Taro from '@tarojs/taro'
import { store } from '@/store'

interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  timeout?: number
  loading?: boolean
  loadingText?: string
  showError?: boolean
}

interface ResponseData<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
}

class Request {
  private baseURL: string = 'https://api.yihan.com/v1'
  private timeout: number = 10000
  private requestQueue: Map<string, boolean> = new Map()

  constructor() {
    // 监听网络状态变化
    Taro.onNetworkStatusChange((res) => {
      store.setNetworkStatus(res.isConnected)
    })
  }

  // 生成请求key
  private generateRequestKey(config: RequestConfig): string {
    const { url, method = 'GET', data = {} } = config
    return `${method}:${url}:${JSON.stringify(data)}`
  }

  // 请求拦截器
  private interceptRequest(config: RequestConfig): RequestConfig {
    // 添加token
    const token = Taro.getStorageSync('token')
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
      'X-Client-Platform': 'taro-miniprogram',
      ...config.header
    }

    // 显示loading
    if (config.loading !== false) {
      Taro.showLoading({
        title: config.loadingText || '加载中...',
        mask: true
      })
    }

    return config
  }

  // 响应拦截器
  private interceptResponse<T>(
    response: Taro.request.SuccessCallbackResult, 
    config: RequestConfig
  ): Promise<T> {
    // 隐藏loading
    if (config.loading !== false) {
      Taro.hideLoading()
    }

    const { statusCode, data } = response
    const responseData = data as ResponseData<T>

    if (statusCode === 200) {
      if (responseData.code === 200) {
        return Promise.resolve(responseData.data)
      } else if (responseData.code === 401) {
        // token过期，清除登录状态
        store.logout()
        this.redirectToLogin()
        return Promise.reject(responseData)
      } else if (responseData.code === 403) {
        // 权限不足
        Taro.showModal({
          title: '提示',
          content: '权限不足，请联系客服',
          showCancel: false
        })
        return Promise.reject(responseData)
      } else {
        // 业务错误
        if (config.showError !== false) {
          Taro.showToast({
            title: responseData.message || '请求失败',
            icon: 'none',
            duration: 2000
          })
        }
        return Promise.reject(responseData)
      }
    } else if (statusCode === 404) {
      Taro.showToast({
        title: '接口不存在',
        icon: 'none'
      })
      return Promise.reject(response)
    } else if (statusCode >= 500) {
      Taro.showToast({
        title: '服务器错误',
        icon: 'none'
      })
      return Promise.reject(response)
    } else {
      Taro.showToast({
        title: '网络错误',
        icon: 'none'
      })
      return Promise.reject(response)
    }
  }

  // 基础请求方法
  private request<T = any>(config: RequestConfig): Promise<T> {
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

      Taro.request({
        url: finalConfig.url,
        method: finalConfig.method,
        data: finalConfig.data,
        header: finalConfig.header,
        timeout: finalConfig.timeout,
        success: (response) => {
          try {
            this.interceptResponse<T>(response, config)
              .then(resolve)
              .catch(reject)
          } catch (error) {
            reject(error)
          }
        },
        fail: (error) => {
          if (config.loading !== false) {
            Taro.hideLoading()
          }

          // 网络错误处理
          if (error.errMsg?.includes('timeout')) {
            Taro.showToast({
              title: '请求超时',
              icon: 'none'
            })
          } else if (error.errMsg?.includes('fail')) {
            // 检查网络状态
            Taro.getNetworkType({
              success: (res) => {
                if (res.networkType === 'none') {
                  Taro.showToast({
                    title: '网络连接失败',
                    icon: 'none'
                  })
                  store.setNetworkStatus(false)
                } else {
                  Taro.showToast({
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
  get<T = any>(url: string, params: Record<string, any> = {}, config: Partial<RequestConfig> = {}): Promise<T> {
    // 处理查询参数
    if (Object.keys(params).length > 0) {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      url += (url.includes('?') ? '&' : '?') + queryString
    }

    return this.request<T>({
      url,
      method: 'GET',
      ...config
    })
  }

  // POST请求
  post<T = any>(url: string, data: any = {}, config: Partial<RequestConfig> = {}): Promise<T> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config
    })
  }

  // PUT请求
  put<T = any>(url: string, data: any = {}, config: Partial<RequestConfig> = {}): Promise<T> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config
    })
  }

  // DELETE请求
  delete<T = any>(url: string, config: Partial<RequestConfig> = {}): Promise<T> {
    return this.request<T>({
      url,
      method: 'DELETE',
      ...config
    })
  }

  // 文件上传
  upload<T = any>(
    url: string, 
    filePath: string, 
    formData: Record<string, any> = {}, 
    config: Partial<RequestConfig> = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const token = Taro.getStorageSync('token')

      if (config.loading !== false) {
        Taro.showLoading({
          title: '上传中...',
          mask: true
        })
      }

      Taro.uploadFile({
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
            Taro.hideLoading()
          }

          try {
            const data = JSON.parse(response.data) as ResponseData<T>
            if (data.code === 200) {
              resolve(data.data)
            } else {
              Taro.showToast({
                title: data.message || '上传失败',
                icon: 'none'
              })
              reject(data)
            }
          } catch (error) {
            Taro.showToast({
              title: '上传失败',
              icon: 'none'
            })
            reject(error)
          }
        },
        fail: (error) => {
          if (config.loading !== false) {
            Taro.hideLoading()
          }
          Taro.showToast({
            title: '上传失败',
            icon: 'none'
          })
          reject(error)
        }
      })
    })
  }

  // 重定向到登录页
  private redirectToLogin(): void {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentRoute = currentPage ? currentPage.route : ''

    // 避免在登录页重复跳转
    if (currentRoute !== 'pages/common/login/index') {
      Taro.navigateTo({
        url: '/pages/common/login/index'
      })
    }
  }

  // 取消所有请求
  cancelAllRequests(): void {
    this.requestQueue.clear()
  }

  // 设置基础URL
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL
  }

  // 设置超时时间
  setTimeout(timeout: number): void {
    this.timeout = timeout
  }
}

// 创建请求实例
const request = new Request()

export default request
export { Request, RequestConfig, ResponseData }