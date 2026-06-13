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

// ── MCQ Quiz ──────────────────────────────────────────────────────────────────
function initQuiz() {
  document.querySelectorAll('.quiz-question').forEach(function (qEl) {
    var options = qEl.querySelectorAll('.quiz-option');
    var feedback = qEl.querySelector('.quiz-feedback');
    var answered = false;
    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        var isCorrect = opt.dataset.correct === 'true';
        options.forEach(function (o) {
          o.classList.add('disabled');
          if (o.dataset.correct === 'true') o.classList.add('correct');
        });
        if (!isCorrect) opt.classList.add('wrong');
        if (feedback) {
          feedback.classList.add('show');
          feedback.classList.add(isCorrect ? 'correct-fb' : 'wrong-fb');
        }
      });
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

// ── Code copy buttons ──────────────────────────────────────────────────────────
function initCodeCopy() {
  document.querySelectorAll('.code-copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = btn.closest('.code-snippet').querySelector('pre');
      if (!pre) return;
      var text = pre.innerText || pre.textContent;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
      }).catch(function () {
        btn.textContent = 'Copy';
      });
    });
  });
}

// ── DOM ready ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  initTabs();
  initTheme();
  renderMath();
  initPractice();
  initQuiz();
  initHamburger();
  initCodeCopy();
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

// ═══════════════════════════════════════════════════════════════════════════════
// NLP UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

// ── Levenshtein distance + full DP matrix ─────────────────────────────────────
// Returns { dist, matrix, path }
// path: array of [i,j] cells on the optimal edit path (backtrace)
function levenshteinMatrix(s, t) {
  var m = s.length, n = t.length;
  var dp = [];
  for (var i = 0; i <= m; i++) {
    dp[i] = [];
    for (var j = 0; j <= n; j++) {
      if (i === 0) dp[i][j] = j;
      else if (j === 0) dp[i][j] = i;
      else {
        var cost = s[i-1] === t[j-1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i-1][j] + 1,    // deletion
          dp[i][j-1] + 1,    // insertion
          dp[i-1][j-1] + cost // substitution
        );
      }
    }
  }
  // Backtrace optimal path
  var path = [];
  var ci = m, cj = n;
  while (ci > 0 || cj > 0) {
    path.push([ci, cj]);
    if (ci === 0) { cj--; }
    else if (cj === 0) { ci--; }
    else {
      var cost2 = s[ci-1] === t[cj-1] ? 0 : 1;
      var sub = dp[ci-1][cj-1] + cost2;
      var del = dp[ci-1][cj] + 1;
      var ins = dp[ci][cj-1] + 1;
      var mn = Math.min(sub, del, ins);
      if (mn === sub) { ci--; cj--; }
      else if (mn === del) { ci--; }
      else { cj--; }
    }
  }
  path.push([0, 0]);
  return { dist: dp[m][n], matrix: dp, path: path };
}

// ── Build Levenshtein HTML table from result ──────────────────────────────────
function buildLevTable(s, t, result) {
  var m = s.length, n = t.length;
  var pathSet = new Set(result.path.map(function(p){ return p[0]+','+p[1]; }));
  var html = '<table class="lev-matrix"><thead><tr><th></th><th></th>';
  for (var j = 0; j <= n; j++) {
    html += '<th>' + (j === 0 ? '' : t[j-1]) + '</th>';
  }
  html += '</tr></thead><tbody>';
  for (var i = 0; i <= m; i++) {
    html += '<tr><th>' + (i === 0 ? '' : s[i-1]) + '</th>';
    html += '<td class="filled">' + i + '</td>';
    for (var jj = 1; jj <= n; jj++) {
      var cls = pathSet.has(i+','+jj) ? ' class="path filled"' : ' class="filled"';
      if (i === m && jj === n) cls = ' class="current filled"';
      html += '<td' + cls + '>' + result.matrix[i][jj] + '</td>';
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

// ── Render a POS-tagged sentence into .token-sequence HTML ────────────────────
// tokens: [{word, pos, tag}]
// showChunks: array of [startIdx, endIdx] for NP chunks to bracket
function renderPOSTokens(tokens, showChunks) {
  var chunkSet = {};
  if (showChunks) {
    showChunks.forEach(function(ch) {
      for (var i = ch[0]; i <= ch[1]; i++) chunkSet[i] = true;
    });
  }
  return tokens.map(function(tok, idx) {
    var posCls = 'pos-' + (tok.pos || 'OTHER');
    var badgeCls = 'pos-badge-' + (tok.pos || 'OTHER');
    var chunkCls = chunkSet[idx] ? ' chunk-np' : '';
    return '<span class="token-wrap">' +
      '<span class="token-word ' + posCls + chunkCls + '">' + escHtml(tok.word) + '</span>' +
      '<span class="token-pos ' + badgeCls + '">' + (tok.tag || tok.pos || '?') + '</span>' +
      '</span>';
  }).join('');
}

// ── Render NER-annotated text ─────────────────────────────────────────────────
// entities: [{start, end, label}] char offsets OR [{word, label}] token list
// If text is provided with char offsets, use that; else token list
function renderNERTokens(tokens) {
  return tokens.map(function(tok) {
    if (tok.label && tok.label !== 'O') {
      return '<span class="ner-span ner-' + tok.label + '" data-label="' + tok.label + '">' + escHtml(tok.word) + '</span>';
    }
    return escHtml(tok.word) + ' ';
  }).join('');
}

// ── IOB sequence renderer ────────────────────────────────────────────────────
function renderIOBSequence(tokens) {
  return tokens.map(function(tok) {
    var tag = tok.iob || 'O';
    var tagClass = tag.startsWith('B') ? 'B' : (tag.startsWith('I') ? 'I' : 'O');
    return '<span class="iob-token">' +
      '<span class="iob-word">' + escHtml(tok.word) + '</span>' +
      '<span class="iob-tag ' + tagClass + '">' + tag + '</span>' +
      '</span>';
  }).join('');
}

// ── TF-IDF computation ────────────────────────────────────────────────────────
function computeTFIDF(docs) {
  // docs: array of strings
  var tokenized = docs.map(function(d) {
    return d.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(function(w){ return w.length > 0; });
  });
  // Build vocabulary
  var vocab = [];
  var vocabSet = {};
  tokenized.forEach(function(toks) {
    toks.forEach(function(w) {
      if (!vocabSet[w]) { vocabSet[w] = true; vocab.push(w); }
    });
  });
  vocab.sort();
  var N = docs.length;
  // TF: count / doclen
  var tf = tokenized.map(function(toks) {
    var counts = {};
    toks.forEach(function(w) { counts[w] = (counts[w] || 0) + 1; });
    var result = {};
    vocab.forEach(function(w) { result[w] = (counts[w] || 0) / toks.length; });
    return result;
  });
  // IDF: log(N / df)
  var idf = {};
  vocab.forEach(function(w) {
    var df = tokenized.filter(function(toks) { return toks.indexOf(w) >= 0; }).length;
    idf[w] = Math.log(N / (df + 1)) + 1;  // +1 smoothing
  });
  // TF-IDF
  var tfidf = tf.map(function(tfDoc) {
    var result = {};
    vocab.forEach(function(w) { result[w] = tfDoc[w] * idf[w]; });
    return result;
  });
  return { vocab: vocab, tf: tf, idf: idf, tfidf: tfidf };
}

// ── PMI computation ───────────────────────────────────────────────────────────
// corpus: array of sentences (arrays of words)
// windowSize: co-occurrence window (default 2)
// Returns { vocab, cooc, pmi, ppmi }
function computePMI(corpus, windowSize) {
  windowSize = windowSize || 2;
  var wordCounts = {};
  var cooc = {};
  var total = 0;

  corpus.forEach(function(sentence) {
    sentence.forEach(function(w) {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
      total++;
    });
    for (var i = 0; i < sentence.length; i++) {
      for (var j = Math.max(0, i - windowSize); j <= Math.min(sentence.length - 1, i + windowSize); j++) {
        if (i === j) continue;
        var key = sentence[i] + '|||' + sentence[j];
        cooc[key] = (cooc[key] || 0) + 1;
      }
    }
  });

  var vocab = Object.keys(wordCounts).sort();
  var pmi = {};
  var ppmi = {};
  vocab.forEach(function(w1) {
    pmi[w1] = {};
    ppmi[w1] = {};
    vocab.forEach(function(w2) {
      var key = w1 + '|||' + w2;
      var cnt = cooc[key] || 0;
      var pw1 = wordCounts[w1] / total;
      var pw2 = wordCounts[w2] / total;
      var pw1w2 = cnt / total;
      if (pw1w2 > 0) {
        pmi[w1][w2] = Math.log2(pw1w2 / (pw1 * pw2));
      } else {
        pmi[w1][w2] = -Infinity;
      }
      ppmi[w1][w2] = Math.max(0, pmi[w1][w2]);
    });
  });

  return { vocab: vocab, wordCounts: wordCounts, cooc: cooc, pmi: pmi, ppmi: ppmi };
}

// ── N-gram model ──────────────────────────────────────────────────────────────
// Build a simple n-gram model from a corpus string
// Returns { ngrams, counts, generate(context, n) }
function buildNgramModel(text, n) {
  n = n || 2;
  var words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(function(w){ return w.length > 0; });
  var counts = {};   // prefix -> {next_word: count}
  var prefixCounts = {};  // prefix -> total count

  for (var i = 0; i <= words.length - n; i++) {
    var prefix = words.slice(i, i + n - 1).join(' ');
    var next = words[i + n - 1];
    if (!counts[prefix]) counts[prefix] = {};
    counts[prefix][next] = (counts[prefix][next] || 0) + 1;
    prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
  }

  function getProbabilities(prefix) {
    if (!counts[prefix]) return [];
    var total = prefixCounts[prefix];
    return Object.keys(counts[prefix]).map(function(w) {
      return { word: w, count: counts[prefix][w], prob: counts[prefix][w] / total };
    }).sort(function(a, b) { return b.prob - a.prob; });
  }

  function sampleNext(prefix) {
    var probs = getProbabilities(prefix);
    if (!probs.length) return null;
    var r = Math.random();
    var cumsum = 0;
    for (var i = 0; i < probs.length; i++) {
      cumsum += probs[i].prob;
      if (r <= cumsum) return probs[i].word;
    }
    return probs[0].word;
  }

  function generate(startWords, maxTokens) {
    maxTokens = maxTokens || 20;
    var words = startWords.slice();
    for (var step = 0; step < maxTokens; step++) {
      var prefix = words.slice(-(n-1)).join(' ');
      var next = sampleNext(prefix);
      if (!next) break;
      words.push(next);
    }
    return words;
  }

  // Sentence probability with Laplace smoothing
  function sentenceProb(sentence, k) {
    k = k || 1;
    var ws = sentence.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(function(w){ return w.length > 0; });
    var V = Object.keys(prefixCounts).length;
    var logProb = 0;
    for (var i = n - 1; i < ws.length; i++) {
      var prefix = ws.slice(i - (n-1), i).join(' ');
      var next = ws[i];
      var cnt = (counts[prefix] && counts[prefix][next]) ? counts[prefix][next] : 0;
      var total = prefixCounts[prefix] || 0;
      logProb += Math.log((cnt + k) / (total + k * V));
    }
    return logProb;
  }

  function perplexity(sentence, k) {
    var ws = sentence.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(function(w){ return w.length > 0; });
    var N = ws.length;
    if (N < n) return Infinity;
    var lp = sentenceProb(sentence, k);
    return Math.pow(2, -lp / N);
  }

  return { counts: counts, prefixCounts: prefixCounts, getProbabilities: getProbabilities, generate: generate, sentenceProb: sentenceProb, perplexity: perplexity, vocab: Object.keys(prefixCounts) };
}

// ── SVG Parse Tree Builder ────────────────────────────────────────────────────
// Build a simple SVG constituency tree from a nested JS object
// node: { label, children: [...] } or { label } for leaves
function buildParseTreeSVG(node, containerWidth) {
  containerWidth = containerWidth || 600;
  var NODE_W = 52, NODE_H = 28, VERT_GAP = 50, HORIZ_PAD = 8;

  // First pass: assign positions
  function layout(n, depth) {
    if (!n.children || !n.children.length) {
      n._w = NODE_W + HORIZ_PAD;
      n._depth = depth;
      return;
    }
    n.children.forEach(function(c) { layout(c, depth + 1); });
    n._w = n.children.reduce(function(s, c) { return s + c._w; }, 0);
    n._depth = depth;
  }

  function assignX(n, x) {
    n._cx = x + n._w / 2;
    n._cy = n._depth * VERT_GAP + 30;
    if (!n.children || !n.children.length) return;
    var childX = x;
    n.children.forEach(function(c) {
      assignX(c, childX);
      childX += c._w;
    });
  }

  layout(node, 0);
  var scale = Math.min(1, (containerWidth - 20) / node._w);
  assignX(node, 10 / scale);

  // Compute SVG height
  function maxDepth(n) {
    if (!n.children || !n.children.length) return n._depth;
    return Math.max.apply(null, n.children.map(maxDepth));
  }
  var svgH = (maxDepth(node) + 1) * VERT_GAP + 30;
  var svgW = Math.max(node._w * scale, containerWidth);

  var edges = [];
  var nodes = [];

  function collect(n) {
    nodes.push(n);
    if (n.children) {
      n.children.forEach(function(c) {
        edges.push({ x1: n._cx * scale, y1: n._cy, x2: c._cx * scale, y2: c._cy });
        collect(c);
      });
    }
  }
  collect(node);

  var svg = '<svg width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '" xmlns="http://www.w3.org/2000/svg" style="font-family:var(--font-sans);font-size:11px;">';

  // Edges
  edges.forEach(function(e) {
    svg += '<line x1="' + e.x1.toFixed(1) + '" y1="' + e.y1 + '" x2="' + e.x2.toFixed(1) + '" y2="' + e.y2 + '" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.5"/>';
  });

  // Nodes
  nodes.forEach(function(n) {
    var cx = (n._cx * scale).toFixed(1);
    var cy = n._cy;
    var isLeaf = !n.children || !n.children.length;
    var fill = isLeaf ? 'rgba(22,163,74,0.12)' : 'rgba(37,99,235,0.10)';
    var stroke = isLeaf ? '#16a34a' : '#2563eb';
    svg += '<rect x="' + (parseFloat(cx) - NODE_W/2).toFixed(1) + '" y="' + (cy - NODE_H/2) + '" width="' + NODE_W + '" height="' + NODE_H + '" rx="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.5"/>';
    svg += '<text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" fill="currentColor" font-weight="' + (isLeaf ? '400' : '700') + '" font-size="11">' + escHtml(n.label) + '</text>';
  });

  svg += '</svg>';
  return svg;
}

// ── Step-through controller ────────────────────────────────────────────────────
// steps: array of { render: fn(container), explain: string }
function makeStepThrough(steps, containerId, explainId, counterId) {
  var current = 0;
  function render() {
    var container = document.getElementById(containerId);
    var explain = document.getElementById(explainId);
    var counter = counterId ? document.getElementById(counterId) : null;
    if (container && steps[current].render) steps[current].render(container);
    if (explain) explain.textContent = steps[current].explain || '';
    if (counter) counter.textContent = 'Step ' + (current + 1) + ' / ' + steps.length;
  }
  return {
    prev: function() { if (current > 0) { current--; render(); } },
    next: function() { if (current < steps.length - 1) { current++; render(); } },
    reset: function() { current = 0; render(); },
    render: render,
    getStep: function() { return current; },
    total: steps.length
  };
}

// ── HTML escape ───────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
