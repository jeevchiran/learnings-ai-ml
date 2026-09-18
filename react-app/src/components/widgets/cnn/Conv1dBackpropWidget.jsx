import { useState } from 'react'
import { Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#be185d'

/* The four-index gradient formulas in this module are correct and unreadable.
 * One dimension, four inputs and a two-tap kernel is small enough to hold in
 * your head, and every term of the sum is visible at once. */

const INPUT = [1, 2, 3, 4]
const POSITIONS = 3          // kernel slides to 3 places over 4 inputs

export default function Conv1dBackpropWidget() {
  const [delta, setDelta] = useState([1, 0, -1])

  const set = (i, v) => setDelta(d => d.map((x, j) => (j === i ? v : x)))

  // dW[k] = sum over positions p of delta[p] * input[p + k]
  const dW = [0, 1].map(k => delta.reduce((a, d, p) => a + d * INPUT[p + k], 0))

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ fontSize: '0.78rem', marginBottom: 4 }}>
          input <span style={{ fontFamily: 'monospace' }}>[{INPUT.join(', ')}]</span>, kernel{' '}
          <span style={{ fontFamily: 'monospace' }}>[a, b]</span>
        </div>

        <div style={{ fontSize: '0.78rem', marginBottom: 4, color: 'var(--text-muted)' }}>
          gradient arriving from above, one per output position:
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: '0.7rem' }}>
          {delta.map((d, i) => (
            <input key={i} type="number" value={d} step={1} onChange={e => set(i, +e.target.value || 0)}
              style={{
                width: 58, padding: '0.2rem 0.3rem', fontFamily: 'monospace', fontSize: '0.82rem',
                textAlign: 'center', border: `1px solid ${COLOR}`, borderRadius: 4,
                background: 'var(--bg)', color: 'var(--text)',
              }} />
          ))}
        </div>

        <svg viewBox="0 0 340 120" style={{ width: '100%', maxWidth: 340, height: 'auto' }}
          role="img" aria-label="The two-tap kernel slides to three positions over the four inputs, so each kernel weight is used three times and its gradient sums three terms.">
          {INPUT.map((v, i) => (
            <g key={i}>
              <rect x={20 + i * 62} y={78} width={54} height={26} rx={4} fill="var(--bg-hover)" stroke="var(--border)" />
              <text x={47 + i * 62} y={95} fontSize={12} textAnchor="middle" fontFamily="monospace" fill="var(--text)">{v}</text>
            </g>
          ))}
          {Array.from({ length: POSITIONS }, (_, p) => (
            <g key={p} opacity={delta[p] === 0 ? 0.3 : 1}>
              <rect x={18 + p * 62} y={72} width={120} height={38} rx={5}
                fill="none" stroke={COLOR} strokeWidth={1.4} strokeDasharray="4 3" />
              <rect x={20 + p * 62 + 22} y={24} width={72} height={24} rx={4} fill={COLOR} opacity={0.85} />
              <text x={20 + p * 62 + 58} y={41} fontSize={11} textAnchor="middle" fill="#fff" fontFamily="monospace">
                δ{p} = {delta[p]}
              </text>
            </g>
          ))}
        </svg>

        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.9, marginTop: '0.5rem' }}>
          <div>
            ∂L/∂a = {delta.map((d, p) => `${d}(${INPUT[p]})`).join(' + ')} ={' '}
            <strong style={{ color: COLOR }}>{dW[0]}</strong>
          </div>
          <div>
            ∂L/∂b = {delta.map((d, p) => `${d}(${INPUT[p + 1]})`).join(' + ')} ={' '}
            <strong style={{ color: COLOR }}>{dW[1]}</strong>
          </div>
        </div>

        <Readout items={[['uses of each weight', String(POSITIONS)]]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Weight a multiplies inputs 1, 2 and 3 as the kernel slides; weight b multiplies 2, 3 and 4. Because the
          same weight was used at every position, its gradient adds one term per position. That sum is the whole
          content of the weight-sharing rule, and every extra dimension or channel in the general formula just
          adds another summation sign around it.
        </p>
      </div>
    </Accent>
  )
}
