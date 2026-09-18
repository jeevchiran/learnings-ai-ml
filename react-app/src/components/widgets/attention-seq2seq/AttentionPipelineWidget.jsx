import { useState } from 'react'
import { Row, Btn, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#b45309'

/* The four stages walked one at a time. Showing them separately matters because
 * the usual single formula hides that softmax is a distinct, load-bearing step. */

const SRC = ['le', 'chat', 'noir', 'dort']
const GLOSS = ['the', 'cat', 'black', 'sleeps']
const SCORES = [0.4, 3.1, 2.4, 0.2]   // decoder is about to emit "cat"
const VALUES = [
  [0.1, 0.2], [0.9, 0.3], [0.4, 0.8], [0.2, 0.1],
]

function softmax(xs) {
  const m = Math.max(...xs)
  const e = xs.map(x => Math.exp(x - m))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map(v => v / s)
}

const STAGES = [
  { name: '1. score', note: 'Each encoder state is scored against the decoder state. Raw numbers, any size, positive or negative.' },
  { name: '2. normalise', note: 'Softmax turns the scores into weights that are all positive and sum to exactly 1 — which is what makes the next step an average rather than an arbitrary sum.' },
  { name: '3. combine', note: 'The weighted sum of the encoder states. This context vector is rebuilt from scratch for every output token.' },
  { name: '4. generate', note: 'The context vector joins the decoder state to produce the next word. Attention has done its job the moment step 3 finishes.' },
]

export default function AttentionPipelineWidget() {
  const [stage, setStage] = useState(0)
  const alpha = softmax(SCORES)
  const context = [0, 1].map(d => VALUES.reduce((acc, v, j) => acc + alpha[j] * v[d], 0))
  const shown = stage === 0 ? SCORES : alpha
  const max = Math.max(...shown.map(Math.abs))

  return (
    <Accent value={COLOR}>
      <div>
        <Row style={{ marginBottom: '0.7rem' }}>
          {STAGES.map((s, i) => (
            <Btn key={s.name} onClick={() => setStage(i)} primary={stage === i}>{s.name}</Btn>
          ))}
        </Row>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: 108, overflowX: 'auto' }}>
          {SRC.map((w, j) => {
            const v = shown[j]
            const h = Math.max(3, (Math.abs(v) / max) * 78)
            const dim = stage >= 3
            return (
              <div key={w} style={{ textAlign: 'center', minWidth: 60, opacity: dim ? 0.35 : 1 }}>
                <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{
                    width: 32, height: h, background: COLOR, borderRadius: '3px 3px 0 0',
                    transition: 'height .25s',
                  }} />
                </div>
                <div style={{ fontSize: '0.76rem', marginTop: 3 }}>{w}</div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{GLOSS[j]}</div>
                <div style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>{v.toFixed(2)}</div>
              </div>
            )
          })}
        </div>

        {stage >= 1 && (
          <p style={{ fontSize: '0.78rem', fontFamily: 'monospace', marginTop: '0.5rem' }}>
            sum of weights = {alpha.reduce((a, b) => a + b, 0).toFixed(3)}
          </p>
        )}

        {stage >= 2 && (
          <Readout items={[['context vector', `[${context.map(v => v.toFixed(3)).join(', ')}]`]]} />
        )}

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.55rem', lineHeight: 1.6 }}>
          {STAGES[stage].note}
        </p>
      </div>
    </Accent>
  )
}
