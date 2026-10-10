import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

const theme = EditorView.theme(
  {
    '&': { height: '100%', backgroundColor: 'transparent', color: '#d7dae3', fontSize: '14px' },
    '.cm-scroller': { fontFamily: '"JetBrains Mono", ui-monospace, monospace', lineHeight: '1.7' },
    '.cm-content': { padding: '20px 0', caretColor: '#c4bbff' },
    '.cm-line': { padding: '0 20px 0 12px' },
    '.cm-gutters': { backgroundColor: 'transparent', color: '#4a4f62', border: 'none' },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 4px 0 16px' },
    '.cm-activeLine': { backgroundColor: 'rgba(139, 124, 246, 0.06)' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: '#8b90a0' },
    '.cm-cursor': { borderLeftColor: '#c4bbff', borderLeftWidth: '2px' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(139, 124, 246, 0.28) !important',
    },
    '&.cm-focused': { outline: 'none' },
  },
  { dark: true },
)

const highlight = HighlightStyle.define([
  { tag: t.heading1, color: '#f0eeff', fontWeight: '700', fontSize: '1.15em' },
  { tag: t.heading2, color: '#f0eeff', fontWeight: '700', fontSize: '1.08em' },
  { tag: [t.heading3, t.heading4, t.heading5, t.heading6], color: '#f0eeff', fontWeight: '600' },
  { tag: t.strong, color: '#ffffff', fontWeight: '700' },
  { tag: t.emphasis, color: '#e6e8ee', fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through', color: '#8b90a0' },
  { tag: [t.link, t.url], color: '#a99cff' },
  { tag: t.monospace, color: '#f0b37e' },
  { tag: t.quote, color: '#9aa0b4', fontStyle: 'italic' },
  { tag: [t.processingInstruction, t.meta, t.punctuation, t.contentSeparator], color: '#6b7088' },
  { tag: t.list, color: '#8b7cf6' },
  { tag: [t.keyword, t.operatorKeyword], color: '#ff7b9c' },
  { tag: [t.string, t.special(t.string)], color: '#9ee6a8' },
  { tag: [t.number, t.bool, t.null], color: '#f0b37e' },
  { tag: t.comment, color: '#5f647a', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.propertyName], color: '#7cc7ff' },
  { tag: [t.typeName, t.className], color: '#ffd479' },
])

const extensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  syntaxHighlighting(highlight),
  EditorView.lineWrapping,
  theme,
]

interface EditorProps {
  value: string
  onChange: (value: string) => void
  onScrollerReady: (el: HTMLElement) => void
}

export function Editor({ value, onChange, onScrollerReady }: EditorProps) {
  return (
    <CodeMirror
      className="editor"
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme="none"
      height="100%"
      basicSetup={{ foldGutter: false, highlightActiveLine: true, autocompletion: false }}
      onCreateEditor={(view) => onScrollerReady(view.scrollDOM)}
      placeholder="Paste or type Markdown here…"
      aria-label="Markdown editor"
    />
  )
}
