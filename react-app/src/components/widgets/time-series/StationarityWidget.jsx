import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { generateSeries, difference, rollingMean, rollingStd, acf, acfSignificance } from './timeSeriesUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#0369a1'

// Toggle a trend on/off, then difference it away. Rolling mean/std made "the
// distribution changes over time" visible; the ACF bars made "how long memory
// lasts" visible. Differencing should flatten both.
export default function StationarityWidget() {
  const seriesRef = useRef(null)
  const acfRef = useRef(null)
  const [trendSlope, setTrendSlope] = useState(0.8)
  const [differenced, setDifferenced] = useState(false)

  const render = useCallback((slope, diffed) => {
    const { t, y: raw } = generateSeries({ n: 60, period: 12, trendSlope: slope, seasonalAmp: 0, noiseStd: 2.5, level: 20, seed: 11 })
    const y = diffed ? difference(raw, 1) : raw
    const tt = diffed ? t.slice(1) : t
    const win = 8
    const rm = rollingMean(y, win), rs = rollingStd(y, win)

    Plotly.react(seriesRef.current, [
      { x: tt, y, mode: 'lines', type: 'scatter', name: diffed ? 'Differenced series' : 'Raw series', line: { color: COLOR, width: 1.5 } },
      { x: tt, y: rm, mode: 'lines', type: 'scatter', name: `Rolling mean (w=${win})`, line: { color: '#dc2626', width: 2 } },
      { x: tt, y: rs, mode: 'lines', type: 'scatter', name: `Rolling std (w=${win})`, line: { color: '#7c3aed', width: 2, dash: 'dot' } },
    ], plotlyLayout({
      title: { text: diffed ? 'After 1st differencing — mean/std should look flat' : 'Raw series — watch the rolling mean drift', font: { size: 13 } },
      xaxis: { title: 't' }, yaxis: { title: 'value' },
      legend: { orientation: 'h', y: -0.25 },
    }), PLOTLY_CONFIG)

    const maxLag = 15
    const a = acf(y, maxLag)
    const sig = acfSignificance(y.length)
    Plotly.react(acfRef.current, [
      { x: Array.from({ length: maxLag + 1 }, (_, i) => i), y: a, type: 'bar', marker: { color: COLOR }, name: 'ACF' },
    ], plotlyLayout({
      title: { text: 'Autocorrelation (ACF) by lag', font: { size: 13 } },
      xaxis: { title: 'lag', dtick: 1 }, yaxis: { title: 'ρ(lag)', range: [-1, 1] },
      shapes: [
        { type: 'line', x0: 0, x1: maxLag, y0: sig, y1: sig, line: { color: '#dc2626', width: 1, dash: 'dash' } },
        { type: 'line', x0: 0, x1: maxLag, y0: -sig, y1: -sig, line: { color: '#dc2626', width: 1, dash: 'dash' } },
      ],
      showlegend: false,
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(trendSlope, differenced) }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          Trend strength
          <input type="range" min="0" max="1.5" step="0.1" value={trendSlope}
            onChange={e => { const v = +e.target.value; setTrendSlope(v); render(v, differenced) }} />
          <strong>{trendSlope.toFixed(1)}</strong>
        </label>
        <button onClick={() => { const v = !differenced; setDifferenced(v); render(trendSlope, v) }}
          style={{ padding: '0.3rem 0.9rem', borderRadius: 6, border: '1px solid var(--border, #ccc)',
            background: differenced ? COLOR : 'transparent', color: differenced ? '#fff' : 'var(--text)',
            cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
          {differenced ? '✓ Differenced (d=1)' : 'Apply 1st difference'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div ref={seriesRef} style={{ minHeight: 280 }} />
        <div ref={acfRef} style={{ minHeight: 280 }} />
      </div>

      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem' }}>
        Dashed red lines are the ~95% "no autocorrelation" band. With trend on, ACF decays <em>slowly</em> — a classic
        non-stationarity signature (this is the visual cousin of the ADF test). Difference the series and the rolling
        mean flattens, and the ACF bars mostly fall inside the band.
      </p>
    </div>
  )
}
