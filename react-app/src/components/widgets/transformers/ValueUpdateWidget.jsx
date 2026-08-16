import { useState } from 'react'
import { Row, Btn } from '../shared/ui.jsx'
import { TOKENS, E, attend } from './attentionData.js'

const COLOR = '#1e3a8a'
const fmt = v => v.toFixed(2)
const fmtVec = v => `[${v.map(fmt).join(', ')}]`

export default function ValueUpdateWidget() {
  const [i, setI] = useState(3) // "creature"
  const { alpha, context } = attend(i, true)
  const before = E[TOKENS[i]]
  const after = before.map((v, d) => v + context[d])

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        {TOKENS.map((t, idx) => (
          <Btn key={t} onClick={() => setI(idx)} primary={i === idx}>{t}</Btn>
        ))}
      </Row>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 90, overflowX: 'auto' }}>
        {TOKENS.map((t, j) => (
          <div key={t} style={{ textAlign: 'center', minWidth: 42 }}>
            <div style={{ height: 70, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div style={{
                width: 24, height: Math.max(2, alpha[j] * 68),
                background: alpha[j] > 0.01 ? COLOR : 'var(--border)', borderRadius: '3px 3px 0 0',
              }} />
            </div>
            <div style={{ fontSize: '0.68rem', marginTop: 2 }}>{t}</div>
            <div style={{ fontSize: '0.64rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{fmt(alpha[j])}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '0.7rem', fontSize: '0.8rem', lineHeight: 1.9 }}>
        <div>E("{TOKENS[i]}") before attention&nbsp;&nbsp;=&nbsp; <span style={{ fontFamily: 'monospace' }}>{fmtVec(before)}</span></div>
        <div>Δ (weighted sum of values)&nbsp; =&nbsp; <span style={{ fontFamily: 'monospace', color: COLOR }}>{fmtVec(context)}</span></div>
        <div>E("{TOKENS[i]}") after attention&nbsp;&nbsp;&nbsp;=&nbsp; <strong style={{ fontFamily: 'monospace' }}>{fmtVec(after)}</strong></div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        The updated vector for "{TOKENS[i]}" is not a lookup anymore — it is the original meaning plus a weighted blend of
        every word it attended to. Pick "creature" and watch Δ pull in "fluffy" and "blue"; pick "roamed" and watch it pull in "creature".
      </p>
    </div>
  )
}
