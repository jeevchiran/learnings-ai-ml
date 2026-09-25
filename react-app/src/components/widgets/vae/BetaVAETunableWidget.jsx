import { useState } from 'react'

// Hypothetical candidate solutions: show objective arithmetic, not fabricated
// empirical percentages for disentanglement or collapse probability.
const candidates = [
  { name: 'A: less information in the code', reconstruction: 100, kl: 1 },
  { name: 'B: better reconstruction', reconstruction: 80, kl: 10 },
]

export default function BetaVAETunableWidget() {
  const [beta, setBeta] = useState(1)
  const losses = candidates.map(c => c.reconstruction + beta * c.kl)
  const preferred = losses[0] < losses[1] ? 'A' : losses[1] < losses[0] ? 'B' : 'Both equally'
  return (
    <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text)' }}>
      <h4>What does changing beta actually change?</h4>
      <p>Compare two hypothetical solutions using the loss to <strong>minimize</strong>: reconstruction error + beta × KL. Their component errors stay fixed so you can isolate the effect of the weight.</p>
      <label style={{ display: 'block', margin: '16px 0' }}>
        KL weight beta: <strong>{beta.toFixed(1)}</strong>
        <input type="range" min="0" max="10" step="0.1" value={beta} onChange={e => setBeta(Number(e.target.value))} style={{ display: 'block', width: '100%' }} />
      </label>
      {candidates.map((candidate, i) => <div key={candidate.name} style={{ margin: '14px 0' }}>
        <strong>{candidate.name}</strong>
        <p>{candidate.reconstruction} + {beta.toFixed(1)} × {candidate.kl} = <strong>{losses[i].toFixed(1)}</strong></p>
        <div aria-label={`${candidate.name} total loss ${losses[i].toFixed(1)}`} style={{ height: 16, background: 'var(--bg-hover)', borderRadius: 4 }}>
          <div style={{ display: 'flex', height: '100%', width: `${losses[i] / 180 * 100}%` }}>
            <div title="Reconstruction term" style={{ width: `${candidate.reconstruction / losses[i] * 100}%`, background: '#2563eb' }} />
            <div title="Weighted KL term" style={{ flex: 1, background: '#d97706' }} />
          </div>
        </div>
      </div>)}
      <p>Blue = reconstruction error; amber = weighted KL. Both bars use the same scale (0–180).</p>
      <p role="status"><strong>Lower loss at this weight: {preferred}.</strong></p>
      <p>Try beta = 1, then beta = 4. The preferred solution changes because B pays a larger KL penalty. In actual training, both component errors change too. This arithmetic does not predict disentanglement, sharpness or a probability of posterior collapse.</p>
    </div>
  )
}
