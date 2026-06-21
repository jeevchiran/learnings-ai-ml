import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import {
  CLUSTER_COLORS,
  generateBlobs,
  kMeans,
  wcss,
  centroid,
} from './clusteringUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

// ── Helpers ───────────────────────────────────────────────────────────────────
function bestKMeans(points, K, runs = 5) {
  let best = null
  for (let r = 0; r < runs; r++) {
    const result = kMeans(points, K, 100)
    if (best === null || result.inertia < best.inertia) best = result
  }
  return best
}

function computeWcssCurve(points, Kmax, runs = 5) {
  const vals = []
  for (let k = 1; k <= Kmax; k++) vals.push(bestKMeans(points, k, runs).inertia)
  return vals
}

function computeTSS(points) {
  const gx = points.reduce((s, p) => s + p[0], 0) / points.length
  const gy = points.reduce((s, p) => s + p[1], 0) / points.length
  return points.reduce((s, p) => s + (p[0] - gx) ** 2 + (p[1] - gy) ** 2, 0)
}

function computeBCSS(points, labels, centroids) {
  const gx = points.reduce((s, p) => s + p[0], 0) / points.length
  const gy = points.reduce((s, p) => s + p[1], 0) / points.length
  const K = centroids.length
  const counts = new Array(K).fill(0)
  labels.forEach(l => counts[l]++)
  return centroids.reduce((s, mu, k) => {
    const dx = mu[0] - gx, dy = mu[1] - gy
    return s + counts[k] * (dx * dx + dy * dy)
  }, 0)
}

// ── Sub-widget 1: WCSS Explorer ───────────────────────────────────────────────
let W1_SEED = 7

function WCSSExplorerWidget() {
  const scatterRef = useRef(null)
  const curveRef = useRef(null)
  const [K, setK] = useState(3)
  const dataRef = useRef(null)
  const wcssAllRef = useRef([])
  const [stats, setStats] = useState({ wcss: 0, delta: null, pct: null })

  const renderW1 = useCallback((kVal, data, wcssAll) => {
    const res = bestKMeans(data.points, kVal, 8)
    const points = data.points

    // Scatter
    const scatterTraces = []
    for (let k = 0; k < kVal; k++) {
      const xs = [], ys = []
      for (let i = 0; i < points.length; i++) {
        if (res.labels[i] === k) { xs.push(points[i][0]); ys.push(points[i][1]) }
      }
      scatterTraces.push({
        x: xs, y: ys, mode: 'markers', type: 'scatter',
        name: 'Cluster ' + (k + 1),
        marker: { color: CLUSTER_COLORS[k % CLUSTER_COLORS.length], size: 6, opacity: 0.8 },
      })
    }
    scatterTraces.push({
      x: res.centroids.map(c => c[0]), y: res.centroids.map(c => c[1]),
      mode: 'markers', type: 'scatter', name: 'Centroids',
      marker: { symbol: 'x', size: 14, color: '#111827', line: { width: 2, color: '#fff' } },
    })
    Plotly.react(scatterRef.current, scatterTraces, plotlyLayout({
      title: { text: 'K = ' + kVal + ' clusters', font: { size: 13 } },
      showlegend: false,
      xaxis: { title: 'x₁', showgrid: true },
      yaxis: { title: 'x₂', showgrid: true },
    }), PLOTLY_CONFIG)

    // WCSS curve
    const Ks = Array.from({ length: 8 }, (_, i) => i + 1)
    Plotly.react(curveRef.current, [{
      x: Ks, y: wcssAll, mode: 'lines+markers', type: 'scatter', name: 'WCSS',
      line: { color: CLUSTER_COLORS[0], width: 2 },
      marker: {
        color: Ks.map(k => k === kVal ? '#dc2626' : CLUSTER_COLORS[0]),
        size: Ks.map(k => k === kVal ? 12 : 7),
      },
    }], plotlyLayout({
      title: { text: 'WCSS vs. K', font: { size: 13 } },
      xaxis: { title: 'K (number of clusters)', dtick: 1 },
      yaxis: { title: 'WCSS (Inertia)' },
      shapes: [{ type: 'line', x0: 3, x1: 3, y0: 0, y1: 1, yref: 'paper', line: { color: '#16a34a', width: 1.5, dash: 'dash' } }],
      annotations: [{ x: 3, y: 1, yref: 'paper', xanchor: 'left', yanchor: 'top', text: 'True K=3', showarrow: false, font: { color: '#16a34a', size: 11 } }],
    }), PLOTLY_CONFIG)

    const wCur = wcssAll[kVal - 1]
    if (kVal === 1) {
      setStats({ wcss: wCur.toFixed(1), delta: null, pct: null })
    } else {
      const wPrev = wcssAll[kVal - 2]
      const delta = wPrev - wCur
      setStats({ wcss: wCur.toFixed(1), delta: '−' + delta.toFixed(1), pct: (delta / wPrev * 100).toFixed(1) + '%' })
    }
  }, [])

  const init = useCallback(() => {
    const data = generateBlobs(100, 3, 1.0, W1_SEED)
    const wcssAll = computeWcssCurve(data.points, 8, 8)
    dataRef.current = data
    wcssAllRef.current = wcssAll
    renderW1(K, data, wcssAll)
  }, [K, renderW1])

  useEffect(() => { init() }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          K:
          <input type="range" min="1" max="8" step="1" value={K}
            onChange={e => {
              const v = +e.target.value
              setK(v)
              if (dataRef.current) renderW1(v, dataRef.current, wcssAllRef.current)
            }} />
          <strong>{K}</strong>
        </label>
        <button onClick={() => {
          W1_SEED = Math.floor(Math.random() * 9000) + 1
          init()
        }} style={btnStyle('#6b7280')}>Reseed</button>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
        <span>WCSS: <strong>{stats.wcss}</strong></span>
        {stats.delta && <span>ΔWCSS: <strong>{stats.delta}</strong></span>}
        {stats.pct && <span>% drop: <strong>{stats.pct}</strong></span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div ref={scatterRef} style={{ minHeight: 280 }} />
        <div ref={curveRef} style={{ minHeight: 280 }} />
      </div>
    </div>
  )
}

// ── Sub-widget 2: Elbow Method Demo ──────────────────────────────────────────
let W2_SEED_BASE = 42

function ElbowDemoWidget() {
  const lineRef = useRef(null)
  const barRef = useRef(null)
  const [trueK, setTrueK] = useState(3)
  const [revealed, setRevealed] = useState(false)
  const dataRef = useRef(null)
  const wcssAllRef = useRef([])

  const renderW2 = useCallback((kVal, data, wcssAll, isRevealed) => {
    const Ks = Array.from({ length: 10 }, (_, i) => i + 1)
    const shapes = [], annotations = []
    if (isRevealed) {
      shapes.push({ type: 'line', x0: kVal, x1: kVal, y0: 0, y1: 1, yref: 'paper', line: { color: '#dc2626', width: 2, dash: 'dot' } })
      annotations.push({ x: kVal, y: 0.95, yref: 'paper', xanchor: 'left', yanchor: 'top', text: 'True K=' + kVal, showarrow: false, font: { color: '#dc2626', size: 12 } })
    }
    Plotly.react(lineRef.current, [{
      x: Ks, y: wcssAll, mode: 'lines+markers', type: 'scatter', name: 'WCSS',
      line: { color: CLUSTER_COLORS[0], width: 2 }, marker: { color: CLUSTER_COLORS[0], size: 8 },
    }], plotlyLayout({
      title: { text: 'WCSS vs. K — Can you spot the elbow?', font: { size: 13 } },
      xaxis: { title: 'K', dtick: 1 }, yaxis: { title: 'WCSS' },
      shapes, annotations,
    }), PLOTLY_CONFIG)

    const deltaKs = Ks.slice(1)
    const deltaVals = []
    for (let i = 1; i < wcssAll.length; i++) deltaVals.push(wcssAll[i - 1] - wcssAll[i])
    const barColors = deltaVals.map((_, idx) => (isRevealed && (idx + 2) === kVal) ? '#dc2626' : CLUSTER_COLORS[2])
    const barAnnotations = []
    if (isRevealed) {
      const trueIdx = kVal - 2
      if (trueIdx >= 0 && trueIdx < deltaVals.length) {
        barAnnotations.push({ x: deltaKs[trueIdx], y: deltaVals[trueIdx], text: 'True K=' + kVal, showarrow: true, arrowhead: 2, ax: 0, ay: -30, font: { color: '#dc2626', size: 11 } })
      }
    }
    Plotly.react(barRef.current, [{
      x: deltaKs, y: deltaVals, type: 'bar', name: 'ΔWCSS', marker: { color: barColors },
    }], plotlyLayout({
      title: { text: 'ΔWCSS = WCSS(K−1) − WCSS(K) — Largest bar = Elbow', font: { size: 13 } },
      xaxis: { title: 'K', dtick: 1 }, yaxis: { title: 'ΔWCSS' },
      annotations: barAnnotations, bargap: 0.3,
    }), PLOTLY_CONFIG)
  }, [])

  const init = useCallback((kVal) => {
    setRevealed(false)
    const seed = W2_SEED_BASE + kVal * 13
    const data = generateBlobs(120, kVal, 1.0, seed)
    const wcssAll = computeWcssCurve(data.points, 10, 6)
    dataRef.current = data
    wcssAllRef.current = wcssAll
    renderW2(kVal, data, wcssAll, false)
  }, [renderW2])

  useEffect(() => { init(3) }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          True K:
          <input type="range" min="2" max="7" step="1" value={trueK}
            onChange={e => { const v = +e.target.value; setTrueK(v); init(v) }} />
          <strong>{trueK}</strong>
        </label>
        <button onClick={() => {
          setRevealed(true)
          renderW2(trueK, dataRef.current, wcssAllRef.current, true)
        }} style={btnStyle('#dc2626')}>Reveal True K</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div ref={lineRef} style={{ minHeight: 280 }} />
        <div ref={barRef} style={{ minHeight: 280 }} />
      </div>
    </div>
  )
}

// ── Sub-widget 3: WCSS Decomposition (static) ─────────────────────────────────
const DECOMP_DATA = generateBlobs(120, 3, 1.0, 99)
const DECOMP_POINTS = DECOMP_DATA.points
const DECOMP_TSS = computeTSS(DECOMP_POINTS)

function WCSSDecompositionWidget() {
  const plotRef = useRef(null)

  useEffect(() => {
    const Ks = [1, 2, 3, 4, 5, 6, 7, 8]
    const wcssVals = [], bcssVals = []
    for (const K of Ks) {
      const res = bestKMeans(DECOMP_POINTS, K, 6)
      wcssVals.push(res.inertia)
      bcssVals.push(computeBCSS(DECOMP_POINTS, res.labels, res.centroids))
    }

    const tssAnnotations = Ks.map((k, i) => ({
      x: k, y: wcssVals[i] + bcssVals[i],
      text: (wcssVals[i] + bcssVals[i]).toFixed(0),
      showarrow: false, yanchor: 'bottom',
      font: { size: 9, color: '#6b7280' },
    }))

    Plotly.newPlot(plotRef.current, [
      { x: Ks, y: wcssVals, type: 'bar', name: 'WCSS (within-cluster)', marker: { color: '#2563eb' }, hovertemplate: 'K=%{x}<br>WCSS=%{y:.1f}<extra></extra>' },
      { x: Ks, y: bcssVals, type: 'bar', name: 'BCSS (between-cluster)', marker: { color: '#dc2626' }, hovertemplate: 'K=%{x}<br>BCSS=%{y:.1f}<extra></extra>' },
    ], plotlyLayout({
      title: { text: 'TSS = WCSS + BCSS — Total height is constant (TSS = ' + DECOMP_TSS.toFixed(0) + ')', font: { size: 13 } },
      barmode: 'stack',
      xaxis: { title: 'K (number of clusters)', dtick: 1 },
      yaxis: { title: 'Sum of Squares' },
      annotations: tssAnnotations,
      legend: { orientation: 'h', y: -0.18 },
    }), PLOTLY_CONFIG)
  }, [])

  return <div ref={plotRef} style={{ minHeight: 320 }} />
}

// ── Combined export ───────────────────────────────────────────────────────────
export default function WCSSElbowWidget() {
  return (
    <div style={{ fontFamily: 'inherit' }}>
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Widget 1 — WCSS Explorer</h4>
      <WCSSExplorerWidget />
      <h4 style={{ margin: '1.5rem 0 0.5rem', fontSize: '1rem' }}>Widget 2 — Elbow Method Live Demo</h4>
      <ElbowDemoWidget />
      <h4 style={{ margin: '1.5rem 0 0.5rem', fontSize: '1rem' }}>Widget 3 — Within vs. Between Variance</h4>
      <WCSSDecompositionWidget />
    </div>
  )
}

const btnStyle = color => ({
  background: color, color: '#fff', border: 'none', borderRadius: 4,
  padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem',
})
