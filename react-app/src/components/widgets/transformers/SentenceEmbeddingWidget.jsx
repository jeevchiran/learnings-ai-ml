import { useState } from 'react'
import { Row, Btn, Readout } from '../shared/ui.jsx'

const COLOR = '#1e3a8a'

// Toy 4-d "sentence vectors" — hand-set so the similarity ordering matches
// what a real SBERT model would produce for these pairs.
const SENTENCES = {
  'A rabbit hops through the field.': [0.90, 0.20, 0.10, 0.30],
  'A bunny bounds across the meadow.': [0.88, 0.24, 0.12, 0.28],
  'The stock market closed lower today.': [0.10, 0.85, 0.30, 0.15],
  'Equity indices finished the day down.': [0.12, 0.88, 0.26, 0.18],
}
const KEYS = Object.keys(SENTENCES)

const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0)
const norm = a => Math.sqrt(dot(a, a))
const cosine = (a, b) => dot(a, b) / (norm(a) * norm(b))

function Encoder({ label, sentence, vec }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.74rem' }}>
      <div style={{ padding: '0.3rem 0.5rem', borderRadius: 4, background: '#3b82f6', color: '#fff', maxWidth: 190 }}>
        {sentence}
      </div>
      <span style={{ color: 'var(--text-muted)' }}>→</span>
      <div style={{ padding: '0.25rem 0.5rem', border: `1px dashed ${COLOR}`, borderRadius: 4 }}>BERT</div>
      <span style={{ color: 'var(--text-muted)' }}>→</span>
      <div style={{ padding: '0.25rem 0.5rem', borderRadius: 4, background: 'var(--bg-hover)' }}>token embeddings</div>
      <span style={{ color: 'var(--text-muted)' }}>→</span>
      <div style={{ padding: '0.25rem 0.5rem', border: `1px dashed ${COLOR}`, borderRadius: 4 }}>mean pooling</div>
      <span style={{ color: 'var(--text-muted)' }}>→</span>
      <div style={{ padding: '0.25rem 0.5rem', borderRadius: 4, background: COLOR, color: '#fff', fontFamily: 'monospace' }}>
        {label} = [{vec.map(v => v.toFixed(2)).join(', ')}]
      </div>
    </div>
  )
}

export default function SentenceEmbeddingWidget() {
  const [a, setA] = useState(KEYS[0])
  const [b, setB] = useState(KEYS[1])

  const u = SENTENCES[a]
  const v = SENTENCES[b]
  const sim = cosine(u, v)

  return (
    <div>
      <div style={{ fontSize: '0.76rem', fontWeight: 600, marginBottom: 3 }}>Sentence A</div>
      <Row style={{ marginBottom: '0.5rem' }}>
        {KEYS.map(k => <Btn key={k} onClick={() => setA(k)} primary={a === k}>{k.slice(0, 22)}…</Btn>)}
      </Row>
      <div style={{ fontSize: '0.76rem', fontWeight: 600, marginBottom: 3 }}>Sentence B</div>
      <Row style={{ marginBottom: '0.8rem' }}>
        {KEYS.map(k => <Btn key={k} onClick={() => setB(k)} primary={b === k}>{k.slice(0, 22)}…</Btn>)}
      </Row>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <Encoder label="u" sentence={a} vec={u} />
        <Encoder label="v" sentence={b} vec={v} />
      </div>

      <Readout items={[['cosine(u, v)', sim.toFixed(4)]]} />

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.6 }}>
        Both sentences pass through the <strong>same</strong> encoder with the <strong>same</strong> weights — that is the
        Siamese (bi-encoder) part. Each is reduced to one fixed vector, so comparing them afterward costs a single
        cosine, not another forward pass through the model.
      </p>
    </div>
  )
}
