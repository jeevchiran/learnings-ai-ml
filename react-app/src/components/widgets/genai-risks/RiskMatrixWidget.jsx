import { useState } from 'react'
import { Accent } from '../shared/ui.jsx'

const COLOR = '#b91c1c'

/* A risk register is a list in most write-ups, which buries the point that
 * likelihood and severity call for different responses. Positioning them on two
 * axes makes the triage obvious. */

const RISKS = [
  { id: 'hallucination', x: 0.86, y: 0.45, note: 'Very likely and usually recoverable, but it is the failure users meet daily. Mitigation is grounding and citation rather than better wording.' },
  { id: 'prompt injection', x: 0.55, y: 0.82, note: 'Less frequent, far more damaging, because it turns a helpful system into an attacker-controlled one. Constrain permissions rather than trusting the prompt.' },
  { id: 'training data leak', x: 0.22, y: 0.9, note: 'Rare but close to unrecoverable — you cannot un-disclose data. Handle it before deployment, not after.' },
  { id: 'toxic output', x: 0.4, y: 0.55, note: 'Moderate on both axes. Filtering catches most of it, and the residue is a reputational rather than structural problem.' },
  { id: 'stale knowledge', x: 0.75, y: 0.2, note: 'Common and mostly harmless, though it erodes trust. Retrieval addresses it directly.' },
  { id: 'bias amplification', x: 0.6, y: 0.7, note: 'Likely and severe in any decision-support setting, and the hardest to detect because the outputs look reasonable one at a time.' },
]

const W = 330, H = 250, PAD = 38

export default function RiskMatrixWidget() {
  const [sel, setSel] = useState(RISKS[1].id)
  const r = RISKS.find(x => x.id === sel)

  const toX = v => PAD + v * (W - PAD - 14)
  const toY = v => H - PAD - v * (H - PAD - 20)

  return (
    <Accent value={COLOR}>
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}
          role="img" aria-label="A scatter of risks positioned by likelihood on the horizontal axis and severity on the vertical axis.">
          <rect x={toX(0.5)} y={toY(1)} width={toX(1) - toX(0.5)} height={toY(0.5) - toY(1)}
            fill={COLOR} opacity={0.07} />
          <line x1={PAD} y1={H - PAD} x2={W - 10} y2={H - PAD} stroke="var(--border)" />
          <line x1={PAD} y1={14} x2={PAD} y2={H - PAD} stroke="var(--border)" />
          <text x={W - 10} y={H - PAD + 16} fontSize={9.5} textAnchor="end" fill="var(--text-muted)">likelihood →</text>
          <text x={PAD - 6} y={16} fontSize={9.5} fill="var(--text-muted)">severity ↑</text>

          {RISKS.map(k => (
            <g key={k.id} onClick={() => setSel(k.id)} style={{ cursor: 'pointer' }}>
              <circle cx={toX(k.x)} cy={toY(k.y)} r={sel === k.id ? 8 : 5.5}
                fill={COLOR} opacity={sel === k.id ? 0.95 : 0.4} />
              <text x={toX(k.x) + 11} y={toY(k.y) + 4} fontSize={9.5}
                fill={sel === k.id ? COLOR : 'var(--text-muted)'}>{k.id}</text>
            </g>
          ))}
        </svg>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.6 }}>
          <strong style={{ color: COLOR }}>{r.id}:</strong> {r.note}
        </p>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.6 }}>
          The shaded corner is where engineering effort belongs. A list of risks ranks them on one axis and
          hides the fact that a rare catastrophic failure and a constant minor annoyance need entirely
          different responses.
        </p>
      </div>
    </Accent>
  )
}
