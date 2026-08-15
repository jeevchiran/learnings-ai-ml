import { useState } from 'react'
import { Slider, Readout } from '../shared/ui.jsx'

const COLOR = '#b45309'
const MAX_LEN = 40

// Synthetic but representative curve: a fixed-size context vector has to
// represent more and more source tokens as length grows, so quality decays.
function quality(len) { return 90 * Math.exp(-(len - 1) / 12) + 8 }

export default function BottleneckWidget() {
  const [len, setLen] = useState(6)

  const W = 480, H = 180, padL = 40, padB = 26, padT = 10, padR = 10
  const plotW = W - padL - padR, plotH = H - padT - padB
  const xOf = l => padL + ((l - 1) / (MAX_LEN - 1)) * plotW
  const yOf = q => padT + (1 - q / 100) * plotH

  const points = []
  for (let l = 1; l <= MAX_LEN; l++) points.push(`${xOf(l)},${yOf(quality(l))}`)

  const curQ = quality(len)

  return (
    <div>
      <svg width={W} height={H} style={{ display: 'block' }}>
        {/* axes */}
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="var(--border)" />
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="var(--border)" />
        <text x={padL - 6} y={padT + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)">100%</text>
        <text x={padL - 6} y={H - padB} textAnchor="end" fontSize="9" fill="var(--text-muted)">0%</text>
        <text x={W - padR} y={H - 8} textAnchor="end" fontSize="9" fill="var(--text-muted)">40 tokens</text>
        <text x={padL} y={H - 8} textAnchor="start" fontSize="9" fill="var(--text-muted)">1 token</text>

        <polyline points={points.join(' ')} fill="none" stroke={COLOR} strokeWidth="2.5" />

        {/* current marker */}
        <line x1={xOf(len)} y1={padT} x2={xOf(len)} y2={H - padB} stroke={COLOR} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
        <circle cx={xOf(len)} cy={yOf(curQ)} r="5" fill={COLOR} stroke="#fff" strokeWidth="1.5" />
      </svg>

      <div style={{ marginTop: '0.5rem' }}>
        <Slider label="Sentence length" value={len} onChange={setLen} min={1} max={MAX_LEN} fmt={v => `${v} tokens`} width={220} />
      </div>

      <Readout items={[
        ['context vector size', 'fixed (e.g. 512)'],
        ['proxy translation quality', `${curQ.toFixed(0)}%`],
      ]} />

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        The context vector's size never changes — only the amount it has to compress does. This curve is illustrative, not measured, but the direction is exactly what Bahdanau et al. (2014) reported for real encoder-decoder translation systems.
      </p>
    </div>
  )
}
