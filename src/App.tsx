import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Header } from './components/Header'
import { Editor } from './components/Editor'
import { Preview } from './components/Preview'
import { Divider } from './components/Divider'
import { Toast } from './components/Toast'
import { renderMarkdown } from './lib/markdown'
import { baseName, buildStandaloneHtml, copyText, downloadFile } from './lib/export'
import { SAMPLE } from './lib/sample'
import { buildShareUrl, decodeShare, encodeShare, MAX_SHARE_LENGTH, sharePayloadFromHash } from './lib/share'
import { useDebounced } from './hooks/useDebounced'
import { useSyncScroll } from './hooks/useSyncScroll'
import './App.css'

const ACCEPT = '.md,.markdown,.txt,text/markdown,text/plain'
const YEAR = new Date().getFullYear()

function App() {
  // Start empty when opening a share link so the sample doesn't flash before it decodes.
  const [text, setText] = useState(() => (sharePayloadFromHash() ? '' : SAMPLE))
  const [fileName, setFileName] = useState<string | null>(null)
  const [ratio, setRatio] = useState(0.5)
  const [dragging, setDragging] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [editorScroller, setEditorScroller] = useState<HTMLElement | null>(null)
  const [previewScroller, setPreviewScroller] = useState<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<number>(undefined)

  const debouncedText = useDebounced(text, 150)
  const html = useMemo(() => renderMarkdown(debouncedText), [debouncedText])
  useSyncScroll(editorScroller, previewScroller)

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    return { words, chars: text.length }
  }, [text])

  const notify = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), Math.max(2200, message.length * 60))
  }, [])

  const loadFile = useCallback(
    async (file: File) => {
      setText(await file.text())
      setFileName(file.name)
      notify(`Opened ${file.name}`)
    },
    [notify],
  )

  // Load a document from a share link, on startup and when the fragment changes.
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const payload = sharePayloadFromHash()
      if (!payload) return
      try {
        const shared = await decodeShare(payload)
        if (cancelled) return
        setText(shared)
        setFileName(null)
        notify('Opened shared document')
      } catch {
        if (cancelled) return
        setText((current) => current || SAMPLE)
        notify('This share link is invalid or too large')
      }
    }
    load()
    window.addEventListener('hashchange', load)
    return () => {
      cancelled = true
      window.removeEventListener('hashchange', load)
    }
  }, [notify])

  // Drag-and-drop anywhere on the window.
  useEffect(() => {
    let depth = 0
    const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes('Files') ?? false
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth++
      setDragging(true)
    }
    const onOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault()
    }
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return
      depth = Math.max(0, depth - 1)
      if (depth === 0) setDragging(false)
    }
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth = 0
      setDragging(false)
      const file = e.dataTransfer?.files[0]
      if (file) loadFile(file)
    }
    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragover', onOver)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [loadFile])

  // The live preview DOM includes rendered Mermaid SVGs, so prefer it over `html`.
  const renderedHtml = () => previewScroller?.querySelector('.markdown-body')?.innerHTML ?? html
  const exportName = baseName(fileName ?? 'document')

  const copyHtml = async () => {
    const ok = await copyText(renderedHtml())
    notify(ok ? 'HTML copied to clipboard' : 'Could not access the clipboard')
  }

  const share = async () => {
    if (!text.trim()) {
      notify('Nothing to share yet')
      return
    }
    const payload = await encodeShare(text)
    if (payload.length > MAX_SHARE_LENGTH) {
      const percent = Math.round((payload.length / MAX_SHARE_LENGTH) * 100)
      notify(`Too long to share as a link (${percent}% of the limit). Export it as .md instead.`)
      return
    }
    const url = buildShareUrl(payload)
    // Also put the link in the address bar, in case clipboard access is blocked.
    window.history.replaceState(null, '', url)
    const ok = await copyText(url)
    notify(ok ? 'Share link copied to clipboard' : 'Share link is in the address bar')
  }

  return (
    <div className="app">
      <Header
        fileName={fileName}
        onOpen={() => fileInputRef.current?.click()}
        onCopyHtml={copyHtml}
        onShare={share}
        onExportMarkdown={() => {
          downloadFile(`${exportName}.md`, text, 'text/markdown;charset=utf-8')
          notify(`Saved ${exportName}.md`)
        }}
        onExportHtml={() => {
          downloadFile(`${exportName}.html`, buildStandaloneHtml(exportName, renderedHtml()), 'text/html;charset=utf-8')
          notify(`Saved ${exportName}.html`)
        }}
        onPrint={() => window.print()}
      />

      <main className="workspace" style={{ '--split': `${ratio * 100}%` } as CSSProperties}>
        <section className="pane pane-editor" aria-label="Editor">
          <Editor value={text} onChange={setText} onScrollerReady={setEditorScroller} />
          <footer className="status">
            <span>{stats.words.toLocaleString()} words</span>
            <span aria-hidden="true">·</span>
            <span>{stats.chars.toLocaleString()} characters</span>
          </footer>
        </section>
        <Divider ratio={ratio} onChange={setRatio} />
        <section className="pane pane-preview" aria-label="Preview">
          <Preview html={html} ref={setPreviewScroller} />
        </section>
      </main>

      <footer className="site-footer">
        © {YEAR}{' '}
        <a href="https://eidoriantan.com" target="_blank" rel="noopener noreferrer">
          @eidoriantan
        </a>
      </footer>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) loadFile(file)
          e.target.value = ''
        }}
      />

      {dragging && (
        <div className="drop-overlay">
          <div className="drop-card">Drop your .md file</div>
        </div>
      )}
      <Toast message={toast} />
    </div>
  )
}

export default App
