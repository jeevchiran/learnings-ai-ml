import { useState } from 'react'

const CELL = 36

// Fixed 4×4 input
const INPUT = [
  [12, 20, 30, 0],
  [8, 12, 2, 0],
  [34, 70, 37, 4],
  [112, 100, 25, 12],
]

function maxPool(grid, size, stride) {
  const n = grid.length
  const outN = Math.floor((n - size) / stride) + 1
  return Array.from({length: outN}, (_, r) =>
    Array.from({length: outN}, (_, c) => {
      let max = -Infinity
      for (let kr = 0; kr < size; kr++)
        for (let kc = 0; kc < size; kc++)
          max = Math.max(max, grid[r*stride+kr][c*stride+kc])
      return max
    })
  )
}

function avgPool(grid, size, stride) {
  const n = grid.length
  const outN = Math.floor((n - size) / stride) + 1
  return Array.from({length: outN}, (_, r) =>
    Array.from({length: outN}, (_, c) => {
      let sum = 0
      for (let kr = 0; kr < size; kr++)
        for (let kc = 0; kc < size; kc++)
          sum += grid[r*stride+kr][c*stride+kc]
      return Math.round(sum / (size * size))
    })
  )
}

function cellColor(v, max) {
  const t = v / max
  const r = Math.round(252 + t * (190 - 252))
  const g = Math.round(231 + t * (24 - 231))
  const b = Math.round(243 + t * (93 - 243))
  return `rgb(${r},${g},${b})`
}

function Grid({ data, label, highlighted, cellSize = CELL }) {
  const max = Math.max(...data.flat())
  return (
    <div>
      <div style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'0.3rem', textAlign:'center' }}>{label}</div>
      <svg width={data[0].length * cellSize} height={data.length * cellSize} style={{ display:'block', margin:'0 auto', fontFamily:'monospace' }}>
        {data.map((row, r) => row.map((val, c) => {
          const isHL = highlighted && highlighted.some(([hr, hc]) => hr === r && hc === c)
          return (
            <g key={`${r}-${c}`}>
              <rect x={c*cellSize} y={r*cellSize} width={cellSize} height={cellSize}
                fill={isHL ? '#be185d' : cellColor(val, max)}
                stroke="var(--border)" strokeWidth={1.5} />
              <text x={c*cellSize+cellSize/2} y={r*cellSize+cellSize/2+5}
                textAnchor="middle" fontSize={12} fill={isHL || val > max*0.6 ? '#fff' : '#1e1e1e'} fontWeight="600">
                {val}
              </text>
            </g>
          )
        }))}
      </svg>
    </div>
  )
}

export default function PoolingWidget() {
  const [poolType, setPoolType] = useState('max')
  const [poolSize, setPoolSize] = useState(2)
  const [stride, setStride] = useState(2)
  const [selected, setSelected] = useState(null) // [r, c] in output

  const output = poolType === 'max' ? maxPool(INPUT, poolSize, stride) : avgPool(INPUT, poolSize, stride)
  const outN = output.length

  const inputHL = selected != null ? (() => {
    const [or, oc] = selected
    const cells = []
    for (let kr = 0; kr < poolSize; kr++)
      for (let kc = 0; kc < poolSize; kc++)
        cells.push([or*stride+kr, oc*stride+kc])
    return cells
  })() : []

  return (
    <div>
      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'0.7rem', alignItems:'center', fontSize:'0.84rem' }}>
        <div style={{ display:'flex', gap:'0.4rem' }}>
          {['max', 'avg'].map(t => (
            <button key={t} onClick={() => { setPoolType(t); setSelected(null) }}
              style={{ padding:'0.25rem 0.7rem', fontSize:'0.82rem', borderRadius:4, cursor:'pointer', border:'none',
                background: poolType === t ? '#be185d' : 'var(--bg-hover)',
                color: poolType === t ? '#fff' : 'var(--text)', fontWeight: poolType === t ? 700 : 400 }}>
              {t === 'max' ? 'Max Pool' : 'Avg Pool'}
            </button>
          ))}
        </div>
        <label style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
          Pool size:
          <select value={poolSize} onChange={e => { setPoolSize(+e.target.value); setSelected(null) }}
            style={{ padding:'0.15rem 0.3rem', border:'1px solid var(--border)', borderRadius:3, background:'var(--bg)', color:'var(--text)', fontSize:'0.84rem' }}>
            <option value={2}>2×2</option>
            <option value={3}>3×3</option>
          </select>
        </label>
        <label style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
          Stride:
          <select value={stride} onChange={e => { setStride(+e.target.value); setSelected(null) }}
            style={{ padding:'0.15rem 0.3rem', border:'1px solid var(--border)', borderRadius:3, background:'var(--bg)', color:'var(--text)', fontSize:'0.84rem' }}>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
        <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
          Output: {outN}×{outN}
        </span>
      </div>

      <div style={{ display:'flex', gap:'2rem', flexWrap:'wrap', alignItems:'flex-start', justifyContent:'center' }}>
        <Grid data={INPUT} label="Input (4×4)" highlighted={inputHL} />
        <div style={{ display:'flex', alignItems:'center', paddingTop:'1.5rem', fontSize:'1.5rem', color:'var(--text-muted)' }}>→</div>
        <div>
          <div style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'0.3rem', textAlign:'center' }}>Output ({outN}×{outN}) — click cell</div>
          <svg width={outN * CELL} height={outN * CELL} style={{ display:'block', margin:'0 auto', cursor:'pointer', fontFamily:'monospace' }}>
            {output.map((row, r) => row.map((val, c) => {
              const isActive = selected && selected[0] === r && selected[1] === c
              return (
                <g key={`o${r}${c}`} onClick={() => setSelected(isActive ? null : [r, c])}>
                  <rect x={c*CELL} y={r*CELL} width={CELL} height={CELL}
                    fill={isActive ? '#be185d' : '#fce7f3'}
                    stroke={isActive ? '#9d174d' : 'var(--border)'} strokeWidth={isActive ? 2.5 : 1.5} />
                  <text x={c*CELL+CELL/2} y={r*CELL+CELL/2+5}
                    textAnchor="middle" fontSize={13} fill={isActive ? '#fff' : '#9d174d'} fontWeight="700">
                    {val}
                  </text>
                </g>
              )
            }))}
          </svg>
        </div>
      </div>

      {selected && (
        <div style={{ marginTop:'0.7rem', background:'var(--bg-hover)', borderRadius:6, padding:'0.5rem 0.9rem', fontSize:'0.82rem', fontFamily:'monospace' }}>
          <span style={{ color:'#be185d', fontWeight:700 }}>out[{selected[0]}][{selected[1]}] = </span>
          {poolType === 'max' ? 'max' : 'avg'}({inputHL.map(([r,c]) => INPUT[r][c]).join(', ')}) = {output[selected[0]][selected[1]]}
        </div>
      )}

      <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.6rem' }}>
        Click an output cell to highlight its input pooling region. Max pooling keeps the strongest signal; avg smooths. Neither has learnable parameters — output size: ⌊(n − pool_size) / stride⌋ + 1.
      </p>
    </div>
  )
}
