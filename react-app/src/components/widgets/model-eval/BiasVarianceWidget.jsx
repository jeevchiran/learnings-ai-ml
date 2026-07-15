import { useState } from 'react'

const COLOR = '#c026d3'
const BIAS = '#2563eb'
const VAR = '#ea580c'
const TOTAL = '#c026d3'
const NOISE = '#6b7280'

// Complexity 1..10. bias² falls, variance rises, total = bias²+var+noise is U-shaped.
export default function BiasVarianceWidget() {
  const [c, setC] = useState(3)
  const W = 440, H = 250, pad = 40
  const noise = 0.6
  const bias2 = x => 9 / (x * x)            // falls fast
  const varc = x => 0.09 * x * x            // rises
  const total = x => bias2(x) + varc(x) + noise

  // find sweet spot (min total over 1..10 grid)
  let best = 1, bestV = Infinity
  for (let x = 1; x <= 10; x += 0.1) { if (total(x) < bestV) { bestV = total(x); best = x } }

  const maxY = total(1)
  const sx = x => pad + ((x - 1) / 9) * (W - 2 * pad)
  const sy = v => H - pad - (v / maxY) * (H - 2 * pad)
  const curve = f => Array.from({ length: 91 }, (_, i) => { const x = 1 + i / 10; return `${sx(x)},${sy(f(x))}` }).join(' ')

  const zone = c < best - 1 ? 'Underfit' : c > best + 1 ? 'Overfit' : 'Good fit'

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block', minWidth: 320 }}>
          {/* sweet-spot band */}
          <rect x={sx(best - 0.7)} y={pad} width={sx(best + 0.7) - sx(best - 0.7)} height={H - 2 * pad} fill={`${COLOR}14`} />
          <line x1={sx(best)} y1={pad} x2={sx(best)} y2={H - pad} stroke={COLOR} strokeWidth={1} strokeDasharray="4,3" />
          {/* axes */}
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--border)" />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="var(--border)" />
          {/* curves */}
          <polyline points={curve(bias2)} fill="none" stroke={BIAS} strokeWidth={2} />
          <polyline points={curve(varc)} fill="none" stroke={VAR} strokeWidth={2} />
          <polyline points={curve(total)} fill="none" stroke={TOTAL} strokeWidth={2.5} />
          <line x1={pad} y1={sy(noise)} x2={W - pad} y2={sy(noise)} stroke={NOISE} strokeWidth={1} strokeDasharray="2,3" />
          {/* current complexity marker */}
          <circle cx={sx(c)} cy={sy(total(c))} r={5} fill={TOTAL} stroke="var(--bg)" strokeWidth={1.5} />
          <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--text-muted)">model complexity →</text>
          <text x={12} y={H / 2} textAnchor="middle" fontSize="10" fill="var(--text-muted)" transform={`rotate(-90 12 ${H / 2})`}>expected error →</text>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.74rem', flexWrap: 'wrap', margin: '0.3rem 0' }}>
        <span style={{ color: BIAS }}>▬ bias²</span>
        <span style={{ color: VAR }}>▬ variance</span>
        <span style={{ color: TOTAL }}>▬ total error</span>
        <span style={{ color: NOISE }}>╌ irreducible noise</span>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', margin: '0.3rem 0' }}>
        <span style={{ color: 'var(--text-muted)' }}>Complexity</span>
        <input type="range" min={1} max={10} step={0.5} value={c} onChange={e => setC(+e.target.value)} style={{ flex: 1, accentColor: COLOR }} />
        <strong style={{ color: zone === 'Good fit' ? '#16a34a' : COLOR, width: 74, textAlign: 'right' }}>{zone}</strong>
      </label>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        Total error = bias² + variance + noise. Push complexity down and bias dominates (underfit); push it up and variance dominates (overfit). The minimum of the U — not either term alone — is the target.
      </p>
    </div>
  )
}
