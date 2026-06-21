import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace } from '../utils.js'

const CFG = { responsive: true, displayModeBar: false }

function mseLoss(pred, target) { return (pred - target) ** 2 }
function maeLoss(pred, target) { return Math.abs(pred - target) }
function bceLoss(pred, target) {
  const p = Math.max(1e-7, Math.min(1 - 1e-7, pred))
  return -(target * Math.log(p) + (1 - target) * Math.log(1 - p))
}
function hubLoss(pred, target, delta = 0.5) {
  const e = Math.abs(pred - target)
  return e <= delta ? 0.5 * e ** 2 : delta * (e - 0.5 * delta)
}

function fLoss(w) { return (w - 1) ** 2 + 0.3 * Math.sin(5 * w) }
function fGrad(w) { return 2 * (w - 1) + 1.5 * Math.cos(5 * w) }

function simulateSGD(w0 = -2, lr = 0.1, steps = 60) {
  let w = w0; const path = [w]
  for (let i = 0; i < steps; i++) { w -= lr * fGrad(w); path.push(w) }
  return path
}
function simulateMomentum(w0 = -2, lr = 0.05, steps = 60, beta = 0.9) {
  let w = w0, v = 0; const path = [w]
  for (let i = 0; i < steps; i++) { v = beta * v + (1 - beta) * fGrad(w); w -= lr * v; path.push(w) }
  return path
}
function simulateAdam(w0 = -2, lr = 0.1, steps = 60, b1 = 0.9, b2 = 0.999, eps = 1e-8) {
  let w = w0, m = 0, v = 0; const path = [w]
  for (let t = 1; t <= steps; t++) {
    const g = fGrad(w)
    m = b1 * m + (1 - b1) * g; v = b2 * v + (1 - b2) * g ** 2
    w -= lr * (m / (1 - b1 ** t)) / (Math.sqrt(v / (1 - b2 ** t)) + eps)
    path.push(w)
  }
  return path
}

export default function LossOptimizerWidget() {
  const lossRef = useRef(null)
  const optRef  = useRef(null)
  const [tab, setTab]       = useState('loss')
  const [pred, setPred]     = useState(0.5)
  const [target, setTarget] = useState(1)

  useEffect(() => {
    const preds = linspace(0.01, 0.99, 200)
    const traces = [
      { name: 'MSE',          y: preds.map(p => mseLoss(p, target)), color: '#7c3aed' },
      { name: 'MAE',          y: preds.map(p => maeLoss(p, target)), color: '#0ea5e9' },
      { name: 'BCE',          y: preds.map(p => bceLoss(p, target)), color: '#ef4444' },
      { name: 'Huber (δ=0.5)',y: preds.map(p => hubLoss(p, target)), color: '#f59e0b' },
    ].map(({ name, y, color }) => ({ x: preds, y, type: 'scatter', mode: 'lines', line: { color, width: 2.5 }, name }))

    traces.push({ x: [pred, pred], y: [0, 5], type: 'scatter', mode: 'lines', line: { color: '#64748b', width: 1.5, dash: 'dash' }, showlegend: false })

    Plotly.react(lossRef.current, traces, {
      xaxis: { title: 'Predicted ŷ', range: [0, 1] },
      yaxis: { title: 'Loss', range: [0, 5] },
      title: { text: `Loss Functions (target y=${target})`, font: { size: 13 } },
      margin: { t: 36, r: 10, b: 50, l: 55 },
      paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
      legend: { x: 0.01, y: 0.99, bgcolor: 'transparent', font: { size: 10 } },
    }, CFG)
  }, [pred, target])

  useEffect(() => {
    const ws = linspace(-3, 3, 200)
    Plotly.react(optRef.current, [
      { x: ws, y: ws.map(fLoss), type: 'scatter', mode: 'lines', line: { color: '#94a3b8', width: 2 }, name: 'Loss' },
      { x: simulateSGD(),      y: simulateSGD().map(fLoss),      type: 'scatter', mode: 'lines+markers', marker: { size: 4 }, line: { color: '#ef4444', width: 2 }, name: 'SGD' },
      { x: simulateMomentum(), y: simulateMomentum().map(fLoss), type: 'scatter', mode: 'lines+markers', marker: { size: 4 }, line: { color: '#f59e0b', width: 2 }, name: 'Momentum' },
      { x: simulateAdam(),     y: simulateAdam().map(fLoss),     type: 'scatter', mode: 'lines+markers', marker: { size: 4 }, line: { color: '#7c3aed', width: 2 }, name: 'Adam' },
    ], {
      xaxis: { title: 'weight w', range: [-3, 3] },
      yaxis: { title: 'f(w)', range: [-0.5, 12] },
      title: { text: 'Optimizer Paths on f(w) = (w−1)² + 0.3sin(5w)', font: { size: 12 } },
      margin: { t: 36, r: 10, b: 50, l: 55 },
      paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
      legend: { x: 0.55, y: 0.99, bgcolor: 'transparent', font: { size: 10 } },
    }, CFG)
  }, [])

  const tabBtn = (key, label) => (
    <button onClick={() => setTab(key)} style={{
      padding: '0.3rem 0.9rem', fontSize: '0.85rem', border: 'none', cursor: 'pointer',
      borderBottom: tab === key ? '2px solid #7c3aed' : '2px solid transparent',
      background: 'transparent', color: tab === key ? '#7c3aed' : 'var(--text)',
      fontWeight: tab === key ? 700 : 400,
    }}>{label}</button>
  )

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '0.75rem' }}>
        {tabBtn('loss', 'Loss Functions')}
        {tabBtn('opt', 'Optimizer Paths')}
      </div>

      {tab === 'loss' && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center', fontSize: '0.84rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Prediction ŷ:
            <input type="range" min="0.01" max="0.99" step="0.01" value={pred}
              onChange={e => setPred(+e.target.value)} style={{ width: 100 }} />
            <strong style={{ color: '#7c3aed' }}>{pred.toFixed(2)}</strong>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Target y:
            <select value={target} onChange={e => setTarget(+e.target.value)}
              style={{ padding: '0.15rem 0.3rem', border: '1px solid var(--border)', borderRadius: 3, background: 'var(--bg)', color: 'var(--text)', fontSize: '0.84rem' }}>
              <option value={1}>1</option>
              <option value={0}>0</option>
            </select>
          </label>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            At ŷ={pred.toFixed(2)}: MSE={mseLoss(pred,target).toFixed(3)} | BCE={bceLoss(pred,target).toFixed(3)}
          </span>
        </div>
      )}
      {tab === 'opt' && (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          All start at w=−2, minimum near w=1. Adam converges fastest despite the non-convex bumps.
        </p>
      )}

      {/* Both plots always mounted — hide inactive to avoid Plotly teardown issues */}
      <div style={{ display: tab === 'loss' ? 'block' : 'none' }}>
        <div ref={lossRef} style={{ minHeight: 340 }} />
      </div>
      <div style={{ display: tab === 'opt' ? 'block' : 'none' }}>
        <div ref={optRef} style={{ minHeight: 340 }} />
      </div>
    </div>
  )
}
