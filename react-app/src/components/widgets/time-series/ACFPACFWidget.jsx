import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { simulateSARIMA, acf, pacf, acfSignificance } from './timeSeriesUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#0369a1'
const MAX_LAG = 16
const N = 300

// The Box-Jenkins identification table, made clickable. Simulate a process whose
// true (p, q) we know, then read the sample ACF/PACF back — the whole point is
// that the *cutoff* lands in a different panel depending on which side of the
// family the process came from.
const MODELS = {
  'AR(1)':     { phi: [0.75], theta: [],          acf: 'decays (geometric)', pacf: 'cuts off after lag 1', read: 'PACF cutoff → p = 1' },
  'AR(2)':     { phi: [0.55, 0.3], theta: [],     acf: 'decays',             pacf: 'cuts off after lag 2', read: 'PACF cutoff → p = 2' },
  'MA(1)':     { phi: [], theta: [0.8],           acf: 'cuts off after lag 1', pacf: 'decays',             read: 'ACF cutoff → q = 1' },
  'MA(2)':     { phi: [], theta: [0.7, 0.6],      acf: 'cuts off after lag 2', pacf: 'decays',             read: 'ACF cutoff → q = 2' },
  'ARMA(1,1)': { phi: [0.7], theta: [0.6],        acf: 'decays',             pacf: 'decays',              read: 'neither cuts off → mixed model, use AIC' },
  'White noise': { phi: [], theta: [],            acf: 'nothing significant', pacf: 'nothing significant', read: 'no structure left to model' },
}

function stemTraces(values, sig, lags) {
  return [
    {
      x: lags, y: values.slice(1), type: 'bar', width: 0.25,
      marker: { color: values.slice(1).map(v => (Math.abs(v) > sig ? COLOR : 'rgba(120,120,120,0.45)')) },
      hovertemplate: 'lag %{x}: %{y:.3f}<extra></extra>',
    },
  ]
}

export default function ACFPACFWidget() {
  const seriesRef = useRef(null)
  const acfRef = useRef(null)
  const pacfRef = useRef(null)
  const [name, setName] = useState('AR(1)')

  const render = useCallback((key) => {
    const spec = MODELS[key]
    const { t, y } = simulateSARIMA({ n: N, phi: spec.phi, theta: spec.theta, sigma: 1, seed: 21 })
    const sig = acfSignificance(N)
    const lags = Array.from({ length: MAX_LAG }, (_, i) => i + 1)
    const band = [
      { type: 'line', x0: 0.5, x1: MAX_LAG + 0.5, y0: sig, y1: sig, line: { color: '#dc2626', width: 1, dash: 'dash' } },
      { type: 'line', x0: 0.5, x1: MAX_LAG + 0.5, y0: -sig, y1: -sig, line: { color: '#dc2626', width: 1, dash: 'dash' } },
    ]

    Plotly.react(seriesRef.current, [
      { x: t.slice(0, 120), y: y.slice(0, 120), mode: 'lines', type: 'scatter', line: { color: COLOR, width: 1.4 } },
    ], plotlyLayout({
      title: { text: `Simulated ${key} — first 120 of ${N} points`, font: { size: 13 } },
      xaxis: { title: 't' }, yaxis: { title: 'value' }, showlegend: false,
      margin: { t: 34, r: 16, b: 40, l: 48 },
    }), PLOTLY_CONFIG)

    Plotly.react(acfRef.current, stemTraces(acf(y, MAX_LAG), sig, lags), plotlyLayout({
      title: { text: `ACF — ${spec.acf}`, font: { size: 13 } },
      xaxis: { title: 'lag', dtick: 2 }, yaxis: { title: 'ρ(k)', range: [-1, 1] },
      shapes: band, showlegend: false, margin: { t: 34, r: 16, b: 40, l: 48 },
    }), PLOTLY_CONFIG)

    Plotly.react(pacfRef.current, stemTraces(pacf(y, MAX_LAG), sig, lags), plotlyLayout({
      title: { text: `PACF — ${spec.pacf}`, font: { size: 13 } },
      xaxis: { title: 'lag', dtick: 2 }, yaxis: { title: 'φ(k,k)', range: [-1, 1] },
      shapes: band, showlegend: false, margin: { t: 34, r: 16, b: 40, l: 48 },
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(name) }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {Object.keys(MODELS).map(k => (
          <button key={k} onClick={() => { setName(k); render(k) }}
            style={{ padding: '0.3rem 0.75rem', borderRadius: 6, border: '1px solid var(--border, #ccc)',
              background: k === name ? COLOR : 'transparent', color: k === name ? '#fff' : 'var(--text)',
              cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>
            {k}
          </button>
        ))}
      </div>

      <div ref={seriesRef} style={{ minHeight: 220 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        <div ref={acfRef} style={{ minHeight: 260 }} />
        <div ref={pacfRef} style={{ minHeight: 260 }} />
      </div>

      <p style={{ fontSize: '0.82rem', opacity: 0.8, marginTop: '0.5rem' }}>
        <strong>Verdict for {name}:</strong> {MODELS[name].read}. Bars inside the dashed ±1.96/√n band are
        statistically indistinguishable from zero (greyed out). Flip between <em>AR(2)</em> and <em>MA(2)</em>: the
        cutoff swaps panels. That swap <em>is</em> the identification rule — PACF cutoff gives p, ACF cutoff gives q,
        and when neither cuts off cleanly you are looking at an ARMA and have to select the order by AIC instead.
      </p>
    </div>
  )
}
