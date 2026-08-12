/* Numeric core for the Transfer Learning / Embeddings / U-Net track.
 *
 * Every figure the tl-* modules quote is produced here, so the prose and the
 * widgets cannot drift apart. Pure functions only — no React, no DOM. */

export const TRACK = '#9f1239'

/* ────────────────────── conv arithmetic ────────────────────── */

/** Standard convolution / pooling output size. */
export function convOut(inSize, k, s = 1, p = 0, d = 1) {
  return Math.floor((inSize + 2 * p - d * (k - 1) - 1) / s) + 1
}

/**
 * Transposed convolution output size — the conv formula solved for the input.
 * `outputPadding` breaks the tie when several input sizes map to one output.
 */
export function convTransposeOut(inSize, k, s = 1, p = 0, outputPadding = 0, d = 1) {
  return (inSize - 1) * s - 2 * p + d * (k - 1) + outputPadding + 1
}

/** Conv layer parameter count (weights + optional bias). */
export function convParams(cIn, cOut, k, bias = true) {
  return k * k * cIn * cOut + (bias ? cOut : 0)
}

/* ────────────────────── upsampling ────────────────────── */

/** Repeat each pixel s×s times. No new information, no learned weights. */
export function nearestUpsample(img, s = 2) {
  return img.flatMap(row => {
    const wide = row.flatMap(v => Array(s).fill(v))
    return Array(s).fill(wide)
  })
}

/**
 * Bilinear upsample with align_corners=false — the PyTorch default, and the
 * reason a naive implementation disagrees with F.interpolate by half a pixel.
 */
export function bilinearUpsample(img, s = 2) {
  const H = img.length, W = img[0].length
  const OH = H * s, OW = W * s
  const at = (r, c) => img[Math.max(0, Math.min(H - 1, r))][Math.max(0, Math.min(W - 1, c))]
  return Array.from({ length: OH }, (_, oy) => Array.from({ length: OW }, (_, ox) => {
    const y = (oy + 0.5) / s - 0.5
    const x = (ox + 0.5) / s - 0.5
    const y0 = Math.floor(y), x0 = Math.floor(x)
    const fy = y - y0, fx = x - x0
    return at(y0, x0) * (1 - fx) * (1 - fy) + at(y0, x0 + 1) * fx * (1 - fy)
         + at(y0 + 1, x0) * (1 - fx) * fy + at(y0 + 1, x0 + 1) * fx * fy
  }))
}

/** Bed of nails: value in the top-left of each block, zeros elsewhere. */
export function bedOfNails(img, s = 2) {
  const out = Array.from({ length: img.length * s }, () => new Array(img[0].length * s).fill(0))
  img.forEach((row, r) => row.forEach((v, c) => { out[r * s][c * s] = v }))
  return out
}

/**
 * Max-unpool: put each value back where the pooling stage found its maximum.
 * `indices[r][c]` is [dr, dc] within the s×s block, as nn.MaxPool2d would return.
 */
export function maxUnpool(img, indices, s = 2) {
  const out = Array.from({ length: img.length * s }, () => new Array(img[0].length * s).fill(0))
  img.forEach((row, r) => row.forEach((v, c) => {
    const [dr, dc] = indices[r][c]
    out[r * s + dr][c * s + dc] = v
  }))
  return out
}

/** Max-pool that also records argmax offsets, so unpooling has somewhere to go. */
export function maxPoolWithIndices(img, s = 2) {
  const OH = Math.floor(img.length / s), OW = Math.floor(img[0].length / s)
  const out = [], idx = []
  for (let r = 0; r < OH; r++) {
    const orow = [], irow = []
    for (let c = 0; c < OW; c++) {
      let best = -Infinity, bi = [0, 0]
      for (let dr = 0; dr < s; dr++) for (let dc = 0; dc < s; dc++) {
        const v = img[r * s + dr][c * s + dc]
        if (v > best) { best = v; bi = [dr, dc] }
      }
      orow.push(best); irow.push(bi)
    }
    out.push(orow); idx.push(irow)
  }
  return { out, idx }
}

/**
 * Transposed convolution by scatter-add: every input cell multiplies the whole
 * kernel and adds it into the output at a stride-spaced offset. Overlaps are
 * summed — which is exactly where checkerboard artefacts come from.
 */
export function convTranspose2d(img, kernel, { stride = 2, padding = 0 } = {}) {
  const H = img.length, W = img[0].length
  const k = kernel.length
  const full = convTransposeOut(H, k, stride, 0)
  const acc = Array.from({ length: full }, () => new Array(convTransposeOut(W, k, stride, 0)).fill(0))
  const hits = acc.map(row => row.map(() => 0))
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) {
      acc[r * stride + i][c * stride + j] += img[r][c] * kernel[i][j]
      hits[r * stride + i][c * stride + j] += 1
    }
  }
  if (padding === 0) return { out: acc, hits }
  const crop = a => a.slice(padding, a.length - padding).map(row => row.slice(padding, row.length - padding))
  return { out: crop(acc), hits: crop(hits) }
}

/* ────────────────────── segmentation metrics ────────────────────── */

const sum = a => a.flat().reduce((x, y) => x + y, 0)

/** Hard Dice on binary masks: 2|A∩B| / (|A|+|B|). */
export function dice(pred, gt, eps = 0) {
  const inter = pred.flat().reduce((s, v, i) => s + v * gt.flat()[i], 0)
  const denom = sum(pred) + sum(gt)
  return denom + eps === 0 ? 1 : (2 * inter + eps) / (denom + eps)
}

export function iou(pred, gt, eps = 0) {
  const p = pred.flat(), g = gt.flat()
  const inter = p.reduce((s, v, i) => s + v * g[i], 0)
  const union = sum(pred) + sum(gt) - inter
  return union + eps === 0 ? 1 : (inter + eps) / (union + eps)
}

/** Dice and IoU are monotone in each other: D = 2J/(1+J). */
export const diceFromIoU = j => (2 * j) / (1 + j)
export const iouFromDice = d => d / (2 - d)

/**
 * Soft Dice — the differentiable version used as a loss. `pred` holds
 * probabilities rather than 0/1, so the intersection is a product sum.
 */
export function softDice(pred, gt, eps = 1) {
  const p = pred.flat(), g = gt.flat()
  const inter = p.reduce((s, v, i) => s + v * g[i], 0)
  return (2 * inter + eps) / (p.reduce((s, v) => s + v, 0) + g.reduce((s, v) => s + v, 0) + eps)
}

export function bce(pred, gt, eps = 1e-7) {
  const p = pred.flat(), g = gt.flat()
  return -p.reduce((s, v, i) => {
    const q = Math.min(1 - eps, Math.max(eps, v))
    return s + g[i] * Math.log(q) + (1 - g[i]) * Math.log(1 - q)
  }, 0) / p.length
}

export function pixelAccuracy(pred, gt) {
  const p = pred.flat(), g = gt.flat()
  return p.reduce((s, v, i) => s + (Math.round(v) === g[i] ? 1 : 0), 0) / p.length
}

/* ────────────────────── embeddings ────────────────────── */

export function cosine(a, b) {
  let d = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] }
  return na === 0 || nb === 0 ? 0 : d / Math.sqrt(na * nb)
}

export function l2(a, b) {
  return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
}

export function normalize(v) {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  return v.map(x => x / n)
}

/** Triplet margin loss: max(0, d(a,p) − d(a,n) + margin). */
export function tripletLoss(a, p, n, margin = 0.2) {
  return Math.max(0, l2(a, p) - l2(a, n) + margin)
}

/** k nearest neighbours by cosine similarity, excluding the query itself. */
export function knn(embeddings, queryIdx, k = 3) {
  const q = embeddings[queryIdx].vec
  return embeddings
    .map((e, i) => ({ i, sim: cosine(q, e.vec) }))
    .filter(x => x.i !== queryIdx)
    .sort((a, b) => b.sim - a.sim)
    .slice(0, k)
}

/* A tiny "image gallery" laid out in 2-D so an embedding space can be drawn
 * directly. Three visual classes with one deliberate near-boundary case. */
export const GALLERY = [
  { id: 'cat-1',   cls: 'cat',  vec: [0.82, 0.61] },
  { id: 'cat-2',   cls: 'cat',  vec: [0.75, 0.70] },
  { id: 'cat-3',   cls: 'cat',  vec: [0.88, 0.50] },
  { id: 'dog-1',   cls: 'dog',  vec: [0.45, 0.90] },
  { id: 'dog-2',   cls: 'dog',  vec: [0.35, 0.94] },
  { id: 'dog-3',   cls: 'dog',  vec: [0.55, 0.84] },
  { id: 'car-1',   cls: 'car',  vec: [-0.70, 0.42] },
  { id: 'car-2',   cls: 'car',  vec: [-0.80, 0.30] },
  { id: 'car-3',   cls: 'car',  vec: [-0.62, 0.55] },
  { id: 'cat-4?',  cls: 'cat',  vec: [0.62, 0.79] },   // sits between cat and dog
]

/* ────────────────────── architectures ────────────────────── */

/**
 * The original U-Net (Ronneberger et al. 2015): 3×3 unpadded convs, 2×2
 * max-pool, 2×2 up-convs, and a 1×1 head. Returns per-stage shapes and the
 * exact parameter count.
 */
export function unetSpec({ inCh = 1, classes = 2, base = 64, depth = 4, input = 572, padded = false } = {}) {
  const stages = []
  let size = input, ch = inCh, params = 0
  const convPad = padded ? 1 : 0

  for (let d = 0; d < depth; d++) {
    const out = base * 2 ** d
    params += convParams(ch, out, 3) + convParams(out, out, 3)
    const afterConv = convOut(convOut(size, 3, 1, convPad), 3, 1, convPad)
    stages.push({ level: d, kind: 'enc', ch: out, inSize: size, size: afterConv })
    size = Math.floor(afterConv / 2)          // 2×2 max-pool, stride 2
    ch = out
  }

  const bottleneckCh = base * 2 ** depth
  params += convParams(ch, bottleneckCh, 3) + convParams(bottleneckCh, bottleneckCh, 3)
  const bottleneckSize = convOut(convOut(size, 3, 1, convPad), 3, 1, convPad)
  stages.push({ level: depth, kind: 'bottleneck', ch: bottleneckCh, inSize: size, size: bottleneckSize })

  size = bottleneckSize
  ch = bottleneckCh
  for (let d = depth - 1; d >= 0; d--) {
    const out = base * 2 ** d
    params += convParams(ch, out, 2)                       // 2×2 up-conv halves the channels
    size = convTransposeOut(size, 2, 2, 0)
    // concat with the skip → 2·out channels in
    params += convParams(2 * out, out, 3) + convParams(out, out, 3)
    const afterConv = convOut(convOut(size, 3, 1, convPad), 3, 1, convPad)
    stages.push({ level: d, kind: 'dec', ch: out, inSize: size, size: afterConv, skipFrom: d })
    size = afterConv
    ch = out
  }

  params += convParams(ch, classes, 1)                     // 1×1 classification head
  return { stages, params, outSize: size, inputSize: input }
}

/** Encoder-decoder shape trajectory, used to show what the bottleneck costs. */
export function autoencoderTrajectory({ input = 128, base = 32, depth = 4, latent = 128 } = {}) {
  const rows = []
  let size = input, ch = 3
  rows.push({ name: 'input', size, ch, units: size * size * ch })
  for (let d = 0; d < depth; d++) {
    ch = base * 2 ** d
    size = Math.floor(size / 2)
    rows.push({ name: `enc ${d + 1}`, size, ch, units: size * size * ch })
  }
  rows.push({ name: 'latent', size: 1, ch: latent, units: latent })
  for (let d = depth - 1; d >= 0; d--) {
    ch = base * 2 ** d
    size *= 2
    rows.push({ name: `dec ${depth - d}`, size, ch, units: size * size * ch })
  }
  rows.push({ name: 'output', size, ch: 3, units: size * size * 3 })
  return rows
}

/* torchvision reference numbers: parameter count, ImageNet top-1 accuracy,
 * and the dimension of the penultimate feature vector you would use as an
 * embedding. */
export const BACKBONES = [
  { name: 'ResNet-18',        params: 11.7, top1: 69.8, dim: 512,  note: 'The default first try. Fast, small, well understood.' },
  { name: 'ResNet-50',        params: 25.6, top1: 76.1, dim: 2048, note: 'The reference backbone most papers compare against.' },
  { name: 'EfficientNet-B0',  params: 5.3,  top1: 77.7, dim: 1280, note: 'Better accuracy per parameter; slower per FLOP in practice.' },
  { name: 'MobileNetV3-L',    params: 5.5,  top1: 75.3, dim: 960,  note: 'Built for phones — depthwise separable throughout.' },
  { name: 'ConvNeXt-Tiny',    params: 28.6, top1: 82.5, dim: 768,  note: 'A CNN redesigned with transformer-era training recipes.' },
  { name: 'ViT-B/16',         params: 86.6, top1: 81.1, dim: 768,  note: 'Needs far more data (or heavy augmentation) to fine-tune well.' },
]

/**
 * Layer-wise transferability, following the shape Yosinski et al. (2014)
 * measured: early layers transfer almost perfectly, deep layers become
 * task-specific, and the drop is steeper the further the target domain sits
 * from ImageNet.
 */
export function transferability(layer, domainDistance) {
  const specificity = 1 / (1 + Math.exp(-(layer - 3.2)))      // how ImageNet-specific this depth is
  return Math.max(0, 1 - specificity * domainDistance)
}

export const DOMAINS = [
  { name: 'Everyday photos',   distance: 0.15, example: 'pets, food, products' },
  { name: 'Aerial / satellite', distance: 0.55, example: 'land use, rooftops' },
  { name: 'Medical imaging',   distance: 0.80, example: 'X-ray, histology, MRI' },
  { name: 'Microscopy / radar', distance: 0.95, example: 'cells, SAR returns' },
]

/** Trainable vs frozen split for a backbone cut at `freezeUpTo` of 5 stages. */
export function freezeSplit(freezeUpTo, { totalParams = 25.6, headParams = 2.05, stages = 5 } = {}) {
  // ResNet-50's parameters are heavily back-loaded: stage 4 alone is over half.
  const perStage = [0.9, 2.2, 3.8, 12.0, 6.7]
  const frozen = perStage.slice(0, freezeUpTo).reduce((a, b) => a + b, 0)
  const trainable = totalParams - frozen + headParams
  return {
    frozen, trainable, headParams,
    frozenPct: (frozen / (totalParams + headParams)) * 100,
    perStage,
  }
}
