import { useState } from 'react'

const COLOR = '#4338ca'
const TP = '#16a34a'
const FP = '#dc2626'

// Sliders for prior, sensitivity, false-positive rate → live posterior P(D|+).
export default function BayesTheoremWidget() {
  const [prior, setPrior] = useState(1)   // % of population with disease
  const [sens, setSens] = useState(99)    // P(+ | D)
  const [fpr, setFpr] = useState(5)       // P(+ | ¬D)

  const pD = prior / 100, se = sens / 100, fp = fpr / 100
  const tp = se * pD                       // true positives
  const fpMass = fp * (1 - pD)             // false positives
  const posterior = tp / (tp + fpMass || 1e-9)

  const N = 1000
  const tpN = tp * N, fpN = fpMass * N
  const barTP = (tp / (tp + fpMass || 1e-9)) * 100

  return (
    <div>
      <Slider label="Disease prevalence P(D)" v={prior} set={setPrior} min={0.1} max={50} step={0.1} suffix="%" color={COLOR} />
      <Slider label="Test sensitivity P(+|D)" v={sens} set={setSens} min={50} max={100} step={1} suffix="%" color={COLOR} />
      <Slider label="False-positive rate P(+|¬D)" v={fpr} set={setFpr} min={0} max={30} step={0.5} suffix="%" color={COLOR} />

      <div style={{ margin: '0.9rem 0 0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        Of everyone who tests <strong>positive</strong>, what fraction is actually sick?
      </div>
      <div style={{ display: 'flex', height: 30, borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ width: `${barTP}%`, background: TP, transition: 'width 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.72rem' }}>
          {barTP > 12 ? 'truly sick' : ''}
        </div>
        <div style={{ flex: 1, background: FP, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.72rem' }}>
          {barTP < 88 ? 'false alarm' : ''}
        </div>
      </div>

      <div style={{ marginTop: '0.7rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.55rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.84rem' }}>
        Posterior <strong style={{ color: COLOR }}>P(D | +) = {(posterior * 100).toFixed(1)}%</strong>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontVariantNumeric: 'tabular-nums' }}>
          Per {N} people: <span style={{ color: TP }}>{tpN.toFixed(1)} true positives</span> vs <span style={{ color: FP }}>{fpN.toFixed(1)} false positives</span>.
        </div>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Drop the prevalence low and even a 99%-accurate test is mostly false alarms — the rare disease can't outvote the huge healthy majority. The prior refuses to be ignored.
      </p>
    </div>
  )
}

function Slider({ label, v, set, min, max, step, suffix, color }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.35rem 0', fontSize: '0.82rem' }}>
      <span style={{ width: 190, color: 'var(--text-muted)' }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={v} onChange={e => set(+e.target.value)} style={{ flex: 1, accentColor: color }} />
      <strong style={{ color, width: 48, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v}{suffix}</strong>
    </label>
  )
}
