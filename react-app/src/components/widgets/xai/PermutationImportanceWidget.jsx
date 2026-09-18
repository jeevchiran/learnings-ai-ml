import { useState } from 'react'
import { Row, Btn, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#ca8a04'

/* Permutation importance is a procedure, not a formula, and the procedure is
 * easy to picture: shuffle one column, see what the score does. Doing it one
 * column at a time is the whole method. */

const FEATURES = [
  { name: 'income', drop: 0.19 },
  { name: 'credit history', drop: 0.11 },
  { name: 'debt ratio', drop: 0.06 },
  { name: 'postcode', drop: 0.01 },
  { name: 'applicant id', drop: 0.00 },
]
const BASE = 0.91
const ROWS = 7

function seeded(n) {
  let s = n * 7919 + 13
  return () => { s = (s * 7919 + 13) % 104729; return s / 104729 }
}

export default function PermutationImportanceWidget() {
  const [i, setI] = useState(0)
  const f = FEATURES[i]
  const rnd = seeded(i + 1)
  const order = Array.from({ length: ROWS }, (_, r) => r).sort(() => rnd() - 0.5)

  return (
    <Accent value={COLOR}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          {FEATURES.map((ft, j) => (
            <Btn key={ft.name} onClick={() => setI(j)} primary={i === j}>shuffle {ft.name}</Btn>
          ))}
        </Row>

        <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 4 }}>
          {FEATURES.map((ft, j) => (
            <div key={ft.name} style={{ minWidth: 76 }}>
              <div style={{
                fontSize: '0.68rem', textAlign: 'center', padding: '2px 0', marginBottom: 2,
                color: i === j ? '#fff' : 'var(--text-muted)',
                background: i === j ? COLOR : 'transparent', borderRadius: 3,
              }}>{ft.name}</div>
              {Array.from({ length: ROWS }, (_, r) => (
                <div key={r} style={{
                  height: 13, marginBottom: 2, borderRadius: 2,
                  background: COLOR,
                  opacity: 0.2 + 0.7 * (((i === j ? order[r] : r) + 1) / ROWS),
                }} />
              ))}
            </div>
          ))}
        </div>

        <Readout items={[
          ['score before', BASE.toFixed(2)],
          ['score after shuffling', (BASE - f.drop).toFixed(2)],
          ['importance', f.drop.toFixed(2)],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Shuffling one column destroys its relationship with the target while leaving every other column and
          the trained model untouched. Whatever the score loses is what the model was getting from that column.
          Shuffle the identifier and nothing happens, which is the answer you want from a column that should
          carry no signal.
        </p>
      </div>
    </Accent>
  )
}
