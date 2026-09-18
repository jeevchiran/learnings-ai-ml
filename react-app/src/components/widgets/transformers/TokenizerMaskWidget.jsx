import { useState } from 'react'
import { Toggle, Accent } from '../shared/ui.jsx'

const COLOR = '#1e3a8a'
const SPECIAL = '#b45309'
const MAX_LEN = 12

/* Tokenisation and the attention mask are printed as lists in most tutorials,
 * which hides the shape. Seeing the padding greyed out by the mask is what makes
 * the connection to the -infinity trick from Module 4 stick. */

const SENTENCES = {
  'the plot dragged but the acting saved it': ['the', 'plot', 'dragged', 'but', 'the', 'acting', 'saved', 'it'],
  'an absolute waste of two hours': ['an', 'absolute', 'waste', 'of', 'two', 'hours'],
  'unbelievably overlong': ['un', '##bel', '##ie', '##va', '##bly', 'over', '##long'],
}
const KEYS = Object.keys(SENTENCES)

export default function TokenizerMaskWidget() {
  const [k, setK] = useState(KEYS[0])
  const [useMask, setUseMask] = useState(true)

  const body = SENTENCES[k]
  const tokens = ['[CLS]', ...body, '[SEP]']
  while (tokens.length < MAX_LEN) tokens.push('[PAD]')
  const mask = tokens.map(t => (t === '[PAD]' ? 0 : 1))

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {KEYS.map(s => (
            <button key={s} onClick={() => setK(s)} style={{
              padding: '0.25rem 0.6rem', fontSize: '0.76rem', borderRadius: 4, cursor: 'pointer',
              border: k === s ? 'none' : '1px solid var(--border)',
              background: k === s ? COLOR : 'var(--bg)', color: k === s ? '#fff' : 'var(--text)',
            }}>{s}</button>
          ))}
        </div>

        <Toggle label="apply the attention mask" on={useMask} onChange={setUseMask} />

        <div style={{ display: 'flex', gap: 4, marginTop: '0.6rem', overflowX: 'auto', paddingBottom: 4 }}>
          {tokens.map((t, i) => {
            const special = t.startsWith('[')
            const pad = t === '[PAD]'
            const faded = pad && useMask
            return (
              <div key={i} style={{ textAlign: 'center', minWidth: 58, opacity: faded ? 0.28 : 1 }}>
                <div style={{
                  padding: '4px 6px', borderRadius: 4, fontSize: '0.71rem', fontFamily: 'monospace',
                  background: pad ? 'var(--bg-hover)' : special ? SPECIAL : COLOR,
                  color: pad ? 'var(--text)' : '#fff',
                }}>{t}</div>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: 2 }}>pos {i}</div>
                <div style={{
                  fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 700, marginTop: 2,
                  color: mask[i] ? COLOR : '#ef4444',
                }}>{mask[i]}</div>
              </div>
            )
          })}
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.45rem', lineHeight: 1.6, maxWidth: '62ch' }}>
          {body.length} word pieces plus the two special tokens gives {body.length + 2} real positions, padded out
          to {MAX_LEN}. The bottom row is the attention mask.{' '}
          {useMask
            ? 'With it applied, the greyed padding positions get scores of negative infinity and therefore exactly zero attention weight — the same mechanism as the causal mask, for a different reason.'
            : 'Without it, every padding position has a real learned embedding and soaks up softmax probability that belongs to the actual words.'}
          {k === KEYS[2] && ' Note the pieces beginning with hashes: a word the vocabulary has never seen is split into sub-words it does know.'}
        </p>
      </div>
    </Accent>
  )
}
