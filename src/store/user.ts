import {defineStore} from 'pinia'

export interface UserState {
  userInfo?: any
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: undefined, // 当前登录用户信息
  }),

  actions: {
    setUserInfo(user: any) {
      this.userInfo = user
    },
  },
})