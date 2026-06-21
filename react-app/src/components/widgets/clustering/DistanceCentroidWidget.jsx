import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import {
  CLUSTER_COLORS,
  euclidean,
  manhattan,
  cosineSim,
  centroid,
  wcss,
  generateBlobs,
  kMeans,
  assignClusters,
} from './clusteringUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

// ── Sub-widget 1: Distance Metric Explorer ───────────────────────────────────
function DistanceExplorerWidget() {
  const plotRef = useRef(null)
  const [x1, setX1] = useState(2)
  const [y1, setY1] = useState(3)
  const [x2, setX2] = useState(7)
  const [y2, setY2] = useState(8)

  const render = useCallback((ax1, ay1, ax2, ay2) => {
    const dE = euclidean([ax1, ay1], [ax2, ay2])
    const dM = manhattan([ax1, ay1], [ax2, ay2])
    const cs = cosineSim([ax1, ay1], [ax2, ay2])

    const traceLine = {
      x: [ax1, ax2], y: [ay1, ay2],
      mode: 'lines', name: 'Euclidean path',
      line: { color: CLUSTER_COLORS[0], width: 2.5, dash: 'solid' },
    }
    const traceManhattan = {
      x: [ax1, ax2, ax2], y: [ay1, ay1, ay2],
      mode: 'lines', name: 'Manhattan path',
      line: { color: CLUSTER_COLORS[1], width: 2.5, dash: 'dot' },
    }
    const tracePoints = {
      x: [ax1, ax2], y: [ay1, ay2],
      mode: 'markers+text',
      text: [`A (${ax1.toFixed(1)}, ${ay1.toFixed(1)})`, `B (${ax2.toFixed(1)}, ${ay2.toFixed(1)})`],
      textposition: ['top right', 'top right'],
      marker: { size: 12, color: [CLUSTER_COLORS[0], CLUSTER_COLORS[1]], symbol: 'circle' },
      name: 'Points', showlegend: false,
    }
    const layout = plotlyLayout({
      title: { text: 'Two points and their distance paths', font: { size: 13 } },
      xaxis: { title: 'x', range: [-0.5, 10.5] },
      yaxis: { title: 'y', range: [-0.5, 10.5], scaleanchor: 'x', scaleratio: 1 },
      legend: { orientation: 'h', y: -0.15 },
      margin: { t: 45, r: 20, b: 70, l: 55 },
    })
    Plotly.react(plotRef.current, [traceLine, traceManhattan, tracePoints], layout, PLOTLY_CONFIG)

    return { dE, dM, cs }
  }, [])

  const [metrics, setMetrics] = useState({ dE: 0, dM: 0, cs: 0 })

  useEffect(() => {
    const m = render(x1, y1, x2, y2)
    setMetrics(m)
  }, []) // eslint-disable-line

  const handleChange = (newX1, newY1, newX2, newY2) => {
    const m = render(newX1, newY1, newX2, newY2)
    setMetrics(m)
  }

  const dx = x2 - x1, dy = y2 - y1

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', marginBottom: '0.75rem' }}>
        {[
          ['x₁', x1, setX1, (v) => handleChange(v, y1, x2, y2)],
          ['y₁', y1, setY1, (v) => handleChange(x1, v, x2, y2)],
          ['x₂', x2, setX2, (v) => handleChange(x1, y1, v, y2)],
          ['y₂', y2, setY2, (v) => handleChange(x1, y1, x2, v)],
        ].map(([label, val, setter, handler]) => (
          <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            {label}:
            <input type="range" min="0" max="10" step="0.5" value={val}
              onChange={e => { const v = +e.target.value; setter(v); handler(v) }}
              style={{ flex: 1 }} />
            <strong style={{ minWidth: 28 }}>{val.toFixed(1)}</strong>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
        <span>d<sub>E</sub>: <strong>{metrics.dE.toFixed(4)}</strong></span>
        <span>d<sub>M</sub>: <strong>{metrics.dM.toFixed(4)}</strong></span>
        <span>cos(θ): <strong>{metrics.cs.toFixed(4)}</strong></span>
        <span>cos dist: <strong>{(1 - metrics.cs).toFixed(4)}</strong></span>
      </div>
      <div style={{ fontSize: '0.82rem', opacity: 0.75, marginBottom: '0.5rem', fontFamily: 'monospace' }}>
        d<sub>E</sub> = √(({x2.toFixed(1)}−{x1.toFixed(1)})² + ({y2.toFixed(1)}−{y1.toFixed(1)})²)
        = √({(dx*dx).toFixed(2)} + {(dy*dy).toFixed(2)}) = {metrics.dE.toFixed(4)}
        &nbsp;|&nbsp;
        d<sub>M</sub> = |{dx.toFixed(2)}| + |{dy.toFixed(2)}| = {metrics.dM.toFixed(4)}
      </div>
      <div ref={plotRef} style={{ minHeight: 350 }} />
    </div>
  )
}

// ── Sub-widget 2: Centroid as Balance Point ───────────────────────────────────
const BLOB_8 = generateBlobs(8, 1, 2.0, 17)
const FIXED_POINTS = BLOB_8.points.map(p => [
  Math.max(0.5, Math.min(9.5, p[0])),
  Math.max(0.5, Math.min(9.5, p[1])),
])
const TRUE_CENTROID = centroid(FIXED_POINTS)

function CentroidWidget() {
  const plotRef = useRef(null)
  const [xc, setXc] = useState(+TRUE_CENTROID[0].toFixed(2))
  const [yc, setYc] = useState(+TRUE_CENTROID[1].toFixed(2))

  const wcssTrueVal = FIXED_POINTS.reduce((s, p) => {
    const d = euclidean(p, TRUE_CENTROID)
    return s + d * d
  }, 0)

  const render = useCallback((cxVal, cyVal) => {
    const wcssCand = FIXED_POINTS.reduce((s, p) => {
      const d = euclidean(p, [cxVal, cyVal])
      return s + d * d
    }, 0)

    const lineXs = [], lineYs = []
    FIXED_POINTS.forEach(p => { lineXs.push(p[0], cxVal, null); lineYs.push(p[1], cyVal, null) })

    const layout = plotlyLayout({
      title: { text: 'Candidate vs. true centroid — WCSS updates live', font: { size: 13 } },
      xaxis: { title: 'x', range: [-1.5, 11.5] },
      yaxis: { title: 'y', range: [-1.5, 11.5], scaleanchor: 'x', scaleratio: 1 },
      legend: { orientation: 'h', y: -0.15 },
      margin: { t: 45, r: 20, b: 70, l: 55 },
    })

    Plotly.react(plotRef.current, [
      { x: lineXs, y: lineYs, mode: 'lines', name: 'Distance lines', showlegend: false,
        line: { color: 'rgba(100,100,100,0.4)', width: 1.5 } },
      { x: FIXED_POINTS.map(p => p[0]), y: FIXED_POINTS.map(p => p[1]),
        mode: 'markers', name: 'Data points',
        marker: { size: 9, color: CLUSTER_COLORS[0], symbol: 'circle' } },
      { x: [cxVal], y: [cyVal], mode: 'markers', name: 'Candidate centroid',
        marker: { size: 16, color: CLUSTER_COLORS[1], symbol: 'cross', line: { color: '#fff', width: 1.5 } } },
      { x: [TRUE_CENTROID[0]], y: [TRUE_CENTROID[1]], mode: 'markers+text',
        text: ['True centroid'], textposition: 'top right', name: 'True centroid',
        marker: { size: 18, color: CLUSTER_COLORS[2], symbol: 'star', line: { color: '#fff', width: 1 } } },
    ], layout, PLOTLY_CONFIG)

    return wcssCand
  }, [])

  const [wcssCand, setWcssCand] = useState(wcssTrueVal)

  useEffect(() => {
    setWcssCand(render(xc, yc))
  }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', marginBottom: '0.75rem' }}>
        {[
          ['Candidate x', xc, setXc, (v) => { setWcssCand(render(v, yc)) }],
          ['Candidate y', yc, setYc, (v) => { setWcssCand(render(xc, v)) }],
        ].map(([label, val, setter, handler]) => (
          <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            {label}:
            <input type="range" min="0" max="10" step="0.1" value={val}
              onChange={e => { const v = +e.target.value; setter(v); handler(v) }}
              style={{ flex: 1 }} />
            <strong style={{ minWidth: 32 }}>{val.toFixed(2)}</strong>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
        <span>True centroid: <strong>({TRUE_CENTROID[0].toFixed(2)}, {TRUE_CENTROID[1].toFixed(2)})</strong></span>
        <span>WCSS (true): <strong>{wcssTrueVal.toFixed(2)}</strong></span>
        <span>WCSS (candidate): <strong style={{ color: wcssCand > wcssTrueVal + 0.01 ? '#dc2626' : '#16a34a' }}>{wcssCand.toFixed(2)}</strong></span>
      </div>
      <div ref={plotRef} style={{ minHeight: 350 }} />
    </div>
  )
}

// ── Sub-widget 3: Feature Scaling Impact ─────────────────────────────────────
const N_PER = 30
function buildScalingData() {
  let seedW = 99
  function sr() {
    seedW += 0x6D2B79F5; let t = seedW
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  function srn() {
    let u = 0, v = 0
    while (u === 0) u = sr(); while (v === 0) v = sr()
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  }
  const rawData = []
  for (let i = 0; i < N_PER; i++) rawData.push([25 + srn() * 8, 30000 + srn() * 15000])
  for (let i = 0; i < N_PER; i++) rawData.push([55 + srn() * 8, 70000 + srn() * 15000])

  const ages = rawData.map(p => p[0])
  const incomes = rawData.map(p => p[1])
  const ageMean = ages.reduce((a, b) => a + b, 0) / ages.length
  const ageStd = Math.sqrt(ages.reduce((s, x) => s + (x - ageMean) ** 2, 0) / ages.length)
  const incomeMean = incomes.reduce((a, b) => a + b, 0) / incomes.length
  const incomeStd = Math.sqrt(incomes.reduce((s, x) => s + (x - incomeMean) ** 2, 0) / incomes.length)

  const scaledData = rawData.map(p => [(p[0] - ageMean) / ageStd, (p[1] - incomeMean) / incomeStd])
  const rawResult = kMeans(rawData, 2, 50)
  const scaledResult = kMeans(scaledData, 2, 50)
  return { rawData, scaledData, rawResult, scaledResult }
}

const SCALING_DATA = buildScalingData()

function FeatureScalingWidget() {
  const rawRef = useRef(null)
  const scaledRef = useRef(null)

  function makeTraces(points, labels) {
    return [0, 1].map(k => ({
      x: points.filter((_, i) => labels[i] === k).map(p => p[0]),
      y: points.filter((_, i) => labels[i] === k).map(p => p[1]),
      mode: 'markers', type: 'scatter',
      name: 'Cluster ' + k,
      marker: { size: 7, color: CLUSTER_COLORS[k], opacity: 0.85 },
    }))
  }

  useEffect(() => {
    const { rawData, scaledData, rawResult, scaledResult } = SCALING_DATA

    Plotly.newPlot(rawRef.current,
      makeTraces(rawData, rawResult.labels),
      plotlyLayout({
        title: { text: 'Raw features (income dominates)', font: { size: 12 } },
        xaxis: { title: 'Age (years)' },
        yaxis: { title: 'Income ($)' },
        legend: { orientation: 'h', y: -0.2 },
        margin: { t: 40, r: 15, b: 70, l: 70 },
      }), PLOTLY_CONFIG)

    Plotly.newPlot(scaledRef.current,
      makeTraces(scaledData, scaledResult.labels),
      plotlyLayout({
        title: { text: 'Z-score scaled (correct clusters)', font: { size: 12 } },
        xaxis: { title: 'Age (z-score)' },
        yaxis: { title: 'Income (z-score)' },
        legend: { orientation: 'h', y: -0.2 },
        margin: { t: 40, r: 15, b: 70, l: 70 },
        showlegend: false,
      }), PLOTLY_CONFIG)
  }, [])

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div ref={rawRef} style={{ minHeight: 280 }} />
        <div ref={scaledRef} style={{ minHeight: 280 }} />
      </div>
      <p style={{ fontSize: '0.84rem', opacity: 0.75, marginTop: '0.5rem' }}>
        Without scaling, K-means draws horizontal income bands. With Z-score scaling, it recovers the two age-based clusters.
      </p>
    </div>
  )
}

// ── Combined export ───────────────────────────────────────────────────────────
export default function DistanceCentroidWidget() {
  return (
    <div style={{ fontFamily: 'inherit' }}>
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Distance Metric Explorer</h4>
      <DistanceExplorerWidget />
      <h4 style={{ margin: '1.5rem 0 0.5rem', fontSize: '1rem' }}>Centroid as Balance Point</h4>
      <CentroidWidget />
      <h4 style={{ margin: '1.5rem 0 0.5rem', fontSize: '1rem' }}>Why Feature Scaling Matters</h4>
      <FeatureScalingWidget />
    </div>
  )
}
