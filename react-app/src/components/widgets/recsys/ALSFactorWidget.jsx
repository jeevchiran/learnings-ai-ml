import { useEffect, useRef, useState, useMemo } from 'react'
import Plotly from 'plotly.js-dist-min'
import {
  splitByTime, buildMatrix, trainALS, alsScores, rankScores, evaluate, testTargets,
  ITEM_IDS, USER_IDS, USERS, PRODUCTS, productName, dot,
} from './recsysUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const TRACK = '#65a30d'
const CAT_COLOR = { audio: '#0891b2', desk: '#7c3aed', fitness: '#65a30d', kitchen: '#ca8a04', mobile: '#db2777' }

/* Train implicit ALS live. Two knobs that actually matter — latent dimension k
 * and confidence scaling alpha — plus the loss curve and the 2-D map the model
 * learned. Watch products from the same aisle drift together. */
export default function ALSFactorWidget() {
  const mapRef = useRef(null)
  const lossRef = useRef(null)
  const [k, setK] = useState(2)
  const [alpha, setAlpha] = useState(1.0)
  const [reg, setReg] = useState(0.1)

  const { train } = splitByTime()
  const M = useMemo(() => buildMatrix(train), [])   // eslint-disable-line

  const fit = useMemo(() => trainALS(M, { k, alpha, reg, iters: 20, seed: 7 }), [M, k, alpha, reg])
  const evalRes = useMemo(
    () => evaluate(u => rankScores(alsScores(fit.X, fit.Y, u)), testTargets(), 3),
    [fit])

  useEffect(() => {
    // Project to 2-D: for k=1 pad with zeros, for k>2 just show the first two
    // factors. Honest and cheap — a real projection would need PCA/t-SNE.
    const xy = f => [f[0] ?? 0, f[1] ?? 0]
    const iPts = ITEM_IDS.map((id, j) => ({ id, p: xy(fit.Y[j]) }))
    const uPts = USER_IDS.map((id, i) => ({ id, p: xy(fit.X[i]) }))

    Plotly.react(mapRef.current, [
      {
        x: iPts.map(d => d.p[0]), y: iPts.map(d => d.p[1]),
        text: iPts.map(d => productName(d.id)), mode: 'markers+text', type: 'scatter',
        textposition: 'top center', textfont: { size: 9 }, name: 'products',
        marker: { size: 11, color: PRODUCTS.map(p => CAT_COLOR[p.cat] ?? '#888'), symbol: 'circle' },
      },
      {
        x: uPts.map(d => d.p[0]), y: uPts.map(d => d.p[1]),
        text: uPts.map(d => USERS[USER_IDS.indexOf(d.id)].name), mode: 'markers+text', type: 'scatter',
        textposition: 'bottom center', textfont: { size: 9, color: '#dc2626' }, name: 'shoppers',
        marker: { size: 10, color: '#dc2626', symbol: 'x' },
      },
    ], plotlyLayout({
      xaxis: { title: 'factor 1', zeroline: true },
      yaxis: { title: k >= 2 ? 'factor 2' : '(k=1: nothing here)', zeroline: true },
      legend: { orientation: 'h', y: -0.2 },
      margin: { t: 12, r: 12, b: 55, l: 45 },
    }), PLOTLY_CONFIG)

    Plotly.react(lossRef.current, [{
      x: fit.losses.map((_, i) => i + 1), y: fit.losses,
      mode: 'lines+markers', type: 'scatter', line: { color: TRACK, width: 2 }, marker: { size: 4 },
    }], plotlyLayout({
      xaxis: { title: 'ALS sweep' }, yaxis: { title: 'weighted loss' },
      showlegend: false, margin: { t: 12, r: 12, b: 40, l: 55 },
    }), PLOTLY_CONFIG)
  }, [fit, k])

  // One reconstructed cell, shown as arithmetic
  const u0 = 0, i0 = ITEM_IDS.indexOf('P5')
  const pred = dot(fit.X[u0], fit.Y[i0])

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', marginBottom: '0.7rem', fontSize: '0.83rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          latent dim k
          <input type="range" min="1" max="5" step="1" value={k} onChange={e => setK(+e.target.value)} />
          <strong>{k}</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          confidence α
          <input type="range" min="0" max="8" step="0.5" value={alpha} onChange={e => setAlpha(+e.target.value)} />
          <strong>{alpha.toFixed(1)}</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          regularisation λ
          <input type="range" min="0.01" max="2" step="0.01" value={reg} onChange={e => setReg(+e.target.value)} />
          <strong>{reg.toFixed(2)}</strong>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '0.75rem' }}>
        <div ref={mapRef} style={{ minHeight: 300 }} />
        <div ref={lossRef} style={{ minHeight: 300 }} />
      </div>

      <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', opacity: 0.85, marginTop: '0.4rem', lineHeight: 1.75 }}>
        c(u,i) = 1 + α·r(u,i) &nbsp;&nbsp; p(u,i) = 1 if r &gt; 0 else 0<br />
        score(Aarav, USB-C Hub) = x_Aarav · y_hub = <strong style={{ color: TRACK }}>{pred.toFixed(3)}</strong>
        &nbsp;(observed r = {M[u0][i0]}, so p = 1 — the model is trying to hit 1.0 here)
      </div>

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', fontSize: '0.82rem', marginTop: '0.5rem' }}>
        <span>final loss <strong>{fit.losses.at(-1).toFixed(2)}</strong></span>
        <span>HitRate@3 <strong style={{ color: TRACK }}>{evalRes.hitRate.toFixed(3)}</strong></span>
        <span>NDCG@3 <strong style={{ color: TRACK }}>{evalRes.ndcg.toFixed(3)}</strong></span>
        <span>params <strong>{(USER_IDS.length + ITEM_IDS.length) * k}</strong> vs {USER_IDS.length * ITEM_IDS.length} matrix cells</span>
      </div>

      <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.55rem', lineHeight: 1.65 }}>
        Drop <strong>α to 0</strong>: every cell now carries confidence 1, observed and unobserved alike, so the
        model's best move is to predict ≈0 everywhere and the loss curve flattens uselessly. α is what tells
        ALS "a cell with 14 points of evidence matters more than an empty one" — it is the entire difference
        between implicit and explicit MF. Push <strong>k to 5</strong> and the loss keeps dropping while the map
        gets less readable: with 34 events and {(USER_IDS.length + ITEM_IDS.length) * 5} parameters you are
        memorising, not generalising. That is what λ is fighting.
      </p>
    </div>
  )
}
