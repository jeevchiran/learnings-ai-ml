import{u as r,j as e,B as s,Q as i}from"./index-VIW80S6x.js";function a(t){const n={code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"In Module 2, we saw how Spark keeps data in memory and uses lazy evaluation with DAGs. Now we'll look at the data structure that makes this possible: the RDD."}),`
`,e.jsx(n.h2,{children:"What is an RDD?"}),`
`,e.jsxs(n.p,{children:["RDD stands for ",e.jsx(n.strong,{children:"Resilient Distributed Dataset"}),". Each word captures a key property of the abstraction:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Resilient"})," — If a partition is lost (say a node crashes), Spark can reconstruct it by replaying the sequence of transformations that produced it. This chain of operations is called the ",e.jsx(n.em,{children:"lineage"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Distributed"})," — The data is split into partitions spread across the nodes of a cluster. Each node works on its own slice in parallel."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Dataset"})," — At the end of the day, it is simply a collection of elements: rows, tuples, numbers, strings, or any Python object."]}),`
`]}),`
`,e.jsxs(n.p,{children:["One more property is critical: RDDs are ",e.jsx(n.strong,{children:"immutable"}),". You never modify an RDD in place. Every transformation (like ",e.jsx(n.code,{children:"map"})," or ",e.jsx(n.code,{children:"filter"}),") produces a brand-new RDD, leaving the original unchanged. This immutability is what makes lineage-based recovery possible: Spark can always rebuild from the original source by re-applying the recorded steps."]}),`
`,e.jsx(n.p,{children:"Think of an RDD like a read-only list that lives across multiple machines. You describe what you want to do to it, and Spark figures out how to do it efficiently across the cluster."}),`
`,e.jsx(n.h2,{children:"Creating RDDs"}),`
`,e.jsx(n.p,{children:"There are two primary ways to create an RDD in PySpark:"}),`
`,e.jsx(n.h3,{children:"From a Python collection"}),`
`,e.jsxs(n.p,{children:["Use ",e.jsx(n.code,{children:"sc.parallelize()"})," to distribute a local list across the cluster:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`students = [
    (1001, 'Alice Chen', 'Computer Science', 3, 3.8),
    (1002, 'Bob Martinez', 'Data Science', 2, 3.5),
    (1003, 'Carol Johnson', 'Mathematics', 4, 3.9),
    (1004, 'David Kim', 'Computer Science', 1, 3.2),
    (1005, 'Eva Patel', 'Data Science', 3, 3.7),
]

rdd = sc.parallelize(students, numSlices=4)
print(rdd)
print(f"Number of partitions: {rdd.getNumPartitions()}")
print(f"First 3 elements: {rdd.take(3)}")
`})}),`
`,e.jsx(n.h3,{children:"From an external file"}),`
`,e.jsxs(n.p,{children:["Use ",e.jsx(n.code,{children:"sc.textFile()"})," to read a file (local or HDFS) into an RDD of strings, one per line:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`lines_rdd = sc.textFile("students.csv")
print("First 3 lines:")
for line in lines_rdd.take(3):
    print(line)
print(f"\\nTotal lines: {lines_rdd.count()} (1 header + 8 students)")
`})}),`
`,e.jsx(n.h2,{children:"Transformations vs Actions"}),`
`,e.jsx(n.p,{children:"Every operation on an RDD falls into one of two categories:"}),`
`,e.jsx(n.h3,{children:"Transformations (lazy)"}),`
`,e.jsx(n.p,{children:"Transformations describe a computation but do not execute it immediately. They return a new RDD and are only computed when an action triggers them."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"map(func)"})," — apply a function to each element"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"filter(func)"})," — keep elements where the function returns True"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"flatMap(func)"})," — like map, but each input can produce zero or more outputs"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"reduceByKey(func)"})," — merge values for each key using a reduce function"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"groupByKey()"})," — group values by key into iterables"]}),`
`]}),`
`,e.jsx(n.h3,{children:"Actions (trigger execution)"}),`
`,e.jsx(n.p,{children:"Actions force Spark to execute the chain of transformations and return a result to the driver program."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"collect()"})," — return all elements as a Python list"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"count()"})," — return the number of elements"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"reduce(func)"})," — aggregate all elements using a function"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"take(n)"})," — return the first n elements"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"first()"})," — return the first element (same as take(1)[0])"]}),`
`]}),`
`,e.jsx(n.h3,{children:"Putting it together"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`students = [
    (1001, 'Alice Chen', 'Computer Science', 3, 3.8),
    (1002, 'Bob Martinez', 'Data Science', 2, 3.5),
    (1003, 'Carol Johnson', 'Mathematics', 4, 3.9),
    (1004, 'David Kim', 'Computer Science', 1, 3.2),
    (1005, 'Eva Patel', 'Data Science', 3, 3.7),
    (1006, 'Frank Wilson', 'Statistics', 2, 3.4),
    (1007, 'Grace Lee', 'Computer Science', 4, 3.6),
    (1008, 'Henry Brown', 'Mathematics', 1, 2.9),
]

rdd = sc.parallelize(students)

# Transformation: extract just names
names_rdd = rdd.map(lambda x: x[1])

# Action: collect results
names = names_rdd.collect()
print(f"Names: {names}")
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`rdd = sc.parallelize(students)

# Transformation: filter by GPA > 3.5
high_gpa_rdd = rdd.filter(lambda x: x[4] > 3.5)

# Action: collect and display
results = high_gpa_rdd.collect()
print("Students with GPA > 3.5:")
for s in results:
    print(f"  {s[1]} ({s[4]})")
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`rdd = sc.parallelize(students)

# Map each student to (major, 1) then reduce by key to count
major_counts = rdd.map(lambda x: (x[2], 1)) \\
                  .reduceByKey(lambda a, b: a + b) \\
                  .collect()

print("Students per major:")
for major, count in major_counts:
    print(f"  {major}: {count}")
`})}),`
`,e.jsx(n.h2,{children:"Live Demo: Python Analogues"}),`
`,e.jsxs(n.p,{children:["RDD operations like ",e.jsx(n.code,{children:"map"}),", ",e.jsx(n.code,{children:"filter"}),", and grouping have direct equivalents in plain Python."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# Python list operations mirror RDD transformations
students = [
    (1001, 'Alice Chen', 'Computer Science', 3, 3.8),
    (1002, 'Bob Martinez', 'Data Science', 2, 3.5),
    (1003, 'Carol Johnson', 'Mathematics', 4, 3.9),
    (1004, 'David Kim', 'Computer Science', 1, 3.2),
    (1005, 'Eva Patel', 'Data Science', 3, 3.7),
    (1006, 'Frank Wilson', 'Statistics', 2, 3.4),
    (1007, 'Grace Lee', 'Computer Science', 4, 3.6),
    (1008, 'Henry Brown', 'Mathematics', 1, 2.9),
]

# map: extract names (like rdd.map(lambda x: x[1]))
names = list(map(lambda s: s[1], students))
print("Names:", names)

# filter: GPA > 3.5 (like rdd.filter(lambda x: x[4] > 3.5))
high_gpa = list(filter(lambda s: s[4] > 3.5, students))
print(f"\\nStudents with GPA > 3.5: {len(high_gpa)}")
for s in high_gpa:
    print(f"  {s[1]} ({s[4]})")

# reduce: group by major and count
from collections import Counter
major_counts = Counter(s[2] for s in students)
print(f"\\nStudents per major:")
for major, count in major_counts.items():
    print(f"  {major}: {count}")
`})}),`
`,e.jsx(n.h2,{children:"Practice Problems"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Recall — Problem 1"})}),`
`,e.jsxs(n.p,{children:["Create an RDD from a list of ",e.jsx(n.code,{children:"(student_id, name, gpa)"})," tuples and use ",e.jsx(n.code,{children:".count()"})," to find how many elements it contains."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`data = [
    (1001, 'Alice Chen', 3.8),
    (1002, 'Bob Martinez', 3.5),
    (1003, 'Carol Johnson', 3.9),
    (1004, 'David Kim', 3.2),
    (1005, 'Eva Patel', 3.7),
]

rdd = sc.parallelize(data)
print(f"Number of students: {rdd.count()}")
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Apply — Problem 2"})}),`
`,e.jsxs(n.p,{children:["Using ",e.jsx(n.code,{children:"map"})," and ",e.jsx(n.code,{children:"filter"})," on an RDD of student tuples, extract the names of students with GPA > 3.5."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`data = [
    (1001, 'Alice Chen', 3.8),
    (1002, 'Bob Martinez', 3.5),
    (1003, 'Carol Johnson', 3.9),
    (1004, 'David Kim', 3.2),
    (1005, 'Eva Patel', 3.7),
]

rdd = sc.parallelize(data)

# Filter students with GPA > 3.5, then map to extract names
result = rdd.filter(lambda x: x[2] > 3.5) \\
            .map(lambda x: x[1]) \\
            .collect()

print(f"High-GPA student names: {result}")
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Stretch — Problem 3"})}),`
`,e.jsxs(n.p,{children:["Use ",e.jsx(n.code,{children:"reduceByKey"})," to compute the average GPA per major from an RDD of ",e.jsx(n.code,{children:"(major, gpa)"})," pairs. Map each pair to ",e.jsx(n.code,{children:"(major, (gpa, 1))"}),", reduce to sum GPAs and counts, then divide."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`data = [
    ('Computer Science', 3.8),
    ('Data Science', 3.5),
    ('Mathematics', 3.9),
    ('Computer Science', 3.2),
    ('Data Science', 3.7),
    ('Statistics', 3.4),
    ('Computer Science', 3.6),
    ('Mathematics', 2.9),
]

rdd = sc.parallelize(data)

# Step 1: Map to (major, (gpa, 1))
# Step 2: reduceByKey to sum GPAs and counts
# Step 3: Map to compute average
avg_gpa = rdd.map(lambda x: (x[0], (x[1], 1))) \\
             .reduceByKey(lambda a, b: (a[0] + b[0], a[1] + b[1])) \\
             .map(lambda x: (x[0], round(x[1][0] / x[1][1], 2))) \\
             .collect()

print("Average GPA per major:")
for major, avg in avg_gpa:
    print(f"  {major}: {avg:.2f}")
`})}),`
`,e.jsx(s,{children:e.jsx(n.p,{children:"RDDs are powerful but low-level — you work with raw tuples and lambdas. Spark introduced DataFrames to give you a higher-level, schema-aware API with built-in optimizations. Next, we'll compare DataFrames in PySpark and Pandas."})}),`
`,e.jsx(i,{question:"Which of these is a transformation, not an action?",options:["collect","filter","count","take"],correct:1})]})}function l(t={}){const{wrapper:n}={...r(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(a,{...t})}):a(t)}export{l as default};
