// Shared toy-math helpers for the Diffusion Models track widgets — deterministic, no external deps.

// Tiny seeded PRNG (mulberry32) so noise patterns are fixed across renders/toggles.
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

// Box-Muller: turns two uniform draws into one standard-normal draw.
function seededGaussian(rand) {
  const u1 = Math.max(rand(), 1e-9);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// A fixed 10x10 toy "image": a ring, standing in for x_0.
export function toyImage(size = 10) {
  const grid = [];
  const cx = size / 2 - 0.5, cy = size / 2 - 0.5, r = size / 3;
  for (let row = 0; row < size; row++) {
    const line = [];
    for (let col = 0; col < size; col++) {
      const d = Math.hypot(col - cx, row - cy);
      line.push(Math.abs(d - r) < 1.1 ? 1 : 0.08);
    }
    grid.push(line);
  }
  return grid;
}

// Fixed seeded noise grid, same shape as toyImage, standing in for epsilon ~ N(0, I).
export function toyNoise(size = 10, seed = 7) {
  const rand = mulberry32(seed);
  const grid = [];
  for (let row = 0; row < size; row++) {
    const line = [];
    for (let col = 0; col < size; col++) line.push(seededGaussian(rand));
    grid.push(line);
  }
  return grid;
}

// Linear beta schedule (DDPM default): beta_t rises linearly from betaStart to betaEnd.
export function linearAlphaBar(T, betaStart = 1e-4, betaEnd = 0.02) {
  const alphaBars = [1];
  let alphaBar = 1;
  for (let t = 1; t <= T; t++) {
    const beta = betaStart + ((betaEnd - betaStart) * (t - 1)) / (T - 1);
    alphaBar *= 1 - beta;
    alphaBars.push(alphaBar);
  }
  return alphaBars;
}

// Cosine schedule (Nichol & Dhariwal): destroys signal much more gradually near t=0.
export function cosineAlphaBar(T, s = 0.008) {
  const f = (t) => Math.cos(((t / T + s) / (1 + s)) * (Math.PI / 2)) ** 2;
  const f0 = f(0);
  const alphaBars = [];
  for (let t = 0; t <= T; t++) alphaBars.push(f(t) / f0);
  return alphaBars;
}

// Closed-form forward process: x_t = sqrt(alphaBar_t) * x0 + sqrt(1 - alphaBar_t) * noise
export function forwardNoise(x0Grid, noiseGrid, alphaBarT) {
  const a = Math.sqrt(alphaBarT);
  const b = Math.sqrt(1 - alphaBarT);
  return x0Grid.map((row, r) => row.map((v, c) => a * v + b * noiseGrid[r][c]));
}

export function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// Toy proxies for the classifier-free-guidance widget: adherence rises with w,
// diversity falls — the qualitative trade-off, not the real extrapolation formula.
export function toyAdherence(w) {
  return +(100 * (1 - Math.exp(-w / 3))).toFixed(0);
}

export function toyDiversity(w) {
  return +(100 * Math.exp(-w / 6)).toFixed(0);
}
