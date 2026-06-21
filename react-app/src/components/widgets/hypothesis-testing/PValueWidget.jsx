import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace, normalPDF, normalCDF, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

function buildPValuePlot(zObs, testType) {
  const xs = linspace(-4, 4, 400)
  const ys = xs.map(normalPDF)

  let pValue, shadeX = [], shadeY = []

  if (testType === 'left') {
    pValue = normalCDF(zObs)
    const leftXs = xs.filter(x => x <= zObs)
    if (leftXs.length > 1) {
      shadeX = [leftXs[0], ...leftXs, leftXs[leftXs.length - 1]]
      shadeY = [0, ...leftXs.map(normalPDF), 0]
    }
  } else {
    const absZ = Math.abs(zObs)
    pValue = 2 * normalCDF(-absZ)
    const rightXs = xs.filter(x => x >= absZ)
    const leftXs = xs.filter(x => x <= -absZ)
    const rightFill = rightXs.length > 1 ? [rightXs[0], ...rightXs, rightXs[rightXs.length - 1]] : []
    const rightFillY = rightXs.length > 1 ? [0, ...rightXs.map(normalPDF), 0] : []
    const leftFill = leftXs.length > 1 ? [leftXs[0], ...leftXs, leftXs[leftXs.length - 1]] : []
    const leftFillY = leftXs.length > 1 ? [0, ...leftXs.map(normalPDF), 0] : []
    shadeX = [...leftFill, ...rightFill]
    shadeY = [...leftFillY, ...rightFillY]
  }

  const traceCurve = {
    x: xs, y: ys,
    type: 'scatter', mode: 'lines',
    name: 'Standard Normal',
    line: { color: '#2563eb', width: 2 },
    showlegend: false,
  }
  const traceShade = {
    x: shadeX, y: shadeY,
    type: 'scatter', mode: 'none', fill: 'toself',
    fillcolor: 'rgba(239,68,68,0.40)',
    line: { width: 0 },
    name: 'p-value region',
    showlegend: false,
  }

  const shapes = []
  const annotations = []

  if (testType === 'left') {
    shapes.push({ type: 'line', x0: zObs, x1: zObs, y0: 0, y1: 0.42, line: { color: '#dc2626', width: 2 } })
    annotations.push({ x: zObs, y: 0.38, text: `z = ${zObs.toFixed(2)}`, showarrow: true, arrowhead: 2, ax: -30, ay: -20, font: { size: 11 } })
  } else {
    const absZ = Math.abs(zObs)
    shapes.push({ type: 'line', x0: absZ, x1: absZ, y0: 0, y1: 0.42, line: { color: '#dc2626', width: 2 } })
    shapes.push({ type: 'line', x0: -absZ, x1: -absZ, y0: 0, y1: 0.42, line: { color: '#dc2626', width: 2 } })
    annotations.push({ x: absZ, y: 0.38, text: `|z| = ${absZ.toFixed(2)}`, showarrow: true, arrowhead: 2, ax: 25, ay: -20, font: { size: 11 } })
  }

  const layout = plotlyLayout({
    xaxis: { title: { text: 'Z' }, range: [-4, 4] },
    yaxis: { title: { text: 'Density' }, rangemode: 'tozero' },
    shapes, annotations,
  })

  return { data: [traceCurve, traceShade], layout, pValue }
}

export default function PValueWidget() {
  const plotRef = useRef(null)
  const [zObs, setZObs] = useState(-1.5)
  const [testType, setTestType] = useState('two')
  const [pValue, setPValue] = useState(null)

  useEffect(() => {
    const result = buildPValuePlot(zObs, testType)
    setPValue(result.pValue)
    Plotly.react(plotRef.current, result.data, result.layout, PLOTLY_CONFIG)
  }, [zObs, testType])

  const reject = pValue !== null && pValue <= 0.05
  const pStr = pValue === null ? '—' : (pValue < 0.0001 ? pValue.toExponential(3) : pValue.toFixed(4))

  const decisionStyle = {
    display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 4, fontWeight: 700, fontSize: '0.88rem',
    background: reject ? 'rgba(220,38,38,0.12)' : 'rgba(37,99,235,0.10)',
    color: reject ? '#dc2626' : '#2563eb',
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Observed Z: <span style={{ color: '#2563eb' }}>{zObs.toFixed(2)}</span>
          </label>
          <input type="range" min="-3.5" max="3.5" step="0.05" value={zObs}
            onChange={e => setZObs(parseFloat(e.target.value))}
            style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Test type:</label><br />
          <select value={testType} onChange={e => setTestType(e.target.value)}
            style={{ padding: '0.25rem 0.5rem', borderRadius: 4, border: '1px solid #d1d5db', marginTop: '0.25rem' }}>
            <option value="two">Two-tailed</option>
            <option value="left">Left-tailed</option>
          </select>
        </div>
      </div>

      <div ref={plotRef} style={{ width: '100%', height: 300 }} />

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.9rem' }}>
        <span>z = <strong>{zObs.toFixed(2)}</strong></span>
        <span>p-value = <strong>{pStr}</strong></span>
        <span style={decisionStyle}>{reject ? 'Reject H₀ at α = 0.05' : 'Fail to Reject H₀ at α = 0.05'}</span>
      </div>
    </div>
  )
}
