# Glance

Paste or drop Markdown on the left and see it rendered on the right. Glance is a fully static, serverless React + TypeScript + Vite app. Nothing you type leaves your browser.

## Features

- CodeMirror editor with Markdown syntax highlighting
- Live preview: GitHub-flavored Markdown (tables, task lists, footnotes), code highlighting, KaTeX math, and Mermaid diagrams
- Open a `.md` file, or drag and drop one anywhere on the page
- Copy the rendered HTML, export as `.md` or standalone `.html`, or print to PDF
- Share a link that contains the document itself (compressed in the URL `#` fragment, never sent to a server). Links are capped at 8,000 characters, roughly 20–45 KB of Markdown depending on content.
- Synced scrolling, a resizable split (double-click the divider to reset), and word/character counts
- Raw HTML in the Markdown is sanitized, so pasted content can't run scripts

## Development

```sh
npm install
npm run dev       # start the dev server
npm run build     # type-check and build to dist/
npm run preview   # serve the production build locally
npm run lint
```

## Deploying to Cloudflare Pages

**Git integration (dashboard):** create a Pages project from this repository with:

| Setting          | Value           |
| ---------------- | --------------- |
| Framework preset | None / Vite     |
| Build command    | `npm run build` |
| Output directory | `dist`          |

**Direct upload (CLI):**

```sh
npx wrangler login
npm run deploy    # builds, then runs: wrangler pages deploy dist --project-name glance
```

**Custom domain:** the site is set up for `https://glance.eidoriantan.com`. In the Pages project, add it under *Custom domains*. If the domain ever changes, update the absolute URLs in `index.html` (canonical, Open Graph, Twitter, JSON-LD), `public/robots.txt`, and `public/sitemap.xml`.

## SEO assets

- `public/sitemap.xml` and `public/robots.txt`: update `<lastmod>` in the sitemap when you ship notable changes.
- `public/og-image.png` (1200×630 social preview) and `public/apple-touch-icon.png` (180×180).
