import { useState } from 'react'

const COLOR = '#4338ca'
const WIN = '#16a34a'

// The exact Play Tennis table from the module.
const DATA = [
  ['Sunny', 'False', 'No'], ['Sunny', 'True', 'No'], ['Overcast', 'False', 'Yes'],
  ['Rain', 'False', 'Yes'], ['Rain', 'False', 'Yes'], ['Rain', 'True', 'No'],
  ['Overcast', 'True', 'Yes'], ['Sunny', 'False', 'Yes'], ['Sunny', 'True', 'Yes'],
  ['Rain', 'False', 'Yes'],
]
const OUTLOOKS = ['Sunny', 'Overcast', 'Rain']
const WINDY = ['True', 'False']

export default function NBTennisWidget() {
  const [outlook, setOutlook] = useState('Sunny')
  const [windy, setWindy] = useState('True')
  const [laplace, setLaplace] = useState(false)

  const cls = y => DATA.filter(r => r[2] === y)
  const like = (col, val, y, k) => {
    const rows = cls(y)
    const c = rows.filter(r => r[col] === val).length
    return laplace ? (c + 1) / (rows.length + k) : c / rows.length
  }

  const score = y => {
    const prior = cls(y).length / DATA.length
    return prior * like(0, outlook, y, 3) * like(1, windy, y, 2)
  }
  const sYes = score('Yes'), sNo = score('No')
  const total = sYes + sNo || 1e-12
  const winner = sYes >= sNo ? 'Yes' : 'No'

  const row = (y, s) => (
    <div style={{ margin: '0.3rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 2 }}>
        <span style={{ fontWeight: winner === y ? 700 : 400, color: winner === y ? WIN : 'var(--text)' }}>
          Play = {y} {winner === y && '✓'}
        </span>
        <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>
          {(cls(y).length / DATA.length).toFixed(2)} × {like(0, outlook, y, 3).toFixed(3)} × {like(1, windy, y, 2).toFixed(3)} = <strong style={{ color: 'var(--text)' }}>{s.toFixed(4)}</strong>
        </span>
      </div>
      <div style={{ height: 14, background: 'var(--bg-hover)', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${(s / total) * 100}%`, background: winner === y ? WIN : `${COLOR}99`, borderRadius: 3, transition: 'width 0.25s' }} />
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.7rem', fontSize: '0.82rem' }}>
        <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          Outlook
          <select value={outlook} onChange={e => setOutlook(e.target.value)} style={sel}>
            {OUTLOOKS.map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          Windy
          <select value={windy} onChange={e => setWindy(e.target.value)} style={sel}>
            {WINDY.map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginLeft: 'auto' }}>
          <input type="checkbox" checked={laplace} onChange={e => setLaplace(e.target.checked)} />
          Laplace smoothing
        </label>
      </div>

      {row('Yes', sYes)}
      {row('No', sNo)}

      <div style={{ marginTop: '0.6rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        Predict <strong style={{ color: WIN }}>Play = {winner}</strong> (P = {(Math.max(sYes, sNo) / total * 100).toFixed(0)}%).
        {' '}Try <em>Outlook = Overcast, Windy = False</em> with smoothing off: the No score hits exactly 0 (Overcast never appears on a No-day). Toggle Laplace to rescue it.
      </div>
    </div>
  )
}

const sel = { padding: '0.2rem 0.4rem', borderRadius: 4, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.8rem' }
