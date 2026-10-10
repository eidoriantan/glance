import { useEffect } from 'react'

/**
 * Keeps two scroll containers at the same relative scroll position. Only the
 * pane the user is interacting with drives the other, which avoids feedback loops.
 */
export function useSyncScroll(a: HTMLElement | null, b: HTMLElement | null) {
  useEffect(() => {
    if (!a || !b) return
    let driver: HTMLElement | null = null

    const claim = (el: HTMLElement) => () => {
      driver = el
    }
    const sync = (from: HTMLElement, to: HTMLElement) => () => {
      if (driver !== from) return
      const max = from.scrollHeight - from.clientHeight
      const ratio = max > 0 ? from.scrollTop / max : 0
      to.scrollTop = ratio * (to.scrollHeight - to.clientHeight)
    }

    const pairs: [HTMLElement, HTMLElement][] = [
      [a, b],
      [b, a],
    ]
    const cleanups = pairs.flatMap(([from, to]) => {
      const onClaim = claim(from)
      const onScroll = sync(from, to)
      const events = ['pointerenter', 'wheel', 'touchstart', 'focusin', 'keydown'] as const
      events.forEach((e) => from.addEventListener(e, onClaim, { passive: true }))
      from.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        events.forEach((e) => from.removeEventListener(e, onClaim))
        from.removeEventListener('scroll', onScroll)
      }
    })
    return () => cleanups.forEach((fn) => fn())
  }, [a, b])
}
