import {useSlidesStore} from '@/store'
import message from '@/utils/message'
import * as pptInfoApi from '@/services/pptInfo'
import {storeToRefs} from 'pinia'
import {getQueryParameter} from '@/utils/queryString'
import {useCoverStore} from '@/store/cover'
import {toBlob} from 'html-to-image'
import {uploadPptCover} from '@/services/fileInfo'

export default () => {
  const slidesStore = useSlidesStore()
  const {title, theme, slides, slideIndex, viewportSize, viewportRatio, templates} = storeToRefs(slidesStore)
  const {coverDom} = storeToRefs(useCoverStore())

  const savePpt = async () => {
    const foreignObjectSpans = coverDom.value?.querySelectorAll('foreignObject [xmlns]')
    foreignObjectSpans?.forEach(spanRef => spanRef.removeAttribute('xmlns'))
    setTimeout(() => {
      coverDom.value && toBlob(coverDom.value, {
        quality: 1,
        width: 400,
      }).then(async blobData => {
        if (blobData) {
          const formData = new FormData()
          formData.append('file', blobData, `${title.value}.jpg`)
          const ret = await uploadPptCover(`cover-${pptCode}`, formData)
        }
      }).catch((e) => {
        console.error('保存封面失败：' + e)
      })
    }, 200)

    const pptCode = getQueryParameter('pptCode')
    if (!pptCode) {
      return message.error(`非服务端创建的PPT，不能保存`, {duration: 5000, closable: true})
    }
    const ret = await pptInfoApi.savePptInfo({
      title: title.value,
      theme: theme.value,
      slides: slides.value,
      slideIndex: slideIndex.value,
      viewportSize: viewportSize.value,
      viewportRatio: viewportRatio.value,
      pptCode,
      firstSlideImgUrl: `/file/download/?fileCode=cover-${pptCode}`,
    })
    if (ret?.code === 0) {
      const now = new Date()
      message.info(`已保存，保存时间：${now.getHours()}时${now.getMinutes().toString().padStart(2, '0')}分${now.getSeconds().toString().padStart(2, '0')}秒`, {
        duration: 3000,
        closable: true
      })
    } else {
      message.error(`保存失败：${ret?.msg || ''}`, {duration: 5000, closable: true})
    }
  }

  return {
    savePpt,
  }
}