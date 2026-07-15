import { useState } from 'react'

const COLOR = '#ca8a04'
const POS = '#16a34a'
const NEG = '#dc2626'

// A toy loan-approval model. Global = average importance. Local = one applicant.
const FEATURES = ['Income', 'Credit score', 'Debt ratio', 'Age', 'Loan amount']
const GLOBAL = [0.34, 0.41, 0.15, 0.04, 0.06] // importance magnitudes, sum≈1

const APPLICANTS = [
  { name: 'Applicant A (approved)', local: [+0.22, +0.30, -0.05, +0.01, -0.03], base: 0.5, pred: 0.95 },
  { name: 'Applicant B (denied)',   local: [-0.18, -0.24, -0.12, +0.02, -0.08], base: 0.5, pred: 0.10 },
  { name: 'Applicant C (borderline)', local: [+0.15, -0.10, -0.06, +0.00, +0.04], base: 0.5, pred: 0.53 },
]

export default function GlobalLocalWidget() {
  const [mode, setMode] = useState('global')
  const [who, setWho] = useState(0)
  const local = APPLICANTS[who]

  const rows = FEATURES.map((f, i) => ({
    f,
    val: mode === 'global' ? GLOBAL[i] : local.local[i],
  }))
  const maxAbs = Math.max(...rows.map(r => Math.abs(r.val)))
  const barMax = 150

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
        {['global', 'local'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: '0.28rem 0.9rem', borderRadius: 4, fontSize: '0.82rem', cursor: 'pointer', fontWeight: mode === m ? 700 : 400,
              border: `2px solid ${mode === m ? COLOR : 'var(--border)'}`, background: mode === m ? COLOR : 'var(--bg)', color: mode === m ? '#fff' : 'var(--text)' }}>
            {m === 'global' ? 'Global (whole model)' : 'Local (one prediction)'}
          </button>
        ))}
        {mode === 'local' && (
          <select value={who} onChange={e => setWho(+e.target.value)}
            style={{ marginLeft: 'auto', padding: '0.28rem 0.5rem', borderRadius: 4, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.8rem' }}>
            {APPLICANTS.map((a, i) => <option key={i} value={i}>{a.name}</option>)}
          </select>
        )}
      </div>

      <div style={{ fontSize: '0.83rem' }}>
        {rows.map((r, i) => {
          const w = (Math.abs(r.val) / maxAbs) * barMax
          const positive = r.val >= 0
          const c = mode === 'global' ? COLOR : (positive ? POS : NEG)
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.32rem 0' }}>
              <span style={{ width: 96, textAlign: 'right', color: 'var(--text-muted)' }}>{r.f}</span>
              {/* center axis for local (signed), left axis for global */}
              <div style={{ position: 'relative', flex: 1, height: 20 }}>
                <div style={{ position: 'absolute', left: mode === 'global' ? 0 : '50%', top: 0, height: '100%', width: mode === 'global' ? 0 : 1, background: 'var(--border)' }} />
                <div style={{ position: 'absolute', top: 2, height: 16, width: w, borderRadius: 3, background: c,
                  left: mode === 'global' ? 0 : (positive ? '50%' : `calc(50% - ${w}px)`), transition: 'all 0.3s' }} />
              </div>
              <span style={{ width: 44, fontVariantNumeric: 'tabular-nums', color: c }}>
                {mode === 'global' ? r.val.toFixed(2) : (r.val >= 0 ? '+' : '') + r.val.toFixed(2)}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '0.7rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        {mode === 'global'
          ? <><strong style={{ color: COLOR }}>Global:</strong> across all applicants, <em>credit score</em> and <em>income</em> drive most decisions. One picture for the entire model — no direction, just magnitude.</>
          : <><strong style={{ color: COLOR }}>Local:</strong> for <em>{local.name}</em>, start at base {local.base.toFixed(2)}, add the signed pushes → prediction <strong>{local.pred.toFixed(2)}</strong>. <span style={{ color: POS }}>Green</span> pushes toward approval, <span style={{ color: NEG }}>red</span> away.</>
        }
      </div>
    </div>
  )
}
