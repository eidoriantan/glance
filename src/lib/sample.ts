export const SAMPLE = `# Welcome to Glance

Paste Markdown on the left, or **drop a \`.md\` file** anywhere on the page. The preview updates as you type.

## Formatting

You can write *italic*, **bold**, ~~strikethrough~~, \`inline code\`, and [links](https://commonmark.org).

> Blockquotes look like this.

- [x] GitHub-flavored task lists
- [x] Tables, footnotes[^1], and autolinks like https://example.com
- [ ] Your next great document

| Feature   | Supported |
| :-------- | :-------: |
| GFM       |    Yes    |
| Math      |    Yes    |
| Mermaid   |    Yes    |

## Code

\`\`\`ts
function greet(name: string): string {
  return \`Hello, \${name}!\`
}
\`\`\`

## Math

Inline math like $e^{i\\pi} + 1 = 0$, or a block:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

## Diagrams

\`\`\`mermaid
flowchart LR
  A[Write Markdown] --> B{Glance}
  B --> C[Preview]
  B --> D[Export HTML / PDF]
\`\`\`

[^1]: Footnotes appear at the bottom.
`
