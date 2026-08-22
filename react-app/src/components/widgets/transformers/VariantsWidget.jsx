import { useState } from 'react'
import { Row, Btn } from '../shared/ui.jsx'

const COLOR = '#1e3a8a'
const CROSS = '#b45309'
const N = 6

const VARIANTS = {
  'Encoder-only': {
    models: 'BERT, RoBERTa, DistilBERT',
    stacks: ['encoder'],
    objective: 'Masked Language Modelling (MLM) — hide some tokens, predict them from both sides',
    suited: 'Classification, tagging, similarity',
    note: 'Every token attends to every other token, in both directions, at every layer. Nothing is hidden, because the whole input is available up front. That full-context view is what makes the resulting embeddings so strong for understanding tasks — but the model never learns to generate a next token, so it cannot write text.',
  },
  'Decoder-only': {
    models: 'GPT, LLaMA, Falcon',
    stacks: ['decoder'],
    objective: 'Causal Language Modelling (CLM) — predict the next token from earlier tokens only',
    suited: 'Text generation, dialogue, code',
    note: 'Causal masking means a token can only attend to itself and what came before. Training and inference follow the exact same left-to-right rule, which is why these models generate fluently — there is no mismatch between how they were trained and how they are used.',
  },
  'Encoder-Decoder': {
    models: 'T5, BART, MarianMT',
    stacks: ['encoder', 'decoder'],
    objective: 'Text-to-text / sequence-to-sequence',
    suited: 'Translation, summarisation, generative QA',
    note: 'The encoder reads the whole input bidirectionally; the decoder generates causally while attending back into the encoder through cross-attention. Understanding and generation are separated into two stacks, which suits tasks that explicitly transform one sequence into a different one.',
  },
}

function Pattern({ kind }) {
  // kind: 'bi' (full grid), 'causal' (lower triangle), 'cross' (full, different colour)
  const size = 15
  const fill = kind === 'cross' ? CROSS : COLOR
  return (
    <svg width={N * size + 2} height={N * size + 2} style={{ display: 'block' }}>
      {Array.from({ length: N }, (_, r) =>
        Array.from({ length: N }, (_, c) => {
          const on = kind === 'causal' ? c <= r : true
          return (
            <rect key={`${r}-${c}`} x={c * size + 1} y={r * size + 1} width={size - 1} height={size - 1}
              fill={on ? fill : 'transparent'} opacity={on ? 0.75 : 1}
              stroke="var(--border)" strokeWidth={0.5} />
          )
        })
      )}
    </svg>
  )
}

function Stack({ label, masked }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '0.4rem 0.5rem', minWidth: 130 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>{label}</div>
      {['Add & Norm', 'Feed Forward', 'Add & Norm', masked ? 'Masked Multi-Head Attn' : 'Multi-Head Attention'].map((s, idx) => (
        <div key={idx} style={{
          fontSize: '0.62rem', textAlign: 'center', padding: '2px 4px', margin: '2px 0', borderRadius: 3,
          background: s.includes('Attn') || s.includes('Attention') ? COLOR : 'var(--bg-hover)',
          color: s.includes('Attn') || s.includes('Attention') ? '#fff' : 'var(--text)',
        }}>{s}</div>
      ))}
      <div style={{ fontSize: '0.6rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: 3 }}>× N layers</div>
    </div>
  )
}

export default function VariantsWidget() {
  const [name, setName] = useState('Encoder-only')
  const v = VARIANTS[name]

  return (
    <div>
      <Row style={{ marginBottom: '0.7rem' }}>
        {Object.keys(VARIANTS).map(k => (
          <Btn key={k} onClick={() => setName(k)} primary={name === k}>{k}</Btn>
        ))}
      </Row>

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {v.stacks.map(s => <Stack key={s} label={s} masked={s === 'decoder'} />)}
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: 4 }}>attention pattern</div>
          <div style={{ display: 'flex', gap: '0.7rem' }}>
            {v.stacks.includes('encoder') && (
              <div style={{ textAlign: 'center' }}>
                <Pattern kind="bi" />
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>bidirectional</div>
              </div>
            )}
            {v.stacks.includes('decoder') && (
              <div style={{ textAlign: 'center' }}>
                <Pattern kind="causal" />
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>causal</div>
              </div>
            )}
            {v.stacks.length === 2 && (
              <div style={{ textAlign: 'center' }}>
                <Pattern kind="cross" />
                <div style={{ fontSize: '0.62rem', color: CROSS, marginTop: 2 }}>cross</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.78rem', marginTop: '0.7rem', lineHeight: 1.8 }}>
        <div><strong>Typical models:</strong> {v.models}</div>
        <div><strong>Training objective:</strong> {v.objective}</div>
        <div><strong>Best suited for:</strong> {v.suited}</div>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.6 }}>{v.note}</p>
    </div>
  )
}
