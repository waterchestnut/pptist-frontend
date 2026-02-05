import axios from './axios'
import {setUserCache} from '@/utils/authority'

// @ts-ignore
export const SERVER_URL = UCENTER_API_BASE

/** 获取当前登录用户信息 */
export async function queryCurrentUser(): Promise<any> {
  let ret = await axios.get(`${SERVER_URL}/core/user/cur`)
  // @ts-ignore
  if (process.env.NODE_ENV === 'development') {
    setUserCache(ret?.data)
  }
  return ret?.data || undefined
}