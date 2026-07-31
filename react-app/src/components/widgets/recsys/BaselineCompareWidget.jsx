import { useEffect, useRef, useState, useMemo } from 'react'
import Plotly from 'plotly.js-dist-min'
import {
  splitByTime, testTargets, buildMatrix, binarize, USER_IDS, USERS,
  rankByPopularity, rankByRecency, rankRandom, rankScores,
  itemCFScores, trainALS, alsScores, evaluate, productName,
} from './recsysUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const TRACK = '#65a30d'
const COLORS = { random: '#94a3b8', popular: '#0891b2', recent: '#ca8a04', itemcf: '#7c3aed', als: TRACK }

/* Every baseline, one table, one chart, same held-out targets. The lesson is
 * ordering, not absolute numbers: on a 6-user toy set the numbers are noisy,
 * but "recently viewed" beating popularity is a real e-commerce result. */
export default function BaselineCompareWidget() {
  const barRef = useRef(null)
  const [k, setK] = useState(3)

  const results = useMemo(() => {
    const { train } = splitByTime()
    const targets = testTargets()
    const M = buildMatrix(train)
    const B = binarize(M)
    const popRank = rankByPopularity(train)
    const { X, Y } = trainALS(M, { k: 3, alpha: 1.0, reg: 0.1, iters: 20, seed: 7 })

    const models = {
      random:  { name: 'Random',            fn: () => rankRandom(3) },
      popular: { name: 'Most popular',      fn: () => popRank },
      recent:  { name: 'Recently viewed',   fn: u => rankByRecency(train, u) },
      itemcf:  { name: 'Item-item CF',      fn: u => rankScores(itemCFScores(B, u)) },
      als:     { name: 'Implicit MF (ALS)', fn: u => rankScores(alsScores(X, Y, u)) },
    }
    const out = {}
    for (const [key, m] of Object.entries(models)) out[key] = { ...m, ...evaluate(m.fn, targets, k) }
    return { out, targets }
  }, [k])

  useEffect(() => {
    const keys = Object.keys(results.out)
    Plotly.react(barRef.current, [
      { x: keys.map(x => results.out[x].name), y: keys.map(x => results.out[x].hitRate), type: 'bar', name: `HitRate@${k}`, marker: { color: '#0891b2' } },
      { x: keys.map(x => results.out[x].name), y: keys.map(x => results.out[x].ndcg),    type: 'bar', name: `NDCG@${k}`,    marker: { color: TRACK } },
      { x: keys.map(x => results.out[x].name), y: keys.map(x => results.out[x].mrr),     type: 'bar', name: `MRR@${k}`,     marker: { color: '#7c3aed' } },
    ], plotlyLayout({
      barmode: 'group',
      yaxis: { title: 'score', range: [0, 1] },
      xaxis: { title: '' },
      legend: { orientation: 'h', y: -0.22 },
      margin: { t: 12, r: 12, b: 70, l: 45 },
    }), PLOTLY_CONFIG)
  }, [results, k])

  const keys = Object.keys(results.out)
  const best = keys.reduce((a, b) => (results.out[b].ndcg > results.out[a].ndcg ? b : a))

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
        cut-off k
        <input type="range" min="1" max="6" step="1" value={k} onChange={e => setK(+e.target.value)} />
        <strong>{k}</strong>
        <span style={{ opacity: 0.65 }}>· 6 held-out purchases, days 25–30</span>
      </label>

      <div ref={barRef} style={{ minHeight: 260 }} />

      <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.78rem', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '3px 6px' }}>Model</th>
              {USER_IDS.map((u, i) => (
                <th key={u} style={{ padding: '3px 6px', fontWeight: 500 }}>
                  {USERS[i].name}<br /><span style={{ opacity: 0.6, fontWeight: 400 }}>{productName(results.targets[u]).split(' ')[0]}</span>
                </th>
              ))}
              <th style={{ padding: '3px 6px' }}>Coverage</th>
            </tr>
          </thead>
          <tbody>
            {keys.map(key => {
              const m = results.out[key]
              return (
                <tr key={key} style={{ background: key === best ? 'rgba(101,163,13,0.10)' : 'transparent' }}>
                  <td style={{ padding: '3px 6px', whiteSpace: 'nowrap', color: COLORS[key], fontWeight: 600 }}>{m.name}</td>
                  {USER_IDS.map(u => {
                    const rank = m.per[u].rank
                    const inK = rank && rank <= k
                    return (
                      <td key={u} style={{ padding: '3px 6px', textAlign: 'center', color: inK ? TRACK : 'var(--text-muted, #999)', fontWeight: inK ? 700 : 400 }}>
                        {rank ? `#${rank}` : '—'}
                      </td>
                    )
                  })}
                  <td style={{ padding: '3px 6px', textAlign: 'center' }}>{(m.coverage * 100).toFixed(0)}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: '0.3rem' }}>
        Cell = the rank the model gave that shopper's actual next purchase. Green = inside the top {k}. “—” = never ranked.
      </p>

      <p style={{ fontSize: '0.82rem', opacity: 0.8, marginTop: '0.6rem', lineHeight: 1.65 }}>
        <strong>Most popular</strong> shows the identical slate to all six shoppers, so its coverage is stuck at{' '}
        {(results.out.popular.coverage * 100).toFixed(0)}% — three products out of nine ever get seen. It still
        beats random, which is exactly why it is the bar and not the goal. <strong>Recently viewed</strong> is
        not personalisation at all, just memory, and it is brutally hard to beat in e-commerce because shoppers
        come back to finish what they started. Any model you ship has to beat <em>that</em> line, not the random one.
      </p>
    </div>
  )
}
