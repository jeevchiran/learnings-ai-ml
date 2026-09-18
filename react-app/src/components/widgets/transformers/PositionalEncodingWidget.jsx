import { useState } from 'react'
import { Slider, Accent } from '../shared/ui.jsx'

const POS = 24

/* The canonical heatmap. Reading across one row is the vector added to that
 * position; reading down one column shows a single frequency. The fingerprint
 * argument only lands once both readings are available at the same time. */

function pe(pos, i, d) {
  const angle = pos / Math.pow(10000, (2 * Math.floor(i / 2)) / d)
  return i % 2 === 0 ? Math.sin(angle) : Math.cos(angle)
}

// -1 blue, 0 neutral, +1 orange — sign stays readable in both themes.
function colour(v) {
  const t = (v + 1) / 2
  const r = Math.round(37 + (234 - 37) * t)
  const g = Math.round(99 + (138 - 99) * t)
  const b = Math.round(235 + (0 - 235) * t)
  return `rgb(${r},${g},${b})`
}

export default function PositionalEncodingWidget() {
  const [d, setD] = useState(16)
  const [hover, setHover] = useState(null)
  const cell = Math.max(10, Math.min(18, Math.floor(400 / d)))

  return (
    <Accent value="#1e3a8a">
      <div>
        <Slider label="embedding size d" value={d} onChange={v => setD(v % 2 ? v + 1 : v)}
          min={4} max={32} step={2} width={170} />

        <div style={{ overflowX: 'auto', marginTop: '0.6rem' }}>
          <svg width={d * cell + 44} height={POS * cell + 26}
            role="img" aria-label="A heatmap of sinusoidal positional encoding. Rows are positions and columns are embedding dimensions. Left-hand columns oscillate quickly and right-hand columns barely change, so every row is a distinct combination.">
            <text x={44 + (d * cell) / 2} y={12} fontSize={9.5} textAnchor="middle" fill="var(--text-muted)">
              dimension i → (fast oscillation … slow)
            </text>
            {Array.from({ length: POS }, (_, p) => (
              <g key={p}>
                <text x={38} y={22 + p * cell + cell * 0.75} fontSize={8.5} textAnchor="end" fill="var(--text-muted)">{p}</text>
                {Array.from({ length: d }, (_, i) => {
                  const v = pe(p, i, d)
                  return (
                    <rect key={i} x={44 + i * cell} y={22 + p * cell} width={cell - 1} height={cell - 1}
                      fill={colour(v)}
                      onMouseEnter={() => setHover({ p, i, v })} onMouseLeave={() => setHover(null)} />
                  )
                })}
              </g>
            ))}
          </svg>
        </div>

        <p style={{ fontSize: '0.78rem', fontFamily: 'monospace', minHeight: '1.4em', margin: '0.4rem 0' }}>
          {hover
            ? `PE(pos=${hover.p}, i=${hover.i}) = ${hover.i % 2 ? 'cos' : 'sin'}(…) = ${hover.v.toFixed(3)}`
            : 'hover a cell'}
        </p>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '62ch' }}>
          Read across one row: that is the vector added to the token at that position. No two rows are alike,
          even though every individual column repeats — the left columns cycle every few positions while the
          right ones barely move across all 24. Together they form a fingerprint, the way the hands of a clock
          identify a time that neither hand could give on its own.
        </p>
      </div>
    </Accent>
  )
}
