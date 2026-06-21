import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

// ── Impurity helpers ──────────────────────────────────────────────────────────
function giniImpurity(counts) {
  const total = counts[0] + counts[1]
  if (total === 0) return 0
  const p = counts[1] / total
  return 1 - p * p - (1 - p) * (1 - p)
}

function entropy(counts) {
  const total = counts[0] + counts[1]
  if (total === 0) return 0
  const p = counts[1] / total
  const q = counts[0] / total
  if (p === 0 || q === 0) return 0
  return -p * Math.log2(p) - q * Math.log2(q)
}

function misclassRate(counts) {
  const total = counts[0] + counts[1]
  if (total === 0) return 0
  const p = counts[1] / total
  return 1 - Math.max(p, 1 - p)
}

function informationGain(parentCounts, leftCounts, rightCounts) {
  const n = parentCounts[0] + parentCounts[1]
  const nL = leftCounts[0] + leftCounts[1]
  const nR = rightCounts[0] + rightCounts[1]
  const pe = entropy(parentCounts)
  const weighted = n > 0 ? (nL / n) * entropy(leftCounts) + (nR / n) * entropy(rightCounts) : 0
  return pe - weighted
}

function giniGain(parentCounts, leftCounts, rightCounts) {
  const n = parentCounts[0] + parentCounts[1]
  const nL = leftCounts[0] + leftCounts[1]
  const nR = rightCounts[0] + rightCounts[1]
  const pg = giniImpurity(parentCounts)
  const weighted = n > 0 ? (nL / n) * giniImpurity(leftCounts) + (nR / n) * giniImpurity(rightCounts) : 0
  return pg - weighted
}

// ── Widget 1: static impurity comparison ──────────────────────────────────────
function ImpurityCompareChart() {
  const ref = useRef(null)
  useEffect(() => {
    const ps = linspace(0.001, 0.999, 200)
    const traces = [
      {
        x: ps, y: ps.map(p => 2 * p * (1 - p)),
        name: 'Gini Impurity', type: 'scatter', mode: 'lines',
        line: { color: '#2563eb', width: 2.5 },
      },
      {
        x: ps, y: ps.map(p => -p * Math.log2(p) - (1 - p) * Math.log2(1 - p)),
        name: 'Entropy (normalised)', type: 'scatter', mode: 'lines',
        line: { color: '#16a34a', width: 2.5 },
      },
      {
        x: ps, y: ps.map(p => 1 - Math.max(p, 1 - p)),
        name: 'Misclassification Rate', type: 'scatter', mode: 'lines',
        line: { color: '#d97706', width: 2.5, dash: 'dash' },
      },
    ]
    const layout = plotlyLayout({
      height: 350,
      xaxis: { title: 'p (proportion of class 1)', range: [0, 1] },
      yaxis: { title: 'Impurity', range: [0, 1.05] },
      legend: { x: 0.35, y: 1.02, orientation: 'h' },
      margin: { t: 50, r: 20, b: 55, l: 55 },
    })
    Plotly.newPlot(ref.current, traces, layout, PLOTLY_CONFIG)
    return () => Plotly.purge(ref.current)
  }, [])
  return <div ref={ref} />
}

// ── Widget 2: impurity calculator ────────────────────────────────────────────
function ImpurityCalculator() {
  const pieRef = useRef(null)
  const [pos, setPos] = useState(7)
  const [neg, setNeg] = useState(3)

  useEffect(() => {
    const pieData = [{
      labels: ['Positive', 'Negative'],
      values: [pos, neg],
      type: 'pie',
      hole: 0.35,
      marker: { colors: ['#2563eb', '#d97706'] },
      textinfo: 'label+percent',
      hovertemplate: '%{label}: %{value}<extra></extra>',
    }]
    const layout = plotlyLayout({
      height: 260,
      margin: { t: 30, r: 30, b: 30, l: 30 },
      showlegend: false,
    })
    delete layout.xaxis
    delete layout.yaxis
    Plotly.react(pieRef.current, pieData, layout, PLOTLY_CONFIG)
  }, [pos, neg])

  const counts = [neg, pos]
  const g = giniImpurity(counts).toFixed(3)
  const h = entropy(counts).toFixed(3)
  const e = misclassRate(counts).toFixed(3)

  return (
    <div>
      <div ref={pieRef} />
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', margin: '0.5rem 0' }}>
        <label>Positive: <strong>{pos}</strong>
          <input type="range" min={0} max={20} value={pos} onChange={ev => setPos(+ev.target.value)} style={{ marginLeft: 8 }} />
        </label>
        <label>Negative: <strong>{neg}</strong>
          <input type="range" min={0} max={20} value={neg} onChange={ev => setNeg(+ev.target.value)} style={{ marginLeft: 8 }} />
        </label>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[['Gini', g], ['Entropy', h], ['Misclass. Rate', e]].map(([label, val]) => (
          <div key={label} style={{ background: 'var(--bg-secondary, #f3f4f6)', borderRadius: 8, padding: '0.4rem 0.8rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6b7280)' }}>{label}</div>
            <strong>{val}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Widget 3: information gain calculator ────────────────────────────────────
function InformationGainCalculator() {
  const barRef = useRef(null)
  const [pp, setPP] = useState(8)
  const [pn, setPN] = useState(7)
  const [lp, setLP] = useState(6)
  const [ln, setLN] = useState(1)

  useEffect(() => {
    const rp = Math.max(0, pp - lp)
    const rn = Math.max(0, pn - ln)
    const n = pp + pn
    const nL = lp + ln
    const nR = rp + rn
    const pe = entropy([pn, pp])
    const le = entropy([ln, lp])
    const re = entropy([rn, rp])
    const weightedChild = n > 0 ? (nL / n) * le + (nR / n) * re : 0
    const ig = pe - weightedChild

    const barData = [{
      x: ['Parent Entropy', 'Weighted Child Entropy', 'Information Gain'],
      y: [pe, weightedChild, ig],
      type: 'bar',
      marker: { color: ['#2563eb', '#d97706', '#16a34a'] },
      hovertemplate: '%{x}: %{y:.3f}<extra></extra>',
    }]
    const layout = plotlyLayout({
      height: 280,
      yaxis: { title: 'Entropy (bits)', rangemode: 'tozero' },
      xaxis: { title: '' },
      margin: { t: 30, r: 20, b: 60, l: 55 },
    })
    Plotly.react(barRef.current, barData, layout, PLOTLY_CONFIG)
  }, [pp, pn, lp, ln])

  const rp = Math.max(0, pp - lp)
  const rn = Math.max(0, pn - ln)

  const statStyle = { background: 'var(--bg-secondary, #f3f4f6)', borderRadius: 8, padding: '0.4rem 0.8rem', fontSize: '0.82rem' }

  return (
    <div>
      <div ref={barRef} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', margin: '0.5rem 0' }}>
        {[
          ['Parent Positive', pp, 1, 20, setPP],
          ['Parent Negative', pn, 1, 20, setPN],
          ['Left Positive', lp, 0, pp, setLP],
          ['Left Negative', ln, 0, pn, setLN],
        ].map(([label, val, min, max, setter]) => (
          <label key={label} style={{ fontSize: '0.85rem' }}>
            {label}: <strong>{val}</strong>
            <input type="range" min={min} max={max} value={Math.min(val, max)} onChange={e => setter(+e.target.value)} style={{ display: 'block', width: '100%' }} />
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
        <span style={statStyle}>Right: {rp}P, {rn}N (auto-derived)</span>
        <span style={statStyle}>IG = {(entropy([pn, pp]) - ((lp + ln) / (pp + pn) * entropy([ln, lp]) + (rp + rn) / (pp + pn) * entropy([rn, rp]))).toFixed(3)}</span>
        <span style={statStyle}>Gini Gain = {giniGain([pn, pp], [ln, lp], [rn, rp]).toFixed(3)}</span>
      </div>
    </div>
  )
}

export default function ImpurityWidget() {
  const [tab, setTab] = useState(0)
  const tabs = ['Impurity Curves', 'Calculator', 'Info Gain']
  const tabStyle = active => ({
    padding: '0.4rem 0.9rem',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    background: active ? 'var(--accent-blue, #2563eb)' : 'var(--bg-secondary, #e5e7eb)',
    color: active ? '#fff' : 'inherit',
    fontWeight: active ? 700 : 400,
  })
  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {tabs.map((t, i) => (
          <button key={t} style={tabStyle(tab === i)} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>
      {tab === 0 && <ImpurityCompareChart />}
      {tab === 1 && <ImpurityCalculator />}
      {tab === 2 && <InformationGainCalculator />}
    </div>
  )
}
