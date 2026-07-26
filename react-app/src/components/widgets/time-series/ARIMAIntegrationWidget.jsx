import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { simulateSARIMA, difference, forecastARIMA } from './timeSeriesUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#0369a1'
const HORIZON = 20
const TRUE_D = 1

// ARIMA in one picture: the I is not decoration. The data below is genuinely
// ARIMA(1,1,0) — a random walk with AR structure in its *changes*. Fit with
// d = 0 and the AR sits on a non-stationary series, so its forecast slides back
// toward a "mean" the series never had. Fit with d = 1 and the model works on
// the stationary differences, then integrates the answer back up.
export default function ARIMAIntegrationWidget() {
  const mainRef = useRef(null)
  const diffRef = useRef(null)
  const [d, setD] = useState(1)
  const dataRef = useRef(null)

  const render = useCallback((dd) => {
    if (!dataRef.current) {
      dataRef.current = simulateSARIMA({ n: 90, phi: [0.5], d: TRUE_D, sigma: 1.6, level: 40, seed: 12 })
    }
    const { t, y } = dataRef.current
    const fc = forecastARIMA(y, { p: 2, d: dd, h: HORIZON })
    const future = Array.from({ length: HORIZON }, (_, i) => t[t.length - 1] + i + 1)

    Plotly.react(mainRef.current, [
      { x: [...future, ...[...future].reverse()], y: [...fc.upper, ...[...fc.lower].reverse()],
        fill: 'toself', fillcolor: 'rgba(3,105,161,0.15)', line: { color: 'transparent' },
        name: '95% prediction interval', type: 'scatter' },
      { x: t, y, mode: 'lines', type: 'scatter', name: 'Observed (true process: ARIMA(1,1,0))', line: { color: '#111827', width: 1.5 } },
      { x: [t[t.length - 1], ...future], y: [y[y.length - 1], ...fc.point], mode: 'lines', type: 'scatter',
        name: `ARIMA(2,${dd},0) forecast`, line: { color: COLOR, width: 2.5 } },
    ], plotlyLayout({
      title: {
        text: dd === TRUE_D
          ? 'd = 1 — forecast carries on from where the series actually is'
          : (dd === 0
            ? 'd = 0 — AR on a non-stationary series: forecast drifts back to the sample mean'
            : 'd = 2 — overdifferenced: noisier fit, needlessly wide band'),
        font: { size: 13 },
      },
      xaxis: { title: 't' }, yaxis: { title: 'value' },
      legend: { orientation: 'h', y: -0.22 }, margin: { t: 34, r: 16, b: 70, l: 52 },
    }), PLOTLY_CONFIG)

    let w = y, tt = t
    for (let k = 0; k < dd; k++) { w = difference(w, 1); tt = tt.slice(1) }
    Plotly.react(diffRef.current, [
      { x: tt, y: w, mode: 'lines', type: 'scatter', line: { color: COLOR, width: 1.4 } },
    ], plotlyLayout({
      title: { text: dd === 0 ? 'Series the AR part is fit on (undifferenced)' : `Series the AR part is fit on: ∇${dd > 1 ? `^${dd}` : ''}yₜ`, font: { size: 13 } },
      xaxis: { title: 't' }, yaxis: { title: dd === 0 ? 'y' : 'change' }, showlegend: false,
      margin: { t: 34, r: 16, b: 40, l: 52 },
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(d) }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem' }}>Differencing order d:</span>
        {[0, 1, 2].map(v => (
          <button key={v} onClick={() => { setD(v); render(v) }}
            style={{ padding: '0.3rem 0.9rem', borderRadius: 6, border: '1px solid var(--border, #ccc)',
              background: v === d ? COLOR : 'transparent', color: v === d ? '#fff' : 'var(--text)',
              cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
            d = {v}
          </button>
        ))}
      </div>

      <div ref={mainRef} style={{ minHeight: 330 }} />
      <div ref={diffRef} style={{ minHeight: 220 }} />

      <p style={{ fontSize: '0.82rem', opacity: 0.8, marginTop: '0.5rem' }}>
        The bottom panel is what the AR coefficients are actually estimated from. At <strong>d = 0</strong> that series
        still wanders, the fitted mean is meaningless, and the forecast reverts to it. At <strong>d = 1</strong> it is
        flat noise — stationary, so the coefficients hold — and the forecast is integrated back onto the original scale,
        which is also why the band fans out so much faster (the ψ-weights get cumulatively summed). At
        <strong> d = 2</strong> nothing improves: overdifferencing adds variance and buys nothing.
      </p>
    </div>
  )
}
