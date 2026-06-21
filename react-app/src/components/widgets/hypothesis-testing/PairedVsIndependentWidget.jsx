import { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-dist-min'
import { mean, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

// ── Statistical helpers ────────────────────────────────────────────────────

function stddev(arr) {
  const m = mean(arr)
  return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1))
}

function lgamma(z) {
  const p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z)
  z -= 1
  let x = p[0]
  for (let i = 1; i < 9; i++) x += p[i] / (z + i)
  const t = z + 7.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
}

function betainc(x, a, b) {
  if (x <= 0) return 0; if (x >= 1) return 1
  const logBeta = lgamma(a) + lgamma(b) - lgamma(a + b)
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - logBeta) / a
  const TINY = 1e-30; let f = TINY, C = f, D = 0
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m
    let d = m * (b - m) * x / ((a + m2 - 1) * (a + m2))
    C = 1 + d / C; if (Math.abs(C) < TINY) C = TINY
    D = 1 / (1 + d * D); if (Math.abs(D) < TINY) D = TINY
    f *= C * D
    d = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1))
    C = 1 + d / C; if (Math.abs(C) < TINY) C = TINY
    D = 1 / (1 + d * D); if (Math.abs(D) < TINY) D = TINY
    const delta = C * D; f *= delta
    if (Math.abs(delta - 1) < 1e-8) break
  }
  return front * f
}

function tCDF(t, df) {
  const x = df / (df + t * t)
  const ib = betainc(x, df / 2, 0.5)
  return t > 0 ? 1 - 0.5 * ib : 0.5 * ib
}

function pooledStdErr(s1, n1, s2, n2) {
  return Math.sqrt(s1 * s1 / n1 + s2 * s2 / n2)
}

function welchDf(s1, n1, s2, n2) {
  const a = s1 * s1 / n1, b = s2 * s2 / n2
  return (a + b) ** 2 / (a * a / (n1 - 1) + b * b / (n2 - 1))
}

// ── Fixed dataset ──────────────────────────────────────────────────────────
const before2 = [152, 143, 160, 137, 148, 155, 142, 138]
const after2  = [144, 137, 149, 128, 140, 145, 136, 130]
const n2 = 8

export default function PairedVsIndependentWidget() {
  const barRef = useRef(null)

  useEffect(() => {
    // Paired analysis
    const diffs2 = before2.map((b, i) => b - after2[i])
    const dbar2  = mean(diffs2)
    const sd2    = stddev(diffs2)
    const se2p   = sd2 / Math.sqrt(n2)
    const t2p    = dbar2 / se2p
    const df2p   = n2 - 1
    const pval2p = 2 * Math.min(tCDF(t2p, df2p), 1 - tCDF(t2p, df2p))

    // Independent analysis (wrong approach for paired data)
    const xbar1  = mean(before2)
    const xbar2  = mean(after2)
    const s1     = stddev(before2)
    const s2     = stddev(after2)
    const se2i   = pooledStdErr(s1, n2, s2, n2)
    const t2i    = (xbar1 - xbar2) / se2i
    const df2i   = welchDf(s1, n2, s2, n2)
    const pval2i = 2 * Math.min(tCDF(t2i, df2i), 1 - tCDF(t2i, df2i))

    const barTrace = {
      x: ['Paired t-Test', 'Independent t-Test'],
      y: [Math.abs(t2p), Math.abs(t2i)],
      type: 'bar',
      marker: { color: ['#16a34a', '#dc2626'], opacity: 0.8 },
      text: [Math.abs(t2p).toFixed(3), Math.abs(t2i).toFixed(3)],
      textposition: 'auto',
      showlegend: false,
    }

    Plotly.react(barRef.current, [barTrace], plotlyLayout({
      title: { text: 'Absolute t-Statistic: Paired vs Independent', font: { size: 13 } },
      yaxis: { title: '|t statistic|', rangemode: 'tozero' },
      xaxis: { title: '' },
      showlegend: false,
    }), PLOTLY_CONFIG)

    // Store for display
    window._pvsiStats = { t2p, df2p, pval2p, t2i, df2i, pval2i, dbar2, sd2, se2p, xbar1, xbar2, se2i }
  }, [])

  const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }
  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }
  const thStyle = { padding: '0.3rem 0.5rem', background: 'rgba(0,0,0,0.06)', textAlign: 'left', fontWeight: 600 }
  const tdStyle = { padding: '0.3rem 0.5rem', borderTop: '1px solid rgba(0,0,0,0.08)' }

  // Compute for display
  const diffs2 = before2.map((b, i) => b - after2[i])
  const dbar2  = mean(diffs2)
  const sd2    = stddev(diffs2)
  const se2p   = sd2 / Math.sqrt(n2)
  const t2p    = dbar2 / se2p
  const df2p   = n2 - 1
  const pval2p = 2 * Math.min(tCDF(t2p, df2p), 1 - tCDF(t2p, df2p))
  const s1     = stddev(before2), s2i = stddev(after2)
  const se2i   = pooledStdErr(s1, n2, s2i, n2)
  const t2i    = (mean(before2) - mean(after2)) / se2i
  const df2i   = welchDf(s1, n2, s2i, n2)
  const pval2i = 2 * Math.min(tCDF(t2i, df2i), 1 - tCDF(t2i, df2i))

  const rejStyle = (p) => ({
    fontWeight: 700, color: p < 0.05 ? '#dc2626' : '#2563eb',
  })

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <p style={{ fontSize: '0.88rem', marginBottom: '0.75rem', color: '#4b5563' }}>
        The same 8-patient blood pressure dataset analyzed two ways. The paired test produces a much larger t-statistic because between-subject variance is removed by differencing.
      </p>

      <div style={rowStyle}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#16a34a' }}>Paired t-Test (correct)</div>
          <table style={tableStyle}>
            <tbody>
              <tr><th style={thStyle}>d̄</th><td style={tdStyle}>{dbar2.toFixed(2)}</td></tr>
              <tr><th style={thStyle}>s_d</th><td style={tdStyle}>{sd2.toFixed(2)}</td></tr>
              <tr><th style={thStyle}>SE</th><td style={tdStyle}>{se2p.toFixed(3)}</td></tr>
              <tr><th style={thStyle}>t</th><td style={tdStyle}>{t2p.toFixed(3)}</td></tr>
              <tr><th style={thStyle}>df</th><td style={tdStyle}>{df2p}</td></tr>
              <tr><th style={thStyle}>p-value</th><td style={{ ...tdStyle, ...rejStyle(pval2p) }}>{pval2p < 0.0001 ? '< 0.0001' : pval2p.toFixed(4)}</td></tr>
              <tr><th style={thStyle}>Decision</th><td style={{ ...tdStyle, ...rejStyle(pval2p) }}>{pval2p < 0.05 ? 'Reject H₀' : 'Fail to Reject H₀'}</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#dc2626' }}>Independent t-Test (incorrect for this data)</div>
          <table style={tableStyle}>
            <tbody>
              <tr><th style={thStyle}>x̄₁ (before)</th><td style={tdStyle}>{mean(before2).toFixed(2)}</td></tr>
              <tr><th style={thStyle}>x̄₂ (after)</th><td style={tdStyle}>{mean(after2).toFixed(2)}</td></tr>
              <tr><th style={thStyle}>SE</th><td style={tdStyle}>{se2i.toFixed(3)}</td></tr>
              <tr><th style={thStyle}>t</th><td style={tdStyle}>{t2i.toFixed(3)}</td></tr>
              <tr><th style={thStyle}>df</th><td style={tdStyle}>{df2i.toFixed(1)}</td></tr>
              <tr><th style={thStyle}>p-value</th><td style={{ ...tdStyle, ...rejStyle(pval2i) }}>{pval2i < 0.0001 ? '< 0.0001' : pval2i.toFixed(4)}</td></tr>
              <tr><th style={thStyle}>Decision</th><td style={{ ...tdStyle, ...rejStyle(pval2i) }}>{pval2i < 0.05 ? 'Reject H₀' : 'Fail to Reject H₀'}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div ref={barRef} style={{ width: '100%', height: 280 }} />

      <div style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic', marginTop: '0.5rem' }}>
        The paired test yields a t-statistic of {t2p.toFixed(3)} vs {t2i.toFixed(3)} for the independent test — a {(t2p / t2i).toFixed(1)}× advantage from removing between-subject noise.
      </div>
    </div>
  )
}
