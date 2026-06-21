import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { sigmoid, linspace, randn } from '../utils.js'

const CFG = { responsive: true, displayModeBar: false }
const BG = { paper_bgcolor: 'transparent', plot_bgcolor: 'transparent' }

function genData() {
  const x = [], y = []
  for (let i = 0; i < 30; i++) { const l = Math.random() > 0.5 ? 1 : 0; x.push(l * 3.5 + randn() * 1.3); y.push(l) }
  return { x, y }
}
const DATA = genData()

function negLL(b0, b1) {
  let s = 0
  DATA.x.forEach((xi, i) => { const p = Math.max(1e-10, Math.min(1 - 1e-10, sigmoid(b0 + b1 * xi))); s -= DATA.y[i] * Math.log(p) + (1 - DATA.y[i]) * Math.log(1 - p) })
  return s / DATA.x.length
}
function gradN(b0, b1) {
  let g0 = 0, g1 = 0
  DATA.x.forEach((xi, i) => { const e = sigmoid(b0 + b1 * xi) - DATA.y[i]; g0 += e; g1 += e * xi })
  return [g0 / DATA.x.length, g1 / DATA.x.length]
}
function hessian(b0, b1) {
  let h00 = 0, h01 = 0, h11 = 0
  DATA.x.forEach(xi => { const p = sigmoid(b0 + b1 * xi), w = p * (1 - p); h00 += w; h01 += w * xi; h11 += w * xi * xi })
  return [h00 / DATA.x.length, h01 / DATA.x.length, h11 / DATA.x.length]
}

export default function NewtonWidget() {
  const plotRef = useRef(null)
  const stateRef = useRef({ gd: [-3, -1], nw: [-3, -1], gdP: [[-3], [-1]], nwP: [[-3], [-1]], gdS: 0, nwS: 0, running: false })
  const [disp, setDisp] = useState({ gdS: 0, nwS: 0, gdL: negLL(-3, -1).toFixed(4), nwL: negLL(-3, -1).toFixed(4) })

  function draw() {
    const s = stateRef.current
    const b0R = linspace(-5, 3, 30), b1R = linspace(-2, 4, 30)
    const z = b1R.map(b1 => b0R.map(b0 => negLL(b0, b1)))
    Plotly.react(plotRef.current, [
      { type: 'contour', x: b0R, y: b1R, z, colorscale: 'Blues', ncontours: 15, showscale: false },
      { x: s.gdP[0], y: s.gdP[1], mode: 'lines+markers', name: 'Gradient Descent', line: { color: '#e53e3e', width: 2 }, marker: { size: 4, color: '#e53e3e' } },
      { x: s.nwP[0], y: s.nwP[1], mode: 'lines+markers', name: "Newton's Method", line: { color: '#38a169', width: 2 }, marker: { size: 6, color: '#38a169' } },
    ], { ...BG, xaxis: { title: 'β₀', range: [-5, 3] }, yaxis: { title: 'β₁', range: [-2, 4] }, title: { text: 'Gradient Descent vs Newton (neg. log-likelihood)', font: { size: 12 } }, margin: { t: 40, r: 10, b: 45, l: 50 }, legend: { x: 0.6, y: 0.95 } }, CFG)
  }

  function doStep() {
    const s = stateRef.current
    const g = gradN(s.gd[0], s.gd[1])
    s.gd[0] -= 1.0 * g[0]; s.gd[1] -= 1.0 * g[1]
    s.gdP[0].push(s.gd[0]); s.gdP[1].push(s.gd[1]); s.gdS++
    const gn = gradN(s.nw[0], s.nw[1]), h = hessian(s.nw[0], s.nw[1])
    const det = h[0] * h[2] - h[1] * h[1]
    if (Math.abs(det) > 1e-10) {
      s.nw[0] -= (h[2] * gn[0] - h[1] * gn[1]) / det
      s.nw[1] -= (h[0] * gn[1] - h[1] * gn[0]) / det
    }
    s.nwP[0].push(s.nw[0]); s.nwP[1].push(s.nw[1]); s.nwS++
    setDisp({ gdS: s.gdS, nwS: s.nwS, gdL: negLL(s.gd[0], s.gd[1]).toFixed(4), nwL: negLL(s.nw[0], s.nw[1]).toFixed(4) })
    draw()
  }
  function run() {
    const s = stateRef.current; if (s.running) return; s.running = true
    const iv = setInterval(() => { doStep(); if (s.gdS >= 30) { clearInterval(iv); s.running = false } }, 100)
  }
  function reset() {
    const s = stateRef.current; s.gd = [-3, -1]; s.nw = [-3, -1]; s.gdP = [[-3], [-1]]; s.nwP = [[-3], [-1]]; s.gdS = 0; s.nwS = 0; s.running = false
    setDisp({ gdS: 0, nwS: 0, gdL: negLL(-3, -1).toFixed(4), nwL: negLL(-3, -1).toFixed(4) }); draw()
  }

  useEffect(() => { draw() }, []) // eslint-disable-line

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
        <button onClick={doStep} style={btn('#3182ce')}>Step Both</button>
        <button onClick={run} style={btn('#38a169')}>Run</button>
        <button onClick={reset} style={btn('#718096')}>Reset</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', fontSize: '0.88rem', marginBottom: '0.75rem' }}>
        <div><span style={{ color: '#e53e3e' }}>■</span> GD — Steps: <strong>{disp.gdS}</strong>, Loss: <strong>{disp.gdL}</strong></div>
        <div><span style={{ color: '#38a169' }}>■</span> Newton — Steps: <strong>{disp.nwS}</strong>, Loss: <strong>{disp.nwL}</strong></div>
      </div>
      <div ref={plotRef} style={{ minHeight: 360 }} />
    </div>
  )
}
const btn = c => ({ background: c, color: '#fff', border: 'none', borderRadius: 4, padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' })
