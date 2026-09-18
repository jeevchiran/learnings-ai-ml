import { useState } from 'react'
import { Slider, Toggle, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#b45309'
const ALT = '#1e3a8a'

/* Two timelines on the same axis. The recurrent one is a staircase because each
 * step waits for the previous hidden state; the attention one is a single
 * column because nothing waits. This is the limitation the next track removes. */

export default function SequentialVsParallelWidget() {
  const [n, setN] = useState(8)
  const [both, setBoth] = useState(true)
  const w = 320, rowH = 15, unit = Math.max(6, Math.min(26, 260 / n))

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <Slider label="sequence length" value={n} onChange={setN} min={3} max={20} width={150} />
          <Toggle label="show attention-only for comparison" on={both} onChange={setBoth} />
        </div>

        <svg viewBox={`0 0 ${w} ${(both ? 2 : 1) * (n * rowH + 34) + 10}`} style={{ width: '100%', maxWidth: w, height: 'auto' }}
          role="img" aria-label="A recurrent model's steps form a diagonal staircase because each waits for the previous one. An attention model's steps form a single vertical column because they all run at once.">
          <text x={0} y={11} fontSize={11} fill="var(--text-muted)">recurrent: each step waits</text>
          {Array.from({ length: n }, (_, i) => (
            <rect key={i} x={20 + i * unit} y={18 + i * rowH} width={unit - 2} height={rowH - 3}
              rx={2} fill={COLOR} opacity={0.85} />
          ))}
          <text x={20} y={18 + n * rowH + 12} fontSize={10.5} fill={COLOR} fontFamily="monospace">
            {n} time steps end to end
          </text>

          {both && (
            <g transform={`translate(0, ${n * rowH + 44})`}>
              <text x={0} y={11} fontSize={11} fill="var(--text-muted)">attention: all at once</text>
              {Array.from({ length: n }, (_, i) => (
                <rect key={i} x={20 + i * unit} y={18} width={unit - 2} height={rowH - 3}
                  rx={2} fill={ALT} opacity={0.85} />
              ))}
              <text x={20} y={18 + n * rowH + 12 - (n - 1) * rowH} fontSize={10.5} fill={ALT} fontFamily="monospace">
                1 step, however long the sequence
              </text>
            </g>
          )}
        </svg>

        <Readout items={[
          ['recurrent depth', `${n} steps`],
          ['attention depth', '1 step'],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Drag the length up. The recurrent staircase grows one row per token no matter how much hardware you
          add, because step five genuinely cannot begin until step four has produced its hidden state.
          Attention has no such dependency, which is the entire reason the next track exists.
        </p>
      </div>
    </Accent>
  )
}
