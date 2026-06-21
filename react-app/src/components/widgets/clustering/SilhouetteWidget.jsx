import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import {
  CLUSTER_COLORS,
  generateBlobs,
  kMeansPlusPlusInit,
  kMeans,
  wcss,
  centroid,
  euclidean,
  silhouettePoint,
  silhouetteScore,
} from './clusteringUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

// ── Metric helpers ────────────────────────────────────────────────────────────
function dbIndex(points, labels, centroids) {
  const K = centroids.length
  const scatter = centroids.map((mu, k) => {
    const clPts = points.filter((_, i) => labels[i] === k)
    if (!clPts.length) return 0
    return clPts.reduce((s, p) => s + euclidean(p, mu), 0) / clPts.length
  })
  let db = 0
  for (let i = 0; i < K; i++) {
    let maxR = 0
    for (let j = 0; j < K; j++) {
      if (i === j) continue
      const dC = euclidean(centroids[i], centroids[j])
      if (dC === 0) continue
      const R = (scatter[i] + scatter[j]) / dC
      if (R > maxR) maxR = R
    }
    db += maxR
  }
  return db / K
}

function chIndex(points, labels, centroids, K) {
  const n = points.length
  if (K < 2 || n <= K) return 0
  const globalMean = centroid(points)
  const counts = new Array(K).fill(0)
  labels.forEach(l => counts[l]++)
  const bcss = centroids.reduce((s, mu, k) => {
    const d = euclidean(mu, globalMean)
    return s + counts[k] * d * d
  }, 0)
  const wcssCur = wcss(points, labels, centroids)
  if (wcssCur === 0) return 0
  return (bcss / (K - 1)) / (wcssCur / (n - K))
}

function runKMeansForWidget(points, K) {
  const initC = kMeansPlusPlusInit(points, K)
  return kMeans(points, K, 100, initC)
}

// ── Sub-widget 1: Silhouette Explorer ────────────────────────────────────────
const BASE_DATA = generateBlobs(120, 4, 1.1, 99)

function SilhouetteExplorerWidget() {
  const scatterRef = useRef(null)
  const barRef = useRef(null)
  const [K, setK] = useState(4)
  const [stats, setStats] = useState({ meanS: 0, inertia: 0, negCount: 0, wellPct: '0%' })
  const pointsRef = useRef(BASE_DATA.points)

  const render = useCallback((kVal) => {
    const points = pointsRef.current
    const result = runKMeansForWidget(points, kVal)
    const { labels, centroids, inertia } = result

    // Scatter
    const scatterTraces = []
    for (let k = 0; k < kVal; k++) {
      const xs = [], ys = []
      for (let i = 0; i < points.length; i++) {
        if (labels[i] === k) { xs.push(points[i][0]); ys.push(points[i][1]) }
      }
      scatterTraces.push({
        type: 'scatter', mode: 'markers',
        x: xs, y: ys,
        name: 'Cluster ' + (k + 1),
        marker: { color: CLUSTER_COLORS[k], size: 6, opacity: 0.8, line: { color: 'rgba(255,255,255,0.4)', width: 0.5 } },
      })
    }
    Plotly.react(scatterRef.current, scatterTraces, plotlyLayout({
      height: 380,
      title: { text: 'K = ' + kVal + ' Cluster Assignment', font: { size: 12 } },
      xaxis: { title: 'Feature 1' }, yaxis: { title: 'Feature 2' },
      legend: { orientation: 'h', y: -0.15, font: { size: 10 } },
      margin: { t: 45, r: 15, b: 70, l: 50 },
    }), PLOTLY_CONFIG)

    // Silhouette bar chart
    const sVals = points.map((_, i) => silhouettePoint(i, points, labels))
    const meanS = sVals.reduce((a, b) => a + b, 0) / sVals.length

    // Group by cluster, sort ascending within cluster
    const grouped = []
    for (let k = 0; k < kVal; k++) {
      const clPts = points.map((_, i) => ({ idx: i, s: sVals[i] })).filter(p => labels[p.idx] === k)
      clPts.sort((a, b) => a.s - b.s)
      grouped.push(...clPts)
    }

    const xVals = grouped.map(p => p.s)
    const yVals = grouped.map((_, i) => i)
    const colors = grouped.map(p => p.s >= 0 ? CLUSTER_COLORS[labels[p.idx]] : '#9ca3af')

    // Cluster tick labels
    const tickVals = [], tickText = []
    let runningIdx = 0
    for (let k = 0; k < kVal; k++) {
      const cnt = labels.filter(l => l === k).length
      tickVals.push(runningIdx + cnt / 2)
      tickText.push('C' + (k + 1))
      runningIdx += cnt
    }

    Plotly.react(barRef.current, [
      { type: 'bar', orientation: 'h', x: xVals, y: yVals, marker: { color: colors, line: { width: 0 } }, name: 'Silhouette s(i)', showlegend: false },
      { type: 'scatter', mode: 'lines', x: [meanS, meanS], y: [-0.5, grouped.length - 0.5], line: { color: '#dc2626', width: 1.5, dash: 'dash' }, name: 'Mean s = ' + meanS.toFixed(3) },
    ], plotlyLayout({
      height: 380,
      title: { text: 'Silhouette Plot (K = ' + kVal + ')', font: { size: 12 } },
      xaxis: { title: 'Silhouette coefficient s(i)', range: [-1, 1], zeroline: true, zerolinewidth: 1.5 },
      yaxis: { title: 'Point (grouped by cluster)', tickvals: tickVals, ticktext: tickText, showgrid: false, zeroline: false },
      bargap: 0,
      legend: { orientation: 'h', y: -0.15, font: { size: 10 } },
      margin: { t: 45, r: 15, b: 70, l: 45 },
    }), PLOTLY_CONFIG)

    const negCount = sVals.filter(s => s < 0).length
    const wellCount = sVals.filter(s => s > 0.5).length
    setStats({
      meanS: meanS.toFixed(3),
      inertia: inertia.toFixed(1),
      negCount,
      wellPct: ((wellCount / sVals.length) * 100).toFixed(1) + '%',
    })
  }, [])

  useEffect(() => { render(4) }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          K:
          <input type="range" min="2" max="7" step="1" value={K}
            onChange={e => { const v = +e.target.value; setK(v); render(v) }} />
          <strong>{K}</strong>
        </label>
        <button onClick={() => {
          const seed = Math.floor(Math.random() * 10000)
          pointsRef.current = generateBlobs(120, 4, 1.1, seed).points
          render(K)
        }} style={btnStyle('#6b7280')}>Reseed</button>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
        <span>Mean silhouette: <strong>{stats.meanS}</strong></span>
        <span>WCSS: <strong>{stats.inertia}</strong></span>
        <span>Points with s&lt;0: <strong>{stats.negCount}</strong></span>
        <span>Well-clustered (s&gt;0.5): <strong>{stats.wellPct}</strong></span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div ref={scatterRef} style={{ minHeight: 300 }} />
        <div ref={barRef} style={{ minHeight: 300 }} />
      </div>
    </div>
  )
}

// ── Sub-widget 2: Multi-Metric Comparison (static) ───────────────────────────
const MM_POINTS = generateBlobs(120, 4, 1.1, 99).points
const MM_K_VALUES = [2, 3, 4, 5, 6, 7, 8]

function buildMultiMetricData() {
  const globalC = centroid(MM_POINTS)
  const labelsK1 = MM_POINTS.map(() => 0)
  const wcssK1 = wcss(MM_POINTS, labelsK1, [globalC])

  const wcssVals = [], silVals = [], dbVals = [], chVals = []
  for (const K of MM_K_VALUES) {
    const initC = kMeansPlusPlusInit(MM_POINTS, K)
    const result = kMeans(MM_POINTS, K, 100, initC)
    const { labels, centroids, inertia } = result
    wcssVals.push(inertia)
    silVals.push(silhouetteScore(MM_POINTS, labels))
    dbVals.push(dbIndex(MM_POINTS, labels, centroids))
    chVals.push(chIndex(MM_POINTS, labels, centroids, K))
  }

  const wcssNorm = wcssVals.map(v => v / wcssK1)
  const silMin = Math.min(...silVals), silMax = Math.max(...silVals)
  const silNorm = silVals.map(v => silMax === silMin ? 1 : (v - silMin) / (silMax - silMin))
  const dbMax = Math.max(...dbVals)
  const dbNorm = dbVals.map(v => dbMax === 0 ? 0 : v / dbMax)
  const chMax = Math.max(...chVals)
  const chNorm = chVals.map(v => chMax === 0 ? 0 : v / chMax)

  return {
    wcssDisplay: wcssNorm.map(v => 1 - v),
    silNorm,
    dbDisplay: dbNorm.map(v => 1 - v),
    chNorm,
  }
}

const MM_DATA = buildMultiMetricData()

function MultiMetricWidget() {
  const plotRef = useRef(null)

  useEffect(() => {
    Plotly.newPlot(plotRef.current, [
      { type: 'scatter', mode: 'lines+markers', x: MM_K_VALUES, y: MM_DATA.wcssDisplay, name: '1 - WCSS (Elbow, inverted)', line: { color: '#dc2626', width: 2 }, marker: { size: 7, color: '#dc2626' } },
      { type: 'scatter', mode: 'lines+markers', x: MM_K_VALUES, y: MM_DATA.silNorm, name: 'Silhouette score', line: { color: '#2563eb', width: 2 }, marker: { size: 7, color: '#2563eb' } },
      { type: 'scatter', mode: 'lines+markers', x: MM_K_VALUES, y: MM_DATA.dbDisplay, name: '1 - DB index (inverted)', line: { color: '#d97706', width: 2, dash: 'dashdot' }, marker: { size: 7, color: '#d97706' } },
      { type: 'scatter', mode: 'lines+markers', x: MM_K_VALUES, y: MM_DATA.chNorm, name: 'Calinski-Harabasz (normalised)', line: { color: '#16a34a', width: 2, dash: 'dash' }, marker: { size: 7, color: '#16a34a' } },
    ], plotlyLayout({
      height: 400,
      title: { text: 'Normalised Metrics vs. K (all "up = better")', font: { size: 12 } },
      xaxis: { title: 'K (number of clusters)', tickvals: MM_K_VALUES, dtick: 1 },
      yaxis: { title: 'Normalised score (0–1, higher = better)', range: [-0.05, 1.15] },
      legend: { orientation: 'h', y: -0.18, font: { size: 11 } },
      margin: { t: 50, r: 20, b: 80, l: 60 },
      shapes: [{ type: 'line', x0: 4, x1: 4, y0: 0, y1: 1.1, line: { color: '#6b7280', width: 1.5, dash: 'dot' } }],
      annotations: [{ x: 4, y: 1.1, xanchor: 'left', yanchor: 'top', text: 'True K = 4', showarrow: false, font: { size: 11, color: '#6b7280' } }],
    }), PLOTLY_CONFIG)
  }, [])

  return <div ref={plotRef} style={{ minHeight: 320 }} />
}

// ── Combined export ───────────────────────────────────────────────────────────
export default function SilhouetteWidget() {
  return (
    <div style={{ fontFamily: 'inherit' }}>
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Widget 1 — Silhouette Explorer</h4>
      <SilhouetteExplorerWidget />
      <h4 style={{ margin: '1.5rem 0 0.5rem', fontSize: '1rem' }}>Widget 2 — Multi-Metric Comparison</h4>
      <MultiMetricWidget />
    </div>
  )
}

const btnStyle = color => ({
  background: color, color: '#fff', border: 'none', borderRadius: 4,
  padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem',
})
