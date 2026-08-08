import{r as h,j as e,u as d,C as p,B as u,R as m,Q as x}from"./index-COnZx3Nm.js";const r="#f59e0b",l="#16a34a",j=[{op:'textFile("logs")',kind:"source"},{op:".filter(is_error)",kind:"transform"},{op:".map(parse_line)",kind:"transform"},{op:".filter(recent)",kind:"transform"},{op:".count()",kind:"action"}];function g(){const[t,n]=h.useState(!1);return e.jsxs("div",{children:[e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:6},children:j.map((s,i)=>{const a=s.kind==="action",o=t;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.6rem"},children:[e.jsx("span",{style:{width:22,textAlign:"right",fontSize:"0.7rem",color:"var(--text-muted)"},children:i+1}),e.jsx("code",{style:{flex:1,padding:"0.35rem 0.6rem",borderRadius:5,fontSize:"0.82rem",border:`1.5px solid ${a?r:"var(--border)"}`,background:o?`${l}18`:a?`${r}18`:"var(--bg-hover)",color:"var(--text)"},children:s.op}),e.jsxs("span",{style:{width:96,fontSize:"0.72rem",color:a?r:"var(--text-muted)"},children:[a?"ACTION":"transform (lazy)",o&&!a&&e.jsx("span",{style:{color:l},children:" ✓"})]})]},i)})}),e.jsxs("div",{style:{display:"flex",gap:"0.6rem",marginTop:"0.8rem",alignItems:"center"},children:[e.jsx("button",{onClick:()=>n(!0),disabled:t,style:{padding:"0.35rem 0.9rem",borderRadius:5,border:"none",cursor:t?"default":"pointer",background:t?"var(--border)":r,color:"#fff",fontWeight:600,fontSize:"0.82rem"},children:t?"Executed ✓":"Trigger .count()"}),t&&e.jsx("button",{onClick:()=>n(!1),style:{padding:"0.35rem 0.7rem",borderRadius:5,border:"1px solid var(--border)",background:"var(--bg)",color:"var(--text)",cursor:"pointer",fontSize:"0.8rem"},children:"Reset"})]}),e.jsx("div",{style:{marginTop:"0.7rem",background:"var(--bg-hover)",borderLeft:`3px solid ${r}`,padding:"0.5rem 0.8rem",borderRadius:"0 4px 4px 0",fontSize:"0.82rem"},children:t?e.jsx(e.Fragment,{children:"The action fired the whole DAG at once — Spark fused the three transforms into one pass over the data (no intermediate copies written)."}):e.jsxs(e.Fragment,{children:["The transforms only ",e.jsx("em",{children:"record"})," a plan — nothing has run yet. Spark waits for an ",e.jsx("strong",{style:{color:r},children:"action"})," (count, collect, save), then optimizes and executes the entire chain."]})})]})}function c(t){const n={code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...d(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(p,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["The name is the definition. ",e.jsx(n.strong,{children:"R"}),"esilient = rebuildable from lineage; ",e.jsx(n.strong,{children:"D"}),"istributed = partitioned across nodes; ",e.jsx(n.strong,{children:"D"}),"ataset = just a collection of elements."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Immutability is what makes resilience possible."})," Because every transformation returns a new RDD and the source is unchanged, a lost partition can be recomputed by replaying its lineage."]}),`
`,e.jsxs(n.li,{children:["That's fault tolerance without replication — Spark stores the ",e.jsx(n.em,{children:"recipe"}),", not a backup copy."]}),`
`,e.jsx(n.li,{children:"RDDs are the low-level API: raw tuples and lambdas, no schema, no Catalyst optimisation. DataFrames exist because of that gap."}),`
`]})}),`
`,e.jsx(n.p,{children:"In Module 2, we saw how Spark keeps data in memory and uses lazy evaluation with DAGs. Now we'll look at the data structure that makes this possible: the RDD."}),`
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
`,e.jsx(g,{}),`
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
`,e.jsx(u,{children:e.jsx(n.p,{children:"RDDs are powerful but low-level — you work with raw tuples and lambdas. Spark introduced DataFrames to give you a higher-level, schema-aware API with built-in optimizations. Next, we'll compare DataFrames in PySpark and Pandas."})}),`
`,e.jsx(m,{items:[{q:"Unpack R-D-D, one clause each.",a:"Resilient: a lost partition is rebuilt by replaying the recorded lineage of transformations. Distributed: the data is split into partitions across cluster nodes, each processed in parallel. Dataset: underneath it is simply a collection of elements — tuples, numbers, arbitrary Python objects."},{q:"Why does immutability enable fault tolerance rather than merely being good hygiene?",a:"Because recovery works by REPLAYING the transformations from the original source. If an RDD could be modified in place, the inputs a step depended on might no longer exist in their original form, and replaying would produce a different result. Immutability guarantees the recipe still reproduces exactly what was lost."},{q:"A node dies mid-job. What does Spark do, and what does it NOT need?",a:"It identifies which partitions lived on that node and recomputes only those by re-running their lineage from the source. It does not need a replicated copy of the data — the lineage graph substitutes for replication, which is why Spark's fault tolerance costs storage nothing."},{q:"Why did DataFrames get added when RDDs already worked?",a:"RDDs carry no schema, so Spark sees opaque Python objects and lambdas it cannot reason about — no column pruning, no predicate pushdown, no code generation. DataFrames expose named typed columns, which lets Catalyst optimise the plan and Tungsten generate efficient code. You give up arbitrary object flexibility and get large speedups."}]}),`
`,e.jsx(x,{question:"Which of these is a transformation, not an action?",options:["collect","filter","count","take"],correct:1})]})}function y(t={}){const{wrapper:n}={...d(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(c,{...t})}):c(t)}export{y as default};
