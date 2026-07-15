import { useState } from 'react'

const COLOR = '#c026d3'
const PASS = '#16a34a'
const FAIL = '#dc2626'

// Model-agnostic filter ranking. Each method scores features differently;
// variance threshold is blind to relevance, correlation/MI rank by target link.
const FEATURES = [
  { name: 'income',        variance: 0.90, corr: 0.72, mi: 0.65 },
  { name: 'debt_ratio',    variance: 0.55, corr: 0.55, mi: 0.50 },
  { name: 'age',           variance: 0.40, corr: 0.30, mi: 0.28 },
  { name: 'zip_code',      variance: 0.85, corr: 0.05, mi: 0.10 },
  { name: 'row_id',        variance: 0.99, corr: 0.02, mi: 0.03 },
  { name: 'is_active_flag', variance: 0.03, corr: 0.00, mi: 0.01 },
]

const METHODS = [
  { key: 'variance', label: 'Variance threshold', note: 'Drops near-constant features. Blind to the target — keeps high-variance noise like zip_code and row_id.' },
  { key: 'corr', label: 'Correlation w/ target', note: 'Ranks by |linear correlation|. Surfaces income & debt_ratio; catches only linear links.' },
  { key: 'mi', label: 'Mutual information', note: 'Ranks by shared information with the target. Captures nonlinear relationships too.' },
]

export default function FilterRankWidget() {
  const [m, setM] = useState('corr')
  const method = METHODS.find(x => x.key === m)
  const thresh = 0.1  // variance threshold to "pass"

  const rows = [...FEATURES].sort((a, b) => b[m] - a[m])
  const passes = f => (m === 'variance' ? f.variance >= thresh : true)

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.7rem', flexWrap: 'wrap' }}>
        {METHODS.map(x => (
          <button key={x.key} onClick={() => setM(x.key)}
            style={{ padding: '0.24rem 0.7rem', borderRadius: 4, fontSize: '0.8rem', cursor: 'pointer', fontWeight: m === x.key ? 700 : 400,
              border: `2px solid ${m === x.key ? COLOR : 'var(--border)'}`, background: m === x.key ? COLOR : 'var(--bg)', color: m === x.key ? '#fff' : 'var(--text)' }}>
            {x.label}
          </button>
        ))}
      </div>

      {rows.map((f, i) => {
        const v = f[m]
        const ok = passes(f)
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.28rem 0', fontSize: '0.82rem' }}>
            <span style={{ width: 100, textAlign: 'right', fontFamily: 'monospace', color: ok ? 'var(--text)' : 'var(--text-muted)', textDecoration: ok ? 'none' : 'line-through' }}>{f.name}</span>
            <div style={{ flex: 1, height: 15, background: 'var(--bg-hover)', borderRadius: 3 }}>
              <div style={{ height: '100%', width: `${v * 100}%`, background: ok ? COLOR : `${FAIL}88`, borderRadius: 3, transition: 'all 0.25s' }} />
            </div>
            <span style={{ width: 34, textAlign: 'right', color: COLOR, fontVariantNumeric: 'tabular-nums' }}>{v.toFixed(2)}</span>
            {m === 'variance' && <span style={{ width: 16, color: ok ? PASS : FAIL }}>{ok ? '✓' : '✕'}</span>}
          </div>
        )
      })}

      <div style={{ marginTop: '0.6rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        <strong style={{ color: COLOR }}>{method.label}:</strong> {method.note}
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        Filter methods rank features once, before any model — cheap and model-agnostic. Note how variance threshold keeps irrelevant high-variance columns; only target-aware scores (correlation, MI) find what actually predicts.
      </p>
    </div>
  )
}
