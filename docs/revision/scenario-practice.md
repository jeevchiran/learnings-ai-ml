# Scenario-based ML and GenAI exam practice

For each question, cover the choices first. Underline the detail that changes your decision, predict its consequence, then choose one answer. For a harder second pass, change that detail and explain when a different choice would become correct.

## Start with the two missed questions

| Decisive clue in the example | Reason it through | Best choice |
|---|---|---|
| A 5,000-token document gives a product around 10⁻²⁸⁰⁰. The question requires the **same class ranking**. | The probability factors can all be positive while their product rounds to zero. Adding their logs avoids forming the tiny product. Logarithms preserve ordering. Switching to Bernoulli Naive Bayes discards repeated-token counts and changes the model. | **D. Compute class scores in log space.** Include the log class prior. |
| The strongest feature records an intervention **after the diagnosis is confirmed**. The prediction is needed before confirmation. | Draw the timeline. A later intervention can predict the recorded diagnosis extremely well in historical data. At the decision time the model cannot observe it. A smaller weight still gives training access to future information. | **C. Remove the feature from training and evaluation**, then rebuild the feature set using the prediction cutoff. |

**Check the arithmetic.** Suppose two unnormalized class scores would be 10⁻²⁸⁰⁰ and 10⁻²⁸¹⁰. Both round to zero in ordinary double precision. Their base-10 log scores are −2800 and −2810, so the first class wins. Compute each score directly as log prior plus the sum of token counts times log token probabilities. Taking a log *after* the product has rounded to zero is too late.

## Applied ML practice

**1. Long-document classification.** A trained multinomial classifier assigns positive likelihoods to every word. Short articles classify correctly, but two classes tie at zero on long articles. The deployed fix must preserve the trained model's ranking. Which change meets that constraint?

- A. Count each distinct word once.
- B. Compute log prior plus the sum of count-weighted log likelihoods.
- C. Increase smoothing until the class scores differ.
- D. Compute the original products, then take their logarithms.

**2. Prediction-time information.** A courier predicts late delivery when a parcel is booked. The warehouse table holds a final refund code, entered after delivery, and the customer's count of refunds issued before booking. Which feature policy fits deployment?

- A. Keep both fields because a chronological test split handles leakage.
- B. Drop every refund-related field.
- C. Keep the final code during fitting and fill it with a default in production.
- D. Drop the final code and compute the historical count as of booking.

**3. Margin geometry.** A linear support vector machine (SVM) uses the usual fixed-C sum of hinge losses. With preprocessing and weights fixed, the team adds correctly labeled examples strictly outside the existing margin. What do these examples contribute at the current solution?

- A. Zero hinge loss, so the existing optimum remains an optimum.
- B. Positive loss because the training set now has more examples.
- C. Negative loss that rewards the model for widening its margin.
- D. A change in the margin proportional to their distance from the boundary.

**4. Choosing among many models.** A team tries 150 configurations and repeatedly checks the same validation set. The winning score is unusually high. Which estimate should accompany the release decision?

- A. The highest validation score, averaged across the winner's best epochs.
- B. The same validation score with a narrower confidence interval.
- C. The locked pipeline's score on an untouched, deployment-like test set.
- D. The mean validation score across all configurations.

**5. Two explanations for one prediction.** Income and debt ratio are correlated. For one applicant, SHAP ranks income first and LIME ranks debt ratio first. Which investigation best explains how both results could arise?

- A. Check whether the model is linear, since only linear models support both methods.
- B. Examine SHAP's reference data and feature-dependence assumptions, then inspect LIME's perturbed neighborhood and local fit.
- C. Average the two ranks to estimate the causal effect.
- D. Increase the number of examples until the rankings necessarily agree.

**6. Seasonal forecasting.** A retailer records weekly sales with a repeating 52-week cycle. Diagnostics suggest one regular difference and one lag-52 difference stabilize the series. Which initial candidate directly represents those findings?

- A. ARIMA with two ordinary differences and no seasonal terms.
- B. A seasonal model with period 12 because the data span multiple years.
- C. A stationary autoregression on raw sales with only a lag-one term.
- D. SARIMA with regular difference order 1, seasonal difference order 1 and period 52.

**7. A new item enters the catalog.** A returning listener has years of play history. A new podcast arrives with a transcript and tags but zero plays. Which change gives the system item-specific evidence on release day?

- A. Match the podcast's content to listener interests and combine that score with collaborative signals as plays accumulate.
- B. Increase the dimension of interaction-only item embeddings.
- C. Retrain the same interaction-only model hourly on the unchanged history.
- D. Use the platform's global popularity score for every new podcast.

## Vision and GenAI practice

**8. Denoising across a boundary.** A camera sees a dark seam against bright metal. Nearby pixels on each side show small intensity fluctuations. Which filter can average fluctuations within each surface while limiting mixing across the seam?

- A. A larger box average that assigns equal weight to every neighbor.
- B. A sharpening kernel that amplifies all rapid changes.
- C. A bilateral filter tuned to weight both spatial distance and intensity difference.
- D. Bilinear upsampling followed by the original detector.

**9. Small defects disappear early.** A one-pixel-wide scratch is visible in a raw image and faint immediately after a fixed 7 × 7 average. The segmentation head still detects broad stains. Which experiment most directly tests the suspected cause?

- A. Change the final mask threshold and compare only overall accuracy.
- B. Replace the fixed average with a stride-one learnable filter at the same resolution and compare recall on thin scratches.
- C. Widen the fixed average and leave the downstream model frozen.
- D. Downsample before the average to expand its effective coverage.

**10. Word order changes the label.** A bidirectional transformer encoder uses full self-attention, no positional signals and mean pooling. It receives “dogs chase cats” and “cats chase dogs” as permutations of the same three tokens. What happens at inference?

- A. Each ordering gets different attention scores because token indices are implicit in the dot product.
- B. All three token vectors within each sentence become identical.
- C. The encoder loses the ability to compute token similarities.
- D. Token outputs are correspondingly reordered, and the mean-pooled vectors are identical.

**11. Translation alignment.** At output step 12, a translator needs evidence from source tokens 3 and 18. Which operation can directly combine both pieces of source evidence for this step?

- A. Decoder cross-attention uses the current decoder query to weight encoder values.
- B. Encoder self-attention uses the next target word as its query.
- C. Decoder causal self-attention looks ahead to the remaining target words.
- D. The decoder selects encoder state 12 by matching source and target indices.

**12. A VAE loses input detail.** After increasing the KL penalty, the per-image latent distributions all approach the same prior. Shuffling encoded latent vectors between images barely changes their decoded outputs. Which diagnosis fits both observations?

- A. GAN mode collapse caused by an overly accurate discriminator.
- B. Numerical underflow in a product of pixel intensities.
- C. Posterior collapse, with little input-specific information carried through the latent code.
- D. Overfitting that stores each training image in a distinct latent vector.

**13. What supervises a diffusion denoiser?** A training batch contains clean images. The implementation samples a timestep and Gaussian noise for each image to construct a noisy input. In an epsilon-prediction diffusion model, what is the target for that input?

- A. The probability that a discriminator labels the image real.
- B. The actual sampled noise used to corrupt that image.
- C. The timestep index alone.
- D. An independently sampled noise tensor with the same variance.

**14. A multimodal assistant reads documents and can call tools.** Uploaded material may contain untrusted instructions. Which design most directly limits the consequences if the model misinterprets that material?

- A. Use a larger vision encoder and keep existing tool permissions.
- B. Shorten captions and allow every requested tool call.
- C. Cache the model's first interpretation of each document.
- D. Treat document content as data, enforce user and tool permissions outside the model, and test for unauthorized actions and disclosure.

**15. Transferring a model with limited labels.** A team has 250 labeled bird images from four cameras and a backbone pretrained on photographs. The deployment site uses a fifth camera. Which experiment most informatively tests whether fine-tuning helps?

- A. Compare a frozen-backbone baseline with partial fine-tuning on identical held-out-camera folds.
- B. Compare training accuracy after each model sees all four cameras.
- C. Put augmented copies of the same image on both sides of a random split.
- D. Fine-tune on the validation camera and report its score as held-out.

**16. Choosing a vision transformer's patch size.** A ViT processes 224 × 224 images. The team halves the patch side from 16 to 8 pixels to retain finer spatial detail. Ignoring special tokens, how does this affect full self-attention?

- A. Twice as many tokens and four times as many pairwise scores.
- B. Four times as many tokens and four times as many scores.
- C. Four times as many tokens and sixteen times as many scores.
- D. The same token count because image resolution stays fixed.

## Answer key and reasoning

| # | Answer | Decisive clue and why the tempting alternative fails |
|---|---|---|
| 1 | **B** | All word probabilities are positive. The long product underflows. Summing logs keeps repeated-word evidence and the class prior. Smoothing addresses zero or poorly estimated token probabilities and changes the fitted scores. |
| 2 | **D** | Draw a line at booking. Prior refunds are observable if their timestamps are respected. A final refund code crosses that line even in a chronological split. |
| 3 | **A** | Hinge loss is max(0, 1 − signed margin). Every added point has signed margin above 1. The extra losses are zero at the old optimum and nonnegative everywhere else. A new point inside the margin could change the solution. |
| 4 | **C** | Searching many configurations favors a winner that benefited from validation noise. An untouched test set evaluates the selected pipeline independently. Nested cross-validation can evaluate the entire tuning procedure. |
| 5 | **B** | SHAP allocates differences from a reference across feature coalitions. LIME fits a weighted local surrogate. Correlation and unrealistic perturbed examples can change which feature receives credit. |
| 6 | **D** | An ordinary difference subtracts the previous week. A seasonal difference subtracts the same point one cycle ago. For the monthly example in the screenshots the period is 12. Here the observations are weekly and the stated cycle is 52. Validate the candidate by forecasting forward. |
| 7 | **A** | The missing evidence belongs to the item. Its transcript and tags are already available. More dimensions or more frequent fitting cannot create item-specific behavior from zero plays. |
| 8 | **C** | A bilateral filter gives less weight to neighbors across a strong intensity boundary. A box average blends both sides. The intensity bandwidth must still preserve the actual defect contrast. For isolated salt-and-pepper impulses, a small median filter is a different candidate. [OpenCV filter comparison](https://docs.opencv.org/4.x/d4/d13/tutorial_py_filtering.html) |
| 9 | **B** | The signal becomes faint at the fixed average. A stripe one pixel wide crossing seven pixels of a 7 × 7 window occupies only 7/49 of it, so averaging leaves just one seventh of its original contrast against a uniform background. A larger window dilutes it further. |
| 10 | **D** | Full self-attention without order signals is permutation-equivariant. Reordering tokens reorders their outputs. Mean pooling removes that reordering, making the document representation invariant. Attention can still measure token similarity. |
| 11 | **A** | Encoder states supply keys and values, and the decoder supplies the query. The attention weights can change with each target step. Step 12 need not align with source position 12. |
| 12 | **C** | A posterior near the prior for each input plus a decoder insensitive to swapping codes indicates an unused latent channel. Similar-looking samples alone would give much weaker evidence. GAN mode collapse concerns a different training objective. [Posterior collapse in VAEs](https://arxiv.org/abs/1901.05534) |
| 13 | **B** | The training process knows the noise it injected. Predicting that noise from the noisy sample and timestep teaches the denoiser a direction for the reverse update. An independent noise draw has no sample-specific connection to the corruption. |
| 14 | **D** | Uploaded content has no authority to grant permissions. Enforce access to tools and data in application code, keep secrets outside the model context, and evaluate disclosure as well as actions. Filtering inputs can help, but caption length and model size establish no access boundary. |
| 15 | **A** | The intended generalization is to a new camera. Holding out cameras tests that shift, and matching the folds isolates the effect of adaptation. Augmented copies across folds can inflate both scores. |
| 16 | **C** | The patch grid grows from 14 × 14 to 28 × 28, so token count grows from 196 to 784. Each token scores every token. The number of scores therefore grows by 4 × 4 = 16. |

## Change one clue

- **Underflow or an unseen word?** Tiny positive factors call for log-space arithmetic. A fitted probability of exactly zero needs a modeling decision such as additive smoothing during training. A classifier may need both.
- **Leakage or legitimate history?** Replace “refund issued after this delivery” with “number of refunds already issued on earlier orders.” Timestamping the latter at booking makes it a candidate feature. Its usefulness still needs validation.
- **Posterior collapse or mode collapse?** If a VAE ignores the input-specific latent posterior, investigate posterior collapse. If a GAN maps many noise seeds to the same few outputs, investigate mode collapse.
- **Self-attention or cross-attention?** When a target token consults earlier target tokens, it uses causal self-attention. When it consults source-language tokens or image features, it uses cross-attention in an encoder–decoder design.
