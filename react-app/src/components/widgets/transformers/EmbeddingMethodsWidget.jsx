import { useState } from 'react'
import { Row, Btn } from '../shared/ui.jsx'

const COLOR = '#1e3a8a'
const SENT = ['the', 'fluffy', 'blue', 'creature', 'roamed']
const TARGET = 3 // "creature"

const METHODS = {
  'Word2Vec — CBOW': {
    tag: 'predicts target from context',
    inputs: [0, 1, 2, 4],
    outputs: [TARGET],
    note: 'Context words are averaged and used to predict the missing centre word. Fast, and works well for frequent words because every context occurrence contributes to the same target.',
  },
  'Word2Vec — Skip-gram': {
    tag: 'predicts context from target',
    inputs: [TARGET],
    outputs: [0, 1, 2, 4],
    note: 'The centre word alone predicts each surrounding word. Every occurrence generates several training pairs, which is why skip-gram learns better vectors for rare words than CBOW does.',
  },
  'GloVe': {
    tag: 'factorises global co-occurrence counts',
    inputs: [],
    outputs: [],
    note: 'Instead of sliding a window and predicting, GloVe counts how often every pair of words co-occurs across the whole corpus, then factorises that matrix. It sees global statistics directly rather than inferring them from many local windows.',
  },
  FastText: {
    tag: 'builds words from character n-grams',
    inputs: [],
    outputs: [],
    note: 'A word vector is the sum of its character n-gram vectors — "creature" becomes <cr, cre, rea, eat, atu, tur, ure, re>. Because the pieces are shared across words, FastText can build a vector for a word it has never seen.',
  },
}

const NGRAMS = ['<cr', 'cre', 'rea', 'eat', 'atu', 'tur', 'ure', 're>']

export default function EmbeddingMethodsWidget() {
  const [name, setName] = useState('Word2Vec — CBOW')
  const m = METHODS[name]
  const isPredictive = m.inputs.length > 0

  return (
    <div>
      <Row style={{ marginBottom: '0.7rem' }}>
        {Object.keys(METHODS).map(k => (
          <Btn key={k} onClick={() => setName(k)} primary={name === k}>{k}</Btn>
        ))}
      </Row>

      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: COLOR, marginBottom: '0.5rem' }}>{m.tag}</div>

      {isPredictive && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {SENT.map((w, i) => {
            const isIn = m.inputs.includes(i)
            const isOut = m.outputs.includes(i)
            return (
              <div key={w} style={{
                padding: '0.3rem 0.6rem', borderRadius: 4, fontSize: '0.82rem',
                border: `2px solid ${isIn ? COLOR : isOut ? '#b45309' : 'var(--border)'}`,
                background: isOut ? '#b45309' : isIn ? 'var(--bg-hover)' : 'var(--bg)',
                color: isOut ? '#fff' : 'var(--text)',
                opacity: isIn || isOut ? 1 : 0.4,
              }}>
                {w}
                <div style={{ fontSize: '0.62rem', opacity: 0.8 }}>
                  {isIn ? 'input' : isOut ? 'predict' : ''}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {name === 'FastText' && (
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {NGRAMS.map(g => (
            <span key={g} style={{
              padding: '0.2rem 0.45rem', borderRadius: 3, fontSize: '0.75rem', fontFamily: 'monospace',
              border: '1px solid var(--border)', background: 'var(--bg-hover)',
            }}>{g}</span>
          ))}
          <span style={{ fontSize: '0.78rem', alignSelf: 'center', color: 'var(--text-muted)' }}>&nbsp;→ summed into one vector for "creature"</span>
        </div>
      )}

      {name === 'GloVe' && (
        <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.72rem' }}>
            <thead>
              <tr>
                <th></th>
                {SENT.map(w => <th key={w} style={{ padding: '2px 6px' }}>{w}</th>)}
              </tr>
            </thead>
            <tbody>
              {SENT.map((rw, i) => (
                <tr key={rw}>
                  <td style={{ padding: '2px 6px', fontWeight: 600, textAlign: 'right' }}>{rw}</td>
                  {SENT.map((_, j) => {
                    const count = i === j ? 0 : Math.max(0, 4 - Math.abs(i - j))
                    return (
                      <td key={j} style={{
                        padding: '2px 8px', textAlign: 'center', fontFamily: 'monospace',
                        background: `rgba(30,58,138,${count / 5})`, color: count > 2 ? '#fff' : 'var(--text)',
                      }}>{count}</td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{m.note}</p>
    </div>
  )
}
