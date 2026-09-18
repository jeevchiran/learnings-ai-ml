import { useState } from 'react'
import { Row, Btn, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#7c3aed'

/* Parameter counting is the one arithmetic skill this module needs, and it is
 * far easier to internalise by editing a layer list than by reading a formula
 * with superscripts. The 235,146 example from the module text is preloaded. */

const PRESETS = {
  'MNIST MLP': [784, 256, 128, 10],
  'tiny': [4, 8, 3],
  'wide': [784, 1024, 10],
  'deep': [784, 128, 128, 128, 128, 10],
}

export default function ParamCountWidget() {
  const [name, setName] = useState('MNIST MLP')
  const [sizes, setSizes] = useState(PRESETS['MNIST MLP'])

  const pick = k => { setName(k); setSizes(PRESETS[k]) }
  const setAt = (i, v) => setSizes(s => s.map((x, j) => (j === i ? Math.max(1, v) : x)))

  const layers = sizes.slice(1).map((n, i) => ({
    inp: sizes[i], out: n, weights: sizes[i] * n, biases: n,
  }))
  const total = layers.reduce((a, l) => a + l.weights + l.biases, 0)

  return (
    <Accent value={COLOR}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          {Object.keys(PRESETS).map(k => (
            <Btn key={k} onClick={() => pick(k)} primary={name === k}>{k}</Btn>
          ))}
        </Row>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.6rem' }}>
          {sizes.map((n, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="number" value={n} min={1} onChange={e => setAt(i, +e.target.value)}
                style={{
                  width: 62, padding: '0.2rem 0.3rem', fontSize: '0.8rem', fontFamily: 'monospace',
                  border: '1px solid var(--border)', borderRadius: 4,
                  background: 'var(--bg)', color: 'var(--text)',
                }} />
              {i < sizes.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
            </span>
          ))}
        </div>

        <table style={{ borderCollapse: 'collapse', fontSize: '0.76rem', width: '100%', maxWidth: 400 }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)' }}>
              <th style={{ textAlign: 'left', padding: '2px 6px' }}>layer</th>
              <th style={{ textAlign: 'right', padding: '2px 6px' }}>weights</th>
              <th style={{ textAlign: 'right', padding: '2px 6px' }}>biases</th>
              <th style={{ textAlign: 'right', padding: '2px 6px' }}>subtotal</th>
            </tr>
          </thead>
          <tbody>
            {layers.map((l, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '2px 6px', fontFamily: 'monospace' }}>{l.inp} → {l.out}</td>
                <td style={{ padding: '2px 6px', textAlign: 'right', fontFamily: 'monospace' }}>{l.weights.toLocaleString()}</td>
                <td style={{ padding: '2px 6px', textAlign: 'right', fontFamily: 'monospace' }}>{l.biases.toLocaleString()}</td>
                <td style={{ padding: '2px 6px', textAlign: 'right', fontFamily: 'monospace', color: COLOR }}>
                  {(l.weights + l.biases).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Readout items={[['total trainable parameters', total.toLocaleString()]]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Each layer contributes its input count times its output count in weights, plus one bias per output.
          Edit any number and watch where the cost actually sits: widening the first hidden layer of the MNIST
          preset is far more expensive than adding two more layers at the end.
        </p>
      </div>
    </Accent>
  )
}
