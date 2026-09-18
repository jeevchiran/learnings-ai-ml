import { useState } from 'react'
import { Row, Btn, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#b45309'

/* The context-independence problem, made literal: the same lookup returns the
 * same numbers in two sentences that mean different things. Everything the
 * attention track builds is a response to this one picture. */

const SENTENCES = {
  'We sat on the river bank.': { sense: 'river edge', neighbours: ['river', 'sat', 'on'] },
  'She opened an account at the bank.': { sense: 'financial institution', neighbours: ['account', 'opened', 'at'] },
}
const KEYS = Object.keys(SENTENCES)

// One fixed table entry. The point is that this never changes.
const VECTOR = [0.31, -0.12, 0.44, 0.08]

export default function StaticEmbeddingWidget() {
  const [k, setK] = useState(KEYS[0])
  const s = SENTENCES[k]
  const words = k.replace('.', '').split(' ')

  return (
    <Accent value={COLOR}>
      <div>
        <Row style={{ marginBottom: '0.7rem' }}>
          {KEYS.map(key => (
            <Btn key={key} onClick={() => setK(key)} primary={k === key}>{key}</Btn>
          ))}
        </Row>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: '0.7rem' }}>
          {words.map((w, i) => {
            const isBank = w.toLowerCase().replace(/[.,]/g, '') === 'bank'
            const isCue = s.neighbours.includes(w.toLowerCase())
            return (
              <span key={i} style={{
                padding: '0.25rem 0.5rem', borderRadius: 4, fontSize: '0.84rem',
                background: isBank ? COLOR : isCue ? 'var(--bg-hover)' : 'transparent',
                color: isBank ? '#fff' : 'var(--text)',
                border: `1px solid ${isBank ? COLOR : isCue ? COLOR : 'transparent'}`,
                fontWeight: isBank ? 700 : 400,
              }}>{w}</span>
            )
          })}
        </div>

        <p style={{ fontSize: '0.8rem', margin: '0 0 0.4rem' }}>
          Human reading of <strong style={{ color: COLOR }}>bank</strong> here:{' '}
          <em>{s.sense}</em> — the outlined words are what told you so.
        </p>

        <Readout items={[['embedding["bank"]', `[${VECTOR.join(', ')}]`]]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Switch sentences and watch the vector not move. A lookup table is computed before any sentence is
          read, so the outlined context words cannot reach it. Every mechanism in this track exists to let
          those words change the numbers.
        </p>
      </div>
    </Accent>
  )
}
