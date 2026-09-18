import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#ca8a04'
const POS = '#0E8074'
const NEG = '#b91c1c'

/* The additivity guarantee is what makes a force plot readable, and it is easier
 * to trust once you have moved the bars yourself and watched the total stay
 * pinned to the prediction. */

const NAMES = ['income', 'credit history', 'debt ratio', 'employment']

export default function ShapAdditivityWidget() {
  const [vals, setVals] = useState([0.22, 0.15, -0.09, 0.04])
  const baseline = 0.30
  const total = vals.reduce((a, b) => a + b, 0)
  const prediction = baseline + total

  const set = (i, v) => setVals(vs => vs.map((x, j) => (j === i ? v : x)))

  const W = 340, H = 46
  const scale = 0.55   // fraction of width per unit contribution
  let cursor = 0

  return (
    <Accent value={COLOR}>
      <div>
        {NAMES.map((n, i) => (
          <div key={n} style={{ marginBottom: '0.3rem' }}>
            <Slider label={n} value={vals[i]} onChange={v => set(i, v)} min={-0.3} max={0.35} step={0.01}
              fmt={v => (v >= 0 ? '+' : '') + v.toFixed(2)} width={130} />
          </div>
        ))}

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', marginTop: '0.5rem' }}
          role="img" aria-label="A bar per feature, laid end to end from the baseline. Their combined length always reaches exactly the final prediction.">
          <line x1={W * 0.12} y1={4} x2={W * 0.12} y2={H - 14} stroke="var(--text-muted)" strokeDasharray="3 3" />
          <text x={W * 0.12} y={H - 3} fontSize={9} textAnchor="middle" fill="var(--text-muted)">baseline</text>
          {vals.map((v, i) => {
            const x0 = W * 0.12 + cursor * W * scale
            const w = Math.abs(v) * W * scale
            const x = v >= 0 ? x0 : x0 - w
            cursor += v
            return (
              <g key={i}>
                <rect x={x} y={8} width={Math.max(1, w)} height={18} fill={v >= 0 ? POS : NEG} opacity={0.85} />
              </g>
            )
          })}
          <line x1={W * 0.12 + total * W * scale} y1={4} x2={W * 0.12 + total * W * scale} y2={H - 14}
            stroke={COLOR} strokeWidth={2} />
          <text x={W * 0.12 + total * W * scale} y={H - 3} fontSize={9} textAnchor="middle" fill={COLOR}>prediction</text>
        </svg>

        <Readout items={[
          ['baseline', baseline.toFixed(2)],
          ['sum of contributions', (total >= 0 ? '+' : '') + total.toFixed(2)],
          ['prediction', prediction.toFixed(2)],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Move any slider and the final marker moves with it, exactly. That is the additivity guarantee: the
          contributions always sum to the gap between this prediction and the average one, with nothing left
          over and nothing counted twice. It is what lets you read the bars as a complete explanation rather
          than a suggestive ranking.
        </p>
      </div>
    </Accent>
  )
}
