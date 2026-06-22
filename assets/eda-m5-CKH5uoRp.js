import{u as d,j as e,C as a,D as l,a as t,B as i,Q as c}from"./index-VIW80S6x.js";function r(n){const s={annotation:"annotation",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",li:"li",math:"math",mfrac:"mfrac",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",msub:"msub",mtext:"mtext",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",ul:"ul",...d(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{children:"Datetime Parsing & Feature Engineering"}),`
`,e.jsx(s.h2,{children:"What, Why, and How"}),`
`,e.jsxs(a,{title:"WHAT: Parsing Datetimes into Structured Features",children:[e.jsxs(s.p,{children:["A raw datetime string like ",e.jsx(s.code,{children:'"2023-03-06 08:15:00"'})," carries rich information — the hour of day, the day of week, the elapsed duration between events — but it sits in the column as an opaque blob of text. ",e.jsx(s.strong,{children:"Datetime feature engineering"})," is the act of parsing that string into a proper datetime type and then extracting the numeric signals hidden inside."]}),e.jsx(s.p,{children:"The three most valuable signals from taxi trip datetimes are:"}),e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Hour of day"})," (0–23) — captures the within-day demand cycle"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Day of week"})," (0=Monday, 6=Sunday in pandas convention) — captures weekend vs. weekday patterns"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Trip duration"})," (minutes) — derived by subtracting pickup from dropoff, exposing how long each trip actually ran"]}),`
`]})]}),`
`,e.jsxs(a,{title:"WHY: Raw Strings Are Useless for Models and Aggregations",children:[e.jsxs(s.p,{children:["You cannot compute ",e.jsx(s.code,{children:'mean("2023-03-06 08:15:00")'}),' — it is a string. You cannot group by "rush hour" unless you first extract the hour. Models trained on the raw string would either fail or — worse — silently treat it as a categorical label, missing all temporal structure.']}),e.jsxs(s.p,{children:["Once you extract ",e.jsx(s.code,{children:"hour"})," and ",e.jsx(s.code,{children:"day_of_week"}),", patterns emerge immediately:"]}),e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Rush hour demand"}),": rides spike at 8–9 AM and 5–7 PM"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Weekend shift"}),": Saturday/Sunday trips tend to be longer and later at night"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Duration outliers"}),": row 24 shows a 45-minute trip with a suspicious 120-mile distance — computing duration flags it immediately"]}),`
`]}),e.jsx(s.p,{children:"In ML pipelines, raw datetime strings must be converted before any feature can be computed. Extracting these features is not optional — it is the gateway to the entire time dimension of the data."})]}),`
`,e.jsx(a,{title:"HOW: pd.to_datetime() and the .dt Accessor",children:e.jsxs(l,{children:[e.jsx(t,{number:1,title:"Parse the column",children:e.jsxs(s.p,{children:["Convert the string column to ",e.jsx(s.code,{children:"datetime64"})," dtype. Pandas auto-detects common formats; pass ",e.jsx(s.code,{children:"format="})," for speed on large data."]})}),e.jsx(t,{number:2,title:"Extract scalar features via .dt",children:e.jsxs(s.p,{children:["The ",e.jsx(s.code,{children:".dt"})," accessor unlocks sub-components: ",e.jsx(s.code,{children:".dt.hour"}),", ",e.jsx(s.code,{children:".dt.dayofweek"}),", ",e.jsx(s.code,{children:".dt.month"}),", ",e.jsx(s.code,{children:".dt.is_weekend"}),", and dozens more — each returns a full column of integers."]})}),e.jsx(t,{number:3,title:"Compute duration as a timedelta",children:e.jsxs(s.p,{children:["Subtracting two datetime columns gives a ",e.jsx(s.code,{children:"timedelta64"})," column. Chain ",e.jsx(s.code,{children:".dt.total_seconds() / 60"})," to get minutes as a float."]})}),e.jsx(t,{number:4,title:"Group and aggregate",children:e.jsxs(s.p,{children:["Once features are numeric, ",e.jsx(s.code,{children:"df.groupby('hour').size()"})," immediately gives rides-per-hour. Temporal patterns become visible in one line."]})})]})}),`
`,e.jsx(s.h2,{children:"Code Walkthrough"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`# Step 1: parse string columns → datetime64
df['tpep_pickup_datetime']  = pd.to_datetime(df['tpep_pickup_datetime'])
df['tpep_dropoff_datetime'] = pd.to_datetime(df['tpep_dropoff_datetime'])

# Step 2: extract scalar features via .dt accessor
df['hour']        = df['tpep_pickup_datetime'].dt.hour        # 0–23
df['day_of_week'] = df['tpep_pickup_datetime'].dt.dayofweek   # 0=Monday

# Step 3: compute trip duration in minutes
df['duration_min'] = (
    df['tpep_dropoff_datetime'] - df['tpep_pickup_datetime']
).dt.total_seconds() / 60

print(df[['tpep_pickup_datetime', 'hour', 'day_of_week', 'duration_min']].head(4))
`})}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{children:`   tpep_pickup_datetime  hour  day_of_week  duration_min
0   2023-03-06 08:15:00     8            0          17.0
1   2023-03-06 08:42:00     8            0          13.0
2   2023-03-06 09:05:00     9            0          25.0
3   2023-03-06 09:50:00     9            0          20.0
`})}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`# Rides by hour of day
rides_by_hour = df.groupby('hour').size().reset_index(name='count')
print(rides_by_hour)

# Rides by day of week
day_map = {0:'Monday', 1:'Tuesday', 2:'Wednesday',
           3:'Thursday', 4:'Friday', 5:'Saturday', 6:'Sunday'}
df['day_name'] = df['day_of_week'].map(day_map)
rides_by_day = df.groupby('day_name').size()
`})}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{children:`   hour  count
0      7      1
1      8      4
2      9      4
3     10      3
4     11      3
5     12      3
6     13      4
7     14      4
8     17      2
9     18      1
10    19      1
11    20      2
`})}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Duration formula"})," — the arithmetic is simple but the types matter."]}),`
`,e.jsx(s.p,{children:e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mtext,{children:"duration_min"}),e.jsx(s.mo,{children:"="}),e.jsxs(s.mfrac,{children:[e.jsxs(s.mrow,{children:[e.jsxs(s.msub,{children:[e.jsx(s.mi,{children:"t"}),e.jsx(s.mtext,{children:"dropoff"})]}),e.jsx(s.mo,{children:"−"}),e.jsxs(s.msub,{children:[e.jsx(s.mi,{children:"t"}),e.jsx(s.mtext,{children:"pickup"})]})]}),e.jsx(s.mn,{children:"60"})]})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"\\text{duration\\_min} = \\frac{t_{\\text{dropoff}} - t_{\\text{pickup}}}{60}"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1.0044em",verticalAlign:"-0.31em"}}),e.jsx(s.span,{className:"mord text",children:e.jsx(s.span,{className:"mord",children:"duration_min"})}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}}),e.jsx(s.span,{className:"mrel",children:"="}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1.2886em",verticalAlign:"-0.345em"}}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mopen nulldelimiter"}),e.jsx(s.span,{className:"mfrac",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsxs(s.span,{className:"vlist",style:{height:"0.9436em"},children:[e.jsxs(s.span,{style:{top:"-2.655em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mtight",children:e.jsx(s.span,{className:"mord mtight",children:"60"})})})]}),e.jsxs(s.span,{style:{top:"-3.23em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(s.span,{className:"frac-line",style:{borderBottomWidth:"0.04em"}})]}),e.jsxs(s.span,{style:{top:"-3.5131em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsxs(s.span,{className:"mord mtight",children:[e.jsxs(s.span,{className:"mord mtight",children:[e.jsx(s.span,{className:"mord mathnormal mtight",children:"t"}),e.jsx(s.span,{className:"msupsub",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsx(s.span,{className:"vlist",style:{height:"0.3448em"},children:e.jsxs(s.span,{style:{top:"-2.3488em",marginLeft:"0em",marginRight:"0.0714em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.5em"}}),e.jsx(s.span,{className:"sizing reset-size3 size1 mtight",children:e.jsx(s.span,{className:"mord mtight",children:e.jsx(s.span,{className:"mord text mtight",children:e.jsx(s.span,{className:"mord mtight",children:"dropoff"})})})})]})}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.2901em"},children:e.jsx(s.span,{})})})]})})]}),e.jsx(s.span,{className:"mbin mtight",children:"−"}),e.jsxs(s.span,{className:"mord mtight",children:[e.jsx(s.span,{className:"mord mathnormal mtight",children:"t"}),e.jsx(s.span,{className:"msupsub",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsx(s.span,{className:"vlist",style:{height:"0.3448em"},children:e.jsxs(s.span,{style:{top:"-2.3488em",marginLeft:"0em",marginRight:"0.0714em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.5em"}}),e.jsx(s.span,{className:"sizing reset-size3 size1 mtight",children:e.jsx(s.span,{className:"mord mtight",children:e.jsx(s.span,{className:"mord text mtight",children:e.jsx(s.span,{className:"mord mtight",children:"pickup"})})})})]})}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.2901em"},children:e.jsx(s.span,{})})})]})})]})]})})]})]}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.345em"},children:e.jsx(s.span,{})})})]})}),e.jsx(s.span,{className:"mclose nulldelimiter"})]})]})]})]})}),`
`,e.jsxs(s.p,{children:["Subtracting two ",e.jsx(s.code,{children:"datetime64"})," columns yields a ",e.jsx(s.code,{children:"timedelta64"}),". Calling ",e.jsx(s.code,{children:".dt.total_seconds()"})," converts the timedelta to a float in seconds; dividing by 60 gives minutes. Without the ",e.jsx(s.code,{children:"pd.to_datetime()"})," step first, the subtraction would fail — you cannot subtract strings."]}),`
`,e.jsx(i,{children:e.jsx(s.p,{children:"The widget below lets you explore every row of the taxi dataset: pick any trip, see how its raw timestamps decompose into hour, day-of-week, and duration — and see the aggregate patterns that emerge across all 30 trips."})}),`
`,e.jsx(s.h2,{children:"Practice"}),`
`,e.jsx(s.h3,{children:"Problem 1: Converting a String Column"}),`
`,e.jsxs(s.p,{children:["What pandas method converts a string column to datetime dtype so that the ",e.jsx(s.code,{children:".dt"})," accessor becomes available?"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Solution:"})," ",e.jsx(s.code,{children:"pd.to_datetime(df['col'])"}),". This parses the string column and returns a new Series with ",e.jsx(s.code,{children:"datetime64[ns]"})," dtype. You then assign it back: ",e.jsx(s.code,{children:"df['col'] = pd.to_datetime(df['col'])"}),". Once the dtype is datetime, ",e.jsx(s.code,{children:"df['col'].dt.hour"}),", ",e.jsx(s.code,{children:"df['col'].dt.dayofweek"}),", and all other ",e.jsx(s.code,{children:".dt"})," sub-accessors become available. Attempting ",e.jsx(s.code,{children:".dt.hour"})," on a string column raises an ",e.jsx(s.code,{children:"AttributeError"}),"."]}),`
`,e.jsx(s.h3,{children:"Problem 2: Computing Duration"}),`
`,e.jsxs(s.p,{children:["If ",e.jsx(s.code,{children:"tpep_pickup_datetime"})," is ",e.jsx(s.code,{children:"2023-01-15 08:32:00"})," and ",e.jsx(s.code,{children:"tpep_dropoff_datetime"})," is ",e.jsx(s.code,{children:"2023-01-15 09:05:00"}),", what is the trip duration in minutes?"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Solution:"})," ",e.jsx(s.strong,{children:"33 minutes"}),". 09:05 − 08:32 = 33 minutes. In pandas: ",e.jsx(s.code,{children:"(df['tpep_dropoff_datetime'] - df['tpep_pickup_datetime']).dt.total_seconds() / 60"})," returns ",e.jsx(s.code,{children:"33.0"}),". The subtraction of two ",e.jsx(s.code,{children:"datetime64"})," columns yields a ",e.jsx(s.code,{children:"timedelta64"}),"; ",e.jsx(s.code,{children:".dt.total_seconds()"})," converts to a float of seconds (1980.0), and dividing by 60 gives minutes."]}),`
`,e.jsx(s.h3,{children:"Problem 3: Why Extract Temporal Features?"}),`
`,e.jsxs(s.p,{children:["Why is ",e.jsx(s.code,{children:"dt.dayofweek"})," more useful for ML than the raw date string? Name two temporal features you would derive for a demand forecasting model."]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Solution:"})," ",e.jsx(s.code,{children:"dt.dayofweek"})," returns a number (0–6) that encodes ",e.jsx(s.em,{children:"recurrent"}),' weekly structure. The raw date string "2023-03-06" is a unique identifier — a model trained on it learns nothing about Mondays in general, only about that specific Monday. The integer 0 (Monday) appears every week, so the model can generalise across dates with the same weekday structure.']}),`
`,e.jsx(s.p,{children:"Two strong features for demand forecasting:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:e.jsx(s.code,{children:"hour"})})," — captures the intra-day demand curve (morning commute, lunch lull, evening peak). Optionally encode cyclically: ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"sin"}),e.jsx(s.mo,{children:"⁡"}),e.jsx(s.mo,{stretchy:"false",children:"("}),e.jsx(s.mn,{children:"2"}),e.jsx(s.mi,{children:"π"}),e.jsx(s.mo,{children:"⋅"}),e.jsx(s.mtext,{children:"hour"}),e.jsx(s.mi,{mathvariant:"normal",children:"/"}),e.jsx(s.mn,{children:"24"}),e.jsx(s.mo,{stretchy:"false",children:")"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"\\sin(2\\pi \\cdot \\text{hour}/24)"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(s.span,{className:"mop",children:"sin"}),e.jsx(s.span,{className:"mopen",children:"("}),e.jsx(s.span,{className:"mord",children:"2"}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0359em"},children:"π"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}}),e.jsx(s.span,{className:"mbin",children:"⋅"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(s.span,{className:"mord text",children:e.jsx(s.span,{className:"mord",children:"hour"})}),e.jsx(s.span,{className:"mord",children:"/24"}),e.jsx(s.span,{className:"mclose",children:")"})]})]})]})," and ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"cos"}),e.jsx(s.mo,{children:"⁡"}),e.jsx(s.mo,{stretchy:"false",children:"("}),e.jsx(s.mn,{children:"2"}),e.jsx(s.mi,{children:"π"}),e.jsx(s.mo,{children:"⋅"}),e.jsx(s.mtext,{children:"hour"}),e.jsx(s.mi,{mathvariant:"normal",children:"/"}),e.jsx(s.mn,{children:"24"}),e.jsx(s.mo,{stretchy:"false",children:")"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"\\cos(2\\pi \\cdot \\text{hour}/24)"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(s.span,{className:"mop",children:"cos"}),e.jsx(s.span,{className:"mopen",children:"("}),e.jsx(s.span,{className:"mord",children:"2"}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0359em"},children:"π"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}}),e.jsx(s.span,{className:"mbin",children:"⋅"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(s.span,{className:"mord text",children:e.jsx(s.span,{className:"mord",children:"hour"})}),e.jsx(s.span,{className:"mord",children:"/24"}),e.jsx(s.span,{className:"mclose",children:")"})]})]})]})," so hour 23 is numerically close to hour 0."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:e.jsx(s.code,{children:"is_weekend"})})," — a boolean flag (",e.jsx(s.code,{children:"day_of_week >= 5"}),") collapses the 7-day week into two demand regimes (workday vs. leisure day) that behave very differently in most transportation datasets."]}),`
`]}),`
`,e.jsx(s.h2,{children:"Quiz"}),`
`,e.jsx(s.h3,{children:"Module 5 — Check Your Understanding"}),`
`,e.jsx(s.p,{children:e.jsxs(s.strong,{children:["1. What does ",e.jsx(s.code,{children:"pd.to_datetime()"})," return?"]})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"A: A list of strings"}),`
`,e.jsxs(s.li,{children:["B: A Series with ",e.jsx(s.code,{children:"datetime64"})," dtype ✓"]}),`
`,e.jsx(s.li,{children:"C: A Unix timestamp integer"}),`
`,e.jsxs(s.li,{children:["D: A Python ",e.jsx(s.code,{children:"datetime"})," object"]}),`
`]}),`
`,e.jsx(s.p,{children:e.jsxs(s.strong,{children:["2. In pandas, ",e.jsx(s.code,{children:"dt.dayofweek"})," returns 0 for:"]})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"A: Sunday"}),`
`,e.jsx(s.li,{children:"B: Monday ✓"}),`
`,e.jsx(s.li,{children:"C: Saturday"}),`
`,e.jsx(s.li,{children:"D: The first day of the dataset"}),`
`]}),`
`,e.jsx(s.p,{children:e.jsxs(s.strong,{children:["3. Why extract ",e.jsx(s.code,{children:"hour"})," and ",e.jsx(s.code,{children:"day_of_week"})," as separate features?"]})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"A: To reduce file size"}),`
`,e.jsx(s.li,{children:"B: To convert strings to numbers"}),`
`,e.jsx(s.li,{children:"C: To expose cyclical temporal patterns that models can learn ✓"}),`
`,e.jsxs(s.li,{children:["D: Because pandas requires it for ",e.jsx(s.code,{children:"groupby"})]}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"4. Trip duration is computed as:"})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["A: ",e.jsx(s.code,{children:"df['hour'].diff()"})]}),`
`,e.jsxs(s.li,{children:["B: ",e.jsx(s.code,{children:"df['dropoff'] - df['pickup']"})," (gives a string)"]}),`
`,e.jsxs(s.li,{children:["C: ",e.jsx(s.code,{children:"(df['dropoff'] - df['pickup']).dt.total_seconds() / 60"})," ✓"]}),`
`,e.jsxs(s.li,{children:["D: ",e.jsx(s.code,{children:"pd.duration(df['dropoff'], df['pickup'])"})]}),`
`]}),`
`,e.jsx(i,{children:e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"What's next: seeing the data."})," You have cleaned missing values, caught invalid values, flagged outliers, and engineered time features. Module 6 puts all of these cleaned columns under a microscope with ",e.jsx(s.strong,{children:"univariate visualisation"})," — histograms, KDE curves, and bar charts that reveal the shape of each variable's distribution."]})}),`
`,e.jsx(c,{question:"What does the .dt accessor enable after calling pd.to_datetime() on a column?",options:["String formatting","Extracting components like .dt.hour and .dt.dayofweek","Sorting the DataFrame by date","Computing the column mean"],correct:1})]})}function h(n={}){const{wrapper:s}={...d(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(r,{...n})}):r(n)}export{h as default};
