import { useState } from 'react'

const COLOR = '#f59e0b'
const SHUFFLE = '#dc2626'

const OPS = [
  { key: 'map', label: 'map / filter', wide: false, note: 'Narrow — each output partition depends on one input partition. No data crosses the network.' },
  { key: 'groupby', label: 'groupBy / join', wide: true, note: 'Wide — rows with the same key must meet, so partitions are re-shuffled across the network. Expensive.' },
  { key: 'repartition', label: 'repartition', wide: true, note: 'Wide — deliberately redistributes rows across new partitions. A full shuffle.' },
]

export default function ShuffleWidget() {
  const [op, setOp] = useState('map')
  const cur = OPS.find(o => o.key === op)
  const W = 380, H = 180
  const inX = 60, outX = 320
  const parts = [40, 90, 140]  // y centers for 3 partitions

  // narrow: straight across; wide: cross-connect
  const links = []
  parts.forEach((iy, i) => parts.forEach((oy, j) => {
    if (cur.wide || i === j) links.push({ iy, oy, cross: i !== j })
  }))

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.7rem', flexWrap: 'wrap' }}>
        {OPS.map(o => (
          <button key={o.key} onClick={() => setOp(o.key)}
            style={{ padding: '0.24rem 0.7rem', borderRadius: 4, fontSize: '0.78rem', fontFamily: 'monospace', cursor: 'pointer', fontWeight: op === o.key ? 700 : 400,
              border: `2px solid ${op === o.key ? COLOR : 'var(--border)'}`, background: op === o.key ? COLOR : 'var(--bg)', color: op === o.key ? '#fff' : 'var(--text)' }}>
            {o.label}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block', minWidth: 300 }}>
          <text x={inX} y={16} textAnchor="middle" fontSize="10" fill="var(--text-muted)">input partitions</text>
          <text x={outX} y={16} textAnchor="middle" fontSize="10" fill="var(--text-muted)">output partitions</text>
          {links.map((l, i) => (
            <line key={i} x1={inX + 22} y1={l.iy} x2={outX - 22} y2={l.oy}
              stroke={l.cross ? SHUFFLE : COLOR} strokeWidth={l.cross ? 1.5 : 2} opacity={l.cross ? 0.6 : 0.9}
              strokeDasharray={l.cross ? '4,3' : 'none'} style={{ transition: 'all 0.3s' }} />
          ))}
          {parts.map((y, i) => (
            <g key={'in'+i}>
              <rect x={inX - 22} y={y - 14} width={44} height={28} rx={4} fill={`${COLOR}cc`} />
              <text x={inX} y={y + 4} textAnchor="middle" fontSize="10" fill="#fff">P{i+1}</text>
            </g>
          ))}
          {parts.map((y, i) => (
            <g key={'out'+i}>
              <rect x={outX - 22} y={y - 14} width={44} height={28} rx={4} fill={cur.wide ? `${SHUFFLE}cc` : `${COLOR}cc`} />
              <text x={outX} y={y + 4} textAnchor="middle" fontSize="10" fill="#fff">P{i+1}</text>
            </g>
          ))}
        </svg>
      </div>

      <div style={{ marginTop: '0.4rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${cur.wide ? SHUFFLE : COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        <strong style={{ color: cur.wide ? SHUFFLE : COLOR }}>{cur.wide ? 'Wide' : 'Narrow'} transformation:</strong> {cur.note}
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        Shuffles dominate Spark job cost. Minimizing wide transformations — and broadcasting small tables in joins — is the core of tuning.
      </p>
    </div>
  )
}
