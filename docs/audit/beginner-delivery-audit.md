# Beginner content delivery audit

Audit date: 2026-09-25. Primary scope: the registered React/MDX curriculum.

## What changed

The main goal was to help a first-time learner follow the content: establish prerequisites, show concrete inputs and outputs, explain terms, and let the learner control the pace. Every registered page now receives a track refresher and lesson focus; long lessons have a section outline that updates when explanations open. Prediction questions can reveal their reasoning without a guess, quizzes can be retried, and completion is an explicit learner action.

Wide visuals and tables have keyboard-scrollable boundaries. Long equations and inline code stay within the reading column. Mobile guide cards stack vertically. Focus indicators and reduced-motion styles support navigation. Missing main titles were added to 16 lessons.

The Pandas track now supplies a reproducible 30-row, 12-column synthetic CSV. The beta-VAE visual compares two hypothetical solutions using actual reconstruction-plus-weighted-KL arithmetic; its bars no longer imply measured disentanglement or collapse probabilities. A median-imputation calculation and two page runtime errors were also repaired.

## Coverage and interpretation

- Structural inventory covers all 25 tracks and 273 registered MDX pages, including quiz pages. It checks imports, registration, quiz indices, headings, internal module targets and math rendering.
- Browser coverage visits every registered page, reveals prediction explanations, changes every discovered range slider to both boundaries, and checks a single title, a guide, math errors, page exceptions and content width at 1280 and 390 pixels.
- Editorial work reviewed track takeaways and selected explanations, worked examples, recap items and answer keys. Corrections below describe the actual edits; this is not a claim that every sentence, derivation or answer in the roughly 388,000-word curriculum received an independent scientific verification.
- Notebook syntax checks cover all 23 notebooks and 362 standard Python cells. The three labs listed below were also executed. Heavy training and Spark notebooks were not run end to end.
- Legacy standalone HTML lessons were not brought to parity with the React curriculum. Existing external notebook links remain available.

## Track findings and updates

| Track | Pages checked | Editorial and delivery updates |
|---|---:|---|
| math-ml | 12 | Explained summation with arithmetic; qualified cosine similarity and Gaussian/MSE assumptions; corrected Hessian tests; added a numerical Jacobian example. |
| pandas-eda | 10 | Added runnable synthetic CSV/setup; repaired currency rendered as math; corrected median imputation and boxplot explanations; clarified cleaning scope and KDE bandwidth. |
| hypothesis-testing | 6 | Corrected power/sample-size trade-offs and Z-test versus t-test answer choices. |
| etl-pyspark | 11 | Added missing titles; corrected DataFrame/RDD cache defaults and related quiz/notebook comments. |
| regression | 5 | Separated fitting, inference and Gauss-Markov assumptions; qualified R-squared and logistic optima; fixed a Plotly initialization crash. |
| decision-trees | 8 | Corrected regression forest feature-sampling default and claims about monotonically improving accuracy. |
| clustering | 5 | Repaired a runtime MDX expression; qualified scaling guidance and corrected sample arithmetic. |
| nlp | 11 | Added missing titles; qualified lemmatization claims; made long formulas fit mobile reading. |
| deep-learning | 12 | Corrected tanh/GELU descriptions and zero-initialization symmetry wording. |
| cnn | 11 | Repaired tab-corrupted multiplication commands in the parameter-count example. |
| rnn | 15 | Added the shared prerequisite/example guide, section navigation and visual containment; retained track content. |
| naive-bayes | 9 | Aligned the base-rate prediction, worked numbers and recall; added a natural-frequency explanation. |
| model-eval | 9 | Corrected the ANOVA F-score interpretation. |
| xai | 11 | Qualified SHAP exactness and approximation claims. |
| association-rules | 5 | Added a missing title and repaired mobile formula containment. |
| time-series | 7 | Corrected the ADF null interpretation; executed the full lab. |
| recsys | 19 | Qualified task framing, ranking metrics, implicit ALS targets and probability calibration; distinguished historical snapshots from exact rolling windows and corrected the leak check; executed the full lab. |
| computer-vision | 20 | Distinguished affine and projective invertibility; corrected detection matching/count and anchor assumptions. |
| transfer-learning | 13 | Added shared delivery improvements; retained the reviewed track summaries and visuals. |
| attention-seq2seq | 12 | Added shared delivery improvements and repaired mobile formula containment. |
| transformers | 14 | Clarified learned input embeddings and mask-dependent context; qualified translation architecture claims; fixed mobile code wrapping. |
| vae | 12 | Qualified ELBO/disentanglement/collapse claims; repaired corrupted math; replaced fabricated beta-quality percentages with a worked loss comparison. |
| gan | 12 | Added shared delivery improvements; retained the reviewed track summaries and visuals. |
| diffusion | 12 | Removed unconditional mode-coverage, free-speed and invertible-VAE claims. |
| genai-risks | 12 | Added shared delivery improvements; executed the full lab. |

## Validation

- `npm test`: 208 passing tests in 13 files, including explanation access, quiz retries, prerequisite links, dynamic section navigation, median arithmetic and beta loss arithmetic.
- `node scripts/audit-content.mjs --write`: 273 modules, 250 widget uses, 1,321 prediction/quiz questions and 4,879 math expressions; no structural errors. A valid answer index does not establish that an answer is scientifically correct.
- `npm run build`: passed. All 273 production pages passed browser checks at 1280 and 390 pixels with zero recorded page exceptions, math errors or page-width overflows. The recommender pages and regression chart page were checked again after the final corrections.
- Targeted browser interactions passed: repeated Run/Reset/Step, navigation during animation, keyboard focus via the outline, beta loss comparison, and no automatic completion after 31 seconds.
- The production CSV download returned HTTP 200 with 30 rows and 12 columns.
- The recommender historical-lookup example passed checks for timestamp ties, strict decision-time boundaries, missing history and expired window entries.
- `python scripts/audit-notebooks.py`: 23 notebooks, 362 standard Python cells parsed, no syntax errors. IPython-specific cells are counted separately.
- Executed sequential code cells: recommender lab (22), time-series lab (24), GenAI-risk lab (8); no execution errors. Plots used a headless Matplotlib backend. Optional branches depend on installed packages.
- Executed Pandas capstone against the supplied CSV: 24 rows after its filters; outlier IDs 6, 18 and 26.

Evidence: [module-by-module coverage](module-coverage.md), [targeted interactions](interaction-results.json), [content inventory](content-inventory.json), [browser results](browser-results.json), [notebook syntax results](notebook-results.json), [execution results](execution-results.json).

## Checks that still require judgment

Twenty-two non-quiz lessons have no dedicated interactive widget. These are largely code walkthroughs, pipelines or conceptual lessons with tables and worked examples; the inventory keeps that signal as a review prompt, not an automatic defect. Adding an unrelated animation would not improve their explanation.

Browser success is a rendering and interaction smoke test. It does not establish the numerical correctness of all 233 widget implementations, exhaustively exercise every button/select, measure screen-reader usability, or replace observing beginners use the material. The screenshots provide representative visual evidence, not a manual review of every viewport. The pre-existing large Plotly bundle remains a performance limitation on slow connections.

## Sources used for substantive corrections

- [Spark DataFrame cache](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.cache.html): the DataFrame cache default differs from the RDD default.
- [scikit-learn linear models](https://scikit-learn.org/stable/modules/linear_model.html) and [R-squared](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.r2_score.html): fitting conditions and negative held-out scores.
- [RandomForestRegressor](https://scikit-learn.org/1.8/modules/generated/sklearn.ensemble.RandomForestRegressor.html): regression feature-sampling default.
- [NIST on sample size and power](https://www.itl.nist.gov/div898/handbook/prc/section2/prc222.htm): how power depends on sample size and the test design.
- [Matplotlib boxplot](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.boxplot.html): Tukey-style whisker convention.
- [statsmodels ADF test](https://www.statsmodels.org/stable/generated/statsmodels.tsa.stattools.adfuller.html): unit-root null.
- [Locatello et al.](https://arxiv.org/abs/1811.12359): limitations of unsupervised disentanglement guarantees.

Representative views: [mobile first lesson](math-m1-mobile.png), [mobile later lesson](eda-m6-mobile.png), [beta loss comparison](beta-loss-desktop.png).
