import { useState } from 'react'

const COLOR = '#0f766e'
const MLP = '#dc2626'

// RNN reuses one weight set across all T steps; an MLP over the flattened
// sequence needs parameters that grow with T.
export default function SharedWeightsWidget() {
  const [T, setT] = useState(6)
  const H = 8, D = 4  // hidden size, input dim (toy)

  // RNN params: W_x (H×D) + W_h (H×H) + b (H) — constant in T
  const rnnParams = H * D + H * H + H
  // MLP over flattened T·D input to H hidden: (T·D)·H + H — grows with T
  const mlpParams = T * D * H + H
  const max = Math.max(rnnParams, mlpParams)

  const bar = (label, val, color) => (
    <div style={{ margin: '0.35rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 2 }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <strong style={{ color, fontVariantNumeric: 'tabular-nums' }}>{val} params</strong>
      </div>
      <div style={{ height: 18, background: 'var(--bg-hover)', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${(val / max) * 100}%`, background: color, borderRadius: 3, transition: 'width 0.25s' }} />
      </div>
    </div>
  )

  return (
    <div>
      {/* unfolded cells sharing one W */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
        {Array.from({ length: T }, (_, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 34, height: 34, borderRadius: 6, background: `${COLOR}22`, border: `1.5px solid ${COLOR}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', color: COLOR, fontWeight: 700 }}>W</span>
            {i < T - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
          </span>
        ))}
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 6 }}>same W at every step</span>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', marginBottom: '0.7rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>Sequence length T</span>
        <input type="range" min={2} max={20} value={T} onChange={e => setT(+e.target.value)} style={{ flex: 1, accentColor: COLOR }} />
        <strong style={{ color: COLOR, width: 24, textAlign: 'right' }}>{T}</strong>
      </label>

      {bar('RNN — shared weights (W_x, W_h, b)', rnnParams, COLOR)}
      {bar(`MLP over flattened length-${T} input`, mlpParams, MLP)}

      <div style={{ marginTop: '0.6rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        The RNN's parameter count stays <strong style={{ color: COLOR }}>fixed at {rnnParams}</strong> no matter how long the sequence — it applies the <em>same</em> W at every step. The MLP grows to <strong style={{ color: MLP }}>{mlpParams}</strong> and can only accept one fixed length.
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        Weight sharing is what lets one RNN handle a 5-word tweet and a 500-word review with the same parameters — and generalize a pattern learned at step 3 to step 300.
      </p>
    </div>
  )
}
