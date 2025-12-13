<script setup lang="ts">
import * as pptInfoApi from '@/services/pptInfo'
import {getQueryParameter} from '@/utils/queryString'
import FullscreenSpin from '@/components/FullscreenSpin.vue'
import {useSlidesStore} from '@/store'
import {storeToRefs} from 'pinia'
import {onMounted, useTemplateRef} from 'vue'
import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue'

const listRef = useTemplateRef<HTMLElement>('listRef')

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
    <div class="list" ref="listRef">
      <template v-for="slide in slides" :key="slide.id">
        <div
            class="slide-item"
        >
          <ThumbnailSlide class="thumbnail" :slide="slide" :size="listRef?((listRef.clientWidth-48)/2):180"/>
        </div>
      </template>
    </div>
  </template>
  <FullscreenSpin tip="数据初始化中，请稍等 ..." v-else loading :mask="false"/>
</template>

<style scoped lang="scss">

.list {
  width: 100%;
  padding: 16px 0 16px 16px;
  overflow: auto;
  height: 100vh;
  @include flex-grid-layout();
}

.slide-item {
  position: relative;
  @include flex-grid-layout-children(2, 50%);
  margin-bottom: 16px;

  &:hover .btns {
    opacity: 1;
  }

  &:hover .thumbnail {
    outline-color: $themeColor;
  }

  .thumbnail {
    outline: 2px solid $borderColor;
    transition: outline $transitionDelay;
    border-radius: $borderRadius;
  }
}
</style>