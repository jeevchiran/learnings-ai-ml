import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { generateSeries, ses, holtLinear, holtWinters, rmse } from './timeSeriesUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#0369a1'
const METHODS = {
  ses: { label: 'Simple Exp. Smoothing', color: '#dc2626', needs: ['alpha'] },
  holt: { label: "Holt's Linear", color: '#16a34a', needs: ['alpha', 'beta'] },
  hw: { label: 'Holt-Winters', color: '#7c3aed', needs: ['alpha', 'beta', 'gamma'] },
}

// Fixed seasonal-trending series; tune alpha/beta/gamma by hand and watch the
// fitted line + forecast + RMSE react — the same search a grid-search would automate.
export default function SmoothingWidget() {
  const plotRef = useRef(null)
  const [method, setMethod] = useState('hw')
  const [alpha, setAlpha] = useState(0.3)
  const [beta, setBeta] = useState(0.1)
  const [gamma, setGamma] = useState(0.3)
  const [err, setErr] = useState(0)
  const dataRef = useRef(null)

  const render = useCallback((m, a, b, g) => {
    if (!dataRef.current) dataRef.current = generateSeries({ n: 48, period: 12, trendSlope: 0.6, seasonalAmp: 8, noiseStd: 2, seed: 7 })
    const { t, y } = dataRef.current
    const H = 12
    const future = Array.from({ length: H }, (_, i) => t[t.length - 1] + i + 1)

    let fitted, forecast, rmseVal
    if (m === 'ses') {
      const r = ses(y, a); fitted = r.fitted; forecast = r.forecast(H)
    } else if (m === 'holt') {
      const r = holtLinear(y, a, b); fitted = r.fitted; forecast = r.forecast(H)
    } else {
      const r = holtWinters(y, a, b, g, 12); fitted = r.fitted; forecast = r.forecast(H)
    }
    rmseVal = rmse(y, fitted)
    setErr(rmseVal)

    Plotly.react(plotRef.current, [
      { x: t, y, mode: 'lines+markers', type: 'scatter', name: 'Observed', line: { color: COLOR, width: 2 }, marker: { size: 4 } },
      { x: t, y: fitted, mode: 'lines', type: 'scatter', name: 'Fitted', line: { color: METHODS[m].color, width: 2 } },
      { x: future, y: forecast, mode: 'lines+markers', type: 'scatter', name: 'Forecast', line: { color: METHODS[m].color, width: 2, dash: 'dash' }, marker: { size: 5 } },
    ], plotlyLayout({
      title: { text: `${METHODS[m].label} — RMSE ${rmseVal.toFixed(2)}`, font: { size: 13 } },
      xaxis: { title: 't (months)' }, yaxis: { title: 'value' },
      legend: { orientation: 'h', y: -0.25 },
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(method, alpha, beta, gamma) }, []) // eslint-disable-line

  function update(next) {
    const m = { method, alpha, beta, gamma, ...next }
    setMethod(m.method); setAlpha(m.alpha); setBeta(m.beta); setGamma(m.gamma)
    render(m.method, m.alpha, m.beta, m.gamma)
  }

  const needs = METHODS[method].needs

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {Object.entries(METHODS).map(([key, cfg]) => (
          <button key={key} onClick={() => update({ method: key })}
            style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid var(--border, #ccc)',
              background: method === key ? cfg.color : 'transparent', color: method === key ? '#fff' : 'var(--text)',
              cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
            {cfg.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {needs.includes('alpha') && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            α (level) <input type="range" min="0.05" max="0.95" step="0.05" value={alpha} onChange={e => update({ alpha: +e.target.value })} /> <strong>{alpha.toFixed(2)}</strong>
          </label>
        )}
        {needs.includes('beta') && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            β (trend) <input type="range" min="0.05" max="0.95" step="0.05" value={beta} onChange={e => update({ beta: +e.target.value })} /> <strong>{beta.toFixed(2)}</strong>
          </label>
        )}
        {needs.includes('gamma') && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            γ (season) <input type="range" min="0.05" max="0.95" step="0.05" value={gamma} onChange={e => update({ gamma: +e.target.value })} /> <strong>{gamma.toFixed(2)}</strong>
          </label>
        )}
      </div>

      <div ref={plotRef} style={{ minHeight: 300 }} />

      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem' }}>
        Each parameter is a weight on "how much to trust the newest observation" for that component — high α chases noise, low α barely updates.
        In practice these aren't hand-tuned: fit them by minimizing in-sample RMSE (or SSE) — <code>statsmodels</code>' <code>ExponentialSmoothing(...).fit()</code> does exactly that search for you. Current RMSE: <strong>{err.toFixed(2)}</strong>.
      </p>
    </div>
  )
}
