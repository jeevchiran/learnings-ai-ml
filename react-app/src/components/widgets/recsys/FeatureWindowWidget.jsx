import { useState } from 'react'
import { EVENTS, USERS, USER_IDS, productName, EVENT_WEIGHT } from './recsysUtils.js'

const TRACK = '#65a30d'
const LEAK = '#dc2626'

/* The single most common production recsys bug, made visible: computing a
 * feature over the WHOLE log instead of over "everything strictly before this
 * row's timestamp". Drag the as-of day and compare the two columns. */
export default function FeatureWindowWidget() {
  const [asOf, setAsOf] = useState(15)
  const [win, setWin] = useState(7)
  const [user, setUser] = useState('U2')

  const mine = EVENTS.filter(e => e.u === user).sort((a, b) => a.day - b.day)

  // Correct: strictly before as-of, inside the lookback window.
  const inWindow = mine.filter(e => e.day < asOf && e.day >= asOf - win)
  const after = mine.filter(e => e.day >= asOf)

  const feat = evts => ({
    events: evts.length,
    views: evts.filter(e => e.type === 'view').length,
    carts: evts.filter(e => e.type === 'cart').length,
    purchases: evts.filter(e => e.type === 'purchase').length,
    distinct: new Set(evts.map(e => e.p)).size,
    strength: evts.reduce((s, e) => s + EVENT_WEIGHT[e.type], 0),
  })

  const correct = feat(inWindow)
  const leaky = feat(mine)          // computed over the whole log — the bug
  const rows = [
    ['events in window', correct.events, leaky.events],
    ['distinct products', correct.distinct, leaky.distinct],
    ['carts', correct.carts, leaky.carts],
    ['purchases', correct.purchases, leaky.purchases],
    ['total implicit strength', correct.strength, leaky.strength],
  ]
  const differs = rows.some(r => r[1] !== r[2])

  const DAYS = 30
  const x = d => ((d - 0.5) / DAYS) * 100

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.7rem', fontSize: '0.83rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          shopper
          <select value={user} onChange={e => setUser(e.target.value)} style={{ fontFamily: 'inherit', fontSize: '0.8rem' }}>
            {USER_IDS.map((u, i) => <option key={u} value={u}>{USERS[i].name}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          as-of day
          <input type="range" min="2" max="30" step="1" value={asOf} onChange={e => setAsOf(+e.target.value)} />
          <strong>d{asOf}</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          lookback window
          <input type="range" min="1" max="30" step="1" value={win} onChange={e => setWin(+e.target.value)} />
          <strong>{win}d</strong>
        </label>
      </div>

      <div style={{ position: 'relative', height: 46, marginBottom: '0.3rem' }}>
        <div style={{
          position: 'absolute', left: `${x(Math.max(1, asOf - win))}%`, width: `${((Math.min(win, asOf - 1)) / DAYS) * 100}%`,
          top: 0, bottom: 18, background: 'rgba(101,163,13,0.16)', border: `1px solid ${TRACK}`, borderRadius: 3,
        }} />
        <div style={{ position: 'absolute', left: `${x(asOf)}%`, top: 0, bottom: 18, width: 2, background: '#7c3aed' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 13, height: 1, background: 'var(--border, #ddd)' }} />
        {mine.map((e, i) => {
          const isIn = inWindow.includes(e)
          const isFuture = after.includes(e)
          return (
            <span key={i} title={`d${e.day} · ${e.type} · ${productName(e.p)}`}
              style={{
                position: 'absolute', left: `${x(e.day)}%`, top: 8, width: 11, height: 11,
                transform: 'translateX(-50%)', borderRadius: '50%',
                background: isFuture ? LEAK : isIn ? TRACK : 'var(--text-muted, #aaa)',
              }} />
          )
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 14, fontSize: '0.66rem', opacity: 0.6 }}>
          {[1, 10, 20, 30].map(d => (
            <span key={d} style={{ position: 'absolute', left: `${x(d)}%`, transform: 'translateX(-50%)' }}>d{d}</span>
          ))}
          <span style={{ position: 'absolute', left: `${x(asOf)}%`, transform: 'translateX(-50%)', color: '#7c3aed', fontWeight: 700, top: -1 }}>▲</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', width: '100%', maxWidth: 470 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '3px 6px' }}>Feature</th>
              <th style={{ padding: '3px 6px', color: TRACK }}>Point-in-time<br /><span style={{ fontWeight: 400, fontSize: '0.72rem' }}>day &lt; {asOf}, last {win}d</span></th>
              <th style={{ padding: '3px 6px', color: LEAK }}>Whole log<br /><span style={{ fontWeight: 400, fontSize: '0.72rem' }}>the bug</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([n, a, b]) => (
              <tr key={n}>
                <td style={{ padding: '3px 6px' }}>{n}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', fontFamily: 'monospace', color: TRACK, fontWeight: 600 }}>{a}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', fontFamily: 'monospace', color: a === b ? 'var(--text-muted, #999)' : LEAK, fontWeight: 600 }}>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{
        fontSize: '0.83rem', marginTop: '0.6rem', padding: '0.5rem 0.7rem', borderRadius: 6,
        background: differs ? 'rgba(220,38,38,0.10)' : 'rgba(101,163,13,0.12)',
        border: `1px solid ${differs ? LEAK : TRACK}`,
      }}>
        {differs
          ? <>The red column has read {after.length} event{after.length === 1 ? '' : 's'} from{' '}
            <strong>on or after day {asOf}</strong>. If day {asOf} is the row you are trying to predict, this
            feature contains the answer. Offline AUC goes up, production does nothing, and the bug is invisible
            in the model code — it lives in the SQL.</>
          : <>No future events for this shopper past day {asOf}, so both columns agree here. Move the as-of
            day earlier: agreement is a coincidence of this row, not a property of the pipeline.</>}
      </p>

      <p style={{ fontSize: '0.79rem', opacity: 0.75, marginTop: '0.45rem' }}>
        Widen the lookback to 30d and the two columns still differ — window length and point-in-time
        correctness are independent choices. The window controls how much history you use; the strict{' '}
        <code>&lt;</code> controls whether any of it is cheating.
      </p>
    </div>
  )
}
