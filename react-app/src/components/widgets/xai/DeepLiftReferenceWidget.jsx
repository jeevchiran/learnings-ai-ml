import { useState } from 'react'
import { Slider, Toggle, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#ca8a04'
const GRAD = '#b91c1c'

/* Saturation is the whole motivation for a reference-based method, and it is a
 * one-picture argument: the slope is zero out in the flat region while the
 * finite difference from the baseline is not. */

const W = 330, H = 170, PAD = 28

const act = x => 1 / (1 + Math.exp(-x))          // a saturating unit
const grad = x => act(x) * (1 - act(x))

export default function DeepLiftReferenceWidget() {
  const [x, setX] = useState(5)
  const [ref, setRef] = useState(0)
  const [showGrad, setShowGrad] = useState(true)

  const toX = v => PAD + ((v + 8) / 16) * (W - 2 * PAD)
  const toY = v => H - PAD - v * (H - 2 * PAD)

  const curve = () => {
    const pts = []
    for (let i = 0; i <= 160; i++) {
      const v = -8 + (i / 160) * 16
      pts.push(`${toX(v)},${toY(act(v))}`)
    }
    return 'M' + pts.join(' L')
  }

  const diff = act(x) - act(ref)
  const g = grad(x)
  const saturated = g < 0.02

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <Slider label="input" value={x} onChange={setX} min={-8} max={8} step={0.1} fmt={v => v.toFixed(1)} width={130} />
          <Slider label="reference" value={ref} onChange={setRef} min={-8} max={8} step={0.1} fmt={v => v.toFixed(1)} width={130} />
          <Toggle label="show the tangent" on={showGrad} onChange={setShowGrad} />
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}
          role="img" aria-label="A saturating activation curve. Far from the centre the tangent is flat, so a gradient-based attribution reports nothing, while the difference from the reference remains large.">
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
          <path d={curve()} fill="none" stroke={COLOR} strokeWidth={2} />

          <line x1={toX(ref)} y1={toY(act(ref))} x2={toX(x)} y2={toY(act(ref))}
            stroke={COLOR} strokeWidth={1.2} strokeDasharray="3 3" />
          <line x1={toX(x)} y1={toY(act(ref))} x2={toX(x)} y2={toY(act(x))}
            stroke={COLOR} strokeWidth={2.4} />

          {showGrad && (
            <line x1={toX(x - 2)} y1={toY(act(x) - 2 * g)} x2={toX(x + 2)} y2={toY(act(x) + 2 * g)}
              stroke={GRAD} strokeWidth={2} />
          )}

          <circle cx={toX(ref)} cy={toY(act(ref))} r={4} fill="var(--text-muted)" />
          <circle cx={toX(x)} cy={toY(act(x))} r={5} fill={COLOR} />
        </svg>

        <Readout items={[
          ['gradient at input', g.toFixed(4)],
          ['difference from reference', diff.toFixed(3)],
        ]} />

        <p style={{ fontSize: '0.78rem', color: saturated ? COLOR : 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          {saturated
            ? 'The unit is saturated, so the red tangent is flat and the gradient is effectively zero. A gradient-based attribution would report that this input contributed nothing, while the thick vertical line shows it moved the activation almost the full way from the reference. The finite difference is what survives saturation.'
            : 'Here the curve is steep, so the gradient and the finite difference broadly agree. Push the input outwards until the tangent flattens — that is where the two part company and where gradient-based attributions start lying.'}
        </p>
      </div>
    </Accent>
  )
}
