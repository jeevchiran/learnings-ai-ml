// Flash-free theme restoration
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
// General utilities
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

// ═══════════════════════════════════════════════════════════════════════════════
// Clustering utilities
// ═══════════════════════════════════════════════════════════════════════════════

// Euclidean distance between two points [x1,y1,...] and [x2,y2,...]
function euclidean(a, b) {
  var sum = 0;
  for (var i = 0; i < a.length; i++) sum += (a[i] - b[i]) * (a[i] - b[i]);
  return Math.sqrt(sum);
}

// Manhattan distance
function manhattan(a, b) {
  var sum = 0;
  for (var i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum;
}

// Cosine similarity (returns value in [-1,1])
function cosineSim(a, b) {
  var dot = 0, normA = 0, normB = 0;
  for (var i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Centroid of an array of points [[x,y], ...]
function centroid(points) {
  if (!points.length) return null;
  var dim = points[0].length;
  var c = new Array(dim).fill(0);
  for (var i = 0; i < points.length; i++) {
    for (var d = 0; d < dim; d++) c[d] += points[i][d];
  }
  for (var d = 0; d < dim; d++) c[d] /= points.length;
  return c;
}

// Assign each point to the nearest centroid
// Returns array of cluster indices (same length as points)
function assignClusters(points, centroids) {
  return points.map(function (p) {
    var best = 0, bestDist = Infinity;
    for (var k = 0; k < centroids.length; k++) {
      var d = euclidean(p, centroids[k]);
      if (d < bestDist) { bestDist = d; best = k; }
    }
    return best;
  });
}

// Update centroids given current assignments
// Returns new centroids array
function updateCentroids(points, labels, K) {
  var clusters = Array.from({ length: K }, function () { return []; });
  for (var i = 0; i < points.length; i++) clusters[labels[i]].push(points[i]);
  return clusters.map(function (c, k) {
    return c.length > 0 ? centroid(c) : [Math.random() * 10, Math.random() * 10];
  });
}

// Within-Cluster Sum of Squares (inertia)
function wcss(points, labels, centroids) {
  var total = 0;
  for (var i = 0; i < points.length; i++) {
    var d = euclidean(points[i], centroids[labels[i]]);
    total += d * d;
  }
  return total;
}

// Run one full K-means iteration: assign + update
// Returns { labels, centroids, inertia }
function kMeansStep(points, centroids) {
  var labels = assignClusters(points, centroids);
  var newCentroids = updateCentroids(points, labels, centroids.length);
  var inertia = wcss(points, labels, newCentroids);
  return { labels: labels, centroids: newCentroids, inertia: inertia };
}

// Run full K-means to convergence (max maxIter iterations)
// Returns { labels, centroids, inertia, iterations, history }
function kMeans(points, K, maxIter, initCentroids) {
  var centroids = initCentroids ? initCentroids.slice() : kMeansPlusPlusInit(points, K);
  var history = [{ labels: assignClusters(points, centroids), centroids: centroids.map(function(c){return c.slice();}), inertia: wcss(points, assignClusters(points, centroids), centroids) }];
  for (var iter = 0; iter < (maxIter || 100); iter++) {
    var result = kMeansStep(points, centroids);
    history.push({ labels: result.labels.slice(), centroids: result.centroids.map(function(c){return c.slice();}), inertia: result.inertia });
    // Check convergence: if centroids haven't moved
    var moved = false;
    for (var k = 0; k < K; k++) {
      if (euclidean(centroids[k], result.centroids[k]) > 1e-10) { moved = true; break; }
    }
    centroids = result.centroids;
    if (!moved) break;
  }
  var finalLabels = history[history.length - 1].labels;
  return { labels: finalLabels, centroids: centroids, inertia: history[history.length-1].inertia, iterations: history.length - 1, history: history };
}

// K-means++ initialization
function kMeansPlusPlusInit(points, K) {
  var centroids = [];
  // Pick first centroid uniformly at random
  centroids.push(points[Math.floor(Math.random() * points.length)].slice());
  for (var k = 1; k < K; k++) {
    // Compute D²(x) for each point: distance to nearest centroid squared
    var dists = points.map(function (p) {
      var minD = Infinity;
      for (var c = 0; c < centroids.length; c++) {
        var d = euclidean(p, centroids[c]);
        if (d < minD) minD = d;
      }
      return minD * minD;
    });
    var totalD = dists.reduce(function (a, b) { return a + b; }, 0);
    // Sample proportional to D²
    var r = Math.random() * totalD;
    var cumSum = 0;
    for (var i = 0; i < points.length; i++) {
      cumSum += dists[i];
      if (cumSum >= r) { centroids.push(points[i].slice()); break; }
    }
    if (centroids.length <= k) centroids.push(points[points.length - 1].slice());
  }
  return centroids;
}

// Silhouette score for a single point i
// points: array of [x,y], labels: array of cluster assignments
function silhouettePoint(i, points, labels) {
  var K = Math.max.apply(null, labels) + 1;
  var myCluster = labels[i];
  // a(i): mean distance to same-cluster points
  var sameCluster = [];
  var otherClusters = {};
  for (var j = 0; j < points.length; j++) {
    if (j === i) continue;
    var d = euclidean(points[i], points[j]);
    if (labels[j] === myCluster) {
      sameCluster.push(d);
    } else {
      if (!otherClusters[labels[j]]) otherClusters[labels[j]] = [];
      otherClusters[labels[j]].push(d);
    }
  }
  var a = sameCluster.length > 0 ? mean(sameCluster) : 0;
  // b(i): mean distance to nearest OTHER cluster
  var b = Infinity;
  Object.keys(otherClusters).forEach(function (k) {
    var meanDist = mean(otherClusters[k]);
    if (meanDist < b) b = meanDist;
  });
  if (b === Infinity) return 0;
  return (b - a) / Math.max(a, b);
}

// Mean silhouette score across all points
function silhouetteScore(points, labels) {
  if (points.length < 2) return 0;
  var K = Math.max.apply(null, labels) + 1;
  if (K < 2) return 0;
  var scores = points.map(function (_, i) { return silhouettePoint(i, points, labels); });
  return mean(scores);
}

// Generate n points from K Gaussian blobs
// Returns { points: [[x,y],...], trueLabels: [...] }
function generateBlobs(n, K, spread, seed) {
  // Simple seeded PRNG (mulberry32)
  var s = seed || 42;
  function seededRand() {
    s += 0x6D2B79F5;
    var t = s;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function seededRandn() {
    var u = 0, v = 0;
    while (u === 0) u = seededRand();
    while (v === 0) v = seededRand();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
  // Generate K cluster centers in [2, 8] x [2, 8]
  var centers = [];
  for (var k = 0; k < K; k++) {
    centers.push([2 + seededRand() * 6, 2 + seededRand() * 6]);
  }
  var points = [], trueLabels = [];
  for (var i = 0; i < n; i++) {
    var k = Math.floor(seededRand() * K);
    points.push([
      centers[k][0] + seededRandn() * (spread || 1.0),
      centers[k][1] + seededRandn() * (spread || 1.0)
    ]);
    trueLabels.push(k);
  }
  return { points: points, trueLabels: trueLabels, centers: centers };
}

// ── Plotly helpers ─────────────────────────────────────────────────────────────
var PLOTLY_CONFIG = { responsive: true, displayModeBar: false };

function plotlyLayout(overrides) {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  var bg    = dark ? '#111827' : '#ffffff';
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

// Cluster color palette (up to 8 clusters)
var CLUSTER_COLORS = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2','#be185d','#854d0e'];
var CLUSTER_COLORS_LIGHT = ['rgba(37,99,235,0.15)','rgba(220,38,38,0.15)','rgba(22,163,74,0.15)','rgba(217,119,6,0.15)','rgba(124,58,237,0.15)','rgba(8,145,178,0.15)','rgba(190,24,93,0.15)','rgba(133,77,14,0.15)'];
