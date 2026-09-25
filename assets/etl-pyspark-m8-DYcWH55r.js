import{u as o,j as e,B as l,b as s,R as a,C as i,Q as d}from"./index-WYRBR6CI.js";import{P as c}from"./PredictReveal-DnF7AdIF.js";function r(t){const n={code:"code",em:"em",h1:"h1",h2:"h2",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...o(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Data Exploration"}),`
`,e.jsx(l,{children:e.jsx(n.p,{children:"In Module 7, we cleaned our messy dataset — removed nulls, duplicates, fixed casing, and filtered invalid values. Now we explore the clean data to understand what we're working with."})}),`
`,e.jsx(n.h2,{children:"Schema Inspection"}),`
`,e.jsxs(c,{prompt:"You let the engine infer the schema from a large CSV instead of declaring it. What does that cost?",options:["Nothing, inference is free","An extra full pass over the data, plus the risk that a column's type is guessed from rows that are not representative"],correct:1,children:[e.jsx(n.p,{children:"Before any analysis, know what you're working with. Schema inspection tells you column names, data types, and nullable flags."}),e.jsx(s,{language:"python",children:`students_df.printSchema()
# root
#  |-- student_id: integer (nullable = false)
#  |-- name: string (nullable = true)
#  |-- major: string (nullable = true)
#  |-- year: integer (nullable = true)
#  |-- gpa: double (nullable = true)

print("dtypes:", students_df.dtypes)
print("columns:", students_df.columns)`})]}),`
`,e.jsx(a,{items:[{q:"Why declare a schema rather than letting it be inferred?",a:"Inference requires an additional scan of the data purely to work out the types, and it guesses from whatever it samples, so a column that looks numeric in the first rows and contains text later will be typed wrongly. An explicit schema is both faster and deterministic."}]}),`
`,e.jsx(n.h2,{children:"Descriptive Statistics"}),`
`,e.jsx(n.p,{children:"PySpark provides two methods for quick statistical summaries:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"df.describe()"})," — count, mean, stddev, min, max for numeric columns"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"df.summary()"})," — everything in describe() plus percentiles (25%, 50%, 75%)"]}),`
`]}),`
`,e.jsx(s,{language:"python",children:`students_df.describe().show()
# +-------+----------+------+--------+
# |summary|student_id|  year|     gpa|
# +-------+----------+------+--------+
# |  count|        50|    50|      50|
# |   mean|   1025.50|  2.48|    3.45|
# | stddev|    14.58 |  1.12|    0.31|
# |    min|      1001|     1|    2.80|
# |    max|      1050|     4|    3.95|
# +-------+----------+------+--------+

# For percentiles, use summary()
students_df.summary().show()`}),`
`,e.jsx(i,{title:"describe() vs summary()",children:e.jsxs(n.p,{children:[e.jsx(n.code,{children:"describe()"})," does not show the median (50th percentile) by default — use ",e.jsx(n.code,{children:"summary()"})," for that. ",e.jsx(n.code,{children:"summary()"}),' also includes "25%" and "75%" rows, giving you the full IQR (interquartile range) for detecting outliers.']})}),`
`,e.jsx(n.h2,{children:"Value Counts and Distributions"}),`
`,e.jsx(n.p,{children:"For categorical columns, understand how values are distributed:"}),`
`,e.jsx(s,{language:"python",children:`# Frequency count per category
students_df.groupBy("major").count().orderBy("count", ascending=False).show()
# +-----+-----+
# |major|count|
# +-----+-----+
# |   CS|   15|
# |   DS|   14|
# | Math|   11|
# | Stat|   10|
# +-----+-----+

# Count distinct values
print("Distinct years:", students_df.select("year").distinct().count())`}),`
`,e.jsx(n.h2,{children:"Sampling"}),`
`,e.jsx(n.p,{children:"When working with large datasets, grab a subset for quick inspection:"}),`
`,e.jsx(s,{language:"python",children:`# Random 20% sample (seed for reproducibility)
students_df.sample(fraction=0.2, seed=42).show()

# First 5 rows as list of Row objects
rows = students_df.take(5)

# Limit to 10 rows and display as table
students_df.limit(10).show()`}),`
`,e.jsx(n.h2,{children:"Cross-tabulation"}),`
`,e.jsx(n.p,{children:"Cross-tabulation creates a pivot-table-like frequency matrix showing how two categorical variables relate:"}),`
`,e.jsx(s,{language:"python",children:`# How many CS students are in year 3?
students_df.crosstab("major", "year").show()
# +-----------+---+---+---+---+
# |major_year |  1|  2|  3|  4|
# +-----------+---+---+---+---+
# |         CS|  3|  4|  4|  4|
# |         DS|  2|  4|  4|  4|
# |       Math|  3|  2|  3|  3|
# |       Stat|  2|  3|  3|  2|
# +-----------+---+---+---+---+`}),`
`,e.jsx(a,{items:[{q:"What does describe() give you, and what conspicuous statistic is missing?",a:"Count, mean, standard deviation, min and max. The median is absent. That matters because on skewed data the mean alone is misleading and the median is exactly the robust number you want — reach for summary(), which includes quartiles, or approxQuantile()."},{q:"Why is Spark's median approximate by default?",a:"An exact median requires knowing the global ordering, which means a full sort or a shuffle of the entire column across partitions. Spark instead uses a streaming quantile sketch with a tunable error bound, trading a small inaccuracy for avoiding a distributed sort. Set the relative error to 0 for an exact answer, at that cost."},{q:"Why check nullability in printSchema before analysing?",a:"Because nullable columns silently propagate nulls through arithmetic and comparisons, and aggregate functions skip them rather than failing. A mean computed over a column that is 30% null is the mean of the remaining 70% with no warning — you need to know that before quoting the number."},{q:"Your exploration calls feel slow on a long pipeline. What is happening and what fixes it?",a:"Every describe, show and count is an ACTION, so each one re-executes the entire lineage from the source files. Cache the cleaned DataFrame once before the exploration block, so the pipeline runs a single time and every subsequent inspection reads from memory."}]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(i,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"printSchema()"})," before anything else — column names, types, and nullability decide what operations are even legal."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"describe()"})," omits the median."]})," It gives count, mean, stddev, min, max only; use ",e.jsx(n.code,{children:"summary()"})," or ",e.jsx(n.code,{children:"approxQuantile()"})," for percentiles."]}),`
`,e.jsxs(n.li,{children:["Percentiles are ",e.jsx(n.em,{children:"approximate"})," by default in Spark, because an exact median requires a full sort across partitions."]}),`
`,e.jsxs(n.li,{children:["Every inspection call is an ",e.jsx(n.strong,{children:"action"})," — it runs the whole lineage. On an expensive pipeline, cache before exploring."]}),`
`]})}),`
`,e.jsx(d,{question:"What does df.describe() NOT show by default?",options:["Mean","Standard deviation","Median (50th percentile)","Count"],correct:2})]})}function m(t={}){const{wrapper:n}={...o(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(r,{...t})}):r(t)}export{m as default};
