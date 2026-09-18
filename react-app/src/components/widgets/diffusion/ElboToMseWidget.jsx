import { useState } from 'react'
import { Row, Btn, Accent } from '../shared/ui.jsx'

const COLOR = '#7c2d12'

/* The derivation collapses a forbidding variational bound into one line of
 * regression. Stepping through the three forms is the cheapest way to show that
 * the simplicity at the end is earned, not assumed. */

const STEPS = [
  {
    name: 'the bound',
    formula: 'E[ log p(x0|x1) ] − Σ KL( q(x_{t−1}|x_t, x0) ‖ p(x_{t−1}|x_t) ) − KL( q(x_T|x0) ‖ p(x_T) )',
    note: 'The variational bound, written out. One divergence term per timestep, plus a reconstruction term and a term comparing the fully noised image against the prior. This is the same shape as the VAE bound, just with hundreds of latent layers instead of one.',
  },
  {
    name: 'both sides are Gaussian',
    formula: 'KL( N(μ_q, σ²) ‖ N(μ_θ, σ²) ) = ‖ μ_q − μ_θ ‖² / (2σ²)',
    note: 'Every one of those divergence terms compares two Gaussians with the same variance, and that divergence has a closed form: a squared difference of means. The intimidating sum is now a sum of squared errors.',
  },
  {
    name: 'reparameterise the mean',
    formula: 'L_simple = E[ ‖ ε − ε_θ(x_t, t) ‖² ]',
    note: 'Writing each mean in terms of the noise that was added turns the squared difference of means into a squared difference of noise. Dropping the timestep-dependent weights, which helps in practice, leaves plain mean squared error on a noise prediction. That is the entire training objective.',
  },
]

export default function ElboToMseWidget() {
  const [i, setI] = useState(0)
  const s = STEPS[i]

  return (
    <Accent value={COLOR}>
      <div>
        <Row style={{ marginBottom: '0.7rem' }}>
          {STEPS.map((st, j) => (
            <Btn key={st.name} onClick={() => setI(j)} primary={i === j}>{j + 1}. {st.name}</Btn>
          ))}
        </Row>

        <div style={{
          padding: '0.8rem 0.9rem', borderRadius: 6, background: 'var(--bg-hover)',
          border: `1px solid ${COLOR}`, fontFamily: 'monospace', fontSize: i === 0 ? '0.76rem' : '0.9rem',
          overflowX: 'auto', color: 'var(--text)',
        }}>
          {s.formula}
        </div>

        <div style={{ display: 'flex', gap: 4, marginTop: '0.6rem' }}>
          {STEPS.map((_, j) => (
            <div key={j} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: j <= i ? COLOR : 'var(--bg-hover)',
            }} />
          ))}
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.55rem', lineHeight: 1.6 }}>
          {s.note}
        </p>
      </div>
    </Accent>
  )
}
