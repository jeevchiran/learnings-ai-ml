import { useState } from 'react'
import { Slider, Toggle, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#6366f1'
const ALT = '#b45309'

/* The two reconstruction losses plotted against the same prediction. The point
 * a reader needs is that cross-entropy diverges as the prediction approaches the
 * wrong end, while squared error stays bounded and flat — which is why the
 * choice of likelihood is not cosmetic. */

const W = 340, H = 150, PAD = 26

export default function BceVsMseWidget() {
  const [target, setTarget] = useState(1)
  const [both, setBoth] = useState(true)
  const [p, setP] = useState(0.7)

  const bce = q => -(target * Math.log(Math.max(q, 1e-6)) + (1 - target) * Math.log(Math.max(1 - q, 1e-6)))
  const mse = q => (q - target) ** 2

  const CAP = 5
  const path = f => {
    const pts = []
    for (let i = 0; i <= 100; i++) {
      const q = 0.002 + (i / 100) * 0.996
      const y = Math.min(CAP, f(q))
      pts.push(`${PAD + (q * (W - 2 * PAD))},${H - PAD - (y / CAP) * (H - 2 * PAD)}`)
    }
    return 'M' + pts.join(' L')
  }

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <Slider label="true pixel value" value={target} onChange={setTarget} min={0} max={1} step={1} width={70} />
          <Slider label="predicted value" value={p} onChange={setP} min={0.01} max={0.99} step={0.01}
            fmt={v => v.toFixed(2)} width={140} />
          <Toggle label="show squared error too" on={both} onChange={setBoth} />
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}
          role="img" aria-label="Cross-entropy loss rises without bound as the prediction approaches the wrong value, while squared error stays bounded below one.">
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
          <line x1={PAD} y1={PAD - 8} x2={PAD} y2={H - PAD} stroke="var(--border)" />
          <text x={W - PAD} y={H - 8} fontSize={9.5} textAnchor="end" fill="var(--text-muted)">predicted value →</text>
          <text x={PAD - 4} y={PAD - 12} fontSize={9.5} fill="var(--text-muted)">loss</text>

          <path d={path(bce)} fill="none" stroke={COLOR} strokeWidth={2} />
          {both && <path d={path(mse)} fill="none" stroke={ALT} strokeWidth={2} strokeDasharray="5 4" />}

          <circle cx={PAD + p * (W - 2 * PAD)} cy={H - PAD - (Math.min(CAP, bce(p)) / CAP) * (H - 2 * PAD)}
            r={4} fill={COLOR} />
          {both && (
            <circle cx={PAD + p * (W - 2 * PAD)} cy={H - PAD - (Math.min(CAP, mse(p)) / CAP) * (H - 2 * PAD)}
              r={4} fill={ALT} />
          )}
        </svg>

        <Readout items={[
          ['cross-entropy', bce(p).toFixed(3)],
          ['squared error', mse(p).toFixed(3)],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Slide the prediction towards the wrong end. Cross-entropy climbs without limit, so a confidently wrong
          pixel is punished hard. Squared error tops out at 1 however wrong the prediction is, which is why it
          tolerates confident mistakes that the Bernoulli likelihood treats as nearly impossible.
        </p>
      </div>
    </Accent>
  )
}
