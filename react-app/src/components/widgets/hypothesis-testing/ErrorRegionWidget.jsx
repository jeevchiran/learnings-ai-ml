import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace, normalPDF, normalCDF, approximateNormalQuantile, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

// zCritical: right-tail critical value for given alpha and number of tails
function zCritical(alpha, tails) {
  return approximateNormalQuantile(1 - alpha / tails)
}

function buildErrorPlot(alpha, delta) {
  const zStar = zCritical(alpha, 1) // right-tailed
  const beta = normalCDF(zStar - delta)
  const power = 1 - beta

  const xMin = -4
  const xMax = delta + 4
  const xs = linspace(xMin, xMax, 400)

  const yNull = xs.map(x => normalPDF(x))
  const yAlt = xs.map(x => normalPDF(x - delta))

  const xTypeI = xs.filter(x => x >= zStar)
  const yTypeI = xTypeI.map(x => normalPDF(x))
  const xTypeII = xs.filter(x => x <= zStar)
  const yTypeII = xTypeII.map(x => normalPDF(x - delta))

  const traceNull = {
    x: xs, y: yNull,
    type: 'scatter', mode: 'lines',
    name: 'Null Distribution (H₀)',
    line: { color: '#2563eb', width: 2 },
  }
  const traceAlt = {
    x: xs, y: yAlt,
    type: 'scatter', mode: 'lines',
    name: 'Alternative Distribution (H₁)',
    line: { color: '#ea580c', width: 2 },
  }

  const traceTypeI = xTypeI.length > 1 ? {
    x: [xTypeI[0], ...xTypeI, xTypeI[xTypeI.length - 1]],
    y: [0, ...yTypeI, 0],
    type: 'scatter', mode: 'none', fill: 'toself',
    fillcolor: 'rgba(220,38,38,0.30)',
    line: { width: 0 },
    name: 'Type I Error (α)',
  } : null

  const traceTypeII = xTypeII.length > 1 ? {
    x: [xTypeII[0], ...xTypeII, xTypeII[xTypeII.length - 1]],
    y: [0, ...yTypeII, 0],
    type: 'scatter', mode: 'none', fill: 'toself',
    fillcolor: 'rgba(124,58,237,0.28)',
    line: { width: 0 },
    name: 'Type II Error (β)',
  } : null

  const layout = plotlyLayout({
    xaxis: { title: { text: 'Test Statistic (Z)' }, range: [xMin, xMax] },
    yaxis: { title: { text: 'Probability Density' }, rangemode: 'tozero' },
    shapes: [{
      type: 'line',
      x0: zStar, x1: zStar, y0: 0, y1: 0.42,
      line: { color: '#374151', width: 2, dash: 'dash' },
    }],
    annotations: [{
      x: zStar, y: 0.40,
      text: `z* = ${zStar.toFixed(3)}`,
      showarrow: true, arrowhead: 2, arrowsize: 1,
      ax: 30, ay: -20,
      font: { size: 11 },
    }],
  })

  const data = [traceNull, traceAlt, traceTypeI, traceTypeII].filter(Boolean)
  return { data, layout, beta, power, zStar }
}

export default function ErrorRegionWidget() {
  const plotRef = useRef(null)
  const [alpha, setAlpha] = useState(0.05)
  const [delta, setDelta] = useState(1.5)
  const [stats, setStats] = useState({ alpha: 0.05, beta: 0, power: 0, zStar: 0 })

  useEffect(() => {
    const result = buildErrorPlot(alpha, delta)
    setStats({ alpha, beta: result.beta, power: result.power, zStar: result.zStar })
    Plotly.react(plotRef.current, result.data, result.layout, PLOTLY_CONFIG)
  }, [alpha, delta])

  const statStyle = { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', margin: '0.5rem 0', fontSize: '0.9rem' }
  const badgeStyle = { background: 'rgba(0,0,0,0.06)', borderRadius: 4, padding: '0.2rem 0.5rem' }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Significance Level α: <span style={{ color: '#2563eb' }}>{alpha.toFixed(2)}</span>
          </label>
          <input type="range" min="0.01" max="0.20" step="0.01" value={alpha}
            onChange={e => setAlpha(parseFloat(e.target.value))}
            style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Effect Size δ: <span style={{ color: '#ea580c' }}>{delta.toFixed(1)}</span>
          </label>
          <input type="range" min="0.5" max="3.5" step="0.1" value={delta}
            onChange={e => setDelta(parseFloat(e.target.value))}
            style={{ width: '100%' }} />
        </div>
      </div>

      <div ref={plotRef} style={{ width: '100%', height: 320 }} />

      <div style={statStyle}>
        <span style={badgeStyle}>α = {stats.alpha.toFixed(4)}</span>
        <span style={badgeStyle}>β = {stats.beta.toFixed(4)}</span>
        <span style={badgeStyle}>Power = {stats.power.toFixed(4)}</span>
        <span style={badgeStyle}>z* = {stats.zStar.toFixed(4)}</span>
      </div>
    </div>
  )
}
