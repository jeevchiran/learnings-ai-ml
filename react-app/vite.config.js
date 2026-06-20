import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
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
        // strip base prefix so /learnings-ai-ml-main/etl-pyspark/... → /etl-pyspark/...
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
  base: BASE,   // must match GitHub repo name: jeevchiran/learnings-ai-ml
  plugins: [react(), serveTrackFiles()],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  test: {
    environment: 'node',
  },
})
