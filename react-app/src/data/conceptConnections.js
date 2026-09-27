// Each stage starts at a registered lesson. Arrows describe the learning path,
// not a claim that every model implements the same computational pipeline.
const path = (stages, next, connection) => ({ stages: stages.map(([start, title, why]) => ({ start, title, why })), next, connection })
export const conceptConnections = {
  'math-ml': path([
    ['math-m1', 'Represent numbers', 'Vectors describe one example. Matrices transform it. Eigenvectors and PCA reveal useful directions.'],
    ['math-m5', 'Describe uncertainty', 'Probability describes possible outcomes; expectation summarizes them; likelihood scores how well a model explains observations.'],
    ['math-m9', 'Learn from error', 'Derivatives connect a change in a parameter to a change in loss. Gradient descent uses that information to choose an update.'],
  ], 'regression-m2', 'The vector operations and derivatives become a concrete algorithm for fitting a regression line.'),
  'pandas-eda': path([
    ['eda-m1', 'Inspect the table', 'Identify rows, columns, types and missing values before trusting a summary.'],
    ['eda-m3', 'Define usable data', 'Investigate invalid and unusual values, then derive useful features such as trip duration.'],
    ['eda-m6', 'See patterns', 'Move from one-variable distributions to relationships between variables, then assemble a repeatable analysis.'],
  ], 'regression-m1', 'The cleaned columns become model inputs. Patterns you saw suggest relationships to test, not conclusions to assume.'),
  'hypothesis-testing': path([
    ['ht-m1', 'State a claim', 'A null hypothesis specifies the reference model. Decide which departures would matter.'],
    ['ht-m2', 'Measure uncertainty', 'Sampling variability connects an observed difference to a test statistic, p-value and the possibility of decision errors.'],
    ['ht-m3', 'Match the design', 'One sample, independent groups and paired observations need different calculations because they contain different information.'],
  ], 'me-m2', 'A model comparison also depends on which observations were held out and how uncertainty was assessed.'),
  'etl-pyspark': path([
    ['etl-pyspark-m1', 'Plan the flow', 'Extraction supplies records; transformations describe the desired table; loading makes results available downstream.'],
    ['etl-pyspark-m3', 'Express operations', 'RDDs, DataFrames, SQL and functions offer ways to describe computation over partitions.'],
    ['etl-pyspark-m7', 'Produce reusable data', 'Clean, explore and transform the records. Cache only when reuse justifies retaining an intermediate.'],
  ], 'eda-m9', 'Distributed processing and a small pandas analysis share the same need to validate each intermediate table.'),
  regression: path([
    ['regression-m1', 'Predict a number', 'Features and coefficients produce a prediction. A residual compares it with the observed target.'],
    ['regression-m2', 'Choose the coefficients', 'A loss combines residuals. Linear algebra or gradient updates find coefficients that reduce that loss.'],
    ['regression-m3', 'Predict a probability', 'A sigmoid converts a linear score to a probability; a different likelihood gives a different fitting objective.'],
  ], 'dl-m1', 'A neuron also starts with a weighted sum. Adding nonlinear activations and layers extends this familiar calculation.'),
  'decision-trees': path([
    ['dt-m1', 'Follow one decision', 'A row follows feature questions until it reaches a leaf prediction.'],
    ['dt-m2', 'Choose useful splits', 'Impurity quantifies how mixed a group is. Split gains and pruning balance fit against complexity.'],
    ['dt-m5', 'Combine trees', 'Bagging averages varied trees; boosting adds models to improve an evolving prediction.'],
  ], 'xai-m2', 'Following a path explains one tree prediction; ensembles need methods that summarize many interacting paths.'),
  clustering: path([
    ['clustering-m1', 'Propose groups', 'Start with points and tentative centers, without known class labels.'],
    ['clustering-m2', 'Assign and average', 'Distances determine assignments. Assigned points determine the next centers; scaling changes those distances.'],
    ['clustering-m3', 'Check the grouping', 'Within-cluster error and silhouette scores examine different aspects of a chosen grouping.'],
  ], 'tl-m5', 'Similarity search uses the same idea of distance, but the representation determines what close actually means.'),
  nlp: path([
    ['nlp-m1', 'Make text usable', 'Tokenization and normalization turn a string into units a program can compare.'],
    ['nlp-m3', 'Describe structure', 'Tags, parse trees and semantic relations connect tokens to their roles in a sentence.'],
    ['nlp-m8', 'Represent and predict', 'Counts, embeddings and language models offer different ways to retain information and make predictions.'],
  ], 'aed-m1', 'Embeddings turn tokens into vectors. Attention later changes those representations using context.'),
  'deep-learning': path([
    ['dl-m1', 'Build a forward calculation', 'Weighted sums and activations compose into a network; tensors store the inputs, parameters and outputs.'],
    ['dl-m5', 'Trace the learning loop', 'Forward propagation produces predictions. Backpropagation connects loss to parameters through derivatives.'],
    ['dl-m7', 'Make training work', 'Activations, losses, optimizers, initialization and regularization change how a network learns and generalizes.'],
  ], 'cnn-m2', 'A convolution is another weighted sum, with the same filter reused across positions.'),
  cnn: path([
    ['cnn-m1', 'Read a local patch', 'A filter combines nearby pixels. Reusing its weights makes the same pattern detectable at many positions.'],
    ['cnn-m4', 'Build a hierarchy', 'Pooling and stacked layers change resolution and receptive fields; training adjusts the filters.'],
    ['cnn-m7', 'Apply and inspect', 'Prepare images, reuse learned features and inspect activations before evaluating the complete model.'],
  ], 'cv-m8', 'Classification summarizes an image. Detection adds the question of where each object is.'),
  rnn: path([
    ['rnn-m1', 'Keep the order', 'A sequence carries information in its order, which an unordered representation can lose.'],
    ['rnn-m5', 'Carry a state', 'The same cell updates a state at each position. Backpropagation follows those repeated uses through time.'],
    ['rnn-m9', 'Manage memory', 'Gradient behavior motivates gates such as LSTM and GRU; sequence tasks determine which outputs are needed.'],
  ], 'aed-m5', 'Compressing a long sequence into one state creates a bottleneck that attention addresses.'),
  'naive-bayes': path([
    ['nb-m1', 'Start with a prior', 'A class has a probability before this example is observed. Evidence can change that probability.'],
    ['nb-m3', 'Score each class', 'Combine the prior with feature likelihoods under the conditional-independence assumption.'],
    ['nb-m5', 'Match the features', 'Counts, binary indicators and continuous measurements need different likelihoods; log-space improves numerical stability.'],
  ], 'regression-m3', 'Both methods can classify examples, but logistic regression models class probability directly rather than feature likelihoods.'),
  'model-eval': path([
    ['me-m1', 'Define success', 'Choose a metric and baseline that match the task, then separate fitting from evaluation.'],
    ['me-m3', 'Compare procedures', 'Cross-validation and parameter search compare training choices without repeatedly consulting the final test set.'],
    ['me-m5', 'Control information access', 'Feature selection is part of training. Fit it inside each training split to avoid leakage.'],
  ], 'rs-m5', 'Time-based recommendation makes leakage concrete: future interactions cannot become past features.'),
  xai: path([
    ['xai-m1', 'Choose what to explain', 'One prediction and general model behavior are different questions. An explanation does not establish causality.'],
    ['xai-m3', 'Build an explanation', 'Local surrogates and feature attributions summarize a model under method-specific assumptions.'],
    ['xai-m9', 'Compare the assumptions', 'Reference values, approximations and model access affect which explanation is meaningful.'],
  ], 'me-m8', 'An explanation of a leaked model can look convincing. Validate the training procedure before interpreting its behavior.'),
  'association-rules': path([
    ['assoc-m1', 'Count co-occurrence', 'Support counts how often items appear together; confidence conditions on the antecedent; lift compares with a baseline.'],
    ['assoc-m2', 'Find frequent sets', 'Apriori prunes candidates using the fact that every subset of a frequent itemset is frequent.'],
    ['assoc-m3', 'Judge the rules', 'Generate candidate rules, compare their statistics and check whether they answer a useful question.'],
  ], 'rs-m6', 'Co-occurrence can produce recommendation candidates, but showing useful items still requires evaluation.'),
  'time-series': path([
    ['ts-m1', 'Separate patterns', 'Level, trend, seasonality and noise suggest what a forecast needs to capture.'],
    ['ts-m2', 'Make a baseline forecast', 'Simple forecasts and smoothing turn observed history into a prediction that can be scored later.'],
    ['ts-m4', 'Model dependence', 'Stationarity, lags and autocorrelation motivate autoregressive and differenced models.'],
  ], 'rnn-m13', 'Sequence networks are another forecasting option; they must respect the same boundary between past and future.'),
  recsys: path([
    ['rs-m1', 'Define the evidence', 'The product surface, logged interactions and time split determine what useful recommendation means.'],
    ['rs-m6', 'Retrieve and rank', 'Baselines, collaborative filtering and ranking turn evidence into ordered candidates.'],
    ['rs-b1', 'Build the full loop', 'Reuse the same splits and metrics as data, features and models become an executable pipeline.'],
  ], 'me-m3', 'A more complex recommender must be compared with baselines under the same evaluation procedure.'),
  'computer-vision': path([
    ['cv-m1', 'Manipulate pixels', 'Images are arrays. Filters, transformations and features change or summarize those arrays.'],
    ['cv-m8', 'Locate objects', 'Detection adds box coordinates and matching rules to classification. Losses and metrics reflect both tasks.'],
    ['cv-m12', 'Compare detectors', 'Region-based and single-stage designs make different computation and localization choices.'],
  ], 'tl-m10', 'Segmentation goes beyond boxes by assigning a label to each pixel.'),
  'transfer-learning': path([
    ['tl-m1', 'Reuse a representation', 'A pretrained network supplies features; freezing or fine-tuning controls which parameters change.'],
    ['tl-m4', 'Compare representations', 'Embeddings and metric learning turn feature vectors into a useful notion of similarity.'],
    ['tl-m6', 'Recover spatial detail', 'An encoder compresses resolution. A decoder upsamples; skip connections supply details needed for segmentation.'],
  ], 'diffusion-m5', 'A diffusion denoiser also uses an encoder-decoder structure, but predicts a denoising quantity rather than a segmentation label.'),
  'attention-seq2seq': path([
    ['aed-m1', 'Encode a sequence', 'Embeddings and an encoder represent the source; a decoder generates the output sequence.'],
    ['aed-m5', 'Remove the single-state bottleneck', 'Attention lets the decoder combine source states differently for each output step.'],
    ['aed-m7', 'Calculate a weighted context', 'Scores become normalized weights; weighted value vectors become a context used for prediction.'],
  ], 'trf-m4', 'Self-attention reuses this weighted-sum idea among positions within a sequence.'),
  transformers: path([
    ['trf-m1', 'Follow a token', 'A token representation passes through attention, feed-forward transformations and repeated layers.'],
    ['trf-m4', 'Mix context', 'Query-key scores determine weights. Those weights mix values; masks define which positions can contribute.'],
    ['trf-m8', 'Train for a task', 'Position information and training objectives shape representations used by different Transformer variants.'],
  ], 'genai-risks-m1', 'Predicting plausible tokens does not verify their factual claims; generation and evidence checking are different operations.'),
  vae: path([
    ['vae-m1', 'Encode a distribution', 'The encoder produces parameters of a distribution over codes, rather than a single fixed code.'],
    ['vae-m4', 'Balance the objective', 'The ELBO links reconstruction and KL. Reparameterization makes sampled codes usable in gradient-based training.'],
    ['vae-m8', 'Decode and inspect', 'Run the complete model, explore the latent space and inspect how regularization changes the trade-off.'],
  ], 'diffusion-m9', 'Latent diffusion can denoise compressed representations before decoding them back to images.'),
  gan: path([
    ['gan-m1', 'Set up two players', 'A generator creates samples; a discriminator learns from real and generated examples.'],
    ['gan-m3', 'Follow alternating updates', 'Each model receives its own objective. Improvement for one player changes the task faced by the other.'],
    ['gan-m7', 'Control and evaluate samples', 'Conditioning changes what is generated; quality and diversity need checks beyond a single training loss.'],
  ], 'diffusion-m1', 'Diffusion offers a different training signal: learn from deliberately noised examples rather than an adversarial opponent.'),
  diffusion: path([
    ['diffusion-m1', 'Add noise during training', 'A known forward process provides noisy examples at controlled noise levels.'],
    ['diffusion-m3', 'Learn a denoising prediction', 'The network uses a noisy input and its noise level to predict a quantity useful for reversing corruption.'],
    ['diffusion-m6', 'Generate step by step', 'Sampling starts from noise and repeatedly applies updates; schedules and guidance alter that procedure.'],
  ], 'vae-m1', 'Latent diffusion performs this work in a compressed representation, connecting denoising with an autoencoder.'),
  'genai-risks': path([
    ['genai-risks-m1', 'Identify the failure', 'Separate unsupported content, contradictions and other failure types before measuring or mitigating them.'],
    ['genai-risks-m5', 'Connect failure to consequence', 'The same wrong answer can have different consequences in different uses. Mitigations need evaluation in context.'],
    ['genai-risks-m7', 'Protect instruction boundaries', 'Trace where untrusted input enters a system and test whether controls prevent it from redirecting behavior.'],
  ], 'me-m1', 'A safeguard needs a defined success criterion, representative test cases and an honest account of remaining failures.'),
}
