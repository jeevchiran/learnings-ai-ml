import { useState } from 'react'
import { Toggle, Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#0f766e'
const PAD_C = '#b91c1c'

/* Padding is easy to picture and easy to get silently wrong. Showing the wasted
 * cells, and what sorting the batch does to them, turns two abstract API calls
 * into an obvious efficiency argument. */

const LENGTHS = [3, 11, 5, 9, 2, 7]

export default function PaddingMaskWidget() {
  const [masked, setMasked] = useState(true)
  const [sorted, setSorted] = useState(false)
  const [buckets, setBuckets] = useState(1)

  const lens = sorted ? [...LENGTHS].sort((a, b) => b - a) : LENGTHS
  const groups = []
  const per = Math.ceil(lens.length / buckets)
  for (let i = 0; i < lens.length; i += per) groups.push(lens.slice(i, i + per))

  const real = lens.reduce((a, b) => a + b, 0)
  const cells = groups.reduce((a, g) => a + g.length * Math.max(...g), 0)
  const waste = cells === 0 ? 0 : 1 - real / cells
  const cell = 17

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <Toggle label="apply the mask" on={masked} onChange={setMasked} />
          <Toggle label="sort by length" on={sorted} onChange={setSorted} />
          <Slider label="buckets" value={buckets} onChange={setBuckets} min={1} max={3} width={90} />
        </div>

        <div style={{ overflowX: 'auto' }}>
          {groups.map((g, gi) => {
            const max = Math.max(...g)
            return (
              <div key={gi} style={{ marginBottom: buckets > 1 ? '0.5rem' : 0 }}>
                {buckets > 1 && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                    batch {gi + 1} — padded to {max}
                  </div>
                )}
                {g.map((len, r) => (
                  <div key={r} style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    {Array.from({ length: max }, (_, c) => {
                      const isPad = c >= len
                      return (
                        <div key={c} style={{
                          width: cell, height: cell, borderRadius: 2,
                          background: isPad ? (masked ? 'transparent' : PAD_C) : COLOR,
                          border: isPad ? `1px dashed ${masked ? 'var(--border)' : PAD_C}` : 'none',
                          opacity: isPad && masked ? 0.4 : 0.9,
                        }} />
                      )
                    })}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        <Readout items={[
          ['real timesteps', String(real)],
          ['cells computed', String(cells)],
          ['wasted', `${(waste * 100).toFixed(0)}%`],
        ]} />

        <p style={{ fontSize: '0.78rem', color: masked ? 'var(--text-muted)' : PAD_C, marginTop: '0.5rem', lineHeight: 1.6 }}>
          {masked
            ? 'With the mask applied, the outlined cells contribute nothing to the loss or to the final hidden state. Sorting by length and splitting into buckets puts similar lengths together, which is what actually removes the waste rather than merely ignoring it.'
            : 'Without a mask, every red cell is a padding token the network processes as though it were real. It contributes to the loss and corrupts the final hidden state, so a batch of mixed lengths quietly trains on nonsense.'}
        </p>
      </div>
    </Accent>
  )
}
