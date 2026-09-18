import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const A = '#4338ca'
const B = '#b45309'

/* Gaussian naive Bayes swaps a count table for a bell curve per class. Sliding
 * an observation across the two curves shows that the decision boundary is where
 * they cross, weighted by the priors — not where the means are equidistant. */

const W = 340, H = 150, PAD = 26

function pdf(x, mu, sd) {
  return Math.exp(-((x - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI))
}

export default function GaussianNBWidget() {
  const [x, setX] = useState(5)
  const [prior, setPrior] = useState(0.5)

  const muA = 4, sdA = 1.2
  const muB = 7, sdB = 1.6

  const la = pdf(x, muA, sdA) * prior
  const lb = pdf(x, muB, sdB) * (1 - prior)
  const pa = la / (la + lb)

  const toX = v => PAD + (v / 12) * (W - 2 * PAD)
  const peak = Math.max(pdf(muA, muA, sdA) * prior, pdf(muB, muB, sdB) * (1 - prior))
  const toY = v => H - PAD - (v / peak) * (H - 2 * PAD)

  const curve = (mu, sd, weight) => {
    const pts = []
    for (let i = 0; i <= 120; i++) {
      const v = (i / 120) * 12
      pts.push(`${toX(v)},${toY(pdf(v, mu, sd) * weight)}`)
    }
    return 'M' + pts.join(' L')
  }

  return (
    <Accent value={A}>
      <div>
        <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <Slider label="observed value" value={x} onChange={setX} min={0} max={12} step={0.1}
            fmt={v => v.toFixed(1)} width={150} />
          <Slider label="prior for class A" value={prior} onChange={setPrior} min={0.05} max={0.95} step={0.05}
            fmt={v => v.toFixed(2)} width={130} />
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}
          role="img" aria-label="Two bell curves, one per class, each scaled by its prior. A vertical line marks the observed value; the taller curve at that point is the predicted class.">
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
          <path d={curve(muA, sdA, prior)} fill="none" stroke={A} strokeWidth={2} />
          <path d={curve(muB, sdB, 1 - prior)} fill="none" stroke={B} strokeWidth={2} strokeDasharray="5 4" />
          <line x1={toX(x)} y1={PAD - 10} x2={toX(x)} y2={H - PAD} stroke="var(--text-muted)" strokeDasharray="3 3" />
          <circle cx={toX(x)} cy={toY(la)} r={4} fill={A} />
          <circle cx={toX(x)} cy={toY(lb)} r={4} fill={B} />
          <text x={toX(muA)} y={PAD - 12} fontSize={10} textAnchor="middle" fill={A}>class A</text>
          <text x={toX(muB)} y={PAD - 12} fontSize={10} textAnchor="middle" fill={B}>class B</text>
        </svg>

        <Readout items={[
          ['P(A | x)', pa.toFixed(3)],
          ['prediction', pa > 0.5 ? 'A' : 'B'],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Instead of counting how often a value occurred, this variant fits one bell curve per class and reads
          the height off it. Shift the prior and watch the crossing point move: the boundary is not halfway
          between the means, it is wherever the two scaled curves meet.
        </p>
      </div>
    </Accent>
  )
}
