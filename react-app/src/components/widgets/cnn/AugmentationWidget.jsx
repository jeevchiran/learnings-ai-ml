import { useState } from 'react'

const N = 12
const CELL = 22

// computed once at module load — avoids useMemo factory reference crash in bundled output
const BASE = (() => {
  const g = Array.from({length:12}, () => Array(12).fill(30))
  for (let r = 1; r < 11; r++) for (let c = 1; c < 11; c++) g[r][c] = 60
  for (let r = 0; r < 12; r++) for (let c = 0; c < 12; c++) {
    const dr = r - 5.5, dc = c - 5.5
    if (Math.abs(Math.sqrt(dr*dr+dc*dc) - 5) < 1) g[r][c] = 220
  }
  [[3,4],[3,7]].forEach(([row,col]) => { g[row][col] = 255; g[row][col+1] = 255 })
  ;[[8,3],[8,8],[7,4],[7,7],[7,5],[7,6]].forEach(([row,col]) => g[row][col] = 255)
  return g
})()

function flipH(g) { return g.map(row => [...row].reverse()) }
function flipV(g) { return [...g].reverse() }
function crop(g) { return g.map(row => row.map((v, c) => (c < 1 || c >= N-2) ? 0 : v)).filter((_, r) => r >= 1 && r < N-1).concat([[...Array(N).fill(0)],[...Array(N).fill(0)]]) }
function brightness(g, delta) { return g.map(row => row.map(v => Math.max(0, Math.min(255, v + delta)))) }
function noise(g, seed) {
  let s = seed
  function rng() { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s % 80) - 40 }
  return g.map(row => row.map(v => v > 30 ? Math.max(0, Math.min(255, v + rng())) : v))
}
function cutout(g) {
  const ng = g.map(r => [...r])
  for (let r = 3; r < 7; r++) for (let c = 4; c < 8; c++) ng[r][c] = 0
  return ng
}

const AUGS = {
  'Original':      (g) => g,
  'Flip H':        (g) => flipH(g),
  'Flip V':        (g) => flipV(g),
  'Random Crop':   (g) => crop(g),
  'Brighter':      (g) => brightness(g, 60),
  'Darker':        (g) => brightness(g, -60),
  'Noise':         (g) => noise(g, 42),
  'Cutout':        (g) => cutout(g),
}

function gray(v) { const c = Math.max(0, Math.min(255, v)); return `rgb(${c},${c},${c})` }

function PixelGrid({ data, label }) {
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'0.3rem' }}>{label}</div>
      <svg width={N * CELL} height={N * CELL} style={{ display:'block', margin:'0 auto' }}>
        {data.map((row, r) => row.map((val, c) => (
          <rect key={`${r}${c}`} x={c*CELL} y={r*CELL} width={CELL} height={CELL}
            fill={gray(val)} stroke="rgba(128,128,128,0.1)" strokeWidth={0.5} />
        )))}
      </svg>
    </div>
  )
}

export default function AugmentationWidget() {
  const [aug, setAug] = useState('Flip H')
  const base = BASE
  const augmented = (AUGS[aug] || AUGS['Original'])(base)

  const descriptions = {
    'Original': 'No transformation applied.',
    'Flip H': 'Mirror horizontally. Object stays the same but position shifts — helps the model ignore horizontal position.',
    'Flip V': 'Mirror vertically. Use only when label-invariant (cats upside-down ≠ cats).',
    'Random Crop': 'Pad and crop to remove 1px border. Teaches position invariance without label change.',
    'Brighter': 'Add +60 to all pixels. Simulates different lighting conditions.',
    'Darker': 'Subtract 60. Simulates shadows or low-light environments.',
    'Noise': 'Add random ±40 noise to non-background pixels. Improves robustness to sensor noise.',
    'Cutout': 'Zero out a 4×4 square patch. Forces model to use context rather than a single region.',
  }

  return (
    <div>
      <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'0.7rem' }}>
        {Object.keys(AUGS).map(k => (
          <button key={k} onClick={() => setAug(k)}
            style={{ padding:'0.25rem 0.6rem', fontSize:'0.8rem', borderRadius:4, cursor:'pointer', border:'none',
              background: aug === k ? '#be185d' : 'var(--bg-hover)',
              color: aug === k ? '#fff' : 'var(--text)', fontWeight: aug === k ? 700 : 400 }}>
            {k}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', gap:'2rem', justifyContent:'center', flexWrap:'wrap' }}>
        <PixelGrid data={BASE} label="Original" />
        <div style={{ display:'flex', alignItems:'center', fontSize:'1.4rem', color:'var(--text-muted)' }}>→</div>
        <PixelGrid data={augmented} label={aug} />
      </div>

      <div style={{ marginTop:'0.7rem', background:'var(--bg-hover)', borderRadius:6, padding:'0.5rem 0.8rem', fontSize:'0.82rem', color:'var(--text)' }}>
        <strong style={{ color:'#be185d' }}>{aug}:</strong> {descriptions[aug]}
      </div>

      <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.5rem' }}>
        Augmentation is applied <em>on-the-fly during training only</em> — the original image is unchanged. Multiple transforms are composed per batch. In PyTorch: <code>transforms.Compose([...])</code>.
      </p>
    </div>
  )
}
