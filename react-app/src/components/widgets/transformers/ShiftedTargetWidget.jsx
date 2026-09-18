import { useState } from 'react'
import { Accent } from '../shared/ui.jsx'

const COLOR = '#1e3a8a'
const TARGET_COLOR = '#b45309'

/* "Outputs shifted right" is the phrase that loses most first-time readers.
 * Two aligned rows with a per-position pointer makes it concrete: what goes in
 * at position t, and what position t is graded against. */

const TARGET = ['SOS', 'a', 'fluffy', 'blue', 'creature', 'EOS']
const INPUT = TARGET.slice(0, -1)
const LABELS = TARGET.slice(1)

export default function ShiftedTargetWidget() {
  const [t, setT] = useState(2)
  const cellW = 74, gap = 6, x0 = 104

  const chip = (x, y, text, fill, stroke, dim, light) => (
    <g key={x + '-' + y + '-' + text} opacity={dim ? 0.28 : 1}>
      <rect x={x} y={y} width={cellW} height={26} rx={5} fill={fill} stroke={stroke} />
      <text x={x + cellW / 2} y={y + 17} fontSize={11.5} textAnchor="middle" fontFamily="monospace"
        fill={light ? '#fff' : 'var(--text)'}>{text}</text>
    </g>
  )

  const cx = x0 + t * (cellW + gap) + cellW / 2

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {INPUT.map((_, i) => (
            <button key={i} onClick={() => setT(i)} style={{
              padding: '0.25rem 0.6rem', fontSize: '0.8rem', borderRadius: 4, cursor: 'pointer',
              border: t === i ? 'none' : '1px solid var(--border)',
              background: t === i ? COLOR : 'var(--bg)', color: t === i ? '#fff' : 'var(--text)',
            }}>position {i}</button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <svg viewBox="0 0 520 120" width={520} style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            role="img" aria-label={"Two aligned rows. The decoder input row is the target shifted right by one. Position " + t + " sees the input up to that point and is graded against the token directly below it in the target row."}>
            <text x={0} y={27} fontSize={11} fill="var(--text-muted)">decoder input</text>
            <text x={0} y={97} fontSize={11} fill="var(--text-muted)">graded against</text>

            {INPUT.map((tok, i) => chip(
              x0 + i * (cellW + gap), 10, tok,
              i === t ? COLOR : i < t ? 'rgba(30,58,138,0.16)' : 'var(--bg-hover)',
              COLOR, i > t, i === t,
            ))}
            {LABELS.map((tok, i) => chip(
              x0 + i * (cellW + gap), 80, tok,
              i === t ? TARGET_COLOR : 'var(--bg-hover)',
              i === t ? TARGET_COLOR : 'var(--border)', i !== t, i === t,
            ))}

            <line x1={cx} y1={36} x2={cx} y2={78} stroke={TARGET_COLOR} strokeWidth={1.6} strokeDasharray="4 3" />
            <text x={cx + 6} y={62} fontSize={10.5} fill={TARGET_COLOR}>predict →</text>
          </svg>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.6, maxWidth: '62ch' }}>
          Position {t} sees{' '}
          <span style={{ fontFamily: 'monospace' }}>{INPUT.slice(0, t + 1).join(' ')}</span>{' '}
          — its causal window, shown solid — and is graded on producing{' '}
          <strong style={{ color: TARGET_COLOR, fontFamily: 'monospace' }}>{LABELS[t]}</strong>.
          Every position does this at the same time in one forward pass, and the loss is the average over all {INPUT.length} of them.
        </p>
      </div>
    </Accent>
  )
}
