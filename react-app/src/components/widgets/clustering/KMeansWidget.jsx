import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import {
  CLUSTER_COLORS,
  generateBlobs,
  kMeansPlusPlusInit,
  assignClusters,
  updateCentroids,
  wcss,
  euclidean,
  kMeans,
} from './clusteringUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

// ── Fixed dataset shared by both sub-widgets ──────────────────────────────────
const BLOB_DATA = generateBlobs(80, 3, 1.2, 42)
const ALL_POINTS = BLOB_DATA.points

// Fisher-Yates random initialisation
function randomInit(points, K) {
  const pool = points.map((_, i) => i)
  for (let i = 0; i < K; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, K).map(idx => points[idx].slice())
}

function buildKMeansTraces(pts, labels, centroids) {
  const K = centroids.length
  const traces = []
  for (let k = 0; k < K; k++) {
    const xs = [], ys = []
    for (let i = 0; i < pts.length; i++) {
      if (labels[i] === k) { xs.push(pts[i][0]); ys.push(pts[i][1]) }
    }
    traces.push({
      type: 'scatter', mode: 'markers',
      x: xs, y: ys,
      name: 'Cluster ' + (k + 1),
      marker: { color: CLUSTER_COLORS[k], size: 7, opacity: 0.8, line: { color: CLUSTER_COLORS[k], width: 1 } },
      showlegend: true,
    })
  }
  traces.push({
    type: 'scatter', mode: 'markers',
    x: centroids.map(c => c[0]), y: centroids.map(c => c[1]),
    name: 'Centroids',
    marker: {
      symbol: 'star', size: 16,
      color: centroids.map((_, k) => CLUSTER_COLORS[k]),
      line: { color: '#ffffff', width: 2 },
    },
    showlegend: true,
  })
  return traces
}

function buildKGridTraces(pts, labels, K) {
  const traces = []
  for (let k = 0; k < K; k++) {
    const xs = [], ys = []
    for (let i = 0; i < pts.length; i++) {
      if (labels[i] === k) { xs.push(pts[i][0]); ys.push(pts[i][1]) }
    }
    traces.push({
      type: 'scatter', mode: 'markers',
      x: xs, y: ys,
      name: 'C' + (k + 1),
      marker: { color: CLUSTER_COLORS[k], size: 6, opacity: 0.85 },
      showlegend: false,
    })
  }
  return traces
}

// ── Sub-widget 1: K-Means Step-by-Step ───────────────────────────────────────
function KMeansStepWidget() {
  const plotRef = useRef(null)
  const stateRef = useRef({ points: [], centroids: [], labels: [], iter: 0, converged: false })
  const [K, setK] = useState(3)
  const [usePlusPlus, setUsePlusPlus] = useState(true)
  const [stats, setStats] = useState({ iter: 0, wcssVal: 0, converged: false, k: 3 })

  const updateStats = useCallback(() => {
    const st = stateRef.current
    setStats({
      iter: st.iter,
      wcssVal: wcss(st.points, st.labels, st.centroids).toFixed(1),
      converged: st.converged,
      k: st.centroids.length,
    })
  }, [])

  const render = useCallback(() => {
    const { points, labels, centroids, iter, converged } = stateRef.current
    const title = 'Iteration ' + iter + (converged ? ' — Converged' : '')
    const layout = plotlyLayout({
      height: 450,
      title: { text: title, font: { size: 13 } },
      xaxis: { title: 'Feature 1', range: [-1, 11] },
      yaxis: { title: 'Feature 2', range: [-1, 11] },
      legend: { orientation: 'h', y: -0.12 },
      margin: { t: 50, r: 20, b: 80, l: 55 },
    })
    Plotly.react(plotRef.current, buildKMeansTraces(points, labels, centroids), layout, PLOTLY_CONFIG)
    updateStats()
  }, [updateStats])

  const initialize = useCallback((kVal, plusPlus) => {
    const st = stateRef.current
    st.points = ALL_POINTS
    st.centroids = plusPlus ? kMeansPlusPlusInit(st.points, kVal) : randomInit(st.points, kVal)
    st.labels = assignClusters(st.points, st.centroids)
    st.iter = 0
    st.converged = false
    render()
  }, [render])

  const step = useCallback(() => {
    const st = stateRef.current
    if (st.converged) return
    const newCentroids = updateCentroids(st.points, st.labels, st.centroids.length)
    const newLabels = assignClusters(st.points, newCentroids)
    const moved = newCentroids.some((c, k) => euclidean(c, st.centroids[k]) > 1e-8)
    st.centroids = newCentroids
    st.labels = newLabels
    st.iter++
    if (!moved) st.converged = true
    render()
  }, [render])

  const runToConvergence = useCallback(() => {
    const st = stateRef.current
    let count = 0
    while (!st.converged && count < 200) {
      const newCentroids = updateCentroids(st.points, st.labels, st.centroids.length)
      const newLabels = assignClusters(st.points, newCentroids)
      const moved = newCentroids.some((c, k) => euclidean(c, st.centroids[k]) > 1e-8)
      st.centroids = newCentroids
      st.labels = newLabels
      st.iter++
      if (!moved) st.converged = true
      count++
    }
    render()
  }, [render])

  useEffect(() => { initialize(3, true) }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          K:
          <input type="range" min="2" max="6" step="1" value={K}
            onChange={e => {
              const v = +e.target.value
              setK(v)
              initialize(v, usePlusPlus)
            }} />
          <strong>{K}</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={usePlusPlus}
            onChange={e => {
              setUsePlusPlus(e.target.checked)
              initialize(K, e.target.checked)
            }} />
          K-means++
        </label>
        <button onClick={() => initialize(K, usePlusPlus)} style={btnStyle('#6b7280')}>Reset</button>
        <button onClick={step} disabled={stats.converged} style={btnStyle('#2563eb')}>Step</button>
        <button onClick={runToConvergence} disabled={stats.converged} style={btnStyle('#16a34a')}>Run</button>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', fontSize: '0.88rem', flexWrap: 'wrap' }}>
        <span>K: <strong>{stats.k}</strong></span>
        <span>Iteration: <strong>{stats.iter}</strong></span>
        <span>WCSS: <strong>{stats.wcssVal}</strong></span>
        <span>Converged: <strong>{stats.converged ? 'Yes' : 'No'}</strong></span>
      </div>
      <div ref={plotRef} style={{ minHeight: 380 }} />
    </div>
  )
}

// ── Sub-widget 2: K Comparison Grid ──────────────────────────────────────────
function KGridWidget() {
  const plotRefs = { 2: useRef(null), 3: useRef(null), 4: useRef(null), 5: useRef(null) }
  const [wcssVals, setWcssVals] = useState({})

  useEffect(() => {
    const vals = {}
    ;[2, 3, 4, 5].forEach(K => {
      const initC = kMeansPlusPlusInit(ALL_POINTS, K)
      const result = kMeans(ALL_POINTS, K, 100, initC)
      vals[K] = result.inertia.toFixed(1)
      const traces = buildKGridTraces(ALL_POINTS, result.labels, K)
      const layout = plotlyLayout({
        height: 250,
        title: { text: 'K = ' + K, font: { size: 12 } },
        xaxis: { title: '', range: [-1, 11], showticklabels: false },
        yaxis: { title: '', range: [-1, 11], showticklabels: false },
        margin: { t: 35, r: 10, b: 20, l: 20 },
        showlegend: false,
      })
      Plotly.newPlot(plotRefs[K].current, traces, layout, PLOTLY_CONFIG)
    })
    setWcssVals(vals)
  }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {[2, 3, 4, 5].map(K => (
          <div key={K} style={{ border: '1px solid rgba(128,128,128,0.2)', borderRadius: 6, padding: '0.5rem' }}>
            <div ref={plotRefs[K]} style={{ minHeight: 200 }} />
            {wcssVals[K] && (
              <div style={{ textAlign: 'center', fontSize: '0.83rem', marginTop: '0.25rem' }}>
                WCSS: <strong>{wcssVals[K]}</strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Combined export ───────────────────────────────────────────────────────────
export default function KMeansWidget() {
  return (
    <div style={{ fontFamily: 'inherit' }}>
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>K-Means Step-by-Step</h4>
      <KMeansStepWidget />
      <h4 style={{ margin: '1.5rem 0 0.5rem', fontSize: '1rem' }}>K Comparison Grid</h4>
      <KGridWidget />
    </div>
  )
}

const btnStyle = color => ({
  background: color, color: '#fff', border: 'none', borderRadius: 4,
  padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem',
})
