import{u as i,j as e,C as n,B as r,R as l,Q as c}from"./index-Ba5-wm3B.js";import{A as h}from"./ALSFactorWidget-BHK79peI.js";import"./plotly.min-DUfCXMBF.js";import"./recsysUtils-DhJNCk3B.js";import"./utils-Q0-mAnXe.js";function t(a){const s={annotation:"annotation",code:"code",em:"em",h2:"h2",li:"li",math:"math",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",msub:"msub",msup:"msup",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",ul:"ul",...i(),...a.components};return e.jsxs(e.Fragment,{children:[e.jsx(n,{title:"TL;DR",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Implicit ALS in ~20 lines of NumPy: build ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"R"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"R"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6833em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0077em"},children:"R"})]})})]}),", alternate two ridge solves, watch the loss fall monotonically."]}),`
`,e.jsxs(s.li,{children:["The ",e.jsx(s.strong,{children:"Gram trick"})," (",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsxs(s.msup,{children:[e.jsx(s.mi,{children:"Y"}),e.jsx(s.mi,{mathvariant:"normal",children:"⊤"})]}),e.jsx(s.mi,{children:"Y"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"Y^\\top Y"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.8491em"}}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.2222em"},children:"Y"}),e.jsx(s.span,{className:"msupsub",children:e.jsx(s.span,{className:"vlist-t",children:e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.8491em"},children:e.jsxs(s.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mtight",children:"⊤"})})]})})})})})]}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.2222em"},children:"Y"})]})})]})," once per sweep, then a rank-",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsxs(s.msub,{children:[e.jsx(s.mi,{children:"n"}),e.jsx(s.mi,{children:"u"})]})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"n_u"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.5806em",verticalAlign:"-0.15em"}}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mord mathnormal",children:"n"}),e.jsx(s.span,{className:"msupsub",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsx(s.span,{className:"vlist",style:{height:"0.1514em"},children:e.jsxs(s.span,{style:{top:"-2.55em",marginLeft:"0em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mathnormal mtight",children:"u"})})]})}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.15em"},children:e.jsx(s.span,{})})})]})})]})]})})]})," update) is what makes the full-matrix sum affordable. It is two lines and it is the whole algorithm's viability."]}),`
`,e.jsxs(s.li,{children:["Use ",e.jsx(s.code,{children:"implicit"})," in production — it is the same math, in Cython, on sparse matrices."]}),`
`,e.jsxs(s.li,{children:["Ship the ",e.jsx(s.strong,{children:"factors"}),", not the model: item vectors into an ANN index, user vectors into a key-value store."]}),`
`]})}),`
`,e.jsx(s.h2,{children:"Build the matrix"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`def build_matrix(train, users=USERS, items=ITEMS):
    R  = np.zeros((len(users), len(items)))
    ui = {u: i for i, u in enumerate(users)}
    ii = {t: i for i, t in enumerate(items)}
    for r in train.itertuples():
        R[ui[r.user_id], ii[r.item_id]] += r.weight     # sum event weights
    return R

R = build_matrix(train)          # 6 x 9, and P9's column is all zeros
`})}),`
`,e.jsxs(s.p,{children:["Dense is fine at this size. At real scale use ",e.jsx(s.code,{children:"scipy.sparse.csr_matrix"})," — a 10M×1M dense matrix is 80 TB, and the same matrix at 0.01% density is about 800 MB."]}),`
`,e.jsx(s.h2,{children:"ALS"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`def als(R, k=3, alpha=1.0, reg=0.1, iters=20, seed=7):
    rng = np.random.default_rng(seed)
    m, n = R.shape
    X = rng.normal(0, 0.1, (m, k))
    Y = rng.normal(0, 0.1, (n, k))
    P = (R > 0).astype(float)          # preference
    C = 1.0 + alpha * R                # confidence
    losses = []

    for _ in range(iters):
        # one sweep = solve users with Y fixed, then items with X fixed
        for F, G, Cm, Pm in ((X, Y, C, P), (Y, X, C.T, P.T)):
            GtG = G.T @ G                                   # ← computed ONCE per half-sweep
            for row in range(F.shape[0]):
                c, p = Cm[row], Pm[row]
                nz = np.flatnonzero(c > 1)                  # only interacted cells
                Gn = G[nz]
                A  = GtG + Gn.T @ ((c[nz] - 1)[:, None] * Gn) + reg * np.eye(k)
                b  = Gn.T @ (c[nz] * p[nz])
                F[row] = np.linalg.solve(A, b)
        losses.append(float((C * (P - X @ Y.T) ** 2).sum()
                            + reg * ((X ** 2).sum() + (Y ** 2).sum())))
    return X, Y, losses

X, Y, losses = als(R, k=3, alpha=1.0, reg=0.1, iters=20)
assert all(losses[i] <= losses[i-1] + 1e-6 for i in range(1, len(losses))), "ALS loss must not increase"
`})}),`
`,e.jsx(s.p,{children:"The three lines that matter:"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`GtG = G.T @ G                                    # user-independent, once per sweep
nz  = np.flatnonzero(c > 1)                      # c = 1 exactly where r = 0
A   = GtG + Gn.T @ ((c[nz] - 1)[:, None] * Gn)   # rank-n_u correction
`})}),`
`,e.jsxs(s.p,{children:["That is the Gram trick from module 8, made concrete. ",e.jsx(s.code,{children:"GtG"})," accounts for ",e.jsx(s.strong,{children:"every"})," item in the catalog with confidence 1; the correction term adds the extra confidence only where the shopper actually interacted. So the objective sums over all ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"m"}),e.jsx(s.mo,{children:"×"}),e.jsx(s.mi,{children:"n"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"m \\times n"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6667em",verticalAlign:"-0.0833em"}}),e.jsx(s.span,{className:"mord mathnormal",children:"m"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}}),e.jsx(s.span,{className:"mbin",children:"×"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.4306em"}}),e.jsx(s.span,{className:"mord mathnormal",children:"n"})]})]})]})," cells while the code touches ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"O"}),e.jsx(s.mo,{stretchy:"false",children:"("}),e.jsxs(s.msub,{children:[e.jsx(s.mi,{children:"n"}),e.jsx(s.mi,{children:"u"})]}),e.jsxs(s.msup,{children:[e.jsx(s.mi,{children:"k"}),e.jsx(s.mn,{children:"2"})]}),e.jsx(s.mo,{stretchy:"false",children:")"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"O(n_u k^2)"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1.0641em",verticalAlign:"-0.25em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0278em"},children:"O"}),e.jsx(s.span,{className:"mopen",children:"("}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mord mathnormal",children:"n"}),e.jsx(s.span,{className:"msupsub",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsx(s.span,{className:"vlist",style:{height:"0.1514em"},children:e.jsxs(s.span,{style:{top:"-2.55em",marginLeft:"0em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mathnormal mtight",children:"u"})})]})}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.15em"},children:e.jsx(s.span,{})})})]})})]}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0315em"},children:"k"}),e.jsx(s.span,{className:"msupsub",children:e.jsx(s.span,{className:"vlist-t",children:e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.8141em"},children:e.jsxs(s.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mtight",children:"2"})})]})})})})})]}),e.jsx(s.span,{className:"mclose",children:")"})]})})]})," per user. Delete those three lines in favour of the naive ",e.jsx(s.code,{children:"Y.T @ np.diag(c) @ Y"})," and the algorithm is mathematically identical and computationally dead."]}),`
`,e.jsxs(s.p,{children:["The ",e.jsx(s.code,{children:"assert"})," on monotone loss is your correctness check. Each half-step is an exact minimiser, so a rising loss means a bug in the solve — nothing else."]}),`
`,e.jsx(h,{}),`
`,e.jsx(s.h2,{children:"Rank and evaluate"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`S = X @ Y.T                                       # 6 x 9 score matrix

def als_ranker(u):
    row = S[USERS.index(u)]
    return [ITEMS[j] for j in np.argsort(-row)]

s, per = evaluate(als_ranker, targets, k=3)
`})}),`
`,e.jsx(s.h2,{children:"Sweeping k"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`for k in (1, 2, 3, 4):
    Xk, Yk, lk = als(R, k=k, alpha=1.0, reg=0.1, iters=20)
    Sk = Xk @ Yk.T
    sk, _ = evaluate(lambda u, Sk=Sk: [ITEMS[j] for j in np.argsort(-Sk[USERS.index(u)])],
                     targets, k=3)
    print(f"k={k} loss={lk[-1]:6.2f} hit={sk['hit_rate']:.3f} ndcg={sk['ndcg']:.3f}")
`})}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-text",children:`k=1 loss= 19.32 hit=0.500 ndcg=0.333
k=2 loss=  9.96 hit=0.500 ndcg=0.377
k=3 loss=  5.32 hit=0.500 ndcg=0.377
k=4 loss=  3.33 hit=0.667 ndcg=0.522
`})}),`
`,e.jsxs(s.p,{children:["Note ",e.jsx(s.code,{children:"Sk=Sk"})," in the lambda's default argument. Without it, all four lambdas close over the ",e.jsx(s.em,{children:"same"})," ",e.jsx(s.code,{children:"Sk"})," binding and every row of the table reports the last model — a classic late-binding bug that produces a perfectly plausible, entirely wrong table."]}),`
`,e.jsxs(s.p,{children:["Loss falls monotonically with ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"k"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"k"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6944em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0315em"},children:"k"})]})})]}),", as it must: more capacity always fits training data better. Test NDCG is the number that decides, and here it keeps improving through ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"k"}),e.jsx(s.mo,{children:"="}),e.jsx(s.mn,{children:"4"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"k=4"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6944em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0315em"},children:"k"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}}),e.jsx(s.span,{className:"mrel",children:"="}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6444em"}}),e.jsx(s.span,{className:"mord",children:"4"})]})]})]})," — because with 6 users and 9 items there is nothing to overfit ",e.jsx(s.em,{children:"to"})," yet. On a real catalog this curve turns over, and where it turns is what you are looking for."]}),`
`,e.jsx(s.h2,{children:"Production"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`from implicit.als import AlternatingLeastSquares
from scipy.sparse import csr_matrix

Rs    = csr_matrix(R)
model = AlternatingLeastSquares(factors=64, regularization=0.05,
                                alpha=40, iterations=20, use_gpu=False)
model.fit(Rs)                                   # rows = users, cols = items

ids, scores = model.recommend(userid=0, user_items=Rs[0], N=10,
                              filter_already_liked_items=True)
`})}),`
`,e.jsxs(s.p,{children:["Same algorithm, Cython inner loops, sparse throughout. Note ",e.jsx(s.code,{children:"alpha=40"})," — the library's convention scales the raw interaction count, so useful values sit far above the ",e.jsx(s.code,{children:"alpha=1.0"})," used on NovaCart's already-weighted matrix. Check which convention your ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"R"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"R"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6833em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0077em"},children:"R"})]})})]})," is in before copying a number from a blog post."]}),`
`,e.jsxs(n,{title:"What you actually deploy",children:[e.jsxs(s.p,{children:["Not the model object. The ",e.jsx(s.strong,{children:"two factor matrices"}),", and they go to different places:"]}),e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`# nightly batch
X, Y, _ = als(R, k=64, alpha=40, reg=0.05, iters=20)

index = faiss.IndexFlatIP(64)     # inner product = the ALS scoring function
index.add(Y.astype("float32"))    # item factors
kv.mset({u: X[i].tobytes() for i, u in enumerate(USERS)})   # user factors

# request time, single-digit ms
x_u = np.frombuffer(kv.get(user_id), dtype="float32")
_, candidates = index.search(x_u.reshape(1, -1), 500)
`})}),e.jsx(s.p,{children:"This is exactly module 1's retrieval stage. The reason the dot-product form matters is right here: ANN indexes can search inner-product space efficiently, and they cannot search an arbitrary neural scoring function. Any model whose final step is not a dot product cannot be a retrieval model."}),e.jsxs(s.p,{children:["Two operational notes. ",e.jsx(s.strong,{children:"Factors are not stable across runs"})," — ALS converges to a different local optimum each night, so never diff yesterday's vectors against today's; compare recommendations instead. And ",e.jsx(s.strong,{children:"users who acted since the last batch are stale"}),"; the standard fix is folding-in, solving the single ridge step for one user against the frozen ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"Y"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"Y"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6833em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.2222em"},children:"Y"})]})})]})," without retraining anything."]})]}),`
`,e.jsx(r,{children:e.jsx(s.p,{children:"ALS gives you candidates from IDs alone. The ranker that orders them needs features — built next, without leaking the future."})}),`
`,e.jsx(l,{items:[{q:"Point at the Gram trick in the code and say what it buys.",a:"`GtG = G.T @ G` computed once per half-sweep, plus the rank-n_u correction `Gn.T @ ((c[nz]-1)[:,None] * Gn)`. GtG accounts for every catalog item at confidence 1; the correction adds extra confidence only where the user interacted. The objective still sums over all m×n cells, but the code touches O(n_u k²) per user instead of O(n k²)."},{q:"Why is `assert losses[i] <= losses[i-1]` a valid correctness check specifically for ALS?",a:"Each half-step is the exact closed-form minimiser of the objective with the other factor frozen, so neither can increase it — monotone non-increasing loss is a mathematical guarantee, not a hope. A rising loss therefore means a bug in the solve (wrong A, wrong b, wrong indexing), not a bad learning rate, since there is no learning rate."},{q:"What breaks without `Sk=Sk` in the sweep lambda?",a:"All lambdas close over the same variable binding rather than its value, so after the loop finishes every one of them reads the final Sk. The table then reports the k=4 model on every row — a plausible-looking, entirely wrong result. Binding the value as a default argument freezes it per iteration."},{q:"Why can't a model whose final scoring step is an arbitrary neural network serve as the retrieval stage?",a:"ANN indexes search inner-product or metric spaces; they cannot enumerate a general function over millions of items. Retrieval requires the score to factor into a user vector and an item vector combined by a dot product, so the item side can be precomputed and indexed. That constraint is why cross features are impossible in retrieval and available in ranking."}]}),`
`,e.jsx(c,{question:"You replace the Gram-trick lines with the mathematically identical `A = Y.T @ np.diag(c) @ Y + reg*np.eye(k)`. The loss curve is unchanged. What happens at production scale?",options:["Nothing — identical math means identical behaviour","Every user now costs a full pass over the catalog (O(n k²) plus an n×n diagonal), so a 1M-item catalog makes each ALS sweep intractable","The loss stops decreasing monotonically","The factors become unstable across runs"],correct:1})]})}function j(a={}){const{wrapper:s}={...i(),...a.components};return s?e.jsx(s,{...a,children:e.jsx(t,{...a})}):t(a)}export{j as default};
