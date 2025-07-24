import { Request } from 'luch-request'
import type { ApiResponse } from '@/types'
import { API_CONFIG, STORAGE_KEYS, ERROR_CODES } from '@/constants'
import { useUserStore } from '@/stores/user'

// 创建请求实例
const http = new Request({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  header: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 显示加载动画
    if (config.custom?.showLoading !== false) {
      uni.showLoading({
        title: '加载中...',
        mask: true
      })
    }

    // 添加token
    const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
    if (token) {
      config.header = {
        ...config.header,
        Authorization: `Bearer ${token}`
      }
    }

    // 添加平台标识
    config.header = {
      ...config.header,
      'X-Platform': process.env.UNI_PLATFORM || 'unknown'
    }

    console.log('请求配置:', config)
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    // 隐藏加载动画
    if (response.config.custom?.showLoading !== false) {
      uni.hideLoading()
    }

    const data = response.data as ApiResponse

    console.log('响应数据:', data)

    // 业务成功
    if (data.code === ERROR_CODES.SUCCESS) {
      return Promise.resolve(data)
    }

    // token失效
    if (data.code === ERROR_CODES.UNAUTHORIZED) {
      const userStore = useUserStore()
      userStore.logout()
      
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      })
      
      // 跳转到登录页
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/common/login/index'
        })
      }, 1500)
      
      return Promise.reject(new Error(data.message))
    }

    // 其他业务错误
    if (response.config.custom?.showError !== false) {
      uni.showToast({
        title: data.message || '请求失败',
        icon: 'none'
      })
    }

    return Promise.reject(new Error(data.message))
  },
  (error) => {
    // 隐藏加载动画
    uni.hideLoading()

    console.error('响应拦截器错误:', error)

    let errorMessage = '网络异常，请稍后重试'

    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          errorMessage = '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请登录'
          break
        case 403:
          errorMessage = '拒绝访问'
          break
        case 404:
          errorMessage = '请求地址不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        case 502:
          errorMessage = '网关错误'
          break
        case 503:
          errorMessage = '服务不可用'
          break
        case 504:
          errorMessage = '网关超时'
          break
        default:
          errorMessage = `连接错误${error.statusCode}`
      }
    } else if (error.errMsg) {
      if (error.errMsg.includes('timeout')) {
        errorMessage = '请求超时'
      } else if (error.errMsg.includes('fail')) {
        errorMessage = '网络连接失败'
      }
    }

    // 显示错误提示
    if (error.config?.custom?.showError !== false) {
      uni.showToast({
        title: errorMessage,
        icon: 'none'
      })
    }

    return Promise.reject(error)
  }
)

// 封装请求方法
class RequestService {
  /**
   * GET请求
   */
  get<T = any>(url: string, params?: any, config?: any): Promise<ApiResponse<T>> {
    return http.get(url, { params, ...config })
  }

  /**
   * POST请求
   */
  post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    return http.post(url, data, config)
  }

  /**
   * PUT请求
   */
  put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    return http.put(url, data, config)
  }

  /**
   * DELETE请求
   */
  delete<T = any>(url: string, params?: any, config?: any): Promise<ApiResponse<T>> {
    return http.delete(url, { params, ...config })
  }

  /**
   * 上传文件
   */
  upload<T = any>(
    url: string,
    filePath: string,
    name: string = 'file',
    formData?: any
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      uni.showLoading({
        title: '上传中...',
        mask: true
      })

      const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
      const header: any = {}
      
      if (token) {
        header.Authorization = `Bearer ${token}`
      }

      uni.uploadFile({
        url: API_CONFIG.BASE_URL + url,
        filePath,
        name,
        formData,
        header,
        success: (res) => {
          uni.hideLoading()
          
          try {
            const data = JSON.parse(res.data) as ApiResponse<T>
            if (data.code === ERROR_CODES.SUCCESS) {
              resolve(data)
            } else {
              uni.showToast({
                title: data.message || '上传失败',
                icon: 'none'
              })
              reject(new Error(data.message))
            }
          } catch (error) {
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            })
            reject(error)
          }
        },
        fail: (error) => {
          uni.hideLoading()
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
          reject(error)
        }
      })
    })
  }

  /**
   * 下载文件
   */
  download(url: string, fileName?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      uni.showLoading({
        title: '下载中...',
        mask: true
      })

      uni.downloadFile({
        url: url.startsWith('http') ? url : API_CONFIG.BASE_URL + url,
        success: (res) => {
          uni.hideLoading()
          
          if (res.statusCode === 200) {
            // 保存文件
            if (fileName) {
              uni.saveFile({
                tempFilePath: res.tempFilePath,
                success: (saveRes) => {
                  resolve(saveRes.savedFilePath)
                },
                fail: reject
              })
            } else {
              resolve(res.tempFilePath)
            }
          } else {
            reject(new Error('下载失败'))
          }
        },
        fail: (error) => {
          uni.hideLoading()
          uni.showToast({
            title: '下载失败',
            icon: 'none'
          })
          reject(error)
        }
      })
    })
  }
}

export const request = new RequestService()
export default request