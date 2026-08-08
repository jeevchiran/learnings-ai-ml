import{u as r,j as e,C as s,B as i,R as o,Q as c}from"./index-COnZx3Nm.js";function a(n){const t={code:"code",em:"em",h2:"h2",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s,{title:"TL;DR",children:e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"MapReduce writes to disk between every stage; Spark keeps intermediates in RAM. That single difference is most of the speedup — iterative workloads benefit most."}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Transformations are lazy, actions execute."})," ",e.jsx(t.code,{children:"filter"}),", ",e.jsx(t.code,{children:"select"}),", ",e.jsx(t.code,{children:"groupBy"}),", ",e.jsx(t.code,{children:"withColumn"})," only record a plan; ",e.jsx(t.code,{children:"count"}),", ",e.jsx(t.code,{children:"show"}),", ",e.jsx(t.code,{children:"collect"}),", ",e.jsx(t.code,{children:"write"})," run it."]}),`
`,e.jsxs(t.li,{children:["The recorded plan is a ",e.jsx(t.strong,{children:"DAG"}),", and laziness is what makes it optimisable — Catalyst can reorder and fuse steps before any data moves."]}),`
`,e.jsxs(t.li,{children:["Classic optimisation: ",e.jsx(t.strong,{children:"predicate pushdown"}),", moving a filter earlier so less data flows through everything after it."]}),`
`,e.jsxs(t.li,{children:["Consequence: a bug in a transformation surfaces at the ",e.jsx(t.em,{children:"action"}),", which is why stack traces point at the wrong line."]}),`
`]})}),`
`,e.jsxs(t.p,{children:["In Module 1, we built an ETL pipeline: extracting data from CSV files, transforming it with filters and column operations, and loading results to storage. Now we'll understand ",e.jsx(t.em,{children:"why"})," Spark is fast — it keeps data in memory."]}),`
`,e.jsx(t.h2,{children:"Why In-Memory Processing?"}),`
`,e.jsx(t.p,{children:"Traditional distributed computing frameworks like Hadoop MapReduce write intermediate results to disk after every stage. When a pipeline has multiple steps — filter, then group, then aggregate — each step reads from disk and writes back to disk. Disk I/O is the single biggest bottleneck in these systems, often accounting for over 90% of total execution time."}),`
`,e.jsx(t.p,{children:"RAM access is roughly 100x faster than reading from a spinning disk and 10-20x faster than even modern SSDs. Spark exploits this by keeping intermediate results in memory between operations. When you chain a filter followed by a groupBy followed by an aggregation, the data flows through RAM without ever hitting disk (unless memory runs out)."}),`
`,e.jsx(t.p,{children:"This design means that iterative algorithms — machine learning training loops, graph traversal, repeated joins on the same dataset — run dramatically faster in Spark than in MapReduce. Instead of re-reading the same data from HDFS on every iteration, Spark holds it in memory and reuses it directly."}),`
`,e.jsx(t.h2,{children:"Lazy Evaluation and DAGs"}),`
`,e.jsx(t.p,{children:"Spark does not execute operations the moment you write them. Instead, it records each transformation — filter, select, groupBy, withColumn — into a plan called a Directed Acyclic Graph (DAG). The DAG captures the logical sequence of operations without running any of them."}),`
`,e.jsxs(t.p,{children:["Transformations are ",e.jsx(t.strong,{children:"lazy"}),": they are recorded but not executed. Actions — like ",e.jsx(t.code,{children:".count()"}),", ",e.jsx(t.code,{children:".show()"}),", or ",e.jsx(t.code,{children:".collect()"})," — trigger execution of the entire DAG. This lets Spark's optimizer (Catalyst) rearrange and combine operations before any data moves, producing an efficient physical plan."]}),`
`,e.jsx(t.p,{children:"For example, if you filter after a select, Catalyst can push the filter earlier to reduce the amount of data that flows through subsequent stages. None of this optimization would be possible if each line ran immediately."}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`# None of these lines execute yet — they build a DAG
df = spark.read.csv("students.csv", header=True, inferSchema=True)
filtered = df.filter(df.year >= 3)
selected = filtered.select("student_id", "gpa")
grouped = selected.groupBy((selected.gpa * 2).cast("int").alias("gpa_bucket"))

# This ACTION triggers the entire DAG
result = grouped.count()
print(f"Count: {result}")
`})}),`
`,e.jsx(t.h2,{children:"Persistence and Caching"}),`
`,e.jsx(t.p,{children:"When you reuse a DataFrame multiple times — running several different analyses on the same filtered dataset — Spark would normally recompute it from scratch each time because the DAG is re-executed for every action. To avoid this, you can cache the DataFrame in memory."}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"df.cache()"})," tells Spark to store the computed result in memory after the first action so that subsequent actions can read from RAM instead of re-executing the entire DAG. Under the hood, ",e.jsx(t.code,{children:".cache()"})," is shorthand for ",e.jsx(t.code,{children:".persist(StorageLevel.MEMORY_ONLY)"}),"."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"df.persist()"})," offers more control through storage levels: MEMORY_ONLY, MEMORY_AND_DISK, DISK_ONLY, and others. We will explore storage levels in detail in Module 10. For now, know that ",e.jsx(t.code,{children:".cache()"})," is the common default."]}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`# Read and filter
df = spark.read.csv("students.csv", header=True, inferSchema=True)
high_gpa = df.filter(df.gpa > 3.0)

# Cache the filtered result in memory
high_gpa.cache()

# First action — triggers computation and stores result in cache
count = high_gpa.count()
print(f"First action (count): {count} students with GPA > 3.0")

# Second action — reads from cache, no re-computation
avg = high_gpa.select(F.avg("gpa")).first()[0]
print(f"Second action (average): mean GPA = {avg:.2f}")
`})}),`
`,e.jsx(t.h2,{children:"Live Demo: In-Memory Speed"}),`
`,e.jsx(t.p,{children:"The following code demonstrates how fast repeated operations are when data is already in memory — no disk reads, no network calls, just CPU and RAM."}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`import pandas as pd
import time

# Simulate in-memory vs re-reading
data = {'student_id': list(range(1, 1001)),
        'gpa': [2.5 + (i % 15) / 10 for i in range(1000)]}
df = pd.DataFrame(data)

# Operation on in-memory DataFrame (fast)
start = time.time()
for _ in range(100):
    result = df[df['gpa'] > 3.0].shape[0]
elapsed = time.time() - start
print(f"100 filter operations on in-memory DataFrame: {elapsed:.4f}s")
print(f"Result: {result} students with GPA > 3.0")
`})}),`
`,e.jsx(t.h2,{children:"Practice Problems"}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Recall — Explain Each Step"})}),`
`,e.jsx(t.p,{children:"Explain in code comments what happens at each step: read, filter, cache, count."}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`# Step 1: Spark records a plan to read students.csv — no data loaded yet.
df = spark.read.csv("students.csv", header=True, inferSchema=True)

# Step 2: A filter node is added to the DAG — still no execution.
upper = df.filter(df.year >= 3)

# Step 3: The DataFrame is marked for caching — nothing cached yet.
upper.cache()

# Step 4: .count() is an ACTION. Spark executes the DAG: reads CSV,
#         applies filter, stores result in memory (cache), returns count.
print(f"Count of juniors and seniors: {upper.count()}")
`})}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Apply — Cache and Reuse"})}),`
`,e.jsxs(t.p,{children:["Write a PySpark pipeline that reads students.csv, filters to year >= 3, caches the result, then runs both ",e.jsx(t.code,{children:".count()"})," and ",e.jsx(t.code,{children:".show(3)"})," on the cached DataFrame."]}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`# Read the data
df = spark.read.csv("students.csv", header=True, inferSchema=True)

# Filter to juniors and seniors
upper = df.filter(df.year >= 3)

# Cache the result
upper.cache()

# Action 1: show first 3 rows
upper.show(3)

# Action 2: count total
print(f"Total students (year >= 3): {upper.count()}")
`})}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Stretch — Measure In-Memory vs Recreate"})}),`
`,e.jsx(t.p,{children:"Measure the time difference between filtering a DataFrame 50 times (data already in memory) vs creating the DataFrame from scratch 50 times then filtering."}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`import pandas as pd
import time

# Approach 1: Create once, filter 50 times (in-memory reuse)
data = {'student_id': list(range(1, 1001)),
        'gpa': [2.5 + (i % 15) / 10 for i in range(1000)]}
df = pd.DataFrame(data)

start = time.time()
for _ in range(50):
    result = df[df['gpa'] > 3.0].shape[0]
time_inmemory = time.time() - start

# Approach 2: Create from scratch + filter, 50 times
start = time.time()
for _ in range(50):
    df2 = pd.DataFrame(data)
    result = df2[df2['gpa'] > 3.0].shape[0]
time_recreate = time.time() - start

print(f"In-memory reuse (50 iterations): {time_inmemory:.4f}s")
print(f"Recreate each time (50 iterations): {time_recreate:.4f}s")
print(f"Recreate is {time_recreate / time_inmemory:.1f}x slower")
`})}),`
`,e.jsx(i,{children:e.jsx(t.p,{children:"Now that we understand why data lives in memory, let's look at the lowest-level abstraction Spark uses to represent it: Resilient Distributed Datasets (RDDs)."})}),`
`,e.jsx(o,{items:[{q:"Sort into transformations and actions: filter, count, select, collect, withColumn, write.",a:"Transformations (lazy, return a new DataFrame): filter, select, withColumn. Actions (trigger execution, return a value or side effect): count, collect, write. The test is whether the call returns another DataFrame — if it does, nothing has run yet."},{q:"Why is laziness a prerequisite for optimisation rather than just a performance trick?",a:"Because an optimiser can only rearrange work it has not yet done. If each line executed immediately, Spark would have already materialised a wide intermediate before learning that a later filter discards 99% of it. Deferring execution lets Catalyst see the whole DAG and choose a physical plan for the entire chain."},{q:"Give a concrete example of predicate pushdown and what it saves.",a:"You write select over all columns, then filter on year >= 3. Catalyst moves the filter before the select — and, with a columnar source like Parquet, pushes it into the reader so non-matching row groups are never decoded. The saving is I/O and shuffle volume, not just CPU."},{q:"Your filter has a typo, but the traceback points at .count(). Explain.",a:"Because the filter only recorded a plan node; the error is raised when the plan is analysed and executed, which the action triggers. Reading Spark stack traces means looking upstream from the action to the transformations that built the plan, not at the line the trace names."},{q:"Which workloads benefit most from in-memory processing, and why?",a:"Iterative ones — machine-learning training loops, graph traversals, repeated joins against the same table. They touch the same dataset many times, so MapReduce would re-read it from disk on every pass while Spark holds it in RAM and reuses it. A single-pass scan-and-write job benefits far less."}]}),`
`,e.jsx(c,{question:"Why does Spark delay execution until an action is called?",options:["To save memory","To build an optimized execution plan across all operations","Because Python is slow","To prevent errors"],correct:1})]})}function l(n={}){const{wrapper:t}={...r(),...n.components};return t?e.jsx(t,{...n,children:e.jsx(a,{...n})}):a(n)}export{l as default};
