import { useState } from 'react'
import {
  productName, precisionAtK, recallAtK, averagePrecisionAtK,
  ndcgAtK, dcgAtK, idcgAtK, reciprocalRank, hitAtK,
} from './recsysUtils.js'

const TRACK = '#65a30d'

// The slate NovaCart's ranker returned for one shopper, best first.
const SLATE = ['P8', 'P1', 'P2', 'P5', 'P3', 'P7', 'P4', 'P6']
const DEFAULT_REL = new Set(['P1', 'P5', 'P7'])

/* Click a row to mark it relevant (the shopper actually bought/clicked it),
 * drag k, and read every offline ranking metric off the same slate at once.
 * The point is to feel WHERE they disagree, not to memorise six formulas. */
export default function RankingMetricsWidget() {
  const [rel, setRel] = useState(DEFAULT_REL)
  const [k, setK] = useState(3)

  const relArr = [...rel]
  const toggle = id => setRel(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const p = precisionAtK(SLATE, rel, k)
  const r = recallAtK(SLATE, rel, k)
  const ap = averagePrecisionAtK(SLATE, rel, k)
  const nd = ndcgAtK(SLATE, rel, k)
  const rr = reciprocalRank(SLATE, rel, k)
  const hit = hitAtK(SLATE, rel, k)
  const dcg = dcgAtK(SLATE, rel, k)
  const idcg = idcgAtK(rel, k)
  const firstHit = SLATE.findIndex(id => rel.has(id)) + 1

  const METRICS = [
    { label: `Precision@${k}`, v: p,  why: `of the ${k} slots you spent, what fraction paid off` },
    { label: `Recall@${k}`,    v: r,  why: `of everything they wanted, what fraction you surfaced` },
    { label: `HitRate@${k}`,   v: hit, why: 'did the top-k contain anything at all' },
    { label: `MRR@${k}`,       v: rr, why: `1 / rank of the FIRST hit${firstHit && firstHit <= k ? ` = 1/${firstHit}` : ' — none in top-k'}` },
    { label: `MAP@${k}`,       v: ap, why: 'mean precision measured at each hit position' },
    { label: `NDCG@${k}`,      v: nd, why: 'log-discounted gain, normalised by the best possible order' },
  ]

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: '0 0 0.6rem' }}>
        NovaCart's ranker returned this slate. Click a product to toggle it{' '}
        <strong style={{ color: TRACK }}>relevant</strong> (the shopper really wanted it), then drag k.
      </p>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
        cut-off k
        <input type="range" min="1" max={SLATE.length} step="1" value={k} onChange={e => setK(+e.target.value)} />
        <strong>{k}</strong>
        <span style={{ opacity: 0.6 }}>· {rel.size} relevant item{rel.size === 1 ? '' : 's'}</span>
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(230px, 1.1fr)', gap: '1rem' }}>
        <div>
          {SLATE.map((id, i) => {
            const isRel = rel.has(id)
            const inK = i < k
            return (
              <div key={id} onClick={() => toggle(id)} role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && toggle(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                  padding: '0.28rem 0.5rem', marginBottom: 2, borderRadius: 4, fontSize: '0.82rem',
                  background: isRel ? 'rgba(101,163,13,0.16)' : 'transparent',
                  border: `1px solid ${isRel ? TRACK : 'var(--border, #d4d4d8)'}`,
                  opacity: inK ? 1 : 0.4,
                }}>
                <span style={{ width: 16, opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                <span style={{ flex: 1 }}>{productName(id)}</span>
                <span style={{ color: isRel ? TRACK : 'var(--text-muted, #999)', fontWeight: 700 }}>
                  {isRel ? '✓' : '·'}
                </span>
                {inK && <span style={{ fontSize: '0.68rem', opacity: 0.55, fontFamily: 'monospace' }}>
                  1/log₂({i + 2})={(1 / Math.log2(i + 2)).toFixed(2)}
                </span>}
              </div>
            )
          })}
          <p style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: '0.4rem' }}>
            Faded rows are below the cut-off — invisible to every @k metric.
          </p>
        </div>

        <div>
          {METRICS.map(m => (
            <div key={m.label} style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <strong>{m.label}</strong>
                <span style={{ fontFamily: 'monospace', color: TRACK, fontWeight: 700 }}>{m.v.toFixed(3)}</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-hover, #eee)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(1, m.v) * 100}%`, height: '100%', background: TRACK }} />
              </div>
              <div style={{ fontSize: '0.72rem', opacity: 0.68, marginTop: 1 }}>{m.why}</div>
            </div>
          ))}

          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', opacity: 0.8, marginTop: '0.6rem', lineHeight: 1.7 }}>
            DCG@{k} &nbsp;= {dcg.toFixed(4)}<br />
            IDCG@{k} = {idcg.toFixed(4)} &nbsp;<span style={{ fontFamily: 'inherit', opacity: 0.7 }}>(all {Math.min(k, rel.size)} hits stacked on top)</span><br />
            NDCG@{k} = {dcg.toFixed(4)} / {idcg.toFixed(4)} = <strong>{nd.toFixed(4)}</strong>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', opacity: 0.78, marginTop: '0.7rem', lineHeight: 1.6 }}>
        Sweep k from 1 to 8 with the default relevances: <strong>Recall@k only ever goes up</strong> (you can
        only find more), <strong>Precision@k mostly goes down</strong> (you spend slots on junk), and{' '}
        <strong>MRR does not move at all</strong> past the first hit — it stopped caring once it found one.
        NDCG is the only one that reacts to <em>where</em> each later hit lands. Pick the metric whose
        indifference you can live with.
      </p>
    </div>
  )
}
