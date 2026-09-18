import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#0f766e'
const TARGET = '#b45309'

/* Turning a series into supervised rows is the step people get wrong before any
 * model is involved. Sliding the window over a real series and watching the row
 * count fall out makes both the shape and the edge effect concrete. */

const N = 40
const SERIES = Array.from({ length: N }, (_, i) =>
  50 + 18 * Math.sin(i / 3.2) + 0.7 * i + 4 * Math.sin(i / 1.1))

const W = 340, H = 140, PAD = 24

export default function WindowingWidget() {
  const [win, setWin] = useState(6)
  const [hor, setHor] = useState(2)
  const [start, setStart] = useState(8)

  const maxStart = Math.max(0, N - win - hor)
  const s = Math.min(start, maxStart)
  const rows = Math.max(0, N - win - hor + 1)

  const lo = Math.min(...SERIES), hi = Math.max(...SERIES)
  const toX = i => PAD + (i / (N - 1)) * (W - 2 * PAD)
  const toY = v => H - PAD - ((v - lo) / (hi - lo)) * (H - 2 * PAD)
  const path = 'M' + SERIES.map((v, i) => `${toX(i)},${toY(v)}`).join(' L')

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <Slider label="window" value={win} onChange={setWin} min={2} max={14} width={110} />
          <Slider label="horizon" value={hor} onChange={setHor} min={1} max={8} width={100} />
          <Slider label="row" value={s} onChange={setStart} min={0} max={maxStart} width={120} />
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}
          role="img" aria-label={"A time series with a window of " + win + " points highlighted as the input and the following " + hor + " points highlighted as the target."}>
          <rect x={toX(s)} y={PAD - 8} width={toX(s + win - 1) - toX(s)} height={H - PAD - (PAD - 8)}
            fill={COLOR} opacity={0.13} />
          <rect x={toX(s + win - 1)} y={PAD - 8} width={toX(s + win + hor - 1) - toX(s + win - 1)} height={H - PAD - (PAD - 8)}
            fill={TARGET} opacity={0.15} />
          <path d={path} fill="none" stroke="var(--text-muted)" strokeWidth={1.4} />
          {SERIES.map((v, i) => {
            const inWin = i >= s && i < s + win
            const inTgt = i >= s + win && i < s + win + hor
            if (!inWin && !inTgt) return null
            return <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill={inWin ? COLOR : TARGET} />
          })}
          <text x={toX(s)} y={PAD - 12} fontSize={9.5} fill={COLOR}>input</text>
          <text x={toX(s + win)} y={PAD - 12} fontSize={9.5} fill={TARGET}>predict</text>
        </svg>

        <Readout items={[
          ['input shape per row', `${win} values`],
          ['target shape per row', `${hor} values`],
          ['rows from this series', String(rows)],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Slide the row along and watch the pair move together. A series of {N} points does not give {N} training
          rows — it gives {rows}, because every row needs a full window behind it and a full horizon ahead. Widen
          either and the count falls, which is the trade you are making when you ask a model to see further.
        </p>
      </div>
    </Accent>
  )
}
