import { useState } from 'react'
import { EVENTS, USERS, USER_IDS, ITEM_IDS, DAY_CUTOFF, productName } from './recsysUtils.js'

const TRACK = '#65a30d'
const TYPES = ['view', 'cart', 'purchase']
const TYPE_COLOR = { view: '#94a3b8', cart: '#0891b2', purchase: '#65a30d' }

/* One event log, three dials. Change what a view/cart/purchase is "worth" and
 * watch the implicit matrix — and therefore every model downstream — change
 * shape. There is no correct answer here, only a choice you must defend. */
export default function SignalWeightWidget() {
  const [w, setW] = useState({ view: 1, cart: 3, purchase: 10 })
  const [user, setUser] = useState('U2')

  const train = EVENTS.filter(e => e.day <= DAY_CUTOFF)

  const R = USER_IDS.map(u => ITEM_IDS.map(p =>
    train.filter(e => e.u === u && e.p === p).reduce((s, e) => s + w[e.type], 0)))

  const ui = USER_IDS.indexOf(user)
  const row = R[ui]
  const maxCell = Math.max(1, ...R.flat())
  const top = ITEM_IDS.map((id, j) => ({ id, v: row[j] })).filter(x => x.v > 0)
    .sort((a, b) => b.v - a.v || a.id.localeCompare(b.id))

  const counts = Object.fromEntries(TYPES.map(t => [t, train.filter(e => e.type === t).length]))

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {TYPES.map(t => (
          <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ color: TYPE_COLOR[t], fontWeight: 600 }}>{t}</span>
            <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>({counts[t]})</span>
            <input type="range" min="0" max="20" step="1" value={w[t]}
              onChange={e => setW(p => ({ ...p, [t]: +e.target.value }))} style={{ width: 90 }} />
            <strong style={{ minWidth: 18, display: 'inline-block' }}>{w[t]}</strong>
          </label>
        ))}
      </div>

      <p style={{ fontSize: '0.82rem', opacity: 0.8, margin: '0 0 0.5rem' }}>
        <code>r(u,i) = Σ weight(event type)</code> over the training window (days 1–{DAY_CUTOFF}).
        Rows are shoppers, columns products; darker = stronger implicit signal.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '2px 6px', textAlign: 'left' }} />
              {ITEM_IDS.map(id => (
                <th key={id} title={productName(id)} style={{ padding: '2px 4px', fontWeight: 500, opacity: 0.8 }}>{id}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USER_IDS.map((u, i) => (
              <tr key={u} onClick={() => setUser(u)} style={{ cursor: 'pointer' }}>
                <td style={{ padding: '2px 6px', whiteSpace: 'nowrap', fontWeight: user === u ? 700 : 400 }}>
                  {u} {USERS[i].name}
                </td>
                {R[i].map((v, j) => (
                  <td key={j} style={{
                    padding: '4px 6px', textAlign: 'center', minWidth: 26,
                    background: v === 0 ? 'transparent' : `rgba(101,163,13,${0.12 + 0.78 * (v / maxCell)})`,
                    color: v / maxCell > 0.55 ? '#fff' : 'var(--text)',
                    outline: user === u ? `1px solid ${TRACK}` : 'none',
                  }}>{v || '·'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '0.85rem', marginTop: '0.7rem' }}>
        Ranked history for <strong style={{ color: TRACK }}>{USERS[ui].name}</strong>:{' '}
        {top.map((t, i) => (
          <span key={t.id}>
            {i > 0 && ' › '}
            <span style={{ fontWeight: 600 }}>{productName(t.id)}</span>
            <span style={{ opacity: 0.6 }}> ({t.v})</span>
          </span>
        ))}
      </p>

      <div style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: 1.65, marginTop: '0.5rem' }}>
        <strong>Try these:</strong>
        <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.1rem' }}>
          <li>Set <em>purchase</em> to 0. The matrix now says nobody ever bought anything — and a model
            trained on it optimises for browsing, which is exactly what a "you might like" carousel
            full of things you already own looks like.</li>
          <li>Set <em>view</em> to 0. The matrix goes nearly empty ({counts.view} of {train.length} events
            are views). Purchases are the signal you want and the signal you barely have. That tension is
            the whole reason implicit feedback exists.</li>
          <li>Set all three to 1. You are back to binary "did they touch it" — which is what plain
            item-item collaborative filtering actually consumes.</li>
        </ul>
      </div>
    </div>
  )
}
