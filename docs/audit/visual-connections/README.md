# Visual connections for learners

This update emphasizes relationships between concepts and visible cause and effect.

## What learners can do

- Open **Connect the ideas** in a lesson guide. Each of the 25 published tracks has a three-stage learning map. The current lesson's stage stays marked while the learner explores another stage. Each stage explains its purpose and links to its lessons; a final connection explains where the idea is used in another track. These are learning paths, not claims that every model has the same computation graph.
- Follow **prediction → error → slope → update** with one shared numerical example in math module 10, regression module 2 and deep-learning module 6. The prediction flow, equation, loss curve, slope and before/after states use the same values. Changing the learning rate shows a smaller loss, an equal-loss boundary case or an overshoot. Fixed graph axes make comparisons meaningful.
- Follow **score → attention weight → weighted value → sum** in attention module 7 and Transformers module 4. Changing a score changes all normalized weights. Masking the future token removes its contribution and renormalizes the remaining weights. The example explicitly distinguishes self-attention from encoder-decoder attention and uses illustrative one-dimensional values.

The diagrams have labels and numerical readouts as well as color. Controls work by keyboard, stages are selected explicitly, and there is no required autoplay. Mobile layouts stack the concept path while keeping the three attention contributions side by side.

## Validation

- Tested in a temporary copy of committed `17b8540` plus only this update, excluding separate in-progress MLOps changes in the shared workspace.
- 214 tests passed in 14 files. New checks cover valid ordered map links, exploration versus current-lesson state, hand-calculated gradients and updates, overshoot, zero-gradient behavior, attention normalization and mask invariance.
- Production build passed. The existing large JavaScript bundle warning remains.
- Browser validation covers all 25 maps, all three stages of each map, and the two shared examples in five lessons at 1280- and 390-pixel widths. It checks keyboard-accessible controls, numerical outcomes, overflow and runtime exceptions. See [recorded browser results](browser-results.json).
- Representative screenshots: [concept map](concept-map-mobile.png), [learning loop](learning-loop-mobile.png), [attention mixture](attention-mobile.png), [dark theme](attention-desktop-dark.png).

This adds a consistent visual path across the existing curriculum and two deeper worked mechanisms. It does not replace every existing widget or claim measured learning gains; that would require observing learners use the lessons.
