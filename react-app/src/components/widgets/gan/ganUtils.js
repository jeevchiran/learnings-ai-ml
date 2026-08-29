// Shared toy-math helpers for the GAN track widgets — deterministic, no external deps.

export function gaussianPdf(x, mean, std) {
  const z = (x - mean) / std;
  return Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Maps a domain range to an SVG pixel range and returns an "M..L..L.." path string.
export function buildDensityPath(fn, { xMin, xMax, yMax, width, height, padding = 10, samples = 80 }) {
  const usableW = width - 2 * padding;
  const usableH = height - 2 * padding;
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const x = xMin + (i / samples) * (xMax - xMin);
    const y = fn(x);
    const px = padding + (usableW * i) / samples;
    const py = padding + usableH * (1 - Math.min(y / yMax, 1));
    pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`);
  }
  return pts.join(' ');
}

// Tiny seeded PRNG (mulberry32) so scatter points are fixed across renders/toggles.
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// N points scattered around (cx, cy) with the given spread, seeded for stability.
export function seededCluster(cx, cy, spread, count, seed) {
  const rand = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const r = rand() * spread;
    pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return pts;
}

// A toy "generator": renders an 8x8 grayscale blob whose position/shape is a
// deterministic function of (z1, z2), standing in for a trained decoder's output.
export function decodeToyBlob(z1, z2, size = 8) {
  const cx = size / 2 + z1 * (size / 5);
  const cy = size / 2 - z2 * (size / 5);
  const radius = size / 3 + Math.abs(Math.sin(z1 * 0.8 + z2 * 0.5)) * (size / 6);
  const grid = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      const d = Math.hypot(c - cx, r - cy);
      const v = Math.max(0, 1 - d / radius);
      row.push(v);
    }
    grid.push(row);
  }
  return grid;
}

// Toy proxy metrics for the IS/FID comparator widget. Not the real formulas —
// built only to show the qualitative difference: IS barely penalises lost
// diversity, FID punishes it hard because it compares whole distributions.
export function toyInceptionScore(sharpness, diversity) {
  const confidence = 0.3 + 0.7 * (sharpness / 100);
  const spread = 0.6 + 0.4 * (diversity / 100); // IS: diversity term is a mild multiplier
  return +(Math.exp(confidence) * spread).toFixed(2);
}

export function toyFID(sharpness, diversity) {
  const sharpnessGap = (100 - sharpness) / 100;
  const diversityGap = ((100 - diversity) / 100) ** 2; // FID: diversity loss dominates, squared
  return +((sharpnessGap * 40 + diversityGap * 220) + 3).toFixed(1);
}
