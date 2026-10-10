import previewCss from '../styles/preview.css?inline'
import highlightCss from 'highlight.js/styles/github-dark.css?inline'

const KATEX_CSS = 'https://cdn.jsdelivr.net/npm/katex@0.19.0/dist/katex.min.css'

export function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
}

export function buildStandaloneHtml(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="${KATEX_CSS}" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" />
<style>
${highlightCss}
${previewCss}
body { margin: 0; background: #0f1117; }
.markdown-body { margin: 0 auto; padding: 48px 24px; }
</style>
</head>
<body>
<article class="markdown-body">
${bodyHtml}
</article>
</body>
</html>
`
}

/** Strips a trailing .md/.markdown/.txt from a file name. */
export function baseName(filename: string) {
  return filename.replace(/\.(md|markdown|txt)$/i, '') || 'document'
}

function legacyCopy(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
  document.body.appendChild(textarea)
  textarea.select()
  const ok = document.execCommand('copy')
  textarea.remove()
  return ok
}

/**
 * Copies text to the clipboard. The async Clipboard API can stall or be blocked
 * (permissions, unfocused documents), so fall back to execCommand after a short wait.
 */
export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 800))
    try {
      await Promise.race([navigator.clipboard.writeText(text), timeout])
      return true
    } catch {
      // fall through to the legacy path
    }
  }
  return legacyCopy(text)
}
