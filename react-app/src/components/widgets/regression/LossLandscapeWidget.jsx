import { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-dist-min'
import { sigmoid, linspace } from '../utils.js'

const DATA_X = [-2, -1, 0.5, 1.5, 3]
const DATA_Y = [0, 0, 0, 1, 1]
const b0R = linspace(-4, 4, 35)
const b1R = linspace(-2, 5, 35)

function mseLoss(b0, b1) {
  let s = 0
  DATA_X.forEach((xi, i) => { const p = sigmoid(b0 + b1 * xi); s += (DATA_Y[i] - p) ** 2 })
  return s / DATA_X.length
}
function ceLoss(b0, b1) {
  let s = 0
  DATA_X.forEach((xi, i) => { const p = Math.max(1e-7, Math.min(1 - 1e-7, sigmoid(b0 + b1 * xi))); s -= DATA_Y[i] * Math.log(p) + (1 - DATA_Y[i]) * Math.log(1 - p) })
  return s / DATA_X.length
}

const mseZ = b1R.map(b1 => b0R.map(b0 => mseLoss(b0, b1)))
const ceZ = b1R.map(b1 => b0R.map(b0 => ceLoss(b0, b1)))
const CFG = { responsive: true, displayModeBar: false }

export default function LossLandscapeWidget() {
  const mseRef = useRef(null)
  const ceRef = useRef(null)
  useEffect(() => {
    const base = { type: 'surface', x: b0R, y: b1R, showscale: false, opacity: 0.9 }
    const scene = { xaxis: { title: 'b0' }, yaxis: { title: 'b1' }, camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } } }
    Plotly.newPlot(mseRef.current, [{ ...base, z: mseZ, colorscale: 'Reds' }], { scene: { ...scene, zaxis: { title: 'MSE Loss' } }, title: { text: 'MSE Loss (non-convex)', font: { size: 12 } }, margin: { t: 40, r: 10, l: 10 }, paper_bgcolor: 'transparent' }, CFG)
    Plotly.newPlot(ceRef.current, [{ ...base, z: ceZ, colorscale: 'Blues' }], { scene: { ...scene, zaxis: { title: 'CE Loss' } }, title: { text: 'Cross-Entropy Loss (convex)', font: { size: 12 } }, margin: { t: 40, r: 10, l: 10 }, paper_bgcolor: 'transparent' }, CFG)
  }, [])
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
      <div ref={mseRef} style={{ minHeight: 340 }} />
      <div ref={ceRef} style={{ minHeight: 340 }} />
    </div>
  )
}
