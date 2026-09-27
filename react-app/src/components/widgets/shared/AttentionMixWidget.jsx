import { useState } from 'react'
import { Link } from 'react-router-dom'

export function attentionMix(futureScore, causal) {
  const raw = [1, Math.E, causal ? 0 : Math.exp(futureScore)]
  const total = raw.reduce((sum, value) => sum + value, 0)
  const weights = raw.map(value => value / total)
  const contributions = weights.map((weight, i) => weight * [2, 6, 10][i])
  return { weights, contributions, context: contributions.reduce((sum, value) => sum + value, 0) }
}

export default function AttentionMixWidget() {
  const [score, setScore] = useState(2)
  const [causal, setCausal] = useState(false)
  const { weights, contributions, context } = attentionMix(score, causal)
  return <section className="attention-mix learning-loop" aria-label="Attention as a weighted mixture">
    <h3>Follow one token: scores become a mixture</h3>
    <p>Update the middle token, <strong>“blue”</strong>, in “the blue bird.” Each token supplies one illustrative value coordinate: 2, 6 or 10. Real attention mixes whole vectors; these made-up numbers isolate one coordinate.</p>
    <div className="loop-controls">
      <label>Score for future token “bird”: <strong>{score.toFixed(1)}</strong><input type="range" min="-4" max="4" step="0.1" value={score} disabled={causal} onChange={e => setScore(Number(e.target.value))} /></label>
      <label className="attention-mask"><input type="checkbox" checked={causal} onChange={e => setCausal(e.target.checked)} /> Apply causal mask: hide the future token</label>
    </div>
    <p>Read downward: <strong>score → softmax weight → weighted value</strong>. Softmax exponentiates each allowed score, then divides by their sum. A masked token gets zero weight and is excluded from that sum.</p>
    <div className="attention-columns">{['the', 'blue', 'bird'].map((token, i) => <div className={`attention-token${causal && i === 2 ? ' is-masked' : ''}`} key={token}>
      <strong>“{token}”</strong><small>{['Earlier position', 'Current position', 'Future position'][i]}</small>
      <p>Score: <strong>{causal && i === 2 ? 'masked' : [0, 1, score][i].toFixed(1)}</strong></p>
      <span aria-hidden="true">↓</span>
      <div className="attention-bar" role="img" aria-label={`${token} attention weight ${(weights[i] * 100).toFixed(1)} percent`}><div style={{ height: `${weights[i] * 100}%` }} /></div>
      <strong>{(weights[i] * 100).toFixed(1)}%</strong><small>of the attention weight</small>
      <span aria-hidden="true">↓</span>
      <p>{weights[i].toFixed(3)} × {[2, 6, 10][i]}<br /><strong>= {contributions[i].toFixed(3)}</strong></p>
    </div>)}</div>
    <div className="loop-outcome" role="status">
      <strong>Add the contributions → updated value coordinate: {context.toFixed(3)}</strong>
      <p>{contributions.map(value => value.toFixed(3)).join(' + ')} ≈ {context.toFixed(3)}. Displayed values are rounded.</p>
      <p>{causal ? '“Bird” contributes zero. The remaining weights are renormalized, so they still sum to 100%.' : 'Raising the score for “bird” moves the mixture toward its value of 10. Its value stays fixed; its share of the mixture changes.'}</p>
    </div>
    <p><strong>Try this:</strong> raise the future token’s score, then apply the mask. Predict which bars will grow before toggling it. Attention weights allocate a mixture; they are not probabilities that the tokens are factually correct.</p>
    <p className="loop-related"><strong>Connect the dots:</strong> <Link to="/module/math-m1">dot products produce scores</Link> → <Link to="/module/aed-m7">attention mixes values</Link> → <Link to="/module/trf-m5">self-attention updates token representations</Link>. This is one head’s weighted sum before output projections or residual connections.</p>
  </section>
}
