import { useState } from 'react'

const COLOR = '#f97316'
const NA = '#9ca3af'
const FILL = '#16a34a'

// A fare column with two missing entries.
const RAW = [7.5, null, 8.0, 9.6, null, 11.0, 42.0, 8.4]

const STRATEGIES = [
  { key: 'drop', label: 'dropna', note: 'Delete rows with NaN. Safe, but loses data — bad if many rows are missing.' },
  { key: 'mean', label: 'fillna(mean)', note: 'Fill with the column mean. The $42 outlier drags the mean up, distorting fills.' },
  { key: 'median', label: 'fillna(median)', note: 'Fill with the median. Robust to the outlier — usually the better default.' },
  { key: 'ffill', label: 'ffill', note: 'Carry the previous value forward. Good for ordered/time-series data.' },
  { key: 'zero', label: 'fillna(0)', note: 'Fill with 0. Rarely right — implies "a $0 fare", which biases everything.' },
]

export default function MissingValueWidget() {
  const [strat, setStrat] = useState('median')
  const known = RAW.filter(v => v !== null)
  const mean = known.reduce((a, b) => a + b, 0) / known.length
  const sorted = [...known].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]

  const apply = () => {
    if (strat === 'drop') return RAW.map(v => v)
    let prev = known[0]
    return RAW.map(v => {
      if (v !== null) { prev = v; return v }
      if (strat === 'mean') return mean
      if (strat === 'median') return median
      if (strat === 'ffill') return prev
      return 0
    })
  }
  const filled = apply()
  const s = STRATEGIES.find(x => x.key === strat)
  const resultVals = strat === 'drop' ? known : filled
  const newMean = resultVals.reduce((a, b) => a + b, 0) / resultVals.length

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.7rem', flexWrap: 'wrap' }}>
        {STRATEGIES.map(x => (
          <button key={x.key} onClick={() => setStrat(x.key)}
            style={{ padding: '0.22rem 0.6rem', borderRadius: 4, fontSize: '0.76rem', fontFamily: 'monospace', cursor: 'pointer', fontWeight: strat === x.key ? 700 : 400,
              border: `2px solid ${strat === x.key ? COLOR : 'var(--border)'}`, background: strat === x.key ? COLOR : 'var(--bg)', color: strat === x.key ? '#fff' : 'var(--text)' }}>
            {x.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontSize: '0.8rem' }}>
        {RAW.map((v, i) => {
          const dropped = strat === 'drop' && v === null
          const wasNa = v === null
          const shown = dropped ? '—' : (filled[i] === null ? 'NaN' : (Number.isInteger(filled[i]) ? filled[i] : filled[i].toFixed(1)))
          return (
            <div key={i} style={{ minWidth: 42, textAlign: 'center', padding: '0.3rem 0.2rem', borderRadius: 4, fontVariantNumeric: 'tabular-nums',
              background: dropped ? 'transparent' : wasNa ? `${FILL}22` : 'var(--bg-hover)',
              border: `1px solid ${wasNa && !dropped ? FILL : 'var(--border)'}`,
              color: dropped ? NA : wasNa ? FILL : 'var(--text)', textDecoration: dropped ? 'line-through' : 'none', fontWeight: wasNa && !dropped ? 700 : 400 }}>
              {shown}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '0.7rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        <strong style={{ color: COLOR, fontFamily: 'monospace' }}>{s.label}</strong> — {s.note}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Resulting mean: <strong>{newMean.toFixed(2)}</strong> &nbsp;(mean of known = {mean.toFixed(2)}, median = {median})
        </div>
      </div>
    </div>
  )
}
