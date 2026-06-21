import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'

const CFG = { responsive: true, displayModeBar: false }

const DEFAULT_CORPUS = `the dog chased the cat
the cat ran from the dog
the dog barked at the cat
a cat sat on the mat
the mat was on the floor
cats and dogs are pets
pets like cats need care
dogs chase cats in the park
the park has many animals
animals like dogs and cats`

function parseCorpus(text) {
  return text.trim().split('\n')
    .map(line => line.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 0))
    .filter(sent => sent.length > 0)
}

function buildCooc(sentences, window) {
  const wordCounts = {}
  const coocRaw = {}
  let total = 0

  sentences.forEach(sent => {
    sent.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; total++ })
    for (let i = 0; i < sent.length; i++) {
      for (let j = Math.max(0, i - window); j <= Math.min(sent.length - 1, i + window); j++) {
        if (i === j) continue
        const key = sent[i] + '|||' + sent[j]
        coocRaw[key] = (coocRaw[key] || 0) + 1
      }
    }
  })

  const vocab = Object.keys(wordCounts).sort()
  const V = vocab.length
  const w2i = {}
  vocab.forEach((w, i) => { w2i[w] = i })

  const coocMat = Array.from({ length: V }, () => new Array(V).fill(0))
  Object.keys(coocRaw).forEach(key => {
    const [a, b] = key.split('|||')
    if (w2i[a] !== undefined && w2i[b] !== undefined)
      coocMat[w2i[a]][w2i[b]] = coocRaw[key]
  })

  let N_total = 0
  for (let i = 0; i < V; i++) for (let j = 0; j < V; j++) N_total += coocMat[i][j]

  const rowSums = vocab.map((_, i) => { let s = 0; for (let j = 0; j < V; j++) s += coocMat[i][j]; return s })
  const colSums = vocab.map((_, j) => { let s = 0; for (let i = 0; i < V; i++) s += coocMat[i][j]; return s })

  const ppmiMat = coocMat.map((row, i) =>
    row.map((cnt, j) => {
      if (!cnt || !N_total || !rowSums[i] || !colSums[j]) return 0
      const pmi = Math.log2((cnt / N_total) / ((rowSums[i] / N_total) * (colSums[j] / N_total)))
      return Math.max(0, pmi)
    })
  )

  return { vocab, w2i, coocMat, ppmiMat }
}

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] }
  if (!na || !nb) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

function CoocTable({ vocab, coocMat }) {
  const V = vocab.length
  let maxVal = 0
  for (let i = 0; i < V; i++) for (let j = 0; j < V; j++) if (coocMat[i][j] > maxVal) maxVal = coocMat[i][j]

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: `${Math.max(0.68, 0.85 - V * 0.015)}rem`, minWidth: `${V * 52 + 80}px` }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid var(--border,#d1d5db)', padding: '0.25rem 0.4rem', background: 'rgba(37,99,235,0.08)', textAlign: 'left' }}>Target \ Context</th>
            {vocab.map(w => <th key={w} style={{ border: '1px solid var(--border,#d1d5db)', padding: '0.25rem 0.4rem', background: 'rgba(37,99,235,0.08)', textAlign: 'center', whiteSpace: 'nowrap' }}>{w}</th>)}
          </tr>
        </thead>
        <tbody>
          {vocab.map((w, i) => (
            <tr key={w}>
              <td style={{ border: '1px solid var(--border,#d1d5db)', padding: '0.25rem 0.5rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{w}</td>
              {coocMat[i].map((val, j) => {
                const intensity = maxVal > 0 ? val / maxVal : 0
                const alpha = (intensity * 0.55).toFixed(3)
                const cellStyle = val > 0 ? { background: `rgba(37,99,235,${alpha})` } : { color: 'var(--text-muted,#6b7280)' }
                return <td key={j} style={{ border: '1px solid var(--border,#d1d5db)', padding: '0.25rem 0.4rem', textAlign: 'center', ...cellStyle }}>{val}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PPMIWidget() {
  const [corpus, setCorpus] = useState(DEFAULT_CORPUS)
  const [windowSize, setWindowSize] = useState(2)
  const [result, setResult] = useState(null)
  const [queryWord, setQueryWord] = useState('')
  const [queryResult, setQueryResult] = useState(null)
  const [error, setError] = useState('')
  const heatmapRef = useRef(null)

  function compute() {
    setError('')
    const sentences = parseCorpus(corpus)
    if (!sentences.length) { setError('Please enter at least one sentence.'); return }
    const res = buildCooc(sentences, windowSize)
    if (res.vocab.length < 2) { setError('Need at least 2 distinct words.'); return }
    setResult(res)
    setQueryResult(null)
  }

  useEffect(() => {
    if (!result || !heatmapRef.current) return
    const { vocab, ppmiMat } = result
    const trace = {
      type: 'heatmap',
      z: ppmiMat,
      x: vocab,
      y: vocab,
      colorscale: 'Blues',
      showscale: true,
      hoverongaps: false,
      hovertemplate: 'Target: %{y}<br>Context: %{x}<br>PPMI: %{z:.3f}<extra></extra>',
    }
    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { size: 10 },
      xaxis: { title: 'Context word', tickangle: -40, tickfont: { size: 9 }, automargin: true },
      yaxis: { title: 'Target word', tickfont: { size: 9 }, autorange: 'reversed', automargin: true },
      margin: { t: 20, r: 30, b: 100, l: 100 },
    }
    Plotly.react(heatmapRef.current, [trace], layout, CFG)
  }, [result])

  function handleQuery() {
    if (!result) { setError('Click Compute first.'); return }
    const qw = queryWord.trim().toLowerCase()
    if (!result.w2i.hasOwnProperty(qw)) { setQueryResult({ error: `"${qw}" not found in corpus vocabulary.` }); return }
    const qi = result.w2i[qw]
    const qVec = result.ppmiMat[qi]
    const sims = result.vocab
      .map((w, i) => i === qi ? null : { word: w, sim: cosineSim(qVec, result.ppmiMat[i]) })
      .filter(Boolean)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3)
    setQueryResult({ word: qw, sims })
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans,sans-serif)', fontSize: '0.9rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted,#6b7280)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Corpus (one sentence per line)</span>
          <textarea
            value={corpus}
            onChange={e => setCorpus(e.target.value)}
            rows={6}
            style={{ fontFamily: 'var(--font-mono,monospace)', fontSize: '0.8rem', padding: '0.4rem 0.6rem', border: '1px solid var(--border,#d1d5db)', borderRadius: '4px', background: 'var(--bg-secondary,#f9fafb)', color: 'var(--text,#111)', resize: 'vertical' }}
          />
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted,#6b7280)', textTransform: 'uppercase' }}>Window</span>
            <input type="number" min={1} max={5} value={windowSize} onChange={e => setWindowSize(parseInt(e.target.value) || 2)} style={{ ...inputStyle, width: '4rem' }} />
          </label>
          <button onClick={compute} style={btnStyle}>Compute</button>
        </div>
      </div>

      {error && <p style={{ color: 'var(--error,#dc2626)', fontSize: '0.85rem' }}>{error}</p>}

      {result && (
        <>
          <details style={{ marginBottom: '1rem' }}>
            <summary style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: '0.3rem 0', color: 'var(--accent-blue,#2563eb)' }}>
              Raw Co-occurrence Matrix ({result.vocab.length}×{result.vocab.length})
            </summary>
            <div style={{ marginTop: '0.5rem' }}>
              <CoocTable vocab={result.vocab} coocMat={result.coocMat} />
            </div>
          </details>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--accent-blue,#2563eb)' }}>PPMI Heatmap</div>
            <div ref={heatmapRef} style={{ height: `${Math.max(280, result.vocab.length * 22 + 140)}px` }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Enter a word to query..."
              value={queryWord}
              onChange={e => setQueryWord(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleQuery()}
              style={{ ...inputStyle, flex: 1, minWidth: '140px' }}
            />
            <button onClick={handleQuery} style={btnStyle}>Find Similar</button>
          </div>

          {queryResult && (
            <div style={{ marginTop: '0.75rem' }}>
              {queryResult.error ? (
                <p style={{ color: 'var(--error,#dc2626)', fontSize: '0.85rem' }}>{queryResult.error}</p>
              ) : (
                <>
                  <p style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    Top-3 most similar to <strong>{queryResult.word}</strong> (by cosine similarity over PPMI vectors):
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {queryResult.sims.map((item, rank) => (
                      <div key={item.word} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-secondary,#f9fafb)', border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', minWidth: '130px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted,#6b7280)' }}>#{rank + 1}</div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{item.word}</div>
                        <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono,monospace)', color: 'var(--accent-blue,#2563eb)' }}>cos = {item.sim.toFixed(4)}</div>
                        <div style={{ marginTop: '4px', height: '6px', background: 'var(--border,#d1d5db)', borderRadius: '3px' }}>
                          <div style={{ width: `${Math.max(2, item.sim * 100)}%`, height: '6px', background: 'var(--accent-blue,#2563eb)', borderRadius: '3px', transition: 'width 0.4s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const inputStyle = {
  fontFamily: 'var(--font-mono,monospace)',
  fontSize: '0.88rem',
  padding: '0.35rem 0.6rem',
  border: '1px solid var(--border,#d1d5db)',
  borderRadius: '4px',
  background: 'var(--bg-secondary,#f9fafb)',
  color: 'var(--text,#111)',
}

const btnStyle = {
  padding: '0.4rem 0.85rem',
  background: 'var(--accent-blue,#2563eb)',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  whiteSpace: 'nowrap',
}
