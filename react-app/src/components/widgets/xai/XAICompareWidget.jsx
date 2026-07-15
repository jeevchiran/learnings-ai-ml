import { useState } from 'react'

const COLOR = '#ca8a04'
const AXES = ['Speed', 'Fidelity', 'Consistency', 'Generality']

// scores 1-5 on each axis + metadata
const METHODS = [
  { name: 'LIME', scores: [3, 3, 2, 5], scope: 'Local', access: 'Model-agnostic',
    note: 'Fits a local linear surrogate on perturbations. Works on any model, but explanations can be unstable — re-run and they wobble.' },
  { name: 'Kernel SHAP', scores: [1, 4, 5, 5], scope: 'Local', access: 'Model-agnostic',
    note: 'Shapley values via weighted linear regression. Strong theory (consistency), but slow — cost grows with features and samples.' },
  { name: 'Tree SHAP', scores: [5, 5, 5, 2], scope: 'Local+Global', access: 'Trees only',
    note: 'Exact Shapley values for tree ensembles in polynomial time. Fast and exact — but only for tree models (XGBoost, RF, LightGBM).' },
  { name: 'DeepLIFT', scores: [4, 4, 3, 2], scope: 'Local', access: 'Neural nets',
    note: 'Backpropagates contributions against a reference input. Fast for deep nets; attribution depends on the chosen reference/baseline.' },
  { name: 'Integrated Gradients', scores: [3, 4, 4, 2], scope: 'Local', access: 'Differentiable',
    note: 'Integrates gradients along a path from baseline to input. Satisfies nice axioms; needs a differentiable model and a baseline.' },
]

export default function XAICompareWidget() {
  const [sel, setSel] = useState(1)
  const m = METHODS[sel]
  const R = 78, cx = 100, cy = 92
  const pt = (i, r) => {
    const ang = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
    return [cx + Math.cos(ang) * r * (R / 5), cy + Math.sin(ang) * r * (R / 5)]
  }
  const poly = m.scores.map((s, i) => pt(i, s).join(',')).join(' ')

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
        {METHODS.map((mm, i) => (
          <button key={i} onClick={() => setSel(i)}
            style={{ padding: '0.24rem 0.7rem', borderRadius: 4, fontSize: '0.8rem', cursor: 'pointer', fontWeight: sel === i ? 700 : 400,
              border: `2px solid ${sel === i ? COLOR : 'var(--border)'}`, background: sel === i ? COLOR : 'var(--bg)', color: sel === i ? '#fff' : 'var(--text)' }}>
            {mm.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <svg width={200} height={190} style={{ flexShrink: 0 }}>
          {[1, 2, 3, 4, 5].map(r => (
            <polygon key={r} points={AXES.map((_, i) => pt(i, r).join(',')).join(' ')}
              fill="none" stroke="var(--border)" strokeWidth={0.5} />
          ))}
          {AXES.map((a, i) => {
            const [x, y] = pt(i, 6)
            return <text key={i} x={x} y={y} textAnchor="middle" fontSize="9" fill="var(--text-muted)" dominantBaseline="middle">{a}</text>
          })}
          <polygon points={poly} fill={`${COLOR}44`} stroke={COLOR} strokeWidth={2} style={{ transition: 'all 0.3s' }} />
          {m.scores.map((s, i) => { const [x, y] = pt(i, s); return <circle key={i} cx={x} cy={y} r={3} fill={COLOR} /> })}
        </svg>

        <div style={{ flex: 1, minWidth: 200, fontSize: '0.83rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <Tag label={m.scope} />
            <Tag label={m.access} />
          </div>
          {AXES.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.2rem 0' }}>
              <span style={{ width: 84, color: 'var(--text-muted)', fontSize: '0.78rem' }}>{a}</span>
              <div style={{ flex: 1, height: 10, background: 'var(--bg-hover)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${(m.scores[i] / 5) * 100}%`, background: COLOR, borderRadius: 3, transition: 'all 0.3s' }} />
              </div>
              <span style={{ width: 20, textAlign: 'right', color: COLOR, fontWeight: 600 }}>{m.scores[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '0.7rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        <strong style={{ color: COLOR }}>{m.name}:</strong> {m.note}
      </div>
    </div>
  )
}

function Tag({ label }) {
  return <span style={{ fontSize: '0.72rem', padding: '0.12rem 0.5rem', borderRadius: 10, background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{label}</span>
}
