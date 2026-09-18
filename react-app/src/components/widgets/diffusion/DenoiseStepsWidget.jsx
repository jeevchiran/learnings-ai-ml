import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#7c2d12'

/* One big jump versus many small ones. The comparison is the whole reason
 * diffusion exists: each individual step is easy enough to learn with a plain
 * regression loss, which is what buys the training stability. */

const SIZE = 10

function seeded(n) {
  let s = n * 9301 + 49297
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
}

function field(noise, seed) {
  const rnd = seeded(seed)
  const g = []
  for (let r = 0; r < SIZE; r++) {
    g.push([])
    for (let c = 0; c < SIZE; c++) {
      const signal = Math.exp(-(((r - 4.5) ** 2 + (c - 4.5) ** 2) / 14))
      g[r].push(Math.max(0, Math.min(1, signal * (1 - noise) + rnd() * noise)))
    }
  }
  return g
}

function Grid({ data, label, cell = 13 }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={SIZE * cell} height={SIZE * cell} role="img" aria-label={label}>
        {data.map((row, r) => row.map((v, c) => (
          <rect key={r + '-' + c} x={c * cell} y={r * cell} width={cell} height={cell}
            fill={COLOR} opacity={v} />
        )))}
      </svg>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

export default function DenoiseStepsWidget() {
  const [steps, setSteps] = useState(5)
  const shown = Math.min(steps, 6)
  const grids = Array.from({ length: shown + 1 }, (_, i) => field(1 - i / shown, 7))
  const perStep = 1 / steps

  return (
    <Accent value={COLOR}>
      <div>
        <Slider label="number of denoising steps" value={steps} onChange={setSteps} min={1} max={30} width={180} />

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.7rem', alignItems: 'flex-start' }}>
          {grids.map((g, i) => (
            <Grid key={i} data={g} label={i === 0 ? 'pure noise' : i === shown ? 'image' : `step ${i}`} />
          ))}
        </div>

        <Readout items={[
          ['steps', String(steps)],
          ['noise removed per step', `${(perStep * 100).toFixed(0)}%`],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          {steps === 1
            ? 'With a single step the network has to go from pure noise to a finished image in one jump. That is exactly the hard problem a generator faces, and it is why a plain regression loss cannot do it alone.'
            : 'Each step now removes a small fraction of the noise, which is an easy prediction problem that ordinary supervised training handles. Many easy steps replace one impossible one — at the cost of running the network once per step.'}
        </p>
      </div>
    </Accent>
  )
}
