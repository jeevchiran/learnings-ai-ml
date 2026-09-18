import { useState } from 'react'
import { Row, Btn, Accent } from '../shared/ui.jsx'

const COLOR = '#1e3a8a'
const TOKENS = ['fluffy', 'blue', 'creature', 'roamed']

/* One picture for the division of labour inside a block: attention is the only
 * place lines cross between columns, and the feed-forward layer has none at all. */

export default function FFNPerPositionWidget() {
  const [layer, setLayer] = useState('attention')
  const isAttn = layer === 'attention'
  const w = 92, gap = 22, x0 = 16
  const xs = TOKENS.map((_, i) => x0 + i * (w + gap))

  return (
    <Accent value={COLOR}>
      <div>
        <Row style={{ marginBottom: '0.5rem' }}>
          {['attention', 'feed forward'].map(k => (
            <Btn key={k} onClick={() => setLayer(k)} primary={layer === k}>{k}</Btn>
          ))}
        </Row>

        <svg viewBox="0 0 470 170" style={{ width: '100%', maxWidth: 470, height: 'auto', display: 'block' }}
          role="img" aria-label={isAttn
            ? 'Attention: lines connect every token column to every other column, so information is exchanged between positions.'
            : 'Feed forward: each token column passes through its own copy of the same small network with no lines between columns, so no information is exchanged.'}>
          {isAttn && TOKENS.map((_, i) => TOKENS.map((_, j) => i !== j && (
            <line key={i + '-' + j} x1={xs[j] + w / 2} y1={130} x2={xs[i] + w / 2} y2={84}
              stroke={COLOR} strokeWidth={1} opacity={0.32} />
          )))}

          {TOKENS.map((t, i) => (
            <g key={t}>
              <line x1={xs[i] + w / 2} y1={130} x2={xs[i] + w / 2} y2={84} stroke={COLOR} strokeWidth={1.6} />
              <line x1={xs[i] + w / 2} y1={50} x2={xs[i] + w / 2} y2={32} stroke={COLOR} strokeWidth={1.6} />

              <rect x={xs[i]} y={130} width={w} height={26} rx={5} fill="var(--bg-hover)" stroke="var(--border)" />
              <text x={xs[i] + w / 2} y={147} fontSize={12} textAnchor="middle" fill="var(--text)">{t}</text>

              <rect x={xs[i]} y={50} width={w} height={34} rx={5}
                fill={isAttn ? 'rgba(30,58,138,0.10)' : COLOR} stroke={COLOR} />
              <text x={xs[i] + w / 2} y={71} fontSize={11} textAnchor="middle" fill={isAttn ? COLOR : '#fff'}>
                {isAttn ? 'attention' : 'same MLP'}
              </text>

              <rect x={xs[i]} y={6} width={w} height={26} rx={5} fill="var(--bg-hover)" stroke="var(--border)" />
              <text x={xs[i] + w / 2} y={23} fontSize={12} textAnchor="middle" fill="var(--text)">{t}′</text>
            </g>
          ))}
        </svg>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.6, maxWidth: '62ch' }}>
          {isAttn
            ? 'Attention: every column reads from every other column. This is the only place in a block where tokens exchange information at all.'
            : 'Feed forward: the identical network, with the same weights, runs on each column separately. No line crosses between columns, so creature is processed without ever looking at fluffy.'}
        </p>
      </div>
    </Accent>
  )
}
