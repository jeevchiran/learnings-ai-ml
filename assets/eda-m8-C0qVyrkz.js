import{u as o,j as e,C as s,D as l,a as t,B as r,Q as c}from"./index-VIW80S6x.js";function i(a){const n={annotation:"annotation",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",li:"li",math:"math",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",ol:"ol",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",ul:"ul",...o(),...a.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Multivariate Analysis"}),`
`,e.jsx(n.h2,{children:"What, Why, and How"}),`
`,e.jsxs(s,{title:"WHAT: Examining how 3+ variables interact simultaneously",children:[e.jsxs(n.p,{children:["Multivariate analysis goes beyond pairs of columns to examine ",e.jsx(n.strong,{children:"how three or more variables interact at once"}),". The core tools are:"]}),e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Pivot table"})," — a cross-tabulation that places one variable on rows, another on columns, and summarises a third variable (e.g., mean, sum, count) in each cell. The pandas function is ",e.jsx(n.code,{children:"df.pivot_table()"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Multi-level groupby"})," — ",e.jsx(n.code,{children:"df.groupby([col1, col2]).agg()"})," groups by two (or more) keys simultaneously and returns a Series with a MultiIndex, giving you every combination of group values."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Color-encoded scatter plot"})," — a standard scatter plot (x vs y) where point color encodes a third categorical variable. Three dimensions of information in one chart: position-x, position-y, and hue."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Faceted plots"})," — seaborn's ",e.jsx(n.code,{children:"FacetGrid"})," repeats the same chart once per category value, creating a grid of small multiples that let you compare a relationship across subgroups."]}),`
`]})]}),`
`,e.jsxs(s,{title:"WHY: Real phenomena are multivariate — two variables are rarely enough",children:[e.jsx(n.p,{children:'Bivariate analysis answers "does A relate to B?" But most real-world questions are richer:'}),e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Does ",e.jsx(n.code,{children:"fare_amount"})," depend on ",e.jsx(n.code,{children:"trip_distance"})," ",e.jsx(n.em,{children:"and"})," ",e.jsx(n.code,{children:"RatecodeID"})," ",e.jsx(n.em,{children:"and"})," time of day — all at once?"]}),`
`,e.jsxs(n.li,{children:["Do higher ",e.jsx(n.code,{children:"passenger_count"})," trips earn systematically different tips across different rate codes?"]}),`
`,e.jsx(n.li,{children:"Is the bivariate correlation between distance and fare actually a masking of two completely different fare regimes (metered vs flat-rate) that behave differently?"}),`
`]}),e.jsxs(n.p,{children:["In Module 7 we saw that ",e.jsx(n.code,{children:"fare_amount"})," and ",e.jsx(n.code,{children:"trip_distance"})," correlate well for metered rides — but airport flat-rate trips (RatecodeID=2) break that pattern. The only way to see this clearly is to introduce RatecodeID as a ",e.jsx(n.strong,{children:"third variable"}),"."]})]}),`
`,e.jsx(s,{title:"HOW: pivot_table, multi-level groupby, and color-encoded scatter",children:e.jsxs(l,{children:[e.jsx(t,{number:1,title:"Pivot table via pandas",children:e.jsxs(n.p,{children:[e.jsx(n.code,{children:"df.pivot_table(values='fare_amount', index='RatecodeID', columns='passenger_count', aggfunc='mean')"})," — rows = unique RatecodeID values, columns = unique passenger_count values, each cell = mean fare for that combination. ",e.jsx(n.code,{children:"aggfunc"})," can also be ",e.jsx(n.code,{children:"'sum'"}),", ",e.jsx(n.code,{children:"'count'"}),", ",e.jsx(n.code,{children:"np.median"}),", or a custom lambda."]})}),e.jsx(t,{number:2,title:"Multi-level groupby",children:e.jsxs(n.p,{children:[e.jsx(n.code,{children:"df.groupby(['RatecodeID', 'passenger_count'])['fare_amount'].mean().unstack()"})," — produces the same result as the pivot table when aggfunc is mean. The ",e.jsx(n.code,{children:".unstack()"})," call pivots the inner index level into columns, turning the flat MultiIndex Series into a 2-D DataFrame."]})}),e.jsx(t,{number:3,title:"Color-encoded scatter (seaborn)",children:e.jsxs(n.p,{children:[e.jsx(n.code,{children:"sns.scatterplot(data=df, x='trip_distance', y='fare_amount', hue='RatecodeID', palette='tab10', alpha=0.7)"})," — each unique RatecodeID gets a distinct color from the palette. Points belonging to different rate codes visually separate into clusters, revealing the third-variable effect instantly."]})})]})}),`
`,e.jsx(n.h2,{children:"Code Walkthrough"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# Pivot table: mean fare by RatecodeID × passenger_count
pivot = df.pivot_table(
    values='fare_amount',
    index='RatecodeID',
    columns='passenger_count',
    aggfunc='mean'
).round(2)
print(pivot)
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`passenger_count     1      2      3      4
RatecodeID
1                 9.82  14.30  18.00  25.00
2                45.00  52.00    NaN    NaN
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# Same result via groupby + unstack
df.groupby(['RatecodeID', 'passenger_count'])['fare_amount'].mean().unstack()
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`Returns a 2-D DataFrame identical to pivot_table with aggfunc='mean'. Use groupby when you need multiple aggregations in one pass (e.g., .agg(['mean', 'std', 'count']))
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import seaborn as sns
sns.scatterplot(
    data=df,
    x='trip_distance',
    y='fare_amount',
    hue='RatecodeID',
    palette='tab10',
    alpha=0.7
)
plt.title('trip_distance vs fare_amount, coloured by RatecodeID')
plt.show()
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`RatecodeID=1 points (metered) scatter along a rising diagonal; RatecodeID=2 points (flat-rate airport) cluster at upper-right at fixed $45/$52 regardless of exact distance
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"NaN cells in pivot tables are informative, not errors."}),' A NaN in a pivot table cell means no row matched that row×column combination — e.g., RatecodeID=2 with passenger_count=3 never occurred in the sample. Always check whether NaN means "missing data" or "that combination does not exist."']}),`
`,e.jsx(r,{children:e.jsx(n.p,{children:"The widgets below let you build pivot tables with any value field and aggregation, and plot the color-encoded scatter that reveals how RatecodeID creates two completely different fare regimes."})}),`
`,e.jsx(n.h2,{children:"Practice"}),`
`,e.jsx(n.h3,{children:"Problem 1: Pivot table aggregation function"}),`
`,e.jsx(n.p,{children:"What pandas function creates a cross-tabulation of means, and what parameter controls the aggregation?"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," ",e.jsx(n.code,{children:"df.pivot_table(values=..., index=..., columns=..., aggfunc='mean')"}),". The ",e.jsx(n.code,{children:"aggfunc"})," parameter controls how values in each cell are combined. Common options:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"'mean'"})," — average of all matching rows"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"'sum'"})," — total of all matching rows"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"'count'"})," — number of matching rows (useful for seeing how many observations back each cell)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"np.median"}),", ",e.jsx(n.code,{children:"np.std"}),", or a custom lambda for other statistics"]}),`
`]}),`
`,e.jsxs(n.p,{children:["The equivalent using groupby: ",e.jsx(n.code,{children:"df.groupby([index_col, col_col])[value_col].mean().unstack()"}),"."]}),`
`,e.jsx(n.h3,{children:"Problem 2: Interpreting the color-encoded scatter"}),`
`,e.jsx(n.p,{children:"In the color-encoded scatter (trip_distance vs fare_amount, colored by RatecodeID), why do RatecodeID=2 points cluster differently from RatecodeID=1 points?"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," RatecodeID=2 trips are ",e.jsx(n.strong,{children:"flat-rate airport fares"}),". NYC taxi rules fix the fare to Manhattan from JFK at ",e.jsxs(n.span,{className:"katex",children:[e.jsx(n.span,{className:"katex-mathml",children:e.jsx(n.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(n.semantics,{children:[e.jsxs(n.mrow,{children:[e.jsx(n.mn,{children:"52"}),e.jsx(n.mi,{children:"a"}),e.jsx(n.mi,{children:"n"}),e.jsx(n.mi,{children:"d"}),e.jsx(n.mi,{children:"t"}),e.jsx(n.mi,{children:"o"}),e.jsx(n.mi,{children:"N"}),e.jsx(n.mi,{children:"e"}),e.jsx(n.mi,{children:"w"}),e.jsx(n.mi,{children:"a"}),e.jsx(n.mi,{children:"r"}),e.jsx(n.mi,{children:"k"}),e.jsx(n.mo,{stretchy:"false",children:"("}),e.jsx(n.mi,{children:"E"}),e.jsx(n.mi,{children:"W"}),e.jsx(n.mi,{children:"R"}),e.jsx(n.mo,{stretchy:"false",children:")"}),e.jsx(n.mi,{children:"a"}),e.jsx(n.mi,{children:"t"})]}),e.jsx(n.annotation,{encoding:"application/x-tex",children:"52 and to Newark (EWR) at "})]})})}),e.jsx(n.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(n.span,{className:"base",children:[e.jsx(n.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(n.span,{className:"mord",children:"52"}),e.jsx(n.span,{className:"mord mathnormal",children:"an"}),e.jsx(n.span,{className:"mord mathnormal",children:"d"}),e.jsx(n.span,{className:"mord mathnormal",children:"t"}),e.jsx(n.span,{className:"mord mathnormal",children:"o"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.109em"},children:"N"}),e.jsx(n.span,{className:"mord mathnormal",children:"e"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0269em"},children:"w"}),e.jsx(n.span,{className:"mord mathnormal",children:"a"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0278em"},children:"r"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0315em"},children:"k"}),e.jsx(n.span,{className:"mopen",children:"("}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0576em"},children:"E"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.1389em"},children:"W"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0077em"},children:"R"}),e.jsx(n.span,{className:"mclose",children:")"}),e.jsx(n.span,{className:"mord mathnormal",children:"a"}),e.jsx(n.span,{className:"mord mathnormal",children:"t"})]})})]}),"45 — regardless of the exact mileage driven on that specific trip. The fare does not grow with distance the way metered (RatecodeID=1) fares do."]}),`
`,e.jsx(n.p,{children:"This means:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["RatecodeID=2 points sit at constant y-values (",e.jsxs(n.span,{className:"katex",children:[e.jsx(n.span,{className:"katex-mathml",children:e.jsx(n.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(n.semantics,{children:[e.jsxs(n.mrow,{children:[e.jsx(n.mn,{children:"45"}),e.jsx(n.mi,{children:"o"}),e.jsx(n.mi,{children:"r"})]}),e.jsx(n.annotation,{encoding:"application/x-tex",children:"45 or "})]})})}),e.jsx(n.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(n.span,{className:"base",children:[e.jsx(n.span,{className:"strut",style:{height:"0.6444em"}}),e.jsx(n.span,{className:"mord",children:"45"}),e.jsx(n.span,{className:"mord mathnormal",style:{marginRight:"0.0278em"},children:"or"})]})})]}),"52) even though their x-values (trip_distance) vary."]}),`
`,e.jsx(n.li,{children:"RatecodeID=1 points follow a rising diagonal because each additional mile adds a metered increment to the fare."}),`
`]}),`
`,e.jsxs(n.p,{children:['The "third variable" RatecodeID is a ',e.jsx(n.em,{children:"confounder"}),": without it, the bivariate scatter shows a messy cluster in the upper-right that looks like a noisy extension of the metered pattern, when in reality it is an entirely different pricing rule."]}),`
`,e.jsx(n.h3,{children:"Problem 3: Designing a multivariate hypothesis test"}),`
`,e.jsx(n.p,{children:"You hypothesise that high passenger_count trips have lower average tip_amount per person. Design a multivariate analysis using our dataset to confirm or refute this hypothesis."}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," A systematic approach:"]}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Filter to card payments only"})," — cash trips have tip_amount=0 by definition (not electronically captured), which would confound the comparison. Use ",e.jsx(n.code,{children:"df[df.payment_type == 'card']"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Compute per-person tip"})," — add a derived column: ",e.jsx(n.code,{children:"df['tip_per_person'] = df['tip_amount'] / df['passenger_count']"}),". Watch for NaN when passenger_count is null."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Groupby passenger_count"})," — ",e.jsx(n.code,{children:"df.groupby('passenger_count')['tip_per_person'].agg(['mean', 'count'])"}),". The count column tells you how many trips back each mean."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Build a pivot table for a multivariate view"})," — ",e.jsx(n.code,{children:"df.pivot_table(values='tip_per_person', index='passenger_count', columns='RatecodeID', aggfunc='mean')"}),". This reveals whether the pattern holds within each rate code."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Interpret cautiously"})," — with only 30 rows, most passenger_count groups have very few observations. State the finding as directional, not conclusive."]}),`
`]}),`
`,e.jsx(n.h2,{children:"Quiz"}),`
`,e.jsx(n.h3,{children:"Module 8 — Check Your Understanding"}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:["1. A pivot table with ",e.jsx(n.code,{children:"aggfunc='mean'"})," shows:"]})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: Total sum per group"}),`
`,e.jsx(n.li,{children:"B: Count of rows per group"}),`
`,e.jsx(n.li,{children:"C: Average value per row×column combination ✓"}),`
`,e.jsx(n.li,{children:"D: Median per group"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"2. In a color-encoded scatter plot, a third variable is encoded as:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: Point size only"}),`
`,e.jsx(n.li,{children:"B: X-axis position"}),`
`,e.jsx(n.li,{children:"C: Point color (hue) ✓"}),`
`,e.jsx(n.li,{children:"D: Line style"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"3. Why is multivariate analysis harder to interpret than bivariate?"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: It requires more data"}),`
`,e.jsx(n.li,{children:"B: Computers cannot handle it"}),`
`,e.jsx(n.li,{children:"C: Interactions between variables can mask or amplify pairwise relationships ✓"}),`
`,e.jsx(n.li,{children:"D: It is not harder — just use more charts"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:["4. ",e.jsx(n.code,{children:"df.groupby(['RatecodeID','passenger_count'])['fare_amount'].mean()"})," returns:"]})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: A scalar value"}),`
`,e.jsx(n.li,{children:"B: A flat list"}),`
`,e.jsx(n.li,{children:"C: A Series with a MultiIndex ✓"}),`
`,e.jsx(n.li,{children:"D: A pivot table"}),`
`]}),`
`,e.jsx(r,{children:e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"What's next: putting it all together in a full EDA workflow."})," You have now worked through every major EDA technique — missing values, invalid data, outliers, datetime features, univariate distributions, bivariate correlations, and multivariate interactions. Module 9 (Capstone) walks you through a complete end-to-end EDA on the taxi dataset, applying all techniques in sequence and producing a concise findings report."]})}),`
`,e.jsx(c,{question:"What does df.pivot_table(values='fare_amount', index='RatecodeID', columns='passenger_count', aggfunc='mean') produce?",options:["A list of fare amounts","A 2-D table of mean fares for each RatecodeID × passenger_count combination","A scatter plot","A correlation matrix"],correct:1})]})}function h(a={}){const{wrapper:n}={...o(),...a.components};return n?e.jsx(n,{...a,children:e.jsx(i,{...a})}):i(a)}export{h as default};
