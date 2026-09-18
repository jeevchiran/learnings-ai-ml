import { useState } from 'react'
import { Slider, Accent } from '../shared/ui.jsx'

const COLOR = '#a21caf'

/* Why pixel-wise reconstruction loss produces blur, shown rather than asserted.
 * Two plausible answers averaged together give something that is neither, and
 * the average is what minimises squared error. */

const SIZE = 8
// Two stylised "digits" on an 8x8 grid: a vertical stroke and a diagonal one.
const A = []
const B = []
for (let r = 0; r < SIZE; r++) {
  A.push([]); B.push([])
  for (let c = 0; c < SIZE; c++) {
    A[r].push(c === 3 || c === 4 ? 1 : 0)
    B[r].push(c === r ? 1 : 0)
  }
}

function Grid({ data, label }) {
  const cell = 16
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={SIZE * cell} height={SIZE * cell} role="img" aria-label={label}>
        {data.map((row, r) => row.map((v, c) => (
          <rect key={r + '-' + c} x={c * cell} y={r * cell} width={cell} height={cell}
            fill={COLOR} opacity={v} stroke="var(--border)" strokeWidth={0.3} />
        )))}
      </svg>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
    </div>
  )
}

export default function BlurAverageWidget() {
  const [w, setW] = useState(0.5)
  const mix = A.map((row, r) => row.map((v, c) => v * (1 - w) + B[r][c] * w))

  return (
    <Accent value={COLOR}>
      <div>
        <Slider label="mix between the two valid answers" value={w} onChange={setW}
          min={0} max={1} step={0.05} fmt={v => v.toFixed(2)} width={180} />

        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', marginTop: '0.7rem', alignItems: 'flex-start' }}>
          <Grid data={A} label="one valid answer" />
          <Grid data={B} label="another valid answer" />
          <Grid data={mix} label="what squared error prefers" />
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem', lineHeight: 1.6 }}>
          Set the mix to 0.5. The third grid is not a third valid answer; it is a ghost of both. Squared error
          rewards it anyway, because the average of several plausible outputs always has a lower expected
          pixel-wise error than committing to any one of them. That is where the blur in reconstruction-based
          generators comes from, and an adversarial loss avoids it by asking a different question entirely:
          not how close is this to the target, but would anyone believe it.
        </p>
      </div>
    </Accent>
  )
}
