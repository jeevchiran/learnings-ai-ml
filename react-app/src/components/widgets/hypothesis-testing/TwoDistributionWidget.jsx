import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace, normalPDF, normalCDF, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

export default function TwoDistributionWidget() {
  const plotRef = useRef(null)
  const [mu1, setMu1] = useState(100)
  const [mu2, setMu2] = useState(105)
  const [sigma, setSigma] = useState(10)
  const [n, setN] = useState(30)
  const [alpha, setAlpha] = useState('0.05')
  const [tails, setTails] = useState('2')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const xMin = Math.min(mu1, mu2) - 4 * sigma
    const xMax = Math.max(mu1, mu2) + 4 * sigma
    const xs = linspace(xMin, xMax, 400)

    const y1 = xs.map(x => normalPDF((x - mu1) / sigma) / sigma)
    const y2 = xs.map(x => normalPDF((x - mu2) / sigma) / sigma)
    const yOverlap = xs.map((_, i) => Math.min(y1[i], y2[i]))

    const SE = Math.sqrt(sigma * sigma / n + sigma * sigma / n)
    const Z = (mu2 - mu1) / SE
    const alphaNum = parseFloat(alpha)
    const tailsNum = parseInt(tails)
    const pValue = tailsNum === 2 ? 2 * (1 - normalCDF(Math.abs(Z))) : 1 - normalCDF(Z)
    const d = Math.abs(mu2 - mu1) / sigma
    const reject = pValue < alphaNum

    setStats({ Z, pValue, d, reject })

    const traces = [
      {
        x: xs, y: yOverlap,
        fill: 'tozeroy', fillcolor: 'rgba(156,163,175,0.35)',
        line: { width: 0 }, mode: 'lines',
        name: 'Overlap region', hoverinfo: 'skip',
      },
      {
        x: xs, y: y1,
        mode: 'lines', line: { color: '#2563eb', width: 2.5 },
        name: `Group 1 (μ₁ = ${mu1.toFixed(1)})`,
      },
      {
        x: xs, y: y2,
        mode: 'lines', line: { color: '#ea580c', width: 2.5 },
        name: `Group 2 (μ₂ = ${mu2.toFixed(1)})`,
      },
    ]

    const layout = plotlyLayout({
      xaxis: { title: 'Value' },
      yaxis: { title: 'Density', rangemode: 'tozero' },
      title: { text: `Population distributions (σ = ${sigma.toFixed(1)})`, font: { size: 13 } },
    })

    Plotly.react(plotRef.current, traces, layout, PLOTLY_CONFIG)
  }, [mu1, mu2, sigma, n, alpha, tails])

  const badgeStyle = { background: 'rgba(0,0,0,0.06)', borderRadius: 4, padding: '0.2rem 0.5rem', fontSize: '0.88rem' }
  const decStyle = stats ? {
    display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 4, fontWeight: 700, fontSize: '0.88rem',
    background: stats.reject ? 'rgba(220,38,38,0.12)' : 'rgba(37,99,235,0.10)',
    color: stats.reject ? '#dc2626' : '#2563eb',
  } : {}

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.88rem' }}>
        <div>
          <label style={{ fontWeight: 600 }}>μ₁: <span style={{ color: '#2563eb' }}>{mu1.toFixed(1)}</span></label>
          <input type="range" min="90" max="115" step="0.5" value={mu1} onChange={e => setMu1(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>μ₂: <span style={{ color: '#ea580c' }}>{mu2.toFixed(1)}</span></label>
          <input type="range" min="90" max="115" step="0.5" value={mu2} onChange={e => setMu2(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>σ: <span style={{ color: '#374151' }}>{sigma.toFixed(1)}</span></label>
          <input type="range" min="2" max="20" step="0.5" value={sigma} onChange={e => setSigma(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>n per group: <span style={{ color: '#374151' }}>{n}</span></label>
          <input type="range" min="5" max="200" step="1" value={n} onChange={e => setN(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>α:</label><br />
          <select value={alpha} onChange={e => setAlpha(e.target.value)} style={{ padding: '0.2rem 0.4rem', borderRadius: 4, border: '1px solid #d1d5db', marginTop: '0.25rem' }}>
            <option value="0.10">0.10</option>
            <option value="0.05">0.05</option>
            <option value="0.01">0.01</option>
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Tails:</label><br />
          <select value={tails} onChange={e => setTails(e.target.value)} style={{ padding: '0.2rem 0.4rem', borderRadius: 4, border: '1px solid #d1d5db', marginTop: '0.25rem' }}>
            <option value="2">Two-tailed</option>
            <option value="1">One-tailed</option>
          </select>
        </div>
      </div>

      <div ref={plotRef} style={{ width: '100%', height: 300 }} />

      {stats && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
          <span style={badgeStyle}>Z = {stats.Z.toFixed(3)}</span>
          <span style={badgeStyle}>p = {stats.pValue < 0.0001 ? '< 0.0001' : stats.pValue.toFixed(4)}</span>
          <span style={badgeStyle}>Cohen's d = {stats.d.toFixed(3)}</span>
          <span style={decStyle}>{stats.reject ? 'Reject H₀' : 'Fail to Reject H₀'}</span>
        </div>
      )}
    </div>
  )
}
