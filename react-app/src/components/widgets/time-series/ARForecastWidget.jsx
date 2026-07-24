import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { generateSeries, fitAR, forecastAR } from './timeSeriesUtils.js'
import { approximateNormalQuantile, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#0369a1'

// Fit AR(p) via Yule-Walker, forecast h steps ahead, and show the prediction
// interval widen with horizon — the point this module is built around: a PI
// for a *future value* is never a flat band, because forecast-error variance
// compounds step by step (unlike a CI for a fixed parameter/mean).
export default function ARForecastWidget() {
  const plotRef = useRef(null)
  const [order, setOrder] = useState(2)
  const [confLevel, setConfLevel] = useState(0.95)
  const dataRef = useRef(null)

  const render = useCallback((p, conf) => {
    if (!dataRef.current) dataRef.current = generateSeries({ n: 48, period: 12, trendSlope: 0, seasonalAmp: 0, noiseStd: 2.5, level: 30, seed: 5 })
    const { t, y } = dataRef.current
    const H = 12
    const model = fitAR(y, p)
    const z = approximateNormalQuantile(1 - (1 - conf) / 2)
    const fc = forecastAR(y, model, H, z)
    const future = Array.from({ length: H }, (_, i) => t[t.length - 1] + i + 1)

    Plotly.react(plotRef.current, [
      { x: [...future, ...[...future].reverse()], y: [...fc.upper, ...[...fc.lower].reverse()],
        fill: 'toself', fillcolor: 'rgba(3,105,161,0.15)', line: { color: 'transparent' },
        name: `${Math.round(conf * 100)}% prediction interval`, type: 'scatter' },
      { x: t, y, mode: 'lines+markers', type: 'scatter', name: 'Observed', line: { color: '#111827', width: 1.5 }, marker: { size: 4 } },
      { x: future, y: fc.point, mode: 'lines+markers', type: 'scatter', name: `AR(${p}) forecast`, line: { color: COLOR, width: 2 }, marker: { size: 5 } },
    ], plotlyLayout({
      title: { text: `AR(${p}) — φ = [${model.phi.map(v => v.toFixed(2)).join(', ')}]`, font: { size: 13 } },
      xaxis: { title: 't' }, yaxis: { title: 'value' },
      legend: { orientation: 'h', y: -0.25 },
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(order, confLevel) }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          Order p
          <input type="range" min="1" max="4" step="1" value={order}
            onChange={e => { const v = +e.target.value; setOrder(v); render(v, confLevel) }} />
          <strong>AR({order})</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          Interval level
          <input type="range" min="0.8" max="0.99" step="0.01" value={confLevel}
            onChange={e => { const v = +e.target.value; setConfLevel(v); render(order, v) }} />
          <strong>{Math.round(confLevel * 100)}%</strong>
        </label>
      </div>

      <div ref={plotRef} style={{ minHeight: 320 }} />

      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem' }}>
        AR(p): ŷₜ = φ₁yₜ₋₁ + φ₂yₜ₋₂ + ⋯ + φₚyₜ₋ₚ, fit by solving the Yule-Walker equations from the sample ACF.
        The band is a <strong>prediction interval</strong> for a future observed value — it widens with horizon because each extra step compounds new forecast error.
        A <strong>confidence interval</strong> instead bounds a fixed quantity (e.g. the mean level) and stays roughly the same width regardless of horizon. PIs are always the wider of the two.
      </p>
    </div>
  )
}
