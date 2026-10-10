import type { Mermaid } from 'mermaid'

let mermaidPromise: Promise<Mermaid> | null = null
const svgCache = new Map<string, string>()
let idCounter = 0

function loadMermaid(): Promise<Mermaid> {
  mermaidPromise ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      fontFamily: 'Inter, system-ui, sans-serif',
      themeVariables: {
        darkMode: true,
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#161925',
        primaryColor: '#262241',
        primaryBorderColor: '#8b7cf6',
        primaryTextColor: '#ece9ff',
        secondaryColor: '#1d2133',
        secondaryBorderColor: '#4a4f6a',
        secondaryTextColor: '#e6e8ee',
        tertiaryColor: '#1a1d29',
        tertiaryBorderColor: '#31364a',
        tertiaryTextColor: '#e6e8ee',
        lineColor: '#8b90a0',
        textColor: '#e6e8ee',
        mainBkg: '#262241',
        nodeBorder: '#8b7cf6',
        clusterBkg: '#1a1d29',
        clusterBorder: '#31364a',
        edgeLabelBackground: '#161925',
        noteBkgColor: '#2a2540',
        noteTextColor: '#ece9ff',
        noteBorderColor: '#8b7cf6',
      },
    })
    return mermaid
  })
  return mermaidPromise
}

/**
 * Replaces every ```mermaid block inside `container` with its rendered SVG.
 * `isStale` lets the caller abandon work when newer content has been rendered.
 */
export async function renderMermaidBlocks(container: HTMLElement, isStale: () => boolean) {
  const blocks = Array.from(container.querySelectorAll<HTMLElement>('pre > code.language-mermaid'))
  if (blocks.length === 0) return

  const mermaid = await loadMermaid()
  for (const code of blocks) {
    if (isStale()) return
    const source = code.textContent ?? ''
    const figure = document.createElement('div')
    figure.className = 'mermaid-diagram'

    let svg = svgCache.get(source)
    if (svg === undefined) {
      try {
        const result = await mermaid.render(`glance-mermaid-${idCounter++}`, source)
        svg = result.svg
        svgCache.set(source, svg)
      } catch (error) {
        figure.classList.add('mermaid-error')
        figure.textContent = `Mermaid error: ${error instanceof Error ? error.message : String(error)}`
      }
    }
    if (isStale()) return
    if (svg !== undefined) figure.innerHTML = svg
    code.parentElement?.replaceWith(figure)
  }
}
