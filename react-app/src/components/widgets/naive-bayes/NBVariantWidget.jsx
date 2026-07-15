import { useState } from 'react'

const COLOR = '#4338ca'
const A = '#4338ca', B = '#ea580c'

const VARIANTS = [
  { key: 'multinomial', label: 'Multinomial', feat: 'word counts', use: 'Text with term frequencies. Feature = how many times a word occurs.' },
  { key: 'bernoulli', label: 'Bernoulli', feat: 'presence / absence', use: 'Binary features. Feature = does the word occur at all (1/0), counts ignored.' },
  { key: 'gaussian', label: 'Gaussian', feat: 'continuous value', use: 'Real-valued features. Each class fits a bell curve (mean, variance) per feature.' },
]

export default function NBVariantWidget() {
  const [v, setV] = useState('gaussian')
  const [x, setX] = useState(5)          // gaussian test value
  const cur = VARIANTS.find(t => t.key === v)

  const gauss = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI))

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
        {VARIANTS.map(t => (
          <button key={t.key} onClick={() => setV(t.key)}
            style={{ padding: '0.26rem 0.8rem', borderRadius: 4, fontSize: '0.82rem', cursor: 'pointer', fontWeight: v === t.key ? 700 : 400,
              border: `2px solid ${v === t.key ? COLOR : 'var(--border)'}`, background: v === t.key ? COLOR : 'var(--bg)', color: v === t.key ? '#fff' : 'var(--text)' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        {v === 'multinomial' && <CountBars mode="count" />}
        {v === 'bernoulli' && <CountBars mode="binary" />}
        {v === 'gaussian' && (
          <svg width={360} height={150} style={{ display: 'block' }}>
            {[{ mu: 4, s: 1.2, c: A, name: 'spam' }, { mu: 7, s: 1.5, c: B, name: 'ham' }].map((g, i) => {
              const pts = Array.from({ length: 61 }, (_, k) => {
                const xx = k / 60 * 12
                return `${20 + xx * 28},${130 - gauss(xx, g.mu, g.s) * 320}`
              }).join(' ')
              return <polyline key={i} points={pts} fill="none" stroke={g.c} strokeWidth={2} />
            })}
            {/* test value line */}
            <line x1={20 + x * 28} y1={10} x2={20 + x * 28} y2={130} stroke="var(--text)" strokeWidth={1.5} strokeDasharray="4,3" />
            <text x={20 + x * 28} y={145} textAnchor="middle" fontSize="10" fill="var(--text)">x = {x.toFixed(1)}</text>
            <text x={20 + 4 * 28} y={22} textAnchor="middle" fontSize="10" fill={A}>spam</text>
            <text x={20 + 7 * 28} y={22} textAnchor="middle" fontSize="10" fill={B}>ham</text>
          </svg>
        )}
      </div>

      {v === 'gaussian' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.3rem 0', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Test value x</span>
          <input type="range" min={0} max={12} step={0.1} value={x} onChange={e => setX(+e.target.value)} style={{ flex: 1, accentColor: COLOR }} />
          <strong style={{ color: gauss(x, 4, 1.2) > gauss(x, 7, 1.5) ? A : B }}>
            → {gauss(x, 4, 1.2) > gauss(x, 7, 1.5) ? 'spam' : 'ham'}
          </strong>
        </label>
      )}

      <div style={{ marginTop: '0.5rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        <strong style={{ color: COLOR }}>{cur.label}</strong> — feature = <em>{cur.feat}</em>. {cur.use}
      </div>
    </div>
  )
}

function CountBars({ mode }) {
  const words = [{ w: 'free', n: 3 }, { w: 'money', n: 2 }, { w: 'meeting', n: 0 }, { w: 'win', n: 1 }]
  return (
    <svg width={360} height={140} style={{ display: 'block' }}>
      {words.map((d, i) => {
        const val = mode === 'binary' ? (d.n > 0 ? 1 : 0) : d.n
        const h = val * (mode === 'binary' ? 60 : 26)
        return (
          <g key={i}>
            <rect x={40 + i * 78} y={110 - h} width={46} height={h} rx={3} fill={val ? A : 'var(--border)'} style={{ transition: 'all 0.25s' }} />
            <text x={63 + i * 78} y={105 - h} textAnchor="middle" fontSize="10" fill="var(--text)">{mode === 'binary' ? (val ? 'present' : 'absent') : `×${d.n}`}</text>
            <text x={63 + i * 78} y={128} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{d.w}</text>
          </g>
        )
      })}
    </svg>
  )
}
