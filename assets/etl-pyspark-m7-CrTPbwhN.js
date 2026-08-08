import{u as a,j as e,C as r,B as l,b as n,R as o,Q as d}from"./index-COnZx3Nm.js";function i(t){const s={code:"code",em:"em",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...a(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{title:"TL;DR",children:e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Five standard defects: nulls, duplicates, inconsistent casing, stray whitespace, out-of-range values."}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Order matters for cost"}),": drop nulls and duplicates ",e.jsx(s.em,{children:"first"})," to shrink the row count, then run string transforms on what's left."]}),`
`,e.jsxs(s.li,{children:["Order also matters for ",e.jsx(s.em,{children:"correctness"}),": normalise casing and trim whitespace ",e.jsx(s.strong,{children:"before"})," deduplicating, or ",e.jsx(s.code,{children:'"Data Structures "'})," and ",e.jsx(s.code,{children:'"data structures"'})," won't be recognised as the same row."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"dropDuplicates()"})," with no arguments needs every column to match — pass the subset that actually defines a duplicate."]}),`
`,e.jsx(s.li,{children:"Range validation is a domain rule, not a statistic: a grade of −5 or 150 is impossible regardless of the distribution."}),`
`]})}),`
`,e.jsx(l,{children:e.jsx(s.p,{children:"In Module 6, we wrote UDFs to apply custom logic to our data. Now we face a real-world challenge: our dataset has problems. Before any analysis, we need to clean it."})}),`
`,e.jsx(s.h2,{children:"Introducing the Messy Data"}),`
`,e.jsxs(s.p,{children:["Our file ",e.jsx(s.code,{children:"grades_messy.csv"})," has a range of quality issues typical of real-world datasets:"]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Null values"})," — missing student IDs or grades"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Duplicate rows"})," — the same enrollment appearing more than once"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Inconsistent casing"}),' — "Fall 2024", "SPRING 2025", "spring 2025"']}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Extra whitespace"}),' — " Data Structures " with leading/trailing spaces']}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Invalid grades"})," — negative values or scores above 100"]}),`
`]}),`
`,e.jsx(n,{language:"python",children:`messy_df = spark.read.csv("grades_messy.csv", header=True, inferSchema=True)
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
`,e.jsx(s.h2,{children:"Handling Nulls"}),`
`,e.jsx(s.p,{children:"PySpark gives you three strategies depending on whether you want to find, drop, or fill nulls."}),`
`,e.jsx(s.h3,{children:"Finding Nulls"}),`
`,e.jsx(n,{language:"python",children:`from pyspark.sql.functions import col

# Find rows where student_id is null
messy_df.filter(col("student_id").isNull()).show()`}),`
`,e.jsx(s.h3,{children:"Dropping Nulls"}),`
`,e.jsx(n,{language:"python",children:`# Drop rows with ANY null value
no_nulls = messy_df.dropna()

# Drop only where student_id is null
valid_students = messy_df.dropna(subset=["student_id"])`}),`
`,e.jsx(s.h3,{children:"Filling Nulls"}),`
`,e.jsx(n,{language:"python",children:`# Fill null grades with 0
filled_df = messy_df.fillna({"grade": 0})`}),`
`,e.jsx(s.h2,{children:"Removing Duplicates"}),`
`,e.jsx(n,{language:"python",children:`# Remove exact duplicate rows
deduped = messy_df.dropDuplicates()

# Deduplicate by a specific key column
deduped_by_key = messy_df.dropDuplicates(["enrollment_id"])
print(f"Before: {messy_df.count()} rows")
print(f"After: {deduped_by_key.count()} rows")`}),`
`,e.jsx(s.h2,{children:"Fixing Inconsistent Text"}),`
`,e.jsxs(s.p,{children:["PySpark provides ",e.jsx(s.code,{children:"trim()"}),", ",e.jsx(s.code,{children:"lower()"}),", and ",e.jsx(s.code,{children:"initcap()"})," to normalize text:"]}),`
`,e.jsx(n,{language:"python",children:`from pyspark.sql.functions import trim, lower, initcap

fixed_text = messy_df   .withColumn("course_name", trim(initcap(col("course_name"))))   .withColumn("semester", initcap(lower(col("semester"))))

# " Data Structures " → "Data Structures"
# "SPRING 2025" → "Spring 2025"
# "fall 2024" → "Fall 2024"`}),`
`,e.jsx(s.h2,{children:"Validating Ranges"}),`
`,e.jsx(n,{language:"python",children:`# Keep only rows where grade is between 0 and 100
valid_grades = messy_df.filter((col("grade") >= 0) & (col("grade") <= 100))

# Show what was removed
messy_df.filter((col("grade") < 0) | (col("grade") > 100)).show()
# E004: grade = -5   ← removed
# E005: grade = 105  ← removed`}),`
`,e.jsx(s.h2,{children:"Complete Cleaning Pipeline"}),`
`,e.jsx(s.p,{children:"In practice, chain all cleaning steps together using PySpark's fluent API:"}),`
`,e.jsx(n,{language:"python",children:`from pyspark.sql.functions import col, trim, lower, initcap

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
`,e.jsxs(r,{title:"Pipeline Order Matters",children:[e.jsx(s.p,{children:"The order of cleaning steps affects performance. Put the cheapest, highest-selectivity filters first:"}),e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"dropDuplicates"})," early — reduces rows before expensive string operations"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"filter(isNotNull)"})," — eliminates rows that would fail later operations"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"filter(range)"})," — cheap arithmetic filter"]}),`
`,e.jsx(s.li,{children:"String transformations last — applied only to surviving rows"}),`
`]}),e.jsx(s.p,{children:"Spark's Catalyst optimizer can reorder some filters automatically, but explicit ordering makes intent clear and aids debugging."})]}),`
`,e.jsx(o,{items:[{q:"Two different arguments govern cleaning order — cost and correctness. Give both.",a:"Cost: dropping nulls and duplicates first shrinks the row count, so every later string transform runs on less data. Correctness: normalising case and trimming whitespace must happen BEFORE deduplication, because 'Data Structures ' and 'data structures' are only recognisable as duplicates once normalised. When the two arguments conflict, correctness wins."},{q:"Why is dropDuplicates() with no arguments usually wrong?",a:"Because it requires every column to match exactly, so two records of the same enrollment that differ in a timestamp or a whitespace artefact both survive. Pass the subset of columns that genuinely identifies a record — for example the enrollment id — so the dedup matches your definition of duplicate rather than byte equality."},{q:"Catalyst reorders filters automatically. Why write them in a deliberate order anyway?",a:"Because Catalyst can only reorder operations whose semantics it understands, and it will not reorder anything that changes results — such as moving a dedup across a normalisation. Explicit ordering also documents intent and makes a pipeline debuggable step by step, which matters more than the marginal optimisation."},{q:"A grade column contains -5 and 150. Which module's technique catches this, and which does not?",a:"A domain range rule catches it: grades are defined on 0 to 100, so both are impossible regardless of how the data is distributed. An outlier method like IQR fences would not reliably catch 150 if the spread is wide, and would flag legitimate extremes alongside it. Impossible and unusual are different categories."}]}),`
`,e.jsx(d,{question:"You have a DataFrame with 1M rows. Which cleaning step order is most efficient?",options:["String normalization first (trim, initcap), then filter nulls, then deduplicate","Deduplicate and filter nulls first to reduce row count, then apply string transformations to the smaller result","All operations are equivalent — Spark always optimizes the order automatically","Range validation first, then deduplication, then string normalization, then null filtering"],correct:1})]})}function u(t={}){const{wrapper:s}={...a(),...t.components};return s?e.jsx(s,{...t,children:e.jsx(i,{...t})}):i(t)}export{u as default};
