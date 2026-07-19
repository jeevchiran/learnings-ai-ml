import { useState } from 'react'
import { N, ITEMS, count, apriori } from './associationUtils.js'

// Drag min-support and watch Apriori build frequent itemsets level by level.
// Shows which 1-items die first and how the frequent set collapses as the
// threshold rises — the anti-monotone (downward-closure) property in action.
export default function AprioriStepWidget() {
  const [minSup, setMinSup] = useState(0.3)
  const { minCount, levels } = apriori(minSup)

  // 1-itemsets that got cut, for the "pruned first" intuition
  const cut1 = ITEMS.filter(it => count([it]) < minCount)

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
        min-support:
        <input type="range" min="0.1" max="0.8" step="0.1" value={minSup}
          onChange={e => setMinSup(+e.target.value)} style={{ flex: 1 }} />
        <strong style={{ minWidth: 90 }}>{minSup.toFixed(1)} (≥{minCount}/{N})</strong>
      </label>

      {cut1.length > 0 && (
        <p style={{ fontSize: '0.82rem', color: '#dc2626', margin: '0 0 0.5rem' }}>
          Below threshold, dropped immediately: {cut1.map(it => `${it} (${count([it])})`).join(', ')}
        </p>
      )}

      {levels.map((L, k) => (
        <div key={k} style={{ marginBottom: '0.6rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
            L{k + 1} — frequent {k + 1}-itemset{L.length === 1 ? '' : 's'} ({L.length})
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {L.map(({ items, count: c }) => (
              <span key={items.join()} style={{ padding: '0.25rem 0.6rem', borderRadius: 6,
                background: 'rgba(8,145,178,0.12)', border: '1px solid rgba(8,145,178,0.4)',
                fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                {'{' + items.join(', ') + '}'} <strong>{c}</strong>
              </span>
            ))}
          </div>
        </div>
      ))}

      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem' }}>
        A k-itemset can only be frequent if all of its (k−1)-subsets are frequent. So Apriori never even
        counts a candidate whose subset already failed — raise the slider and watch whole levels vanish.
      </p>
    </div>
  )
}
