import { useState, useMemo } from 'react'
import { Row, Btn, Toggle, Readout } from '../shared/ui.jsx'

const COLOR = '#b45309'
const SRC = ['I', 'love', 'coffee']
const TGT = ["J'aime", 'le', 'café']

// Toy 3-dim vectors — small enough to compute and show every number.
const H = [
  [1.00, 0.20, -0.50],   // h_1 "I"
  [0.30, 0.90, 0.10],    // h_2 "love"
  [-0.20, 0.40, 0.80],   // h_3 "coffee"
]
const S = [
  [0.25, 0.85, 0.05],  // decoder state before "J'aime"
  [-0.10, 0.30, 0.75], // decoder state before "le"
  [-0.25, 0.35, 0.85], // decoder state before "café"
]

const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0)
const fmt = v => v.toFixed(3)

function softmax(xs) {
  const m = Math.max(...xs)
  const exps = xs.map(x => Math.exp(x - m))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

export default function ContextVectorCalcWidget() {
  const [step, setStep] = useState(0)
  const [scaled, setScaled] = useState(false)

  const { scores, alpha, context } = useMemo(() => {
    const d = H[0].length
    const raw = H.map(h => dot(S[step], h))
    const scores = scaled ? raw.map(e => e / Math.sqrt(d)) : raw
    const alpha = softmax(scores)
    const context = H[0].map((_, dim) => H.reduce((sum, h, j) => sum + alpha[j] * h[dim], 0))
    return { scores, alpha, context }
  }, [step, scaled])

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Decoding step:</span>
        {TGT.map((t, i) => (
          <Btn key={i} onClick={() => setStep(i)} primary={step === i}>{t}</Btn>
        ))}
        <Toggle label="scale by 1/√d" on={scaled} onChange={setScaled} />
      </Row>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '3px 8px' }}>source token</th>
              <th style={{ textAlign: 'left', padding: '3px 8px' }}>hⱼ</th>
              <th style={{ textAlign: 'left', padding: '3px 8px' }}>eⱼ = s · hⱼ{scaled && ' / √d'}</th>
              <th style={{ textAlign: 'left', padding: '3px 8px' }}>αⱼ = softmax(eⱼ)</th>
            </tr>
          </thead>
          <tbody>
            {SRC.map((tok, j) => (
              <tr key={tok}>
                <td style={{ padding: '3px 8px' }}>{tok}</td>
                <td style={{ padding: '3px 8px', fontFamily: 'monospace' }}>[{H[j].map(fmt).join(', ')}]</td>
                <td style={{ padding: '3px 8px', fontFamily: 'monospace' }}>{fmt(scores[j])}</td>
                <td style={{ padding: '3px 8px', fontFamily: 'monospace', color: COLOR, fontWeight: 600 }}>{fmt(alpha[j])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Readout items={[
        [`decoder state s (before "${TGT[step]}")`, `[${S[step].map(fmt).join(', ')}]`],
        ['context vector cᵢ = Σⱼ αⱼhⱼ', `[${context.map(fmt).join(', ')}]`],
      ]} />

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        αⱼ always sums to 1 — softmax guarantees that, so c is a weighted average of the source hidden states, never a blend that exceeds their range.
      </p>
    </div>
  )
}
