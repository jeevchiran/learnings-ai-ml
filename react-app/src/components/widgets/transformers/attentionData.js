// Shared toy example for every attention widget in this track — the same
// eight tokens 3Blue1Brown uses in "Attention in transformers, visually
// explained": "a fluffy blue creature roamed the verdant forest".
// Q/K/V are hand-authored 2-D "meaning" vectors, not learned — good enough to
// make the mechanism concrete without hiding it behind opaque numbers.

export const TOKENS = ['a', 'fluffy', 'blue', 'creature', 'roamed', 'the', 'verdant', 'forest']

// Base ("dictionary") embedding before any attention has run — generic,
// context-free, exactly the Module 1 problem this track exists to fix.
export const E = {
  a: [0.05, 0.05], fluffy: [0.5, 0.3], blue: [0.4, 0.35], creature: [0.2, 0.5],
  roamed: [0.3, 0.1], the: [0.05, 0.05], verdant: [0.45, 0.32], forest: [0.2, 0.48],
}

// Key: "what kind of word am I" — adjectives point toward [1,0], nouns
// toward [0,1], function/verb words stay near the origin.
export const K = {
  a: [0.10, 0.10], fluffy: [1.00, 0.10], blue: [0.90, 0.15], creature: [0.10, 1.00],
  roamed: [0.20, 0.20], the: [0.05, 0.05], verdant: [0.95, 0.10], forest: [0.15, 0.95],
}

// Query: "what kind of word am I looking for" — a noun looks for adjectives
// ([1,0]); the verb looks for its subject, a noun ([0,1]).
export const Q = {
  a: [0, 0], fluffy: [0, 0.2], blue: [0, 0.2], creature: [1.0, 0],
  roamed: [0, 1.0], the: [0, 0], verdant: [0, 0.2], forest: [1.0, 0],
}

// Value: what a token actually contributes to the meaning of whoever
// attends to it — descriptive words carry "texture/colour" (axis 0) and
// "thing-ness" (axis 1).
export const V = {
  a: [0.0, 0.0], fluffy: [0.9, 0.1], blue: [0.7, 0.15], creature: [0.15, 0.9],
  roamed: [0.1, 0.1], the: [0.0, 0.0], verdant: [0.85, 0.1], forest: [0.15, 0.85],
}

const dot = (a, b) => a[0] * b[0] + a[1] * b[1]

// A small recency bonus stands in for what positional encoding really
// contributes — nearby words matching equally well should still be favoured.
// Distance is measured in token positions between query index i and key index j.
function recencyBonus(i, j) {
  return 0.4 / (Math.abs(i - j) + 1)
}

/** Raw (pre-softmax) scores for query token at index i against every key. Masked positions (j > i) get -Infinity when causal=true. */
export function rawScores(i, causal) {
  const qTok = TOKENS[i]
  return TOKENS.map((kTok, j) => {
    if (causal && j > i) return -Infinity
    return dot(Q[qTok], K[kTok]) + recencyBonus(i, j)
  })
}

export function softmax(scores) {
  const finite = scores.filter(s => Number.isFinite(s))
  const m = finite.length ? Math.max(...finite) : 0
  const exps = scores.map(s => (Number.isFinite(s) ? Math.exp(s - m) : 0))
  const sum = exps.reduce((a, b) => a + b, 0) || 1
  return exps.map(e => e / sum)
}

/** alpha_j for query index i, and the resulting context vector (weighted sum of V). */
export function attend(i, causal = true) {
  const alpha = softmax(rawScores(i, causal))
  const context = [0, 1].map(dim => TOKENS.reduce((sum, tok, j) => sum + alpha[j] * V[tok][dim], 0))
  return { alpha, context }
}
