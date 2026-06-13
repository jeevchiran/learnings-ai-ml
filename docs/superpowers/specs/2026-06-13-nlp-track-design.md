# NLP Learning Track — Design Spec
_Date: 2026-06-13_

## Overview

A 10-module interactive HTML learning track on Natural Language Processing. Follows the existing project conventions (clustering, decision-trees, hypothesis-testing tracks). Target audience: students / academics. Complexity increases progressively within and across modules.

## Decisions Made

| Decision | Choice |
|---|---|
| Module count | 10 |
| Primary code library | spaCy (NLTK where spaCy is inappropriate) |
| Widget style | Mixed: live-input JS for clean I/O concepts; step-through animation for sequential/complex algorithms |
| End-of-module assessment | 2–3 practice problems (Easy/Medium/Hard, show/hide) + 4–5 MCQ with immediate feedback |

## File Structure

```
nlp/
  index.html                              # Track home
  css/
    style.css                             # Fork of clustering CSS + NLP-specific additions
  js/
    common.js                             # Fork of clustering common.js + NLP widget helpers
  modules/
    01-text-normalization-edit-distance.html
    02-stemming-lemmatization-noisy-channel.html
    03-pos-tagging-shallow-parsing.html
    04-cfg-parse-trees-deep-parsing.html
    05-lexical-semantics-wsd.html
    06-distributional-semantics-pmi.html
    07-ner-iob-crf-srl-coreference.html
    08-bow-tfidf-topic-modeling.html
    09-word-embeddings.html
    10-ngram-lm-applications.html
```

## 10-Module Breakdown

| # | Title | Area | Key Topics | Widget Type |
|---|---|---|---|---|
| 1 | Text Normalization & Edit Distance | Lexical | Tokenization, lowercasing, stopword removal, Levenshtein distance, DP recurrence | ✏️ Live Levenshtein matrix |
| 2 | Stemming, Lemmatization & Noisy Channel | Lexical | Morphemes, inflection/derivation, Porter/Snowball stemmer, lemmatization, stemming vs lemmatization comparison, noisy channel model | ✏️ Stemmer/lemmatizer comparator + ▶ Noisy channel step-through |
| 3 | POS Tagging & Shallow Parsing | Syntactic | Penn Treebank tags, rule-based vs statistical taggers, NP chunking, chunk grammar | ✏️ Live POS tagger with colored token spans + chunk highlighter |
| 4 | Context-Free Grammars, Parse Trees & Deep Parsing | Syntactic | CFG formal definition G=(N,Σ,R,S), production rules, constituency trees, structural ambiguity, grammatical agreement | ▶ Step-through CFG parse tree builder (SVG) + ambiguity demo |
| 5 | Lexical Semantics & Word Sense Disambiguation | Semantic | Polysemy, homonymy, WordNet synsets, hypernyms/hyponyms, Lesk algorithm, supervised WSD | ✏️ WordNet hierarchy explorer + ▶ Lesk step-through |
| 6 | Distributional Semantics & Pointwise Mutual Information | Semantic | Distributional hypothesis, co-occurrence matrices, PMI formula, PPMI, semantic similarity | ✏️ Live co-occurrence matrix + PMI heatmap (Plotly) |
| 7 | NER, IOB Labeling, CRF, SRL & Coreference Resolution | Semantic | Named entity types, BIO/IOB scheme, CRF as sequence model, semantic roles, SRL, coreference chains | ✏️ Live NER highlighter + ▶ IOB step-through + ▶ CRF lattice + ▶ Coreference arc visualizer |
| 8 | Text Representation: BoW, TF-IDF & Topic Modeling | Representation | Bag of words, vocabulary, document vectors, TF-IDF formula, IDF weighting, NMF topic modeling | ✏️ Live TF-IDF calculator (Plotly heatmap) + ▶ NMF topic explorer |
| 9 | Word Embeddings | Representation | word2vec (skip-gram, CBOW), embedding space, cosine similarity, analogy tasks | ✏️ Word similarity explorer (pre-computed vectors) |
| 10 | N-gram Language Models & Applications | Use Cases | N-gram LMs, sentence probability, Laplace smoothing, perplexity, text generation, classical summarization, MT overview | ✏️ N-gram text generator + ✏️ Perplexity calculator |

## Per-Module HTML Structure

Each module follows this template (matching the existing tracks):

```
1. <nav class="module-nav-bar">  — links to all 10 modules + track home
2. <header>                      — module title + dark mode toggle
3. [Why this topic?]             — motivation bridge from previous module
4. [Core concept sections]       — simplified first, complexity increases
   - KaTeX math blocks for formulas
   - .callout note/warning/insight boxes
   - .derivation / .derivation-step for algorithms
   - .concept-box for definitions
   - .bridge div connecting to next section
5. [Interactive widget(s)]       — .widget-container with controls
6. [spaCy / NLTK code snippet]   — .code-snippet with simulated output
7. [Practice problems]           — .practice with difficulty badge + show/hide
8. [MCQ quiz]                    — .quiz-block with click-to-reveal feedback
9. <div class="nav-buttons">     — prev / next module links
```

## NLP-Specific CSS Additions (beyond clustering baseline)

- `.token-span` — inline word token with hover; colored border per POS category
- `.pos-badge` — small colored label (noun=blue, verb=green, adj=purple, etc.)
- `.ner-highlight` — background color per entity type (PERSON, ORG, LOC, DATE, etc.)
- `.iob-sequence` — horizontal sequence of IOB-labeled tokens
- `.parse-tree-svg` — container for SVG constituency/dependency trees
- `.coref-arc` — SVG arc style for coreference chain visualization
- `.code-snippet` — syntax-highlighted Python block (with copy button)
- `.output-block` — simulated Python REPL / terminal output
- `.quiz-block` + `.quiz-option` — MCQ question with click-to-reveal state
- `.quiz-option.correct` / `.quiz-option.wrong` — feedback colors

## JS Utilities to Add to common.js

- `levenshteinMatrix(s, t)` — returns full DP matrix + optimal path
- `buildPOSDemo(sentence, tokens)` — renders colored token spans from pre-tagged data
- `buildNERDemo(text, entities)` — renders entity-highlighted text spans
- `buildCFGTree(grammar, sentence)` — builds SVG tree from step-through data
- `buildCorefArcs(spans, chains)` — renders SVG arcs over paragraph text
- `computeTFIDF(docs)` — returns TF-IDF matrix for live widget
- `buildPMIMatrix(coocMatrix)` — computes PMI/PPMI from raw counts
- `initQuiz(blockEl)` — wires up MCQ click-to-reveal behavior

## Dependencies (CDN, same as existing tracks)

- KaTeX 0.16.9
- Plotly.js 2.27.0

## Continuity Narrative

Each module ends with a `.bridge` callout answering: _"Why does the next topic follow from this one?"_ — creating an explicit pedagogical thread across the full track.

## Math Coverage (KaTeX)

| Module | Key Formulas |
|---|---|
| 1 | Levenshtein recurrence: `d[i][j] = min(del, ins, sub)` |
| 2 | Noisy channel: `argmax_w P(w|e) = argmax_w P(e|w)P(w)` |
| 4 | CFG: `G = (N, Σ, R, S)` |
| 6 | PMI: `log₂(P(x,y) / P(x)P(y))`, PPMI |
| 8 | TF-IDF: `tf(t,d) × log(N / df(t))` |
| 9 | Cosine similarity, skip-gram objective |
| 10 | Sentence probability, perplexity: `PP(W) = P(w₁…wₙ)^(-1/N)`, Laplace smoothing |
