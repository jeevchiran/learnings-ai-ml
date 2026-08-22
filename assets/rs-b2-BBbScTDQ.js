import{u as r,j as e,C as a,B as i,R as l,Q as c}from"./index-Ba5-wm3B.js";import{R as h}from"./RankingMetricsWidget-BFe85O9H.js";import"./recsysUtils-DhJNCk3B.js";function t(n){const s={annotation:"annotation",code:"code",em:"em",h2:"h2",li:"li",math:"math",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",msub:"msub",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",ul:"ul",...r(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(a,{title:"TL;DR",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["The harness is one function: ",e.jsxs(s.strong,{children:["give it a ",e.jsx(s.code,{children:"rank_fn(user) -> [item_ids]"}),", get back a dict of metrics."]})," Every model in this track plugs into that one interface."]}),`
`,e.jsxs(s.li,{children:["Unit-test the metrics against hand-computed values ",e.jsx(s.em,{children:"before"})," trusting them on a model. A broken NDCG produces confident nonsense forever."]}),`
`,e.jsxs(s.li,{children:["Report accuracy ",e.jsx(s.strong,{children:"and"})," coverage together, always."]}),`
`]})}),`
`,e.jsx(s.h2,{children:"The interface that makes everything else swappable"}),`
`,e.jsx(s.p,{children:"Every recommender — popularity, ALS, a gradient-boosted ranker — reduces to the same signature:"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`rank_fn(user_id: str) -> list[str]   # item_ids, best first
`})}),`
`,e.jsx(s.p,{children:"Commit to that and the harness never changes again. Baselines, models and ablations all become one-liners."}),`
`,e.jsx(s.h2,{children:"The metrics"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`import numpy as np, pandas as pd

def precision_at_k(ranked, relevant, k):
    return len(set(ranked[:k]) & set(relevant)) / k

def recall_at_k(ranked, relevant, k):
    return len(set(ranked[:k]) & set(relevant)) / len(relevant) if relevant else 0.0

def hit_at_k(ranked, relevant, k):
    return float(bool(set(ranked[:k]) & set(relevant)))

def reciprocal_rank(ranked, relevant, k):
    for i, item in enumerate(ranked[:k], start=1):
        if item in relevant:
            return 1.0 / i
    return 0.0

def average_precision_at_k(ranked, relevant, k):
    if not relevant:
        return 0.0
    hits, total = 0, 0.0
    for i, item in enumerate(ranked[:k], start=1):
        if item in relevant:
            hits += 1
            total += hits / i
    return total / min(k, len(relevant))

def ndcg_at_k(ranked, relevant, k):
    dcg  = sum(1 / np.log2(i + 1) for i, it in enumerate(ranked[:k], start=1) if it in relevant)
    idcg = sum(1 / np.log2(i + 1) for i in range(1, min(k, len(relevant)) + 1))
    return dcg / idcg if idcg else 0.0
`})}),`
`,e.jsx(s.p,{children:"Three details that are bugs if you get them wrong:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:e.jsx(s.code,{children:"enumerate(..., start=1)"})})," — ranks are 1-based, so the discount is ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsxs(s.msub,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"log"}),e.jsx(s.mo,{children:"⁡"})]}),e.jsx(s.mn,{children:"2"})]}),e.jsx(s.mo,{stretchy:"false",children:"("}),e.jsx(s.mi,{children:"i"}),e.jsx(s.mo,{children:"+"}),e.jsx(s.mn,{children:"1"}),e.jsx(s.mo,{stretchy:"false",children:")"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"\\log_2(i+1)"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsxs(s.span,{className:"mop",children:[e.jsxs(s.span,{className:"mop",children:["lo",e.jsx(s.span,{style:{marginRight:"0.0139em"},children:"g"})]}),e.jsx(s.span,{className:"msupsub",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsx(s.span,{className:"vlist",style:{height:"0.207em"},children:e.jsxs(s.span,{style:{top:"-2.4559em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mtight",children:"2"})})]})}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.2441em"},children:e.jsx(s.span,{})})})]})})]}),e.jsx(s.span,{className:"mopen",children:"("}),e.jsx(s.span,{className:"mord mathnormal",children:"i"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}}),e.jsx(s.span,{className:"mbin",children:"+"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(s.span,{className:"mord",children:"1"}),e.jsx(s.span,{className:"mclose",children:")"})]})]})]}),". Start at 0 and rank 1 divides by ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsxs(s.msub,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"log"}),e.jsx(s.mo,{children:"⁡"})]}),e.jsx(s.mn,{children:"2"})]}),e.jsx(s.mo,{stretchy:"false",children:"("}),e.jsx(s.mn,{children:"1"}),e.jsx(s.mo,{stretchy:"false",children:")"}),e.jsx(s.mo,{children:"="}),e.jsx(s.mn,{children:"0"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"\\log_2(1)=0"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsxs(s.span,{className:"mop",children:[e.jsxs(s.span,{className:"mop",children:["lo",e.jsx(s.span,{style:{marginRight:"0.0139em"},children:"g"})]}),e.jsx(s.span,{className:"msupsub",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsx(s.span,{className:"vlist",style:{height:"0.207em"},children:e.jsxs(s.span,{style:{top:"-2.4559em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mtight",children:"2"})})]})}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.2441em"},children:e.jsx(s.span,{})})})]})})]}),e.jsx(s.span,{className:"mopen",children:"("}),e.jsx(s.span,{className:"mord",children:"1"}),e.jsx(s.span,{className:"mclose",children:")"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}}),e.jsx(s.span,{className:"mrel",children:"="}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6444em"}}),e.jsx(s.span,{className:"mord",children:"0"})]})]})]}),"."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:e.jsx(s.code,{children:"min(k, len(relevant))"})})," in both AP and IDCG. Without it, a user with 1 relevant item and ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"k"}),e.jsx(s.mo,{children:"="}),e.jsx(s.mn,{children:"10"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"k=10"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6944em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0315em"},children:"k"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}}),e.jsx(s.span,{className:"mrel",children:"="}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6444em"}}),e.jsx(s.span,{className:"mord",children:"10"})]})]})]})," has their score divided by the IDCG of 10 items and can never reach 1.0."]}),`
`,e.jsxs(s.li,{children:[e.jsxs(s.strong,{children:["The ",e.jsx(s.code,{children:"if idcg else 0.0"})," guard."]})," A user with no relevant items must return 0, not ",e.jsx(s.code,{children:"NaN"}),". One ",e.jsx(s.code,{children:"NaN"})," silently poisons the mean over all users."]}),`
`]}),`
`,e.jsx(s.h2,{children:"The runner"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`def evaluate(rank_fn, targets, k=3, catalog=ITEMS):
    rows, shown = [], set()
    for user, target in targets.items():
        ranked = rank_fn(user)
        shown |= set(ranked[:k])
        relevant = {target}
        rows.append(dict(
            user_id = user,
            hit     = hit_at_k(ranked, relevant, k),
            mrr     = reciprocal_rank(ranked, relevant, k),
            ndcg    = ndcg_at_k(ranked, relevant, k),
            ap      = average_precision_at_k(ranked, relevant, k),
            rank    = (ranked.index(target) + 1) if target in ranked else None,
        ))
    per = pd.DataFrame(rows)
    summary = dict(
        hit_rate = per.hit.mean(),
        mrr      = per.mrr.mean(),
        ndcg     = per.ndcg.mean(),
        map      = per.ap.mean(),
        coverage = len(shown) / len(catalog),
    )
    return summary, per
`})}),`
`,e.jsxs(s.p,{children:["Returning ",e.jsx(s.code,{children:"per"})," alongside the summary is not optional. The mean tells you ",e.jsx(s.em,{children:"whether"})," something changed; the per-user frame tells you ",e.jsx(s.em,{children:"who"})," changed, which is the only way to debug a regression."]}),`
`,e.jsx(s.h2,{children:"Test the harness before you trust it"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`ranked   = ["P8", "P1", "P2", "P5", "P3", "P7", "P4", "P6"]
relevant = {"P1", "P5", "P7"}            # hits at ranks 2, 4, 6

assert abs(precision_at_k(ranked, relevant, 3) - 1/3)    < 1e-9
assert abs(recall_at_k(ranked, relevant, 5)    - 2/3)    < 1e-9
assert abs(reciprocal_rank(ranked, relevant, 8) - 0.5)   < 1e-9
assert abs(average_precision_at_k(ranked, relevant, 5) - 1/3) < 1e-9
assert abs(ndcg_at_k(ranked, relevant, 3) - 0.29614)     < 1e-4
assert ndcg_at_k(ranked, set(), 3) == 0.0                # no NaN
assert abs(ndcg_at_k(["P1","P5","P7"], relevant, 3) - 1.0) < 1e-9   # perfect = 1.0
`})}),`
`,e.jsxs(s.p,{children:["Every one of those values was derived by hand in module 4. ",e.jsx(s.strong,{children:"A metric harness with no tests is the single highest-leverage place for a silent bug"}),", because its output is a number that looks plausible no matter what it does."]}),`
`,e.jsx(h,{}),`
`,e.jsx(s.h2,{children:"Reporting"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`def report(name, rank_fn, targets, ks=(1, 3, 5, 10)):
    out = {}
    for k in ks:
        s, _ = evaluate(rank_fn, targets, k=k)
        out[f"ndcg@{k}"]     = round(s["ndcg"], 4)
        out[f"hit@{k}"]      = round(s["hit_rate"], 4)
        out[f"coverage@{k}"] = round(s["coverage"], 4)
    return pd.Series(out, name=name)

pd.concat([report("popular", pop_fn, targets),
           report("recency", rec_fn, targets)], axis=1)
`})}),`
`,e.jsxs(s.p,{children:["Several ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"k"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"k"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6944em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0315em"},children:"k"})]})})]})," values, always with coverage. A model that wins at ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"k"}),e.jsx(s.mo,{children:"="}),e.jsx(s.mn,{children:"1"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"k=1"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6944em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0315em"},children:"k"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}}),e.jsx(s.span,{className:"mrel",children:"="}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6444em"}}),e.jsx(s.span,{className:"mord",children:"1"})]})]})]})," and loses at ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"k"}),e.jsx(s.mo,{children:"="}),e.jsx(s.mn,{children:"10"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"k=10"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6944em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0315em"},children:"k"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}}),e.jsx(s.span,{className:"mrel",children:"="}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6444em"}}),e.jsx(s.span,{className:"mord",children:"10"})]})]})]})," is telling you something real about where it puts its confidence — and the single-",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"k"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"k"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6944em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0315em"},children:"k"})]})})]})," report hides it."]}),`
`,e.jsxs(a,{title:"Common confusion — confidence intervals on six users",children:[e.jsx(s.p,{children:"NovaCart has 6 test users. A metric over 6 users has an enormous standard error: one user changing rank moves HitRate@3 by 0.167. Every number in this track is an illustration, not evidence."}),e.jsx(s.p,{children:"For real reporting, bootstrap over users:"}),e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`def bootstrap_ndcg(rank_fn, targets, k=10, n=1000, seed=0):
    rng = np.random.default_rng(seed)
    _, per = evaluate(rank_fn, targets, k=k)
    vals = per.ndcg.to_numpy()
    boots = [rng.choice(vals, size=len(vals), replace=True).mean() for _ in range(n)]
    return np.mean(vals), np.percentile(boots, [2.5, 97.5])
`})}),e.jsxs(s.p,{children:["Resample ",e.jsx(s.strong,{children:"users"}),`, not rows — users are the independent unit. If two models' intervals overlap, you do not have a result, and shipping on the point estimate is how teams accumulate a portfolio of changes that each "won" offline and did nothing in aggregate.`]})]}),`
`,e.jsx(i,{children:e.jsx(s.p,{children:"The scoreboard exists. Now put something on it — the baselines any model must beat."})}),`
`,e.jsx(l,{items:[{q:"Why must every model expose the same `rank_fn(user) -> [item_ids]` interface?",a:"It makes the harness a fixed point. Baselines, ALS, and a GBM ranker all plug into one `evaluate` call, so comparisons are apples-to-apples and adding a model costs one function. Without it, each model grows its own evaluation code and the numbers stop being comparable."},{q:"Name the three off-by-one/edge-case bugs the metric code guards against.",a:"1-based ranks in the log2(i+1) discount (rank 1 would otherwise divide by log2(1)=0); min(k, |relevant|) in AP and IDCG so a user with one relevant item can still reach 1.0; and returning 0.0 rather than NaN when a user has no relevant items, since one NaN poisons the mean across all users."},{q:"Why return the per-user frame as well as the summary?",a:"The mean says whether something changed; only the per-user rows say who changed. Debugging a regression means finding which users got worse and what they have in common — cold users, long histories, one category. That is impossible from an aggregate."},{q:"When bootstrapping a confidence interval on NDCG, why resample users rather than (user, item) rows?",a:"Users are the independent sampling unit; rows within a user are correlated because they share a history and a model state. Resampling rows understates variance and produces intervals that are too narrow, which is exactly the error that makes noise look like a result."}]}),`
`,e.jsx(c,{question:"Your `ndcg_at_k` divides by the IDCG of k items rather than min(k, |relevant|). A user with 1 relevant item, evaluated at k=10, has that item at rank 1. What score do they get?",options:["1.0, as they should — the item is at rank 1","About 0.22 — the denominator assumes 10 relevant items existed, so a perfect ranking looks poor and every model is understated","0.0, because the guard clause triggers","NaN, because IDCG is undefined"],correct:1})]})}function p(n={}){const{wrapper:s}={...r(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(t,{...n})}):t(n)}export{p as default};
