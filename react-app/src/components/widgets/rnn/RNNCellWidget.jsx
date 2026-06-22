import { useState } from 'react'

const COLOR = '#0f766e'
const COLOR_LIGHT = '#ccfbf1'

function tanh(x) { return Math.tanh(x) }
function tanhDeriv(x) { const t = Math.tanh(x); return 1 - t * t }

// Fixed small weights for illustration
const Wh = 0.6, Wx = 0.8, b = 0.1
const Wy = 0.9, by = 0.0

export default function RNNCellWidget() {
  const [xt, setXt] = useState(0.5)
  const [hprev, setHprev] = useState(0.3)

  const z = Wh * hprev + Wx * xt + b
  const ht = tanh(z)
  const yt = tanh(Wy * ht + by)

  // bar helper
  const Bar = ({ value, label, color = COLOR }) => (
    <div style={{ marginBottom: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.15rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <strong style={{ color }}>{value.toFixed(4)}</strong>
      </div>
      <div style={{ height: 8, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.abs(value) * 100}%`, background: value >= 0 ? color : '#ef4444', borderRadius: 4, transition: 'width 0.25s' }} />
      </div>
    </div>
  )

  return (
    <div>
      {/* Sliders */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'flex-start' }}>
        <div>
          <label style={{ fontSize: '0.83rem', display: 'block', marginBottom: '0.2rem', color: 'var(--text-muted)' }}>
            Input x<sub>t</sub>: <strong style={{ color: COLOR }}>{xt.toFixed(2)}</strong>
          </label>
          <input type="range" min="-1" max="1" step="0.05" value={xt}
            onChange={e => setXt(+e.target.value)}
            style={{ width: 140, accentColor: COLOR }} />
        </div>
        <div>
          <label style={{ fontSize: '0.83rem', display: 'block', marginBottom: '0.2rem', color: 'var(--text-muted)' }}>
            Previous state h<sub>t−1</sub>: <strong style={{ color: COLOR }}>{hprev.toFixed(2)}</strong>
          </label>
          <input type="range" min="-1" max="1" step="0.05" value={hprev}
            onChange={e => setHprev(+e.target.value)}
            style={{ width: 140, accentColor: COLOR }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
        {/* SVG diagram */}
        <svg viewBox="0 0 260 220" style={{ width: '100%', maxWidth: 280, fontFamily: 'inherit' }}>
          <defs>
            <marker id="cell-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill={COLOR} />
            </marker>
          </defs>

          {/* h_{t-1} input (left) */}
          <line x1={10} y1={110} x2={68} y2={110} stroke={COLOR} strokeWidth={2} markerEnd="url(#cell-arrow)" />
          <text x={5} y={106} fontSize="10" fill={COLOR} fontWeight="bold">h_{'{'}t-1{'}'}</text>
          <text x={5} y={118} fontSize="9" fill="var(--text-muted)">{hprev.toFixed(2)}</text>

          {/* x_t input (top) */}
          <line x1={130} y1={10} x2={130} y2={68} stroke={COLOR} strokeWidth={2} markerEnd="url(#cell-arrow)" />
          <text x={118} y={8} fontSize="10" fill={COLOR} fontWeight="bold">x_{'{'}t{'}'}</text>
          <text x={118} y={20} fontSize="9" fill="var(--text-muted)">{xt.toFixed(2)}</text>

          {/* linear combination box */}
          <rect x={70} y={70} width={120} height={40} rx={5} fill={COLOR_LIGHT} stroke={COLOR} strokeWidth={1.8} />
          <text x={130} y={87} textAnchor="middle" fontSize="10" fill={COLOR} fontWeight="bold">W_h·h + W_x·x + b</text>
          <text x={130} y={101} textAnchor="middle" fontSize="9" fill={COLOR}>z = {z.toFixed(4)}</text>

          {/* tanh box */}
          <line x1={130} y1={110} x2={130} y2={140} stroke={COLOR} strokeWidth={2} markerEnd="url(#cell-arrow)" />
          <rect x={90} y={140} width={80} height={36} rx={5}
            fill={COLOR} />
          <text x={130} y={156} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">tanh</text>
          <text x={130} y={169} textAnchor="middle" fontSize="9" fill="#ccfbf1">σ' = {tanhDeriv(z).toFixed(3)}</text>

          {/* h_t output (right) */}
          <line x1={210} y1={158} x2={252} y2={158} stroke={COLOR} strokeWidth={2} markerEnd="url(#cell-arrow)" />
          <text x={215} y={150} fontSize="10" fill={COLOR} fontWeight="bold">h_{'{'}t{'}'}</text>
          <text x={215} y={163} fontSize="9" fill="var(--text-muted)">{ht.toFixed(3)}</text>

          {/* y_t output (bottom) */}
          <line x1={130} y1={176} x2={130} y2={210} stroke={COLOR} strokeWidth={2} strokeDasharray="4,2" markerEnd="url(#cell-arrow)" />
          <text x={136} y={208} fontSize="10" fill={COLOR} fontWeight="bold">ŷ_{'{'}t{'}'} = {yt.toFixed(3)}</text>
        </svg>

        {/* Computation breakdown */}
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: COLOR, marginBottom: '0.6rem' }}>
            Step-by-step computation
          </div>
          <div style={{ fontSize: '0.8rem', background: 'var(--bg-hover)', borderRadius: 6, padding: '0.6rem 0.8rem', marginBottom: '0.8rem', fontFamily: 'monospace', lineHeight: 1.7 }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Wh={Wh}, Wx={Wx}, b={b}</span></div>
            <div>z = {Wh}×{hprev.toFixed(2)} + {Wx}×{xt.toFixed(2)} + {b}</div>
            <div style={{ color: COLOR }}>  = <strong>{z.toFixed(4)}</strong></div>
            <div>h<sub>t</sub> = tanh({z.toFixed(4)})</div>
            <div style={{ color: COLOR }}>  = <strong>{ht.toFixed(4)}</strong></div>
            <div>ŷ<sub>t</sub> = tanh({Wy}×{ht.toFixed(3)} + {by})</div>
            <div style={{ color: COLOR }}>  = <strong>{yt.toFixed(4)}</strong></div>
          </div>

          <Bar value={ht} label="h_t (new hidden state)" />
          <Bar value={tanhDeriv(z)} label="tanh'(z) = 1 − h_t² (grad scale)" color="#d97706" />
          <Bar value={yt} label="ŷ_t (output)" />

          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
            When |z| is large, tanh saturates → tanh′ ≈ 0 → gradients vanish. Try pushing h<sub>t−1</sub> and x<sub>t</sub> both to ±1.
          </p>
        </div>
      </div>
    </div>
  )
}
