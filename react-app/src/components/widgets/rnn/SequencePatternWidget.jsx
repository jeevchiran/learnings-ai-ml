import { useState } from 'react'

const COLOR = '#0f766e'
const COLOR_LIGHT = '#ccfbf1'

const PATTERNS = [
  {
    key: 'many-to-one',
    label: 'Many → One',
    desc: 'Entire sequence → single output. Used in sentiment analysis, sequence classification.',
    example: '"I loved this movie" → 😊 Positive',
    inputs:  [1, 1, 1, 1],
    outputs: [0, 0, 0, 1],
  },
  {
    key: 'one-to-many',
    label: 'One → Many',
    desc: 'Single input → sequence of outputs. Used in image captioning, music generation.',
    example: '🖼️ image → "A cat sitting on a mat"',
    inputs:  [1, 0, 0, 0],
    outputs: [0, 1, 1, 1],
  },
  {
    key: 'synced',
    label: 'Many → Many (synced)',
    desc: 'Output at every time step, aligned with input. Used in NER, POS tagging.',
    example: '"John lives in Paris" → PER O O LOC',
    inputs:  [1, 1, 1, 1],
    outputs: [1, 1, 1, 1],
  },
  {
    key: 'seq2seq',
    label: 'Many → Many (seq2seq)',
    desc: 'Encoder reads the full input, then decoder generates output. Used in machine translation.',
    example: '"Hello world" → "Hola mundo"',
    inputs:  [1, 1, 0, 0],
    outputs: [0, 0, 1, 1],
    encoderDecoder: true,
  },
]

const T = 4
const CW = 52, CH = 36, GAP = 20
const startX = 30, cellY = 90

function cellX(t) { return startX + t * (CW + GAP) }

export default function SequencePatternWidget() {
  const [active, setActive] = useState(0)
  const pat = PATTERNS[active]

  const svgW = startX + T * (CW + GAP) + 30
  const svgH = 190

  return (
    <div>
      {/* Pattern tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
        {PATTERNS.map((p, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{ padding: '0.3rem 0.7rem', borderRadius: 5, border: `2px solid ${i === active ? COLOR : 'var(--border)'}`, background: i === active ? COLOR : 'var(--bg)', color: i === active ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: '0.81rem', fontWeight: i === active ? 700 : 400, transition: 'all 0.2s' }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* SVG */}
      <div style={{ overflowX: 'auto' }}>
        <svg width={svgW} height={svgH} style={{ display: 'block', minWidth: 300, fontFamily: 'inherit' }}>
          <defs>
            <marker id="sp-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill={COLOR} />
            </marker>
            <marker id="sp-arrow-gray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="var(--border)" />
            </marker>
          </defs>

          {/* Encoder/decoder divider */}
          {pat.encoderDecoder && (
            <g>
              <line x1={startX + 2 * (CW + GAP) - GAP / 2} y1={20} x2={startX + 2 * (CW + GAP) - GAP / 2} y2={svgH - 20}
                stroke="var(--border)" strokeWidth={1.5} strokeDasharray="5,3" />
              <text x={startX + 1 * (CW + GAP) + CW / 2} y={18} textAnchor="middle" fontSize="9" fill="var(--text-muted)">ENCODER</text>
              <text x={startX + 3 * (CW + GAP) - GAP / 2} y={18} textAnchor="middle" fontSize="9" fill="var(--text-muted)">DECODER</text>
            </g>
          )}

          {Array.from({ length: T }, (_, t) => {
            const cx = cellX(t) + CW / 2
            const cy = cellY + CH / 2
            const hasInput = pat.inputs[t] === 1
            const hasOutput = pat.outputs[t] === 1
            const isEncoder = pat.encoderDecoder && t < 2
            const cellColor = isEncoder ? '#7c3aed' : COLOR

            return (
              <g key={t}>
                {/* h_{t-1} → cell arrow */}
                {t > 0 && (
                  <line x1={cellX(t - 1) + CW + 2} y1={cy} x2={cellX(t) - 2} y2={cy}
                    stroke={COLOR} strokeWidth={2} markerEnd="url(#sp-arrow)" />
                )}

                {/* Cell */}
                <rect x={cellX(t)} y={cellY} width={CW} height={CH} rx={5}
                  fill={COLOR_LIGHT} stroke={cellColor} strokeWidth={2} />
                <text x={cx} y={cy + 3} textAnchor="middle" fontSize="10" fontWeight="bold" fill={cellColor}>
                  {isEncoder ? 'ENC' : 'RNN'}
                </text>
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize="8" fill={`${cellColor}99`}>
                  t={t + 1}
                </text>

                {/* Input x_t (top) */}
                {hasInput ? (
                  <g>
                    <line x1={cx} y1={cellY - 34} x2={cx} y2={cellY - 3}
                      stroke={COLOR} strokeWidth={1.8} markerEnd="url(#sp-arrow)" />
                    <rect x={cx - 16} y={cellY - 52} width={32} height={18} rx={3} fill={COLOR} />
                    <text x={cx} y={cellY - 39} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">x{t + 1}</text>
                  </g>
                ) : (
                  <g>
                    <rect x={cx - 16} y={cellY - 52} width={32} height={18} rx={3} fill="var(--bg-hover)" stroke="var(--border)" strokeDasharray="3,2" />
                    <text x={cx} y={cellY - 39} textAnchor="middle" fontSize="9" fill="var(--text-muted)">—</text>
                  </g>
                )}

                {/* Output y_t (bottom) */}
                {hasOutput ? (
                  <g>
                    <line x1={cx} y1={cellY + CH + 3} x2={cx} y2={cellY + CH + 35}
                      stroke={COLOR} strokeWidth={1.8} markerEnd="url(#sp-arrow)" />
                    <rect x={cx - 16} y={cellY + CH + 36} width={32} height={18} rx={3} fill={COLOR} />
                    <text x={cx} y={cellY + CH + 49} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">y{t + 1}</text>
                  </g>
                ) : (
                  <g>
                    <rect x={cx - 16} y={cellY + CH + 36} width={32} height={18} rx={3} fill="var(--bg-hover)" stroke="var(--border)" strokeDasharray="3,2" />
                    <text x={cx} y={cellY + CH + 49} textAnchor="middle" fontSize="9" fill="var(--text-muted)">—</text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Context vector for seq2seq */}
          {pat.encoderDecoder && (
            <g>
              <rect x={cellX(1) + CW + 4} y={cellY + 4} width={GAP - 8} height={CH - 8} rx={3}
                fill="#7c3aed22" stroke="#7c3aed" strokeWidth={1} strokeDasharray="3,2" />
              <text x={cellX(1) + CW + GAP / 2} y={cellY + CH / 2 + 3} textAnchor="middle" fontSize="7" fill="#7c3aed">c</text>
            </g>
          )}
        </svg>
      </div>

      {/* Description */}
      <div style={{ marginTop: '0.6rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        <strong style={{ color: COLOR }}>{pat.label}:</strong> {pat.desc}
        <div style={{ marginTop: '0.3rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{pat.example}</div>
      </div>
    </div>
  )
}
