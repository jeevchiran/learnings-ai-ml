import { useState } from 'react'

const OBSERVED = 'teh'

const CANDIDATES = [
  { word: 'the',  freq: 69971,   pw: 0.070,     pew: 0.90, note: 'Single transposition: t-h swap ("the"→"teh"). Very common confusion matrix entry.' },
  { word: 'ten',  freq: 1210,    pw: 0.0012,    pew: 0.06, note: 'Substitution: n→h. Less common keyboard adjacency.' },
  { word: 'tee',  freq: 430,     pw: 0.0004,    pew: 0.04, note: 'Substitution: h→e. Uncommon confusion.' },
  { word: 'hen',  freq: 330,     pw: 0.0003,    pew: 0.03, note: 'Two edits needed (transposition + substitution). Higher edit distance, lower P(e|w).' },
  { word: 'teh',  freq: 1,       pw: 0.000001,  pew: 1.00, note: 'If "teh" were in vocabulary, P(e|w)=1 but P(w)≈0.' },
]

const EDITS = [
  ['the', 'Transposition: swap t↔h', 1],
  ['ten', 'Substitution: h→n', 1],
  ['tee', 'Substitution: h→e', 1],
  ['hen', 'Substitution: t→h', 1],
  ['teh', '(unchanged — non-word)', 0],
]

const STEPS = [
  {
    title: 'Step 1 — Input',
    explain: `We observe the string "teh". It is not in the standard dictionary — a non-word error. Goal: find the most probable intended word: argmax_w P(e|w)·P(w).`,
    render: () => (
      <div style={{ textAlign: 'center', padding: '1.5rem' }}>
        <span style={{ fontSize: '2.5rem', fontFamily: 'var(--font-mono,monospace)', color: 'var(--error,#dc2626)' }}>teh</span>
        <p style={{ color: 'var(--text-muted,#6b7280)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Observed string — not a valid English word</p>
        <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono,monospace)', fontSize: '0.9rem', padding: '0.5rem', background: 'var(--bg-secondary,#f9fafb)', borderRadius: '6px' }}>
          ŵ = argmax_w P(e|w) · P(w)
        </div>
      </div>
    )
  },
  {
    title: 'Step 2 — Candidate Generation',
    explain: 'Find all words within edit distance 1 of "teh": one insertion, deletion, substitution, or transposition.',
    render: () => (
      <table style={tblStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Candidate w</th>
            <th style={thStyle}>Edit from "teh"</th>
            <th style={thStyle}>Edit distance</th>
          </tr>
        </thead>
        <tbody>
          {EDITS.map(([w, edit, dist]) => (
            <tr key={w}>
              <td style={tdStyle}><strong>{w}</strong></td>
              <td style={tdStyle}>{edit}</td>
              <td style={tdStyle}>{dist}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  },
  {
    title: 'Step 3 — Language Model P(w)',
    explain: '"the" is the most common English word, far more probable than the others. Scores shown as unigram frequency per million words.',
    render: () => (
      <table style={tblStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Candidate w</th>
            <th style={thStyle}>Freq / million words</th>
            <th style={thStyle}>P(w)</th>
          </tr>
        </thead>
        <tbody>
          {CANDIDATES.map(c => (
            <tr key={c.word}>
              <td style={tdStyle}><strong>{c.word}</strong></td>
              <td style={tdStyle}>{c.freq.toLocaleString()}</td>
              <td style={tdStyle}>
                <span style={{ fontFamily: 'var(--font-mono,monospace)' }}>{c.pw.toFixed(6)}</span>
                <span style={{ display: 'inline-block', marginLeft: '8px', width: `${Math.round((c.pw / 0.070) * 80)}px`, height: '8px', background: 'var(--accent-blue,#2563eb)', opacity: 0.6, borderRadius: '2px', verticalAlign: 'middle' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  },
  {
    title: 'Step 4 — Error Model P(e|w)',
    explain: 'How probable is it that a user typing w produced "teh"? "the"→"teh" is a single adjacent-key transposition — very common.',
    render: () => (
      <table style={tblStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Candidate w</th>
            <th style={thStyle}>P(e|w)</th>
            <th style={thStyle}>Reasoning</th>
          </tr>
        </thead>
        <tbody>
          {CANDIDATES.map(c => (
            <tr key={c.word}>
              <td style={tdStyle}><strong>{c.word}</strong></td>
              <td style={tdStyle}>
                <span style={{ fontFamily: 'var(--font-mono,monospace)' }}>{c.pew.toFixed(2)}</span>
                <span style={{ display: 'inline-block', marginLeft: '8px', width: `${Math.round(c.pew * 60)}px`, height: '8px', background: 'var(--warning,#f59e0b)', opacity: 0.7, borderRadius: '2px', verticalAlign: 'middle' }} />
              </td>
              <td style={{ ...tdStyle, fontSize: '0.8rem', color: 'var(--text-muted,#6b7280)' }}>{c.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  },
  {
    title: 'Step 5 — Joint Score P(e|w)·P(w)',
    explain: 'The joint score is the numerator of Bayes. P(e) is constant and ignored for argmax.',
    render: () => {
      const scores = CANDIDATES.map(c => c.pew * c.pw)
      const maxScore = Math.max(...scores)
      return (
        <table style={tblStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Candidate w</th>
              <th style={thStyle}>P(e|w)</th>
              <th style={thStyle}>P(w)</th>
              <th style={thStyle}>P(e|w)·P(w)</th>
            </tr>
          </thead>
          <tbody>
            {CANDIDATES.map((c, i) => {
              const score = scores[i]
              const isMax = score === maxScore
              return (
                <tr key={c.word} style={isMax ? { background: 'rgba(22,163,74,0.08)', fontWeight: 600 } : {}}>
                  <td style={tdStyle}>{isMax ? '🏆 ' : ''}<strong>{c.word}</strong></td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono,monospace)' }}>{c.pew.toFixed(2)}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono,monospace)' }}>{c.pw.toFixed(6)}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono,monospace)', color: isMax ? 'var(--success,#16a34a)' : 'inherit' }}>
                    {(c.pew * c.pw).toExponential(3)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )
    }
  },
  {
    title: 'Step 6 — argmax',
    explain: '"the" wins with joint score ≈6.3×10⁻³ — more than 80× higher than "ten". The model correctly corrects "teh" → "the".',
    render: () => (
      <div style={{ textAlign: 'center', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <div>
            <p style={{ color: 'var(--text-muted,#6b7280)', fontSize: '0.85rem', margin: '0 0 0.25rem' }}>Observed</p>
            <span style={{ fontSize: '2rem', fontFamily: 'var(--font-mono,monospace)', color: 'var(--error,#dc2626)' }}>teh</span>
          </div>
          <span style={{ fontSize: '2rem', color: 'var(--text-muted,#6b7280)' }}>→</span>
          <div>
            <p style={{ color: 'var(--text-muted,#6b7280)', fontSize: '0.85rem', margin: '0 0 0.25rem' }}>Correction</p>
            <span style={{ fontSize: '2rem', fontFamily: 'var(--font-mono,monospace)', color: 'var(--success,#16a34a)' }}>the</span>
          </div>
        </div>
        <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono,monospace)', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(22,163,74,0.08)', border: '1px solid var(--success,#16a34a)', borderRadius: '6px', display: 'inline-block' }}>
          ŵ = "the", score = 0.90 × 0.070 = 0.063
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted,#6b7280)', marginTop: '0.75rem', maxWidth: '480px', margin: '0.75rem auto 0' }}>
          High P(w) (most common English word) × high P(e|w) (simple transposition) overwhelms all competitors.
        </p>
      </div>
    )
  },
]

const tblStyle = { borderCollapse: 'collapse', width: '100%', fontSize: '0.88rem' }
const thStyle = { border: '1px solid var(--border,#d1d5db)', padding: '0.4rem 0.6rem', background: 'rgba(37,99,235,0.06)', textAlign: 'left' }
const tdStyle = { border: '1px solid var(--border,#d1d5db)', padding: '0.4rem 0.6rem' }

export default function NoisyChannelWidget() {
  const [step, setStep] = useState(0)

  const current = STEPS[step]

  return (
    <div style={{ fontFamily: 'var(--font-sans,sans-serif)', fontSize: '0.9rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--accent-blue,#2563eb)' }}>{current.title}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted,#6b7280)' }}>Step {step + 1} / {STEPS.length}</span>
      </div>

      <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary,#f9fafb)', border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-muted,#6b7280)' }}>
        {current.explain}
      </div>

      <div style={{ overflowX: 'auto', minHeight: '6rem' }}>
        {current.render()}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={btnStyle}>← Prev</button>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1} style={btnStyle}>Next →</button>
        <button onClick={() => setStep(0)} style={{ ...btnStyle, marginLeft: 'auto', background: 'var(--bg-secondary,#f3f4f6)', color: 'var(--text,#111)' }}>Reset</button>
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
  fontSize: '0.85rem',
}
