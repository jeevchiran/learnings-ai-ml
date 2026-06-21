import { useState } from 'react'
import { sigmoid } from '../utils.js'

// Fixed tiny 2→2→1 network for step-through backprop illustration
const W1 = [[0.5, -0.3], [0.2, 0.8]]   // 2x2
const W2 = [[0.7, -0.4]]               // 1x2
const b1 = [0.1, -0.2]
const b2 = [0.3]

function forward(x) {
  const z1 = W1.map((row, i) => row[0] * x[0] + row[1] * x[1] + b1[i])
  const a1 = z1.map(sigmoid)
  const z2 = W2.map((row, i) => row[0] * a1[0] + row[1] * a1[1] + b2[i])
  const a2 = z2.map(v => Math.max(0, Math.min(1, sigmoid(v))))
  return { z1, a1, z2, a2 }
}

function backward(x, y, { z1, a1, z2, a2 }) {
  const dA2 = a2.map((a, i) => a - y[i])  // BCE gradient
  const dZ2 = dA2.map((da, i) => {
    const s = sigmoid(z2[i])
    return da * s * (1 - s)
  })
  const dW2 = W2.map((_, i) => a1.map(aj => dZ2[i] * aj))
  const db2 = dZ2
  const dA1 = a1.map((_, j) => W2.reduce((s, row, i) => s + row[j] * dZ2[i], 0))
  const dZ1 = dA1.map((da, i) => {
    const s = sigmoid(z1[i])
    return da * s * (1 - s)
  })
  const dW1 = W1.map((_, i) => x.map(xj => dZ1[i] * xj))
  const db1 = dZ1
  return { dZ2, dW2, db2, dA1, dZ1, dW1, db1 }
}

const STEPS = [
  {
    title: '① Forward Pass — Hidden Layer',
    desc: (fw) => `z₁ = W₁x + b₁ = [${fw.z1.map(v=>v.toFixed(3)).join(', ')}]\na₁ = σ(z₁) = [${fw.a1.map(v=>v.toFixed(3)).join(', ')}]`,
    highlight: 'z1',
  },
  {
    title: '② Forward Pass — Output Layer',
    desc: (fw) => `z₂ = W₂a₁ + b₂ = [${fw.z2.map(v=>v.toFixed(3)).join(', ')}]\nŷ = σ(z₂) = [${fw.a2.map(v=>v.toFixed(3)).join(', ')}]`,
    highlight: 'a2',
  },
  {
    title: '③ Compute Loss',
    desc: (fw, bw, y) => {
      const loss = -y.reduce((s, yi, i) => s + yi * Math.log(fw.a2[i] + 1e-8) + (1-yi)*Math.log(1-fw.a2[i]+1e-8), 0)
      return `BCE Loss = −[y·log(ŷ) + (1−y)·log(1−ŷ)]\n= ${loss.toFixed(4)}`
    },
    highlight: 'loss',
  },
  {
    title: '④ Backward — Output Gradients',
    desc: (fw, bw) => `∂L/∂z₂ = ŷ − y = [${bw.dZ2.map(v=>v.toFixed(4)).join(', ')}]\n∂L/∂W₂ = (∂L/∂z₂)·a₁ᵀ`,
    highlight: 'dZ2',
  },
  {
    title: '⑤ Backward — Hidden Gradients',
    desc: (fw, bw) => `∂L/∂a₁ = W₂ᵀ·(∂L/∂z₂) = [${bw.dA1.map(v=>v.toFixed(4)).join(', ')}]\n∂L/∂z₁ = ∂L/∂a₁ ⊙ σ'(z₁) = [${bw.dZ1.map(v=>v.toFixed(4)).join(', ')}]`,
    highlight: 'dZ1',
  },
  {
    title: '⑥ Parameter Gradients',
    desc: (fw, bw) => `∂L/∂W₁[0] = [${bw.dW1[0].map(v=>v.toFixed(4)).join(', ')}]\n∂L/∂b₁ = [${bw.db1.map(v=>v.toFixed(4)).join(', ')}]\n∂L/∂W₂[0] = [${bw.dW2[0].map(v=>v.toFixed(4)).join(', ')}]`,
    highlight: 'dW',
  },
]

const GLOW = '#7c3aed'
const NODE_COLORS = { default: '#ede9fe', active_fwd: '#7c3aed', active_bwd: '#ef4444', done: '#ddd6fe' }

export default function BackpropWidget() {
  const [x, setX] = useState([0.6, 0.4])
  const [y, setY] = useState([1])
  const [step, setStep] = useState(-1)

  const fw = forward(x)
  const bw = backward(x, y, fw)

  const hlFwd = step >= 0 && step <= 1
  const hlBwd = step >= 3

  const nodeColor = (layer) => {
    if (step === -1) return NODE_COLORS.default
    if (layer === 'input') return step >= 0 ? '#dde6fe' : NODE_COLORS.default
    if (layer === 'hidden') return hlFwd ? NODE_COLORS.active_fwd : hlBwd ? '#fca5a5' : NODE_COLORS.done
    if (layer === 'output') return step >= 1 ? (hlBwd ? '#fca5a5' : NODE_COLORS.active_fwd) : NODE_COLORS.default
    return NODE_COLORS.default
  }

  const curStep = step >= 0 && step < STEPS.length ? STEPS[step] : null

  return (
    <div>
      {/* Input controls */}
      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', marginBottom: '0.8rem', alignItems: 'center', fontSize: '0.84rem' }}>
        {[0, 1].map(i => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            x{i + 1}:
            <input type="range" min="-1" max="1" step="0.1" value={x[i]}
              onChange={e => { const n = [...x]; n[i] = +e.target.value; setX(n); setStep(-1) }}
              style={{ width: 80 }} />
            <strong style={{ color: '#7c3aed' }}>{x[i].toFixed(1)}</strong>
          </label>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          Target y:
          <select value={y[0]} onChange={e => { setY([+e.target.value]); setStep(-1) }}
            style={{ padding: '0.15rem', border: '1px solid var(--border)', borderRadius: 3, background: 'var(--bg)', color: 'var(--text)', fontSize: '0.84rem' }}>
            <option value={1}>1</option>
            <option value={0}>0</option>
          </select>
        </label>
      </div>

      {/* Network SVG */}
      <svg width="100%" viewBox="0 0 400 180" style={{ fontFamily: 'inherit', marginBottom: '0.6rem' }}>
        {/* Edges fwd */}
        {[0, 1].map(i => [0, 1].map(j => (
          <line key={`e1-${i}-${j}`}
            x1={60} y1={40 + i * 100} x2={190} y2={50 + j * 80}
            stroke={hlBwd ? '#ef444466' : '#7c3aed66'}
            strokeWidth={step >= 0 ? 1.5 : 0.8} />
        )))}
        {[0, 1].map(j => (
          <line key={`e2-${j}`}
            x1={218} y1={50 + j * 80} x2={340} y2={90}
            stroke={hlBwd ? '#ef444488' : '#7c3aed88'}
            strokeWidth={step >= 1 ? 2 : 0.8} />
        ))}

        {/* Backward gradient arrows */}
        {step >= 4 && [0, 1].map(j => (
          <line key={`bg2-${j}`}
            x1={330} y1={90} x2={228} y2={50 + j * 80}
            stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.8"
            markerEnd="url(#arrowb)" />
        ))}
        {step >= 5 && [0, 1].map(i => [0, 1].map(j => (
          <line key={`bg1-${i}-${j}`}
            x1={178} y1={50 + j * 80} x2={70} y2={40 + i * 100}
            stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2" opacity="0.6" />
        )))}

        <defs>
          <marker id="arrowb" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 z" fill="#ef4444" />
          </marker>
        </defs>

        {/* Input nodes */}
        {[0, 1].map(i => (
          <g key={`in-${i}`}>
            <circle cx={60} cy={40 + i * 100} r={22} fill="#dde6fe" stroke="#7c3aed" strokeWidth="1.5" />
            <text x={60} y={36 + i * 100} textAnchor="middle" fontSize="10" fill="#5b21b6" fontWeight="bold">x{i+1}</text>
            <text x={60} y={48 + i * 100} textAnchor="middle" fontSize="9" fill="#5b21b6">{x[i].toFixed(2)}</text>
          </g>
        ))}

        {/* Hidden nodes */}
        {[0, 1].map(j => (
          <g key={`h-${j}`}>
            <circle cx={204} cy={50 + j * 80} r={24}
              fill={step >= 0 ? (hlBwd && step >= 4 ? '#fecaca' : '#7c3aed') : '#ede9fe'}
              stroke="#7c3aed" strokeWidth="2" />
            <text x={204} y={46 + j * 80} textAnchor="middle" fontSize="8" fill={step >= 0 && !hlBwd ? '#fff' : '#5b21b6'} fontWeight="bold">
              {step >= 0 ? `a₁${j+1}` : `h${j+1}`}
            </text>
            <text x={204} y={58 + j * 80} textAnchor="middle" fontSize="8" fill={step >= 0 && !hlBwd ? '#fff' : '#5b21b6'}>
              {step >= 0 ? fw.a1[j].toFixed(3) : ''}
            </text>
          </g>
        ))}

        {/* Output node */}
        <g>
          <circle cx={360} cy={90} r={24}
            fill={step >= 1 ? (step >= 3 ? '#fecaca' : '#7c3aed') : '#ede9fe'}
            stroke="#7c3aed" strokeWidth="2" />
          <text x={360} y={86} textAnchor="middle" fontSize="9" fill={step >= 1 ? '#fff' : '#5b21b6'} fontWeight="bold">ŷ</text>
          <text x={360} y={98} textAnchor="middle" fontSize="9" fill={step >= 1 ? '#fff' : '#5b21b6'}>
            {step >= 1 ? fw.a2[0].toFixed(3) : ''}
          </text>
        </g>

        {/* Labels */}
        <text x={60} y={160} textAnchor="middle" fontSize="9" fill="var(--text-muted)">Input</text>
        <text x={204} y={160} textAnchor="middle" fontSize="9" fill="var(--text-muted)">Hidden</text>
        <text x={360} y={160} textAnchor="middle" fontSize="9" fill="var(--text-muted)">Output</text>
      </svg>

      {/* Step display */}
      {curStep && (
        <div style={{ background: 'var(--bg-hover)', borderLeft: `3px solid ${step >= 3 ? '#ef4444' : '#7c3aed'}`, padding: '0.55rem 0.8rem', borderRadius: '0 4px 4px 0', marginBottom: '0.6rem', fontSize: '0.83rem' }}>
          <strong style={{ color: step >= 3 ? '#ef4444' : '#7c3aed' }}>{curStep.title}</strong>
          <pre style={{ marginTop: '0.3rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {curStep.desc(fw, bw, y)}
          </pre>
        </div>
      )}
      {step === -1 && (
        <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Adjust inputs, then step through the forward and backward pass.
        </p>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => setStep(s => Math.max(-1, s - 1))}
          disabled={step <= -1}
          style={{ padding: '0.3rem 0.7rem', fontSize: '0.83rem', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg)', color: 'var(--text)', cursor: step > -1 ? 'pointer' : 'default', opacity: step > -1 ? 1 : 0.4 }}>
          ← Prev
        </button>
        <button
          onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
          disabled={step >= STEPS.length - 1}
          style={{ padding: '0.3rem 0.7rem', fontSize: '0.83rem', border: 'none', borderRadius: 4, background: '#7c3aed', color: '#fff', cursor: step < STEPS.length - 1 ? 'pointer' : 'default', opacity: step < STEPS.length - 1 ? 1 : 0.5 }}>
          Next →
        </button>
        <button
          onClick={() => setStep(-1)}
          style={{ padding: '0.3rem 0.7rem', fontSize: '0.83rem', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer' }}>
          Reset
        </button>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Step {step + 1} / {STEPS.length}
        </span>
      </div>
    </div>
  )
}
