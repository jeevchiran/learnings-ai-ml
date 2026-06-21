import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

// ── RF Simulation: Mathematical model ────────────────────────────────────────
const RF_P = 10
const RF_BASE_ERROR = 0.10
const RF_SIGMA2 = 0.18

function rfCorrelation(m, p) { return 0.15 + 0.70 * (m / p) }

function rfSigma2(m, p, maxDepthVal, minLeaf) {
  const featFactor = 0.8 + 0.4 * (1 - m / p)
  const depthFactor = maxDepthVal >= 20 ? 1.0 : (0.5 + 0.5 * (maxDepthVal / 20))
  const leafFactor = 1.0 - 0.4 * Math.min(1, (minLeaf - 1) / 19)
  return RF_SIGMA2 * featFactor * depthFactor * leafFactor
}

function rfBias2(m, p, maxDepthVal, minLeaf) {
  const featBias = 0.02 + 0.04 * (1 - m / p) * (1 - m / p)
  const depthBias = maxDepthVal >= 20 ? 0.0 : (0.04 * (1 - maxDepthVal / 20))
  const leafBias = 0.01 * Math.min(1, (minLeaf - 1) / 10)
  return RF_BASE_ERROR + featBias + depthBias + leafBias
}

function simulateRFOOBError(B, rho, sigma2) { return rho * sigma2 + (1 - rho) * sigma2 / B }
function simulateRFTrainError(B, bias2, rho, sigma2) {
  const ensVar = rho * sigma2 + (1 - rho) * sigma2 / B
  const overfit = 0.06 * Math.exp(-B / 50)
  return Math.max(0.01, bias2 * 0.4 + overfit)
}

// ── Early stopping simulation ─────────────────────────────────────────────────
const ES_M_MAX = 200, ES_RATE = 0.03, ES_OVERFIT = 0.0006
function trainMSEFn(m) { return 0.02 + 0.30 * Math.exp(-ES_RATE * m) }
function valMSEFn(m) { return 0.08 + 0.25 * Math.exp(-ES_RATE * m) + ES_OVERFIT * Math.pow(m / 200, 1.5) * m }

function findEarlyStopping(patience) {
  let bestLoss = Infinity, bestM = 1, noImprove = 0, stopM = ES_M_MAX
  for (let m = 1; m <= ES_M_MAX; m++) {
    const loss = valMSEFn(m)
    if (loss < bestLoss - 1e-6) { bestLoss = loss; bestM = m; noImprove = 0 }
    else noImprove++
    if (noImprove >= patience) { stopM = m; break }
  }
  return { mStar: bestM, mStop: stopM, bestLoss, stopLoss: valMSEFn(stopM) }
}

// ── RF Widget ────────────────────────────────────────────────────────────────
function RFWidget() {
  const oobRef = useRef(null)
  const featRef = useRef(null)
  const [nTrees, setNTrees] = useState(100)
  const [maxFeat, setMaxFeat] = useState(3)
  const [maxDepth, setMaxDepth] = useState(22)
  const [minLeaf, setMinLeaf] = useState(1)
  const [rfStats, setRFStats] = useState({ train: '—', oob: '—', bias: '—', variance: '—' })

  useEffect(() => {
    Plotly.newPlot(oobRef.current, [], plotlyLayout({ margin: { t: 40, r: 20, b: 50, l: 60 } }), PLOTLY_CONFIG)
    Plotly.newPlot(featRef.current, [], plotlyLayout({ margin: { t: 40, r: 20, b: 50, l: 60 } }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => {
    const isNone = maxDepth >= 21
    const depthVal = isNone ? 20 : maxDepth
    const rho = rfCorrelation(maxFeat, RF_P)
    const sigma2 = rfSigma2(maxFeat, RF_P, depthVal, minLeaf)
    const bias2 = rfBias2(maxFeat, RF_P, depthVal, minLeaf)
    const varComp = simulateRFOOBError(nTrees, rho, sigma2)
    const oobErr = bias2 + varComp
    const trainErr = simulateRFTrainError(nTrees, bias2, rho, sigma2)

    setRFStats({
      train: (trainErr * 100).toFixed(1) + '%',
      oob: (oobErr * 100).toFixed(1) + '%',
      bias: (bias2 * 100).toFixed(1) + '%',
      variance: (varComp * 100).toFixed(1) + '%',
    })

    // OOB vs n_estimators
    const bVals = Array.from({ length: 30 }, (_, i) => (i + 1) * 10)
    const oobCurve = bVals.map(B => bias2 + simulateRFOOBError(B, rho, sigma2))
    Plotly.react(oobRef.current, [
      { x: bVals, y: oobCurve, type: 'scatter', mode: 'lines', name: 'OOB Error', line: { color: '#dc2626', width: 2 } },
      { x: [nTrees], y: [oobErr], type: 'scatter', mode: 'markers', name: 'Current B', marker: { color: '#2563eb', size: 10 } },
    ], plotlyLayout({
      title: { text: 'OOB Error vs n_estimators', font: { size: 13 } },
      xaxis: { title: 'n_estimators (B)' },
      yaxis: { title: 'OOB Error', tickformat: '.0%' },
      legend: { orientation: 'h', y: 1.08 },
      margin: { t: 40, r: 20, b: 50, l: 60 },
    }), PLOTLY_CONFIG)

    // OOB vs max_features
    const mVals = Array.from({ length: RF_P }, (_, i) => i + 1)
    const featCurve = mVals.map(mf => {
      const r = rfCorrelation(mf, RF_P)
      const s2 = rfSigma2(mf, RF_P, depthVal, minLeaf)
      const b2 = rfBias2(mf, RF_P, depthVal, minLeaf)
      return b2 + simulateRFOOBError(nTrees, r, s2)
    })
    const sqrtM = Math.round(Math.sqrt(RF_P))
    Plotly.react(featRef.current, [
      { x: mVals, y: featCurve, type: 'scatter', mode: 'lines', name: 'OOB Error', line: { color: '#dc2626', width: 2 } },
      { x: [maxFeat], y: [featCurve[maxFeat - 1]], type: 'scatter', mode: 'markers', name: 'Current m', marker: { color: '#2563eb', size: 10 } },
      { x: [sqrtM], y: [featCurve[sqrtM - 1]], type: 'scatter', mode: 'markers', name: 'sqrt(p) default', marker: { color: '#16a34a', size: 8, symbol: 'diamond' } },
    ], plotlyLayout({
      title: { text: 'OOB Error vs max_features (m)', font: { size: 13 } },
      xaxis: { title: 'max_features (m)', dtick: 1 },
      yaxis: { title: 'OOB Error', tickformat: '.0%' },
      legend: { orientation: 'h', y: 1.08 },
      margin: { t: 40, r: 20, b: 50, l: 60 },
    }), PLOTLY_CONFIG)
  }, [nTrees, maxFeat, maxDepth, minLeaf])

  const sliderRow = (label, val, min, max, setter, display) => (
    <label key={label} style={{ flex: '1 1 200px' }}>
      <span style={{ fontWeight: 600 }}>{label}: </span><span>{display ?? val}</span>
      <input type="range" min={min} max={max} value={val} onChange={e => setter(+e.target.value)} style={{ display: 'block', width: '100%' }} />
    </label>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {sliderRow('n_estimators', nTrees, 10, 300, setNTrees)}
        {sliderRow('max_features', maxFeat, 1, RF_P, setMaxFeat)}
        {sliderRow('max_depth', maxDepth, 2, 22, setMaxDepth, maxDepth >= 21 ? 'None' : maxDepth)}
        {sliderRow('min_samples_leaf', minLeaf, 1, 20, setMinLeaf)}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {[['Train Error', rfStats.train], ['OOB Error', rfStats.oob], ['Bias²', rfStats.bias], ['Variance', rfStats.variance]].map(([l, v]) => (
          <div key={l} style={{ background: 'var(--bg-secondary, #f3f4f6)', borderRadius: 8, padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}>
            <div style={{ color: 'var(--text-muted, #6b7280)' }}>{l}</div>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      <div ref={oobRef} />
      <div ref={featRef} />
    </div>
  )
}

// ── GB Heatmap ────────────────────────────────────────────────────────────────
function GBHeatmapWidget() {
  const heatRef = useRef(null)
  const esRef = useRef(null)
  const esInteractRef = useRef(null)
  const [patience, setPatience] = useState(10)
  const [esStats, setESStats] = useState({ mStar: 0, mStop: 0, bestLoss: 0, stopLoss: 0 })

  useEffect(() => {
    // GB Heatmap
    const GB_OPT = 30
    const etaVals = [0.01, 0.05, 0.1, 0.2, 0.5, 1.0]
    const mVals = [10, 25, 50, 100, 200, 500]
    const heatZ = etaVals.map(eta => mVals.map(M => {
      const budget = eta * M
      const dist = Math.abs(budget - GB_OPT) / GB_OPT
      const overfit = eta > 0.3 ? (M / 500) * 0.04 : 0
      return 0.08 + 0.10 * dist * dist + overfit
    }))

    Plotly.newPlot(heatRef.current, [{
      type: 'heatmap',
      x: mVals.map(String),
      y: etaVals.map(String),
      z: heatZ,
      text: heatZ.map(row => row.map(v => v.toFixed(3))),
      texttemplate: '%{text}',
      colorscale: 'RdYlGn',
      reversescale: true,
      showscale: true,
      colorbar: { title: 'Val MSE', thickness: 14, len: 0.8 },
      zmin: 0.07, zmax: 0.25,
      hovertemplate: 'n_estimators=%{x}<br>learning_rate=%{y}<br>Val MSE=%{z:.3f}<extra></extra>',
    }], plotlyLayout({
      title: { text: 'Simulated Validation MSE: learning_rate × n_estimators', font: { size: 13 } },
      xaxis: { title: 'n_estimators (M)', type: 'category' },
      yaxis: { title: 'learning_rate (η)', type: 'category' },
      margin: { t: 50, r: 100, b: 60, l: 80 },
      annotations: [{ x: '100', y: '0.1', text: 'Optimal region', showarrow: true, arrowhead: 2, ax: 40, ay: -40, font: { size: 11 } }],
    }), PLOTLY_CONFIG)

    // Static early stop chart
    const ms = Array.from({ length: ES_M_MAX }, (_, i) => i + 1)
    const result10 = findEarlyStopping(10)
    Plotly.newPlot(esRef.current, [
      { x: ms, y: ms.map(trainMSEFn), mode: 'lines', name: 'Training MSE', line: { color: '#2563eb', width: 2 } },
      { x: ms, y: ms.map(valMSEFn), mode: 'lines', name: 'Validation MSE', line: { color: '#dc2626', width: 2 } },
      { x: [result10.mStar], y: [result10.bestLoss], mode: 'markers', name: 'Optimal M*', marker: { color: '#16a34a', size: 10, symbol: 'star' } },
    ], plotlyLayout({
      title: { text: 'Training vs Validation Loss Curve', font: { size: 13 } },
      xaxis: { title: 'Boosting Iteration (m)' },
      yaxis: { title: 'MSE' },
      legend: { orientation: 'h', y: 1.12 },
      shapes: [{ type: 'line', x0: result10.mStar, x1: result10.mStar, y0: 0, y1: 0.35, line: { color: '#16a34a', width: 2, dash: 'dash' } }],
      margin: { t: 50, r: 20, b: 50, l: 60 },
    }), PLOTLY_CONFIG)

    Plotly.newPlot(esInteractRef.current, [], plotlyLayout({ margin: { t: 50, r: 20, b: 50, l: 60 } }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => {
    const ms = Array.from({ length: ES_M_MAX }, (_, i) => i + 1)
    const result = findEarlyStopping(patience)
    setESStats(result)
    Plotly.react(esInteractRef.current, [
      { x: ms, y: ms.map(trainMSEFn), mode: 'lines', name: 'Training MSE', line: { color: '#2563eb', width: 2 } },
      { x: ms, y: ms.map(valMSEFn), mode: 'lines', name: 'Validation MSE', line: { color: '#dc2626', width: 2 } },
      { x: [result.mStar], y: [result.bestLoss], mode: 'markers', name: 'Optimal M*', marker: { color: '#16a34a', size: 11, symbol: 'star' } },
      { x: [result.mStop], y: [result.stopLoss], mode: 'markers', name: 'Early stop', marker: { color: '#d97706', size: 9, symbol: 'x' } },
    ], plotlyLayout({
      title: { text: `Early Stopping: patience = ${patience}`, font: { size: 13 } },
      xaxis: { title: 'Boosting Iteration (m)' },
      yaxis: { title: 'MSE' },
      legend: { orientation: 'h', y: 1.12 },
      shapes: [
        { type: 'line', x0: result.mStar, x1: result.mStar, y0: 0, y1: 0.35, line: { color: '#16a34a', width: 2, dash: 'dash' } },
        { type: 'line', x0: result.mStop, x1: result.mStop, y0: 0, y1: 0.35, line: { color: '#d97706', width: 1.5, dash: 'dot' } },
      ],
      margin: { t: 50, r: 20, b: 50, l: 60 },
    }), PLOTLY_CONFIG)
  }, [patience])

  return (
    <div>
      <h4 style={{ margin: '0 0 0.5rem' }}>Learning Rate × n_estimators Heatmap</h4>
      <div ref={heatRef} />
      <h4 style={{ margin: '1.5rem 0 0.5rem' }}>Early Stopping</h4>
      <div ref={esRef} />
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '0.75rem 0', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600 }}>Patience: <span>{patience}</span>
          <input type="range" min={1} max={50} value={patience} onChange={e => setPatience(+e.target.value)} style={{ display: 'block', minWidth: 160 }} />
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[['M*', esStats.mStar], ['Best Val Loss', esStats.bestLoss?.toFixed(4)], ['Stop M', esStats.mStop], ['Stop Loss', esStats.stopLoss?.toFixed(4)]].map(([l, v]) => (
            <div key={l} style={{ background: 'var(--bg-secondary, #f3f4f6)', borderRadius: 8, padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}>
              <div style={{ color: 'var(--text-muted, #6b7280)' }}>{l}</div>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
      </div>
      <div ref={esInteractRef} />
    </div>
  )
}

export default function HyperparameterWidget() {
  const [tab, setTab] = useState(0)
  const tabs = ['Random Forest', 'Gradient Boosting']
  const tabStyle = active => ({
    padding: '0.4rem 0.9rem', borderRadius: 6, border: 'none', cursor: 'pointer',
    background: active ? '#2563eb' : 'var(--bg-secondary, #e5e7eb)',
    color: active ? '#fff' : 'inherit', fontWeight: active ? 700 : 400,
  })
  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {tabs.map((t, i) => <button key={t} style={tabStyle(tab === i)} onClick={() => setTab(i)}>{t}</button>)}
      </div>
      {tab === 0 && <RFWidget />}
      {tab === 1 && <GBHeatmapWidget />}
    </div>
  )
}
