import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { simulateSARIMA, acf, acfSignificance } from './timeSeriesUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#0369a1'
const SEASON = '#c2410c'
const M = 12
const N = 240
const MAX_LAG = 30

// SARIMA notation is the intimidating part; the behaviour isn't. Every knob here
// maps to one symbol in SARIMA(p,d,q)(P,D,Q)m, and each one leaves a different
// fingerprint on the ACF: φ decorates the first few lags, Φ puts spikes at 12/24,
// D makes the whole seasonal structure non-stationary until you difference it.
export default function SARIMAWidget() {
  const seriesRef = useRef(null)
  const acfRef = useRef(null)
  const [phi, setPhi] = useState(0.5)
  const [sphi, setSphi] = useState(0.7)
  const [d, setD] = useState(0)
  const [D, setBigD] = useState(0)

  const render = useCallback((p1, P1, dd, DD) => {
    const { t, y } = simulateSARIMA({
      n: N, phi: p1 ? [p1] : [], sphi: P1 ? [P1] : [],
      d: dd, D: DD, m: M, sigma: 1, level: 20, seed: 4,
    })
    const label = `SARIMA(${p1 ? 1 : 0},${dd},0)(${P1 ? 1 : 0},${DD},0)₁₂`

    Plotly.react(seriesRef.current, [
      { x: t, y, mode: 'lines', type: 'scatter', line: { color: COLOR, width: 1.4 }, name: 'series' },
    ], plotlyLayout({
      title: { text: `${label} — one realisation`, font: { size: 13 } },
      xaxis: { title: 't (months)', dtick: 24 }, yaxis: { title: 'value' }, showlegend: false,
      margin: { t: 34, r: 16, b: 40, l: 52 },
    }), PLOTLY_CONFIG)

    const a = acf(y, MAX_LAG).slice(1)
    const lags = Array.from({ length: MAX_LAG }, (_, i) => i + 1)
    const sig = acfSignificance(N)
    Plotly.react(acfRef.current, [
      { x: lags, y: a, type: 'bar', width: 0.3,
        marker: { color: lags.map(k => (k % M === 0 ? SEASON : (Math.abs(a[k - 1]) > sig ? COLOR : 'rgba(120,120,120,0.45)'))) },
        hovertemplate: 'lag %{x}: %{y:.3f}<extra></extra>' },
    ], plotlyLayout({
      title: { text: 'ACF — orange bars are the seasonal lags 12, 24', font: { size: 13 } },
      xaxis: { title: 'lag', dtick: 6 }, yaxis: { title: 'ρ(k)', range: [-1, 1] },
      shapes: [
        { type: 'line', x0: 0.5, x1: MAX_LAG + 0.5, y0: sig, y1: sig, line: { color: '#dc2626', width: 1, dash: 'dash' } },
        { type: 'line', x0: 0.5, x1: MAX_LAG + 0.5, y0: -sig, y1: -sig, line: { color: '#dc2626', width: 1, dash: 'dash' } },
      ],
      showlegend: false, margin: { t: 34, r: 16, b: 40, l: 52 },
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(phi, sphi, d, D) }, []) // eslint-disable-line

  const toggle = (label, on, onClick) => (
    <button onClick={onClick}
      style={{ padding: '0.3rem 0.8rem', borderRadius: 6, border: '1px solid var(--border, #ccc)',
        background: on ? COLOR : 'transparent', color: on ? '#fff' : 'var(--text)',
        cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>
      {label}
    </button>
  )

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          φ₁ (lag 1)
          <input type="range" min="0" max="0.9" step="0.1" value={phi}
            onChange={e => { const v = +e.target.value; setPhi(v); render(v, sphi, d, D) }} />
          <strong>{phi.toFixed(1)}</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          Φ₁ (lag 12)
          <input type="range" min="0" max="0.9" step="0.1" value={sphi}
            onChange={e => { const v = +e.target.value; setSphi(v); render(phi, v, d, D) }} />
          <strong>{sphi.toFixed(1)}</strong>
        </label>
        {toggle(d ? '✓ d = 1' : 'd = 0', d === 1, () => { const v = d ? 0 : 1; setD(v); render(phi, sphi, v, D) })}
        {toggle(D ? '✓ D = 1' : 'D = 0', D === 1, () => { const v = D ? 0 : 1; setBigD(v); render(phi, sphi, d, v) })}
      </div>

      <div ref={seriesRef} style={{ minHeight: 260 }} />
      <div ref={acfRef} style={{ minHeight: 260 }} />

      <p style={{ fontSize: '0.82rem', opacity: 0.8, marginTop: '0.5rem' }}>
        Push <strong>Φ₁</strong> up with everything else at zero: the series starts rhyming with itself twelve steps back,
        and the ACF grows spikes at exactly 12 and 24 while the lags in between stay quiet. That isolated-spike pattern is
        the fingerprint you look for before adding a seasonal block. Turning <strong>D = 1</strong> on seasonally
        integrates the process — the cycle now drifts instead of repeating around a fixed level, and the ACF stops
        decaying at all. That is the state a real seasonal series arrives in, and why you seasonally difference it back out.
      </p>
    </div>
  )
}
