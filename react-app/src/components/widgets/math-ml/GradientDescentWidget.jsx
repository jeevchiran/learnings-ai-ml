import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { quadraticForm, quadraticHessian, gradientDescentPath } from './calculusUtils.js'
import { eigen2x2 } from './linearAlgebraUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#475569'
const SHAPES = {
  'Convex bowl': { a: 1, b: 0, c: 1, lrDefault: 0.15, lrMax: 1.05 },
  'Elongated valley': { a: 1, b: 0, c: 8, lrDefault: 0.08, lrMax: 0.24 },
  'Saddle point': { a: 1, b: 0, c: -1, lrDefault: 0.1, lrMax: 0.5 },
}

// Gradient descent on f(x,y)=ax²+bxy+cy² — the Hessian [[2a,b],[b,2c]] is
// constant everywhere, so its eigenvalues alone tell the whole shape story:
// both positive = bowl (descent converges), mixed signs = saddle (descent
// escapes along the negative-curvature direction), very different magnitudes
// = valley (descent zig-zags unless the learning rate is tiny).
export default function GradientDescentWidget({ defaultShape = 'Convex bowl' }) {
  const plotRef = useRef(null)
  const [shape, setShape] = useState(defaultShape)
  const [lr, setLr] = useState(SHAPES[defaultShape].lrDefault)
  const [start, setStart] = useState([4, 3])

  const render = useCallback((shapeKey, lrVal, startVal) => {
    const { a, b, c } = SHAPES[shapeKey]
    const f = quadraticForm(a, b, c)
    const H = quadraticHessian(a, b, c)
    const eig = eigen2x2(H)
    const path = gradientDescentPath(f, startVal, lrVal, 40)

    const range = 5
    const xs = Array.from({ length: 60 }, (_, i) => -range + (i / 59) * 2 * range)
    const ys = xs
    const zs = ys.map(y => xs.map(x => f(x, y)))

    Plotly.react(plotRef.current, [
      { x: xs, y: ys, z: zs, type: 'contour', colorscale: 'Greys', showscale: false, contours: { coloring: 'lines' }, line: { width: 1 } },
      { x: path.map(p => p.x), y: path.map(p => p.y), mode: 'lines+markers', type: 'scatter', line: { color: '#dc2626', width: 2 }, marker: { size: 5 }, name: 'descent path' },
      { x: [path[0].x], y: [path[0].y], mode: 'markers', type: 'scatter', marker: { color: '#16a34a', size: 12, symbol: 'star' }, name: 'start' },
    ], plotlyLayout({
      title: { text: `Hessian eigenvalues: [${eig.eigenvalues.map(v => v.toFixed(1)).join(', ')}] — f after ${path.length - 1} steps = ${path[path.length - 1].f.toFixed(3)}`, font: { size: 12 } },
      xaxis: { title: 'x', range: [-range, range] }, yaxis: { title: 'y', range: [-range, range], scaleanchor: 'x' },
      legend: { orientation: 'h', y: -0.2 },
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(shape, lr, start) }, []) // eslint-disable-line

  function switchShape(key) {
    const lrD = SHAPES[key].lrDefault
    setShape(key); setLr(lrD); render(key, lrD, start)
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {Object.keys(SHAPES).map(k => (
          <button key={k} onClick={() => switchShape(k)}
            style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid var(--border, #ccc)',
              background: shape === k ? COLOR : 'transparent', color: shape === k ? '#fff' : 'var(--text)',
              cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
            {k}
          </button>
        ))}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        Learning rate
        <input type="range" min="0.01" max={SHAPES[shape].lrMax} step="0.01" value={lr}
          onChange={e => { const v = +e.target.value; setLr(v); render(shape, v, start) }} style={{ flex: 1, maxWidth: 260 }} />
        <strong>{lr.toFixed(2)}</strong>
      </label>

      <div ref={plotRef} style={{ minHeight: 380 }} />

      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem' }}>
        {shape === 'Convex bowl' && 'Both Hessian eigenvalues positive → every direction curves up → gradient descent converges. Push the learning rate near/above the max and watch it overshoot and diverge.'}
        {shape === 'Elongated valley' && "Eigenvalues very different in size (steep vs. shallow direction) → descent zig-zags across the steep axis instead of running down the shallow one. This is exactly why optimizers like Adam rescale per-direction step sizes."}
        {shape === 'Saddle point' && 'One positive, one negative eigenvalue → a saddle: curves up in one direction, down in the other. Plain gradient descent can stall near it, but a small nudge sends it sliding away along the negative-curvature direction.'}
      </p>
    </div>
  )
}
