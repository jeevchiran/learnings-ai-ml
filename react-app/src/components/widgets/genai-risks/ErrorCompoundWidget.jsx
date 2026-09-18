import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#b91c1c'
const SAFE = '#0E8074'

/* A per-token error rate that sounds negligible becomes a near-certainty over a
 * paragraph, and the curve is the argument. It also explains why longer answers
 * are riskier, which is not obvious from the model's own confidence. */

const W = 330, H = 150, PAD = 30
const MAX = 300

export default function ErrorCompoundWidget() {
  const [rate, setRate] = useState(0.002)
  const [len, setLen] = useState(120)

  const p = n => 1 - Math.pow(1 - rate, n)
  const toX = n => PAD + (n / MAX) * (W - 2 * PAD)
  const toY = v => H - PAD - v * (H - 2 * PAD)
  const path = 'M' + Array.from({ length: 61 }, (_, i) => {
    const n = (i / 60) * MAX
    return `${toX(n)},${toY(p(n))}`
  }).join(' L')

  const here = p(len)

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <Slider label="chance of a wrong claim per sentence" value={rate} onChange={setRate}
            min={0.001} max={0.05} step={0.001} fmt={v => `${(v * 100).toFixed(1)}%`} width={150} />
          <Slider label="answer length (sentences)" value={len} onChange={setLen}
            min={5} max={MAX} step={5} width={130} />
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}
          role="img" aria-label={"The probability that an answer contains at least one wrong claim, rising towards certainty as the answer gets longer."}>
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
          <line x1={PAD} y1={PAD - 12} x2={PAD} y2={H - PAD} stroke="var(--border)" />
          <line x1={PAD} y1={toY(0.5)} x2={W - PAD} y2={toY(0.5)} stroke="var(--text-muted)" strokeDasharray="3 3" />
          <text x={W - PAD} y={toY(0.5) - 4} fontSize={9} textAnchor="end" fill="var(--text-muted)">even odds</text>
          <text x={W - PAD} y={H - 9} fontSize={9.5} textAnchor="end" fill="var(--text-muted)">sentences →</text>
          <path d={path} fill="none" stroke={COLOR} strokeWidth={2} />
          <line x1={toX(len)} y1={PAD - 12} x2={toX(len)} y2={H - PAD} stroke="var(--text-muted)" strokeDasharray="3 3" />
          <circle cx={toX(len)} cy={toY(here)} r={5} fill={here > 0.5 ? COLOR : SAFE} />
        </svg>

        <Readout items={[
          ['per-sentence accuracy', `${((1 - rate) * 100).toFixed(1)}%`],
          ['chance of at least one error', `${(here * 100).toFixed(1)}%`],
        ]} />

        <p style={{ fontSize: '0.78rem', color: here > 0.5 ? COLOR : 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          A per-sentence accuracy that sounds excellent does not survive length. At {((1 - rate) * 100).toFixed(1)} percent
          per sentence, an answer of {len} sentences carries a {(here * 100).toFixed(0)} percent chance of containing
          at least one false claim. Nothing about the model got worse — the answer just got longer, which is why
          asking for a thorough response quietly raises the risk.
        </p>
      </div>
    </Accent>
  )
}
