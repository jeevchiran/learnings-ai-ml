import{u as a,j as e,C as r,B as i,R as o,Q as c}from"./index-COnZx3Nm.js";import{B as l}from"./BaselineCompareWidget-Cd9mlTQa.js";import"./plotly.min-C-6sAbst.js";import"./recsysUtils-DhJNCk3B.js";import"./utils-Q0-mAnXe.js";function t(s){const n={annotation:"annotation",code:"code",em:"em",h2:"h2",li:"li",math:"math",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",ul:"ul",...a(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Four baselines, each a closure returning ",e.jsx(n.code,{children:"rank_fn"}),", each under ten lines."]}),`
`,e.jsxs(n.li,{children:["On NovaCart, ",e.jsx(n.strong,{children:"recency wins"}),": NDCG@3 0.438 with 89% coverage, against popularity's 0.377 with 33%."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Random ties popularity here."})," With six users that is not a surprising result, it is a warning about your sample size — and worth internalising before you read any other number in this track as evidence."]}),`
`]})}),`
`,e.jsx(n.h2,{children:"All four, in one screen"}),`
`,e.jsxs(n.p,{children:["Every one returns the same ",e.jsx(n.code,{children:"rank_fn(user) -> [item_ids]"})," the harness expects."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`def random_ranker(catalog=ITEMS, seed=3):
    order = list(np.random.default_rng(seed).permutation(catalog))
    return lambda u: order

def popularity_ranker(train, catalog=ITEMS):
    pop = train.groupby("item_id")["user_id"].nunique()          # DISTINCT users
    order = sorted(catalog, key=lambda i: (-pop.get(i, 0), i))   # stable tie-break
    return lambda u: order

def recency_ranker(train):
    last = train.groupby(["user_id", "item_id"])["event_ts"].max().reset_index()
    by_user = {u: g.sort_values("event_ts", ascending=False).item_id.tolist()
               for u, g in last.groupby("user_id")}
    return lambda u: by_user.get(u, [])                          # empty for cold users

def covisit_ranker(train, catalog=ITEMS):
    pairs = train[["user_id", "item_id"]].drop_duplicates()
    co = (pairs.merge(pairs, on="user_id")
               .query("item_id_x != item_id_y")
               .groupby(["item_id_x", "item_id_y"]).size().rename("n").reset_index())
    hist = train.groupby("user_id")["item_id"].apply(set).to_dict()
    def rank(u):
        sub = co[co.item_id_x.isin(hist.get(u, set()))]
        sc  = sub.groupby("item_id_y")["n"].sum().sort_values(ascending=False)
        return sc.index.tolist() + [i for i in catalog if i not in sc.index]
    return rank
`})}),`
`,e.jsx(n.p,{children:"Four things in that code carry real weight:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"nunique()"})," not ",e.jsx(n.code,{children:"size()"})]})," — count distinct shoppers so one bot cannot define your homepage."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:["The ",e.jsx(n.code,{children:"(-pop, i)"})," tie-break"]})," — without a deterministic second key, ties resolve by dict order and your baseline changes between runs."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.code,{children:"by_user.get(u, [])"})})," — a cold user gets an empty list, and the harness scores it 0. That is correct. Falling back to popularity here hides how much traffic has no history."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:["The tail append in ",e.jsx(n.code,{children:"covisit"})]})," — always return the ",e.jsx(n.em,{children:"full"})," catalog. A short list silently caps recall@k and makes coverage incomparable across models."]}),`
`]}),`
`,e.jsx(n.h2,{children:"Running them"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`rankers = {
    "random":   random_ranker(),
    "popular":  popularity_ranker(train),
    "recency":  recency_ranker(train),
    "covisit":  covisit_ranker(train),
}
for name, fn in rankers.items():
    s, _ = evaluate(fn, targets, k=3)
    print(f"{name:<9} hit={s['hit_rate']:.3f} mrr={s['mrr']:.3f} "
          f"ndcg={s['ndcg']:.3f} cov={s['coverage']:.3f}")
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-text",children:`random    hit=0.500 mrr=0.333 ndcg=0.377 cov=0.333
popular   hit=0.500 mrr=0.333 ndcg=0.377 cov=0.333
recency   hit=0.667 mrr=0.361 ndcg=0.438 cov=0.889
covisit   hit=0.500 mrr=0.222 ndcg=0.294 cov=0.556
`})}),`
`,e.jsx(l,{}),`
`,e.jsx(n.h2,{children:"Reading the output honestly"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Random ties popularity."})," Its expected HitRate@3 on a 9-item catalog is ",e.jsxs(n.span,{className:"katex",children:[e.jsx(n.span,{className:"katex-mathml",children:e.jsx(n.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(n.semantics,{children:[e.jsxs(n.mrow,{children:[e.jsx(n.mn,{children:"3"}),e.jsx(n.mi,{mathvariant:"normal",children:"/"}),e.jsx(n.mn,{children:"9"}),e.jsx(n.mo,{children:"="}),e.jsx(n.mn,{children:"0.333"})]}),e.jsx(n.annotation,{encoding:"application/x-tex",children:"3/9 = 0.333"})]})})}),e.jsxs(n.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(n.span,{className:"base",children:[e.jsx(n.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(n.span,{className:"mord",children:"3/9"}),e.jsx(n.span,{className:"mspace",style:{marginRight:"0.2778em"}}),e.jsx(n.span,{className:"mrel",children:"="}),e.jsx(n.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),e.jsxs(n.span,{className:"base",children:[e.jsx(n.span,{className:"strut",style:{height:"0.6444em"}}),e.jsx(n.span,{className:"mord",children:"0.333"})]})]})]}),"; it scored 0.500. That is one lucky permutation over six users, and it is the most useful line in the table — ",e.jsx(n.strong,{children:"a metric computed on six users cannot distinguish a model from a coin flip."})," Nothing else in this track is evidence either; it is all illustration. Bootstrap over users (module b2) before believing any comparison on real data."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Recency wins on both axes."})," NDCG@3 0.438 and coverage 0.889, from a ",e.jsx(n.code,{children:"GROUP BY"})," with no model. That is the line every subsequent model must clear."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Co-visitation underperforms here"})," and would not at real scale. It needs many baskets to estimate pair counts, and NovaCart has 34 events total. On a real store it is typically the strongest cheap baseline on basket-completion surfaces."]}),`
`,e.jsxs(r,{title:"The filtered-vs-unfiltered decision, in code",children:[e.jsx(n.p,{children:"Recency recommends things the shopper has already seen. Whether that counts depends entirely on the surface, so make it an explicit flag rather than an accident:"}),e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`def filter_seen(rank_fn, train):
    seen = train.groupby("user_id")["item_id"].apply(set).to_dict()
    def wrapped(u):
        s = seen.get(u, set())
        return [i for i in rank_fn(u) if i not in s]
    return wrapped

s_disc, _ = evaluate(filter_seen(rankers["recency"], train), targets, k=3)
`})}),e.jsxs(n.p,{children:["Filtered, recency scores ",e.jsx(n.strong,{children:"0"})," on NovaCart — every one of its recommendations was something the shopper had already touched. That number is not a bug; it is the precise statement that recency is memory, not discovery."]}),e.jsx(n.p,{children:'Report both. "Unfiltered" is right for cart and re-order surfaces; "filtered" is right for discovery carousels, and it is the only number that tells you whether your model adds anything a database query could not.'})]}),`
`,e.jsx(i,{children:e.jsx(n.p,{children:"Baselines are on the board. Time for the first real model."})}),`
`,e.jsx(o,{items:[{q:"Why use `nunique()` rather than `size()` for the popularity baseline, and why the explicit tie-break?",a:"nunique counts distinct shoppers, capping each shopper's contribution at 1, so one bot or one obsessive user cannot define the ranking. The (-pop, item_id) tie-break makes the order deterministic — without a second sort key, ties resolve by dict insertion order and the 'same' baseline changes between runs, making comparisons meaningless."},{q:"Random tied popularity on NovaCart. What is the correct conclusion?",a:"That six users is far too small a sample to distinguish models. Random's expected HitRate@3 on a 9-item catalog is 0.333 and it scored 0.500 on one lucky permutation. The lesson is about the harness, not the baselines: bootstrap over users and check whether intervals overlap before treating any comparison as a result."},{q:"Why should a baseline return the full catalog rather than a short list?",a:"Metrics at k > list length silently cap recall, and coverage becomes incomparable across models that return different-length lists. Returning the full catalog (relevant items first, the rest appended) keeps every metric well-defined and every model comparable at any k."},{q:"Filtered for already-seen items, recency scores 0 on NovaCart. What does that number mean?",a:"That every recommendation recency makes is something the shopper already touched — it is pure memory with zero discovery. That is not a defect of the baseline but a precise measurement of what it does, and it is the right way to separate reminder value from recommendation value on a discovery surface."}]}),`
`,e.jsx(c,{question:"Your recency baseline returns an empty list for cold users, and the harness scores them 0. A teammate proposes falling back to popularity for those users. What is the tradeoff?",options:["No tradeoff — the fallback is strictly better and should always be added","The fallback improves the served experience but hides how much traffic has no history; keep it in production and report the cold-user share separately so the harness stays honest","The fallback introduces temporal leakage","Cold users should be dropped from the evaluation entirely"],correct:1})]})}function g(s={}){const{wrapper:n}={...a(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(t,{...s})}):t(s)}export{g as default};
