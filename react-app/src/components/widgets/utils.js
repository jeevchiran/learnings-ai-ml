// Shared math utilities (ported from Regression/js/common.js)

export function linspace(start, end, n) {
  const step = (end - start) / (n - 1);
  return Array.from({ length: n }, (_, i) => start + i * step);
}

export function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function simpleOLS(x, y) {
  const xMean = mean(x), yMean = mean(y);
  let num = 0, den = 0;
  for (let i = 0; i < x.length; i++) {
    num += (x[i] - xMean) * (y[i] - yMean);
    den += (x[i] - xMean) ** 2;
  }
  const slope = num / den;
  return { slope, intercept: yMean - slope * xMean };
}

export function predict(x, slope, intercept) {
  return x.map(xi => slope * xi + intercept);
}

export function rSquared(y, yPred) {
  const yMean_ = mean(y);
  const ssTot = y.reduce((s, yi) => s + (yi - yMean_) ** 2, 0);
  const ssRes = y.reduce((s, yi, i) => s + (yi - yPred[i]) ** 2, 0);
  return 1 - ssRes / ssTot;
}

export function mse(y, yPred) {
  return y.reduce((s, yi, i) => s + (yi - yPred[i]) ** 2, 0) / y.length;
}

export function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

export function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function generateRegressionData(n, slope, intercept, noise) {
  const x = [], y = [];
  for (let i = 0; i < n; i++) {
    const xi = Math.random() * 10;
    x.push(xi);
    y.push(slope * xi + intercept + randn() * noise);
  }
  return { x, y };
}

export function generateClassificationData(n, separation) {
  const x1 = [], x2 = [], labels = [];
  for (let i = 0; i < n; i++) {
    const label = Math.random() > 0.5 ? 1 : 0;
    x1.push(label * separation + randn() * 1.5);
    x2.push(label * separation * 0.5 + randn() * 1.5);
    labels.push(label);
  }
  return { x1, x2, labels };
}

export function approximateNormalQuantile(p) {
  // Beasley-Springer-Moro approximation
  if (p <= 0) return -6;
  if (p >= 1) return 6;
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
              1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
              6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
              -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let q;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    const r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
             ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

// Normal PDF
export function normalPDF(x, mu = 0, sigma = 1) {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}

// Normal CDF (approximation)
export function normalCDF(x, mu = 0, sigma = 1) {
  const z = (x - mu) / sigma;
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
  return sign * y;
}

// Plotly layout defaults (dark-mode aware)
export function plotlyLayout(overrides = {}) {
  return {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { family: 'inherit', size: 12 },
    margin: { t: 30, r: 20, b: 50, l: 55 },
    showlegend: true,
    legend: { bgcolor: 'rgba(0,0,0,0)', borderwidth: 0 },
    ...overrides,
  };
}

export const PLOTLY_CONFIG = { responsive: true, displayModeBar: false };
