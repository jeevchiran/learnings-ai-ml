import { useState } from 'react'

const COLOR = '#4338ca'
const BAD = '#dc2626'
const GOOD = '#16a34a'

// Raw product of n likelihoods (~p each) underflows; log-sum stays stable.
export default function LogSpaceWidget() {
  const [n, setN] = useState(400)
  const [p, setP] = useState(0.15)

  const raw = Math.pow(p, n)                 // float64 → 0 below ~1e-308
  const logSum = n * Math.log(p)             // finite, linear in n
  const underflow = raw === 0

  return (
    <div>
      <Slider label="Number of features n" v={n} set={setN} min={10} max={800} step={10} color={COLOR} />
      <Slider label="Per-feature likelihood p" v={p} set={setP} min={0.02} max={0.5} step={0.01} color={COLOR} fixed={2} />

      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
        <Card title="Raw product  ∏ pᵢ" color={underflow ? BAD : COLOR}
          value={underflow ? '0.0  (underflow!)' : raw.toExponential(3)}
          note={underflow ? `p^n dropped below ~1e-308 — float64 rounds it to exactly 0. Two classes both read 0 → tie → useless.` : `still representable… but shrinking ×${p} every feature.`} />
        <Card title="Log-space  Σ log pᵢ" color={GOOD}
          value={logSum.toFixed(2)}
          note={`log(${p})×${n} = ${logSum.toFixed(1)}. A plain finite number at any n — compare these directly, no underflow.`} />
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.7rem' }}>
        Multiplying hundreds of small probabilities collapses to 0 in floating point. Taking logs turns the product into a sum — <code>log(∏pᵢ) = Σ log pᵢ</code> — which stays finite and monotonic, so the arg-max class is unchanged. This is why every real Naive Bayes runs in log-space.
      </p>
    </div>
  )
}

function Card({ title, value, note, color }) {
  return (
    <div style={{ flex: 1, minWidth: 200, border: `1px solid var(--border)`, borderLeft: `3px solid ${color}`, borderRadius: '0 5px 5px 0', padding: '0.6rem 0.8rem', background: 'var(--bg)' }}>
      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{title}</div>
      <div style={{ fontSize: '1.05rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', margin: '0.2rem 0' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{note}</div>
    </div>
  )
}

function Slider({ label, v, set, min, max, step, color, fixed }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.35rem 0', fontSize: '0.82rem' }}>
      <span style={{ width: 170, color: 'var(--text-muted)' }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={v} onChange={e => set(+e.target.value)} style={{ flex: 1, accentColor: color }} />
      <strong style={{ color, width: 44, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fixed ? v.toFixed(fixed) : v}</strong>
    </label>
  )
}
