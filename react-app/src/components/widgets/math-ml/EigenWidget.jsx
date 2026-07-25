import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { matVec, determinant, inverse, rank, eigen2x2 } from './linearAlgebraUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#475569'
const PRESETS = {
  'Stretch (real eigen)': { a: 2, b: 0.3, c: 0.3, d: 1 },
  'Symmetric (orthogonal eigen)': { a: 3, b: 1, c: 1, d: 1 },
  'Pure rotation (complex)': { a: 0, b: -1, c: 1, d: 0 },
  'Singular (rank 1)': { a: 2, b: 1, c: 4, d: 2 },
}

// An eigenvector is a direction M doesn't rotate — only stretches by its
// eigenvalue. Sweep any vector through the transform and watch only those
// special directions stay put on their own line.
export default function EigenWidget() {
  const plotRef = useRef(null)
  const [m, setM] = useState(PRESETS['Stretch (real eigen)'])

  const render = useCallback(({ a, b, c, d }) => {
    const M = [[a, b], [c, d]]
    const det = determinant(M)
    const inv = inverse(M)
    const rk = rank(M)
    const eig = eigen2x2(M)

    const traces = []
    // sweep of directions, transformed
    for (let ang = 0; ang < Math.PI; ang += Math.PI / 16) {
      const v = [Math.cos(ang), Math.sin(ang)]
      const mv = matVec(M, v)
      traces.push({ x: [-mv[0], mv[0]], y: [-mv[1], mv[1]], mode: 'lines', type: 'scatter', line: { color: '#cbd5e1', width: 1 }, showlegend: false, hoverinfo: 'skip' })
    }

    if (eig.real) {
      eig.eigenvectors.forEach((v, i) => {
        const lam = eig.eigenvalues[i]
        const color = i === 0 ? '#dc2626' : '#16a34a'
        traces.push({ x: [-v[0] * 3, v[0] * 3], y: [-v[1] * 3, v[1] * 3], mode: 'lines', type: 'scatter', line: { color, width: 2, dash: 'dot' }, name: `eigenvector direction (λ=${lam.toFixed(2)})` })
        traces.push({ x: [0, v[0] * lam], y: [0, v[1] * lam], mode: 'lines+markers', type: 'scatter', line: { color, width: 3 }, marker: { size: 6 }, name: `M·v = λv (λ=${lam.toFixed(2)})` })
      })
    }

    Plotly.react(plotRef.current, traces, plotlyLayout({
      title: { text: eig.real ? 'Grey = generic directions moved off their line; colored = eigenvectors, unmoved in direction' : 'Complex eigenvalues — a pure rotation has no real eigenvector', font: { size: 12 } },
      xaxis: { title: 'x₁', range: [-4, 4], zeroline: true },
      yaxis: { title: 'x₂', range: [-4, 4], zeroline: true, scaleanchor: 'x' },
      legend: { orientation: 'h', y: -0.25 },
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(m) }, []) // eslint-disable-line

  function update(next) { const merged = { ...m, ...next }; setM(merged); render(merged) }

  const M = [[m.a, m.b], [m.c, m.d]]
  const det = determinant(M), inv = inverse(M), rk = rank(M), eig = eigen2x2(M)

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {Object.entries(PRESETS).map(([label, preset]) => (
          <button key={label} onClick={() => update(preset)}
            style={{ padding: '0.3rem 0.6rem', borderRadius: 6, border: '1px solid var(--border, #ccc)',
              background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem 1.5rem', marginBottom: '0.75rem', maxWidth: 420 }}>
        {['a', 'b', 'c', 'd'].map(key => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            M[{key}]
            <input type="range" min="-3" max="3" step="0.1" value={m[key]} onChange={e => update({ [key]: +e.target.value })} style={{ flex: 1 }} />
            <strong style={{ width: 32 }}>{m[key].toFixed(1)}</strong>
          </label>
        ))}
      </div>

      <div ref={plotRef} style={{ minHeight: 340 }} />

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', margin: '0.5rem 0' }}>
        <span>det(M) = <strong>{det.toFixed(2)}</strong></span>
        <span>rank = <strong>{rk}</strong></span>
        <span>M⁻¹ {inv ? 'exists' : <strong style={{ color: '#dc2626' }}>does not exist (singular)</strong>}</span>
      </div>
      <p style={{ fontSize: '0.82rem', opacity: 0.75 }}>
        {eig.real
          ? `Eigenvalues λ = [${eig.eigenvalues.map(v => v.toFixed(2)).join(', ')}]. det(M) = λ₁·λ₂ = ${(eig.eigenvalues[0]*eig.eigenvalues[1]).toFixed(2)} — the product of eigenvalues always equals the determinant.`
          : 'No real eigenvector exists because every direction gets rotated — a defining feature of a rotation matrix.'}
        {' '}A singular matrix (det = 0) always has 0 as an eigenvalue — try the "Singular" preset.
      </p>
    </div>
  )
}
