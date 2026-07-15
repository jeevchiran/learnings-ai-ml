import { useState } from 'react'

const COLOR = '#f97316'
const MEAN = '#dc2626'
const MEDIAN = '#2563eb'

// Three fixed shapes; bin heights over bins centered at 1..12.
const SHAPES = {
  right: { label: 'Right-skewed', bins: [2, 9, 14, 12, 8, 5, 3, 2, 1, 1, 1, 1], note: 'Long right tail (e.g. income, fares). Mean is pulled right, above the median.' },
  symmetric: { label: 'Symmetric', bins: [1, 3, 6, 10, 13, 14, 14, 13, 10, 6, 3, 1], note: 'Bell-shaped. Mean ≈ median — no tail pulling either way.' },
  left: { label: 'Left-skewed', bins: [1, 1, 1, 1, 2, 3, 5, 8, 12, 14, 9, 2], note: 'Long left tail (e.g. exam scores near a ceiling). Mean is pulled left, below the median.' },
}

function stats(bins) {
  const centers = bins.map((_, i) => i + 1)
  const n = bins.reduce((a, b) => a + b, 0)
  const mean = centers.reduce((a, c, i) => a + c * bins[i], 0) / n
  let cum = 0, median = 1
  for (let i = 0; i < bins.length; i++) { cum += bins[i]; if (cum >= n / 2) { median = i + 1; break } }
  return { mean, median }
}

export default function HistogramSkewWidget() {
  const [shape, setShape] = useState('right')
  const s = SHAPES[shape]
  const { mean, median } = stats(s.bins)
  const W = 440, H = 180, pad = 24
  const maxH = Math.max(...s.bins)
  const bw = (W - 2 * pad) / s.bins.length
  const sx = c => pad + (c - 0.5) * bw
  const sy = h => H - pad - (h / maxH) * (H - 2 * pad)

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.7rem', flexWrap: 'wrap' }}>
        {Object.entries(SHAPES).map(([k, v]) => (
          <button key={k} onClick={() => setShape(k)}
            style={{ padding: '0.24rem 0.7rem', borderRadius: 4, fontSize: '0.8rem', cursor: 'pointer', fontWeight: shape === k ? 700 : 400,
              border: `2px solid ${shape === k ? COLOR : 'var(--border)'}`, background: shape === k ? COLOR : 'var(--bg)', color: shape === k ? '#fff' : 'var(--text)' }}>
            {v.label}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block', minWidth: 340 }}>
          {s.bins.map((h, i) => (
            <rect key={i} x={pad + i * bw + 1} y={sy(h)} width={bw - 2} height={H - pad - sy(h)} fill={`${COLOR}bb`} rx={2} style={{ transition: 'all 0.3s' }} />
          ))}
          {/* mean & median lines */}
          <line x1={sx(mean)} y1={4} x2={sx(mean)} y2={H - pad} stroke={MEAN} strokeWidth={2} />
          <text x={sx(mean)} y={14} textAnchor="middle" fontSize="9" fill={MEAN}>mean {mean.toFixed(1)}</text>
          <line x1={sx(median)} y1={4} x2={sx(median)} y2={H - pad} stroke={MEDIAN} strokeWidth={2} strokeDasharray="4,3" />
          <text x={sx(median)} y={H - pad + 14} textAnchor="middle" fontSize="9" fill={MEDIAN}>median {median}</text>
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--border)" />
        </svg>
      </div>

      <div style={{ marginTop: '0.4rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        <strong style={{ color: COLOR }}>{s.label}:</strong> {s.note}
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        The <span style={{ color: MEAN }}>mean</span> chases the tail; the <span style={{ color: MEDIAN }}>median</span> stays central. Their gap is a quick skew detector — mean {'>'} median means right skew.
      </p>
    </div>
  )
}
