import{u as r,j as e,B as i,b as t,C as o,Q as d}from"./index-VIW80S6x.js";function a(s){const n={code:"code",h2:"h2",li:"li",p:"p",ul:"ul",...r(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i,{children:e.jsx(n.p,{children:"In Module 7, we cleaned our messy dataset — removed nulls, duplicates, fixed casing, and filtered invalid values. Now we explore the clean data to understand what we're working with."})}),`
`,e.jsx(n.h2,{children:"Schema Inspection"}),`
`,e.jsx(n.p,{children:"Before any analysis, know what you're working with. Schema inspection tells you column names, data types, and nullable flags."}),`
`,e.jsx(t,{language:"python",children:`students_df.printSchema()
# root
#  |-- student_id: integer (nullable = false)
#  |-- name: string (nullable = true)
#  |-- major: string (nullable = true)
#  |-- year: integer (nullable = true)
#  |-- gpa: double (nullable = true)

print("dtypes:", students_df.dtypes)
print("columns:", students_df.columns)`}),`
`,e.jsx(n.h2,{children:"Descriptive Statistics"}),`
`,e.jsx(n.p,{children:"PySpark provides two methods for quick statistical summaries:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"df.describe()"})," — count, mean, stddev, min, max for numeric columns"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"df.summary()"})," — everything in describe() plus percentiles (25%, 50%, 75%)"]}),`
`]}),`
`,e.jsx(t,{language:"python",children:`students_df.describe().show()
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
`,e.jsx(o,{title:"describe() vs summary()",children:e.jsxs(n.p,{children:[e.jsx(n.code,{children:"describe()"})," does not show the median (50th percentile) by default — use ",e.jsx(n.code,{children:"summary()"})," for that. ",e.jsx(n.code,{children:"summary()"}),' also includes "25%" and "75%" rows, giving you the full IQR (interquartile range) for detecting outliers.']})}),`
`,e.jsx(n.h2,{children:"Value Counts and Distributions"}),`
`,e.jsx(n.p,{children:"For categorical columns, understand how values are distributed:"}),`
`,e.jsx(t,{language:"python",children:`# Frequency count per category
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
`,e.jsx(t,{language:"python",children:`# Random 20% sample (seed for reproducibility)
students_df.sample(fraction=0.2, seed=42).show()

# First 5 rows as list of Row objects
rows = students_df.take(5)

# Limit to 10 rows and display as table
students_df.limit(10).show()`}),`
`,e.jsx(n.h2,{children:"Cross-tabulation"}),`
`,e.jsx(n.p,{children:"Cross-tabulation creates a pivot-table-like frequency matrix showing how two categorical variables relate:"}),`
`,e.jsx(t,{language:"python",children:`# How many CS students are in year 3?
students_df.crosstab("major", "year").show()
# +-----------+---+---+---+---+
# |major_year |  1|  2|  3|  4|
# +-----------+---+---+---+---+
# |         CS|  3|  4|  4|  4|
# |         DS|  2|  4|  4|  4|
# |       Math|  3|  2|  3|  3|
# |       Stat|  2|  3|  3|  2|
# +-----------+---+---+---+---+`}),`
`,e.jsx(d,{question:"What does df.describe() NOT show by default?",options:["Mean","Standard deviation","Median (50th percentile)","Count"],correct:2})]})}function c(s={}){const{wrapper:n}={...r(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(a,{...s})}):a(s)}export{c as default};
