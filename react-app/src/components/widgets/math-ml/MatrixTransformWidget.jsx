import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { matVec, determinant } from './linearAlgebraUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#475569'

// Grid lines + the unit square, transformed by a 2x2 matrix — a matrix IS
// the linear transformation, not a table of numbers. Determinant = signed
// area scale factor (negative = orientation flip).
export default function MatrixTransformWidget() {
  const plotRef = useRef(null)
  const [m, setM] = useState({ a: 1.5, b: 0.5, c: 0, d: 1 })

  const render = useCallback(({ a, b, c, d }) => {
    const M = [[a, b], [c, d]]
    const det = determinant(M)

    // background grid: horizontal + vertical lines, transformed
    const gridTraces = []
    for (let g = -3; g <= 3; g++) {
      const hx = [], hy = [], vx = [], vy = []
      for (let t = -3; t <= 3; t += 0.25) {
        const [hx1, hy1] = matVec(M, [t, g]); hx.push(hx1); hy.push(hy1)
        const [vx1, vy1] = matVec(M, [g, t]); vx.push(vx1); vy.push(vy1)
      }
      gridTraces.push({ x: hx, y: hy, mode: 'lines', type: 'scatter', line: { color: '#cbd5e1', width: 1 }, showlegend: false, hoverinfo: 'skip' })
      gridTraces.push({ x: vx, y: vy, mode: 'lines', type: 'scatter', line: { color: '#cbd5e1', width: 1 }, showlegend: false, hoverinfo: 'skip' })
    }

    // unit square, transformed
    const square = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]].map(p => matVec(M, p))
    const e1 = matVec(M, [1, 0]), e2 = matVec(M, [0, 1])

    Plotly.react(plotRef.current, [
      ...gridTraces,
      { x: square.map(p => p[0]), y: square.map(p => p[1]), mode: 'lines', type: 'scatter', fill: 'toself', fillcolor: 'rgba(71,85,105,0.2)', line: { color: COLOR, width: 2 }, name: 'transformed unit square' },
      { x: [0, e1[0]], y: [0, e1[1]], mode: 'lines+markers', type: 'scatter', line: { color: '#dc2626', width: 3 }, name: 'M·[1,0]' },
      { x: [0, e2[0]], y: [0, e2[1]], mode: 'lines+markers', type: 'scatter', line: { color: '#16a34a', width: 3 }, name: 'M·[0,1]' },
    ], plotlyLayout({
      title: { text: `det(M) = ${det.toFixed(2)} — area scale ${Math.abs(det).toFixed(2)}×${det < 0 ? ' (orientation flipped)' : ''}`, font: { size: 13 } },
      xaxis: { title: 'x₁', range: [-4, 4], zeroline: true },
      yaxis: { title: 'x₂', range: [-4, 4], zeroline: true, scaleanchor: 'x' },
      legend: { orientation: 'h', y: -0.2 },
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(m) }, []) // eslint-disable-line

  function update(next) {
    const merged = { ...m, ...next }
    setM(merged); render(merged)
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem 1.5rem', marginBottom: '0.75rem', maxWidth: 420 }}>
        {['a', 'b', 'c', 'd'].map(key => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            M[{key}]
            <input type="range" min="-2" max="2" step="0.1" value={m[key]} onChange={e => update({ [key]: +e.target.value })} style={{ flex: 1 }} />
            <strong style={{ width: 32 }}>{m[key].toFixed(1)}</strong>
          </label>
        ))}
      </div>
      <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', opacity: 0.8, marginBottom: '0.5rem' }}>
        M = [[{m.a.toFixed(1)}, {m.b.toFixed(1)}], [{m.c.toFixed(1)}, {m.d.toFixed(1)}]]
      </p>
      <div ref={plotRef} style={{ minHeight: 380 }} />
      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem' }}>
        Every column of M is where a basis vector lands. The grid shows M applied to the whole plane at once — straight lines stay straight, the origin stays fixed: that's what "linear" means.
      </p>
    </div>
  )
}
