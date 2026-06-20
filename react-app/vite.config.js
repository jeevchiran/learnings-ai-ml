import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { resolve, join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { existsSync, createReadStream } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot  = resolve(__dirname, '..')
const BASE      = '/learnings-ai-ml/'
const TRACK_DIRS = ['etl-pyspark', 'Regression', 'hypothesis-testing', 'clustering', 'decision-trees', 'nlp', 'pandas-eda']
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }

function serveTrackFiles() {
  return {
    name: 'serve-track-files',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        let url = (req.url ?? '').split('?')[0]
        if (url.startsWith(BASE)) url = '/' + url.slice(BASE.length)
        const isTrack = TRACK_DIRS.some(d => url.startsWith('/' + d + '/'))
        if (!isTrack) { next(); return }
        const filePath = join(repoRoot, url)
        if (!existsSync(filePath)) { next(); return }
        res.setHeader('Content-Type', MIME[extname(filePath)] ?? 'application/octet-stream')
        createReadStream(filePath).pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [
    // MDX must come before react() so JSX transform sees compiled MDX
    mdx({ remarkPlugins: [remarkGfm, remarkMath], rehypePlugins: [rehypeKatex] }),
    react(),
    serveTrackFiles(),
  ],
  base: BASE,
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
  },
})
