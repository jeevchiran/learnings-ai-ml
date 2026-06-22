import{u as i,j as n,B as o,b as t,C as d,Q as l}from"./index-VIW80S6x.js";function r(s){const e={code:"code",h2:"h2",h3:"h3",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...i(),...s.components};return n.jsxs(n.Fragment,{children:[n.jsx(o,{children:n.jsx(e.p,{children:"In Module 8, we explored our clean dataset — examining distributions, statistics, and cross-tabulations. Now we reshape it: joining tables, aggregating values, pivoting, and ranking."})}),`
`,n.jsx(e.h2,{children:"Joins"}),`
`,n.jsx(e.p,{children:"Joins combine rows from two DataFrames based on a shared key column."}),`
`,n.jsxs(e.table,{children:[n.jsx(e.thead,{children:n.jsxs(e.tr,{children:[n.jsx(e.th,{children:"Join type"}),n.jsx(e.th,{children:"Returns"})]})}),n.jsxs(e.tbody,{children:[n.jsxs(e.tr,{children:[n.jsx(e.td,{children:n.jsx(e.code,{children:"inner"})}),n.jsx(e.td,{children:"Only rows with key in both DataFrames"})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:n.jsx(e.code,{children:"left"})}),n.jsx(e.td,{children:"All rows from left; unmatched right rows get nulls"})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:n.jsx(e.code,{children:"right"})}),n.jsx(e.td,{children:"All rows from right; unmatched left rows get nulls"})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:n.jsx(e.code,{children:"full"})}),n.jsx(e.td,{children:"All rows from both; unmatched sides get nulls"})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:n.jsx(e.code,{children:"anti"})}),n.jsx(e.td,{children:"Rows from left with NO match in right"})]})]})]}),`
`,n.jsx(t,{language:"python",children:`# Inner join — only matching rows from both sides
joined = students_df.join(enrollments_df, "student_id", "inner")
joined.show(5)

# Left join — all students, nulls for those without enrollments
left_joined = students_df.join(enrollments_df, "student_id", "left")
left_joined.show(5)

# Anti join — students with NO enrollments
no_enrollments = students_df.join(enrollments_df, "student_id", "anti")
no_enrollments.show()`}),`
`,n.jsx(e.h2,{children:"Aggregation with agg()"}),`
`,n.jsxs(e.p,{children:[n.jsx(e.code,{children:"agg()"})," computes multiple aggregate functions in a single call after ",n.jsx(e.code,{children:"groupBy()"}),":"]}),`
`,n.jsx(t,{language:"python",children:`from pyspark.sql.functions import avg, count, max as spark_max

students_df.groupBy("major").agg(
  avg("gpa"),
  count("*"),
  spark_max("gpa")
).show()
# +-----+--------+--------+--------+
# |major|avg(gpa)|count(1)|max(gpa)|
# +-----+--------+--------+--------+
# |   CS|    3.50|       2|     3.8|
# |   DS|    3.60|       2|     3.7|
# | Math|    3.90|       1|     3.9|
# +-----+--------+--------+--------+`}),`
`,n.jsx(e.h2,{children:"Pivoting"}),`
`,n.jsx(e.p,{children:"Pivoting transforms row values into columns — useful for comparing metrics across categories side-by-side:"}),`
`,n.jsx(t,{language:"python",children:`from pyspark.sql.functions import avg

# Average grade per student per semester (rows → columns)
pivoted = enrollments_df.groupBy("student_id")   .pivot("semester")   .agg(avg("grade"))

pivoted.show()
# +----------+---------+-----------+
# |student_id|Fall 2024|Spring 2025|
# +----------+---------+-----------+
# |      1001|     88.0|       92.0|
# |      1002|     85.0|       null|
# |      1003|     91.0|       null|
# +----------+---------+-----------+`}),`
`,n.jsx(e.h2,{children:"Window Functions"}),`
`,n.jsxs(e.p,{children:["Window functions compute values across related rows ",n.jsx(e.strong,{children:"without collapsing groups"}),". You define a window spec (partition + order), then apply ranking or analytic functions over it."]}),`
`,n.jsxs(e.table,{children:[n.jsx(e.thead,{children:n.jsxs(e.tr,{children:[n.jsx(e.th,{children:"Function"}),n.jsx(e.th,{children:"Behavior"})]})}),n.jsxs(e.tbody,{children:[n.jsxs(e.tr,{children:[n.jsx(e.td,{children:n.jsx(e.code,{children:"row_number()"})}),n.jsx(e.td,{children:"Unique sequential number within partition"})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:n.jsx(e.code,{children:"rank()"})}),n.jsx(e.td,{children:"Rank with gaps for ties (1, 2, 2, 4)"})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:n.jsx(e.code,{children:"dense_rank()"})}),n.jsx(e.td,{children:"Rank without gaps (1, 2, 2, 3)"})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:n.jsx(e.code,{children:"lag(col, n)"})}),n.jsx(e.td,{children:"Value from n rows before current"})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:n.jsx(e.code,{children:"lead(col, n)"})}),n.jsx(e.td,{children:"Value from n rows after current"})]})]})]}),`
`,n.jsx(e.h3,{children:"Ranking students by GPA within major"}),`
`,n.jsx(t,{language:"python",children:`from pyspark.sql.window import Window
from pyspark.sql.functions import dense_rank, col

# Partition by major, order by GPA descending
window_spec = Window.partitionBy("major").orderBy(col("gpa").desc())

ranked = students_df.withColumn("rank", dense_rank().over(window_spec))
ranked.select("name", "major", "gpa", "rank").show()
# +------+-----+---+----+
# |  name|major|gpa|rank|
# +------+-----+---+----+
# | Alice|   CS|3.8|   1|
# | David|   CS|3.2|   2|
# |   Eva|   DS|3.7|   1|
# |   Bob|   DS|3.5|   2|
# +------+-----+---+----+`}),`
`,n.jsx(e.h3,{children:"Using lag() to compare adjacent rows"}),`
`,n.jsx(t,{language:"python",children:`from pyspark.sql.functions import lag

with_lag = students_df   .withColumn("prev_gpa", lag("gpa", 1).over(window_spec))   .withColumn("gpa_diff", col("gpa") - col("prev_gpa"))

with_lag.select("name", "major", "gpa", "prev_gpa", "gpa_diff").show()
# Alice: prev_gpa = null (first in partition)
# David: prev_gpa = 3.8, gpa_diff = -0.6`}),`
`,n.jsx(e.h2,{children:"Union"}),`
`,n.jsxs(e.p,{children:[n.jsx(e.code,{children:"union()"})," performs vertical concatenation — stacking rows from two DataFrames with the same schema:"]}),`
`,n.jsx(t,{language:"python",children:`cs_students = students_df.filter(col("major") == "CS")
ds_students = students_df.filter(col("major") == "DS")

# Both must have the same schema
combined = cs_students.union(ds_students)
combined.show()`}),`
`,n.jsx(d,{title:"union() vs unionByName()",children:n.jsxs(e.p,{children:[n.jsx(e.code,{children:"union()"})," matches columns by position — column names don't matter, only order. ",n.jsx(e.code,{children:"unionByName()"})," matches by name and handles schema differences gracefully. When DataFrames have columns in different orders, always use ",n.jsx(e.code,{children:"unionByName()"}),"."]})}),`
`,n.jsx(l,{question:"You want to find all students who have NO enrollments. Which join type gives you this result?",options:["Left join, then filter where enrollment columns are null","Anti join — returns rows from the left DataFrame that have no match in the right","Inner join, then negate the result","Full outer join, then filter where right side is null"],correct:1})]})}function c(s={}){const{wrapper:e}={...i(),...s.components};return e?n.jsx(e,{...s,children:n.jsx(r,{...s})}):r(s)}export{c as default};
