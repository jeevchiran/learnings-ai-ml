import { describe, it, expect } from 'vitest'
import {
  EVENTS, ITEM_IDS, USER_IDS, DAY_CUTOFF,
  splitByTime, testTargets, buildMatrix, binarize,
  itemPopularity, rankByPopularity, rankByRecency,
  cosine, itemItemSim,
  precisionAtK, recallAtK, hitAtK, reciprocalRank,
  averagePrecisionAtK, dcgAtK, idcgAtK, ndcgAtK, catalogCoverage,
  trainALS, alsScores, rankScores, solve, dot,
  pointwiseLoss, pairwiseLoss, listwiseLoss,
  negativeSamplingWeights, timeAwareSamplingWeights, listedBy, LISTED_DAY, contentNeighbours,
} from '../components/widgets/recsys/recsysUtils.js'

const near = (a, b, d = 4) => expect(a).toBeCloseTo(b, d)

describe('NovaCart dataset', () => {
  it('splits cleanly into 34 train / 6 test events', () => {
    const { train, test } = splitByTime()
    expect(train).toHaveLength(34)
    expect(test).toHaveLength(6)
    expect(train.every(e => e.day <= DAY_CUTOFF)).toBe(true)
  })

  it('gives every user exactly one held-out target', () => {
    const t = testTargets()
    expect(Object.keys(t).sort()).toEqual([...USER_IDS].sort())
  })

  it('sums event weights into the implicit matrix', () => {
    const M = buildMatrix(splitByTime().train)
    // U3 viewed + carted + purchased P3 = 1 + 3 + 10
    expect(M[USER_IDS.indexOf('U3')][ITEM_IDS.indexOf('P3')]).toBe(14)
    // P9 is the cold item: no events at all
    expect(M.every(row => row[ITEM_IDS.indexOf('P9')] === 0)).toBe(true)
  })

  it('counts popularity as distinct users, not events', () => {
    const pop = itemPopularity(splitByTime().train)
    expect(pop.P8).toBe(5)   // U2,U3,U4,U5,U6 — U2 and U4 touched it twice each
    expect(pop.P9).toBe(0)
    expect(rankByPopularity(splitByTime().train)[0]).toBe('P8')
  })

  it('ranks a user history by most recent touch', () => {
    // U1: P2 d2, P1 d3+d6, P4 d5, P5 d9+d11  ->  P5, P1, P4, P2
    expect(rankByRecency(splitByTime().train, 'U1')).toEqual(['P5', 'P1', 'P4', 'P2'])
  })
})

describe('ranking metrics', () => {
  // Fixed slate used in the module-4 worked example.
  const ranked = ['P8', 'P1', 'P2', 'P5', 'P3', 'P7', 'P4', 'P6']
  const rel = ['P1', 'P5', 'P7']   // hits at ranks 2, 4, 6

  it('precision@k counts hits over k, recall over |relevant|', () => {
    near(precisionAtK(ranked, rel, 3), 1 / 3)
    near(recallAtK(ranked, rel, 3), 1 / 3)
    near(precisionAtK(ranked, rel, 5), 2 / 5)
    near(recallAtK(ranked, rel, 5), 2 / 3)
  })

  it('hit@k and MRR key off the FIRST hit only', () => {
    expect(hitAtK(ranked, rel, 1)).toBe(0)
    expect(hitAtK(ranked, rel, 2)).toBe(1)
    near(reciprocalRank(ranked, rel, 8), 1 / 2)
    expect(reciprocalRank(ranked, rel, 1)).toBe(0)
  })

  it('AP@k averages precision at the hit positions', () => {
    // k=3: one hit at rank 2 -> P@2 = 1/2, divided by min(3, 3)
    near(averagePrecisionAtK(ranked, rel, 3), 0.5 / 3)
    // k=5: hits at 2 and 4 -> (1/2 + 2/4) / 3
    near(averagePrecisionAtK(ranked, rel, 5), (0.5 + 0.5) / 3)
  })

  it('NDCG discounts by log2(rank+1) and normalises by the ideal', () => {
    near(dcgAtK(ranked, rel, 3), 1 / Math.log2(3))
    near(idcgAtK(rel, 3), 1 + 1 / Math.log2(3) + 0.5)
    near(ndcgAtK(ranked, rel, 3), 0.2961, 3)
    // a perfect ranking scores exactly 1
    near(ndcgAtK(['P1', 'P5', 'P7', 'P8'], rel, 3), 1)
  })

  it('returns 0 rather than NaN when nothing is relevant', () => {
    expect(ndcgAtK(ranked, [], 3)).toBe(0)
    expect(recallAtK(ranked, [], 3)).toBe(0)
    expect(averagePrecisionAtK(ranked, [], 3)).toBe(0)
  })

  it('coverage catches a model that shows everyone the same slate', () => {
    const same = Object.fromEntries(USER_IDS.map(u => [u, ranked]))
    near(catalogCoverage(same, 3), 3 / ITEM_IDS.length)
  })
})

describe('similarity', () => {
  it('cosine is 1 for identical, 0 for disjoint', () => {
    near(cosine([1, 1, 0], [1, 1, 0]), 1)
    near(cosine([1, 0, 0], [0, 1, 0]), 0)
  })

  it('item-item cosine matches the hand-computed value', () => {
    const S = itemItemSim(binarize(buildMatrix(splitByTime().train)))
    // P1 users {U1,U2,U5}, P4 users {U1,U2} -> 2 / sqrt(3*2)
    near(S.P1.P4, 2 / Math.sqrt(6))
    expect(S.P1.P7).toBe(0)          // no shared user
    expect(S.P9.P1).toBe(0)          // cold item is similar to nothing
  })
})

describe('implicit ALS', () => {
  it('solve() inverts a small system', () => {
    const x = solve([[2, 1], [1, 3]], [5, 10])
    near(x[0], 1)
    near(x[1], 3)
  })

  it('loss decreases monotonically', () => {
    const { losses } = trainALS(buildMatrix(splitByTime().train), { k: 2, iters: 12 })
    for (let i = 1; i < losses.length; i++) expect(losses[i]).toBeLessThanOrEqual(losses[i - 1] + 1e-6)
  })

  it('reconstructs observed cells better than unobserved ones', () => {
    const M = buildMatrix(splitByTime().train)
    const { X, Y } = trainALS(M, { k: 3, iters: 20 })
    let obs = 0, nObs = 0, un = 0, nUn = 0
    for (let u = 0; u < M.length; u++) {
      for (let i = 0; i < M[0].length; i++) {
        const s = dot(X[u], Y[i])
        if (M[u][i] > 0) { obs += s; nObs++ } else { un += s; nUn++ }
      }
    }
    expect(obs / nObs).toBeGreaterThan(un / nUn)
  })

  it('scores every item and ranks them high-to-low', () => {
    const M = buildMatrix(splitByTime().train)
    const { X, Y } = trainALS(M, { k: 2, iters: 10 })
    const ranked = rankScores(alsScores(X, Y, 'U1'))
    expect(ranked).toHaveLength(ITEM_IDS.length)
    const s = alsScores(X, Y, 'U1')
    expect(s[ranked[0]]).toBeGreaterThanOrEqual(s[ranked[1]])
  })
})

describe('learning-to-rank losses', () => {
  const labels = [0, 1, 0, 1]
  const scores = [1.0, 2.0, -0.5, 0.5]

  it('pairwise and listwise are invariant to a constant score shift; pointwise is not', () => {
    const shifted = scores.map(s => s + 2)
    near(pairwiseLoss(shifted, labels), pairwiseLoss(scores, labels))
    near(listwiseLoss(shifted, labels), listwiseLoss(scores, labels))
    expect(pointwiseLoss(shifted, labels)).toBeGreaterThan(pointwiseLoss(scores, labels))
  })

  it('pairwise loss drops when a mis-ordered pair is fixed', () => {
    const bad = [2.0, 1.0, 0.5, -0.5]   // negatives scored above positives
    expect(pairwiseLoss(bad, labels)).toBeGreaterThan(pairwiseLoss(scores, labels))
  })
})

describe('negative sampling', () => {
  it('beta=0 is uniform, beta>0 tilts toward popular items', () => {
    const { train } = splitByTime()
    const uni = negativeSamplingWeights(train, 0)
    expect(Object.values(uni).every(v => Math.abs(v - 1 / ITEM_IDS.length) < 1e-9)).toBe(true)

    const tilt = negativeSamplingWeights(train, 0.75)
    expect(tilt.P8).toBeGreaterThan(tilt.P4)   // P8 is the most popular item
    near(Object.values(tilt).reduce((a, b) => a + b, 0), 1)
  })

  it('all-time sampling starves the cold item entirely (0^β = 0)', () => {
    expect(negativeSamplingWeights(splitByTime().train, 0.75).P9).toBe(0)
  })
})

describe('time-aware negative sampling', () => {
  const { train } = splitByTime()

  it('gives zero mass to items not yet listed', () => {
    // P9 lists on day 22, so it cannot be a negative for a day-10 positive.
    expect(LISTED_DAY.P9).toBe(22)
    expect(timeAwareSamplingWeights(train, 10).P9).toBe(0)
    expect(listedBy(10)).toHaveLength(ITEM_IDS.length - 1)
    expect(listedBy(24)).toHaveLength(ITEM_IDS.length)
  })

  it('keeps a smoothing floor for a listed-but-untouched item', () => {
    // Once live, P9 still has zero interactions — additive smoothing keeps it
    // sampleable rather than starving it the way plain popularity^β does.
    const w = timeAwareSamplingWeights(train, 24, { beta: 0.75, window: 14 })
    expect(w.P9).toBeGreaterThan(0)
    near(Object.values(w).reduce((a, b) => a + b, 0), 1)
  })

  it('tracks popularity drift rather than all-time counts', () => {
    // P1's last training event is day 9, so by day 24 it is stale in a 14d
    // window — time-aware must give it LESS mass than all-time popularity does.
    const allTime = negativeSamplingWeights(train, 0.75)
    const timed = timeAwareSamplingWeights(train, 24, { beta: 0.75, window: 14 })
    expect(timed.P1).toBeLessThan(allTime.P1)
  })

  it('is sensitive to the as-of day', () => {
    const early = timeAwareSamplingWeights(train, 10, { beta: 0.75, window: 14 })
    const late = timeAwareSamplingWeights(train, 24, { beta: 0.75, window: 14 })
    expect(early.P1).not.toBeCloseTo(late.P1, 3)
  })

  it('normalises to 1 at every as-of day it is used at', () => {
    for (let d = 4; d <= 30; d++) {
      near(Object.values(timeAwareSamplingWeights(train, d)).reduce((a, b) => a + b, 0), 1)
    }
  })
})

describe('content backfill', () => {
  it('finds the cold item a sensible warm neighbour', () => {
    // P9 (ANC headphones) has zero events; content puts it next to P1 (earbuds).
    expect(contentNeighbours('P9', 1)[0].id).toBe('P1')
  })
})

describe('event log integrity', () => {
  it('every event references a real user and product', () => {
    for (const e of EVENTS) {
      expect(USER_IDS).toContain(e.u)
      expect(ITEM_IDS).toContain(e.p)
      expect(e.day).toBeGreaterThan(0)
    }
  })
})
