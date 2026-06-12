# Learning Modules

Interactive, self-paced courses for data science and engineering students. No build step -- open `index.html` in any browser.

## Repository Structure

```
learnings-ai-ml\
  index.html                         <- Master landing page (links to both tracks)
  README.md                          <- This file
  etl-pyspark/                       <- PySpark/ETL course track
    index.html                       <- Track landing page
    assets/
      style.css                      <- Shared CSS (dark mode, code blocks, tabs, quizzes)
      main.js                        <- Theme toggle, code runner, checkpoint logic
      pyodide-loader.js              <- In-browser Python execution (Pandas live blocks)
    data/
      students.csv                   <- 50 student records
      enrollments.csv                <- 100 course enrollment records
      grades_messy.csv               <- Dirty data for cleaning exercises
    modules/                         <- 10 HTML modules (01- through 10-)
    notebooks/                       <- 10 Jupyter notebooks (companion labs)
  Regression/                        <- Regression (Linear + Logistic) course track
    index.html                       <- Track landing page
    css/
      style.css                      <- Track CSS (centered layout, widgets, derivations, dark mode)
    js/
      common.js                      <- Shared utilities (OLS, sigmoid, data generators, linspace, etc.)
    modules/                         <- 4 HTML modules (01- through 04-)
    notebooks/                       <- 2 Jupyter notebooks (labs)
```

## Design Conventions

When editing or adding to these modules, follow these patterns:

### Shared Patterns (both tracks)

- **No build step.** All HTML is standalone, references CDN scripts and local CSS/JS.
- **No emojis** anywhere in content or code.
- **Academic tone.** Written for university students / working professionals.
- **Dark mode support.** CSS uses `var(--bg)`, `var(--text)`, etc. with `[data-theme="dark"]` overrides.
- **Module navigation.** Each module links to previous/next and back to track index.

### PySpark Track (`etl-pyspark/`)

- **CSS:** `assets/style.css`. Layout uses `.container` (max-width 780px, centered).
- **Code blocks:** `.code-block.live` (green border, runs via Pyodide) and `.code-block.simulated` (blue border, shows pre-defined output on "Run" click).
- **Checkpoints:** `.checkpoint` divs with radio buttons and `.feedback` reveal on answer.
- **Tabs:** `.tab-buttons` > `.tab-btn` + `.tab-content` (used in Module 4 for PySpark vs Pandas).
- **Module file naming:** `modules/NN-topic-slug.html`, notebooks `notebooks/NN-topic-slug.ipynb`.
- **Data:** All modules use the shared student/enrollment dataset in `data/`.

### Regression Track (`Regression/`)

- **CSS:** `css/style.css`. Layout uses `.container` (max-width 820px, centered). No sidebar.
- **Navigation bar:** `.module-nav-bar` at top of each module (horizontal links, `.active` for current).
- **Math rendering:** KaTeX via CDN. Inline: `<span class="math-latex">...</span>`. Display: `<span class="math-latex math-block">...</span>` inside a `<div class="math-block">`.
- **Interactive widgets:** Plotly.js via CDN. Structure: `.widget-container` > `.widget-controls` (sliders, buttons, selects) + `.plot-area` div. JS in `<script>` at bottom of file, wrapped in IIFE `(function() { ... })();`.
- **Derivation steps:** `.derivation` > `.derivation-step` > `.step-number` (circle) + `.step-content` (math + `.step-explanation`).
- **Concept boxes:** `.concept-box` > `h4` (uppercase label) + `p` content.
- **Bridge sections:** `.bridge` div at top of each module connecting to the previous module.
- **Assumption/card grids:** `.assumptions-grid` > `.assumption-card` (2-column grid).
- **Tabs (Why/What/How):** `.tabs` > `.tab[data-tab="id"]` + `#id.tab-content`. JS in `common.js` handles switching.
- **Practice problems:** `<details><summary>Problem N (Difficulty): title</summary>` with nested `<details>` for solutions.
- **Confusion matrix:** Custom HTML grid with dynamic HSL coloring (green for correct cells, red for errors). Updated via JS DOM manipulation, not Plotly.
- **Utility functions available in `common.js`:** `linspace`, `mean`, `simpleOLS`, `predict`, `rSquared`, `mse`, `sigmoid`, `randn`, `generateRegressionData`, `generateClassificationData`.
- **Module file naming:** `modules/0N-topic-slug.html`, notebooks `notebooks/0N_topic_slug_lab.ipynb`.

## Module Content Map

### PySpark Track (10 modules)

| # | File | Topics |
|---|------|--------|
| 1 | 01-etl-pyspark | Extract/Transform/Load pipeline, SparkSession, CSV/JSON reading |
| 2 | 02-in-memory-processing | Disk vs memory, lazy evaluation, DAG execution |
| 3 | 03-spark-rdds | RDD API, map/filter/reduce, partitioning |
| 4 | 04-dataframes-pyspark-vs-pandas | Side-by-side API comparison, schema, column operations |
| 5 | 05-pyspark-sql | Temp views, SQL queries, joins in SQL |
| 6 | 06-udfs-pyspark | Scalar UDFs, pandas UDFs, performance |
| 7 | 07-data-cleaning | Nulls, duplicates, type casting, validation |
| 8 | 08-data-exploration | Summary stats, profiling, distributions |
| 9 | 09-transformation-operations | Joins, pivots, window functions, aggregations |
| 10 | 10-caching-broadcasting | .cache(), .persist(), broadcast joins, storage levels |

### Regression Track (4 modules + 2 labs)

| # | File | Topics | Widgets |
|---|------|--------|---------|
| 1 | 01-linear-regression | OLS, assumptions, coefficients, evaluation, residual analysis, house prices, fuel efficiency | Draggable regression line, assumption diagnostics, 4-panel residual diagnostics |
| 2 | 02-math-linear-regression | Cost function, normal equation derivation, gradient descent, Gauss-Markov, advertising optimization | 3D projection, GD contour+surface animator |
| 3 | 03-logistic-regression | Sigmoid, log-odds/logits, binary/multiclass, classification metrics (accuracy/precision/recall/F1), regularization (L1/L2), ROC, residual analysis for logistic | Sigmoid explorer, log-odds converter, decision boundary, multiclass regions, regularization paths, ROC curve, metrics explorer with confusion matrix, logistic residual diagnostics |
| 4 | 04-math-logistic-regression | MLE derivation, cross-entropy vs MSE, gradient, Newton/IRLS, Bayesian regularization, softmax, GLM unification | MSE vs CE surfaces, MLE optimizer, Newton vs GD race |
| Lab 1 | 01_linear_regression_lab.ipynb | OLS from scratch, GD implementation, Ames Housing, residual diagnostics |
| Lab 2 | 02_logistic_regression_lab.ipynb | Logistic from scratch, customer churn, MNIST digits, regularization tuning |

## How to Add a New Module

1. Create `modules/NN-topic-slug.html` in the appropriate track directory.
2. Copy the `<head>` section (CDN links, CSS reference) from an existing module.
3. Use the `.container` > `nav.module-nav-bar` > `<main>` structure (Regression) or `.container` > `header` > sections (PySpark).
4. Add a `.bridge` section at the top connecting to the previous module.
5. Add navigation links in all existing modules' nav bars to include the new module.
6. Update the track's `index.html` module list.
7. Update the master `index.html` if the module is significant.
8. For interactive widgets: add Plotly/JS in an IIFE at the bottom `<script>` block.

## How to Run

Open `index.html` (master) or any track/module HTML directly in a browser. No server needed.

For Jupyter notebooks:
- **Google Colab:** Upload notebook + data files, install dependencies in first cell.
- **Local:** Python 3.8+, `pip install numpy pandas matplotlib scipy scikit-learn jupyter` (Regression labs) or `pip install pyspark jupyter` (PySpark labs).
