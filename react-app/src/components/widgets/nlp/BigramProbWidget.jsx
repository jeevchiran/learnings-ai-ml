import { useState } from 'react'
import { Row, Btn, Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#06b6d4'

/* A tiny corpus with a genuine zero in it. The add-k slider is what turns the
 * abstract claim "smoothing prevents zero probabilities" into something the
 * reader watches happen. */

const CORPUS = [
  ['I', 'like', 'dogs'],
  ['I', 'like', 'cats'],
  ['I', 'love', 'dogs'],
  ['we', 'like', 'dogs'],
]
const VOCAB = [...new Set(CORPUS.flat())].sort()

const bigrams = {}
const unigrams = {}
for (const s of CORPUS) {
  for (let i = 0; i < s.length; i++) {
    unigrams[s[i]] = (unigrams[s[i]] || 0) + 1
    if (i < s.length - 1) {
      const key = s[i] + ' ' + s[i + 1]
      bigrams[key] = (bigrams[key] || 0) + 1
    }
  }
}

export default function BigramProbWidget() {
  const [first, setFirst] = useState('like')
  const [k, setK] = useState(0)

  const V = VOCAB.length
  const denom = (unigrams[first] || 0) + k * V
  const probs = VOCAB.map(w => {
    const c = bigrams[first + ' ' + w] || 0
    return { w, c, p: denom === 0 ? 0 : (c + k) / denom }
  })
  const max = Math.max(...probs.map(p => p.p), 0.001)
  const zeros = probs.filter(p => p.p === 0).length

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ fontSize: '0.78rem', marginBottom: 4 }}>first word</div>
        <Row style={{ marginBottom: '0.6rem' }}>
          {VOCAB.map(w => <Btn key={w} onClick={() => setFirst(w)} primary={first === w}>{w}</Btn>)}
        </Row>

        <Slider label="add-k smoothing" value={k} onChange={setK} min={0} max={2} step={0.1}
          fmt={v => v.toFixed(1)} width={160} />

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 110, marginTop: '0.6rem', overflowX: 'auto' }}>
          {probs.map(({ w, c, p }) => (
            <div key={w} style={{ textAlign: 'center', minWidth: 52 }}>
              <div style={{ height: 78, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{
                  width: 26, height: Math.max(2, (p / max) * 74),
                  background: p === 0 ? 'var(--border)' : COLOR,
                  borderRadius: '3px 3px 0 0', transition: 'height .2s',
                }} />
              </div>
              <div style={{ fontSize: '0.72rem', marginTop: 2 }}>{w}</div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {c}/{unigrams[first] || 0}
              </div>
            </div>
          ))}
        </div>

        <Readout items={[
          ['zero-probability continuations', String(zeros)],
          ['k', k.toFixed(1)],
        ]} />

        <p style={{ fontSize: '0.78rem', color: zeros ? COLOR : 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          {zeros
            ? `${zeros} continuations have probability exactly zero. A sentence containing any of them would be assigned zero probability overall, however ordinary it looks, because the sentence probability is a product.`
            : 'With smoothing applied, every continuation has some probability. A little mass has been taken from the observed pairs and spread over the unobserved ones, so no sentence is declared impossible.'}
        </p>
      </div>
    </Accent>
  )
}
