import{u as r,j as e,C as t,B as i,R as d,Q as o}from"./index-Ba5-wm3B.js";function s(a){const n={code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...r(),...a.components};return e.jsxs(e.Fragment,{children:[e.jsx(t,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Same concept, different execution model: PySpark is ",e.jsx(n.strong,{children:"lazy, distributed, immutable, optimised"}),"; Pandas is ",e.jsx(n.strong,{children:"eager, single-machine, mutable, unoptimised"}),"."]}),`
`,e.jsx(n.li,{children:"Pick by data size and where it lives. Fits in one machine's RAM → Pandas, and its interactivity wins. Spread across a cluster → PySpark."}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Distributed isn't free."})," On small data Spark's scheduling and shuffle overhead makes it slower than Pandas, not faster."]}),`
`,e.jsx(n.li,{children:"Schema-awareness is the point: named typed columns are what let Catalyst optimise, which RDDs could never offer."}),`
`]})}),`
`,e.jsx(n.p,{children:"In Module 3, we worked with RDDs — Spark's low-level API using tuples and lambdas. DataFrames provide a higher-level, schema-aware interface with automatic optimizations through the Catalyst query planner."}),`
`,e.jsx(n.h2,{children:"PySpark DataFrame vs Pandas DataFrame"}),`
`,e.jsx(n.p,{children:"Both PySpark and Pandas DataFrames represent the same concept: tabular data with named columns. The difference lies in their execution model."}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Feature"}),e.jsx(n.th,{children:"PySpark DataFrame"}),e.jsx(n.th,{children:"Pandas DataFrame"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Execution"}),e.jsx(n.td,{children:"Lazy (builds DAG)"}),e.jsx(n.td,{children:"Eager (runs immediately)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Scale"}),e.jsx(n.td,{children:"Distributed across cluster"}),e.jsx(n.td,{children:"Single machine, fits in RAM"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Mutability"}),e.jsx(n.td,{children:"Immutable (transforms return new DF)"}),e.jsx(n.td,{children:"Mutable (in-place operations)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Optimization"}),e.jsx(n.td,{children:"Catalyst optimizer"}),e.jsx(n.td,{children:"None (manual)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Use case"}),e.jsx(n.td,{children:"Big data (GBs-TBs)"}),e.jsx(n.td,{children:"Small-medium data (MBs-GBs)"})]})]})]}),`
`,e.jsx(n.h2,{children:"Side-by-Side Comparisons"}),`
`,e.jsx(n.h3,{children:"Reading CSV"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"PySpark:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`df = spark.read.csv("students.csv", header=True, inferSchema=True)
df.show(3)
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Pandas:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import pandas as pd

data = {
    'student_id': [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010],
    'name': ['Alice Chen', 'Bob Martinez', 'Carol Johnson', 'David Kim', 'Eva Patel',
             'Frank Wilson', 'Grace Lee', 'Henry Brown', 'Iris Davis', 'Jack Thompson'],
    'major': ['Computer Science', 'Data Science', 'Mathematics', 'Computer Science', 'Data Science',
              'Statistics', 'Computer Science', 'Mathematics', 'Data Science', 'Statistics'],
    'year': [3, 2, 4, 1, 3, 2, 4, 1, 2, 3],
    'gpa': [3.8, 3.5, 3.9, 3.2, 3.7, 3.4, 3.6, 2.9, 3.3, 3.1]
}
df = pd.DataFrame(data)
print(df.head(3))
`})}),`
`,e.jsx(n.h3,{children:"Selecting Columns"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"PySpark:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`df.select("name", "major", "gpa").show(5)
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Pandas:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`print(df[["name", "major", "gpa"]])
`})}),`
`,e.jsx(n.h3,{children:"Filtering Rows"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"PySpark:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`df.filter(df.gpa > 3.5).show()
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Pandas:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`print(df[df["gpa"] > 3.5])
`})}),`
`,e.jsx(n.h3,{children:"Adding a Computed Column"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"PySpark:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`from pyspark.sql.functions import col

df_with_pct = df.withColumn("gpa_pct", col("gpa") / 4.0 * 100)
df_with_pct.show(5)
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Pandas:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`df["gpa_pct"] = df["gpa"] / 4.0 * 100
print(df[["name", "gpa", "gpa_pct"]])
`})}),`
`,e.jsx(n.h3,{children:"Grouping and Aggregation"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"PySpark:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`from pyspark.sql.functions import avg, count

df.groupBy("major").agg(avg("gpa"), count("*")).show()
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Pandas:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`result = df.groupby("major").agg({"gpa": "mean", "student_id": "count"})
print(result)
`})}),`
`,e.jsx(n.h2,{children:"Practice Problems"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Recall — Problem 1"})}),`
`,e.jsx(n.p,{children:"Write both PySpark and Pandas code to select name and GPA where year == 3."}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"PySpark:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`df.filter(df.year == 3).select("name", "gpa").show()
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Pandas:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`result = df[df["year"] == 3][["name", "gpa"]]
print(result)
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Apply — Problem 2"})}),`
`,e.jsx(n.p,{children:"In both APIs, group by major and compute the mean GPA."}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"PySpark:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`from pyspark.sql.functions import avg

df.groupBy("major").agg(avg("gpa")).show()
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Pandas:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`result = df.groupby("major")["gpa"].mean()
print(result)
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Stretch — Problem 3"})}),`
`,e.jsxs(n.p,{children:["Add a column ",e.jsx(n.code,{children:"gpa_category"})," ('high' if GPA > 3.5, else 'standard') in both PySpark and Pandas."]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"PySpark:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`from pyspark.sql.functions import when, col

df_cat = df.withColumn(
    "gpa_category",
    when(col("gpa") > 3.5, "high").otherwise("standard")
)
df_cat.show(5)
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Pandas:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import numpy as np

df["gpa_category"] = np.where(df["gpa"] > 3.5, "high", "standard")
print(df[["name", "gpa", "gpa_category"]])
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Stretch — Problem 4"})}),`
`,e.jsx(n.p,{children:"Load the student data and compute average GPA by major."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import pandas as pd

data = {
    'student_id': [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010],
    'name': ['Alice Chen', 'Bob Martinez', 'Carol Johnson', 'David Kim', 'Eva Patel',
             'Frank Wilson', 'Grace Lee', 'Henry Brown', 'Iris Davis', 'Jack Thompson'],
    'major': ['Computer Science', 'Data Science', 'Mathematics', 'Computer Science', 'Data Science',
              'Statistics', 'Computer Science', 'Mathematics', 'Data Science', 'Statistics'],
    'year': [3, 2, 4, 1, 3, 2, 4, 1, 2, 3],
    'gpa': [3.8, 3.5, 3.9, 3.2, 3.7, 3.4, 3.6, 2.9, 3.3, 3.1]
}
df = pd.DataFrame(data)

avg_gpa_by_major = df.groupby("major")["gpa"].mean()
print("Average GPA by major:")
print(avg_gpa_by_major)
`})}),`
`,e.jsx(i,{children:e.jsx(n.p,{children:"DataFrames give us a structured, optimized API. But sometimes you want to query data using familiar SQL syntax instead of method chains. Next, we'll register DataFrames as SQL tables and query them directly."})}),`
`,e.jsx(d,{items:[{q:"Give the four axes on which PySpark and Pandas DataFrames differ.",a:"Execution — lazy DAG versus eager immediate. Scale — distributed across a cluster versus one machine's RAM. Mutability — immutable transformations returning new frames versus in-place modification. Optimisation — Catalyst rewrites your plan versus you optimising by hand."},{q:"Your dataset is 200 MB. Someone proposes PySpark for 'scalability'. Respond.",a:"It will be slower. 200 MB fits comfortably in memory, so Pandas runs in-process with no serialisation, no task scheduling, and no shuffle. Spark pays fixed overheads — JVM startup, partition planning, network coordination — that only pay off when the data genuinely exceeds one machine. Scalability you do not need is just latency."},{q:"Why can Pandas support in-place mutation while PySpark cannot?",a:"Because Pandas owns one array in one process, so writing to it is well defined. A Spark DataFrame is a logical plan over partitions on many machines, and its fault tolerance depends on being able to recompute any partition from its lineage. In-place mutation would invalidate that recipe, so every transformation returns a new DataFrame instead."},{q:"What does schema-awareness buy a DataFrame that an RDD cannot have?",a:"Optimisation. Knowing each column's name and type lets Catalyst prune unread columns, push filters down into the file reader, reorder joins, and generate specialised bytecode. An RDD holds opaque objects manipulated by arbitrary lambdas, so Spark can only run them in the order you wrote."}]}),`
`,e.jsx(o,{question:"When would you choose PySpark over Pandas?",options:["Dataset fits in RAM on one machine","Dataset is 500GB across a cluster","You need interactive plotting","You need fast iteration in a notebook"],correct:1})]})}function l(a={}){const{wrapper:n}={...r(),...a.components};return n?e.jsx(n,{...a,children:e.jsx(s,{...a})}):s(a)}export{l as default};
