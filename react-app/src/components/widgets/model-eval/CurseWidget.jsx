import { useState } from 'react'

const COLOR = '#c026d3'

// Curse of dimensionality: capturing a fixed fraction of data needs almost the
// whole range of every axis, and almost all volume sits near the boundary.
export default function CurseWidget() {
  const [d, setD] = useState(5)

  const edge = Math.pow(0.1, 1 / d)          // edge length per axis to grab 10% of volume
  const shell = 1 - Math.pow(0.8, d)         // fraction of volume within outer 10% of each side

  const W = 420, H = 90
  const bar = (label, frac, note) => (
    <div style={{ margin: '0.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 3 }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <strong style={{ color: COLOR, fontVariantNumeric: 'tabular-nums' }}>{(frac * 100).toFixed(1)}%</strong>
      </div>
      <div style={{ height: 16, background: 'var(--bg-hover)', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${frac * 100}%`, background: COLOR, borderRadius: 3, transition: 'width 0.25s' }} />
      </div>
      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>{note}</div>
    </div>
  )

  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', margin: '0.2rem 0 0.6rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>Dimensions d</span>
        <input type="range" min={1} max={15} value={d} onChange={e => setD(+e.target.value)} style={{ flex: 1, accentColor: COLOR }} />
        <strong style={{ color: COLOR, width: 28, textAlign: 'right' }}>{d}</strong>
      </label>

      {bar('Edge length per axis to capture 10% of the data', edge,
        `In ${d}D you must span ${(edge * 100).toFixed(0)}% of every single axis just to enclose a tenth of the space. "Local" stops being local.`)}
      {bar('Fraction of volume within the outer shell', shell,
        `${(shell * 100).toFixed(0)}% of all points sit near the boundary — the interior empties out, so every point is a lonely outlier.`)}

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Fixed data, more features → the space explodes and points scatter to the edges. Distances lose meaning and neighbours vanish, which is why fewer, well-chosen features often generalize better. This is the curse feature selection fights.
      </p>
    </div>
  )
}
