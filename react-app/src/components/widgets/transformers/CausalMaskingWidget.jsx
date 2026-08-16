import { useState } from 'react'
import { Toggle } from '../shared/ui.jsx'
import { TOKENS, rawScores, softmax } from './attentionData.js'

const COLOR = '#1e3a8a'

function Grid({ title, cell }) {
  return (
    <div>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>{title}</div>
      <table style={{ borderCollapse: 'collapse', fontSize: '0.68rem' }}>
        <thead>
          <tr>
            <th></th>
            {TOKENS.map(t => <th key={t} style={{ padding: '2px 4px', fontWeight: 600 }}>{t}</th>)}
          </tr>
        </thead>
        <tbody>
          {TOKENS.map((rowTok, i) => (
            <tr key={rowTok}>
              <td style={{ padding: '2px 6px', fontWeight: 600, textAlign: 'right' }}>{rowTok}</td>
              {TOKENS.map((_, j) => <td key={j} style={{ padding: '1px' }}>{cell(i, j)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function CausalMaskingWidget() {
  const [causal, setCausal] = useState(true)

  return (
    <div>
      <Toggle label="causal mask" on={causal} onChange={setCausal} />
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.6rem', overflowX: 'auto', flexWrap: 'wrap' }}>
        <Grid
          title="raw scores"
          cell={(i, j) => {
            const s = rawScores(i, causal)[j]
            return (
              <div style={{ width: 30, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
                {Number.isFinite(s) ? s.toFixed(1) : <span style={{ color: '#ef4444' }}>-∞</span>}
              </div>
            )
          }}
        />
        <Grid
          title="softmax(scores)"
          cell={(i, j) => {
            const a = softmax(rawScores(i, causal))[j]
            return (
              <div style={{
                width: 30, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace', background: `rgba(30,58,138,${a})`, color: a > 0.5 ? '#fff' : 'var(--text)',
              }}>
                {a.toFixed(2)}
              </div>
            )
          }}
        />
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
        {causal
          ? 'With the mask on, every row is lower-triangular — a word\'s attention weights over anything after it are exactly 0, because softmax(-∞) = 0.'
          : 'With the mask off, every word can attend to every other word, including ones later in the sentence — fine for an encoder, wrong for a decoder generating text left to right.'}
      </p>
    </div>
  )
}
