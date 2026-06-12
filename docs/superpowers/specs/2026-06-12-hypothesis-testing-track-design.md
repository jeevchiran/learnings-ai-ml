# Hypothesis Testing Track — Design Spec
Date: 2026-06-12

## Overview

A fifth interactive learning track added to the existing Learning Modules site. Covers hypothesis testing from first principles through paired t-tests, targeting students with basic statistics background. Built with the same tech stack and visual language as the Regression track for full consistency.

## Goals

- Give students a rigorous, intuitive path through hypothesis testing
- Every topic is anchored to a real-world scenario before any math appears
- Interactive Plotly.js widgets make abstract concepts (rejection regions, p-values, power) tangible
- LaTeX (KaTeX) for all mathematical notation; no plain-text formulas
- No emojis anywhere in the content

## Architecture

### Directory Structure

```
hypothesis-testing/
  index.html                        ← track landing page
  css/style.css                     ← copy of Regression/css/style.css (no color changes)
  js/common.js                      ← copy of Regression/js/common.js + HT-specific stat utils
  modules/
    01-ht-foundations.html
    02-errors-alpha-pvalue.html
    03-one-sample-z.html
    04-two-sample-tests.html
    05-paired-t.html
```

Root `index.html` gains a third card in the 2-column grid (becomes 3-column or wraps) and a module list section for the new track.

### Color Palette

**Same palette as the existing tracks.** No new accent color is introduced. The hypothesis testing track uses the identical CSS custom properties (`--accent-blue: #2563eb` / `#60a5fa` dark mode) so all three tracks feel like one cohesive system.

### External Libraries (same as Regression)

- KaTeX 0.16.9 (math rendering)
- Plotly.js 2.27.0 (interactive charts)

### CSS / JS Approach

- `css/style.css`: direct copy of `Regression/css/style.css`. No modifications needed at the start; any HT-specific styles appended at the bottom under a clear comment block.
- `js/common.js`: copy of `Regression/js/common.js` with additional utilities appended:
  - `normalCDF(z)` — standard normal cumulative distribution
  - `normalPDF(z)` — standard normal density
  - `tCDF(t, df)` — Student t CDF (approximation)
  - `tCritical(alpha, df, tails)` — inverse t lookup (table-based or approximation)
  - `zCritical(alpha, tails)` — inverse normal lookup
  - `pooledStdErr(s1, n1, s2, n2)` — pooled standard error for two-sample tests

---

## Module Breakdown

### Why → What → How Arc

Every module follows this template, in this order:

1. **Bridge box** (`<div class="bridge">`) — opens with a concrete real-world problem that motivates the topic. No math yet.
2. **What section** (`<h2>`) — definitions, LaTeX formulas, concept boxes. Introduces notation.
3. **How section** (`<h2>`) — step-by-step derivation using `.derivation` + `.derivation-step` components. Each step has a formula and a plain-English explanation.
4. **Interactive widget(s)** (`.widget-container`) — Plotly.js, colorful, sliders/dropdowns, live updates.
5. **Real-world worked example** (`.concept-box` or inline prose) — full numerical walk-through of the real-world hook from the bridge.
6. **Practice problem** (`<details>` collapsible) — one problem, answer hidden until clicked.

---

### Module 1: Foundations of Hypothesis Testing (`01-ht-foundations.html`)

**Real-world hook:** A pharmaceutical company claims a new drug reduces recovery time from 10 days to 8 days. How do we decide whether to believe them?

**Topics:**
- What is statistical inference and why we need formal testing
- Null hypothesis H0 and alternative hypothesis H1 — definitions and how to write them
- The decision framework: test statistic → distribution → decision rule
- One-tailed vs two-tailed tests
- The role of the test statistic (conceptual, no specific distribution yet)

**Widget:** Decision Framework Visualizer — student picks a scenario from a dropdown (drug trial, quality control, marketing test), the widget highlights H0, H1, and the decision boundary on a generic distribution curve. No math, just logic.

**Practice problem:** Write H0 and H1 for: "A new teaching method is claimed to improve exam scores above the historical average of 72."

---

### Module 2: Errors, Alpha, p-value, and Critical Value Method (`02-errors-alpha-pvalue.html`)

**Real-world hook:** A jury must decide "guilty" or "not guilty." Two types of mistakes are possible: convicting an innocent person (Type I) or acquitting a guilty one (Type II). Statistics has exactly the same structure.

**Topics:**
- Type I error (false positive, alpha) and Type II error (false negative, beta)
- Statistical power (1 - beta) and why it matters
- The significance level alpha: how to choose it and what it commits you to
- The p-value: definition (probability of data this extreme under H0), how to interpret it, common misconceptions
- Critical value method: find the threshold, compare the test statistic
- Relationship between p-value method and critical value method (they always agree)

**Widgets:**
1. **Error Region Visualizer** — normal distribution with sliders for alpha and true effect size (delta). Type I error region shaded red; Type II shaded blue. Power labeled. Updates live.
2. **p-value Live Viewer** — drag a test statistic along the x-axis; the shaded tail area (p-value) updates in real time. Toggle one-tailed/two-tailed.
3. **Critical Value Explorer** — set alpha and tails; critical value lines appear and the rejection region shades.

**Practice problem:** In a drug trial with alpha=0.05, you compute p=0.03. What is your decision? Now suppose the true effect exists — which error type is now irrelevant?

---

### Module 3: One-Sample Z-Test (`03-one-sample-z.html`)

**Real-world hook:** A cereal factory sets machines to fill boxes to exactly 500g. Quality control samples 40 boxes and finds the sample mean is 497g with known population std dev 8g. Is the machine off?

**Topics:**
- When to use a Z-test (sigma known, or n large enough for CLT)
- The Z test statistic: derivation from the sampling distribution of the mean
- Full step-by-step procedure: state hypotheses → choose alpha → compute Z → find p-value or critical value → decide → conclude in context
- Confidence intervals and their relationship to hypothesis tests
- Sample size and its effect on power

**Math (KaTeX):**
- Sampling distribution: X-bar ~ N(mu, sigma^2/n)
- Z statistic: Z = (X-bar - mu0) / (sigma / sqrt(n))
- Decision rule for both p-value method and critical value method

**Widgets:**
1. **Z-Test Simulator** — sliders for mu0, sigma, n, x-bar. Displays computed Z, p-value, decision (Reject / Fail to Reject), and a normal curve with the test statistic marked and rejection region shaded.
2. **Sample Size vs Power** — fix mu0, mu_true, sigma, alpha; drag n slider; watch the power value and power curve change.

**Worked example:** Full numerical solution to the cereal factory problem, including conclusion written in plain English.

**Practice problem:** A city claims its bus arrival mean delay is 5 minutes (sigma=2 min). A sample of 36 trips gives x-bar=5.8 min. Test at alpha=0.05.

---

### Module 4: Two-Sample Tests — Z-Test, t-Test, and A/B Testing (`04-two-sample-tests.html`)

**Real-world hook:** A marketing team tests two email subject lines: version A (sent to 200 users) gets a 12% click rate, version B (sent to 200 users) gets 15%. Is the difference real or noise? This is an A/B test — and it is a two-sample hypothesis test.

**Topics:**
- When you have two populations: the structure of two-sample testing
- Two-population Z-test (both sigmas known): test statistic derivation
- Two-sample independent t-test (sigmas unknown): Welch's t, degrees of freedom
- A/B testing as a specific application of two-sample testing
- Equal vs unequal variance assumption; when it matters
- Effect size (Cohen's d) — statistical vs practical significance

**Math (KaTeX):**
- Two-sample Z: Z = (X-bar1 - X-bar2 - delta0) / sqrt(sigma1^2/n1 + sigma2^2/n2)
- Welch's t: t = (X-bar1 - X-bar2) / sqrt(s1^2/n1 + s2^2/n2), with Welch-Satterthwaite df
- Cohen's d: d = (mu1 - mu2) / s_pooled

**Widgets:**
1. **Two-Distribution Overlap** — two normal curves on the same axis, sliders for mu1, mu2, sigma1, sigma2. Shaded overlap region updates live. Shows what "effect size" looks like geometrically.
2. **A/B Test Live Simulator** — press "Run trial" to simulate conversions for group A and B one by one. Watch the p-value update in real time. Shows when significance is reached (or not). Slider for true conversion rates.

**Worked example:** Full numerical A/B test for the email scenario, including Cohen's d and the distinction between statistical and practical significance.

**Practice problem:** Group A: n=50, x-bar=82, s=10. Group B: n=60, x-bar=78, s=12. Test at alpha=0.01 whether means differ.

---

### Module 5: Paired t-Test (`05-paired-t.html`)

**Real-world hook:** A doctor measures each patient's blood pressure before and after a 12-week treatment. Are measurements before and after independent? No — they come from the same person. A paired test uses this structure to gain power.

**Topics:**
- Why pairing matters: removing between-subject variability
- The paired design vs independent samples — when each is appropriate
- Reduction to a one-sample t-test on the differences di = x1i - x2i
- The paired t test statistic: derivation
- Assumptions: normality of differences, random sampling
- Interpreting results in context

**Math (KaTeX):**
- d-bar = (1/n) sum(di)
- sd = sample std dev of differences
- t = d-bar / (sd / sqrt(n)), df = n-1

**Widgets:**
1. **Paired Difference Visualizer** — shows n subjects as dots; before values on left, after on right, connected by lines. Color of line = direction of change. Below, the difference distribution builds as n increases (slider). t-statistic and p-value update live.
2. **Paired vs Independent Comparison** — same data, same test, side-by-side: shows how the paired test yields a smaller SE and smaller p-value, demonstrating its power advantage.

**Worked example:** 8 patients, before/after systolic BP readings. Full step-by-step paired t computation with KaTeX, conclusion in clinical context.

**Practice problem:** 6 students take a test before and after tutoring. Differences: [5, 3, 8, -1, 4, 6]. Test at alpha=0.05 whether tutoring improved scores.

---

## Root index.html Changes

- Add "Hypothesis Testing" as a third card in the course track grid. The grid column definition changes from `1fr 1fr` to `repeat(auto-fit, minmax(280px, 1fr))` so all three cards lay out naturally on wide screens and stack on narrow ones.
- Add a "Hypothesis Testing" module list section below the Regression section, with links to all 5 modules and one-line descriptions

---

## Out of Scope

- No Jupyter notebook labs (can be added later)
- No server-side components; everything runs in the browser
- No build tool or bundler; raw HTML/CSS/JS files

---

## Success Criteria

- All 5 module HTML files render correctly in Chrome/Firefox
- KaTeX renders all math without errors
- All Plotly.js widgets respond to slider/dropdown input with no console errors
- Dark mode toggle works across all pages
- Navigation bar links between modules are correct
- Root index.html correctly links to the track and all 5 modules
- Practice problem answers hidden by default, visible on click
