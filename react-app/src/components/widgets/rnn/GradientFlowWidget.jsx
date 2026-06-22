import { useState } from 'react'

const COLOR = '#0f766e'

const MODES = [
  {
    label: 'Vanishing',
    desc: 'Each step multiplies by ≈0.15. After 10 steps, gradient ≈ 0.',
    factor: 0.15,
    color: '#ef4444',
  },
  {
    label: 'Healthy',
    desc: 'Each step multiplies by ≈0.85. Gradient stays meaningful.',
    factor: 0.85,
    color: COLOR,
  },
  {
    label: 'Exploding',
    desc: 'Each step multiplies by ≈1.5. After 10 steps, gradient blows up.',
    factor: 1.5,
    color: '#f59e0b',
  },
]

export default function GradientFlowWidget() {
  const [T, setT] = useState(10)
  const [mode, setMode] = useState(1)
  const [showClip, setShowClip] = useState(false)
  const CLIP = 1.0

  const { factor, color, desc } = MODES[mode]

  // gradient at each time step (going backward from T)
  const grads = Array.from({ length: T }, (_, i) => {
    let g = Math.pow(factor, T - i - 1)
    if (showClip && mode === 2) g = Math.min(g, CLIP)
    return g
  })

  const maxGrad = Math.max(...grads, 0.001)
  const barW = 30
  const barGap = 8
  const maxBarH = 120
  const svgW = T * (barW + barGap) + 60
  const svgH = maxBarH + 80

  const barColor = (g) => {
    if (g < 0.01) return '#ef444488'
    if (g > 2) return '#f59e0b88'
    return `${color}cc`
  }

  return (
    <div>
      {/* Mode selector */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.8rem', alignItems: 'center' }}>
        {MODES.map((m, i) => (
          <button key={i} onClick={() => setMode(i)}
            style={{ padding: '0.25rem 0.7rem', borderRadius: 4, border: `2px solid ${i === mode ? m.color : 'var(--border)'}`, background: i === mode ? m.color : 'var(--bg)', color: i === mode ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: i === mode ? 700 : 400 }}>
            {m.label}
          </button>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', marginLeft: 'auto' }}>
          <input type="checkbox" checked={showClip} onChange={e => setShowClip(e.target.checked)} />
          Gradient clipping (threshold={CLIP})
        </label>
      </div>

      {/* T slider */}
      <label style={{ fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>Time steps T:</span>
        <input type="range" min="3" max="15" value={T} onChange={e => setT(+e.target.value)} style={{ width: 120, accentColor: color }} />
        <strong style={{ color }}>{T}</strong>
      </label>

      {/* Bar chart SVG */}
      <div style={{ overflowX: 'auto' }}>
        <svg width={svgW} height={svgH} style={{ display: 'block', minWidth: 200 }}>
          {/* Y axis */}
          <line x1={40} y1={10} x2={40} y2={maxBarH + 20} stroke="var(--border)" strokeWidth={1} />
          <text x={38} y={14} textAnchor="end" fontSize="9" fill="var(--text-muted)">
            {maxGrad > 2 ? maxGrad.toFixed(1) : maxGrad.toFixed(3)}
          </text>
          <text x={38} y={maxBarH + 20} textAnchor="end" fontSize="9" fill="var(--text-muted)">0</text>

          {/* Clip line */}
          {showClip && mode === 2 && (
            <g>
              <line x1={40} y1={maxBarH + 20 - (CLIP / maxGrad) * maxBarH} x2={svgW - 10} y2={maxBarH + 20 - (CLIP / maxGrad) * maxBarH}
                stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5,3" />
              <text x={svgW - 8} y={maxBarH + 20 - (CLIP / maxGrad) * maxBarH - 3} fontSize="9" fill="#ef4444" textAnchor="end">clip={CLIP}</text>
            </g>
          )}

          {grads.map((g, i) => {
            const h = Math.min((g / maxGrad) * maxBarH, maxBarH)
            const x = 48 + i * (barW + barGap)
            const y = maxBarH + 20 - h
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={h} rx={3}
                  fill={barColor(g)}
                  style={{ transition: 'all 0.3s' }} />
                <text x={x + barW / 2} y={maxBarH + 34} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
                  t={T - i}
                </text>
                <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize="8" fill={color}>
                  {g > 10 ? g.toFixed(0) : g < 0.001 ? '~0' : g.toFixed(3)}
                </text>
              </g>
            )
          })}

          {/* X axis label */}
          <text x={svgW / 2} y={svgH - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
            ← gradient flows from t=T back to t=1
          </text>
        </svg>
      </div>

      {/* Info box */}
      <div style={{ marginTop: '0.6rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${color}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        <strong style={{ color }}>{MODES[mode].label}:</strong> {desc}
        {showClip && mode === 2 && (
          <span style={{ color: '#ef4444' }}> Clipping keeps gradient ≤ {CLIP} — prevents blow-up but doesn't fix vanishing.</span>
        )}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Each bar = gradient magnitude at that time step. In a plain RNN, |∂h<sub>t</sub>/∂h<sub>t-1</sub>| ≈ |W<sub>h</sub> × tanh′| — multiplied T times in the chain rule.
      </p>
    </div>
  )
}
