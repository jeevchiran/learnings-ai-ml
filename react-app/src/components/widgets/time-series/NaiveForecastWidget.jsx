import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { generateSeries, naiveForecast, meanForecast, movingAverageForecast, rmse } from './timeSeriesUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#0369a1'
const METHOD_COLOR = { naive: '#dc2626', mean: '#7c3aed', ma: '#16a34a' }

// Same series, three "simple" one-step forecasters overlaid — watch which one
// actually tracks a trending/noisy series, and why RMSE ranks them the way it does.
export default function NaiveForecastWidget() {
  const plotRef = useRef(null)
  const barRef = useRef(null)
  const [window, setWindow] = useState(4)
  const [trendSlope, setTrendSlope] = useState(0.5)
  const dataRef = useRef(null)

  const render = useCallback((win, slope) => {
    const { t, y } = generateSeries({ n: 36, period: 12, trendSlope: slope, seasonalAmp: 0, noiseStd: 2.5, seed: 21 })
    dataRef.current = y
    const nf = naiveForecast(y)
    const mf = meanForecast(y)
    const maf = movingAverageForecast(y, win)

    Plotly.react(plotRef.current, [
      { x: t, y, mode: 'lines+markers', type: 'scatter', name: 'Observed', line: { color: COLOR, width: 2 }, marker: { size: 4 } },
      { x: t, y: nf, mode: 'lines', type: 'scatter', name: 'Naive (last value)', line: { color: METHOD_COLOR.naive, width: 1.5, dash: 'dot' } },
      { x: t, y: mf, mode: 'lines', type: 'scatter', name: 'Mean (expanding average)', line: { color: METHOD_COLOR.mean, width: 1.5, dash: 'dot' } },
      { x: t, y: maf, mode: 'lines', type: 'scatter', name: `Moving average (w=${win})`, line: { color: METHOD_COLOR.ma, width: 1.5, dash: 'dot' } },
    ], plotlyLayout({
      title: { text: 'One-step-ahead forecasts', font: { size: 13 } },
      xaxis: { title: 't' }, yaxis: { title: 'value' },
      legend: { orientation: 'h', y: -0.25 },
    }), PLOTLY_CONFIG)

    const rmses = { naive: rmse(y, nf), mean: rmse(y, mf), ma: rmse(y, maf) }
    Plotly.react(barRef.current, [{
      x: ['Naive', 'Mean', `Moving avg (w=${win})`],
      y: [rmses.naive, rmses.mean, rmses.ma],
      type: 'bar',
      marker: { color: [METHOD_COLOR.naive, METHOD_COLOR.mean, METHOD_COLOR.ma] },
      text: [rmses.naive, rmses.mean, rmses.ma].map(v => v.toFixed(2)),
      textposition: 'outside',
    }], plotlyLayout({
      title: { text: 'RMSE by method (lower is better)', font: { size: 13 } },
      xaxis: { title: '' }, yaxis: { title: 'RMSE' },
      showlegend: false,
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(window, trendSlope) }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          Trend strength
          <input type="range" min="0" max="1.5" step="0.1" value={trendSlope}
            onChange={e => { const v = +e.target.value; setTrendSlope(v); render(window, v) }} />
          <strong>{trendSlope.toFixed(1)}</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          Moving-average window
          <input type="range" min="2" max="10" step="1" value={window}
            onChange={e => { const v = +e.target.value; setWindow(v); render(v, trendSlope) }} />
          <strong>{window}</strong>
        </label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div ref={plotRef} style={{ minHeight: 280 }} />
        <div ref={barRef} style={{ minHeight: 280 }} />
      </div>
      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem', fontFamily: 'monospace' }}>
        RMSE = sqrt( mean( (yₜ − ŷₜ)² ) ) — same units as the series, punishes big misses harder than a plain average error.
      </p>
      <p style={{ fontSize: '0.82rem', opacity: 0.75 }}>
        Push the trend slider up: the <strong style={{ color: METHOD_COLOR.mean }}>mean</strong> forecast falls apart first because it ignores recency entirely.
      </p>
    </div>
  )
}
