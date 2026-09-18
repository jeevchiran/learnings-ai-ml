import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#a21caf'
const ALT = '#0f766e'

/* The two generator losses plotted against how convincing the generator
 * currently is. The whole argument for the non-saturating form is one picture:
 * the original loss has its flattest gradient exactly where training starts. */

const W = 340, H = 160, PAD = 30

export default function NonSaturatingLossWidget() {
  const [d, setD] = useState(0.1)   // D(G(z)) — discriminator's belief the fake is real

  // Gradient magnitude with respect to D(G(z)).
  const minimaxGrad = q => q / (1 - Math.min(q, 0.999))      // d/dq [-log(1-q)] scaled for display
  const nonSatGrad = q => 1 / Math.max(q, 0.005)

  const CAP = 12
  const path = f => {
    const pts = []
    for (let i = 0; i <= 120; i++) {
      const q = 0.005 + (i / 120) * 0.94
      const y = Math.min(CAP, f(q))
      pts.push(`${PAD + (q * (W - 2 * PAD))},${H - PAD - (y / CAP) * (H - 2 * PAD)}`)
    }
    return 'M' + pts.join(' L')
  }

  const early = d < 0.2

  return (
    <Accent value={COLOR}>
      <div>
        <Slider label="D(G(z)) — how real the discriminator thinks the fakes are"
          value={d} onChange={setD} min={0.01} max={0.95} step={0.01} fmt={v => v.toFixed(2)} width={170} />

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', marginTop: '0.5rem' }}
          role="img" aria-label="The original minimax generator loss has almost no gradient when the discriminator is winning, while the non-saturating loss has its largest gradient exactly there.">
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
          <line x1={PAD} y1={PAD - 10} x2={PAD} y2={H - PAD} stroke="var(--border)" />
          <text x={W - PAD} y={H - 9} fontSize={9.5} textAnchor="end" fill="var(--text-muted)">generator doing better →</text>
          <text x={PAD - 6} y={PAD - 14} fontSize={9.5} fill="var(--text-muted)">gradient size</text>

          <rect x={PAD} y={PAD - 10} width={(0.2 * (W - 2 * PAD))} height={H - PAD - (PAD - 10)}
            fill={COLOR} opacity={0.07} />
          <text x={PAD + 4} y={PAD + 2} fontSize={9} fill="var(--text-muted)">early training</text>

          <path d={path(minimaxGrad)} fill="none" stroke={COLOR} strokeWidth={2} />
          <path d={path(nonSatGrad)} fill="none" stroke={ALT} strokeWidth={2} strokeDasharray="5 4" />

          <line x1={PAD + d * (W - 2 * PAD)} y1={PAD - 10} x2={PAD + d * (W - 2 * PAD)} y2={H - PAD}
            stroke="var(--text-muted)" strokeDasharray="3 3" />
        </svg>

        <Readout items={[
          ['minimax gradient', Math.min(CAP, minimaxGrad(d)).toFixed(2)],
          ['non-saturating', Math.min(CAP, nonSatGrad(d)).toFixed(2)],
        ]} />

        <p style={{ fontSize: '0.78rem', color: early ? COLOR : 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          {early
            ? 'This is where every run starts: the discriminator spots the fakes easily. The original loss (solid) is nearly flat here, so the generator receives almost no signal and never gets going. The non-saturating form (dashed) is at its steepest in exactly this region.'
            : 'Once the generator is convincing, both losses give usable gradients. The problem was never the end of training — it was the beginning, at the left edge of this chart.'}
        </p>
      </div>
    </Accent>
  )
}
