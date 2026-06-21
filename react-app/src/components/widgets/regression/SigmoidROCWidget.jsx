import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { sigmoid, linspace, randn } from '../utils.js'

const CFG = { responsive: true, displayModeBar: false }
const BG = { paper_bgcolor: 'transparent', plot_bgcolor: 'transparent' }

function genData() {
  const x = [], y = []
  for (let i = 0; i < 50; i++) {
    const label = Math.random() > 0.5 ? 1 : 0
    x.push(label * 4 + randn() * 1.5); y.push(label)
  }
  return { x, y }
}

function genScores(quality) {
  const sep = quality === 'good' ? 2.0 : quality === 'fair' ? 1.0 : 0.0
  const s0 = [], s1 = []
  for (let i = 0; i < 100; i++) { s0.push(sigmoid(randn() * 1.2 - sep)); s1.push(sigmoid(randn() * 1.2 + sep)) }
  return { s0, s1 }
}

function computeROC(s0, s1) {
  const thresholds = linspace(0, 1, 100), tprs = [], fprs = []
  thresholds.forEach(t => {
    tprs.push(s1.filter(s => s >= t).length / s1.length)
    fprs.push(s0.filter(s => s >= t).length / s0.length)
  })
  let auc = 0
  for (let i = 1; i < fprs.length; i++) auc += (fprs[i - 1] - fprs[i]) * (tprs[i - 1] + tprs[i]) / 2
  return { thresholds, tprs, fprs, auc }
}

const DATA = genData()
const xRange = linspace(-8, 12, 200)

export default function SigmoidROCWidget() {
  const sigRef = useRef(null)
  const rocRef = useRef(null)
  const distRef = useRef(null)
  const [w, setW] = useState(1)
  const [b, setB] = useState(-2)
  const [thresh, setThresh] = useState(0.5)
  const [quality, setQuality] = useState('good')
  const [metrics, setMetrics] = useState({ acc: 0, prec: 0, recall: 0 })
  const [rocMetrics, setRocMetrics] = useState({ tpr: 0, fpr: 0, prec: 0, auc: 0 })

  function drawSigmoid(wv, bv, tv) {
    const sigY = xRange.map(x => sigmoid(wv * x + bv))
    let tp = 0, fp = 0, fn = 0, tn = 0
    DATA.x.forEach((xi, i) => {
      const p = sigmoid(wv * xi + bv), pred = p >= tv ? 1 : 0
      if (pred === 1 && DATA.y[i] === 1) tp++
      else if (pred === 1 && DATA.y[i] === 0) fp++
      else if (pred === 0 && DATA.y[i] === 1) fn++
      else tn++
    })
    const n = DATA.x.length
    const prec = tp + fp > 0 ? tp / (tp + fp) : 0
    setMetrics({ acc: ((tp + tn) / n * 100).toFixed(1), prec: (prec * 100).toFixed(1), recall: (tp + fn > 0 ? tp / (tp + fn) * 100 : 0).toFixed(1) })
    Plotly.react(sigRef.current, [
      { x: xRange, y: sigY, mode: 'lines', name: 'Sigmoid', line: { color: '#3182ce', width: 2 } },
      { x: DATA.x.filter((_, i) => DATA.y[i] === 1), y: DATA.x.filter((_, i) => DATA.y[i] === 1).map(xi => sigmoid(wv * xi + bv)), mode: 'markers', name: 'Class 1', marker: { color: '#e53e3e', size: 7 } },
      { x: DATA.x.filter((_, i) => DATA.y[i] === 0), y: DATA.x.filter((_, i) => DATA.y[i] === 0).map(xi => sigmoid(wv * xi + bv)), mode: 'markers', name: 'Class 0', marker: { color: '#3182ce', size: 7 } },
    ], { ...BG, xaxis: { title: 'x' }, yaxis: { title: 'P(y=1)', range: [-0.05, 1.05] }, shapes: [{ type: 'line', x0: xRange[0], x1: xRange[xRange.length - 1], y0: tv, y1: tv, line: { color: '#d69e2e', width: 2, dash: 'dash' } }], annotations: [{ x: 10, y: tv + 0.06, text: `Threshold=${tv.toFixed(2)}`, showarrow: false, font: { size: 11, color: '#d69e2e' } }], margin: { t: 20, r: 20, b: 45, l: 50 }, legend: { x: 0.02, y: 0.98 } }, CFG)
  }

  function drawROC(qv, tv) {
    const scores = genScores(qv)
    const roc = computeROC(scores.s0, scores.s1)
    let idx = 0, minD = Infinity
    roc.thresholds.forEach((t, i) => { if (Math.abs(t - tv) < minD) { minD = Math.abs(t - tv); idx = i } })
    const tp = scores.s1.filter(s => s >= tv).length, fp = scores.s0.filter(s => s >= tv).length
    const prec = tp + fp > 0 ? tp / (tp + fp) : 0
    setRocMetrics({ tpr: roc.tprs[idx].toFixed(3), fpr: roc.fprs[idx].toFixed(3), prec: prec.toFixed(3), auc: roc.auc.toFixed(3) })
    Plotly.react(rocRef.current, [
      { x: roc.fprs, y: roc.tprs, mode: 'lines', name: 'ROC', line: { color: '#3182ce', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(49,130,206,0.1)' },
      { x: [0, 1], y: [0, 1], mode: 'lines', name: 'Random', line: { color: '#999', dash: 'dash', width: 1 } },
      { x: [roc.fprs[idx]], y: [roc.tprs[idx]], mode: 'markers', name: 'Threshold', marker: { color: '#e53e3e', size: 12 } },
    ], { ...BG, xaxis: { title: 'FPR', range: [0, 1] }, yaxis: { title: 'TPR', range: [0, 1] }, title: { text: `ROC (AUC=${roc.auc.toFixed(3)})`, font: { size: 12 } }, margin: { t: 40, r: 10, b: 45, l: 50 }, legend: { x: 0.5, y: 0.1 } }, CFG)
    Plotly.react(distRef.current, [
      { x: scores.s0, type: 'histogram', name: 'Class 0', opacity: 0.6, marker: { color: '#3182ce' }, histnorm: 'probability', xbins: { size: 0.05 } },
      { x: scores.s1, type: 'histogram', name: 'Class 1', opacity: 0.6, marker: { color: '#e53e3e' }, histnorm: 'probability', xbins: { size: 0.05 } },
    ], { ...BG, barmode: 'overlay', title: { text: 'Score Distributions', font: { size: 12 } }, xaxis: { title: 'Predicted Probability', range: [0, 1] }, yaxis: { title: 'Frequency' }, shapes: [{ type: 'line', x0: tv, x1: tv, y0: 0, y1: 1, yref: 'paper', line: { color: '#d69e2e', width: 2, dash: 'dash' } }], margin: { t: 40, r: 10, b: 45, l: 50 } }, CFG)
  }

  useEffect(() => { drawSigmoid(w, b, thresh); drawROC(quality, thresh) }, []) // eslint-disable-line

  const sl = { marginLeft: '0.4rem', padding: '0.2rem 0.4rem', borderRadius: 4 }

  return (
    <div>
      <h4 style={{ marginBottom: '0.5rem' }}>Sigmoid Explorer</h4>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label>Weight: <input type="range" min="-3" max="3" step="0.1" value={w} onChange={e => { setW(+e.target.value); drawSigmoid(+e.target.value, b, thresh) }} /> <strong>{w.toFixed(1)}</strong></label>
        <label>Bias: <input type="range" min="-6" max="6" step="0.1" value={b} onChange={e => { setB(+e.target.value); drawSigmoid(w, +e.target.value, thresh) }} /> <strong>{b.toFixed(1)}</strong></label>
        <label>Threshold: <input type="range" min="0.05" max="0.95" step="0.01" value={thresh} onChange={e => { setThresh(+e.target.value); drawSigmoid(w, b, +e.target.value); drawROC(quality, +e.target.value) }} /> <strong>{thresh.toFixed(2)}</strong></label>
      </div>
      <div style={{ fontSize: '0.88rem', marginBottom: '0.5rem', display: 'flex', gap: '1.5rem' }}>
        <span>Accuracy: <strong>{metrics.acc}%</strong></span>
        <span>Precision: <strong>{metrics.prec}%</strong></span>
        <span>Recall: <strong>{metrics.recall}%</strong></span>
      </div>
      <div ref={sigRef} style={{ minHeight: 280, marginBottom: '1.5rem' }} />
      <h4 style={{ marginBottom: '0.5rem' }}>ROC Curve</h4>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label>Quality: <select value={quality} onChange={e => { setQuality(e.target.value); drawROC(e.target.value, thresh) }} style={sl}>
          <option value="good">Good classifier</option>
          <option value="fair">Fair classifier</option>
          <option value="random">Random classifier</option>
        </select></label>
      </div>
      <div style={{ fontSize: '0.88rem', marginBottom: '0.5rem', display: 'flex', gap: '1.5rem' }}>
        <span>TPR: <strong>{rocMetrics.tpr}</strong></span>
        <span>FPR: <strong>{rocMetrics.fpr}</strong></span>
        <span>Precision: <strong>{rocMetrics.prec}</strong></span>
        <span>AUC: <strong>{rocMetrics.auc}</strong></span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div ref={rocRef} style={{ minHeight: 280 }} />
        <div ref={distRef} style={{ minHeight: 280 }} />
      </div>
    </div>
  )
}
