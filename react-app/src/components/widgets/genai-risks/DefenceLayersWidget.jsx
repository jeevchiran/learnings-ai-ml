import { useState } from 'react'
import { Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#b91c1c'
const SAFE = '#0E8074'

/* Defence in depth, made arithmetical. Each layer catches some fraction, and
 * the point is that no single layer is close to sufficient while three
 * mediocre ones together are respectable. */

const LAYERS = [
  { id: 'input filtering', catch: 0.55, note: 'Rejects obviously hostile input. Cheap, and trivially bypassed by rephrasing.' },
  { id: 'system prompt hardening', catch: 0.4, note: 'Tells the model what not to do. Helps against casual misuse, useless against a determined payload.' },
  { id: 'output scanning', catch: 0.6, note: 'Checks what came back before it reaches anyone. Catches leaked secrets and toxic text regardless of how the request was phrased.' },
  { id: 'permission limits', catch: 0.85, note: 'Restricts what the system is able to do at all. The only layer that bounds the damage rather than trying to predict the attack.' },
  { id: 'human review', catch: 0.9, note: 'Effective and expensive. Reserve it for the decisions where a mistake is not recoverable.' },
]

export default function DefenceLayersWidget() {
  const [on, setOn] = useState([true, false, false, false, false])

  const toggle = i => setOn(o => o.map((v, j) => (j === i ? !v : v)))
  const through = LAYERS.reduce((acc, l, i) => (on[i] ? acc * (1 - l.catch) : acc), 1)
  const stopped = 1 - through

  return (
    <Accent value={COLOR}>
      <div>
        {LAYERS.map((l, i) => (
          <div key={l.id} onClick={() => toggle(i)} style={{
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.4rem 0.6rem', marginBottom: 4, borderRadius: 5,
            border: `1px solid ${on[i] ? SAFE : 'var(--border)'}`,
            background: on[i] ? 'rgba(14,128,116,0.08)' : 'transparent',
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: 3, flexShrink: 0,
              border: `1px solid ${on[i] ? SAFE : 'var(--border)'}`,
              background: on[i] ? SAFE : 'transparent',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{l.id}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.note}</div>
            </div>
            <div style={{ fontSize: '0.76rem', fontFamily: 'monospace', color: on[i] ? SAFE : 'var(--text-muted)' }}>
              {(l.catch * 100).toFixed(0)}%
            </div>
          </div>
        ))}

        <div style={{ height: 14, background: 'var(--bg-hover)', borderRadius: 7, overflow: 'hidden', marginTop: '0.6rem' }}>
          <div style={{ width: `${stopped * 100}%`, height: '100%', background: SAFE, transition: 'width .2s' }} />
        </div>

        <Readout items={[
          ['attempts stopped', `${(stopped * 100).toFixed(1)}%`],
          ['attempts getting through', `${(through * 100).toFixed(1)}%`],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          No single layer here is good enough on its own, and none ever will be — the space of possible attacks
          is not enumerable. What changes the number is stacking imperfect layers, because what gets through is
          the product of their individual miss rates. Note also that the last two bound the damage rather than
          predicting the attack, which is why they hold up against methods nobody has invented yet.
        </p>
      </div>
    </Accent>
  )
}
