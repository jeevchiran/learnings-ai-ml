import{u as t,j as e,C as r,B as i,R as o,Q as l}from"./index-Ba5-wm3B.js";function s(a){const n={code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...t(),...a.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:'createOrReplaceTempView("name")'})," makes a DataFrame queryable by name. It's ",e.jsx(n.strong,{children:"session-scoped and stores nothing on disk"})," — the view is a label on a plan, not a copy of data."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"spark.sql(...)"})," returns a DataFrame, so SQL and the method-chain API are freely interchangeable mid-pipeline."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Both go through Catalyst and produce the same physical plan."})," The choice is readability, not performance."]}),`
`,e.jsx(n.li,{children:"Rule of thumb: complex joins and aggregations often read better in SQL; programmatic, parameterised column logic reads better in the DataFrame API."}),`
`]})}),`
`,e.jsx(n.p,{children:"In Module 4, we compared PySpark and Pandas DataFrame APIs. Both use method chaining for transformations. Now we'll use a third approach: writing SQL queries directly against our DataFrames."}),`
`,e.jsx(n.h2,{children:"Registering DataFrames as SQL Tables"}),`
`,e.jsx(n.p,{children:"PySpark lets you query DataFrames using standard SQL. The first step is to register a DataFrame as a temporary view, which makes it accessible by name in SQL statements."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:'df.createOrReplaceTempView("table_name")'})," creates a session-scoped SQL table. It exists only for the duration of the Spark session and is not persisted to disk."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:'spark.sql("SELECT ...")'})," executes a SQL query against registered views and returns the result as a new DataFrame."]}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# Register the students DataFrame as a temp view
df.createOrReplaceTempView("students")

# Query it with SQL
result = spark.sql("SELECT * FROM students")
result.show()
`})}),`
`,e.jsx(n.h2,{children:"Basic SQL Queries"}),`
`,e.jsxs(n.p,{children:["Once a DataFrame is registered as a view, you can use familiar SQL clauses: ",e.jsx(n.code,{children:"SELECT"})," to choose columns, ",e.jsx(n.code,{children:"WHERE"})," to filter rows, and ",e.jsx(n.code,{children:"ORDER BY"})," to sort results."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`result = spark.sql("""
    SELECT name, gpa
    FROM students
    WHERE gpa > 3.5
    ORDER BY gpa DESC
""")
result.show()
`})}),`
`,e.jsx(n.h2,{children:"Aggregation in SQL"}),`
`,e.jsxs(n.p,{children:["SQL aggregation functions like ",e.jsx(n.code,{children:"COUNT"}),", ",e.jsx(n.code,{children:"AVG"}),", ",e.jsx(n.code,{children:"SUM"}),", and ",e.jsx(n.code,{children:"MAX"})," work with ",e.jsx(n.code,{children:"GROUP BY"})," to summarize data. The ",e.jsx(n.code,{children:"HAVING"})," clause filters groups after aggregation (similar to how ",e.jsx(n.code,{children:"WHERE"})," filters rows before aggregation)."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`result = spark.sql("""
    SELECT major,
           COUNT(*) as student_count,
           AVG(gpa) as avg_gpa
    FROM students
    GROUP BY major
    HAVING AVG(gpa) > 3.3
""")
result.show()
`})}),`
`,e.jsx(n.h2,{children:"Joins in SQL"}),`
`,e.jsx(n.p,{children:"To join data from multiple DataFrames, register each one as a temp view and then write a standard SQL JOIN. This is identical to writing joins in any relational database."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# Register both DataFrames as temp views
students_df.createOrReplaceTempView("students")
enrollments_df.createOrReplaceTempView("enrollments")

result = spark.sql("""
    SELECT s.name, e.course_name, e.grade
    FROM students s
    JOIN enrollments e ON s.student_id = e.student_id
    WHERE e.grade > 85
""")
result.show()
`})}),`
`,e.jsx(n.h2,{children:"Subqueries and CTEs"}),`
`,e.jsxs(n.p,{children:["For more complex logic, SQL supports subqueries (nested SELECT statements) and Common Table Expressions (CTEs using the ",e.jsx(n.code,{children:"WITH"})," clause). Both let you break a query into logical steps."]}),`
`,e.jsx(n.h3,{children:"Subquery: students above average GPA"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`result = spark.sql("""
    SELECT name, gpa
    FROM students
    WHERE gpa > (SELECT AVG(gpa) FROM students)
""")
result.show()
`})}),`
`,e.jsx(n.h3,{children:"CTE: same logic, more readable"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`result = spark.sql("""
    WITH avg_stats AS (
        SELECT AVG(gpa) as avg_gpa FROM students
    )
    SELECT s.name, s.gpa, a.avg_gpa
    FROM students s, avg_stats a
    WHERE s.gpa > a.avg_gpa
""")
result.show()
`})}),`
`,e.jsx(n.h2,{children:"Live Demo: SQL-like Operations in Pandas"}),`
`,e.jsxs(n.p,{children:["Pandas offers methods that mirror SQL operations. The ",e.jsx(n.code,{children:".query()"})," method works like WHERE, ",e.jsx(n.code,{children:".merge()"})," works like JOIN, and ",e.jsx(n.code,{children:".groupby()"})," works like GROUP BY."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import pandas as pd

students = pd.DataFrame({
    'student_id': [1001, 1002, 1003, 1004, 1005],
    'name': ['Alice Chen', 'Bob Martinez', 'Carol Johnson', 'David Kim', 'Eva Patel'],
    'major': ['Computer Science', 'Data Science', 'Mathematics', 'Computer Science', 'Data Science'],
    'gpa': [3.8, 3.5, 3.9, 3.2, 3.7]
})

enrollments = pd.DataFrame({
    'student_id': [1001, 1001, 1002, 1003, 1005],
    'course_name': ['Data Structures', 'Algorithms', 'Machine Learning', 'Linear Algebra', 'Big Data'],
    'grade': [88, 92, 85, 91, 83]
})

# SQL-like: SELECT with WHERE
print("Students with GPA > 3.5:")
print(students.query("gpa > 3.5")[["name", "gpa"]])

# SQL-like: JOIN
print("\\nJoined data:")
joined = students.merge(enrollments, on="student_id")
print(joined[["name", "course_name", "grade"]])

# SQL-like: GROUP BY with aggregation
print("\\nAverage grade per student:")
avg_grades = joined.groupby("name")["grade"].mean().reset_index()
print(avg_grades)
`})}),`
`,e.jsx(n.h2,{children:"Practice Problems"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Recall — Problem 1"})}),`
`,e.jsx(n.p,{children:"Register the enrollments DataFrame as a temp view and write a SQL query to SELECT all rows WHERE grade > 85."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# Register the enrollments DataFrame as a temp view
enrollments_df.createOrReplaceTempView("enrollments")

# Write a SQL query to get rows where grade > 85
result = spark.sql("""
    SELECT student_id, course_name, grade
    FROM enrollments
    WHERE grade > 85
""")
result.show()
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Apply — Problem 2"})}),`
`,e.jsx(n.p,{children:"JOIN students and enrollments on student_id, and SELECT name, course_name, grade. Order by grade descending."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`students_df.createOrReplaceTempView("students")
enrollments_df.createOrReplaceTempView("enrollments")

result = spark.sql("""
    SELECT s.name, e.course_name, e.grade
    FROM students s
    JOIN enrollments e ON s.student_id = e.student_id
    ORDER BY e.grade DESC
""")
result.show()
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Stretch — Problem 3"})}),`
`,e.jsx(n.p,{children:"Write a CTE that computes each student's average grade across all courses, then SELECT only students with average grade > 80."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`students_df.createOrReplaceTempView("students")
enrollments_df.createOrReplaceTempView("enrollments")

result = spark.sql("""
    WITH student_averages AS (
        SELECT s.name, AVG(e.grade) as avg_grade
        FROM students s
        JOIN enrollments e ON s.student_id = e.student_id
        GROUP BY s.name
    )
    SELECT name, avg_grade
    FROM student_averages
    WHERE avg_grade > 80
""")
result.show()
`})}),`
`,e.jsx(i,{children:e.jsx(n.p,{children:"SQL and the DataFrame API cover most data operations. But sometimes you need custom logic — a calculation or classification that doesn't exist as a built-in function. That's where User-Defined Functions come in."})}),`
`,e.jsx(o,{items:[{q:"Does createOrReplaceTempView write anything to disk?",a:"No. It registers a name in the session catalogue pointing at the DataFrame's logical plan. Nothing is materialised or persisted, and the view disappears when the session ends — it is a label, not a table. Use write.saveAsTable if you need something durable."},{q:"Is SQL slower than the DataFrame API in Spark?",a:"No — both are parsed into the same logical plan and optimised by the same Catalyst engine, producing identical physical plans for equivalent queries. Choose whichever expresses the intent more clearly; there is no performance argument either way."},{q:"When does SQL read better, and when does the DataFrame API?",a:"SQL for declarative shape — multi-table joins, window functions, nested aggregations, where the query reads like the question. The DataFrame API when the logic is programmatic — building column expressions in a loop, applying a transformation to a computed list of columns, or anything where you would otherwise be assembling a SQL string."},{q:"You can mix the two mid-pipeline. Why does that work?",a:"Because spark.sql returns an ordinary DataFrame, and any DataFrame can be registered as a view. So you can filter with the API, register the result, run a SQL aggregation over it, and continue chaining methods on the output — it is all one lazy plan regardless of which syntax built each node."}]}),`
`,e.jsx(l,{question:"What does createOrReplaceTempView do?",options:["Saves data to disk","Registers the DataFrame as a queryable SQL table in the Spark session","Creates a persistent database table","Converts DataFrame to RDD"],correct:1})]})}function c(a={}){const{wrapper:n}={...t(),...a.components};return n?e.jsx(n,{...a,children:e.jsx(s,{...a})}):s(a)}export{c as default};
