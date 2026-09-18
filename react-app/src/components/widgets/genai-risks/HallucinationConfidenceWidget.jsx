import { useState } from 'react'
import { Slider, Toggle, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#b91c1c'
const SAFE = '#0E8074'

/* Fluency and accuracy are independent, and the model's own confidence tracks
 * the first. Two bars that move separately is the fastest way to break the
 * assumption that a confident answer is a correct one. */

export default function HallucinationConfidenceWidget() {
  const [obscurity, setObscurity] = useState(0.7)
  const [grounded, setGrounded] = useState(false)

  const fluency = 0.95                                  // barely moves
  const accuracy = grounded
    ? 0.92 - 0.15 * obscurity
    : Math.max(0.05, 0.95 - 1.05 * obscurity)
  const stated = 0.9 - 0.12 * obscurity                  // the model's own confidence
  const gap = stated - accuracy

  const Bar = ({ label, v, color }) => (
    <div style={{ marginBottom: '0.45rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'monospace', color }}>{(v * 100).toFixed(0)}%</span>
      </div>
      <div style={{ height: 12, background: 'var(--bg-hover)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${v * 100}%`, height: '100%', background: color, transition: 'width .2s' }} />
      </div>
    </div>
  )

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
          <Slider label="how obscure the question is" value={obscurity} onChange={setObscurity}
            min={0} max={1} step={0.05} fmt={v => v.toFixed(2)} width={150} />
          <Toggle label="ground the answer in retrieved sources" on={grounded} onChange={setGrounded} />
        </div>

        <Bar label="fluency of the answer" v={fluency} color={SAFE} />
        <Bar label="confidence the model expresses" v={stated} color={SAFE} />
        <Bar label="actual accuracy" v={accuracy} color={accuracy < 0.5 ? COLOR : SAFE} />

        <Readout items={[['confidence minus accuracy', `${(gap * 100).toFixed(0)} points`]]} />

        <p style={{ fontSize: '0.78rem', color: gap > 0.3 ? COLOR : 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          {gap > 0.3
            ? 'Fluency and stated confidence have barely moved while accuracy has collapsed. Nothing in the output signals the difference, which is exactly why hallucination is dangerous rather than merely wrong: the failure is invisible at the point of use.'
            : grounded
              ? 'With retrieval, accuracy tracks the question rather than the model’s memory, and the gap between confidence and correctness narrows. This is the single most effective mitigation, and it works by changing where the answer comes from rather than by asking the model to be careful.'
              : 'On familiar ground, confidence and accuracy roughly agree. Push the obscurity slider up and watch them separate.'}
        </p>
      </div>
    </Accent>
  )
}
