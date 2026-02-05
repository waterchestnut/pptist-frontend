import axios from './axios'
import {getDocHttpUrl} from '@/utils/util'

// @ts-ignore
export const SERVER_URL = PPTONLINE_API_BASE

export async function getDemoSlides(): Promise<any> {
  const ret = await axios.get(`${SERVER_URL}/ppt/demo`)
  return ret?.data?.slides || []
}

export async function getPptInfo(pptCode: string | null): Promise<any> {
  const ret = await axios.get(`${SERVER_URL}/ppt/detail?pptCode=${pptCode}`)
  return ret?.data || {
    slides: [{
      'id': 'test-slide-1',
      'elements': [],
      'background': {
        'type': 'solid',
        'color': '#ffffff'
      }
    },]
  }
}

export async function savePptInfo(info: any): Promise<any> {
  return axios.post(`${SERVER_URL}/ppt/save`, info, {
  })
}

export async function getTmplList(): Promise<any> {
  const ret = await axios.get(`${SERVER_URL}/ppt/tmpl`)
  return (ret?.data || []).map((_: any) => ({
    id: _.pptCode,
    name: _.title,
    cover: getDocHttpUrl(_.coverUrl)
  }))
}