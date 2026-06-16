# Pandas EDA & Visualization Track Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 9-module interactive HTML learning track on pandas EDA (cleaning, missing values, outliers, datetime features, univariate/bivariate/multivariate visualization), using one shared 30-row taxi-trip sample dataset across all modules for continuity.

**Architecture:** Vanilla HTML/CSS/JS, no build step, forked from the existing `nlp/` track (same nav/quiz/practice/theme/widget conventions). Widgets are JS-simulated (no Pyodide) — pure helper functions compute live from an embedded `TAXI_SAMPLE_DATA` array.

**Tech Stack:** HTML5, CSS3, vanilla JS, KaTeX 0.16.9 (CDN), Plotly.js 2.27.0 (CDN)

**Spec:** `docs/superpowers/specs/2026-06-16-pandas-eda-track-design.md`

---

## Shared Dataset (used by every task below)

This exact 30-row array goes into `pandas-eda/js/common.js` in Task 2. Recorded here once so every later task can reference row IDs without repeating the array.

```javascript
const TAXI_SAMPLE_DATA = [
  {id:1, pickup:"2023-03-06T08:15:00", dropoff:"2023-03-06T08:32:00", passenger_count:1, trip_distance:2.1, RatecodeID:1, payment_type:"card", fare_amount:9.50, tip_amount:1.90, total_amount:11.40, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:2, pickup:"2023-03-06T08:42:00", dropoff:"2023-03-06T08:55:00", passenger_count:1, trip_distance:1.4, RatecodeID:1, payment_type:"cash", fare_amount:7.00, tip_amount:0.00, total_amount:7.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:3, pickup:"2023-03-06T09:05:00", dropoff:"2023-03-06T09:30:00", passenger_count:2, trip_distance:4.8, RatecodeID:1, payment_type:"card", fare_amount:17.50, tip_amount:3.50, total_amount:21.00, airport_fee:0, PUBorough:"Brooklyn", DOBorough:"Manhattan"},
  {id:4, pickup:"2023-03-06T09:50:00", dropoff:"2023-03-06T10:10:00", passenger_count:1, trip_distance:3.2, RatecodeID:1, payment_type:"card", fare_amount:12.50, tip_amount:2.50, total_amount:15.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Queens"},
  {id:5, pickup:"2023-03-06T10:20:00", dropoff:"2023-03-06T10:24:00", passenger_count:1, trip_distance:0.0, RatecodeID:1, payment_type:"cash", fare_amount:4.50, tip_amount:0.00, total_amount:4.50, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:6, pickup:"2023-03-06T11:00:00", dropoff:"2023-03-06T11:35:00", passenger_count:1, trip_distance:9.6, RatecodeID:2, payment_type:"card", fare_amount:45.00, tip_amount:9.00, total_amount:55.25, airport_fee:1.25, PUBorough:"Manhattan", DOBorough:"EWR"},
  {id:7, pickup:"2023-03-06T11:50:00", dropoff:"2023-03-06T12:05:00", passenger_count:3, trip_distance:2.9, RatecodeID:1, payment_type:"card", fare_amount:-12.50, tip_amount:0.00, total_amount:-12.50, airport_fee:0, PUBorough:"Brooklyn", DOBorough:"Brooklyn"},
  {id:8, pickup:"2023-03-06T12:15:00", dropoff:"2023-03-06T12:40:00", passenger_count:1, trip_distance:5.5, RatecodeID:1, payment_type:"cash", fare_amount:19.50, tip_amount:0.00, total_amount:19.50, airport_fee:0, PUBorough:"Queens", DOBorough:"Manhattan"},
  {id:9, pickup:"2023-03-06T13:00:00", dropoff:"2023-03-06T13:08:00", passenger_count:null, trip_distance:1.1, RatecodeID:1, payment_type:"card", fare_amount:6.50, tip_amount:1.30, total_amount:7.80, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:10, pickup:"2023-03-06T13:30:00", dropoff:"2023-03-06T13:50:00", passenger_count:2, trip_distance:3.7, RatecodeID:null, payment_type:"card", fare_amount:14.00, tip_amount:2.80, total_amount:16.80, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Bronx"},
  {id:11, pickup:"2023-03-06T14:10:00", dropoff:"2023-03-06T14:14:00", passenger_count:1, trip_distance:0.0, RatecodeID:1, payment_type:"card", fare_amount:3.00, tip_amount:0.00, total_amount:3.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:12, pickup:"2023-03-06T14:45:00", dropoff:"2023-03-06T15:20:00", passenger_count:4, trip_distance:7.3, RatecodeID:1, payment_type:"cash", fare_amount:25.00, tip_amount:0.00, total_amount:25.00, airport_fee:0, PUBorough:"Brooklyn", DOBorough:"Queens"},
  {id:13, pickup:"2023-03-06T15:40:00", dropoff:"2023-03-06T16:00:00", passenger_count:1, trip_distance:3.0, RatecodeID:1, payment_type:"card", fare_amount:12.00, tip_amount:2.40, total_amount:14.40, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:14, pickup:"2023-03-06T16:20:00", dropoff:"2023-03-06T16:55:00", passenger_count:2, trip_distance:6.1, RatecodeID:1, payment_type:"card", fare_amount:21.50, tip_amount:4.30, total_amount:25.80, airport_fee:null, PUBorough:"Manhattan", DOBorough:"Brooklyn"},
  {id:15, pickup:"2023-03-06T17:05:00", dropoff:"2023-03-06T17:09:00", passenger_count:1, trip_distance:0.5, RatecodeID:1, payment_type:"cash", fare_amount:-4.00, tip_amount:0.00, total_amount:-4.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:16, pickup:"2023-03-06T17:30:00", dropoff:"2023-03-06T18:10:00", passenger_count:1, trip_distance:8.9, RatecodeID:1, payment_type:"card", fare_amount:29.50, tip_amount:5.90, total_amount:35.40, airport_fee:0, PUBorough:"Queens", DOBorough:"Manhattan"},
  {id:17, pickup:"2023-03-06T18:25:00", dropoff:"2023-03-06T18:31:00", passenger_count:1, trip_distance:1.0, RatecodeID:1, payment_type:"card", fare_amount:6.00, tip_amount:1.20, total_amount:7.20, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:18, pickup:"2023-03-06T19:00:00", dropoff:"2023-03-06T19:45:00", passenger_count:2, trip_distance:11.2, RatecodeID:2, payment_type:"card", fare_amount:52.00, tip_amount:10.00, total_amount:63.25, airport_fee:1.25, PUBorough:"Manhattan", DOBorough:"EWR"},
  {id:19, pickup:"2023-03-06T20:00:00", dropoff:"2023-03-06T20:09:00", passenger_count:1, trip_distance:1.6, RatecodeID:1, payment_type:"cash", fare_amount:8.00, tip_amount:0.00, total_amount:8.00, airport_fee:0, PUBorough:"Brooklyn", DOBorough:"Brooklyn"},
  {id:20, pickup:"2023-03-06T20:30:00", dropoff:"2023-03-06T20:33:00", passenger_count:1, trip_distance:0.0, RatecodeID:1, payment_type:"card", fare_amount:3.50, tip_amount:0.50, total_amount:4.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:21, pickup:"2023-03-07T07:50:00", dropoff:"2023-03-07T08:05:00", passenger_count:1, trip_distance:2.4, RatecodeID:1, payment_type:"card", fare_amount:10.00, tip_amount:2.00, total_amount:12.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:22, pickup:"2023-03-07T08:20:00", dropoff:"2023-03-07T08:50:00", passenger_count:3, trip_distance:5.0, RatecodeID:1, payment_type:"cash", fare_amount:18.00, tip_amount:0.00, total_amount:18.00, airport_fee:0, PUBorough:"Bronx", DOBorough:"Manhattan"},
  {id:23, pickup:"2023-03-07T09:10:00", dropoff:"2023-03-07T09:25:00", passenger_count:1, trip_distance:2.8, RatecodeID:null, payment_type:"card", fare_amount:11.50, tip_amount:2.30, total_amount:13.80, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Queens"},
  {id:24, pickup:"2023-03-07T09:45:00", dropoff:"2023-03-07T10:30:00", passenger_count:2, trip_distance:120.0, RatecodeID:1, payment_type:"card", fare_amount:8.00, tip_amount:1.00, total_amount:9.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:25, pickup:"2023-03-07T10:50:00", dropoff:"2023-03-07T10:54:00", passenger_count:null, trip_distance:0.8, RatecodeID:1, payment_type:"card", fare_amount:5.50, tip_amount:1.10, total_amount:6.60, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:26, pickup:"2023-03-07T11:15:00", dropoff:"2023-03-07T11:50:00", passenger_count:1, trip_distance:6.7, RatecodeID:1, payment_type:"card", fare_amount:399.00, tip_amount:0.00, total_amount:399.00, airport_fee:0, PUBorough:"Staten Island", DOBorough:"Manhattan"},
  {id:27, pickup:"2023-03-07T12:10:00", dropoff:"2023-03-07T12:35:00", passenger_count:1, trip_distance:4.3, RatecodeID:1, payment_type:"cash", fare_amount:16.00, tip_amount:0.00, total_amount:16.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Brooklyn"},
  {id:28, pickup:"2023-03-07T13:00:00", dropoff:"2023-03-07T13:18:00", passenger_count:2, trip_distance:3.5, RatecodeID:1, payment_type:"card", fare_amount:13.50, tip_amount:2.70, total_amount:16.20, airport_fee:null, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:29, pickup:"2023-03-07T13:40:00", dropoff:"2023-03-07T14:10:00", passenger_count:1, trip_distance:5.9, RatecodeID:1, payment_type:"card", fare_amount:20.50, tip_amount:4.10, total_amount:24.60, airport_fee:0, PUBorough:"Queens", DOBorough:"Brooklyn"},
  {id:30, pickup:"2023-03-07T14:30:00", dropoff:"2023-03-07T14:34:00", passenger_count:1, trip_distance:0.0, RatecodeID:1, payment_type:"card", fare_amount:3.00, tip_amount:0.00, total_amount:3.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"}
];
```

**Pre-verified facts about this dataset** (computed and checked with a scratch Node script during planning — every module below relies on these exact numbers, do not recompute differently):

- Missing values: `passenger_count` (ids 9, 25), `RatecodeID` (ids 10, 23), `airport_fee` (ids 14, 28) — each 2/30 = 6.67%.
- Negative `fare_amount`: ids 7 (-12.50), 15 (-4.00).
- Zero `trip_distance` with nonzero fare: ids 5, 11, 20, 30.
- `fare_amount` IQR (k=1.5): Q1=6.125, Q3=19.125, IQR=13, bounds=[-13.375, 38.625]. Outliers: ids 6 (45.00), 18 (52.00), 26 (399.00).
- `trip_distance` IQR (k=1.5): Q1=1.175, Q3=5.8, IQR=4.625, bounds=[-5.7625, 12.7375]. Outlier: id 24 (120.0).
- `fare_amount.describe()`: count 30, mean 26.17, std 71.57, min -12.50, 25%=6.125, 50%=11.75, 75%=19.125, max 399.00.
- Correlation, all 30 rows: fare vs distance 0.001, fare vs tip 0.007, fare vs total 0.999, distance vs total 0.003, passenger_count vs tip -0.030.
- Correlation, filtered to `RatecodeID==1 & 0<fare_amount<100 & 0<trip_distance<50` (18 rows: excludes 5,6,7,10,11,15,18,20,23,24,26,30): fare vs distance = **1.000**.
- `passenger_count` non-null values: mode = 1 (19 of 28 rows), mean = 1.46 (41/28).
- `RatecodeID` non-null values: mode = 1 (26 of 28 rows).
- `airport_fee` non-null values: mode = 0 (26 of 28 rows).
- Groupby `PUBorough` mean `fare_amount`: Manhattan (21 rows, 12.40), Brooklyn (4, 9.50), Queens (3, 23.17), Bronx (1, 18.00), Staten Island (1, 399.00 — the single id-26 outlier).
- Groupby `payment_type` mean `tip_amount`: card (22 rows, 2.66), cash (8 rows, 0.00) — cash tips aren't captured by the meter, a real-world NYC taxi quirk.
- Pivot `index=PUBorough, columns=payment_type, values=fare_amount, agg=mean`: Manhattan {card:13.94, cash:5.88}, Brooklyn {card:2.50, cash:16.50}, Queens {card:25.00, cash:19.50}, Bronx {card:null, cash:18.00}, Staten Island {card:399.00, cash:null}.
- Capstone pipeline (Task 12): fillna (stage1, 30 rows/0% missing) → drop negative-fare + zero-distance rows (stage2, drops ids 5,7,11,15,20,30 → 24 rows) → recompute IQR on the 24-row set for fare (Q1=9.125,Q3=20.75,IQR=11.625,bounds=[-8.3125,38.1875]) and distance (Q1=2.325,Q3=6.25,IQR=3.925,bounds=[-3.5625,12.1375]), drop flagged ids 6,18,24,26 (stage3 → 20 rows) → engineer hour/day_of_week/duration_min (stage4, still 20 rows, +3 cols) → fare-vs-distance correlation on final 20 rows = **1.000**. Note ids 10 and 23 survive the capstone (RatecodeID filled to 1 in stage1) even though Module 7/8's quick ad-hoc filter dropped them for having missing RatecodeID — a deliberate, callable-out difference showing why fixing-then-filtering (the pipeline) keeps more good data than an unfixed one-off filter.

---

## File Structure

```
pandas-eda/
  index.html
  css/style.css
  js/common.js
  js/common.test.js
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

---

## Task 1: CSS — fork nlp stylesheet, add pandas-specific classes

**Files:**
- Create: `pandas-eda/css/style.css` (copy of `nlp/css/style.css` plus additions below)

- [ ] **Step 1: Copy the base stylesheet**

```bash
mkdir -p pandas-eda/css pandas-eda/js pandas-eda/modules
cp nlp/css/style.css pandas-eda/css/style.css
```

- [ ] **Step 2: Append pandas-specific classes to the end of `pandas-eda/css/style.css`**

```css

/* ── Pandas EDA additions ─────────────────────────────────────────────── */

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  margin: 0.75rem 0;
}

.data-table th, .data-table td {
  border: 1px solid var(--border);
  padding: 0.35rem 0.6rem;
  text-align: right;
}

.data-table th {
  background: var(--bg);
  color: var(--text-muted);
  font-weight: 600;
  text-align: center;
}

.data-table td:first-child, .data-table th:first-child {
  text-align: left;
  color: var(--text-muted);
}

.missing-cell {
  color: var(--text-muted);
  font-style: italic;
  background: rgba(220, 38, 38, 0.06);
}

.outlier-point {
  background: rgba(220, 38, 38, 0.12);
  font-weight: 700;
}

.pipeline-step {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.pipeline-step.active {
  border-color: var(--accent-blue);
  background: rgba(37, 99, 235, 0.06);
}

.pipeline-step.complete {
  color: var(--text-muted);
}

.pipeline-step .step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--border);
  font-size: 0.75rem;
  flex-shrink: 0;
}
```

- [ ] **Step 3: Commit**

```bash
git add pandas-eda/css/style.css
git commit -m "feat: add pandas-eda track stylesheet (fork of nlp CSS + data-table/outlier/pipeline classes)"
```

---

## Task 2: Track home page

**Files:**
- Create: `pandas-eda/index.html`

- [ ] **Step 1: Write index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pandas EDA & Visualization</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/common.js"></script>
</head>
<body>
<div class="container">
  <header>
    <h1>Pandas EDA &amp; Visualization</h1>
    <div style="display:flex;gap:0.5rem;align-items:center;">
      <button class="theme-toggle">Dark mode</button>
      <button class="menu-toggle" aria-label="Open navigation menu"><span></span><span></span><span></span></button>
    </div>
  </header>

  <p>9 modules covering pandas-based exploratory data analysis: cleaning, missing values, outliers, datetime feature engineering, and univariate/bivariate/multivariate visualization. One shared 30-row NYC taxi-trip sample threads through every module.</p>

  <ul class="module-list">
    <li><a href="modules/01-eda-foundations.html">Module 1: EDA Foundations &amp; First Look</a>
      <div class="module-desc">shape, dtypes, head/info/describe — what you must know before cleaning anything.</div></li>
    <li><a href="modules/02-missing-values.html">Module 2: Missing Values</a>
      <div class="module-desc">isna ratios, dropna vs fillna, and why mean isn't always the right fill.</div></li>
    <li><a href="modules/03-data-quality-invalid-values.html">Module 3: Data Quality &amp; Invalid Values</a>
      <div class="module-desc">negative fares, zero-distance trips, and boolean-mask business rules.</div></li>
    <li><a href="modules/04-outlier-detection-iqr.html">Module 4: Outlier Detection &amp; Treatment (IQR)</a>
      <div class="module-desc">Tukey fences, cap vs remove, and telling a real error from a flat-rate fare.</div></li>
    <li><a href="modules/05-datetime-feature-engineering.html">Module 5: Datetime Parsing &amp; Feature Engineering</a>
      <div class="module-desc">turning timestamp strings into hour, weekday, and duration features.</div></li>
    <li><a href="modules/06-univariate-visualization.html">Module 6: Univariate Visualization</a>
      <div class="module-desc">histograms, boxplots, and reading skew before comparing variables.</div></li>
    <li><a href="modules/07-bivariate-analysis.html">Module 7: Bivariate Analysis</a>
      <div class="module-desc">scatter plots, groupby, and why a correlation can hide in dirty data.</div></li>
    <li><a href="modules/08-multivariate-analysis.html">Module 8: Multivariate Analysis</a>
      <div class="module-desc">correlation matrices and pivot tables across several variables at once.</div></li>
    <li><a href="modules/09-capstone-eda-workflow.html">Module 9: Capstone — End-to-End EDA Workflow</a>
      <div class="module-desc">chaining every prior step into one repeatable pipeline.</div></li>
  </ul>
</div>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add pandas-eda/index.html
git commit -m "feat: add pandas-eda track home page"
```

---

## Task 3: JS — shared dataset + pandas helper functions (TDD)

**Files:**
- Create: `pandas-eda/js/common.js` (copy of `nlp/js/common.js` plus additions below)
- Create: `pandas-eda/js/common.test.js`

- [ ] **Step 1: Copy the base JS file**

```bash
cp nlp/js/common.js pandas-eda/js/common.js
```

- [ ] **Step 2: Append the dataset and helper functions to the end of `pandas-eda/js/common.js`**

```javascript

// ── Pandas EDA: shared dataset ───────────────────────────────────────────────
const TAXI_SAMPLE_DATA = [
  {id:1, pickup:"2023-03-06T08:15:00", dropoff:"2023-03-06T08:32:00", passenger_count:1, trip_distance:2.1, RatecodeID:1, payment_type:"card", fare_amount:9.50, tip_amount:1.90, total_amount:11.40, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:2, pickup:"2023-03-06T08:42:00", dropoff:"2023-03-06T08:55:00", passenger_count:1, trip_distance:1.4, RatecodeID:1, payment_type:"cash", fare_amount:7.00, tip_amount:0.00, total_amount:7.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:3, pickup:"2023-03-06T09:05:00", dropoff:"2023-03-06T09:30:00", passenger_count:2, trip_distance:4.8, RatecodeID:1, payment_type:"card", fare_amount:17.50, tip_amount:3.50, total_amount:21.00, airport_fee:0, PUBorough:"Brooklyn", DOBorough:"Manhattan"},
  {id:4, pickup:"2023-03-06T09:50:00", dropoff:"2023-03-06T10:10:00", passenger_count:1, trip_distance:3.2, RatecodeID:1, payment_type:"card", fare_amount:12.50, tip_amount:2.50, total_amount:15.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Queens"},
  {id:5, pickup:"2023-03-06T10:20:00", dropoff:"2023-03-06T10:24:00", passenger_count:1, trip_distance:0.0, RatecodeID:1, payment_type:"cash", fare_amount:4.50, tip_amount:0.00, total_amount:4.50, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:6, pickup:"2023-03-06T11:00:00", dropoff:"2023-03-06T11:35:00", passenger_count:1, trip_distance:9.6, RatecodeID:2, payment_type:"card", fare_amount:45.00, tip_amount:9.00, total_amount:55.25, airport_fee:1.25, PUBorough:"Manhattan", DOBorough:"EWR"},
  {id:7, pickup:"2023-03-06T11:50:00", dropoff:"2023-03-06T12:05:00", passenger_count:3, trip_distance:2.9, RatecodeID:1, payment_type:"card", fare_amount:-12.50, tip_amount:0.00, total_amount:-12.50, airport_fee:0, PUBorough:"Brooklyn", DOBorough:"Brooklyn"},
  {id:8, pickup:"2023-03-06T12:15:00", dropoff:"2023-03-06T12:40:00", passenger_count:1, trip_distance:5.5, RatecodeID:1, payment_type:"cash", fare_amount:19.50, tip_amount:0.00, total_amount:19.50, airport_fee:0, PUBorough:"Queens", DOBorough:"Manhattan"},
  {id:9, pickup:"2023-03-06T13:00:00", dropoff:"2023-03-06T13:08:00", passenger_count:null, trip_distance:1.1, RatecodeID:1, payment_type:"card", fare_amount:6.50, tip_amount:1.30, total_amount:7.80, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:10, pickup:"2023-03-06T13:30:00", dropoff:"2023-03-06T13:50:00", passenger_count:2, trip_distance:3.7, RatecodeID:null, payment_type:"card", fare_amount:14.00, tip_amount:2.80, total_amount:16.80, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Bronx"},
  {id:11, pickup:"2023-03-06T14:10:00", dropoff:"2023-03-06T14:14:00", passenger_count:1, trip_distance:0.0, RatecodeID:1, payment_type:"card", fare_amount:3.00, tip_amount:0.00, total_amount:3.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:12, pickup:"2023-03-06T14:45:00", dropoff:"2023-03-06T15:20:00", passenger_count:4, trip_distance:7.3, RatecodeID:1, payment_type:"cash", fare_amount:25.00, tip_amount:0.00, total_amount:25.00, airport_fee:0, PUBorough:"Brooklyn", DOBorough:"Queens"},
  {id:13, pickup:"2023-03-06T15:40:00", dropoff:"2023-03-06T16:00:00", passenger_count:1, trip_distance:3.0, RatecodeID:1, payment_type:"card", fare_amount:12.00, tip_amount:2.40, total_amount:14.40, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:14, pickup:"2023-03-06T16:20:00", dropoff:"2023-03-06T16:55:00", passenger_count:2, trip_distance:6.1, RatecodeID:1, payment_type:"card", fare_amount:21.50, tip_amount:4.30, total_amount:25.80, airport_fee:null, PUBorough:"Manhattan", DOBorough:"Brooklyn"},
  {id:15, pickup:"2023-03-06T17:05:00", dropoff:"2023-03-06T17:09:00", passenger_count:1, trip_distance:0.5, RatecodeID:1, payment_type:"cash", fare_amount:-4.00, tip_amount:0.00, total_amount:-4.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:16, pickup:"2023-03-06T17:30:00", dropoff:"2023-03-06T18:10:00", passenger_count:1, trip_distance:8.9, RatecodeID:1, payment_type:"card", fare_amount:29.50, tip_amount:5.90, total_amount:35.40, airport_fee:0, PUBorough:"Queens", DOBorough:"Manhattan"},
  {id:17, pickup:"2023-03-06T18:25:00", dropoff:"2023-03-06T18:31:00", passenger_count:1, trip_distance:1.0, RatecodeID:1, payment_type:"card", fare_amount:6.00, tip_amount:1.20, total_amount:7.20, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:18, pickup:"2023-03-06T19:00:00", dropoff:"2023-03-06T19:45:00", passenger_count:2, trip_distance:11.2, RatecodeID:2, payment_type:"card", fare_amount:52.00, tip_amount:10.00, total_amount:63.25, airport_fee:1.25, PUBorough:"Manhattan", DOBorough:"EWR"},
  {id:19, pickup:"2023-03-06T20:00:00", dropoff:"2023-03-06T20:09:00", passenger_count:1, trip_distance:1.6, RatecodeID:1, payment_type:"cash", fare_amount:8.00, tip_amount:0.00, total_amount:8.00, airport_fee:0, PUBorough:"Brooklyn", DOBorough:"Brooklyn"},
  {id:20, pickup:"2023-03-06T20:30:00", dropoff:"2023-03-06T20:33:00", passenger_count:1, trip_distance:0.0, RatecodeID:1, payment_type:"card", fare_amount:3.50, tip_amount:0.50, total_amount:4.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:21, pickup:"2023-03-07T07:50:00", dropoff:"2023-03-07T08:05:00", passenger_count:1, trip_distance:2.4, RatecodeID:1, payment_type:"card", fare_amount:10.00, tip_amount:2.00, total_amount:12.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:22, pickup:"2023-03-07T08:20:00", dropoff:"2023-03-07T08:50:00", passenger_count:3, trip_distance:5.0, RatecodeID:1, payment_type:"cash", fare_amount:18.00, tip_amount:0.00, total_amount:18.00, airport_fee:0, PUBorough:"Bronx", DOBorough:"Manhattan"},
  {id:23, pickup:"2023-03-07T09:10:00", dropoff:"2023-03-07T09:25:00", passenger_count:1, trip_distance:2.8, RatecodeID:null, payment_type:"card", fare_amount:11.50, tip_amount:2.30, total_amount:13.80, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Queens"},
  {id:24, pickup:"2023-03-07T09:45:00", dropoff:"2023-03-07T10:30:00", passenger_count:2, trip_distance:120.0, RatecodeID:1, payment_type:"card", fare_amount:8.00, tip_amount:1.00, total_amount:9.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:25, pickup:"2023-03-07T10:50:00", dropoff:"2023-03-07T10:54:00", passenger_count:null, trip_distance:0.8, RatecodeID:1, payment_type:"card", fare_amount:5.50, tip_amount:1.10, total_amount:6.60, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:26, pickup:"2023-03-07T11:15:00", dropoff:"2023-03-07T11:50:00", passenger_count:1, trip_distance:6.7, RatecodeID:1, payment_type:"card", fare_amount:399.00, tip_amount:0.00, total_amount:399.00, airport_fee:0, PUBorough:"Staten Island", DOBorough:"Manhattan"},
  {id:27, pickup:"2023-03-07T12:10:00", dropoff:"2023-03-07T12:35:00", passenger_count:1, trip_distance:4.3, RatecodeID:1, payment_type:"cash", fare_amount:16.00, tip_amount:0.00, total_amount:16.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Brooklyn"},
  {id:28, pickup:"2023-03-07T13:00:00", dropoff:"2023-03-07T13:18:00", passenger_count:2, trip_distance:3.5, RatecodeID:1, payment_type:"card", fare_amount:13.50, tip_amount:2.70, total_amount:16.20, airport_fee:null, PUBorough:"Manhattan", DOBorough:"Manhattan"},
  {id:29, pickup:"2023-03-07T13:40:00", dropoff:"2023-03-07T14:10:00", passenger_count:1, trip_distance:5.9, RatecodeID:1, payment_type:"card", fare_amount:20.50, tip_amount:4.10, total_amount:24.60, airport_fee:0, PUBorough:"Queens", DOBorough:"Brooklyn"},
  {id:30, pickup:"2023-03-07T14:30:00", dropoff:"2023-03-07T14:34:00", passenger_count:1, trip_distance:0.0, RatecodeID:1, payment_type:"card", fare_amount:3.00, tip_amount:0.00, total_amount:3.00, airport_fee:0, PUBorough:"Manhattan", DOBorough:"Manhattan"}
];

// ── Pandas EDA: helper functions ─────────────────────────────────────────────

function quantileSorted(sorted, q) {
  var pos = (sorted.length - 1) * q;
  var base = Math.floor(pos);
  var rest = pos - base;
  if (sorted[base + 1] !== undefined) return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  return sorted[base];
}

function computeMissingRatio(data, cols) {
  var n = data.length;
  var out = {};
  cols.forEach(function (c) {
    var nulls = data.filter(function (r) { return r[c] === null || r[c] === undefined; }).length;
    out[c] = Math.round((nulls / n) * 100 * 100) / 100;
  });
  return out;
}

function computeIQRBounds(data, col, k) {
  var vals = data.map(function (r) { return r[col]; })
    .filter(function (v) { return v !== null && v !== undefined; })
    .sort(function (a, b) { return a - b; });
  var q1 = quantileSorted(vals, 0.25);
  var q3 = quantileSorted(vals, 0.75);
  var iqr = q3 - q1;
  var lower = q1 - k * iqr;
  var upper = q3 + k * iqr;
  var outliers = data.filter(function (r) {
    var v = r[col];
    return v !== null && v !== undefined && (v < lower || v > upper);
  });
  return { q1: q1, q3: q3, iqr: iqr, lower: lower, upper: upper, outlierIds: outliers.map(function (r) { return r.id; }) };
}

function applyFillna(data, col, strategy) {
  var nonNull = data.map(function (r) { return r[col]; }).filter(function (v) { return v !== null && v !== undefined; });
  var fillValue;
  if (strategy === 'mean') {
    fillValue = nonNull.reduce(function (a, b) { return a + b; }, 0) / nonNull.length;
  } else if (strategy === 'mode') {
    var counts = {};
    nonNull.forEach(function (v) { counts[v] = (counts[v] || 0) + 1; });
    fillValue = Object.keys(counts).reduce(function (best, key) {
      return counts[key] > (counts[best] || 0) ? key : best;
    }, nonNull[0]);
    fillValue = Number(fillValue);
  } else {
    fillValue = strategy;
  }
  return data.map(function (r) {
    if (r[col] === null || r[col] === undefined) {
      var copy = Object.assign({}, r);
      copy[col] = fillValue;
      return copy;
    }
    return r;
  });
}

function filterInvalid(data, rules) {
  var before = data.length;
  var removedIds = [];
  var after = data.filter(function (r) {
    var violates = rules.some(function (rule) {
      var v = r[rule.col];
      if (rule.op === 'negative') return v < 0;
      if (rule.op === 'zero') return v === 0;
      return false;
    });
    if (violates) removedIds.push(r.id);
    return !violates;
  });
  return { before: before, after: after.length, removedIds: removedIds, rows: after };
}

function decomposeDatetime(pickupStr, dropoffStr) {
  var pickup = new Date(pickupStr);
  var dropoff = new Date(dropoffStr);
  var jsDay = pickup.getDay();
  var dayOfWeek = (jsDay + 6) % 7; // remap JS Sunday=0 to pandas Monday=0
  var dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return {
    hour: pickup.getHours(),
    dayOfWeek: dayOfWeek,
    dayName: dayNames[dayOfWeek],
    durationMinutes: (dropoff.getTime() - pickup.getTime()) / 60000
  };
}

function computeHistogramBins(data, col, binCount) {
  var vals = data.map(function (r) { return r[col]; }).filter(function (v) { return v !== null && v !== undefined; });
  var min = Math.min.apply(null, vals);
  var max = Math.max.apply(null, vals);
  var width = (max - min) / binCount;
  var bins = [];
  for (var i = 0; i < binCount; i++) {
    var binStart = min + i * width;
    var binEnd = binStart + width;
    bins.push({ binStart: binStart, binEnd: binEnd, count: 0 });
  }
  vals.forEach(function (v) {
    var idx = Math.min(binCount - 1, Math.floor((v - min) / width));
    bins[idx].count++;
  });
  return bins;
}

function pearsonPair(data, colX, colY) {
  var pairs = data.filter(function (r) {
    return r[colX] !== null && r[colX] !== undefined && r[colY] !== null && r[colY] !== undefined;
  });
  var n = pairs.length;
  var xs = pairs.map(function (r) { return r[colX]; });
  var ys = pairs.map(function (r) { return r[colY]; });
  var mx = xs.reduce(function (a, b) { return a + b; }, 0) / n;
  var my = ys.reduce(function (a, b) { return a + b; }, 0) / n;
  var num = 0, dx = 0, dy = 0;
  for (var i = 0; i < n; i++) {
    var a = xs[i] - mx, b = ys[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  return num / Math.sqrt(dx * dy);
}

function computeCorrelationMatrix(data, cols) {
  var matrix = {};
  cols.forEach(function (colA) {
    matrix[colA] = {};
    cols.forEach(function (colB) {
      matrix[colA][colB] = colA === colB ? 1 : pearsonPair(data, colA, colB);
    });
  });
  return matrix;
}

function buildPivotTable(data, rowField, colField, valueField, agg) {
  var rowVals = [];
  var colVals = [];
  data.forEach(function (r) {
    if (rowVals.indexOf(r[rowField]) === -1) rowVals.push(r[rowField]);
    if (colVals.indexOf(r[colField]) === -1) colVals.push(r[colField]);
  });
  var table = {};
  rowVals.forEach(function (rv) {
    table[rv] = {};
    colVals.forEach(function (cv) {
      var matching = data.filter(function (r) { return r[rowField] === rv && r[colField] === cv; });
      if (matching.length === 0) { table[rv][cv] = null; return; }
      var vals = matching.map(function (r) { return r[valueField]; });
      if (agg === 'sum') table[rv][cv] = vals.reduce(function (a, b) { return a + b; }, 0);
      else if (agg === 'count') table[rv][cv] = vals.length;
      else table[rv][cv] = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
    });
  });
  return table;
}

function renderDataFrameTable(rows, cols) {
  var html = '<table class="data-table"><thead><tr><th>id</th>';
  cols.forEach(function (c) { html += '<th>' + escHtml(c) + '</th>'; });
  html += '</tr></thead><tbody>';
  rows.forEach(function (r) {
    html += '<tr><td>' + r.id + '</td>';
    cols.forEach(function (c) {
      var v = r[c];
      if (v === null || v === undefined) {
        html += '<td class="missing-cell">NaN</td>';
      } else {
        html += '<td>' + escHtml(String(v)) + '</td>';
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TAXI_SAMPLE_DATA: TAXI_SAMPLE_DATA,
    computeMissingRatio: computeMissingRatio,
    computeIQRBounds: computeIQRBounds,
    applyFillna: applyFillna,
    filterInvalid: filterInvalid,
    decomposeDatetime: decomposeDatetime,
    computeHistogramBins: computeHistogramBins,
    computeCorrelationMatrix: computeCorrelationMatrix,
    buildPivotTable: buildPivotTable,
    renderDataFrameTable: renderDataFrameTable
  };
}
```

`escHtml` already exists in the copied `common.js` (from the nlp fork) — no need to redefine it.

- [ ] **Step 3: Write the failing test** — create `pandas-eda/js/common.test.js`

```javascript
const assert = require('assert');
const {
  TAXI_SAMPLE_DATA, computeMissingRatio, computeIQRBounds, applyFillna,
  filterInvalid, decomposeDatetime, computeCorrelationMatrix, buildPivotTable
} = require('./common.js');

const ratios = computeMissingRatio(TAXI_SAMPLE_DATA, ['passenger_count', 'RatecodeID', 'airport_fee']);
assert.strictEqual(ratios.passenger_count, 6.67);
assert.strictEqual(ratios.RatecodeID, 6.67);
assert.strictEqual(ratios.airport_fee, 6.67);

const fareIQR = computeIQRBounds(TAXI_SAMPLE_DATA, 'fare_amount', 1.5);
assert.strictEqual(fareIQR.q1, 6.125);
assert.strictEqual(fareIQR.q3, 19.125);
assert.deepStrictEqual(fareIQR.outlierIds.slice().sort(function(a,b){return a-b;}), [6, 18, 26]);

const distIQR = computeIQRBounds(TAXI_SAMPLE_DATA, 'trip_distance', 1.5);
assert.deepStrictEqual(distIQR.outlierIds, [24]);

const filledPassengers = applyFillna(TAXI_SAMPLE_DATA, 'passenger_count', 'mode');
assert.strictEqual(filledPassengers.filter(function(r){return r.passenger_count === null;}).length, 0);
assert.strictEqual(filledPassengers.length, 30);
assert.strictEqual(filledPassengers.find(function(r){return r.id === 9;}).passenger_count, 1);

const invalidResult = filterInvalid(TAXI_SAMPLE_DATA, [
  { col: 'fare_amount', op: 'negative' },
  { col: 'trip_distance', op: 'zero' }
]);
assert.strictEqual(invalidResult.before, 30);
assert.strictEqual(invalidResult.after, 24);

const dt = decomposeDatetime('2023-03-06T08:15:00', '2023-03-06T08:32:00');
assert.strictEqual(dt.hour, 8);
assert.strictEqual(dt.dayOfWeek, 0); // Monday
assert.strictEqual(dt.durationMinutes, 17);

const corr = computeCorrelationMatrix(TAXI_SAMPLE_DATA, ['fare_amount', 'total_amount']);
assert.ok(corr.fare_amount.total_amount > 0.99);

const pivot = buildPivotTable(TAXI_SAMPLE_DATA, 'PUBorough', 'payment_type', 'fare_amount', 'mean');
assert.strictEqual(pivot['Staten Island'].card, 399);
assert.strictEqual(pivot['Bronx'].card, null);

console.log('All common.js helper checks passed.');
```

- [ ] **Step 4: Run test to verify it fails (functions not yet exported/defined)**

Run: `node pandas-eda/js/common.test.js`
Expected: throws because `common.js` (the bare nlp copy, before Step 2's additions) has no `module.exports` — `TAXI_SAMPLE_DATA` etc. are `undefined`.

*(If Step 2 was already applied before this step in your working copy, temporarily comment out the `module.exports` block, confirm the test fails with a clear error, then restore it — the point is to see a real failure before the real implementation is in place.)*

- [ ] **Step 5: Confirm the additions from Step 2 are present, then run again to verify it passes**

Run: `node pandas-eda/js/common.test.js`
Expected: `All common.js helper checks passed.` with no assertion errors.

- [ ] **Step 6: Commit**

```bash
git add pandas-eda/js/common.js pandas-eda/js/common.test.js
git commit -m "feat: add pandas-eda shared dataset and helper functions with Node self-check"
```

---

## Task 4: Module 1 — EDA Foundations & First Look (sets the template)

**Files:**
- Create: `pandas-eda/modules/01-eda-foundations.html`

This is the template-setting module. Copy the structural skeleton from `nlp/modules/01-text-normalization-edit-distance.html` (nav bar with 9 links instead of 10, header with theme/menu toggles, `.concept-box`, `.callout`, `.derivation`, `.code-snippet` + `.output-block`, `.widget-container`, `.practice` blocks, `.quiz-block`, `.bridge`, `.nav-buttons`) and adapt with the content below. Every later module task reuses this same skeleton — they will only specify content, not markup, so get this one right.

Module 1 itself doesn't need Plotly (the Dataset Inspector widget only renders tables/text), so its `<head>` only needs the KaTeX tags + `../js/common.js`, same as the copied template. **Modules 4, 6, 7, and 8 (Tasks 7, 9, 10, 11) render Plotly charts and must additionally add `<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>` to their `<head>`** (see `nlp/modules/06-distributional-semantics-pmi.html` line 11 for the exact pattern) — `common.js` already provides `PLOTLY_CONFIG` and `plotlyLayout()` for theming, no extra JS needed beyond the CDN tag itself.

- [ ] **Step 1: Write the complete module HTML**

Content to include, in this order:

**Why this topic?** Can't clean what you don't understand. Opens by stating the dataset is a small sample of NYC yellow-taxi trips (mirrors the notebook's own hourly-sampling strategy) — 30 rows, 12 columns.

**What / How — first-look methods**, as a `.derivation` walkthrough of `.shape`, `.dtypes`, `.head()`, `.info()`, `.describe()`:

```python
import pandas as pd
df = pd.read_parquet("yellow_tripdata_2023-03_sample.parquet")
print(df.shape)
```
Output: `(30, 12)`

```python
print(df.describe()[['fare_amount']])
```
Output:
```
       fare_amount
count        30.00
mean          26.17
std           71.57
min          -12.50
25%            6.125
50%           11.75
75%           19.125
max          399.00
```

Callout (note): the mean (26.17) is more than double the median (11.75) — a strong hint the column is right-skewed by a few extreme values. Flag this now; Module 4 explains exactly which rows and why.

Callout (warning): `min` is **negative** (-12.50). A fare can't be negative — this isn't a distribution quirk, it's a data error. Module 3 deals with it.

**Widget — Dataset Inspector**: buttons `[shape] [dtypes] [head(5)] [info()] [describe()]`. Each renders the corresponding view of `TAXI_SAMPLE_DATA` using `renderDataFrameTable()` (for head) or a small computed summary (for the others), reusing `computeIQRBounds`/plain JS for `describe()`'s quantiles.

**Practice:**
- *Easy* — `df.shape` returns `(30, 12)`. What do the two numbers mean? **Solution:** 30 rows (trips), 12 columns (fields per trip).
- *Medium* — Given mean=26.17 and median=11.75 for `fare_amount`, what does the gap suggest about the distribution's shape, and which row do you suspect is driving it? **Solution:** right-skewed; a few very large fares pull the mean above the median. The dataset's max (399.00) is the prime suspect — one $399 fare among mostly $3-$30 fares pulls the mean up substantially while the median, being robust to outliers, stays low.
- *Hard* — `.info()` reports `RatecodeID` as `float64`, even though rate codes are small whole numbers (1, 2, 3...). Why would pandas store whole numbers as floats? **Solution:** the column has missing values (`NaN`), and NumPy's `int64` can't represent `NaN` — only float dtypes can. Pandas silently upcasts any integer column containing nulls to `float64`. Demonstrate: `pd.array([1, 2, None])` has dtype `Float64`/`object`, never plain int.

**Quiz (4 MCQ):**
1. What does `df.shape` return? → **(rows, columns)** correct; distractors: (columns, rows), total cell count, column names.
2. Which single method shows dtypes *and* non-null counts together? → **`.info()`** correct; distractors: `.describe()`, `.head()`, `.shape`.
3. By default, when a DataFrame mixes numeric and text columns, `.describe()` summarizes: → **only the numeric columns** correct; distractors: all columns, only text columns, only the index.
4. Why is `fare_amount`'s mean (26.17) so much higher than its median (11.75) in this sample? → **a few large outlier fares pull the mean up; the median is robust to outliers** correct; distractors involving sample size or rounding.

**Bridge:** describe() already flagged something off — a $399 fare and a negative one. Before trusting any of these numbers, find out how much of the data is even there to compute on. Module 2 starts with missing values.

- [ ] **Step 2: Open the file in a browser (or `python -m http.server` from the repo root) and confirm**: nav links work, theme toggle works, widget buttons render a table without console errors, quiz options highlight correct/wrong on click, practice "Show solution" toggles visibility.

- [ ] **Step 3: Commit**

```bash
git add pandas-eda/modules/01-eda-foundations.html
git commit -m "feat: add pandas-eda Module 1 — EDA Foundations & First Look"
```

---

## Task 5: Module 2 — Missing Values

**Files:**
- Create: `pandas-eda/modules/02-missing-values.html`

Use the Task 4 module as the structural template (same nav/header/widget/practice/quiz/bridge markup pattern, 9-link nav bar, active link on Module 2).

- [ ] **Step 1: Write the complete module HTML**

**Why:** nulls break stats/ML silently — `describe()` in Module 1 computed `fare_amount`'s mean and quartiles without ever telling you 3 other columns are partly empty.

**What:** missing ratio per column; `NaN` as pandas' missing-value marker; dropna vs fillna tradeoffs.

**How**, with exact numbers from this dataset:

```python
missing_pct = (df.isna().mean() * 100).round(2)
print(missing_pct[missing_pct > 0])
```
Output:
```
passenger_count    6.67
RatecodeID         6.67
airport_fee        6.67
dtype: float64
```

Walk through three fillna choices for three different columns, each justified by the column's nature:

- `passenger_count` (a count): mean of the 28 known values is 1.46 — **fractional passengers aren't physically real**. Mode is 1 (19 of 28 rows) — a sensible whole-number fill.
- `RatecodeID` (a category, not a number that should be averaged): mode is 1 (26 of 28 rows) — fill with the dominant category.
- `airport_fee` (mostly a flat $0, occasionally $1.25 for flat-rate airport trips): mode is 0 (26 of 28 rows) — fill with the typical value, since neither missing row is actually an airport trip.

```python
df['passenger_count'] = df['passenger_count'].fillna(df['passenger_count'].mode()[0])
df['RatecodeID']      = df['RatecodeID'].fillna(df['RatecodeID'].mode()[0])
df['airport_fee']     = df['airport_fee'].fillna(0)
print(df.isna().sum().sum())
```
Output: `0`

**Widget:** Missing-value grid — renders the 8 affected rows (ids 9, 10, 14, 23, 25, 28, plus their full row) via `renderDataFrameTable()` with `.missing-cell` highlighting; a column picker (`passenger_count` / `RatecodeID` / `airport_fee`) + strategy buttons `[Drop rows] [Fill: mean] [Fill: mode]` showing the resulting row count and, for "Fill: mean" on `passenger_count`, the nonsensical fractional value (1.46) versus mode's clean 1.

**Practice:**
- *Easy* — Write the expression that gives the % of missing values per column. **Solution:** `(df.isna().mean() * 100).round(2)`.
- *Medium* — For `RatecodeID` (a category, not a continuous measurement), which is the better fillna strategy: mean or mode? Why? **Solution:** mode — averaging category codes (e.g., (1+1+2)/3 = 1.33) produces a value, 1.33, that isn't even one of the valid categories. Mode preserves a real, valid category.
- *Hard* — `passenger_count`'s mean-fill value is 1.46. Name one concrete downstream problem this could cause if used to fill a count column. **Solution:** any analysis treating `passenger_count` as a true integer count (e.g., total passengers transported, `df.passenger_count.sum()`) would include fractional passengers in the total, and any groupby or join keyed on exact passenger count would never match the imputed rows to a real-world value of 1.46 passengers.

**Quiz (4 MCQ):**
1. What does `df['col'].isna().mean() * 100` compute? → **the % of missing values in that column** correct.
2. For `RatecodeID` (almost always 1, occasionally 2), which fillna strategy best preserves a realistic value? → **mode** correct; distractors: mean, fillna(0), leave as NaN.
3. Why might `fillna(mean)` be a poor choice for `passenger_count`? → **the mean (1.46) implies a fractional passenger, which isn't realistic for a count field** correct.
4. When is `dropna()` preferable to `fillna()`? → **when the missing share is small and there's no sensible value to impute, so the bias from a wrong imputed value would be worse than losing a few rows** correct; distractors: "always, it's simpler", "never, always impute", "only for text columns".

**Bridge:** nulls are one kind of missing signal; rows where the data IS there but wrong are another. Module 3 looks at values that pass every `isna()` check yet still violate the business rules of a taxi fare.

- [ ] **Step 2: Open in browser, confirm widget strategy buttons update the row count/table correctly, no console errors.**

- [ ] **Step 3: Commit**

```bash
git add pandas-eda/modules/02-missing-values.html
git commit -m "feat: add pandas-eda Module 2 — Missing Values"
```

---

## Task 6: Module 3 — Data Quality & Invalid Values

**Files:**
- Create: `pandas-eda/modules/03-data-quality-invalid-values.html`

Use the Task 4 module as the structural template, nav active link on Module 3.

- [ ] **Step 1: Write the complete module HTML**

**Why:** passing every `isna()` check doesn't mean a value is valid. Module 1 flagged a -12.50 fare — it's "present," just nonsensical.

**What:** domain constraints specific to this dataset: fares can't be negative; zero-distance trips charged a real fare are suspicious (not impossible — a canceled ride can still trigger a minimum charge); rate codes outside the documented set are worth a sanity check.

**How**, with exact numbers:

```python
bad_fare = df[df.fare_amount < 0]
bad_distance = df[(df.trip_distance == 0) & (df.fare_amount > 0)]
print(f"Negative fares: {len(bad_fare)} rows")
print(f"Zero-distance trips charged a fare: {len(bad_distance)} rows")
```
Output:
```
Negative fares: 2 rows
Zero-distance trips charged a fare: 4 rows
```

Note the two issues are independent here — `df[(df.fare_amount < 0) & (df.trip_distance == 0)]` returns 0 rows (the negative-fare rows ids 7, 15 are different rows from the zero-distance rows ids 5, 11, 20, 30), meaning these are two distinct root causes (likely a billing-reversal glitch vs. a canceled-trip minimum charge), not one bug wearing two faces.

```python
print(df.RatecodeID.value_counts(dropna=False))
```
Output:
```
1.0    26
2.0     2
NaN     2
Name: RatecodeID, count: dtype: int64
```

**Widget:** rule-checklist toggles — `[ ] fare_amount >= 0`, `[ ] trip_distance > 0`, `[ ] RatecodeID known (1–6)` — each checked rule live-filters `TAXI_SAMPLE_DATA` via `filterInvalid()` and shows the remaining row count (30 → 28 → 24 as rules stack), highlighting removed rows with `.outlier-point`.

**Practice:**
- *Easy* — Write the boolean mask that finds rows with a negative fare. **Solution:** `df[df.fare_amount < 0]` → 2 rows (ids 7, 15).
- *Medium* — Should you always drop every row where `trip_distance == 0`? **Solution:** not necessarily — a genuinely canceled trip can still incur a minimum charge with 0 recorded distance, which is a real (if edge-case) business event, not a data error. The safer move is to flag and inspect rather than blindly delete; check whether the fare is also $0 (truly a non-event) versus a positive minimum fare (a real but unusual charge).
- *Hard* — Confirm whether any row is *both* zero-distance and negative-fare by combining the two masks with `&`. What does the empty result tell you about the two issues? **Solution:** `df[(df.trip_distance == 0) & (df.fare_amount < 0)]` returns 0 rows — the two data-quality problems never co-occur in this sample, suggesting they come from separate causes (a refund/dispute process producing negative fares vs. a minimum-charge policy producing zero-distance nonzero-fare rows) rather than one shared bug.

**Quiz (4 MCQ):**
1. What does `df[df.fare_amount < 0]` return? → **a filtered DataFrame containing only the rows where the condition is True** correct; distractors: a boolean Series, a single column, a count.
2. Which pandas operator combines two boolean Series with logical AND? → **`&`** correct; distractors: `and`, `+`, `|` (which is OR).
3. Why check `.value_counts(dropna=False)` on `RatecodeID` before cleaning? → **to spot unexpected or missing categories that fall outside the documented rate codes** correct.
4. A row with `trip_distance == 0` and `fare_amount == 0` together most likely represents: → **a trip that was started and immediately canceled with no charge** correct (contrast with the dataset's actual zero-distance rows, which DO have a small positive fare — the minimum-charge case from this module's practice problems).

**Bridge:** invalid values here were caught with a hard boolean rule — a fare is either negative or it isn't. But how far is "too far" before a *positive*, plausible-looking value still counts as wrong? Module 4 makes that boundary statistical: the IQR method.

- [ ] **Step 2: Open in browser, confirm checklist toggles update row count and table correctly.**

- [ ] **Step 3: Commit**

```bash
git add pandas-eda/modules/03-data-quality-invalid-values.html
git commit -m "feat: add pandas-eda Module 3 — Data Quality & Invalid Values"
```

---

## Task 7: Module 4 — Outlier Detection & Treatment (IQR)

**Files:**
- Create: `pandas-eda/modules/04-outlier-detection-iqr.html`

Use the Task 4 module as the structural template, nav active link on Module 4.

- [ ] **Step 1: Write the complete module HTML**

**Why:** outliers skew mean/std and plots — recall Module 1's `describe()` showed mean 26.17 vs median 11.75 for `fare_amount`. Now find out exactly which rows caused that, with a repeatable rule instead of eyeballing it.

**What:** quartiles, IQR, Tukey fences `[Q1 - k·IQR, Q3 + k·IQR]`, cap vs remove, brief z-score mention as an alternative.

**Math (KaTeX):** `IQR = Q3 - Q1`; bounds `[Q1 - k \cdot IQR,\ Q3 + k \cdot IQR]`; z-score `z = (x - \mu) / \sigma`.

**How**, with exact numbers:

```python
Q1 = df.fare_amount.quantile(0.25)
Q3 = df.fare_amount.quantile(0.75)
IQR = Q3 - Q1
lower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR
outliers = df[(df.fare_amount < lower) | (df.fare_amount > upper)]
print(f"Q1={Q1}, Q3={Q3}, IQR={IQR}, bounds=({lower}, {upper})")
print(outliers[['fare_amount']])
```
Output:
```
Q1=6.125, Q3=19.125, IQR=13.0, bounds=(-13.375, 38.625)
    fare_amount
6         45.00
18        52.00
26       399.00
```

Same method on `trip_distance`: Q1=1.175, Q3=5.8, IQR=4.625, bounds=(-5.7625, 12.7375) → flags only id 24 (120.0 miles).

Callout (insight): ids 6 and 18 are `RatecodeID == 2` flat-rate airport fares — statistically flagged by IQR, but structurally explained (flat fares aren't priced by the same per-mile rule as everything else, so they naturally sit outside a fence built from mostly-metered fares). Id 26 ($399) has no such explanation — most likely a meter malfunction. Not every statistical outlier is an error; domain context decides whether to cap, remove, or keep it.

**Widget:** IQR multiplier (k) slider, range 1.0–3.0, default 1.5 — recomputes bounds live via `computeIQRBounds()` and redraws a Plotly boxplot of `fare_amount` with flagged points in `.outlier-point` styling; a `[Remove outliers] / [Cap at bounds]` toggle shows the resulting min/max and row count for each treatment.

**Practice:**
- *Easy* — Given Q1=1.175 and Q3=5.8 for `trip_distance`, compute the IQR. **Solution:** IQR = 5.8 - 1.175 = 4.625.
- *Medium* — With k=1.5, is the $45 airport flat fare (id 6) outside the bounds [-13.375, 38.625]? Should it be deleted? **Solution:** yes, 45 > 38.625, so IQR flags it — but since it's a legitimate flat-rate fare (Module 3's `RatecodeID` check would show `RatecodeID == 2`), deleting it would discard real signal about a different, valid pricing structure rather than removing an error.
- *Hard* — Raise k from 1.5 to 3.0 for `fare_amount` (IQR=13). Recompute the upper bound and state whether id 26's $399 is still flagged, and what changes for ids 6/18. **Solution:** new upper bound = 19.125 + 3×13 = 58.125. $399 is still far beyond 58.125 (still flagged — the true error survives any reasonable k). But $45 and $52 now fall *under* 58.125 (no longer flagged) — raising k stops flagging the legitimate flat fares while still catching the genuine error, illustrating the tradeoff in choosing k.

**Quiz (4 MCQ):**
1. What is the IQR? → **Q3 - Q1** correct.
2. With Q1=6.125 and Q3=19.125 (IQR=13), what's the lower Tukey fence at k=1.5? → **-13.375** correct (6.125 - 19.5); distractors with one arithmetic step wrong.
3. Why might capping be preferred over removing outliers? → **it preserves the row (and its other column values) for analyses that don't depend on the flagged column, avoiding losing unrelated good data** correct.
4. Ids 6 ($45) and 26 ($399) are both IQR-flagged — what distinguishes a true data error from a structurally valid extreme value? → **domain context: id 6 has a documented explanation (a flat-rate `RatecodeID`), while id 26 has none, suggesting a malfunction rather than a real fare** correct.

**Bridge:** outliers are about one column's extreme values. But $399 for a 6.7-mile ride is really a clue about the *relationship* between two columns — fare should track distance. The timestamp columns are still raw strings, though; Module 5 turns them into usable features before exploring those relationships.

- [ ] **Step 2: Open in browser, confirm the k-slider redraws the boxplot and updates outlier counts without console errors.**

- [ ] **Step 3: Commit**

```bash
git add pandas-eda/modules/04-outlier-detection-iqr.html
git commit -m "feat: add pandas-eda Module 4 — Outlier Detection & Treatment (IQR)"
```

---

## Task 8: Module 5 — Datetime Parsing & Feature Engineering

**Files:**
- Create: `pandas-eda/modules/05-datetime-feature-engineering.html`

Use the Task 4 module as the structural template, nav active link on Module 5.

- [ ] **Step 1: Write the complete module HTML**

**Why:** raw ISO timestamp strings can't be grouped by hour or weekday, or used to compute a trip's duration — they're still just text to pandas until parsed.

**What:** the `.dt` accessor family: `.dt.hour`, `.dt.dayofweek` (Monday=0 in pandas), duration via datetime subtraction.

**How**, using id 1 (pickup `2023-03-06T08:15:00`, dropoff `2023-03-06T08:32:00`; 2023-03-06 is a Monday):

```python
df['pickup_datetime']  = pd.to_datetime(df['pickup_datetime'])
df['dropoff_datetime'] = pd.to_datetime(df['dropoff_datetime'])
df['hour']         = df['pickup_datetime'].dt.hour
df['day_of_week']  = df['pickup_datetime'].dt.dayofweek          # Monday=0
df['duration_min'] = (df['dropoff_datetime'] - df['pickup_datetime']).dt.total_seconds() / 60
print(df.loc[0, ['pickup_datetime', 'hour', 'day_of_week', 'duration_min']])
```
Output:
```
pickup_datetime    2023-03-06 08:15:00
hour                                 8
day_of_week                          0
duration_min                      17.0
Name: 0, dtype: object
```

Callout (note): `.dt.dayofweek` only works once a column is `datetime64` — calling it on the original string column raises `AttributeError: Can only use .dt accessor with datetimelike values`, which is why `pd.to_datetime()` always comes first.

**Widget:** live decomposer — two `datetime-local` inputs (defaulting to id 1's pickup/dropoff) feeding `decomposeDatetime()`, displaying hour, weekday name, and duration in minutes, recomputed on every input change.

**Practice:**
- *Easy* — id 6's pickup is 11:00, dropoff 11:35. Compute `duration_min`. **Solution:** 35.
- *Medium* — pandas' `.dt.dayofweek` uses Monday=0..Sunday=6, but JavaScript's `Date.getDay()` uses Sunday=0..Saturday=6. If a JS widget needs to match pandas' convention, how do you convert? **Solution:** `pandas_dow = (js_day + 6) % 7` (equivalently `(js_day - 1 + 7) % 7`).
- *Hard* — id 24 (flagged as a distance outlier in Module 4: 120 miles) has a 45-minute duration (09:45→10:30). Compute its implied average speed in mph and explain what that tells you about the outlier. **Solution:** 120 miles / 0.75 hours = 160 mph — physically impossible in NYC traffic. This corroborates Module 4's suspicion of a GPS/meter glitch on the distance field: a derived feature (speed = distance ÷ duration) exposed a data error that wasn't obvious from either original column alone.

**Quiz (4 MCQ):**
1. What does `.dt.hour` return on a `datetime64` column? → **the hour component, 0–23** correct.
2. In pandas, `.dt.dayofweek` for a Monday returns: → **0** correct; distractors: 1, 6, 7.
3. Why must `pd.to_datetime()` run before using any `.dt` accessor? → **`.dt` only works on `datetime64` dtype columns, not on plain strings** correct.
4. id 24's derived speed comes out to ~160 mph. What does this best illustrate? → **a derived feature can expose a data-quality issue invisible in either original column alone** correct.

**Bridge:** there's now a hard speed signal confirming id 24's distance is broken, not just "big." With clean(-ish), feature-rich columns in hand, it's time to look at one variable's *shape* before pairing two together — starting with univariate visualization.

- [ ] **Step 2: Open in browser, confirm changing either datetime input live-updates hour/weekday/duration with no console errors.**

- [ ] **Step 3: Commit**

```bash
git add pandas-eda/modules/05-datetime-feature-engineering.html
git commit -m "feat: add pandas-eda Module 5 — Datetime Parsing & Feature Engineering"
```

---

## Task 9: Module 6 — Univariate Visualization

**Files:**
- Create: `pandas-eda/modules/06-univariate-visualization.html`

Use the Task 4 module as the structural template, nav active link on Module 6.

- [ ] **Step 1: Write the complete module HTML**

**Why:** a histogram shows the *shape* of one variable's distribution — multimodality, skew direction — none of which `describe()`'s six numbers (mean/std/min/25/50/75/max) make obvious on their own.

**What:** histogram, boxplot, KDE (brief mention), skewness; log-scale for long-tailed money/distance variables.

**How**, tying back to earlier findings:

```python
import matplotlib.pyplot as plt
fig, axes = plt.subplots(1, 2, figsize=(10, 4))
df.fare_amount.plot(kind='hist', bins=10, ax=axes[0], title='Fare amount')
df.fare_amount.plot(kind='box', ax=axes[1], title='Fare amount')
plt.show()
```
Output (described, since this is a static page): most bars cluster in the $0–$20 range, with a long, nearly empty tail stretching out to $399 — visually confirming Module 1's mean-vs-median gap. The boxplot's box sits low and compressed, with three points marked above the upper whisker — the exact same ids 6, 18, 26 flagged by Module 4's IQR rule.

Callout (insight): a boxplot's whiskers are drawn using the *same* Tukey-fence formula as Module 4 — but the whisker itself stops at the most extreme **actual data point** still inside the fence, not at the fence value. For `fare_amount` (upper fence 38.625), the largest non-outlier fare is $29.50 (id 16), so the whisker is drawn at $29.50, not $38.625.

**Widget:** variable picker (`fare_amount` / `trip_distance` / `tip_amount` / `total_amount`) + bin-count slider (5–20) → live Plotly histogram via `computeHistogramBins()`; a `[Linear / Log x-axis]` toggle shows how log-scale compresses the long right tail into a more readable shape.

**Practice:**
- *Easy* — In the default `fare_amount` histogram, is the tallest bar under $10, $10–$20, or over $30? **Solution:** under $10 — most trips in this sample are short, inexpensive rides.
- *Medium* — Why does switching to a log-scale x-axis make the `fare_amount` histogram easier to read, without changing any underlying values? **Solution:** it compresses the long tail driven by the $399 row so the bulk of typical fares ($3–$30) aren't all squeezed into one bin near zero.
- *Hard* — Using the fact that boxplot whiskers stop at the most extreme in-range data point (not the fence itself), and that `fare_amount`'s upper fence is 38.625, what's the exact dollar value where the upper whisker is drawn? **Solution:** $29.50 (id 16) — the largest fare value that is still ≤ 38.625; values above that (45, 52, 399) are excluded as outliers and plotted as separate points.

**Quiz (4 MCQ):**
1. What does a histogram show that a single mean value cannot? → **the shape of the distribution — skew, multimodality, spread** correct.
2. A boxplot's whiskers extend to: → **the most extreme data point still within the Tukey fences** correct; distractors: the fence value exactly, one standard deviation, mean ± IQR.
3. Why is `fare_amount` right-skewed in this sample? → **a few very large fares ($45, $52, $399) pull the tail to the right while most fares cluster low** correct.
4. When is a log-scale x-axis most useful? → **for highly skewed data with a long tail dominated by a few large values** correct.

**Bridge:** each variable's shape is now understood alone. But the question driving this whole analysis — does a longer trip cost more? — is a question about *two* variables together. Time for bivariate analysis.

- [ ] **Step 2: Open in browser, confirm bin-slider and log-toggle redraw the Plotly histogram without console errors.**

- [ ] **Step 3: Commit**

```bash
git add pandas-eda/modules/06-univariate-visualization.html
git commit -m "feat: add pandas-eda Module 6 — Univariate Visualization"
```

---

## Task 10: Module 7 — Bivariate Analysis

**Files:**
- Create: `pandas-eda/modules/07-bivariate-analysis.html`

Use the Task 4 module as the structural template, nav active link on Module 7.

- [ ] **Step 1: Write the complete module HTML**

**Why:** business questions are about relationships between two variables — like "does a longer trip cost more?"

**What:** scatter plots (fare vs distance), grouped bar charts (mean fare by borough), two-variable `.groupby().agg()`.

**How** — the headline surprise:

```python
print(f"All rows: r = {df.fare_amount.corr(df.trip_distance):.3f}")
```
Output: `All rows: r = 0.001` — essentially **no** relationship, which contradicts common sense.

```python
clean = df[(df.RatecodeID == 1) & (df.fare_amount.between(0, 100)) & (df.trip_distance.between(0.01, 50))]
print(f"Standard metered trips only: r = {clean.fare_amount.corr(clean.trip_distance):.3f}")
```
Output: `Standard metered trips only: r = 1.000`

Callout (insight): filtering to 18 of 30 rows — standard metered trips (`RatecodeID == 1`, excluding rows with unknown rate code), with a plausible fare (under $100) and a plausible distance (under 50 miles) — turns a ~zero correlation into a near-perfect one. Two *different* reasons drove the rows out: Module 3's structural exception (flat-rate `RatecodeID == 2` trips, ids 6 and 18, don't price by distance at all) and Module 4's statistical outliers (the $399 meter glitch, id 26, and the 120-mile GPS glitch, id 24). Real-world data will never reach r = 1.000 exactly — this toy dataset is deliberately clean once filtered, to isolate the effect.

```python
import seaborn as sns
sns.scatterplot(data=clean, x='trip_distance', y='fare_amount')

print(df.groupby('PUBorough').fare_amount.mean().round(2))
```
Output (groupby):
```
PUBorough
Bronx              18.00
Brooklyn            9.50
Manhattan          12.40
Queens             23.17
Staten Island     399.00
Name: fare_amount, dtype: float64
```

**Widget:** X/Y variable picker (default `trip_distance` / `fare_amount`) → live Plotly scatter + live correlation readout (`computeCorrelationMatrix()` on the two picked columns); a checkbox `[Exclude flagged outliers & flat-rate trips]` toggles between the all-rows view (r≈0) and the filtered view (r≈1); a separate category picker (`PUBorough` / `payment_type`) → grouped bar of mean `fare_amount` per group.

**Practice:**
- *Easy* — From the groupby output, why is Staten Island's mean fare ($399.00) so much higher than every other borough? **Solution:** it's a group of exactly 1 row — id 26, Module 4's flagged outlier. A "mean" of one point is just that point; single-row groups are maximally sensitive to outliers.
- *Medium* — Name the two different reasons (one from Module 3, one from Module 4) that rows get excluded between the "all rows" and "standard metered trips only" correlation. **Solution:** (1) Module 3's structural exception — `RatecodeID == 2` flat-rate trips (ids 6, 18) don't price by distance; (2) Module 4's statistical outliers — the $399 fare (id 26) and 120-mile distance (id 24) are likely data errors, not real signal.
- *Hard* — Without recomputing, would you expect `total_amount` to correlate with `fare_amount` more or less strongly than `trip_distance` does (on the raw, unfiltered data)? Justify. **Solution:** more strongly — `total_amount` is `fare_amount + tip_amount + airport_fee`, so it's almost entirely *determined by* `fare_amount` itself (tip/fee are small additions), giving a high correlation (~0.999) regardless of any cleaning — unlike the fare-distance relationship, which depends on rate type and is corrupted by unrelated structural and outlier rows.

**Quiz (4 MCQ):**
1. What does a scatterplot show that a single correlation coefficient cannot? → **the shape of the relationship — clusters, non-linearity, individual outlier points** correct.
2. Why did filtering to `RatecodeID == 1` change the fare-distance correlation so dramatically? → **it removed flat-rate trips whose price doesn't depend on distance at all, which were drowning out the real metered relationship** correct.
3. A `groupby().mean()` on a group containing only 1 row is: → **mathematically valid but statistically unreliable, since a single point offers no evidence of a typical value** correct; distractors: "always wrong", "the same as the median", "impossible to compute".
4. Which call computes the mean fare per borough? → **`df.groupby('PUBorough').fare_amount.mean()`** correct; distractors with swapped arguments or wrong method names.

**Bridge:** two variables have now been paired up at a time. But "rate type changes the fare-distance relationship" is really a *three*-variable story — distance, fare, and rate type together. Module 8 brings in correlation matrices and pivot tables to see several variables at once.

- [ ] **Step 2: Open in browser, confirm the X/Y picker, outlier-exclude checkbox, and category picker all redraw without console errors.**

- [ ] **Step 3: Commit**

```bash
git add pandas-eda/modules/07-bivariate-analysis.html
git commit -m "feat: add pandas-eda Module 7 — Bivariate Analysis"
```

---

## Task 11: Module 8 — Multivariate Analysis

**Files:**
- Create: `pandas-eda/modules/08-multivariate-analysis.html`

Use the Task 4 module as the structural template, nav active link on Module 8.

- [ ] **Step 1: Write the complete module HTML**

**Why:** real effects — like the fare-distance relationship breaking down for flat-rate trips — are usually driven by more than two variables jointly. A correlation matrix and a pivot table let several variables be inspected at once instead of one pair at a time.

**What:** correlation matrix (heatmap), pivot tables (two categorical dimensions + one numeric aggregate).

**How**, with exact numbers (raw, unfiltered 30 rows):

```python
cols = ['fare_amount', 'trip_distance', 'tip_amount', 'total_amount', 'passenger_count']
print(df[cols].corr().round(3))
```
Output:
```
                 fare_amount  trip_distance  tip_amount  total_amount  passenger_count
fare_amount            1.000          0.001       0.007         0.999          -0.092
trip_distance          0.001          1.000       0.033         0.003           0.176
tip_amount             0.007          0.033       1.000         0.047          -0.030
total_amount           0.999          0.003       0.047         1.000          -0.093
passenger_count       -0.092          0.176      -0.030        -0.093           1.000
```

Callout (insight): on raw, uncleaned data, `total_amount` is the only column strongly correlated with `fare_amount` (0.999) — and that's purely arithmetic (`total_amount = fare_amount + tip_amount + airport_fee`). Every *other* pairing looks near-zero, including fare-vs-distance, which Module 7 already showed jumps to ~1.000 once flat-rate and outlier rows are excluded. A correlation matrix on dirty data can hide real relationships behind structural and outlier noise just as easily as a single scatterplot can.

```python
pivot = df.pivot_table(index='PUBorough', columns='payment_type', values='fare_amount', aggfunc='mean').round(2)
print(pivot)
```
Output:
```
payment_type    card    cash
PUBorough
Bronx            NaN   18.00
Brooklyn        2.50   16.50
Manhattan      13.94    5.88
Queens         25.00   19.50
Staten Island  399.00    NaN
```

**Widget:** live correlation heatmap (Plotly) with a multi-select for which columns to include (default the 5 above), recomputed via `computeCorrelationMatrix()`; a separate pivot-table builder with three dropdowns — row field (`PUBorough`/`DOBorough`/`payment_type`/`RatecodeID`), column field (same options), aggregate (`mean`/`sum`/`count`) — over a numeric value field (`fare_amount`/`trip_distance`/`tip_amount`), rendered via `buildPivotTable()` + `renderDataFrameTable()`.

**Practice:**
- *Easy* — In the correlation matrix, which pair has the strongest relationship, and is that surprising? **Solution:** `fare_amount` & `total_amount` at 0.999 — not surprising, since `total_amount` is arithmetically built mostly from `fare_amount`.
- *Medium* — The Bronx row in the pivot table shows `NaN` under "card." Does that mean a card payment's fare was missing, or something else? **Solution:** something else — it means there are zero card-paid trips from the Bronx in this sample at all (the single Bronx trip, id 22, was paid in cash). A pivot-table `NaN` often means "no rows in that group," not "value present but unrecorded."
- *Hard* — If the correlation matrix were recomputed using only Module 7's "standard metered trips only" subset instead of all 30 rows, would `fare_amount` vs `trip_distance` move toward 0.999, toward -1, or stay near 0? Justify using Module 7's finding. **Solution:** toward a strong positive value — Module 7 already showed this exact subset gives r ≈ 1.000. Removing flat-rate and outlier rows reveals the genuine per-mile pricing relationship that the raw, aggregate correlation matrix was masking.

**Quiz (4 MCQ):**
1. A correlation matrix is best described as: → **a table of pairwise correlation coefficients between every pair of selected numeric columns** correct.
2. `df.pivot_table(index=A, columns=B, values=C, aggfunc='mean')` produces a table where each cell is: → **the mean of C for rows matching that combination of A and B** correct.
3. A `NaN` cell in a pivot table most often means: → **there were zero rows in that row/column combination** correct; distractor: "the value was corrupted" (possible in general, but not the default reason).
4. Why does `total_amount` dominate the correlation matrix with such a high coefficient regardless of any cleaning? → **because it's algebraically built from `fare_amount` plus small additions, not because of any cleaned/uncleaned distinction** correct.

**Bridge:** every technique has now been run once — inspect, clean nulls, validate values, treat outliers, engineer features, and visualize one, two, and many variables at once. Module 9 strings them into one repeatable pipeline over the same dataset, start to finish.

- [ ] **Step 2: Open in browser, confirm the heatmap column multi-select and pivot-table dropdowns recompute without console errors.**

- [ ] **Step 3: Commit**

```bash
git add pandas-eda/modules/08-multivariate-analysis.html
git commit -m "feat: add pandas-eda Module 8 — Multivariate Analysis"
```

---

## Task 12: Module 9 — Capstone: End-to-End EDA Workflow

**Files:**
- Create: `pandas-eda/modules/09-capstone-eda-workflow.html`

Use the Task 4 module as the structural template, nav active link on Module 9. This is the final module — no "next module" bridge at the end (see Step 1).

- [ ] **Step 1: Write the complete module HTML**

**Why:** real EDA isn't 8 isolated tricks — it's a repeatable pipeline: load → clean → engineer → visualize → insight. This module chains every prior module's technique into one pass over `TAXI_SAMPLE_DATA`.

**What / How** — the full pipeline, stage by stage, with the exact row/column counts at each step:

```python
df_clean = df.copy()

# Stage 1 (Module 2): fill missing values
df_clean['passenger_count'] = df_clean['passenger_count'].fillna(df_clean['passenger_count'].mode()[0])
df_clean['RatecodeID']      = df_clean['RatecodeID'].fillna(df_clean['RatecodeID'].mode()[0])
df_clean['airport_fee']     = df_clean['airport_fee'].fillna(0)
print(f"Stage 1 — after fillna: {df_clean.isna().sum().sum()} missing values, {len(df_clean)} rows")

# Stage 2 (Module 3): drop invalid rows
df_clean = df_clean[(df_clean.fare_amount >= 0) & ~((df_clean.trip_distance == 0) & (df_clean.fare_amount > 0))]
print(f"Stage 2 — after dropping invalid rows: {len(df_clean)} rows")

# Stage 3 (Module 4): drop IQR outliers (recomputed on the stage-2 data)
fQ1, fQ3 = df_clean.fare_amount.quantile([0.25, 0.75])
f_upper = fQ3 + 1.5 * (fQ3 - fQ1)
dQ1, dQ3 = df_clean.trip_distance.quantile([0.25, 0.75])
d_upper = dQ3 + 1.5 * (dQ3 - dQ1)
df_clean = df_clean[(df_clean.fare_amount <= f_upper) & (df_clean.trip_distance <= d_upper)]
print(f"Stage 3 — after outlier removal: {len(df_clean)} rows")

# Stage 4 (Module 5): engineer datetime features
df_clean['pickup_datetime'] = pd.to_datetime(df_clean['pickup_datetime'])
df_clean['hour'] = df_clean['pickup_datetime'].dt.hour

# Stage 5 (Modules 6-8): confirm the relationship
print(f"fare vs distance correlation: {df_clean.fare_amount.corr(df_clean.trip_distance):.3f}")
```
Output:
```
Stage 1 — after fillna: 0 missing values, 30 rows
Stage 2 — after dropping invalid rows: 24 rows
Stage 3 — after outlier removal: 20 rows
fare vs distance correlation: 1.000
```

Callout (insight): this pipeline's final cleaned set has **20** rows — 2 more than Module 7's quick one-off filter (18 rows), even though both end up excluding the same outlier/flat-rate ids (6, 18, 24, 26). The difference: ids 10 and 23 had a missing `RatecodeID`. Module 7's ad-hoc filter (`RatecodeID == 1`) dropped them outright, since `NaN == 1` is `False`. This pipeline fixed `RatecodeID` first (Stage 1), so by the time the `RatecodeID` filter would have applied, there was nothing left to drop — both rows survive with a sensible imputed value. Fixing data quality issues *before* filtering preserves more good data than filtering without fixing — the entire reason to follow a pipeline instead of one-off scripts.

**Widget:** step-through "pipeline runner" reusing `makeStepThrough()` from `common.js` — Prev/Next buttons walk through stages 0 (raw) through 4 (final), each step rendering a `.pipeline-step` stat row (row count, column count, missing %, flagged-outlier count) and a one-line takeaway sourced from the table below:

| Stage | Rows | Missing % | Takeaway |
|---|---|---|---|
| 0 — Raw load | 30 | 6.67% × 3 cols | Starting point: 12 columns, 3 partly empty, at least one impossible value visible in `describe()`. |
| 1 — Fillna | 30 | 0% | No rows lost; every column has a usable value. |
| 2 — Drop invalid | 24 | 0% | 2 negative fares + 4 zero-distance-nonzero-fare rows removed. |
| 3 — Drop outliers | 20 | 0% | 2 flat-rate fares + 1 fare glitch + 1 distance glitch removed. |
| 4 — Engineer + visualize | 20 | 0% | fare-vs-distance correlation: 0.001 (raw) → 1.000 (clean). |

**Practice:**
- *Easy* — How many rows does the pipeline drop in total, from raw load to the final stage? **Solution:** 30 - 20 = 10 rows.
- *Medium* — Which two rows survive this pipeline's final stage but were dropped by Module 7's quicker one-off filter, and why? **Solution:** ids 10 and 23 — both had a missing `RatecodeID`. This pipeline imputes it first (Stage 1, mode fill), so they pass the later outlier checks; Module 7's filter checked `RatecodeID == 1` directly against the still-missing value, which is always `False` for `NaN`, dropping them.
- *Hard* — If Stage 3's outlier check ran on the *raw* 30-row data instead of the Stage-2-filtered 24-row data, would the same 4 ids (6, 18, 24, 26) necessarily still be flagged? **Solution:** not necessarily — IQR bounds are recomputed from the data's own quantiles, so including the negative-fare and zero-distance rows (dropped in Stage 2) would shift Q1/Q3 and therefore the fences. In this dataset the two negative values are extreme enough to widen the lower bound without changing which rows are flagged on the *upper* end, so the same 4 ids would still come out — but that's a property of this specific data, not a guarantee; order of pipeline stages can change which rows get flagged.

**Quiz (4 MCQ):**
1. After Stage 1 (fillna), how many missing values remain? → **0** correct.
2. Why does this pipeline retain 20 rows while Module 7's quick filter kept only 18? → **the pipeline imputes missing `RatecodeID` before filtering, so rows 10 and 23 survive instead of being dropped for having `NaN` in that column** correct.
3. What is the overall takeaway of chaining Modules 2 through 8 into one pipeline? → **fixing data quality issues in order, before filtering or visualizing, preserves more legitimate data than ad-hoc one-off filters applied after the fact** correct.
4. The fare-vs-distance correlation goes from 0.001 (raw) to 1.000 (fully cleaned). What does this number alone NOT tell you? → **which specific rows or root causes were responsible for the original near-zero correlation** correct (that required Modules 3, 4, and 7's row-level investigation) — distractors claim the correlation alone reveals causes or row counts.

No "next module" bridge — replace the closing `.bridge` div with a wrap-up message: "This pipeline — load, fill, validate, de-outlier, engineer, visualize — is the same shape you'll reuse on any new dataset. The specific rules change (different domains have different valid ranges); the order of operations doesn't."

- [ ] **Step 2: Open in browser, confirm Prev/Next buttons step through all 5 stages and stat rows update correctly, no console errors.**

- [ ] **Step 3: Commit**

```bash
git add pandas-eda/modules/09-capstone-eda-workflow.html
git commit -m "feat: add pandas-eda Module 9 — Capstone End-to-End EDA Workflow"
```

---

## Task 13: Verify and test

- [ ] **Step 1: Re-run the common.js self-check**

Run: `node pandas-eda/js/common.test.js`
Expected: `All common.js helper checks passed.`

- [ ] **Step 2: Serve the track locally**

```bash
python -m http.server 8000
```

Open `http://localhost:8000/pandas-eda/index.html`.

- [ ] **Step 3: Test checklist**

- Index page loads, all 9 module links work
- Each module loads with no browser console errors
- Dark mode toggle persists across navigating between modules (uses `localStorage`, same as nlp track)
- Hamburger menu opens/closes on mobile-width viewport
- Module 1: Dataset Inspector buttons render head/info/describe/shape/dtypes correctly
- Module 2: missing-value strategy buttons update the table and row count
- Module 3: rule-checklist toggles shrink the row count as expected (30→28→24 depending on combination)
- Module 4: IQR k-slider redraws the boxplot and outlier list
- Module 5: datetime decomposer updates hour/weekday/duration on input change
- Module 6: histogram bin-slider and log-toggle redraw correctly
- Module 7: scatter X/Y picker, outlier-exclude checkbox, and category bar chart all work
- Module 8: correlation heatmap and pivot-table builder both recompute on control change
- Module 9: pipeline step-through Prev/Next walks through all 5 stages
- Quiz options across all 9 modules highlight correct/wrong on click and show feedback
- Practice "Show solution" buttons toggle visibility on all 9 modules
- KaTeX-rendered formulas display correctly in Modules 4 and 5
- Navigation prev/next links between modules are correct and sequential

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address issues found during pandas-eda track verification"
```

