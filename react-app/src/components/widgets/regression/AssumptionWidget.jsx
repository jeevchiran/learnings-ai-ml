import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { simpleOLS, predict, randn } from '../utils.js'

const CFG = { responsive: true, displayModeBar: false }
const LAYOUT = extra => ({
  margin: { t: 40, r: 10, b: 45, l: 50 },
  paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
  showlegend: false, ...extra,
})

function generateScenario(type) {
  const n = 60
  const x = [], y = []
  for (let i = 0; i < n; i++) {
    const xi = Math.random() * 10
    x.push(xi)
    if (type === 'good') y.push(2 * xi + 3 + randn() * 2)
    else if (type === 'heteroscedastic') y.push(2 * xi + 3 + randn() * (0.5 + xi * 0.8))
    else if (type === 'nonlinear') y.push(0.5 * xi * xi - 2 * xi + 5 + randn() * 2)
    else y.push(2 * xi + 3 + ((Math.random() < 0.1) ? randn() * 12 : randn() * 1.5))
  }
  return { x, y }
}

export default function AssumptionWidget() {
  const scatterRef = useRef(null)
  const residRef = useRef(null)
  const [scenario, setScenario] = useState('good')

  function plot(type) {
    const data = generateScenario(type)
    const ols = simpleOLS(data.x, data.y)
    const yPred = predict(data.x, ols.slope, ols.intercept)
    const residuals = data.y.map((yi, i) => yi - yPred[i])

    Plotly.react(scatterRef.current, [
      { x: data.x, y: data.y, mode: 'markers', type: 'scatter',
        marker: { color: '#3182ce', size: 6 } },
      { x: [0, 10], y: [ols.intercept, ols.slope * 10 + ols.intercept], mode: 'lines',
        line: { color: '#e53e3e', width: 2 } },
    ], LAYOUT({ title: { text: 'Data + Fitted Line', font: { size: 13 } }, xaxis: { title: 'x' }, yaxis: { title: 'y' } }), CFG)

    Plotly.react(residRef.current, [
      { x: yPred, y: residuals, mode: 'markers', type: 'scatter',
        marker: { color: '#38a169', size: 6 } },
      { x: [Math.min(...yPred), Math.max(...yPred)], y: [0, 0], mode: 'lines',
        line: { color: '#999', dash: 'dash', width: 1 } },
    ], LAYOUT({ title: { text: 'Residuals vs Fitted', font: { size: 13 } }, xaxis: { title: 'Fitted values' }, yaxis: { title: 'Residuals' } }), CFG)
  }

  useEffect(() => { plot(scenario) }, []) // eslint-disable-line

  function change(e) { setScenario(e.target.value); plot(e.target.value) }

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <label>Scenario: <select value={scenario} onChange={change} style={selStyle}>
          <option value="good">All assumptions met</option>
          <option value="heteroscedastic">Heteroscedasticity</option>
          <option value="nonlinear">Non-linearity</option>
          <option value="nonnormal">Non-normal errors</option>
        </select></label>
        <button onClick={() => plot(scenario)} style={btnStyle}>Regenerate</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div ref={scatterRef} style={{ minHeight: 280 }} />
        <div ref={residRef} style={{ minHeight: 280 }} />
      </div>
    </div>
  )
}

const selStyle = { marginLeft: '0.4rem', padding: '0.2rem 0.4rem', borderRadius: 4 }
const btnStyle = { background: '#718096', color: '#fff', border: 'none', borderRadius: 4, padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' }
