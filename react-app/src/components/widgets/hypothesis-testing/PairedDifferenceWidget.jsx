import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { mean, randn, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

// Sample standard deviation (Bessel-corrected)
function stddev(arr) {
  const m = mean(arr)
  const variance = arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1)
  return Math.sqrt(variance)
}

// Regularized incomplete beta function via continued fraction (Lentz)
function betainc(x, a, b) {
  if (x < 0 || x > 1) return 0
  if (x === 0) return 0
  if (x === 1) return 1
  // Use symmetry for x > (a+1)/(a+b+2)
  const logBeta = lgamma(a) + lgamma(b) - lgamma(a + b)
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - logBeta) / a
  return front * cf(x, a, b)
}

function lgamma(z) {
  // Lanczos approximation
  const g = 7
  const p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z)
  z -= 1
  let x = p[0]
  for (let i = 1; i < g + 2; i++) x += p[i] / (z + i)
  const t = z + g + 0.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
}

function cf(x, a, b) {
  // Continued fraction expansion (modified Lentz)
  const TINY = 1e-30, MAX_ITER = 200, EPS = 1e-8
  let f = TINY, C = f, D = 0
  for (let m = 0; m <= MAX_ITER; m++) {
    let d
    if (m === 0) {
      d = 1
    } else {
      const m2 = 2 * m
      d = m * (b - m) * x / ((a + m2 - 1) * (a + m2))
      C = 1 + d / C; if (Math.abs(C) < TINY) C = TINY
      D = 1 / (1 + d * D); if (Math.abs(D) < TINY) D = TINY
      f *= C * D
      d = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1))
    }
    if (m > 0) {
      C = 1 + d / C; if (Math.abs(C) < TINY) C = TINY
      D = 1 / (1 + d * D); if (Math.abs(D) < TINY) D = TINY
      const delta = C * D
      f *= delta
      if (Math.abs(delta - 1) < EPS) break
    }
  }
  return f
}

// CDF of t distribution with df degrees of freedom
function tCDF(t, df) {
  const x = df / (df + t * t)
  const ib = betainc(x, df / 2, 0.5)
  return t > 0 ? 1 - 0.5 * ib : 0.5 * ib
}

function generateData(n, mu, sigma) {
  const before = [], after = [], diffs = []
  for (let i = 0; i < n; i++) {
    const b = 130 + 15 * randn()
    const d = mu + sigma * randn()
    const a = b - d
    before.push(b)
    after.push(a)
    diffs.push(d)
  }
  return { before, after, diffs, n }
}

export default function PairedDifferenceWidget() {
  const scatterRef = useRef(null)
  const histRef = useRef(null)
  const [nPairs, setNPairs] = useState(20)
  const [mu, setMu] = useState(5)
  const [sigma, setSigma] = useState(3)
  const [stats, setStats] = useState(null)
  const dataRef = useRef(null)

  const render = useCallback((data) => {
    const { before, after, diffs, n } = data
    const dbar = mean(diffs)
    const sd = stddev(diffs)
    const se = sd / Math.sqrt(n)
    const tStat = dbar / se
    const df = n - 1
    const pval = 2 * Math.min(tCDF(tStat, df), 1 - tCDF(tStat, df))
    setStats({ dbar, sd, se, tStat, df, pval })

    // Scatter plot: before vs after per subject
    const scatterTraces = before.map((b, i) => {
      const d = before[i] - after[i]
      const color = d > 0.5 ? '#16a34a' : d < -0.5 ? '#dc2626' : '#9ca3af'
      return {
        x: [0, 1], y: [b, after[i]],
        mode: 'lines+markers', line: { color, width: 1.5 }, marker: { color, size: 6 },
        showlegend: false, hovertemplate: `Subject ${i + 1}<br>Before: %{y:.1f}<extra></extra>`,
      }
    })
    scatterTraces.push(
      { x: [null], y: [null], mode: 'lines+markers', line: { color: '#16a34a' }, marker: { color: '#16a34a' }, name: 'BP decreased', showlegend: true },
      { x: [null], y: [null], mode: 'lines+markers', line: { color: '#dc2626' }, marker: { color: '#dc2626' }, name: 'BP increased', showlegend: true },
      { x: [null], y: [null], mode: 'lines+markers', line: { color: '#9ca3af' }, marker: { color: '#9ca3af' }, name: 'Near zero', showlegend: true }
    )

    Plotly.react(scatterRef.current, scatterTraces, plotlyLayout({
      title: { text: 'Before vs After (per subject)', font: { size: 13 } },
      xaxis: { tickvals: [0, 1], ticktext: ['Before', 'After'], range: [-0.3, 1.3] },
      yaxis: { title: 'Systolic BP (mmHg)' },
      legend: { x: 0.01, y: 0.01 },
    }), PLOTLY_CONFIG)

    // Histogram of differences
    Plotly.react(histRef.current, [
      { x: diffs, type: 'histogram', name: 'Differences', marker: { color: 'rgba(59,130,246,0.6)', line: { color: 'rgba(59,130,246,1)', width: 1 } } },
      { x: [dbar, dbar], y: [0, n], mode: 'lines', name: `d̄ = ${dbar.toFixed(2)}`, line: { color: '#f59e0b', width: 2, dash: 'dash' } },
    ], plotlyLayout({
      title: { text: 'Distribution of Differences', font: { size: 13 } },
      xaxis: { title: 'Difference dᵢ (Before − After)' },
      yaxis: { title: 'Count' },
      legend: { x: 0.01, y: 0.99 },
    }), PLOTLY_CONFIG)
  }, [])

  const refresh = useCallback(() => {
    dataRef.current = generateData(nPairs, mu, sigma)
    render(dataRef.current)
  }, [nPairs, mu, sigma, render])

  useEffect(() => { refresh() }, [refresh])

  const reject = stats && stats.pval < 0.05
  const badgeStyle = { background: 'rgba(0,0,0,0.06)', borderRadius: 4, padding: '0.2rem 0.5rem', fontSize: '0.85rem' }
  const decStyle = {
    display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 4, fontWeight: 700, fontSize: '0.85rem',
    background: reject ? 'rgba(220,38,38,0.12)' : 'rgba(37,99,235,0.10)',
    color: reject ? '#dc2626' : '#2563eb',
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.88rem' }}>
        <div>
          <label style={{ fontWeight: 600 }}>n (pairs): <span style={{ color: '#2563eb' }}>{nPairs}</span></label>
          <input type="range" min="5" max="50" step="1" value={nPairs} onChange={e => setNPairs(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>True mean diff μ_d: <span style={{ color: '#2563eb' }}>{mu}</span></label>
          <input type="range" min="-10" max="15" step="0.5" value={mu} onChange={e => setMu(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>σ_d (variability): <span style={{ color: '#2563eb' }}>{sigma}</span></label>
          <input type="range" min="1" max="12" step="0.5" value={sigma} onChange={e => setSigma(+e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div ref={scatterRef} style={{ width: '100%', height: 260 }} />
        <div ref={histRef} style={{ width: '100%', height: 260 }} />
      </div>

      {stats && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
          <span style={badgeStyle}>d̄ = {stats.dbar.toFixed(2)}</span>
          <span style={badgeStyle}>s_d = {stats.sd.toFixed(2)}</span>
          <span style={badgeStyle}>SE = {stats.se.toFixed(3)}</span>
          <span style={badgeStyle}>t = {stats.tStat.toFixed(3)}</span>
          <span style={badgeStyle}>df = {stats.df}</span>
          <span style={badgeStyle}>p = {stats.pval.toFixed(4)}</span>
          <span style={decStyle}>{reject ? 'Reject H₀ (α = 0.05)' : 'Fail to Reject H₀ (α = 0.05)'}</span>
        </div>
      )}

      <div style={{ marginTop: '0.5rem' }}>
        <button onClick={refresh}
          style={{ padding: '0.3rem 0.8rem', borderRadius: 4, border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.88rem', background: 'rgba(0,0,0,0.04)' }}>
          Resample
        </button>
      </div>
    </div>
  )
}
