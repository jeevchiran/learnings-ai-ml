import{r as c,j as e,u as y,B as _,b as g,R as d,C as o,Q as T}from"./index-WYRBR6CI.js";import{P as j}from"./PredictReveal-DnF7AdIF.js";import{A as P,S as h,R as C}from"./ui-B8T98xz3.js";const u="#0891b2",w="#b45309";function M(){const[n,t]=c.useState(.4),[r,v]=c.useState(.7),[k,B]=c.useState(.28),q=Math.min(n,r),a=Math.min(k,q),l=n===0?0:a/n,i=r===0?0:l/r,A=a-n*r,p=l>.6&&i<1,m=({label:s,v:x,ref_:F,color:f})=>e.jsxs("div",{style:{marginBottom:"0.45rem"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"0.76rem",marginBottom:2},children:[e.jsx("span",{children:s}),e.jsx("span",{style:{fontFamily:"monospace",color:f},children:x.toFixed(3)})]}),e.jsxs("div",{style:{position:"relative",height:12,background:"var(--bg-hover)",borderRadius:6,overflow:"hidden"},children:[e.jsx("div",{style:{width:`${Math.min(100,x/(F*2)*100)}%`,height:"100%",background:f,transition:"width .15s"}}),e.jsx("div",{style:{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"var(--text-muted)"}})]})]});return e.jsx(P,{value:u,children:e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",gap:"1rem",flexWrap:"wrap",marginBottom:"0.7rem"},children:[e.jsx(h,{label:"support(A)",value:n,onChange:t,min:.05,max:1,step:.01,fmt:s=>s.toFixed(2),width:110}),e.jsx(h,{label:"support(B)",value:r,onChange:v,min:.05,max:1,step:.01,fmt:s=>s.toFixed(2),width:110}),e.jsx(h,{label:"support(A and B)",value:a,onChange:B,min:0,max:1,step:.01,fmt:s=>s.toFixed(2),width:120})]}),e.jsx(m,{label:"confidence — P(B given A)",v:l,ref_:.5,color:u}),e.jsx(m,{label:"lift — confidence over B's baseline",v:i,ref_:1,color:i<1?w:u}),e.jsx(C,{items:[["leverage",A.toFixed(3)],["verdict",i>1.05?"positive association":i<.95?"negative association":"independent"]]}),e.jsx("p",{style:{fontSize:"0.78rem",color:p?w:"var(--text-muted)",marginTop:"0.5rem",lineHeight:1.6},children:p?"Confidence looks strong and lift is below 1. B is simply common, so most baskets contain it whatever else is in them — buying A actually makes B less likely than average. This is the case a confidence threshold alone will always let through.":"The vertical tick on the lift bar marks 1, which is where the two items are independent. Raise the support of B on its own and watch confidence stay put while lift falls: confidence measures the rule, lift measures whether the rule beats doing nothing."})]})})}function b(n){const t={code:"code",div:"div",em:"em",h1:"h1",h2:"h2",hr:"hr",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...y(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.h1,{children:"Apriori in Practice & FP-Growth"}),`
`,e.jsx(_,{children:e.jsx(t.p,{children:"Modules 1 to 3 built the whole method by hand: the three metrics, the pruning property, and the rules that come out of it. This module hands the work to a library, and then replaces the algorithm entirely with one that never generates a candidate at all."})}),`
`,e.jsx(t.h2,{children:"Apriori in Real Code"}),`
`,e.jsxs(j,{prompt:"A library's Apriori function wants your transactions as a table of true and false values, one column per product. Why not just pass the lists of items?",options:["The library could accept lists, this is a style choice","Counting an itemset becomes a column-wise AND over a boolean matrix, which is enormously faster than searching lists"],correct:1,children:[e.jsxs(t.p,{children:["You will almost never hand-roll Apriori. ",e.jsx(t.code,{children:"mlxtend"})," implements the whole pipeline; your job is to shape the data and read the output. The input is a ",e.jsx(t.strong,{children:"one-hot matrix"}),": one row per transaction, one boolean column per item."]}),e.jsx(g,{language:"python",children:`import pandas as pd
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

print(rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']])`}),e.jsxs(t.p,{children:["The ",e.jsx(t.code,{children:"rules"})," DataFrame carries every metric from Module 3 as columns — ",e.jsx(t.code,{children:"support"}),", ",e.jsx(t.code,{children:"confidence"}),", ",e.jsx(t.code,{children:"lift"}),", ",e.jsx(t.code,{children:"leverage"}),", ",e.jsx(t.code,{children:"conviction"})," — so filtering and ranking is just pandas: ",e.jsx(t.code,{children:"rules[rules.lift > 1.1]"}),", ",e.jsx(t.code,{children:"rules.sort_values('conviction')"}),", and so on."]})]}),`
`,e.jsx(d,{items:[{q:"Why does the library want a one-hot boolean matrix rather than lists of items?",a:"Support counting reduces to a column-wise logical AND followed by a sum over rows, which vectorised array libraries execute far faster than repeatedly searching variable-length lists. The shape is one row per transaction and one boolean column per item."}]}),`
`,e.jsxs(o,{title:"Two knobs, two failure modes",children:[e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsxs(t.strong,{children:[e.jsx(t.code,{children:"min_support"})," too low"]})," → millions of itemsets, memory blows up, runtime explodes. Too high → rare-but-valuable niche patterns vanish."]}),`
`,e.jsxs(t.li,{children:[e.jsxs(t.strong,{children:[e.jsx(t.code,{children:"min_confidence"})," too low"]})," → a flood of weak rules. Too high → only the obvious ones survive."]}),`
`]}),e.jsxs(t.p,{children:["Start strict, loosen until you get a workable number of rules, then rank by ",e.jsx(t.strong,{children:"lift"})," or ",e.jsx(t.strong,{children:"conviction"})," — never by confidence alone."]})]}),`
`,e.jsx(t.div,{className:"lesson-visual",role:"region","aria-label":"Lift Confidence interactive example; scroll horizontally if needed",tabIndex:"0",children:e.jsx(M,{})}),`
`,e.jsx(t.h2,{children:"Why Apriori Gets Slow"}),`
`,e.jsx(t.p,{children:"Apriori's guarantee costs it two expensive habits:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Repeated database scans"})," — one full pass ",e.jsx(t.em,{children:"per level"}),". A frequent 5-itemset means at least five scans of the whole database."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Candidate explosion"})," — on dense data with a low ",e.jsx(t.code,{children:"min_support"}),", the candidate sets between scans still get enormous even after pruning."]}),`
`]}),`
`,e.jsx(t.h2,{children:"FP-Growth — Frequent Patterns Without Candidates"}),`
`,e.jsx(j,{prompt:"Apriori reads the entire database once per level, so finding a frequent five-item set means at least five full passes. Can the same frequent itemsets be found with only two passes?",options:["No, each level genuinely needs its own count","Yes — compress the whole database into a prefix tree once, then mine the tree instead of the data"],correct:1,children:e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"FP-Growth"})," (Han et al., 2000) fixes both by never generating candidate itemsets at all."]})}),`
`,e.jsx(d,{items:[{q:"How does FP-Growth avoid Apriori's repeated database scans?",a:"It reads the data twice: once to count items and discard the infrequent ones, and once to insert every transaction into a prefix tree where shared prefixes collapse onto shared paths. After that all mining happens on the tree, so no candidates are generated and the raw data is never scanned again."}]}),`
`,e.jsx(o,{title:"The FP-tree idea",children:e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Two scans, total."})," First scan counts items and drops infrequent ones. Second scan inserts each transaction — items sorted by descending frequency — into a prefix tree (the ",e.jsx(t.strong,{children:"FP-tree"}),"), so shared prefixes collapse onto shared paths."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Mine the tree recursively."})," For each item, follow its links to build a ",e.jsx(t.em,{children:"conditional"})," FP-tree of the patterns it appears in, and recurse. Frequent itemsets fall out of the tree structure — ",e.jsx(t.strong,{children:"no candidate generation, no per-level rescans."})]}),`
`]})}),`
`,e.jsx(t.p,{children:"Same frequent itemsets, usually far faster on large dense data. The swap is trivial in code — the tree lives entirely inside the call:"}),`
`,e.jsx(g,{language:"python",children:`from mlxtend.frequent_patterns import fpgrowth

# Identical output to apriori(...), typically faster on large/dense data
freq = fpgrowth(df, min_support=0.3, use_colnames=True)`}),`
`,e.jsxs(o,{title:"Which to reach for",children:[e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Apriori"})," — small/sparse data, or when you want the transparent level-by-level story for teaching or debugging."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"FP-Growth"})," — large or dense data where repeated scans dominate; same results, fewer passes."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Eclat"})," — a third option using a vertical (item → transaction-id set) layout and set intersections; strong on sparse data."]}),`
`]}),e.jsxs(t.p,{children:["All three find the ",e.jsx(t.em,{children:"same"})," frequent itemsets — they differ only in ",e.jsx(t.em,{children:"how they search"}),". Rule generation and the metrics of Module 3 are identical afterward."]})]}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(o,{title:"TL;DR",children:e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"mlxtend"})," pipeline: ",e.jsx(t.code,{children:"TransactionEncoder"})," → one-hot matrix → ",e.jsx(t.code,{children:"apriori()"})," → ",e.jsx(t.code,{children:"association_rules()"}),". Every metric from Module 3 arrives as a DataFrame column."]}),`
`,e.jsxs(t.li,{children:["Apriori's cost is structural: ",e.jsx(t.strong,{children:"one full database scan per level"}),", plus candidate blow-up on dense data."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"FP-Growth"})," removes both — two scans total, no candidates, by compressing transactions into a prefix tree and mining it recursively."]}),`
`,e.jsxs(t.li,{children:["Apriori, FP-Growth and Eclat all return the ",e.jsx(t.strong,{children:"identical"})," frequent itemsets. They differ only in how they search."]}),`
`,e.jsxs(t.li,{children:["Tuning order: start strict, loosen ",e.jsx(t.code,{children:"min_support"})," until the rule count is workable, then rank by lift or conviction — never by confidence."]}),`
`]})}),`
`,e.jsx(t.h2,{children:"Practice"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Problem 1 — Data shape."})," Why must transactions be one-hot encoded before ",e.jsx(t.code,{children:"apriori"}),"?"]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Solution:"})," ",e.jsx(t.code,{children:"apriori"})," expects a boolean matrix (transactions × items) so support is a fast column/row aggregation. ",e.jsx(t.code,{children:"TransactionEncoder"})," builds exactly that, one column per distinct item."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Problem 2 — Same results, different engine."})," You swap ",e.jsx(t.code,{children:"apriori"})," for ",e.jsx(t.code,{children:"fpgrowth"})," with the same ",e.jsx(t.code,{children:"min_support"}),". Do the frequent itemsets change?"]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Solution:"})," No — both return the identical frequent itemsets. Only the search strategy (and speed) differs; FP-Growth avoids candidate generation and repeated scans."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Problem 3 — Tuning."})," Your run returns 40,000 rules. What is the first knob to turn?"]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Solution:"})," Raise ",e.jsx(t.code,{children:"min_support"})," (fewer frequent itemsets → fewer rules), then raise ",e.jsx(t.code,{children:"min_confidence"}),"/lift thresholds and rank by lift or conviction."]}),`
`,e.jsx(d,{items:[{q:"Name Apriori's two structural costs and say which one FP-Growth attacks with the tree.",a:"Repeated database scans — one per level — and candidate explosion between levels. The FP-tree attacks both at once: transactions are compressed into a prefix tree in two scans, and mining reads patterns straight off the tree structure, so no candidates are ever enumerated."},{q:"Why do items get sorted by descending frequency before insertion into the FP-tree?",a:"So the most common items sit near the root and the greatest number of transactions share a prefix path. Maximum prefix sharing means maximum compression, which is exactly what makes mining the tree cheaper than scanning the raw data."},{q:"A colleague expects FP-Growth to surface rules Apriori missed. Correct them.",a:"It won't. Both are exact algorithms for the same problem — every itemset meeting min_support is returned by either. The choice is purely about speed and memory on your data shape, not about result quality."},{q:"You get 40,000 rules. Give the tuning sequence, in order.",a:"Raise min_support first — it cuts frequent itemsets at the root, and rule count grows combinatorially from them. Then raise min_confidence. Then filter to lift above 1 and sort by lift or conviction. Support first, because it is the only knob that reduces the work done, not just the output printed."}]}),`
`,e.jsx(T,{question:"What is the key advantage of FP-Growth over Apriori?",options:["It finds different, higher-quality itemsets that Apriori misses","It avoids generating candidate itemsets and needs only two database scans, so it is usually faster on large dense data","It does not require choosing a min_support threshold","It produces rules directly without a separate rule-generation step"],correct:1})]})}function G(n={}){const{wrapper:t}={...y(),...n.components};return t?e.jsx(t,{...n,children:e.jsx(b,{...n})}):b(n)}export{G as default};
