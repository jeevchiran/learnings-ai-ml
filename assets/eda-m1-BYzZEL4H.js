import{u as t,j as e,C as l,B as a,D as o,a as i,Q as d}from"./index-VIW80S6x.js";function r(s){const n={annotation:"annotation",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",li:"li",math:"math",mi:"mi",mn:"mn",mrow:"mrow",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",ul:"ul",...t(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"EDA Foundations & First Look"}),`
`,e.jsx(n.h2,{children:"Why This Topic?"}),`
`,e.jsx(n.p,{children:"You can't clean what you don't understand. Before dropping a single missing value or capping a single outlier, every analyst starts in the same place: looking at the raw shape of the data. Skip this step and every later decision — which column to fix, which fill strategy to use, which rows to drop — is a guess instead of a judgment call."}),`
`,e.jsxs(n.p,{children:["The dataset used throughout this track is a small sample of NYC yellow-taxi trips: ",e.jsx(n.strong,{children:"30 rows, 12 columns"}),", drawn from a single day in March 2023. This mirrors the source notebook's own strategy of hourly-sampling a much larger trip log down to a size that's easy to inspect by eye — small enough to print in full, large enough to already contain a missing value, a zero-distance trip, and a fare that shouldn't be possible."]}),`
`,e.jsx(l,{title:"The dataset, end to end",children:e.jsxs(n.p,{children:["Each row is one taxi trip. Columns cover identifiers (",e.jsx(n.code,{children:"id"}),"), timestamps (",e.jsx(n.code,{children:"pickup"}),", ",e.jsx(n.code,{children:"dropoff"}),"), trip facts (",e.jsx(n.code,{children:"passenger_count"}),", ",e.jsx(n.code,{children:"trip_distance"}),", ",e.jsx(n.code,{children:"RatecodeID"}),", ",e.jsx(n.code,{children:"payment_type"}),"), money (",e.jsx(n.code,{children:"fare_amount"}),", ",e.jsx(n.code,{children:"tip_amount"}),", ",e.jsx(n.code,{children:"total_amount"}),", ",e.jsx(n.code,{children:"airport_fee"}),"), and geography (",e.jsx(n.code,{children:"PUBorough"}),", ",e.jsx(n.code,{children:"DOBorough"}),"). Every module in this track reuses this exact sample."]})}),`
`,e.jsx(a,{children:e.jsxs(n.p,{children:["Before touching any of that, we need the five methods every pandas session opens with: ",e.jsx(n.code,{children:".shape"}),", ",e.jsx(n.code,{children:".dtypes"}),", ",e.jsx(n.code,{children:".head()"}),", ",e.jsx(n.code,{children:".info()"}),", and ",e.jsx(n.code,{children:".describe()"}),"."]})}),`
`,e.jsx(n.h2,{children:"What / How — First-Look Methods"}),`
`,e.jsx(n.p,{children:'Every pandas exploratory session starts with the same handful of calls. Each answers a different question about the DataFrame, and together they form a quick "vitals check" before any cleaning begins.'}),`
`,e.jsxs(o,{children:[e.jsx(i,{number:1,title:".shape — how big is this?",children:e.jsxs(n.p,{children:["Returns a tuple ",e.jsx(n.code,{children:"(n_rows, n_columns)"}),". The very first thing to check: does the row count match what you expected to load? Did a join silently multiply or drop rows?"]})}),e.jsx(i,{number:2,title:".dtypes — what type is each column?",children:e.jsxs(n.p,{children:["Returns the storage type pandas inferred for every column: ",e.jsx(n.code,{children:"int64"}),", ",e.jsx(n.code,{children:"float64"}),", ",e.jsx(n.code,{children:"object"})," (usually strings), ",e.jsx(n.code,{children:"datetime64"}),", and so on. A column you expect to be numeric but that shows up as ",e.jsx(n.code,{children:"object"})," usually means it contains stray text or mixed formatting."]})}),e.jsx(i,{number:3,title:".head(n) — what does a row actually look like?",children:e.jsxs(n.p,{children:["Prints the first ",e.jsx(n.code,{children:"n"}),' rows (default 5). Numbers and dtypes are abstract; seeing real values grounds your intuition for what "normal" looks like in this dataset.']})}),e.jsx(i,{number:4,title:".info() — dtypes and completeness together",children:e.jsxs(n.p,{children:["Combines ",e.jsx(n.code,{children:".dtypes"})," with a non-null count per column and total memory usage. This is the fastest way to spot missing data: if a column's non-null count is less than the row count, it has nulls."]})}),e.jsx(i,{number:5,title:".describe() — summary statistics",children:e.jsx(n.p,{children:"For numeric columns: count, mean, std, min, the 25/50/75% quantiles, and max. This is where shape problems (skew) and correctness problems (impossible values) first become visible — often before you've looked at a single row."})})]}),`
`,e.jsx(n.p,{children:"Run the first check — confirm the dataset is the size we expect:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import pandas as pd
df = pd.read_parquet("yellow_tripdata_2023-03_sample.parquet")
print(df.shape)
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`(30, 12)
`})}),`
`,e.jsx(n.p,{children:"30 rows confirms we have the expected sample; 12 columns confirms no columns were dropped or merged unexpectedly during loading. Now look at one numeric column's summary statistics in detail:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`print(df.describe()[['fare_amount']])
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`       fare_amount
count        30.00
mean          26.17
std           71.57
min          -12.50
25%            6.125
50%           11.75
75%           19.125
max          399.00
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"The mean is more than double the median."})," Mean fare (26.17) is more than double the median fare (11.75). When mean and median diverge this much, it's a strong hint the column is ",e.jsx(n.strong,{children:"right-skewed"})," — a few extreme values are pulling the average up while the median, which only cares about the middle-ranked value, stays low. Flag this now; Module 4 (Outlier Detection) explains exactly which rows are responsible and why."]}),`
`,e.jsxs(n.p,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"min"})," is negative."]})," The minimum fare is ",e.jsx(n.strong,{children:"-12.50"}),". A taxi fare cannot be negative — this isn't a distribution quirk like skew, it's a data error (likely a refund or trip-correction record that leaked into the fare column). Module 3 (Data Quality & Invalid Values) deals with rows like this directly."]}),`
`,e.jsx(a,{children:e.jsx(n.p,{children:"Reading these five outputs by hand is fine for one column. The widget below lets you flip between all five views of the full 30-row sample on demand."})}),`
`,e.jsx(n.h2,{children:"Practice"}),`
`,e.jsxs(n.h3,{children:["Problem 1: Reading ",e.jsx(n.code,{children:".shape"})]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"df.shape"})," returns ",e.jsx(n.code,{children:"(30, 12)"}),". What do the two numbers mean?"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," ",e.jsx(n.strong,{children:"30"})," rows — one per taxi trip in the sample. ",e.jsx(n.strong,{children:"12"})," columns — one per recorded field per trip (timestamps, fare amounts, passenger count, borough, and so on). ",e.jsx(n.code,{children:".shape"})," always returns ",e.jsx(n.code,{children:"(n_rows, n_columns)"})," in that order, matching NumPy's array-shape convention that pandas builds on."]}),`
`,e.jsx(n.h3,{children:"Problem 2: Mean vs. Median Gap"}),`
`,e.jsxs(n.p,{children:["Given mean = 26.17 and median = 11.75 for ",e.jsx(n.code,{children:"fare_amount"}),", what does the gap suggest about the distribution's shape, and which row do you suspect is driving it?"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," The distribution is ",e.jsx(n.strong,{children:"right-skewed"}),": a few very large fares pull the mean well above the median, while the median — being robust to outliers, since it only depends on rank order — stays close to where most of the data sits. The dataset's ",e.jsx(n.strong,{children:"max (399.00)"})," is the prime suspect. One ",e.jsxs(n.span,{className:"katex",children:[e.jsx(n.span,{className:"katex-mathml",children:e.jsx(n.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(n.semantics,{children:[e.jsxs(n.mrow,{children:[e.jsx(n.mn,{children:"399"}),e.jsx(n.mi,{children:"f"}),e.jsx(n.mi,{children:"a"}),e.jsx(n.mi,{children:"r"}),e.jsx(n.mi,{children:"e"}),e.jsx(n.mi,{children:"s"}),e.jsx(n.mi,{children:"i"}),e.jsx(n.mi,{children:"t"}),e.jsx(n.mi,{children:"t"}),e.jsx(n.mi,{children:"i"}),e.jsx(n.mi,{children:"n"}),e.jsx(n.mi,{children:"g"}),e.jsx(n.mi,{children:"a"}),e.jsx(n.mi,{children:"m"}),e.jsx(n.mi,{children:"o"}),e.jsx(n.mi,{children:"n"}),e.jsx(n.mi,{children:"g"}),e.jsx(n.mi,{children:"m"}),e.jsx(n.mi,{children:"o"}),e.jsx(n.mi,{children:"s"}),e.jsx(n.mi,{children:"t"}),e.jsx(n.mi,{children:"l"}),e.jsx(n.mi,{children:"y"})]}),e.jsx(n.annotation,{encoding:"application/x-tex",children:"399 fare sitting among mostly "})]})})}),e.jsx(n.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(n.span,{className:"base",children:[e.jsx(n.span,{className:"strut",style:{height:"0.8889em",verticalAlign:"-0.1944em"}}),e.jsx(n.span,{className:"mord",children:"399"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.1076em"},children:"f"}),e.jsx(n.span,{className:"mord mathnormal",children:"a"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0278em"},children:"r"}),e.jsx(n.span,{className:"mord mathnormal",children:"es"}),e.jsx(n.span,{className:"mord mathnormal",children:"i"}),e.jsx(n.span,{className:"mord mathnormal",children:"tt"}),e.jsx(n.span,{className:"mord mathnormal",children:"in"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0359em"},children:"g"}),e.jsx(n.span,{className:"mord mathnormal",children:"am"}),e.jsx(n.span,{className:"mord mathnormal",children:"o"}),e.jsx(n.span,{className:"mord mathnormal",children:"n"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0359em"},children:"g"}),e.jsx(n.span,{className:"mord mathnormal",children:"m"}),e.jsx(n.span,{className:"mord mathnormal",children:"os"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0197em"},children:"tl"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0359em"},children:"y"})]})})]}),"3–$30 fares pulls the mean up substantially, while the median barely moves because it only looks at the middle-ranked value."]}),`
`,e.jsxs(n.h3,{children:["Problem 3: Why Is ",e.jsx(n.code,{children:"RatecodeID"})," a Float?"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:".info()"})," reports ",e.jsx(n.code,{children:"RatecodeID"})," as ",e.jsx(n.code,{children:"float64"}),", even though rate codes are small whole numbers (1, 2, 3...). Why would pandas store whole numbers as floats?"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," The column has ",e.jsx(n.strong,{children:"missing values"})," (",e.jsx(n.code,{children:"NaN"}),"), and NumPy's ",e.jsx(n.code,{children:"int64"})," dtype has no representation for ",e.jsx(n.code,{children:"NaN"})," — only floating-point dtypes can hold it (",e.jsx(n.code,{children:"NaN"})," is an IEEE-754 float concept). When pandas builds a column that mixes whole numbers with missing values, it silently ",e.jsx(n.strong,{children:"upcasts"})," the entire column to ",e.jsx(n.code,{children:"float64"})," so the nulls have somewhere to live."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`print(pd.array([1, 2, None]))
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`<IntegerArray>
[1, 2, <NA>]
Length: 3, dtype: Int64
`})}),`
`,e.jsxs(n.p,{children:["Even pandas's own nullable ",e.jsx(n.code,{children:"Int64"}),' extension type (capital "I") needs a special sentinel ',e.jsx(n.code,{children:"<NA>"})," to do this — the plain NumPy-backed ",e.jsx(n.code,{children:"int64"}),' (lowercase "i") that ',e.jsx(n.code,{children:"read_parquet"})," defaults to cannot represent missingness at all, so it falls back to ",e.jsx(n.code,{children:"float64"})," and uses ",e.jsx(n.code,{children:"NaN"})," instead."]}),`
`,e.jsx(n.h2,{children:"Quiz"}),`
`,e.jsx(n.h3,{children:"Module 1 — Check Your Understanding"}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:["1. What does ",e.jsx(n.code,{children:"df.shape"})," return?"]})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: (rows, columns) ✓"}),`
`,e.jsx(n.li,{children:"B: (columns, rows)"}),`
`,e.jsx(n.li,{children:"C: The total cell count"}),`
`,e.jsx(n.li,{children:"D: The column names"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:["2. Which single method shows dtypes ",e.jsx(n.em,{children:"and"})," non-null counts together?"]})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: .describe()"}),`
`,e.jsx(n.li,{children:"B: .head()"}),`
`,e.jsx(n.li,{children:"C: .info() ✓"}),`
`,e.jsx(n.li,{children:"D: .shape"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:["3. By default, when a DataFrame mixes numeric and text columns, ",e.jsx(n.code,{children:".describe()"})," summarizes:"]})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: All columns, numeric and text alike"}),`
`,e.jsx(n.li,{children:"B: Only the numeric columns ✓"}),`
`,e.jsx(n.li,{children:"C: Only the text columns"}),`
`,e.jsx(n.li,{children:"D: Only the index"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:["4. Why is ",e.jsx(n.code,{children:"fare_amount"}),"'s mean (26.17) so much higher than its median (11.75) in this sample?"]})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: The sample size (30 rows) is too small for mean and median to agree"}),`
`,e.jsx(n.li,{children:"B: A few large outlier fares pull the mean up; the median is robust to outliers ✓"}),`
`,e.jsx(n.li,{children:"C: pandas rounds the median down by convention"}),`
`,e.jsx(n.li,{children:"D: Mean and median are always different for floating-point columns"}),`
`]}),`
`,e.jsx(a,{children:e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"What's next: how much data is actually here?"})," ",e.jsx(n.code,{children:".describe()"})," already flagged something off — a $399 fare and a negative one. Before trusting any of these numbers, find out how much of the data is even there to compute on. Module 2 starts with missing values."]})}),`
`,e.jsx(d,{question:"What does df.shape return?",options:["A list of column names","A tuple (rows, columns)","The data types of each column","Summary statistics"],correct:1})]})}function c(s={}){const{wrapper:n}={...t(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(r,{...s})}):r(s)}export{c as default};
