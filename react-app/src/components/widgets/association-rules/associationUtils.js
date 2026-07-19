// Shared data + metrics for the Association Rule Mining track.
// One fixed 10-transaction grocery basket so every widget and the prose agree.

export const TRANSACTIONS = [
  ['Bread', 'Milk'],
  ['Bread', 'Diaper', 'Beer', 'Eggs'],
  ['Milk', 'Diaper', 'Beer', 'Cola'],
  ['Bread', 'Milk', 'Diaper', 'Beer'],
  ['Bread', 'Milk', 'Diaper', 'Cola'],
  ['Milk', 'Diaper', 'Beer'],
  ['Bread', 'Beer'],
  ['Bread', 'Milk', 'Diaper'],
  ['Milk', 'Beer'],
  ['Bread', 'Milk', 'Diaper', 'Beer'],
]

export const N = TRANSACTIONS.length
export const ITEMS = [...new Set(TRANSACTIONS.flat())].sort()

const SETS = TRANSACTIONS.map(t => new Set(t))

// count of transactions containing every item in `items`
export function count(items) {
  return SETS.reduce((c, s) => c + (items.every(x => s.has(x)) ? 1 : 0), 0)
}

export const support = items => count(items) / N

// confidence of rule A -> B, where A and B are disjoint item arrays
export function confidence(a, b) {
  const sa = support(a)
  return sa === 0 ? 0 : support([...a, ...b]) / sa
}

// lift of A -> B
export function lift(a, b) {
  const sb = support(b)
  return sb === 0 ? 0 : confidence(a, b) / sb
}

// ── Apriori ────────────────────────────────────────────────────────────────
// Returns { minCount, levels } where levels[k] is the frequent (k+1)-itemsets,
// each { items, count, support }. Also reports candidates pruned per level.
export function apriori(minSupport) {
  const minCount = Math.ceil(minSupport * N - 1e-9)
  const key = arr => arr.join(',')

  const wrap = arr => arr.map(items => ({ items, count: count(items), support: support(items) }))

  let prev = ITEMS.map(it => [it]).filter(c => count(c) >= minCount)
  const levels = [wrap(prev)]

  let k = 1
  while (prev.length) {
    const candidates = []
    const prevKeys = new Set(prev.map(key))
    for (let i = 0; i < prev.length; i++) {
      for (let j = i + 1; j < prev.length; j++) {
        const a = prev[i], b = prev[j]
        // Fk-1 x Fk-1 join: first k-1 items equal
        if (key(a.slice(0, k - 1)) !== key(b.slice(0, k - 1))) continue
        const cand = [...a, b[k - 1]].sort()
        // prune: every (k)-subset must be frequent (downward closure)
        const allSubsFrequent = cand.every((_, x) =>
          prevKeys.has(key(cand.filter((__, y) => y !== x))))
        if (allSubsFrequent) candidates.push(cand)
      }
    }
    const Lk = candidates.filter(c => count(c) >= minCount)
    if (!Lk.length) break
    levels.push(wrap(Lk))
    prev = Lk
    k++
  }
  return { minCount, levels }
}

// ── Rule generation ──────────────────────────────────────────────────────────
// From every frequent itemset (size >= 2) at minSupport, emit all rules whose
// confidence >= minConfidence. Sorted by lift descending.
export function generateRules(minSupport, minConfidence) {
  const { levels } = apriori(minSupport)
  const rules = []
  for (let L = 1; L < levels.length; L++) {          // itemsets of size >= 2
    for (const { items, support: s } of levels[L]) {
      const n = items.length
      for (let mask = 1; mask < (1 << n) - 1; mask++) {
        const a = items.filter((_, i) => mask & (1 << i))
        const b = items.filter((_, i) => !(mask & (1 << i)))
        const conf = confidence(a, b)
        if (conf >= minConfidence) {
          rules.push({ a, b, support: s, confidence: conf, lift: lift(a, b) })
        }
      }
    }
  }
  rules.sort((x, y) => y.lift - x.lift || y.confidence - x.confidence)
  return rules
}
