import {defineStore} from 'pinia'

export interface CoverState {
  coverDom: HTMLElement | undefined
}

export const useCoverStore = defineStore('cover', {
  state: (): CoverState => ({
    coverDom: undefined, // 封面图的元素
  }),

  actions: {
    setCoverDom(dom: HTMLElement | undefined) {
      this.coverDom = dom
    },
  },
})