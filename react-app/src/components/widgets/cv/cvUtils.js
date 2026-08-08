/* Numeric core for the Computer Vision track.
 *
 * Every number the cv-* modules quote is produced here, so the prose and the
 * widgets cannot drift apart. Pure functions only — no React, no DOM. */

export const TRACK = '#15803d'

/* ────────────────────────── helpers ────────────────────────── */

export function clamp8(v) { return Math.max(0, Math.min(255, Math.round(v))) }

/** Deterministic PRNG so every render (and every test) sees the same "noise". */
export function lcg(seed = 7) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

/** Border handling for a coordinate that fell outside [0, n). */
function edge(i, n, mode) {
  if (i >= 0 && i < n) return i
  if (mode === 'zero') return -1
  if (mode === 'replicate') return Math.max(0, Math.min(n - 1, i))
  // reflect101: ...2 1 | 0 1 2 ... n-1 | n-2 n-3...
  const m = i < 0 ? -i : (i > n - 1 ? 2 * (n - 1) - i : i)
  return Math.max(0, Math.min(n - 1, m))
}

/* ────────────────────────── sample images ──────────────────────────
 * 12×12 greyscale. Small enough to print every pixel value on screen,
 * big enough that a 3×3 kernel has somewhere to travel. */

export const IMG_N = 12

function build(fn, n = IMG_N) {
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => clamp8(fn(r, c))))
}

export const SAMPLE_IMAGES = {
  'Step edge':     build((r, c) => (c < 6 ? 40 : 210)),
  'Ramp':          build((r, c) => 15 + (r + c) * 9),
  'Bright square': build((r, c) => (r >= 3 && r <= 8 && c >= 3 && c <= 8 ? 205 : 45)),
  'Checker':       build((r, c) => ((((r / 3) | 0) + ((c / 3) | 0)) % 2 ? 205 : 50)),
  'Low contrast':  build((r, c) => 98 + ((r * 5 + c * 3) % 7) * 2 + (r >= 4 && r <= 8 && c >= 3 && c <= 7 ? 11 : 0)),
}

/** Flip ~`rate` of the pixels to pure black or pure white. Deterministic. */
export function saltPepper(img, rate = 0.10, seed = 11) {
  const rnd = lcg(seed)
  return img.map(row => row.map(v => {
    const u = rnd()
    if (u < rate / 2) return 0
    if (u < rate) return 255
    return v
  }))
}

/* ────────────────────────── kernels & filtering ────────────────────────── */

export const KERNELS = {
  'Identity':     { k: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],       signed: false, note: 'Does nothing — the control case.' },
  'Box blur':     { k: [[1, 1, 1], [1, 1, 1], [1, 1, 1]].map(r => r.map(v => v / 9)), signed: false, note: 'Unweighted average. Cheap, but leaves boxy ringing.' },
  'Gaussian':     { k: [[1, 2, 1], [2, 4, 2], [1, 2, 1]].map(r => r.map(v => v / 16)), signed: false, note: 'Distance-weighted average. Separable: 1×3 then 3×1.' },
  'Sharpen':      { k: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],   signed: false, note: 'Identity + Laplacian: adds back what the blur removed.' },
  'Sobel X':      { k: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],    signed: true,  note: 'Vertical-edge response — the horizontal derivative.' },
  'Sobel Y':      { k: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],    signed: true,  note: 'Horizontal-edge response — the vertical derivative.' },
  'Laplacian':    { k: [[0, 1, 0], [1, -4, 1], [0, 1, 0]],      signed: true,  note: 'Second derivative — fires on both edge polarities.' },
  'Emboss':       { k: [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]],    signed: true,  note: 'Directional derivative plus identity — fake lighting.' },
}

export function kernelSum(k) { return k.flat().reduce((a, b) => a + b, 0) }

/**
 * 2-D correlation (what every DL framework calls "convolution") or true
 * convolution with the kernel flipped. Returns raw floats — no clamping — so
 * the caller decides how to display signed responses.
 */
export function convolve2d(img, kernel, { flip = false, border = 'reflect' } = {}) {
  const H = img.length, W = img[0].length
  const kh = kernel.length, kw = kernel[0].length
  const ay = (kh - 1) >> 1, ax = (kw - 1) >> 1
  const K = flip ? kernel.map(r => [...r].reverse()).reverse() : kernel

  return Array.from({ length: H }, (_, r) => Array.from({ length: W }, (_, c) => {
    let s = 0
    for (let i = 0; i < kh; i++) {
      const rr = edge(r + i - ay, H, border)
      if (rr < 0) continue
      for (let j = 0; j < kw; j++) {
        const cc = edge(c + j - ax, W, border)
        if (cc < 0) continue
        s += img[rr][cc] * K[i][j]
      }
    }
    return s
  }))
}

/** Rank filter — the reason salt-and-pepper noise dies where a mean filter smears it. */
export function medianFilter(img, size = 3, border = 'reflect') {
  const H = img.length, W = img[0].length, a = (size - 1) >> 1
  return Array.from({ length: H }, (_, r) => Array.from({ length: W }, (_, c) => {
    const vals = []
    for (let i = -a; i <= a; i++) for (let j = -a; j <= a; j++) {
      const rr = edge(r + i, H, border), cc = edge(c + j, W, border)
      if (rr >= 0 && cc >= 0) vals.push(img[rr][cc])
    }
    vals.sort((x, y) => x - y)
    return vals[(vals.length - 1) >> 1]
  }))
}

/** Map a signed response to 0–255 for display: 0 becomes mid-grey. */
export function signedToDisplay(raw) {
  const peak = Math.max(1, ...raw.flat().map(Math.abs))
  return raw.map(row => row.map(v => clamp8(128 + (v / peak) * 127)))
}

export function clampToDisplay(raw) { return raw.map(row => row.map(clamp8)) }

/* ────────────────────────── point operations ────────────────────────── */

export function addImages(a, b, alpha = 0.5) {
  return a.map((row, r) => row.map((v, c) => clamp8(alpha * v + (1 - alpha) * b[r][c])))
}
export function subtractImages(a, b) { return a.map((row, r) => row.map((v, c) => clamp8(v - b[r][c]))) }
export function absDiff(a, b) { return a.map((row, r) => row.map((v, c) => Math.abs(v - b[r][c]))) }
export function bitwiseAnd(a, mask) { return a.map((row, r) => row.map((v, c) => (mask[r][c] > 127 ? v : 0))) }
export function threshold(img, t) { return img.map(row => row.map(v => (v > t ? 255 : 0))) }
export function gammaCorrect(img, g) { return img.map(row => row.map(v => clamp8(255 * Math.pow(v / 255, g)))) }
export function brightnessContrast(img, alpha, beta) {
  return img.map(row => row.map(v => clamp8(alpha * v + beta)))
}

/* ────────────────────────── distributions ────────────────────────── */

export function histogram(img, bins = 32) {
  const h = new Array(bins).fill(0)
  const w = 256 / bins
  for (const row of img) for (const v of row) h[Math.min(bins - 1, Math.floor(v / w))]++
  return h
}

export function imageStats(img) {
  const flat = img.flat()
  const n = flat.length
  const mean = flat.reduce((a, b) => a + b, 0) / n
  const varr = flat.reduce((a, b) => a + (b - mean) ** 2, 0) / n
  return { min: Math.min(...flat), max: Math.max(...flat), mean, std: Math.sqrt(varr), n }
}

/** Classic 256-level histogram equalisation: remap by the normalised CDF. */
export function equalize(img) {
  const hist = new Array(256).fill(0)
  for (const row of img) for (const v of row) hist[v]++
  const n = img.length * img[0].length
  let acc = 0
  const cdf = hist.map(c => (acc += c))
  const cdfMin = cdf.find(v => v > 0)
  const lut = cdf.map(v => clamp8(((v - cdfMin) / (n - cdfMin)) * 255))
  return img.map(row => row.map(v => lut[v]))
}

/** Per-channel standardisation — the transform every torchvision pipeline ends with. */
export function standardize(img, mean, std) {
  return img.map(row => row.map(v => (v / 255 - mean) / std))
}

/* ────────────────────────── geometry ────────────────────────── */

export function mat3mul(A, B) {
  return Array.from({ length: 3 }, (_, i) => Array.from({ length: 3 }, (_, j) =>
    A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j]))
}

export function applyMat(M, [x, y]) {
  const w = M[2][0] * x + M[2][1] * y + M[2][2]
  return [(M[0][0] * x + M[0][1] * y + M[0][2]) / w, (M[1][0] * x + M[1][1] * y + M[1][2]) / w]
}

/**
 * Composed as M = T · R · Shear · S, so the listed order is the order the
 * point experiences: scale first, rotate last, then translate.
 */
export function affineMatrix({ tx = 0, ty = 0, deg = 0, sx = 1, sy = 1, shx = 0, p0 = 0, p1 = 0 } = {}) {
  const t = (deg * Math.PI) / 180
  const T = [[1, 0, tx], [0, 1, ty], [0, 0, 1]]
  const R = [[Math.cos(t), -Math.sin(t), 0], [Math.sin(t), Math.cos(t), 0], [0, 0, 1]]
  const H = [[1, shx, 0], [0, 1, 0], [0, 0, 1]]
  const S = [[sx, 0, 0], [0, sy, 0], [0, 0, 1]]
  const M = mat3mul(T, mat3mul(R, mat3mul(H, S)))
  M[2][0] = p0; M[2][1] = p1          // perspective terms — 0 keeps it affine
  return M
}

export function det3(M) {
  return M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1])
       - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0])
       + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])
}

/** Bilinear sample with replicate borders — what `cv2.INTER_LINEAR` does. */
export function bilinear(img, x, y) {
  const H = img.length, W = img[0].length
  const x0 = Math.floor(x), y0 = Math.floor(y)
  const fx = x - x0, fy = y - y0
  const g = (r, c) => img[Math.max(0, Math.min(H - 1, r))][Math.max(0, Math.min(W - 1, c))]
  return (g(y0, x0) * (1 - fx) * (1 - fy) + g(y0, x0 + 1) * fx * (1 - fy)
        + g(y0 + 1, x0) * (1 - fx) * fy + g(y0 + 1, x0 + 1) * fx * fy)
}

/* ────────────────────────── features ────────────────────────── */

/* Replicate, not reflect: mirroring flips the gradient's sign at the boundary
 * and manufactures structure that is not in the image — on a smooth ramp it
 * invents a ridge, and Harris then reports corners all round the frame. */
export function sobelGradients(img, border = 'replicate') {
  const gx = convolve2d(img, KERNELS['Sobel X'].k, { border })
  const gy = convolve2d(img, KERNELS['Sobel Y'].k, { border })
  const mag = gx.map((row, r) => row.map((v, c) => Math.hypot(v, gy[r][c])))
  const ori = gx.map((row, r) => row.map((v, c) => (Math.atan2(gy[r][c], v) * 180) / Math.PI))
  return { gx, gy, mag, ori }
}

/**
 * Harris response R = det(M) − k·trace(M)², with M the Sobel structure tensor
 * summed over a `win`×`win` neighbourhood. Gradients are scaled to roughly
 * [-1, 1] first so R lands in a range that reads on screen.
 */
export function harris(img, { k = 0.04, win = 3 } = {}) {
  const { gx, gy } = sobelGradients(img.map(row => row.map(v => v / 255)))
  const H = img.length, W = img[0].length, a = (win - 1) >> 1
  const out = Array.from({ length: H }, () => new Array(W).fill(0))
  const tensors = Array.from({ length: H }, () => new Array(W).fill(null))

  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    let sxx = 0, syy = 0, sxy = 0
    for (let i = -a; i <= a; i++) for (let j = -a; j <= a; j++) {
      const rr = edge(r + i, H, 'replicate'), cc = edge(c + j, W, 'replicate')
      sxx += gx[rr][cc] ** 2; syy += gy[rr][cc] ** 2; sxy += gx[rr][cc] * gy[rr][cc]
    }
    const det = sxx * syy - sxy * sxy
    const tr = sxx + syy
    out[r][c] = det - k * tr * tr
    tensors[r][c] = { sxx, syy, sxy, det, tr }
  }
  return { R: out, tensors }
}

/** Corner / edge / flat from the Harris response, using a fraction of |R|max. */
export function classifyHarris(R, frac = 0.02) {
  const peak = Math.max(...R.flat().map(Math.abs)) || 1
  const t = frac * peak
  return R.map(row => row.map(v => (v > t ? 'corner' : v < -t ? 'edge' : 'flat')))
}

/* ────────────────────────── boxes & detection ────────────────────────── */

/** Boxes are {x, y, w, h} with (x, y) the top-left corner. */
export function boxArea(b) { return Math.max(0, b.w) * Math.max(0, b.h) }

export function intersection(a, b) {
  const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y)
  const x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + a.h, b.y + b.h)
  return { x, y, w: Math.max(0, x2 - x), h: Math.max(0, y2 - y) }
}

export function unionArea(a, b) { return boxArea(a) + boxArea(b) - boxArea(intersection(a, b)) }

export function iou(a, b) {
  const u = unionArea(a, b)
  return u > 0 ? boxArea(intersection(a, b)) / u : 0
}

/** Generalised IoU — stays informative (and negative) when the boxes miss entirely. */
export function giou(a, b) {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y)
  const x2 = Math.max(a.x + a.w, b.x + b.w), y2 = Math.max(a.y + a.h, b.y + b.h)
  const cArea = (x2 - x) * (y2 - y)
  const u = unionArea(a, b)
  return iou(a, b) - (cArea - u) / cArea
}

/**
 * Greedy non-max suppression. Returns the survivors plus a step log, so a
 * widget can replay the loop instead of just showing the answer.
 */
export function nms(boxes, thr = 0.5) {
  const pool = [...boxes].sort((p, q) => q.score - p.score)
  const kept = [], steps = []
  const dead = new Set()
  for (const b of pool) {
    if (dead.has(b.id)) continue
    kept.push(b)
    const killed = []
    for (const o of pool) {
      if (o.id === b.id || dead.has(o.id)) continue
      const ov = iou(b, o)
      if (ov > thr) { dead.add(o.id); killed.push({ id: o.id, iou: ov }) }
    }
    steps.push({ keep: b.id, score: b.score, killed })
  }
  return { kept, steps, suppressed: [...dead] }
}

export function l2Loss(x) { return 0.5 * x * x }
export function l1Loss(x) { return Math.abs(x) }
/** Smooth L1 (Fast R-CNN, β=1): quadratic near zero, linear once |x| > β. */
export function smoothL1(x, beta = 1) {
  const a = Math.abs(x)
  return a < beta ? (0.5 * x * x) / beta : a - 0.5 * beta
}

/**
 * All-point (VOC2010 / COCO style) average precision from detections already
 * flagged tp/fp and sorted by descending score.
 */
export function prCurve(dets, nGT) {
  const sorted = [...dets].sort((a, b) => b.score - a.score)
  let tp = 0, fp = 0
  const pts = sorted.map(d => {
    d.tp ? tp++ : fp++
    return { score: d.score, tp: d.tp, recall: tp / nGT, precision: tp / (tp + fp) }
  })
  // Monotone envelope: precision at recall r is the best precision at recall ≥ r.
  const env = pts.map(p => ({ ...p }))
  for (let i = env.length - 2; i >= 0; i--) env[i].precision = Math.max(env[i].precision, env[i + 1].precision)
  let ap = 0, prev = 0
  for (const p of env) { ap += (p.recall - prev) * p.precision; prev = p.recall }
  return { points: pts, envelope: env, ap }
}

/* ────────────────────────── anchors & grids ────────────────────────── */

/** IoU between two boxes sharing a centre — the YOLOv2 anchor distance. */
export function shapeIoU(a, b) {
  const inter = Math.min(a.w, b.w) * Math.min(a.h, b.h)
  return inter / (a.w * a.h + b.w * b.h - inter)
}

/**
 * k-means over box shapes with d = 1 − IoU. Seeded deterministically by
 * area-sorted stride so the same boxes always give the same anchors.
 */
export function anchorKMeans(boxes, k, iters = 50) {
  const sorted = [...boxes].sort((a, b) => a.w * a.h - b.w * b.h)
  let cents = Array.from({ length: k }, (_, i) => {
    const b = sorted[Math.floor(((i + 0.5) / k) * sorted.length)]
    return { w: b.w, h: b.h }
  })
  let assign = new Array(boxes.length).fill(-1)
  for (let it = 0; it < iters; it++) {
    let moved = false
    assign = boxes.map((b, i) => {
      let best = 0, bestD = Infinity
      cents.forEach((c, j) => { const d = 1 - shapeIoU(b, c); if (d < bestD) { bestD = d; best = j } })
      if (assign[i] !== best) moved = true
      return best
    })
    cents = cents.map((c, j) => {
      const members = boxes.filter((_, i) => assign[i] === j)
      if (!members.length) return c
      return {
        w: members.reduce((s, b) => s + b.w, 0) / members.length,
        h: members.reduce((s, b) => s + b.h, 0) / members.length,
      }
    })
    if (!moved && it > 0) break
  }
  const meanIoU = boxes.reduce((s, b, i) => s + shapeIoU(b, cents[assign[i]]), 0) / boxes.length
  return { anchors: cents, assign, meanIoU }
}

/** Which YOLO cell owns a box, and the offsets the network must regress. */
export function assignCell(box, S, imgSize = 1) {
  const cx = (box.x + box.w / 2) / imgSize
  const cy = (box.y + box.h / 2) / imgSize
  const col = Math.min(S - 1, Math.floor(cx * S))
  const row = Math.min(S - 1, Math.floor(cy * S))
  return { row, col, cx, cy, tx: cx * S - col, ty: cy * S - row, tw: box.w / imgSize, th: box.h / imgSize }
}

/** SSD300's six prediction heads — the layers that sum to the famous 8732. */
export const SSD_LAYERS = [
  { name: 'conv4_3',  size: 38, boxes: 4, scale: 0.10 },
  { name: 'conv7',    size: 19, boxes: 6, scale: 0.20 },
  { name: 'conv8_2',  size: 10, boxes: 6, scale: 0.375 },
  { name: 'conv9_2',  size: 5,  boxes: 6, scale: 0.55 },
  { name: 'conv10_2', size: 3,  boxes: 4, scale: 0.725 },
  { name: 'conv11_2', size: 1,  boxes: 4, scale: 0.90 },
]

export function ssdBoxCount(layers = SSD_LAYERS) {
  return layers.reduce((s, l) => s + l.size * l.size * l.boxes, 0)
}

/** YOLO output tensor size: S × S × (B·5 + C). */
export function yoloTensor(S, B, C) { return { cells: S * S, perCell: B * 5 + C, total: S * S * (B * 5 + C) } }

/* Published PASCAL VOC 2007 results, used by the detector-comparison widget.
 * Sources: R-CNN (Girshick 2014), Fast/Faster R-CNN (2015), YOLO (2016), SSD (2016). */
export const DETECTORS = [
  { name: 'R-CNN (VGG16)',     map: 66.0, fps: 0.02, sec: 47,   stage: 2, note: '2000 warped crops, one CNN pass each.' },
  { name: 'Fast R-CNN',        map: 70.0, fps: 0.5,  sec: 2.3,  stage: 2, note: 'One CNN pass + RoI pooling. Selective search still dominates.' },
  { name: 'Faster R-CNN',      map: 73.2, fps: 5,    sec: 0.2,  stage: 2, note: 'RPN replaces selective search; proposals become nearly free.' },
  { name: 'YOLO v1',           map: 63.4, fps: 45,   sec: 0.022, stage: 1, note: 'One grid regression. Fastest, weakest on small/clustered objects.' },
  { name: 'SSD300',            map: 74.3, fps: 59,   sec: 0.017, stage: 1, note: 'Multi-scale default boxes recover the accuracy YOLO v1 lost.' },
  { name: 'SSD512',            map: 76.8, fps: 22,   sec: 0.045, stage: 1, note: 'Bigger input, better small objects, half the speed.' },
]
