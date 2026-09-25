import{u as l,j as e,B as o,b as s,R as r,C as i,Q as d}from"./index-WYRBR6CI.js";import{P as c}from"./PredictReveal-DnF7AdIF.js";function a(t){const n={code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...l(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Data Cleaning"}),`
`,e.jsx(o,{children:e.jsx(n.p,{children:"In Module 6, we wrote UDFs to apply custom logic to our data. Now we face a real-world challenge: our dataset has problems. Before any analysis, we need to clean it."})}),`
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
`,e.jsxs(c,{prompt:"You filter rows where a column does not equal the string unknown. Rows where that column is null are dropped too. Why?",options:["They should be kept, this is a bug in the engine","Any comparison with null evaluates to null rather than true, and a filter keeps only rows that evaluate to true"],correct:1,children:[e.jsx(n.p,{children:"PySpark gives you three strategies depending on whether you want to find, drop, or fill nulls."}),e.jsx(n.h3,{children:"Finding Nulls"}),e.jsx(s,{language:"python",children:`from pyspark.sql.functions import col

# Find rows where student_id is null
messy_df.filter(col("student_id").isNull()).show()`}),e.jsx(n.h3,{children:"Dropping Nulls"}),e.jsx(s,{language:"python",children:`# Drop rows with ANY null value
no_nulls = messy_df.dropna()

# Drop only where student_id is null
valid_students = messy_df.dropna(subset=["student_id"])`}),e.jsx(n.h3,{children:"Filling Nulls"}),e.jsx(s,{language:"python",children:`# Fill null grades with 0
filled_df = messy_df.fillna({"grade": 0})`})]}),`
`,e.jsx(r,{items:[{q:"Why do null rows disappear from a filter that was not about nulls?",a:"Comparisons involving null return null, not true or false, and a filter keeps only rows evaluating to true. Any row with a null in the compared column is therefore silently excluded, whichever way the comparison points. Explicit null handling has to be written in."}]}),`
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
`,e.jsxs(i,{title:"Pipeline Order Matters",children:[e.jsx(n.p,{children:"The order of cleaning steps affects performance. Put the cheapest, highest-selectivity filters first:"}),e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"dropDuplicates"})," early — reduces rows before expensive string operations"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"filter(isNotNull)"})," — eliminates rows that would fail later operations"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"filter(range)"})," — cheap arithmetic filter"]}),`
`,e.jsx(n.li,{children:"String transformations last — applied only to surviving rows"}),`
`]}),e.jsx(n.p,{children:"Spark's Catalyst optimizer can reorder some filters automatically, but explicit ordering makes intent clear and aids debugging."})]}),`
`,e.jsx(r,{items:[{q:"Two different arguments govern cleaning order — cost and correctness. Give both.",a:"Cost: dropping nulls and duplicates first shrinks the row count, so every later string transform runs on less data. Correctness: normalising case and trimming whitespace must happen BEFORE deduplication, because 'Data Structures ' and 'data structures' are only recognisable as duplicates once normalised. When the two arguments conflict, correctness wins."},{q:"Why is dropDuplicates() with no arguments usually wrong?",a:"Because it requires every column to match exactly, so two records of the same enrollment that differ in a timestamp or a whitespace artefact both survive. Pass the subset of columns that genuinely identifies a record — for example the enrollment id — so the dedup matches your definition of duplicate rather than byte equality."},{q:"Catalyst reorders filters automatically. Why write them in a deliberate order anyway?",a:"Because Catalyst can only reorder operations whose semantics it understands, and it will not reorder anything that changes results — such as moving a dedup across a normalisation. Explicit ordering also documents intent and makes a pipeline debuggable step by step, which matters more than the marginal optimisation."},{q:"A grade column contains -5 and 150. Which module's technique catches this, and which does not?",a:"A domain range rule catches it: grades are defined on 0 to 100, so both are impossible regardless of how the data is distributed. An outlier method like IQR fences would not reliably catch 150 if the spread is wide, and would flag legitimate extremes alongside it. Impossible and unusual are different categories."}]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(i,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Five standard defects: nulls, duplicates, inconsistent casing, stray whitespace, out-of-range values."}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Order matters for cost"}),": drop nulls and duplicates ",e.jsx(n.em,{children:"first"})," to shrink the row count, then run string transforms on what's left."]}),`
`,e.jsxs(n.li,{children:["Order also matters for ",e.jsx(n.em,{children:"correctness"}),": normalise casing and trim whitespace ",e.jsx(n.strong,{children:"before"})," deduplicating, or ",e.jsx(n.code,{children:'"Data Structures "'})," and ",e.jsx(n.code,{children:'"data structures"'})," won't be recognised as the same row."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"dropDuplicates()"})," with no arguments needs every column to match — pass the subset that actually defines a duplicate."]}),`
`,e.jsx(n.li,{children:"Range validation is a domain rule, not a statistic: a grade of −5 or 150 is impossible regardless of the distribution."}),`
`]})}),`
`,e.jsx(d,{question:"You have a DataFrame with 1M rows. Which cleaning step order is most efficient?",options:["String normalization first (trim, initcap), then filter nulls, then deduplicate","Deduplicate and filter nulls first to reduce row count, then apply string transformations to the smaller result","All operations are equivalent — Spark always optimizes the order automatically","Range validation first, then deduplication, then string normalization, then null filtering"],correct:1})]})}function p(t={}){const{wrapper:n}={...l(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(a,{...t})}):a(t)}export{p as default};
