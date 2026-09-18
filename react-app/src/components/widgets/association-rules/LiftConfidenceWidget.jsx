import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#0891b2'
const WARN = '#b45309'

/* Three sliders and the three metrics recomputed live. The lesson is the one
 * the module argues in prose: confidence can be high while lift sits below 1,
 * and only lift notices. */

export default function LiftConfidenceWidget() {
  const [sA, setSA] = useState(0.4)
  const [sB, setSB] = useState(0.7)
  const [sAB, setSAB] = useState(0.28)

  const maxAB = Math.min(sA, sB)
  const ab = Math.min(sAB, maxAB)
  const confidence = sA === 0 ? 0 : ab / sA
  const lift = sB === 0 ? 0 : confidence / sB
  const leverage = ab - sA * sB

  const misleading = confidence > 0.6 && lift < 1

  const Bar = ({ label, v, ref_, color }) => (
    <div style={{ marginBottom: '0.45rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'monospace', color }}>{v.toFixed(3)}</span>
      </div>
      <div style={{ position: 'relative', height: 12, background: 'var(--bg-hover)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, (v / (ref_ * 2)) * 100)}%`, height: '100%', background: color, transition: 'width .15s' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--text-muted)' }} />
      </div>
    </div>
  )

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
          <Slider label="support(A)" value={sA} onChange={setSA} min={0.05} max={1} step={0.01}
            fmt={v => v.toFixed(2)} width={110} />
          <Slider label="support(B)" value={sB} onChange={setSB} min={0.05} max={1} step={0.01}
            fmt={v => v.toFixed(2)} width={110} />
          <Slider label="support(A and B)" value={ab} onChange={setSAB} min={0} max={1} step={0.01}
            fmt={v => v.toFixed(2)} width={120} />
        </div>

        <Bar label="confidence — P(B given A)" v={confidence} ref_={0.5} color={COLOR} />
        <Bar label="lift — confidence over B's baseline" v={lift} ref_={1} color={lift < 1 ? WARN : COLOR} />

        <Readout items={[
          ['leverage', leverage.toFixed(3)],
          ['verdict', lift > 1.05 ? 'positive association' : lift < 0.95 ? 'negative association' : 'independent'],
        ]} />

        <p style={{ fontSize: '0.78rem', color: misleading ? WARN : 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          {misleading
            ? 'Confidence looks strong and lift is below 1. B is simply common, so most baskets contain it whatever else is in them — buying A actually makes B less likely than average. This is the case a confidence threshold alone will always let through.'
            : 'The vertical tick on the lift bar marks 1, which is where the two items are independent. Raise the support of B on its own and watch confidence stay put while lift falls: confidence measures the rule, lift measures whether the rule beats doing nothing.'}
        </p>
      </div>
    </Accent>
  )
}
