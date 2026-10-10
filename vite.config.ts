import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Largest chunks: Mermaid's lazily loaded ELK layout (~1.4 MB, only fetched when a
    // diagram uses it) and the CodeMirror core (~625 kB, ~215 kB gzip).
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks cache well across deploys. Mermaid stays lazy-loaded.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            {
              name: 'codemirror',
              test: /node_modules[\\/](@codemirror[\\/](state|view|language|commands|search|autocomplete|lint|lang-markdown)|@lezer[\\/](common|highlight|lr|markdown)|@uiw|crelt|style-mod|w3c-keyname)[\\/]/,
            },
            { name: 'katex', test: /node_modules[\\/]katex[\\/]/ },
            { name: 'highlight', test: /node_modules[\\/](highlight\.js|lowlight)[\\/]/ },
          ],
        },
      },
    },
  },
})
