/**
 * @fileOverview 资源相关的接口调用
 * @author xianyang 2025/11/19
 * @module
 */

import axios from './config'
import {calcHashCode, uuidV4} from '@/utils/util'
import {simpleUploadFile, simpleUploadFileUnique} from '@/services/fileInfo'

// @ts-ignore
export const SERVER_URL = RESOURCE_API_BASE

const MIME_MAP: { [key: string]: string } = {

  // 图片类型
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/x-ms-bmp': 'bmp',
  'image/webm': 'weba',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/vnd.microsoft.icon': 'ico',
  'image/emf': 'emf',
  'image/x-emf': 'emf',
  'image/wmf ': 'wmf',
  'image/x-wmf ': 'wmf',

  // 音频类型
  'audio/aac': 'aac',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'oga',
  'audio/wav': 'wav',
  'audio/webm': 'weba',
  'audio/flac': 'flac',
  'audio/mp4': 'm4a',
  'audio/x-aiff': 'aif',
  'audio/x-ms-wma': 'wma',
  'audio/midi': 'mid',

  // 视频类型
  'video/mp4': 'mp4',
  'video/mpeg': 'mpeg',
  'video/ogg': 'ogv',
  'video/webm': 'webm',
  'video/x-msvideo': 'avi',
  'video/quicktime': 'mov',
  'video/x-ms-wmv': 'wmv',
  'video/x-flv': 'flv',
  'video/3gpp': '3gp',
  'video/3gpp2': '3g2'
}

/** 获取当前用户的资源列表 */
export async function getMyResList(pageIndex = 1, pageSize = 10, filter = {}, options: any = {}) {
  let ret: any = await axios.post(`${SERVER_URL}/core/res-my/list`, {
    filter: {...filter, manageType: 'self'},
    pageIndex,
    pageSize,
    options: {sort: {updateTime: -1}, ...options}
  })
  if (ret.code === 0) {
    return ret.data
  } else {
    return {total: 0}
  }
}

/** 上传并保存我的资源 */
export async function uploadMyResInfo(file: File) {
  let fileInfo: any = (await simpleUploadFile(file)).data
  return saveToResInfo(fileInfo)
}

async function saveToResInfo(fileInfo: any) {
  fileInfo.url = `/file/download/?fileCode=${fileInfo.fileCode}`
  fileInfo.name = fileInfo.fileName
  fileInfo.size = fileInfo.fileSize
  fileInfo.type = fileInfo.mimetype
  let resCode = uuidV4()
  await axios.post(`${SERVER_URL}/core/res-info/add`, {
    resCode,
    resType: 'upload',
    title: fileInfo.fileName,
    sources: [
      {
        title: '在线课件平台资料',
        description: '',
        href: `/res/detail?resCode=${resCode}`,
        sourceKey: 'pptonline',
        openAccess: true
      }
    ],
    url: `/res/detail?resCode=${resCode}`,
    fileList: [fileInfo],
    fileHashCodes: [fileInfo.fileHashCode],
    fileExts: [fileInfo.fileExt],
    originalHashCode: fileInfo.fileHashCode,
    manageTypes: ['self'],
    originalResCode: resCode
  })

  // @ts-ignore
  return `${DOC_API_BASE}${fileInfo.url}`
}

/** 前端Base64上传文件并保存我的资源 */
export async function uploadFromDataUrl(dataUrl: string) {
  /*console.log(dataUrl)*/
  if (!dataUrl) {
    return ''
  }
  let res = await fetch(dataUrl)
  let blob = await res.blob()
  let file = new File([blob], `${uuidV4()}.${MIME_MAP[blob.type]}`, {type: blob.type})
  let fileInfo: any = (await simpleUploadFileUnique(await calcHashCode(dataUrl), file)).data
  return saveToResInfo(fileInfo)
}
