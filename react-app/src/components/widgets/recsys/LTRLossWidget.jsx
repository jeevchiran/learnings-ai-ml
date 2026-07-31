import { useState } from 'react'
import {
  productName, pointwiseLoss, pairwiseLoss, listwiseLoss, ndcgAtK, sigmoid,
} from './recsysUtils.js'

const TRACK = '#65a30d'

// One slate the ranker scored. Labels are the ground truth (1 = shopper bought it).
const SLATE = [
  { id: 'P8', label: 0, base:  2.0 },
  { id: 'P1', label: 1, base:  1.0 },
  { id: 'P5', label: 1, base: -0.5 },
  { id: 'P2', label: 0, base:  0.5 },
  { id: 'P6', label: 0, base: -1.0 },
]

/* Drag each item's score and watch three losses disagree. The headline: a
 * constant shift changes pointwise loss a lot and leaves pairwise/listwise
 * exactly alone — because only one of the three is actually about ranking. */
export default function LTRLossWidget() {
  const [scores, setScores] = useState(SLATE.map(s => s.base))
  const [shift, setShift] = useState(0)

  const eff = scores.map(s => s + shift)
  const labels = SLATE.map(s => s.label)

  const order = eff.map((s, i) => ({ i, s })).sort((a, b) => b.s - a.s)
  const rankedIds = order.map(o => SLATE[o.i].id)
  const relevant = SLATE.filter(s => s.label === 1).map(s => s.id)

  const losses = [
    { name: 'Pointwise (log loss)', v: pointwiseLoss(eff, labels), color: '#0891b2',
      note: 'judges each item alone against 0/1 — never compares two items' },
    { name: 'Pairwise (RankNet)',   v: pairwiseLoss(eff, labels),  color: '#7c3aed',
      note: 'sums over (positive, negative) pairs — only score DIFFERENCES matter' },
    { name: 'Listwise (ListNet)',   v: listwiseLoss(eff, labels),  color: TRACK,
      note: 'softmax over the whole slate — one item rising pushes every other down' },
  ]

  const set = (i, v) => setScores(prev => prev.map((x, j) => (j === i ? v : x)))
  const perfect = () => { setScores([-1.0, 2.0, 1.5, -0.5, -2.0]); setShift(0) }
  const reset = () => { setScores(SLATE.map(s => s.base)); setShift(0) }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <p style={{ fontSize: '0.85rem', opacity: 0.82, margin: '0 0 0.6rem' }}>
        One shopper, one slate of five products. Drag a score to change what the ranker believes.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(230px, 1fr) minmax(210px, 0.9fr)', gap: '1rem' }}>
        <div>
          {SLATE.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
              <span style={{
                width: 20, textAlign: 'center', fontWeight: 700,
                color: s.label ? TRACK : 'var(--text-muted, #999)',
              }}>{s.label ? '1' : '0'}</span>
              <span style={{ width: 96 }}>{productName(s.id)}</span>
              <input type="range" min="-3" max="3" step="0.1" value={scores[i]}
                onChange={e => set(i, +e.target.value)} style={{ flex: 1, minWidth: 70 }} />
              <span style={{ fontFamily: 'monospace', width: 42, textAlign: 'right' }}>{eff[i].toFixed(1)}</span>
              <span style={{ fontFamily: 'monospace', width: 42, textAlign: 'right', opacity: 0.6 }}>
                {sigmoid(eff[i]).toFixed(2)}
              </span>
            </div>
          ))}
          <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.5rem' }}>
            columns: label · product · score · σ(score)
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem' }}>
            shift <em>every</em> score by
            <input type="range" min="-3" max="3" step="0.25" value={shift} onChange={e => setShift(+e.target.value)} />
            <strong>{shift >= 0 ? '+' : ''}{shift.toFixed(2)}</strong>
          </label>

          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
            <button onClick={perfect} style={btn(TRACK)}>Make the order perfect</button>
            <button onClick={reset} style={btn('var(--border, #999)')}>Reset</button>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            resulting order:{' '}
            {rankedIds.map((id, i) => (
              <span key={id}>
                {i > 0 && ' › '}
                <span style={{ color: SLATE.find(s => s.id === id).label ? TRACK : 'var(--text-muted, #999)', fontWeight: 600 }}>
                  {productName(id).split(' ')[0]}
                </span>
              </span>
            ))}
          </div>
          <div style={{ fontSize: '0.85rem', marginBottom: '0.7rem' }}>
            NDCG@3 = <strong style={{ color: TRACK }}>{ndcgAtK(rankedIds, relevant, 3).toFixed(3)}</strong>
            <span style={{ opacity: 0.65, fontSize: '0.78rem' }}> — the thing you actually care about</span>
          </div>

          {losses.map(l => (
            <div key={l.name} style={{ marginBottom: '0.55rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.81rem' }}>
                <strong style={{ color: l.color }}>{l.name}</strong>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{l.v.toFixed(4)}</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-hover, #eee)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (l.v / 3) * 100)}%`, height: '100%', background: l.color }} />
              </div>
              <div style={{ fontSize: '0.71rem', opacity: 0.68 }}>{l.note}</div>
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', opacity: 0.82, marginTop: '0.6rem', lineHeight: 1.65 }}>
        Move only the <strong>shift</strong> slider. The order never changes, NDCG never changes, pairwise and
        listwise loss never change — and pointwise loss swings wildly. Pointwise is solving a different problem
        (calibrated click probability) and only ranks correctly as a side effect. That side effect is often
        good enough and it trains fastest, which is why most production rankers still start pointwise. You
        graduate to pairwise when the ordering near the top is what pays, and to listwise when the whole slate
        is judged together.
      </p>
    </div>
  )
}

const btn = color => ({
  padding: '0.28rem 0.7rem', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer',
  fontFamily: 'inherit', border: `1px solid ${color}`, background: 'transparent', color: 'var(--text)',
})
