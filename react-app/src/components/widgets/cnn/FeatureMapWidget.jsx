import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'

const CFG = { responsive: true, displayModeBar: false }

// 16×16 "image" — a bright square in center on dark background
const BASE_IMG = Array.from({length:16}, (_,r) =>
  Array.from({length:16}, (_,c) =>
    (r >= 4 && r <= 11 && c >= 4 && c <= 11)
      ? (r === 4 || r === 11 || c === 4 || c === 11 ? 220 : 160)
      : 30
  )
)

const FILTERS = {
  'Original':     [[0,0,0],[0,1,0],[0,0,0]],
  'Edge Detect':  [[-1,-1,-1],[-1,8,-1],[-1,-1,-1]],
  'Horiz. Edge':  [[-1,-1,-1],[2,2,2],[-1,-1,-1]],
  'Vert. Edge':   [[-1,2,-1],[-1,2,-1],[-1,2,-1]],
  'Blur (3×3)':   [[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]],
  'Sharpen':      [[0,-1,0],[-1,5,-1],[0,-1,0]],
}

function apply(img, kernel) {
  const n = img.length
  return Array.from({length: n-2}, (_, r) =>
    Array.from({length: n-2}, (_, c) => {
      let s = 0
      for (let kr = 0; kr < 3; kr++)
        for (let kc = 0; kc < 3; kc++)
          s += img[r+kr][c+kc] * kernel[kr][kc]
      return Math.max(0, Math.min(255, Math.round(s)))
    })
  )
}

const LAYOUT_BASE = {
  margin: { t: 28, r: 8, b: 8, l: 8 },
  paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
  xaxis: { showticklabels: false, showgrid: false, zeroline: false },
  yaxis: { showticklabels: false, showgrid: false, zeroline: false, scaleanchor: 'x' },
}

export default function FeatureMapWidget() {
  const inputRef  = useRef(null)
  const outputRef = useRef(null)
  const [filter, setFilter] = useState('Edge Detect')

  useEffect(() => {
    Plotly.react(inputRef.current, [{
      z: [...BASE_IMG].reverse(),
      type: 'heatmap', colorscale: 'Greys', showscale: false,
    }], { ...LAYOUT_BASE, title: { text: 'Input (16×16)', font: { size: 11 } } }, CFG)
  }, [])

  useEffect(() => {
    const out = apply(BASE_IMG, FILTERS[filter])
    const params = filter === 'Original' ? 0
      : `params: 3×3×1 = 9`
    Plotly.react(outputRef.current, [{
      z: [...out].reverse(),
      type: 'heatmap', colorscale: 'RdPu', showscale: false,
    }], {
      ...LAYOUT_BASE,
      title: { text: `"${filter}" feature map (14×14)${params ? ' — ' + params : ''}`, font: { size: 11 } },
    }, CFG)
  }, [filter])

  return (
    <div>
      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.7rem', alignItems:'center', fontSize:'0.84rem' }}>
        <span style={{ color:'var(--text-muted)' }}>Filter:</span>
        {Object.keys(FILTERS).map(k => (
          <button key={k} onClick={() => setFilter(k)}
            style={{
              padding:'0.25rem 0.65rem', fontSize:'0.82rem', borderRadius:4, cursor:'pointer', border:'none',
              background: filter === k ? '#be185d' : 'var(--bg-hover)',
              color: filter === k ? '#fff' : 'var(--text)',
              fontWeight: filter === k ? 700 : 400,
            }}>{k}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
        <div ref={inputRef} style={{ minHeight:220 }} />
        <div ref={outputRef} style={{ minHeight:220 }} />
      </div>
      <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.5rem' }}>
        Each filter produces a different feature map from the same input. Edge detectors highlight boundaries; blur smooths. In a real CNN these kernels are <em>learned</em>, not hand-designed.
      </p>
    </div>
  )
}
