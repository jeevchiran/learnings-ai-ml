import { useState } from 'react'
import { Row, Btn } from '../shared/ui.jsx'
import { TOKENS, K, Q, V, softmax } from './attentionData.js'

const COLORS = ['#1e3a8a', '#0f766e', '#b45309']
const HEADS = [
  { name: 'head 1 — descriptor matching', score: (i, j) => Q[TOKENS[i]][0] * K[TOKENS[j]][0] + Q[TOKENS[i]][1] * K[TOKENS[j]][1] },
  { name: 'head 2 — positional (recency)', score: (i, j) => -Math.abs(i - j) },
  { name: 'head 3 — broad context (uniform)', score: () => 0 },
]

function headAlpha(headIdx, i) {
  const scores = TOKENS.map((_, j) => (j > i ? -Infinity : HEADS[headIdx].score(i, j)))
  return softmax(scores)
}

function headContext(headIdx, i) {
  const alpha = headAlpha(headIdx, i)
  return [0, 1].map(dim => TOKENS.reduce((sum, tok, j) => sum + alpha[j] * V[tok][dim], 0))
}

const fmt = v => v.toFixed(2)

export default function MultiHeadWidget() {
  const [i, setI] = useState(3) // "creature"

  const contexts = HEADS.map((_, h) => headContext(h, i))
  const total = [0, 1].map(dim => contexts.reduce((s, c) => s + c[dim], 0))

  return (
    <div>
      <Row style={{ marginBottom: '0.7rem' }}>
        {TOKENS.map((t, idx) => (
          <Btn key={t} onClick={() => setI(idx)} primary={i === idx}>{t}</Btn>
        ))}
      </Row>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
        {HEADS.map((head, h) => {
          const alpha = headAlpha(h, i)
          const max = Math.max(...alpha, 0.01)
          return (
            <div key={head.name} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '0.5rem' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: COLORS[h], marginBottom: 4 }}>{head.name}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 50 }}>
                {TOKENS.map((t, j) => (
                  <div key={t} title={t} style={{
                    flex: 1, height: Math.max(2, (alpha[j] / max) * 46),
                    background: j <= i ? COLORS[h] : 'var(--border)', opacity: j === i ? 1 : 0.7, borderRadius: 2,
                  }} />
                ))}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'monospace' }}>
                Δ = [{contexts[h].map(fmt).join(', ')}]
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: '0.82rem', marginTop: '0.7rem' }}>
        Combined update for "<strong>{TOKENS[i]}</strong>": <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>[{total.map(fmt).join(', ')}]</span>
      </p>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
        Three heads, three different attention patterns over the same sentence, run in parallel and summed. Real
        multi-head attention also gives each head its own value vectors — simplified to one shared V here to keep the
        arithmetic visible.
      </p>
    </div>
  )
}
