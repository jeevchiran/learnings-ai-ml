/* Shared presentational bits for the Computer Vision widgets.
 * Sixteen widgets all need the same pixel grid, the same select and the same
 * slider — defining them once keeps every module visually identical. */

import { TRACK } from './cvUtils.js'

export const box = {
  border: '1px solid var(--border, #d4d4d8)', borderRadius: 4,
  background: 'var(--bg, transparent)', color: 'var(--text, inherit)',
  padding: '0.2rem 0.35rem', fontSize: '0.82rem',
}

export function Row({ children, gap = '0.9rem', style }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap, ...style }}>
      {children}
    </div>
  )
}

export function Select({ label, value, onChange, options }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
      {label}
      <select value={value} onChange={e => onChange(e.target.value)} style={box}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}

export function Slider({ label, value, onChange, min, max, step = 1, fmt = v => v, width = 120 }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
      {label}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)} style={{ width }} />
      <strong style={{ fontFamily: 'monospace', minWidth: 40 }}>{fmt(value)}</strong>
    </label>
  )
}

export function Toggle({ label, on, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', cursor: 'pointer' }}>
      <input type="checkbox" checked={on} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

export function Btn({ children, onClick, disabled, primary }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        padding: '0.28rem 0.7rem', fontSize: '0.82rem', borderRadius: 4, cursor: disabled ? 'default' : 'pointer',
        border: primary ? 'none' : '1px solid var(--border, #d4d4d8)',
        background: primary ? TRACK : 'var(--bg, transparent)',
        color: primary ? '#fff' : 'var(--text, inherit)', opacity: disabled ? 0.45 : 1,
      }}>
      {children}
    </button>
  )
}

export function Caption({ children }) {
  return <p style={{ fontSize: '0.78rem', opacity: 0.72, lineHeight: 1.6, marginTop: '0.55rem' }}>{children}</p>
}

export function grey(v) { const c = Math.max(0, Math.min(255, Math.round(v))); return `rgb(${c},${c},${c})` }

/** Pointer position in the coordinate system of the <svg> the handler is on. */
export function svgPoint(e) {
  const r = e.currentTarget.getBoundingClientRect()
  return [e.clientX - r.left, e.clientY - r.top]
}

/**
 * The pixel grid every image widget draws. `img` is a 2-D array of 0–255.
 * `tint(r,c)` may return an overlay colour; `onHover` gets [row, col] or null.
 */
export function PixelGrid({ img, cell = 20, showValues = false, title, tint, onHover, marked }) {
  const H = img.length, W = img[0].length
  return (
    <div>
      {title && <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.7, marginBottom: 3 }}>{title}</div>}
      <svg width={W * cell} height={H * cell} style={{ display: 'block', shapeRendering: 'crispEdges' }}
        onMouseLeave={() => onHover?.(null)}>
        {img.map((row, r) => row.map((v, c) => {
          const t = tint?.(r, c)
          const hot = marked && marked[0] === r && marked[1] === c
          return (
            <g key={`${r}-${c}`} onMouseEnter={() => onHover?.([r, c])}>
              <rect x={c * cell} y={r * cell} width={cell} height={cell} fill={grey(v)} />
              {t && <rect x={c * cell} y={r * cell} width={cell} height={cell} fill={t} />}
              <rect x={c * cell} y={r * cell} width={cell} height={cell} fill="none"
                stroke={hot ? TRACK : 'rgba(128,128,128,0.22)'} strokeWidth={hot ? 2.5 : 0.5} />
              {showValues && cell >= 18 && (
                <text x={c * cell + cell / 2} y={r * cell + cell / 2 + 3} textAnchor="middle"
                  fontSize={cell * 0.34} fontFamily="monospace" fill={v > 127 ? '#111' : '#e5e5e5'}>
                  {Math.round(v)}
                </text>
              )}
            </g>
          )
        }))}
      </svg>
    </div>
  )
}

/** A read-only 3×3 (or k×k) kernel display with signed colouring. */
export function KernelGrid({ k, cell = 34, highlight }) {
  const peak = Math.max(...k.flat().map(Math.abs)) || 1
  return (
    <svg width={k[0].length * cell} height={k.length * cell} style={{ display: 'block' }}>
      {k.map((row, r) => row.map((v, c) => (
        <g key={`${r}-${c}`}>
          <rect x={c * cell} y={r * cell} width={cell} height={cell}
            fill={v === 0 ? 'rgba(128,128,128,0.10)'
              : v > 0 ? `rgba(21,128,61,${0.15 + 0.6 * Math.abs(v) / peak})`
                      : `rgba(220,38,38,${0.15 + 0.6 * Math.abs(v) / peak})`}
            stroke={highlight ? TRACK : 'var(--border, #d4d4d8)'} strokeWidth={1} />
          <text x={c * cell + cell / 2} y={r * cell + cell / 2 + 4} textAnchor="middle"
            fontSize={11} fontFamily="monospace" fill="var(--text, #222)" fontWeight="600">
            {Math.abs(v) < 0.001 ? '0' : (Number.isInteger(v) ? v : v.toFixed(2))}
          </text>
        </g>
      )))}
    </svg>
  )
}

/** Key/value readout strip used under most widgets. */
export function Readout({ items }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.2rem', marginTop: '0.6rem',
      padding: '0.5rem 0.7rem', borderRadius: 5, background: 'var(--bg-hover, rgba(128,128,128,0.08))',
      fontSize: '0.78rem', fontFamily: 'monospace',
    }}>
      {items.map(([k, v]) => (
        <span key={k}>
          <span style={{ opacity: 0.65 }}>{k} = </span>
          <strong style={{ color: TRACK }}>{v}</strong>
        </span>
      ))}
    </div>
  )
}
