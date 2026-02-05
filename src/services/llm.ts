import axios, {getDefaultHeaders} from './axios'

// @ts-ignore
export const SERVER_URL = PPTONLINE_API_BASE

/* 流式生成PPT大纲*/
export async function genPPTSyllabusStream(subject: string, language: string, fileInfo?: any): Promise<any> {
  return fetch(`${SERVER_URL}/llm/gen-ppt-syllabus/stream`, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({
      subject,
      options: {language, fileInfo},
    }),
  })
}

/* 流式生成PPT内容*/
export async function genPPTStream(syllabus: string, language: string, style: string, fileInfo?: any, tmplCode?: string): Promise<any> {
  return fetch(`${SERVER_URL}/llm/gen-ppt/stream`, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({
      syllabus,
      options: {language, style, fileInfo, tmplCode},
    }),
  })
}