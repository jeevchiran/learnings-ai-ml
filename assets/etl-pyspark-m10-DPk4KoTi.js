import{r as j,j as e,u as b,B as D,C as h,R as u,b as n,D as k,a as s,Q as S}from"./index-WYRBR6CI.js";import{P as f}from"./PredictReveal-DnF7AdIF.js";const r="#f59e0b",y="#16a34a";function C(){const[t,a]=j.useState(3),[F,M]=j.useState(!1),i=10,w=2,o=t*i,l=i+w+(t-1)*1,c=o-l,m=(d,g,x,_)=>e.jsxs("div",{style:{margin:"0.35rem 0"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"0.8rem",marginBottom:2},children:[e.jsx("span",{style:{color:"var(--text-muted)"},children:d}),e.jsxs("strong",{style:{color:x,fontVariantNumeric:"tabular-nums"},children:[g," units"]})]}),e.jsx("div",{style:{height:18,background:"var(--bg-hover)",borderRadius:3},children:e.jsx("div",{style:{height:"100%",width:`${g/_*100}%`,background:x,borderRadius:3,transition:"width 0.25s"}})})]}),p=Math.max(o,l);return e.jsxs("div",{children:[e.jsxs("label",{style:{display:"flex",alignItems:"center",gap:"0.6rem",fontSize:"0.82rem",marginBottom:"0.7rem"},children:[e.jsx("span",{style:{color:"var(--text-muted)"},children:"Actions reusing the DataFrame"}),e.jsx("input",{type:"range",min:1,max:8,value:t,onChange:d=>a(+d.target.value),style:{flex:1,accentColor:r}}),e.jsx("strong",{style:{color:r,width:20,textAlign:"right"},children:t})]}),m("Without cache — recompute every action",o,"#dc2626",p),m("With .cache() — compute once, reuse",l,r,p),e.jsx("div",{style:{marginTop:"0.7rem",background:"var(--bg-hover)",borderLeft:`3px solid ${c>0?y:r}`,padding:"0.5rem 0.8rem",borderRadius:"0 4px 4px 0",fontSize:"0.82rem"},children:c>0?e.jsxs(e.Fragment,{children:["Caching saves ",e.jsxs("strong",{style:{color:y},children:[c," units"]})," across ",t," actions — each extra action re-reads memory (cost ~1) instead of replaying the whole lineage (cost ",i,")."]}):e.jsxs(e.Fragment,{children:["With a single action, ",e.jsx("code",{children:".cache()"})," doesn't pay off — you add the cache-write cost but never reuse it. Cache only when a DataFrame is reused."]})}),e.jsxs("p",{style:{fontSize:"0.78rem",color:"var(--text-muted)",marginTop:"0.4rem"},children:["Spark recomputes a DataFrame's whole lineage on every action by default. ",e.jsx("code",{children:".cache()"}),"/",e.jsx("code",{children:".persist()"})," pays off exactly when the same result feeds two or more actions."]})]})}function v(t){const a={a:"a",code:"code",div:"div",h1:"h1",h2:"h2",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...b(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(a.h1,{children:"Caching and Broadcast Variables"}),`
`,e.jsx(D,{children:e.jsx(a.p,{children:"In Module 9, we built complex transformations — joins, aggregations, pivots, and window functions. These pipelines can be expensive. This final module covers how to make them fast using caching and broadcast variables."})}),`
`,e.jsx(a.h2,{children:"When to Cache"}),`
`,e.jsxs(f,{prompt:"You cache every intermediate DataFrame in your pipeline, just to be safe. What goes wrong?",options:["Nothing, caching is always an improvement","Memory fills with results used once, which evicts the ones that are genuinely reused and can push work to disk"],correct:1,children:[e.jsx(a.p,{children:"Spark's lazy evaluation means every time you call an action on a DataFrame, Spark re-executes the entire lineage of transformations from the source data. This is fine for one-off computations, but wasteful when the same DataFrame feeds multiple downstream operations."}),e.jsxs(h,{title:"The Three Caching Candidates",children:[e.jsx(a.p,{children:"Cache a DataFrame when:"}),e.jsxs(a.ol,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Reused DataFrames"})," — same DataFrame feeds multiple downstream operations"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Iterative algorithms"})," — ML training loops that read the same training data on each iteration"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Expensive intermediates"})," — result of a heavy join, complex aggregation, or multi-step cleaning pipeline"]}),`
`]}),e.jsx(a.p,{children:"If a DataFrame is used exactly once, caching wastes memory without benefit."})]})]}),`
`,e.jsx(u,{items:[{q:"When is caching worth it, and when does it hurt?",a:"It pays when a DataFrame is used by more than one action, since the plan would otherwise be recomputed each time. It hurts when applied indiscriminately, because cached results occupy memory that the executors need for computation, and evicting a genuinely reused result to hold a single-use one makes the job slower."}]}),`
`,e.jsx(a.h2,{children:"cache() vs persist()"}),`
`,e.jsxs(a.p,{children:["For ",e.jsx(a.strong,{children:"DataFrames in Spark 3.0 and later"}),", ",e.jsx(a.code,{children:"cache()"})," uses ",e.jsx(a.code,{children:"MEMORY_AND_DISK_DESER"}),": keep cached partitions in memory and use disk when needed. The RDD API has a different default (",e.jsx(a.code,{children:"MEMORY_ONLY"}),"), so name the API when discussing caching. ",e.jsx(a.code,{children:"persist()"})," lets you choose a storage level. See the ",e.jsx(a.a,{href:"https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.cache.html",children:"Spark DataFrame cache documentation"}),"."]}),`
`,e.jsxs(a.table,{children:[e.jsx(a.thead,{children:e.jsxs(a.tr,{children:[e.jsx(a.th,{children:"Storage level"}),e.jsx(a.th,{children:"Memory use"}),e.jsx(a.th,{children:"Disk use"}),e.jsx(a.th,{children:"Behavior"})]})}),e.jsxs(a.tbody,{children:[e.jsxs(a.tr,{children:[e.jsx(a.td,{children:e.jsx(a.code,{children:"MEMORY_ONLY"})}),e.jsx(a.td,{children:"High"}),e.jsx(a.td,{children:"None"}),e.jsx(a.td,{children:"Fastest; partitions that don't fit are recomputed"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{children:e.jsx(a.code,{children:"MEMORY_AND_DISK"})}),e.jsx(a.td,{children:"Medium"}),e.jsx(a.td,{children:"Spill"}),e.jsx(a.td,{children:"Safe default; partitions spill to disk instead of recomputing"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{children:e.jsx(a.code,{children:"DISK_ONLY"})}),e.jsx(a.td,{children:"None"}),e.jsx(a.td,{children:"High"}),e.jsx(a.td,{children:"Slowest; all data on disk, useful to preserve memory"})]}),e.jsxs(a.tr,{children:[e.jsx(a.td,{children:e.jsx(a.code,{children:"MEMORY_AND_DISK_DESER"})}),e.jsx(a.td,{children:"High"}),e.jsx(a.td,{children:"Overflow"}),e.jsx(a.td,{children:"DataFrame default; keeps deserialized cached data in memory and uses disk when needed"})]})]})]}),`
`,e.jsx(n,{language:"python",children:`from pyspark import StorageLevel

# Cache after expensive join
joined_df = students_df.join(enrollments_df, "student_id")
joined_df.cache()  # DataFrame default: MEMORY_AND_DISK_DESER

# or explicitly choose storage level:
joined_df.persist(StorageLevel.MEMORY_AND_DISK)

# First action materializes the cache (slow)
joined_df.count()

# Subsequent actions read from cache (fast)
joined_df.filter(col("grade") > 85).show(5)
joined_df.groupBy("major").avg("grade").show()`}),`
`,e.jsx(a.h2,{children:"Unpersisting"}),`
`,e.jsxs(a.p,{children:["When done with a cached DataFrame, call ",e.jsx(a.code,{children:"unpersist()"})," to free memory. Important for long-running jobs and notebook sessions where cached data can accumulate:"]}),`
`,e.jsx(n,{language:"python",children:`joined_df.unpersist()
# DataFrame still exists — subsequent actions recompute from lineage`}),`
`,e.jsx(a.div,{className:"lesson-visual",role:"region","aria-label":"Caching interactive example; scroll horizontally if needed",tabIndex:"0",children:e.jsx(C,{})}),`
`,e.jsx(a.h2,{children:"Broadcast Variables"}),`
`,e.jsxs(f,{prompt:"You join a billion-row table against a two-hundred-row lookup table. Does that need a full shuffle?",options:["Yes, every join shuffles","No — the small table can be broadcast to every machine, so the large one never moves"],correct:1,children:[e.jsx(a.p,{children:"When joining a large DataFrame with a small one, Spark's default strategy shuffles data across the network. Broadcast joins solve this: the small table is sent to every worker node, so each partition of the large table does a local lookup without any shuffle."}),e.jsxs(h,{title:"When to Broadcast",children:[e.jsx(a.p,{children:"Good candidates for broadcast:"}),e.jsxs(a.ul,{children:[`
`,e.jsx(a.li,{children:"Lookup tables and dimension tables"}),`
`,e.jsx(a.li,{children:"Configuration mappings"}),`
`,e.jsx(a.li,{children:"Any DataFrame under approximately 100 MB"}),`
`]}),e.jsx(a.p,{children:"Never broadcast a large table — it creates memory pressure on every executor and can cause OOM errors."})]}),e.jsx(n,{language:"python",children:`from pyspark.sql.functions import broadcast

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
# |      1001|    CS101|   Fall 24|Computer Science|      3|`})]}),`
`,e.jsx(u,{items:[{q:"What does broadcasting a small table achieve in a join?",a:"It sends a complete copy of the small side to every executor, so each partition of the large table can be joined locally. No redistribution of the large table is needed, which removes the shuffle that would otherwise dominate the cost."}]}),`
`,e.jsx(a.h2,{children:"Accumulator Variables"}),`
`,e.jsx(a.p,{children:"Accumulators let you aggregate values across worker nodes — counting events, summing metrics, or tracking errors during distributed processing."}),`
`,e.jsx(a.p,{children:e.jsx(a.strong,{children:"Rules:"})}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:["Workers can only ",e.jsx(a.code,{children:"add()"})," to an accumulator (cannot read it)"]}),`
`,e.jsx(a.li,{children:"Only the driver can read the final value"}),`
`,e.jsx(a.li,{children:"May update more than once if tasks are retried — use for monitoring, not critical logic"}),`
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
`,e.jsx(a.h2,{children:"Putting It Together — Full ETL Pipeline"}),`
`,e.jsxs(k,{children:[e.jsx(s,{number:1,title:"Read raw data and infer schema.",children:e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-python",children:`raw_df = spark.read.csv("grades_messy.csv", header=True, inferSchema=True)
`})})}),e.jsx(s,{number:2,title:"Clean: deduplicate, null-filter, range-filter, normalize text.",children:e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-python",children:`cleaned_df = (
    raw_df
    .dropDuplicates(["enrollment_id"])
    .filter(col("student_id").isNotNull())
    .filter((col("grade") >= 0) & (col("grade") <= 100))
    .withColumn("course_name", trim(initcap(col("course_name"))))
)
`})})}),e.jsx(s,{number:3,title:"Cache the cleaned result — it feeds multiple aggregations.",children:e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-python",children:`cleaned_df.cache()
cleaned_df.count()  # materialize
`})})}),e.jsx(s,{number:4,title:"Broadcast-join with small lookup table.",children:e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-python",children:`enriched_df = cleaned_df.join(broadcast(course_lookup), "course_id")
`})})}),e.jsx(s,{number:5,title:"Run aggregations on cached data, then unpersist.",children:e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-python",children:`enriched_df.groupBy("major").avg("grade").show()
enriched_df.groupBy("semester").count().show()
cleaned_df.unpersist()
`})})})]}),`
`,e.jsx(u,{items:[{q:"Why does an expensive join feeding four aggregations run the join four times?",a:"Because transformations are lazy and hold no results — each aggregation is an action that replays the entire lineage from the source files, join included. Spark does not automatically remember intermediate results between separate actions. Caching after the join makes it execute once and the four aggregations read from memory."},{q:"When is caching actively harmful?",a:"When the DataFrame is used exactly once — you pay the memory and the storage overhead for no reuse. It is also harmful when the cached data is large enough to evict other data or push executors toward spilling, in which case caching one thing slows everything else."},{q:"cache() versus persist() — what is the actual difference?",a:"For DataFrames in Spark 3.0 and later, cache() selects MEMORY_AND_DISK_DESER; persist() allows an explicit storage level. RDD.cache() defaults to MEMORY_ONLY. In either API, caching is useful when the same expensive intermediate will be reused, and an action is needed to materialize it."},{q:"How does broadcast turn a shuffle join into no shuffle?",a:"A normal join repartitions BOTH sides by the join key so matching rows meet — that is the shuffle. If one side is small enough, Spark instead sends a full copy to every executor, so each executor joins its existing partition of the large table locally. No data from the large table moves at all."},{q:"Why call unpersist(), given Spark evicts cached blocks anyway?",a:"Because eviction is reactive and uses LRU, so a stale cached DataFrame can push out something that is actually in use before it is dropped. Explicit unpersist returns the memory at the point you know it is dead, which keeps executor memory available for shuffles and joins rather than for results nobody will read again."}]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(h,{title:"TL;DR",children:e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:["Lazy evaluation means ",e.jsx(a.strong,{children:"every action replays the whole lineage from source"}),". Cache exists to stop that repetition."]}),`
`,e.jsxs(a.li,{children:["Cache when a DataFrame is ",e.jsx(a.strong,{children:"reused"})," — multiple downstream actions, an iterative loop, or an expensive intermediate. Used once? Caching is pure waste."]}),`
`,e.jsxs(a.li,{children:["DataFrame ",e.jsx(a.code,{children:"cache()"})," defaults to ",e.jsx(a.code,{children:"MEMORY_AND_DISK_DESER"})," in Spark 3.0 and later; ",e.jsx(a.code,{children:"persist()"})," lets you choose a different level. Do not confuse this with the RDD default."]}),`
`,e.jsxs(a.li,{children:[e.jsxs(a.strong,{children:[e.jsx(a.code,{children:"unpersist()"})," when done"]})," — cached data holds executor memory that everything else has to compete for."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"broadcast()"})," is the other lever: ship a small table to every executor and the join needs ",e.jsx(a.strong,{children:"no shuffle at all"}),"."]}),`
`]})}),`
`,e.jsx(S,{question:"A DataFrame is the result of an expensive 5-table join. You need to run 4 different aggregations on it. What should you do?",options:["Run the 4 aggregations one by one — Spark will optimize each query independently","Cache the DataFrame after the join, run all 4 aggregations, then unpersist — the join executes once, all aggregations read from cache","Use broadcast() on the largest table to speed up the join","Use DISK_ONLY storage level so the result persists across Spark sessions"],correct:1})]})}function I(t={}){const{wrapper:a}={...b(),...t.components};return a?e.jsx(a,{...t,children:e.jsx(v,{...t})}):v(t)}export{I as default};
