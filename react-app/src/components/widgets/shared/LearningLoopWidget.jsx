import { useId, useState } from 'react'
import { Link } from 'react-router-dom'

// One observation, one weight, no bias; half-squared error.
export function learningStep(weight, rate) {
  const prediction = 2 * weight
  const loss = (prediction - 6) ** 2 / 2
  const gradient = (prediction - 6) * 2
  const nextWeight = weight - rate * gradient
  return { prediction, loss, gradient, nextWeight, nextPrediction: 2 * nextWeight, nextLoss: (2 * nextWeight - 6) ** 2 / 2 }
}
const fmt = value => Number(value.toFixed(3)).toString()
const stages = ['Predict', 'Measure error', 'Find the slope', 'Update the weight']
const px = w => 45 + (w + 2) / 12 * 530
const py = loss => 240 - loss * 2
const curve = Array.from({ length: 121 }, (_, i) => {
  const w = -2 + i / 10
  return `${i ? 'L' : 'M'}${px(w)},${py((2 * w - 6) ** 2 / 2)}`
}).join(' ')

export default function LearningLoopWidget() {
  const [weight, setWeight] = useState(1)
  const [rate, setRate] = useState(0.1)
  const [stage, setStage] = useState(0)
  const clipId = useId().replaceAll(':', '')
  const r = learningStep(weight, rate)
  const explanations = [
    `Multiply input by weight: 2 × ${fmt(weight)} = ${fmt(r.prediction)}. The observed target stays at 6.`,
    `Compare prediction with target: (${fmt(r.prediction)} − 6)² / 2 = ${fmt(r.loss)}. Squaring makes errors in either direction contribute positively.`,
    `The chain rule connects loss to weight: (prediction − target) × input = (${fmt(r.prediction)} − 6) × 2 = ${fmt(r.gradient)}. ${r.gradient < 0 ? 'A negative slope says a small increase in weight reduces loss.' : r.gradient > 0 ? 'A positive slope says a small decrease in weight reduces loss.' : 'The slope is zero: this example is already predicted exactly.'}`,
    `Subtract learning rate × gradient: ${fmt(weight)} − ${rate} × (${fmt(r.gradient)}) = ${fmt(r.nextWeight)}. Recompute the prediction: 2 × ${fmt(r.nextWeight)} = ${fmt(r.nextPrediction)}.`,
  ]
  const verdict = r.nextLoss < r.loss - 1e-9 ? 'decreased' : r.nextLoss > r.loss + 1e-9 ? 'increased' : 'stayed the same'
  return <section className="learning-loop" aria-label="From prediction to learning">
    <h3>One example, one complete learning loop</h3>
    <p>Follow the same numbers through all four steps. This toy model is <strong>prediction = weight × input</strong>, with input 2, target 6 and no bias. The loss is half the squared error.</p>
    <div className="loop-controls">
      <label>Starting weight: <strong>{fmt(weight)}</strong><input type="range" min="0" max="4" step="0.25" value={weight} onChange={e => setWeight(Number(e.target.value))} /></label>
      <label>Learning rate<select value={rate} onChange={e => setRate(Number(e.target.value))}>
        <option value="0.1">0.1 — a small step</option><option value="0.5">0.5 — try the boundary</option><option value="0.8">0.8 — a large step</option>
      </select></label>
    </div>
    <ol className="loop-stages" aria-label="Learning loop steps">{stages.map((title, i) => <li key={title}>
      <button type="button" aria-pressed={stage === i} onClick={() => setStage(i)}><span aria-hidden="true">{i + 1}. </span>{title}</button>
    </li>)}</ol>
    <div className="loop-explanation" role="status"><strong>{stages[stage]}.</strong> {explanations[stage]}</div>
    <div className="loop-prediction-flow" aria-label="Forward calculation">
      <div><small>Input stays fixed</small><strong>x = 2</strong></div><span aria-hidden="true">→</span>
      <div><small>Multiply by weight</small><strong>× {fmt(stage === 3 ? r.nextWeight : weight)}</strong></div><span aria-hidden="true">→</span>
      <div><small>{stage === 3 ? 'New prediction' : 'Current prediction'}</small><strong>{fmt(stage === 3 ? r.nextPrediction : r.prediction)}</strong></div>
    </div>
    <figure>
      <svg viewBox="0 0 620 300" role="img" aria-label={`Loss versus weight. Current weight ${fmt(weight)}, loss ${fmt(r.loss)}.${stage === 3 ? ` After one update: weight ${fmt(r.nextWeight)}, loss ${fmt(r.nextLoss)}.` : ''}`}>
        <defs><clipPath id={clipId}><rect x="45" y="38" width="530" height="205" /></clipPath></defs>
        {[0, 25, 50, 75, 100].map(value => <g key={value}><line x1="45" x2="575" y1={py(value)} y2={py(value)} className="loop-grid" /><text x="35" y={py(value) + 4} textAnchor="end">{value}</text></g>)}
        {[-2, 0, 3, 6, 10].map(value => <text key={value} x={px(value)} y="263" textAnchor="middle">{value}</text>)}
        <text x="45" y="22">Loss (lower is better)</text><text x="310" y="289" textAnchor="middle">Weight</text>
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1={px(3)} x2={px(3)} y1="40" y2="240" className="loop-minimum" />
        <text x={px(3) + 8} y="54">Best weight: 3</text>
        {stage === 2 && <line clipPath={`url(#${clipId})`} x1={px(weight - 1.5)} x2={px(weight + 1.5)} y1={py(r.loss - 1.5 * r.gradient)} y2={py(r.loss + 1.5 * r.gradient)} stroke="var(--accent)" strokeWidth="3" strokeDasharray="6 4" />}
        {stage === 3 && <>
          <line x1={px(weight)} y1={py(r.loss)} x2={px(r.nextWeight)} y2={py(r.nextLoss)} stroke="#b45309" strokeWidth="2" strokeDasharray="5 4" />
          <rect x={px(r.nextWeight) - 6} y={py(r.nextLoss) - 6} width="12" height="12" fill="#b45309" />
        </>}
        <circle cx={px(weight)} cy={py(r.loss)} r="6" fill="#2563eb" />
      </svg>
      <figcaption>Blue circle = starting weight. {stage === 2 ? 'The dashed tangent shows the local slope.' : stage === 3 ? 'Amber square = after one update; the dashed line joins the two states, not the path taken by training.' : 'The curve shows the loss you would get at each possible weight.'} The axes stay fixed when you change the controls.</figcaption>
    </figure>
    {stage === 3 && <div className="loop-outcome" role="status">
      Loss <strong>{verdict}</strong>: {fmt(r.loss)} → {fmt(r.nextLoss)}.
      {verdict === 'increased' ? ' The direction was locally downhill, but this step overshot. Try rate 0.1.' : verdict === 'stayed the same' && r.loss > 0 ? ' The update crossed the minimum and reached the same height on the other side.' : r.gradient === 0 ? ' The gradient is zero, so the weight stays unchanged.' : ' The model changed its weight; the input and target did not change.'}
    </div>}
    <div className="loop-navigation"><button type="button" disabled={stage === 0} onClick={() => setStage(stage - 1)}>← Previous step</button><button type="button" disabled={stage === 3} onClick={() => setStage(stage + 1)}>Next step →</button></div>
    <p><strong>Try this:</strong> keep the starting weight at 1. Compare rates 0.1 and 0.8 at the update step. Why can following the correct slope still increase loss?</p>
    <p className="loop-related"><strong>Same idea, different lessons:</strong> <Link to="/module/math-m10">gradient descent</Link> → <Link to="/module/regression-m2">fitting a regression line</Link> → <Link to="/module/dl-m6">backpropagation through more layers</Link>. A real model combines information from many examples; this visual isolates one calculation.</p>
  </section>
}
