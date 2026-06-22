import{u as r,j as e,C as l,D as t,a as s,Q as d}from"./index-VIW80S6x.js";function a(i){const n={annotation:"annotation",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",math:"math",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",ol:"ol",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",ul:"ul",...r(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Capstone — End-to-End EDA Workflow"}),`
`,e.jsx(n.h2,{children:"The EDA Pipeline"}),`
`,e.jsx(l,{title:"A real EDA project follows a repeatable pipeline",children:e.jsx(n.p,{children:"Each step builds on the previous one — you cannot meaningfully detect outliers if you have not removed invalid values first, and you cannot trust a correlation matrix if the data still contains data-entry errors. The nine steps below map directly to Modules 1–8 of this track."})}),`
`,e.jsxs(t,{children:[e.jsx(s,{number:1,title:"Load & Inspect — Module 1",children:e.jsxs(n.p,{children:[e.jsx(n.code,{children:"shape"}),", ",e.jsx(n.code,{children:"dtypes"}),", ",e.jsx(n.code,{children:"head()"})," — confirm row count, column types, and a sample of real values."]})}),e.jsx(s,{number:2,title:"Detect Missing Values — Module 2",children:e.jsxs(n.p,{children:[e.jsx(n.code,{children:"isnull().sum()"}),", missing ratio — find which columns have nulls and how many."]})}),e.jsx(s,{number:3,title:"Remove Invalid Data — Module 3",children:e.jsx(n.p,{children:"Negative fares, zero distances — apply domain-rule boolean masks to remove logically impossible rows."})}),e.jsx(s,{number:4,title:"Detect & Treat Outliers — Module 4",children:e.jsx(n.p,{children:"IQR fences, outlier count — flag statistical extremes; use domain knowledge to decide remove vs. cap."})}),e.jsx(s,{number:5,title:"Engineer Features — Module 5",children:e.jsxs(n.p,{children:[e.jsx(n.code,{children:"hour"}),", ",e.jsx(n.code,{children:"day_of_week"}),", ",e.jsx(n.code,{children:"duration_min"})," — convert raw timestamps into numeric signals models can learn from."]})}),e.jsx(s,{number:6,title:"Visualize Distributions — Module 6",children:e.jsx(n.p,{children:"Histogram, boxplot, KDE — examine the shape of each variable one column at a time."})}),e.jsx(s,{number:7,title:"Analyze Relationships — Module 7",children:e.jsx(n.p,{children:"Scatter, Pearson r, heatmap — look at how pairs of variables move together."})}),e.jsx(s,{number:8,title:"Multivariate Deep Dive — Module 8",children:e.jsx(n.p,{children:"Pivot table, color-encoded scatter — introduce a third variable to reveal interactions hidden in bivariate analysis."})}),e.jsx(s,{number:9,title:"Summarize Findings — Capstone",children:e.jsx(n.p,{children:"Synthesize insights across all prior steps into a concise findings report."})})]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Order matters."})," Outlier detection must come after removing invalid values — a negative fare of ",e.jsx(n.code,{children:"-$12.50"})," would distort the IQR bounds and push the lower fence further negative, hiding genuine outliers. Always clean before you analyze."]}),`
`,e.jsx(n.h2,{children:"Full EDA Notebook (Code)"}),`
`,e.jsx(n.p,{children:"The complete EDA in one flowing code block — exactly what a real Jupyter notebook would look like. Each section corresponds to one pipeline step."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# ── 1. Load ──────────────────────────────────────────────────────────────────
df = pd.read_csv('nyc_taxi_sample.csv')
print(df.shape)          # (30, 11)
print(df.dtypes)
print(df.head())

# ── 2. Missing values ────────────────────────────────────────────────────────
print(df.isnull().sum())
print(df.isnull().mean() * 100)   # percentage missing per column
# passenger_count: 6.67%  |  RatecodeID: 6.67%  |  airport_fee: 6.67%

# ── 3. Invalid values ────────────────────────────────────────────────────────
df = df[df['fare_amount'] >= 0]     # remove negative fares  (ids 7, 15)
df = df[df['trip_distance'] > 0]   # remove zero-distance trips (ids 5, 11, 20, 30)
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
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"fare_amount"})," is right-skewed"]})," — median (",e.jsxs(n.span,{className:"katex",children:[e.jsx(n.span,{className:"katex-mathml",children:e.jsx(n.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(n.semantics,{children:[e.jsxs(n.mrow,{children:[e.jsx(n.mn,{children:"11.75"}),e.jsx(n.mo,{stretchy:"false",children:")"}),e.jsx(n.mi,{children:"i"}),e.jsx(n.mi,{children:"s"}),e.jsx(n.mi,{children:"a"}),e.jsx(n.mi,{children:"b"}),e.jsx(n.mi,{children:"e"}),e.jsx(n.mi,{children:"t"}),e.jsx(n.mi,{children:"t"}),e.jsx(n.mi,{children:"e"}),e.jsx(n.mi,{children:"r"}),e.jsx(n.mi,{mathvariant:"normal",children:'"'}),e.jsx(n.mi,{children:"t"}),e.jsx(n.mi,{children:"y"}),e.jsx(n.mi,{children:"p"}),e.jsx(n.mi,{children:"i"}),e.jsx(n.mi,{children:"c"}),e.jsx(n.mi,{children:"a"}),e.jsx(n.mi,{children:"l"}),e.jsx(n.mi,{children:"f"}),e.jsx(n.mi,{children:"a"}),e.jsx(n.mi,{children:"r"}),e.jsx(n.mi,{children:"e"}),e.jsx(n.mi,{mathvariant:"normal",children:'"'}),e.jsx(n.mi,{children:"t"}),e.jsx(n.mi,{children:"h"}),e.jsx(n.mi,{children:"a"}),e.jsx(n.mi,{children:"n"}),e.jsx(n.mi,{children:"m"}),e.jsx(n.mi,{children:"e"}),e.jsx(n.mi,{children:"a"}),e.jsx(n.mi,{children:"n"}),e.jsx(n.mo,{stretchy:"false",children:"("})]}),e.jsx(n.annotation,{encoding:"application/x-tex",children:'11.75) is a better "typical fare" than mean ('})]})})}),e.jsx(n.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(n.span,{className:"base",children:[e.jsx(n.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(n.span,{className:"mord",children:"11.75"}),e.jsx(n.span,{className:"mclose",children:")"}),e.jsx(n.span,{className:"mord mathnormal",children:"i"}),e.jsx(n.span,{className:"mord mathnormal",children:"s"}),e.jsx(n.span,{className:"mord mathnormal",children:"ab"}),e.jsx(n.span,{className:"mord mathnormal",children:"e"}),e.jsx(n.span,{className:"mord mathnormal",children:"tt"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0278em"},children:"er"}),e.jsx(n.span,{className:"mord",children:'"'}),e.jsx(n.span,{className:"mord mathnormal",children:"t"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0359em"},children:"y"}),e.jsx(n.span,{className:"mord mathnormal",children:"p"}),e.jsx(n.span,{className:"mord mathnormal",children:"i"}),e.jsx(n.span,{className:"mord mathnormal",children:"c"}),e.jsx(n.span,{className:"mord mathnormal",children:"a"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0197em"},children:"l"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.1076em"},children:"f"}),e.jsx(n.span,{className:"mord mathnormal",children:"a"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0278em"},children:"r"}),e.jsx(n.span,{className:"mord mathnormal",children:"e"}),e.jsx(n.span,{className:"mord",children:'"'}),e.jsx(n.span,{className:"mord mathnormal",children:"t"}),e.jsx(n.span,{className:"mord mathnormal",children:"hanm"}),e.jsx(n.span,{className:"mord mathnormal",children:"e"}),e.jsx(n.span,{className:"mord mathnormal",children:"an"}),e.jsx(n.span,{className:"mopen",children:"("})]})})]}),"26+), which is pulled up by a single $399 anomaly."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"2 rows have negative fares"})," (ids 7, 15) — data errors, not real transactions. Removed before analysis."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"4 rows have zero trip distance"})," (ids 5, 11, 20, 30) — likely cancelled trips where meter started but ride did not complete."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"RatecodeID=2 trips explain high-fare outliers"})," — flat-rate ",e.jsxs(n.span,{className:"katex",children:[e.jsx(n.span,{className:"katex-mathml",children:e.jsx(n.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(n.semantics,{children:[e.jsxs(n.mrow,{children:[e.jsx(n.mn,{children:"45"}),e.jsx(n.mi,{mathvariant:"normal",children:"/"})]}),e.jsx(n.annotation,{encoding:"application/x-tex",children:"45/"})]})})}),e.jsx(n.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(n.span,{className:"base",children:[e.jsx(n.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(n.span,{className:"mord",children:"45/"})]})})]}),"52 airport fares (ids 6, 18) fall above the IQR fence but are legitimate data, not errors."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"fare_amount"})," and ",e.jsx(n.code,{children:"trip_distance"})," show strong positive correlation"]})," — but confounded by the flat-rate pricing regime. Segment by RatecodeID to see the true per-mile relationship."]}),`
`]}),`
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
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:["3. You run ",e.jsx(n.code,{children:"df['fare_amount'].mean()"})," and get ",e.jsxs(n.span,{className:"katex",children:[e.jsx(n.span,{className:"katex-mathml",children:e.jsx(n.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(n.semantics,{children:[e.jsxs(n.mrow,{children:[e.jsx(n.mn,{children:"26."}),e.jsx(n.mi,{children:"T"}),e.jsx(n.mi,{children:"h"}),e.jsx(n.mi,{children:"e"}),e.jsx(n.mi,{children:"m"}),e.jsx(n.mi,{children:"e"}),e.jsx(n.mi,{children:"d"}),e.jsx(n.mi,{children:"i"}),e.jsx(n.mi,{children:"a"}),e.jsx(n.mi,{children:"n"}),e.jsx(n.mi,{children:"i"}),e.jsx(n.mi,{children:"s"})]}),e.jsx(n.annotation,{encoding:"application/x-tex",children:"26. The median is "})]})})}),e.jsx(n.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(n.span,{className:"base",children:[e.jsx(n.span,{className:"strut",style:{height:"0.6944em"}}),e.jsx(n.span,{className:"mord",children:"26."}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.1389em"},children:"T"}),e.jsx(n.span,{className:"mord mathnormal",children:"h"}),e.jsx(n.span,{className:"mord mathnormal",children:"e"}),e.jsx(n.span,{className:"mord mathnormal",children:"m"}),e.jsx(n.span,{className:"mord mathnormal",children:"e"}),e.jsx(n.span,{className:"mord mathnormal",children:"d"}),e.jsx(n.span,{className:"mord mathnormal",children:"iani"}),e.jsx(n.span,{className:"mord mathnormal",children:"s"})]})})]}),'11.75. Which is more useful for reporting "typical NYC taxi fare"?']})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: Mean — it uses all data"}),`
`,e.jsx(n.li,{children:"B: Median — it is robust to the $399 outlier pulling mean up ✓"}),`
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
`,e.jsx(d,{question:"After removing 2 negative-fare rows and 4 zero-distance rows from the 30-row NYC taxi sample, how many rows remain?",options:["28","26","24","22"],correct:2})]})}function c(i={}){const{wrapper:n}={...r(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(a,{...i})}):a(i)}export{c as default};
