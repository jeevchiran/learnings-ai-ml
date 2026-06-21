import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace, sigmoid } from '../utils.js'

const CFG = { responsive: true, displayModeBar: false }
const step = z => (z >= 0 ? 1 : 0)

export default function PerceptronWidget() {
  const plotRef = useRef(null)
  const [w1, setW1] = useState(1.5)
  const [w2, setW2] = useState(-1.0)
  const [bias, setBias] = useState(0.5)
  const [x1, setX1] = useState(0.8)
  const [x2, setX2] = useState(0.4)
  const [act, setAct] = useState('sigmoid')

  const z = w1 * x1 + w2 * x2 + bias
  const out = act === 'sigmoid' ? sigmoid(z) : step(z)
  const outFmt = act === 'sigmoid' ? out.toFixed(4) : String(out)

  useEffect(() => {
    const xs = linspace(-3, 3, 50)
    const ys = linspace(-3, 3, 50)
    const zGrid = ys.map(y2v =>
      xs.map(x1v => {
        const zv = w1 * x1v + w2 * y2v + bias
        return act === 'sigmoid' ? sigmoid(zv) : step(zv)
      })
    )
    let bx = [], by = []
    if (Math.abs(w2) > 0.01) {
      bx = xs
      by = xs.map(xv => -(w1 * xv + bias) / w2)
    }

    Plotly.react(
      plotRef.current,
      [
        {
          type: 'heatmap', x: xs, y: ys, z: zGrid,
          colorscale: [['0', '#ddd6fe'], ['0.5', '#ede9fe'], ['1', '#7c3aed']],
          showscale: true, opacity: 0.55, hoverinfo: 'none',
          colorbar: { len: 0.6, thickness: 10, title: { text: 'output', font: { size: 10 } } },
        },
        {
          x: bx, y: by, type: 'scatter', mode: 'lines',
          line: { color: '#7c3aed', width: 2.5, dash: 'dash' }, name: 'Decision boundary',
        },
        {
          x: [x1], y: [x2], type: 'scatter', mode: 'markers',
          marker: { size: 14, color: '#f59e0b', symbol: 'star', line: { color: '#92400e', width: 1.5 } },
          name: `(x₁, x₂)`,
        },
      ],
      {
        xaxis: { title: 'x₁', range: [-3, 3], zeroline: false },
        yaxis: { title: 'x₂', range: [-3, 3], zeroline: false },
        title: { text: 'Decision Boundary', font: { size: 13 } },
        margin: { t: 36, r: 80, b: 45, l: 50 },
        paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
        showlegend: true,
        legend: { x: 0, y: -0.18, orientation: 'h', font: { size: 10 } },
      },
      CFG
    )
  }, [w1, w2, bias, x1, x2, act]) // eslint-disable-line

  const sl = (label, val, set, min, max) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
      <span style={{ width: 58, flexShrink: 0 }}>{label}</span>
      <input type="range" min={min} max={max} step="0.1" value={val}
        onChange={e => set(+e.target.value)} style={{ flex: 1 }} />
      <strong style={{ width: 42, textAlign: 'right', color: '#7c3aed' }}>{val.toFixed(1)}</strong>
    </label>
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left: controls + SVG neuron */}
        <div>
          <select
            value={act} onChange={e => setAct(e.target.value)}
            style={{ fontSize: '0.84rem', padding: '0.2rem 0.5rem', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg)', color: 'var(--text)', marginBottom: '0.6rem', cursor: 'pointer' }}
          >
            <option value="sigmoid">Activation: Sigmoid σ(z)</option>
            <option value="step">Activation: Step (Heaviside)</option>
          </select>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.38rem', marginBottom: '0.9rem' }}>
            {sl('w₁', w1, setW1, -3, 3)}
            {sl('w₂', w2, setW2, -3, 3)}
            {sl('bias b', bias, setBias, -3, 3)}
            {sl('x₁', x1, setX1, -2.5, 2.5)}
            {sl('x₂', x2, setX2, -2.5, 2.5)}
          </div>

          {/* Neuron diagram */}
          <svg width="100%" viewBox="0 0 310 190" style={{ fontFamily: 'inherit' }}>
            {/* Input nodes */}
            <circle cx="40" cy="55" r="24" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="2" />
            <text x="40" y="51" textAnchor="middle" fill="#5b21b6" fontSize="9" fontWeight="bold">x₁</text>
            <text x="40" y="64" textAnchor="middle" fill="#5b21b6" fontSize="10">{x1.toFixed(1)}</text>

            <circle cx="40" cy="130" r="24" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="2" />
            <text x="40" y="126" textAnchor="middle" fill="#5b21b6" fontSize="9" fontWeight="bold">x₂</text>
            <text x="40" y="139" textAnchor="middle" fill="#5b21b6" fontSize="10">{x2.toFixed(1)}</text>

            <circle cx="40" cy="180" r="16" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
            <text x="40" y="176" textAnchor="middle" fill="#92400e" fontSize="8" fontWeight="bold">bias</text>
            <text x="40" y="187" textAnchor="middle" fill="#92400e" fontSize="9">{bias.toFixed(1)}</text>

            {/* Edges */}
            <line x1="64" y1="65" x2="158" y2="90" stroke="#7c3aed" strokeWidth={Math.min(Math.abs(w1) * 1.8 + 0.5, 5)} opacity="0.7" />
            <text x="107" y="67" fill="#6d28d9" fontWeight="bold" fontSize="9">w₁={w1.toFixed(1)}</text>

            <line x1="64" y1="120" x2="158" y2="102" stroke="#7c3aed" strokeWidth={Math.min(Math.abs(w2) * 1.8 + 0.5, 5)} opacity="0.7" />
            <text x="107" y="128" fill="#6d28d9" fontWeight="bold" fontSize="9">w₂={w2.toFixed(1)}</text>

            <line x1="56" y1="168" x2="158" y2="108" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.8" />

            {/* Sum node */}
            <circle cx="188" cy="98" r="30" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2.5" />
            <text x="188" y="93" textAnchor="middle" fill="#5b21b6" fontWeight="bold" fontSize="11">Σ</text>
            <text x="188" y="108" textAnchor="middle" fill="#5b21b6" fontSize="9">z={z.toFixed(2)}</text>

            {/* Activation arrow */}
            <line x1="218" y1="98" x2="260" y2="98" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arrow)" />
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#7c3aed" />
              </marker>
            </defs>

            {/* Output node */}
            <circle cx="284" cy="98" r="24" fill={out > 0.5 ? '#7c3aed' : '#ede9fe'} stroke="#7c3aed" strokeWidth="2" />
            <text x="284" y="94" textAnchor="middle" fill={out > 0.5 ? '#fff' : '#5b21b6'} fontWeight="bold" fontSize="9">
              {act === 'sigmoid' ? 'σ(z)' : 'H(z)'}
            </text>
            <text x="284" y="107" textAnchor="middle" fill={out > 0.5 ? '#fff' : '#5b21b6'} fontSize="9">{outFmt}</text>
          </svg>

          <div style={{ fontSize: '0.8rem', background: 'var(--bg-hover)', borderRadius: 4, padding: '0.45rem 0.7rem', marginTop: '0.3rem', lineHeight: 1.6 }}>
            <strong>z</strong> = {w1.toFixed(1)}·{x1.toFixed(1)} + ({w2.toFixed(1)})·{x2.toFixed(1)} + {bias.toFixed(1)} = <strong style={{ color: '#7c3aed' }}>{z.toFixed(3)}</strong>
            <br />
            <strong>output</strong> = {act === 'sigmoid' ? 'σ(' : 'H('}z) = <strong style={{ color: '#7c3aed' }}>{outFmt}</strong>
          </div>
        </div>

        {/* Right: decision boundary plot */}
        <div ref={plotRef} style={{ minHeight: 370 }} />
      </div>
    </div>
  )
}
