import { useState } from 'react'
import { Row, Btn, Accent } from '../shared/ui.jsx'

const COLOR = '#7c3aed'
const BAD = '#b91c1c'

/* Broadcasting rules are short but abstract. Aligning the two shapes from the
 * right and marking each dimension pass or fail turns them into something you
 * can check by eye, which is what you end up doing at a real debugging session. */

const CASES = {
  'bias add': ['32,10', '10'],
  'batch broadcast': ['32,1,64', '8,64'],
  'scalar': ['4,4', '1'],
  'mismatch': ['32,10', '8'],
  'outer product': ['5,1', '1,3'],
}
const KEYS = Object.keys(CASES)

function parse(s) {
  return s.split(',').map(x => parseInt(x.trim(), 10)).filter(n => !isNaN(n))
}

export default function TensorShapeWidget() {
  const [k, setK] = useState(KEYS[0])
  const [a, setA] = useState(CASES[KEYS[0]][0])
  const [b, setB] = useState(CASES[KEYS[0]][1])

  const pick = key => { setK(key); setA(CASES[key][0]); setB(CASES[key][1]) }

  const A = parse(a), B = parse(b)
  const n = Math.max(A.length, B.length)
  const rows = []
  let ok = true
  for (let i = 0; i < n; i++) {
    const av = A[A.length - n + i]
    const bv = B[B.length - n + i]
    const ad = av === undefined ? 1 : av
    const bd = bv === undefined ? 1 : bv
    const pass = ad === bd || ad === 1 || bd === 1
    if (!pass) ok = false
    rows.push({ av, bv, out: pass ? Math.max(ad, bd) : null, pass })
  }

  const Box = ({ v, pass }) => (
    <div style={{
      minWidth: 46, textAlign: 'center', padding: '4px 6px', borderRadius: 4,
      fontFamily: 'monospace', fontSize: '0.8rem',
      border: `1px solid ${pass ? 'var(--border)' : BAD}`,
      background: v === undefined ? 'transparent' : 'var(--bg-hover)',
      color: v === undefined ? 'var(--text-muted)' : 'var(--text)',
    }}>{v === undefined ? '—' : v}</div>
  )

  const field = (val, set) => (
    <input value={val} onChange={e => set(e.target.value)} style={{
      width: 110, padding: '0.2rem 0.35rem', fontSize: '0.8rem', fontFamily: 'monospace',
      border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg)', color: 'var(--text)',
    }} />
  )

  return (
    <Accent value={COLOR}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          {KEYS.map(key => <Btn key={key} onClick={() => pick(key)} primary={k === key}>{key}</Btn>)}
        </Row>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '0.7rem', fontSize: '0.78rem' }}>
          <label>shape A {field(a, setA)}</label>
          <label>shape B {field(b, setB)}</label>
        </div>

        <div style={{ display: 'grid', gap: 4 }}>
          {['A', 'B', 'result'].map(label => (
            <div key={label} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <div style={{ width: 52, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
              {rows.map((r, i) => (
                <Box key={i} pass={r.pass}
                  v={label === 'A' ? r.av : label === 'B' ? r.bv : (r.out === null ? undefined : r.out)} />
              ))}
            </div>
          ))}
        </div>

        <p style={{
          fontSize: '0.78rem', marginTop: '0.6rem', lineHeight: 1.6,
          color: ok ? 'var(--text-muted)' : BAD,
        }}>
          {ok
            ? 'Shapes are aligned from the right. Each pair is compatible when the two sizes match or one of them is 1, and a missing dimension counts as 1. The stretched dimension costs no memory — nothing is actually copied.'
            : 'These shapes cannot broadcast. Aligned from the right, at least one pair has two different sizes and neither is 1, so there is no way to stretch one to match the other. This is the error message people meet most often, and reading it right to left is the trick.'}
        </p>
      </div>
    </Accent>
  )
}
