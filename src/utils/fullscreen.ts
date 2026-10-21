// 当前文档是否具备进入全屏的条件
// 注意：页面被嵌入未声明 allow="fullscreen" 的 iframe 时，浏览器权限策略会禁用 fullscreen，
// 此时 fullscreenEnabled 为 false，继续调用 requestFullscreen 会产生
// "Permissions policy violation: fullscreen is not allowed in this document" 报错
export const canFullscreen = (): boolean => {
  try {
    return !!(document.fullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).msFullscreenEnabled)
  }
  catch {
    return false
  }
}

// 进入全屏；返回是否成功进入（不可用或失败时静默降级为页面内放映）
export const enterFullscreen = async (): Promise<boolean> => {
  if (!canFullscreen()) return false
  const docElm = document.documentElement
  try {
    if (docElm.requestFullscreen) await docElm.requestFullscreen()
    else if ((docElm as any).mozRequestFullScreen) (docElm as any).mozRequestFullScreen()
    else if ((docElm as any).webkitRequestFullScreen) (docElm as any).webkitRequestFullScreen()
    else if ((docElm as any).msRequestFullscreen) (docElm as any).msRequestFullscreen()
    else return false
  }
  catch {
    return false
  }
  return canFullscreen() && !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement)
}

// 退出全屏
export const exitFullscreen = () => {
  try {
    if (document.exitFullscreen) document.exitFullscreen().catch(() => {})
    else if ((document as any).mozCancelFullScreen) (document as any).mozCancelFullScreen()
    else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen()
    else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen()
  }
  catch { /* 忽略 */ }
}

// 判断是否全屏
export const isFullscreen = () => {
  const fullscreenElement = 
    document.fullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).msFullscreenElement ||
    (document as any).webkitCurrentFullScreenElement
  return !!fullscreenElement
}
