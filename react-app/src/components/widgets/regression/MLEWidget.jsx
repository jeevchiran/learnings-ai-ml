import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { sigmoid, linspace, randn } from '../utils.js'

const CFG = { responsive: true, displayModeBar: false }
const BG = { paper_bgcolor: 'transparent', plot_bgcolor: 'transparent' }

function genData() {
  const x = [], y = []
  for (let i = 0; i < 20; i++) { const l = Math.random() > 0.5 ? 1 : 0; x.push(l * 3 + randn() * 1.2); y.push(l) }
  return { x, y }
}
const DATA = genData()

function ll(b0, b1) {
  let s = 0
  DATA.x.forEach((xi, i) => { const p = Math.max(1e-10, Math.min(1 - 1e-10, sigmoid(b0 + b1 * xi))); s += DATA.y[i] * Math.log(p) + (1 - DATA.y[i]) * Math.log(1 - p) })
  return s
}
function grad(b0, b1) {
  let g0 = 0, g1 = 0
  DATA.x.forEach((xi, i) => { const e = DATA.y[i] - sigmoid(b0 + b1 * xi); g0 += e; g1 += e * xi })
  return [g0 / DATA.x.length, g1 / DATA.x.length]
}

const xRange = linspace(-4, 7, 100)

export default function MLEWidget() {
  const contRef = useRef(null), sigRef = useRef(null)
  const stateRef = useRef({ beta: [0, 0], path: [[0], [0]], iter: 0, running: false })
  const [disp, setDisp] = useState({ iter: 0, ll: ll(0, 0).toFixed(3), b0: '0.000', b1: '0.000' })
  const [lr, setLr] = useState(-1)

  function draw() {
    const { beta, path } = stateRef.current
    const b0R = linspace(-4, 4, 30), b1R = linspace(-2, 5, 30)
    const z = b1R.map(b1 => b0R.map(b0 => ll(b0, b1)))
    Plotly.react(contRef.current, [
      { type: 'contour', x: b0R, y: b1R, z, colorscale: 'Blues', ncontours: 15, showscale: false },
      { x: path[0], y: path[1], mode: 'lines+markers', type: 'scatter', marker: { size: 4, color: '#e53e3e' }, line: { color: '#e53e3e', width: 2 } },
    ], { ...BG, xaxis: { title: 'β₀', range: [-4, 4] }, yaxis: { title: 'β₁', range: [-2, 5] }, title: { text: 'Log-Likelihood Contours', font: { size: 12 } }, margin: { t: 40, r: 10, b: 45, l: 50 }, showlegend: false }, CFG)
    const sig = xRange.map(x => sigmoid(beta[0] + beta[1] * x))
    Plotly.react(sigRef.current, [
      { x: DATA.x.filter((_, i) => DATA.y[i] === 0), y: DATA.x.filter((_, i) => DATA.y[i] === 0).map(() => 0), mode: 'markers', name: 'Class 0', marker: { color: '#3182ce', size: 8 } },
      { x: DATA.x.filter((_, i) => DATA.y[i] === 1), y: DATA.x.filter((_, i) => DATA.y[i] === 1).map(() => 1), mode: 'markers', name: 'Class 1', marker: { color: '#e53e3e', size: 8 } },
      { x: xRange, y: sig, mode: 'lines', name: 'Sigmoid', line: { color: '#38a169', width: 2 } },
    ], { ...BG, xaxis: { title: 'x' }, yaxis: { title: 'P(y=1)', range: [-0.05, 1.05] }, title: { text: 'Current Sigmoid Fit', font: { size: 12 } }, margin: { t: 40, r: 10, b: 45, l: 50 } }, CFG)
  }

  function doStep() {
    const s = stateRef.current, lrV = Math.pow(10, lr), g = grad(s.beta[0], s.beta[1])
    s.beta[0] += lrV * g[0]; s.beta[1] += lrV * g[1]
    s.path[0].push(s.beta[0]); s.path[1].push(s.beta[1]); s.iter++
    setDisp({ iter: s.iter, ll: ll(s.beta[0], s.beta[1]).toFixed(3), b0: s.beta[0].toFixed(3), b1: s.beta[1].toFixed(3) })
    draw()
  }
  function run() {
    const s = stateRef.current; if (s.running) return; s.running = true
    const iv = setInterval(() => { doStep(); if (s.iter > 150) { clearInterval(iv); s.running = false } }, 80)
  }
  function reset() {
    const s = stateRef.current; s.beta = [0, 0]; s.path = [[0], [0]]; s.iter = 0; s.running = false
    setDisp({ iter: 0, ll: ll(0, 0).toFixed(3), b0: '0.000', b1: '0.000' }); draw()
  }

  useEffect(() => { draw() }, []) // eslint-disable-line

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
        <label>LR (10^): <input type="range" min="-3" max="0" step="0.1" value={lr} onChange={e => setLr(+e.target.value)} /> <strong>{Math.pow(10, lr).toFixed(4)}</strong></label>
        <button onClick={doStep} style={btn('#3182ce')}>Step</button>
        <button onClick={run} style={btn('#38a169')}>Run</button>
        <button onClick={reset} style={btn('#718096')}>Reset</button>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.88rem', marginBottom: '0.75rem' }}>
        <span>Iter: <strong>{disp.iter}</strong></span>
        <span>Log-Likelihood: <strong>{disp.ll}</strong></span>
        <span>β₀: <strong>{disp.b0}</strong></span>
        <span>β₁: <strong>{disp.b1}</strong></span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div ref={contRef} style={{ minHeight: 300 }} />
        <div ref={sigRef} style={{ minHeight: 300 }} />
      </div>
    </div>
  )
}
const btn = c => ({ background: c, color: '#fff', border: 'none', borderRadius: 4, padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' })
