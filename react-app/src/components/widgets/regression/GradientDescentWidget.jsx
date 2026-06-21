import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { generateRegressionData, linspace } from '../utils.js'

const CFG = { responsive: true, displayModeBar: false }
const DATA = generateRegressionData(25, 3, 2, 2.5)

function computeLoss(b0, b1) {
  return DATA.x.reduce((s, xi, i) => s + (DATA.y[i] - (b0 + b1 * xi)) ** 2, 0) / (2 * DATA.x.length)
}

function computeGrad(b0, b1) {
  const n = DATA.x.length
  let g0 = 0, g1 = 0
  DATA.x.forEach((xi, i) => { const err = b0 + b1 * xi - DATA.y[i]; g0 += err; g1 += err * xi })
  return [g0 / n, g1 / n]
}

const b0Range = linspace(-5, 12, 40)
const b1Range = linspace(-3, 8, 40)
const zContour = b1Range.map(b1 => b0Range.map(b0 => computeLoss(b0, b1)))
const zSurface = linspace(-3, 8, 30).map(b1 => linspace(-5, 12, 30).map(b0 => computeLoss(b0, b1)))

export default function GradientDescentWidget() {
  const contourRef = useRef(null)
  const surfaceRef = useRef(null)
  const stateRef = useRef({ beta: [8, -2], path: [[8], [-2]], iter: 0, running: false })
  const [display, setDisplay] = useState({ iter: 0, loss: computeLoss(8, -2).toFixed(4), b0: '8.000', b1: '-2.000' })
  const [lr, setLr] = useState(-1) // log10 scale

  function drawPlots() {
    const { path } = stateRef.current
    Plotly.react(contourRef.current, [
      { type: 'contour', x: b0Range, y: b1Range, z: zContour, colorscale: 'Blues', ncontours: 20, showscale: false, contours: { coloring: 'heatmap' } },
      { x: path[0], y: path[1], mode: 'lines+markers', type: 'scatter', marker: { size: 4, color: '#e53e3e' }, line: { color: '#e53e3e', width: 2 }, name: 'GD Path' },
    ], { xaxis: { title: 'β₀', range: [-5, 12] }, yaxis: { title: 'β₁', range: [-3, 8] }, title: { text: 'Contour of Loss', font: { size: 13 } }, margin: { t: 40, r: 10, b: 45, l: 50 }, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent' }, CFG)

    const pathZ = path[0].map((b0, i) => computeLoss(b0, path[1][i]))
    const b0s = linspace(-5, 12, 30), b1s = linspace(-3, 8, 30)
    const zS = b1s.map(b1 => b0s.map(b0 => computeLoss(b0, b1)))
    Plotly.react(surfaceRef.current, [
      { type: 'surface', x: b0s, y: b1s, z: zS, colorscale: 'Blues', opacity: 0.8, showscale: false },
      { type: 'scatter3d', x: path[0], y: path[1], z: pathZ, mode: 'lines+markers', marker: { size: 3, color: '#e53e3e' }, line: { color: '#e53e3e', width: 3 }, name: 'GD Path' },
    ], { scene: { xaxis: { title: 'β₀' }, yaxis: { title: 'β₁' }, zaxis: { title: 'Loss' }, camera: { eye: { x: 1.8, y: 1.8, z: 1.2 } } }, title: { text: '3D Loss Surface', font: { size: 13 } }, margin: { t: 40, r: 10 }, paper_bgcolor: 'transparent', showlegend: false }, CFG)
  }

  function doStep() {
    const s = stateRef.current
    const lrVal = Math.pow(10, lr)
    const g = computeGrad(s.beta[0], s.beta[1])
    s.beta[0] -= lrVal * g[0]; s.beta[1] -= lrVal * g[1]
    s.path[0].push(s.beta[0]); s.path[1].push(s.beta[1])
    s.iter++
    setDisplay({ iter: s.iter, loss: computeLoss(s.beta[0], s.beta[1]).toFixed(4), b0: s.beta[0].toFixed(3), b1: s.beta[1].toFixed(3) })
    drawPlots()
  }

  function run() {
    const s = stateRef.current
    if (s.running) return
    s.running = true
    const iv = setInterval(() => {
      doStep()
      if (s.iter > 200 || computeLoss(s.beta[0], s.beta[1]) > 1e6) { clearInterval(iv); s.running = false }
    }, 80)
  }

  function reset() {
    const s = stateRef.current
    s.beta = [8, -2]; s.path = [[8], [-2]]; s.iter = 0; s.running = false
    setDisplay({ iter: 0, loss: computeLoss(8, -2).toFixed(4), b0: '8.000', b1: '-2.000' })
    drawPlots()
  }

  useEffect(() => { drawPlots() }, []) // eslint-disable-line

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
        <label>Learning rate (10^): <input type="range" min="-3" max="0" step="0.1" value={lr}
          onChange={e => setLr(+e.target.value)} /> <strong>{Math.pow(10, lr).toFixed(4)}</strong></label>
        <button onClick={doStep} style={btn('#3182ce')}>Step</button>
        <button onClick={run} style={btn('#38a169')}>Run</button>
        <button onClick={reset} style={btn('#718096')}>Reset</button>
      </div>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <span>Iter: <strong>{display.iter}</strong></span>
        <span>Loss: <strong>{display.loss}</strong></span>
        <span>β₀: <strong>{display.b0}</strong></span>
        <span>β₁: <strong>{display.b1}</strong></span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div ref={contourRef} style={{ minHeight: 320 }} />
        <div ref={surfaceRef} style={{ minHeight: 320 }} />
      </div>
    </div>
  )
}

const btn = color => ({ background: color, color: '#fff', border: 'none', borderRadius: 4, padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' })
