<template>
  <template v-if="slides.length">
    <Screen v-if="screening"/>
    <Editor v-else-if="_isPC"/>
    <Mobile v-else/>
  </template>
  <FullscreenSpin tip="数据初始化中，请稍等 ..." v-else loading :mask="false"/>
</template>


<script lang="ts" setup>
import {onMounted} from 'vue'
import {storeToRefs} from 'pinia'
import {useScreenStore, useMainStore, useSnapshotStore, useSlidesStore, useUserStore} from '@/store'
import {LOCALSTORAGE_KEY_DISCARDED_DB} from '@/configs/storage'
import {deleteDiscardedDB} from '@/utils/database'
import {isPC} from '@/utils/common'
import type {Slide} from '@/types/slides'
import api from '@/services'
import * as pptInfoApi from '@/services/pptInfo'
import {getQueryParameter} from '@/utils/queryString'
import * as userApi from '@/services/user'

import Editor from './views/Editor/index.vue'
import Screen from './views/Screen/index.vue'
import Mobile from './views/Mobile/index.vue'
import FullscreenSpin from '@/components/FullscreenSpin.vue'
import useScreening from '@/hooks/useScreening'

const _isPC = isPC()

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const snapshotStore = useSnapshotStore()
const userStore = useUserStore()
const {databaseId} = storeToRefs(mainStore)
const {slides} = storeToRefs(slidesStore)
const {screening} = storeToRefs(useScreenStore())
const {enterScreening} = useScreening()

const pptCode = getQueryParameter('pptCode')
const isMock = getQueryParameter('isMock')
const readonly = getQueryParameter('readonly')

if (import.meta.env.MODE !== 'development') {
  window.onbeforeunload = () => false
}

onMounted(async () => {
  let userInfo = isMock ? {} : (await userApi.queryCurrentUser())
  userStore.setUserInfo(userInfo)
  if (isMock) {
    const slides = await api.getMockData('slides')
    slidesStore.setSlides(slides)
  } else if (pptCode) {
    pptInfoApi.getPptInfo(pptCode).then((pptInfo: any) => {
      slidesStore.setSlides(pptInfo.slides || [])
      slidesStore.setTitle(pptInfo.title)
      Object.keys(pptInfo.theme || {}).length && slidesStore.setTheme(pptInfo.theme)
      pptInfo.viewportSize && slidesStore.setViewportSize(pptInfo.viewportSize)
      pptInfo.viewportRatio && slidesStore.setViewportRatio(pptInfo.viewportRatio)
    })
  } else {
    pptInfoApi.getDemoSlides().then((slides: Slide[]) => {
      slidesStore.setSlides(slides)
    })
  }
  pptInfoApi.getTmplList().then((tmplList) => {
    tmplList?.length && slidesStore.setTemplates(tmplList)
  })

  await deleteDiscardedDB()
  snapshotStore.initSnapshotDatabase()
  if (readonly) {
    enterScreening()
  }
})

// 应用注销时向 localStorage 中记录下本次 indexedDB 的数据库ID，用于之后清除数据库
window.addEventListener('beforeunload', () => {
  const discardedDB = localStorage.getItem(LOCALSTORAGE_KEY_DISCARDED_DB)
  const discardedDBList: string[] = discardedDB ? JSON.parse(discardedDB) : []

  discardedDBList.push(databaseId.value)

  const newDiscardedDB = JSON.stringify(discardedDBList)
  localStorage.setItem(LOCALSTORAGE_KEY_DISCARDED_DB, newDiscardedDB)
})
</script>

<style lang="scss">
#app {
  height: 100%;
}
</style>