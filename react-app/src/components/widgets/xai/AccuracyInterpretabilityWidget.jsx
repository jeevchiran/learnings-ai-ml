import { useState } from 'react'

const COLOR = '#ca8a04'

// x = interpretability (0 opaque → 10 transparent), y = typical accuracy on hard tasks
const MODELS = [
  { name: 'Linear / Logistic Regression', x: 9.5, y: 3.5, note: 'Read the coefficients directly — but underfits complex data.' },
  { name: 'Decision Tree (shallow)',       x: 9.0, y: 4.5, note: 'Follow the path from root to leaf. Limited capacity.' },
  { name: 'k-NN',                          x: 6.5, y: 5.0, note: '"Similar neighbours voted this way" — but no global rule.' },
  { name: 'Random Forest',                 x: 4.0, y: 7.5, note: 'Hundreds of trees average out — no single readable path.' },
  { name: 'Gradient Boosting',             x: 3.5, y: 8.5, note: 'Strong tabular accuracy, opaque additive ensemble.' },
  { name: 'Deep Neural Network',           x: 1.5, y: 9.5, note: 'State-of-the-art on images/text, millions of weights.' },
]

export default function AccuracyInterpretabilityWidget() {
  const [sel, setSel] = useState(5)
  const W = 460, H = 300, pad = 46
  const sx = v => pad + (v / 10) * (W - 2 * pad)
  const sy = v => H - pad - (v / 10) * (H - 2 * pad)

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block', minWidth: 320 }}>
          {/* diagonal frontier */}
          <line x1={sx(10)} y1={sy(2)} x2={sx(1)} y2={sy(10)} stroke={COLOR} strokeWidth={1.5} strokeDasharray="6,4" opacity={0.5} />
          <text x={sx(5.5)} y={sy(5.2)} fontSize="10" fill={COLOR} transform={`rotate(-34 ${sx(5.5)} ${sy(5.2)})`} opacity={0.8}>
            the usual trade-off frontier
          </text>

          {/* axes */}
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--border)" strokeWidth={1} />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="var(--border)" strokeWidth={1} />
          <text x={(W) / 2} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--text-muted)">Interpretability →</text>
          <text x={14} y={H / 2} textAnchor="middle" fontSize="11" fill="var(--text-muted)" transform={`rotate(-90 14 ${H / 2})`}>Accuracy on hard tasks →</text>

          {MODELS.map((m, i) => (
            <g key={i} style={{ cursor: 'pointer' }} onClick={() => setSel(i)}>
              <circle cx={sx(m.x)} cy={sy(m.y)} r={i === sel ? 9 : 6}
                fill={i === sel ? COLOR : `${COLOR}88`}
                stroke={i === sel ? 'var(--text)' : 'none'} strokeWidth={1.5}
                style={{ transition: 'all 0.2s' }} />
            </g>
          ))}
        </svg>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
        {MODELS.map((m, i) => (
          <button key={i} onClick={() => setSel(i)}
            style={{ padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.76rem', cursor: 'pointer',
              border: `1.5px solid ${i === sel ? COLOR : 'var(--border)'}`,
              background: i === sel ? COLOR : 'var(--bg)', color: i === sel ? '#fff' : 'var(--text)' }}>
            {m.name}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '0.6rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.83rem' }}>
        <strong style={{ color: COLOR }}>{MODELS[sel].name}:</strong> {MODELS[sel].note}
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Models drift down the diagonal: the more accurate on hard problems, the harder to read. XAI aims to break this trade-off — keep the accuracy, add the explanation on top.
      </p>
    </div>
  )
}
