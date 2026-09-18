import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#b45309'

/* Attention's cost is one score per (source, target) pair. Drawing the grid
 * makes the quadratic growth visible in a way the formula does not. */

export default function AlignmentCostWidget() {
  const [src, setSrc] = useState(8)
  const [tgt, setTgt] = useState(6)
  const cell = Math.max(6, Math.min(20, Math.floor(300 / Math.max(src, tgt))))

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
          <Slider label="source length" value={src} onChange={setSrc} min={2} max={40} width={140} />
          <Slider label="target length" value={tgt} onChange={setTgt} min={2} max={40} width={140} />
        </div>

        <svg width={src * cell + 2} height={tgt * cell + 2} style={{ maxWidth: '100%' }}
          role="img" aria-label={"A grid with one cell per source-target pair: " + src + " by " + tgt + " equals " + (src * tgt) + " attention scores."}>
          {Array.from({ length: tgt }, (_, r) =>
            Array.from({ length: src }, (_, c) => (
              <rect key={r + '-' + c} x={c * cell + 1} y={r * cell + 1}
                width={cell - 1} height={cell - 1}
                fill={COLOR} opacity={0.18 + 0.5 * ((r + c) % 2)} stroke="var(--border)" strokeWidth={0.4} />
            ))
          )}
        </svg>

        <Readout items={[
          ['scores computed', (src * tgt).toLocaleString()],
          ['vs. no attention', (src + tgt).toLocaleString()],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Every cell is one score the model must compute and store. Doubling both lengths quadruples the grid,
          while the sequential work of the recurrent network itself only doubles. That is the cost attention
          adds in exchange for removing the bottleneck.
        </p>
      </div>
    </Accent>
  )
}
