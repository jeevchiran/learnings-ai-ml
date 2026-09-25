import{u as r,j as e,R as s,C as a,B as o,Q as l}from"./index-WYRBR6CI.js";import{P as d}from"./PredictReveal-DnF7AdIF.js";import{F as h}from"./FeatureWindowWidget-DjkeEvPS.js";import"./recsysUtils-DhJNCk3B.js";function i(n){const t={code:"code",div:"div",em:"em",h1:"h1",h2:"h2",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.h1,{children:"Build — Feature Generation"}),`
`,e.jsx(t.h2,{children:"The shape of a training row"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`labels = pd.DataFrame({
    "user_id": ["U2"],
    "item_id": ["P4"],
    "as_of":   [pd.Timestamp("2026-03-08")],   # when the decision was made
    "label":   [1],
})
`})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"as_of"}),' is the timestamp of the impression or decision being modelled — not "now", not the end of the training window. Every feature attached to this row must be computable from events strictly before it.']}),`
`,e.jsx(t.h2,{children:"User features, as-of"}),`
`,e.jsxs(d,{prompt:"You compute each user's average order value once and join it onto every training row. What have you done?",options:["Saved computation sensibly","Leaked the future into every row dated before the last order that average includes"],correct:1,children:[e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`def as_of_user_features(labels, events, windows=(1, 7, 30)):
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
`})}),e.jsxs(t.p,{children:["The loop makes the exact time window easy to inspect. At scale, optimize it while checking against this reference. A backward ",e.jsx(t.code,{children:"merge_asof"})," is useful for looking up historical snapshots. For example, the following computes a ",e.jsx(t.strong,{children:"cumulative count before each decision"}),", not a 30-day count:"]}),e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`# Count all events up to each recorded timestamp, including timestamp ties.
history = (events.groupby(["user_id", "event_ts"])
                 .size().rename("events_at_time").reset_index()
                 .sort_values("event_ts"))
history["u_events_before_as_of"] = history.groupby("user_id")["events_at_time"].cumsum()

feats = pd.merge_asof(
    labels.sort_values("as_of"),
    history,
    left_on="as_of", right_on="event_ts", by="user_id",
    direction="backward", allow_exact_matches=False,   # ← this flag IS the strict <
)
feats["u_events_before_as_of"] = feats["u_events_before_as_of"].fillna(0).astype(int)
`})}),e.jsxs(t.p,{children:[e.jsx(t.code,{children:"allow_exact_matches=False"})," excludes events at the decision timestamp. A rolling count looked up at the most recent event is ",e.jsx(t.strong,{children:"not"})," an exact 30-day count at the decision time: events may have expired since that last event. Use the reference loop above, or subtract cumulative counts at both window boundaries. Test boundary timestamps and users with no history."]})]}),`
`,e.jsx(s,{items:[{q:"Why must a user aggregate be recomputed per row rather than once per user?",a:"A single aggregate over the user's whole history includes behaviour from after most of their rows. Joining it everywhere gives each early row knowledge of what the user did later, which is unavailable at serving time and inflates every offline metric."}]}),`
`,e.jsx(t.h2,{children:"User × item features — the ranker's edge"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`def as_of_pair_features(labels, events):
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
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"999"}),' as the "never interacted" sentinel works for tree models, which will split on it. It would be poison for a linear model or a neural net, where it distorts every scale — use a separate ',e.jsx(t.code,{children:"ui_never_seen"})," boolean there instead."]}),`
`,e.jsx(t.h2,{children:"Running it, and the leak check"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`f = as_of_pair_features(as_of_user_features(labels, events), events)
print(f[["user_id","item_id","as_of","u_events_1d","u_events_7d","u_events_30d",
         "u_burst","ui_views","ui_carts","ui_days_since"]].to_string(index=False))
`})}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-text",children:`user_id item_id      as_of  u_events_1d  u_events_7d  u_events_30d  u_burst  ui_views  ui_carts  ui_days_since
     U2      P4 2026-03-08            1            4             4    0.636         1         0              1
`})}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`whole_log = int((events.user_id == "U2").sum())          # 8
point_in_time = int(f.u_events_30d.iloc[0])              # 4
assert point_in_time == 4, "this fixture has exactly four events in the window"
assert point_in_time <= whole_log
`})}),`
`,e.jsx(t.p,{children:"Bhavna has 8 events in total; this fixture has 4 in the historical window. Using all 8 would leak later information. The exact expected count is a useful fixture test. In general, also verify the contributing event IDs and timestamps: a smaller count by itself does not prove that no future event entered the feature."}),`
`,e.jsx(t.div,{className:"lesson-visual",role:"region","aria-label":"Feature Window interactive example; scroll horizontally if needed",tabIndex:"0",children:e.jsx(h,{})}),`
`,e.jsx(t.h2,{children:"Item features need a historical snapshot"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`# WRONG — today's catalog values pasted onto year-old rows
feats = labels.merge(catalog[["item_id", "price", "return_rate"]], on="item_id")

# RIGHT — as-of join against a versioned snapshot table
feats = pd.merge_asof(
    labels.sort_values("as_of"),
    catalog_history.sort_values("valid_from"),      # item_id, price, return_rate, valid_from
    left_on="as_of", right_on="valid_from", by="item_id",
    direction="backward",
)
`})}),`
`,e.jsxs(t.p,{children:["The catalog table has no history unless you built it one. ",e.jsx(t.code,{children:"price"})," today is not the price at the moment of a decision six months ago, and ",e.jsx(t.code,{children:"return_rate"})," today includes returns that had not happened yet. Keeping a slowly-changing-dimension table is unglamorous infrastructure that decides whether your item features are usable at all."]}),`
`,e.jsxs(a,{title:"Training/serving skew — the same value, twice",children:[e.jsxs(t.p,{children:["Every offline feature needs an online counterpart producing ",e.jsx(t.strong,{children:"the identical value"}),". Two implementations of ",e.jsx(t.code,{children:"u_events_30d"})," — one Spark, one Redis — will disagree, and the model was trained on only one of them."]}),e.jsx(t.p,{children:"The three real defences, in ascending cost and effectiveness:"}),e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"One definition, two runtimes."})," Write the feature once in a shared library; the batch job and the serving path both call it."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Log the features you served."})," Then train on ",e.jsx(t.em,{children:"those"})," rows next time. The distributions match by construction because they are the same rows."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"A feature store."})," Feast, Tecton and friends exist for exactly this: one definition, offline point-in-time joins and online lookups from the same registry."]}),`
`]}),e.jsx(t.p,{children:"Option 2 is underrated. It costs a logging change, needs no new infrastructure, and eliminates the skew entirely for everything after the first model."})]}),`
`,e.jsx(o,{children:e.jsx(t.p,{children:"Features, labels and negatives — everything a ranker needs. Last module: train one and see what it actually learns."})}),`
`,e.jsx(s,{items:[{q:"What does `allow_exact_matches=False` in `pd.merge_asof` correspond to, and what happens if you forget it?",a:"It is the strict `<` in the as-of join. Left at the default True, an event sharing a timestamp with the label row is included in that row's own feature window — so the feature contains the interaction being predicted. Offline metrics soar, production is flat, and nothing in the model code looks wrong."},{q:"Why does joining today's catalog table onto historical label rows leak?",a:"Catalog columns like price and return_rate are current values; attaching them to a row from six months ago gives that row knowledge of things that had not happened yet — returns, repricing. Fixing it needs a versioned snapshot (slowly-changing-dimension) table and an as-of join on valid_from, not a plain merge."},{q:"999 as a 'never interacted' sentinel is fine for trees and poison for neural nets. Why the difference?",a:"Trees split on thresholds, so 999 simply becomes its own branch and the magnitude is irrelevant. Linear and neural models multiply the value by a weight, so a 999 among values of 0–30 dominates the scale, wrecks normalisation and produces huge gradients. There, use a separate boolean flag plus a neutral fill."},{q:"Why is 'log the features you served, then train on those rows' such a strong defence against training/serving skew?",a:"It removes the possibility of two implementations disagreeing: the training rows ARE the serving rows, so the distributions match by construction. It costs only a logging change rather than new infrastructure, and it fixes skew for every model after the first."}]}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(a,{title:"TL;DR",children:e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["Every feature is an ",e.jsx(t.strong,{children:"as-of join"}),": aggregate events with ",e.jsx(t.code,{children:"event_ts < row.as_of"}),", bounded below by a window."]}),`
`,e.jsxs(t.li,{children:["The label row carries an ",e.jsx(t.code,{children:"as_of"})," timestamp. Everything is computed relative to it. No exceptions."]}),`
`,e.jsxs(t.li,{children:["Check that every contributing event precedes the row's ",e.jsx(t.code,{children:"as_of"})," timestamp. A historical count cannot exceed the whole-log count, but equality can be valid when there are no later events. A smaller count alone does not prove that the right events were used."]}),`
`,e.jsxs(t.li,{children:["Build user, item and ",e.jsx(t.strong,{children:"user×item"})," features. The last family is the ranker's only real advantage over retrieval."]}),`
`]})}),`
`,e.jsx(l,{question:"Your point-in-time features return exactly the same values as the naive whole-log aggregate for every row in a test batch. What should you conclude?",options:["The pipeline is correct — the two agree, so there is no leak","Nothing yet: agreement means those specific rows have no events after their as_of. Check rows whose as_of is early in the window, where the two must diverge","The as-of join is redundant and can be removed","The window is too narrow and should be widened"],correct:1})]})}function _(n={}){const{wrapper:t}={...r(),...n.components};return t?e.jsx(t,{...n,children:e.jsx(i,{...n})}):i(n)}export{_ as default};
