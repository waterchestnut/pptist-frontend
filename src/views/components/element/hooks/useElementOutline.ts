import { computed, type Ref } from 'vue'
import type { PPTElementOutline } from '@/types/slides'

// 计算边框相关属性值，主要是对默认值的处理
export default (outline: Ref<PPTElementOutline | undefined>) => {
  const outlineWidth = computed(() => outline.value?.width ?? 0)
  const outlineStyle = computed(() => outline.value?.style || 'solid')
  // 默认描边色取缺省主题烘焙字面（该值会进入元素数据并参与导出，刻意不用 var()，docs/08 §13.3 红线）
  const outlineColor = computed(() => outline.value?.color || '#916E40')

  const strokeDashArray = computed(() => {
    const size = outlineWidth.value
    if (outlineStyle.value === 'dashed') return size <= 6 ? `${size * 4.5} ${size * 2}` : `${size * 4} ${size * 1.5}`
    if (outlineStyle.value === 'dotted') return size <= 6 ? `${size * 1.8} ${size * 1.6}` : `${size * 1.5} ${size * 1.2}`
    return '0 0'
  })

  return {
    outlineWidth,
    outlineStyle,
    outlineColor,
    strokeDashArray,
  }
}