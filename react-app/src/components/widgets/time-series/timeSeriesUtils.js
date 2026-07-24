// Time series math utilities (synthetic data, smoothing, ACF, AR fitting)

// Seeded PRNG (mulberry32-style, same pattern as clusteringUtils.js)
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

export function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function variance(arr) {
  const m = mean(arr);
  return arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length;
}

export function rmse(y, yhat) {
  const pairs = y.map((v, i) => [v, yhat[i]]).filter(([, p]) => p !== undefined && p !== null && !Number.isNaN(p));
  const sq = pairs.reduce((s, [v, p]) => s + (v - p) ** 2, 0);
  return Math.sqrt(sq / pairs.length);
}

// ── Synthetic series: trend + (additive|multiplicative) seasonality + noise ──
export function generateSeries({ n = 48, period = 12, trendSlope = 0.6, seasonalAmp = 8, noiseStd = 2, mode = 'additive', level = 40, seed = 7 } = {}) {
  const rand = makeRng(seed);
  const t = Array.from({ length: n }, (_, i) => i);
  const trend = t.map(ti => level + trendSlope * ti);
  const y = t.map((ti, i) => {
    const s = Math.sin((2 * Math.PI * ti) / period);
    const eps = randn(rand) * noiseStd;
    return mode === 'additive'
      ? trend[i] + seasonalAmp * s + eps
      : trend[i] * (1 + (seasonalAmp / 100) * s) * (1 + eps / 100);
  });
  return { t, y, trend };
}

// ── Forecast baselines ──
export function naiveForecast(y) {
  return y.map((_, i) => (i === 0 ? undefined : y[i - 1]));
}

export function meanForecast(y) {
  return y.map((_, i) => (i === 0 ? undefined : mean(y.slice(0, i))));
}

export function movingAverageForecast(y, window) {
  return y.map((_, i) => (i < window ? undefined : mean(y.slice(i - window, i))));
}

// ── Classical decomposition (centered moving average) ──
function centeredMA(y, period) {
  const n = y.length;
  const out = new Array(n).fill(undefined);
  const half = Math.floor(period / 2);
  for (let i = half; i < n - half; i++) {
    if (period % 2 === 0) {
      // even period: average of two offset windows of length `period`
      const w1 = y.slice(i - half, i - half + period).reduce((a, b) => a + b, 0) / period;
      const w2 = y.slice(i - half + 1, i - half + 1 + period).reduce((a, b) => a + b, 0) / period;
      out[i] = (w1 + w2) / 2;
    } else {
      out[i] = mean(y.slice(i - half, i + half + 1));
    }
  }
  return out;
}

export function classicalDecompose(y, period, mode = 'additive') {
  const n = y.length;
  const trend = centeredMA(y, period);
  const detrended = y.map((v, i) => (trend[i] === undefined ? undefined : mode === 'additive' ? v - trend[i] : v / trend[i]));

  // average detrended value by phase (position within the period)
  const byPhase = Array.from({ length: period }, () => []);
  detrended.forEach((v, i) => { if (v !== undefined) byPhase[i % period].push(v); });
  const phaseAvg = byPhase.map(vals => (vals.length ? mean(vals) : mode === 'additive' ? 0 : 1));
  const center = mode === 'additive' ? mean(phaseAvg) : mean(phaseAvg);
  const seasonalIndex = phaseAvg.map(v => mode === 'additive' ? v - center : v / center);
  const seasonal = y.map((_, i) => seasonalIndex[i % period]);

  const residual = y.map((v, i) => (trend[i] === undefined ? undefined : mode === 'additive' ? v - trend[i] - seasonal[i] : v / (trend[i] * seasonal[i])));

  return { trend, seasonal, residual };
}

// ── Exponential smoothing family ──
export function ses(y, alpha) {
  const n = y.length;
  const level = new Array(n);
  level[0] = y[0];
  for (let i = 1; i < n; i++) level[i] = alpha * y[i] + (1 - alpha) * level[i - 1];
  const fitted = y.map((_, i) => (i === 0 ? undefined : level[i - 1]));
  return { fitted, level: level[n - 1], forecast: h => new Array(h).fill(level[n - 1]) };
}

export function holtLinear(y, alpha, beta) {
  const n = y.length;
  const level = new Array(n), trend = new Array(n);
  level[0] = y[0];
  trend[0] = n > 1 ? y[1] - y[0] : 0;
  for (let i = 1; i < n; i++) {
    const prevLevel = level[i - 1], prevTrend = trend[i - 1];
    level[i] = alpha * y[i] + (1 - alpha) * (prevLevel + prevTrend);
    trend[i] = beta * (level[i] - prevLevel) + (1 - beta) * prevTrend;
  }
  const fitted = y.map((_, i) => (i === 0 ? undefined : level[i - 1] + trend[i - 1]));
  return { fitted, level: level[n - 1], trend: trend[n - 1], forecast: h => Array.from({ length: h }, (_, k) => level[n - 1] + (k + 1) * trend[n - 1]) };
}

export function holtWinters(y, alpha, beta, gamma, period, mode = 'additive') {
  const n = y.length;
  if (n < 2 * period) return { fitted: y.map(() => undefined), forecast: h => new Array(h).fill(y[n - 1]) };

  const level = new Array(n), trend = new Array(n), seasonal = new Array(n + period);
  const firstCycle = y.slice(0, period), secondCycle = y.slice(period, 2 * period);
  level[period - 1] = mean(firstCycle);
  trend[period - 1] = (mean(secondCycle) - mean(firstCycle)) / period;
  for (let i = 0; i < period; i++) {
    seasonal[i] = mode === 'additive' ? y[i] - level[period - 1] : y[i] / level[period - 1];
  }

  const fitted = new Array(n).fill(undefined);
  for (let i = period; i < n; i++) {
    const s = seasonal[i - period];
    const prevLevel = level[i - 1], prevTrend = trend[i - 1];
    fitted[i] = mode === 'additive' ? prevLevel + prevTrend + s : (prevLevel + prevTrend) * s;
    level[i] = mode === 'additive'
      ? alpha * (y[i] - s) + (1 - alpha) * (prevLevel + prevTrend)
      : alpha * (y[i] / s) + (1 - alpha) * (prevLevel + prevTrend);
    trend[i] = beta * (level[i] - prevLevel) + (1 - beta) * prevTrend;
    seasonal[i] = mode === 'additive'
      ? gamma * (y[i] - level[i]) + (1 - gamma) * s
      : gamma * (y[i] / level[i]) + (1 - gamma) * s;
  }

  const forecast = h => Array.from({ length: h }, (_, k) => {
    const s = seasonal[n - period + (k % period)];
    return mode === 'additive' ? level[n - 1] + (k + 1) * trend[n - 1] + s : (level[n - 1] + (k + 1) * trend[n - 1]) * s;
  });

  return { fitted, level: level[n - 1], trend: trend[n - 1], forecast };
}

// ── Stationarity helpers ──
export function difference(y, lag = 1) {
  return y.slice(lag).map((v, i) => v - y[i]);
}

export function rollingMean(y, window) {
  return y.map((_, i) => (i < window - 1 ? undefined : mean(y.slice(i - window + 1, i + 1))));
}

export function rollingStd(y, window) {
  return y.map((_, i) => (i < window - 1 ? undefined : Math.sqrt(variance(y.slice(i - window + 1, i + 1)))));
}

// Sample autocorrelation at lags 0..maxLag
export function acf(y, maxLag) {
  const m = mean(y);
  const denom = y.reduce((s, v) => s + (v - m) ** 2, 0);
  const out = [];
  for (let lag = 0; lag <= maxLag; lag++) {
    let num = 0;
    for (let i = lag; i < y.length; i++) num += (y[i] - m) * (y[i - lag] - m);
    out.push(denom === 0 ? 0 : num / denom);
  }
  return out;
}

// 95% significance band for "no autocorrelation" on a series of length n
export function acfSignificance(n) {
  return 1.96 / Math.sqrt(n);
}

// ── Yule-Walker AR(p) fit + multi-step forecast with growing PI ──
function solveLinear(A, b) {
  // Gaussian elimination with partial pivoting, A is p×p, b is length p
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    if (Math.abs(M[col][col]) < 1e-12) continue;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / (row[i] || 1e-12));
}

export function fitAR(y, p) {
  const m = mean(y);
  const x = y.map(v => v - m);
  const r = acf(x, p); // r[0]=1 (normalized), r[k]=rho_k
  const R = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => r[Math.abs(i - j)]));
  const rhs = r.slice(1, p + 1);
  const phi = solveLinear(R, rhs);

  const fitted = x.map((_, i) => {
    if (i < p) return undefined;
    let s = 0;
    for (let k = 0; k < p; k++) s += phi[k] * x[i - 1 - k];
    return s + m;
  });
  const resid = fitted.map((f, i) => (f === undefined ? undefined : y[i] - f)).filter(v => v !== undefined);
  const sigma2 = resid.length ? resid.reduce((s, e) => s + e * e, 0) / resid.length : 0;

  return { phi, mean: m, fitted, sigma2 };
}

// psi-weights (MA(∞) representation) for forecast-error variance at each horizon
function psiWeights(phi, h) {
  const p = phi.length;
  const psi = [1];
  for (let j = 1; j < h; j++) {
    let s = 0;
    for (let k = 0; k < p; k++) s += phi[k] * (psi[j - 1 - k] ?? 0);
    psi.push(s);
  }
  return psi;
}

// Multi-step forecast from an AR(p) fit, with widening prediction-interval half-widths
export function forecastAR(y, model, h, z = 1.96) {
  const { phi, mean: m, sigma2 } = model;
  const p = phi.length;
  const history = y.slice(-p).map(v => v - m);
  const point = [];
  for (let step = 0; step < h; step++) {
    let s = 0;
    for (let k = 0; k < p; k++) s += phi[k] * (history[history.length - 1 - k] ?? 0);
    history.push(s);
    point.push(s + m);
  }
  const psi = psiWeights(phi, h);
  const halfWidth = [];
  let cum = 0;
  for (let step = 0; step < h; step++) {
    cum += psi[step] ** 2;
    halfWidth.push(z * Math.sqrt(sigma2 * cum));
  }
  return {
    point,
    lower: point.map((v, i) => v - halfWidth[i]),
    upper: point.map((v, i) => v + halfWidth[i]),
    halfWidth,
  };
}
