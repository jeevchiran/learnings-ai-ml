import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#4338ca'

/* The underflow is not a rounding nuisance, it is total loss of the ranking.
 * Watching the product hit a literal 0.0 while the log sum stays finite is the
 * argument. */

export default function LogProbUnderflowWidget() {
  const [n, setN] = useState(200)
  const p = 0.2

  const product = Math.pow(p, n)              // becomes exactly 0 past ~1075 terms
  const logSum = n * Math.log(p)
  const dead = product === 0

  return (
    <Accent value={COLOR}>
      <div>
        <Slider label="number of features (words)" value={n} onChange={setN} min={10} max={2000} step={10} width={190} />

        <div style={{ marginTop: '0.7rem', display: 'grid', gap: '0.5rem' }}>
          <div style={{
            padding: '0.6rem 0.8rem', borderRadius: 6,
            border: `1px solid ${dead ? '#ef4444' : 'var(--border)'}`,
            background: dead ? 'rgba(239,68,68,0.08)' : 'var(--bg-hover)',
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>product of probabilities</div>
            <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: dead ? '#ef4444' : 'var(--text)' }}>
              {dead ? '0.0' : product.toExponential(4)}
            </div>
          </div>

          <div style={{ padding: '0.6rem 0.8rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-hover)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>sum of logs</div>
            <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: COLOR }}>
              {logSum.toFixed(2)}
            </div>
          </div>
        </div>

        <Readout items={[
          ['smallest representable double', '≈ 1e-308'],
          ['this product needs', `1e${Math.round(n * Math.log10(p))}`],
        ]} />

        <p style={{ fontSize: '0.78rem', color: dead ? '#ef4444' : 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          {dead
            ? 'The product is now exactly zero — not small, zero. Every class scores zero, so comparing them compares nothing and the prediction is decided by whichever class happens to come first. The model is fine; the arithmetic destroyed the answer.'
            : 'Still representable, but push the feature count up. A realistic vocabulary is in the thousands, so this is the normal case rather than an edge case. The sum of logs stays a perfectly ordinary number the whole way.'}
        </p>
      </div>
    </Accent>
  )
}
