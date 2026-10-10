import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { renderMermaidBlocks } from '../lib/mermaid'

interface PreviewProps {
  html: string
}

/** Exposes the scroll container; the rendered article is its `.markdown-body` child. */
export const Preview = forwardRef<HTMLDivElement, PreviewProps>(function Preview({ html }, ref) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const articleRef = useRef<HTMLElement>(null)
  useImperativeHandle(ref, () => scrollRef.current!, [])

  useEffect(() => {
    const article = articleRef.current
    if (!article) return
    article.innerHTML = html
    let stale = false
    renderMermaidBlocks(article, () => stale)
    return () => {
      stale = true
    }
  }, [html])

  return (
    <div className="preview" ref={scrollRef}>
      <article className="markdown-body" ref={articleRef} />
    </div>
  )
})
