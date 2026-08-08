import{u as o,j as e,C as s,b as r,R as a,Q as l}from"./index-COnZx3Nm.js";function i(t){const n={code:"code",em:"em",h2:"h2",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...o(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(s,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"mlxtend"})," pipeline: ",e.jsx(n.code,{children:"TransactionEncoder"})," → one-hot matrix → ",e.jsx(n.code,{children:"apriori()"})," → ",e.jsx(n.code,{children:"association_rules()"}),". Every metric from Module 3 arrives as a DataFrame column."]}),`
`,e.jsxs(n.li,{children:["Apriori's cost is structural: ",e.jsx(n.strong,{children:"one full database scan per level"}),", plus candidate blow-up on dense data."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"FP-Growth"})," removes both — two scans total, no candidates, by compressing transactions into a prefix tree and mining it recursively."]}),`
`,e.jsxs(n.li,{children:["Apriori, FP-Growth and Eclat all return the ",e.jsx(n.strong,{children:"identical"})," frequent itemsets. They differ only in how they search."]}),`
`,e.jsxs(n.li,{children:["Tuning order: start strict, loosen ",e.jsx(n.code,{children:"min_support"})," until the rule count is workable, then rank by lift or conviction — never by confidence."]}),`
`]})}),`
`,e.jsx(n.h2,{children:"Apriori in Real Code"}),`
`,e.jsxs(n.p,{children:["You will almost never hand-roll Apriori. ",e.jsx(n.code,{children:"mlxtend"})," implements the whole pipeline; your job is to shape the data and read the output. The input is a ",e.jsx(n.strong,{children:"one-hot matrix"}),": one row per transaction, one boolean column per item."]}),`
`,e.jsx(r,{language:"python",children:`import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules

# Same 10-basket grocery database from Module 1
dataset = [
  ['Bread', 'Milk'],
  ['Bread', 'Diaper', 'Beer', 'Eggs'],
  ['Milk', 'Diaper', 'Beer', 'Cola'],
  ['Bread', 'Milk', 'Diaper', 'Beer'],
  ['Bread', 'Milk', 'Diaper', 'Cola'],
  ['Milk', 'Diaper', 'Beer'],
  ['Bread', 'Beer'],
  ['Bread', 'Milk', 'Diaper'],
  ['Milk', 'Beer'],
  ['Bread', 'Milk', 'Diaper', 'Beer'],
]

# 1. One-hot encode: shape (10 transactions, 6 items), all bool
te = TransactionEncoder()
onehot = te.fit(dataset).transform(dataset)
df = pd.DataFrame(onehot, columns=te.columns_)   # columns: Beer, Bread, Cola, Diaper, Eggs, Milk

# 2. Frequent itemsets, min_support = 0.3 (>= 3 of 10 baskets)
freq = apriori(df, min_support=0.3, use_colnames=True)

# 3. Rules with confidence >= 0.6, then rank by lift
rules = association_rules(freq, metric='confidence', min_threshold=0.6)
rules = rules.sort_values('lift', ascending=False)

print(rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']])`}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.code,{children:"rules"})," DataFrame carries every metric from Module 3 as columns — ",e.jsx(n.code,{children:"support"}),", ",e.jsx(n.code,{children:"confidence"}),", ",e.jsx(n.code,{children:"lift"}),", ",e.jsx(n.code,{children:"leverage"}),", ",e.jsx(n.code,{children:"conviction"})," — so filtering and ranking is just pandas: ",e.jsx(n.code,{children:"rules[rules.lift > 1.1]"}),", ",e.jsx(n.code,{children:"rules.sort_values('conviction')"}),", and so on."]}),`
`,e.jsxs(s,{title:"Two knobs, two failure modes",children:[e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"min_support"})," too low"]})," → millions of itemsets, memory blows up, runtime explodes. Too high → rare-but-valuable niche patterns vanish."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"min_confidence"})," too low"]})," → a flood of weak rules. Too high → only the obvious ones survive."]}),`
`]}),e.jsxs(n.p,{children:["Start strict, loosen until you get a workable number of rules, then rank by ",e.jsx(n.strong,{children:"lift"})," or ",e.jsx(n.strong,{children:"conviction"})," — never by confidence alone."]})]}),`
`,e.jsx(n.h2,{children:"Why Apriori Gets Slow"}),`
`,e.jsx(n.p,{children:"Apriori's guarantee costs it two expensive habits:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Repeated database scans"})," — one full pass ",e.jsx(n.em,{children:"per level"}),". A frequent 5-itemset means at least five scans of the whole database."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Candidate explosion"})," — on dense data with a low ",e.jsx(n.code,{children:"min_support"}),", the candidate sets between scans still get enormous even after pruning."]}),`
`]}),`
`,e.jsx(n.h2,{children:"FP-Growth — Frequent Patterns Without Candidates"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"FP-Growth"})," (Han et al., 2000) fixes both by never generating candidate itemsets at all."]}),`
`,e.jsx(s,{title:"The FP-tree idea",children:e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Two scans, total."})," First scan counts items and drops infrequent ones. Second scan inserts each transaction — items sorted by descending frequency — into a prefix tree (the ",e.jsx(n.strong,{children:"FP-tree"}),"), so shared prefixes collapse onto shared paths."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Mine the tree recursively."})," For each item, follow its links to build a ",e.jsx(n.em,{children:"conditional"})," FP-tree of the patterns it appears in, and recurse. Frequent itemsets fall out of the tree structure — ",e.jsx(n.strong,{children:"no candidate generation, no per-level rescans."})]}),`
`]})}),`
`,e.jsx(n.p,{children:"Same frequent itemsets, usually far faster on large dense data. The swap is trivial in code — the tree lives entirely inside the call:"}),`
`,e.jsx(r,{language:"python",children:`from mlxtend.frequent_patterns import fpgrowth

# Identical output to apriori(...), typically faster on large/dense data
freq = fpgrowth(df, min_support=0.3, use_colnames=True)`}),`
`,e.jsxs(s,{title:"Which to reach for",children:[e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Apriori"})," — small/sparse data, or when you want the transparent level-by-level story for teaching or debugging."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"FP-Growth"})," — large or dense data where repeated scans dominate; same results, fewer passes."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Eclat"})," — a third option using a vertical (item → transaction-id set) layout and set intersections; strong on sparse data."]}),`
`]}),e.jsxs(n.p,{children:["All three find the ",e.jsx(n.em,{children:"same"})," frequent itemsets — they differ only in ",e.jsx(n.em,{children:"how they search"}),". Rule generation and the metrics of Module 3 are identical afterward."]})]}),`
`,e.jsx(n.h2,{children:"Practice"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Problem 1 — Data shape."})," Why must transactions be one-hot encoded before ",e.jsx(n.code,{children:"apriori"}),"?"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," ",e.jsx(n.code,{children:"apriori"})," expects a boolean matrix (transactions × items) so support is a fast column/row aggregation. ",e.jsx(n.code,{children:"TransactionEncoder"})," builds exactly that, one column per distinct item."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Problem 2 — Same results, different engine."})," You swap ",e.jsx(n.code,{children:"apriori"})," for ",e.jsx(n.code,{children:"fpgrowth"})," with the same ",e.jsx(n.code,{children:"min_support"}),". Do the frequent itemsets change?"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," No — both return the identical frequent itemsets. Only the search strategy (and speed) differs; FP-Growth avoids candidate generation and repeated scans."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Problem 3 — Tuning."})," Your run returns 40,000 rules. What is the first knob to turn?"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," Raise ",e.jsx(n.code,{children:"min_support"})," (fewer frequent itemsets → fewer rules), then raise ",e.jsx(n.code,{children:"min_confidence"}),"/lift thresholds and rank by lift or conviction."]}),`
`,e.jsx(a,{items:[{q:"Name Apriori's two structural costs and say which one FP-Growth attacks with the tree.",a:"Repeated database scans — one per level — and candidate explosion between levels. The FP-tree attacks both at once: transactions are compressed into a prefix tree in two scans, and mining reads patterns straight off the tree structure, so no candidates are ever enumerated."},{q:"Why do items get sorted by descending frequency before insertion into the FP-tree?",a:"So the most common items sit near the root and the greatest number of transactions share a prefix path. Maximum prefix sharing means maximum compression, which is exactly what makes mining the tree cheaper than scanning the raw data."},{q:"A colleague expects FP-Growth to surface rules Apriori missed. Correct them.",a:"It won't. Both are exact algorithms for the same problem — every itemset meeting min_support is returned by either. The choice is purely about speed and memory on your data shape, not about result quality."},{q:"You get 40,000 rules. Give the tuning sequence, in order.",a:"Raise min_support first — it cuts frequent itemsets at the root, and rule count grows combinatorially from them. Then raise min_confidence. Then filter to lift above 1 and sort by lift or conviction. Support first, because it is the only knob that reduces the work done, not just the output printed."}]}),`
`,e.jsx(l,{question:"What is the key advantage of FP-Growth over Apriori?",options:["It finds different, higher-quality itemsets that Apriori misses","It avoids generating candidate itemsets and needs only two database scans, so it is usually faster on large dense data","It does not require choosing a min_support threshold","It produces rules directly without a separate rule-generation step"],correct:1})]})}function d(t={}){const{wrapper:n}={...o(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}export{d as default};
