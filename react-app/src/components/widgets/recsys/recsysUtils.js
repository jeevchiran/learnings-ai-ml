/*  NovaCart — one synthetic e-commerce store used by every module in this track.
 *  6 shoppers, 9 products, 30 days of implicit events. Small enough to check by
 *  hand, big enough that popularity, recency, CF and MF all disagree.
 */

export const PRODUCTS = [
  { id: 'P1', name: 'Wireless Earbuds',    cat: 'audio',   price: 2499 },
  { id: 'P2', name: 'Phone Case',          cat: 'mobile',  price:  399 },
  { id: 'P3', name: 'Laptop Stand',        cat: 'desk',    price: 1299 },
  { id: 'P4', name: 'Mech. Keyboard',      cat: 'desk',    price: 4999 },
  { id: 'P5', name: 'USB-C Hub',           cat: 'desk',    price: 1899 },
  { id: 'P6', name: 'Coffee Grinder',      cat: 'kitchen', price: 3499 },
  { id: 'P7', name: 'Yoga Mat',            cat: 'fitness', price:  899 },
  { id: 'P8', name: 'Steel Bottle',        cat: 'fitness', price:  649 },
  { id: 'P9', name: 'ANC Headphones',      cat: 'audio',   price: 7999 }, // new arrival: zero events
]

export const USERS = [
  { id: 'U1', name: 'Aarav'  },
  { id: 'U2', name: 'Bhavna' },
  { id: 'U3', name: 'Chen'   },
  { id: 'U4', name: 'Diya'   },
  { id: 'U5', name: 'Eli'    },
  { id: 'U6', name: 'Farida' },
]

export const ITEM_IDS = PRODUCTS.map(p => p.id)
export const USER_IDS = USERS.map(u => u.id)
export const productName = id => PRODUCTS.find(p => p.id === id)?.name ?? id
export const userName    = id => USERS.find(u => u.id === id)?.name ?? id

/* Implicit strength per event type. Taught in module 2 — a purchase is not
 * "10 views", it is a different *kind* of evidence, but a single scalar is the
 * standard first move and every later model consumes it. */
export const EVENT_WEIGHT = { view: 1, cart: 3, purchase: 10 }

/* day: 1..30. Everything after DAY_CUTOFF is the held-out future. */
export const DAY_CUTOFF = 24

export const EVENTS = [
  // U1 Aarav — desk/audio browser, converts late
  { u: 'U1', p: 'P2', type: 'view',     day:  2 },
  { u: 'U1', p: 'P1', type: 'view',     day:  3 },
  { u: 'U1', p: 'P4', type: 'view',     day:  5 },
  { u: 'U1', p: 'P1', type: 'cart',     day:  6 },
  { u: 'U1', p: 'P5', type: 'view',     day:  9 },
  { u: 'U1', p: 'P5', type: 'cart',     day: 11 },
  { u: 'U1', p: 'P1', type: 'purchase', day: 26 },
  // U2 Bhavna — widest browser in the store
  { u: 'U2', p: 'P8', type: 'view',     day:  1 },
  { u: 'U2', p: 'P1', type: 'view',     day:  3 },
  { u: 'U2', p: 'P3', type: 'view',     day:  4 },
  { u: 'U2', p: 'P4', type: 'view',     day:  7 },
  { u: 'U2', p: 'P4', type: 'cart',     day:  8 },
  { u: 'U2', p: 'P5', type: 'view',     day: 12 },
  { u: 'U2', p: 'P8', type: 'cart',     day: 14 },
  { u: 'U2', p: 'P4', type: 'purchase', day: 27 },
  // U3 Chen — buys inside the window too (so train has purchases in it)
  { u: 'U3', p: 'P2', type: 'view',     day:  2 },
  { u: 'U3', p: 'P5', type: 'view',     day:  5 },
  { u: 'U3', p: 'P3', type: 'view',     day:  6 },
  { u: 'U3', p: 'P3', type: 'cart',     day:  9 },
  { u: 'U3', p: 'P3', type: 'purchase', day: 10 },
  { u: 'U3', p: 'P8', type: 'view',     day: 13 },
  { u: 'U3', p: 'P8', type: 'purchase', day: 28 },
  // U4 Diya — fitness + kitchen
  { u: 'U4', p: 'P8', type: 'view',     day:  4 },
  { u: 'U4', p: 'P7', type: 'view',     day:  6 },
  { u: 'U4', p: 'P7', type: 'cart',     day:  8 },
  { u: 'U4', p: 'P6', type: 'view',     day: 10 },
  { u: 'U4', p: 'P8', type: 'cart',     day: 15 },
  { u: 'U4', p: 'P7', type: 'purchase', day: 25 },
  // U5 Eli — buys something never touched before (genuine discovery)
  { u: 'U5', p: 'P8', type: 'view',     day:  3 },
  { u: 'U5', p: 'P1', type: 'view',     day:  5 },
  { u: 'U5', p: 'P2', type: 'view',     day:  7 },
  { u: 'U5', p: 'P1', type: 'cart',     day:  9 },
  { u: 'U5', p: 'P6', type: 'view',     day: 12 },
  { u: 'U5', p: 'P6', type: 'cart',     day: 16 },
  { u: 'U5', p: 'P5', type: 'purchase', day: 29 },
  // U6 Farida — fitness, also discovers a new category
  { u: 'U6', p: 'P8', type: 'view',     day:  2 },
  { u: 'U6', p: 'P7', type: 'view',     day:  6 },
  { u: 'U6', p: 'P3', type: 'view',     day: 11 },
  { u: 'U6', p: 'P7', type: 'cart',     day: 13 },
  { u: 'U6', p: 'P1', type: 'purchase', day: 30 },
]

/* ── splits ───────────────────────────────────────────────────────────── */

export function splitByTime(cutoff = DAY_CUTOFF) {
  return {
    train: EVENTS.filter(e => e.day <= cutoff),
    test:  EVENTS.filter(e => e.day >  cutoff),
  }
}

/** Held-out target per user: {U1: 'P1', ...}. One purchase each, by design. */
export function testTargets(cutoff = DAY_CUTOFF) {
  const t = {}
  for (const e of EVENTS) if (e.day > cutoff) t[e.u] = e.p
  return t
}

/** Random split — the WRONG one for a time-ordered log. Kept for module 5. */
export function splitRandom(frac = 0.2, seed = 11) {
  const rnd = mulberry32(seed)
  const tagged = EVENTS.map(e => ({ e, r: rnd() }))
  return {
    train: tagged.filter(x => x.r >= frac).map(x => x.e),
    test:  tagged.filter(x => x.r <  frac).map(x => x.e),
  }
}

/* ── matrices ─────────────────────────────────────────────────────────── */

/** nUsers x nItems implicit-strength matrix (summed event weights). */
export function buildMatrix(events) {
  const R = USER_IDS.map(() => ITEM_IDS.map(() => 0))
  for (const e of events) {
    const i = USER_IDS.indexOf(e.u), j = ITEM_IDS.indexOf(e.p)
    if (i >= 0 && j >= 0) R[i][j] += EVENT_WEIGHT[e.type]
  }
  return R
}

export const binarize = R => R.map(row => row.map(v => (v > 0 ? 1 : 0)))

/** Items the user already touched — the standard "don't re-recommend" filter. */
export function seenByUser(events) {
  const seen = {}
  for (const e of events) (seen[e.u] ??= new Set()).add(e.p)
  return seen
}

/* ── baselines ────────────────────────────────────────────────────────── */

/** Distinct users who touched each item. Popularity = the bar every model must clear. */
export function itemPopularity(events) {
  const users = {}
  for (const e of events) (users[e.p] ??= new Set()).add(e.u)
  const pop = {}
  for (const id of ITEM_IDS) pop[id] = users[id]?.size ?? 0
  return pop
}

export function rankByPopularity(events) {
  const pop = itemPopularity(events)
  return [...ITEM_IDS].sort((a, b) => pop[b] - pop[a] || a.localeCompare(b))
}

/** Most-recently-touched items for one user. Brutally strong in e-commerce. */
export function rankByRecency(events, userId) {
  const last = {}
  for (const e of events) if (e.u === userId) last[e.p] = Math.max(last[e.p] ?? 0, e.day)
  return Object.keys(last).sort((a, b) => last[b] - last[a] || a.localeCompare(b))
}

export function rankRandom(seed = 3) {
  const rnd = mulberry32(seed)
  return [...ITEM_IDS].map(id => ({ id, r: rnd() })).sort((a, b) => a.r - b.r).map(x => x.id)
}

/* ── similarity / neighbourhood CF ────────────────────────────────────── */

export function cosine(a, b) {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] }
  return na === 0 || nb === 0 ? 0 : dot / Math.sqrt(na * nb)
}

const col = (M, j) => M.map(row => row[j])

/** Full item x item cosine table, keyed by product id. */
export function itemItemSim(R) {
  const S = {}
  for (let j = 0; j < ITEM_IDS.length; j++) {
    S[ITEM_IDS[j]] = {}
    for (let k = 0; k < ITEM_IDS.length; k++) {
      S[ITEM_IDS[j]][ITEM_IDS[k]] = j === k ? 1 : cosine(col(R, j), col(R, k))
    }
  }
  return S
}

export function userUserSim(R) {
  const S = {}
  for (let i = 0; i < USER_IDS.length; i++) {
    S[USER_IDS[i]] = {}
    for (let k = 0; k < USER_IDS.length; k++) {
      S[USER_IDS[i]][USER_IDS[k]] = i === k ? 1 : cosine(R[i], R[k])
    }
  }
  return S
}

/** score(u, i) = Σ_{j in user history} sim(i, j) · r_uj  — classic item-kNN. */
export function itemCFScores(R, userId, { excludeSeen = false } = {}) {
  const S = itemItemSim(R)
  const ui = USER_IDS.indexOf(userId)
  const scores = {}
  for (const target of ITEM_IDS) {
    let s = 0
    for (let j = 0; j < ITEM_IDS.length; j++) {
      const hist = ITEM_IDS[j]
      if (hist === target || R[ui][j] === 0) continue
      s += S[target][hist] * R[ui][j]
    }
    if (excludeSeen && R[ui][ITEM_IDS.indexOf(target)] > 0) continue
    scores[target] = s
  }
  return scores
}

export function userCFScores(R, userId, { excludeSeen = false } = {}) {
  const S = userUserSim(R)
  const ui = USER_IDS.indexOf(userId)
  const scores = {}
  for (let j = 0; j < ITEM_IDS.length; j++) {
    if (excludeSeen && R[ui][j] > 0) continue
    let num = 0, den = 0
    for (let v = 0; v < USER_IDS.length; v++) {
      if (v === ui) continue
      const sim = S[userId][USER_IDS[v]]
      num += sim * R[v][j]
      den += Math.abs(sim)
    }
    scores[ITEM_IDS[j]] = den === 0 ? 0 : num / den
  }
  return scores
}

export const rankScores = scores =>
  Object.entries(scores).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(e => e[0])

/* ── ranking metrics ──────────────────────────────────────────────────── */
/* `ranked` is an array of item ids, best first. `relevant` is a Set/array. */

const asSet = r => (r instanceof Set ? r : new Set(r))

export function precisionAtK(ranked, relevant, k) {
  const rel = asSet(relevant)
  return ranked.slice(0, k).filter(i => rel.has(i)).length / k
}

export function recallAtK(ranked, relevant, k) {
  const rel = asSet(relevant)
  if (rel.size === 0) return 0
  return ranked.slice(0, k).filter(i => rel.has(i)).length / rel.size
}

export function hitAtK(ranked, relevant, k) {
  const rel = asSet(relevant)
  return ranked.slice(0, k).some(i => rel.has(i)) ? 1 : 0
}

/** Reciprocal rank of the FIRST hit. 0 if no hit in the top k. */
export function reciprocalRank(ranked, relevant, k = ranked.length) {
  const rel = asSet(relevant)
  for (let i = 0; i < Math.min(k, ranked.length); i++) if (rel.has(ranked[i])) return 1 / (i + 1)
  return 0
}

/** Average Precision: mean of P@i taken only at the positions that are hits. */
export function averagePrecisionAtK(ranked, relevant, k) {
  const rel = asSet(relevant)
  if (rel.size === 0) return 0
  let hits = 0, sum = 0
  for (let i = 0; i < Math.min(k, ranked.length); i++) {
    if (rel.has(ranked[i])) { hits++; sum += hits / (i + 1) }
  }
  return sum / Math.min(k, rel.size)
}

export function dcgAtK(ranked, relevant, k) {
  const rel = asSet(relevant)
  let d = 0
  for (let i = 0; i < Math.min(k, ranked.length); i++) if (rel.has(ranked[i])) d += 1 / Math.log2(i + 2)
  return d
}

export function idcgAtK(relevant, k) {
  const n = Math.min(k, asSet(relevant).size)
  let d = 0
  for (let i = 0; i < n; i++) d += 1 / Math.log2(i + 2)
  return d
}

export function ndcgAtK(ranked, relevant, k) {
  const ideal = idcgAtK(relevant, k)
  return ideal === 0 ? 0 : dcgAtK(ranked, relevant, k) / ideal
}

/** Fraction of the catalog that appears in anyone's top-k. Guards against
 *  a model that scores well by recommending the same 5 items to everyone. */
export function catalogCoverage(rankedPerUser, k) {
  const shown = new Set()
  for (const r of Object.values(rankedPerUser)) r.slice(0, k).forEach(i => shown.add(i))
  return shown.size / ITEM_IDS.length
}

/** Run one recommender over every user with a held-out target. */
export function evaluate(rankFn, targets, k = 3) {
  const users = Object.keys(targets)
  const per = {}
  let hr = 0, mrr = 0, ndcg = 0, map = 0
  for (const u of users) {
    const ranked = rankFn(u)
    const rel = [targets[u]]
    const row = {
      ranked,
      hit:  hitAtK(ranked, rel, k),
      rr:   reciprocalRank(ranked, rel, k),
      ndcg: ndcgAtK(ranked, rel, k),
      ap:   averagePrecisionAtK(ranked, rel, k),
      rank: ranked.indexOf(targets[u]) + 1 || null,
    }
    per[u] = row
    hr += row.hit; mrr += row.rr; ndcg += row.ndcg; map += row.ap
  }
  const n = users.length
  return {
    per,
    hitRate: hr / n,
    mrr: mrr / n,
    ndcg: ndcg / n,
    map: map / n,
    coverage: catalogCoverage(Object.fromEntries(users.map(u => [u, per[u].ranked])), k),
  }
}

/* ── implicit ALS (Hu, Koren & Volinsky 2008) ─────────────────────────── */

export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Gaussian elimination with partial pivoting. k is tiny (<= 8) here. */
export function solve(A, b) {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let c = 0; c < n; c++) {
    let piv = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r
    ;[M[c], M[piv]] = [M[piv], M[c]]
    if (Math.abs(M[c][c]) < 1e-12) continue
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let cc = c; cc <= n; cc++) M[r][cc] -= f * M[c][cc]
    }
  }
  return M.map((row, i) => (Math.abs(row[i]) < 1e-12 ? 0 : row[n] / row[i]))
}

/**
 * Implicit ALS. Preference p_ui = 1 if r_ui > 0 else 0.
 * Confidence  c_ui = 1 + alpha * r_ui — every cell is a training example,
 * observed ones just carry more weight. That is the whole trick.
 * Objective: Σ_ui c_ui (p_ui − xᵤ·yᵢ)² + λ(‖X‖² + ‖Y‖²)
 */
export function trainALS(R, { k = 2, alpha = 1.0, reg = 0.1, iters = 15, seed = 7 } = {}) {
  const nU = R.length, nI = R[0].length
  const rnd = mulberry32(seed)
  const init = (n) => Array.from({ length: n }, () => Array.from({ length: k }, () => (rnd() - 0.5) * 0.2))
  let X = init(nU), Y = init(nI)
  const losses = []

  const gram = (F) => {
    const G = Array.from({ length: k }, () => new Array(k).fill(0))
    for (const f of F) for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) G[a][b] += f[a] * f[b]
    return G
  }

  for (let it = 0; it < iters; it++) {
    // --- solve users, Y fixed
    const YtY = gram(Y)
    for (let u = 0; u < nU; u++) {
      const A = YtY.map((row, a) => row.map((v, b) => v + (a === b ? reg : 0)))
      const b = new Array(k).fill(0)
      for (let i = 0; i < nI; i++) {
        if (R[u][i] === 0) continue
        const c = 1 + alpha * R[u][i]
        for (let a = 0; a < k; a++) {
          for (let bb = 0; bb < k; bb++) A[a][bb] += (c - 1) * Y[i][a] * Y[i][bb]
          b[a] += c * Y[i][a]
        }
      }
      X[u] = solve(A, b)
    }
    // --- solve items, X fixed
    const XtX = gram(X)
    for (let i = 0; i < nI; i++) {
      const A = XtX.map((row, a) => row.map((v, b) => v + (a === b ? reg : 0)))
      const b = new Array(k).fill(0)
      for (let u = 0; u < nU; u++) {
        if (R[u][i] === 0) continue
        const c = 1 + alpha * R[u][i]
        for (let a = 0; a < k; a++) {
          for (let bb = 0; bb < k; bb++) A[a][bb] += (c - 1) * X[u][a] * X[u][bb]
          b[a] += c * X[u][a]
        }
      }
      Y[i] = solve(A, b)
    }
    losses.push(alsLoss(R, X, Y, alpha, reg))
  }
  return { X, Y, losses }
}

export function alsLoss(R, X, Y, alpha, reg) {
  let L = 0
  for (let u = 0; u < R.length; u++) {
    for (let i = 0; i < R[0].length; i++) {
      const p = R[u][i] > 0 ? 1 : 0
      const c = 1 + alpha * R[u][i]
      const e = p - dot(X[u], Y[i])
      L += c * e * e
    }
  }
  const sq = F => F.reduce((s, f) => s + f.reduce((t, v) => t + v * v, 0), 0)
  return L + reg * (sq(X) + sq(Y))
}

export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0)

export function alsScores(X, Y, userId, { excludeSeen = false, R = null } = {}) {
  const ui = USER_IDS.indexOf(userId)
  const scores = {}
  ITEM_IDS.forEach((id, j) => {
    if (excludeSeen && R && R[ui][j] > 0) return
    scores[id] = dot(X[ui], Y[j])
  })
  return scores
}

/* ── content vectors, for the cold-start / multi-modal module ─────────── */
/* Hand-set "embeddings" over [audio, desk, fitness, kitchen, mobile, premium].
 * Stands in for what a text/image encoder would produce from title + photo. */
export const CONTENT_DIMS = ['audio', 'desk', 'fitness', 'kitchen', 'mobile', 'premium']
export const CONTENT_VEC = {
  P1: [0.95, 0.15, 0.10, 0.00, 0.30, 0.45],
  P2: [0.05, 0.05, 0.05, 0.00, 0.95, 0.10],
  P3: [0.05, 0.90, 0.05, 0.00, 0.05, 0.30],
  P4: [0.10, 0.95, 0.00, 0.00, 0.05, 0.70],
  P5: [0.10, 0.85, 0.00, 0.05, 0.25, 0.35],
  P6: [0.00, 0.05, 0.10, 0.95, 0.00, 0.55],
  P7: [0.00, 0.00, 0.95, 0.05, 0.00, 0.15],
  P8: [0.00, 0.05, 0.80, 0.25, 0.00, 0.10],
  P9: [0.98, 0.20, 0.10, 0.00, 0.25, 0.90], // cold item: content says "like P1, pricier"
}

/** Cold-start scoring: give a never-seen item the CF score of its nearest
 *  content neighbours. This is the whole idea behind content-based backfill. */
export function contentNeighbours(itemId, n = 3) {
  return ITEM_IDS
    .filter(id => id !== itemId)
    .map(id => ({ id, sim: cosine(CONTENT_VEC[itemId], CONTENT_VEC[id]) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, n)
}

/* ── negative sampling ────────────────────────────────────────────────── */

/** Day each product went live. P9 is a late arrival — before day 22 it did not
 *  exist, so it cannot legitimately be anyone's negative. */
export const LISTED_DAY = {
  P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0, P7: 0, P8: 0, P9: 22,
}

/** Sampling weight ∝ popularity^beta. beta=0 uniform, 1 = popularity-proportional. */
export function negativeSamplingWeights(events, beta = 0.75) {
  const pop = itemPopularity(events)
  const w = {}
  let z = 0
  for (const id of ITEM_IDS) { w[id] = Math.pow(pop[id], beta); z += w[id] }
  for (const id of ITEM_IDS) w[id] = z === 0 ? 0 : w[id] / z
  return w
}

/**
 * Time-aware negatives: sample from the catalog **as it stood** at asOfDay,
 * using popularity measured in a trailing window rather than over all time.
 * Two corrections in one: items not yet listed get zero mass, and popularity
 * is the popularity of that moment, not of today.
 * `smooth` is additive so a listed-but-unseen item keeps a sampling floor.
 */
export function timeAwareSamplingWeights(events, asOfDay, { beta = 0.75, window = 14, smooth = 1 } = {}) {
  const inWin = events.filter(e => e.day < asOfDay && e.day >= asOfDay - window)
  const users = {}
  for (const e of inWin) (users[e.p] ??= new Set()).add(e.u)
  const w = {}
  let z = 0
  for (const id of ITEM_IDS) {
    if ((LISTED_DAY[id] ?? 0) >= asOfDay) { w[id] = 0; continue }  // did not exist yet
    w[id] = Math.pow((users[id]?.size ?? 0) + smooth, beta)
    z += w[id]
  }
  for (const id of ITEM_IDS) w[id] = z === 0 ? 0 : w[id] / z
  return w
}

/** Items live at a given day — the denominator time-aware sampling draws from. */
export const listedBy = day => ITEM_IDS.filter(id => (LISTED_DAY[id] ?? 0) < day)

/* ── learning-to-rank losses, for the LTR module ──────────────────────── */

export const sigmoid = z => 1 / (1 + Math.exp(-z))

/** Pointwise: each item judged alone against its 0/1 label (log loss). */
export function pointwiseLoss(scores, labels) {
  let L = 0
  scores.forEach((s, i) => {
    const p = sigmoid(s)
    L += -(labels[i] * Math.log(p + 1e-9) + (1 - labels[i]) * Math.log(1 - p + 1e-9))
  })
  return L / scores.length
}

/** Pairwise (RankNet): only (positive, negative) ORDER matters. */
export function pairwiseLoss(scores, labels) {
  let L = 0, n = 0
  for (let i = 0; i < scores.length; i++) {
    for (let j = 0; j < scores.length; j++) {
      if (labels[i] <= labels[j]) continue
      L += -Math.log(sigmoid(scores[i] - scores[j]) + 1e-9)
      n++
    }
  }
  return n === 0 ? 0 : L / n
}

/** Listwise (ListNet / softmax cross-entropy over the whole slate). */
export function listwiseLoss(scores, labels) {
  const m = Math.max(...scores)
  const exp = scores.map(s => Math.exp(s - m))
  const z = exp.reduce((a, b) => a + b, 0)
  const nPos = labels.reduce((a, b) => a + b, 0)
  if (nPos === 0) return 0
  let L = 0
  labels.forEach((y, i) => { if (y > 0) L += -Math.log(exp[i] / z + 1e-9) })
  return L / nPos
}
