// Apply saved theme immediately (runs synchronously from <head>) to prevent flash
(function () {
  try {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}
})();

// ── Tab switching ─────────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll('.tab');
    const parentSection = tabGroup.parentElement;
    const contents = parentSection.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = parentSection.querySelector(`#${tab.dataset.tab}`);
        if (target) target.classList.add('active');
      });
    });
  });
}

// ── KaTeX rendering ───────────────────────────────────────────────────────────
function renderMath() {
  document.querySelectorAll('.math-latex').forEach(el => {
    const tex = el.textContent;
    const displayMode = el.classList.contains('math-block');
    katex.render(tex, el, { displayMode, throwOnError: false, trust: true });
  });
}

// ── Theme toggle with localStorage persistence ────────────────────────────────
function initTheme() {
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.textContent = isDark ? 'Light mode' : 'Dark mode';
  btn.addEventListener('click', function () {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    var next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '');
    try { localStorage.setItem('theme', next); } catch (e) {}
    btn.textContent = next === 'dark' ? 'Light mode' : 'Dark mode';
  });
}

// ── Hamburger navigation drawer ───────────────────────────────────────────────
function initHamburger() {
  var btn = document.querySelector('.menu-toggle');
  if (!btn) return;

  var overlay = document.createElement('div');
  overlay.className = 'nav-overlay';

  var drawer = document.createElement('nav');
  drawer.className = 'nav-drawer';
  drawer.setAttribute('aria-label', 'Site navigation');

  var closeBtn = document.createElement('button');
  closeBtn.className = 'nav-drawer-close';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close menu');
  drawer.appendChild(closeBtn);

  var navBar = document.querySelector('.module-nav-bar');
  if (navBar) {
    var modHeading = document.createElement('p');
    modHeading.className = 'nav-drawer-heading';
    modHeading.textContent = 'Modules';
    drawer.appendChild(modHeading);
    var modList = document.createElement('ul');
    modList.className = 'nav-drawer-list';
    navBar.querySelectorAll('a').forEach(function (a) {
      var li = document.createElement('li');
      var link = a.cloneNode(true);
      link.addEventListener('click', close);
      li.appendChild(link);
      modList.appendChild(li);
    });
    drawer.appendChild(modList);
  }

  var h2s = document.querySelectorAll('h2');
  if (h2s.length) {
    var secHeading = document.createElement('p');
    secHeading.className = 'nav-drawer-heading';
    secHeading.textContent = 'On this page';
    drawer.appendChild(secHeading);
    var secList = document.createElement('ul');
    secList.className = 'nav-drawer-list nav-drawer-sections';
    h2s.forEach(function (h2) {
      if (!h2.id) {
        h2.id = h2.textContent.trim().toLowerCase()
          .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
          .replace(/-+/g, '-').replace(/^-|-$/g, '');
      }
      var li = document.createElement('li');
      var link = document.createElement('a');
      link.href = '#' + h2.id;
      link.textContent = h2.textContent.trim();
      link.addEventListener('click', close);
      li.appendChild(link);
      secList.appendChild(li);
    });
    drawer.appendChild(secList);
  }

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  function open() {
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', open);
  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
}

// ── DOM ready ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  initTabs();
  initTheme();
  renderMath();
  initHamburger();
});

// ═══════════════════════════════════════════════════════════════════════════════
// General utilities (from Regression track)
// ═══════════════════════════════════════════════════════════════════════════════

function linspace(start, end, n) {
  const step = (end - start) / (n - 1);
  return Array.from({ length: n }, (_, i) => start + i * step);
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr, sample = true) {
  const m = mean(arr);
  const variance = arr.reduce((s, x) => s + (x - m) ** 2, 0) / (sample ? arr.length - 1 : arr.length);
  return Math.sqrt(variance);
}

function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Statistical distributions
// ═══════════════════════════════════════════════════════════════════════════════

// Error function (Abramowitz & Stegun 7.1.26, max |err| < 1.5e-7)
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t
    - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return sign * y;
}

// Standard normal PDF
function normalPDF(z) {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

// Standard normal CDF  Phi(z)
function normalCDF(z) {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

// Inverse normal CDF (Peter Acklam's rational approximation)
function normalInvCDF(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-3.969683028665376e+01, 2.209460984245205e+02,
    -2.759285104469687e+02, 1.383577518672690e+02,
    -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02,
    -1.556989798598866e+02, 6.680131188771972e+01,
    -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01,
    -2.400758277161838e+00, -2.549732539343734e+00,
    4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01,
    2.445134137142996e+00, 3.754408661907416e+00];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q, r;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
      ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= pHigh) {
    q = p - 0.5; r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
      (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
      ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

// Log-gamma (Lanczos approximation)
function lgamma(x) {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 1.208650973866179e-3, -5.395239384953e-6];
  let y = x, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) { y += 1; ser += c[j] / y; }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

// Regularized incomplete beta I_x(a, b) via continued fractions (Numerical Recipes)
function betaInc(a, b, x) {
  if (x < 0 || x > 1) return NaN;
  if (x === 0) return 0;
  if (x === 1) return 1;
  const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta);
  const cfEval = (aa, bb, xx) => {
    const MAXIT = 200, EPS = 3e-7, FPMIN = 1e-30;
    let qab = aa + bb, qap = aa + 1, qam = aa - 1;
    let c = 1, d = 1 - qab * xx / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d; let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let acoef = m * (bb - m) * xx / ((qam + m2) * (aa + m2));
      d = 1 + acoef * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + acoef / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      acoef = -(aa + m) * (qab + m) * xx / ((aa + m2) * (qap + m2));
      d = 1 + acoef * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + acoef / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; const del = d * c; h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  };
  if (x < (a + 1) / (a + b + 2)) return front * cfEval(a, b, x) / a;
  return 1 - front * cfEval(b, a, 1 - x) / b;
}

// Student t CDF  P(T <= t | df)
function tCDF(t, df) {
  const x = df / (df + t * t);
  const p = 0.5 * betaInc(df / 2, 0.5, x);
  return t >= 0 ? 1 - p : p;
}

// Student t PDF
function tPDF(t, df) {
  const num = Math.exp(lgamma((df + 1) / 2));
  const den = Math.sqrt(df * Math.PI) * Math.exp(lgamma(df / 2));
  return (num / den) * Math.pow(1 + t * t / df, -(df + 1) / 2);
}

// Z critical value  (inverse normal)
function zCritical(alpha, tails) {
  return tails === 2 ? normalInvCDF(1 - alpha / 2) : normalInvCDF(1 - alpha);
}

// t critical value via bisection on tCDF
function tCritical(alpha, df, tails) {
  const target = tails === 2 ? 1 - alpha / 2 : 1 - alpha;
  let lo = 0, hi = 20;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    tCDF(mid, df) < target ? (lo = mid) : (hi = mid);
  }
  return (lo + hi) / 2;
}

// Pooled standard error for two independent samples
function pooledStdErr(s1, n1, s2, n2) {
  return Math.sqrt(s1 * s1 / n1 + s2 * s2 / n2);
}

// Welch-Satterthwaite degrees of freedom
function welchDf(s1, n1, s2, n2) {
  const v1 = s1 * s1 / n1, v2 = s2 * s2 / n2;
  return Math.pow(v1 + v2, 2) / (v1 * v1 / (n1 - 1) + v2 * v2 / (n2 - 1));
}

// Cohen's d (two-sample)
function cohensD(m1, m2, s1, n1, s2, n2) {
  const sp = Math.sqrt(((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / (n1 + n2 - 2));
  return Math.abs(m1 - m2) / sp;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Plotly theme helper — returns layout defaults matching current CSS theme
// ═══════════════════════════════════════════════════════════════════════════════
function plotlyLayout(overrides = {}) {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const bg   = dark ? '#111827' : '#ffffff';
  const paper = dark ? '#1f2937' : '#f8f9fa';
  const text  = dark ? '#f3f4f6' : '#1a1a1a';
  const grid  = dark ? '#374151' : '#e5e7eb';
  return Object.assign({
    paper_bgcolor: paper,
    plot_bgcolor: bg,
    font: { color: text, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', size: 12 },
    xaxis: { gridcolor: grid, zerolinecolor: grid },
    yaxis: { gridcolor: grid, zerolinecolor: grid },
    margin: { t: 30, r: 20, b: 50, l: 55 },
    showlegend: true,
    legend: { bgcolor: 'rgba(0,0,0,0)', borderwidth: 0 }
  }, overrides);
}

const PLOTLY_CONFIG = { responsive: true, displayModeBar: false };
