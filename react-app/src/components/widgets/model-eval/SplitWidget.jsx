import { useState } from 'react'

const TRAIN = '#c026d3'
const VAL = '#2563eb'
const TEST = '#16a34a'

// Train / validation / test ratio visualizer.
export default function SplitWidget() {
  const [train, setTrain] = useState(60)
  const [val, setVal] = useState(20)
  const test = Math.max(0, 100 - train - val)

  const segs = [
    { label: 'Train', pct: train, color: TRAIN, job: 'fit model parameters — seen every epoch' },
    { label: 'Validation', pct: val, color: VAL, job: 'compare models & tune hyperparameters' },
    { label: 'Test', pct: test, color: TEST, job: 'one final honest score — touched exactly once' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', height: 44, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {segs.map((s, i) => (
          <div key={i} style={{ width: `${s.pct}%`, background: s.color, transition: 'width 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.78rem', fontWeight: 600, minWidth: s.pct > 0 ? 2 : 0 }}>
            {s.pct >= 8 ? `${s.label} ${s.pct}%` : ''}
          </div>
        ))}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', margin: '0.5rem 0 0.2rem' }}>
        <span style={{ width: 84, color: TRAIN }}>Train</span>
        <input type="range" min={40} max={90} value={train} onChange={e => setTrain(Math.min(+e.target.value, 100 - val))} style={{ flex: 1, accentColor: TRAIN }} />
        <strong style={{ width: 40, textAlign: 'right' }}>{train}%</strong>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', margin: '0.2rem 0' }}>
        <span style={{ width: 84, color: VAL }}>Validation</span>
        <input type="range" min={5} max={40} value={val} onChange={e => setVal(Math.min(+e.target.value, 100 - train))} style={{ flex: 1, accentColor: VAL }} />
        <strong style={{ width: 40, textAlign: 'right' }}>{val}%</strong>
      </label>

      <div style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
        {segs.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', margin: '0.15rem 0' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, marginTop: 4, flexShrink: 0 }} />
            <span><strong style={{ color: s.color }}>{s.label} ({s.pct}%)</strong> — {s.job}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        The moment you use the <span style={{ color: TEST }}>test</span> score to pick a model or tune a knob, it stops being honest — you've started fitting to it. Every decision goes through <span style={{ color: VAL }}>validation</span>.
      </p>
    </div>
  )
}
