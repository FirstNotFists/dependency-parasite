import { useRef, useCallback } from 'react'
import { DRAG_THRESHOLD } from '../constants/scene'

export function useDragClick<T>(onSelect: (item: T) => void, item: T) {
  const pointerStart = useRef({ x: 0, y: 0 })

  const onPointerDown = useCallback((e: { clientX: number; clientY: number }) => {
    pointerStart.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onClick = useCallback((e: { stopPropagation: () => void; clientX: number; clientY: number }) => {
    const dx = e.clientX - pointerStart.current.x
    const dy = e.clientY - pointerStart.current.y
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) return
    e.stopPropagation()
    onSelect(item)
  }, [item, onSelect])

  const onPointerOver = useCallback(() => {
    document.body.style.cursor = 'pointer'
  }, [])

  const onPointerOut = useCallback(() => {
    document.body.style.cursor = 'auto'
  }, [])

  return { onPointerDown, onClick, onPointerOver, onPointerOut }
}
