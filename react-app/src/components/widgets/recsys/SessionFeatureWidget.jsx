import { useState } from 'react'
import {
  SESSION_LOG, SESSION_DAY, BOUNCE_SECONDS, sessionFeatures, sessionPairFeatures,
  PRODUCTS, ITEM_IDS, productName, userName, SESSION_USER,
} from './recsysUtils.js'

const TRACK = '#65a30d'
const CAT_COLOR = { audio: '#0891b2', desk: '#7c3aed', fitness: '#65a30d', kitchen: '#ca8a04', mobile: '#db2777' }
const END = SESSION_LOG.at(-1).t + 1

/* Scrub through one real browsing session and watch the short-term features
 * form. The headline: dwell separates real interest from a bounce in a way
 * raw view counts cannot. */
export default function SessionFeatureWidget() {
  const [upTo, setUpTo] = useState(END)

  const f = sessionFeatures(SESSION_LOG, upTo)
  const seen = SESSION_LOG.filter(e => e.t < upTo)
  const cand = ITEM_IDS.filter(id => seen.some(e => e.p === id))
  const maxDwell = Math.max(1, ...Object.values(f.dwell_by_item))
  const catOf = id => PRODUCTS.find(p => p.id === id).cat
  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <p style={{ fontSize: '0.85rem', opacity: 0.82, margin: '0 0 0.6rem' }}>
        {userName(SESSION_USER)}'s browsing session on day {SESSION_DAY} — 9½ minutes, 8 events. Scrub the
        slider to compute the features <strong>as of that moment</strong>, the way the ranker would mid-session.
      </p>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.7rem' }}>
        time into session
        <input type="range" min="1" max={END} step="1" value={upTo} onChange={e => setUpTo(+e.target.value)} style={{ flex: 1, maxWidth: 260 }} />
        <strong>{mmss(Math.min(upTo, END - 1))}</strong>
        <span style={{ opacity: 0.6, fontSize: '0.78rem' }}>· {f.n_events} events so far</span>
      </label>

      {/* timeline */}
      <div style={{ position: 'relative', height: 52, marginBottom: '0.5rem' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 22, height: 2, background: 'var(--border, #ddd)' }} />
        {SESSION_LOG.map((e, i) => {
          const active = e.t < upTo
          const bounce = e.type === 'view' && e.dwell < BOUNCE_SECONDS
          const w = Math.max(4, (e.dwell / 570) * 100)
          return (
            <div key={i} style={{ position: 'absolute', left: `${(e.t / 600) * 100}%`, top: 0 }}>
              <div title={`${mmss(e.t)} · ${e.type} ${productName(e.p)} · dwell ${e.dwell}s · slot ${e.pos}`}
                style={{
                  width: `${w}px`, minWidth: 5, height: 14, borderRadius: 3, marginTop: 16,
                  background: active ? (CAT_COLOR[catOf(e.p)] ?? '#888') : 'var(--bg-hover, #eee)',
                  border: bounce && active ? '2px solid #dc2626' : 'none',
                  opacity: active ? 1 : 0.3,
                }} />
              <div style={{ fontSize: '0.6rem', opacity: active ? 0.75 : 0.3, marginTop: 1, whiteSpace: 'nowrap' }}>
                {e.type === 'cart' ? '🛒' : ''}{e.p}
              </div>
            </div>
          )
        })}
        <div style={{ position: 'absolute', left: `${(Math.min(upTo, 600) / 600) * 100}%`, top: 10, bottom: 8, width: 2, background: TRACK }} />
      </div>
      <p style={{ fontSize: '0.68rem', opacity: 0.6, margin: '0 0 0.7rem' }}>
        Bar width = dwell time. <span style={{ color: '#dc2626' }}>Red outline</span> = bounce (&lt;{BOUNCE_SECONDS}s).
        Colour = category.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(190px, 0.85fr) minmax(250px, 1.15fr)', gap: '1rem' }}>
        <div style={{ fontSize: '0.8rem' }}>
          <strong>Session-level features</strong>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.76rem', marginTop: '0.3rem', width: '100%' }}>
            <tbody>
              {[
                ['last_item', f.last_item ? productName(f.last_item) : '—'],
                ['last_3_items', f.last_n.join(', ') || '—'],
                ['dwell_total', `${f.dwell_total}s`],
                ['session_seconds', `${f.session_seconds}s`],
                ['distinct_items', f.distinct_items],
                ['repeat_views', f.repeat_views],
                ['bounces', f.bounces],
                ['top_category', f.top_category ?? '—'],
                ['cat_share', f.cat_share.toFixed(2)],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ padding: '2px 4px', fontFamily: 'monospace', opacity: 0.8 }}>{k}</td>
                  <td style={{ padding: '2px 4px', fontWeight: 600, textAlign: 'right' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ fontSize: '0.8rem' }}>
          <strong>Per-candidate cross features</strong>
          <div style={{ overflowX: 'auto', marginTop: '0.3rem' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '0.72rem', width: '100%' }}>
              <thead>
                <tr style={{ opacity: 0.75 }}>
                  {['item', 'views', 'dwell', 'share', 'last?', 'ago'].map(h => (
                    <th key={h} style={{ padding: '2px 4px', textAlign: h === 'item' ? 'left' : 'right', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cand.map(id => {
                  const p = sessionPairFeatures(id, SESSION_LOG, upTo)
                  return (
                    <tr key={id} style={{ background: p.s_is_last ? 'rgba(101,163,13,0.13)' : 'transparent' }}>
                      <td style={{ padding: '2px 4px' }}>{productName(id)}</td>
                      <td style={{ padding: '2px 4px', textAlign: 'right' }}>{p.s_views}</td>
                      <td style={{ padding: '2px 4px', textAlign: 'right' }}>
                        <span style={{ display: 'inline-block', width: `${(p.s_dwell / maxDwell) * 40}px`, height: 7, background: TRACK, verticalAlign: 'middle', marginRight: 3, borderRadius: 2 }} />
                        {p.s_dwell}s
                      </td>
                      <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 600 }}>{(p.s_dwell_share * 100).toFixed(0)}%</td>
                      <td style={{ padding: '2px 4px', textAlign: 'right' }}>{p.s_is_last ? '✓' : ''}</td>
                      <td style={{ padding: '2px 4px', textAlign: 'right', opacity: 0.7 }}>{p.s_seconds_since > 9000 ? '—' : `${p.s_seconds_since}s`}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{
        fontSize: '0.83rem', marginTop: '0.7rem', padding: '0.5rem 0.7rem', borderRadius: 6,
        border: `1px solid ${TRACK}`, background: 'rgba(101,163,13,0.10)', lineHeight: 1.6,
      }}>
        Run the slider to the end. By <strong>view count</strong> the USB-C Hub leads the Steel Bottle 3 to 1 —
        a 3× signal. By <strong>dwell</strong> it leads 439s to 12s, a <strong>37×</strong> signal, and takes 81%
        of the session's total attention. The Bottle was a 12-second bounce; counting it as one "view", equal to
        a 210-second read of the Hub, throws away almost everything the session told you.
      </div>
    </div>
  )
}
