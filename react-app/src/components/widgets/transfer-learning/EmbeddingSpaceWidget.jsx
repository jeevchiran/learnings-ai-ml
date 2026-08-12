import { useState } from 'react'
import { TRACK, GALLERY, cosine, l2 } from './tlUtils.js'
import { Accent, Row, Slider, Toggle, Readout, Caption } from '../shared/ui.jsx'

const W = 300, H = 260
const COLORS = { cat: TRACK, dog: '#2563eb', car: '#16a34a' }

export default function EmbeddingSpaceWidget() {
  const [q, setQ] = useState(9)          // the ambiguous 'cat-4?'
  const [k, setK] = useState(3)
  const [useCosine, setUseCosine] = useState(true)

  const sx = x => W / 2 + x * (W / 2 - 26)
  const sy = y => H - 26 - y * (H - 52)

  const query = GALLERY[q]
  const ranked = GALLERY
    .map((e, i) => ({ i, e, score: useCosine ? cosine(query.vec, e.vec) : -l2(query.vec, e.vec) }))
    .filter(x => x.i !== q)
    .sort((a, b) => b.score - a.score)
  const top = ranked.slice(0, k)
  const topSet = new Set(top.map(t => t.i))
  const correct = top.filter(t => t.e.cls === query.cls).length

  return (
    <Accent value={TRACK}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          <Slider label="k" value={k} onChange={setK} min={1} max={6} width={90} />
          <Toggle label="cosine (off = Euclidean)" on={useCosine} onChange={setUseCosine} />
          <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>click a point to query</span>
        </Row>

        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <svg width={W} height={H} style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4 }}>
            <line x1={W / 2} y1={12} x2={W / 2} y2={H - 20} stroke="rgba(128,128,128,0.25)" />
            <line x1={16} y1={sy(0)} x2={W - 10} y2={sy(0)} stroke="rgba(128,128,128,0.25)" />
            {/* unit circle: embeddings are L2-normalised, so only direction matters */}
            <circle cx={sx(0)} cy={sy(0)} r={(W / 2 - 26)} fill="none"
              stroke="rgba(128,128,128,0.22)" strokeDasharray="3 3" />
            {top.map(t => (
              <line key={`l${t.i}`} x1={sx(query.vec[0])} y1={sy(query.vec[1])}
                x2={sx(GALLERY[t.i].vec[0])} y2={sy(GALLERY[t.i].vec[1])}
                stroke={TRACK} strokeWidth="1.2" opacity="0.5" />
            ))}
            {GALLERY.map((e, i) => (
              <g key={e.id} onClick={() => setQ(i)} style={{ cursor: 'pointer' }}>
                <circle cx={sx(e.vec[0])} cy={sy(e.vec[1])} r={i === q ? 8 : topSet.has(i) ? 6 : 4.5}
                  fill={COLORS[e.cls]} stroke={i === q ? '#000' : topSet.has(i) ? TRACK : 'none'}
                  strokeWidth={i === q ? 2 : 1.5} />
                <text x={sx(e.vec[0]) + 8} y={sy(e.vec[1]) + 3} fontSize="8.5" fill="var(--text,#333)">{e.id}</text>
              </g>
            ))}
          </svg>

          <div style={{ fontSize: '0.79rem', minWidth: 250 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              query: {query.id} <span style={{ color: COLORS[query.cls] }}>({query.cls})</span>
            </div>
            <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '0.76rem' }}>
              <thead><tr style={{ opacity: 0.65 }}>
                <th style={{ padding: '2px 8px', textAlign: 'left' }}>#</th>
                <th style={{ padding: '2px 8px', textAlign: 'left' }}>neighbour</th>
                <th style={{ padding: '2px 8px', textAlign: 'right' }}>cos</th>
                <th style={{ padding: '2px 8px', textAlign: 'right' }}>L2</th>
              </tr></thead>
              <tbody>
                {ranked.slice(0, 6).map((t, n) => (
                  <tr key={t.e.id} style={{ opacity: n < k ? 1 : 0.4 }}>
                    <td style={{ padding: '2px 8px' }}>{n + 1}</td>
                    <td style={{ padding: '2px 8px', color: COLORS[t.e.cls] }}>{t.e.id}</td>
                    <td style={{ padding: '2px 8px', textAlign: 'right' }}>{cosine(query.vec, t.e.vec).toFixed(3)}</td>
                    <td style={{ padding: '2px 8px', textAlign: 'right' }}>{l2(query.vec, t.e.vec).toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.5rem', lineHeight: 1.6 }}>
              No classifier is involved. The label comes from a <strong>vote among neighbours</strong>, which is
              why an embedding index can gain a new class without retraining anything.
            </p>
          </div>
        </div>

        <Readout items={[
          ['metric', useCosine ? 'cosine similarity' : 'Euclidean distance'],
          ['top-k agree with query class', `${correct}/${k}`],
          ['kNN verdict', top.reduce((acc, t) => { acc[t.e.cls] = (acc[t.e.cls] || 0) + 1; return acc }, {})[query.cls] === k ? 'unanimous' : 'split'],
          ['nearest', top[0]?.e.id ?? '—'],
        ]} />

        <Caption>
          Query <strong>cat-4?</strong> — it sits between the cat and dog clusters, and its neighbours are split.
          That is what a low-confidence prediction looks like <em>before</em> a softmax hides it behind a number.
          Toggle cosine off: on normalised vectors the two metrics rank identically, because
          <code> ‖a−b‖² = 2 − 2·cos(a,b)</code>. They only diverge when magnitude carries information — which,
          after L2-normalisation, it does not.
        </Caption>
      </div>
    </Accent>
  )
}
