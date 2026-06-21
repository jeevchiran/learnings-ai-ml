import { useEffect, useRef, useState, useMemo } from 'react'
import Plotly from 'plotly.js-dist-min'
import { randn } from '../utils.js'

const CFG = { responsive: true, displayModeBar: false }

function l1Prox(w, lambda) { return Math.sign(w) * Math.max(0, Math.abs(w) - lambda) }
function l2Prox(w, lambda) { return w / (1 + 2 * lambda) }

export default function RegNormWidget() {
  const regRef = useRef(null)
  const bnRef  = useRef(null)
  const [tab, setTab]       = useState('reg')
  const [lambda, setLambda] = useState(0.3)

  // Fixed random weights — generated once
  const rawWeights = useMemo(() => Array.from({ length: 30 }, () => randn() * 1.5), [])
  // Fixed random activations for BN
  const rawActs = useMemo(() => Array.from({ length: 500 }, () => randn() * 3 + 2), [])

  useEffect(() => {
    const l1w = rawWeights.map(w => l1Prox(w, lambda))
    const l2w = rawWeights.map(w => l2Prox(w, lambda))
    const idx = rawWeights.map((_, i) => i)
    Plotly.react(regRef.current, [
      { x: idx, y: rawWeights, type: 'bar', name: 'No regularization', marker: { color: '#94a3b8' }, opacity: 0.7 },
      { x: idx, y: l2w,        type: 'bar', name: `L2 (λ=${lambda})`,  marker: { color: '#0ea5e9' }, opacity: 0.85 },
      { x: idx, y: l1w,        type: 'bar', name: `L1 (λ=${lambda})`,  marker: { color: '#7c3aed' }, opacity: 0.9 },
    ], {
      barmode: 'overlay',
      xaxis: { title: 'Weight index' },
      yaxis: { title: 'Weight value', range: [-4, 4] },
      title: { text: 'L1/L2 Effect on Weights', font: { size: 12 } },
      margin: { t: 36, r: 10, b: 50, l: 55 },
      paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
      legend: { x: 0.01, y: 0.99, bgcolor: 'transparent', font: { size: 10 } },
    }, CFG)
  }, [lambda, rawWeights])

  useEffect(() => {
    const mean_ = rawActs.reduce((s, x) => s + x, 0) / rawActs.length
    const std_  = Math.sqrt(rawActs.reduce((s, x) => s + (x - mean_) ** 2, 0) / rawActs.length)
    const normed = rawActs.map(x => (x - mean_) / (std_ + 1e-5))
    const scaled = normed.map(x => 1.5 * x + 0.5)

    Plotly.react(bnRef.current, [
      { x: rawActs, type: 'histogram', name: 'Before BN',              marker: { color: '#ef4444' }, opacity: 0.6, nbinsx: 40 },
      { x: normed,  type: 'histogram', name: 'After normalize',         marker: { color: '#0ea5e9' }, opacity: 0.6, nbinsx: 40 },
      { x: scaled,  type: 'histogram', name: 'After scale (γ=1.5,β=0.5)', marker: { color: '#7c3aed' }, opacity: 0.6, nbinsx: 40 },
    ], {
      barmode: 'overlay',
      xaxis: { title: 'Activation value', range: [-8, 12] },
      yaxis: { title: 'Count' },
      title: { text: 'Batch Normalization Effect', font: { size: 12 } },
      margin: { t: 36, r: 10, b: 50, l: 55 },
      paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
      legend: { x: 0.5, y: 0.99, bgcolor: 'transparent', font: { size: 10 } },
    }, CFG)
  }, [rawActs])

  const tabBtn = (key, label) => (
    <button onClick={() => setTab(key)} style={{
      padding: '0.3rem 0.9rem', fontSize: '0.85rem', border: 'none', cursor: 'pointer',
      borderBottom: tab === key ? '2px solid #7c3aed' : '2px solid transparent',
      background: 'transparent', color: tab === key ? '#7c3aed' : 'var(--text)',
      fontWeight: tab === key ? 700 : 400,
    }}>{label}</button>
  )

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '0.75rem' }}>
        {tabBtn('reg', 'L1 / L2 Regularization')}
        {tabBtn('bn', 'Batch Normalization')}
      </div>

      {tab === 'reg' && (
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem' }}>
            λ:
            <input type="range" min="0" max="1" step="0.05" value={lambda}
              onChange={e => setLambda(+e.target.value)} style={{ width: 120 }} />
            <strong style={{ color: '#7c3aed' }}>{lambda.toFixed(2)}</strong>
          </label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            <strong>L1</strong> pushes small weights to exactly zero (sparse). <strong>L2</strong> shrinks all weights proportionally.
          </p>
        </div>
      )}
      {tab === 'bn' && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          BN normalizes to μ=0, σ=1 per feature across the batch, then applies learned scale γ and shift β.
        </p>
      )}

      <div style={{ display: tab === 'reg' ? 'block' : 'none' }}>
        <div ref={regRef} style={{ minHeight: 320 }} />
      </div>
      <div style={{ display: tab === 'bn' ? 'block' : 'none' }}>
        <div ref={bnRef} style={{ minHeight: 320 }} />
      </div>
    </div>
  )
}
