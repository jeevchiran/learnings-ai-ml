# Learning Modules

Interactive, self-paced courses for data science students. Built as a React 18 + Vite 5 SPA with MDX content and Plotly.js widgets.

**Live app:** `https://jeevchiran.github.io/learnings-ai-ml/`

---

## Tech Stack

| Layer | Tech |
|---|---|
| UI framework | React 18 + React Router |
| Build tool | Vite 5 |
| Content format | MDX (`@mdx-js/rollup`) |
| Math rendering | KaTeX (`remark-math` + `rehype-katex`) |
| Tables/GFM | `remark-gfm` — **required**, MDX doesn't parse tables without it |
| Interactive charts | `plotly.js-dist-min` (imperative `Plotly.react` + `useRef`) |
| Animations | `framer-motion` |
| Code highlighting | `react-syntax-highlighter` |
| Tests | Vitest + jsdom |

---

## Repository Structure

```
learnings-ai-ml/
  react-app/                        <- The SPA (Vite project root)
    package.json
    vite.config.js                  <- MDX + remark-gfm + remark-math + rehype-katex wired here
    src/
      App.jsx                       <- Router: / → Dashboard, /course/:id/:moduleId → ModuleViewer
      data/
        courses.js                  <- Single source of truth: course metadata, module lists, ordering
      content/                      <- MDX files, one folder per course
        pandas-eda/                 <- eda-m1.mdx … eda-m9.mdx
        hypothesis-testing/         <- ht-m1.mdx … ht-m5.mdx
        etl-pyspark/                <- etl-pyspark-m1.mdx … etl-pyspark-m10.mdx
        regression/                 <- regression-m1.mdx … regression-m4.mdx
        decision-trees/             <- dt-m1.mdx … dt-m7.mdx
        clustering/                 <- clustering-m1.mdx … clustering-m4.mdx
        nlp/                        <- nlp-m1.mdx … nlp-m10.mdx
      components/
        learning/                   <- Shared MDX component primitives
          Bridge.jsx                    <- Context-setter at top of each module
          ConceptBox.jsx                <- Highlight box (title + body)
          DerivationSteps.jsx           <- Numbered derivation step list
          DerivationStep.jsx
          MathBlock.jsx                 <- Display-mode KaTeX block
          CodeBlock.jsx                 <- Syntax-highlighted code
          QuizCard.jsx                  <- Multiple-choice quiz
          index.js                      <- Re-exports all of the above
        widgets/                    <- Interactive Plotly widgets (one folder per course)
          utils.js                      <- Shared math: linspace, mean, simpleOLS, predict,
                                           mse, rSquared, sigmoid, randn, normalPDF, normalCDF,
                                           approximateNormalQuantile, generateRegressionData,
                                           generateClassificationData, plotlyLayout, PLOTLY_CONFIG
          regression/
            RegressionLineWidget.jsx    <- Slope/intercept sliders, OLS animation, MSE/R²
            AssumptionWidget.jsx        <- 4 violation scenarios, scatter + residual plots
            ResidualDiagnosticsWidget.jsx <- 4-panel diagnostic grid
            ProjectionWidget.jsx        <- 3D OLS geometry (y, ŷ, residual vectors)
            GradientDescentWidget.jsx   <- Contour + 3D surface, step/run/reset
            SigmoidROCWidget.jsx        <- Weight/bias/threshold + ROC + score distributions
            LossLandscapeWidget.jsx     <- MSE vs cross-entropy 3D surfaces
            MLEWidget.jsx               <- MLE gradient ascent, log-likelihood contour
            NewtonWidget.jsx            <- Newton vs gradient descent convergence
          hypothesis-testing/
            RejectionRegionWidget.jsx
            ErrorRegionWidget.jsx       <- Type I/II error shading, α/δ sliders
            PValueWidget.jsx
            CriticalValueWidget.jsx
            ZTestSimulatorWidget.jsx
            PowerCurveWidget.jsx
            TwoDistributionWidget.jsx
            PairedDifferenceWidget.jsx
            PairedVsIndependentWidget.jsx
          clustering/
            KMeansWidget.jsx            <- Step-by-step K-means, K-means++ init
            DistanceCentroidWidget.jsx  <- Distance metric explorer, scaling demo
            WCSSElbowWidget.jsx         <- WCSS/elbow, TSS decomposition
            SilhouetteWidget.jsx        <- Silhouette + multi-metric comparison
            clusteringUtils.js          <- euclidean, centroid, assignClusters, wcss, silhouette, generateBlobs
          decision-trees/
            DecisionBoundaryWidget.jsx  <- CART tree with depth slider + heatmap
            ImpurityWidget.jsx          <- Gini/entropy/misclassification curves + IG calculator
            GiniSplitWidget.jsx         <- Threshold search, Gini gain landscape
            PruningWidget.jsx           <- Bias-variance vs depth, MSE curve
            BaggingRandomForestWidget.jsx <- Bootstrap demo, variance reduction, feature importance
            GradientBoostingWidget.jsx  <- Pseudo-residuals step-through, LR comparison
            HyperparameterWidget.jsx    <- RF/GB tuner, heatmap, early stopping
          nlp/
            LevenshteinWidget.jsx       <- DP table with step-through + backtrace
            NoisyChannelWidget.jsx      <- Noisy channel spell correction walk-through
            POSTaggerWidget.jsx         <- Color-coded POS tagging + NP chunking
            ParseTreeWidget.jsx         <- Recursive SVG parse tree + ambiguity toggle
            WordNetWidget.jsx           <- WordNet hierarchy + Lesk algorithm
            PPMIWidget.jsx              <- Co-occurrence → PPMI heatmap, cosine similarity
            NERWidget.jsx               <- NER/IOB, CRF Viterbi lattice, coreference chains
        Dashboard.jsx               <- Course grid landing page
        Sidebar.jsx                 <- Module list nav
        ModuleViewer.jsx            <- Renders MDX, wraps with MDXProvider
        MDXRenderer.jsx             <- Dynamic import of MDX files, error boundary
        SearchBar.jsx
  etl-pyspark/                      <- Legacy static HTML track (still accessible via vite middleware)
  Regression/                       <- Legacy static HTML track
  notebooks/                        <- Jupyter lab notebooks
```

---

## Courses

Course order is set in `react-app/src/data/courses.js`. The array order controls display order.

| Order | ID | Title | Modules | Widgets |
|---|---|---|---|---|
| 1 | `pandas-eda` | Pandas EDA and Visualization | 9 | none (text + code) |
| 2 | `hypothesis-testing` | Hypothesis Testing | 5 | 9 |
| 3 | `etl-pyspark` | PySpark and ETL | 10 | none |
| 4 | `regression` | Regression: Linear and Logistic | 4 | 9 |
| 5 | `decision-trees` | Decision Trees and Ensembles | 7 | 7 |
| 6 | `clustering` | K-Means Clustering | 4 | 4 |
| 7 | `nlp` | Natural Language Processing | 10 | 7 |

### Regression modules

| ID | Title | Widgets |
|---|---|---|
| `regression-m1` | Linear Regression | RegressionLineWidget, AssumptionWidget, ResidualDiagnosticsWidget |
| `regression-m2` | Mathematics of Linear Regression | ProjectionWidget, GradientDescentWidget |
| `regression-m3` | Logistic Regression | SigmoidROCWidget |
| `regression-m4` | Mathematics of Logistic Regression | LossLandscapeWidget, MLEWidget, NewtonWidget |

### Decision-Trees modules

| ID | Title | Widget |
|---|---|---|
| `dt-m1` | Intuition and Structure | DecisionBoundaryWidget |
| `dt-m2` | Impurity Measures | ImpurityWidget |
| `dt-m3` | Gini Index Splits | GiniSplitWidget |
| `dt-m4` | Pruning | PruningWidget |
| `dt-m5` | Bagging and Random Forests | BaggingRandomForestWidget |
| `dt-m6` | Gradient Boosting | GradientBoostingWidget |
| `dt-m7` | Hyperparameter Tuning | HyperparameterWidget |

---

## How to Run

```bash
cd react-app
npm install
npm run dev       # http://localhost:5173/learnings-ai-ml/
npm run build     # outputs to react-app/dist/
npm run preview   # serve the dist build locally
npm test          # vitest
```

The `base` is `/learnings-ai-ml/` (set in `vite.config.js`) — required for GitHub Pages deployment.

---

## Adding a New Module

1. **Create the MDX file** in `react-app/src/content/<course-id>/<module-id>.mdx`
2. **Add imports** at the top of the MDX file for any learning primitives or widgets:
   ```mdx
   import { Bridge, ConceptBox, DerivationSteps, DerivationStep, QuizCard } from '../../components/learning/index.js'
   import MyWidget from '../../components/widgets/<course-id>/MyWidget.jsx'
   ```
3. **Register in `courses.js`** — add an entry to the correct course's `modules` array:
   ```js
   { id: 'course-mN', title: 'Module Title', file: 'unused.html', description: '...', readTime: 15 }
   ```
4. **MDX file is auto-imported** by `MDXRenderer.jsx` via dynamic `import()` keyed on module ID.

The `file` field in `courses.js` is a legacy field from the static HTML era — it is not used by the React app.

---

## Adding a New Widget

1. Create `react-app/src/components/widgets/<course-id>/MyWidget.jsx`
2. Pattern:
   ```jsx
   import { useEffect, useRef, useState } from 'react'
   import Plotly from 'plotly.js-dist-min'
   import { linspace, sigmoid } from '../utils.js'   // path is always ../utils.js

   const CFG = { responsive: true, displayModeBar: false }
   const BG = { paper_bgcolor: 'transparent', plot_bgcolor: 'transparent' }

   export default function MyWidget() {
     const plotRef = useRef(null)
     const [val, setVal] = useState(1)

     function draw(v) {
       Plotly.react(plotRef.current, [/* traces */], { ...BG, /* layout */ }, CFG)
     }

     useEffect(() => { draw(val) }, [])  // eslint-disable-line

     return (
       <div>
         <input type="range" value={val} onChange={e => { setVal(+e.target.value); draw(+e.target.value) }} />
         <div ref={plotRef} style={{ minHeight: 300 }} />
       </div>
     )
   }
   ```
3. Import and use in the MDX file.

Key rules:
- Always `paper_bgcolor: 'transparent'` so plot background matches the page theme.
- Use `Plotly.react()` (not `newPlot`) for updates — it diffs and avoids full re-renders.
- Store mutable state that animation intervals close over in a `useRef`, not `useState`.
- Module-level random data (`const DATA = genData()`) is stable across re-renders.

---

## MDX Gotchas

**Bare `{identifier}` in prose** compiles as a JSX expression → `ReferenceError` at runtime.
```mdx
Bad:  The set {x, y, z} has three elements.
Good: The set (x, y, z) has three elements.
```

**Lone `$dollar` before inline math on the same line** causes `remark-math` to mis-pair delimiters:
```mdx
Bad:  With $100K budget, allocate to $0.045 \cdot \text{TV}$
Good: With a 100K budget, allocate to $0.045 \cdot \text{TV}$
```

**Tables require `remark-gfm`** — MDX does not parse GFM pipe tables without it. Already configured in `vite.config.js`.

---

## Key Files Reference

| File | Purpose |
|---|---|
| `react-app/src/data/courses.js` | Course/module registry — edit here to add/reorder courses |
| `react-app/src/components/widgets/utils.js` | Shared math utilities for all widgets |
| `react-app/vite.config.js` | MDX plugin config — remark/rehype plugins go here |
| `react-app/src/components/MDXRenderer.jsx` | Dynamic MDX import + error boundary |
| `react-app/src/components/ModuleViewer.jsx` | MDXProvider wiring — add new MDX component mappings here |

---

## Git Identity

All commits must use `jeevchiran <20599576+jeevchiran@users.noreply.github.com>`.
Repo-level config is set; do not override with global config.
