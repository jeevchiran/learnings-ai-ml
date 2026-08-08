import{u as i,j as e,C as s,B as o,b as n,R as l,Q as d}from"./index-COnZx3Nm.js";function a(t){const r={code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(s,{title:"TL;DR",children:e.jsxs(r.ul,{children:[`
`,e.jsxs(r.li,{children:["A UDF runs your Python on each row — reach for it only when built-ins and ",e.jsx(r.code,{children:"when()"})," chains genuinely can't express the rule."]}),`
`,e.jsxs(r.li,{children:[e.jsx(r.strong,{children:"UDFs are a Catalyst black box."})," Spark can't see inside, so no pushdown, no reordering, no optimisation of that step."]}),`
`,e.jsx(r.li,{children:"Worse, a regular UDF serialises every row across the JVM↔Python boundary. That round-trip is the real cost."}),`
`,e.jsxs(r.li,{children:[e.jsx(r.strong,{children:"Pandas UDFs fix the transport"}),", not the opacity: Arrow ships batches instead of rows, typically an order of magnitude faster."]}),`
`,e.jsxs(r.li,{children:["Preference order: built-in function → ",e.jsx(r.code,{children:"when()"}),"/",e.jsx(r.code,{children:"expr"})," → Pandas UDF → regular UDF."]}),`
`,e.jsxs(r.li,{children:[e.jsx(r.code,{children:"returnType"})," is mandatory and unchecked — declare ",e.jsx(r.code,{children:"StringType()"})," and return a float and you get silent nulls."]}),`
`]})}),`
`,e.jsx(o,{children:e.jsxs(r.p,{children:["In Module 5, we queried DataFrames using SQL syntax — SELECT, JOIN, GROUP BY, CTEs. These built-in operations handle most transformations. But when you need custom logic, you write a ",e.jsx(r.strong,{children:"UDF"})," (User-Defined Function)."]})}),`
`,e.jsx(r.h2,{children:"What are UDFs?"}),`
`,e.jsx(r.p,{children:"User-Defined Functions let you apply custom Python logic to DataFrame columns. Spark ships with a rich library of built-in functions — arithmetic, string manipulation, date handling, aggregations — but sometimes your business rules don't fit neatly into what's already available."}),`
`,e.jsxs(r.p,{children:["Common use cases include: converting numeric grades to letter grades, applying domain-specific categorizations (risk tiers, customer segments), computing custom metrics that combine multiple columns, or encoding business rules that would be awkward to express with nested ",e.jsx(r.code,{children:"when()"})," chains."]}),`
`,e.jsx(r.h2,{children:"Creating UDFs — Two Approaches"}),`
`,e.jsx(r.h3,{children:"Approach 1: @udf decorator"}),`
`,e.jsx(n,{language:"python",children:`from pyspark.sql.functions import udf
from pyspark.sql.types import StringType

@udf(returnType=StringType())
def grade_letter(numeric_grade):
  if numeric_grade >= 90: return 'A'
  elif numeric_grade >= 80: return 'B'
  elif numeric_grade >= 70: return 'C'
  elif numeric_grade >= 60: return 'D'
  else: return 'F'

result = enrollments_df.withColumn("letter_grade", grade_letter("grade"))
result.show(5)
# +-------------+-----------+-----+------------+
# |enrollment_id|course_name|grade|letter_grade|
# +-------------+-----------+-----+------------+
# |        1    |   Python  |   92|           A|
# |        2    |  Calculus |   88|           B|
# +-------------+-----------+-----+------------+`}),`
`,e.jsx(r.h3,{children:"Approach 2: Register for SQL use"}),`
`,e.jsx(n,{language:"python",children:`spark.udf.register("grade_letter", grade_letter, StringType())
spark.sql("""
  SELECT enrollment_id, course_name, grade, grade_letter(grade) as letter
  FROM enrollments
""").show(5)`}),`
`,e.jsx(r.h2,{children:"Return Types Matter"}),`
`,e.jsx(r.p,{children:"Every UDF must declare its return type explicitly. Spark uses this to build the schema of the resulting DataFrame. If your function returns a value that doesn't match the declared type, you'll get a runtime error — often a cryptic serialization failure."}),`
`,e.jsxs(r.p,{children:["For complex return values, use ",e.jsx(r.code,{children:"StructType"})," to define a multi-field schema:"]}),`
`,e.jsx(n,{language:"python",children:`from pyspark.sql.types import StructType, StructField, StringType

grade_schema = StructType([
  StructField("letter", StringType(), False),
  StructField("standing", StringType(), False)
])

@udf(returnType=grade_schema)
def grade_info(numeric_grade):
  if numeric_grade >= 90: return ('A', "Dean's List")
  elif numeric_grade >= 80: return ('B', 'Honor Roll')
  elif numeric_grade >= 70: return ('C', 'Good Standing')
  elif numeric_grade >= 60: return ('D', 'Probation')
  else: return ('F', 'Academic Hold')

result = enrollments_df.withColumn("grade_info", grade_info("grade"))
result.select("enrollment_id", "grade", "grade_info").show(5)
# +-------------+-----+-------------------+
# |enrollment_id|grade|       grade_info  |
# +-------------+-----+-------------------+
# |        1    |   92|{A, Dean's List}   |`}),`
`,e.jsx(r.h2,{children:"Performance Implications"}),`
`,e.jsxs(s,{title:"The Row-at-a-Time Penalty",children:[e.jsx(r.p,{children:"Regular UDFs come with a significant performance cost. For every row, Spark must:"}),e.jsxs(r.ol,{children:[`
`,e.jsx(r.li,{children:"Serialize the data from the JVM"}),`
`,e.jsx(r.li,{children:"Send it to a Python process"}),`
`,e.jsx(r.li,{children:"Execute your function"}),`
`,e.jsx(r.li,{children:"Serialize the result back to the JVM"}),`
`]}),e.jsx(r.p,{children:"This round-trip is orders of magnitude slower than Spark's built-in functions, which execute entirely within the JVM using optimized code generation."}),e.jsxs(r.p,{children:["Beyond serialization overhead, the ",e.jsx(r.strong,{children:'Catalyst optimizer cannot "see inside" a UDF'}),". When you use built-in functions, Spark can reorder operations, push filters down, and combine steps. With a UDF, the optimizer treats it as an opaque black box."]}),e.jsxs(r.p,{children:[e.jsx(r.strong,{children:"Rule of thumb:"})," Prefer built-in functions whenever possible, and reserve UDFs for logic that truly cannot be expressed any other way."]})]}),`
`,e.jsx(r.h2,{children:"Pandas UDFs (Vectorized)"}),`
`,e.jsxs(r.p,{children:["Pandas UDFs (also called vectorized UDFs) address the performance problem by processing data in ",e.jsx(r.strong,{children:"batches"})," rather than one row at a time. Under the hood, Spark uses Apache Arrow to transfer entire columns of data between the JVM and Python as zero-copy arrays. Your function receives a ",e.jsx(r.code,{children:"pd.Series"})," and returns a ",e.jsx(r.code,{children:"pd.Series"}),"."]}),`
`,e.jsxs(r.p,{children:["Depending on the workload, Pandas UDFs can be ",e.jsx(r.strong,{children:"3x to 100x faster"})," than regular row-at-a-time UDFs."]}),`
`,e.jsx(n,{language:"python",children:`from pyspark.sql.functions import pandas_udf
import pandas as pd

@pandas_udf(StringType())
def grade_letter_vec(grades: pd.Series) -> pd.Series:
  return grades.map(
      lambda g: 'A' if g >= 90 else 'B' if g >= 80
                else 'C' if g >= 70 else 'D' if g >= 60 else 'F'
  )

result = enrollments_df.withColumn("letter_grade", grade_letter_vec("grade"))
result.show(5)`}),`
`,e.jsx(s,{title:"When to Use Each Approach",children:e.jsxs(r.table,{children:[e.jsx(r.thead,{children:e.jsxs(r.tr,{children:[e.jsx(r.th,{children:"Approach"}),e.jsx(r.th,{children:"Speed"}),e.jsx(r.th,{children:"Optimizer-visible?"}),e.jsx(r.th,{children:"When to use"})]})}),e.jsxs(r.tbody,{children:[e.jsxs(r.tr,{children:[e.jsx(r.td,{children:"Built-in functions"}),e.jsx(r.td,{children:"Fastest"}),e.jsx(r.td,{children:"Yes"}),e.jsx(r.td,{children:"Always prefer this"})]}),e.jsxs(r.tr,{children:[e.jsx(r.td,{children:"Pandas UDF"}),e.jsx(r.td,{children:"Fast"}),e.jsx(r.td,{children:"No"}),e.jsx(r.td,{children:"Batch-friendly custom logic"})]}),e.jsxs(r.tr,{children:[e.jsx(r.td,{children:"Regular UDF"}),e.jsx(r.td,{children:"Slow"}),e.jsx(r.td,{children:"No"}),e.jsx(r.td,{children:"Last resort for complex logic"})]})]})]})}),`
`,e.jsx(l,{items:[{q:"Give the two separate reasons a regular UDF is slow.",a:"Transport: every row is serialised from the JVM to a Python process and the result serialised back, so you pay per-row overhead on the whole dataset. Opacity: Catalyst cannot see inside arbitrary Python, so it cannot push a filter through the UDF or reorder around it — the step becomes an optimisation barrier."},{q:"Which of those two problems does a Pandas UDF solve, and which remains?",a:"It solves transport, by shipping columnar batches over Apache Arrow instead of one row at a time — usually an order of magnitude faster. Opacity remains: Catalyst still cannot reason about the function's semantics, so the plan around it is still constrained."},{q:"State the preference order and the reason for it.",a:"Built-in function first, since Catalyst understands it fully and it runs in the JVM. Then when/otherwise or expr for conditional logic, which are still native expressions. Then a Pandas UDF when you need real Python but want batched transport. A regular row-at-a-time UDF last, when nothing else expresses the logic."},{q:"You declare returnType=StringType() and your function returns 3.7. What happens?",a:"You get null, silently. Spark trusts the declared return type and does not verify it — a mismatch produces nulls rather than an exception, so a whole column can quietly become empty. Declared return types are a contract you must honour yourself."}]}),`
`,e.jsx(d,{question:"Why are Pandas UDFs faster than regular row-at-a-time UDFs?",options:["They use less memory because they skip type checking","They process data in batches using Apache Arrow serialization, avoiding per-row JVM-Python round-trips","They run on the driver node only, bypassing network overhead","They skip Catalyst optimization entirely"],correct:1})]})}function h(t={}){const{wrapper:r}={...i(),...t.components};return r?e.jsx(r,{...t,children:e.jsx(a,{...t})}):a(t)}export{h as default};
