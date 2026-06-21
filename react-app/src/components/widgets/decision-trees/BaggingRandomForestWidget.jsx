import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const N_POINTS = 15

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
function makePrng(seed) {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6D2B79F5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Widget 1: Bootstrap sampling demo ────────────────────────────────────────
function BootstrapWidget() {
  const [drawCount, setDrawCount] = useState(0)
  const [counts, setCounts] = useState(null)
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState({ unique: '—', oob: '—', avgOob: '—' })
  const oobHistRef = useRef([])

  function drawBootstrap() {
    const c = {}
    for (let i = 1; i <= N_POINTS; i++) c[i] = 0
    for (let j = 0; j < N_POINTS; j++) c[Math.floor(Math.random() * N_POINTS) + 1]++
    setCounts(c)
    const unique = Object.values(c).filter(v => v > 0).length
    const oob = N_POINTS - unique
    oobHistRef.current = [...oobHistRef.current, oob / N_POINTS]
    const avgOob = oobHistRef.current.reduce((a, b) => a + b, 0) / oobHistRef.current.length
    const newCount = drawCount + 1
    setDrawCount(newCount)
    setStats({ unique, oob, avgOob: (avgOob * 100).toFixed(1) + '%' })
    const oobList = Object.keys(c).filter(k => c[k] === 0).map(Number)
    const repList = Object.entries(c).filter(([, v]) => v > 1).map(([k, v]) => `${k}×${v}`)
    setHistory(prev => [`Sample ${newCount}: ${unique} in-bag, ${oob} OOB — Repeated: ${repList.join(', ') || 'none'} | OOB: {${oobList.join(', ')}}`, ...prev].slice(0, 5))
  }

  function reset() {
    setCounts(null); setDrawCount(0); oobHistRef.current = []; setHistory([])
    setStats({ unique: '—', oob: '—', avgOob: '—' })
  }

  const badgeStyle = (cnt) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '2.1rem', height: '2.1rem', borderRadius: '50%',
    fontSize: '0.8rem', fontWeight: 600,
    border: `2px solid ${counts === null ? 'var(--border, #d1d5db)' : (cnt === 0 ? 'var(--border, #d1d5db)' : '#2563eb')}`,
    background: counts === null ? 'var(--bg-secondary, #f3f4f6)' : (cnt === 0 ? 'var(--bg-secondary, #f3f4f6)' : 'rgba(37,99,235,0.12)'),
    color: counts === null ? 'var(--text-muted, #9ca3af)' : (cnt === 0 ? 'var(--text-muted, #9ca3af)' : '#2563eb'),
    opacity: counts !== null && cnt === 0 ? 0.45 : 1,
    margin: '0.2rem', position: 'relative', transition: 'all 0.2s',
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        {Array.from({ length: N_POINTS }, (_, i) => i + 1).map(n => {
          const cnt = counts ? counts[n] || 0 : 0
          return (
            <span key={n} style={badgeStyle(cnt)}>
              {n}
              {counts && cnt > 1 && (
                <span style={{ position: 'absolute', top: -4, right: -6, fontSize: '0.6rem', background: '#2563eb', color: '#fff', borderRadius: 8, padding: '0 3px', lineHeight: 1.4 }}>×{cnt}</span>
              )}
            </span>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <button onClick={drawBootstrap} style={{ padding: '0.4rem 1rem', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          Draw Bootstrap Sample
        </button>
        <button onClick={reset} style={{ padding: '0.4rem 1rem', borderRadius: 6, border: '1px solid var(--border, #d1d5db)', cursor: 'pointer', background: 'var(--bg-secondary, #f3f4f6)' }}>
          Reset
        </button>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {[['Draws', drawCount], ['Unique in-bag', stats.unique], ['OOB count', stats.oob], ['Avg OOB rate', stats.avgOob]].map(([l, v]) => (
          <div key={l} style={{ background: 'var(--bg-secondary, #f3f4f6)', borderRadius: 8, padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}>
            <div style={{ color: 'var(--text-muted, #6b7280)' }}>{l}</div>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #6b7280)' }}>
        {history.map((h, i) => <div key={i}>{h}</div>)}
      </div>
    </div>
  )
}

// ── Widget 2: Variance reduction simulator ────────────────────────────────────
function VarianceWidget() {
  const plotRef = useRef(null)
  const [sigma2, setSigma2] = useState(1.0)
  const [rho, setRho] = useState(0.5)

  useEffect(() => {
    Plotly.newPlot(plotRef.current, [], plotlyLayout({ height: 360 }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => {
    const BValues = Array.from({ length: 100 }, (_, i) => i + 1)
    const ensVar = (B, r, s2) => r * s2 + ((1 - r) / B) * s2
    const floor = rho * sigma2

    const traces = [
      { x: BValues, y: BValues.map(B => ensVar(B, 0, sigma2)), mode: 'lines', name: 'ρ=0 (uncorr.)', line: { color: '#2563eb', width: 2 } },
      { x: BValues, y: BValues.map(B => ensVar(B, rho, sigma2)), mode: 'lines', name: `ρ=${rho.toFixed(1)} (corr.)`, line: { color: '#dc2626', width: 2 } },
      { x: [1, 100], y: [floor, floor], mode: 'lines', name: `Var floor (${floor.toFixed(4)})`, line: { color: '#d97706', width: 1.5, dash: 'dash' } },
    ]

    Plotly.react(plotRef.current, traces, plotlyLayout({
      height: 360,
      xaxis: { title: 'Number of trees (B)', range: [1, 100] },
      yaxis: { title: 'Ensemble variance', rangemode: 'tozero' },
      legend: { orientation: 'h', y: 1.08, font: { size: 11 } },
    }), PLOTLY_CONFIG)
  }, [sigma2, rho])

  const ensVar = (B, r, s2) => r * s2 + ((1 - r) / B) * s2
  return (
    <div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
        <label>σ² = <strong>{sigma2.toFixed(1)}</strong>
          <input type="range" min={0.1} max={2.0} step={0.1} value={sigma2} onChange={e => setSigma2(+e.target.value)} style={{ display: 'block', minWidth: 140 }} />
        </label>
        <label>ρ = <strong>{rho.toFixed(1)}</strong>
          <input type="range" min={0.0} max={0.9} step={0.1} value={rho} onChange={e => setRho(+e.target.value)} style={{ display: 'block', minWidth: 140 }} />
        </label>
      </div>
      <div ref={plotRef} />
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        {[['B=1', sigma2.toFixed(4)], ['B=10', ensVar(10, rho, sigma2).toFixed(4)], ['B=100', ensVar(100, rho, sigma2).toFixed(4)], ['Var floor', (rho * sigma2).toFixed(4)]].map(([l, v]) => (
          <div key={l} style={{ background: 'var(--bg-secondary, #f3f4f6)', borderRadius: 8, padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}>
            <div style={{ color: 'var(--text-muted, #6b7280)' }}>{l}</div>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Widget 3: Feature importance ──────────────────────────────────────────────
function FeatureImportanceWidget() {
  const plotRef = useRef(null)
  const [seed, setSeed] = useState(42)

  function giniImpurity(counts) {
    const total = counts[0] + counts[1]
    if (total === 0) return 0
    const p = counts[1] / total
    return 1 - p * p - (1 - p) * (1 - p)
  }

  function findBestSplitFI(subset, featIdx, prng) {
    const vals = subset.map(row => row[featIdx])
    const sorted = vals.slice().sort((a, b) => a - b)
    const unique = []
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i] !== sorted[i + 1]) unique.push((sorted[i] + sorted[i + 1]) / 2)
    }
    const parentCounts = [0, 0]
    subset.forEach(row => parentCounts[row[5]]++)
    const parentGini = giniImpurity(parentCounts)
    const n = subset.length
    let bestGain = -Infinity, bestThresh = null
    for (const t of unique) {
      const lc = [0, 0], rc = [0, 0]
      subset.forEach(row => { if (row[featIdx] <= t) lc[row[5]]++; else rc[row[5]]++ })
      const nL = lc[0] + lc[1], nR = rc[0] + rc[1]
      if (nL === 0 || nR === 0) continue
      const gain = parentGini - (nL / n) * giniImpurity(lc) - (nR / n) * giniImpurity(rc)
      if (gain > bestGain) { bestGain = gain; bestThresh = t }
    }
    return { gain: Math.max(0, bestGain), thresh: bestThresh }
  }

  function computeFeatureImportance(s) {
    const prng = makePrng(s)
    const n = 200
    const data = Array.from({ length: n }, () => {
      const x1 = prng() * 4 - 2, x2 = prng() * 4 - 2, x3 = prng() * 4 - 2, x4 = prng() * 4 - 2
      const x5 = x1 + (prng() - 0.5) * 0.5
      const label = (x1 + x2 + (prng() - 0.5) * 0.4 > 0) ? 1 : 0
      return [x1, x2, x3, x4, x5, label]
    })

    const mTry = 2, B = 20
    const totalFI = [0, 0, 0, 0, 0]

    for (let b = 0; b < B; b++) {
      const bootstrap = Array.from({ length: n }, () => data[Math.floor(prng() * n)])
      const fi = [0, 0, 0, 0, 0]
      if (bootstrap.length < 2) continue

      // Root split
      const allFeats = [0, 1, 2, 3, 4]
      const shuffled = allFeats.slice().sort(() => prng() - 0.5)
      const rootFeats = shuffled.slice(0, mTry)
      let bestRootGain = -Infinity, bestRootFeat = null, bestRootThresh = null
      for (const f of rootFeats) {
        const res = findBestSplitFI(bootstrap, f, prng)
        if (res.gain > bestRootGain) { bestRootGain = res.gain; bestRootFeat = f; bestRootThresh = res.thresh }
      }
      if (bestRootFeat === null || bestRootThresh === null) continue
      fi[bestRootFeat] += bestRootGain

      const left = bootstrap.filter(row => row[bestRootFeat] <= bestRootThresh)
      const right = bootstrap.filter(row => row[bestRootFeat] > bestRootThresh)

      for (const child of [left, right]) {
        if (child.length < 2) continue
        const cFeats = allFeats.slice().sort(() => prng() - 0.5).slice(0, mTry)
        let bestG = -Infinity, bestF = null
        for (const f of cFeats) {
          const res = findBestSplitFI(child, f, prng)
          if (res.gain > bestG) { bestG = res.gain; bestF = f }
        }
        if (bestF !== null) fi[bestF] += (child.length / n) * bestG
      }

      for (let f = 0; f < 5; f++) totalFI[f] += fi[f] / B
    }

    const total = totalFI.reduce((a, b) => a + b, 0)
    if (total > 0) for (let f = 0; f < 5; f++) totalFI[f] /= total
    return totalFI
  }

  useEffect(() => {
    Plotly.newPlot(plotRef.current, [], plotlyLayout({ height: 320 }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => {
    const fi = computeFeatureImportance(seed)
    const names = ['X1 (useful)', 'X2 (useful)', 'X3 (noisy)', 'X4 (noisy)', 'X5 (redundant)']
    const colors = ['#2563eb', '#2563eb', '#dc2626', '#dc2626', '#d97706']
    const indices = [0, 1, 2, 3, 4].sort((a, b) => fi[a] - fi[b])

    const trace = {
      x: indices.map(i => fi[i]),
      y: indices.map(i => names[i]),
      type: 'bar', orientation: 'h',
      marker: { color: indices.map(i => colors[i]) },
      text: indices.map(i => (fi[i] * 100).toFixed(1) + '%'),
      textposition: 'outside',
      hovertemplate: '%{y}: %{x:.4f}<extra></extra>',
    }
    Plotly.react(plotRef.current, [trace], plotlyLayout({
      height: 320,
      xaxis: { title: 'Normalized importance (MDI)', range: [0, Math.max(...fi) * 1.3] },
      yaxis: { title: '' },
      margin: { t: 20, r: 60, b: 50, l: 120 },
      showlegend: false,
    }), PLOTLY_CONFIG)
  }, [seed]) // eslint-disable-line

  return (
    <div>
      <div ref={plotRef} />
      <button onClick={() => setSeed(Math.floor(Math.random() * 100000))} style={{ padding: '0.4rem 1rem', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, marginTop: '0.5rem' }}>
        Reseed Forest
      </button>
    </div>
  )
}

export default function BaggingRandomForestWidget() {
  const [tab, setTab] = useState(0)
  const tabs = ['Bootstrap Demo', 'Variance Reduction', 'Feature Importance']
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
      {tab === 0 && <BootstrapWidget />}
      {tab === 1 && <VarianceWidget />}
      {tab === 2 && <FeatureImportanceWidget />}
    </div>
  )
}
