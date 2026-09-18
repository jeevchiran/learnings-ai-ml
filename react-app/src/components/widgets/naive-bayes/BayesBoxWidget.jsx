import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#4338ca'
const ALT = '#b45309'

/* The base-rate fallacy as areas rather than algebra. Counting rectangles is
 * something people are good at; dividing conditional probabilities is not. */

const N = 1000

export default function BayesBoxWidget() {
  const [prior, setPrior] = useState(0.05)
  const [tpr, setTpr] = useState(0.9)
  const [fpr, setFpr] = useState(0.1)

  const positives = N * prior
  const negatives = N - positives
  const truePos = positives * tpr
  const falsePos = negatives * fpr
  const posterior = truePos + falsePos === 0 ? 0 : truePos / (truePos + falsePos)

  const W = 320, H = 130
  const splitX = prior * W

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <Slider label="base rate" value={prior} onChange={setPrior} min={0.01} max={0.6} step={0.01}
            fmt={v => `${(v * 100).toFixed(0)}%`} width={110} />
          <Slider label="true positive rate" value={tpr} onChange={setTpr} min={0.5} max={0.99} step={0.01}
            fmt={v => `${(v * 100).toFixed(0)}%`} width={110} />
          <Slider label="false positive rate" value={fpr} onChange={setFpr} min={0.01} max={0.5} step={0.01}
            fmt={v => `${(v * 100).toFixed(0)}%`} width={110} />
        </div>

        <svg viewBox={`0 0 ${W} ${H + 18}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}
          role="img" aria-label={"A population of 1000 split into a positive group and a negative group. " + Math.round(truePos) + " true positives against " + Math.round(falsePos) + " false positives."}>
          <rect x={0} y={0} width={splitX} height={H} fill="var(--bg-hover)" stroke="var(--border)" />
          <rect x={0} y={H * (1 - tpr)} width={splitX} height={H * tpr} fill={COLOR} opacity={0.85} />

          <rect x={splitX} y={0} width={W - splitX} height={H} fill="var(--bg-hover)" stroke="var(--border)" />
          <rect x={splitX} y={H * (1 - fpr)} width={W - splitX} height={H * fpr} fill={ALT} opacity={0.85} />

          <text x={splitX / 2} y={H + 13} fontSize={9.5} textAnchor="middle" fill={COLOR}>
            has it ({Math.round(positives)})
          </text>
          <text x={splitX + (W - splitX) / 2} y={H + 13} fontSize={9.5} textAnchor="middle" fill={ALT}>
            does not ({Math.round(negatives)})
          </text>
        </svg>

        <Readout items={[
          ['true positives', Math.round(truePos)],
          ['false positives', Math.round(falsePos)],
          ['P(has it | tested positive)', `${(posterior * 100).toFixed(1)}%`],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          The two coloured blocks are everyone who tests positive. Drag the base rate down and watch the orange
          block dwarf the blue one without either test rate changing. The answer depends on the width of the
          right-hand column, not on how good the test is — which is the term people leave out.
        </p>
      </div>
    </Accent>
  )
}
