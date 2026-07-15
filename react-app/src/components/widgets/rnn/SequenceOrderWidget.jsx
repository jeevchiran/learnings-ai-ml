import { useState } from 'react'

const COLOR = '#0f766e'
const BAG = '#6b7280'

const SENTENCES = [
  { tokens: ['the', 'dog', 'bit', 'the', 'man'], meaning: 'A dog attacked a man.' },
  { tokens: ['the', 'man', 'bit', 'the', 'dog'], meaning: 'A man attacked a dog — very different!' },
  { tokens: ['man', 'the', 'the', 'bit', 'dog'], meaning: 'Word salad — no coherent meaning.' },
]

export default function SequenceOrderWidget() {
  const [idx, setIdx] = useState(0)
  const s = SENTENCES[idx]
  // bag-of-words signature = sorted tokens (order-invariant)
  const bag = [...s.tokens].sort().join(' ')
  const bagSame = SENTENCES.map(x => [...x.tokens].sort().join(' ') === bag)

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
        {SENTENCES.map((x, i) => (
          <button key={i} onClick={() => setIdx(i)}
            style={{ padding: '0.24rem 0.7rem', borderRadius: 4, fontSize: '0.78rem', cursor: 'pointer', fontWeight: idx === i ? 700 : 400,
              border: `2px solid ${idx === i ? COLOR : 'var(--border)'}`, background: idx === i ? COLOR : 'var(--bg)', color: idx === i ? '#fff' : 'var(--text)' }}>
            Order {i + 1}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '0.6rem' }}>
        {s.tokens.map((t, i) => (
          <span key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ padding: '0.35rem 0.6rem', borderRadius: 5, background: `${COLOR}22`, border: `1.5px solid ${COLOR}`, fontSize: '0.85rem' }}>{t}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>t={i + 1}</span>
          </span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        <div style={{ background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.7rem', borderRadius: '0 4px 4px 0', fontSize: '0.8rem' }}>
          <strong style={{ color: COLOR }}>RNN (order-aware)</strong><br />reads t=1→5 in sequence: <em>"{s.meaning}"</em>
        </div>
        <div style={{ background: 'var(--bg-hover)', borderLeft: `3px solid ${BAG}`, padding: '0.5rem 0.7rem', borderRadius: '0 4px 4px 0', fontSize: '0.8rem' }}>
          <strong style={{ color: BAG }}>Bag-of-words</strong><br />sees only {'{'}{bag}{'}'} — <strong>identical</strong> for every order that shares these words.
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
        All three orders have the <strong>same word multiset</strong>, so a bag-of-words model or a plain MLP scores them identically — yet their meanings differ completely. Only a model that consumes tokens <em>in order</em> can tell "dog bit man" from "man bit dog". That's why sequences need RNNs.
      </p>
    </div>
  )
}
