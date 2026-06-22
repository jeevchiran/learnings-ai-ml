import{u as a,j as e,B as r,Q as o}from"./index-VIW80S6x.js";function t(s){const n={code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",strong:"strong",...a(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{children:"Introduction: What is ETL?"}),`
`,e.jsxs(n.p,{children:["ETL stands for ",e.jsx(n.strong,{children:"Extract, Transform, Load"})," — the three fundamental steps in any data pipeline. Whether you're building a dashboard, training a machine learning model, or migrating data between systems, you'll almost certainly follow this pattern. It's one of the first things every data engineer learns because it structures how raw data becomes useful information."]}),`
`,e.jsxs(n.p,{children:["In the ",e.jsx(n.strong,{children:"Extract"})," phase, you pull data from one or more sources — databases, APIs, flat files like CSVs, or streaming systems. During the ",e.jsx(n.strong,{children:"Transform"})," phase, you clean, filter, reshape, and enrich that data so it's ready for its intended use. Finally, in the ",e.jsx(n.strong,{children:"Load"})," phase, you persist the results somewhere — a data warehouse, a file system, or another database."]}),`
`,e.jsx(n.p,{children:"In this module, we'll walk through each phase using PySpark, a distributed data processing framework widely used in industry. We'll also show equivalent operations in Pandas so you can see how the concepts translate to a library you may already know."}),`
`,e.jsx(n.h2,{children:"Extract: Reading Data from Sources"}),`
`,e.jsxs(n.p,{children:["The first step is getting data into your processing framework. In PySpark, you use the ",e.jsx(n.code,{children:"SparkSession"})," to read files in various formats — CSV, JSON, Parquet, and more. The result is a DataFrame, a distributed collection of rows organized into named columns."]}),`
`,e.jsx(n.h3,{children:"Reading a CSV with PySpark"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("ETL Demo").getOrCreate()

# Extract: read the students CSV file
students_df = spark.read.csv("data/students.csv", header=True, inferSchema=True)

# Display the first 5 rows
students_df.show(5)
`})}),`
`,e.jsx(n.h3,{children:"Same operation with Pandas"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import pandas as pd

# Sample data (full dataset available in companion notebook)
data = {
    'student_id': ['S001', 'S002', 'S003', 'S004', 'S005'],
    'name': ['Alice Johnson', 'Bob Martinez', 'Carol Williams', 'David Chen', 'Emma Thompson'],
    'major': ['Computer Science', 'Data Science', 'Mathematics', 'Statistics', 'Computer Science'],
    'year': [3, 2, 4, 1, 2],
    'gpa': [3.72, 3.45, 3.88, 3.21, 3.56]
}
df = pd.DataFrame(data)
print(df.head())
`})}),`
`,e.jsx(n.h2,{children:"Transform: Manipulating Data"}),`
`,e.jsx(n.p,{children:"Once data is loaded, you'll need to reshape it for your use case. Common transformations include selecting specific columns, filtering rows based on conditions, and adding computed columns. PySpark provides a fluent API that chains these operations together."}),`
`,e.jsx(n.h3,{children:"Selecting columns, filtering, and adding a computed column"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`from pyspark.sql.functions import col, round as spark_round

# Transform: select columns, filter by GPA > 3.5, add computed column
transformed_df = (
    students_df
    .select("student_id", "name", "major", "gpa")
    .filter(col("gpa") > 3.5)
    .withColumn("gpa_scaled", spark_round(col("gpa") * 25, 2))
)

transformed_df.show(10)
`})}),`
`,e.jsx(n.h3,{children:"Same transforms in Pandas"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import pandas as pd

data = {
    'student_id': ['S001', 'S002', 'S003', 'S004', 'S005'],
    'name': ['Alice Johnson', 'Bob Martinez', 'Carol Williams', 'David Chen', 'Emma Thompson'],
    'major': ['Computer Science', 'Data Science', 'Mathematics', 'Statistics', 'Computer Science'],
    'year': [3, 2, 4, 1, 2],
    'gpa': [3.72, 3.45, 3.88, 3.21, 3.56]
}
df = pd.DataFrame(data)

# Transform: select columns, filter by GPA > 3.5, add computed column
transformed = (
    df[['student_id', 'name', 'major', 'gpa']]
    .query('gpa > 3.5')
    .assign(gpa_scaled=lambda x: round(x['gpa'] * 25, 2))
)
print(transformed)
`})}),`
`,e.jsx(n.h2,{children:"Load: Writing Results"}),`
`,e.jsx(n.p,{children:'The final step in an ETL pipeline is persisting your transformed data. This could mean writing to a data warehouse, saving to a file system in an efficient format like Parquet, or exporting as CSV for downstream consumers. The "Load" step ensures your work is durable and accessible to others.'}),`
`,e.jsx(n.h3,{children:"Writing results with PySpark"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# Load: write transformed data to Parquet (columnar, compressed)
transformed_df.write.parquet("output/students_honor_roll.parquet", mode="overwrite")

# Or write as CSV for compatibility
transformed_df.write.csv("output/students_honor_roll_csv", header=True, mode="overwrite")

print("Data written successfully.")
print("Parquet: output/students_honor_roll.parquet")
print("CSV: output/students_honor_roll_csv/")
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Why Parquet?"})," Parquet is a columnar storage format that compresses well and supports efficient querying. It's the standard output format in most Spark pipelines. CSV is useful when you need human-readable output or compatibility with tools that don't support Parquet."]}),`
`,e.jsx(n.h2,{children:"Practice Problems"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"RECALL — Problem 1"})}),`
`,e.jsxs(n.p,{children:["Read ",e.jsx(n.code,{children:"enrollments.csv"})," using PySpark and display the first 5 rows."]}),`
`,e.jsxs(n.p,{children:["Hint: Use ",e.jsx(n.code,{children:"spark.read.csv()"})," with ",e.jsx(n.code,{children:"header=True"})," and ",e.jsx(n.code,{children:"inferSchema=True"}),"."]}),`
`,e.jsxs(n.p,{children:["Solution: We read the CSV file with schema inference enabled, then call ",e.jsx(n.code,{children:".show(5)"})," to display the first 5 rows."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`enrollments_df = spark.read.csv("data/enrollments.csv", header=True, inferSchema=True)
enrollments_df.show(5)
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"APPLY — Problem 2"})}),`
`,e.jsxs(n.p,{children:["Read ",e.jsx(n.code,{children:"students.csv"}),", filter to students with GPA > 3.5, and select only the ",e.jsx(n.code,{children:"name"})," and ",e.jsx(n.code,{children:"major"})," columns."]}),`
`,e.jsxs(n.p,{children:["Hint: Chain ",e.jsx(n.code,{children:".filter()"})," and ",e.jsx(n.code,{children:".select()"})," after reading. Use ",e.jsx(n.code,{children:'col("gpa") > 3.5'})," for the filter condition."]}),`
`,e.jsx(n.p,{children:"Solution: We filter rows where GPA exceeds 3.5, then select only the two columns we need."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`from pyspark.sql.functions import col

students_df = spark.read.csv("data/students.csv", header=True, inferSchema=True)

honor_students = (
    students_df
    .filter(col("gpa") > 3.5)
    .select("name", "major")
)
honor_students.show(10)
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"STRETCH — Problem 3"})}),`
`,e.jsxs(n.p,{children:["Read both ",e.jsx(n.code,{children:"students.csv"})," and ",e.jsx(n.code,{children:"enrollments.csv"}),", and print the row count of each DataFrame."]}),`
`,e.jsxs(n.p,{children:["Hint: Use ",e.jsx(n.code,{children:".count()"})," on each DataFrame to get the number of rows."]}),`
`,e.jsxs(n.p,{children:["Solution: We read both files and use the ",e.jsx(n.code,{children:".count()"})," method to get the number of rows in each DataFrame."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`students_df = spark.read.csv("data/students.csv", header=True, inferSchema=True)
enrollments_df = spark.read.csv("data/enrollments.csv", header=True, inferSchema=True)

print(f"Students count: {students_df.count()}")
print(f"Enrollments count: {enrollments_df.count()}")
`})}),`
`,e.jsx(r,{children:e.jsx(n.p,{children:"Next up: Now that we can extract, transform, and load data, we'll explore why Spark keeps this data in memory — and what makes that so powerful."})}),`
`,e.jsx(o,{question:"In the ETL pipeline, which step involves filtering rows and adding computed columns?",options:["Extract","Transform","Load","Ingest"],correct:1})]})}function i(s={}){const{wrapper:n}={...a(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(t,{...s})}):t(s)}export{i as default};
