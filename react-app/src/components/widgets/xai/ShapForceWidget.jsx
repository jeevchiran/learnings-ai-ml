import { useState } from 'react'

const UP = '#dc2626'   // pushes prediction higher
const DOWN = '#2563eb' // pushes prediction lower

const BASE = 300 // E[f(x)] average house price ($k)
const FEATS = [
  { name: 'Size (sqft)', min: 600, max: 3000, mean: 1600, coef: 0.09, val: 2200 },
  { name: 'Location score', min: 1, max: 10, mean: 5, coef: 22, val: 8 },
  { name: 'Age (years)', min: 0, max: 80, mean: 30, coef: -1.4, val: 12 },
]

export default function ShapForceWidget() {
  const [vals, setVals] = useState(FEATS.map(f => f.val))

  const contribs = FEATS.map((f, i) => ({ name: f.name, phi: f.coef * (vals[i] - f.mean) }))
  const pred = BASE + contribs.reduce((a, c) => a + c.phi, 0)

  // build force layout: order by sign, positive (red) then negative (blue)
  const total = contribs.reduce((a, c) => a + Math.abs(c.phi), 0) || 1
  const W = 460, H = 54
  const scale = (W - 20) / Math.max(total, 1)

  // positive segments left-to-right, then negative
  const pos = contribs.filter(c => c.phi >= 0).sort((a, b) => b.phi - a.phi)
  const neg = contribs.filter(c => c.phi < 0).sort((a, b) => a.phi - b.phi)
  let x = 10
  const segs = []
  for (const c of pos) { const w = c.phi * scale; segs.push({ ...c, x, w, color: UP }); x += w }
  for (const c of neg) { const w = -c.phi * scale; segs.push({ ...c, x, w, color: DOWN }); x += w }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H + 46} style={{ display: 'block', minWidth: 320 }}>
          {segs.map((s, i) => (
            <g key={i}>
              <rect x={s.x} y={10} width={Math.max(s.w - 1, 0)} height={H - 20} fill={s.color} opacity={0.85} rx={2} />
              {s.w > 46 && (
                <text x={s.x + s.w / 2} y={H / 2 + 3} textAnchor="middle" fontSize="9" fill="#fff">
                  {s.name.split(' ')[0]} {s.phi >= 0 ? '+' : ''}{s.phi.toFixed(0)}
                </text>
              )}
            </g>
          ))}
          <text x={10} y={H + 12} fontSize="10" fill="var(--text-muted)">base E[f(x)] = {BASE}</text>
          <text x={W - 10} y={H + 12} textAnchor="end" fontSize="11" fill="var(--text)" fontWeight="700">
            prediction = ${pred.toFixed(0)}k
          </text>
          <text x={W / 2} y={H + 30} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
            <tspan fill={UP}>red ▶ pushes up</tspan> &nbsp;·&nbsp; <tspan fill={DOWN}>blue ◀ pushes down</tspan>
          </text>
        </svg>
      </div>

      <div style={{ marginTop: '0.4rem' }}>
        {FEATS.map((f, i) => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.32rem 0', fontSize: '0.82rem' }}>
            <span style={{ width: 110, color: 'var(--text-muted)' }}>{f.name}</span>
            <input type="range" min={f.min} max={f.max} value={vals[i]}
              onChange={e => setVals(v => v.map((x, j) => j === i ? +e.target.value : x))}
              style={{ flex: 1, accentColor: contribs[i].phi >= 0 ? UP : DOWN }} />
            <span style={{ width: 44, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{vals[i]}</span>
            <span style={{ width: 52, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: contribs[i].phi >= 0 ? UP : DOWN, fontWeight: 600 }}>
              {contribs[i].phi >= 0 ? '+' : ''}{contribs[i].phi.toFixed(0)}
            </span>
          </label>
        ))}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        SHAP is <strong>additive</strong>: base value + every feature's SHAP value = the exact prediction. Drag a slider — its contribution φ moves the bar, and the total always lands on the model output. This is the efficiency axiom made visual.
      </p>
    </div>
  )
}
