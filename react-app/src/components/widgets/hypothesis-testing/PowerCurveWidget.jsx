import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace, normalCDF, approximateNormalQuantile, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const MU0 = 500
const SIGMA = 8
const ALPHA = 0.05

function zCritical(alpha, tails) {
  return approximateNormalQuantile(1 - alpha / tails)
}

function computePower(muTrue, n) {
  const se = SIGMA / Math.sqrt(n)
  const zstar = zCritical(ALPHA, 2)
  const delta = (muTrue - MU0) / se
  const power = normalCDF(-zstar - delta) + (1 - normalCDF(zstar - delta))
  return Math.max(0, Math.min(1, power))
}

export default function PowerCurveWidget() {
  const plotRef = useRef(null)
  const [muTrue, setMuTrue] = useState(503)
  const [n, setN] = useState(50)

  useEffect(() => {
    const power = computePower(muTrue, n)
    const effect = (muTrue - MU0).toFixed(1)
    const se = SIGMA / Math.sqrt(n)
    const ncp = ((muTrue - MU0) / se).toFixed(3)

    const ns = linspace(10, 200, 191).map(Math.round)
    const powers = ns.map(ni => computePower(muTrue, ni))

    const traces = [
      {
        x: ns, y: powers,
        mode: 'lines', type: 'scatter',
        line: { color: '#2563eb', width: 2 },
        name: `Power (μ_true = ${muTrue})`,
        fill: 'tozeroy', fillcolor: 'rgba(37,99,235,0.08)',
      },
      {
        x: [n, n], y: [0, 1],
        mode: 'lines', type: 'scatter',
        line: { color: '#dc2626', width: 2, dash: 'dash' },
        name: `n = ${n} (Power = ${(power * 100).toFixed(1)}%)`,
      },
      {
        x: [10, 200], y: [0.8, 0.8],
        mode: 'lines', type: 'scatter',
        line: { color: '#16a34a', width: 1, dash: 'dot' },
        name: '0.80 target',
      },
    ]

    const layout = plotlyLayout({
      title: `Statistical Power vs Sample Size (μ_true = ${muTrue}, μ₀ = ${MU0})`,
      xaxis: { title: 'Sample size n', range: [10, 200] },
      yaxis: { title: 'Power (1 − β)', range: [0, 1.05] },
    })

    Plotly.react(plotRef.current, traces, layout, PLOTLY_CONFIG)
  }, [muTrue, n])

  const power = computePower(muTrue, n)
  const badgeStyle = { background: 'rgba(0,0,0,0.06)', borderRadius: 4, padding: '0.2rem 0.5rem', fontSize: '0.88rem' }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            True mean μ_true: <span style={{ color: '#2563eb' }}>{muTrue} g</span>
          </label>
          <input type="range" min="501" max="510" step="0.5" value={muTrue}
            onChange={e => setMuTrue(parseFloat(e.target.value))}
            style={{ width: '100%' }} />
          <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>Effect: {(muTrue - MU0).toFixed(1)} g from μ₀ = {MU0}</div>
        </div>
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Sample size n: <span style={{ color: '#dc2626' }}>{n}</span>
          </label>
          <input type="range" min="10" max="200" step="1" value={n}
            onChange={e => setN(parseInt(e.target.value))}
            style={{ width: '100%' }} />
        </div>
      </div>

      <div ref={plotRef} style={{ width: '100%', height: 300 }} />

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        <span style={badgeStyle}>Power = {(power * 100).toFixed(1)}%</span>
        <span style={badgeStyle}>Effect = {(muTrue - MU0).toFixed(1)} g</span>
        <span style={badgeStyle}>σ = {SIGMA}, α = {ALPHA}</span>
      </div>
    </div>
  )
}
