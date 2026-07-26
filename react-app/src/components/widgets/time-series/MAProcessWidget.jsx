import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { simulateSARIMA } from './timeSeriesUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#0369a1'
const SHOCK = '#dc2626'
const AR_COLOR = '#7c3aed'
const H = 10

// MA(q) is the half of the family people skip, because "regress on past errors"
// sounds circular. It isn't: the shocks are the raw material, and y_t is a
// moving *window* over the last q+1 of them. Two things to see here — the series
// is literally a smoothed copy of the shock bars, and one shock's influence dies
// dead at lag q (finite memory), unlike AR's forever-decaying tail.
export default function MAProcessWidget() {
  const shockRef = useRef(null)
  const seriesRef = useRef(null)
  const impulseRef = useRef(null)
  const [q, setQ] = useState(2)
  const [theta, setTheta] = useState(0.8)

  const render = useCallback((qq, th) => {
    const thetas = Array.from({ length: qq }, () => th)
    const { t, y, eps } = simulateSARIMA({ n: 80, theta: thetas, sigma: 1, seed: 33 })

    Plotly.react(shockRef.current, [
      { x: t, y: eps, type: 'bar', marker: { color: SHOCK, opacity: 0.75 }, name: 'shock εₜ' },
    ], plotlyLayout({
      title: { text: 'White-noise shocks εₜ — the raw material', font: { size: 13 } },
      xaxis: { title: 't' }, yaxis: { title: 'ε' }, showlegend: false,
      margin: { t: 34, r: 16, b: 36, l: 48 },
    }), PLOTLY_CONFIG)

    Plotly.react(seriesRef.current, [
      { x: t, y: eps, type: 'bar', marker: { color: SHOCK, opacity: 0.2 }, name: 'εₜ' },
      { x: t, y, mode: 'lines', type: 'scatter', line: { color: COLOR, width: 2 }, name: `MA(${qq}) series` },
    ], plotlyLayout({
      title: { text: `yₜ = εₜ + ${thetas.map((v, i) => `${v.toFixed(1)}·εₜ₋${i + 1}`).join(' + ') || '(q = 0: pure noise)'}`, font: { size: 13 } },
      xaxis: { title: 't' }, yaxis: { title: 'y' },
      legend: { orientation: 'h', y: -0.28 }, margin: { t: 34, r: 16, b: 60, l: 48 },
    }), PLOTLY_CONFIG)

    const lags = Array.from({ length: H }, (_, i) => i)
    const maResponse = lags.map(j => (j === 0 ? 1 : (j <= qq ? th : 0)))
    const arResponse = lags.map(j => th ** j)
    Plotly.react(impulseRef.current, [
      { x: lags, y: maResponse, type: 'bar', marker: { color: COLOR }, name: `MA(${qq}) — dies at lag ${qq}` },
      { x: lags, y: arResponse, type: 'scatter', mode: 'lines+markers', line: { color: AR_COLOR, width: 2, dash: 'dot' }, name: `AR(1), φ=${th.toFixed(1)} — never quite zero` },
    ], plotlyLayout({
      title: { text: 'Effect of ONE unit shock at lag 0, j steps later', font: { size: 13 } },
      xaxis: { title: 'lags after the shock', dtick: 1 }, yaxis: { title: 'effect on y' },
      legend: { orientation: 'h', y: -0.28 }, margin: { t: 34, r: 16, b: 60, l: 48 },
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(q, theta) }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          Order q
          <input type="range" min="0" max="4" step="1" value={q}
            onChange={e => { const v = +e.target.value; setQ(v); render(v, theta) }} />
          <strong>MA({q})</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          Every θⱼ
          <input type="range" min="-0.9" max="0.9" step="0.1" value={theta}
            onChange={e => { const v = +e.target.value; setTheta(v); render(q, v) }} />
          <strong>{theta.toFixed(1)}</strong>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
        <div ref={shockRef} style={{ minHeight: 230 }} />
        <div ref={seriesRef} style={{ minHeight: 230 }} />
      </div>
      <div ref={impulseRef} style={{ minHeight: 270 }} />

      <p style={{ fontSize: '0.82rem', opacity: 0.8, marginTop: '0.5rem' }}>
        Turn θ up and the MA series gets visibly smoother than the shock bars underneath it — each y is an average over
        a window of the last q+1 shocks. The bottom panel is the reason the ACF cuts off at exactly q: after q lags, two
        observations share <em>no</em> shocks, so their correlation is genuinely zero. An AR process (dotted) never gets
        there — its influence decays geometrically but stays nonzero forever, which is why its ACF only ever tapers.
      </p>
    </div>
  )
}
