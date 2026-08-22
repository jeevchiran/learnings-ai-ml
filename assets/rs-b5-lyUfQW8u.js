import{u as i,j as e,C as s,B as r,R as o,Q as l}from"./index-Ba5-wm3B.js";import{F as d}from"./FeatureWindowWidget-DB3qg_Kk.js";import"./recsysUtils-DhJNCk3B.js";function a(t){const n={code:"code",em:"em",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...i(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(s,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Every feature is an ",e.jsx(n.strong,{children:"as-of join"}),": aggregate events with ",e.jsx(n.code,{children:"event_ts < row.as_of"}),", bounded below by a window."]}),`
`,e.jsxs(n.li,{children:["The label row carries an ",e.jsx(n.code,{children:"as_of"})," timestamp. Everything is computed relative to it. No exceptions."]}),`
`,e.jsxs(n.li,{children:["The leak check is one assertion: point-in-time features must see ",e.jsx(n.strong,{children:"strictly fewer"})," events than a whole-log aggregate."]}),`
`,e.jsxs(n.li,{children:["Build user, item and ",e.jsx(n.strong,{children:"user×item"})," features. The last family is the ranker's only real advantage over retrieval."]}),`
`]})}),`
`,e.jsx(n.h2,{children:"The shape of a training row"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`labels = pd.DataFrame({
    "user_id": ["U2"],
    "item_id": ["P4"],
    "as_of":   [pd.Timestamp("2026-03-08")],   # when the decision was made
    "label":   [1],
})
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"as_of"}),' is the timestamp of the impression or decision being modelled — not "now", not the end of the training window. Every feature attached to this row must be computable from events strictly before it.']}),`
`,e.jsx(n.h2,{children:"User features, as-of"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`def as_of_user_features(labels, events, windows=(1, 7, 30)):
    out = labels.copy()
    for w in windows:
        counts = []
        for r in labels.itertuples():
            lo = r.as_of - pd.Timedelta(days=w)
            mask = ((events.user_id == r.user_id)
                    & (events.event_ts <  r.as_of)      # STRICT — not <=
                    & (events.event_ts >= lo))          # bounded window
            counts.append(int(mask.sum()))
        out[f"u_events_{w}d"] = counts
    out["u_burst"] = out["u_events_1d"] / (out["u_events_7d"] / 7 + 1)
    return out
`})}),`
`,e.jsxs(n.p,{children:["The row-at-a-time loop is honest and slow — fine for teaching, fatal at scale. The vectorised equivalent is ",e.jsx(n.code,{children:"pd.merge_asof"}),", which is built precisely for this:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# scalable version: sort both sides, merge backwards in time
rolling = (events.set_index("event_ts")
                 .groupby("user_id")["weight"]
                 .rolling("30D").count()
                 .reset_index(name="u_events_30d"))

feats = pd.merge_asof(
    labels.sort_values("as_of"),
    rolling.sort_values("event_ts"),
    left_on="as_of", right_on="event_ts", by="user_id",
    direction="backward", allow_exact_matches=False,   # ← this flag IS the strict <
)
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"allow_exact_matches=False"})," is the ",e.jsx(n.code,{children:"<"})," from module 10. Leave it at its default ",e.jsx(n.code,{children:"True"})," and an event sharing a timestamp with the label enters its own feature window. One keyword argument, one silent leak."]}),`
`,e.jsx(n.h2,{children:"User × item features — the ranker's edge"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`def as_of_pair_features(labels, events):
    out = labels.copy()
    views, carts, days_since = [], [], []
    for r in labels.itertuples():
        h = events[(events.user_id == r.user_id)
                   & (events.item_id == r.item_id)
                   & (events.event_ts < r.as_of)]
        views.append(int((h.event_type == "view").sum()))
        carts.append(int((h.event_type == "cart").sum()))
        days_since.append((r.as_of - h.event_ts.max()).days if len(h) else 999)
    out["ui_views"], out["ui_carts"], out["ui_days_since"] = views, carts, days_since
    return out
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"999"}),' as the "never interacted" sentinel works for tree models, which will split on it. It would be poison for a linear model or a neural net, where it distorts every scale — use a separate ',e.jsx(n.code,{children:"ui_never_seen"})," boolean there instead."]}),`
`,e.jsx(n.h2,{children:"Running it, and the leak check"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`f = as_of_pair_features(as_of_user_features(labels, events), events)
print(f[["user_id","item_id","as_of","u_events_1d","u_events_7d","u_events_30d",
         "u_burst","ui_views","ui_carts","ui_days_since"]].to_string(index=False))
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-text",children:`user_id item_id      as_of  u_events_1d  u_events_7d  u_events_30d  u_burst  ui_views  ui_carts  ui_days_since
     U2      P4 2026-03-08            1            4             4    0.636         1         0              1
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`whole_log = int((events.user_id == "U2").sum())          # 8
point_in_time = int(f.u_events_30d.iloc[0])              # 4
assert point_in_time < whole_log, "features are reading the future"
`})}),`
`,e.jsxs(n.p,{children:["Bhavna has 8 events in total; only 4 happened before day 8. ",e.jsx(n.strong,{children:"That gap is the leak"}),", and this assertion is the feature-side counterpart to b1's split assertion. Write one per feature family, run them in CI, and the most expensive bug in recommender systems becomes a failing test instead of a flat A/B result."]}),`
`,e.jsx(d,{}),`
`,e.jsx(n.h2,{children:"Item features need a historical snapshot"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# WRONG — today's catalog values pasted onto year-old rows
feats = labels.merge(catalog[["item_id", "price", "return_rate"]], on="item_id")

# RIGHT — as-of join against a versioned snapshot table
feats = pd.merge_asof(
    labels.sort_values("as_of"),
    catalog_history.sort_values("valid_from"),      # item_id, price, return_rate, valid_from
    left_on="as_of", right_on="valid_from", by="item_id",
    direction="backward",
)
`})}),`
`,e.jsxs(n.p,{children:["The catalog table has no history unless you built it one. ",e.jsx(n.code,{children:"price"})," today is not the price at the moment of a decision six months ago, and ",e.jsx(n.code,{children:"return_rate"})," today includes returns that had not happened yet. Keeping a slowly-changing-dimension table is unglamorous infrastructure that decides whether your item features are usable at all."]}),`
`,e.jsxs(s,{title:"Training/serving skew — the same value, twice",children:[e.jsxs(n.p,{children:["Every offline feature needs an online counterpart producing ",e.jsx(n.strong,{children:"the identical value"}),". Two implementations of ",e.jsx(n.code,{children:"u_events_30d"})," — one Spark, one Redis — will disagree, and the model was trained on only one of them."]}),e.jsx(n.p,{children:"The three real defences, in ascending cost and effectiveness:"}),e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"One definition, two runtimes."})," Write the feature once in a shared library; the batch job and the serving path both call it."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Log the features you served."})," Then train on ",e.jsx(n.em,{children:"those"})," rows next time. The distributions match by construction because they are the same rows."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"A feature store."})," Feast, Tecton and friends exist for exactly this: one definition, offline point-in-time joins and online lookups from the same registry."]}),`
`]}),e.jsx(n.p,{children:"Option 2 is underrated. It costs a logging change, needs no new infrastructure, and eliminates the skew entirely for everything after the first model."})]}),`
`,e.jsx(r,{children:e.jsx(n.p,{children:"Features, labels and negatives — everything a ranker needs. Last module: train one and see what it actually learns."})}),`
`,e.jsx(o,{items:[{q:"What does `allow_exact_matches=False` in `pd.merge_asof` correspond to, and what happens if you forget it?",a:"It is the strict `<` in the as-of join. Left at the default True, an event sharing a timestamp with the label row is included in that row's own feature window — so the feature contains the interaction being predicted. Offline metrics soar, production is flat, and nothing in the model code looks wrong."},{q:"Why does joining today's catalog table onto historical label rows leak?",a:"Catalog columns like price and return_rate are current values; attaching them to a row from six months ago gives that row knowledge of things that had not happened yet — returns, repricing. Fixing it needs a versioned snapshot (slowly-changing-dimension) table and an as-of join on valid_from, not a plain merge."},{q:"999 as a 'never interacted' sentinel is fine for trees and poison for neural nets. Why the difference?",a:"Trees split on thresholds, so 999 simply becomes its own branch and the magnitude is irrelevant. Linear and neural models multiply the value by a weight, so a 999 among values of 0–30 dominates the scale, wrecks normalisation and produces huge gradients. There, use a separate boolean flag plus a neutral fill."},{q:"Why is 'log the features you served, then train on those rows' such a strong defence against training/serving skew?",a:"It removes the possibility of two implementations disagreeing: the training rows ARE the serving rows, so the distributions match by construction. It costs only a logging change rather than new infrastructure, and it fixes skew for every model after the first."}]}),`
`,e.jsx(l,{question:"Your point-in-time features return exactly the same values as the naive whole-log aggregate for every row in a test batch. What should you conclude?",options:["The pipeline is correct — the two agree, so there is no leak","Nothing yet: agreement means those specific rows have no events after their as_of. Check rows whose as_of is early in the window, where the two must diverge","The as-of join is redundant and can be removed","The window is too narrow and should be widened"],correct:1})]})}function f(t={}){const{wrapper:n}={...i(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(a,{...t})}):a(t)}export{f as default};
