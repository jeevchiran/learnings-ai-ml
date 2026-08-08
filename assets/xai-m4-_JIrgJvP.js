import{u as r,j as e,C as s,B as o,R as l,Q as a}from"./index-COnZx3Nm.js";function i(t){const n={annotation:"annotation",code:"code",em:"em",h2:"h2",h4:"h4",li:"li",math:"math",mi:"mi",mrow:"mrow",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...r(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(s,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Tabular: pass the training data so LIME learns each feature's distribution for realistic perturbation; ",e.jsx(n.code,{children:"discretize_continuous"})," turns weights into readable ",e.jsx(n.em,{children:'"feature in this range"'})," rules."]}),`
`,e.jsxs(n.li,{children:["Text: interpretable features are the words, and perturbation is ",e.jsx(n.strong,{children:"deleting words"})," and watching the score move."]}),`
`,e.jsxs(n.li,{children:["Weight sign = direction of push toward the predicted class; ",e.jsx(n.code,{children:"num_features"})," is the ",e.jsxs(n.span,{className:"katex",children:[e.jsx(n.span,{className:"katex-mathml",children:e.jsx(n.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(n.semantics,{children:[e.jsx(n.mrow,{children:e.jsx(n.mi,{mathvariant:"normal",children:"Ω"})}),e.jsx(n.annotation,{encoding:"application/x-tex",children:"\\Omega"})]})})}),e.jsx(n.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(n.span,{className:"base",children:[e.jsx(n.span,{className:"strut",style:{height:"0.6833em"}}),e.jsx(n.span,{className:"mord",children:"Ω"})]})})]})," knob."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"LIME is non-deterministic."})," Same row, two runs, possibly different signs. Re-run before trusting; raise ",e.jsx(n.code,{children:"num_samples"}),", fix the seed, or switch to SHAP."]}),`
`]})}),`
`,e.jsx(n.h2,{children:"Running LIME on Tabular Data"}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.code,{children:"lime"})," library packages the perturb → weight → fit loop. On a tabular classifier you pass the training data (so it knows each feature's distribution for perturbing), then explain one row:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# pip install lime scikit-learn
import lime.lime_tabular
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

data = load_breast_cancer()
X_tr, X_te, y_tr, y_te = train_test_split(
    data.data, data.target, test_size=0.2, random_state=0)

model = RandomForestClassifier(n_estimators=300, random_state=0).fit(X_tr, y_tr)

explainer = lime.lime_tabular.LimeTabularExplainer(
    X_tr,                              # used to learn feature stats for perturbing
    feature_names=data.feature_names,
    class_names=data.target_names,
    discretize_continuous=True,        # bins continuous features → readable rules
)

exp = explainer.explain_instance(
    X_te[0],                           # the ONE row we want explained
    model.predict_proba,               # black box: only predict_proba is used
    num_features=6,                    # keep the explanation short (the Ω term)
)
for feature, weight in exp.as_list():
    print(f"{weight:+.3f}  {feature}")
`})}),`
`,e.jsxs(n.p,{children:["Output reads as signed contributions for ",e.jsx(n.em,{children:"this"})," patient:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-text",children:`+0.182  worst perimeter <= 84.11
+0.147  worst concave points <= 0.06
-0.091  mean texture > 21.80
...
`})}),`
`,e.jsx(s,{title:"Reading the weights",children:e.jsxs(n.p,{children:["Each line is a coefficient of the local linear surrogate. ",e.jsx(n.strong,{children:"Positive"})," pushes toward the predicted class, ",e.jsx(n.strong,{children:"negative"})," away. The condition (",e.jsx(n.code,{children:"worst perimeter <= 84.11"}),") comes from ",e.jsx(n.code,{children:"discretize_continuous"})," — LIME explains in terms of ",e.jsx(n.em,{children:'"this feature is in this range"'}),", which is far more readable than a raw slope on a standardised value."]})}),`
`,e.jsx(n.h2,{children:"Text: Perturb by Deleting Words"}),`
`,e.jsx(n.p,{children:"For text, the interpretable features are the words themselves; perturbation = randomly removing words and seeing how the prediction shifts."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`from lime.lime_text import LimeTextExplainer

explainer = LimeTextExplainer(class_names=["neg", "pos"])
exp = explainer.explain_instance(
    "the acting was brilliant but the plot dragged badly",
    classifier_pipeline.predict_proba,   # e.g. TfidfVectorizer + LogisticRegression
    num_features=6,
)
exp.as_list()
# [('brilliant', +0.34), ('dragged', -0.21), ('badly', -0.18), ('plot', -0.05), ...]
`})}),`
`,e.jsxs(n.p,{children:["The model leaned on ",e.jsx(n.em,{children:"brilliant"})," (positive) and ",e.jsx(n.em,{children:"dragged"}),"/",e.jsx(n.em,{children:"badly"})," (negative) — exactly the words a human would point to. This is how you catch a sentiment model that keys on a punctuation quirk instead of meaning."]}),`
`,e.jsx(n.h2,{children:"The Catch: Instability"}),`
`,e.jsxs(n.p,{children:["LIME's perturbations are ",e.jsx(n.strong,{children:"random"}),", so two runs on the same instance can give different weights — sometimes different ",e.jsx(n.em,{children:"signs"}),". Causes and fixes:"]}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Cause"}),e.jsx(n.th,{children:"Fix"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Too few perturbation samples"}),e.jsxs(n.td,{children:["Raise ",e.jsx(n.code,{children:"num_samples"})," (e.g. 5000+)"]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Sensitive kernel width"}),e.jsxs(n.td,{children:["Tune ",e.jsx(n.code,{children:"kernel_width"}),"; wider = smoother but less local"]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Inherent randomness"}),e.jsx(n.td,{children:"Fix the seed; average explanations over several runs"})]})]})]}),`
`,e.jsx(s,{title:"When you see LIME wobble",children:e.jsx(n.p,{children:"Re-run an explanation a few times before trusting it. If the top features and their signs are stable across runs, believe it. If they flip, the explanation isn't reliable for that instance — increase samples or reach for SHAP, whose values are deterministic and axiomatically grounded."})}),`
`,e.jsx(o,{children:e.jsxs(n.p,{children:["LIME's honesty problem — ",e.jsx(n.em,{children:'is this the "right" explanation, or just one of many?'})," — has a principled answer. SHAP starts from game theory and asks: what is the ",e.jsx(n.em,{children:"uniquely fair"})," way to divide a prediction among its features? The next module derives it."]})}),`
`,e.jsx(n.h2,{children:"Practice"}),`
`,e.jsx(n.h4,{children:"Problem 1: Why pass training data to the explainer?"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"LimeTabularExplainer"})," requires ",e.jsx(n.code,{children:"X_tr"})," even though it explains a single test row. Why?"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," LIME perturbs by sampling plausible feature values. To do that realistically it needs each feature's distribution (mean, std, or bin edges) — learned from the training data. Without it, LIME couldn't generate sensible perturbations or discretise continuous features into readable ranges."]}),`
`,e.jsx(n.h4,{children:"Problem 2: Diagnosing a flipped sign"}),`
`,e.jsx(n.p,{children:"You explain the same row twice and a feature's weight flips from +0.12 to −0.09. What's happening and what do you do?"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," LIME's random perturbation sampling makes it non-deterministic; with too few samples the local fit is noisy and unstable. Increase ",e.jsx(n.code,{children:"num_samples"}),", fix the random seed for reproducibility, and consider averaging several runs. Persistent flipping means the explanation isn't trustworthy for that instance."]}),`
`,e.jsx(l,{items:[{q:"Why does LimeTabularExplainer need the training set to explain a single test row?",a:"It perturbs by sampling plausible values for each feature, which requires knowing each feature's distribution — means, standard deviations, or bin edges — and those are learned from the training data. Without them the perturbations would be unrealistic and the discretised range labels could not be formed."},{q:"A feature's LIME weight flips from +0.12 to -0.09 across two runs. Diagnose and prescribe.",a:"The perturbation sample is random and too small, so the local linear fit is dominated by sampling noise. Raise num_samples to several thousand, fix the seed for reproducibility, and average across runs. If the sign still flips, the explanation is not trustworthy for that instance — use SHAP, whose values are deterministic."},{q:"How does LIME perturb text, and why is that choice appropriate?",a:"By randomly deleting words from the sentence and re-scoring. It is appropriate because the interpretable unit for text IS the word — so each coefficient reads directly as 'this word contributed this much', which is what a human wants to check."},{q:"Name the concrete debugging win a text LIME explanation gives you.",a:"It exposes a model keying on the wrong token. If a sentiment classifier's top weights land on punctuation, a reviewer's username, or a formatting artefact rather than words like 'brilliant' and 'dragged', you have found a spurious correlation that accuracy alone would never surface."}]}),`
`,e.jsx(a,{question:"On text data, how does LIME generate perturbations of an input sentence?",options:["It adds random Gaussian noise to word embeddings","It randomly removes words and observes how the prediction changes","It translates the sentence into another language","It requires the model gradients with respect to each token"],correct:1}),`
`,e.jsx(a,{question:"What is LIME's main practical weakness?",options:["It cannot be applied to neural networks","It requires access to model internals","Its random perturbations make explanations unstable across runs","It only produces global explanations"],correct:2})]})}function h(t={}){const{wrapper:n}={...r(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}export{h as default};
