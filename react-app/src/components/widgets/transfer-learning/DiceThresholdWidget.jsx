import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#9f1239'

/* The threshold sweep this module says everyone skips, made trivial to run.
 * The default of 0.5 is visibly not the peak, which is the whole point. */

const N = 900          // pixels in the toy image
const POS = 60         // true foreground pixels — deliberately a small fraction

// Stylised score distributions: foreground scores high, background low, overlapping.
function counts(th) {
  const fgAbove = POS * (1 - cdf(th, 0.72, 0.16))
  const bgAbove = (N - POS) * (1 - cdf(th, 0.18, 0.15))
  return { tp: fgAbove, fp: bgAbove, fn: POS - fgAbove }
}
function cdf(x, mu, sd) {
  const z = (x - mu) / (sd * Math.SQRT2)
  return 0.5 * (1 + erf(z))
}
function erf(x) {
  const s = Math.sign(x); x = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * x)
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t * t * Math.exp(-x * x)
  return s * (1 - (1 - y))
}

const dice = th => {
  const { tp, fp, fn } = counts(th)
  return (2 * tp) / (2 * tp + fp + fn)
}
const pixelAcc = th => {
  const { tp, fp, fn } = counts(th)
  return (N - fp - fn) / N
}

const W = 330, H = 150, PAD = 30

export default function DiceThresholdWidget() {
  const [th, setTh] = useState(0.5)

  const toX = t => PAD + t * (W - 2 * PAD)
  const toY = v => H - PAD - v * (H - 2 * PAD)
  const path = f => 'M' + Array.from({ length: 81 }, (_, i) => {
    const t = 0.02 + (i / 80) * 0.96
    return `${toX(t)},${toY(f(t))}`
  }).join(' L')

  let best = 0.5, bestV = 0
  for (let i = 1; i < 100; i++) {
    const t = i / 100
    if (dice(t) > bestV) { bestV = dice(t); best = t }
  }

  return (
    <Accent value={COLOR}>
      <div>
        <Slider label="threshold" value={th} onChange={setTh} min={0.02} max={0.98} step={0.01}
          fmt={v => v.toFixed(2)} width={190} />

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', marginTop: '0.5rem' }}
          role="img" aria-label="Overlap score and pixel accuracy plotted against the decision threshold. Pixel accuracy is high and flat everywhere; the overlap score peaks away from 0.5.">
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
          <line x1={PAD} y1={PAD - 12} x2={PAD} y2={H - PAD} stroke="var(--border)" />
          <text x={W - PAD} y={H - 9} fontSize={9.5} textAnchor="end" fill="var(--text-muted)">threshold →</text>

          <path d={path(pixelAcc)} fill="none" stroke="var(--text-muted)" strokeWidth={1.6} strokeDasharray="5 4" />
          <path d={path(dice)} fill="none" stroke={COLOR} strokeWidth={2} />

          <line x1={toX(0.5)} y1={PAD - 12} x2={toX(0.5)} y2={H - PAD} stroke="var(--text-muted)" strokeDasharray="2 3" />
          <text x={toX(0.5)} y={PAD - 2} fontSize={9} textAnchor="middle" fill="var(--text-muted)">0.5</text>
          <line x1={toX(best)} y1={PAD - 12} x2={toX(best)} y2={H - PAD} stroke={COLOR} strokeWidth={1.4} />
          <circle cx={toX(th)} cy={toY(dice(th))} r={5} fill={COLOR} />
        </svg>

        <Readout items={[
          ['overlap score here', dice(th).toFixed(3)],
          ['pixel accuracy here', pixelAcc(th).toFixed(3)],
          ['best threshold', best.toFixed(2)],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          The dashed line is pixel accuracy: above 0.93 almost everywhere, because the foreground is only a few
          percent of the image, and therefore useless for choosing anything. The solid line is the overlap
          score, and its peak is not at 0.5. Sweeping this one number costs nothing and typically gains several
          points without touching the model.
        </p>
      </div>
    </Accent>
  )
}
