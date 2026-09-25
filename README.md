# ML Atlas

Interactive lessons for learning data science and machine learning, with worked examples, equations, quizzes and visual experiments. The React app contains **25 tracks and 273 module pages**, including track quizzes.

[Open ML Atlas](https://jeevchiran.github.io/learnings-ai-ml/)

## Start learning

1. Start with **Math for ML** if vectors, probability or derivatives are unfamiliar. Start **Pandas EDA** when you are comfortable with basic Python variables, lists and function calls.
2. Read the lesson's focus and small example. Prerequisite links take you to the background needed for a track; the refresher stays available in later lessons.
3. Use **Lesson sections** to navigate. Try one control at a time in a visual and explain the change in your own words.
4. Predict an answer when ready, or select **Show explanation** to read the reasoning first. Quiz answers can be retried.
5. Mark a module complete when you feel ready to continue. Progress and bookmarks are stored in your browser.

The first Pandas lesson links to [the synthetic taxi practice CSV](react-app/public/data/taxi_practice.csv). Save it beside your notebook and run the loading cell first. This fixture is teaching data, not a real trip extract or a source of current taxi fare rules.

## Run locally

The app uses React 18, Vite 5, MDX, KaTeX and Plotly. From the repository root:

```sh
cd react-app
npm ci
npm run dev
```

Open the URL printed by Vite. The app base path is `/learnings-ai-ml/`; lesson URLs use `#/module/<module-id>`.

```sh
npm test
npm run build
npm run preview
```

Python is optional for reading the app. To run Python examples, create a virtual environment and install the dependencies you need. `requirements.txt` covers the introductory data and Spark tracks. Advanced notebooks describe additional packages such as PyTorch, statsmodels or LightGBM in their setup cells. Spark also needs a compatible Java runtime.

```sh
python -m venv .venv
# Activate .venv using the command for your shell.
python -m pip install -r requirements.txt
jupyter notebook
```

## Repository map

| Location | Purpose |
|---|---|
| `react-app/src/data/courses.js` | All track metadata and ordered module IDs |
| `react-app/src/data/learningGuides.js` | Track prerequisites, concrete examples and term definitions |
| `react-app/src/content/<track>/` | Registered MDX lessons |
| `react-app/src/components/ModuleViewer.jsx` | Dynamic lesson loading and navigation |
| `react-app/src/components/MDXRenderer.jsx` | Shared MDX mappings, guide and outline |
| `react-app/src/components/learning/` | Reusable learning controls |
| `react-app/src/components/widgets/` | Interactive lesson visuals and calculation utilities |
| `react-app/public/data/` | Downloadable practice data |
| `notebook/` | Advanced track labs |
| `etl-pyspark/notebooks/` | Spark labs |
| `docs/audit/` | Audit findings and recorded checks |

Older standalone HTML tracks remain in the repository. The registered React/MDX lessons are the primary curriculum.

## Writing a lesson

Create `<module-id>.mdx` in its track folder and register the ID in `courses.js`. `ModuleViewer` discovers MDX files automatically. Start with one main heading, a clear learning outcome, and an example small enough to calculate by hand. Define symbols and jargon before using them. Explain what a learner should change, observe and conclude in each widget.

Use explicit imports for learning components and widgets. `QuizCard` and `MultiSelectQuiz` accept an optional `explanation`. `PredictReveal` keeps its worked reasoning in its children. Component names ending in `Widget` receive a scrollable visual wrapper during MDX compilation.

For a new track, add a guide in `learningGuides.js` and link its prerequisite module IDs. Keep illustrative data and fitted or measured results clearly distinguished.

Common MDX mistakes:

- Bare braces in prose are JavaScript expressions. Use parentheses or a code span for a literal set.
- Escape monetary dollar signs or write `USD 100`; otherwise prose between two amounts can become math.
- Use `$...$` for inline math and a separate `$$` block for longer equations.
- Preserve LaTeX backslashes when generating source. A tab followed by `imes` is not `\times`.
- Use GFM pipe tables; the configured `remark-gfm` plugin handles them.

## Audit checks

See [the beginner delivery audit](docs/audit/beginner-delivery-audit.md) for scope, findings, validation and limitations.

```sh
# From react-app
node scripts/audit-content.mjs --write
node scripts/review-lessons.mjs math-ml

# From the repository root
python scripts/audit-notebooks.py
python scripts/create-taxi-practice.py
```

Browser auditing uses Playwright. Install it in a tooling environment, set `PLAYWRIGHT_MODULE` to its absolute `index.mjs` path and, if needed, `BROWSER_EXE` to a Chromium/Edge executable. With the app running, execute `node scripts/browser-audit.mjs` from `react-app`. `AUDIT_URL` selects a preview server; optional track or module IDs restrict the run. Browser checks cover loading, revealed explanations, slider boundaries, titles, guides, math rendering and page overflow. They do not prove every scientific claim or every interaction correct.

## Git identity

All commits must use `jeevchiran <20599576+jeevchiran@users.noreply.github.com>`.
Repo-level configuration is set; do not override global configuration.
