# Pandas EDA & Visualization Learning Track — Design Spec
_Date: 2026-06-16_

## Overview

A 9-module interactive HTML learning track on pandas-based exploratory data analysis: cleaning, missing values, outliers, datetime feature engineering, and univariate/bivariate/multivariate visualization. Derived from `EDA_NYC_Taxi_Analysis_Chiranjeev_Kumar.ipynb`. Follows the existing project conventions (nlp, clustering, decision-trees, hypothesis-testing tracks). Target audience: students / academics. Each module answers What / Why / How for its topic and builds on the previous module.

## Decisions Made

| Decision | Choice |
|---|---|
| Module count | 9 |
| Scope | Technique-focused (pandas/EDA skills), not taxi business-analysis sections |
| Widget engine | JS-simulated (no Pyodide) — matches nlp/clustering/decision-trees/hypothesis-testing, not etl-pyspark |
| Running example | Single shared embedded taxi-trip sample dataset (~30 rows), reused across all modules |
| End-of-module assessment | 2–3 practice problems (Easy/Medium/Hard, show/hide) + 4–5 MCQ with immediate feedback |
| Track name/folder | `pandas-eda/` |

## Shared Dataset

A single JS array `TAXI_SAMPLE_DATA` (~30 rows) lives in `js/common.js` and is reused by every module's widgets, giving the track a consistent running example instead of ad-hoc data per module. Columns: `pickup_datetime`, `dropoff_datetime`, `trip_distance`, `fare_amount`, `tip_amount`, `total_amount`, `passenger_count`, `payment_type`, `RatecodeID`, `airport_fee`, `PULocationID`, `DOLocationID`.

Seeded data-quality issues (so modules 2–4 have real problems to demonstrate against):
- A few negative `fare_amount` / `tip_amount` values
- A few rows with `trip_distance == 0` but nonzero fare
- Missing `RatecodeID` and/or `airport_fee` on some rows
- One or two extreme outliers in `fare_amount` / `trip_distance`
- Spread across different hours/days of week (for groupby variety in modules 7–8)

Modules 1–8 each recompute their view independently from the raw array (no shared mutable state across modules — avoids order-dependency bugs if a user jumps straight to module 6). Module 9 (capstone) is the one place that chains all the steps in sequence over the same array, showing the dataset's shape/quality metrics change at each stage.

## File Structure

```
pandas-eda/
  index.html                                # Track home
  css/
    style.css                               # Fork of nlp CSS + pandas/table-specific additions
  js/
    common.js                               # Fork of nlp common.js + TAXI_SAMPLE_DATA + helpers
  modules/
    01-eda-foundations.html
    02-missing-values.html
    03-data-quality-invalid-values.html
    04-outlier-detection-iqr.html
    05-datetime-feature-engineering.html
    06-univariate-visualization.html
    07-bivariate-analysis.html
    08-multivariate-analysis.html
    09-capstone-eda-workflow.html
```

## 9-Module Breakdown

| # | Title | Why (motivation) | What (concept) | How (technique) | Widget |
|---|---|---|---|---|---|
| 1 | EDA Foundations & First Look | Can't clean what you don't understand | Shape, dtypes, missing audit | `.head()`, `.info()`, `.describe()`, `.shape` | Dataset Inspector — buttons render each view of `TAXI_SAMPLE_DATA` |
| 2 | Missing Values | Nulls break stats/ML silently | Missing ratio, dropna vs fillna tradeoffs | `.isna().sum()`, `.fillna(mean/mode)`, `.dropna()` | Missing-value grid + fillna strategy picker, before/after counts |
| 3 | Data Quality & Invalid Values | Real-world data violates business rules | Negative/zero-value detection, domain constraints | Boolean masks, `.value_counts()` | Rule-checklist toggles — live row-count shrink as filters apply |
| 4 | Outlier Detection & Treatment (IQR) | Outliers skew mean/std and plots | IQR/Tukey fences, z-score alternative | `Q1`/`Q3` quantiles, IQR bounds, cap vs remove | IQR multiplier (k) slider recomputing bounds + boxplot highlight |
| 5 | Datetime Parsing & Feature Engineering | Raw timestamps are useless directly | dt accessor, derived features | `pd.to_datetime()`, `.dt.hour/.dayofweek`, duration calc | Live decomposer — edit pickup/dropoff, derived columns populate |
| 6 | Univariate Visualization | Understand one variable before relationships | Histogram/boxplot/KDE, skewness | Bin selection, log-scale for skewed money/distance vars | Variable + bin-count picker → live Plotly histogram/boxplot |
| 7 | Bivariate Analysis | Business questions are about relationships | Scatter, grouped bar, two-variable groupby | `sns.scatterplot`, `.groupby().agg()` | X/Y picker → scatter + live correlation; category picker → grouped bar |
| 8 | Multivariate Analysis | Real effects are usually jointly driven | Correlation matrix, pivot tables, multi-level groupby | `.corr()`, `.pivot_table()`, seaborn heatmap | Live correlation heatmap (Plotly) + pivot-table builder (row/col/agg picker) |
| 9 | Capstone: End-to-End EDA Workflow | Real EDA chains every step into a repeatable pipeline | Recap: load → clean → engineer → visualize → insight | Re-walks the shared dataset start to finish | Step-through pipeline runner — shape/quality metric shown at each stage |

## Per-Module HTML Structure

Each module follows this template (matching existing tracks):

```
1. <nav class="module-nav-bar">  — links to all 9 modules + track home
2. <header>                      — module title + dark mode toggle
3. [Why this topic?]             — motivation bridge from previous module
4. [What is it?]                 — concept-box definitions
5. [How does it work?]           — derivation/derivation-step walkthroughs, callouts
6. [Interactive widget]          — .widget-container with controls, operates on TAXI_SAMPLE_DATA
7. [pandas code snippet]         — .code-snippet with realistic pre-computed output
8. [Practice problems]           — .practice with difficulty badge + show/hide solution
9. [MCQ quiz]                    — .quiz-block with click-to-reveal feedback
10. <div class="bridge">         — why the next module follows from this one
11. <div class="nav-buttons">    — prev / next module links
```

## CSS Additions (beyond nlp baseline fork)

- `.data-table` — pandas-DataFrame-style rendered table (header row, index column, monospace)
- `.missing-cell` — highlight style for null/NaN cells in a rendered table
- `.outlier-point` — highlight style for flagged outlier rows/points
- `.pipeline-step` — capstone stepper UI (active/complete/pending states)

## JS Utilities to Add to common.js

- `TAXI_SAMPLE_DATA` — the shared ~30-row dataset array
- `renderDataFrameTable(rows, cols)` — renders a pandas-like HTML table from an array of row objects
- `computeMissingRatio(data, cols)` — % missing per column
- `applyFillna(data, col, strategy)` — returns a new array with a fillna strategy applied (mean/mode/constant)
- `filterInvalid(data, rules)` — returns row counts before/after applying validity rules (negative/zero checks)
- `computeIQRBounds(data, col, k)` — returns Q1, Q3, IQR, lower/upper bounds, and flagged outlier rows
- `decomposeDatetime(pickupStr, dropoffStr)` — returns hour, day-of-week, duration-minutes
- `computeHistogramBins(data, col, binCount)` — bucket counts for live histogram
- `computeCorrelationMatrix(data, cols)` — Pearson correlation matrix
- `buildPivotTable(data, rowField, colField, valueField, agg)` — pivot table aggregation
- `initQuiz(blockEl)` — reused from nlp common.js (MCQ click-to-reveal)

## Dependencies (CDN, same as existing tracks)

- KaTeX 0.16.9
- Plotly.js 2.27.0

## Continuity Narrative

Each module ends with a `.bridge` callout answering: _"Why does the next topic follow from this one?"_ — e.g. Module 2 (missing values) bridges into Module 3 (invalid values) as "nulls are one kind of bad data; out-of-range values are another." All widgets reference the same `TAXI_SAMPLE_DATA` rows so a reader recognizes the same trips reappearing module to module, culminating in the Module 9 capstone that runs the full pipeline over that same data.

## Math Coverage (KaTeX)

| Module | Key Formulas |
|---|---|
| 2 | Missing ratio: `missing% = (n_null / n_total) × 100` |
| 4 | IQR bounds: `[Q1 - k·IQR, Q3 + k·IQR]`, `IQR = Q3 - Q1`; z-score: `z = (x - μ) / σ` |
| 8 | Pearson correlation: `r = Σ(x-x̄)(y-ȳ) / √(Σ(x-x̄)²·Σ(y-ȳ)²)` |
