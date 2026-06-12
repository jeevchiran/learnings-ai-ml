// Flash-free theme restoration (runs synchronously from <head>)
(function () {
  try {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}
})();

// ── Tab switching ──────────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tabs').forEach(function (tabGroup) {
    var tabs = tabGroup.querySelectorAll('.tab');
    var parentSection = tabGroup.parentElement;
    var contents = parentSection.querySelectorAll('.tab-content');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        contents.forEach(function (c) { c.classList.remove('active'); });
        tab.classList.add('active');
        var target = parentSection.querySelector('#' + tab.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
  });
}

// ── KaTeX rendering ────────────────────────────────────────────────────────────
function renderMath() {
  document.querySelectorAll('.math-latex').forEach(function (el) {
    var tex = el.textContent;
    var displayMode = el.classList.contains('math-block');
    katex.render(tex, el, { displayMode: displayMode, throwOnError: false, trust: true });
  });
}

// ── Theme toggle with localStorage persistence ─────────────────────────────────
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

// ── Practice problem solution toggles ─────────────────────────────────────────
function initPractice() {
  document.querySelectorAll('.practice-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sol = btn.closest('.practice-body').querySelector('.practice-solution');
      if (!sol) return;
      var visible = sol.classList.toggle('visible');
      btn.textContent = visible ? 'Hide solution' : 'Show solution';
    });
  });
}

// ── Hamburger navigation drawer ────────────────────────────────────────────────
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

// ── DOM ready ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  initTabs();
  initTheme();
  renderMath();
  initPractice();
  initHamburger();
});

// ═══════════════════════════════════════════════════════════════════════════════
// Math & stats utilities
// ═══════════════════════════════════════════════════════════════════════════════

function linspace(start, end, n) {
  var step = (end - start) / (n - 1);
  return Array.from({ length: n }, function (_, i) { return start + i * step; });
}

function mean(arr) {
  return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
}

function stddev(arr, sample) {
  if (sample === undefined) sample = true;
  var m = mean(arr);
  var variance = arr.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (sample ? arr.length - 1 : arr.length);
  return Math.sqrt(variance);
}

function randn() {
  var u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Gini impurity for a class distribution
// probs: array of class probabilities (must sum to 1) or class counts
function giniImpurity(counts) {
  var total = counts.reduce(function (a, b) { return a + b; }, 0);
  if (total === 0) return 0;
  var sum = 0;
  for (var i = 0; i < counts.length; i++) {
    var p = counts[i] / total;
    sum += p * p;
  }
  return 1 - sum;
}

// Shannon entropy (base 2)
function entropy(counts) {
  var total = counts.reduce(function (a, b) { return a + b; }, 0);
  if (total === 0) return 0;
  var h = 0;
  for (var i = 0; i < counts.length; i++) {
    var p = counts[i] / total;
    if (p > 0) h -= p * Math.log2(p);
  }
  return h;
}

// Misclassification rate
function misclassRate(counts) {
  var total = counts.reduce(function (a, b) { return a + b; }, 0);
  if (total === 0) return 0;
  var maxCount = Math.max.apply(null, counts);
  return 1 - maxCount / total;
}

// Weighted impurity of a binary split
function weightedImpurity(leftCounts, rightCounts, measure) {
  var nL = leftCounts.reduce(function (a, b) { return a + b; }, 0);
  var nR = rightCounts.reduce(function (a, b) { return a + b; }, 0);
  var n = nL + nR;
  if (n === 0) return 0;
  var fn = measure === 'entropy' ? entropy : (measure === 'misclass' ? misclassRate : giniImpurity);
  return (nL / n) * fn(leftCounts) + (nR / n) * fn(rightCounts);
}

// Information gain
function informationGain(parentCounts, leftCounts, rightCounts) {
  return entropy(parentCounts) - weightedImpurity(leftCounts, rightCounts, 'entropy');
}

// Gini gain
function giniGain(parentCounts, leftCounts, rightCounts) {
  return giniImpurity(parentCounts) - weightedImpurity(leftCounts, rightCounts, 'gini');
}

// Normal CDF (for any statistical widgets)
function normalCDF(z) {
  var t = 1 / (1 + 0.3275911 * Math.abs(z));
  var poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  var p = 1 - poly * Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  return z >= 0 ? p : 1 - p;
}

// Sigmoid
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// ── Plotly helpers ─────────────────────────────────────────────────────────────
var PLOTLY_CONFIG = { responsive: true, displayModeBar: false };

function plotlyLayout(overrides) {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  var bg   = dark ? '#111827' : '#ffffff';
  var paper = dark ? '#1f2937' : '#f8f9fa';
  var text  = dark ? '#f3f4f6' : '#1a1a1a';
  var grid  = dark ? '#374151' : '#e5e7eb';

  var base = {
    paper_bgcolor: paper,
    plot_bgcolor:  bg,
    font: { color: text, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', size: 12 },
    xaxis: { gridcolor: grid, zerolinecolor: grid },
    yaxis: { gridcolor: grid, zerolinecolor: grid },
    margin: { t: 40, r: 20, b: 50, l: 55 }
  };

  if (!overrides) return base;
  Object.keys(overrides).forEach(function (k) {
    if (typeof overrides[k] === 'object' && overrides[k] !== null && !Array.isArray(overrides[k])) {
      base[k] = Object.assign({}, base[k] || {}, overrides[k]);
    } else {
      base[k] = overrides[k];
    }
  });
  return base;
}
