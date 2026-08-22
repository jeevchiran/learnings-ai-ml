import{r as x,j as e,u as y,C as h,B as w,b as n,D as _,a,R as S,Q as k}from"./index-Ba5-wm3B.js";const r="#f59e0b",j="#16a34a";function D(){const[s,t]=x.useState(3),[C,M]=x.useState(!1),i=10,v=2,o=s*i,l=i+v+(s-1)*1,c=o-l,u=(d,p,g,b)=>e.jsxs("div",{style:{margin:"0.35rem 0"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"0.8rem",marginBottom:2},children:[e.jsx("span",{style:{color:"var(--text-muted)"},children:d}),e.jsxs("strong",{style:{color:g,fontVariantNumeric:"tabular-nums"},children:[p," units"]})]}),e.jsx("div",{style:{height:18,background:"var(--bg-hover)",borderRadius:3},children:e.jsx("div",{style:{height:"100%",width:`${p/b*100}%`,background:g,borderRadius:3,transition:"width 0.25s"}})})]}),m=Math.max(o,l);return e.jsxs("div",{children:[e.jsxs("label",{style:{display:"flex",alignItems:"center",gap:"0.6rem",fontSize:"0.82rem",marginBottom:"0.7rem"},children:[e.jsx("span",{style:{color:"var(--text-muted)"},children:"Actions reusing the DataFrame"}),e.jsx("input",{type:"range",min:1,max:8,value:s,onChange:d=>t(+d.target.value),style:{flex:1,accentColor:r}}),e.jsx("strong",{style:{color:r,width:20,textAlign:"right"},children:s})]}),u("Without cache — recompute every action",o,"#dc2626",m),u("With .cache() — compute once, reuse",l,r,m),e.jsx("div",{style:{marginTop:"0.7rem",background:"var(--bg-hover)",borderLeft:`3px solid ${c>0?j:r}`,padding:"0.5rem 0.8rem",borderRadius:"0 4px 4px 0",fontSize:"0.82rem"},children:c>0?e.jsxs(e.Fragment,{children:["Caching saves ",e.jsxs("strong",{style:{color:j},children:[c," units"]})," across ",s," actions — each extra action re-reads memory (cost ~1) instead of replaying the whole lineage (cost ",i,")."]}):e.jsxs(e.Fragment,{children:["With a single action, ",e.jsx("code",{children:".cache()"})," doesn't pay off — you add the cache-write cost but never reuse it. Cache only when a DataFrame is reused."]})}),e.jsxs("p",{style:{fontSize:"0.78rem",color:"var(--text-muted)",marginTop:"0.4rem"},children:["Spark recomputes a DataFrame's whole lineage on every action by default. ",e.jsx("code",{children:".cache()"}),"/",e.jsx("code",{children:".persist()"})," pays off exactly when the same result feeds two or more actions."]})]})}function f(s){const t={code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...y(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(h,{title:"TL;DR",children:e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["Lazy evaluation means ",e.jsx(t.strong,{children:"every action replays the whole lineage from source"}),". Cache exists to stop that repetition."]}),`
`,e.jsxs(t.li,{children:["Cache when a DataFrame is ",e.jsx(t.strong,{children:"reused"})," — multiple downstream actions, an iterative loop, or an expensive intermediate. Used once? Caching is pure waste."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"cache()"})," is exactly ",e.jsx(t.code,{children:"persist(MEMORY_ONLY)"}),"; ",e.jsx(t.code,{children:"persist()"})," lets you pick a level that spills to disk instead of silently recomputing."]}),`
`,e.jsxs(t.li,{children:[e.jsxs(t.strong,{children:[e.jsx(t.code,{children:"unpersist()"})," when done"]})," — cached data holds executor memory that everything else has to compete for."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"broadcast()"})," is the other lever: ship a small table to every executor and the join needs ",e.jsx(t.strong,{children:"no shuffle at all"}),"."]}),`
`]})}),`
`,e.jsx(w,{children:e.jsx(t.p,{children:"In Module 9, we built complex transformations — joins, aggregations, pivots, and window functions. These pipelines can be expensive. This final module covers how to make them fast using caching and broadcast variables."})}),`
`,e.jsx(t.h2,{children:"When to Cache"}),`
`,e.jsx(t.p,{children:"Spark's lazy evaluation means every time you call an action on a DataFrame, Spark re-executes the entire lineage of transformations from the source data. This is fine for one-off computations, but wasteful when the same DataFrame feeds multiple downstream operations."}),`
`,e.jsxs(h,{title:"The Three Caching Candidates",children:[e.jsx(t.p,{children:"Cache a DataFrame when:"}),e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Reused DataFrames"})," — same DataFrame feeds multiple downstream operations"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Iterative algorithms"})," — ML training loops that read the same training data on each iteration"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Expensive intermediates"})," — result of a heavy join, complex aggregation, or multi-step cleaning pipeline"]}),`
`]}),e.jsx(t.p,{children:"If a DataFrame is used exactly once, caching wastes memory without benefit."})]}),`
`,e.jsx(t.h2,{children:"cache() vs persist()"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"cache()"})," is shorthand for ",e.jsx(t.code,{children:"persist(StorageLevel.MEMORY_ONLY)"}),". ",e.jsx(t.code,{children:"persist()"})," gives you control over the storage level:"]}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Storage level"}),e.jsx(t.th,{children:"Memory use"}),e.jsx(t.th,{children:"Disk use"}),e.jsx(t.th,{children:"Behavior"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"MEMORY_ONLY"})}),e.jsx(t.td,{children:"High"}),e.jsx(t.td,{children:"None"}),e.jsx(t.td,{children:"Fastest; partitions that don't fit are recomputed"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"MEMORY_AND_DISK"})}),e.jsx(t.td,{children:"Medium"}),e.jsx(t.td,{children:"Spill"}),e.jsx(t.td,{children:"Safe default; partitions spill to disk instead of recomputing"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"DISK_ONLY"})}),e.jsx(t.td,{children:"None"}),e.jsx(t.td,{children:"High"}),e.jsx(t.td,{children:"Slowest; all data on disk, useful to preserve memory"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"MEMORY_ONLY_SER"})}),e.jsx(t.td,{children:"Low"}),e.jsx(t.td,{children:"None"}),e.jsx(t.td,{children:"Stores serialized bytes; less memory, CPU overhead to deserialize"})]})]})]}),`
`,e.jsx(n,{language:"python",children:`from pyspark import StorageLevel

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
`,e.jsx(t.h2,{children:"Unpersisting"}),`
`,e.jsxs(t.p,{children:["When done with a cached DataFrame, call ",e.jsx(t.code,{children:"unpersist()"})," to free memory. Important for long-running jobs and notebook sessions where cached data can accumulate:"]}),`
`,e.jsx(n,{language:"python",children:`joined_df.unpersist()
# DataFrame still exists — subsequent actions recompute from lineage`}),`
`,e.jsx(D,{}),`
`,e.jsx(t.h2,{children:"Broadcast Variables"}),`
`,e.jsx(t.p,{children:"When joining a large DataFrame with a small one, Spark's default strategy shuffles data across the network. Broadcast joins solve this: the small table is sent to every worker node, so each partition of the large table does a local lookup without any shuffle."}),`
`,e.jsxs(h,{title:"When to Broadcast",children:[e.jsx(t.p,{children:"Good candidates for broadcast:"}),e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Lookup tables and dimension tables"}),`
`,e.jsx(t.li,{children:"Configuration mappings"}),`
`,e.jsx(t.li,{children:"Any DataFrame under approximately 100 MB"}),`
`]}),e.jsx(t.p,{children:"Never broadcast a large table — it creates memory pressure on every executor and can cause OOM errors."})]}),`
`,e.jsx(n,{language:"python",children:`from pyspark.sql.functions import broadcast

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
`,e.jsx(t.h2,{children:"Accumulator Variables"}),`
`,e.jsx(t.p,{children:"Accumulators let you aggregate values across worker nodes — counting events, summing metrics, or tracking errors during distributed processing."}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Rules:"})}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["Workers can only ",e.jsx(t.code,{children:"add()"})," to an accumulator (cannot read it)"]}),`
`,e.jsx(t.li,{children:"Only the driver can read the final value"}),`
`,e.jsx(t.li,{children:"May update more than once if tasks are retried — use for monitoring, not critical logic"}),`
`]}),`
`,e.jsx(n,{language:"python",children:`# Create accumulators on the driver
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
`,e.jsx(t.h2,{children:"Putting It Together — Full ETL Pipeline"}),`
`,e.jsxs(_,{children:[e.jsx(a,{number:1,title:"Read raw data and infer schema.",children:e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`raw_df = spark.read.csv("grades_messy.csv", header=True, inferSchema=True)
`})})}),e.jsx(a,{number:2,title:"Clean: deduplicate, null-filter, range-filter, normalize text.",children:e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`cleaned_df = (
    raw_df
    .dropDuplicates(["enrollment_id"])
    .filter(col("student_id").isNotNull())
    .filter((col("grade") >= 0) & (col("grade") <= 100))
    .withColumn("course_name", trim(initcap(col("course_name"))))
)
`})})}),e.jsx(a,{number:3,title:"Cache the cleaned result — it feeds multiple aggregations.",children:e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`cleaned_df.cache()
cleaned_df.count()  # materialize
`})})}),e.jsx(a,{number:4,title:"Broadcast-join with small lookup table.",children:e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`enriched_df = cleaned_df.join(broadcast(course_lookup), "course_id")
`})})}),e.jsx(a,{number:5,title:"Run aggregations on cached data, then unpersist.",children:e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`enriched_df.groupBy("major").avg("grade").show()
enriched_df.groupBy("semester").count().show()
cleaned_df.unpersist()
`})})})]}),`
`,e.jsx(S,{items:[{q:"Why does an expensive join feeding four aggregations run the join four times?",a:"Because transformations are lazy and hold no results — each aggregation is an action that replays the entire lineage from the source files, join included. Spark does not automatically remember intermediate results between separate actions. Caching after the join makes it execute once and the four aggregations read from memory."},{q:"When is caching actively harmful?",a:"When the DataFrame is used exactly once — you pay the memory and the storage overhead for no reuse. It is also harmful when the cached data is large enough to evict other data or push executors toward spilling, in which case caching one thing slows everything else."},{q:"cache() versus persist() — what is the actual difference?",a:"cache() is shorthand for persist(MEMORY_ONLY). With MEMORY_ONLY, partitions that do not fit are simply not cached and get recomputed on demand. persist lets you choose MEMORY_AND_DISK, which spills the overflow to local disk instead — usually cheaper than recomputing a heavy join, and the right choice for large intermediates."},{q:"How does broadcast turn a shuffle join into no shuffle?",a:"A normal join repartitions BOTH sides by the join key so matching rows meet — that is the shuffle. If one side is small enough, Spark instead sends a full copy to every executor, so each executor joins its existing partition of the large table locally. No data from the large table moves at all."},{q:"Why call unpersist(), given Spark evicts cached blocks anyway?",a:"Because eviction is reactive and uses LRU, so a stale cached DataFrame can push out something that is actually in use before it is dropped. Explicit unpersist returns the memory at the point you know it is dead, which keeps executor memory available for shuffles and joins rather than for results nobody will read again."}]}),`
`,e.jsx(k,{question:"A DataFrame is the result of an expensive 5-table join. You need to run 4 different aggregations on it. What should you do?",options:["Run the 4 aggregations one by one — Spark will optimize each query independently","Cache the DataFrame after the join, run all 4 aggregations, then unpersist — the join executes once, all aggregations read from cache","Use broadcast() on the largest table to speed up the join","Use DISK_ONLY storage level so the result persists across Spark sessions"],correct:1})]})}function F(s={}){const{wrapper:t}={...y(),...s.components};return t?e.jsx(t,{...s,children:e.jsx(f,{...s})}):f(s)}export{F as default};
