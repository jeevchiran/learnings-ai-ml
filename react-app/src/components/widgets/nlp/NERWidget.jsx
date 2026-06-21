import { useState } from 'react'

// ── Label colors ──────────────────────────────────────────────────────────────
const LABEL_COLORS = {
  PERSON: { bg: 'rgba(37,99,235,0.15)',  border: 'rgba(37,99,235,0.5)',  label: '#1d4ed8', tag: '#2563eb' },
  ORG:    { bg: 'rgba(22,163,74,0.15)',  border: 'rgba(22,163,74,0.5)',  label: '#15803d', tag: '#16a34a' },
  GPE:    { bg: 'rgba(217,70,239,0.15)', border: 'rgba(217,70,239,0.5)', label: '#a21caf', tag: '#9333ea' },
  DATE:   { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.5)', label: '#c2410c', tag: '#ea580c' },
  O:      { bg: 'transparent',           border: 'transparent',           label: 'var(--text,#111)', tag: '#9ca3af' },
}

const IOB_COLORS = {
  'B-PERSON': LABEL_COLORS.PERSON,
  'I-PERSON': LABEL_COLORS.PERSON,
  'B-ORG':    LABEL_COLORS.ORG,
  'I-ORG':    LABEL_COLORS.ORG,
  'B-GPE':    LABEL_COLORS.GPE,
  'I-GPE':    LABEL_COLORS.GPE,
  'B-DATE':   LABEL_COLORS.DATE,
  'I-DATE':   LABEL_COLORS.DATE,
  O:          LABEL_COLORS.O,
}

// ── Sentence data ─────────────────────────────────────────────────────────────
const SENTENCES = [
  {
    ner: [
      { word: 'Barack',       label: 'PERSON' },
      { word: 'Obama',        label: 'PERSON' },
      { word: 'visited',      label: 'O' },
      { word: "Apple's",      label: 'ORG' },
      { word: 'headquarters', label: 'O' },
      { word: 'in',           label: 'O' },
      { word: 'Cupertino',    label: 'GPE' },
      { word: 'on',           label: 'O' },
      { word: 'Monday',       label: 'DATE' },
      { word: '.',            label: 'O' },
    ],
    iob: [
      { word: 'Barack',       iob: 'B-PERSON' },
      { word: 'Obama',        iob: 'I-PERSON' },
      { word: 'visited',      iob: 'O' },
      { word: "Apple's",      iob: 'B-ORG' },
      { word: 'headquarters', iob: 'O' },
      { word: 'in',           iob: 'O' },
      { word: 'Cupertino',    iob: 'B-GPE' },
      { word: 'on',           iob: 'O' },
      { word: 'Monday',       iob: 'B-DATE' },
      { word: '.',            iob: 'O' },
    ],
  },
  {
    ner: [
      { word: 'Tesla',         label: 'ORG' },
      { word: 'CEO',           label: 'O' },
      { word: 'Elon',          label: 'PERSON' },
      { word: 'Musk',          label: 'PERSON' },
      { word: 'announced',     label: 'O' },
      { word: 'new',           label: 'O' },
      { word: 'gigafactories', label: 'O' },
      { word: 'in',            label: 'O' },
      { word: 'Texas',         label: 'GPE' },
      { word: 'and',           label: 'O' },
      { word: 'Berlin',        label: 'GPE' },
      { word: 'for',           label: 'O' },
      { word: '2025',          label: 'DATE' },
      { word: '.',             label: 'O' },
    ],
    iob: [
      { word: 'Tesla',         iob: 'B-ORG' },
      { word: 'CEO',           iob: 'O' },
      { word: 'Elon',          iob: 'B-PERSON' },
      { word: 'Musk',          iob: 'I-PERSON' },
      { word: 'announced',     iob: 'O' },
      { word: 'new',           iob: 'O' },
      { word: 'gigafactories', iob: 'O' },
      { word: 'in',            iob: 'O' },
      { word: 'Texas',         iob: 'B-GPE' },
      { word: 'and',           iob: 'O' },
      { word: 'Berlin',        iob: 'B-GPE' },
      { word: 'for',           iob: 'O' },
      { word: '2025',          iob: 'B-DATE' },
      { word: '.',             iob: 'O' },
    ],
  },
  {
    ner: [
      { word: 'The',       label: 'O' },
      { word: 'United',    label: 'ORG' },
      { word: 'Nations',   label: 'ORG' },
      { word: 'held',      label: 'O' },
      { word: 'an',        label: 'O' },
      { word: 'emergency', label: 'O' },
      { word: 'session',   label: 'O' },
      { word: 'in',        label: 'O' },
      { word: 'Geneva',    label: 'GPE' },
      { word: 'last',      label: 'O' },
      { word: 'Tuesday',   label: 'DATE' },
      { word: '.',         label: 'O' },
    ],
    iob: [
      { word: 'The',       iob: 'O' },
      { word: 'United',    iob: 'B-ORG' },
      { word: 'Nations',   iob: 'I-ORG' },
      { word: 'held',      iob: 'O' },
      { word: 'an',        iob: 'O' },
      { word: 'emergency', iob: 'O' },
      { word: 'session',   iob: 'O' },
      { word: 'in',        iob: 'O' },
      { word: 'Geneva',    iob: 'B-GPE' },
      { word: 'last',      iob: 'O' },
      { word: 'Tuesday',   iob: 'B-DATE' },
      { word: '.',         iob: 'O' },
    ],
  },
  {
    ner: [
      { word: 'Professor', label: 'O' },
      { word: 'Marie',     label: 'PERSON' },
      { word: 'Curie',     label: 'PERSON' },
      { word: 'won',       label: 'O' },
      { word: 'the',       label: 'O' },
      { word: 'Nobel',     label: 'O' },
      { word: 'Prize',     label: 'O' },
      { word: 'in',        label: 'O' },
      { word: 'Physics',   label: 'O' },
      { word: 'in',        label: 'O' },
      { word: '1903',      label: 'DATE' },
      { word: '.',         label: 'O' },
    ],
    iob: [
      { word: 'Professor', iob: 'O' },
      { word: 'Marie',     iob: 'B-PERSON' },
      { word: 'Curie',     iob: 'I-PERSON' },
      { word: 'won',       iob: 'O' },
      { word: 'the',       iob: 'O' },
      { word: 'Nobel',     iob: 'O' },
      { word: 'Prize',     iob: 'O' },
      { word: 'in',        iob: 'O' },
      { word: 'Physics',   iob: 'O' },
      { word: 'in',        iob: 'O' },
      { word: '1903',      iob: 'B-DATE' },
      { word: '.',         iob: 'O' },
    ],
  },
]

// ── NER Token display ─────────────────────────────────────────────────────────
function NERDisplay({ tokens }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.3rem', padding: '0.75rem', lineHeight: '2' }}>
      {tokens.map((tok, i) => {
        const c = LABEL_COLORS[tok.label] || LABEL_COLORS.O
        const isEntity = tok.label !== 'O'
        return (
          <span key={i} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{
              padding: '0.15rem 0.4rem',
              background: isEntity ? c.bg : 'transparent',
              border: isEntity ? `1px solid ${c.border}` : '1px solid transparent',
              borderRadius: '4px',
              fontWeight: isEntity ? 600 : 400,
              fontSize: '0.95rem',
            }}>
              {tok.word}
            </span>
            {isEntity && (
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono,monospace)', color: c.tag, fontWeight: 700, letterSpacing: '0.03em' }}>
                {tok.label}
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}

// ── IOB Sequence display ──────────────────────────────────────────────────────
function IOBDisplay({ tokens }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', padding: '0.75rem' }}>
      {tokens.map((tok, i) => {
        const c = IOB_COLORS[tok.iob] || LABEL_COLORS.O
        const isEntity = tok.iob !== 'O'
        return (
          <div key={i} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: isEntity ? 600 : 400 }}>{tok.word}</span>
            <span style={{
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono,monospace)',
              padding: '0.1rem 0.3rem',
              background: isEntity ? c.bg : 'var(--bg-secondary,#f3f4f6)',
              border: `1px solid ${isEntity ? c.border : 'var(--border,#d1d5db)'}`,
              borderRadius: '3px',
              color: isEntity ? c.tag : 'var(--text-muted,#6b7280)',
              fontWeight: tok.iob.startsWith('B-') ? 700 : 400,
            }}>
              {tok.iob}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── CRF Lattice ───────────────────────────────────────────────────────────────
const CRF_TOKENS = ['Barack', 'Obama', 'visited', 'New', 'York']
const CRF_LABELS = ['B-PER', 'I-PER', 'O']
const VITERBI_SCORES = [
  [4.2, null, 1.1],
  [2.1, 5.8, 0.9],
  [1.0, null, 6.3],
  [4.5, null, 1.2],
  [2.0, 5.1, 0.8],
]
const OPTIMAL_PATH = [0, 1, 2, 0, 1]

const CRF_STEPS = [
  { reveal: -1, explain: 'Empty lattice. Rows = label states (B-PER, I-PER, O). Columns = tokens. Each cell holds a Viterbi score — the best total score reaching that label state at that position.' },
  { reveal: 0, explain: '"Barack": B-PER scores 4.2 (capitalization + first-name features). I-PER is BLOCKED (×) — cannot start with I. O scores 1.1.' },
  { reveal: 1, explain: '"Obama": I-PER = 5.8 (continues B-PER from Barack). B-PER = 2.1 (possible new entity start). O→I-PER is blocked (invalid transition).' },
  { reveal: 2, explain: '"visited": O scores 6.3 — common verb, strong O emission. B-PER = 1.0. I-PER blocked (prior O cannot transition to I-PER).' },
  { reveal: 3, explain: '"New": B-PER = 4.5 (capitalized, starts possible entity). I-PER blocked. O = 1.2.' },
  { reveal: 4, explain: '"York": I-PER = 5.1 (continues "New"). B-PER = 2.0. O = 0.8. Viterbi back-traces: B-PER → I-PER → O → B-PER → I-PER (highlighted in green).' },
]

function CRFLattice({ revealUpTo }) {
  const isFinalStep = revealUpTo === CRF_STEPS.length - 1

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: '5px', fontSize: '0.85rem' }}>
        <thead>
          <tr>
            <th style={{ fontSize: '0.72rem', color: 'var(--text-muted,#6b7280)', textAlign: 'right', paddingRight: '0.5rem' }}>Label \ Token</th>
            {CRF_TOKENS.map((tok, ti) => (
              <th key={ti} style={{ fontFamily: 'var(--font-mono,monospace)', padding: '0.3rem 0.5rem', opacity: ti > revealUpTo ? 0.25 : 1, transition: 'opacity 0.3s' }}>{tok}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CRF_LABELS.map((lbl, li) => (
            <tr key={lbl}>
              <th style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono,monospace)', textAlign: 'right', paddingRight: '0.5rem', color: 'var(--text-muted,#6b7280)' }}>{lbl}</th>
              {CRF_TOKENS.map((tok, ti) => {
                const score = ti <= revealUpTo ? VITERBI_SCORES[ti][li] : null
                const isBlocked = score === null && ti <= revealUpTo
                const isOnPath = isFinalStep && ti <= revealUpTo && OPTIMAL_PATH[ti] === li && !isBlocked
                const hasScore = score !== null

                let bg = 'var(--bg-secondary,#f3f4f6)'
                let color = 'var(--text,#111)'
                let border = '1px solid var(--border,#d1d5db)'
                if (ti > revealUpTo) { bg = 'var(--bg-secondary,#f3f4f6)'; color = 'transparent'; border = '1px solid transparent' }
                else if (isOnPath) { bg = 'rgba(22,163,74,0.2)'; border = '2px solid var(--success,#16a34a)'; color = 'var(--success,#16a34a)' }
                else if (isBlocked) { bg = 'rgba(220,38,38,0.08)'; border = '1px solid rgba(220,38,38,0.3)' }

                return (
                  <td key={ti} style={{
                    background: bg, color, border, borderRadius: '4px',
                    padding: '0.35rem 0.6rem', textAlign: 'center',
                    fontFamily: 'var(--font-mono,monospace)', fontWeight: isOnPath ? 700 : 400,
                    minWidth: '3rem', opacity: ti > revealUpTo ? 0.15 : 1, transition: 'all 0.3s',
                  }}>
                    {isBlocked ? <span style={{ color: 'var(--error,#dc2626)', fontWeight: 700 }}>×</span>
                      : hasScore ? score.toFixed(1)
                      : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Coreference Visualizer ────────────────────────────────────────────────────
const CHAIN_COLORS = [
  { bg: 'rgba(37,99,235,0.15)',  border: 'rgba(37,99,235,0.5)',  label: '#1d4ed8', name: 'Chain 0 — Marie Curie' },
  { bg: 'rgba(220,38,38,0.15)', border: 'rgba(220,38,38,0.5)',  label: '#b91c1c', name: 'Chain 1 — Warsaw' },
  { bg: 'rgba(22,163,74,0.15)', border: 'rgba(22,163,74,0.5)',  label: '#15803d', name: 'Chain 2 — Paris' },
]

const COREF_PARTS = [
  { text: 'Marie Curie', chain: 0 },
  { text: ' was born in ', chain: -1 },
  { text: 'Warsaw', chain: 1 },
  { text: ' in 1867. ', chain: -1 },
  { text: 'She', chain: 0 },
  { text: ' moved to ', chain: -1 },
  { text: 'Paris', chain: 2 },
  { text: ' to study physics. ', chain: -1 },
  { text: 'The scientist', chain: 0 },
  { text: ' won two Nobel Prizes — one in Physics and one in Chemistry. ', chain: -1 },
  { text: 'Her', chain: 0 },
  { text: ' work on radioactivity changed modern medicine.', chain: -1 },
]

const COREF_STEPS = [
  { chains: new Set(), explain: 'Plain text — no annotation. Can you spot which phrases refer to the same entity?' },
  { chains: new Set([0]), explain: 'Chain 0 (blue): "Marie Curie", "She", "The scientist", "Her" — four different expressions for the same person (proper noun, pronoun, definite NP, possessive).' },
  { chains: new Set([0, 1]), explain: 'Chain 1 (red): "Warsaw" — single mention (proper noun). Even single-mention entities form chains; useful for knowledge base linking.' },
  { chains: new Set([0, 1, 2]), explain: 'All chains visible. Chain 2 (green): "Paris" — another single-mention location. "She" and "Her" are unambiguous only because Marie Curie is the sole female referent.' },
]

// ── Main Widget ───────────────────────────────────────────────────────────────
export default function NERWidget() {
  const [sentIdx, setSentIdx] = useState(0)
  const [crfStep, setCrfStep] = useState(0)
  const [corefStep, setCorefStep] = useState(0)

  const sent = SENTENCES[sentIdx]
  const crfReveal = CRF_STEPS[crfStep].reveal
  const corefChains = COREF_STEPS[corefStep].chains

  return (
    <div style={{ fontFamily: 'var(--font-sans,sans-serif)', fontSize: '0.9rem' }}>
      {/* Widget 1: NER + IOB */}
      <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '0.95rem' }}>NER Highlighter + IOB View</h4>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted,#6b7280)', textTransform: 'uppercase' }}>Sentence</span>
          <select value={sentIdx} onChange={e => setSentIdx(parseInt(e.target.value))} style={selectStyle}>
            {SENTENCES.map((_, i) => <option key={i} value={i}>Sentence {i + 1}</option>)}
          </select>
        </label>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
        {Object.entries(LABEL_COLORS).filter(([k]) => k !== 'O').map(([k, c]) => (
          <span key={k} style={{ padding: '0.1rem 0.4rem', background: c.bg, border: `1px solid ${c.border}`, borderRadius: '3px', color: c.tag, fontWeight: 600 }}>{k}</span>
        ))}
      </div>

      <div style={{ border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', background: 'var(--bg-secondary,#f9fafb)', padding: '0.25rem', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', color: 'var(--text-muted,#6b7280)', borderBottom: '1px solid var(--border,#d1d5db)' }}>NER Highlighted</div>
        <NERDisplay tokens={sent.ner} />
      </div>

      <div style={{ border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', background: 'var(--bg-secondary,#f9fafb)', padding: '0.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', color: 'var(--text-muted,#6b7280)', borderBottom: '1px solid var(--border,#d1d5db)' }}>IOB Sequence (B = Begin, I = Inside, O = Outside)</div>
        <IOBDisplay tokens={sent.iob} />
      </div>

      {/* Widget 2: CRF Lattice */}
      <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--border,#d1d5db)' }} />
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>CRF Lattice Step-Through</h4>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted,#6b7280)' }}>Sentence: "Barack Obama visited New York"</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted,#6b7280)' }}>Step {crfStep + 1} / {CRF_STEPS.length}</span>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: 'var(--bg-secondary,#f9fafb)', border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-muted,#6b7280)' }}>
        {CRF_STEPS[crfStep].explain}
      </div>

      <div style={{ overflowX: 'auto', marginBottom: '0.75rem' }}>
        <CRFLattice revealUpTo={crfReveal} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button onClick={() => setCrfStep(s => Math.max(0, s - 1))} disabled={crfStep === 0} style={btnStyle}>← Prev</button>
        <button onClick={() => setCrfStep(s => Math.min(CRF_STEPS.length - 1, s + 1))} disabled={crfStep === CRF_STEPS.length - 1} style={btnStyle}>Next →</button>
        <button onClick={() => setCrfStep(0)} style={{ ...btnStyle, marginLeft: 'auto', background: 'var(--bg-secondary,#f3f4f6)', color: 'var(--text,#111)' }}>Reset</button>
      </div>

      {/* Widget 3: Coreference */}
      <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--border,#d1d5db)' }} />
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>Coreference Chain Visualizer</h4>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted,#6b7280)' }}>Step {corefStep + 1} / {COREF_STEPS.length}</span>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: 'var(--bg-secondary,#f9fafb)', border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-muted,#6b7280)' }}>
        {COREF_STEPS[corefStep].explain}
      </div>

      <div style={{ fontSize: '1rem', lineHeight: '2.2', padding: '0.75rem 1rem', background: 'var(--bg-secondary,#f9fafb)', border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', marginBottom: '0.75rem' }}>
        {COREF_PARTS.map((part, i) => {
          if (part.chain >= 0 && corefChains.has(part.chain)) {
            const c = CHAIN_COLORS[part.chain]
            return (
              <span key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '3px', padding: '0.1rem 0.3rem', color: c.label, fontWeight: 600 }}>
                {part.text}
              </span>
            )
          }
          return <span key={i}>{part.text}</span>
        })}
      </div>

      {corefStep === COREF_STEPS.length - 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
          {CHAIN_COLORS.map((c, i) => (
            <span key={i} style={{ padding: '0.15rem 0.5rem', background: c.bg, border: `1px solid ${c.border}`, borderRadius: '3px', color: c.label, fontWeight: 600 }}>{c.name}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => setCorefStep(s => Math.max(0, s - 1))} disabled={corefStep === 0} style={btnStyle}>← Prev</button>
        <button onClick={() => setCorefStep(s => Math.min(COREF_STEPS.length - 1, s + 1))} disabled={corefStep === COREF_STEPS.length - 1} style={btnStyle}>Next →</button>
        <button onClick={() => setCorefStep(0)} style={{ ...btnStyle, marginLeft: 'auto', background: 'var(--bg-secondary,#f3f4f6)', color: 'var(--text,#111)' }}>Reset</button>
      </div>
    </div>
  )
}

const btnStyle = {
  padding: '0.35rem 0.75rem',
  background: 'var(--accent-blue,#2563eb)',
  color: '#fff',
  border: 'none',
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
}
