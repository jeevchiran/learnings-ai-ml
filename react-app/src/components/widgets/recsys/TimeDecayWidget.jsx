import { useEffect, useRef, useState, useMemo } from 'react'
import Plotly from 'plotly.js-dist-min'
import {
  splitByTime, decayFactor, decayedAffinity, rawAffinity,
  ITEM_IDS, USER_IDS, USERS, productName, EVENT_WEIGHT,
} from './recsysUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const TRACK = '#65a30d'
const RAW = '#94a3b8'

/* Half-life is the only knob that matters in recency weighting. Drag it and
 * watch a raw-count tie get broken by recency — which is the entire point. */
export default function TimeDecayWidget() {
  const curveRef = useRef(null)
  const [halfLife, setHalfLife] = useState(7)
  const [user, setUser] = useState('U2')
  const [asOf, setAsOf] = useState(24)

  const { train } = splitByTime()
  const raw = useMemo(() => rawAffinity(train, user, asOf), [user, asOf])       // eslint-disable-line
  const dec = useMemo(() => decayedAffinity(train, user, asOf, halfLife), [user, asOf, halfLife]) // eslint-disable-line

  const mine = train.filter(e => e.u === user && e.day < asOf)
  const rawMax = Math.max(1e-9, ...Object.values(raw))
  const decMax = Math.max(1e-9, ...Object.values(dec))

  // ranking flips are the observable consequence
  const order = o => ITEM_IDS.filter(i => o[i] > 0).sort((a, b) => o[b] - o[a] || a.localeCompare(b))
  const rawOrder = order(raw)
  const decOrder = order(dec)
  const flipped = rawOrder[0] && decOrder[0] && rawOrder[0] !== decOrder[0]

  useEffect(() => {
    const ages = Array.from({ length: 31 }, (_, i) => i)
    Plotly.react(curveRef.current, [
      {
        x: ages, y: ages.map(a => decayFactor(a, halfLife)), mode: 'lines', type: 'scatter',
        name: `half-life ${halfLife}d`, line: { color: TRACK, width: 2.5 },
      },
      {
        x: ages, y: ages.map(() => 1), mode: 'lines', type: 'scatter',
        name: 'no decay (raw count)', line: { color: RAW, width: 1.5, dash: 'dot' },
      },
      {
        x: [halfLife], y: [0.5], mode: 'markers+text', type: 'scatter',
        text: ['½'], textposition: 'top center', showlegend: false,
        marker: { color: TRACK, size: 9, symbol: 'circle-open', line: { width: 2 } },
      },
    ], plotlyLayout({
      xaxis: { title: 'event age (days)' },
      yaxis: { title: 'weight', range: [0, 1.08] },
      legend: { orientation: 'h', y: -0.28 },
      margin: { t: 10, r: 10, b: 55, l: 48 },
    }), PLOTLY_CONFIG)
  }, [halfLife])

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
          half-life
          <input type="range" min="1" max="30" step="1" value={halfLife} onChange={e => setHalfLife(+e.target.value)} />
          <strong>{halfLife}d</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          as-of day
          <input type="range" min="12" max="30" step="1" value={asOf} onChange={e => setAsOf(+e.target.value)} />
          <strong>d{asOf}</strong>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '0.9rem' }}>
        <div ref={curveRef} style={{ minHeight: 250 }} />

        <div>
          <div style={{ display: 'flex', fontSize: '0.72rem', opacity: 0.65, marginBottom: 3 }}>
            <span style={{ width: 100 }} />
            <span style={{ flex: 1, color: RAW }}>raw Σw</span>
            <span style={{ flex: 1, color: TRACK }}>decayed</span>
          </div>
          {ITEM_IDS.filter(id => raw[id] > 0 || dec[id] > 0).map(id => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: 3, fontSize: '0.76rem' }}>
              <span style={{ width: 100 }}>{productName(id)}</span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ flex: 1, height: 10, background: 'var(--bg-hover, #eee)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(raw[id] / rawMax) * 100}%`, height: '100%', background: RAW }} />
                </div>
                <span style={{ width: 22, fontFamily: 'monospace', fontSize: '0.7rem' }}>{raw[id].toFixed(0)}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ flex: 1, height: 10, background: 'var(--bg-hover, #eee)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(dec[id] / decMax) * 100}%`, height: '100%', background: TRACK, transition: 'width .15s' }} />
                </div>
                <span style={{ width: 30, fontFamily: 'monospace', fontSize: '0.7rem' }}>{dec[id].toFixed(2)}</span>
              </div>
            </div>
          ))}

          <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: '0.5rem', lineHeight: 1.6 }}>
            <strong>Events used</strong> (all strictly before d{asOf}):<br />
            {mine.map((e, i) => (
              <span key={i}>
                {i > 0 && ' · '}
                d{e.day} {e.type} {productName(e.p).split(' ')[0]}
                <span style={{ opacity: 0.6 }}> ×{decayFactor(asOf - e.day, halfLife).toFixed(2)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        fontSize: '0.83rem', marginTop: '0.6rem', padding: '0.5rem 0.7rem', borderRadius: 6,
        border: `1px solid ${flipped ? TRACK : 'var(--border, #ccc)'}`,
        background: flipped ? 'rgba(101,163,13,0.11)' : 'transparent', lineHeight: 1.6,
      }}>
        {flipped
          ? <>Raw counts rank <strong>{productName(rawOrder[0])}</strong> first; with a {halfLife}-day half-life,{' '}
            <strong style={{ color: TRACK }}>{productName(decOrder[0])}</strong> takes the top slot. Same events,
            different answer — decay broke the tie using <em>when</em>, which the raw sum throws away.</>
          : <>Top item is <strong>{productName(decOrder[0] ?? rawOrder[0] ?? 'P1')}</strong> under both. Drag the
            half-life toward 1–3 days, or move the as-of day later, to find a setting where recency overturns
            the raw count.</>}
      </div>

      <p style={{ fontSize: '0.79rem', opacity: 0.75, marginTop: '0.45rem' }}>
        Weight per event = <code>w(type) × 2^(−age / half-life)</code>, with{' '}
        view={EVENT_WEIGHT.view}, cart={EVENT_WEIGHT.cart}, purchase={EVENT_WEIGHT.purchase}. A 30-day
        half-life is nearly flat — you have reinvented the raw count. A 1-day half-life ignores everything
        but today. The knob is a hypothesis about how fast interest fades in <em>your</em> category, and it is
        worth tuning: fresh produce and laptops are not the same problem.
      </p>
    </div>
  )
}
