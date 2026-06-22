import{u as o,j as e,B as l,C as s,b as a,D as d,a as t,Q as c}from"./index-VIW80S6x.js";function i(r){const n={code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...o(),...r.components};return e.jsxs(e.Fragment,{children:[e.jsx(l,{children:e.jsx(n.p,{children:"In Module 9, we built complex transformations — joins, aggregations, pivots, and window functions. These pipelines can be expensive. This final module covers how to make them fast using caching and broadcast variables."})}),`
`,e.jsx(n.h2,{children:"When to Cache"}),`
`,e.jsx(n.p,{children:"Spark's lazy evaluation means every time you call an action on a DataFrame, Spark re-executes the entire lineage of transformations from the source data. This is fine for one-off computations, but wasteful when the same DataFrame feeds multiple downstream operations."}),`
`,e.jsxs(s,{title:"The Three Caching Candidates",children:[e.jsx(n.p,{children:"Cache a DataFrame when:"}),e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Reused DataFrames"})," — same DataFrame feeds multiple downstream operations"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Iterative algorithms"})," — ML training loops that read the same training data on each iteration"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Expensive intermediates"})," — result of a heavy join, complex aggregation, or multi-step cleaning pipeline"]}),`
`]}),e.jsx(n.p,{children:"If a DataFrame is used exactly once, caching wastes memory without benefit."})]}),`
`,e.jsx(n.h2,{children:"cache() vs persist()"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"cache()"})," is shorthand for ",e.jsx(n.code,{children:"persist(StorageLevel.MEMORY_ONLY)"}),". ",e.jsx(n.code,{children:"persist()"})," gives you control over the storage level:"]}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Storage level"}),e.jsx(n.th,{children:"Memory use"}),e.jsx(n.th,{children:"Disk use"}),e.jsx(n.th,{children:"Behavior"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"MEMORY_ONLY"})}),e.jsx(n.td,{children:"High"}),e.jsx(n.td,{children:"None"}),e.jsx(n.td,{children:"Fastest; partitions that don't fit are recomputed"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"MEMORY_AND_DISK"})}),e.jsx(n.td,{children:"Medium"}),e.jsx(n.td,{children:"Spill"}),e.jsx(n.td,{children:"Safe default; partitions spill to disk instead of recomputing"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"DISK_ONLY"})}),e.jsx(n.td,{children:"None"}),e.jsx(n.td,{children:"High"}),e.jsx(n.td,{children:"Slowest; all data on disk, useful to preserve memory"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"MEMORY_ONLY_SER"})}),e.jsx(n.td,{children:"Low"}),e.jsx(n.td,{children:"None"}),e.jsx(n.td,{children:"Stores serialized bytes; less memory, CPU overhead to deserialize"})]})]})]}),`
`,e.jsx(a,{language:"python",children:`from pyspark import StorageLevel

# Cache after expensive join
joined_df = students_df.join(enrollments_df, "student_id")
joined_df.cache()  # shorthand for MEMORY_ONLY

# or explicitly choose storage level:
joined_df.persist(StorageLevel.MEMORY_AND_DISK)

# First action materializes the cache (slow)
joined_df.count()

# Subsequent actions read from cache (fast)
joined_df.filter(col("grade") > 85).show(5)
joined_df.groupBy("major").avg("grade").show()`}),`
`,e.jsx(n.h2,{children:"Unpersisting"}),`
`,e.jsxs(n.p,{children:["When done with a cached DataFrame, call ",e.jsx(n.code,{children:"unpersist()"})," to free memory. Important for long-running jobs and notebook sessions where cached data can accumulate:"]}),`
`,e.jsx(a,{language:"python",children:`joined_df.unpersist()
# DataFrame still exists — subsequent actions recompute from lineage`}),`
`,e.jsx(n.h2,{children:"Broadcast Variables"}),`
`,e.jsx(n.p,{children:"When joining a large DataFrame with a small one, Spark's default strategy shuffles data across the network. Broadcast joins solve this: the small table is sent to every worker node, so each partition of the large table does a local lookup without any shuffle."}),`
`,e.jsxs(s,{title:"When to Broadcast",children:[e.jsx(n.p,{children:"Good candidates for broadcast:"}),e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Lookup tables and dimension tables"}),`
`,e.jsx(n.li,{children:"Configuration mappings"}),`
`,e.jsx(n.li,{children:"Any DataFrame under approximately 100 MB"}),`
`]}),e.jsx(n.p,{children:"Never broadcast a large table — it creates memory pressure on every executor and can cause OOM errors."})]}),`
`,e.jsx(a,{language:"python",children:`from pyspark.sql.functions import broadcast

# Small lookup table (course metadata)
courses = spark.createDataFrame([
  ("CS101", "Computer Science", 3),
  ("DS101", "Data Science", 3),
  ("MA101", "Mathematics", 4),
  ("ST101", "Statistics", 3)
], ["course_id", "department", "credits"])

# Broadcast hint: small table sent to all workers
# No shuffle of the large enrollments_df
enriched = enrollments_df.join(broadcast(courses), "course_id")
enriched.show(5)
# +----------+---------+----------+----------------+-------+
# |student_id|course_id|  semester|      department|credits|
# +----------+---------+----------+----------------+-------+
# |      1001|    CS101|   Fall 24|Computer Science|      3|`}),`
`,e.jsx(n.h2,{children:"Accumulator Variables"}),`
`,e.jsx(n.p,{children:"Accumulators let you aggregate values across worker nodes — counting events, summing metrics, or tracking errors during distributed processing."}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Rules:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Workers can only ",e.jsx(n.code,{children:"add()"})," to an accumulator (cannot read it)"]}),`
`,e.jsx(n.li,{children:"Only the driver can read the final value"}),`
`,e.jsx(n.li,{children:"May update more than once if tasks are retried — use for monitoring, not critical logic"}),`
`]}),`
`,e.jsx(a,{language:"python",children:`# Create accumulators on the driver
invalid_count = sc.accumulator(0)
total_count = sc.accumulator(0)

def process_record(row):
  total_count.add(1)
  if row["grade"] is None or row["grade"] < 0:
      invalid_count.add(1)
  return row

enrollments_df.foreach(process_record)

# Driver reads final values after action completes
print(f"Total records: {total_count.value}")
print(f"Invalid records: {invalid_count.value}")
print(f"Invalid rate: {invalid_count.value / total_count.value * 100:.1f}%")`}),`
`,e.jsx(n.h2,{children:"Putting It Together — Full ETL Pipeline"}),`
`,e.jsxs(d,{children:[e.jsx(t,{number:1,title:"Read raw data and infer schema.",children:e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`raw_df = spark.read.csv("grades_messy.csv", header=True, inferSchema=True)
`})})}),e.jsx(t,{number:2,title:"Clean: deduplicate, null-filter, range-filter, normalize text.",children:e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`cleaned_df = (
    raw_df
    .dropDuplicates(["enrollment_id"])
    .filter(col("student_id").isNotNull())
    .filter((col("grade") >= 0) & (col("grade") <= 100))
    .withColumn("course_name", trim(initcap(col("course_name"))))
)
`})})}),e.jsx(t,{number:3,title:"Cache the cleaned result — it feeds multiple aggregations.",children:e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`cleaned_df.cache()
cleaned_df.count()  # materialize
`})})}),e.jsx(t,{number:4,title:"Broadcast-join with small lookup table.",children:e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`enriched_df = cleaned_df.join(broadcast(course_lookup), "course_id")
`})})}),e.jsx(t,{number:5,title:"Run aggregations on cached data, then unpersist.",children:e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`enriched_df.groupBy("major").avg("grade").show()
enriched_df.groupBy("semester").count().show()
cleaned_df.unpersist()
`})})})]}),`
`,e.jsx(c,{question:"A DataFrame is the result of an expensive 5-table join. You need to run 4 different aggregations on it. What should you do?",options:["Run the 4 aggregations one by one — Spark will optimize each query independently","Cache the DataFrame after the join, run all 4 aggregations, then unpersist — the join executes once, all aggregations read from cache","Use broadcast() on the largest table to speed up the join","Use DISK_ONLY storage level so the result persists across Spark sessions"],correct:1})]})}function u(r={}){const{wrapper:n}={...o(),...r.components};return n?e.jsx(n,{...r,children:e.jsx(i,{...r})}):i(r)}export{u as default};
