import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { randn } from '../utils.js'

const CFG = { responsive: true, displayModeBar: false }

// True function: y = sin(2x) + 0.3*x
function trueF(x) { return Math.sin(2 * x) + 0.3 * x }

// Polynomial feature expansion up to degree d
function polyFeatures(x, d) {
  return Array.from({ length: d + 1 }, (_, i) => x ** i)
}

// Solve least squares for polynomial fit (simplified Vandermonde)
function fitPoly(xs, ys, d) {
  const n = xs.length, m = d + 1
  // Build X matrix
  const X = xs.map(x => polyFeatures(x, d))
  // Normal equations: (X^T X) w = X^T y  — solved via Gaussian elimination
  const XtX = Array.from({ length: m }, (_, i) =>
    Array.from({ length: m }, (_, j) => X.reduce((s, row) => s + row[i] * row[j], 0))
  )
  const Xty = Array.from({ length: m }, (_, i) => X.reduce((s, row, k) => s + row[i] * ys[k], 0))
  // Gaussian elimination
  const A = XtX.map((row, i) => [...row, Xty[i]])
  for (let col = 0; col < m; col++) {
    let pivot = col
    for (let r = col + 1; r < m; r++) if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
    [A[col], A[pivot]] = [A[pivot], A[col]]
    if (Math.abs(A[col][col]) < 1e-12) continue
    for (let r = 0; r < m; r++) {
      if (r === col) continue
      const f = A[r][col] / A[col][col]
      for (let c = col; c <= m; c++) A[r][c] -= f * A[col][c]
    }
  }
  return A.map((row, i) => row[m] / row[i])
}

function evalPoly(coeffs, x) {
  return coeffs.reduce((s, c, i) => s + c * x ** i, 0)
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

// Simulate train/val loss curves for a given polynomial degree
function simulateCurves(degree, epochs, dropoutRate, l2) {
  const n = 30
  const seed = 42
  // Fixed training data
  const xs = Array.from({ length: n }, (_, i) => -3 + 6 * i / (n - 1))
  const ys = xs.map(x => trueF(x) + randn() * 0.4)
  const xsVal = Array.from({ length: n }, (_, i) => -3 + 6 * (i + 0.5) / n)
  const ysVal = xsVal.map(x => trueF(x) + randn() * 0.4)

  // Simplified: train loss starts high, decreases. Val loss depends on degree.
  const trainLosses = [], valLosses = []
  const overfitStart = Math.max(5, Math.floor(epochs * (1 - (degree - 1) / 15)))

  for (let e = 1; e <= epochs; e++) {
    const progress = e / epochs
    const decayRate = 2 + degree * 0.4 - dropoutRate * 1.5 - l2 * 2
    const trainL = 2.0 * Math.exp(-decayRate * progress) + 0.05 + Math.abs(randn()) * 0.01
    // Val loss: improves then overfits for high degree
    let valL
    if (degree <= 3) {
      valL = trainL * (1 + 0.2 * progress) + 0.1
    } else {
      const overfit = degree > 6 ? Math.pow(Math.max(0, e - overfitStart) / epochs, 1.5) * (degree - 5) * 0.3 : 0
      const reg = dropoutRate * 0.4 + l2 * 1.5
      valL = trainL * (1 + 0.3) + overfit * Math.max(0.1, 1 - reg) + 0.12
    }
    trainLosses.push(clamp(trainL, 0, 5))
    valLosses.push(clamp(valL, 0, 5))
  }

  // Early stopping: find epoch where val loss is minimum
  let minVal = Infinity, earlyStopEpoch = epochs
  for (let i = 0; i < valLosses.length; i++) {
    if (valLosses[i] < minVal) { minVal = valLosses[i]; earlyStopEpoch = i + 1 }
  }

  return { trainLosses, valLosses, earlyStopEpoch, minVal }
}

export default function OverfittingWidget() {
  const plotRef = useRef(null)
  const [degree, setDegree] = useState(8)
  const [epochs, setEpochs] = useState(100)
  const [dropout, setDropout] = useState(0)
  const [l2, setL2] = useState(0)
  const [showEarlyStop, setShowEarlyStop] = useState(true)

  useEffect(() => {
    const { trainLosses, valLosses, earlyStopEpoch, minVal } = simulateCurves(degree, epochs, dropout, l2)
    const xs = Array.from({ length: epochs }, (_, i) => i + 1)

    const shapes = showEarlyStop ? [{
      type: 'line',
      x0: earlyStopEpoch, x1: earlyStopEpoch,
      y0: 0, y1: 1, yref: 'paper',
      line: { color: '#10b981', width: 2, dash: 'dot' },
    }] : []

    const annotations = showEarlyStop ? [{
      x: earlyStopEpoch, y: 1, yref: 'paper',
      text: `Early stop (e=${earlyStopEpoch})`,
      font: { size: 10, color: '#10b981' },
      showarrow: false, yanchor: 'bottom',
    }] : []

    Plotly.react(plotRef.current, [
      {
        x: xs, y: trainLosses, type: 'scatter', mode: 'lines',
        line: { color: '#7c3aed', width: 2.5 }, name: 'Train loss',
      },
      {
        x: xs, y: valLosses, type: 'scatter', mode: 'lines',
        line: { color: '#ef4444', width: 2.5, dash: degree > 5 ? 'solid' : 'dot' },
        name: 'Val loss',
      },
    ], {
      xaxis: { title: 'Epoch' },
      yaxis: { title: 'Loss', range: [0, Math.min(3, Math.max(...valLosses) * 1.1)] },
      title: { text: `Degree ${degree} model — ${degree <= 3 ? 'Underfitting/Good' : degree <= 6 ? 'Possible overfit' : 'Severe overfit'}`, font: { size: 13 } },
      margin: { t: 40, r: 10, b: 50, l: 55 },
      paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
      legend: { x: 0.55, y: 0.99, bgcolor: 'transparent' },
      shapes, annotations,
    }, CFG)
  }, [degree, epochs, dropout, l2, showEarlyStop])

  const sl = (label, val, set, min, max, step, fmt) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
      <span style={{ width: 110, flexShrink: 0 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(+e.target.value)} style={{ width: 100 }} />
      <strong style={{ color: '#7c3aed', width: 36 }}>{fmt ? fmt(val) : val}</strong>
    </label>
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {sl('Model degree', degree, setDegree, 1, 12, 1)}
        {sl('Epochs', epochs, setEpochs, 20, 200, 10)}
        {sl('Dropout rate', dropout, setDropout, 0, 0.8, 0.05, v => v.toFixed(2))}
        {sl('L2 λ', l2, setL2, 0, 1, 0.05, v => v.toFixed(2))}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', marginBottom: '0.6rem' }}>
        <input type="checkbox" checked={showEarlyStop} onChange={e => setShowEarlyStop(e.target.checked)} />
        Show early stopping point (min validation loss)
      </label>
      <div ref={plotRef} style={{ minHeight: 340 }} />
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Increase degree to see overfitting (val loss rises while train loss falls). Add dropout/L2 to reduce it. Early stop at the validation minimum.
      </p>
    </div>
  )
}
