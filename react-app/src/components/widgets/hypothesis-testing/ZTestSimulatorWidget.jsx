import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace, normalPDF, normalCDF, approximateNormalQuantile, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

function zCritical(alpha, tails) {
  return approximateNormalQuantile(1 - alpha / tails)
}

function compute(mu0, xbar, sigma, n, tails, alpha) {
  const se = sigma / Math.sqrt(n)
  const zobs = (xbar - mu0) / se
  let pval, zstar
  if (tails === '2') {
    pval = 2 * normalCDF(-Math.abs(zobs))
    zstar = zCritical(alpha, 2)
  } else if (tails === '1L') {
    pval = normalCDF(zobs)
    zstar = -zCritical(alpha, 1)
  } else {
    pval = 1 - normalCDF(zobs)
    zstar = zCritical(alpha, 1)
  }
  return { se, zobs, pval, zstar }
}

function buildTraces(d) {
  const xs = linspace(-4, 4, 300)
  const ys = xs.map(normalPDF)

  function fillTrace(xArr, yArr, color, name, showLegend = true) {
    const xFill = [...xArr, xArr[xArr.length - 1], xArr[0]]
    const yFill = [...yArr, 0, 0]
    return { x: xFill, y: yFill, fill: 'toself', fillcolor: color, line: { width: 0 }, mode: 'lines', type: 'scatter', name, showlegend: showLegend, opacity: 0.85 }
  }

  const traces = []
  const zs = Math.abs(d.zstar)

  if (d.tails === '2') {
    const rl = linspace(-4, -zs, 80)
    const rr = linspace(zs, 4, 80)
    traces.push(fillTrace(rl, rl.map(normalPDF), '#fee2e2', 'Rejection region'))
    traces.push(fillTrace(rr, rr.map(normalPDF), '#fee2e2', 'Rejection region', false))
    const cl = Math.abs(d.zobs)
    if (cl <= 4) {
      const pvl = linspace(-4, -cl, 80)
      const pvr = linspace(cl, 4, 80)
      traces.push(fillTrace(pvl, pvl.map(normalPDF), '#ef4444', 'p-value area'))
      traces.push(fillTrace(pvr, pvr.map(normalPDF), '#ef4444', 'p-value area', false))
    }
  } else if (d.tails === '1L') {
    const rl = linspace(-4, d.zstar, 80)
    traces.push(fillTrace(rl, rl.map(normalPDF), '#fee2e2', 'Rejection region'))
    const cut = Math.min(d.zobs, 4)
    const pvl = linspace(-4, cut, 80)
    traces.push(fillTrace(pvl, pvl.map(normalPDF), '#ef4444', 'p-value area'))
  } else {
    const rr = linspace(d.zstar, 4, 80)
    traces.push(fillTrace(rr, rr.map(normalPDF), '#fee2e2', 'Rejection region'))
    const cut = Math.max(d.zobs, -4)
    const pvr = linspace(cut, 4, 80)
    traces.push(fillTrace(pvr, pvr.map(normalPDF), '#ef4444', 'p-value area'))
  }

  traces.push({ x: xs, y: ys, mode: 'lines', type: 'scatter', line: { color: '#2563eb', width: 2 }, name: 'N(0,1)' })
  const zClamp = Math.max(-4, Math.min(4, d.zobs))
  traces.push({ x: [zClamp, zClamp], y: [0, normalPDF(0) * 1.05], mode: 'lines', type: 'scatter', line: { color: '#dc2626', width: 2, dash: 'dash' }, name: `z₀bs = ${d.zobs.toFixed(3)}` })
  return traces
}

export default function ZTestSimulatorWidget() {
  const plotRef = useRef(null)
  const [mu0, setMu0] = useState(500)
  const [xbar, setXbar] = useState(497)
  const [sigma, setSigma] = useState(8)
  const [n, setN] = useState(40)
  const [tails, setTails] = useState('2')
  const [alpha, setAlpha] = useState('0.05')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const d = compute(mu0, xbar, sigma, n, tails, parseFloat(alpha))
    setStats(d)
    const traces = buildTraces({ ...d, tails })
    const layout = plotlyLayout({
      title: `Standard Normal — Test of μ₀ = ${mu0}`,
      xaxis: { title: 'Z', range: [-4.2, 4.2] },
      yaxis: { title: 'Density', range: [0, 0.42] },
    })
    Plotly.react(plotRef.current, traces, layout, PLOTLY_CONFIG)
  }, [mu0, xbar, sigma, n, tails, alpha])

  const alphaNum = parseFloat(alpha)
  const rejected = stats
    ? tails === '2' ? Math.abs(stats.zobs) > Math.abs(stats.zstar)
      : tails === '1L' ? stats.zobs < stats.zstar
      : stats.zobs > stats.zstar
    : false

  const rowStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.88rem' }
  const badgeStyle = { background: 'rgba(0,0,0,0.06)', borderRadius: 4, padding: '0.2rem 0.5rem', fontSize: '0.88rem' }
  const decStyle = { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 4, fontWeight: 700, fontSize: '0.88rem', background: rejected ? 'rgba(220,38,38,0.12)' : 'rgba(37,99,235,0.10)', color: rejected ? '#dc2626' : '#2563eb' }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={rowStyle}>
        <div>
          <label style={{ fontWeight: 600 }}>μ₀ (null): <span style={{ color: '#2563eb' }}>{mu0}</span></label>
          <input type="range" min="480" max="520" step="1" value={mu0} onChange={e => setMu0(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>x̄ (sample mean): <span style={{ color: '#2563eb' }}>{xbar}</span></label>
          <input type="range" min="480" max="520" step="0.5" value={xbar} onChange={e => setXbar(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>σ (pop. std): <span style={{ color: '#2563eb' }}>{sigma}</span></label>
          <input type="range" min="1" max="20" step="0.5" value={sigma} onChange={e => setSigma(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>n (sample size): <span style={{ color: '#2563eb' }}>{n}</span></label>
          <input type="range" min="10" max="200" step="1" value={n} onChange={e => setN(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Test type:</label><br />
          <select value={tails} onChange={e => setTails(e.target.value)} style={{ padding: '0.2rem 0.4rem', borderRadius: 4, border: '1px solid #d1d5db', marginTop: '0.25rem' }}>
            <option value="2">Two-tailed</option>
            <option value="1L">Left-tailed</option>
            <option value="1R">Right-tailed</option>
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>α:</label><br />
          <select value={alpha} onChange={e => setAlpha(e.target.value)} style={{ padding: '0.2rem 0.4rem', borderRadius: 4, border: '1px solid #d1d5db', marginTop: '0.25rem' }}>
            <option value="0.10">0.10</option>
            <option value="0.05">0.05</option>
            <option value="0.01">0.01</option>
          </select>
        </div>
      </div>

      <div ref={plotRef} style={{ width: '100%', height: 300 }} />

      {stats && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
          <span style={badgeStyle}>Z = {stats.zobs.toFixed(3)}</span>
          <span style={badgeStyle}>SE = {stats.se.toFixed(3)}</span>
          <span style={badgeStyle}>p = {stats.pval.toFixed(4)}</span>
          <span style={badgeStyle}>z* = {Math.abs(stats.zstar).toFixed(3)}</span>
          <span style={decStyle}>{rejected ? 'Reject H₀' : 'Fail to Reject H₀'}</span>
        </div>
      )}
    </div>
  )
}
