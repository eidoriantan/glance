import type { KeyboardEvent, PointerEvent } from 'react'

interface DividerProps {
  ratio: number
  onChange: (ratio: number) => void
}

const MIN = 0.2
const MAX = 0.8
const clamp = (value: number) => Math.min(MAX, Math.max(MIN, value))

export function Divider({ ratio, onChange }: DividerProps) {
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const handle = event.currentTarget
    const container = handle.parentElement
    if (!container) return
    handle.setPointerCapture(event.pointerId)
    document.body.classList.add('resizing')

    const onMove = (e: globalThis.PointerEvent) => {
      const rect = container.getBoundingClientRect()
      onChange(clamp((e.clientX - rect.left) / rect.width))
    }
    const onUp = () => {
      document.body.classList.remove('resizing')
      handle.removeEventListener('pointermove', onMove)
      handle.removeEventListener('pointerup', onUp)
      handle.removeEventListener('pointercancel', onUp)
    }
    handle.addEventListener('pointermove', onMove)
    handle.addEventListener('pointerup', onUp)
    handle.addEventListener('pointercancel', onUp)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') onChange(clamp(ratio - 0.02))
    else if (event.key === 'ArrowRight') onChange(clamp(ratio + 0.02))
    else return
    event.preventDefault()
  }

  return (
    <div
      className="divider"
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={Math.round(ratio * 100)}
      aria-valuemin={MIN * 100}
      aria-valuemax={MAX * 100}
      tabIndex={0}
      title="Drag to resize · double-click to reset"
      onPointerDown={onPointerDown}
      onDoubleClick={() => onChange(0.5)}
      onKeyDown={onKeyDown}
    />
  )
}
