import{u as i,j as e,C as n,B as r,R as o,Q as l}from"./index-Ba5-wm3B.js";import{S as h}from"./SplitLeakageWidget-UHlof_SD.js";import"./recsysUtils-DhJNCk3B.js";function a(s){const t={annotation:"annotation",code:"code",em:"em",h2:"h2",li:"li",math:"math",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",ul:"ul",...i(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n,{title:"TL;DR — Part 2 starts here",children:[e.jsxs(t.p,{children:[`Part 1 explained the ideas. Part 2 builds the pipeline, in the order you would actually write it:
`,e.jsx(t.strong,{children:"data → metrics → baselines → model → features → ranker."})]}),e.jsxs(t.p,{children:["Build the ",e.jsx(t.em,{children:"scoreboard"})," before the model. A model you cannot score is a model you cannot improve, and every hour spent on architecture before the harness exists is an hour you cannot audit."]}),e.jsx(t.p,{children:"This module: load the events, split them by time, and write the assertions that stop a leak from ever reaching the model."})]}),`
`,e.jsx(t.h2,{children:"Step 1 — the event frame"}),`
`,e.jsx(t.p,{children:"One tidy DataFrame. Everything downstream reads this shape and nothing else."}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`import numpy as np, pandas as pd

EVENT_WEIGHT = {"view": 1, "cart": 3, "purchase": 10}
CUTOFF = pd.Timestamp("2026-03-24")

events = pd.read_parquet("novacart_events.parquet")   # user_id, item_id, event_type, event_ts
events["weight"] = events["event_type"].map(EVENT_WEIGHT)

ITEMS = sorted(catalog.item_id.unique())     # the FULL catalog, not just interacted items
USERS = sorted(events.user_id.unique())
`})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"ITEMS"})," comes from the ",e.jsx(t.strong,{children:"catalog"}),", not from ",e.jsx(t.code,{children:"events"}),". Derive it from the event log and you silently delete every cold item — including the ones your cold-start work in module 12 exists to serve. This one line decides whether your evaluation can even see the problem."]}),`
`,e.jsx(t.h2,{children:"Step 2 — split by time, and prove it"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`def temporal_split(events, cutoff):
    train = events[events.event_ts <  cutoff].copy()
    test  = events[events.event_ts >= cutoff].copy()
    return train, test

train, test = temporal_split(events, CUTOFF)

# The assertion that makes the split trustworthy. Run it every time.
assert train.event_ts.max() < test.event_ts.min(), "temporal split leaks"
`})}),`
`,e.jsxs(t.p,{children:["That ",e.jsx(t.code,{children:"assert"}),' is three seconds of runtime and it is the highest-value line in the pipeline. It fails loudly the day someone "just adds a few more events" to training.']}),`
`,e.jsx(h,{}),`
`,e.jsx(t.h2,{children:"Step 3 — build the held-out targets"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`targets = (test.sort_values("event_ts")
               .groupby("user_id")["item_id"]
               .last()
               .to_dict())
# {'U1':'P1', 'U2':'P4', 'U3':'P8', 'U4':'P7', 'U5':'P5', 'U6':'P1'}
`})}),`
`,e.jsxs(t.p,{children:["One held-out item per shopper — their next purchase after the cut-off. This makes ",e.jsxs(t.span,{className:"katex",children:[e.jsx(t.span,{className:"katex-mathml",children:e.jsx(t.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(t.semantics,{children:[e.jsxs(t.mrow,{children:[e.jsx(t.mi,{mathvariant:"normal",children:"∣"}),e.jsx(t.mi,{children:"R"}),e.jsx(t.mi,{mathvariant:"normal",children:"∣"}),e.jsx(t.mo,{children:"="}),e.jsx(t.mn,{children:"1"})]}),e.jsx(t.annotation,{encoding:"application/x-tex",children:"|R|=1"})]})})}),e.jsxs(t.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(t.span,{className:"base",children:[e.jsx(t.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(t.span,{className:"mord",children:"∣"}),e.jsx(t.span,{className:"mord mathnormal",style:{marginRight:"0.0077em"},children:"R"}),e.jsx(t.span,{className:"mord",children:"∣"}),e.jsx(t.span,{className:"mspace",style:{marginRight:"0.2778em"}}),e.jsx(t.span,{className:"mrel",children:"="}),e.jsx(t.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),e.jsxs(t.span,{className:"base",children:[e.jsx(t.span,{className:"strut",style:{height:"0.6444em"}}),e.jsx(t.span,{className:"mord",children:"1"})]})]})]})," per user, which (module 4) means NDCG collapses to a smoothed MRR. Fine for a first harness, and worth knowing so you do not later report both as if they were independent evidence."]}),`
`,e.jsx(t.h2,{children:"Step 4 — a validation window, so the test set stays clean"}),`
`,e.jsxs(t.p,{children:["You will tune ",e.jsxs(t.span,{className:"katex",children:[e.jsx(t.span,{className:"katex-mathml",children:e.jsx(t.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(t.semantics,{children:[e.jsx(t.mrow,{children:e.jsx(t.mi,{children:"k"})}),e.jsx(t.annotation,{encoding:"application/x-tex",children:"k"})]})})}),e.jsx(t.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(t.span,{className:"base",children:[e.jsx(t.span,{className:"strut",style:{height:"0.6944em"}}),e.jsx(t.span,{className:"mord mathnormal",style:{marginRight:"0.0315em"},children:"k"})]})})]}),", ",e.jsxs(t.span,{className:"katex",children:[e.jsx(t.span,{className:"katex-mathml",children:e.jsx(t.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(t.semantics,{children:[e.jsx(t.mrow,{children:e.jsx(t.mi,{children:"α"})}),e.jsx(t.annotation,{encoding:"application/x-tex",children:"\\alpha"})]})})}),e.jsx(t.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(t.span,{className:"base",children:[e.jsx(t.span,{className:"strut",style:{height:"0.4306em"}}),e.jsx(t.span,{className:"mord mathnormal",style:{marginRight:"0.0037em"},children:"α"})]})})]}),", ",e.jsxs(t.span,{className:"katex",children:[e.jsx(t.span,{className:"katex-mathml",children:e.jsx(t.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(t.semantics,{children:[e.jsx(t.mrow,{children:e.jsx(t.mi,{children:"λ"})}),e.jsx(t.annotation,{encoding:"application/x-tex",children:"\\lambda"})]})})}),e.jsx(t.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(t.span,{className:"base",children:[e.jsx(t.span,{className:"strut",style:{height:"0.6944em"}}),e.jsx(t.span,{className:"mord mathnormal",children:"λ"})]})})]})," and the negative-sampling rate. Tune them on the test set fifty times and the test set is a training set."]}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`TRAIN_END = pd.Timestamp("2026-03-21")   # train:  days 1–20
VALID_END = pd.Timestamp("2026-03-24")   # valid:  days 21–23   ← tune here
                                         # test:   days 24+     ← touch once

tr    = events[events.event_ts <  TRAIN_END]
valid = events[(events.event_ts >= TRAIN_END) & (events.event_ts < VALID_END)]
test  = events[events.event_ts >= VALID_END]
`})}),`
`,e.jsxs(t.p,{children:["Three windows, chronological, no overlap. Tune on ",e.jsx(t.code,{children:"valid"}),", report on ",e.jsx(t.code,{children:"test"}),", and report on ",e.jsx(t.code,{children:"test"})," ",e.jsx(t.strong,{children:"once"})," — at the end."]}),`
`,e.jsxs(t.p,{children:["Run this on NovaCart and ",e.jsx(t.code,{children:"valid"})," comes back ",e.jsx(t.strong,{children:"empty"})," — days 21–23 happen to contain no events, so the split is 34 / 0 / 6. That is a property of a 40-event teaching set, and it is worth seeing: a validation window is only useful if enough traffic falls inside it. On a real store, size the window by ",e.jsx(t.em,{children:"volume"})," (enough users to make the metric stable), not by a round number of days, and assert it is non-empty before you tune against it."]}),`
`,e.jsx(t.h2,{children:"Step 5 — the sanity checks worth writing down"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`def audit(train, test, targets, items):
    print(f"train {len(train):>6}  test {len(test):>6}")
    print(f"users train {train.user_id.nunique()}  test {test.user_id.nunique()}")
    print(f"catalog {len(items)}  cold items {len(set(items) - set(train.item_id))}")
    print(f"cold users {len(set(test.user_id) - set(train.user_id))}")
    print(f"density {len(train.drop_duplicates(['user_id','item_id'])) / (train.user_id.nunique()*len(items)):.4f}")
    assert train.event_ts.max() < test.event_ts.min()
    assert set(targets) <= set(test.user_id)
    assert not train.duplicated(["user_id","item_id","event_type","event_ts"]).any()

audit(train, test, targets, ITEMS)
# train     34  test      6
# catalog 9  cold items 1        ← P9 has zero training interactions
# cold users 0
# density 0.4259
`})}),`
`,e.jsx(t.p,{children:"Each line answers a question you will otherwise ask at 2am:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Cold items"})," — how much of the catalog no behavioural model can rank at all."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Cold users"})," — the fraction of test traffic that needs a fallback path. If you silently drop them, your metric describes a population you do not serve."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Density"})," — NovaCart's 0.43 is absurdly high because it is a teaching set. Real e-commerce runs 0.0001 to 0.001, and that is the number that decides whether CF has anything to work with."]}),`
`]}),`
`,e.jsxs(n,{title:"Common confusion — 'the split is chronological, so I am done'",children:[e.jsxs(t.p,{children:["The split governs ",e.jsx(t.strong,{children:"events"}),". It says nothing about ",e.jsx(t.strong,{children:"features"}),", which get computed later and are the more common leak (module 10, and b5 next). It also says nothing about anything you fit before splitting — scalers, encoders, popularity tables, item embeddings."]}),e.jsx(t.p,{children:"A useful habit: treat the cut-off as a wall the pipeline may never look over, and audit each artefact separately for whether it does. The split assert covers events. You will need a different assert for features."})]}),`
`,e.jsx(r,{children:e.jsx(t.p,{children:"The data is trustworthy. Next: the harness that turns a ranking into a number."})}),`
`,e.jsx(o,{items:[{q:"Why derive ITEMS from the catalog table rather than from the event log?",a:"Items with zero interactions do not appear in the event log, so deriving the catalog from events silently deletes exactly the cold items. Your coverage metric then has a shrunken denominator and your evaluation cannot see the cold-start problem at all — the thing several later modules exist to solve."},{q:"What does `assert train.event_ts.max() < test.event_ts.min()` actually protect against?",a:"Any future change that widens the training window past the cut-off — usually someone adding 'a bit more data'. It is cheap, runs every time, and converts a silent metric inflation into a loud failure. It does not protect against feature leakage, which needs a separate check."},{q:"Why carve out a validation window instead of tuning on the test set?",a:"Each tuning decision made against the test set transfers a little test information into the model. Over dozens of trials the test score becomes an optimistic training score. A chronologically earlier validation window lets you tune freely and keeps the test window for a single final measurement."},{q:"NovaCart's density is 0.43 and real stores run 0.001 or lower. What does that change in practice?",a:"At real densities most item pairs share zero users, so most CF similarities are exactly 0 and the usable signal concentrates in the head of the catalog. It is why low-rank factorisation (which shares statistical strength across items) beats raw neighbourhood counts at scale, and why minimum-support thresholds matter."}]}),`
`,e.jsx(l,{question:"Your audit prints `cold users 0` on the NovaCart data. Why should you NOT expect that number in production?",options:["It is a bug — cold users are impossible by construction","Real traffic always contains shoppers with no training history; a harness reporting zero cold users is measuring an easier population than the one you serve","Cold users only exist if the catalog is also cold","It means the temporal split was done incorrectly"],correct:1})]})}function p(s={}){const{wrapper:t}={...i(),...s.components};return t?e.jsx(t,{...s,children:e.jsx(a,{...s})}):a(s)}export{p as default};
