import { useState, useEffect, useRef } from 'react'

const COLOR = '#0f766e'
const COLOR_LIGHT = '#ccfbf1'
const COLOR_MID = '#5eead4'

function tanh(x) { return Math.tanh(x) }

// Simulate tiny RNN: h_t = tanh(0.6*h_{t-1} + 0.8*x_t)
function runRNN(inputs) {
  const states = [0]
  for (let t = 0; t < inputs.length; t++) {
    states.push(tanh(0.6 * states[t] + 0.8 * inputs[t]))
  }
  return states // states[0] = h0, states[1] = h1, ...
}

const PRESETS = [
  { label: 'Rising', inputs: [0.2, 0.5, 0.8, 1.0, 0.9] },
  { label: 'Falling', inputs: [1.0, 0.7, 0.4, 0.1, -0.2] },
  { label: 'Alternating', inputs: [1.0, -1.0, 1.0, -1.0, 0.5] },
  { label: 'Flat', inputs: [0.5, 0.5, 0.5, 0.5, 0.5] },
]

export default function RNNUnfoldWidget({ showBPTT = false }) {
  const [preset, setPreset] = useState(0)
  const [activeStep, setActiveStep] = useState(-1) // -1 = all visible
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)

  const inputs = PRESETS[preset].inputs
  const T = inputs.length
  const states = runRNN(inputs)

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setActiveStep(s => {
          if (s >= T - 1) { setPlaying(false); return T - 1 }
          return s + 1
        })
      }, 700)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, T])

  const startPlay = () => { setActiveStep(-1); setTimeout(() => { setActiveStep(0); setPlaying(true) }, 50) }
  const reset = () => { setPlaying(false); setActiveStep(-1) }

  // SVG layout
  const cellW = 70
  const cellH = 50
  const gapX = 90
  const startX = 50
  const cellY = 80
  const totalW = startX + T * (cellW + gapX) + 20
  const totalH = 220

  const cellCX = (t) => startX + t * (cellW + gapX) + cellW / 2
  const cellCY = cellY + cellH / 2

  const visible = (t) => activeStep === -1 || t <= activeStep

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.8rem', alignItems: 'center', fontSize: '0.83rem' }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Sequence:</span>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPreset(i); reset() }}
            style={{ padding: '0.2rem 0.6rem', borderRadius: 4, border: `1px solid ${i === preset ? COLOR : 'var(--border)'}`, background: i === preset ? COLOR : 'var(--bg)', color: i === preset ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: '0.82rem' }}>
            {p.label}
          </button>
        ))}
        <button onClick={startPlay} disabled={playing}
          style={{ marginLeft: 'auto', padding: '0.25rem 0.7rem', borderRadius: 4, border: 'none', background: COLOR, color: '#fff', cursor: playing ? 'default' : 'pointer', opacity: playing ? 0.5 : 1, fontSize: '0.82rem' }}>
          ▶ Animate
        </button>
        <button onClick={reset}
          style={{ padding: '0.25rem 0.7rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.82rem' }}>
          Reset
        </button>
      </div>

      {/* SVG */}
      <div style={{ overflowX: 'auto' }}>
        <svg width={totalW} height={totalH} style={{ display: 'block', minWidth: 380 }}>
          <defs>
            <marker id="rnn-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 z" fill={COLOR} />
            </marker>
            <marker id="rnn-arrow-bptt" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* h_0 label */}
          <text x={startX - 8} y={cellCY + 5} textAnchor="end" fontSize="11" fill="var(--text-muted)">h₀=0</text>

          {inputs.map((x, t) => {
            const cx = cellCX(t)
            const cy = cellCY
            const isActive = activeStep === t
            const show = visible(t)

            return (
              <g key={t} opacity={show ? 1 : 0.15} style={{ transition: 'opacity 0.35s' }}>
                {/* Horizontal arrow h_{t-1} → cell */}
                <line
                  x1={t === 0 ? startX - 5 : cellCX(t - 1) + cellW / 2 + 5}
                  y1={cy} x2={cx - cellW / 2 - 5} y2={cy}
                  stroke={showBPTT && show ? '#ef4444' : COLOR}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  strokeDasharray={showBPTT ? '5,3' : undefined}
                  markerEnd={showBPTT ? 'url(#rnn-arrow-bptt)' : 'url(#rnn-arrow)'}
                />

                {/* Cell rect */}
                <rect x={cx - cellW / 2} y={cy - cellH / 2} width={cellW} height={cellH} rx={6}
                  fill={isActive ? COLOR : COLOR_LIGHT}
                  stroke={COLOR} strokeWidth={isActive ? 2.5 : 1.5}
                  style={{ filter: isActive ? `drop-shadow(0 0 6px ${COLOR}88)` : 'none', transition: 'all 0.3s' }} />

                {/* Cell label */}
                <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontWeight="bold"
                  fill={isActive ? '#fff' : COLOR}>RNN</text>
                <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9"
                  fill={isActive ? '#e0faf5' : '#0f766e99'}>t = {t + 1}</text>

                {/* x_t arrow (from top) */}
                <line x1={cx} y1={cy - cellH / 2 - 38} x2={cx} y2={cy - cellH / 2 - 4}
                  stroke={COLOR} strokeWidth={1.5} markerEnd="url(#rnn-arrow)" />
                <rect x={cx - 18} y={cy - cellH / 2 - 60} width={36} height={20} rx={4}
                  fill={COLOR_LIGHT} stroke={COLOR} strokeWidth={1.2} />
                <text x={cx} y={cy - cellH / 2 - 46} textAnchor="middle" fontSize="10" fontWeight="bold" fill={COLOR}>
                  x₍{t + 1}₎
                </text>
                <text x={cx + 20} y={cy - cellH / 2 - 46} fontSize="9" fill="var(--text-muted)">
                  {x.toFixed(1)}
                </text>

                {/* h_t arrow (to right) — only if not last */}
                {t < T - 1 && (
                  <text x={cx + cellW / 2 + (gapX / 2) - 4} y={cy - 6} textAnchor="middle" fontSize="10" fill={COLOR} fontWeight="bold">
                    h₍{t + 1}₎
                  </text>
                )}

                {/* h_t value below */}
                <text x={cx} y={cy + cellH / 2 + 22} textAnchor="middle" fontSize="10" fill={COLOR} fontWeight={isActive ? 'bold' : 'normal'}>
                  h={states[t + 1].toFixed(3)}
                </text>

                {/* y_t output (bottom arrow) for last step or always */}
                {t === T - 1 && (
                  <g>
                    <line x1={cx} y1={cy + cellH / 2 + 4} x2={cx} y2={cy + cellH / 2 + 36}
                      stroke={COLOR} strokeWidth={2} markerEnd="url(#rnn-arrow)" />
                    <text x={cx} y={cy + cellH / 2 + 52} textAnchor="middle" fontSize="10" fontWeight="bold" fill={COLOR}>
                      ŷ
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* BPTT gradient direction label */}
          {showBPTT && (
            <text x={totalW / 2} y={totalH - 8} textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="bold">
              ← gradient flows backward through time (BPTT)
            </text>
          )}
        </svg>
      </div>

      {/* Step info */}
      {activeStep >= 0 && (
        <div style={{ marginTop: '0.5rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
          <strong style={{ color: COLOR }}>Step t={activeStep + 1}:</strong>{' '}
          h<sub>{activeStep + 1}</sub> = tanh(0.6 × {states[activeStep].toFixed(3)} + 0.8 × {inputs[activeStep].toFixed(1)}) = <strong style={{ color: COLOR }}>{states[activeStep + 1].toFixed(4)}</strong>
        </div>
      )}

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Each cell reads x<sub>t</sub> and the previous hidden state h<sub>t−1</sub>, producing a new h<sub>t</sub>. The same weights apply at every step.
      </p>
    </div>
  )
}
