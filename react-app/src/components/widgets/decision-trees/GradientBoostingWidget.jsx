import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace, mean, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
function makePRNG(seed) {
  let s = seed
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Dataset ───────────────────────────────────────────────────────────────────
function generateDataset() {
  const rng = makePRNG(42)
  const N = 40, X = [], Y = []
  for (let i = 0; i < N; i++) {
    const xi = rng() * 4
    const noise = (rng() * 2 - 1) * 0.3 * Math.sqrt(3)
    X.push(xi)
    Y.push(2 * Math.sin(xi) + noise)
  }
  return { X, Y }
}

// ── Boosting with stored stumps ───────────────────────────────────────────────
function boostingWithStumps(X, Y, maxM, eta) {
  const n = X.length
  const initMean = mean(Y)
  let F = new Array(n).fill(initMean)
  const stumps = []
  const results = [{
    F: F.slice(),
    residuals: Y.map((yi, i) => yi - F[i]),
    mse: mean(Y.map((yi, i) => (yi - F[i]) ** 2)),
  }]

  const sortedX = X.slice().sort((a, b) => a - b)

  for (let m = 0; m < maxM; m++) {
    const residuals = Y.map((yi, i) => yi - F[i])
    let bestThresh = sortedX[0], bestMSE = Infinity

    for (let ti = 0; ti < sortedX.length - 1; ti++) {
      const thresh = (sortedX[ti] + sortedX[ti + 1]) / 2
      const leftIdx = [], rightIdx = []
      for (let k = 0; k < n; k++) { if (X[k] <= thresh) leftIdx.push(k); else rightIdx.push(k) }
      if (leftIdx.length === 0 || rightIdx.length === 0) continue
      const lm = mean(leftIdx.map(idx => residuals[idx]))
      const rm = mean(rightIdx.map(idx => residuals[idx]))
      const mseVal = leftIdx.reduce((s, idx) => s + (residuals[idx] - lm) ** 2, 0)
                   + rightIdx.reduce((s, idx) => s + (residuals[idx] - rm) ** 2, 0)
      if (mseVal < bestMSE) { bestMSE = mseVal; bestThresh = thresh }
    }

    const lIdx = X.map((x, k) => k).filter(k => X[k] <= bestThresh)
    const rIdx = X.map((x, k) => k).filter(k => X[k] > bestThresh)
    const leftLeaf = lIdx.length > 0 ? mean(lIdx.map(idx => residuals[idx])) : 0
    const rightLeaf = rIdx.length > 0 ? mean(rIdx.map(idx => residuals[idx])) : 0

    stumps.push({ thresh: bestThresh, leftLeaf, rightLeaf })
    F = F.map((fi, i) => fi + eta * (X[i] <= bestThresh ? leftLeaf : rightLeaf))

    results.push({
      F: F.slice(),
      residuals: Y.map((yi, i) => yi - F[i]),
      mse: mean(Y.map((yi, i) => (yi - F[i]) ** 2)),
    })
  }
  return { results, stumps, initialMean: initMean }
}

const MAX_M = 20
const ETA_DEFAULT = 0.5

const { X, Y } = generateDataset()
const xLine = linspace(0, 4, 200)
const trueY = xLine.map(x => 2 * Math.sin(x))

export default function GradientBoostingWidget() {
  const fitRef = useRef(null)
  const residRef = useRef(null)
  const lrRef = useRef(null)
  const [m, setM] = useState(1)
  const [stats, setStats] = useState({ mse: '—', m: 1 })
  const boostRef = useRef(null)

  useEffect(() => {
    boostRef.current = boostingWithStumps(X, Y, MAX_M, ETA_DEFAULT)
    Plotly.newPlot(fitRef.current, [], plotlyLayout({ height: 320 }), PLOTLY_CONFIG)
    Plotly.newPlot(residRef.current, [], plotlyLayout({ height: 240 }), PLOTLY_CONFIG)
    renderBoostPlot(1)
    renderLRPlot()
  }, []) // eslint-disable-line

  function predictOnLine(xv, mVal) {
    const { stumps, initialMean } = boostRef.current
    let f = initialMean
    for (let s = 0; s < mVal; s++) {
      const stump = stumps[s]
      f += ETA_DEFAULT * (xv <= stump.thresh ? stump.leftLeaf : stump.rightLeaf)
    }
    return f
  }

  function renderBoostPlot(mVal) {
    const { results } = boostRef.current
    const linePreds = xLine.map(xv => predictOnLine(xv, mVal))
    const trainResiduals = results[mVal].residuals
    const trainMSE = results[mVal].mse

    Plotly.react(fitRef.current, [
      { x: X, y: Y, mode: 'markers', type: 'scatter', name: 'Training data', marker: { color: '#2563eb', size: 6, opacity: 0.75 } },
      { x: xLine, y: linePreds, mode: 'lines', name: `F_${mVal}(x)`, line: { color: '#f59e0b', width: 2.5 } },
      { x: xLine, y: trueY, mode: 'lines', name: '2sin(x)', line: { color: '#6b7280', width: 1.5, dash: 'dot' } },
    ], plotlyLayout({
      height: 320,
      title: { text: `Fitted Curve after M = ${mVal} tree(s)`, font: { size: 13 } },
      xaxis: { title: 'x', range: [-0.1, 4.1] },
      yaxis: { title: 'y', range: [-3, 3.5] },
      legend: { orientation: 'h', y: 1.1 },
      margin: { t: 50, r: 20, b: 50, l: 55 },
    }), PLOTLY_CONFIG)

    const barColors = trainResiduals.map(r => r >= 0 ? '#22c55e' : '#ef4444')
    Plotly.react(residRef.current, [{
      x: X.map((_, i) => i),
      y: trainResiduals,
      type: 'bar', name: 'Residuals',
      marker: { color: barColors },
    }], plotlyLayout({
      height: 240,
      title: { text: `Residuals at M = ${mVal}`, font: { size: 13 } },
      xaxis: { title: 'Sample index', tickfont: { size: 9 } },
      yaxis: { title: 'Residual', range: [-2.5, 2.5] },
      margin: { t: 50, r: 20, b: 50, l: 55 },
      showlegend: false,
    }), PLOTLY_CONFIG)

    setStats({ mse: trainMSE.toFixed(4), m: mVal })
  }

  function renderLRPlot() {
    const etaValues = [0.05, 0.1, 0.3, 1.0]
    const lrColors = ['#2563eb', '#16a34a', '#d97706', '#dc2626']
    const LR_M = 30
    const traces = etaValues.map((eta, ei) => {
      const res = boostingWithStumps(X, Y, LR_M, eta)
      return {
        x: Array.from({ length: LR_M + 1 }, (_, i) => i),
        y: res.results.map(r => r.mse),
        mode: 'lines', type: 'scatter',
        name: `η = ${eta}`,
        line: { color: lrColors[ei], width: 2 },
      }
    })
    Plotly.newPlot(lrRef.current, traces, plotlyLayout({
      height: 380,
      title: { text: 'Training MSE vs. Iteration for Different Learning Rates', font: { size: 13 } },
      xaxis: { title: 'Number of Trees M' },
      yaxis: { title: 'Training MSE', rangemode: 'tozero' },
      legend: { orientation: 'h', y: 1.1 },
      margin: { t: 55, r: 20, b: 55, l: 60 },
    }), PLOTLY_CONFIG)
  }

  function handleM(val) {
    setM(val)
    renderBoostPlot(val)
  }

  return (
    <div>
      <h4 style={{ margin: '0 0 0.5rem' }}>Boosting Step-by-Step</h4>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <label style={{ fontWeight: 600 }}>Trees M: <span>{m}</span>
          <input type="range" min={1} max={MAX_M} value={m}
            onChange={e => handleM(parseInt(e.target.value, 10))}
            style={{ display: 'block', minWidth: 200 }} />
        </label>
        <div style={{ background: 'var(--bg-secondary, #f3f4f6)', borderRadius: 8, padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}>
          <div style={{ color: 'var(--text-muted, #6b7280)' }}>Train MSE</div>
          <strong>{stats.mse}</strong>
        </div>
      </div>
      <div ref={fitRef} />
      <div ref={residRef} />
      <h4 style={{ margin: '1.5rem 0 0.5rem' }}>Learning Rate Comparison</h4>
      <div ref={lrRef} />
    </div>
  )
}
