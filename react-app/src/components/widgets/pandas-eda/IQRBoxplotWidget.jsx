import { useState } from 'react'

const COLOR = '#f97316'
const OUT = '#dc2626'

// Fixed taxi-fare-like sample with a couple of extreme values.
const DATA = [4.5, 5.0, 6.2, 6.8, 7.1, 7.5, 8.0, 8.4, 9.0, 9.6, 10.2, 11.0, 12.5, 18.0, 42.0]

function quantile(sorted, q) {
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos), hi = Math.ceil(pos)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

export default function IQRBoxplotWidget() {
  const [k, setK] = useState(1.5)
  const s = [...DATA].sort((a, b) => a - b)
  const q1 = quantile(s, 0.25), q3 = quantile(s, 0.75), iqr = q3 - q1
  const lo = q1 - k * iqr, hi = q3 + k * iqr
  const inliers = s.filter(v => v >= lo && v <= hi)
  const outliers = s.filter(v => v < lo || v > hi)
  const whiskLo = Math.min(...inliers), whiskHi = Math.max(...inliers)

  const W = 460, H = 130, pad = 30
  const min = 0, max = 45
  const sx = v => pad + ((v - min) / (max - min)) * (W - 2 * pad)

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block', minWidth: 340 }}>
          {/* fences */}
          {[lo, hi].map((f, i) => f >= min && f <= max && (
            <g key={i}>
              <line x1={sx(f)} y1={20} x2={sx(f)} y2={H - 30} stroke={OUT} strokeWidth={1.2} strokeDasharray="4,3" />
              <text x={sx(f)} y={16} textAnchor="middle" fontSize="9" fill={OUT}>{f.toFixed(1)}</text>
            </g>
          ))}
          {/* whiskers */}
          <line x1={sx(whiskLo)} y1={H/2} x2={sx(q1)} y2={H/2} stroke={COLOR} strokeWidth={1.5} />
          <line x1={sx(q3)} y1={H/2} x2={sx(whiskHi)} y2={H/2} stroke={COLOR} strokeWidth={1.5} />
          {/* box */}
          <rect x={sx(q1)} y={H/2 - 18} width={sx(q3) - sx(q1)} height={36} fill={`${COLOR}33`} stroke={COLOR} strokeWidth={1.5} />
          <line x1={sx(quantile(s, 0.5))} y1={H/2 - 18} x2={sx(quantile(s, 0.5))} y2={H/2 + 18} stroke={COLOR} strokeWidth={2} />
          {/* points */}
          {inliers.map((v, i) => <circle key={'i'+i} cx={sx(v)} cy={H/2 + 30} r={3} fill={COLOR} opacity={0.7} />)}
          {outliers.map((v, i) => <circle key={'o'+i} cx={sx(v)} cy={H/2 + 30} r={4} fill={OUT} />)}
          {/* axis labels */}
          <text x={sx(q1)} y={H - 14} textAnchor="middle" fontSize="9" fill="var(--text-muted)">Q1 {q1.toFixed(1)}</text>
          <text x={sx(q3)} y={H - 14} textAnchor="middle" fontSize="9" fill="var(--text-muted)">Q3 {q3.toFixed(1)}</text>
        </svg>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', margin: '0.3rem 0' }}>
        <span style={{ color: 'var(--text-muted)' }}>Fence multiplier k</span>
        <input type="range" min={0.5} max={3} step={0.1} value={k} onChange={e => setK(+e.target.value)} style={{ flex: 1, accentColor: COLOR }} />
        <strong style={{ color: COLOR, width: 32, textAlign: 'right' }}>{k.toFixed(1)}</strong>
      </label>

      <div style={{ marginTop: '0.4rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        IQR = Q3 − Q1 = {iqr.toFixed(1)}. Fences [{lo.toFixed(1)}, {hi.toFixed(1)}] flag <strong style={{ color: OUT }}>{outliers.length} outlier{outliers.length !== 1 ? 's' : ''}</strong>: {outliers.map(v => v.toFixed(1)).join(', ') || 'none'}.
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        k = 1.5 is Tukey's standard fence. Lower k flags more points as outliers; raise it and even the \$42 fare looks normal — the threshold is a choice, not a fact.
      </p>
    </div>
  )
}
