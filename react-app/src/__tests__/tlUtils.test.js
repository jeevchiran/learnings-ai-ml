import { describe, it, expect } from 'vitest'
import * as tl from '../components/widgets/transfer-learning/tlUtils.js'

/* The transfer-learning modules quote numbers from these functions. Pinning
 * them means a silent regression breaks a test rather than a lesson. */

describe('conv arithmetic', () => {
  it('matches the standard output-size formula', () => {
    expect(tl.convOut(32, 3, 1, 1)).toBe(32)        // size-preserving workhorse
    expect(tl.convOut(32, 3, 2, 1)).toBe(16)        // halving
    expect(tl.convOut(32, 2, 2, 0)).toBe(16)
    expect(tl.convOut(572, 3, 1, 0)).toBe(570)      // unpadded loses a border
  })

  it('transposed conv inverts the shape a conv produces', () => {
    expect(tl.convTransposeOut(16, 2, 2)).toBe(32)
    expect(tl.convTransposeOut(28, 2, 2)).toBe(56)  // U-Net bottleneck up-conv
    expect(tl.convTransposeOut(16, 4, 2, 1)).toBe(32)
    // k=3 s=2 p=1 needs output_padding to reach 32 rather than 31
    expect(tl.convTransposeOut(16, 3, 2, 1, 0)).toBe(31)
    expect(tl.convTransposeOut(16, 3, 2, 1, 1)).toBe(32)
  })

  it('reproduces the parameter counts quoted in tl-m7 and tl-m8', () => {
    expect(tl.convParams(512, 256, 2)).toBe(524_544)        // tl-m7 quiz
    expect(tl.convParams(1024, 512, 2)).toBe(2_097_664)     // U-Net up-conv
    expect(tl.convParams(256, 128, 3)).toBe(295_040)        // post-concat conv
    expect(tl.convParams(128, 64, 3)).toBe(73_792)          // tl-quiz
    expect(tl.convParams(2048, 10, 1)).toBe(20_490)         // linear-probe head
  })
})

describe('upsampling', () => {
  const img = [[10, 20], [30, 40]]

  it('nearest repeats each value into an s×s block', () => {
    expect(tl.nearestUpsample(img, 2)).toEqual([
      [10, 10, 20, 20], [10, 10, 20, 20], [30, 30, 40, 40], [30, 30, 40, 40],
    ])
  })

  it('bilinear (align_corners=false) keeps the corners and interpolates between', () => {
    const b = tl.bilinearUpsample(img, 2)
    expect(b.length).toBe(4)
    expect(b[0][0]).toBeCloseTo(10, 6)      // corner preserved
    expect(b[3][3]).toBeCloseTo(40, 6)
    expect(b[0][1]).toBeCloseTo(12.5, 6)    // quarter of the way to 20
    // every value stays inside the range of the source
    expect(Math.min(...b.flat())).toBeGreaterThanOrEqual(10)
    expect(Math.max(...b.flat())).toBeLessThanOrEqual(40)
  })

  it('bed of nails leaves 75% zeros at s=2', () => {
    const b = tl.bedOfNails(img, 2)
    expect(b.flat().filter(v => v === 0)).toHaveLength(12)
    expect(b[0][0]).toBe(10)
  })

  it('max-unpool puts each value back where pooling found it', () => {
    const grid = [[1, 9, 0, 0], [3, 2, 0, 0], [0, 0, 7, 4], [0, 0, 5, 6]]
    const { out, idx } = tl.maxPoolWithIndices(grid, 2)
    expect(out).toEqual([[9, 0], [0, 7]])
    expect(idx[0][0]).toEqual([0, 1])             // the 9 sat top-right of its window
    const un = tl.maxUnpool(out, idx, 2)
    expect(un[0][1]).toBe(9)                      // back in exactly that slot
    expect(un[2][2]).toBe(7)
    // only the pooled maxima survive; everything else stays zero
    expect(un.flat().filter(v => v !== 0)).toHaveLength(2)
  })
})

describe('transposed convolution and checkerboarding', () => {
  const ones = n => Array.from({ length: n }, () => new Array(n).fill(1))

  /** Interior stamp counts, excluding the (k−s)-wide ramp at the border. */
  function interiorCounts(N, k, s) {
    const { hits } = tl.convTranspose2d(ones(N), ones(k), { stride: s })
    const b = Math.max(0, k - s)
    const inner = hits.slice(b, hits.length - b).map(r => r.slice(b, r.length - b)).flat()
    return [...new Set(inner)].sort((a, c) => a - c)
  }

  it('produces the documented 5×5 output for a 2×2 input with k=3, s=2', () => {
    const { out } = tl.convTranspose2d([[1, 1], [1, 1]], ones(3), { stride: 2 })
    expect(out.length).toBe(5)
    expect(out[2][2]).toBe(4)          // the centre gets four overlapping stamps
    expect(out[0][0]).toBe(1)
  })

  it('checkerboards exactly when kernel size is NOT divisible by stride', () => {
    expect(interiorCounts(4, 3, 2).length).toBeGreaterThan(1)   // 3 % 2 ≠ 0 → uneven
    expect(interiorCounts(4, 2, 2)).toEqual([1])                // clean
    expect(interiorCounts(4, 4, 2)).toEqual([4])                // clean, (k/s)² = 4
  })

  it('scatter-add is linear in the input', () => {
    const a = tl.convTranspose2d([[2, 0], [0, 0]], ones(3), { stride: 2 }).out
    const b = tl.convTranspose2d([[1, 0], [0, 0]], ones(3), { stride: 2 }).out
    expect(a.flat().reduce((s, v) => s + v, 0)).toBeCloseTo(2 * b.flat().reduce((s, v) => s + v, 0), 9)
  })
})

describe('segmentation metrics', () => {
  const gt = [[1, 1, 0], [1, 1, 0], [0, 0, 0]]
  const pr = [[1, 1, 0], [1, 0, 0], [0, 0, 0]]

  it('computes Dice and IoU consistently', () => {
    expect(tl.dice(pr, gt)).toBeCloseTo(6 / 7, 10)     // 2*3 / (3+4)
    expect(tl.iou(pr, gt)).toBeCloseTo(0.75, 10)       // 3 / 4
  })

  it('satisfies D = 2J/(1+J) for every overlap', () => {
    for (const j of [0, 0.25, 0.5, 0.6, 0.75, 0.8, 0.9, 1]) {
      expect(tl.diceFromIoU(j)).toBeCloseTo((2 * j) / (1 + j), 12)
      if (j > 0) expect(tl.iouFromDice(tl.diceFromIoU(j))).toBeCloseTo(j, 12)
    }
    // the conversions quoted in the modules
    expect(tl.diceFromIoU(0.6)).toBeCloseTo(0.75, 10)
    expect(tl.diceFromIoU(0.8)).toBeCloseTo(0.8889, 4)
    expect(tl.iouFromDice(0.92)).toBeCloseTo(0.8519, 4)
  })

  it('Dice always reads at least as high as IoU', () => {
    for (const j of [0.1, 0.3, 0.5, 0.7, 0.9]) expect(tl.diceFromIoU(j)).toBeGreaterThanOrEqual(j)
  })

  it('scores a perfect and a disjoint prediction correctly', () => {
    expect(tl.dice(gt, gt)).toBe(1)
    const miss = [[0, 0, 0], [0, 0, 0], [0, 1, 1]]
    expect(tl.dice(miss, gt)).toBe(0)
    expect(tl.iou(miss, gt)).toBe(0)
  })

  it('soft Dice epsilon rescues the empty-target case instead of returning NaN', () => {
    const empty = [[0, 0], [0, 0]]
    const nothing = [[0.0, 0.0], [0.0, 0.0]]
    expect(tl.softDice(nothing, empty, 1)).toBe(1)          // correct empty prediction
    expect(Number.isNaN(tl.softDice(nothing, empty, 1))).toBe(false)
  })
})

describe('the class-imbalance argument in tl-m11', () => {
  const N = 24
  function makeGT(fgPct) {
    const r = Math.sqrt((fgPct / 100) * N * N / Math.PI)
    return Array.from({ length: N }, (_, y) =>
      Array.from({ length: N }, (_, x) => (((x - N / 2) ** 2 + (y - N / 2) ** 2) <= r * r ? 1 : 0)))
  }

  it('BCE prefers the empty mask at low foreground, Dice never does', () => {
    const gt = makeGT(4)
    const allBg = gt.map(r => r.map(() => 0.01))
    const attempt = gt.map(r => r.map(v => (v ? 0.65 : 0.35)))

    expect(tl.bce(allBg, gt)).toBeLessThan(tl.bce(attempt, gt))          // BCE picks the cheat
    expect(1 - tl.softDice(allBg, gt)).toBeGreaterThan(1 - tl.softDice(attempt, gt))  // Dice does not
    expect(tl.pixelAccuracy(allBg, gt)).toBeGreaterThan(0.9)             // and accuracy flatters it
  })

  it('BCE prefers the real attempt once the classes are balanced', () => {
    const gt = makeGT(45)
    const allBg = gt.map(r => r.map(() => 0.01))
    const attempt = gt.map(r => r.map(v => (v ? 0.65 : 0.35)))
    expect(tl.bce(attempt, gt)).toBeLessThan(tl.bce(allBg, gt))
  })
})

describe('embeddings', () => {
  it('cosine and Euclidean rank identically on normalised vectors', () => {
    const q = tl.normalize([1, 0.2])
    const others = [[0.9, 0.3], [-0.5, 0.8], [0.2, 0.9]].map(tl.normalize)
    const byCos = [...others.keys()].sort((a, b) => tl.cosine(q, others[b]) - tl.cosine(q, others[a]))
    const byL2 = [...others.keys()].sort((a, b) => tl.l2(q, others[a]) - tl.l2(q, others[b]))
    expect(byCos).toEqual(byL2)
  })

  it('||a-b||^2 = 2 - 2cos(a,b) on the unit sphere', () => {
    const a = tl.normalize([0.4, 0.9]), b = tl.normalize([-0.3, 0.7])
    expect(tl.l2(a, b) ** 2).toBeCloseTo(2 - 2 * tl.cosine(a, b), 10)
  })

  it('triplet loss is zero exactly when the margin is satisfied', () => {
    const a = [0, 0], p = [0.4, 0], n = [0.9, 0]
    expect(tl.tripletLoss(a, p, n, 0.2)).toBeCloseTo(0, 10)      // easy: 0.4 - 0.9 + 0.2 < 0
    expect(tl.tripletLoss(a, p, n, 0.8)).toBeCloseTo(0.3, 10)    // margin now violated
    expect(tl.tripletLoss(a, [0.8, 0], [0.7, 0], 0.2)).toBeCloseTo(0.3, 10)   // hard
  })

  it('knn excludes the query and returns the closest first', () => {
    const near = tl.knn(tl.GALLERY, 0, 3)
    expect(near.map(n => n.i)).not.toContain(0)
    expect(near[0].sim).toBeGreaterThanOrEqual(near[1].sim)
    expect(near).toHaveLength(3)
  })
})

describe('U-Net specification', () => {
  it('reproduces the 2015 paper exactly', () => {
    const u = tl.unetSpec({ inCh: 1, classes: 2, base: 64, depth: 4, input: 572 })
    expect(u.params).toBe(31_030_658)
    expect(u.outSize).toBe(388)
    // the shape trajectory printed in the paper's figure
    expect(u.stages.filter(s => s.kind === 'enc').map(s => s.size)).toEqual([568, 280, 136, 64])
    expect(u.stages.find(s => s.kind === 'bottleneck').size).toBe(28)
  })

  it('padded convs make output size equal input size', () => {
    const u = tl.unetSpec({ base: 64, input: 256, padded: true })
    expect(u.outSize).toBe(256)
  })

  it('capacity scales roughly with the square of the base width', () => {
    const big = tl.unetSpec({ base: 64, input: 572 }).params
    const small = tl.unetSpec({ base: 32, input: 572 }).params
    expect(big / small).toBeGreaterThan(3.5)
    expect(big / small).toBeLessThan(4.5)
  })

  it('channels double down and halve up', () => {
    const u = tl.unetSpec({ base: 64, input: 572 })
    expect(u.stages.filter(s => s.kind === 'enc').map(s => s.ch)).toEqual([64, 128, 256, 512])
    expect(u.stages.filter(s => s.kind === 'dec').map(s => s.ch)).toEqual([512, 256, 128, 64])
  })
})

describe('transfer strategy helpers', () => {
  it('transferability falls with depth and with domain distance', () => {
    expect(tl.transferability(0, 0.8)).toBeGreaterThan(tl.transferability(5, 0.8))
    expect(tl.transferability(5, 0.15)).toBeGreaterThan(tl.transferability(5, 0.95))
    expect(tl.transferability(0, 0.15)).toBeGreaterThan(0.9)
  })

  it('freezing more leaves fewer trainable parameters', () => {
    const a = tl.freezeSplit(0), b = tl.freezeSplit(5)
    expect(b.trainable).toBeLessThan(a.trainable)
    expect(b.frozenPct).toBeGreaterThan(90)
    expect(a.frozen).toBe(0)
    // stage4 is the cliff: it alone is 12M of ResNet-50's 25.6M
    expect(tl.freezeSplit(4).frozen - tl.freezeSplit(3).frozen).toBeCloseTo(12.0, 6)
  })

  it('every backbone entry has the fields the widget renders', () => {
    for (const b of tl.BACKBONES) {
      expect(b.name).toBeTruthy()
      expect(b.params).toBeGreaterThan(0)
      expect(b.top1).toBeGreaterThan(60)
      expect([512, 768, 960, 1280, 2048]).toContain(b.dim)
    }
  })
})
