<template>
  <div class="export-cover">
    <div class="thumbnails-view">
      <div class="thumbnails" ref="coverThumbnailsRef">
        <ThumbnailSlide
            class="thumbnail"
            :slide="slides[0]"
            :size="400"
            v-if="slides?.length > 0"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {storeToRefs} from 'pinia'
import {useSlidesStore} from '@/store'
import {useCoverStore} from '@/store/cover'

import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue'
import api from '@/services'
import type {Slide, SlideTheme} from '@/types/slides'
import useAIPPT from '@/hooks/useAIPPT'
import * as pptInfoApi from '@/services/pptInfo'
import useAIPPTPro from '@/hooks/useAIPPTPro'

const {slides} = storeToRefs(useSlidesStore())
const {setCoverDom} = useCoverStore()
const slidesStore = useSlidesStore()
const {AIPPT} = useAIPPT()
const {AIPPTPro} = useAIPPTPro()

const coverThumbnailsRef = ref<HTMLElement>()

onMounted(async () => {
  setCoverDom(coverThumbnailsRef.value)

  // @ts-ignore
  window.genPPTContent = async (content: any, tmplCode: string = 'template_1') => {
    slidesStore.setSlides([{id: 'tmp', elements: []}])
    const templateData = await pptInfoApi.getPptInfo(tmplCode)
    const templateSlides: Slide[] = templateData!.slides
    const templateTheme: SlideTheme = templateData!.theme
    templateData.aiIndividual ? (await AIPPTPro(templateSlides, content)) : AIPPT(templateSlides, content)
    slidesStore.setTheme(templateTheme)
    const {title, theme, slides, slideIndex, viewportSize, viewportRatio, templates} = storeToRefs(slidesStore)
    let info = {
      title: title.value,
      theme: theme.value,
      slides: slides.value,
      slideIndex: slideIndex.value,
      viewportSize: viewportSize.value,
      viewportRatio: viewportRatio.value,
    }
    /*console.log(info)*/
    return info
  }
})

</script>

<style lang="scss" scoped>
.export-cover {
  height: 0;
  width: 0;
  position: relative;
  overflow: hidden;
}

.thumbnails-view {
  @include absolute-0();

  &::after {
    content: '';
    background-color: #fff;
    @include absolute-0();
  }
}

.thumbnail {
  &.break-page {
    break-after: page;
  }
}
</style>