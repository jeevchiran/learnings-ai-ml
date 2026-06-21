import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace, normalPDF, approximateNormalQuantile, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

function zCritical(alpha, tails) {
  return approximateNormalQuantile(1 - alpha / tails)
}

function buildCritValPlot(alpha, testType) {
  const xs = linspace(-4, 4, 400)
  const ys = xs.map(normalPDF)
  const shadeTraces = []
  const shapes = []
  const annotations = []
  let critValStr = ''

  if (testType === 'two') {
    const zStar = zCritical(alpha, 2)
    critValStr = `±${zStar.toFixed(3)}`
    const rightXs = xs.filter(x => x >= zStar)
    const leftXs = xs.filter(x => x <= -zStar)
    if (rightXs.length > 1) shadeTraces.push({ x: [rightXs[0], ...rightXs, rightXs[rightXs.length - 1]], y: [0, ...rightXs.map(normalPDF), 0], type: 'scatter', mode: 'none', fill: 'toself', fillcolor: 'rgba(220,38,38,0.35)', line: { width: 0 }, name: 'Rejection region', showlegend: true })
    if (leftXs.length > 1) shadeTraces.push({ x: [leftXs[0], ...leftXs, leftXs[leftXs.length - 1]], y: [0, ...leftXs.map(normalPDF), 0], type: 'scatter', mode: 'none', fill: 'toself', fillcolor: 'rgba(220,38,38,0.35)', line: { width: 0 }, name: 'Rejection region', showlegend: false })
    shapes.push(
      { type: 'line', x0: zStar, x1: zStar, y0: 0, y1: 0.42, line: { color: '#dc2626', width: 2, dash: 'dash' } },
      { type: 'line', x0: -zStar, x1: -zStar, y0: 0, y1: 0.42, line: { color: '#dc2626', width: 2, dash: 'dash' } }
    )
    annotations.push(
      { x: zStar, y: 0.40, text: `z* = +${zStar.toFixed(3)}`, showarrow: true, arrowhead: 2, ax: 30, ay: -20, font: { size: 11 } },
      { x: -zStar, y: 0.40, text: `z* = −${zStar.toFixed(3)}`, showarrow: true, arrowhead: 2, ax: -30, ay: -20, font: { size: 11 } }
    )
  } else if (testType === 'right') {
    const zStar = zCritical(alpha, 1)
    critValStr = `+${zStar.toFixed(3)}`
    const rightXs = xs.filter(x => x >= zStar)
    if (rightXs.length > 1) shadeTraces.push({ x: [rightXs[0], ...rightXs, rightXs[rightXs.length - 1]], y: [0, ...rightXs.map(normalPDF), 0], type: 'scatter', mode: 'none', fill: 'toself', fillcolor: 'rgba(220,38,38,0.35)', line: { width: 0 }, name: 'Rejection region', showlegend: true })
    shapes.push({ type: 'line', x0: zStar, x1: zStar, y0: 0, y1: 0.42, line: { color: '#dc2626', width: 2, dash: 'dash' } })
    annotations.push({ x: zStar, y: 0.40, text: `z* = +${zStar.toFixed(3)}`, showarrow: true, arrowhead: 2, ax: 30, ay: -20, font: { size: 11 } })
  } else {
    const zStar = zCritical(alpha, 1)
    critValStr = `−${zStar.toFixed(3)}`
    const leftXs = xs.filter(x => x <= -zStar)
    if (leftXs.length > 1) shadeTraces.push({ x: [leftXs[0], ...leftXs, leftXs[leftXs.length - 1]], y: [0, ...leftXs.map(normalPDF), 0], type: 'scatter', mode: 'none', fill: 'toself', fillcolor: 'rgba(220,38,38,0.35)', line: { width: 0 }, name: 'Rejection region', showlegend: true })
    shapes.push({ type: 'line', x0: -zStar, x1: -zStar, y0: 0, y1: 0.42, line: { color: '#dc2626', width: 2, dash: 'dash' } })
    annotations.push({ x: -zStar, y: 0.40, text: `z* = −${zStar.toFixed(3)}`, showarrow: true, arrowhead: 2, ax: -30, ay: -20, font: { size: 11 } })
  }

  const traceCurve = { x: xs, y: ys, type: 'scatter', mode: 'lines', name: 'Standard Normal', line: { color: '#2563eb', width: 2 } }
  const layout = plotlyLayout({
    xaxis: { title: { text: 'Z' }, range: [-4, 4] },
    yaxis: { title: { text: 'Density' }, rangemode: 'tozero' },
    shapes, annotations,
  })
  return { data: [traceCurve, ...shadeTraces], layout, critValStr }
}

export default function CriticalValueWidget() {
  const plotRef = useRef(null)
  const [alpha, setAlpha] = useState(0.05)
  const [testType, setTestType] = useState('two')
  const [critValStr, setCritValStr] = useState('±1.960')

  useEffect(() => {
    const result = buildCritValPlot(alpha, testType)
    setCritValStr(result.critValStr)
    Plotly.react(plotRef.current, result.data, result.layout, PLOTLY_CONFIG)
  }, [alpha, testType])

  const badgeStyle = { background: 'rgba(0,0,0,0.06)', borderRadius: 4, padding: '0.2rem 0.5rem' }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Significance Level α: <span style={{ color: '#dc2626' }}>{alpha.toFixed(2)}</span>
          </label>
          <input type="range" min="0.01" max="0.20" step="0.01" value={alpha}
            onChange={e => setAlpha(parseFloat(e.target.value))}
            style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Test type:</label><br />
          <select value={testType} onChange={e => setTestType(e.target.value)}
            style={{ padding: '0.25rem 0.5rem', borderRadius: 4, border: '1px solid #d1d5db', marginTop: '0.25rem' }}>
            <option value="two">Two-tailed</option>
            <option value="right">Right-tailed</option>
            <option value="left">Left-tailed</option>
          </select>
        </div>
      </div>

      <div ref={plotRef} style={{ width: '100%', height: 300 }} />

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem', fontSize: '0.9rem' }}>
        <span style={badgeStyle}>α = {alpha.toFixed(2)}</span>
        <span style={badgeStyle}>Critical value z* = {critValStr}</span>
        <span style={badgeStyle}>Rejection area = {alpha.toFixed(4)}</span>
      </div>
    </div>
  )
}
