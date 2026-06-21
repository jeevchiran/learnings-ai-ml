import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace, normalPDF, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const SCENARIOS = {
  left: {
    type: 'left',
    title: 'Drug Trial',
    h0: 'H₀: μ = 10 (drug has no effect; mean recovery time is 10 days)',
    h1: 'H₁: μ < 10 (drug reduces recovery time; left-tailed test)',
    zcrit: -1.645,
    interpretation: 'The shaded coral region on the left is the rejection region. If the test statistic Z falls below −1.645, we reject H₀ and conclude there is evidence that the drug reduces recovery time. The blue region is the fail-to-reject zone.',
  },
  'two-coin': {
    type: 'two',
    title: 'Coin Fairness',
    h0: 'H₀: p = 0.5 (coin is fair; probability of heads is 50%)',
    h1: 'H₁: p ≠ 0.5 (coin is biased in some direction; two-tailed test)',
    zcritL: -1.96,
    zcritR: 1.96,
    interpretation: 'The shaded coral regions in both tails are the rejection regions. If the test statistic Z is below −1.96 or above +1.96, we reject H₀ and conclude the coin is biased. The blue region is the fail-to-reject zone covering the central 95% of the distribution.',
  },
  right: {
    type: 'right',
    title: 'Battery Quality Control',
    h0: 'H₀: μ = 100 (batteries meet the claimed 100-hour lifetime)',
    h1: 'H₁: μ > 100 (batteries exceed the claimed lifetime; right-tailed test)',
    zcrit: 1.645,
    interpretation: 'The shaded coral region on the right is the rejection region. If the test statistic Z exceeds +1.645, we reject H₀ and conclude there is evidence that the batteries last longer than claimed. The blue region is the fail-to-reject zone.',
  },
  'two-teach': {
    type: 'two',
    title: 'Teaching Method',
    h0: 'H₀: μ = 72 (new method produces the same mean test score as the old)',
    h1: 'H₁: μ ≠ 72 (new method changes mean test score; two-tailed test)',
    zcritL: -1.96,
    zcritR: 1.96,
    interpretation: 'The shaded coral regions in both tails are the rejection regions. If the test statistic Z is below −1.96 or above +1.96, we reject H₀ and conclude the new teaching method produces a significantly different mean score. The blue region is the fail-to-reject zone covering the central 95%.',
  },
}

function filledRegion(xMin, xMax, color, name, n = 200) {
  const xs = linspace(xMin, xMax, n)
  const ys = xs.map(normalPDF)
  const xFill = [...xs, ...xs.slice().reverse()]
  const yFill = [...ys, ...xs.map(() => 0)]
  return {
    x: xFill, y: yFill,
    fill: 'toself', fillcolor: color,
    line: { color: 'rgba(0,0,0,0)' },
    mode: 'lines', type: 'scatter',
    name, hoverinfo: 'skip',
  }
}

function vertLine(xVal, color, name) {
  return {
    x: [xVal, xVal], y: [0, normalPDF(0) * 1.05],
    mode: 'lines', type: 'scatter',
    line: { color, width: 2, dash: 'dash' },
    name, hoverinfo: 'skip',
  }
}

export default function RejectionRegionWidget() {
  const plotRef = useRef(null)
  const [scenario, setScenario] = useState('left')

  useEffect(() => {
    const sc = SCENARIOS[scenario]
    const xs = linspace(-4, 4, 400)
    const ys = xs.map(normalPDF)
    const rejectColor = 'rgba(239, 68, 68, 0.35)'
    const failColor = 'rgba(96, 165, 250, 0.18)'

    const bellTrace = {
      x: xs, y: ys,
      mode: 'lines', type: 'scatter',
      line: { color: '#4b5563', width: 2 },
      name: 'Standard Normal', hoverinfo: 'skip',
    }

    let traces = []
    if (sc.type === 'left') {
      traces.push(filledRegion(sc.zcrit, 4, failColor, 'Fail to Reject H₀'))
      traces.push(filledRegion(-4, sc.zcrit, rejectColor, 'Rejection Region (α = 0.05)'))
      traces.push(vertLine(sc.zcrit, '#dc2626', `z* = ${sc.zcrit.toFixed(3)}`))
    } else if (sc.type === 'right') {
      traces.push(filledRegion(-4, sc.zcrit, failColor, 'Fail to Reject H₀'))
      traces.push(filledRegion(sc.zcrit, 4, rejectColor, 'Rejection Region (α = 0.05)'))
      traces.push(vertLine(sc.zcrit, '#dc2626', `z* = +${sc.zcrit.toFixed(3)}`))
    } else {
      traces.push(filledRegion(sc.zcritL, sc.zcritR, failColor, 'Fail to Reject H₀'))
      traces.push(filledRegion(-4, sc.zcritL, rejectColor, 'Rejection Region (α = 0.05)'))
      traces.push(filledRegion(sc.zcritR, 4, rejectColor, 'Rejection Region'))
      traces.push(vertLine(sc.zcritL, '#dc2626', `z* = ${sc.zcritL.toFixed(2)}`))
      traces.push(vertLine(sc.zcritR, '#dc2626', `z* = +${sc.zcritR.toFixed(2)}`))
    }
    traces.push(bellTrace)

    const layout = plotlyLayout({
      xaxis: {
        title: { text: 'Test Statistic (Z)', font: { size: 12 } },
        range: [-4.2, 4.2],
        tickvals: [-4, -3, -2, -1.96, -1.645, 0, 1.645, 1.96, 2, 3, 4],
        ticktext: ['-4', '-3', '-2', '−1.96', '−1.645', '0', '1.645', '1.96', '2', '3', '4'],
        gridcolor: 'rgba(150,150,150,0.2)',
        zerolinecolor: 'rgba(150,150,150,0.5)',
      },
      yaxis: {
        title: { text: 'Probability Density', font: { size: 12 } },
        range: [0, 0.44],
        gridcolor: 'rgba(150,150,150,0.2)',
      },
      margin: { t: 30, r: 20, b: 60, l: 60 },
      showlegend: true,
      legend: { x: 0.65, y: 0.95, bgcolor: 'rgba(0,0,0,0)', borderwidth: 0, font: { size: 11 } },
    })

    Plotly.react(plotRef.current, traces, layout, PLOTLY_CONFIG)
  }, [scenario])

  const sc = SCENARIOS[scenario]

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ fontWeight: 600, marginRight: '0.5rem' }}>Scenario:</label>
        <select
          value={scenario}
          onChange={e => setScenario(e.target.value)}
          style={{ padding: '0.25rem 0.5rem', borderRadius: 4, border: '1px solid #d1d5db' }}
        >
          <option value="left">Drug Trial (left-tailed)</option>
          <option value="two-coin">Coin Fairness (two-tailed)</option>
          <option value="right">Battery QC (right-tailed)</option>
          <option value="two-teach">Teaching Method (two-tailed)</option>
        </select>
      </div>

      <div style={{ background: 'rgba(59,130,246,0.07)', borderLeft: '3px solid #3b82f6', padding: '0.6rem 0.9rem', borderRadius: 4, marginBottom: '0.75rem', fontSize: '0.92rem' }}>
        <strong>{sc.title}</strong><br />
        {sc.h0}<br />
        {sc.h1}
      </div>

      <div ref={plotRef} style={{ width: '100%', height: 340 }} />

      <div style={{ marginTop: '0.5rem', fontSize: '0.88rem', color: '#6b7280', fontStyle: 'italic' }}>
        {sc.interpretation}
      </div>
    </div>
  )
}
