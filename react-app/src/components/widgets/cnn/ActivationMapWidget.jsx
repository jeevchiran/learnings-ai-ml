import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'

const CFG = { responsive: true, displayModeBar: false }

// 16×16 "input image" — dog-like shape on background
const IMG = Array.from({length:16}, (_,r) => Array.from({length:16}, (_,c) => {
  // body
  if (r >= 8 && r <= 13 && c >= 3 && c <= 12) return 180
  // head
  if (r >= 4 && r <= 9 && c >= 8 && c <= 13) return 200
  // ears
  if ((r >= 2 && r <= 5 && c >= 9 && c <= 10) || (r >= 2 && r <= 5 && c >= 12 && c <= 13)) return 220
  // eye
  if (r === 6 && c === 11) return 50
  // nose
  if (r === 8 && (c === 10 || c === 11)) return 80
  return 30
}))

// Simulated GradCAM-like heatmaps for different "which class"
const MAPS = {
  'Head region': (r, c) => {
    const dr = r - 6.5, dc = c - 10.5
    return Math.max(0, 1 - (dr*dr + dc*dc) / 25) * 0.9
      + Math.max(0, 1 - ((r-5)**2 + (c-9)**2) / 16) * 0.5
  },
  'Body region': (r, c) => {
    const dr = r - 10.5, dc = c - 7.5
    return Math.max(0, 1 - (dr*dr + dc*dc) / 30) * 0.85
  },
  'Full object': (r, c) => {
    const hr = Math.max(0, 1 - ((r-6.5)**2+(c-10.5)**2)/40)
    const br = Math.max(0, 1 - ((r-10.5)**2+(c-7.5)**2)/45)
    return Math.min(1, hr * 0.6 + br * 0.6)
  },
  'Background': (r, c) => {
    const obj = Math.max(0, 1 - ((r-8.5)**2+(c-7.5)**2)/50)
    return Math.max(0, (1 - obj) * 0.7 + (Math.sin(r*0.5)*0.1))
  },
}

function makeHeatmap(fn) {
  return Array.from({length:16}, (_,r) => Array.from({length:16}, (_,c) => Math.max(0, fn(r, c))))
}

const LAYOUT_BASE = {
  margin: { t: 28, r: 4, b: 4, l: 4 },
  paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
  xaxis: { showticklabels:false, showgrid:false, zeroline:false },
  yaxis: { showticklabels:false, showgrid:false, zeroline:false, scaleanchor:'x' },
}

export default function ActivationMapWidget() {
  const imgRef     = useRef(null)
  const mapRef     = useRef(null)
  const overlayRef = useRef(null)
  const [mapKey, setMapKey] = useState('Head region')
  const [alpha, setAlpha]   = useState(0.6)

  useEffect(() => {
    Plotly.react(imgRef.current, [{
      z: [...IMG].reverse(), type:'heatmap', colorscale:'Greys', showscale:false,
    }], { ...LAYOUT_BASE, title:{ text:'Input image', font:{size:11} } }, CFG)
  }, [])

  useEffect(() => {
    const hm = makeHeatmap(MAPS[mapKey])
    Plotly.react(mapRef.current, [{
      z: [...hm].reverse(), type:'heatmap', colorscale:'Hot', showscale:false, zmin:0, zmax:1,
    }], { ...LAYOUT_BASE, title:{ text:`Activation map — "${mapKey}"`, font:{size:11} } }, CFG)

    // Overlay: blend using weighted sum per pixel
    const blended = IMG.map((row, r) => row.map((pix, c) => {
      const heat = hm[r][c]
      const hr = Math.round(255 * heat), hg = 0, hb = Math.round(80 * (1 - heat))
      return [
        Math.round(pix * (1 - alpha) + hr * alpha),
        Math.round(pix * (1 - alpha) + hg * alpha),
        Math.round(pix * (1 - alpha) + hb * alpha),
      ]
    }))
    // Build a custom colorscale from the blended image via z values mapped 0..255
    const zdata = blended.map(row => row.map(([r]) => r))
    Plotly.react(overlayRef.current, [{
      z: [...zdata].reverse(), type:'heatmap', colorscale:'RdPu', showscale:false, zmin:0, zmax:255,
    }], { ...LAYOUT_BASE, title:{ text:'GradCAM overlay', font:{size:11} } }, CFG)
  }, [mapKey, alpha])

  return (
    <div>
      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.6rem', alignItems:'center', fontSize:'0.84rem' }}>
        <span style={{ color:'var(--text-muted)' }}>Filter activating:</span>
        {Object.keys(MAPS).map(k => (
          <button key={k} onClick={() => setMapKey(k)}
            style={{ padding:'0.25rem 0.6rem', fontSize:'0.8rem', borderRadius:4, cursor:'pointer', border:'none',
              background: mapKey === k ? '#be185d' : 'var(--bg-hover)',
              color: mapKey === k ? '#fff' : 'var(--text)', fontWeight: mapKey === k ? 700 : 400 }}>
            {k}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.8rem', fontSize:'0.83rem' }}>
        <label style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
          Overlay strength:
          <input type="range" min="0.1" max="0.9" step="0.05" value={alpha}
            onChange={e => setAlpha(+e.target.value)} style={{ width:100 }} />
          <strong style={{ color:'#be185d' }}>{alpha.toFixed(2)}</strong>
        </label>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.5rem' }}>
        <div ref={imgRef}     style={{ minHeight:200 }} />
        <div ref={mapRef}     style={{ minHeight:200 }} />
        <div ref={overlayRef} style={{ minHeight:200 }} />
      </div>
      <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.5rem' }}>
        GradCAM computes gradient of the target class score with respect to the last conv layer's activations — brighter = more important for that prediction. Different filters respond to different spatial patterns.
      </p>
    </div>
  )
}
