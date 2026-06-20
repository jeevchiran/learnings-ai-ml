# React Hybrid Learning Portal — Design Spec

**Date:** 2026-06-20  
**Author:** Chiranjeev  
**Status:** Approved

---

## Problem

The current site is plain HTML files linked together. Navigation is per-page, there is no progress tracking, no search, and no unified dashboard. Content (interactive Pyodide code blocks, KaTeX, Plotly widgets) works well but the surrounding shell is minimal.

## Goal

A React SPA shell that wraps all existing module HTML files in an `<iframe>`, delivering a rich learning dashboard without migrating any module content.

---

## Approach: Hybrid iframe

React handles navigation, search, progress, and UI chrome. Existing HTML module files are served as-is inside an `<iframe>` in the right panel. No module content is touched.

**Why hybrid over full port or links-only:**  
Full port = 46+ files to migrate, weeks of work. Links-only = no SPA feel, no unified state. Hybrid = SPA experience with zero content migration.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Bundler | Vite | Fast, zero config for gh-pages base path |
| Framework | React 18 | SPA routing, component model |
| Router | React Router v6 (hash mode) | GitHub Pages requires hash router (no server rewrites) |
| Styling | Plain CSS + CSS variables | Reuse existing palette; no extra dependency |
| State | localStorage only | No backend needed |
| Deploy | GitHub Actions + gh-pages | Automated on push to `main` |

No TypeScript. No UI component library.

---

## File Structure

```
react-app/
  src/
    data/
      courses.js            # static metadata for all 7 tracks + 46 modules
    components/
      Sidebar.jsx           # collapsible track/module tree, bookmark indicators
      ModuleViewer.jsx      # <iframe> panel, mark-complete bar
      Dashboard.jsx         # home view: track cards + progress bars
      SearchBar.jsx         # client-side filter on title + description
    hooks/
      useProgress.js        # localStorage read/write abstraction
    App.jsx                 # layout: sidebar + main panel, routing
    index.css               # global styles, CSS variables, dark mode
  public/
    favicon.ico
  index.html
  vite.config.js
  package.json
.github/
  workflows/
    deploy.yml              # build + copy tracks + push to gh-pages
```

---

## Course Data Shape

```js
// src/data/courses.js
export const courses = [
  {
    id: 'etl-pyspark',
    title: 'PySpark and ETL',
    description: '10 modules covering distributed data processing...',
    color: '#3b82f6',
    trackPath: 'etl-pyspark',
    modules: [
      {
        id: 'etl-pyspark-m1',
        title: 'ETL with PySpark',
        description: 'Extract, transform, and load data using PySpark pipelines.',
        file: 'modules/01-etl-pyspark.html',
        readTime: 15,
      },
      // ...9 more
    ],
  },
  // 6 more tracks: Regression, Hypothesis Testing, Clustering, Decision Trees, NLP, Pandas EDA
];
```

Total: 7 tracks, 46 modules. `readTime` is a static estimate in minutes.

---

## Components

### App.jsx
- Two-column layout: `<Sidebar>` (fixed left, collapsible) + main panel
- Hash routes: `#/` → Dashboard, `#/module/:moduleId` → ModuleViewer
- Renders `<SearchBar>` in sidebar header
- Dark mode toggle in top bar; stores preference in localStorage

### Sidebar.jsx
- Lists all 7 tracks; each expandable to show module list
- Active module highlighted; bookmarked modules show star icon
- Collapses to icon-only on mobile (hamburger toggle)

### Dashboard.jsx
- 7 track cards in responsive grid
- Each card: title, description, color accent, progress bar (`completed/total`), "Continue" button (links to last visited module or first)
- Global stats row: total modules, completed, bookmarked

### ModuleViewer.jsx
- `<iframe src={resolvedPath} />` filling the right panel at 100% height
- Top bar above iframe: module title, breadcrumb (Track > Module N of N), prev/next buttons, bookmark star, "Mark complete" button
- Auto-marks complete after 30s of iframe being visible (IntersectionObserver + timer)
- `resolvedPath = import.meta.env.BASE_URL + track.trackPath + '/' + module.file`

### SearchBar.jsx
- Controlled input, filters `courses` flat-map of modules by title + description
- Renders dropdown of results; clicking navigates to `#/module/:id`
- Clears on route change

### useProgress.js
```js
// localStorage schema
const SCHEMA = {
  // key: moduleId
  // value: { completed: bool, bookmarked: bool, lastVisited: timestamp }
};
const KEY = 'mlportal_v1';
```
Exposes: `getProgress()`, `markComplete(id)`, `toggleBookmark(id)`, `setLastVisited(id)`.

---

## Dark Mode

React shell toggles dark mode and dispatches `window.dispatchEvent(new CustomEvent('theme-change', { detail: { dark } }))`. ModuleViewer listens for this event and calls `iframe.contentDocument.documentElement.setAttribute('data-theme', ...)` directly (same-origin, so no postMessage or CORS issues). The sync also fires on iframe `load` so freshly navigated modules receive the current theme immediately. No modifications to existing module HTML needed.

---

## Deployment

### vite.config.js
```js
export default { base: '/learnings-ai-ml-main/' }
```

### .github/workflows/deploy.yml
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd react-app && npm ci && npm run build
      - name: Copy track content into dist
        run: |
          cp -r etl-pyspark react-app/dist/
          cp -r Regression react-app/dist/
          cp -r hypothesis-testing react-app/dist/
          cp -r clustering react-app/dist/
          cp -r decision-trees react-app/dist/
          cp -r nlp react-app/dist/
          cp -r pandas-eda react-app/dist/
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: react-app/dist
```

**Live URL after deploy:** `https://jeevchiran.github.io/learnings-ai-ml-main/`

No source duplication. Existing HTML files untouched. Fully automated on push to `main`.

---

## localStorage Schema

```json
{
  "theme": "dark",
  "mlportal_v1": {
    "etl-pyspark-m1": { "completed": true, "bookmarked": false, "lastVisited": 1718870400000 },
    "etl-pyspark-m2": { "completed": false, "bookmarked": true, "lastVisited": null }
  }
}
```

---

## Out of Scope

- Dark mode sync between shell and iframe (independent toggles)
- User accounts or server-side progress sync
- Converting any module content to React
- Mobile-optimized iframe layout (iframes are hard on mobile; noted limitation)

---

## Success Criteria

1. React app builds and deploys to `gh-pages` branch via GitHub Actions
2. All 7 tracks and 46 modules navigable from sidebar
3. Progress persists across browser sessions
4. Search filters modules in real time
5. Bookmarks and completion badges visible on Dashboard
6. Existing module HTML files load correctly in iframe (interactive widgets, Pyodide, Plotly all work)
