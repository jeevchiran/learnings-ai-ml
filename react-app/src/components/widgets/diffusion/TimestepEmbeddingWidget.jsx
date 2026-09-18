import { useState } from 'react'
import { Slider, Accent } from '../shared/ui.jsx'

const COLOR = '#7c2d12'
const DIM = 16

/* One network handles every noise level, so it has to be told which level it is
 * looking at. The heatmap makes the fingerprint idea concrete: each timestep
 * gets a distinctive row, and nearby timesteps get similar ones. */

function embed(t, i) {
  const angle = t / Math.pow(10000, (2 * Math.floor(i / 2)) / DIM)
  return i % 2 === 0 ? Math.sin(angle) : Math.cos(angle)
}

function colour(v) {
  const s = (v + 1) / 2
  const r = Math.round(37 + (124 - 37) * s)
  const g = Math.round(99 + (45 - 99) * s)
  const b = Math.round(235 + (18 - 235) * s)
  return `rgb(${r},${g},${b})`
}

export default function TimestepEmbeddingWidget() {
  const [t, setT] = useState(40)
  const rows = 24
  const cell = 15

  return (
    <Accent value={COLOR}>
      <div>
        <Slider label="timestep t" value={t} onChange={setT} min={0} max={rows - 1} width={180} />

        <div style={{ overflowX: 'auto', marginTop: '0.6rem' }}>
          <svg width={DIM * cell + 36} height={rows * cell + 18}
            role="img" aria-label="A heatmap where each row is one timestep's embedding vector. Rows are distinct from one another and nearby rows are similar.">
            <text x={36 + (DIM * cell) / 2} y={11} fontSize={9.5} textAnchor="middle" fill="var(--text-muted)">
              embedding dimension →
            </text>
            {Array.from({ length: rows }, (_, r) => (
              <g key={r}>
                <text x={31} y={18 + r * cell + cell * 0.75} fontSize={8.5} textAnchor="end"
                  fill={r === t ? COLOR : 'var(--text-muted)'} fontWeight={r === t ? 700 : 400}>{r}</text>
                {Array.from({ length: DIM }, (_, i) => (
                  <rect key={i} x={36 + i * cell} y={18 + r * cell} width={cell - 1} height={cell - 1}
                    fill={colour(embed(r, i))} opacity={r === t ? 1 : 0.35} />
                ))}
              </g>
            ))}
          </svg>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          One network denoises at every noise level, so it has to know which level it is being asked about.
          The highlighted row is the vector added into the network for that timestep. No two rows are the same,
          which is what lets the network tell the levels apart, and neighbouring rows are similar, which is what
          lets it generalise between them rather than memorising each one separately.
        </p>
      </div>
    </Accent>
  )
}
