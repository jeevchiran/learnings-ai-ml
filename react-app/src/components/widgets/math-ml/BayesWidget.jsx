import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { bayes } from './probabilityUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const N = 200, COLS = 20
const CAT_COLOR = { TP: '#16a34a', FN: '#86efac', FP: '#dc2626', TN: '#fca5a5' }
const CAT_LABEL = { TP: 'Has A, tests positive', FN: 'Has A, tests negative', FP: "Doesn't have A, false positive", TN: "Doesn't have A, true negative" }

// A 200-person icon array beats an abstract formula: watch how a rare
// condition (low prior) drowns true positives in false positives even with
// a "90% accurate" test — the classic Bayes' theorem gotcha.
export default function BayesWidget() {
  const gridRef = useRef(null)
  const [pA, setPA] = useState(0.02)
  const [pBgivenA, setPBgivenA] = useState(0.9)
  const [pBgivenNotA, setPBgivenNotA] = useState(0.08)

  const render = useCallback((prior, sens, fpr) => {
    const nA = Math.round(N * prior)
    const nNotA = N - nA
    const tp = Math.round(nA * sens), fn = nA - tp
    const fp = Math.round(nNotA * fpr), tn = nNotA - fp

    const cats = [...Array(tp).fill('TP'), ...Array(fn).fill('FN'), ...Array(fp).fill('FP'), ...Array(tn).fill('TN')]
    const xs = cats.map((_, i) => i % COLS)
    const ys = cats.map((_, i) => -Math.floor(i / COLS))

    const traces = ['TP', 'FN', 'FP', 'TN'].map(cat => {
      const idx = cats.map((c, i) => (c === cat ? i : -1)).filter(i => i >= 0)
      return {
        x: idx.map(i => xs[i]), y: idx.map(i => ys[i]), mode: 'markers', type: 'scatter',
        marker: { color: CAT_COLOR[cat], size: 11, symbol: 'square' }, name: `${cat} — ${CAT_LABEL[cat]}`,
      }
    })

    Plotly.react(gridRef.current, traces, plotlyLayout({
      title: { text: `${N}-person population — ${nA} actually have A`, font: { size: 13 } },
      xaxis: { visible: false }, yaxis: { visible: false, scaleanchor: 'x' },
      legend: { orientation: 'h', y: -0.05, font: { size: 10 } },
      margin: { t: 30, r: 10, b: 10, l: 10 },
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(pA, pBgivenA, pBgivenNotA) }, []) // eslint-disable-line

  function update(next) {
    const p = { pA, pBgivenA, pBgivenNotA, ...next }
    setPA(p.pA); setPBgivenA(p.pBgivenA); setPBgivenNotA(p.pBgivenNotA)
    render(p.pA, p.pBgivenA, p.pBgivenNotA)
  }

  const posterior = bayes(pA, pBgivenA, pBgivenNotA)

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          P(A) prior <input type="range" min="0.01" max="0.5" step="0.01" value={pA} onChange={e => update({ pA: +e.target.value })} /> <strong>{(pA * 100).toFixed(0)}%</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          P(B|A) sensitivity <input type="range" min="0.5" max="1" step="0.01" value={pBgivenA} onChange={e => update({ pBgivenA: +e.target.value })} /> <strong>{(pBgivenA * 100).toFixed(0)}%</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          P(B|¬A) false-positive rate <input type="range" min="0.01" max="0.3" step="0.01" value={pBgivenNotA} onChange={e => update({ pBgivenNotA: +e.target.value })} /> <strong>{(pBgivenNotA * 100).toFixed(0)}%</strong>
        </label>
      </div>

      <div ref={gridRef} style={{ minHeight: 340 }} />

      <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
        P(A|B) = <strong style={{ color: '#16a34a' }}>{(posterior * 100).toFixed(1)}%</strong> — of everyone who tests positive, only this fraction actually has A.
      </p>
      <p style={{ fontSize: '0.82rem', opacity: 0.75 }}>
        P(A|B) = P(B|A)P(A) / [P(B|A)P(A) + P(B|¬A)P(¬A)]. With a rare condition, even a "90% accurate" test drowns true positives (dark green) under false positives (dark red) from the much larger healthy population — push the prior down to see it happen.
      </p>
    </div>
  )
}
