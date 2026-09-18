import { useState } from 'react'
import { Row, Btn, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#06b6d4'
const ALT = '#b45309'

/* The famous analogy, drawn rather than asserted. Toy two-dimensional vectors,
 * chosen so the gender axis is horizontal and the royalty axis vertical, which
 * is exactly the structure the claim is about. */

const WORDS = {
  man: [0.2, 0.2], woman: [0.2, 0.75],
  king: [0.8, 0.2], queen: [0.8, 0.75],
  boy: [0.35, 0.15], girl: [0.35, 0.8],
}

const ANALOGIES = {
  'king − man + woman': ['king', 'man', 'woman', 'queen'],
  'boy − man + woman': ['boy', 'man', 'woman', 'girl'],
}
const KEYS = Object.keys(ANALOGIES)

const W = 320, H = 210, PAD = 30
const toX = v => PAD + v * (W - 2 * PAD)
const toY = v => H - PAD - v * (H - 2 * PAD)

export default function WordVectorArithmeticWidget() {
  const [k, setK] = useState(KEYS[0])
  const [a, b, c, expected] = ANALOGIES[k]

  const result = [0, 1].map(d => WORDS[a][d] - WORDS[b][d] + WORDS[c][d])
  const dist = w => Math.hypot(WORDS[w][0] - result[0], WORDS[w][1] - result[1])
  const nearest = Object.keys(WORDS)
    .filter(w => w !== a && w !== b && w !== c)
    .sort((x, y) => dist(x) - dist(y))[0]

  return (
    <Accent value={COLOR}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          {KEYS.map(key => <Btn key={key} onClick={() => setK(key)} primary={k === key}>{key}</Btn>)}
        </Row>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}
          role="img" aria-label={"A two-dimensional word space where " + a + " minus " + b + " plus " + c + " lands next to " + nearest + "."}>
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
          <line x1={PAD} y1={PAD - 10} x2={PAD} y2={H - PAD} stroke="var(--border)" />
          <text x={W - PAD} y={H - 10} fontSize={9.5} textAnchor="end" fill="var(--text-muted)">royalty →</text>
          <text x={PAD + 4} y={PAD - 14} fontSize={9.5} fill="var(--text-muted)">gender ↑</text>

          <line x1={toX(WORDS[b][0])} y1={toY(WORDS[b][1])} x2={toX(WORDS[a][0])} y2={toY(WORDS[a][1])}
            stroke={ALT} strokeWidth={1.6} strokeDasharray="4 3" />
          <line x1={toX(WORDS[c][0])} y1={toY(WORDS[c][1])} x2={toX(result[0])} y2={toY(result[1])}
            stroke={ALT} strokeWidth={1.6} strokeDasharray="4 3" />

          {Object.entries(WORDS).map(([w, v]) => (
            <g key={w}>
              <circle cx={toX(v[0])} cy={toY(v[1])} r={5}
                fill={w === expected ? COLOR : 'var(--text-muted)'}
                opacity={[a, b, c, expected].includes(w) ? 1 : 0.35} />
              <text x={toX(v[0]) + 8} y={toY(v[1]) + 4} fontSize={10.5}
                fill={w === expected ? COLOR : 'var(--text)'}
                opacity={[a, b, c, expected].includes(w) ? 1 : 0.4}>{w}</text>
            </g>
          ))}

          <circle cx={toX(result[0])} cy={toY(result[1])} r={7} fill="none" stroke={COLOR} strokeWidth={2} />
        </svg>

        <Readout items={[['result lands nearest', nearest]]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          The two dashed arrows are the same displacement. Subtracting one word and adding another moves you
          along a direction that means something — here, a change of gender with royalty held fixed. The
          analogy works because the embedding space has learned that direction, not because any single
          dimension was labelled.
        </p>
      </div>
    </Accent>
  )
}
