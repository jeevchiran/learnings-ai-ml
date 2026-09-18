import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#6366f1'
const WARN = '#b45309'

/* The two ELBO terms pull against each other. Showing them as opposing bars on
 * one axis makes the beta knob legible: it is not a tuning detail, it decides
 * which of two failures you get. */

export default function ElboSplitWidget() {
  const [beta, setBeta] = useState(1)

  // Stylised equilibrium: raising beta buys a tighter latent at the cost of
  // reconstruction, until the encoder gives up and collapses to the prior.
  const kl = 12 / (1 + 1.4 * beta)
  const recon = 24 + 18 * Math.log1p(beta * 1.6)
  const collapsed = kl < 0.9
  const total = recon + beta * kl
  const max = 90

  const Bar = ({ label, value, color, note }) => (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'monospace', color }}>{value.toFixed(2)}</span>
      </div>
      <div style={{ height: 12, background: 'var(--bg-hover)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: '100%', background: color, transition: 'width .2s' }} />
      </div>
      {note && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{note}</div>}
    </div>
  )

  return (
    <Accent value={COLOR}>
      <div>
        <Slider label="β (weight on the divergence term)" value={beta} onChange={setBeta}
          min={0} max={8} step={0.1} fmt={v => v.toFixed(1)} width={180} />

        <div style={{ marginTop: '0.7rem' }}>
          <Bar label="reconstruction error" value={recon} color={COLOR}
            note="how badly the decoder reproduces the input" />
          <Bar label="divergence from the prior" value={kl} color={WARN}
            note="how far the encoder's distribution drifts from a standard Gaussian" />
        </div>

        <Readout items={[['total loss', total.toFixed(2)], ['β', beta.toFixed(1)]]} />

        <p style={{ fontSize: '0.78rem', color: collapsed ? WARN : 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          {beta < 0.3
            ? 'Near zero, the divergence term barely applies. The latent space is free to spread into disconnected islands, so sampling from the prior lands in gaps and decodes to nothing meaningful — an autoencoder, not a generative model.'
            : collapsed
              ? 'The divergence term now dominates. The encoder has collapsed onto the prior and ignores its input entirely, so every sample decodes to the same blur. This is posterior collapse.'
              : 'A workable balance: the latent stays continuous enough to sample from, while the code still carries enough information to reconstruct.'}
        </p>
      </div>
    </Accent>
  )
}
