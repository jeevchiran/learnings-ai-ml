// Apply saved theme immediately (runs synchronously from <head>) to prevent flash
(function () {
  try {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}
})();

// ── Theme toggle with localStorage persistence ────────────────────────────────
function initTheme() {
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  // Sync label with current state (already applied by the IIFE above)
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

  // Close button
  var closeBtn = document.createElement('button');
  closeBtn.className = 'nav-drawer-close';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close menu');
  drawer.appendChild(closeBtn);

  // Modules: clone links from .module-nav-bar
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

  // On this page: auto-generate IDs for h2 elements and list as anchors
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

// ── Tab switching ─────────────────────────────────────────────────────────────
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

// ── Sidebar active state ──────────────────────────────────────────────────────
function initSidebar() {
  var currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar nav a').forEach(function (link) {
    if (link.getAttribute('href').includes(currentPage)) {
      link.classList.add('active');
    }
  });
}

// ── KaTeX rendering ───────────────────────────────────────────────────────────
function renderMath() {
  document.querySelectorAll('.math-latex').forEach(function (el) {
    var tex = el.textContent;
    var displayMode = el.classList.contains('math-block');
    katex.render(tex, el, { displayMode: displayMode, throwOnError: false, trust: true });
  });
}

// ── Plotly theme-aware layout helper ─────────────────────────────────────────
function plotlyLayout(overrides) {
  var dark  = document.documentElement.getAttribute('data-theme') === 'dark';
  var bg    = dark ? '#111827' : '#ffffff';
  var paper = dark ? '#1f2937' : '#f8f9fa';
  var text  = dark ? '#f3f4f6' : '#1a1a1a';
  var grid  = dark ? '#374151' : '#e5e7eb';
  return Object.assign({
    paper_bgcolor: paper,
    plot_bgcolor:  bg,
    font: { color: text, family: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', size: 12 },
    xaxis: { gridcolor: grid, zerolinecolor: grid },
    yaxis: { gridcolor: grid, zerolinecolor: grid },
    margin: { t: 30, r: 20, b: 50, l: 55 },
    showlegend: true,
    legend: { bgcolor: 'rgba(0,0,0,0)', borderwidth: 0 }
  }, overrides || {});
}

var PLOTLY_CONFIG = { responsive: true, displayModeBar: false };

// ── Initialize on DOM ready ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  initTabs();
  initSidebar();
  renderMath();
  initTheme();
  initHamburger();
});

// ═══════════════════════════════════════════════════════════════════════════════
// Utility functions (regression-specific)
// ═══════════════════════════════════════════════════════════════════════════════

function linspace(start, end, n) {
  var step = (end - start) / (n - 1);
  return Array.from({ length: n }, function (_, i) { return start + i * step; });
}

function mean(arr) {
  return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
}

function simpleOLS(x, y) {
  var n = x.length;
  var xMean = mean(x);
  var yMean = mean(y);
  var num = 0, den = 0;
  for (var i = 0; i < n; i++) {
    num += (x[i] - xMean) * (y[i] - yMean);
    den += (x[i] - xMean) * (x[i] - xMean);
  }
  var slope = num / den;
  var intercept = yMean - slope * xMean;
  return { slope: slope, intercept: intercept };
}

function predict(x, slope, intercept) {
  return x.map(function (xi) { return slope * xi + intercept; });
}

function rSquared(y, yPred) {
  var yMean_ = mean(y);
  var ssTot = y.reduce(function (s, yi) { return s + (yi - yMean_) * (yi - yMean_); }, 0);
  var ssRes = y.reduce(function (s, yi, i) { return s + (yi - yPred[i]) * (yi - yPred[i]); }, 0);
  return 1 - ssRes / ssTot;
}

function mse(y, yPred) {
  return y.reduce(function (s, yi, i) { return s + (yi - yPred[i]) * (yi - yPred[i]); }, 0) / y.length;
}

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

function randn() {
  var u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function generateRegressionData(n, slope, intercept, noise) {
  var x = [], y = [];
  for (var i = 0; i < n; i++) {
    var xi = Math.random() * 10;
    var yi = slope * xi + intercept + randn() * noise;
    x.push(xi);
    y.push(yi);
  }
  return { x: x, y: y };
}

function generateClassificationData(n, separation) {
  var x1 = [], x2 = [], labels = [];
  for (var i = 0; i < n; i++) {
    var label = Math.random() > 0.5 ? 1 : 0;
    var cx = label * separation;
    var cy = label * separation * 0.5;
    x1.push(cx + randn() * 1.5);
    x2.push(cy + randn() * 1.5);
    labels.push(label);
  }
  return { x1: x1, x2: x2, labels: labels };
}
