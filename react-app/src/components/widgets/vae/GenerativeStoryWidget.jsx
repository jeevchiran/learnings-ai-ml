import { useState } from 'react'
import { Row, Btn, Accent } from '../shared/ui.jsx'

const COLOR = '#6366f1'

/* The generative story runs one way and inference runs the other. Drawing both
 * directions on the same picture is what makes it clear that q(z|x) is an
 * invention to make an intractable integral computable, not part of the story. */

const MODES = {
  'generative story': {
    dir: 'forward',
    caption: 'The model claims data is produced this way: draw a latent code from a simple prior, push it through the decoder, get an observation. This direction is cheap and always available.',
  },
  'what you actually want': {
    dir: 'backward',
    caption: 'Given an observation, which latent code produced it? Answering exactly needs an integral over every possible code, which is why it is intractable.',
  },
  'the approximation': {
    dir: 'approx',
    caption: 'So a second network is trained to guess the answer directly. That network is the encoder, and the gap between its guess and the true posterior is what the divergence term in the loss measures.',
  },
}
const KEYS = Object.keys(MODES)

export default function GenerativeStoryWidget() {
  const [k, setK] = useState(KEYS[0])
  const m = MODES[k]
  const fwd = m.dir === 'forward'
  const approx = m.dir === 'approx'

  return (
    <Accent value={COLOR}>
      <div>
        <Row style={{ marginBottom: '0.7rem' }}>
          {KEYS.map(key => <Btn key={key} onClick={() => setK(key)} primary={k === key}>{key}</Btn>)}
        </Row>

        <svg viewBox="0 0 380 130" style={{ width: '100%', maxWidth: 380, height: 'auto' }}
          role="img" aria-label={m.caption}>
          <defs>
            <marker id="vaeArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke={COLOR} strokeWidth={1.8} strokeLinecap="round" />
            </marker>
          </defs>

          <circle cx={60} cy={45} r={30} fill="rgba(99,102,241,0.14)" stroke={COLOR} />
          <text x={60} y={42} fontSize={13} textAnchor="middle" fill={COLOR} fontFamily="monospace">z</text>
          <text x={60} y={56} fontSize={9} textAnchor="middle" fill="var(--text-muted)">latent</text>
          <text x={60} y={96} fontSize={9.5} textAnchor="middle" fill="var(--text-muted)">prior N(0, I)</text>

          <rect x={300} y={15} width={60} height={60} rx={5} fill="var(--bg-hover)" stroke="var(--border)" />
          <text x={330} y={42} fontSize={13} textAnchor="middle" fill="var(--text)" fontFamily="monospace">x</text>
          <text x={330} y={56} fontSize={9} textAnchor="middle" fill="var(--text-muted)">observed</text>

          {(fwd || approx) && (
            <>
              <line x1={92} y1={38} x2={296} y2={38} stroke={COLOR} strokeWidth={1.7} markerEnd="url(#vaeArrow)" />
              <text x={194} y={30} fontSize={10.5} textAnchor="middle" fill={COLOR}>decoder p(x | z)</text>
            </>
          )}
          {!fwd && (
            <>
              <line x1={296} y1={60} x2={92} y2={60} stroke={COLOR} strokeWidth={1.7}
                strokeDasharray={approx ? undefined : '5 4'} markerEnd="url(#vaeArrow)" />
              <text x={194} y={76} fontSize={10.5} textAnchor="middle" fill={COLOR}>
                {approx ? 'encoder q(z | x) — the learned stand-in' : 'true posterior p(z | x) — intractable'}
              </text>
            </>
          )}
        </svg>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          {m.caption}
        </p>
      </div>
    </Accent>
  )
}
