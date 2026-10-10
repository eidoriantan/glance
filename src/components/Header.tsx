import { useEffect, useRef, useState } from 'react'
import { Logo } from './Logo'
import { ChevronIcon, CodeIcon, CopyIcon, DownloadIcon, FileIcon, OpenIcon, PrintIcon, ShareIcon } from './Icons'

interface HeaderProps {
  fileName: string | null
  onOpen: () => void
  onCopyHtml: () => void
  onShare: () => void
  onExportMarkdown: () => void
  onExportHtml: () => void
  onPrint: () => void
}

export function Header({ fileName, onOpen, onCopyHtml, onShare, onExportMarkdown, onExportHtml, onPrint }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const close = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [menuOpen])

  const pick = (action: () => void) => () => {
    setMenuOpen(false)
    action()
  }

  return (
    <header className="header">
      <div className="brand">
        <Logo />
        <span className="brand-name">Glance</span>
        {fileName && <span className="file-name" title={fileName}>{fileName}</span>}
      </div>
      <nav className="actions">
        <button className="btn" onClick={onOpen} title="Open a Markdown file">
          <OpenIcon />
          <span className="btn-label">Open</span>
        </button>
        <button className="btn" onClick={onCopyHtml} title="Copy rendered HTML to clipboard">
          <CopyIcon />
          <span className="btn-label">Copy HTML</span>
        </button>
        <button className="btn" onClick={onShare} title="Copy a shareable link to this document">
          <ShareIcon />
          <span className="btn-label">Share</span>
        </button>
        <div className="menu" ref={menuRef}>
          <button
            className="btn btn-primary"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title="Export"
          >
            <DownloadIcon />
            <span className="btn-label">Export</span>
            <ChevronIcon />
          </button>
          {menuOpen && (
            <div className="menu-list" role="menu">
              <button role="menuitem" onClick={pick(onExportMarkdown)}>
                <FileIcon /> Markdown <kbd>.md</kbd>
              </button>
              <button role="menuitem" onClick={pick(onExportHtml)}>
                <CodeIcon /> HTML <kbd>.html</kbd>
              </button>
              <button role="menuitem" onClick={pick(onPrint)}>
                <PrintIcon /> Print / PDF
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
