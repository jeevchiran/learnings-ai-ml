import { useState, useMemo } from 'react'
import { Row, Btn, Readout } from '../shared/ui.jsx'

const COLOR = '#b45309'
const REFERENCE = 'the cat is on the mat'

const CANDIDATES = [
  { label: 'Exact match', text: 'the cat is on the mat' },
  { label: 'Close paraphrase', text: 'the cat sat on the mat' },
  { label: 'Wrong sentence', text: 'a dog runs in the park' },
]

function toTokens(s) { return s.trim().toLowerCase().split(/\s+/) }

function ngrams(tokens, n) {
  const out = []
  for (let i = 0; i + n <= tokens.length; i++) out.push(tokens.slice(i, i + n).join(' '))
  return out
}

function countMap(arr) {
  const m = new Map()
  for (const x of arr) m.set(x, (m.get(x) || 0) + 1)
  return m
}

function clippedPrecision(candTokens, refTokens, n) {
  const candGrams = ngrams(candTokens, n)
  if (candGrams.length === 0) return null
  const candCounts = countMap(candGrams)
  const refCounts = countMap(ngrams(refTokens, n))
  let clipped = 0
  for (const [g, c] of candCounts) clipped += Math.min(c, refCounts.get(g) || 0)
  return { precision: clipped / candGrams.length, clipped, total: candGrams.length }
}

export default function BLEUCalculatorWidget() {
  const [choice, setChoice] = useState(0)
  const candidate = CANDIDATES[choice].text

  const result = useMemo(() => {
    const cand = toTokens(candidate)
    const ref = toTokens(REFERENCE)
    const N = Math.min(4, cand.length)
    const perN = []
    for (let n = 1; n <= N; n++) perN.push({ n, ...clippedPrecision(cand, ref, n) })
    const zero = perN.some(p => p.precision === 0)
    const bp = cand.length >= ref.length ? 1 : Math.exp(1 - ref.length / cand.length)
    const bleu = zero ? 0 : bp * Math.exp(perN.reduce((s, p) => s + Math.log(p.precision), 0) / N)
    return { cand, ref, perN, bp, bleu, zero }
  }, [candidate])

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        {CANDIDATES.map((c, i) => (
          <Btn key={i} onClick={() => setChoice(i)} primary={choice === i}>{c.label}</Btn>
        ))}
      </Row>

      <div style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
        <div><strong style={{ color: 'var(--text-muted)' }}>Reference:</strong> "{REFERENCE}"</div>
        <div><strong style={{ color: COLOR }}>Candidate:</strong> "{candidate}"</div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '3px 8px', borderBottom: '1px solid var(--border)' }}>n-gram</th>
              <th style={{ textAlign: 'left', padding: '3px 8px', borderBottom: '1px solid var(--border)' }}>clipped / total</th>
              <th style={{ textAlign: 'left', padding: '3px 8px', borderBottom: '1px solid var(--border)' }}>precision pₙ</th>
            </tr>
          </thead>
          <tbody>
            {result.perN.map(p => (
              <tr key={p.n}>
                <td style={{ padding: '3px 8px' }}>{p.n}-gram</td>
                <td style={{ padding: '3px 8px', fontFamily: 'monospace' }}>{p.clipped} / {p.total}</td>
                <td style={{ padding: '3px 8px', fontFamily: 'monospace', color: p.precision === 0 ? '#ef4444' : COLOR }}>
                  {p.precision.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Readout items={[
        ['candidate length', result.cand.length],
        ['reference length', result.ref.length],
        ['brevity penalty', result.bp.toFixed(3)],
        ['BLEU', result.bleu.toFixed(3)],
      ]} />

      {result.zero && (
        <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.4rem' }}>
          A required n-gram precision is 0, so the geometric mean collapses the whole score to 0 — one missing n-gram order is enough to zero out BLEU.
        </p>
      )}
    </div>
  )
}
