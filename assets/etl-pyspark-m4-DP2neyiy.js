import{u as s,j as n,B as t,Q as d}from"./index-VIW80S6x.js";function r(a){const e={code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...s(),...a.components};return n.jsxs(n.Fragment,{children:[n.jsx(e.p,{children:"In Module 3, we worked with RDDs — Spark's low-level API using tuples and lambdas. DataFrames provide a higher-level, schema-aware interface with automatic optimizations through the Catalyst query planner."}),`
`,n.jsx(e.h2,{children:"PySpark DataFrame vs Pandas DataFrame"}),`
`,n.jsx(e.p,{children:"Both PySpark and Pandas DataFrames represent the same concept: tabular data with named columns. The difference lies in their execution model."}),`
`,n.jsxs(e.table,{children:[n.jsx(e.thead,{children:n.jsxs(e.tr,{children:[n.jsx(e.th,{children:"Feature"}),n.jsx(e.th,{children:"PySpark DataFrame"}),n.jsx(e.th,{children:"Pandas DataFrame"})]})}),n.jsxs(e.tbody,{children:[n.jsxs(e.tr,{children:[n.jsx(e.td,{children:"Execution"}),n.jsx(e.td,{children:"Lazy (builds DAG)"}),n.jsx(e.td,{children:"Eager (runs immediately)"})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:"Scale"}),n.jsx(e.td,{children:"Distributed across cluster"}),n.jsx(e.td,{children:"Single machine, fits in RAM"})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:"Mutability"}),n.jsx(e.td,{children:"Immutable (transforms return new DF)"}),n.jsx(e.td,{children:"Mutable (in-place operations)"})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:"Optimization"}),n.jsx(e.td,{children:"Catalyst optimizer"}),n.jsx(e.td,{children:"None (manual)"})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:"Use case"}),n.jsx(e.td,{children:"Big data (GBs-TBs)"}),n.jsx(e.td,{children:"Small-medium data (MBs-GBs)"})]})]})]}),`
`,n.jsx(e.h2,{children:"Side-by-Side Comparisons"}),`
`,n.jsx(e.h3,{children:"Reading CSV"}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"PySpark:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`df = spark.read.csv("students.csv", header=True, inferSchema=True)
df.show(3)
`})}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Pandas:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`import pandas as pd

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
`,n.jsx(e.h3,{children:"Selecting Columns"}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"PySpark:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`df.select("name", "major", "gpa").show(5)
`})}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Pandas:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`print(df[["name", "major", "gpa"]])
`})}),`
`,n.jsx(e.h3,{children:"Filtering Rows"}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"PySpark:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`df.filter(df.gpa > 3.5).show()
`})}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Pandas:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`print(df[df["gpa"] > 3.5])
`})}),`
`,n.jsx(e.h3,{children:"Adding a Computed Column"}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"PySpark:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`from pyspark.sql.functions import col

df_with_pct = df.withColumn("gpa_pct", col("gpa") / 4.0 * 100)
df_with_pct.show(5)
`})}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Pandas:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`df["gpa_pct"] = df["gpa"] / 4.0 * 100
print(df[["name", "gpa", "gpa_pct"]])
`})}),`
`,n.jsx(e.h3,{children:"Grouping and Aggregation"}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"PySpark:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`from pyspark.sql.functions import avg, count

df.groupBy("major").agg(avg("gpa"), count("*")).show()
`})}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Pandas:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`result = df.groupby("major").agg({"gpa": "mean", "student_id": "count"})
print(result)
`})}),`
`,n.jsx(e.h2,{children:"Practice Problems"}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Recall — Problem 1"})}),`
`,n.jsx(e.p,{children:"Write both PySpark and Pandas code to select name and GPA where year == 3."}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"PySpark:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`df.filter(df.year == 3).select("name", "gpa").show()
`})}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Pandas:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`result = df[df["year"] == 3][["name", "gpa"]]
print(result)
`})}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Apply — Problem 2"})}),`
`,n.jsx(e.p,{children:"In both APIs, group by major and compute the mean GPA."}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"PySpark:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`from pyspark.sql.functions import avg

df.groupBy("major").agg(avg("gpa")).show()
`})}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Pandas:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`result = df.groupby("major")["gpa"].mean()
print(result)
`})}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Stretch — Problem 3"})}),`
`,n.jsxs(e.p,{children:["Add a column ",n.jsx(e.code,{children:"gpa_category"})," ('high' if GPA > 3.5, else 'standard') in both PySpark and Pandas."]}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"PySpark:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`from pyspark.sql.functions import when, col

df_cat = df.withColumn(
    "gpa_category",
    when(col("gpa") > 3.5, "high").otherwise("standard")
)
df_cat.show(5)
`})}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Pandas:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`import numpy as np

df["gpa_category"] = np.where(df["gpa"] > 3.5, "high", "standard")
print(df[["name", "gpa", "gpa_category"]])
`})}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Stretch — Problem 4"})}),`
`,n.jsx(e.p,{children:"Load the student data and compute average GPA by major."}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`import pandas as pd

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
`,n.jsx(t,{children:n.jsx(e.p,{children:"DataFrames give us a structured, optimized API. But sometimes you want to query data using familiar SQL syntax instead of method chains. Next, we'll register DataFrames as SQL tables and query them directly."})}),`
`,n.jsx(d,{question:"When would you choose PySpark over Pandas?",options:["Dataset fits in RAM on one machine","Dataset is 500GB across a cluster","You need interactive plotting","You need fast iteration in a notebook"],correct:1})]})}function c(a={}){const{wrapper:e}={...s(),...a.components};return e?n.jsx(e,{...a,children:n.jsx(r,{...a})}):r(a)}export{c as default};
