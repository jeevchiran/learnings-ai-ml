import { useState, useMemo } from 'react'

const COLOR = '#ca8a04'
const F = ['Size', 'Location', 'Age']

// Value of each coalition = model prediction ($k) using only those features (rest = average).
// Keyed by sorted indices joined, '' = empty coalition (base value).
const V = {
  '': 300,
  '0': 380, '1': 340, '2': 310,
  '0,1': 460, '0,2': 390, '1,2': 350,
  '0,1,2': 500,
}
const key = set => [...set].sort((a, b) => a - b).join(',')

// all permutations of [0,1,2]
function perms(arr) {
  if (arr.length <= 1) return [arr]
  return arr.flatMap((x, i) => perms([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [x, ...p]))
}

export default function ShapleyWidget() {
  const [sel, setSel] = useState(0)
  const orderings = useMemo(() => perms([0, 1, 2]), [])

  // marginal contribution of feature `sel` in each ordering
  const rows = orderings.map(order => {
    const before = new Set()
    for (const feat of order) {
      if (feat === sel) break
      before.add(feat)
    }
    const withF = new Set(before); withF.add(sel)
    const marg = V[key(withF)] - V[key(before)]
    return { order, before: [...before], marg }
  })

  const shapley = F.map((_, f) => {
    const rs = orderings.map(order => {
      const before = new Set()
      for (const feat of order) { if (feat === f) break; before.add(feat) }
      const withF = new Set(before); withF.add(f)
      return V[key(withF)] - V[key(before)]
    })
    return rs.reduce((a, b) => a + b, 0) / rs.length
  })
  const maxShap = Math.max(...shapley)

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.7rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Marginal contributions of:</span>
        {F.map((f, i) => (
          <button key={i} onClick={() => setSel(i)}
            style={{ padding: '0.24rem 0.7rem', borderRadius: 4, fontSize: '0.8rem', cursor: 'pointer', fontWeight: sel === i ? 700 : 400,
              border: `2px solid ${sel === i ? COLOR : 'var(--border)'}`, background: sel === i ? COLOR : 'var(--bg)', color: sel === i ? '#fff' : 'var(--text)' }}>
            {f}
          </button>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
            <th style={{ padding: '0.3rem 0.4rem' }}>Ordering</th>
            <th style={{ padding: '0.3rem 0.4rem' }}>{F[sel]} joins a coalition of…</th>
            <th style={{ padding: '0.3rem 0.4rem', textAlign: 'right' }}>Marginal (+$k)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '0.3rem 0.4rem', fontFamily: 'monospace' }}>{r.order.map(o => F[o][0]).join(' → ')}</td>
              <td style={{ padding: '0.3rem 0.4rem', color: 'var(--text-muted)' }}>{r.before.length ? r.before.map(o => F[o]).join(', ') : '(none yet)'}</td>
              <td style={{ padding: '0.3rem 0.4rem', textAlign: 'right', color: COLOR, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>+{r.marg}</td>
            </tr>
          ))}
          <tr style={{ borderTop: `2px solid ${COLOR}`, fontWeight: 700 }}>
            <td colSpan={2} style={{ padding: '0.35rem 0.4rem' }}>Average = Shapley value of {F[sel]}</td>
            <td style={{ padding: '0.35rem 0.4rem', textAlign: 'right', color: COLOR }}>+{shapley[sel].toFixed(1)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '0.8rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>All three Shapley values (must sum to prediction − base = 500 − 300 = 200):</div>
        {F.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.25rem 0', fontSize: '0.82rem' }}>
            <span style={{ width: 70, textAlign: 'right', color: i === sel ? COLOR : 'var(--text)', fontWeight: i === sel ? 700 : 400 }}>{f}</span>
            <div style={{ flex: 1, height: 16, background: 'var(--bg-hover)', borderRadius: 3 }}>
              <div style={{ height: '100%', width: `${(shapley[i] / maxShap) * 100}%`, background: i === sel ? COLOR : `${COLOR}99`, borderRadius: 3, transition: 'all 0.2s' }} />
            </div>
            <span style={{ width: 46, textAlign: 'right', color: COLOR, fontVariantNumeric: 'tabular-nums' }}>+{shapley[i].toFixed(1)}</span>
          </div>
        ))}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          Sum = {shapley.reduce((a, b) => a + b, 0).toFixed(0)} ✓ &nbsp; (efficiency axiom)
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        A feature's SHAP value is its <strong>average marginal contribution</strong> over every order it could join the model. Order matters because features interact — so we average over all 3! = 6 orderings to be fair.
      </p>
    </div>
  )
}
