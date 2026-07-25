import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { bernoulliPMF, binomialPMF, poissonPMF, gaussianPDF } from './probabilityUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#475569'
const DISTS = ['Bernoulli', 'Binomial', 'Poisson', 'Gaussian']

// Four distributions that keep showing up as ML modeling assumptions —
// Bernoulli/Binomial for binary outcomes and classification loss, Poisson
// for counts, Gaussian for continuous noise. Same widget, different shape.
export default function DistributionsWidget() {
  const plotRef = useRef(null)
  const [dist, setDist] = useState('Binomial')
  const [p, setP] = useState(0.3)
  const [n, setN] = useState(20)
  const [lambda, setLambda] = useState(4)
  const [mu, setMu] = useState(0)
  const [sigma, setSigma] = useState(1)

  const render = useCallback((d, pp, nn, lam, m, s) => {
    let trace
    if (d === 'Bernoulli') {
      trace = { x: [0, 1], y: [bernoulliPMF(pp, 0), bernoulliPMF(pp, 1)], type: 'bar', marker: { color: COLOR } }
    } else if (d === 'Binomial') {
      const ks = Array.from({ length: nn + 1 }, (_, k) => k)
      trace = { x: ks, y: ks.map(k => binomialPMF(nn, pp, k)), type: 'bar', marker: { color: COLOR } }
    } else if (d === 'Poisson') {
      const kmax = Math.max(10, Math.ceil(lam * 3))
      const ks = Array.from({ length: kmax + 1 }, (_, k) => k)
      trace = { x: ks, y: ks.map(k => poissonPMF(lam, k)), type: 'bar', marker: { color: COLOR } }
    } else {
      const xs = Array.from({ length: 200 }, (_, i) => m - 4 * s + (i / 199) * 8 * s)
      trace = { x: xs, y: xs.map(x => gaussianPDF(x, m, s)), type: 'scatter', mode: 'lines', fill: 'tozeroy', line: { color: COLOR, width: 2 } }
    }

    Plotly.react(plotRef.current, [trace], plotlyLayout({
      title: { text: `${d}${d === 'Gaussian' ? ' PDF' : ' PMF'}`, font: { size: 13 } },
      xaxis: { title: d === 'Gaussian' ? 'x' : 'k' }, yaxis: { title: d === 'Gaussian' ? 'density' : 'P(X=k)' },
      showlegend: false,
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(dist, p, n, lambda, mu, sigma) }, []) // eslint-disable-line

  function switchDist(d) { setDist(d); render(d, p, n, lambda, mu, sigma) }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {DISTS.map(d => (
          <button key={d} onClick={() => switchDist(d)}
            style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid var(--border, #ccc)',
              background: dist === d ? COLOR : 'transparent', color: dist === d ? '#fff' : 'var(--text)',
              cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
            {d}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {dist === 'Bernoulli' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            p <input type="range" min="0.05" max="0.95" step="0.05" value={p} onChange={e => { const v = +e.target.value; setP(v); render(dist, v, n, lambda, mu, sigma) }} /> <strong>{p.toFixed(2)}</strong>
          </label>
        )}
        {dist === 'Binomial' && (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              n <input type="range" min="2" max="40" step="1" value={n} onChange={e => { const v = +e.target.value; setN(v); render(dist, p, v, lambda, mu, sigma) }} /> <strong>{n}</strong>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              p <input type="range" min="0.05" max="0.95" step="0.05" value={p} onChange={e => { const v = +e.target.value; setP(v); render(dist, v, n, lambda, mu, sigma) }} /> <strong>{p.toFixed(2)}</strong>
            </label>
          </>
        )}
        {dist === 'Poisson' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            λ <input type="range" min="0.5" max="15" step="0.5" value={lambda} onChange={e => { const v = +e.target.value; setLambda(v); render(dist, p, n, v, mu, sigma) }} /> <strong>{lambda}</strong>
          </label>
        )}
        {dist === 'Gaussian' && (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              μ <input type="range" min="-3" max="3" step="0.5" value={mu} onChange={e => { const v = +e.target.value; setMu(v); render(dist, p, n, lambda, v, sigma) }} /> <strong>{mu}</strong>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              σ <input type="range" min="0.3" max="3" step="0.1" value={sigma} onChange={e => { const v = +e.target.value; setSigma(v); render(dist, p, n, lambda, mu, v) }} /> <strong>{sigma.toFixed(1)}</strong>
            </label>
          </>
        )}
      </div>

      <div ref={plotRef} style={{ minHeight: 300 }} />
      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem' }}>
        Bernoulli/Binomial ⇒ binary classification loss assumptions. Gaussian ⇒ regression noise, weight priors. Poisson ⇒ modeling counts (event rates). Notice Binomial(n, p) starts looking Gaussian as n grows — the Central Limit Theorem, visually.
      </p>
    </div>
  )
}
