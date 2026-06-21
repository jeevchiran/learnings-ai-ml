import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const PASS_COLOR = '#2563eb'
const FAIL_COLOR = '#dc2626'
const LINE_COLOR = '#d97706'

const DATA = [
  { x1: 2, x2: 5, label: 'Fail' },
  { x1: 3, x2: 7, label: 'Fail' },
  { x1: 4, x2: 6, label: 'Fail' },
  { x1: 5, x2: 8, label: 'Pass' },
  { x1: 5, x2: 5, label: 'Fail' },
  { x1: 6, x2: 7, label: 'Pass' },
  { x1: 6, x2: 6, label: 'Pass' },
  { x1: 7, x2: 9, label: 'Pass' },
  { x1: 7, x2: 4, label: 'Fail' },
  { x1: 8, x2: 7, label: 'Pass' },
  { x1: 8, x2: 8, label: 'Pass' },
  { x1: 9, x2: 6, label: 'Pass' },
]

function giniImpurity(counts) {
  const total = counts[0] + counts[1]
  if (total === 0) return 0
  const p = counts[1] / total
  return 1 - p * p - (1 - p) * (1 - p)
}

function giniGain(parentCounts, leftCounts, rightCounts) {
  const n = parentCounts[0] + parentCounts[1]
  const nL = leftCounts[0] + leftCounts[1]
  const nR = rightCounts[0] + rightCounts[1]
  const pg = giniImpurity(parentCounts)
  const weighted = n > 0 ? (nL / n) * giniImpurity(leftCounts) + (nR / n) * giniImpurity(rightCounts) : 0
  return pg - weighted
}

function computeGainLandscape(feature) {
  const vals = DATA.map(d => feature === 'x1' ? d.x1 : d.x2)
  const labels = DATA.map(d => d.label)
  const parentCounts = [labels.filter(l => l === 'Fail').length, labels.filter(l => l === 'Pass').length]
  const unique = [...new Set(vals)].sort((a, b) => a - b)
  const candidates = []
  for (let i = 0; i < unique.length - 1; i++) candidates.push((unique[i] + unique[i + 1]) / 2)

  const gains = candidates.map(thresh => {
    let lp = 0, lf = 0, rp = 0, rf = 0
    for (const d of DATA) {
      const v = feature === 'x1' ? d.x1 : d.x2
      if (v <= thresh) { if (d.label === 'Pass') lp++; else lf++ }
      else { if (d.label === 'Pass') rp++; else rf++ }
    }
    return giniGain(parentCounts, [lf, lp], [rf, rp])
  })
  return { candidates, gains }
}

function computeSplitStats(feature, thresh) {
  let lp = 0, lf = 0, rp = 0, rf = 0
  for (const d of DATA) {
    const v = feature === 'x1' ? d.x1 : d.x2
    if (v <= thresh) { if (d.label === 'Pass') lp++; else lf++ }
    else { if (d.label === 'Pass') rp++; else rf++ }
  }
  const parentCounts = [lf + rf, lp + rp]
  return {
    lp, lf, rp, rf,
    nL: lp + lf,
    nR: rp + rf,
    gain: giniGain(parentCounts, [lf, lp], [rf, rp]),
    gL: giniImpurity([lf, lp]),
    gR: giniImpurity([rf, rp]),
  }
}

export default function GiniSplitWidget() {
  const scatterRef = useRef(null)
  const landscapeRef = useRef(null)
  const [feature, setFeature] = useState('x1')
  const [thresh, setThresh] = useState(5.5)
  const [threshMin, setThreshMin] = useState(1.5)
  const [threshMax, setThreshMax] = useState(9.5)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // init plots
    Plotly.newPlot(scatterRef.current, [], plotlyLayout({ height: 320 }), PLOTLY_CONFIG)
    Plotly.newPlot(landscapeRef.current, [], plotlyLayout({ height: 240 }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => {
    const axisLabel = feature === 'x1' ? 'Study Hours (X1)' : 'Sleep Hours (X2)'
    const crossLabel = feature === 'x1' ? 'Sleep Hours (X2)' : 'Study Hours (X1)'
    const axisRange = feature === 'x1' ? [1, 10] : [3, 10]
    const crossRange = feature === 'x1' ? [3, 10] : [1, 10]

    const passX = [], passY = [], failX = [], failY = []
    for (const d of DATA) {
      const px = feature === 'x1' ? d.x1 : d.x2
      const py = feature === 'x1' ? d.x2 : d.x1
      if (d.label === 'Pass') { passX.push(px); passY.push(py) }
      else { failX.push(px); failY.push(py) }
    }

    const scatterTraces = [
      { x: passX, y: passY, mode: 'markers', name: 'Pass', marker: { color: PASS_COLOR, size: 10, symbol: 'circle', line: { color: '#fff', width: 1.5 } } },
      { x: failX, y: failY, mode: 'markers', name: 'Fail', marker: { color: FAIL_COLOR, size: 10, symbol: 'x', line: { color: FAIL_COLOR, width: 2 } } },
      { x: [thresh, thresh], y: crossRange, mode: 'lines', name: 'Threshold', line: { color: LINE_COLOR, width: 2, dash: 'dashdot' }, showlegend: true },
    ]
    Plotly.react(scatterRef.current, scatterTraces, plotlyLayout({
      height: 320,
      xaxis: { title: axisLabel, range: axisRange },
      yaxis: { title: crossLabel, range: crossRange },
      legend: { orientation: 'h', y: -0.22 },
    }), PLOTLY_CONFIG)

    const ls = computeGainLandscape(feature)
    const hlIdx = ls.candidates.indexOf(thresh)
    const lsTraces = [
      { x: ls.candidates, y: ls.gains, mode: 'lines+markers', name: 'Gini Gain', line: { color: PASS_COLOR, width: 2 }, marker: { size: 6, color: PASS_COLOR } },
    ]
    if (hlIdx >= 0) {
      lsTraces.push({ x: [ls.candidates[hlIdx]], y: [ls.gains[hlIdx]], mode: 'markers', name: 'Selected', marker: { color: LINE_COLOR, size: 13, symbol: 'diamond' } })
    }
    Plotly.react(landscapeRef.current, lsTraces, plotlyLayout({
      height: 240,
      xaxis: { title: axisLabel + ' threshold' },
      yaxis: { title: 'Gini Gain', range: [0, 0.40] },
      legend: { orientation: 'h', y: -0.28 },
    }), PLOTLY_CONFIG)

    setStats(computeSplitStats(feature, thresh))
  }, [feature, thresh])

  function handleFeatureChange(f) {
    setFeature(f)
    if (f === 'x2') {
      setThreshMin(3.5); setThreshMax(9.5); setThresh(6.5)
    } else {
      setThreshMin(1.5); setThreshMax(9.5); setThresh(5.5)
    }
  }

  const fLabel = feature === 'x1' ? 'Study Hours' : 'Sleep Hours'
  const statBox = { background: 'var(--bg-secondary, #f3f4f6)', borderRadius: 8, padding: '0.4rem 0.8rem', fontSize: '0.82rem' }

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <label style={{ fontWeight: 600 }}>Feature:
          <select value={feature} onChange={e => handleFeatureChange(e.target.value)} style={{ marginLeft: 8, padding: '0.2rem 0.4rem' }}>
            <option value="x1">Study Hours (X1)</option>
            <option value="x2">Sleep Hours (X2)</option>
          </select>
        </label>
        <label style={{ fontWeight: 600, flex: 1 }}>Threshold: <span>{thresh.toFixed(1)}</span>
          <input type="range" min={threshMin} max={threshMax} step={0.5} value={thresh}
            onChange={e => setThresh(parseFloat(e.target.value))}
            style={{ display: 'block', width: '100%' }} />
        </label>
      </div>
      <div ref={scatterRef} />
      <div ref={landscapeRef} />
      {stats && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <span style={statBox}>Gini Gain: <strong>{stats.gain.toFixed(4)}</strong></span>
          <span style={statBox}>Left ({fLabel} ≤ {thresh}): {stats.nL} ({stats.lp}P, {stats.lf}F) — G={stats.gL.toFixed(4)}</span>
          <span style={statBox}>Right ({fLabel} &gt; {thresh}): {stats.nR} ({stats.rp}P, {stats.rf}F) — G={stats.gR.toFixed(4)}</span>
        </div>
      )}
    </div>
  )
}
