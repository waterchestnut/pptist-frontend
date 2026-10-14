import type { Slide, SlideTheme } from './slides'

export interface AIPPTCover {
  type: 'cover'
  data: {
    title: string
    text: string
  }
}

export interface AIPPTContents {
  type: 'contents'
  data: {
    items: string[]
  }
  offset?: number
}

export interface AIPPTTransition {
  type: 'transition'
  data: {
    title: string
    text: string
  }
}

export interface AIPPTContent {
  type: 'content'
  data: {
    title: string
    items: {
      title: string
      text: string
    }[]
  },
  offset?: number
}

export interface AIPPTEnd {
  type: 'end'
}

export type AIPPTSlide = AIPPTCover | AIPPTContents | AIPPTTransition | AIPPTContent | AIPPTEnd

// ---------- AI直出模式：/llm/gen-ppt-direct/stream 的JSONL行协议 ----------
export interface AIPPTDirectStageLine {
  kind: 'stage'
  stage: 'plan' | 'content' | 'slide'
  message?: string
  index?: number
  total?: number
}

export interface AIPPTDirectMetaLine {
  kind: 'meta'
  title: string
  theme: SlideTheme
  viewportSize: number
  viewportRatio: number
  total: number
}

export interface AIPPTDirectSlideLine {
  kind: 'slide'
  index: number
  total: number
  data: Slide
}

export interface AIPPTDirectDoneLine {
  kind: 'done'
  title: string
  theme: SlideTheme
  viewportSize: number
  viewportRatio: number
  stats?: { dropped: number; lintPass: number; lintWarn: number }
}

export interface AIPPTDirectErrorLine {
  kind: 'error'
  message?: string
}

export type AIPPTDirectStreamLine = AIPPTDirectStageLine | AIPPTDirectMetaLine | AIPPTDirectSlideLine | AIPPTDirectDoneLine | AIPPTDirectErrorLine