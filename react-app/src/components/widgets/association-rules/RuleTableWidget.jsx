import { useState } from 'react'
import { generateRules } from './associationUtils.js'

// Two thresholds -> the ranked rule table. Sorted by lift so the confidence trap
// is visible: a rule can clear a high min-confidence yet have lift < 1.
export default function RuleTableWidget() {
  const [minSup, setMinSup] = useState(0.3)
  const [minConf, setMinConf] = useState(0.6)
  const rules = generateRules(minSup, minConf)

  const liftColor = lf => (lf > 1.05 ? '#16a34a' : lf < 0.95 ? '#dc2626' : 'var(--text-muted)')
  const cell = { padding: '0.35rem 0.6rem', borderBottom: '1px solid var(--border, #e5e5e5)', textAlign: 'right' }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.25rem', marginBottom: '0.6rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
          min-support:
          <input type="range" min="0.1" max="0.6" step="0.1" value={minSup}
            onChange={e => setMinSup(+e.target.value)} style={{ flex: 1 }} />
          <strong style={{ minWidth: 28 }}>{minSup.toFixed(1)}</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
          min-confidence:
          <input type="range" min="0.3" max="1" step="0.05" value={minConf}
            onChange={e => setMinConf(+e.target.value)} style={{ flex: 1 }} />
          <strong style={{ minWidth: 32 }}>{minConf.toFixed(2)}</strong>
        </label>
      </div>

      <p style={{ fontSize: '0.82rem', opacity: 0.75, margin: '0 0 0.4rem' }}>
        {rules.length} rule{rules.length === 1 ? '' : 's'} pass both thresholds, ranked by lift.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.83rem' }}>
          <thead>
            <tr>
              <th style={{ ...cell, textAlign: 'left' }}>Rule (A ⇒ B)</th>
              <th style={cell}>support</th>
              <th style={cell}>confidence</th>
              <th style={cell}>lift</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r, i) => (
              <tr key={i}>
                <td style={{ ...cell, textAlign: 'left', whiteSpace: 'nowrap' }}>
                  {'{' + r.a.join(', ') + '} ⇒ {' + r.b.join(', ') + '}'}
                </td>
                <td style={cell}>{r.support.toFixed(2)}</td>
                <td style={cell}>{r.confidence.toFixed(2)}</td>
                <td style={{ ...cell, color: liftColor(r.lift), fontWeight: 600 }}>{r.lift.toFixed(2)}</td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr><td colSpan={4} style={{ ...cell, textAlign: 'center', color: '#dc2626' }}>
                No rules meet both thresholds — loosen them.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem' }}>
        Green lift &gt; 1 is a genuine positive association; red lift &lt; 1 means the rule fires often
        (high confidence) yet the consequent is actually <em>less</em> likely than its baseline — the trap
        of ranking by confidence alone.
      </p>
    </div>
  )
}
