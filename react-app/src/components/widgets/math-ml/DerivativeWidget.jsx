import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { derivative } from './calculusUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#475569'
const FUNCS = {
  'x²': { f: x => x * x, range: [-3, 3] },
  'x³ − 3x': { f: x => x ** 3 - 3 * x, range: [-2.5, 2.5] },
  'sin(x)': { f: x => Math.sin(x), range: [-6.5, 6.5] },
}

// Slide x0 along the curve and watch the tangent line pivot — the derivative
// is that tangent's slope, nothing more mystical. Where it's flat, f'(x0)=0.
export default function DerivativeWidget() {
  const plotRef = useRef(null)
  const [fnKey, setFnKey] = useState('x³ − 3x')
  const [x0, setX0] = useState(1)

  const render = useCallback((key, x) => {
    const { f, range } = FUNCS[key]
    const xs = Array.from({ length: 200 }, (_, i) => range[0] + (i / 199) * (range[1] - range[0]))
    const ys = xs.map(f)
    const slope = derivative(f, x)
    const y0 = f(x)
    const tx = [x - 1.2, x + 1.2]
    const ty = tx.map(t => y0 + slope * (t - x))

    Plotly.react(plotRef.current, [
      { x: xs, y: ys, mode: 'lines', type: 'scatter', line: { color: COLOR, width: 2 }, name: 'f(x)' },
      { x: tx, y: ty, mode: 'lines', type: 'scatter', line: { color: '#dc2626', width: 2, dash: 'dash' }, name: `tangent, slope=${slope.toFixed(2)}` },
      { x: [x], y: [y0], mode: 'markers', type: 'scatter', marker: { color: '#dc2626', size: 10 }, name: `(x₀, f(x₀))` },
    ], plotlyLayout({
      title: { text: `f'(${x.toFixed(2)}) = ${slope.toFixed(3)}`, font: { size: 13 } },
      xaxis: { title: 'x' }, yaxis: { title: 'f(x)' },
      legend: { orientation: 'h', y: -0.2 },
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(fnKey, x0) }, []) // eslint-disable-line

  function switchFn(key) {
    const mid = (FUNCS[key].range[0] + FUNCS[key].range[1]) / 2
    setFnKey(key); setX0(mid); render(key, mid)
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {Object.keys(FUNCS).map(k => (
          <button key={k} onClick={() => switchFn(k)}
            style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid var(--border, #ccc)',
              background: fnKey === k ? COLOR : 'transparent', color: fnKey === k ? '#fff' : 'var(--text)',
              cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
            f(x) = {k}
          </button>
        ))}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        x₀
        <input type="range" min={FUNCS[fnKey].range[0]} max={FUNCS[fnKey].range[1]} step="0.05" value={x0}
          onChange={e => { const v = +e.target.value; setX0(v); render(fnKey, v) }} style={{ flex: 1, maxWidth: 300 }} />
        <strong>{x0.toFixed(2)}</strong>
      </label>
      <div ref={plotRef} style={{ minHeight: 300 }} />
      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem' }}>
        f'(x₀) = lim<sub>h→0</sub> [f(x₀+h) − f(x₀)] / h — computed here numerically. Find the flat point on x³−3x: f'(x)=0 there, marking a local max/min, exactly how training finds a loss minimum.
      </p>
    </div>
  )
}
