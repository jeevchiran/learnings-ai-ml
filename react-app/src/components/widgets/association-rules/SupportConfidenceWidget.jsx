import { useState } from 'react'
import { TRANSACTIONS, N, ITEMS, count, support, confidence, lift } from './associationUtils.js'

// Pick antecedent (A) and consequent (B) items, watch support / confidence / lift
// recompute live over the fixed 10-transaction basket.
export default function SupportConfidenceWidget() {
  const [role, setRole] = useState(() => ({ Beer: 'A', Milk: 'B' })) // item -> 'A' | 'B' | undefined

  const a = ITEMS.filter(it => role[it] === 'A')
  const b = ITEMS.filter(it => role[it] === 'B')
  const cycle = it =>
    setRole(r => ({ ...r, [it]: r[it] === 'A' ? 'B' : r[it] === 'B' ? undefined : 'A' }))

  const valid = a.length > 0 && b.length > 0
  const both = [...a, ...b]
  const cA = count(a), cB = count(b), cBoth = count(both)
  const sA = support(a), sB = support(b), sBoth = support(both)
  const conf = valid ? confidence(a, b) : 0
  const lf = valid ? lift(a, b) : 0

  const liftColor = lf > 1.05 ? '#16a34a' : lf < 0.95 ? '#dc2626' : 'var(--text-muted)'
  const chip = it => {
    const bg = role[it] === 'A' ? '#0891b2' : role[it] === 'B' ? '#7c3aed' : 'transparent'
    const fg = role[it] ? '#fff' : 'var(--text)'
    return (
      <button key={it} onClick={() => cycle(it)}
        style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid var(--border, #ccc)',
          background: bg, color: fg, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
        {it}{role[it] ? ` (${role[it]})` : ''}
      </button>
    )
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <p style={{ fontSize: '0.85rem', opacity: 0.75, margin: '0 0 0.5rem' }}>
        Click an item to cycle it through <strong style={{ color: '#0891b2' }}>Antecedent (A)</strong> →{' '}
        <strong style={{ color: '#7c3aed' }}>Consequent (B)</strong> → off. Rule: <strong>A ⇒ B</strong>.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {ITEMS.map(chip)}
      </div>

      {valid ? (
        <>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <span>support(A∪B): <strong>{sBoth.toFixed(2)}</strong></span>
            <span>confidence: <strong>{conf.toFixed(2)}</strong></span>
            <span>lift: <strong style={{ color: liftColor }}>{lf.toFixed(2)}</strong></span>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, fontFamily: 'monospace', lineHeight: 1.7 }}>
            support = count(A∪B)/N = {cBoth}/{N} = {sBoth.toFixed(2)}<br />
            confidence = support(A∪B)/support(A) = {sBoth.toFixed(2)}/{sA.toFixed(2)} = {conf.toFixed(2)}<br />
            lift = confidence/support(B) = {conf.toFixed(2)}/{sB.toFixed(2)} = {lf.toFixed(2)}
          </div>
          <p style={{ fontSize: '0.82rem', marginTop: '0.5rem', color: liftColor }}>
            {lf > 1.05 && 'Lift > 1 — A and B appear together more than chance. Positive association.'}
            {lf < 0.95 && 'Lift < 1 — buying A makes B less likely than average. Negative association (high confidence can hide this!).'}
            {lf >= 0.95 && lf <= 1.05 && 'Lift ≈ 1 — A and B are roughly independent, even if confidence looks high.'}
          </p>
        </>
      ) : (
        <p style={{ fontSize: '0.85rem', color: '#dc2626' }}>Pick at least one A item and one B item.</p>
      )}

      <details style={{ marginTop: '0.75rem', fontSize: '0.82rem' }}>
        <summary style={{ cursor: 'pointer' }}>Show the {N} transactions</summary>
        <ol style={{ margin: '0.5rem 0 0', paddingLeft: '1.5rem' }}>
          {TRANSACTIONS.map((t, i) => <li key={i} style={{ marginBottom: 2 }}>{t.join(', ')}</li>)}
        </ol>
      </details>
    </div>
  )
}
