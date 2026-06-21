import { useState, useCallback, useRef } from 'react'
import { sigmoid } from '../utils.js'

function xavierInit(fanIn, fanOut) {
  const limit = Math.sqrt(6 / (fanIn + fanOut))
  return Array.from({ length: fanOut }, () =>
    Array.from({ length: fanIn }, () => (Math.random() * 2 - 1) * limit)
  )
}

function forwardPass(layers, inputVals) {
  // layers: [inputSize, ...hidden, outputSize]
  // returns array of activation arrays per layer
  const acts = [inputVals.map(v => Math.max(-2, Math.min(2, v)))]
  for (let l = 1; l < layers.length; l++) {
    const W = xavierInit(layers[l - 1], layers[l]) // deterministic per render via seeded random — we'll handle this via ref
    const prev = acts[l - 1]
    const next = Array.from({ length: layers[l] }, (_, j) =>
      sigmoid(W[j].reduce((s, w, k) => s + w * prev[k], 0))
    )
    acts.push(next)
  }
  return acts
}

const LAYER_COLOR = (v) => {
  // Map 0..1 to ddd6fe → 7c3aed
  const t = Math.max(0, Math.min(1, v))
  const r = Math.round(221 + t * (124 - 221))
  const g = Math.round(214 + t * (58 - 214))
  const b = Math.round(254 + t * (237 - 254))
  return `rgb(${r},${g},${b})`
}

const NODE_R = 20
const LAYER_GAP = 110
const NODE_GAP = 52

function getPositions(layers) {
  const totalW = (layers.length - 1) * LAYER_GAP + NODE_R * 2
  const maxNodes = Math.max(...layers)
  const totalH = (maxNodes - 1) * NODE_GAP + NODE_R * 2
  const positions = layers.map((n, li) => {
    const x = li * LAYER_GAP + NODE_R
    const startY = ((maxNodes - n) / 2) * NODE_GAP + NODE_R
    return Array.from({ length: n }, (_, ni) => ({ x, y: startY + ni * NODE_GAP }))
  })
  return { positions, totalW, totalH }
}

export default function NeuralNetworkWidget() {
  const [inputSize, setInputSize] = useState(2)
  const [hiddenLayers, setHiddenLayers] = useState(2)
  const [hiddenSize, setHiddenSize] = useState(4)
  const [outputSize, setOutputSize] = useState(1)
  const [inputVals, setInputVals] = useState([0.6, 0.3])
  const [activations, setActivations] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const weightsRef = useRef(null)

  const layers = [inputSize, ...Array(hiddenLayers).fill(hiddenSize), outputSize]

  const runForward = useCallback(() => {
    // Build or reuse weights (stable across re-renders unless topology changes)
    if (!weightsRef.current || weightsRef.current.length !== layers.length - 1) {
      const Ws = []
      for (let l = 1; l < layers.length; l++) {
        Ws.push(xavierInit(layers[l - 1], layers[l]))
      }
      weightsRef.current = Ws
    }
    const Ws = weightsRef.current
    // Compute activations
    const acts = [inputVals.slice(0, inputSize).map(v => Math.max(-1, Math.min(1, v)))]
    for (let l = 1; l < layers.length; l++) {
      const prev = acts[l - 1]
      const W = Ws[l - 1]
      const next = Array.from({ length: layers[l] }, (_, j) =>
        sigmoid(W[j].reduce((s, w, k) => s + w * (prev[k] ?? 0), 0))
      )
      acts.push(next)
    }
    setActivations(acts)
    setShowPass(true)
  }, [layers, inputVals, inputSize]) // eslint-disable-line

  const reset = () => { weightsRef.current = null; setActivations(null); setShowPass(false) }

  const { positions, totalW, totalH } = getPositions(layers)
  const svgW = totalW + 40
  const svgH = Math.max(totalH + 40, 180)
  const offX = 20
  const offY = 20

  const labelNames = ['Input', ...Array(hiddenLayers).fill(null).map((_, i) => `Hidden ${i + 1}`), 'Output']

  return (
    <div>
      {/* Config */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        {[
          ['Input neurons', inputSize, setInputSize, 2, 4],
          ['Hidden layers', hiddenLayers, setHiddenLayers, 1, 3],
          ['Neurons/hidden', hiddenSize, setHiddenSize, 2, 6],
          ['Output neurons', outputSize, setOutputSize, 1, 3],
        ].map(([label, val, set, min, max]) => (
          <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.83rem' }}>
            <span>{label}</span>
            <input type="number" min={min} max={max} value={val}
              onChange={e => { reset(); set(Math.min(max, Math.max(min, +e.target.value))) }}
              style={{ width: 40, padding: '0.15rem 0.3rem', border: '1px solid var(--border)', borderRadius: 3, background: 'var(--bg)', color: 'var(--text)', fontSize: '0.83rem' }} />
          </label>
        ))}
      </div>

      {/* Input sliders */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        {Array.from({ length: inputSize }, (_, i) => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.83rem' }}>
            x{i + 1}:
            <input type="range" min="-1" max="1" step="0.05"
              value={inputVals[i] ?? 0}
              onChange={e => {
                reset()
                setInputVals(prev => { const n = [...prev]; n[i] = +e.target.value; return n })
              }}
              style={{ width: 80 }} />
            <strong style={{ color: '#7c3aed', width: 36 }}>{(inputVals[i] ?? 0).toFixed(2)}</strong>
          </label>
        ))}
        <button onClick={runForward}
          style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 4, padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.83rem' }}>
          ▶ Forward Pass
        </button>
        <button onClick={reset}
          style={{ background: 'var(--bg-hover)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4, padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.83rem' }}>
          Reset
        </button>
      </div>

      {/* Network SVG */}
      <div style={{ overflowX: 'auto' }}>
        <svg width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto' }}>
          {/* Layer labels */}
          {positions.map((nodes, li) => (
            <text key={`lbl-${li}`}
              x={offX + nodes[0].x} y={offY - 6}
              textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="600">
              {labelNames[li]}
            </text>
          ))}

          {/* Edges */}
          {positions.slice(0, -1).map((layerNodes, li) =>
            layerNodes.map((src, si) =>
              positions[li + 1].map((dst, di) => {
                const w = weightsRef.current ? weightsRef.current[li][di][si] : 0
                const opacity = showPass ? Math.min(0.7, Math.abs(w) * 0.8 + 0.1) : 0.12
                return (
                  <line key={`e-${li}-${si}-${di}`}
                    x1={offX + src.x} y1={offY + src.y}
                    x2={offX + dst.x} y2={offY + dst.y}
                    stroke={showPass && w < 0 ? '#ef4444' : '#7c3aed'}
                    strokeWidth={showPass ? Math.min(Math.abs(w) * 1.5 + 0.5, 3) : 0.8}
                    opacity={opacity} />
                )
              })
            )
          )}

          {/* Nodes */}
          {positions.map((layerNodes, li) =>
            layerNodes.map((node, ni) => {
              const act = activations ? activations[li][ni] : null
              const fill = act !== null && act !== undefined ? LAYER_COLOR(act) : (li === 0 ? '#ddd6fe' : '#ede9fe')
              const textFill = act !== null && act !== undefined && act > 0.6 ? '#fff' : '#5b21b6'
              return (
                <g key={`n-${li}-${ni}`}>
                  <circle
                    cx={offX + node.x} cy={offY + node.y} r={NODE_R}
                    fill={fill}
                    stroke="#7c3aed" strokeWidth={showPass ? 2 : 1.5}
                    style={{ filter: showPass ? 'drop-shadow(0 0 4px #7c3aed44)' : 'none' }}
                  />
                  {act !== null && act !== undefined ? (
                    <text x={offX + node.x} y={offY + node.y + 4}
                      textAnchor="middle" fontSize="9" fill={textFill} fontWeight="bold">
                      {act.toFixed(2)}
                    </text>
                  ) : (
                    <text x={offX + node.x} y={offY + node.y + 4}
                      textAnchor="middle" fontSize="9" fill="#5b21b6">
                      {li === 0 ? `x${ni + 1}` : li === positions.length - 1 ? `o${ni + 1}` : ''}
                    </text>
                  )}
                </g>
              )
            })
          )}
        </svg>
      </div>

      {showPass && activations && (
        <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', background: 'var(--bg-hover)', borderRadius: 4, padding: '0.5rem 0.8rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {activations.map((layer, li) => (
            <div key={li}>
              <strong style={{ color: '#7c3aed' }}>{labelNames[li]}</strong>:{' '}
              {layer.map(v => v.toFixed(3)).join(', ')}
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Node colors: light purple = low activation → dark violet = high activation. Red edges = negative weights, violet = positive.
      </p>
    </div>
  )
}
