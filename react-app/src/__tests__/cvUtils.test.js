import { describe, it, expect } from 'vitest'
import * as cv from '../components/widgets/cv/cvUtils.js'

/* The CV track quotes numbers from these functions in its prose. A silent
 * regression here would make a module factually wrong without breaking a
 * render, so the numeric claims are pinned. */

describe('convolution and filtering', () => {
  const img = cv.SAMPLE_IMAGES['Step edge']

  it('identity kernel is a no-op', () => {
    expect(cv.convolve2d(img, cv.KERNELS['Identity'].k)).toEqual(img)
  })

  it('smoothing kernels sum to 1, derivative kernels sum to 0', () => {
    expect(cv.kernelSum(cv.KERNELS['Box blur'].k)).toBeCloseTo(1, 10)
    expect(cv.kernelSum(cv.KERNELS['Gaussian'].k)).toBeCloseTo(1, 10)
    expect(cv.kernelSum(cv.KERNELS['Sharpen'].k)).toBeCloseTo(1, 10)
    expect(cv.kernelSum(cv.KERNELS['Sobel X'].k)).toBeCloseTo(0, 10)
    expect(cv.kernelSum(cv.KERNELS['Laplacian'].k)).toBeCloseTo(0, 10)
  })

  it('a zero-sum kernel gives zero response on a flat region', () => {
    const flat = Array.from({ length: 6 }, () => new Array(6).fill(128))
    const out = cv.convolve2d(flat, cv.KERNELS['Sobel X'].k)
    expect(out.flat().every(v => Math.abs(v) < 1e-9)).toBe(true)
  })

  it('Sobel X fires only at the vertical step (cv-m3)', () => {
    const out = cv.convolve2d(img, cv.KERNELS['Sobel X'].k)
    // the step in 'Step edge' is between columns 5 and 6
    expect(out[0][5]).toBeCloseTo(680, 6)
    expect(out[0][6]).toBeCloseTo(680, 6)
    expect(out[0][0]).toBeCloseTo(0, 6)
  })

  it('median beats a box blur on salt-and-pepper noise (cv-m3 claim)', () => {
    const clean = cv.SAMPLE_IMAGES['Bright square']
    const noisy = cv.saltPepper(clean, 0.12, 11)
    const mae = (a, b) => a.flat().reduce((s, v, i) => s + Math.abs(v - b.flat()[i]), 0) / 144
    const med = cv.medianFilter(noisy)
    const box = cv.clampToDisplay(cv.convolve2d(noisy, cv.KERNELS['Box blur'].k))
    expect(mae(med, clean)).toBeLessThan(mae(noisy, clean))
    expect(mae(box, clean)).toBeGreaterThan(mae(med, clean))
  })

  it('zero border darkens the edge, reflect does not', () => {
    const flat = Array.from({ length: 6 }, () => new Array(6).fill(200))
    const z = cv.convolve2d(flat, cv.KERNELS['Box blur'].k, { border: 'zero' })
    const r = cv.convolve2d(flat, cv.KERNELS['Box blur'].k, { border: 'reflect' })
    expect(z[0][0]).toBeLessThan(200)
    expect(r[0][0]).toBeCloseTo(200, 6)
  })
})

describe('point ops and distributions', () => {
  it('uint8 results are clamped, never wrapped', () => {
    const a = [[250, 250]], b = [[10, 10]]
    expect(cv.addImages(a, b, 1).flat()).toEqual([250, 250])
    expect(cv.brightnessContrast(a, 1, 10).flat()).toEqual([255, 255])
    expect(cv.brightnessContrast(a, 1, -300).flat()).toEqual([0, 0])
  })

  it('gamma is monotone and fixes the endpoints', () => {
    const ramp = [[0, 64, 128, 192, 255]]
    const g = cv.gammaCorrect(ramp, 0.5).flat()
    expect(g[0]).toBe(0)
    expect(g[4]).toBe(255)
    for (let i = 1; i < g.length; i++) expect(g[i]).toBeGreaterThan(g[i - 1])
  })

  it('equalisation widens the dynamic range of a low-contrast image (cv-m7)', () => {
    const src = cv.SAMPLE_IMAGES['Low contrast']
    const s0 = cv.imageStats(src)
    const s1 = cv.imageStats(cv.equalize(src))
    expect(s0.max - s0.min).toBeLessThan(30)
    expect(s1.min).toBe(0)
    expect(s1.max).toBe(255)
    expect(s1.std).toBeGreaterThan(s0.std * 5)
  })

  it('histogram bins sum to the pixel count', () => {
    const h = cv.histogram(cv.SAMPLE_IMAGES['Ramp'], 32)
    expect(h.reduce((a, b) => a + b, 0)).toBe(cv.IMG_N * cv.IMG_N)
  })
})

describe('geometry', () => {
  it('identity leaves a point alone', () => {
    expect(cv.applyMat(cv.affineMatrix({}), [7, 11])).toEqual([7, 11])
  })

  it('rotates (100, 50) by 30° to (61.6, 93.3) — cv-m4 worked example', () => {
    const [x, y] = cv.applyMat(cv.affineMatrix({ deg: 30 }), [100, 50])
    expect(x).toBeCloseTo(61.60, 2)
    expect(y).toBeCloseTo(93.30, 2)
  })

  it('|det| is the area scale factor, and rotation does not change it', () => {
    expect(cv.det3(cv.affineMatrix({ deg: 47, tx: 120, ty: -30 }))).toBeCloseTo(1, 10)
    expect(cv.det3(cv.affineMatrix({ sx: 1.6, sy: 0.7 }))).toBeCloseTo(1.12, 10)
  })

  it('a non-zero bottom row makes the transform projective', () => {
    const M = cv.affineMatrix({ p0: 0.004 })
    expect(M[2][0]).toBe(0.004)
    const [x] = cv.applyMat(M, [100, 0])
    expect(x).toBeCloseTo(100 / 1.4, 6)     // divided by w' = 1 + 0.004·100
  })

  it('bilinear weights sum to 1, so it never leaves the corner range', () => {
    const img = [[0, 100], [200, 40]]
    const v = cv.bilinear(img, 0.5, 0.5)
    expect(v).toBeCloseTo(85, 6)            // (0 + 100 + 200 + 40) / 4
    expect(v).toBeLessThanOrEqual(200)
    expect(v).toBeGreaterThanOrEqual(0)
  })
})

describe('Harris features', () => {
  it('a corner scores higher than an edge, which scores below a flat region', () => {
    const { R } = cv.harris(cv.SAMPLE_IMAGES['Bright square'])
    const labels = cv.classifyHarris(R)
    // the square spans rows/cols 3..8, so [3,3] is a corner and [3,6] is a top edge
    expect(labels[3][3]).toBe('corner')
    expect(R[3][3]).toBeGreaterThan(R[3][6])
    expect(R[3][6]).toBeLessThan(0)
    expect(labels[0][0]).toBe('flat')
  })

  it('a smooth ramp has strong gradients but no interior corners (cv-m5 claim)', () => {
    const { mag } = cv.sobelGradients(cv.SAMPLE_IMAGES['Ramp'])
    const { R } = cv.harris(cv.SAMPLE_IMAGES['Ramp'])
    expect(Math.max(...mag.flat())).toBeGreaterThan(0)
    // The 2-pixel frame is excluded: padding is an invented signal whatever mode
    // you pick, so border corners are an artefact rather than a claim about Harris.
    const labels = cv.classifyHarris(R)
    const interior = labels.slice(2, -2).flatMap(row => row.slice(2, -2))
    expect(interior.filter(l => l === 'corner')).toHaveLength(0)
    expect(interior.every(l => l === 'edge')).toBe(true)
  })

  it('a straight step edge produces no corners at all', () => {
    const { R } = cv.harris(cv.SAMPLE_IMAGES['Step edge'])
    expect(cv.classifyHarris(R).flat().filter(l => l === 'corner')).toHaveLength(0)
  })
})

describe('boxes, IoU and NMS', () => {
  const A = { x: 50, y: 40, w: 100, h: 120 }
  const B = { x: 90, y: 70, w: 100, h: 120 }

  it('matches the cv-m8 worked example exactly', () => {
    expect(cv.boxArea(cv.intersection(A, B))).toBe(5400)
    expect(cv.unionArea(A, B)).toBe(18600)
    expect(cv.iou(A, B)).toBeCloseTo(0.2903, 4)
  })

  it('identical boxes give 1, disjoint boxes give exactly 0', () => {
    expect(cv.iou(A, { ...A })).toBe(1)
    expect(cv.iou({ x: 0, y: 0, w: 40, h: 40 }, { x: 100, y: 100, w: 40, h: 40 })).toBe(0)
  })

  it('GIoU stays informative (and negative) where IoU flatlines', () => {
    const far = { x: 0, y: 0, w: 40, h: 40 }
    const near = { x: 60, y: 0, w: 40, h: 40 }
    const veryFar = { x: 300, y: 0, w: 40, h: 40 }
    expect(cv.iou(far, near)).toBe(0)
    expect(cv.iou(far, veryFar)).toBe(0)
    expect(cv.giou(far, near)).toBeGreaterThan(cv.giou(far, veryFar))
    expect(cv.giou(far, veryFar)).toBeLessThan(0)
  })

  it('NMS keeps the highest-scoring box per cluster', () => {
    const boxes = [
      { id: 'A', score: 0.92, x: 40, y: 40, w: 90, h: 110 },
      { id: 'B', score: 0.85, x: 52, y: 50, w: 90, h: 110 },
      { id: 'D', score: 0.66, x: 180, y: 60, w: 80, h: 100 },
      { id: 'E', score: 0.58, x: 190, y: 70, w: 80, h: 100 },
    ]
    expect(cv.nms(boxes, 0.5).kept.map(b => b.id)).toEqual(['A', 'D'])
    // a very high threshold suppresses nothing
    expect(cv.nms(boxes, 0.99).kept).toHaveLength(4)
    // a very low one collapses each cluster and can merge across them
    expect(cv.nms(boxes, 0.01).kept.length).toBeLessThanOrEqual(2)
  })
})

describe('losses and metrics', () => {
  it('smooth L1 is continuous and C¹ at the transition', () => {
    const b = 1
    expect(cv.smoothL1(b - 1e-7, b)).toBeCloseTo(cv.smoothL1(b + 1e-7, b), 6)
    expect(cv.smoothL1(0.5)).toBeCloseTo(0.125, 10)
    expect(cv.smoothL1(5)).toBeCloseTo(4.5, 10)
    expect(cv.l2Loss(5)).toBeCloseTo(12.5, 10)
  })

  it('smooth L1 caps its gradient while L2 does not', () => {
    const grad = (f, x) => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6
    expect(grad(v => cv.smoothL1(v), 8)).toBeCloseTo(1, 4)
    expect(grad(cv.l2Loss, 8)).toBeCloseTo(8, 4)
  })

  it('reproduces the cv-m10 AP of 0.6833', () => {
    const dets = [
      { score: 0.95, tp: true }, { score: 0.91, tp: true }, { score: 0.88, tp: false },
      { score: 0.80, tp: true }, { score: 0.74, tp: false }, { score: 0.68, tp: true },
      { score: 0.55, tp: false }, { score: 0.41, tp: false },
    ]
    const { ap, points } = cv.prCurve(dets, 5)
    expect(ap).toBeCloseTo(0.6833, 4)
    expect(points[points.length - 1].recall).toBeCloseTo(0.8, 6)   // one object never found
  })

  it('a perfect ranking scores AP = 1', () => {
    const dets = [{ score: 0.9, tp: true }, { score: 0.8, tp: true }, { score: 0.1, tp: false }]
    expect(cv.prCurve(dets, 2).ap).toBeCloseTo(1, 10)
  })
})

describe('anchors and grids', () => {
  it('k-means mean IoU rises with k and is deterministic', () => {
    const boxes = [
      ...Array.from({ length: 10 }, (_, i) => ({ w: 0.10 + i * 0.002, h: 0.34 + i * 0.003 })),
      ...Array.from({ length: 10 }, (_, i) => ({ w: 0.40 + i * 0.004, h: 0.20 + i * 0.002 })),
    ]
    const k1 = cv.anchorKMeans(boxes, 1).meanIoU
    const k2 = cv.anchorKMeans(boxes, 2).meanIoU
    expect(k2).toBeGreaterThan(k1)
    expect(cv.anchorKMeans(boxes, 3).meanIoU).toBe(cv.anchorKMeans(boxes, 3).meanIoU)
    expect(cv.anchorKMeans(boxes, 2).anchors).toHaveLength(2)
  })

  it('shapeIoU ignores position and is scale-free', () => {
    expect(cv.shapeIoU({ w: 2, h: 4 }, { w: 2, h: 4 })).toBeCloseTo(1, 10)
    expect(cv.shapeIoU({ w: 1, h: 2 }, { w: 2, h: 4 }))
      .toBeCloseTo(cv.shapeIoU({ w: 10, h: 20 }, { w: 20, h: 40 }), 10)
  })

  it('assignCell puts a box in the cell holding its centre', () => {
    const a = cv.assignCell({ x: 30, y: 120, w: 110, h: 120 }, 7, 280)
    expect(a.col).toBe(Math.floor(((30 + 55) / 280) * 7))
    expect(a.row).toBe(Math.floor(((120 + 60) / 280) * 7))
    expect(a.tx).toBeGreaterThanOrEqual(0)
    expect(a.tx).toBeLessThan(1)
    expect(a.ty).toBeLessThan(1)
  })

  it('YOLO v1 emits a 7×7×30 tensor of 1470 numbers (cv-m15)', () => {
    expect(cv.yoloTensor(7, 2, 20)).toEqual({ cells: 49, perCell: 30, total: 1470 })
    expect(cv.yoloTensor(13, 5, 80).total).toBe(17745)
    expect(cv.yoloTensor(19, 3, 10).total).toBe(9025)
  })

  it('SSD300 sums to 8732 default boxes (cv-m19)', () => {
    expect(cv.ssdBoxCount()).toBe(8732)
    expect(cv.SSD_LAYERS.map(l => l.size * l.size * l.boxes)).toEqual([5776, 2166, 600, 150, 36, 4])
  })
})
