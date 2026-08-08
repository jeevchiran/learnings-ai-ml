import{u as i,j as e,C as t,B as o,R as l,Q as n}from"./index-COnZx3Nm.js";function r(s){const a={code:"code",em:"em",h2:"h2",h4:"h4",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...i(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(t,{title:"TL;DR",children:e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:["Tabular workflow: ",e.jsx(a.code,{children:"TreeExplainer"})," → ",e.jsx(a.code,{children:"waterfall"})," for one row, ",e.jsx(a.code,{children:"beeswarm"})," for the model, ",e.jsx(a.code,{children:"scatter"})," for one feature's shape."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Verify additivity with an assert"})," — SHAP values plus base value must equal ",e.jsx(a.code,{children:"model.predict()"})," on every row."]}),`
`,e.jsxs(a.li,{children:['Images: a "feature" is a ',e.jsx(a.strong,{children:"region"}),", not a pixel, and absent regions are filled from a ",e.jsx(a.strong,{children:"baseline"}),". Deep SHAP is the fast path for nets."]}),`
`,e.jsx(a.li,{children:"Correlated features make SHAP split credit oddly because marginalising one creates unrealistic inputs. Interpret them as a group."}),`
`,e.jsx(a.li,{children:"The payoff is debugging: a heatmap over the snow instead of the wolf exposes a leak no accuracy number can."}),`
`]})}),`
`,e.jsx(a.h2,{children:"Numerical Data: End-to-End"}),`
`,e.jsx(a.p,{children:"The most common workflow — a gradient-boosted tabular model, explained exactly with Tree SHAP:"}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-python",children:`import shap
from xgboost import XGBRegressor
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split

X, y = fetch_california_housing(return_X_y=True, as_frame=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)
model = XGBRegressor(n_estimators=400, max_depth=4).fit(X_tr, y_tr)

explainer = shap.TreeExplainer(model)
sv = explainer(X_te)                 # SHAP values for every test row (exact)

# One prediction, explained:
shap.plots.waterfall(sv[0])          # base value → this row's prediction, step by step
# The whole model:
shap.plots.beeswarm(sv)              # global importance + direction across all rows
shap.plots.scatter(sv[:, "MedInc"])  # how median income's effect varies (dependence)
`})}),`
`,e.jsxs(a.p,{children:["The base value is average house price; the waterfall shows how ",e.jsx(a.em,{children:"this"})," neighbourhood's median income, location, and occupancy push the prediction up or down to its final value. ",e.jsx(a.strong,{children:"Verify additivity yourself"})," — it's a one-liner:"]}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-python",children:`import numpy as np
assert np.allclose(sv.values.sum(1) + sv.base_values, model.predict(X_te), atol=1e-4)
# SHAP values + base == model prediction, for every row
`})}),`
`,e.jsx(t,{title:"A caution on correlated features",children:e.jsxs(a.p,{children:['When features are strongly correlated, marginalising one "absent" feature can produce unrealistic inputs (e.g. ',e.jsx(a.code,{children:"rooms=8"})," with ",e.jsx(a.code,{children:"bedrooms=1"}),"), and SHAP may split credit between them in ways that look surprising. It's not a bug — SHAP is being fair to the ",e.jsx(a.em,{children:"model's"})," behaviour, including on inputs the correlation makes rare. Interpret correlated features as a ",e.jsx(a.em,{children:"group"}),", not in isolation."]})}),`
`,e.jsx(a.h2,{children:'Image Data: A "Feature" Is a Region'}),`
`,e.jsxs(a.p,{children:["For an image classifier there are too many pixels to treat each as a feature, so SHAP groups them — into superpixels (masked regions) or evaluates per-pixel via gradients. Absent pixels are replaced by a ",e.jsx(a.strong,{children:"baseline"})," (blurred image, grey, or dataset mean). The result is a heatmap: red where pixels ",e.jsx(a.em,{children:"supported"})," the class, blue where they ",e.jsx(a.em,{children:"argued against"})," it."]}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-python",children:`import shap, torch

# model: a trained image classifier (e.g. torchvision CNN), preprocessed inputs
masker = shap.maskers.Image("inpaint_telea", X_img[0].shape)  # how to "remove" pixels
explainer = shap.Explainer(model_predict, masker, output_names=class_names)

sv = explainer(X_img[:2], max_evals=3000, batch_size=64)
shap.image_plot(sv)   # overlays red/blue SHAP heatmap on each image
`})}),`
`,e.jsxs(a.p,{children:["For deep nets specifically, ",e.jsx(a.strong,{children:"Deep SHAP"})," (a DeepLIFT-based estimator) is far faster than masking:"]}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-python",children:`background = X_img[:100]                      # reference distribution
de = shap.DeepExplainer(model, background)    # torch or TF model
shap_vals = de.shap_values(X_img[100:104])
shap.image_plot(shap_vals, X_img[100:104])
`})}),`
`,e.jsx(t,{title:"This is how you catch a cheating vision model",children:e.jsxs(a.p,{children:['Run SHAP on a "dog vs. wolf" classifier and the heatmap lights up the ',e.jsx(a.strong,{children:"snow in the background"}),', not the animal — the model learned "snow ⇒ wolf." No accuracy number reveals this; the pixel-level attribution does immediately. Image SHAP is a debugging tool as much as an explanation.']})}),`
`,e.jsx(o,{children:e.jsxs(a.p,{children:["Deep SHAP borrows its engine from ",e.jsx(a.strong,{children:"DeepLIFT"})," — a neural-net-specific method that propagates contributions backward against a reference input, in a single pass. The next module opens that engine up."]})}),`
`,e.jsx(a.h2,{children:"Practice"}),`
`,e.jsx(a.h4,{children:'Problem 1: What replaces "absent" pixels?'}),`
`,e.jsx(a.p,{children:`In image SHAP you can't literally delete a pixel. What happens to "absent" pixels, and why does the choice matter?`}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Solution:"})," Absent pixels are replaced by a ",e.jsx(a.strong,{children:"baseline"})," — a blurred version, grey, inpainting, or the dataset mean — because SHAP must still feed the model a full image. The choice matters because SHAP measures contributions ",e.jsx(a.em,{children:"relative to that baseline"}),'; a different baseline ("what does absent mean?") shifts the attributions, just as the background dataset does for tabular Kernel SHAP.']}),`
`,e.jsx(a.h4,{children:"Problem 2: Reading an image heatmap"}),`
`,e.jsx(a.p,{children:"A cat classifier's SHAP heatmap shows strong red over a text watermark in the corner and little over the cat. What do you conclude?"}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Solution:"})," The model is keying on the ",e.jsx(a.strong,{children:"watermark"}),", not the cat — a spurious correlation (likely a data leak where that watermark co-occurs with the class). Despite possibly high accuracy, the model isn't learning the intended concept. Fix the data (remove/randomise the watermark) and retrain."]}),`
`,e.jsx(l,{items:[{q:"Write the one-line check that your SHAP values are correct, and say what it tests.",a:"assert np.allclose(sv.values.sum(1) + sv.base_values, model.predict(X)). It tests local accuracy — every row's attributions plus the base value must reconstruct the model's actual output. If it fails, the explainer is mismatched to the model or the wrong output margin is being explained."},{q:"Why can't each pixel be its own feature in image SHAP, and what replaces that scheme?",a:"A 224x224 image has over 50,000 pixels, so the coalition space is impossibly large and a single-pixel attribution is meaningless anyway. Pixels are grouped into regions or superpixels, and 'absent' regions are filled from a baseline — a blur, grey, inpainting, or the dataset mean."},{q:"A wolf-vs-dog classifier's heatmap glows over the snow. What has the model learned, and what is the fix?",a:"It learned 'snow implies wolf' — a background correlation in the training photos, not anything about the animal. The fix is in the data: collect wolves on non-snowy backgrounds and dogs on snowy ones, or augment backgrounds, then retrain. No amount of held-out accuracy would have surfaced this."},{q:"SHAP splits credit strangely between two highly correlated features. Bug or expected?",a:"Expected. Marginalising one of a correlated pair produces inputs the data almost never contains — 8 rooms with 1 bedroom — and SHAP faithfully reports how the MODEL behaves there. The correct response is to interpret the correlated features as a group rather than ranking them against each other."}]}),`
`,e.jsx(n,{question:"When applying SHAP to images, how are 'features' typically defined?",options:["Each individual weight of the network","Groups of pixels (superpixels/regions), with absent regions replaced by a baseline","The class labels themselves","The gradients of the loss function"],correct:1}),`
`,e.jsx(n,{question:"After computing SHAP values with TreeExplainer, summing them and adding the base value gives:",options:["A value close to zero for every row","The exact model prediction for each row","The global feature importance","The training-set average only"],correct:1})]})}function c(s={}){const{wrapper:a}={...i(),...s.components};return a?e.jsx(a,{...s,children:e.jsx(r,{...s})}):r(s)}export{c as default};
