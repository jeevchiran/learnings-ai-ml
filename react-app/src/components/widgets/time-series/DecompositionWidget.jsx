import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { generateSeries, classicalDecompose } from './timeSeriesUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#0369a1'

// Build a synthetic series from trend + seasonality + noise, then decompose it
// back into those three parts — makes "additive vs multiplicative" and
// "what is a component" concrete instead of abstract.
export default function DecompositionWidget() {
  const seriesRef = useRef(null)
  const seasonalRef = useRef(null)
  const residualRef = useRef(null)

  const [mode, setMode] = useState('additive')
  const [trendSlope, setTrendSlope] = useState(0.6)
  const [seasonalAmp, setSeasonalAmp] = useState(8)
  const [noiseStd, setNoiseStd] = useState(2)

  const render = useCallback((m, slope, amp, noise) => {
    const { t, y, trend } = generateSeries({ n: 48, period: 12, trendSlope: slope, seasonalAmp: amp, noiseStd: noise, mode: m, seed: 7 })
    const { trend: fittedTrend, seasonal, residual } = classicalDecompose(y, 12, m)

    Plotly.react(seriesRef.current, [
      { x: t, y, mode: 'lines+markers', type: 'scatter', name: 'Observed', line: { color: COLOR, width: 2 }, marker: { size: 4 } },
      { x: t, y: trend, mode: 'lines', type: 'scatter', name: 'True trend', line: { color: '#dc2626', width: 2, dash: 'dash' } },
      { x: t, y: fittedTrend, mode: 'lines', type: 'scatter', name: 'Estimated trend (centered MA)', line: { color: '#16a34a', width: 2 } },
    ], plotlyLayout({
      title: { text: `Observed series — ${m}`, font: { size: 13 } },
      xaxis: { title: 't (months)' }, yaxis: { title: 'value' },
      legend: { orientation: 'h', y: -0.25 },
    }), PLOTLY_CONFIG)

    Plotly.react(seasonalRef.current, [
      { x: t, y: seasonal, mode: 'lines', type: 'scatter', line: { color: '#7c3aed', width: 2 } },
    ], plotlyLayout({
      title: { text: 'Seasonal component', font: { size: 13 } },
      xaxis: { title: 't' }, yaxis: { title: m === 'additive' ? 'offset' : 'factor' },
      showlegend: false,
    }), PLOTLY_CONFIG)

    Plotly.react(residualRef.current, [
      { x: t, y: residual, mode: 'markers', type: 'scatter', marker: { color: '#6b7280', size: 5 } },
    ], plotlyLayout({
      title: { text: 'Residual (noise left over)', font: { size: 13 } },
      xaxis: { title: 't' }, yaxis: { title: m === 'additive' ? 'error' : 'ratio' },
      showlegend: false,
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(mode, trendSlope, seasonalAmp, noiseStd) }, []) // eslint-disable-line

  function update(next) {
    const merged = { mode, trendSlope, seasonalAmp, noiseStd, ...next }
    setMode(merged.mode); setTrendSlope(merged.trendSlope); setSeasonalAmp(merged.seasonalAmp); setNoiseStd(merged.noiseStd)
    render(merged.mode, merged.trendSlope, merged.seasonalAmp, merged.noiseStd)
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['additive', 'multiplicative'].map(m => (
            <button key={m} onClick={() => update({ mode: m })}
              style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid var(--border, #ccc)',
                background: mode === m ? COLOR : 'transparent', color: mode === m ? '#fff' : 'var(--text)',
                cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit', textTransform: 'capitalize' }}>
              {m}
            </button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          Trend slope
          <input type="range" min="0" max="2" step="0.1" value={trendSlope} onChange={e => update({ trendSlope: +e.target.value })} />
          <strong>{trendSlope.toFixed(1)}</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          Seasonal amplitude
          <input type="range" min="0" max="20" step="1" value={seasonalAmp} onChange={e => update({ seasonalAmp: +e.target.value })} />
          <strong>{seasonalAmp}</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          Noise
          <input type="range" min="0" max="8" step="0.5" value={noiseStd} onChange={e => update({ noiseStd: +e.target.value })} />
          <strong>{noiseStd}</strong>
        </label>
      </div>

      <div ref={seriesRef} style={{ minHeight: 260, marginBottom: '0.5rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div ref={seasonalRef} style={{ minHeight: 220 }} />
        <div ref={residualRef} style={{ minHeight: 220 }} />
      </div>
      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem' }}>
        {mode === 'additive'
          ? 'Additive: y = Trend + Seasonal + Residual — seasonal swings stay a constant size regardless of the trend level.'
          : 'Multiplicative: y = Trend × Seasonal × Residual — seasonal swings grow proportionally as the trend rises.'}
      </p>
    </div>
  )
}
