import axios from './axios'

// @ts-ignore
export const SERVER_URL = DOC_API_BASE

export async function uploadPptCover(fileCode: string, formData: FormData): Promise<any> {
  return axios.post(`${SERVER_URL}/file/upload/unique?fileCode=${fileCode}`, formData, {})
}

/* 普通单文件上传*/
export async function simpleUploadFile(file: File, exts: any = {}) {
  const formData = new FormData()
  formData.append('file', file)
  for (const key in exts) {
    formData.append(key, exts[key])
  }
  return axios.post(`${SERVER_URL}/file/upload/simple`, formData)
}

/* 覆盖式文件上传*/
export async function simpleUploadFileUnique(fileCode: string, file: File, exts: any = {}) {
  const formData = new FormData()
  formData.append('file', file)
  for (const key in exts) {
    formData.append(key, exts[key])
  }
  return axios.post(`${SERVER_URL}/file/upload/user-unique?formatFile=1&fileCode=${fileCode}`, formData)
}