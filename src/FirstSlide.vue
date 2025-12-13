<script setup lang="ts">
import * as pptInfoApi from '@/services/pptInfo'
import {getQueryParameter} from '@/utils/queryString'
import FullscreenSpin from '@/components/FullscreenSpin.vue'
import {useSlidesStore} from '@/store'
import {storeToRefs} from 'pinia'
import {onMounted, useTemplateRef} from 'vue'
import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue'

const itemRef = useTemplateRef<HTMLElement>('itemRef')

const slidesStore = useSlidesStore()
const {slides} = storeToRefs(slidesStore)
const pptCode = getQueryParameter('pptCode')

onMounted(async () => {
  if (pptCode) {
    pptInfoApi.getPptInfo(pptCode).then((pptInfo: any) => {
      slidesStore.setSlides(pptInfo.slides || [])
      slidesStore.setTitle(pptInfo.title)
      Object.keys(pptInfo.theme || {}).length && slidesStore.setTheme(pptInfo.theme)
      pptInfo.viewportSize && slidesStore.setViewportSize(pptInfo.viewportSize)
      pptInfo.viewportRatio && slidesStore.setViewportRatio(pptInfo.viewportRatio)
    })
  }
})
</script>

<template>
  <template v-if="slides.length">
    <div
        ref="itemRef"
        class="slide-item"
    >
      <ThumbnailSlide class="thumbnail" :slide="slides[0]" :size="itemRef?itemRef.clientWidth:180"/>
    </div>
  </template>
  <FullscreenSpin tip="数据初始化中，请稍等 ..." v-else loading :mask="false"/>
</template>

<style scoped lang="scss">

.slide-item {
  position: relative;
  width: 100%;
}
</style>