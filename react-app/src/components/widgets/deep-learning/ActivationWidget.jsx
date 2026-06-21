import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace, sigmoid } from '../utils.js'

const CFG = { responsive: true, displayModeBar: false }

const FUNS = {
  sigmoid: {
    label: 'Sigmoid σ(z)',
    f: z => 1 / (1 + Math.exp(-z)),
    df: z => { const s = sigmoid(z); return s * (1 - s) },
    eq: 'σ(z) = 1 / (1 + e⁻ᶻ)',
    deq: "σ'(z) = σ(z)(1 − σ(z))",
    range: '(0, 1)',
    note: 'Saturates for |z|≫0, causing vanishing gradients.',
    color: '#7c3aed',
  },
  tanh: {
    label: 'Tanh',
    f: z => Math.tanh(z),
    df: z => 1 - Math.tanh(z) ** 2,
    eq: 'tanh(z) = (eᶻ − e⁻ᶻ)/(eᶻ + e⁻ᶻ)',
    deq: "tanh'(z) = 1 − tanh²(z)",
    range: '(−1, 1)',
    note: 'Zero-centered; still saturates at extremes.',
    color: '#0ea5e9',
  },
  relu: {
    label: 'ReLU',
    f: z => Math.max(0, z),
    df: z => (z > 0 ? 1 : 0),
    eq: 'ReLU(z) = max(0, z)',
    deq: "ReLU'(z) = 1 if z>0, else 0",
    range: '[0, ∞)',
    note: 'Sparse, fast, but dead neurons if z always ≤ 0.',
    color: '#10b981',
  },
  leakyrelu: {
    label: 'Leaky ReLU',
    f: z => (z > 0 ? z : 0.01 * z),
    df: z => (z > 0 ? 1 : 0.01),
    eq: 'f(z) = z if z>0, else 0.01z',
    deq: "f'(z) = 1 if z>0, else 0.01",
    range: '(−∞, ∞)',
    note: 'Fixes dead neuron problem with small negative slope.',
    color: '#f59e0b',
  },
  elu: {
    label: 'ELU',
    f: z => (z > 0 ? z : (Math.exp(z) - 1)),
    df: z => (z > 0 ? 1 : Math.exp(z)),
    eq: 'f(z) = z if z>0, else α(eᶻ−1)  (α=1)',
    deq: "f'(z) = 1 if z>0, else eᶻ",
    range: '(−1, ∞)',
    note: 'Smooth negative saturation; pushes mean towards 0.',
    color: '#ef4444',
  },
  gelu: {
    label: 'GELU',
    f: z => 0.5 * z * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (z + 0.044715 * z ** 3))),
    df: z => {
      const c = Math.sqrt(2 / Math.PI)
      const inner = c * (z + 0.044715 * z ** 3)
      const tanhv = Math.tanh(inner)
      const sech2 = 1 - tanhv ** 2
      return 0.5 * (1 + tanhv) + 0.5 * z * sech2 * c * (1 + 3 * 0.044715 * z ** 2)
    },
    eq: 'GELU(z) ≈ 0.5z(1 + tanh(√(2/π)(z + 0.044715z³)))',
    deq: "Complex — see formula",
    range: '≈(−0.17, ∞)',
    note: 'Used in GPT/BERT. Smooth stochastic interpretation.',
    color: '#d946ef',
  },
}

export default function ActivationWidget() {
  const fnRef = useRef(null)
  const dfRef = useRef(null)
  const [fn, setFn] = useState('relu')

  useEffect(() => {
    const { f, df, color } = FUNS[fn]
    const xs = linspace(-4, 4, 200)
    const ys = xs.map(f)
    const dys = xs.map(df)

    const layout = {
      margin: { t: 30, r: 10, b: 45, l: 50 },
      paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
      xaxis: { zeroline: true, zerolinecolor: '#94a3b8', zerolinewidth: 1, title: 'z' },
    }

    Plotly.react(fnRef.current, [{
      x: xs, y: ys, type: 'scatter', mode: 'lines',
      line: { color, width: 3 }, name: 'f(z)',
    }], { ...layout, yaxis: { title: 'f(z)', zeroline: true, zerolinecolor: '#94a3b8', zerolinewidth: 1 }, title: { text: 'Activation function', font: { size: 13 } } }, CFG)

    Plotly.react(dfRef.current, [{
      x: xs, y: dys, type: 'scatter', mode: 'lines',
      line: { color, width: 3, dash: 'dot' }, name: "f'(z)",
    }], { ...layout, yaxis: { title: "f'(z)", zeroline: true, zerolinecolor: '#94a3b8', zerolinewidth: 1 }, title: { text: 'Derivative (used in backprop)', font: { size: 13 } } }, CFG)
  }, [fn])

  const info = FUNS[fn]

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        {Object.entries(FUNS).map(([key, { label, color }]) => (
          <button key={key} onClick={() => setFn(key)} style={{
            padding: '0.28rem 0.65rem', fontSize: '0.82rem', border: '2px solid',
            borderColor: fn === key ? color : 'var(--border)',
            background: fn === key ? color : 'var(--bg)',
            color: fn === key ? '#fff' : 'var(--text)',
            borderRadius: 4, cursor: 'pointer', fontWeight: fn === key ? 700 : 400,
          }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--bg-hover)', borderLeft: `3px solid ${info.color}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', marginBottom: '0.75rem', fontSize: '0.84rem' }}>
        <div><strong>Formula:</strong> {info.eq}</div>
        <div><strong>Derivative:</strong> {info.deq}</div>
        <div><strong>Output range:</strong> {info.range}</div>
        <div><strong>Note:</strong> {info.note}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div ref={fnRef} style={{ minHeight: 280 }} />
        <div ref={dfRef} style={{ minHeight: 280 }} />
      </div>
    </div>
  )
}
