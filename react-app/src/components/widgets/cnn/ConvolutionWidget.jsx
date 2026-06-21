import { useState, useEffect, useRef } from 'react'

const IMAGES = {
  'Horizontal Edge': Array.from({length:8}, (_,i) => Array.from({length:8}, () => i < 4 ? 200 : 30)),
  'Vertical Edge':   Array.from({length:8}, (_,i) => Array.from({length:8}, (_,j) => j < 4 ? 200 : 30)),
  'Diagonal Grad':   Array.from({length:8}, (_,i) => Array.from({length:8}, (_,j) => Math.round((i+j)/14*230))),
  'Checkerboard':    Array.from({length:8}, (_,i) => Array.from({length:8}, (_,j) => (i+j)%2===0 ? 220 : 30)),
  'Bright Cross':    Array.from({length:8}, (_,i) => Array.from({length:8}, (_,j) => (i===3||i===4||j===3||j===4) ? 220 : 30)),
}

const KERNELS = {
  'Edge (H)':  [[-1,-1,-1],[2,2,2],[-1,-1,-1]],
  'Edge (V)':  [[-1,2,-1],[-1,2,-1],[-1,2,-1]],
  'Blur':      [[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]],
  'Sharpen':   [[0,-1,0],[-1,5,-1],[0,-1,0]],
  'Emboss':    [[-2,-1,0],[-1,1,1],[0,1,2]],
  'Identity':  [[0,0,0],[0,1,0],[0,0,0]],
}

const CELL = 27
const K_CELL = 36

function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))) }
function gray(v) { const c = clamp(v); return `rgb(${c},${c},${c})` }

function convolve(image, kernel, stride) {
  const outN = Math.floor((8 - 3) / stride) + 1
  return Array.from({length: outN}, (_, r) =>
    Array.from({length: outN}, (_, c) => {
      let sum = 0
      for (let kr = 0; kr < 3; kr++)
        for (let kc = 0; kc < 3; kc++)
          sum += image[r*stride+kr][c*stride+kc] * kernel[kr][kc]
      return clamp(sum)
    })
  )
}

export default function ConvolutionWidget() {
  const [imgKey, setImgKey]   = useState('Horizontal Edge')
  const [kernKey, setKernKey] = useState('Edge (H)')
  const [stride, setStride]   = useState(1)
  const [step, setStep]       = useState(-1)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)

  const image  = IMAGES[imgKey]
  const kernel = KERNELS[kernKey]
  const outN   = Math.floor((8 - 3) / stride) + 1
  const total  = outN * outN
  const output = convolve(image, kernel, stride)

  const curRow = step >= 0 ? Math.floor(step / outN) : -1
  const curCol = step >= 0 ? step % outN : -1
  const rfRow  = curRow >= 0 ? curRow * stride : -1
  const rfCol  = curCol >= 0 ? curCol * stride : -1

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep(s => {
          if (s >= total - 1) { setPlaying(false); return s }
          return s + 1
        })
      }, 350)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, total])

  function reset() { clearInterval(timerRef.current); setPlaying(false); setStep(-1) }
  function stepFwd() { setPlaying(false); setStep(s => Math.min(s + 1, total - 1)) }
  function togglePlay() {
    if (step >= total - 1) setStep(-1)
    setPlaying(p => !p)
  }

  // normalize output for display
  const flat = output.flat()
  const oMin = Math.min(...flat); const oMax = Math.max(...flat)
  const dispV = v => oMax > oMin ? Math.round((v - oMin)/(oMax - oMin)*255) : v

  const computation = step >= 0 ? (() => {
    let sum = 0; const rows = []
    for (let kr = 0; kr < 3; kr++) for (let kc = 0; kc < 3; kc++) {
      const iv = image[rfRow+kr][rfCol+kc]
      const kv = kernel[kr][kc]
      sum += iv * kv
      rows.push({ iv, kv, prod: iv*kv })
    }
    return { rows, sum, clamped: clamp(sum) }
  })() : null

  const X0 = 8 * CELL + 24      // kernel x start
  const O0 = X0 + 3 * K_CELL + 24  // output x start
  const svgW = O0 + outN * CELL + 8
  const svgH = 8 * CELL + 26

  return (
    <div>
      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'0.6rem', alignItems:'center', fontSize:'0.84rem' }}>
        {[
          ['Image', imgKey, setImgKey, Object.keys(IMAGES)],
          ['Kernel', kernKey, setKernKey, Object.keys(KERNELS)],
        ].map(([lbl, val, set, opts]) => (
          <label key={lbl} style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
            {lbl}:
            <select value={val} onChange={e => { reset(); set(e.target.value) }}
              style={{ padding:'0.15rem 0.3rem', border:'1px solid var(--border)', borderRadius:3, background:'var(--bg)', color:'var(--text)', fontSize:'0.84rem' }}>
              {opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </label>
        ))}
        <label style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
          Stride:
          <select value={stride} onChange={e => { reset(); setStride(+e.target.value) }}
            style={{ padding:'0.15rem 0.3rem', border:'1px solid var(--border)', borderRadius:3, background:'var(--bg)', color:'var(--text)', fontSize:'0.84rem' }}>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
        <span style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>
          Output: {outN}×{outN} = {total} positions
        </span>
      </div>

      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.75rem', alignItems:'center' }}>
        <button onClick={reset}
          style={{ padding:'0.3rem 0.7rem', fontSize:'0.83rem', border:'1px solid var(--border)', borderRadius:4, background:'var(--bg)', color:'var(--text)', cursor:'pointer' }}>
          ↺ Reset
        </button>
        <button onClick={stepFwd} disabled={step >= total - 1}
          style={{ padding:'0.3rem 0.8rem', fontSize:'0.83rem', border:'none', borderRadius:4, background:'#be185d', color:'#fff', cursor:'pointer', opacity: step >= total - 1 ? 0.5 : 1 }}>
          Step →
        </button>
        <button onClick={togglePlay}
          style={{ padding:'0.3rem 0.8rem', fontSize:'0.83rem', border:'none', borderRadius:4, background: playing ? '#6b7280' : '#be185d', color:'#fff', cursor:'pointer' }}>
          {playing ? '⏸ Pause' : step >= total - 1 ? '↺ Replay' : '▶ Play'}
        </button>
        {step >= 0 && (
          <span style={{ fontSize:'0.8rem', fontWeight:600, color:'#be185d' }}>
            Step {step+1}/{total} → out[{curRow}][{curCol}]
          </span>
        )}
      </div>

      <div style={{ overflowX:'auto' }}>
        <svg width={svgW} height={svgH} style={{ display:'block', fontFamily:'monospace' }}>
          {/* Input label */}
          <text x={4*CELL} y={12} textAnchor="middle" fontSize={10} fill="var(--text-muted)" fontWeight="600">Input 8×8</text>
          {/* Input cells */}
          {image.map((row, r) => row.map((val, c) => {
            const inRF = rfRow >= 0 && r >= rfRow && r < rfRow+3 && c >= rfCol && c < rfCol+3
            return (
              <g key={`i${r}${c}`}>
                <rect x={c*CELL} y={16+r*CELL} width={CELL} height={CELL}
                  fill={gray(val)}
                  stroke={inRF ? '#be185d' : 'rgba(120,120,120,0.25)'}
                  strokeWidth={inRF ? 2.5 : 0.5} />
                {inRF && <rect x={c*CELL} y={16+r*CELL} width={CELL} height={CELL} fill="rgba(190,24,93,0.18)" />}
                <text x={c*CELL+CELL/2} y={16+r*CELL+CELL/2+4} textAnchor="middle" fontSize={7} fill={val>127?'#111':'#ddd'}>{val}</text>
              </g>
            )
          }))}

          {/* × separator */}
          <text x={8*CELL+12} y={16+4*CELL+5} textAnchor="middle" fontSize={16} fill="var(--text-muted)">✕</text>

          {/* Kernel label */}
          <text x={X0 + 1.5*K_CELL} y={12} textAnchor="middle" fontSize={10} fill="var(--text-muted)" fontWeight="600">Kernel 3×3</text>
          {/* Kernel cells */}
          {kernel.map((row, r) => row.map((val, c) => {
            const bg = val > 0
              ? `rgba(190,24,93,${Math.min(0.85, Math.abs(val) * 0.7 + 0.1)})`
              : `rgba(14,165,233,${Math.min(0.85, Math.abs(val) * 0.7 + 0.1)})`
            return (
              <g key={`k${r}${c}`}>
                <rect x={X0+c*K_CELL} y={16+r*K_CELL} width={K_CELL} height={K_CELL} fill={bg} stroke="var(--border)" strokeWidth={1} />
                <text x={X0+c*K_CELL+K_CELL/2} y={16+r*K_CELL+K_CELL/2+4} textAnchor="middle" fontSize={8} fill="var(--text)" fontWeight="600">
                  {val.toFixed(val % 1 === 0 ? 0 : 3)}
                </text>
              </g>
            )
          }))}

          {/* → separator */}
          <text x={X0+3*K_CELL+12} y={16+4*CELL+5} textAnchor="middle" fontSize={16} fill="var(--text-muted)">→</text>

          {/* Output label */}
          <text x={O0+outN*CELL/2} y={12} textAnchor="middle" fontSize={10} fill="var(--text-muted)" fontWeight="600">Output {outN}×{outN}</text>
          {/* Output cells */}
          {Array.from({length:outN}, (_,r) => Array.from({length:outN}, (_,c) => {
            const revealed = step >= 0 && r*outN+c <= step
            const active   = r === curRow && c === curCol
            const dv       = dispV(output[r][c])
            return (
              <g key={`o${r}${c}`}>
                <rect x={O0+c*CELL} y={16+r*CELL} width={CELL} height={CELL}
                  fill={revealed ? gray(dv) : 'rgba(120,120,120,0.06)'}
                  stroke={active ? '#be185d' : 'rgba(120,120,120,0.3)'}
                  strokeWidth={active ? 2.5 : 0.8} />
                {active && <rect x={O0+c*CELL} y={16+r*CELL} width={CELL} height={CELL} fill="rgba(190,24,93,0.22)" />}
                {revealed && (
                  <text x={O0+c*CELL+CELL/2} y={16+r*CELL+CELL/2+4} textAnchor="middle" fontSize={7} fill={dv>127?'#111':'#ddd'}>
                    {output[r][c]}
                  </text>
                )}
              </g>
            )
          }))}
        </svg>
      </div>

      {/* Computation breakdown */}
      {computation && (
        <div style={{ marginTop:'0.6rem', background:'var(--bg-hover)', borderRadius:6, padding:'0.6rem 0.9rem', fontSize:'0.78rem', fontFamily:'monospace' }}>
          <div style={{ fontWeight:700, color:'#be185d', marginBottom:'0.3rem' }}>
            Patch @ input[{rfRow}:{rfRow+3}, {rfCol}:{rfCol+3}] dot kernel:
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.1rem 1rem' }}>
            {computation.rows.map(({iv, kv, prod}, i) => (
              <span key={i} style={{ color:'var(--text-muted)' }}>
                {String(iv).padStart(3)} × {kv.toFixed(3).padStart(6)} = {prod.toFixed(1).padStart(7)}
              </span>
            ))}
          </div>
          <div style={{ borderTop:'1px solid var(--border)', marginTop:'0.35rem', paddingTop:'0.35rem', color:'var(--text)', fontWeight:700 }}>
            Σ = {computation.sum.toFixed(2)} → clamp(0,255) = <span style={{ color:'#be185d' }}>{computation.clamped}</span>
          </div>
        </div>
      )}
      <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.5rem' }}>
        Pink border = active receptive field. Pink kernel values = positive weights, blue = negative. Output values normalized for display; raw values shown.
      </p>
    </div>
  )
}
