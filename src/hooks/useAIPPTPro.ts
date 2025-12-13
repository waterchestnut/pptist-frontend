import {ref} from 'vue'
import {nanoid} from 'nanoid'
import type {
  PPTElement,
  Slide,
} from '@/types/slides'
import {useSlidesStore} from '@/store'
import useAddSlidesOrElements from './useAddSlidesOrElements'
import useSlideHandler from './useSlideHandler'
import useAIPPT from '@/hooks/useAIPPT'
import api from '@/services'

export interface AIPPTSlidePro {
  id: string
  type: 'cover' | 'contents' | 'transition' | 'content' | 'end'
  data: {
    title: string
    subtitle: string
    text: string
    pageFigure: string
    background: string
    items: {
      groupId: string
      title: string
      text: string
      itemFigure: string
    }[]
  },
  offset?: number
}

const getTmplItems = (tmplSlide?: Slide) => {
  if (!tmplSlide) {
    return []
  }
  let items: any[] = []
  tmplSlide.elements?.forEach(element => {
    let groupId = element.groupId
    let itemInfo: any
    if (groupId) {
      itemInfo = items.find((_: any) => _.groupId === groupId)
    }
    if (element.type === 'text' && ['item', 'itemTitle', 'itemNumber'].includes(element.textType || '')) {
      if (!itemInfo) {
        itemInfo = {}
        if (groupId) {
          itemInfo.groupId = groupId
        }
        items.push(itemInfo)
      }
      itemInfo[element.textType || 'item'] = element
    }
    if (element.type === 'image' && ['itemFigure'].includes(element.imageType || '')) {
      if (!itemInfo) {
        itemInfo = {}
        if (groupId) {
          itemInfo.groupId = groupId
        }
        items.push(itemInfo)
      }
      itemInfo[element.imageType || 'item'] = element
    }
  })
  items.sort((a, b) => {
    let aContent = ''
    let bContent = ''
    let aElement = a.itemNumber || a.itemTitle || a.item || a.itemFigure
    let bElement = b.itemNumber || b.itemTitle || b.item || b.itemFigure
    if (aElement.type === 'text') aContent = aElement.content
    if (aElement.type === 'shape') aContent = aElement.text!.content
    if (bElement.type === 'text') bContent = bElement.content
    if (bElement.type === 'shape') bContent = bElement.text!.content
    if (aContent) {
      aContent = getText(aContent)
    }
    if (bContent) {
      bContent = getText(bContent)
    }
    //console.log(aContent, bContent)
    return aContent.localeCompare(bContent, 'en')
  })
  return items
}

const getItemIndex = (element: PPTElement, items: any[]) => {
  let index = -1
  let attrs = ['itemNumber', 'itemTitle', 'item', 'itemFigure']
  for (let i = 0, l = items.length; i < l; i++) {
    let item = items[i]
    for (let j = 0; j < attrs.length; j++) {
      if (item[attrs[j]]?.id === element.id) {
        index = i
        break
      }
    }
    if (index !== -1) {
      break
    }
  }
  return index
}

function getText(htmlString: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')
  return doc.querySelector('p')?.textContent || ''
}

async function searchImg(keywords: string) {
  /*dom解析的方式*/
  /*let res = await fetch(`https://www.pexels.com/search/${encodeURIComponent(keywords)}/`)
  let htmlString = await res.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')
  const elements = doc.querySelectorAll('article img')
  if (!elements?.length) {
      return ''
  }
  return elements[Math.floor(Math.random() * elements.length)].getAttribute('src')*/
  /*api调用的方式*/
  let ret = await api.searchImage({
    query: keywords,
    per_page: 10,
    page: 1,
  })
  if (!ret?.data?.length) {
    return ''
  }
  return ret.data[Math.floor(Math.random() * ret.data.length)].src
}

export default () => {
  const slidesStore = useSlidesStore()
  const {addSlidesFromData} = useAddSlidesOrElements()
  const {isEmptySlide} = useSlideHandler()
  const {checkTextType, getNewTextElement} = useAIPPT()
  const transitionIndex = ref(0)

  const AIPPTPro = async (templateSlides: Slide[], _AISlides: AIPPTSlidePro[]) => {
    slidesStore.updateSlideIndex(slidesStore.slides.length - 1)

    const AISlides: AIPPTSlidePro[] = []
    for (const aiSlide of _AISlides) {
      if (!aiSlide.data?.items?.length) {
        AISlides.push(aiSlide)
        continue
      }
      let tmplItems: any[] = getTmplItems(templateSlides.find(_ => _.id === aiSlide.id))
      if (!tmplItems.length) {
        AISlides.push(aiSlide)
        continue
      }
      let count = Math.ceil(aiSlide.data.items.length / tmplItems.length)
      for (let i = 0; i < count; i++) {
        let items = aiSlide.data.items.slice(i * tmplItems.length, (i + 1) * tmplItems.length)
        AISlides.push({...aiSlide, data: {...aiSlide.data, items: items}, offset: i * tmplItems.length})
      }
    }

    const slides: Slide[] = []

    for (const aiSlideItem of AISlides) {
      let template = templateSlides.find(_ => _.id === aiSlideItem.id)
      if (!template) {
        continue
      }
      if (aiSlideItem.type === 'transition') {
        transitionIndex.value = transitionIndex.value + 1
      }
      let tmplItems: any[] = getTmplItems(template)
      const elements = (await Promise.all(template.elements.map(async el => {
        if (el.type !== 'text' && el.type !== 'shape' && el.type !== 'image') return el
        if (checkTextType(el, 'title') && aiSlideItem.data.title && el.type !== 'image') {
          if (aiSlideItem.type === 'cover') {
            slidesStore.setTitle(aiSlideItem.data.title)
          }
          return getNewTextElement({el, text: aiSlideItem.data.title, maxLine: 2})
        }
        if (checkTextType(el, 'subtitle') && aiSlideItem.data.subtitle && el.type !== 'image') {
          return getNewTextElement({el, text: aiSlideItem.data.subtitle, maxLine: 2})
        }
        if (checkTextType(el, 'content') && aiSlideItem.data.text && el.type !== 'image') {
          return getNewTextElement({el, text: aiSlideItem.data.text, maxLine: 6})
        }
        if (checkTextType(el, 'partNumber') && el.type !== 'image') {
          return getNewTextElement({el, text: transitionIndex.value + '', maxLine: 1, digitPadding: true})
        }
        if (el.type === 'image' && (el.imageType === 'pageFigure' || el.imageType === 'background') && aiSlideItem.data[el.imageType]) {
          try {
            let src = await searchImg(aiSlideItem.data[el.imageType])
            if (src) {
              return {
                ...el,
                src: src
              }
            }
          } catch (e) {
            console.error(e)
          }
        }

        let itemIndex = getItemIndex(el, tmplItems)
        if (itemIndex >= 0) {
          if (!aiSlideItem.data.items?.length || itemIndex >= aiSlideItem.data.items.length) {
            return null
          }
          if (checkTextType(el, 'itemNumber') && el.type !== 'image') {
            const offset = aiSlideItem.offset || 0
            return getNewTextElement({
              el,
              text: itemIndex + offset + 1 + '',
              maxLine: 1,
              digitPadding: true
            })
          }
          if (checkTextType(el, 'itemTitle') && el.type !== 'image') {
            const contentItem = aiSlideItem.data.items[itemIndex]
            if (contentItem && contentItem.title) {
              return getNewTextElement({el, text: contentItem.title, maxLine: 2})
            }
          }
          if (checkTextType(el, 'item') && el.type !== 'image') {
            const contentItem = aiSlideItem.data.items[itemIndex]
            if (contentItem && contentItem.text) {
              return getNewTextElement({el, text: contentItem.text, maxLine: 6})
            }
          }
          if (el.type === 'image') {
            const contentItem = aiSlideItem.data.items[itemIndex]
            if (contentItem && contentItem.itemFigure) {
              try {
                let src = await searchImg(contentItem.itemFigure)
                if (src) {
                  return {
                    ...el,
                    src: src
                  }
                }
              } catch (e) {
                console.error(e)
              }
            }
          }
        }
        return el
      }))).filter(el => el)
      slides.push({
        ...template,
        id: nanoid(10),
        //@ts-ignore
        elements,
      })
    }
    if (isEmptySlide.value) slidesStore.setSlides(slides)
    else addSlidesFromData(slides)
  }
  //window.getItems = getTmplItems
  return {
    AIPPTPro
  }
}