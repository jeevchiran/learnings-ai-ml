import { useState } from 'react'

// POS color mapping
const POS_COLORS = {
  NOUN:  { bg: 'rgba(37,99,235,0.15)',  border: 'rgba(37,99,235,0.5)',  label: '#1d4ed8' },
  VERB:  { bg: 'rgba(220,38,38,0.15)',  border: 'rgba(220,38,38,0.5)',  label: '#b91c1c' },
  ADJ:   { bg: 'rgba(22,163,74,0.15)',  border: 'rgba(22,163,74,0.5)',  label: '#15803d' },
  ADV:   { bg: 'rgba(217,70,239,0.15)', border: 'rgba(217,70,239,0.5)', label: '#a21caf' },
  DET:   { bg: 'rgba(234,179,8,0.15)',  border: 'rgba(234,179,8,0.5)',  label: '#a16207' },
  ADP:   { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.5)', label: '#c2410c' },
  PROPN: { bg: 'rgba(6,182,212,0.15)',  border: 'rgba(6,182,212,0.5)',  label: '#0e7490' },
  OTHER: { bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.4)', label: '#374151' },
  PUNCT: { bg: 'transparent',           border: 'transparent',          label: '#9ca3af' },
}

const SENTENCES = [
  {
    text: 'The quick brown fox jumps over the lazy dog.',
    note: '',
    tokens: [
      { word: 'The', pos: 'DET', tag: 'DT', explain: 'determiner' },
      { word: 'quick', pos: 'ADJ', tag: 'JJ', explain: 'adjective' },
      { word: 'brown', pos: 'ADJ', tag: 'JJ', explain: 'adjective' },
      { word: 'fox', pos: 'NOUN', tag: 'NN', explain: 'noun, singular' },
      { word: 'jumps', pos: 'VERB', tag: 'VBZ', explain: 'verb, 3rd person singular present' },
      { word: 'over', pos: 'ADP', tag: 'IN', explain: 'preposition' },
      { word: 'the', pos: 'DET', tag: 'DT', explain: 'determiner' },
      { word: 'lazy', pos: 'ADJ', tag: 'JJ', explain: 'adjective' },
      { word: 'dog', pos: 'NOUN', tag: 'NN', explain: 'noun, singular' },
      { word: '.', pos: 'PUNCT', tag: '.', explain: 'punctuation' },
    ],
    chunks: [[0, 3], [6, 8]],
  },
  {
    text: 'Time flies like an arrow; fruit flies like a banana.',
    note: "Classic garden-path: 'flies' is VERB (insects fly) or NOUN (the insect) depending on reading.",
    tokens: [
      { word: 'Time', pos: 'NOUN', tag: 'NN', explain: 'noun (subject in reading 1)' },
      { word: 'flies', pos: 'VERB', tag: 'VBZ', explain: 'verb in reading 1; NOUN in reading 2' },
      { word: 'like', pos: 'ADP', tag: 'IN', explain: 'preposition' },
      { word: 'an', pos: 'DET', tag: 'DT', explain: 'determiner' },
      { word: 'arrow', pos: 'NOUN', tag: 'NN', explain: 'noun' },
      { word: ';', pos: 'PUNCT', tag: ':', explain: 'punctuation' },
      { word: 'fruit', pos: 'NOUN', tag: 'NN', explain: 'noun (compound modifier)' },
      { word: 'flies', pos: 'NOUN', tag: 'NNS', explain: 'noun, plural (the insect)' },
      { word: 'like', pos: 'VERB', tag: 'VBP', explain: 'verb (to like)' },
      { word: 'a', pos: 'DET', tag: 'DT', explain: 'determiner' },
      { word: 'banana', pos: 'NOUN', tag: 'NN', explain: 'noun' },
      { word: '.', pos: 'PUNCT', tag: '.', explain: 'punctuation' },
    ],
    chunks: [[0, 0], [3, 4], [6, 7], [9, 10]],
  },
  {
    text: 'Apple is opening a new store in London next year.',
    note: '',
    tokens: [
      { word: 'Apple', pos: 'PROPN', tag: 'NNP', explain: 'proper noun (company)' },
      { word: 'is', pos: 'VERB', tag: 'VBZ', explain: 'auxiliary verb' },
      { word: 'opening', pos: 'VERB', tag: 'VBG', explain: 'present participle' },
      { word: 'a', pos: 'DET', tag: 'DT', explain: 'determiner' },
      { word: 'new', pos: 'ADJ', tag: 'JJ', explain: 'adjective' },
      { word: 'store', pos: 'NOUN', tag: 'NN', explain: 'noun, singular' },
      { word: 'in', pos: 'ADP', tag: 'IN', explain: 'preposition' },
      { word: 'London', pos: 'PROPN', tag: 'NNP', explain: 'proper noun (city)' },
      { word: 'next', pos: 'ADJ', tag: 'JJ', explain: 'adjective (temporal)' },
      { word: 'year', pos: 'NOUN', tag: 'NN', explain: 'noun' },
      { word: '.', pos: 'PUNCT', tag: '.', explain: 'punctuation' },
    ],
    chunks: [[0, 0], [3, 5], [7, 7], [8, 9]],
  },
  {
    text: 'The old man the boats.',
    note: "Garden-path: 'man' is a VERB (to operate), not a noun. 'The old' = subject (elderly people).",
    tokens: [
      { word: 'The', pos: 'DET', tag: 'DT', explain: 'determiner' },
      { word: 'old', pos: 'NOUN', tag: 'NNS', explain: 'noun plural (the elderly people)' },
      { word: 'man', pos: 'VERB', tag: 'VBP', explain: "verb 'to man' (operate) — not NOUN as readers expect" },
      { word: 'the', pos: 'DET', tag: 'DT', explain: 'determiner' },
      { word: 'boats', pos: 'NOUN', tag: 'NNS', explain: 'noun plural (direct object)' },
      { word: '.', pos: 'PUNCT', tag: '.', explain: 'punctuation' },
    ],
    chunks: [[0, 1], [3, 4]],
  },
  {
    text: 'Running fast improves cardiovascular health.',
    note: "'Running' is a gerund acting as subject — coarse POS is NOUN here, though PTB tag is VBG.",
    tokens: [
      { word: 'Running', pos: 'NOUN', tag: 'VBG', explain: 'gerund as subject → NOUN (coarse POS)' },
      { word: 'fast', pos: 'ADV', tag: 'RB', explain: 'adverb' },
      { word: 'improves', pos: 'VERB', tag: 'VBZ', explain: '3rd person singular present' },
      { word: 'cardiovascular', pos: 'ADJ', tag: 'JJ', explain: 'adjective' },
      { word: 'health', pos: 'NOUN', tag: 'NN', explain: 'noun' },
      { word: '.', pos: 'PUNCT', tag: '.', explain: 'punctuation' },
    ],
    chunks: [[0, 0], [3, 4]],
  },
]

// Simple greedy NP chunker {DT? JJ* NN+}
function computeNPChunks(tokens) {
  const chunks = []
  let i = 0
  while (i < tokens.length) {
    const start = i
    if (tokens[i].pos === 'DET') i++
    if (i >= tokens.length) break
    while (i < tokens.length && (tokens[i].pos === 'ADJ' || tokens[i].tag === 'JJ' || tokens[i].tag === 'JJR' || tokens[i].tag === 'JJS')) i++
    const nounStart = i
    while (i < tokens.length && (tokens[i].pos === 'NOUN' || tokens[i].pos === 'PROPN')) i++
    if (i > nounStart) chunks.push([start, i - 1])
    else i = start + 1
  }
  return chunks
}

function TokenDisplay({ tokens, chunks }) {
  const chunkSet = new Set()
  if (chunks) {
    chunks.forEach(([a, b]) => {
      for (let k = a; k <= b; k++) chunkSet.add(k)
    })
  }
  const [tooltip, setTooltip] = useState(null)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 0.4rem', padding: '0.75rem', lineHeight: '1.8' }}>
      {tokens.map((tok, idx) => {
        const colors = POS_COLORS[tok.pos] || POS_COLORS.OTHER
        const inChunk = chunkSet.has(idx)
        return (
          <div
            key={idx}
            style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
            onMouseEnter={() => setTooltip(idx)}
            onMouseLeave={() => setTooltip(null)}
          >
            <span style={{
              padding: '0.2rem 0.45rem',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              fontWeight: inChunk ? 700 : 400,
              outline: inChunk ? `2px solid ${colors.border}` : 'none',
              outlineOffset: '1px',
              fontSize: '1rem',
            }}>
              {tok.word}
            </span>
            <span style={{ fontSize: '0.65rem', color: colors.label, marginTop: '2px', fontFamily: 'var(--font-mono,monospace)', fontWeight: 600 }}>
              {tok.tag}
            </span>
            {tooltip === idx && (
              <div style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--bg,#fff)', border: '1px solid var(--border,#d1d5db)',
                borderRadius: '4px', padding: '0.3rem 0.5rem', whiteSpace: 'nowrap',
                fontSize: '0.75rem', zIndex: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                color: 'var(--text,#111)',
              }}>
                <strong>{tok.pos}</strong> — {tok.explain}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Legend
function Legend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
      {Object.entries(POS_COLORS).filter(([k]) => k !== 'PUNCT').map(([pos, c]) => (
        <span key={pos} style={{ padding: '0.1rem 0.4rem', background: c.bg, border: `1px solid ${c.border}`, borderRadius: '3px', color: c.label, fontWeight: 600 }}>{pos}</span>
      ))}
    </div>
  )
}

export default function POSTaggerWidget() {
  const [sentIdx, setSentIdx] = useState(0)
  const [mode, setMode] = useState('pos') // 'pos' | 'chunk'

  const sent = SENTENCES[sentIdx]
  const chunks = mode === 'chunk' ? computeNPChunks(sent.tokens) : null

  return (
    <div style={{ fontFamily: 'var(--font-sans,sans-serif)', fontSize: '0.9rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted,#6b7280)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sentence</span>
          <select
            value={sentIdx}
            onChange={e => setSentIdx(parseInt(e.target.value))}
            style={selectStyle}
          >
            {SENTENCES.map((s, i) => (
              <option key={i} value={i}>{i + 1}. {s.text.slice(0, 45)}{s.text.length > 45 ? '…' : ''}</option>
            ))}
          </select>
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', paddingBottom: '2px' }}>
          <button onClick={() => setMode('pos')} style={{ ...btnStyle, background: mode === 'pos' ? 'var(--accent-blue,#2563eb)' : 'var(--bg-secondary,#f3f4f6)', color: mode === 'pos' ? '#fff' : 'var(--text,#111)' }}>
            POS Tags
          </button>
          <button onClick={() => setMode('chunk')} style={{ ...btnStyle, background: mode === 'chunk' ? 'var(--accent-blue,#2563eb)' : 'var(--bg-secondary,#f3f4f6)', color: mode === 'chunk' ? '#fff' : 'var(--text,#111)' }}>
            NP Chunks
          </button>
        </div>
      </div>

      <Legend />

      <div style={{ border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', background: 'var(--bg-secondary,#f9fafb)', minHeight: '5rem', padding: '0.25rem' }}>
        <TokenDisplay tokens={sent.tokens} chunks={chunks} />
      </div>

      {mode === 'chunk' && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted,#6b7280)', padding: '0.5rem', background: 'rgba(37,99,235,0.04)', border: '1px solid var(--border,#d1d5db)', borderRadius: '4px' }}>
          Found {chunks.length} NP chunk{chunks.length !== 1 ? 's' : ''} using rule {'{DT? JJ* NN+}'}. Hover tokens to see POS tags.
          {sent.note ? ` Note: ${sent.note}` : ''}
        </div>
      )}

      {mode === 'pos' && sent.note && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted,#6b7280)', padding: '0.5rem', background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '4px' }}>
          <strong>Note:</strong> {sent.note}
        </div>
      )}

      <p style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted,#6b7280)' }}>Hover over a token to see its POS explanation. Chunked spans are bold-outlined.</p>
    </div>
  )
}

const btnStyle = {
  padding: '0.35rem 0.75rem',
  border: '1px solid var(--border,#d1d5db)',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.83rem',
}

const selectStyle = {
  padding: '0.35rem 0.6rem',
  border: '1px solid var(--border,#d1d5db)',
  borderRadius: '4px',
  background: 'var(--bg-secondary,#f9fafb)',
  color: 'var(--text,#111)',
  fontSize: '0.85rem',
  maxWidth: '340px',
}
