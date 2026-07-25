// Probability utilities: Bayes, distributions, expectation/variance/covariance

export function makeRng(seed = 7) {
  let s = seed >>> 0;
  return function rand() {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randn(rand) {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ── Bayes' theorem ──
// P(A|B) given P(A), P(B|A), P(B|not A)
export function bayes(pA, pBgivenA, pBgivenNotA) {
  const pB = pBgivenA * pA + pBgivenNotA * (1 - pA);
  return pB === 0 ? 0 : (pBgivenA * pA) / pB;
}

// ── Combinatorics & distributions ──
export function nCk(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < k; i++) result = (result * (n - i)) / (i + 1);
  return Math.round(result);
}

export function bernoulliPMF(p, k) {
  return k === 1 ? p : k === 0 ? 1 - p : 0;
}

export function binomialPMF(n, p, k) {
  return nCk(n, k) * p ** k * (1 - p) ** (n - k);
}

export function poissonPMF(lambda, k) {
  return (lambda ** k) * Math.exp(-lambda) / factorial(k);
}

function factorial(k) {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return f;
}

export function gaussianPDF(x, mu = 0, sigma = 1) {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}

// ── Expectation, variance, covariance ──
// dist: array of { x, p }
export function expectation(dist) {
  return dist.reduce((s, { x, p }) => s + x * p, 0);
}

export function variance(dist) {
  const mu = expectation(dist);
  return dist.reduce((s, { x, p }) => s + p * (x - mu) ** 2, 0);
}

export function sampleMean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function sampleCovariance(points) {
  const mx = sampleMean(points.map(p => p[0]));
  const my = sampleMean(points.map(p => p[1]));
  const n = points.length;
  let sxy = 0, sxx = 0, syy = 0;
  for (const [x, y] of points) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  }
  return { cov: sxy / (n - 1), varX: sxx / (n - 1), varY: syy / (n - 1) };
}

export function pearsonCorrelation(points) {
  const { cov, varX, varY } = sampleCovariance(points);
  const denom = Math.sqrt(varX * varY);
  return denom === 0 ? 0 : cov / denom;
}

// Correlated bivariate Gaussian points with target Pearson correlation rho
export function generateCorrelated(n, rho, seed = 7) {
  const rand = makeRng(seed);
  const points = [];
  for (let i = 0; i < n; i++) {
    const x = randn(rand);
    const y = rho * x + Math.sqrt(1 - rho * rho) * randn(rand);
    points.push([x, y]);
  }
  return points;
}
