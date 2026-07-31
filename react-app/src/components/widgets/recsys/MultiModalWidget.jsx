import { useState, useMemo } from 'react'
import {
  splitByTime, buildMatrix, binarize, itemCFScores, rankScores,
  CONTENT_VEC, CONTENT_DIMS, cosine, ITEM_IDS, USER_IDS, USERS, productName,
} from './recsysUtils.js'

const TRACK = '#65a30d'

/* Blend a collaborative score with a content score and watch the cold item
 * (P9, zero interactions) climb from unrankable to recommendable. The slider
 * IS the cold-start / warm-item trade-off, made physical. */
export default function MultiModalWidget() {
  const [w, setW] = useState(0.5)        // 0 = pure CF, 1 = pure content
  const [user, setUser] = useState('U1')

  const { train } = splitByTime()
  const B = useMemo(() => binarize(buildMatrix(train)), [])    // eslint-disable-line

  const ui = USER_IDS.indexOf(user)
  const history = ITEM_IDS.filter((_, j) => B[ui][j] > 0)

  // Content-side user profile = mean of the content vectors they interacted with.
  const profile = CONTENT_DIMS.map((_, d) =>
    history.length ? history.reduce((s, id) => s + CONTENT_VEC[id][d], 0) / history.length : 0)

  const cf = itemCFScores(B, user)
  const norm = obj => {
    const vals = Object.values(obj)
    const lo = Math.min(...vals), hi = Math.max(...vals)
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, hi === lo ? 0 : (v - lo) / (hi - lo)]))
  }
  const cfN = norm(cf)
  const content = Object.fromEntries(ITEM_IDS.map(id => [id, cosine(profile, CONTENT_VEC[id])]))
  const contentN = norm(content)

  const blend = Object.fromEntries(ITEM_IDS.map(id => [id, (1 - w) * cfN[id] + w * contentN[id]]))
  const ranked = rankScores(blend)
  const coldRank = ranked.indexOf('P9') + 1

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.7rem', fontSize: '0.83rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          shopper
          <select value={user} onChange={e => setUser(e.target.value)} style={{ fontFamily: 'inherit', fontSize: '0.8rem' }}>
            {USER_IDS.map((u, i) => <option key={u} value={u}>{USERS[i].name}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1, minWidth: 220 }}>
          <span style={{ color: '#7c3aed', fontWeight: 600 }}>behaviour</span>
          <input type="range" min="0" max="1" step="0.05" value={w}
            onChange={e => setW(+e.target.value)} style={{ flex: 1 }} />
          <span style={{ color: '#0891b2', fontWeight: 600 }}>content</span>
          <strong style={{ width: 34, textAlign: 'right' }}>{w.toFixed(2)}</strong>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1.15fr) minmax(190px, 0.85fr)', gap: '1rem' }}>
        <div>
          {ranked.map((id, i) => {
            const cold = id === 'P9'
            const seen = history.includes(id)
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: 3, fontSize: '0.78rem' }}>
                <span style={{ width: 16, opacity: 0.55 }}>{i + 1}</span>
                <span style={{ width: 104, fontWeight: cold ? 700 : 400, color: cold ? TRACK : 'var(--text)' }}>
                  {productName(id)}{cold && ' ★'}
                </span>
                <div style={{ flex: 1, height: 13, display: 'flex', borderRadius: 3, overflow: 'hidden', background: 'var(--bg-hover, #eee)' }}>
                  <div title={`CF ${cfN[id].toFixed(2)}`} style={{ width: `${(1 - w) * cfN[id] * 100}%`, background: '#7c3aed' }} />
                  <div title={`content ${contentN[id].toFixed(2)}`} style={{ width: `${w * contentN[id] * 100}%`, background: '#0891b2' }} />
                </div>
                <span style={{ width: 38, textAlign: 'right', fontFamily: 'monospace' }}>{blend[id].toFixed(2)}</span>
                {seen && <span style={{ fontSize: '0.66rem', opacity: 0.5, width: 30 }}>seen</span>}
                {!seen && <span style={{ width: 30 }} />}
              </div>
            )
          })}
          <p style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: '0.3rem' }}>
            <span style={{ color: '#7c3aed' }}>▉</span> collaborative contribution{' '}
            <span style={{ color: '#0891b2' }}>▉</span> content contribution · ★ = cold item, zero interactions
          </p>
        </div>

        <div style={{ fontSize: '0.8rem' }}>
          <strong>Content vector — what an encoder would give you</strong>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.72rem', marginTop: '0.3rem', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '2px 4px' }} />
                {CONTENT_DIMS.map(d => <th key={d} style={{ padding: '2px 3px', fontWeight: 500, opacity: 0.75 }}>{d.slice(0, 4)}</th>)}
              </tr>
            </thead>
            <tbody>
              {['P9', 'P1'].map(id => (
                <tr key={id}>
                  <td style={{ padding: '2px 4px', whiteSpace: 'nowrap' }}>{productName(id)}</td>
                  {CONTENT_VEC[id].map((v, d) => (
                    <td key={d} style={{
                      padding: '2px 3px', textAlign: 'center',
                      background: `rgba(8,145,178,${(v * 0.8).toFixed(2)})`, color: v > 0.6 ? '#fff' : 'var(--text)',
                    }}>{v.toFixed(1).slice(1) || '0'}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td style={{ padding: '2px 4px', fontWeight: 600 }}>{USERS[ui].name}'s profile</td>
                {profile.map((v, d) => (
                  <td key={d} style={{ padding: '2px 3px', textAlign: 'center', background: `rgba(101,163,13,${(v * 0.8).toFixed(2)})` }}>
                    {v.toFixed(1).slice(1) || '0'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: '0.35rem' }}>
            cos(ANC Headphones, Earbuds) = <strong>{cosine(CONTENT_VEC.P9, CONTENT_VEC.P1).toFixed(3)}</strong> from
            title and photo alone — no interaction data needed.
          </p>

          <div style={{
            marginTop: '0.55rem', padding: '0.45rem 0.6rem', borderRadius: 6,
            border: `1px solid ${w === 0 ? '#dc2626' : TRACK}`,
            background: w === 0 ? 'rgba(220,38,38,0.09)' : 'rgba(101,163,13,0.11)', fontSize: '0.78rem',
          }}>
            {w === 0
              ? <>Pure CF: the cold item has an all-zero column, so its score is exactly 0 and it lands at rank{' '}
                {coldRank} by tie-break alone. It can never be recommended, so it can never earn interactions,
                so it stays cold. <strong>That is the feedback loop.</strong></>
              : <>ANC Headphones now sits at rank <strong>{coldRank}</strong> — placed entirely by what it{' '}
                <em>looks and reads</em> like, since it has no behaviour at all.</>}
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', opacity: 0.82, marginTop: '0.6rem', lineHeight: 1.65 }}>
        Slide all the way to <strong>content</strong> and the ranking becomes “more of the same aisle” — safe,
        obvious, and blind to the cross-category patterns only behaviour reveals (nobody's product photo says
        “people who buy yoga mats also buy steel bottles”). Slide to <strong>behaviour</strong> and every new
        arrival is invisible. Production systems do not pick a point on this slider once; they make w a
        function of how much interaction data the item has, so an item migrates from content-driven to
        behaviour-driven as it warms up.
      </p>
    </div>
  )
}
