import { useState } from 'react'
import { Row, Btn } from '../shared/ui.jsx'

const COLOR = '#b45309'
const SRC = ['I', 'love', 'coffee']
const TGT = ["J'aime", 'le', 'café']

// Hand-set, illustrative alignment weights — each row (decoder step) sums to 1.
const WEIGHTS = [
  [0.20, 0.70, 0.10], // "J'aime" looks mostly at "love"
  [0.10, 0.20, 0.70], // "le" looks mostly at "coffee" (the noun it precedes)
  [0.05, 0.10, 0.85], // "café" looks almost entirely at "coffee"
]

export default function AttentionAlignmentWidget() {
  const [step, setStep] = useState(0)
  const row = WEIGHTS[step]

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Decoder step:</span>
        {TGT.map((t, i) => (
          <Btn key={i} onClick={() => setStep(i)} primary={step === i}>{t}</Btn>
        ))}
      </Row>

      {/* full heatmap */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr>
              <th></th>
              {SRC.map(s => <th key={s} style={{ padding: '4px 10px', fontWeight: 600 }}>{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {TGT.map((t, r) => (
              <tr key={t}>
                <td style={{ padding: '4px 8px', fontWeight: r === step ? 700 : 500, color: r === step ? COLOR : 'var(--text)' }}>{t}</td>
                {SRC.map((s, c) => {
                  const w = WEIGHTS[r][c]
                  return (
                    <td key={s} style={{
                      padding: '4px 10px', textAlign: 'center', fontFamily: 'monospace',
                      background: `rgba(180,83,9,${w})`,
                      color: w > 0.5 ? '#fff' : 'var(--text)',
                      outline: r === step ? `2px solid ${COLOR}` : 'none',
                      borderRadius: 3,
                    }}>
                      {w.toFixed(2)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* bar chart for selected row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem', height: 90, marginTop: '1rem' }}>
        {SRC.map((s, c) => (
          <div key={s} style={{ textAlign: 'center' }}>
            <div style={{ height: 70, display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ width: 34, height: `${row[c] * 70}px`, background: COLOR, borderRadius: '3px 3px 0 0', transition: 'height .2s' }} />
            </div>
            <div style={{ fontSize: '0.72rem', marginTop: 2 }}>{s}</div>
            <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: COLOR }}>{row[c].toFixed(2)}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Generating "<strong>{TGT[step]}</strong>", the decoder puts most of its weight on "<strong>{SRC[row.indexOf(Math.max(...row))]}</strong>" — a different source word for every output step, instead of one fixed c for the whole sentence.
      </p>
    </div>
  )
}
