import { useState } from 'react'
import { Row, Btn, Accent } from '../shared/ui.jsx'

const FWD = '#0f766e'
const BWD = '#b45309'

/* One sentence where the disambiguating word comes after the ambiguous one.
 * Toggling the backward pass shows exactly which positions gain information,
 * and the caption names the cost: it cannot run while generating. */

const TOKENS = ['the', 'bank', 'was', 'steep', 'and', 'muddy']
const TARGET = 1

const MODES = {
  forward: { fwd: true, bwd: false, note: 'Reading left to right, position 2 has seen only "the". Nothing so far distinguishes a river bank from a savings bank, and the word that settles it is still four positions away.' },
  backward: { fwd: false, bwd: true, note: 'Reading right to left, position 2 has seen "muddy", "and" and "steep" — which settles it immediately. On its own, though, this pass knows nothing of what came before.' },
  bidirectional: { fwd: true, bwd: true, note: 'Both passes run over the whole sentence and their states are concatenated, so every position sees the full context. The cost is that the sentence must be complete before either pass finishes, which rules this out for generating text one token at a time.' },
}
const KEYS = Object.keys(MODES)

export default function BidirectionalWidget() {
  const [k, setK] = useState('forward')
  const m = MODES[k]
  const w = 74, gap = 6, x0 = 10

  return (
    <Accent value={FWD}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          {KEYS.map(key => <Btn key={key} onClick={() => setK(key)} primary={k === key}>{key}</Btn>)}
        </Row>

        <div style={{ overflowX: 'auto' }}>
          <svg width={TOKENS.length * (w + gap) + 20} height={120}
            role="img" aria-label={m.note}>
            <defs>
              <marker id="biF" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke={FWD} strokeWidth={1.8} strokeLinecap="round" />
              </marker>
              <marker id="biB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke={BWD} strokeWidth={1.8} strokeLinecap="round" />
              </marker>
            </defs>

            {TOKENS.map((t, i) => {
              const seen = (m.fwd && i < TARGET) || (m.bwd && i > TARGET) || i === TARGET
              return (
                <g key={i}>
                  <rect x={x0 + i * (w + gap)} y={48} width={w} height={26} rx={5}
                    fill={i === TARGET ? FWD : seen ? 'var(--bg-hover)' : 'transparent'}
                    stroke={seen ? 'var(--border)' : 'var(--border)'} opacity={seen ? 1 : 0.35} />
                  <text x={x0 + i * (w + gap) + w / 2} y={65} fontSize={12} textAnchor="middle"
                    fill={i === TARGET ? '#fff' : 'var(--text)'} opacity={seen ? 1 : 0.35}>{t}</text>
                </g>
              )
            })}

            {m.fwd && (
              <line x1={x0 + 6} y1={38} x2={x0 + (TOKENS.length - 1) * (w + gap) + w - 6} y2={38}
                stroke={FWD} strokeWidth={1.8} markerEnd="url(#biF)" />
            )}
            {m.bwd && (
              <line x1={x0 + (TOKENS.length - 1) * (w + gap) + w - 6} y1={90} x2={x0 + 6} y2={90}
                stroke={BWD} strokeWidth={1.8} markerEnd="url(#biB)" />
            )}
            {m.fwd && <text x={x0} y={30} fontSize={10} fill={FWD}>forward pass</text>}
            {m.bwd && <text x={x0} y={108} fontSize={10} fill={BWD}>backward pass</text>}
          </svg>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          {m.note}
        </p>
      </div>
    </Accent>
  )
}
