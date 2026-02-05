import axios from 'axios'
import message from '@/utils/message'
import {getAccessToken, getUserCache, toLogin} from '@/utils/authority'

const instance = axios.create({timeout: 1000 * 300})

instance.interceptors.request.use(config => {
  //console.log(config)
  let headers = config.headers || {}
  headers['param-accessToken'] = getAccessToken()
  // @ts-ignore
  if (process.env.NODE_ENV === 'development') {
    let userStr: string = getUserCache(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    userStr && (headers['user-info'] = userStr)
  }
  config.headers = headers
  return config
}, error => {
  return Promise.reject(error)
})

const tokenTimeoutCheck = async (response: any) => {
  const data = await response?.data
  if (data && (data.code === 4001 || data.code === 4002)) {
    /*登录超时，直接跳转*/
    toLogin()
    return false
  }
  return true
}

instance.interceptors.response.use(
  response => {
    if (!tokenTimeoutCheck(response)) {
      return Promise.reject(response)
    }

    if (response.status >= 200 && response.status < 400) {
      return Promise.resolve(response.data)
    }

    message.error('未知的请求错误！')
    return Promise.reject(response)
  },
  error => {
    if (!tokenTimeoutCheck(error?.response)) {
      return Promise.reject(error)
    }
    if (error && error.response) {
      if (error.response.status >= 400 && error.response.status < 500) {
        return Promise.reject(error.message)
      } else if (error.response.status >= 500) {
        return Promise.reject(error.message)
      }

      message.error('服务器遇到未知错误！')
      return Promise.reject(error.message)
    }

    message.error('连接到服务器失败 或 服务器响应超时！')
    return Promise.reject(error)
  }
)

export default instance

export function getDefaultHeaders() {
  let headers: any = {'Content-Type': 'application/json'}
  headers['param-accessToken'] = getAccessToken()
  // @ts-ignore
  if (process.env.NODE_ENV === 'development') {
    let userStr: string = getUserCache(false)
    userStr && (headers['user-info'] = userStr)
  }
  return headers
}