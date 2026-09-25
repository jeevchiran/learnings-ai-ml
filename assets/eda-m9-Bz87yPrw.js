import{u as o,j as e,B as l,C as s,R as r,D as d,a as t,Q as c}from"./index-WYRBR6CI.js";import{P as h}from"./PredictReveal-DnF7AdIF.js";function a(i){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...o(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Capstone — End-to-End EDA Workflow"}),`
`,e.jsx(l,{children:e.jsx(n.p,{children:"Modules 1 to 8 each covered one step in isolation. Doing them in the wrong order quietly corrupts the results, because every step's output is the next step's input. This capstone runs the whole sequence on the taxi sample and explains why the order is what it is."})}),`
`,e.jsx(n.h2,{children:"The EDA Pipeline"}),`
`,e.jsx(h,{prompt:"You compute outlier fences first, then remove the rows with negative fares. Is that equivalent to doing it the other way round?",options:["Yes, the same rows get removed either way","Not necessarily: removing rows changes the data used to compute the quartiles and fences"],correct:1,children:e.jsx(s,{title:"A real EDA project follows a repeatable pipeline",children:e.jsx(n.p,{children:"Each step builds on the previous one — you cannot meaningfully detect outliers if you have not removed invalid values first, and you cannot trust a correlation matrix if the data still contains data-entry errors. The nine steps below map directly to Modules 1–8 of this track."})})}),`
`,e.jsx(r,{items:[{q:"Why must invalid values be removed before outlier fences are computed?",a:"The fences use the current sample quartiles. Removing rows can change either fence, so define and validate the analysis population first. A negative fare does not always move a fence in the same direction."}]}),`
`,e.jsxs(d,{children:[e.jsx(t,{number:1,title:"Load & Inspect — Module 1",children:e.jsxs(n.p,{children:[e.jsx(n.code,{children:"shape"}),", ",e.jsx(n.code,{children:"dtypes"}),", ",e.jsx(n.code,{children:"head()"})," — confirm row count, column types, and a sample of real values."]})}),e.jsx(t,{number:2,title:"Detect Missing Values — Module 2",children:e.jsxs(n.p,{children:[e.jsx(n.code,{children:"isnull().sum()"}),", missing ratio — find which columns have nulls and how many."]})}),e.jsx(t,{number:3,title:"Remove Invalid Data — Module 3",children:e.jsx(n.p,{children:"For this exercise, keep non-negative fares and positive distances. In real records, investigate refunds and canceled trips before treating those values as invalid."})}),e.jsx(t,{number:4,title:"Detect & Treat Outliers — Module 4",children:e.jsx(n.p,{children:"IQR fences, outlier count — flag statistical extremes; use domain knowledge to decide remove vs. cap."})}),e.jsx(t,{number:5,title:"Engineer Features — Module 5",children:e.jsxs(n.p,{children:[e.jsx(n.code,{children:"hour"}),", ",e.jsx(n.code,{children:"day_of_week"}),", ",e.jsx(n.code,{children:"duration_min"})," — convert raw timestamps into numeric signals models can learn from."]})}),e.jsx(t,{number:6,title:"Visualize Distributions — Module 6",children:e.jsx(n.p,{children:"Histogram, boxplot, KDE — examine the shape of each variable one column at a time."})}),e.jsx(t,{number:7,title:"Analyze Relationships — Module 7",children:e.jsx(n.p,{children:"Scatter, Pearson r, heatmap — look at how pairs of variables move together."})}),e.jsx(t,{number:8,title:"Multivariate Deep Dive — Module 8",children:e.jsx(n.p,{children:"Pivot table, color-encoded scatter — introduce a third variable to reveal interactions hidden in bivariate analysis."})}),e.jsx(t,{number:9,title:"Summarize Findings — Capstone",children:e.jsx(n.p,{children:"Synthesize insights across all prior steps into a concise findings report."})})]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Order matters."})," Outlier detection must come after removing invalid values — including or excluding rows can change the quartiles and either fence. Validate domain rules first, document the analysis population, then recompute the summaries. The direction of the change depends on the data."]}),`
`,e.jsx(n.h2,{children:"Full EDA Notebook (Code)"}),`
`,e.jsx(n.p,{children:"The complete EDA in one flowing code block — exactly what a real Jupyter notebook would look like. Each section corresponds to one pipeline step."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# ── 1. Load ──────────────────────────────────────────────────────────────────
df = pd.read_csv('taxi_practice.csv')  # download from Module 1
print(df.shape)          # (30, 12)
print(df.dtypes)
print(df.head())

# ── 2. Missing values ────────────────────────────────────────────────────────
print(df.isnull().sum())
print(df.isnull().mean() * 100)   # percentage missing per column
# passenger_count: 6.67%  |  RatecodeID: 6.67%  |  airport_fee: 6.67%

# ── 3. Invalid values ────────────────────────────────────────────────────────
df = df[df['fare_amount'] >= 0].copy()  # exercise scope: positive-fare trips
df = df[df['trip_distance'] > 0].copy() # exclude zero-distance trips for this analysis
print(f"Rows after cleaning: {len(df)}")   # 24

# ── 4. Outliers (IQR) ────────────────────────────────────────────────────────
Q1 = df['fare_amount'].quantile(0.25)
Q3 = df['fare_amount'].quantile(0.75)
IQR = Q3 - Q1
lower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR
outliers = df[(df['fare_amount'] < lower) | (df['fare_amount'] > upper)]
print(f"Outliers: {len(outliers)}")         # 3  (ids 6, 18, 26)

# ── 5. Feature engineering ───────────────────────────────────────────────────
df['tpep_pickup_datetime']  = pd.to_datetime(df['tpep_pickup_datetime'])
df['tpep_dropoff_datetime'] = pd.to_datetime(df['tpep_dropoff_datetime'])
df['hour']         = df['tpep_pickup_datetime'].dt.hour
df['day_of_week']  = df['tpep_pickup_datetime'].dt.dayofweek
df['duration_min'] = (
    df['tpep_dropoff_datetime'] - df['tpep_pickup_datetime']
).dt.total_seconds() / 60

# ── 6. Distributions ─────────────────────────────────────────────────────────
df['fare_amount'].hist(bins=10)
plt.title('Fare Amount Distribution')
plt.xlabel('fare_amount ($)')
plt.show()

# ── 7. Correlation ───────────────────────────────────────────────────────────
print(df[['fare_amount', 'trip_distance', 'tip_amount']].corr().round(2))

# ── 8. Multivariate ──────────────────────────────────────────────────────────
sns.scatterplot(
    data=df,
    x='trip_distance',
    y='fare_amount',
    hue='RatecodeID'
)
plt.title('Distance vs Fare by Rate Code')
plt.show()
`})}),`
`,e.jsx(n.h2,{children:"Key Findings"}),`
`,e.jsx(n.p,{children:"Based on all pipeline steps applied to the 30-row NYC taxi sample:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"fare_amount"})," is right-skewed"]}),' — median (USD 11.75) is a better "typical fare" than mean (USD 26+), which is pulled up by a single USD 399 anomaly.']}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"2 rows have negative fares"})," (ids 7, 15) — data errors, not real transactions. Removed before analysis."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"4 rows have zero trip distance"})," (ids 5, 11, 20, 30) — likely cancelled trips where meter started but ride did not complete."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"RatecodeID=2 trips explain high-fare outliers"})," — flat-rate USD 45/USD 52 airport fares (ids 6, 18) fall above the IQR fence but are legitimate data, not errors."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"fare_amount"})," and ",e.jsx(n.code,{children:"trip_distance"})," show strong positive correlation"]})," — but confounded by the flat-rate pricing regime. Segment by RatecodeID to see the true per-mile relationship."]}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(s,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"The order is not arbitrary."})," Outlier fences computed before invalid rows are removed are contaminated by them; a correlation matrix computed before cleaning describes the errors as much as the data."]}),`
`,e.jsx(n.li,{children:"Nine steps mapping to Modules 1–8: inspect → missing → invalid → outliers → features → univariate → bivariate → multivariate → report."}),`
`,e.jsxs(n.li,{children:["Cleaning is ",e.jsx(n.strong,{children:"subtractive and irreversible"})," — record what you dropped and why, so row counts reconcile at the end."]}),`
`,e.jsx(n.li,{children:"The deliverable isn't a clean DataFrame, it's a short findings report: what you found, what you changed, what still can't be trusted."}),`
`]})}),`
`,e.jsx(n.h2,{children:"Quiz"}),`
`,e.jsx(n.h3,{children:"Module 9 — Capstone Check"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"1. After removing negative fares AND zero-distance trips from the 30-row dataset, how many rows remain?"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: 26"}),`
`,e.jsx(n.li,{children:"B: 25"}),`
`,e.jsx(n.li,{children:"C: 24 ✓"}),`
`,e.jsx(n.li,{children:"D: 22"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:["2. Which finding best explains why ",e.jsx(n.code,{children:"fare_amount"})," and ",e.jsx(n.code,{children:"trip_distance"})," don't have r = 1.0?"]})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: The dataset is too small"}),`
`,e.jsx(n.li,{children:"B: Fares are rounded to whole dollars"}),`
`,e.jsx(n.li,{children:"C: Flat-rate airport trips (RatecodeID=2) break the distance–fare linear relationship ✓"}),`
`,e.jsx(n.li,{children:"D: Missing values reduce correlation"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:["3. You run ",e.jsx(n.code,{children:"df['fare_amount'].mean()"}),' and get USD 26. The median is USD 11.75. Which is more useful for reporting "typical NYC taxi fare"?']})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: Mean — it uses all data"}),`
`,e.jsx(n.li,{children:"B: Median — it is robust to the USD 399 outlier pulling mean up ✓"}),`
`,e.jsx(n.li,{children:"C: Both equally useful"}),`
`,e.jsx(n.li,{children:"D: Neither — use mode"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"4. In the EDA pipeline, why should outlier detection come AFTER removing invalid values?"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: Pandas requires this order"}),`
`,e.jsx(n.li,{children:"B: Invalid values (negative fares) would distort IQR bounds if included ✓"}),`
`,e.jsx(n.li,{children:"C: Outliers can't be computed from missing data"}),`
`,e.jsx(n.li,{children:"D: The order doesn't matter"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:`5. Which module's technique would you use to investigate "Do airport trips (RatecodeID=2) have different tip patterns across passenger counts"?`})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: Module 2 — Missing Values"}),`
`,e.jsx(n.li,{children:"B: Module 6 — Univariate Visualization"}),`
`,e.jsx(n.li,{children:"C: Module 7 — Bivariate Analysis"}),`
`,e.jsx(n.li,{children:"D: Module 8 — Multivariate Analysis (pivot table with RatecodeID × passenger_count) ✓"}),`
`]}),`
`,e.jsx(r,{items:[{q:"Why must invalid-value removal come BEFORE outlier detection, not after?",a:"Because Tukey fences are computed from Q1 and Q3 of the column as it stands. Leaving a -12.50 fare and a USD 399 meter fault in place shifts those quartiles, so the fences themselves are derived from corrupted data. Clean the known-impossible values first, then let the statistics describe what remains."},{q:"Why is a correlation matrix meaningless on uncleaned data?",a:"Because covariance weights every point by its deviation from the mean, so one 120-mile trip or one USD 399 fare dominates the sum. The resulting r describes the relationship between the errors as much as between the variables — and it can be strongly positive, strongly negative, or near zero depending purely on where the bad points landed."},{q:"You started at 30 rows and finished at 24. What belongs in your report?",a:"The count and reason for every removal — 2 negative fares as impossible values, 4 zero-distance-with-fare rows as suspected cancellations — so the arithmetic reconciles and a reader can disagree with a specific decision. Cleaning is irreversible and subtractive; an unexplained row count is a result nobody can audit."},{q:"What is the actual deliverable of an EDA, if not a cleaned file?",a:"A findings report: what the data contains, which assumptions failed, what was changed and why, and which columns still cannot be trusted. The cleaned DataFrame is a by-product — the judgements are the thing a modeller or stakeholder needs, because they determine what questions the data can legitimately answer."}]}),`
`,e.jsx(c,{question:"After removing 2 negative-fare rows and 4 zero-distance rows from the 30-row NYC taxi sample, how many rows remain?",options:["28","26","24","22"],correct:2})]})}function m(i={}){const{wrapper:n}={...o(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(a,{...i})}):a(i)}export{m as default};
