import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { expectation, variance, generateCorrelated, sampleCovariance, pearsonCorrelation } from './probabilityUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#475569'
const VALUES = [1, 2, 3, 4, 5, 6]

function weightedDie(skew) {
  const weights = VALUES.map(v => Math.exp(skew * v))
  const total = weights.reduce((a, b) => a + b, 0)
  return VALUES.map((v, i) => ({ x: v, p: weights[i] / total }))
}

// Two moments in one widget: E[X]/Var(X) on a tunable weighted die, and
// covariance/correlation on a scatter whose correlation you dial directly.
function ExpectationWidget() {
  const plotRef = useRef(null)
  const [skew, setSkew] = useState(0)

  const render = useCallback(s => {
    const dist = weightedDie(s)
    const mu = expectation(dist), v = variance(dist)
    Plotly.react(plotRef.current, [
      { x: dist.map(d => d.x), y: dist.map(d => d.p), type: 'bar', marker: { color: COLOR }, name: 'P(X=x)' },
    ], plotlyLayout({
      title: { text: `E[X] = ${mu.toFixed(2)}, Var(X) = ${v.toFixed(2)}, σ = ${Math.sqrt(v).toFixed(2)}`, font: { size: 13 } },
      xaxis: { title: 'x (die face)', dtick: 1 }, yaxis: { title: 'P(X=x)', range: [0, 1] },
      shapes: [{ type: 'line', x0: mu, x1: mu, y0: 0, y1: 1, yref: 'paper', line: { color: '#dc2626', width: 2, dash: 'dash' } }],
      showlegend: false,
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(skew) }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        Weighting toward 6
        <input type="range" min="-1" max="1" step="0.05" value={skew} onChange={e => { const v = +e.target.value; setSkew(v); render(v) }} style={{ flex: 1, maxWidth: 240 }} />
        <strong>{skew.toFixed(2)}</strong>
      </label>
      <div ref={plotRef} style={{ minHeight: 260 }} />
      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.4rem' }}>
        E[X] = Σ x·P(x) — the probability-weighted average outcome. Var(X) = Σ P(x)(x−E[X])² — the average squared distance from that mean. Fair die (slider = 0): E[X] = 3.5.
      </p>
    </div>
  )
}

function CovarianceWidget() {
  const plotRef = useRef(null)
  const [rho, setRho] = useState(0.6)

  const render = useCallback(r => {
    const points = generateCorrelated(150, r, 9)
    const { cov, varX, varY } = sampleCovariance(points)
    const sampleR = pearsonCorrelation(points)
    Plotly.react(plotRef.current, [
      { x: points.map(p => p[0]), y: points.map(p => p[1]), mode: 'markers', type: 'scatter', marker: { color: COLOR, size: 6, opacity: 0.65 } },
    ], plotlyLayout({
      title: { text: `Cov(X,Y) = ${cov.toFixed(2)}, sample r = ${sampleR.toFixed(2)}`, font: { size: 13 } },
      xaxis: { title: 'X', range: [-4, 4] }, yaxis: { title: 'Y', range: [-4, 4], scaleanchor: 'x' },
      showlegend: false,
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(rho) }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        Target correlation ρ
        <input type="range" min="-0.95" max="0.95" step="0.05" value={rho} onChange={e => { const v = +e.target.value; setRho(v); render(v) }} style={{ flex: 1, maxWidth: 240 }} />
        <strong>{rho.toFixed(2)}</strong>
      </label>
      <div ref={plotRef} style={{ minHeight: 260 }} />
      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.4rem' }}>
        Correlation is covariance normalized to [-1, 1]: r = Cov(X,Y) / (σ_X·σ_Y) — unlike covariance, it doesn't care about the scale of X or Y, only the strength/direction of the linear relationship.
      </p>
    </div>
  )
}

export default function ExpectationCovarianceWidget() {
  return (
    <div style={{ fontFamily: 'inherit' }}>
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Widget 1 — Expectation & Variance</h4>
      <ExpectationWidget />
      <h4 style={{ margin: '1.5rem 0 0.5rem', fontSize: '1rem' }}>Widget 2 — Covariance & Correlation</h4>
      <CovarianceWidget />
    </div>
  )
}
