import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { dot, norm, cosineSim, projection } from './linearAlgebraUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR_A = '#475569', COLOR_B = '#dc2626'

function arrow(vec, color) {
  return { x: vec[0], y: vec[1], ax: 0, ay: 0, xref: 'x', yref: 'y', axref: 'x', ayref: 'y',
    showarrow: true, arrowhead: 3, arrowsize: 1.3, arrowwidth: 2.5, arrowcolor: color }
}

// Two draggable (slider-controlled) vectors — watch dot product, norm, angle,
// cosine similarity, and the projection of a onto b update live.
export default function VectorWidget() {
  const plotRef = useRef(null)
  const [a, setA] = useState([3, 2])
  const [b, setB] = useState([1, 3])

  const render = useCallback((va, vb) => {
    const proj = projection(va, vb)
    const angleRad = Math.acos(Math.min(1, Math.max(-1, cosineSim(va, vb))))
    const angleDeg = (angleRad * 180) / Math.PI

    Plotly.react(plotRef.current, [
      { x: [0, va[0]], y: [0, va[1]], mode: 'markers', type: 'scatter', marker: { size: 1, color: COLOR_A }, showlegend: true, name: 'a' },
      { x: [0, vb[0]], y: [0, vb[1]], mode: 'markers', type: 'scatter', marker: { size: 1, color: COLOR_B }, showlegend: true, name: 'b' },
      { x: [proj.vector[0]], y: [proj.vector[1]], mode: 'markers', type: 'scatter', marker: { size: 8, color: '#16a34a', symbol: 'x' }, showlegend: true, name: 'proj of a on b' },
      { x: [va[0], proj.vector[0]], y: [va[1], proj.vector[1]], mode: 'lines', type: 'scatter', line: { color: '#16a34a', width: 1, dash: 'dot' }, showlegend: false },
    ], plotlyLayout({
      title: { text: `θ = ${angleDeg.toFixed(1)}°`, font: { size: 13 } },
      xaxis: { title: 'x₁', range: [-6, 6], zeroline: true, zerolinewidth: 1 },
      yaxis: { title: 'x₂', range: [-6, 6], zeroline: true, zerolinewidth: 1, scaleanchor: 'x' },
      annotations: [arrow(va, COLOR_A), arrow(vb, COLOR_B)],
      legend: { orientation: 'h', y: -0.2 },
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(a, b) }, []) // eslint-disable-line

  function update(next) {
    const na = next.a ?? a, nb = next.b ?? b
    setA(na); setB(nb); render(na, nb)
  }

  const d = dot(a, b), na = norm(a), nb = norm(b), cs = cosineSim(a, b)

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
        {[['a', a, COLOR_A], ['b', b, COLOR_B]].map(([label, vec, color]) => (
          <div key={label}>
            <strong style={{ color }}>{label} = [{vec[0].toFixed(1)}, {vec[1].toFixed(1)}]</strong>
            {[0, 1].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                {i === 0 ? 'x' : 'y'}
                <input type="range" min="-5" max="5" step="0.5" value={vec[i]}
                  onChange={e => {
                    const nv = [...vec]; nv[i] = +e.target.value
                    update(label === 'a' ? { a: nv } : { b: nv })
                  }} style={{ flex: 1 }} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div ref={plotRef} style={{ minHeight: 340 }} />

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', marginTop: '0.5rem' }}>
        <span>‖a‖ = <strong>{na.toFixed(2)}</strong></span>
        <span>‖b‖ = <strong>{nb.toFixed(2)}</strong></span>
        <span>a·b = <strong>{d.toFixed(2)}</strong></span>
        <span>cos(θ) = <strong>{cs.toFixed(3)}</strong></span>
      </div>
      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.4rem' }}>
        a·b = ‖a‖‖b‖cos(θ) — dot product is zero exactly when vectors are perpendicular (θ = 90°). The green marker is a's shadow on b: its length is a·b / ‖b‖.
      </p>
    </div>
  )
}
