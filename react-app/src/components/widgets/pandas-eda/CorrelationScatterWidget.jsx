import { useState, useMemo } from 'react'

const COLOR = '#f97316'

// fixed standard-normal-ish pairs (x, independent noise) so the cloud is stable
const BASE = Array.from({ length: 60 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453
  const b = Math.sin(i * 78.233) * 43758.5453
  const u = a - Math.floor(a), v = b - Math.floor(b)
  // Box-Muller → two ~N(0,1)
  const z1 = Math.sqrt(-2 * Math.log(u + 1e-9)) * Math.cos(2 * Math.PI * v)
  const z2 = Math.sqrt(-2 * Math.log(u + 1e-9)) * Math.sin(2 * Math.PI * v)
  return [z1, z2]
})

export default function CorrelationScatterWidget() {
  const [r, setR] = useState(0.7)
  const W = 300, H = 220, pad = 24

  const pts = useMemo(() => BASE.map(([x, e]) => {
    const y = r * x + Math.sqrt(Math.max(0, 1 - r * r)) * e
    return [x, y]
  }), [r])

  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
  const ext = 3
  const sx = x => pad + ((x + ext) / (2 * ext)) * (W - 2 * pad)
  const sy = y => H - pad - ((y + ext) / (2 * ext)) * (H - 2 * pad)

  // regression line y = r*x (standardized)
  const strength = Math.abs(r) < 0.3 ? 'weak' : Math.abs(r) < 0.7 ? 'moderate' : 'strong'
  const dir = r > 0.05 ? 'positive' : r < -0.05 ? 'negative' : 'no'

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <svg width={W} height={H} style={{ border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', flexShrink: 0 }}>
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--border)" />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="var(--border)" />
          {Math.abs(r) > 0.05 && (
            <line x1={sx(-ext)} y1={sy(r * -ext)} x2={sx(ext)} y2={sy(r * ext)} stroke={COLOR} strokeWidth={2} opacity={0.7} />
          )}
          {pts.map(([x, y], i) => <circle key={i} cx={sx(x)} cy={sy(y)} r={3} fill={COLOR} opacity={0.6} />)}
          <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--text-muted)">feature x →</text>
        </svg>

        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Correlation r</span>
            <input type="range" min={-1} max={1} step={0.05} value={r} onChange={e => setR(+e.target.value)} style={{ flex: 1, accentColor: COLOR }} />
            <strong style={{ color: COLOR, width: 42, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.toFixed(2)}</strong>
          </label>
          <div style={{ background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
            <strong style={{ color: COLOR }}>{strength} {dir} correlation.</strong> r near ±1 = a tight line; r near 0 = a shapeless cloud.
          </div>
        </div>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Pearson r measures only the <em>linear</em> tie. A U-shaped or capped relationship can have r ≈ 0 while being highly dependent — always look at the scatter, not just the number.
      </p>
    </div>
  )
}
