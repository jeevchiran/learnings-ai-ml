import { useState } from 'react'

const TRACK = '#65a30d'

/* The two-stage (really three-stage) funnel every production store runs.
 * Drag the catalog size and the latency budget and watch which stage is
 * allowed to be smart and which one is only allowed to be fast. */

const STAGES = [
  {
    key: 'retrieval',
    name: 'Retrieval / candidate generation',
    color: '#0891b2',
    out: n => Math.min(n, 500),
    budget: 'cheap: ANN lookup, ~10 ms',
    job: 'Throw away 99.99% of the catalog without missing anything good.',
    model: 'Two-tower / ALS / co-visit lists — no cross features, embeddings precomputed.',
    metric: 'Recall@500 (did the good item survive?)',
  },
  {
    key: 'ranking',
    name: 'Ranking',
    color: '#7c3aed',
    out: () => 50,
    budget: 'expensive: ~40 ms for the whole slate',
    job: 'Order the survivors as precisely as possible.',
    model: 'Gradient-boosted trees or a DNN over hundreds of user×item features.',
    metric: 'NDCG@10, AUC',
  },
  {
    key: 'rerank',
    name: 'Re-ranking / business rules',
    color: '#ca8a04',
    out: () => 10,
    budget: 'trivial: ~2 ms',
    job: 'Fix what the ranker cannot see: diversity, stock, margin, dedupe.',
    model: 'MMR diversification + hard filters.',
    metric: 'Category diversity, out-of-stock rate',
  },
]

export default function FunnelWidget() {
  const [catalog, setCatalog] = useState(1_000_000)
  const [open, setOpen] = useState('retrieval')

  const counts = [catalog, ...STAGES.map((s, i) => s.out(catalog, i))]
  const maxW = 100
  const widthFor = n => Math.max(6, (Math.log10(n + 1) / Math.log10(catalog + 1)) * maxW)
  const fmt = n => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}k` : String(n))

  const active = STAGES.find(s => s.key === open)

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
        NovaCart catalog size
        <input type="range" min="4" max="7" step="1" value={Math.log10(catalog)}
          onChange={e => setCatalog(Math.pow(10, +e.target.value))} />
        <strong>{fmt(catalog)} products</strong>
      </label>

      <svg viewBox="0 0 260 132" style={{ width: '100%', maxWidth: 520, display: 'block' }} role="img"
        aria-label="Recommendation funnel from full catalog down to ten shown products">
        {[0, 1, 2, 3].map(i => {
          const w = widthFor(counts[i])
          const y = i * 32 + 4
          const stage = STAGES[i - 1]
          return (
            <g key={i}>
              <rect x={(260 - w * 2.4) / 2} y={y} width={w * 2.4} height={22} rx={4}
                fill={i === 0 ? 'var(--bg-hover, #e5e7eb)' : stage.color}
                opacity={i === 0 ? 1 : open === stage.key ? 1 : 0.55}
                stroke={i > 0 && open === stage.key ? 'currentColor' : 'none'} strokeWidth="1"
                style={{ cursor: i > 0 ? 'pointer' : 'default' }}
                onClick={() => i > 0 && setOpen(stage.key)} />
              <text x="130" y={y + 15} textAnchor="middle" fontSize="9.5" fontWeight="600"
                fill={i === 0 ? 'var(--text, #111)' : '#fff'} style={{ pointerEvents: 'none' }}>
                {i === 0 ? `catalog — ${fmt(counts[0])}` : `${stage.name.split(' ')[0]} — ${fmt(counts[i])}`}
              </text>
              {i < 3 && <path d={`M130 ${y + 23} l0 6 m-3 -3 l3 3 l3 -3`} stroke="var(--text-muted, #888)" fill="none" strokeWidth="1" />}
            </g>
          )
        })}
      </svg>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.5rem 0 0.6rem' }}>
        {STAGES.map(s => (
          <button key={s.key} onClick={() => setOpen(s.key)}
            style={{
              padding: '0.28rem 0.7rem', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer',
              fontFamily: 'inherit', border: `1px solid ${s.color}`,
              background: open === s.key ? s.color : 'transparent',
              color: open === s.key ? '#fff' : 'var(--text)',
            }}>
            {s.name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div style={{ borderLeft: `3px solid ${active.color}`, paddingLeft: '0.75rem', fontSize: '0.85rem', lineHeight: 1.65 }}>
        <strong style={{ color: active.color }}>{active.name}</strong><br />
        <span style={{ opacity: 0.85 }}>{active.job}</span><br />
        <span style={{ opacity: 0.7 }}>Typical model — {active.model}</span><br />
        <span style={{ opacity: 0.7 }}>Latency — {active.budget}</span><br />
        <span style={{ opacity: 0.7 }}>Optimised for — <strong>{active.metric}</strong></span>
      </div>

      <p style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: '0.6rem' }}>
        Push the catalog to 10M: the retrieval box barely moves. That is the point — retrieval's output size
        is fixed by the ranker's latency budget, not by the catalog. Growing the catalog only makes retrieval's
        job <em>harder</em>, never its output bigger. An item dropped here can never be recovered downstream,
        which is why retrieval is scored on <strong style={{ color: TRACK }}>recall</strong> and ranking on precision.
      </p>
    </div>
  )
}
