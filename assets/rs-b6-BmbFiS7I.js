import{u as o,j as e,R as n,C as a,B as l,Q as h}from"./index-WYRBR6CI.js";import{P as r}from"./PredictReveal-DnF7AdIF.js";import{L as d}from"./LTRLossWidget-DuG2eWDd.js";import"./recsysUtils-DhJNCk3B.js";function i(s){const t={annotation:"annotation",code:"code",div:"div",em:"em",h1:"h1",h2:"h2",hr:"hr",li:"li",math:"math",mi:"mi",mrow:"mrow",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",ul:"ul",...o(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.h1,{children:"Build — LTR Training"}),`
`,e.jsx(t.h2,{children:"Build the training rows"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`rng = np.random.default_rng(0)

pop     = train.groupby("item_id")["user_id"].nunique().reindex(ITEMS).fillna(0)
neg_w   = pop.values ** 0.75              # module 11's default
neg_w   = neg_w / neg_w.sum()

def build_ltr_rows(train, n_neg=4):
    rows = []
    pos = pd.concat([
        train[train.event_type == "purchase"][["user_id", "item_id", "event_ts"]],
        train[train.event_type == "cart"    ][["user_id", "item_id", "event_ts"]],
    ])
    for r in pos.itertuples():
        rows.append(dict(user_id=r.user_id, item_id=r.item_id, as_of=r.event_ts, label=1))
        cand = [i for i in ITEMS if i != r.item_id]
        w    = np.array([neg_w[ITEMS.index(i)] for i in cand]); w /= w.sum()
        for neg in rng.choice(cand, size=n_neg, replace=False, p=w):
            rows.append(dict(user_id=r.user_id, item_id=neg, as_of=r.event_ts, label=0))
    return pd.DataFrame(rows)

ltr = build_ltr_rows(train)          # 55 rows, 11 positives
`})}),`
`,e.jsxs(t.p,{children:["The critical line is ",e.jsx(t.code,{children:"as_of=r.event_ts"}),". Every negative inherits the ",e.jsx(t.strong,{children:"positive's"})," timestamp, so all five rows in a group describe the same moment. Give negatives a different ",e.jsx(t.code,{children:"as_of"})," and the model can separate positives from negatives by their features' recency alone — a leak that looks like a great model."]}),`
`,e.jsx(t.h2,{children:"Attach features and train"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`ltr = as_of_pair_features(as_of_user_features(ltr, events), events)
ltr["item_pop"] = ltr.item_id.map(pop).fillna(0)

FEATS = ["u_events_1d", "u_events_7d", "u_events_30d", "u_burst",
         "ui_views", "ui_carts", "ui_days_since", "item_pop"]

from sklearn.ensemble import GradientBoostingClassifier
clf = GradientBoostingClassifier(n_estimators=60, max_depth=3,
                                 learning_rate=0.1, random_state=0)
clf.fit(ltr[FEATS], ltr.label)                     # pointwise: rows are independent
`})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"GradientBoostingClassifier"})," is ",e.jsx(t.strong,{children:"pointwise"})," — each row judged alone. It is the right first ranker (module 9): fastest to train, calibrated output, and it establishes whether your features carry signal at all before you complicate the loss."]}),`
`,e.jsx(t.h2,{children:"The pairwise upgrade"}),`
`,e.jsxs(r,{prompt:"Your pointwise ranker predicts click probability per item. Switching to a pairwise objective changes what it optimises. To what?",options:["More accurate probabilities","Whether item A should outrank item B, which is the only thing the final list depends on"],correct:1,children:[e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`import lightgbm as lgb

ltr = ltr.sort_values(["user_id", "as_of"])
group_sizes = ltr.groupby(["user_id", "as_of"], sort=False).size().to_numpy()   # 5,5,5,...

ranker = lgb.LGBMRanker(
    objective="lambdarank",          # LambdaRank gradients (module 9)
    metric="ndcg", eval_at=[3, 10],
    n_estimators=300, learning_rate=0.05, num_leaves=31,
)
ranker.fit(ltr[FEATS], ltr.label, group=group_sizes)
`})}),e.jsxs(t.p,{children:[e.jsx(t.code,{children:"group"})," is the whole difference. It tells LightGBM which rows compete against each other, so gradients are computed ",e.jsx(t.strong,{children:"within"})," a slate rather than across the dataset. Get the grouping wrong — rows not sorted to match ",e.jsx(t.code,{children:"group_sizes"}),", or grouping by user instead of by ",e.jsx(t.code,{children:"(user, as_of)"})," — and LambdaRank silently optimises comparisons between slates that were never shown together. It will not error. It will just be worse."]})]}),`
`,e.jsx(t.div,{className:"lesson-visual",role:"region","aria-label":"LTRLoss interactive example; scroll horizontally if needed",tabIndex:"0",children:e.jsx(d,{})}),`
`,e.jsx(n,{items:[{q:"What does a pairwise objective optimise that a pointwise one does not?",a:"Relative order. A pointwise model tries to get each item's absolute score right, which is harder than necessary and not what the output depends on. A pairwise model only has to get each comparison right, which is exactly what determines the final ordering."}]}),`
`,e.jsx(t.h2,{children:"Score and evaluate"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`def ltr_ranker(u, as_of=CUTOFF):
    cand = pd.DataFrame({"user_id": u, "item_id": ITEMS, "as_of": as_of})
    cand = as_of_pair_features(as_of_user_features(cand, train), train)
    cand["item_pop"] = cand.item_id.map(pop).fillna(0)
    scores = clf.predict_proba(cand[FEATS])[:, 1]
    return [ITEMS[j] for j in np.argsort(-scores)]

s, per = evaluate(ltr_ranker, targets, k=3)
`})}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-text",children:`ranker    hit=0.333 mrr=0.222 ndcg=0.250 cov=0.889
recency   hit=0.667 mrr=0.361 ndcg=0.438 cov=0.889   ← baseline still wins
`})}),`
`,e.jsx(t.h2,{children:"The ranker loses. Read why."}),`
`,e.jsxs(r,{prompt:"After all that work, the learned ranker scores worse than a simple baseline. What is the most useful response?",options:["Tune it until it wins","Find out why — a ranker that loses on a small dataset is usually telling you something true about the data, not about the method"],correct:1,children:[e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`for name, imp in sorted(zip(FEATS, clf.feature_importances_), key=lambda t: -t[1]):
    print(f"{name:<16} {imp:.3f}")
`})}),e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-text",children:`ui_days_since    0.702
u_events_30d     0.134
item_pop         0.088
u_events_7d      0.039
ui_carts         0.020
ui_views         0.016
u_events_1d      0.001
u_burst          0.000
`})}),e.jsxs(t.p,{children:[e.jsxs(t.strong,{children:["70% of the model is ",e.jsx(t.code,{children:"ui_days_since"}),"."]}),' With 11 positives, the only signal a gradient-boosted tree can find is "recently touched" — so it rediscovered the recency baseline and then approximated it worse than a ',e.jsx(t.code,{children:"GROUP BY"})," does."]}),e.jsx(t.p,{children:"This is exactly the right outcome to see once, and the diagnosis generalises:"}),e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"A ranker cannot beat a baseline it has merely rediscovered."})," Beating recency requires features recency does not have — ALS scores, category affinity, price fit, session context. Feed the model's own ALS score in as a feature; that is how the two stages actually compose."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"11 positives cannot support 8 features."})," The fix is more data, not more model."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Coverage is 0.889 versus popularity's 0.333."})," The ranker is at least ",e.jsx(t.em,{children:"personalising"}),", which popularity structurally cannot. That number is the one piece of genuine progress in the table."]}),`
`]}),e.jsxs(a,{title:"Common confusion — 'the model is worse, so the pipeline failed'",children:[e.jsxs(t.p,{children:["The pipeline did its job: it produced a trustworthy number that says ",e.jsx(t.em,{children:"not yet"}),". That is worth more than a good number you cannot audit."]}),e.jsxs(t.p,{children:["The failure mode to actually fear is the opposite — a ranker that ",e.jsx(t.strong,{children:"beats"})," every baseline by a wide margin on the first run. On real data that almost always means leakage (b5) rather than skill, and the checks to run are: is one feature dominating importance, does it involve an aggregate, and was that aggregate computed with an as-of join?"]}),e.jsx(t.p,{children:"Suspicion should scale with how good the result looks."})]})]}),`
`,e.jsx(n,{items:[{q:"What does it mean when a carefully built ranker loses to a simple baseline?",a:"Usually that the dataset is too small or too sparse for the extra capacity to pay off, or that the features carry less signal than expected. It is information about the problem rather than a failure of the method, and reporting it honestly is more valuable than tuning until the number looks right."}]}),`
`,e.jsx(t.h2,{children:"The whole pipeline"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-text",children:`b1  events → temporal split → targets        assert train.max_ts < test.min_ts
b2  evaluate(rank_fn, targets, k)            assert metrics vs hand-computed values
b3  random / popular / recency / covisit     the bar to beat
b4  ALS on the implicit matrix               assert loss is monotone
b5  as-of features                           assert point_in_time < whole_log
b6  positives + sampled negatives → ranker   group by (user, as_of)
`})}),`
`,e.jsx(t.p,{children:"Six steps, four assertions. The assertions are what make the numbers mean something — and they are the part most teams skip."}),`
`,e.jsx(l,{children:e.jsx(t.p,{children:"That is the full track: the concepts in Part 1, the pipeline in Part 2. The track quiz pulls from both."})}),`
`,e.jsx(n,{items:[{q:"Why must every sampled negative inherit the positive's `as_of` timestamp?",a:"So all rows in a group describe the same moment and differ only in the item. If negatives carried their own (e.g. current) timestamp, their user-side features would come from a different point in history, and the model could separate positives from negatives on recency artefacts alone — a leak that presents as a strong model."},{q:"What does LightGBM's `group` parameter do, and what is the silent failure if it is wrong?",a:"It defines which rows compete against each other, so LambdaRank computes gradients within a slate rather than across the dataset. If rows are not sorted to match group_sizes, or you group by user instead of (user, as_of), the model optimises comparisons between slates never shown together. It raises no error — the model is simply worse."},{q:"The ranker put 70% of its importance on `ui_days_since` and lost to the recency baseline. What is the diagnosis and the fix?",a:"It rediscovered recency from the only signal 11 positives can support, then approximated it worse than a GROUP BY does. The fix is features recency does not contain — the ALS score, category affinity, price fit, session context — and more positives. Not a different loss or a bigger model."},{q:"Why should a first-run ranker that beats every baseline by a wide margin make you MORE suspicious, not less?",a:"On real data that pattern is far more often leakage than skill. The checks: is a single feature dominating importance, is it an aggregate, and was it built with a strict as-of join? A modest honest gain is the normal shape of a real improvement; a large first-try gain usually means a feature is reading the label."}]}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(a,{title:"TL;DR",children:e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["Training rows = one positive per interaction + ",e.jsxs(t.span,{className:"katex",children:[e.jsx(t.span,{className:"katex-mathml",children:e.jsx(t.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(t.semantics,{children:[e.jsx(t.mrow,{children:e.jsx(t.mi,{children:"n"})}),e.jsx(t.annotation,{encoding:"application/x-tex",children:"n"})]})})}),e.jsx(t.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(t.span,{className:"base",children:[e.jsx(t.span,{className:"strut",style:{height:"0.4306em"}}),e.jsx(t.span,{className:"mord mathnormal",children:"n"})]})})]})," popularity-sampled negatives, each carrying ",e.jsx(t.strong,{children:"as-of"})," features."]}),`
`,e.jsxs(t.li,{children:["Group rows by ",e.jsx(t.code,{children:"(user, as_of)"})," — that group ",e.jsx(t.em,{children:"is"})," the slate a pairwise or listwise ranker learns to order."]}),`
`,e.jsxs(t.li,{children:["On NovaCart the ranker ",e.jsx(t.strong,{children:"loses to the recency baseline"})," (NDCG@3 0.250 vs 0.438). That is the honest result on 55 rows, and its feature importances explain exactly why."]}),`
`,e.jsx(t.li,{children:"Ship the pipeline, not the score. Everything here scales; the toy result does not."}),`
`]})}),`
`,e.jsx(h,{question:"You add the ALS score from module b4 as a feature in the ranker. What makes this the natural composition of the two stages, rather than double-counting?",options:["It is double-counting and should be avoided","ALS contributes collaborative structure the ranker cannot learn from 11 positives, while the ranker adds cross and context features ALS structurally cannot use — each supplies what the other lacks","It only works if both are trained on the same loss function","The ALS score must be binarised first or the tree cannot split on it"],correct:1})]})}function g(s={}){const{wrapper:t}={...o(),...s.components};return t?e.jsx(t,{...s,children:e.jsx(i,{...s})}):i(s)}export{g as default};
