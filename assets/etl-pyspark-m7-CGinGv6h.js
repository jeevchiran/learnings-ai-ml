import{u as i,j as e,B as t,b as s,C as a,Q as o}from"./index-VIW80S6x.js";function l(r){const n={code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...i(),...r.components};return e.jsxs(e.Fragment,{children:[e.jsx(t,{children:e.jsx(n.p,{children:"In Module 6, we wrote UDFs to apply custom logic to our data. Now we face a real-world challenge: our dataset has problems. Before any analysis, we need to clean it."})}),`
`,e.jsx(n.h2,{children:"Introducing the Messy Data"}),`
`,e.jsxs(n.p,{children:["Our file ",e.jsx(n.code,{children:"grades_messy.csv"})," has a range of quality issues typical of real-world datasets:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Null values"})," — missing student IDs or grades"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Duplicate rows"})," — the same enrollment appearing more than once"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Inconsistent casing"}),' — "Fall 2024", "SPRING 2025", "spring 2025"']}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Extra whitespace"}),' — " Data Structures " with leading/trailing spaces']}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Invalid grades"})," — negative values or scores above 100"]}),`
`]}),`
`,e.jsx(s,{language:"python",children:`messy_df = spark.read.csv("grades_messy.csv", header=True, inferSchema=True)
messy_df.show(10)
# +-------------+----------+--------------------+-----------+-----+
# |enrollment_id|student_id|         course_name|   semester|grade|
# +-------------+----------+--------------------+-----------+-----+
# |         E001|      1001|Intro to Programming|  Fall 2024|   92|
# |         E002|      1002| Data Structures    |SPRING 2025|   88|
# |         E002|      1002|data structures     |spring 2025|   88|  <- duplicate
# |         E003|      null|          Calculus I|  Fall 2024|   75|  <- null id
# |         E004|      1004|          calculus I|  fall 2024|   -5|  <- invalid grade
# |         E005|      1005|          ALGORITHMS|Spring 2025|  105|  <- invalid grade
# +-------------+----------+--------------------+-----------+-----+`}),`
`,e.jsx(n.h2,{children:"Handling Nulls"}),`
`,e.jsx(n.p,{children:"PySpark gives you three strategies depending on whether you want to find, drop, or fill nulls."}),`
`,e.jsx(n.h3,{children:"Finding Nulls"}),`
`,e.jsx(s,{language:"python",children:`from pyspark.sql.functions import col

# Find rows where student_id is null
messy_df.filter(col("student_id").isNull()).show()`}),`
`,e.jsx(n.h3,{children:"Dropping Nulls"}),`
`,e.jsx(s,{language:"python",children:`# Drop rows with ANY null value
no_nulls = messy_df.dropna()

# Drop only where student_id is null
valid_students = messy_df.dropna(subset=["student_id"])`}),`
`,e.jsx(n.h3,{children:"Filling Nulls"}),`
`,e.jsx(s,{language:"python",children:`# Fill null grades with 0
filled_df = messy_df.fillna({"grade": 0})`}),`
`,e.jsx(n.h2,{children:"Removing Duplicates"}),`
`,e.jsx(s,{language:"python",children:`# Remove exact duplicate rows
deduped = messy_df.dropDuplicates()

# Deduplicate by a specific key column
deduped_by_key = messy_df.dropDuplicates(["enrollment_id"])
print(f"Before: {messy_df.count()} rows")
print(f"After: {deduped_by_key.count()} rows")`}),`
`,e.jsx(n.h2,{children:"Fixing Inconsistent Text"}),`
`,e.jsxs(n.p,{children:["PySpark provides ",e.jsx(n.code,{children:"trim()"}),", ",e.jsx(n.code,{children:"lower()"}),", and ",e.jsx(n.code,{children:"initcap()"})," to normalize text:"]}),`
`,e.jsx(s,{language:"python",children:`from pyspark.sql.functions import trim, lower, initcap

fixed_text = messy_df   .withColumn("course_name", trim(initcap(col("course_name"))))   .withColumn("semester", initcap(lower(col("semester"))))

# " Data Structures " → "Data Structures"
# "SPRING 2025" → "Spring 2025"
# "fall 2024" → "Fall 2024"`}),`
`,e.jsx(n.h2,{children:"Validating Ranges"}),`
`,e.jsx(s,{language:"python",children:`# Keep only rows where grade is between 0 and 100
valid_grades = messy_df.filter((col("grade") >= 0) & (col("grade") <= 100))

# Show what was removed
messy_df.filter((col("grade") < 0) | (col("grade") > 100)).show()
# E004: grade = -5   ← removed
# E005: grade = 105  ← removed`}),`
`,e.jsx(n.h2,{children:"Complete Cleaning Pipeline"}),`
`,e.jsx(n.p,{children:"In practice, chain all cleaning steps together using PySpark's fluent API:"}),`
`,e.jsx(s,{language:"python",children:`from pyspark.sql.functions import col, trim, lower, initcap

cleaned_df = (
  messy_df
  .dropDuplicates(["enrollment_id"])
  .filter(col("student_id").isNotNull())
  .filter((col("grade") >= 0) & (col("grade") <= 100))
  .withColumn("course_name", trim(initcap(col("course_name"))))
  .withColumn("semester", initcap(lower(col("semester"))))
)

print(f"Cleaned: {cleaned_df.count()} rows (from original {messy_df.count()})") 
# Cleaned: 5 rows (from original 10)`}),`
`,e.jsxs(a,{title:"Pipeline Order Matters",children:[e.jsx(n.p,{children:"The order of cleaning steps affects performance. Put the cheapest, highest-selectivity filters first:"}),e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"dropDuplicates"})," early — reduces rows before expensive string operations"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"filter(isNotNull)"})," — eliminates rows that would fail later operations"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"filter(range)"})," — cheap arithmetic filter"]}),`
`,e.jsx(n.li,{children:"String transformations last — applied only to surviving rows"}),`
`]}),e.jsx(n.p,{children:"Spark's Catalyst optimizer can reorder some filters automatically, but explicit ordering makes intent clear and aids debugging."})]}),`
`,e.jsx(o,{question:"You have a DataFrame with 1M rows. Which cleaning step order is most efficient?",options:["String normalization first (trim, initcap), then filter nulls, then deduplicate","Deduplicate and filter nulls first to reduce row count, then apply string transformations to the smaller result","All operations are equivalent — Spark always optimizes the order automatically","Range validation first, then deduplication, then string normalization, then null filtering"],correct:1})]})}function c(r={}){const{wrapper:n}={...i(),...r.components};return n?e.jsx(n,{...r,children:e.jsx(l,{...r})}):l(r)}export{c as default};
