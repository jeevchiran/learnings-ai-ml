import{u as l,j as e,C as i,B as a,R as r,D as d,a as t,Q as c}from"./index-WYRBR6CI.js";import{P as h}from"./PredictReveal-DnF7AdIF.js";function o(s){const n={code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...l(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"EDA Foundations & First Look"}),`
`,e.jsx(i,{title:"Before you start",children:e.jsx(n.p,{children:"You need basic Python — lists, dictionaries, calling a method on an object — and nothing else. No statistics is assumed; the few summary numbers that appear are explained where they are used. This is the track everything else in the curriculum starts from, because every model begins with a table someone had to understand first."})}),`
`,e.jsx(n.h2,{children:"Why This Topic?"}),`
`,e.jsx(n.p,{children:"You can't clean what you don't understand. Before dropping a single missing value or capping a single outlier, every analyst starts in the same place: looking at the raw shape of the data. Skip this step and every later decision — which column to fix, which fill strategy to use, which rows to drop — is a guess instead of a judgment call."}),`
`,e.jsxs(n.p,{children:["Use the supplied ",e.jsx(n.strong,{children:"synthetic taxi practice dataset: 30 rows and 12 columns"}),". It deliberately includes missing values, zero-distance trips, negative amounts and one unusually large fare. It is teaching data, not a real NYC trip extract or a source of current fare rules. Worked questions later in the track state their own inputs; compute actual outputs when running the practice data."]}),`
`,e.jsx(i,{title:"Before running the Python examples",children:e.jsxs(n.p,{children:["Install ",e.jsx(n.code,{children:"pandas"}),", ",e.jsx(n.code,{children:"matplotlib"})," and ",e.jsx(n.code,{children:"seaborn"})," in your notebook environment. ",e.jsx("a",{href:"/learnings-ai-ml/data/taxi_practice.csv",download:!0,children:"Download taxi_practice.csv"})," and save it in the same folder as your notebook. Run the loading cell below first; later examples reuse the variable ",e.jsx(n.code,{children:"df"}),". Restarting the notebook clears that variable, so rerun the earlier cells after a restart."]})}),`
`,e.jsx(i,{title:"The dataset, end to end",children:e.jsxs(n.p,{children:["Each row represents one synthetic trip. Columns cover ",e.jsx(n.code,{children:"id"}),", ",e.jsx(n.code,{children:"tpep_pickup_datetime"}),", ",e.jsx(n.code,{children:"tpep_dropoff_datetime"}),", trip facts (",e.jsx(n.code,{children:"passenger_count"}),", ",e.jsx(n.code,{children:"trip_distance"}),", ",e.jsx(n.code,{children:"RatecodeID"}),", ",e.jsx(n.code,{children:"payment_type"}),"), money (",e.jsx(n.code,{children:"fare_amount"}),", ",e.jsx(n.code,{children:"tip_amount"}),", ",e.jsx(n.code,{children:"airport_fee"}),"), and geography (",e.jsx(n.code,{children:"PUBorough"}),", ",e.jsx(n.code,{children:"DOBorough"}),"). Keep these column names unchanged when following the code."]})}),`
`,e.jsx(a,{children:e.jsxs(n.p,{children:["Before touching any of that, we need the five methods every pandas session opens with: ",e.jsx(n.code,{children:".shape"}),", ",e.jsx(n.code,{children:".dtypes"}),", ",e.jsx(n.code,{children:".head()"}),", ",e.jsx(n.code,{children:".info()"}),", and ",e.jsx(n.code,{children:".describe()"}),"."]})}),`
`,e.jsx(n.h2,{children:"What / How — First-Look Methods"}),`
`,e.jsx(h,{prompt:"You load a CSV you expect to have 30 rows, and the DataFrame reports 30 rows and 12 columns. Are you ready to start analysing?",options:["Yes, the shape is what you expected","Not quite — the column types matter as much as the count, and a numeric column read as text will break everything downstream"],correct:1,children:e.jsx(n.p,{children:'Every pandas exploratory session starts with the same handful of calls. Each answers a different question about the DataFrame, and together they form a quick "vitals check" before any cleaning begins.'})}),`
`,e.jsx(r,{items:[{q:"Why is checking column types as important as checking the row count?",a:"A numeric column silently loaded as text will not aggregate, will not plot, and will sort alphabetically, all without raising an error. The type report is the first place a malformed value, a stray currency symbol or a wrongly parsed date announces itself."}]}),`
`,e.jsxs(d,{children:[e.jsx(t,{number:1,title:".shape — how big is this?",children:e.jsxs(n.p,{children:["Returns a tuple ",e.jsx(n.code,{children:"(n_rows, n_columns)"}),". The very first thing to check: does the row count match what you expected to load? Did a join silently multiply or drop rows?"]})}),e.jsx(t,{number:2,title:".dtypes — what type is each column?",children:e.jsxs(n.p,{children:["Returns the storage type pandas inferred for every column: ",e.jsx(n.code,{children:"int64"}),", ",e.jsx(n.code,{children:"float64"}),", ",e.jsx(n.code,{children:"object"})," (usually strings), ",e.jsx(n.code,{children:"datetime64"}),", and so on. A column you expect to be numeric but that shows up as ",e.jsx(n.code,{children:"object"})," usually means it contains stray text or mixed formatting."]})}),e.jsx(t,{number:3,title:".head(n) — what does a row actually look like?",children:e.jsxs(n.p,{children:["Prints the first ",e.jsx(n.code,{children:"n"}),' rows (default 5). Numbers and dtypes are abstract; seeing real values grounds your intuition for what "normal" looks like in this dataset.']})}),e.jsx(t,{number:4,title:".info() — dtypes and completeness together",children:e.jsxs(n.p,{children:["Combines ",e.jsx(n.code,{children:".dtypes"})," with a non-null count per column and total memory usage. This is the fastest way to spot missing data: if a column's non-null count is less than the row count, it has nulls."]})}),e.jsx(t,{number:5,title:".describe() — summary statistics",children:e.jsx(n.p,{children:"For numeric columns: count, mean, std, min, the 25/50/75% quantiles, and max. This is where shape problems (skew) and correctness problems (impossible values) first become visible — often before you've looked at a single row."})})]}),`
`,e.jsx(n.p,{children:"Run the first check — confirm the dataset is the size we expect:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import pandas as pd
df = pd.read_csv("taxi_practice.csv")
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
std           71.52
min          -12.50
25%            6.125
50%           11.75
75%           19.125
max          399.00
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"The mean is more than double the median."})," Mean fare (26.17) is more than double the median fare (11.75). When mean and median diverge this much, it's a strong hint the column is ",e.jsx(n.strong,{children:"right-skewed"})," — a few extreme values are pulling the average up while the median, which only cares about the middle-ranked value, stays low. Flag this now; Module 4 (Outlier Detection) explains exactly which rows are responsible and why."]}),`
`,e.jsxs(n.p,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"min"})," is negative."]})," The minimum fare is ",e.jsx(n.strong,{children:"-12.50"}),". A taxi fare cannot be negative — this isn't a distribution quirk like skew, it's a data error (likely a refund or trip-correction record that leaked into the fare column). Module 3 (Data Quality & Invalid Values) deals with rows like this directly."]}),`
`,e.jsx(a,{children:e.jsxs(n.p,{children:["Try ",e.jsx(n.code,{children:"df.head()"}),", ",e.jsx(n.code,{children:"df.dtypes"})," and ",e.jsx(n.code,{children:"df.info()"})," on the loaded table. Before each call, say what question it answers. Then identify one column with missing values and one value worth investigating. The next module explains how to handle missing data."]})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(i,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Five calls open every pandas session: ",e.jsx(n.code,{children:".shape"}),", ",e.jsx(n.code,{children:".dtypes"}),", ",e.jsx(n.code,{children:".head()"}),", ",e.jsx(n.code,{children:".info()"}),", ",e.jsx(n.code,{children:".describe()"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:".shape"})," first"]})," — a row count that doesn't match expectations means a join silently duplicated or dropped rows."]}),`
`,e.jsxs(n.li,{children:["A numeric column showing up as ",e.jsx(n.code,{children:"object"})," in ",e.jsx(n.code,{children:".dtypes"})," means stray text or mixed formatting is hiding in it."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:".info()"})," is the fastest null detector: any non-null count below the row count means missing data."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:".describe()"})," computes happily on dirty data."]})," Read its min and max as a bug report — that's where the USD -12.50 fare and the USD 399 fare surface."]}),`
`]})}),`
`,e.jsx(n.h2,{children:"Practice"}),`
`,e.jsxs(n.h3,{children:["Problem 1: Reading ",e.jsx(n.code,{children:".shape"})]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"df.shape"})," returns ",e.jsx(n.code,{children:"(30, 12)"}),". What do the two numbers mean?"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," ",e.jsx(n.strong,{children:"30"})," rows — one per taxi trip in the sample. ",e.jsx(n.strong,{children:"12"})," columns — one per recorded field per trip (timestamps, fare amounts, passenger count, borough, and so on). ",e.jsx(n.code,{children:".shape"})," always returns ",e.jsx(n.code,{children:"(n_rows, n_columns)"})," in that order, matching NumPy's array-shape convention that pandas builds on."]}),`
`,e.jsx(n.h3,{children:"Problem 2: Mean vs. Median Gap"}),`
`,e.jsxs(n.p,{children:["Given mean = 26.17 and median = 11.75 for ",e.jsx(n.code,{children:"fare_amount"}),", what does the gap suggest about the distribution's shape, and which row do you suspect is driving it?"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," The distribution is ",e.jsx(n.strong,{children:"right-skewed"}),": a few very large fares pull the mean well above the median, while the median — being robust to outliers, since it only depends on rank order — stays close to where most of the data sits. The dataset's ",e.jsx(n.strong,{children:"max (399.00)"})," is the prime suspect. One USD 399 fare sitting among mostly USD 3–USD 30 fares pulls the mean up substantially, while the median barely moves because it only looks at the middle-ranked value."]}),`
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
`,e.jsx(a,{children:e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"What's next: how much data is actually here?"})," ",e.jsx(n.code,{children:".describe()"})," already flagged something off — a USD 399 fare and a negative one. Before trusting any of these numbers, find out how much of the data is even there to compute on. Module 2 starts with missing values."]})}),`
`,e.jsx(r,{items:[{q:"You load a CSV and .shape says 4.2 million rows when you expected 900,000. What happened?",a:"Almost certainly a join that fanned out — a many-to-many merge where the key was not unique on one side multiplies rows. Checking shape immediately after loading or merging is the cheapest way to catch it, before any statistic computed on the duplicated rows misleads you."},{q:"fare_amount shows dtype object instead of float64. What does that imply and what breaks?",a:"The column contains something non-numeric — currency symbols, thousands separators, an 'N/A' string, or mixed types. Arithmetic and .describe() will either fail or silently skip the column, and any model will treat it as categorical. It needs cleaning and an explicit conversion before use."},{q:"Which single call tells you both the dtype and the completeness of every column?",a:".info(), which combines dtypes with a non-null count per column plus memory usage. Any column whose non-null count is below the total row count has missing values — making it the fastest first pass at spotting nulls."},{q:"Why is .describe() dangerous if you only read the mean?",a:"Because it computes on whatever is there, ignoring NaNs silently and including invalid values happily. The mean is the number most distorted by both. The min and max rows are where the real information is: a negative fare and a USD 399 fare are visible there and invisible in the mean."}]}),`
`,e.jsx(c,{question:"What does df.shape return?",options:["A list of column names","A tuple (rows, columns)","The data types of each column","Summary statistics"],correct:1})]})}function p(s={}){const{wrapper:n}={...l(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(o,{...s})}):o(s)}export{p as default};
