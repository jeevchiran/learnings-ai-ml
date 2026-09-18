import { useState } from 'react'
import { Row, Btn, Accent } from '../shared/ui.jsx'

const ENC = '#0E8074'
const DEC = '#A23E7B'
const CROSS = '#3454D1'

/* The table in this module lists three attention layers; the thing a reader
 * actually has to hold is which sequence supplies Q and which supplies K and V.
 * Clicking a layer and seeing both answers at once is the cheapest way to fix it. */

const LAYERS = {
  'Encoder self-attention': {
    color: ENC, masked: false, stack: 'encoder',
    q: 'source sentence', kv: 'source sentence',
    note: 'The encoder already holds the whole input, so every source word may look at every other word, before and after it. There is nothing to hide, so no mask.',
  },
  'Decoder self-attention': {
    color: DEC, masked: true, stack: 'decoder',
    q: 'generated so far', kv: 'generated so far',
    note: 'The decoder is writing left to right. Each position may look only at itself and earlier output, because later output does not exist yet. That restriction is the causal mask.',
  },
  'Decoder cross-attention': {
    color: CROSS, masked: false, stack: 'decoder',
    q: 'generated so far', kv: 'encoder output',
    note: 'The only place the two stacks meet. The half-written output asks the question, so it supplies Q; the fully-read source supplies the answers, so it provides K and V. Nothing is hidden, so no mask.',
  },
}
const NAMES = Object.keys(LAYERS)

function Stack({ title, color, items, active, onPick }) {
  return (
    <div style={{ flex: 1, minWidth: 180, border: `1px solid ${color}`, borderRadius: 8, padding: '0.5rem' }}>
      <div style={{ fontSize: '0.74rem', fontWeight: 700, color, marginBottom: 5 }}>{title}</div>
      {items.map(name => {
        const on = active === name
        return (
          <div key={name} onClick={() => onPick(name)} style={{
            cursor: 'pointer', padding: '5px 8px', margin: '3px 0', borderRadius: 5, fontSize: '0.75rem',
            background: on ? LAYERS[name].color : 'var(--bg-hover)',
            color: on ? '#fff' : 'var(--text)',
            border: `1px solid ${on ? LAYERS[name].color : 'var(--border)'}`,
          }}>
            {name.replace('Decoder ', '').replace('Encoder ', '')}
            {LAYERS[name].masked && (
              <span style={{ float: 'right', fontSize: '0.66rem', opacity: 0.85 }}>masked</span>
            )}
          </div>
        )
      })}
      <div style={{
        padding: '5px 8px', margin: '3px 0', borderRadius: 5, fontSize: '0.72rem',
        border: '1px dashed var(--border)', color: 'var(--text-muted)',
      }}>feed forward</div>
    </div>
  )
}

function Pattern({ masked, color }) {
  const n = 5, s = 14
  return (
    <svg width={n * s + 2} height={n * s + 2}
      role="img" aria-label={masked ? 'A lower-triangular attention pattern: each row may attend only to itself and earlier columns.' : 'A fully filled attention pattern: every row may attend to every column.'}>
      {Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (
        <rect key={r + '-' + c} x={c * s + 1} y={r * s + 1} width={s - 1} height={s - 1}
          fill={!masked || c <= r ? color : 'transparent'} opacity={0.75}
          stroke="var(--border)" strokeWidth={0.5} />
      )))}
    </svg>
  )
}

export default function ThreeAttentionsWidget() {
  const [active, setActive] = useState(NAMES[0])
  const L = LAYERS[active]

  return (
    <Accent value="#1e3a8a">
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          {NAMES.map(n => <Btn key={n} onClick={() => setActive(n)} primary={active === n}>{n}</Btn>)}
        </Row>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <Stack title="encoder block" color={ENC} items={[NAMES[0]]} active={active} onPick={setActive} />
          <Stack title="decoder block" color={DEC} items={[NAMES[1], NAMES[2]]} active={active} onPick={setActive} />
        </div>

        <div style={{ display: 'flex', gap: '1.1rem', alignItems: 'center', marginTop: '0.7rem', flexWrap: 'wrap' }}>
          <Pattern masked={L.masked} color={L.color} />
          <div style={{ fontSize: '0.8rem', lineHeight: 1.85 }}>
            <div><strong style={{ color: L.color }}>Q</strong> from <span style={{ fontFamily: 'monospace' }}>{L.q}</span></div>
            <div><strong style={{ color: L.color }}>K, V</strong> from <span style={{ fontFamily: 'monospace' }}>{L.kv}</span></div>
            <div>mask: <span style={{ fontFamily: 'monospace' }}>{L.masked ? 'causal' : 'none'}</span></div>
          </div>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6, maxWidth: '62ch' }}>
          {L.note}
        </p>
      </div>
    </Accent>
  )
}
