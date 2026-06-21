import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { simpleOLS, predict, mean, randn, approximateNormalQuantile } from '../utils.js'

const CFG = { responsive: true, displayModeBar: false }
const L = extra => ({ margin: { t: 35, r: 10, l: 50, b: 40 }, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', showlegend: false, ...extra })

function genData(scenario, n) {
  const x = [], y = []
  for (let i = 0; i < n; i++) {
    const xi = Math.random() * 10; x.push(xi)
    if (scenario === 'ideal') y.push(2 * xi + 3 + randn() * 2)
    else if (scenario === 'nonlinear') y.push(0.3 * xi ** 2 + 0.5 * xi + 2 + randn() * 1.5)
    else if (scenario === 'hetero') y.push(2 * xi + 3 + randn() * (0.5 + xi * 0.6))
    else if (scenario === 'outliers') {
      let err = randn() * 1.5
      if (i < 3) err = (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 5)
      y.push(2 * xi + 3 + err)
    } else y.push(2 * xi + 3 + (Math.random() < 0.1 ? randn() * 6 : randn() * 1.2))
  }
  return { x, y }
}

export default function ResidualDiagnosticsWidget() {
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)]
  const [scenario, setScenario] = useState('ideal')
  const [n, setN] = useState(80)

  function draw(sc, nn) {
    const data = genData(sc, nn)
    const ols = simpleOLS(data.x, data.y)
    const yPred = predict(data.x, ols.slope, ols.intercept)
    const resid = data.y.map((yi, i) => yi - yPred[i])
    const residStd = Math.sqrt(resid.reduce((s, r) => s + r * r, 0) / (nn - 2))
    const stdR = resid.map(r => r / residStd)

    // 1. Residuals vs Fitted
    Plotly.react(refs[0].current, [
      { x: yPred, y: resid, mode: 'markers', type: 'scatter', marker: { color: '#2563eb', size: 5, opacity: 0.7 } },
      { x: [Math.min(...yPred), Math.max(...yPred)], y: [0, 0], mode: 'lines', line: { color: '#dc2626', dash: 'dash', width: 1 } },
    ], L({ title: { text: 'Residuals vs Fitted', font: { size: 12 } }, xaxis: { title: 'Fitted' }, yaxis: { title: 'Residuals' } }), CFG)

    // 2. Q-Q plot
    const sorted = [...stdR].sort((a, b) => a - b)
    const theoretical = sorted.map((_, i) => approximateNormalQuantile((i + 0.5) / nn))
    const qMin = Math.min(...theoretical, ...sorted), qMax = Math.max(...theoretical, ...sorted)
    Plotly.react(refs[1].current, [
      { x: theoretical, y: sorted, mode: 'markers', type: 'scatter', marker: { color: '#2563eb', size: 5, opacity: 0.7 } },
      { x: [qMin, qMax], y: [qMin, qMax], mode: 'lines', line: { color: '#dc2626', width: 1.5 } },
    ], L({ title: { text: 'Normal Q-Q Plot', font: { size: 12 } }, xaxis: { title: 'Theoretical Quantiles' }, yaxis: { title: 'Sample Quantiles' } }), CFG)

    // 3. Scale-Location
    Plotly.react(refs[2].current, [
      { x: yPred, y: stdR.map(r => Math.sqrt(Math.abs(r))), mode: 'markers', type: 'scatter', marker: { color: '#2563eb', size: 5, opacity: 0.7 } },
    ], L({ title: { text: 'Scale-Location', font: { size: 12 } }, xaxis: { title: 'Fitted' }, yaxis: { title: '√|Std Residuals|' } }), CFG)

    // 4. Residuals vs Leverage
    const xMean = mean(data.x)
    const xVar = data.x.reduce((s, xi) => s + (xi - xMean) ** 2, 0)
    const lev = data.x.map(xi => 1 / nn + (xi - xMean) ** 2 / xVar)
    const cooks = stdR.map((r, i) => (r * r / 2) * (lev[i] / (1 - lev[i])))
    Plotly.react(refs[3].current, [
      { x: lev, y: stdR, mode: 'markers', type: 'scatter',
        marker: { color: cooks.map(d => d > 4 / nn ? '#dc2626' : '#2563eb'), size: 6, opacity: 0.7 },
        text: cooks.map((d, i) => `Obs ${i + 1}, Cook's D=${d.toFixed(3)}`), hoverinfo: 'text' },
    ], L({ title: { text: "Residuals vs Leverage (red = Cook's D > 4/n)", font: { size: 11 } }, xaxis: { title: 'Leverage' }, yaxis: { title: 'Std Residuals' } }), CFG)
  }

  useEffect(() => { draw(scenario, n) }, []) // eslint-disable-line

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
        <label>Scenario: <select value={scenario} onChange={e => { setScenario(e.target.value); draw(e.target.value, n) }} style={sel}>
          <option value="ideal">Ideal</option>
          <option value="nonlinear">Non-linearity</option>
          <option value="hetero">Heteroscedasticity</option>
          <option value="outliers">Outliers</option>
          <option value="heavytail">Heavy tails</option>
        </select></label>
        <label>n: <input type="range" min="30" max="200" step="10" value={n}
          onChange={e => { setN(+e.target.value); draw(scenario, +e.target.value) }} /> <strong>{n}</strong></label>
        <button onClick={() => draw(scenario, n)} style={btn}>Regenerate</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {refs.map((r, i) => <div key={i} ref={r} style={{ minHeight: 240 }} />)}
      </div>
    </div>
  )
}

const sel = { marginLeft: '0.4rem', padding: '0.2rem 0.4rem', borderRadius: 4 }
const btn = { background: '#718096', color: '#fff', border: 'none', borderRadius: 4, padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' }
