import{r as b,j as e,u as g,C as p,B as v,b as a,R as k,Q as _}from"./index-Ba5-wm3B.js";const i="#f59e0b",h="#dc2626",x=[{key:"map",label:"map / filter",wide:!1,note:"Narrow — each output partition depends on one input partition. No data crosses the network."},{key:"groupby",label:"groupBy / join",wide:!0,note:"Wide — rows with the same key must meet, so partitions are re-shuffled across the network. Expensive."},{key:"repartition",label:"repartition",wide:!0,note:"Wide — deliberately redistributes rows across new partitions. A full shuffle."}];function B(){const[s,n]=b.useState("map"),o=x.find(t=>t.key===s),f=380,w=180,d=60,l=320,c=[40,90,140],u=[];return c.forEach((t,r)=>c.forEach((y,m)=>{(o.wide||r===m)&&u.push({iy:t,oy:y,cross:r!==m})})),e.jsxs("div",{children:[e.jsx("div",{style:{display:"flex",gap:"0.4rem",marginBottom:"0.7rem",flexWrap:"wrap"},children:x.map(t=>e.jsx("button",{onClick:()=>n(t.key),style:{padding:"0.24rem 0.7rem",borderRadius:4,fontSize:"0.78rem",fontFamily:"monospace",cursor:"pointer",fontWeight:s===t.key?700:400,border:`2px solid ${s===t.key?i:"var(--border)"}`,background:s===t.key?i:"var(--bg)",color:s===t.key?"#fff":"var(--text)"},children:t.label},t.key))}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("svg",{width:f,height:w,style:{display:"block",minWidth:300},children:[e.jsx("text",{x:d,y:16,textAnchor:"middle",fontSize:"10",fill:"var(--text-muted)",children:"input partitions"}),e.jsx("text",{x:l,y:16,textAnchor:"middle",fontSize:"10",fill:"var(--text-muted)",children:"output partitions"}),u.map((t,r)=>e.jsx("line",{x1:d+22,y1:t.iy,x2:l-22,y2:t.oy,stroke:t.cross?h:i,strokeWidth:t.cross?1.5:2,opacity:t.cross?.6:.9,strokeDasharray:t.cross?"4,3":"none",style:{transition:"all 0.3s"}},r)),c.map((t,r)=>e.jsxs("g",{children:[e.jsx("rect",{x:d-22,y:t-14,width:44,height:28,rx:4,fill:`${i}cc`}),e.jsxs("text",{x:d,y:t+4,textAnchor:"middle",fontSize:"10",fill:"#fff",children:["P",r+1]})]},"in"+r)),c.map((t,r)=>e.jsxs("g",{children:[e.jsx("rect",{x:l-22,y:t-14,width:44,height:28,rx:4,fill:o.wide?`${h}cc`:`${i}cc`}),e.jsxs("text",{x:l,y:t+4,textAnchor:"middle",fontSize:"10",fill:"#fff",children:["P",r+1]})]},"out"+r))]})}),e.jsxs("div",{style:{marginTop:"0.4rem",background:"var(--bg-hover)",borderLeft:`3px solid ${o.wide?h:i}`,padding:"0.5rem 0.8rem",borderRadius:"0 4px 4px 0",fontSize:"0.82rem"},children:[e.jsxs("strong",{style:{color:o.wide?h:i},children:[o.wide?"Wide":"Narrow"," transformation:"]})," ",o.note]}),e.jsx("p",{style:{fontSize:"0.78rem",color:"var(--text-muted)",marginTop:"0.4rem"},children:"Shuffles dominate Spark job cost. Minimizing wide transformations — and broadcasting small tables in joins — is the core of tuning."})]})}function j(s){const n={code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...g(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(p,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Five join types worth knowing cold: ",e.jsx(n.code,{children:"inner"}),", ",e.jsx(n.code,{children:"left"}),", ",e.jsx(n.code,{children:"right"}),", ",e.jsx(n.code,{children:"full"}),", and ",e.jsx(n.strong,{children:e.jsx(n.code,{children:"anti"})}),' — the last answers "which rows have ',e.jsx(n.em,{children:"no"}),' match?" in one step.']}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Narrow vs wide is the performance distinction."})," Narrow operations stay within a partition; wide ones (joins, ",e.jsx(n.code,{children:"groupBy"}),", ",e.jsx(n.code,{children:"distinct"}),") shuffle data across the network."]}),`
`,e.jsxs(n.li,{children:["The shuffle is the expensive part of any Spark job. Reduce data ",e.jsx(n.em,{children:"before"})," it, never after."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"union()"})," matches by position, ",e.jsx(n.code,{children:"unionByName()"})," by name."]})," Position-matching silently produces garbage when column orders differ — prefer the named variant."]}),`
`,e.jsxs(n.li,{children:["Window functions rank and aggregate ",e.jsx(n.em,{children:"without collapsing rows"}),", which is what separates them from ",e.jsx(n.code,{children:"groupBy"}),"."]}),`
`]})}),`
`,e.jsx(v,{children:e.jsx(n.p,{children:"In Module 8, we explored our clean dataset — examining distributions, statistics, and cross-tabulations. Now we reshape it: joining tables, aggregating values, pivoting, and ranking."})}),`
`,e.jsx(n.h2,{children:"Joins"}),`
`,e.jsx(n.p,{children:"Joins combine rows from two DataFrames based on a shared key column."}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Join type"}),e.jsx(n.th,{children:"Returns"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"inner"})}),e.jsx(n.td,{children:"Only rows with key in both DataFrames"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"left"})}),e.jsx(n.td,{children:"All rows from left; unmatched right rows get nulls"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"right"})}),e.jsx(n.td,{children:"All rows from right; unmatched left rows get nulls"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"full"})}),e.jsx(n.td,{children:"All rows from both; unmatched sides get nulls"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"anti"})}),e.jsx(n.td,{children:"Rows from left with NO match in right"})]})]})]}),`
`,e.jsx(a,{language:"python",children:`# Inner join — only matching rows from both sides
joined = students_df.join(enrollments_df, "student_id", "inner")
joined.show(5)

# Left join — all students, nulls for those without enrollments
left_joined = students_df.join(enrollments_df, "student_id", "left")
left_joined.show(5)

# Anti join — students with NO enrollments
no_enrollments = students_df.join(enrollments_df, "student_id", "anti")
no_enrollments.show()`}),`
`,e.jsx(n.h2,{children:"Aggregation with agg()"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"agg()"})," computes multiple aggregate functions in a single call after ",e.jsx(n.code,{children:"groupBy()"}),":"]}),`
`,e.jsx(a,{language:"python",children:`from pyspark.sql.functions import avg, count, max as spark_max

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
`,e.jsx(n.h2,{children:"Pivoting"}),`
`,e.jsx(n.p,{children:"Pivoting transforms row values into columns — useful for comparing metrics across categories side-by-side:"}),`
`,e.jsx(a,{language:"python",children:`from pyspark.sql.functions import avg

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
`,e.jsx(n.h2,{children:"Window Functions"}),`
`,e.jsxs(n.p,{children:["Window functions compute values across related rows ",e.jsx(n.strong,{children:"without collapsing groups"}),". You define a window spec (partition + order), then apply ranking or analytic functions over it."]}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Function"}),e.jsx(n.th,{children:"Behavior"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"row_number()"})}),e.jsx(n.td,{children:"Unique sequential number within partition"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"rank()"})}),e.jsx(n.td,{children:"Rank with gaps for ties (1, 2, 2, 4)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"dense_rank()"})}),e.jsx(n.td,{children:"Rank without gaps (1, 2, 2, 3)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"lag(col, n)"})}),e.jsx(n.td,{children:"Value from n rows before current"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"lead(col, n)"})}),e.jsx(n.td,{children:"Value from n rows after current"})]})]})]}),`
`,e.jsx(n.h3,{children:"Ranking students by GPA within major"}),`
`,e.jsx(a,{language:"python",children:`from pyspark.sql.window import Window
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
`,e.jsx(n.h3,{children:"Using lag() to compare adjacent rows"}),`
`,e.jsx(a,{language:"python",children:`from pyspark.sql.functions import lag

with_lag = students_df   .withColumn("prev_gpa", lag("gpa", 1).over(window_spec))   .withColumn("gpa_diff", col("gpa") - col("prev_gpa"))

with_lag.select("name", "major", "gpa", "prev_gpa", "gpa_diff").show()
# Alice: prev_gpa = null (first in partition)
# David: prev_gpa = 3.8, gpa_diff = -0.6`}),`
`,e.jsx(B,{}),`
`,e.jsx(n.h2,{children:"Union"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"union()"})," performs vertical concatenation — stacking rows from two DataFrames with the same schema:"]}),`
`,e.jsx(a,{language:"python",children:`cs_students = students_df.filter(col("major") == "CS")
ds_students = students_df.filter(col("major") == "DS")

# Both must have the same schema
combined = cs_students.union(ds_students)
combined.show()`}),`
`,e.jsx(p,{title:"union() vs unionByName()",children:e.jsxs(n.p,{children:[e.jsx(n.code,{children:"union()"})," matches columns by position — column names don't matter, only order. ",e.jsx(n.code,{children:"unionByName()"})," matches by name and handles schema differences gracefully. When DataFrames have columns in different orders, always use ",e.jsx(n.code,{children:"unionByName()"}),"."]})}),`
`,e.jsx(k,{items:[{q:"Find all students with no enrollments. Two ways — which is better and why?",a:"Anti join expresses it directly: students.join(enrollments, 'student_id', 'anti') returns exactly the unmatched left rows. The alternative — left join then filter where the right columns are null — works but materialises all the matched rows first and is fragile if the right side legitimately contains nulls. The anti join says what you mean and moves less data."},{q:"Define narrow and wide operations, and name three of each.",a:"Narrow: each output partition depends on one input partition, so no data crosses the network — filter, select, withColumn. Wide: output partitions depend on many input partitions, forcing a shuffle — join, groupBy, distinct. The narrow-to-wide boundary is where Spark stages break and where jobs get slow."},{q:"Why does 'reduce data before the shuffle' matter more than any other tuning advice here?",a:"Because the shuffle writes intermediate data to disk and sends it over the network, and its cost scales with the volume crossing that boundary. Filtering a billion rows to a million BEFORE a join means the shuffle moves a thousandth of the data; doing it after means you paid full price and then discarded the result."},{q:"Two DataFrames have the same columns in different orders. What does union() do?",a:"It matches by POSITION, so it will happily stack a name column onto a major column and produce a DataFrame that is silently wrong — no error, because the types may still line up. unionByName matches on column names and can also handle missing columns with allowMissingColumns. Prefer it as the default."},{q:"When do you need a window function rather than a groupBy?",a:"When you need a per-group calculation attached to every original row rather than one row per group — ranking students within their major, computing a running total, or comparing each value to its group's average. groupBy collapses the rows; a window preserves them and adds the aggregate as a new column."}]}),`
`,e.jsx(_,{question:"You want to find all students who have NO enrollments. Which join type gives you this result?",options:["Left join, then filter where enrollment columns are null","Anti join — returns rows from the left DataFrame that have no match in the right","Inner join, then negate the result","Full outer join, then filter where right side is null"],correct:1})]})}function W(s={}){const{wrapper:n}={...g(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(j,{...s})}):j(s)}export{W as default};
