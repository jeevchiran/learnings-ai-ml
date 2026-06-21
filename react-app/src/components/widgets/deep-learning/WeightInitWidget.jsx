import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { randn, sigmoid } from '../utils.js'

const CFG = { responsive: true, displayModeBar: false }

function generateWeights(strategy, fanIn, fanOut, n = 1000) {
  switch (strategy) {
    case 'zero':
      return Array(n).fill(0)
    case 'uniform_small':
      return Array.from({ length: n }, () => (Math.random() * 2 - 1) * 0.01)
    case 'normal_large':
      return Array.from({ length: n }, () => randn() * 1.0)
    case 'xavier':
      return Array.from({ length: n }, () => randn() * Math.sqrt(2 / (fanIn + fanOut)))
    case 'he':
      return Array.from({ length: n }, () => randn() * Math.sqrt(2 / fanIn))
    default:
      return Array.from({ length: n }, () => randn() * 0.01)
  }
}

// Simulate activation variance through L layers
function simulateVariance(strategy, layers = [50, 50, 50, 50, 50]) {
  const variances = [1.0] // input variance
  let xVar = 1.0
  for (let l = 1; l < layers.length; l++) {
    const fanIn = layers[l - 1]
    const fanOut = layers[l]
    let wVar
    switch (strategy) {
      case 'zero': wVar = 0; break
      case 'uniform_small': wVar = (0.01) ** 2 / 3; break
      case 'normal_large': wVar = 1.0; break
      case 'xavier': wVar = 2 / (fanIn + fanOut); break
      case 'he': wVar = 2 / fanIn; break
      default: wVar = 0.01; break
    }
    // Var(a) ≈ fanIn * wVar * Var(x) * 0.5 (for ReLU-like scaling)
    xVar = fanIn * wVar * xVar
    variances.push(Math.min(xVar, 1e6))
  }
  return variances
}

const STRATEGIES = [
  { key: 'zero', label: 'All Zeros', color: '#94a3b8', note: 'Symmetry problem: all neurons learn identically.' },
  { key: 'uniform_small', label: 'Uniform Small', color: '#0ea5e9', note: 'Works for shallow nets but vanishes in deep ones.' },
  { key: 'normal_large', label: 'Normal N(0,1)', color: '#ef4444', note: 'Exploding gradients in deep nets (large σ).' },
  { key: 'xavier', label: 'Xavier/Glorot', color: '#f59e0b', note: 'Preserves variance for tanh/sigmoid activations.' },
  { key: 'he', label: 'He (Kaiming)', color: '#7c3aed', note: 'Optimal for ReLU: accounts for dead-half.' },
]

export default function WeightInitWidget() {
  const histRef = useRef(null)
  const varRef = useRef(null)
  const [strategy, setStrategy] = useState('he')
  const [fanIn] = useState(512)
  const [fanOut] = useState(256)

  useEffect(() => {
    const weights = generateWeights(strategy, fanIn, fanOut)
    const info = STRATEGIES.find(s => s.key === strategy)

    Plotly.react(histRef.current, [{
      x: weights, type: 'histogram',
      nbinsx: 60,
      marker: { color: info.color, opacity: 0.75 },
      name: 'Weight distribution',
    }], {
      xaxis: { title: 'Weight value' },
      yaxis: { title: 'Count' },
      title: { text: `Initial Weight Distribution — ${info.label}`, font: { size: 12 } },
      margin: { t: 36, r: 10, b: 50, l: 55 },
      paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
      showlegend: false,
    }, CFG)
  }, [strategy, fanIn, fanOut])

  useEffect(() => {
    const layers = [100, 100, 100, 100, 100, 100]
    const layerLabels = layers.map((_, i) => (i === 0 ? 'Input' : `L${i}`))
    const traces = STRATEGIES.map(({ key, label, color }) => ({
      x: layerLabels,
      y: simulateVariance(key, layers).map(v => Math.log10(Math.max(1e-30, v))),
      type: 'scatter', mode: 'lines+markers',
      line: { color, width: 2 },
      marker: { size: 6, color },
      name: label,
      opacity: key === strategy ? 1 : 0.3,
    }))

    Plotly.react(varRef.current, traces, {
      xaxis: { title: 'Layer' },
      yaxis: { title: 'log₁₀(signal variance)' },
      title: { text: 'Signal Variance Through Layers (log scale)', font: { size: 12 } },
      margin: { t: 36, r: 10, b: 50, l: 65 },
      paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
      legend: { x: 0.01, y: 0.99, bgcolor: 'transparent', font: { size: 10 } },
      shapes: [{ type: 'line', x0: 0, x1: 1, y0: 0, y1: 0, xref: 'paper', yref: 'y', line: { color: '#64748b', dash: 'dash', width: 1 } }],
    }, CFG)
  }, [strategy])

  const cur = STRATEGIES.find(s => s.key === strategy)

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {STRATEGIES.map(({ key, label, color }) => (
          <button key={key} onClick={() => setStrategy(key)} style={{
            padding: '0.28rem 0.65rem', fontSize: '0.82rem', border: '2px solid',
            borderColor: strategy === key ? color : 'var(--border)',
            background: strategy === key ? color : 'var(--bg)',
            color: strategy === key ? '#fff' : 'var(--text)',
            borderRadius: 4, cursor: 'pointer', fontWeight: strategy === key ? 700 : 400,
          }}>{label}</button>
        ))}
      </div>

      <div style={{ background: 'var(--bg-hover)', borderLeft: `3px solid ${cur.color}`, padding: '0.45rem 0.8rem', borderRadius: '0 4px 4px 0', marginBottom: '0.75rem', fontSize: '0.84rem' }}>
        <strong>{cur.label}:</strong> {cur.note}
        {cur.key === 'xavier' && <span> σ = √(2/(fanIn+fanOut)) = √(2/{fanIn + fanOut}) ≈ {Math.sqrt(2 / (fanIn + fanOut)).toFixed(4)}</span>}
        {cur.key === 'he' && <span> σ = √(2/fanIn) = √(2/{fanIn}) ≈ {Math.sqrt(2 / fanIn).toFixed(4)}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div ref={histRef} style={{ minHeight: 280 }} />
        <div ref={varRef} style={{ minHeight: 280 }} />
      </div>
    </div>
  )
}
