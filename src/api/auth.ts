import request from '@/utils/request'
import type { UserInfo } from '@/types'

// 认证相关API
export const authApi = {
  /**
   * 微信登录
   */
  wechatLogin(code: string) {
    return request.post<{ token: string; userInfo: UserInfo }>('/auth/wechat/login', {
      code
    })
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return request.get<UserInfo>('/auth/user/info')
  },

  /**
   * 更新用户信息
   */
  updateUserInfo(data: Partial<UserInfo>) {
    return request.put<UserInfo>('/auth/user/info', data)
  },

  /**
   * 绑定手机号
   */
  bindPhone(data: { encryptedData: string; iv: string }) {
    return request.post('/auth/user/bind-phone', data)
  },

  /**
   * 检查会话状态
   */
  checkSession() {
    return request.get('/auth/session/check')
  },

  /**
   * 刷新token
   */
  refreshToken(refreshToken: string) {
    return request.post<{ token: string; refreshToken: string }>('/auth/token/refresh', {
      refreshToken
    })
  },

  /**
   * 退出登录
   */
  logout() {
    return request.post('/auth/logout')
  }
}