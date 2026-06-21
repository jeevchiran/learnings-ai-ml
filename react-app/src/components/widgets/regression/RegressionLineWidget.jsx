import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { generateRegressionData, simpleOLS, predict, mse, rSquared, randn } from '../utils.js'

const CFG = { responsive: true, displayModeBar: false }

export default function RegressionLineWidget() {
  const plotRef = useRef(null)
  const dataRef = useRef(generateRegressionData(30, 3, 2, 3))
  const [slope, setSlope] = useState(2)
  const [intercept, setIntercept] = useState(2)
  const [stats, setStats] = useState({ mse: 0, r2: 0 })

  const draw = useCallback((s, b) => {
    const d = dataRef.current
    const yPred = d.x.map(xi => s * xi + b)
    setStats({ mse: mse(d.y, yPred).toFixed(2), r2: rSquared(d.y, yPred).toFixed(4) })
    const shapes = d.x.map((xi, i) => ({
      type: 'line', x0: xi, y0: d.y[i], x1: xi, y1: yPred[i],
      line: { color: 'rgba(229,62,62,0.4)', width: 1, dash: 'dot' },
    }))
    Plotly.react(plotRef.current, [
      { x: d.x, y: d.y, mode: 'markers', type: 'scatter', name: 'Data',
        marker: { color: '#3182ce', size: 8 } },
      { x: [0, 10], y: [b, s * 10 + b], mode: 'lines', name: 'Fitted Line',
        line: { color: '#e53e3e', width: 2 } },
    ], {
      shapes,
      xaxis: { title: 'x', range: [-0.5, 10.5] },
      yaxis: { title: 'y' },
      margin: { t: 20, r: 20, b: 50, l: 55 },
      paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
      showlegend: true, legend: { bgcolor: 'rgba(0,0,0,0)' },
    }, CFG)
  }, [])

  useEffect(() => { draw(slope, intercept) }, []) // eslint-disable-line

  function fitOLS() {
    const ols = simpleOLS(dataRef.current.x, dataRef.current.y)
    const steps = 30
    let step = 0
    let s = slope, b = intercept
    const iv = setInterval(() => {
      step++
      const t = step / steps
      s = slope + (ols.slope - slope) * t
      b = intercept + (ols.intercept - intercept) * t
      if (step >= steps) { s = ols.slope; b = ols.intercept; clearInterval(iv) }
      setSlope(+s.toFixed(3)); setIntercept(+b.toFixed(3))
      draw(s, b)
    }, 30)
  }

  function regen() {
    dataRef.current = generateRegressionData(30, 2 + Math.random() * 3, Math.random() * 5, 2 + Math.random() * 3)
    draw(slope, intercept)
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Slope:
          <input type="range" min="-5" max="10" step="0.1" value={slope}
            onChange={e => { const v = +e.target.value; setSlope(v); draw(v, intercept) }} />
          <strong>{slope.toFixed(1)}</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Intercept:
          <input type="range" min="-10" max="20" step="0.1" value={intercept}
            onChange={e => { const v = +e.target.value; setIntercept(v); draw(slope, v) }} />
          <strong>{intercept.toFixed(1)}</strong>
        </label>
        <button onClick={fitOLS} style={btnStyle('#3182ce')}>Fit OLS</button>
        <button onClick={regen} style={btnStyle('#718096')}>Regenerate</button>
      </div>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
        <span>MSE: <strong>{stats.mse}</strong></span>
        <span>R²: <strong>{stats.r2}</strong></span>
      </div>
      <div ref={plotRef} style={{ minHeight: 350 }} />
    </div>
  )
}

const btnStyle = color => ({
  background: color, color: '#fff', border: 'none', borderRadius: 4,
  padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem',
})
