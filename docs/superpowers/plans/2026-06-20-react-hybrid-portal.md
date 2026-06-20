# React Hybrid Learning Portal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React SPA shell at `react-app/` that wraps all 49 existing module HTML files in an `<iframe>`, delivering a full learning dashboard with sidebar navigation, search, progress tracking, bookmarks, and completion badges — deployed to GitHub Pages at `jeevchiran.github.io/learnings-ai-ml-main/`.

**Architecture:** Vite root is set to the repo root so the dev server serves existing track HTML at their natural paths (no duplication). GitHub Actions builds React, copies the 7 track directories into `react-app/dist/`, then pushes `dist/` to `gh-pages`. HashRouter is required for GitHub Pages (no server rewrites). All state in localStorage.

**Tech Stack:** React 18, React Router v6 (HashRouter), Vite 5, plain CSS + CSS variables, Vitest (unit tests for data + storage), `peaceiris/actions-gh-pages` for deploy.

## Global Constraints

- Vite root: `..` (repo root) relative to `react-app/` so dev server serves `/etl-pyspark/...` etc.
- Build output: `react-app/dist/` (absolute path in vite.config)
- Base path: `/learnings-ai-ml-main/` — must match GitHub Pages path
- Router: HashRouter only — never BrowserRouter
- No TypeScript, no external UI component library
- localStorage key: `mlportal_v1`
- Do NOT modify any existing file in `etl-pyspark/`, `Regression/`, `hypothesis-testing/`, `clustering/`, `decision-trees/`, `nlp/`, or `pandas-eda/`
- Target GitHub repo: `jeevchiran/learnings-ai-ml-main`, deploy branch: `gh-pages`
- All `npm` commands run from `react-app/` directory

---

## File Map

```
react-app/
  index.html                          create — Vite entry HTML
  package.json                        create — deps + scripts
  vite.config.js                      create — root=.., base, build.outDir
  src/
    index.jsx                         create — ReactDOM.createRoot
    App.jsx                           create — layout, routing, dark mode, ProgressProvider
    index.css                         create — full CSS (vars, layout, sidebar, cards, iframe, search)
    data/
      courses.js                      create — all 7 tracks, 49 modules, moduleById map, getPrevNext
    hooks/
      progressStorage.js              create — pure localStorage functions (no React)
      useProgress.jsx                 create — hook + ProgressContext + ProgressProvider
    components/
      Sidebar.jsx                     create — collapsible tracks, module links, bookmark stars
      Dashboard.jsx                   create — track cards, progress bars, stats, continue button
      SearchBar.jsx                   create — filter input, dropdown results
      ModuleViewer.jsx                create — iframe panel, topbar, prev/next, mark complete, 30s auto
    __tests__/
      courses.test.js                 create — data shape validation
      progressStorage.test.js         create — localStorage operations
.github/
  workflows/
    deploy.yml                        create — build + copy tracks + push gh-pages
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `react-app/package.json`
- Create: `react-app/vite.config.js`
- Create: `react-app/index.html`
- Create: `react-app/src/index.jsx`
- Create: `react-app/src/App.jsx` (stub)
- Create: `react-app/src/index.css` (empty placeholder)

**Interfaces:**
- Produces: `npm run dev` (from `react-app/`) starts at `http://localhost:5173/learnings-ai-ml-main/` showing "Learning Portal" heading
- Produces: `npm run build` outputs to `react-app/dist/`
- Produces: `npm test` runs vitest

- [ ] **Step 1: Create `react-app/package.json`**

```json
{
  "name": "ai-ml-learning-portal",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create `react-app/vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname, '..'),
  base: '/learnings-ai-ml-main/',
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 3: Create `react-app/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI/ML Learning Portal</title>
    <script>
      try {
        if (localStorage.getItem('theme') === 'dark')
          document.documentElement.setAttribute('data-theme', 'dark');
      } catch (e) {}
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/react-app/src/index.jsx"></script>
  </body>
</html>
```

Note: Script path `/react-app/src/index.jsx` is root-relative. Vite root is repo root, so this resolves to `{repo-root}/react-app/src/index.jsx`. ✓

- [ ] **Step 4: Create `react-app/src/index.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 5: Create stub `react-app/src/App.jsx`**

```jsx
export default function App() {
  return <h1>Learning Portal</h1>
}
```

- [ ] **Step 6: Create `react-app/src/index.css`**

```css
/* populated in Task 2 */
```

- [ ] **Step 7: Install dependencies**

```bash
cd react-app && npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 8: Verify dev server**

```bash
cd react-app && npm run dev
```

Open `http://localhost:5173/learnings-ai-ml-main/`. Expected: page shows "Learning Portal" heading.
Also verify `http://localhost:5173/etl-pyspark/modules/01-etl-pyspark.html` loads existing module HTML. If it 404s, confirm Vite root is repo root (check `vite.config.js` `root` path).

- [ ] **Step 9: Commit**

```bash
git add react-app/
git commit -m "feat: scaffold React portal (Vite + React 18 + hash router)"
```

---

### Task 2: CSS Foundation

**Files:**
- Modify: `react-app/src/index.css` (replace placeholder with full stylesheet)

**Interfaces:**
- Produces: CSS custom properties, layout classes, sidebar classes, card classes, iframe classes, search classes, dark mode via `[data-theme="dark"]` on `<html>`

- [ ] **Step 1: Replace `react-app/src/index.css` with full stylesheet**

```css
/* ── Custom Properties ─────────────────────────────── */
:root {
  --bg: #ffffff;
  --bg-sidebar: #f8fafc;
  --bg-card: #ffffff;
  --bg-hover: #f1f5f9;
  --text: #0f172a;
  --text-muted: #64748b;
  --text-sidebar: #334155;
  --border: #e2e8f0;
  --accent: #6366f1;
  --success: #10b981;
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --radius: 8px;
  --sidebar-w: 268px;
  --topbar-h: 48px;
}

[data-theme="dark"] {
  --bg: #0f172a;
  --bg-sidebar: #1e293b;
  --bg-card: #1e293b;
  --bg-hover: #334155;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --text-sidebar: #cbd5e1;
  --border: #334155;
}

/* ── Reset ─────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; }
body { font-family: var(--font); background: var(--bg); color: var(--text); font-size: 1rem; line-height: 1.5; }
a { text-decoration: none; color: inherit; }
button { font-family: inherit; }

/* ── App Layout ────────────────────────────────────── */
.app { display: flex; height: 100vh; overflow: hidden; }

/* ── Mobile Header (hidden on desktop) ─────────────── */
.mobile-header {
  display: none;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: var(--topbar-h);
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  flex-shrink: 0;
  font-weight: 600;
  font-size: 0.9rem;
}

/* ── Sidebar ────────────────────────────────────────── */
.sidebar {
  width: var(--sidebar-w);
  min-width: var(--sidebar-w);
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  transition: transform 0.2s;
}

.sidebar-top {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.sidebar-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
}

.sidebar-controls {
  display: flex;
  gap: 6px;
  align-items: center;
}

.icon-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.75rem;
  cursor: pointer;
  color: var(--text-muted);
  line-height: 1;
}

.icon-btn:hover { background: var(--bg-hover); color: var(--text); }

.sidebar-scroll { flex: 1; overflow-y: auto; padding: 6px 0 24px; }

/* ── Track Groups ───────────────────────────────────── */
.track-group { margin-bottom: 1px; }

.track-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  user-select: none;
}

.track-header:hover { background: var(--bg-hover); }

.track-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.track-progress-text {
  margin-left: auto;
  font-size: 0.68rem;
  color: var(--text-muted);
}

.track-chevron { font-size: 0.6rem; transition: transform 0.15s; }
.track-chevron.open { transform: rotate(90deg); }

.module-items { }

/* ── Module Items ───────────────────────────────────── */
.module-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px 5px 30px;
  font-size: 0.8rem;
  color: var(--text-sidebar);
  cursor: pointer;
  border-left: 2px solid transparent;
  position: relative;
}

.module-item:hover { background: var(--bg-hover); }

.module-item.active {
  background: var(--bg-hover);
  border-left-color: var(--accent);
  color: var(--text);
  font-weight: 500;
}

.module-check {
  width: 13px;
  flex-shrink: 0;
  font-size: 0.65rem;
  color: var(--success);
  text-align: center;
}

.module-name { flex: 1; min-width: 0; }

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.72rem;
  color: var(--text-muted);
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.1s;
}

.module-item:hover .star-btn,
.star-btn.bookmarked { opacity: 1; }
.star-btn.bookmarked { color: #f59e0b; }

/* ── Main Panel ─────────────────────────────────────── */
.main-panel {
  flex: 1;
  height: 100vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* ── Dashboard ──────────────────────────────────────── */
.dashboard { padding: 32px; }

.dashboard-heading { font-size: 1.4rem; font-weight: 700; margin-bottom: 4px; }

.dashboard-sub { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 20px; }

.stats-row { display: flex; gap: 24px; margin-bottom: 28px; }

.stat { font-size: 0.82rem; color: var(--text-muted); }
.stat strong { font-size: 1.1rem; font-weight: 700; color: var(--text); }

.track-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.track-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 18px 14px;
  border-left: 4px solid var(--card-color, var(--accent));
  transition: box-shadow 0.15s, transform 0.1s;
}

.track-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}

.track-card h3 { font-size: 0.9rem; font-weight: 600; margin-bottom: 6px; }

.track-card p {
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 14px;
}

.progress-bar-wrap {
  background: var(--bg-hover);
  border-radius: 4px;
  height: 4px;
  margin-bottom: 6px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-label { font-size: 0.72rem; color: var(--text-muted); margin-bottom: 12px; }

.continue-btn {
  font-size: 0.78rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--card-color, var(--accent));
}

.continue-btn:hover { text-decoration: underline; }

/* ── Module Viewer ──────────────────────────────────── */
.module-viewer { display: flex; flex-direction: column; height: 100vh; }

.module-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: var(--topbar-h);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--bg);
}

.module-breadcrumb {
  flex: 1;
  min-width: 0;
  font-size: 0.78rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.module-breadcrumb strong { color: var(--text); }

.topbar-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.75rem;
  cursor: pointer;
  color: var(--text);
  white-space: nowrap;
  flex-shrink: 0;
}

.topbar-btn:hover { background: var(--bg-hover); }
.topbar-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.topbar-btn.complete-btn {
  background: var(--success);
  color: #fff;
  border-color: var(--success);
}

.topbar-btn.complete-btn:hover { opacity: 0.88; }

.topbar-btn.done-btn {
  color: var(--success);
  border-color: var(--success);
}

.topbar-star {
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-muted);
  background: none;
  border: none;
  padding: 4px;
  flex-shrink: 0;
  line-height: 1;
}

.topbar-star.bookmarked { color: #f59e0b; }

.module-iframe { flex: 1; width: 100%; border: none; }

/* ── Search ─────────────────────────────────────────── */
.search-wrap { position: relative; }

.search-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.8rem;
  outline: none;
  transition: border-color 0.15s;
}

.search-input:focus { border-color: var(--accent); }
.search-input::placeholder { color: var(--text-muted); }

.search-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  z-index: 300;
  max-height: 240px;
  overflow-y: auto;
}

.search-result {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
}

.search-result:last-child { border-bottom: none; }
.search-result:hover { background: var(--bg-hover); }
.search-result-title { font-size: 0.8rem; font-weight: 500; color: var(--text); }
.search-result-course { font-size: 0.72rem; color: var(--text-muted); }

.search-empty { padding: 12px; font-size: 0.8rem; color: var(--text-muted); text-align: center; }

/* ── Responsive ─────────────────────────────────────── */
@media (max-width: 768px) {
  .app { flex-direction: column; }
  .mobile-header { display: flex; }
  .main-panel { height: calc(100vh - var(--topbar-h)); }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 200;
    box-shadow: 4px 0 24px rgba(0,0,0,0.15);
  }

  .sidebar.mobile-open { transform: translateX(0); }

  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 199;
  }

  .sidebar-overlay.active { display: block; }

  .module-topbar { overflow-x: auto; }
}

@media (min-width: 769px) {
  .mobile-header { display: none; }
  .sidebar-overlay { display: none !important; }
}
```

- [ ] **Step 2: Verify styles apply**

Run `npm run dev`, open browser. Page should have white background (light mode), body font is system sans-serif.
Toggle dark mode by running in browser console: `document.documentElement.setAttribute('data-theme','dark')`. Background should shift to `#0f172a`.

- [ ] **Step 3: Commit**

```bash
git add react-app/src/index.css
git commit -m "feat: add full CSS foundation with dark mode + layout vars"
```

---

### Task 3: Course Data

**Files:**
- Create: `react-app/src/data/courses.js`
- Create: `react-app/src/__tests__/courses.test.js`

**Interfaces:**
- Produces: `courses` array (7 tracks), `moduleById` map (49 entries), `getPrevNext(moduleId)` → `{ prev, next }`
- Consumed by: Sidebar, Dashboard, SearchBar, ModuleViewer, useProgress

- [ ] **Step 1: Create `react-app/src/data/courses.js`**

```js
export const courses = [
  {
    id: 'etl-pyspark',
    title: 'PySpark and ETL',
    description: '10 modules covering distributed data processing, DataFrames, SQL, UDFs, data cleaning, and performance optimization.',
    color: '#f59e0b',
    trackPath: 'etl-pyspark',
    modules: [
      { id: 'etl-pyspark-m1',  title: 'ETL with PySpark',                  file: '01-etl-pyspark.html',                  description: 'Extract, transform, and load data using PySpark pipelines.',                                   readTime: 15 },
      { id: 'etl-pyspark-m2',  title: 'In-Memory Data Processing',          file: '02-in-memory-processing.html',          description: 'Understand why Spark keeps data in memory vs disk-based processing.',                         readTime: 12 },
      { id: 'etl-pyspark-m3',  title: 'Spark RDDs',                         file: '03-spark-rdds.html',                    description: "Work with Resilient Distributed Datasets — Spark's foundational abstraction.",                readTime: 15 },
      { id: 'etl-pyspark-m4',  title: 'DataFrames: PySpark vs Pandas',      file: '04-dataframes-pyspark-vs-pandas.html',  description: 'Compare the same operations in both APIs side-by-side.',                                     readTime: 18 },
      { id: 'etl-pyspark-m5',  title: 'Querying with PySpark SQL',           file: '05-pyspark-sql.html',                   description: 'Register DataFrames as tables and query them with SQL syntax.',                              readTime: 15 },
      { id: 'etl-pyspark-m6',  title: 'UDFs in PySpark',                    file: '06-udfs-pyspark.html',                  description: 'Write and apply User-Defined Functions for custom transformations.',                         readTime: 15 },
      { id: 'etl-pyspark-m7',  title: 'Data Cleaning',                      file: '07-data-cleaning.html',                 description: 'Handle nulls, duplicates, inconsistent formats, and invalid values.',                        readTime: 18 },
      { id: 'etl-pyspark-m8',  title: 'Data Exploration',                   file: '08-data-exploration.html',              description: 'Summarize, profile, and understand your cleaned dataset.',                                   readTime: 15 },
      { id: 'etl-pyspark-m9',  title: 'Transformation Operations',          file: '09-transformation-operations.html',     description: 'Reshape, join, aggregate, and pivot data for analysis.',                                     readTime: 18 },
      { id: 'etl-pyspark-m10', title: 'Caching and Broadcast Variables',    file: '10-caching-broadcasting.html',          description: 'Optimize your Spark pipeline with caching strategies and broadcast joins.',                   readTime: 15 },
    ],
  },
  {
    id: 'regression',
    title: 'Regression: Linear and Logistic',
    description: '4 interactive modules with full mathematical derivations, KaTeX equations, and Plotly.js widgets.',
    color: '#3b82f6',
    trackPath: 'Regression',
    modules: [
      { id: 'regression-m1', title: 'Linear Regression',              file: '01-linear-regression.html',        description: 'Assumptions, coefficient interpretation, performance evaluation, house price prediction.',     readTime: 20 },
      { id: 'regression-m2', title: 'Mathematics of Linear Regression', file: '02-math-linear-regression.html',  description: 'Normal equation derivation, gradient descent animation, Gauss-Markov theorem.',              readTime: 25 },
      { id: 'regression-m3', title: 'Logistic Regression',             file: '03-logistic-regression.html',      description: 'Binary and multiclass classification, regularization, ROC curves.',                         readTime: 20 },
      { id: 'regression-m4', title: 'Mathematics of Logistic Regression', file: '04-math-logistic-regression.html', description: 'MLE, cross-entropy, Newton\'s method, Bayesian interpretation of regularization.',       readTime: 25 },
    ],
  },
  {
    id: 'hypothesis-testing',
    title: 'Hypothesis Testing',
    description: '5 interactive modules covering errors, alpha, p-value, Z-tests, t-tests, A/B testing, and paired tests.',
    color: '#10b981',
    trackPath: 'hypothesis-testing',
    modules: [
      { id: 'ht-m1', title: 'Foundations of Hypothesis Testing',         file: '01-ht-foundations.html',      description: 'Decision framework, null and alternative hypotheses, one- and two-tailed tests.',          readTime: 15 },
      { id: 'ht-m2', title: 'Errors, Alpha, p-value, Critical Value',    file: '02-errors-alpha-pvalue.html', description: 'Type I/II errors, significance level, power, p-value interpretation.',                   readTime: 18 },
      { id: 'ht-m3', title: 'One-Sample Z-Test',                         file: '03-one-sample-z.html',        description: 'Testing a population mean with known sigma. Full derivation, confidence intervals.',      readTime: 18 },
      { id: 'ht-m4', title: 'Two-Sample Tests and A/B Testing',          file: '04-two-sample-tests.html',    description: 'Two-population Z-test, Welch\'s t-test, A/B testing, Cohen\'s d effect size.',           readTime: 20 },
      { id: 'ht-m5', title: 'Paired t-Test',                             file: '05-paired-t.html',            description: 'Dependent samples, before-after designs, reduction to one-sample t on differences.',     readTime: 15 },
    ],
  },
  {
    id: 'clustering',
    title: 'K-Means Clustering',
    description: '4 interactive modules covering distance metrics, centroids, K-means algorithm, WCSS, elbow method, and silhouette score.',
    color: '#8b5cf6',
    trackPath: 'clustering',
    modules: [
      { id: 'clustering-m1', title: 'Why Clustering? Intuition and K-Means',  file: '01-clustering-intro.html',      description: 'Unsupervised learning, partitioning, real-world applications, animated demo.',          readTime: 12 },
      { id: 'clustering-m2', title: 'Distance, Means, and Centroids',         file: '02-distance-centroids.html',    description: 'Euclidean, Manhattan, cosine distance. Centroid as minimiser of squared distances.',    readTime: 15 },
      { id: 'clustering-m3', title: 'Inertia (WCSS) and the Elbow Method',    file: '03-inertia-wcss.html',          description: 'WCSS as the K-means objective, coordinate descent view, elbow method and limits.',      readTime: 15 },
      { id: 'clustering-m4', title: 'Silhouette Score and Evaluation',        file: '04-silhouette-metrics.html',    description: 'Silhouette formula, silhouette plots, Davies-Bouldin, Calinski-Harabasz.',              readTime: 15 },
    ],
  },
  {
    id: 'decision-trees',
    title: 'Decision Trees and Ensembles',
    description: '7 interactive modules from splitting a single node to training gradient-boosted forests. Full derivations.',
    color: '#ef4444',
    trackPath: 'decision-trees',
    modules: [
      { id: 'dt-m1', title: 'Decision Trees — Intuition and Structure',   file: '01-decision-trees-intro.html',    description: 'Why trees, prediction, tree anatomy, decision boundary as axis-aligned cuts.',         readTime: 15 },
      { id: 'dt-m2', title: 'Impurity Measures and the Training Process', file: '02-impurity-training.html',       description: 'Gini impurity, entropy, misclassification rate, information gain, CART algorithm.',    readTime: 20 },
      { id: 'dt-m3', title: 'Gini Index Splits',                          file: '03-gini-splits.html',             description: 'Full worked example, threshold search, continuous vs categorical, Gini vs entropy.',  readTime: 20 },
      { id: 'dt-m4', title: 'Advantages, Limitations, and Pruning',       file: '04-advantages-limitations.html',  description: 'Interpretability strengths, variance and instability, pre-pruning and cost-complexity.', readTime: 15 },
      { id: 'dt-m5', title: 'Bagging and Random Forests',                 file: '05-bagging-random-forests.html',  description: 'Bootstrap aggregating, variance reduction, random feature subsets, OOB error.',        readTime: 20 },
      { id: 'dt-m6', title: 'Gradient Boosting',                          file: '06-gradient-boosting.html',       description: 'Functional gradient descent, pseudo-residuals, shrinkage, XGBoost overview.',         readTime: 22 },
      { id: 'dt-m7', title: 'Hyperparameter Tuning',                      file: '07-hyperparameter-tuning.html',   description: 'Every knob for RF and GB through the bias-variance lens with interactive simulators.', readTime: 20 },
    ],
  },
  {
    id: 'nlp',
    title: 'Natural Language Processing',
    description: '10 interactive modules from raw text to language models. spaCy + NLTK code throughout.',
    color: '#06b6d4',
    trackPath: 'nlp',
    modules: [
      { id: 'nlp-m1',  title: 'Text Normalization & Edit Distance',           file: '01-text-normalization-edit-distance.html',         description: 'Tokenization, lowercasing, stopword removal, Levenshtein distance with DP widget.',        readTime: 15 },
      { id: 'nlp-m2',  title: 'Stemming, Lemmatization & Noisy Channel',      file: '02-stemming-lemmatization-noisy-channel.html',      description: 'Porter/Snowball stemmers, lemmatization, Bayesian noisy channel for spell correction.',    readTime: 15 },
      { id: 'nlp-m3',  title: 'POS Tagging & Shallow Parsing',                file: '03-pos-tagging-shallow-parsing.html',               description: 'Penn Treebank tags, HMM-based tagging, NP chunking, live color-coded POS widget.',        readTime: 15 },
      { id: 'nlp-m4',  title: 'CFG, Parse Trees & Deep Parsing',              file: '04-cfg-parse-trees-deep-parsing.html',              description: 'Context-free grammars, constituency trees, structural ambiguity, SVG step-through parser.', readTime: 18 },
      { id: 'nlp-m5',  title: 'Lexical Semantics & WSD',                      file: '05-lexical-semantics-wsd.html',                     description: 'WordNet synsets, hypernyms, polysemy vs homonymy, Lesk algorithm step-through.',            readTime: 15 },
      { id: 'nlp-m6',  title: 'Distributional Semantics & PMI',               file: '06-distributional-semantics-pmi.html',              description: 'Co-occurrence matrices, PMI/PPMI formulas, live Plotly heatmap from editable corpus.',      readTime: 18 },
      { id: 'nlp-m7',  title: 'NER, IOB, CRF, SRL & Coreference',            file: '07-ner-iob-crf-srl-coreference.html',              description: 'Named entities, BIO tagging, CRF sequence models, semantic roles, coreference chains.',     readTime: 18 },
      { id: 'nlp-m8',  title: 'BoW, TF-IDF & Topic Modeling',                file: '08-bow-tfidf-topic-modeling.html',                  description: 'Bag of words, TF-IDF formula, IDF weighting, NMF topic modeling with Plotly heatmap.',     readTime: 18 },
      { id: 'nlp-m9',  title: 'Word Embeddings',                              file: '09-word-embeddings.html',                           description: 'word2vec skip-gram/CBOW, embedding space, cosine similarity, analogy tasks, BERT overview.', readTime: 20 },
      { id: 'nlp-m10', title: 'N-gram Language Models & Applications',        file: '10-ngram-lm-applications.html',                    description: 'Chain rule, Laplace smoothing, perplexity, text generation, summarization, MT overview.',   readTime: 18 },
    ],
  },
  {
    id: 'pandas-eda',
    title: 'Pandas EDA and Visualization',
    description: '9 interactive modules covering data cleaning, missing values, outlier detection, and visualization using one NYC taxi-trip dataset.',
    color: '#f97316',
    trackPath: 'pandas-eda',
    modules: [
      { id: 'eda-m1', title: 'EDA Foundations & First Look',              file: '01-eda-foundations.html',               description: 'shape, dtypes, head/info/describe — what you must know before cleaning anything.',          readTime: 12 },
      { id: 'eda-m2', title: 'Missing Values',                            file: '02-missing-values.html',                description: 'isna ratios, dropna vs fillna, and why mean isn\'t always the right fill.',               readTime: 15 },
      { id: 'eda-m3', title: 'Data Quality & Invalid Values',             file: '03-data-quality-invalid-values.html',   description: 'Negative fares, zero-distance trips, and boolean-mask business rules.',                    readTime: 15 },
      { id: 'eda-m4', title: 'Outlier Detection & Treatment (IQR)',       file: '04-outlier-detection-iqr.html',         description: 'Tukey fences, cap vs remove, telling a real error from a flat-rate fare.',                  readTime: 15 },
      { id: 'eda-m5', title: 'Datetime Parsing & Feature Engineering',    file: '05-datetime-feature-engineering.html',  description: 'Turning timestamp strings into hour, weekday, and duration features.',                      readTime: 15 },
      { id: 'eda-m6', title: 'Univariate Visualization',                  file: '06-univariate-visualization.html',      description: 'Histograms, boxplots, and reading skew before comparing variables.',                       readTime: 15 },
      { id: 'eda-m7', title: 'Bivariate Analysis',                        file: '07-bivariate-analysis.html',            description: 'Scatter plots, groupby, and why a correlation can hide in dirty data.',                    readTime: 15 },
      { id: 'eda-m8', title: 'Multivariate Analysis',                     file: '08-multivariate-analysis.html',         description: 'Correlation matrices and pivot tables across several variables at once.',                   readTime: 15 },
      { id: 'eda-m9', title: 'Capstone — End-to-End EDA Workflow',        file: '09-capstone-eda-workflow.html',         description: 'Chaining every prior step into one repeatable pipeline.',                                   readTime: 20 },
    ],
  },
];

/* ── Derived lookups (built once at module load) ── */
export const moduleById = {};

courses.forEach(course => {
  course.modules.forEach((mod, idx) => {
    moduleById[mod.id] = {
      ...mod,
      courseId: course.id,
      courseTitle: course.title,
      coursePath: course.trackPath,
      courseColor: course.color,
      moduleNumber: idx + 1,
      totalInCourse: course.modules.length,
      prevId: course.modules[idx - 1]?.id || null,
      nextId: course.modules[idx + 1]?.id || null,
    };
  });
});

export function getPrevNext(moduleId) {
  const m = moduleById[moduleId];
  if (!m) return { prev: null, next: null };
  return {
    prev: m.prevId ? moduleById[m.prevId] : null,
    next: m.nextId ? moduleById[m.nextId] : null,
  };
}

export const allModules = Object.values(moduleById);
```

- [ ] **Step 2: Create `react-app/src/__tests__/courses.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { courses, moduleById, allModules, getPrevNext } from '../data/courses.js'

describe('courses data', () => {
  it('has 7 tracks', () => {
    expect(courses).toHaveLength(7)
  })

  it('has 49 modules total', () => {
    expect(allModules).toHaveLength(49)
  })

  it('every module has required fields', () => {
    for (const m of allModules) {
      expect(m.id).toBeTruthy()
      expect(m.title).toBeTruthy()
      expect(m.file).toBeTruthy()
      expect(m.description).toBeTruthy()
      expect(typeof m.readTime).toBe('number')
      expect(m.courseId).toBeTruthy()
      expect(m.coursePath).toBeTruthy()
      expect(m.courseColor).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('moduleById keys match module ids', () => {
    for (const [key, mod] of Object.entries(moduleById)) {
      expect(key).toBe(mod.id)
    }
  })

  it('getPrevNext returns null at track boundaries', () => {
    // first module of etl-pyspark track
    const { prev } = getPrevNext('etl-pyspark-m1')
    expect(prev).toBeNull()

    // last module of etl-pyspark track
    const { next } = getPrevNext('etl-pyspark-m10')
    expect(next).toBeNull()
  })

  it('getPrevNext returns adjacent modules within same track', () => {
    const { prev, next } = getPrevNext('etl-pyspark-m3')
    expect(prev?.id).toBe('etl-pyspark-m2')
    expect(next?.id).toBe('etl-pyspark-m4')
  })

  it('getPrevNext handles unknown id', () => {
    expect(getPrevNext('nonexistent')).toEqual({ prev: null, next: null })
  })
})
```

- [ ] **Step 3: Run tests**

```bash
cd react-app && npm test
```

Expected:
```
✓ courses data > has 7 tracks
✓ courses data > has 49 modules total
✓ courses data > every module has required fields
✓ courses data > moduleById keys match module ids
✓ courses data > getPrevNext returns null at track boundaries
✓ courses data > getPrevNext returns adjacent modules within same track
✓ courses data > getPrevNext handles unknown id

Test Files  1 passed (1)
Tests       7 passed (7)
```

- [ ] **Step 4: Commit**

```bash
git add react-app/src/data/courses.js react-app/src/__tests__/courses.test.js
git commit -m "feat: add course data (7 tracks, 49 modules) with lookup map"
```

---

### Task 4: Progress Storage + Hook + Context

**Files:**
- Create: `react-app/src/hooks/progressStorage.js`
- Create: `react-app/src/__tests__/progressStorage.test.js`
- Create: `react-app/src/hooks/useProgress.jsx`

**Interfaces:**
- `progressStorage.js` exports: `load()`, `save(data)`, `markComplete(id)`, `toggleBookmark(id)`, `setLastVisited(id)`
- `useProgress.jsx` exports: `ProgressProvider`, `useProgressContext`
- `useProgressContext()` returns: `{ data, markComplete, toggleBookmark, setLastVisited, isCompleted, isBookmarked, getLastVisited, getTrackProgress }`
- Consumed by: App.jsx (ProgressProvider), Sidebar, Dashboard, ModuleViewer (useProgressContext)

- [ ] **Step 1: Create `react-app/src/hooks/progressStorage.js`**

```js
const KEY = 'mlportal_v1';

export function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage quota exceeded — silently skip
  }
}

export function markComplete(id) {
  const data = load();
  data[id] = { ...data[id], completed: true, lastVisited: Date.now() };
  save(data);
  return data;
}

export function toggleBookmark(id) {
  const data = load();
  data[id] = { ...data[id], bookmarked: !data[id]?.bookmarked };
  save(data);
  return data;
}

export function setLastVisited(id) {
  const data = load();
  data[id] = { ...data[id], lastVisited: Date.now() };
  save(data);
  return data;
}
```

- [ ] **Step 2: Create `react-app/src/__tests__/progressStorage.test.js`**

```js
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage before importing module
const store = {};
const localStorageMock = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};

vi.stubGlobal('localStorage', localStorageMock);

const { load, save, markComplete, toggleBookmark, setLastVisited } =
  await import('../hooks/progressStorage.js');

describe('progressStorage', () => {
  beforeEach(() => localStorageMock.clear());

  it('load returns empty object when nothing stored', () => {
    expect(load()).toEqual({});
  });

  it('save and load round-trip', () => {
    const data = { 'm1': { completed: true } };
    save(data);
    expect(load()).toEqual(data);
  });

  it('markComplete sets completed true and lastVisited', () => {
    const result = markComplete('module-1');
    expect(result['module-1'].completed).toBe(true);
    expect(typeof result['module-1'].lastVisited).toBe('number');
  });

  it('markComplete preserves existing fields', () => {
    save({ 'module-1': { bookmarked: true } });
    const result = markComplete('module-1');
    expect(result['module-1'].bookmarked).toBe(true);
    expect(result['module-1'].completed).toBe(true);
  });

  it('toggleBookmark flips bookmark state', () => {
    const first = toggleBookmark('module-1');
    expect(first['module-1'].bookmarked).toBe(true);
    const second = toggleBookmark('module-1');
    expect(second['module-1'].bookmarked).toBe(false);
  });

  it('setLastVisited sets timestamp', () => {
    const before = Date.now();
    const result = setLastVisited('module-1');
    expect(result['module-1'].lastVisited).toBeGreaterThanOrEqual(before);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd react-app && npm test
```

Expected: 13 tests pass (7 from courses + 6 from progressStorage).

- [ ] **Step 4: Create `react-app/src/hooks/useProgress.jsx`**

```jsx
import { createContext, useContext, useState, useCallback } from 'react'
import * as storage from './progressStorage.js'

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [data, setData] = useState(() => storage.load());

  const refresh = useCallback((fn) => {
    setData(fn());
  }, []);

  const markComplete = useCallback((id) => {
    refresh(() => storage.markComplete(id));
  }, [refresh]);

  const toggleBookmark = useCallback((id) => {
    refresh(() => storage.toggleBookmark(id));
  }, [refresh]);

  const setLastVisited = useCallback((id) => {
    refresh(() => storage.setLastVisited(id));
  }, [refresh]);

  const isCompleted = useCallback((id) => Boolean(data[id]?.completed), [data]);
  const isBookmarked = useCallback((id) => Boolean(data[id]?.bookmarked), [data]);
  const getLastVisited = useCallback((id) => data[id]?.lastVisited || null, [data]);

  const getTrackProgress = useCallback((moduleIds) => ({
    completed: moduleIds.filter(id => data[id]?.completed).length,
    total: moduleIds.length,
  }), [data]);

  const value = { data, markComplete, toggleBookmark, setLastVisited, isCompleted, isBookmarked, getLastVisited, getTrackProgress };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export const useProgressContext = () => useContext(ProgressContext);
```

- [ ] **Step 5: Commit**

```bash
git add react-app/src/hooks/ react-app/src/__tests__/progressStorage.test.js
git commit -m "feat: add progress storage (localStorage) + React context"
```

---

### Task 5: App Shell + Routing

**Files:**
- Modify: `react-app/src/App.jsx` (replace stub with full layout)

**Interfaces:**
- Consumes: `ProgressProvider` from `../hooks/useProgress.jsx`, React Router, `Sidebar`, `Dashboard`, `ModuleViewer` (stub imports until those tasks complete — import and render `null` placeholder)
- Produces: hash routes `#/` → Dashboard, `#/module/:moduleId` → ModuleViewer; dark mode toggle; mobile overlay; `ProgressProvider` wraps entire app

- [ ] **Step 1: Replace `react-app/src/App.jsx`**

```jsx
import { useState, useCallback } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { ProgressProvider } from './hooks/useProgress.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import ModuleViewer from './components/ModuleViewer.jsx'

export default function App() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleDark = useCallback(() => {
    setDark(d => {
      const next = !d;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light');
        // broadcast to ModuleViewer so it can sync the iframe
        window.dispatchEvent(new CustomEvent('theme-change', { detail: { dark: next } }));
      } catch {}
      return next;
    });
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  return (
    <HashRouter>
      <ProgressProvider>
        {/* Mobile header */}
        <div className="mobile-header">
          <button className="icon-btn" onClick={openSidebar} aria-label="Open menu">☰</button>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI/ML Portal</span>
          <button className="icon-btn" onClick={toggleDark} style={{ marginLeft: 'auto' }}>
            {dark ? '☀' : '◑'}
          </button>
        </div>

        <div className="app">
          {/* Sidebar overlay for mobile */}
          <div
            className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`}
            onClick={closeSidebar}
          />

          <Sidebar
            dark={dark}
            onToggleDark={toggleDark}
            mobileOpen={sidebarOpen}
            onClose={closeSidebar}
          />

          <main className="main-panel">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/module/:moduleId" element={<ModuleViewer />} />
            </Routes>
          </main>
        </div>
      </ProgressProvider>
    </HashRouter>
  );
}
```

- [ ] **Step 2: Create stub components so App.jsx compiles**

Create `react-app/src/components/Sidebar.jsx`:
```jsx
export default function Sidebar() { return null; }
```

Create `react-app/src/components/Dashboard.jsx`:
```jsx
export default function Dashboard() { return <div style={{padding:32}}>Dashboard — coming soon</div>; }
```

Create `react-app/src/components/ModuleViewer.jsx`:
```jsx
export default function ModuleViewer() { return <div style={{padding:32}}>Module Viewer — coming soon</div>; }
```

Create `react-app/src/components/SearchBar.jsx`:
```jsx
export default function SearchBar() { return null; }
```

- [ ] **Step 3: Verify routing works**

`npm run dev`. Open `http://localhost:5173/learnings-ai-ml-main/#/`. Should show "Dashboard — coming soon". Navigate to `http://localhost:5173/learnings-ai-ml-main/#/module/etl-pyspark-m1`. Should show "Module Viewer — coming soon".

- [ ] **Step 4: Commit**

```bash
git add react-app/src/App.jsx react-app/src/components/
git commit -m "feat: add app shell with hash routing, dark mode, mobile layout"
```

---

### Task 6: Sidebar Component

**Files:**
- Modify: `react-app/src/components/Sidebar.jsx` (replace stub)
- Modify: `react-app/src/components/SearchBar.jsx` (replace stub — SearchBar renders inside Sidebar)

**Interfaces:**
- Consumes: `courses` from `../data/courses.js`, `useProgressContext` from `../hooks/useProgress.jsx`, `useNavigate`, `useParams` from react-router-dom
- Props: `dark`, `onToggleDark`, `mobileOpen`, `onClose`
- Produces: collapsible track list, module links with completion check + bookmark star, active state, dark mode toggle, hamburger close button, renders `<SearchBar />`

- [ ] **Step 1: Replace `react-app/src/components/SearchBar.jsx`**

```jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { allModules } from '../data/courses.js'

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const wrapRef = useRef(null);

  // clear on route change
  useEffect(() => { setQuery(''); setOpen(false); }, [location]);

  // close on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = query.trim().toLowerCase();
  const results = q.length < 2 ? [] : allModules.filter(m =>
    m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
  ).slice(0, 8);

  function pick(id) {
    setQuery('');
    setOpen(false);
    navigate(`/module/${id}`);
  }

  return (
    <div className="search-wrap" ref={wrapRef}>
      <input
        className="search-input"
        type="search"
        placeholder="Search modules…"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => q.length >= 2 && setOpen(true)}
        aria-label="Search modules"
      />
      {open && q.length >= 2 && (
        <div className="search-dropdown" role="listbox">
          {results.length === 0
            ? <div className="search-empty">No results</div>
            : results.map(m => (
                <div key={m.id} className="search-result" role="option" onClick={() => pick(m.id)}>
                  <div className="search-result-title">{m.title}</div>
                  <div className="search-result-course">{m.courseTitle}</div>
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Replace `react-app/src/components/Sidebar.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { courses } from '../data/courses.js'
import { useProgressContext } from '../hooks/useProgress.jsx'
import SearchBar from './SearchBar.jsx'

export default function Sidebar({ dark, onToggleDark, mobileOpen, onClose }) {
  const { moduleId: activeId } = useParams();
  const navigate = useNavigate();
  const { isCompleted, isBookmarked, toggleBookmark, getTrackProgress } = useProgressContext();
  const [expanded, setExpanded] = useState(() => {
    // start with the active track expanded, or first track if on dashboard
    const initial = {};
    courses.forEach(c => { initial[c.id] = false; });
    if (activeId) {
      const course = courses.find(c => c.modules.some(m => m.id === activeId));
      if (course) initial[course.id] = true;
    } else {
      initial[courses[0].id] = true;
    }
    return initial;
  });

  function toggleTrack(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function goModule(id) {
    navigate(`/module/${id}`);
    onClose();
  }

  return (
    <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span
            className="sidebar-title"
            onClick={() => { navigate('/'); onClose(); }}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate('/')}
          >
            AI/ML Portal
          </span>
          <div className="sidebar-controls">
            <button className="icon-btn" onClick={onToggleDark} aria-label="Toggle dark mode" title="Toggle dark mode">
              {dark ? '☀' : '◑'}
            </button>
            <button className="icon-btn" onClick={onClose} aria-label="Close sidebar">✕</button>
          </div>
        </div>
        <SearchBar />
      </div>

      <nav className="sidebar-scroll" aria-label="Course navigation">
        {courses.map(course => {
          const isOpen = expanded[course.id];
          const { completed, total } = getTrackProgress(course.modules.map(m => m.id));

          return (
            <div key={course.id} className="track-group">
              <div
                className="track-header"
                onClick={() => toggleTrack(course.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && toggleTrack(course.id)}
                aria-expanded={isOpen}
              >
                <span className="track-dot" style={{ background: course.color }} />
                <span style={{ flex: 1 }}>{course.title}</span>
                <span className="track-progress-text">{completed}/{total}</span>
                <span className="track-chevron" style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
              </div>

              {isOpen && (
                <div className="module-items">
                  {course.modules.map(mod => {
                    const done = isCompleted(mod.id);
                    const starred = isBookmarked(mod.id);
                    const active = mod.id === activeId;

                    return (
                      <div
                        key={mod.id}
                        className={`module-item${active ? ' active' : ''}`}
                        onClick={() => goModule(mod.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && goModule(mod.id)}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span className="module-check">{done ? '✓' : ''}</span>
                        <span className="module-name">{mod.title}</span>
                        <button
                          className={`star-btn${starred ? ' bookmarked' : ''}`}
                          onClick={e => { e.stopPropagation(); toggleBookmark(mod.id); }}
                          aria-label={starred ? 'Remove bookmark' : 'Bookmark'}
                          title={starred ? 'Remove bookmark' : 'Bookmark'}
                        >
                          {starred ? '★' : '☆'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Verify in browser**

`npm run dev`. Sidebar should show all 7 tracks with colored dots. Click a track header to expand/collapse module list. Click a module → URL changes to `#/module/etl-pyspark-m1`. Click the star on a module → turns gold. Refresh page → bookmark persists. Type in search box → dropdown appears.

- [ ] **Step 4: Commit**

```bash
git add react-app/src/components/Sidebar.jsx react-app/src/components/SearchBar.jsx
git commit -m "feat: add sidebar with track navigation, bookmarks, and search"
```

---

### Task 7: Dashboard Component

**Files:**
- Modify: `react-app/src/components/Dashboard.jsx` (replace stub)

**Interfaces:**
- Consumes: `courses` from `../data/courses.js`, `moduleById` from `../data/courses.js`, `useProgressContext` from `../hooks/useProgress.jsx`, `useNavigate` from react-router-dom
- Produces: stats row (total/completed/bookmarked counts), track grid with cards (progress bar, continue button), responsive layout

- [ ] **Step 1: Replace `react-app/src/components/Dashboard.jsx`**

```jsx
import { useNavigate } from 'react-router-dom'
import { courses, moduleById, allModules } from '../data/courses.js'
import { useProgressContext } from '../hooks/useProgress.jsx'

export default function Dashboard() {
  const navigate = useNavigate();
  const { isCompleted, isBookmarked, getTrackProgress, getLastVisited } = useProgressContext();

  const totalModules = allModules.length;
  const completedCount = allModules.filter(m => isCompleted(m.id)).length;
  const bookmarkedCount = allModules.filter(m => isBookmarked(m.id)).length;

  function getContinueId(course) {
    // last visited module in this track, else first incomplete, else first
    let best = null;
    let bestTs = 0;
    for (const m of course.modules) {
      const ts = getLastVisited(m.id) || 0;
      if (ts > bestTs) { bestTs = ts; best = m.id; }
    }
    if (best) return best;
    const firstIncomplete = course.modules.find(m => !isCompleted(m.id));
    return firstIncomplete ? firstIncomplete.id : course.modules[0].id;
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-heading">AI/ML Learning Portal</h1>
      <p className="dashboard-sub">Self-paced interactive courses for data science and engineering.</p>

      <div className="stats-row">
        <div className="stat"><strong>{completedCount}</strong> / {totalModules} modules completed</div>
        <div className="stat"><strong>{bookmarkedCount}</strong> bookmarked</div>
      </div>

      <div className="track-grid">
        {courses.map(course => {
          const { completed, total } = getTrackProgress(course.modules.map(m => m.id));
          const pct = total > 0 ? (completed / total) * 100 : 0;
          const continueId = getContinueId(course);

          return (
            <div
              key={course.id}
              className="track-card"
              style={{ '--card-color': course.color }}
              onClick={() => navigate(`/module/${continueId}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/module/${continueId}`)}
            >
              <h3>{course.title}</h3>
              <p>{course.description}</p>

              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${pct}%`, background: course.color }}
                />
              </div>
              <div className="progress-label">
                {completed === total && total > 0
                  ? '✓ Complete'
                  : `${completed} / ${total} modules`}
              </div>

              <button
                className="continue-btn"
                style={{ color: course.color }}
                onClick={e => { e.stopPropagation(); navigate(`/module/${continueId}`); }}
              >
                {completed === 0 ? 'Start →' : completed === total ? 'Review →' : 'Continue →'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

`http://localhost:5173/learnings-ai-ml-main/#/`. Should show 7 track cards in a grid, each with a progress bar (all at 0), description, and "Start →" button. Mark a module complete in ModuleViewer (Task 9) later to test progress bars.

- [ ] **Step 3: Commit**

```bash
git add react-app/src/components/Dashboard.jsx
git commit -m "feat: add dashboard with track cards, progress bars, and stats"
```

---

### Task 8: Module Viewer Component

**Files:**
- Modify: `react-app/src/components/ModuleViewer.jsx` (replace stub)

**Interfaces:**
- Consumes: `useParams` (moduleId), `useNavigate`, `moduleById` and `getPrevNext` from `../data/courses.js`, `useProgressContext`
- Produces: top bar (breadcrumb, prev/next buttons, bookmark star, mark-complete button), iframe loading existing HTML at `{BASE_URL}{coursePath}/modules/{file}`, 30-second auto-complete via IntersectionObserver + setTimeout

- [ ] **Step 1: Replace `react-app/src/components/ModuleViewer.jsx`**

```jsx
import { useEffect, useRef, useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { moduleById, getPrevNext } from '../data/courses.js'
import { useProgressContext } from '../hooks/useProgress.jsx'

const BASE = import.meta.env.BASE_URL;

function syncIframeTheme(iframe, dark) {
  try {
    iframe?.contentDocument?.documentElement?.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch {}
}

export default function ModuleViewer() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { isCompleted, isBookmarked, markComplete, toggleBookmark, setLastVisited } = useProgressContext();
  const iframeRef = useRef(null);
  const autoTimerRef = useRef(null);

  // mirror shell dark mode; App.jsx broadcasts 'theme-change' on toggle
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    function handler(e) { setDark(e.detail.dark); }
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const mod = moduleById[moduleId];
  const { prev, next } = getPrevNext(moduleId);
  const done = isCompleted(moduleId);
  const starred = isBookmarked(moduleId);

  // record last visited + reset auto-complete timer on module change
  useEffect(() => {
    if (!mod) return;
    setLastVisited(moduleId);

    // auto-mark complete after 30s
    autoTimerRef.current = setTimeout(() => {
      markComplete(moduleId);
    }, 30000);

    return () => clearTimeout(autoTimerRef.current);
  }, [moduleId]); // eslint-disable-line react-hooks/exhaustive-deps

  // sync iframe theme whenever dark state changes or iframe src changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    function onLoad() { syncIframeTheme(iframe, dark); }
    iframe.addEventListener('load', onLoad);
    syncIframeTheme(iframe, dark); // sync immediately if already loaded
    return () => iframe.removeEventListener('load', onLoad);
  }, [dark, moduleId]);

  const handleMarkComplete = useCallback(() => {
    clearTimeout(autoTimerRef.current);
    markComplete(moduleId);
  }, [moduleId, markComplete]);

  if (!mod) {
    return (
      <div style={{ padding: 32 }}>
        <p>Module not found: <code>{moduleId}</code></p>
        <button onClick={() => navigate('/')}>← Back to Dashboard</button>
      </div>
    );
  }

  const iframeSrc = `${BASE}${mod.coursePath}/modules/${mod.file}`;

  return (
    <div className="module-viewer">
      <div className="module-topbar">
        {/* Breadcrumb */}
        <div className="module-breadcrumb">
          <span
            role="button"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            {mod.courseTitle}
          </span>
          {' › '}
          <strong>Module {mod.moduleNumber} of {mod.totalInCourse}</strong>
        </div>

        {/* Read time */}
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          ~{mod.readTime} min
        </span>

        {/* Bookmark */}
        <button
          className={`topbar-star${starred ? ' bookmarked' : ''}`}
          onClick={() => toggleBookmark(moduleId)}
          aria-label={starred ? 'Remove bookmark' : 'Bookmark this module'}
          title={starred ? 'Remove bookmark' : 'Bookmark'}
        >
          {starred ? '★' : '☆'}
        </button>

        {/* Prev */}
        <button
          className="topbar-btn"
          onClick={() => prev && navigate(`/module/${prev.id}`)}
          disabled={!prev}
          aria-label="Previous module"
        >
          ← Prev
        </button>

        {/* Next */}
        <button
          className="topbar-btn"
          onClick={() => next && navigate(`/module/${next.id}`)}
          disabled={!next}
          aria-label="Next module"
        >
          Next →
        </button>

        {/* Complete */}
        {done
          ? <button className="topbar-btn done-btn" disabled>✓ Done</button>
          : (
            <button className="topbar-btn complete-btn" onClick={handleMarkComplete}>
              Mark complete
            </button>
          )
        }
      </div>

      <iframe
        ref={iframeRef}
        src={iframeSrc}
        className="module-iframe"
        title={mod.title}
        allow="storage-access *"
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to any module. The existing HTML file should load in the iframe (confirm the interactive widgets, code blocks, and dark mode toggle all work). Top bar should show: breadcrumb, read time, bookmark star, prev/next buttons, mark complete button. Click "Mark complete" → button turns to "✓ Done". Navigate to Dashboard → progress bar for that track updates.

If the iframe shows a blank page or 404 in dev:
- Check that `vite.config.js` has `root: resolve(__dirname, '..')` pointing to repo root
- Confirm `import.meta.env.BASE_URL` is `/learnings-ai-ml-main/` or `/` in dev

- [ ] **Step 3: Commit**

```bash
git add react-app/src/components/ModuleViewer.jsx
git commit -m "feat: add module viewer with iframe, progress, bookmarks, auto-complete"
```

---

### Task 9: GitHub Actions Deploy Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Triggers on push to `main`
- Builds React (`cd react-app && npm ci && npm run build`)
- Copies 7 track directories into `react-app/dist/`
- Pushes `react-app/dist/` to `gh-pages` branch using `peaceiris/actions-gh-pages@v4`
- Produces: site live at `https://jeevchiran.github.io/learnings-ai-ml-main/`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: react-app/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: react-app

      - name: Build
        run: npm run build
        working-directory: react-app

      - name: Copy track content into dist
        run: |
          cp -r etl-pyspark        react-app/dist/
          cp -r Regression         react-app/dist/
          cp -r hypothesis-testing react-app/dist/
          cp -r clustering         react-app/dist/
          cp -r decision-trees     react-app/dist/
          cp -r nlp                react-app/dist/
          cp -r pandas-eda         react-app/dist/

      - name: Deploy to gh-pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: react-app/dist
          force_orphan: true
```

- [ ] **Step 2: Push to GitHub and verify**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions deploy workflow to gh-pages"
git push origin main
```

Go to `https://github.com/jeevchiran/learnings-ai-ml-main/actions`. Workflow should start automatically. Wait for green ✓.

Then go to repository Settings → Pages → Source: Deploy from branch `gh-pages` / root. Save.

Wait 1-2 min, then visit `https://jeevchiran.github.io/learnings-ai-ml-main/`. The React portal should load.

- [ ] **Step 3: Smoke test deployed site**

- [ ] Dashboard loads, 7 track cards visible
- [ ] Click "Start →" on any track → ModuleViewer opens with iframe
- [ ] Iframe loads the existing HTML module (interactive widgets work)
- [ ] "Mark complete" persists on refresh
- [ ] Dark mode toggle works in React shell
- [ ] Search finds modules by keyword
- [ ] Bookmark a module → star turns gold, persists on refresh
- [ ] Prev/Next buttons navigate within track

---

## Self-Review

### Spec coverage check

| Spec requirement | Task |
|---|---|
| React shell with HashRouter | Task 5 |
| Sidebar with collapsible tracks, bookmark indicators | Task 6 |
| Dashboard: track cards, progress bars, Continue button, stats | Task 7 |
| Search: client-side filter, instant | Task 6 (SearchBar) |
| Completion: "Mark complete" button + 30s auto | Task 8 |
| Bookmarks: star icon, localStorage | Tasks 4 + 6 + 8 |
| Read time: static estimate | Task 3 (courses.js) |
| Dark mode sync shell → iframe (contentDocument + theme-change event) | Task 5 (App, event dispatch) + Task 8 (ModuleViewer, listener + sync) |
| iframe with existing HTML, correct path in dev + prod | Task 8 + Task 1 (vite.config) |
| GitHub Actions deploy copying track dirs | Task 9 |
| Base path `/learnings-ai-ml-main/` | Task 1 (vite.config) |
| Existing HTML untouched | Constraint honored throughout |
| All 49 modules in data | Task 3 |

All requirements covered. ✓

### Type/name consistency check

- `moduleById` defined in Task 3, consumed in Tasks 6, 7, 8 ✓
- `getPrevNext` defined in Task 3, consumed in Task 8 ✓
- `allModules` defined in Task 3, consumed in Tasks 6 (SearchBar), 7 ✓
- `useProgressContext` exported from Task 4, consumed in Tasks 6, 7, 8 ✓
- `ProgressProvider` exported from Task 4, used in Task 5 ✓
- `getTrackProgress(moduleIds)` takes `string[]` — called as `getTrackProgress(course.modules.map(m => m.id))` in Tasks 6 + 7 ✓
- CSS class names used in JSX match classes defined in Task 2 ✓

No placeholder text, no "TBD", no type mismatches found. ✓
