import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { likelihoodCurve } from './calculusUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#475569'

// Flip a coin n times, get `heads` heads. Sweep every candidate p from 0 to 1
// and plot how likely the observed data would be under each — the peak IS
// the maximum likelihood estimate, no calculus required to see where it is.
export default function LikelihoodWidget() {
  const plotRef = useRef(null)
  const [n, setN] = useState(20)
  const [heads, setHeads] = useState(14)

  const render = useCallback((nn, h) => {
    const { ps, logL, mle } = likelihoodCurve(h, nn)
    Plotly.react(plotRef.current, [
      { x: ps, y: logL, mode: 'lines', type: 'scatter', line: { color: COLOR, width: 2 }, name: 'log-likelihood' },
    ], plotlyLayout({
      title: { text: `${h}/${nn} heads — MLE p̂ = ${mle.toFixed(2)}`, font: { size: 13 } },
      xaxis: { title: 'p (candidate probability of heads)' }, yaxis: { title: 'log L(p | data)' },
      shapes: [{ type: 'line', x0: mle, x1: mle, y0: 0, y1: 1, yref: 'paper', line: { color: '#dc2626', width: 2, dash: 'dash' } }],
      showlegend: false,
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(n, heads) }, []) // eslint-disable-line

  function update(nn, h) {
    const hh = Math.min(h, nn)
    setN(nn); setHeads(hh); render(nn, hh)
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          n flips <input type="range" min="5" max="60" step="1" value={n} onChange={e => update(+e.target.value, heads)} /> <strong>{n}</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          heads observed <input type="range" min="0" max={n} step="1" value={heads} onChange={e => update(n, +e.target.value)} /> <strong>{heads}</strong>
        </label>
      </div>
      <div ref={plotRef} style={{ minHeight: 300 }} />
      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem' }}>
        log L(p) = k·log(p) + (n−k)·log(1−p). Setting its derivative to zero gives p̂ = k/n analytically — exactly where the curve peaks here. This is the same principle behind fitting any ML model: pick parameters that make the observed data most probable.
      </p>
    </div>
  )
}
