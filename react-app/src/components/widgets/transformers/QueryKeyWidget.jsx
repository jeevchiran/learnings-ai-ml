import { useState } from 'react'
import { Row, Btn, Toggle } from '../shared/ui.jsx'
import { TOKENS, Q, K, rawScores } from './attentionData.js'

const COLOR = '#1e3a8a'

export default function QueryKeyWidget() {
  const [i, setI] = useState(3) // "creature"
  const [causal, setCausal] = useState(true)

  const scores = rawScores(i, causal)
  const finite = scores.filter(Number.isFinite)
  const max = finite.length ? Math.max(...finite) : 1

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        {TOKENS.map((t, idx) => (
          <Btn key={t} onClick={() => setI(idx)} primary={i === idx}>{t}</Btn>
        ))}
      </Row>
      <Toggle label="causal mask (can only look left)" on={causal} onChange={setCausal} />

      <p style={{ fontSize: '0.82rem', margin: '0.5rem 0' }}>
        Query for "<strong style={{ color: COLOR }}>{TOKENS[i]}</strong>": [{Q[TOKENS[i]].map(v => v.toFixed(2)).join(', ')}]
      </p>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 110, overflowX: 'auto' }}>
        {TOKENS.map((t, j) => {
          const s = scores[j]
          const masked = !Number.isFinite(s)
          const h = masked ? 4 : Math.max(4, (s / max) * 90)
          return (
            <div key={t} style={{ textAlign: 'center', minWidth: 44 }}>
              <div style={{ height: 90, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{
                  width: 28, height: h,
                  background: masked ? 'var(--border)' : (j === i ? '#93c5fd' : COLOR),
                  borderRadius: '3px 3px 0 0', transition: 'height .2s',
                }} />
              </div>
              <div style={{ fontSize: '0.72rem', marginTop: 2 }}>{t}</div>
              <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                {masked ? '—' : s.toFixed(2)}
              </div>
            </div>
          )
        })}
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Score = Query · Key (plus a small recency bonus standing in for position). Grey bars are masked out — with the
        causal mask on, "{TOKENS[i]}" can only see itself and what came before it.
      </p>
    </div>
  )
}
