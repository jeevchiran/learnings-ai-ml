import { useState, useMemo } from 'react'
import {
  splitByTime, buildMatrix, binarize, ITEM_IDS, USER_IDS, USERS,
  itemItemSim, userUserSim, itemCFScores, userCFScores, rankScores, productName,
} from './recsysUtils.js'

const TRACK = '#65a30d'

/* Item-item vs user-user CF on the same matrix. Click a product to see its
 * neighbours and the arithmetic that turns those neighbours into a score. */
export default function CFSimilarityWidget() {
  const [axis, setAxis] = useState('item')      // 'item' | 'user'
  const [weighted, setWeighted] = useState(false)
  const [focus, setFocus] = useState('P1')
  const [user, setUser] = useState('U4')

  const { train } = splitByTime()
  const M = useMemo(() => buildMatrix(train), [])           // eslint-disable-line
  const R = weighted ? M : binarize(M)

  const S = axis === 'item' ? itemItemSim(R) : userUserSim(R)
  const keys = axis === 'item' ? ITEM_IDS : USER_IDS
  const label = id => (axis === 'item' ? productName(id) : USERS[USER_IDS.indexOf(id)].name)
  const sel = axis === 'item' ? focus : user

  const neighbours = keys.filter(k => k !== sel)
    .map(k => ({ id: k, sim: S[sel][k] }))
    .sort((a, b) => b.sim - a.sim)

  const scores = axis === 'item' ? itemCFScores(R, user) : userCFScores(R, user)
  const ranked = rankScores(scores)
  const ui = USER_IDS.indexOf(user)
  const history = ITEM_IDS.filter((_, j) => R[ui][j] > 0)

  const cell = v => `rgba(101,163,13,${(v * 0.85).toFixed(3)})`

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.7rem', fontSize: '0.83rem' }}>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {['item', 'user'].map(a => (
            <button key={a} onClick={() => setAxis(a)}
              style={{
                padding: '0.26rem 0.7rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit',
                border: `1px solid ${axis === a ? TRACK : 'var(--border, #ccc)'}`,
                background: axis === a ? TRACK : 'transparent', color: axis === a ? '#fff' : 'var(--text)',
              }}>{a}–{a} CF</button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <input type="checkbox" checked={weighted} onChange={e => setWeighted(e.target.checked)} />
          use event weights instead of binary
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          recommend for
          <select value={user} onChange={e => setUser(e.target.value)} style={{ fontFamily: 'inherit', fontSize: '0.8rem' }}>
            {USER_IDS.map((u, i) => <option key={u} value={u}>{USERS[i].name}</option>)}
          </select>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', alignItems: 'start' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.7rem' }}>
            <thead>
              <tr>
                <th />
                {keys.map(k => <th key={k} style={{ padding: '2px 3px', fontWeight: 500, opacity: 0.75 }}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {keys.map(a => (
                <tr key={a}>
                  <td style={{ padding: '2px 5px', fontWeight: sel === a ? 700 : 400, cursor: 'pointer' }}
                    onClick={() => (axis === 'item' ? setFocus(a) : setUser(a))}>{a}</td>
                  {keys.map(b => (
                    <td key={b}
                      onClick={() => (axis === 'item' ? setFocus(a) : setUser(a))}
                      title={`sim(${a},${b}) = ${S[a][b].toFixed(3)}`}
                      style={{
                        padding: '3px 4px', textAlign: 'center', cursor: 'pointer', minWidth: 24,
                        background: a === b ? 'var(--bg-hover, #eee)' : cell(S[a][b]),
                        color: S[a][b] > 0.6 && a !== b ? '#fff' : 'var(--text)',
                        outline: a === sel ? `1px solid ${TRACK}` : 'none',
                      }}>
                      {a === b ? '–' : S[a][b] === 0 ? '' : S[a][b].toFixed(2).slice(1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: '0.25rem', maxWidth: 300 }}>
            Cosine similarity. Click a row to focus it. Blank = no shared {axis === 'item' ? 'shopper' : 'product'}.
          </p>
        </div>

        <div style={{ fontSize: '0.82rem' }}>
          <strong>Nearest to {sel} · {label(sel)}</strong>
          <ol style={{ margin: '0.3rem 0 0.8rem', paddingLeft: '1.2rem' }}>
            {neighbours.slice(0, 3).map(n => (
              <li key={n.id}>{label(n.id)} <span style={{ opacity: 0.65, fontFamily: 'monospace' }}>{n.sim.toFixed(3)}</span></li>
            ))}
          </ol>

          <strong>Top-3 for {USERS[ui].name}</strong>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, margin: '0.15rem 0 0.3rem' }}>
            history: {history.map(h => productName(h)).join(', ') || 'none'}
          </div>
          <ol style={{ margin: '0.2rem 0 0', paddingLeft: '1.2rem' }}>
            {ranked.slice(0, 3).map(id => (
              <li key={id} style={{ color: history.includes(id) ? 'var(--text-muted, #999)' : 'var(--text)' }}>
                {productName(id)} <span style={{ opacity: 0.65, fontFamily: 'monospace' }}>{scores[id].toFixed(3)}</span>
                {history.includes(id) && <em style={{ fontSize: '0.72rem' }}> — already seen</em>}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.7rem', lineHeight: 1.65 }}>
        Two things to notice. First, <strong>P9 (ANC Headphones) is similar to nothing</strong> — a brand-new
        product has no column to correlate, so pure CF cannot rank it at all. That is the cold-start hole.
        Second, several top-3 slots go to items the shopper already touched; in production you filter those
        out for discovery carousels and deliberately keep them for "complete your purchase". The filter is a
        product decision, and it changes your offline metric by more than most model changes do.
      </p>
    </div>
  )
}
