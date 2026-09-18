import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#ca8a04'
const LINE = '#b91c1c'

/* The local-linearity claim, shown by shrinking the neighbourhood. A wide
 * neighbourhood fits a line to a curve and explains nothing; a narrow one is
 * faithful. That is exactly what the proximity kernel controls. */

const W = 330, H = 180, PAD = 26

// A deliberately wiggly decision function.
const f = x => 0.5 + 0.35 * Math.sin(x * 3.1) + 0.12 * x

export default function LimeLocalFitWidget() {
  const [x0, setX0] = useState(1.6)
  const [width, setWidth] = useState(0.4)

  const toX = v => PAD + (v / 3) * (W - 2 * PAD)
  const toY = v => H - PAD - v * (H - 2 * PAD)

  const curve = () => {
    const pts = []
    for (let i = 0; i <= 150; i++) {
      const v = (i / 150) * 3
      pts.push(`${toX(v)},${toY(f(v))}`)
    }
    return 'M' + pts.join(' L')
  }

  // Weighted least squares over samples near x0.
  const samples = Array.from({ length: 60 }, (_, i) => (i / 59) * 3)
  const wts = samples.map(s => Math.exp(-((s - x0) ** 2) / (2 * width * width)))
  const sw = wts.reduce((a, b) => a + b, 0)
  const mx = samples.reduce((a, s, i) => a + wts[i] * s, 0) / sw
  const my = samples.reduce((a, s, i) => a + wts[i] * f(s), 0) / sw
  const num = samples.reduce((a, s, i) => a + wts[i] * (s - mx) * (f(s) - my), 0)
  const den = samples.reduce((a, s, i) => a + wts[i] * (s - mx) ** 2, 0)
  const slope = den === 0 ? 0 : num / den
  const intercept = my - slope * mx

  const err = Math.sqrt(samples.reduce((a, s, i) => a + wts[i] * (f(s) - (slope * s + intercept)) ** 2, 0) / sw)

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <Slider label="point being explained" value={x0} onChange={setX0} min={0.2} max={2.8} step={0.05}
            fmt={v => v.toFixed(2)} width={140} />
          <Slider label="neighbourhood width" value={width} onChange={setWidth} min={0.08} max={1.5} step={0.02}
            fmt={v => v.toFixed(2)} width={140} />
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}
          role="img" aria-label="A wiggly decision function with a straight line fitted to a weighted neighbourhood around one point. A narrow neighbourhood fits closely; a wide one does not.">
          <rect x={toX(Math.max(0, x0 - width))} y={PAD - 10}
            width={toX(Math.min(3, x0 + width)) - toX(Math.max(0, x0 - width))} height={H - PAD - (PAD - 10)}
            fill={COLOR} opacity={0.10} />
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
          <path d={curve()} fill="none" stroke={COLOR} strokeWidth={2} />
          <line x1={toX(0)} y1={toY(intercept)} x2={toX(3)} y2={toY(slope * 3 + intercept)}
            stroke={LINE} strokeWidth={2} strokeDasharray="6 4" />
          <circle cx={toX(x0)} cy={toY(f(x0))} r={5} fill={LINE} />
        </svg>

        <Readout items={[
          ['local slope', slope.toFixed(2)],
          ['fit error in neighbourhood', err.toFixed(3)],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Narrow the neighbourhood and the dashed line hugs the curve where it matters — the explanation is
          faithful to this one prediction. Widen it and the same line becomes a poor description of the whole
          function and of the point alike. The proximity weighting is not a detail; it is what keeps the
          explanation local.
        </p>
      </div>
    </Accent>
  )
}
