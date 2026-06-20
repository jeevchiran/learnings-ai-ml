export const courses = [
  {
    id: 'etl-pyspark',
    title: 'PySpark and ETL',
    description: '10 modules covering distributed data processing, DataFrames, SQL, UDFs, data cleaning, and performance optimization.',
    color: '#f59e0b',
    trackPath: 'etl-pyspark',
    modules: [
      { id: 'etl-pyspark-m1',  title: 'ETL with PySpark',               file: '01-etl-pyspark.html',                 description: 'Extract, transform, and load data using PySpark pipelines.',                                  readTime: 15 },
      { id: 'etl-pyspark-m2',  title: 'In-Memory Data Processing',       file: '02-in-memory-processing.html',         description: 'Understand why Spark keeps data in memory vs disk-based processing.',                        readTime: 12 },
      { id: 'etl-pyspark-m3',  title: 'Spark RDDs',                      file: '03-spark-rdds.html',                   description: "Work with Resilient Distributed Datasets — Spark's foundational abstraction.",               readTime: 15 },
      { id: 'etl-pyspark-m4',  title: 'DataFrames: PySpark vs Pandas',   file: '04-dataframes-pyspark-vs-pandas.html', description: 'Compare the same operations in both APIs side-by-side.',                                    readTime: 18 },
      { id: 'etl-pyspark-m5',  title: 'Querying with PySpark SQL',        file: '05-pyspark-sql.html',                  description: 'Register DataFrames as tables and query them with SQL syntax.',                             readTime: 15 },
      { id: 'etl-pyspark-m6',  title: 'UDFs in PySpark',                 file: '06-udfs-pyspark.html',                 description: 'Write and apply User-Defined Functions for custom transformations.',                        readTime: 15 },
      { id: 'etl-pyspark-m7',  title: 'Data Cleaning',                   file: '07-data-cleaning.html',                description: 'Handle nulls, duplicates, inconsistent formats, and invalid values.',                       readTime: 18 },
      { id: 'etl-pyspark-m8',  title: 'Data Exploration',                file: '08-data-exploration.html',             description: 'Summarize, profile, and understand your cleaned dataset.',                                  readTime: 15 },
      { id: 'etl-pyspark-m9',  title: 'Transformation Operations',       file: '09-transformation-operations.html',    description: 'Reshape, join, aggregate, and pivot data for analysis.',                                    readTime: 18 },
      { id: 'etl-pyspark-m10', title: 'Caching and Broadcast Variables', file: '10-caching-broadcasting.html',         description: 'Optimize your Spark pipeline with caching strategies and broadcast joins.',                  readTime: 15 },
    ],
  },
  {
    id: 'regression',
    title: 'Regression: Linear and Logistic',
    description: '4 interactive modules with full mathematical derivations, KaTeX equations, and Plotly.js widgets.',
    color: '#3b82f6',
    trackPath: 'regression',
    modules: [
      { id: 'regression-m1', title: 'Linear Regression',                    file: '01-linear-regression.html',         description: 'Assumptions, coefficient interpretation, performance evaluation, house price prediction.',    readTime: 20 },
      { id: 'regression-m2', title: 'Mathematics of Linear Regression',     file: '02-math-linear-regression.html',    description: 'Normal equation derivation, gradient descent animation, Gauss-Markov theorem.',             readTime: 25 },
      { id: 'regression-m3', title: 'Logistic Regression',                  file: '03-logistic-regression.html',       description: 'Binary and multiclass classification, regularization, ROC curves.',                        readTime: 20 },
      { id: 'regression-m4', title: 'Mathematics of Logistic Regression',   file: '04-math-logistic-regression.html',  description: "MLE, cross-entropy, Newton's method, Bayesian interpretation of regularization.",          readTime: 25 },
    ],
  },
  {
    id: 'hypothesis-testing',
    title: 'Hypothesis Testing',
    description: '5 interactive modules covering errors, alpha, p-value, Z-tests, t-tests, A/B testing, and paired tests.',
    color: '#10b981',
    trackPath: 'hypothesis-testing',
    modules: [
      { id: 'ht-m1', title: 'Foundations of Hypothesis Testing',        file: '01-ht-foundations.html',      description: 'Decision framework, null and alternative hypotheses, one- and two-tailed tests.',         readTime: 15 },
      { id: 'ht-m2', title: 'Errors, Alpha, p-value, Critical Value',   file: '02-errors-alpha-pvalue.html', description: 'Type I/II errors, significance level, power, p-value interpretation.',                  readTime: 18 },
      { id: 'ht-m3', title: 'One-Sample Z-Test',                        file: '03-one-sample-z.html',        description: 'Testing a population mean with known sigma. Full derivation, confidence intervals.',     readTime: 18 },
      { id: 'ht-m4', title: 'Two-Sample Tests and A/B Testing',         file: '04-two-sample-tests.html',    description: "Two-population Z-test, Welch's t-test, A/B testing, Cohen's d effect size.",            readTime: 20 },
      { id: 'ht-m5', title: 'Paired t-Test',                            file: '05-paired-t.html',            description: 'Dependent samples, before-after designs, reduction to one-sample t on differences.',    readTime: 15 },
    ],
  },
  {
    id: 'clustering',
    title: 'K-Means Clustering',
    description: '4 interactive modules covering distance metrics, centroids, K-means algorithm, WCSS, elbow method, and silhouette score.',
    color: '#8b5cf6',
    trackPath: 'clustering',
    modules: [
      { id: 'clustering-m1', title: 'Why Clustering? Intuition and K-Means', file: '01-clustering-intro.html',   description: 'Unsupervised learning, partitioning, real-world applications, animated demo.',         readTime: 12 },
      { id: 'clustering-m2', title: 'Distance, Means, and Centroids',        file: '02-distance-centroids.html', description: 'Euclidean, Manhattan, cosine distance. Centroid as minimiser of squared distances.',   readTime: 15 },
      { id: 'clustering-m3', title: 'Inertia (WCSS) and the Elbow Method',   file: '03-inertia-wcss.html',       description: 'WCSS as the K-means objective, coordinate descent view, elbow method and limits.',     readTime: 15 },
      { id: 'clustering-m4', title: 'Silhouette Score and Evaluation',       file: '04-silhouette-metrics.html', description: 'Silhouette formula, silhouette plots, Davies-Bouldin, Calinski-Harabasz.',             readTime: 15 },
    ],
  },
  {
    id: 'decision-trees',
    title: 'Decision Trees and Ensembles',
    description: '7 interactive modules from splitting a single node to training gradient-boosted forests. Full derivations.',
    color: '#ef4444',
    trackPath: 'decision-trees',
    modules: [
      { id: 'dt-m1', title: 'Decision Trees — Intuition and Structure',   file: '01-decision-trees-intro.html',   description: 'Why trees, prediction, tree anatomy, decision boundary as axis-aligned cuts.',        readTime: 15 },
      { id: 'dt-m2', title: 'Impurity Measures and the Training Process', file: '02-impurity-training.html',      description: 'Gini impurity, entropy, misclassification rate, information gain, CART algorithm.',   readTime: 20 },
      { id: 'dt-m3', title: 'Gini Index Splits',                          file: '03-gini-splits.html',            description: 'Full worked example, threshold search, continuous vs categorical, Gini vs entropy.', readTime: 20 },
      { id: 'dt-m4', title: 'Advantages, Limitations, and Pruning',       file: '04-advantages-limitations.html', description: 'Interpretability strengths, variance and instability, pre-pruning and cost-complexity.', readTime: 15 },
      { id: 'dt-m5', title: 'Bagging and Random Forests',                 file: '05-bagging-random-forests.html', description: 'Bootstrap aggregating, variance reduction, random feature subsets, OOB error.',       readTime: 20 },
      { id: 'dt-m6', title: 'Gradient Boosting',                          file: '06-gradient-boosting.html',      description: 'Functional gradient descent, pseudo-residuals, shrinkage, XGBoost overview.',        readTime: 22 },
      { id: 'dt-m7', title: 'Hyperparameter Tuning',                      file: '07-hyperparameter-tuning.html',  description: 'Every knob for RF and GB through the bias-variance lens with interactive simulators.', readTime: 20 },
    ],
  },
  {
    id: 'nlp',
    title: 'Natural Language Processing',
    description: '10 interactive modules from raw text to language models. spaCy + NLTK code throughout.',
    color: '#06b6d4',
    trackPath: 'nlp',
    modules: [
      { id: 'nlp-m1',  title: 'Text Normalization & Edit Distance',          file: '01-text-normalization-edit-distance.html',        description: 'Tokenization, lowercasing, stopword removal, Levenshtein distance with DP widget.',       readTime: 15 },
      { id: 'nlp-m2',  title: 'Stemming, Lemmatization & Noisy Channel',     file: '02-stemming-lemmatization-noisy-channel.html',     description: 'Porter/Snowball stemmers, lemmatization, Bayesian noisy channel for spell correction.',   readTime: 15 },
      { id: 'nlp-m3',  title: 'POS Tagging & Shallow Parsing',               file: '03-pos-tagging-shallow-parsing.html',              description: 'Penn Treebank tags, HMM-based tagging, NP chunking, live color-coded POS widget.',       readTime: 15 },
      { id: 'nlp-m4',  title: 'CFG, Parse Trees & Deep Parsing',             file: '04-cfg-parse-trees-deep-parsing.html',             description: 'Context-free grammars, constituency trees, structural ambiguity, SVG step-through parser.', readTime: 18 },
      { id: 'nlp-m5',  title: 'Lexical Semantics & WSD',                     file: '05-lexical-semantics-wsd.html',                    description: 'WordNet synsets, hypernyms, polysemy vs homonymy, Lesk algorithm step-through.',           readTime: 15 },
      { id: 'nlp-m6',  title: 'Distributional Semantics & PMI',              file: '06-distributional-semantics-pmi.html',             description: 'Co-occurrence matrices, PMI/PPMI formulas, live Plotly heatmap from editable corpus.',     readTime: 18 },
      { id: 'nlp-m7',  title: 'NER, IOB, CRF, SRL & Coreference',           file: '07-ner-iob-crf-srl-coreference.html',             description: 'Named entities, BIO tagging, CRF sequence models, semantic roles, coreference chains.',    readTime: 18 },
      { id: 'nlp-m8',  title: 'BoW, TF-IDF & Topic Modeling',               file: '08-bow-tfidf-topic-modeling.html',                 description: 'Bag of words, TF-IDF formula, IDF weighting, NMF topic modeling with Plotly heatmap.',    readTime: 18 },
      { id: 'nlp-m9',  title: 'Word Embeddings',                             file: '09-word-embeddings.html',                          description: 'word2vec skip-gram/CBOW, embedding space, cosine similarity, analogy tasks, BERT overview.', readTime: 20 },
      { id: 'nlp-m10', title: 'N-gram Language Models & Applications',       file: '10-ngram-lm-applications.html',                   description: 'Chain rule, Laplace smoothing, perplexity, text generation, summarization, MT overview.',  readTime: 18 },
    ],
  },
  {
    id: 'pandas-eda',
    title: 'Pandas EDA and Visualization',
    description: '9 interactive modules covering data cleaning, missing values, outlier detection, and visualization using one NYC taxi-trip dataset.',
    color: '#f97316',
    trackPath: 'pandas-eda',
    modules: [
      { id: 'eda-m1', title: 'EDA Foundations & First Look',           file: '01-eda-foundations.html',              description: 'shape, dtypes, head/info/describe — what you must know before cleaning anything.',         readTime: 12 },
      { id: 'eda-m2', title: 'Missing Values',                         file: '02-missing-values.html',               description: "isna ratios, dropna vs fillna, and why mean isn't always the right fill.",               readTime: 15 },
      { id: 'eda-m3', title: 'Data Quality & Invalid Values',          file: '03-data-quality-invalid-values.html',  description: 'Negative fares, zero-distance trips, and boolean-mask business rules.',                   readTime: 15 },
      { id: 'eda-m4', title: 'Outlier Detection & Treatment (IQR)',    file: '04-outlier-detection-iqr.html',        description: 'Tukey fences, cap vs remove, telling a real error from a flat-rate fare.',                 readTime: 15 },
      { id: 'eda-m5', title: 'Datetime Parsing & Feature Engineering', file: '05-datetime-feature-engineering.html', description: 'Turning timestamp strings into hour, weekday, and duration features.',                     readTime: 15 },
      { id: 'eda-m6', title: 'Univariate Visualization',               file: '06-univariate-visualization.html',     description: 'Histograms, boxplots, and reading skew before comparing variables.',                      readTime: 15 },
      { id: 'eda-m7', title: 'Bivariate Analysis',                     file: '07-bivariate-analysis.html',           description: 'Scatter plots, groupby, and why a correlation can hide in dirty data.',                   readTime: 15 },
      { id: 'eda-m8', title: 'Multivariate Analysis',                  file: '08-multivariate-analysis.html',        description: 'Correlation matrices and pivot tables across several variables at once.',                  readTime: 15 },
      { id: 'eda-m9', title: 'Capstone — End-to-End EDA Workflow',     file: '09-capstone-eda-workflow.html',        description: 'Chaining every prior step into one repeatable pipeline.',                                  readTime: 20 },
    ],
  },
];

/* ── Derived lookups (built once at module load) ── */
export const moduleById = {};

courses.forEach(course => {
  course.modules.forEach((mod, idx) => {
    moduleById[mod.id] = {
      ...mod,
      courseId: course.id,
      courseTitle: course.title,
      coursePath: course.trackPath,
      courseColor: course.color,
      moduleNumber: idx + 1,
      totalInCourse: course.modules.length,
      prevId: course.modules[idx - 1]?.id || null,
      nextId: course.modules[idx + 1]?.id || null,
    };
  });
});

export function getPrevNext(moduleId) {
  const m = moduleById[moduleId];
  if (!m) return { prev: null, next: null };
  return {
    prev: m.prevId ? moduleById[m.prevId] : null,
    next: m.nextId ? moduleById[m.nextId] : null,
  };
}

export const allModules = Object.values(moduleById);
