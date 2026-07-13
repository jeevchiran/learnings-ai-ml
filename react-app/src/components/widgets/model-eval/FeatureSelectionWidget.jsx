import { useState, useEffect, useRef } from 'react'

const COLOR = '#c026d3'
const MUTED = 'var(--border)'

// Fixed synthetic feature set: mix of strong, medium, weak and pure-noise
// signals, plus a redundant pair (income / credit_limit are correlated).
// Ordered descending by true relevance so all three modes share one order.
const FEATURES = [
  { id: 'income', label: 'income', relevance: 0.90, filterScore: 0.88, baseCoef: 1.40, killLambda: 1.50 },
  { id: 'credit_limit', label: 'credit_limit', relevance: 0.85, filterScore: 0.84, baseCoef: 1.10, killLambda: 0.60 },
  { id: 'credit_score', label: 'credit_score', relevance: 0.80, filterScore: 0.79, baseCoef: 1.20, killLambda: 0.45 },
  { id: 'tenure_months', label: 'tenure_months', relevance: 0.62, filterScore: 0.58, baseCoef: 0.85, killLambda: 0.15 },
  { id: 'num_products', label: 'num_products', relevance: 0.55, filterScore: 0.52, baseCoef: 0.90, killLambda: 0.22 },
  { id: 'age', label: 'age', relevance: 0.48, filterScore: 0.45, baseCoef: 0.75, killLambda: 0.09 },
  { id: 'education_years', label: 'education_years', relevance: 0.30, filterScore: 0.28, baseCoef: 0.50, killLambda: 0.05 },
  { id: 'zip_noise', label: 'zip_noise', relevance: 0.12, filterScore: 0.15, baseCoef: 0.25, killLambda: 0.012 },
  { id: 'random_1', label: 'random_1', relevance: 0.04, filterScore: 0.06, baseCoef: 0.15, killLambda: 0.005 },
  { id: 'random_2', label: 'random_2', relevance: 0.02, filterScore: 0.03, baseCoef: 0.10, killLambda: 0.003 },
]

// Sequential Forward Selection trace: score climbs fast for the first good
// features, plateaus, then dips as the fixed step budget forces in the
// redundant and noisy features.
const WRAPPER_STEPS = [
  { id: null, score: 0.500 },
  { id: 'income', score: 0.706 },
  { id: 'credit_score', score: 0.782 },
  { id: 'num_products', score: 0.825 },
  { id: 'tenure_months', score: 0.849 },
  { id: 'age', score: 0.858 },
  { id: 'credit_limit', score: 0.860 },
  { id: 'education_years', score: 0.862 },
  { id: 'zip_noise', score: 0.858 },
  { id: 'random_1', score: 0.850 },
  { id: 'random_2', score: 0.840 },
]

const LAMBDA_MIN = 0.001

function coefAt(feature, lambda) {
  if (lambda >= feature.killLambda) return 0
  const logMin = Math.log10(LAMBDA_MIN)
  const logKill = Math.log10(feature.killLambda)
  const t = (Math.log10(lambda) - logMin) / (logKill - logMin)
  return feature.baseCoef * (1 - t)
}

function HBarChart({ items, maxValue, threshold, chartW = 250 }) {
  const rowH = 30
  const labelW = 112
  const svgW = labelW + chartW + 70
  const svgH = items.length * rowH + 8

  return (
    <svg width={svgW} height={svgH} style={{ display: 'block', maxWidth: '100%' }}>
      {threshold != null && (
        <line
          x1={labelW + threshold * chartW} y1={0}
          x2={labelW + threshold * chartW} y2={svgH}
          stroke={COLOR} strokeWidth={1.5} strokeDasharray="4,3"
        />
      )}
      {items.map((it, i) => {
        const y = i * rowH + 4
        const w = Math.max(0, (it.value / maxValue) * chartW)
        return (
          <g key={it.id}>
            <text x={labelW - 8} y={y + 14} textAnchor="end" fontSize="11" fill="var(--text)">{it.label}</text>
            <rect x={labelW} y={y} width={chartW} height={18} rx={3} fill="var(--bg-hover)" />
            {it.value > 0.0005 ? (
              <rect x={labelW} y={y} width={w} height={18} rx={3} fill={it.color}
                style={{ transition: 'width 0.3s, fill 0.3s' }} />
            ) : (
              <rect x={labelW + 1} y={y + 1} width={16} height={16} rx={2} fill="none"
                stroke="var(--text-muted)" strokeWidth={1.3} strokeDasharray="3,2" />
            )}
            <text x={labelW + chartW + 8} y={y + 14} fontSize="10.5" fill="var(--text-muted)">
              {it.value.toFixed(2)}{it.badge ? `  ${it.badge}` : ''}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function modeBtnStyle(active) {
  return {
    padding: '0.3rem 0.8rem', borderRadius: 5,
    border: `1px solid ${active ? COLOR : 'var(--border)'}`,
    background: active ? COLOR : 'var(--bg)',
    color: active ? '#fff' : 'var(--text)',
    fontWeight: active ? 700 : 400,
    cursor: 'pointer', fontSize: '0.83rem',
  }
}

function FilterMode() {
  const [threshold, setThreshold] = useState(0.5)

  const items = FEATURES
    .map(f => ({ id: f.id, label: f.label, value: f.filterScore, color: f.filterScore >= threshold ? COLOR : MUTED }))
    .sort((a, b) => b.value - a.value)
  const selectedCount = items.filter(it => it.value >= threshold).length

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.8rem', fontSize: '0.83rem' }}>
        <label style={{ flex: '1 1 220px' }}>
          <span style={{ fontWeight: 600 }}>Threshold: </span>{threshold.toFixed(2)}
          <input type="range" min={0} max={0.95} step={0.01} value={threshold}
            onChange={e => setThreshold(+e.target.value)}
            style={{ display: 'block', width: '100%', accentColor: COLOR }} />
        </label>
        <span style={{ background: 'var(--bg-hover)', borderRadius: 6, padding: '0.3rem 0.7rem', fontWeight: 600, color: COLOR }}>
          {selectedCount} / 10 features selected
        </span>
      </div>
      <HBarChart items={items} maxValue={1} threshold={threshold} />
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
        Each feature is scored independently against the target (e.g. mutual information). Filter methods
        rank fast but can't see redundancy — notice <strong>income</strong> and <strong>credit_limit</strong> both
        clear the bar even though they carry overlapping information.
      </p>
    </div>
  )
}

function ScoreLineChart({ step }) {
  const w = 320, h = 90, padL = 32, padR = 10, padT = 12, padB = 18
  const scores = WRAPPER_STEPS.map(s => s.score)
  const min = Math.min(...scores), max = Math.max(...scores)
  const x = i => padL + (i / 10) * (w - padL - padR)
  const y = v => padT + (1 - (v - min) / (max - min)) * (h - padT - padB)
  const pathAll = scores.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ')
  const pathDone = scores.slice(0, step + 1).map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ')

  return (
    <svg width={w} height={h} style={{ display: 'block', maxWidth: '100%' }}>
      <path d={pathAll} fill="none" stroke="var(--border)" strokeWidth={1.5} strokeDasharray="3,3" />
      <path d={pathDone} fill="none" stroke={COLOR} strokeWidth={2} />
      <circle cx={x(step)} cy={y(scores[step])} r={4} fill={COLOR} />
      <text x={x(step)} y={y(scores[step]) - 8} fontSize="10" fill={COLOR} textAnchor="middle" fontWeight="bold">
        {scores[step].toFixed(3)}
      </text>
      <text x={padL} y={h - 3} fontSize="9" fill="var(--text-muted)">step 0</text>
      <text x={w - padR} y={h - 3} fontSize="9" fill="var(--text-muted)" textAnchor="end">step 10</text>
    </svg>
  )
}

function WrapperMode() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep(s => {
          if (s >= 10) { setPlaying(false); return 10 }
          return s + 1
        })
      }, 850)
    }
    return () => clearInterval(timerRef.current)
  }, [playing])

  const nextStep = () => setStep(s => Math.min(10, s + 1))
  const reset = () => { setPlaying(false); setStep(0) }
  const animate = () => { if (step >= 10) setStep(0); setPlaying(true) }

  const selectedIds = WRAPPER_STEPS.slice(1, step + 1).map(s => s.id)
  const orderMap = {}
  selectedIds.forEach((id, i) => { orderMap[id] = i + 1 })

  const items = FEATURES.map(f => ({
    id: f.id, label: f.label, value: f.filterScore,
    color: selectedIds.includes(f.id) ? COLOR : MUTED,
    badge: orderMap[f.id] ? `#${orderMap[f.id]}` : '',
  }))

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.8rem', fontSize: '0.83rem' }}>
        <button onClick={nextStep} disabled={step >= 10 || playing}
          style={{ padding: '0.3rem 0.8rem', borderRadius: 5, border: 'none', background: COLOR, color: '#fff',
            cursor: (step >= 10 || playing) ? 'default' : 'pointer', opacity: (step >= 10 || playing) ? 0.5 : 1, fontSize: '0.83rem' }}>
          Next step ▶
        </button>
        <button onClick={animate} disabled={playing}
          style={{ padding: '0.3rem 0.8rem', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)',
            cursor: playing ? 'default' : 'pointer', opacity: playing ? 0.5 : 1, fontSize: '0.83rem' }}>
          ▶ Animate
        </button>
        <button onClick={reset}
          style={{ padding: '0.3rem 0.8rem', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.83rem' }}>
          Reset
        </button>
        <span style={{ marginLeft: 'auto', background: 'var(--bg-hover)', borderRadius: 6, padding: '0.3rem 0.7rem', fontWeight: 600, color: COLOR }}>
          Step {step} / 10 · Val. score {WRAPPER_STEPS[step].score.toFixed(3)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <HBarChart items={items} maxValue={1} />
        <div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Validation score vs. step</div>
          <ScoreLineChart step={step} />
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
        Sequential Forward Selection greedily adds whichever remaining feature helps the validation score most.
        The score climbs fast, plateaus once the signal is captured, then dips once <strong>zip_noise</strong> and
        the two <strong>random_*</strong> columns get forced in by the fixed step budget — a sign selection should
        have stopped earlier.
      </p>
    </div>
  )
}

function EmbeddedMode() {
  const [logLambda, setLogLambda] = useState(-1.5)
  const lambda = Math.pow(10, logLambda)

  const items = FEATURES.map(f => {
    const coef = coefAt(f, lambda)
    return { id: f.id, label: f.label, value: coef, color: coef > 0.0005 ? COLOR : MUTED }
  })
  const maxCoef = Math.max(...FEATURES.map(f => f.baseCoef))
  const nonzeroCount = items.filter(it => it.value > 0.0005).length

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.8rem', fontSize: '0.83rem' }}>
        <label style={{ flex: '1 1 260px' }}>
          <span style={{ fontWeight: 600 }}>Regularization strength λ: </span>{lambda < 0.01 ? lambda.toFixed(4) : lambda.toFixed(3)}
          <input type="range" min={-3} max={0} step={0.01} value={logLambda}
            onChange={e => setLogLambda(+e.target.value)}
            style={{ display: 'block', width: '100%', accentColor: COLOR }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>0.001</span><span>1</span>
          </div>
        </label>
        <span style={{ background: 'var(--bg-hover)', borderRadius: 6, padding: '0.3rem 0.7rem', fontWeight: 600, color: COLOR }}>
          {nonzeroCount} / 10 features have nonzero coefficient
        </span>
      </div>
      <HBarChart items={items} maxValue={maxCoef} chartW={220} />
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
        Lasso-style L1 regularization shrinks every coefficient toward zero as λ grows, but weak and noisy
        features hit exactly zero first — they're eliminated as part of fitting the model, no separate search needed.
        Watch how, past λ ≈ 0.6, even the redundant <strong>credit_limit</strong> gets zeroed out while
        <strong> income</strong> alone survives.
      </p>
    </div>
  )
}

const MODES = [
  { id: 'filter', label: 'Filter' },
  { id: 'wrapper', label: 'Wrapper' },
  { id: 'embedded', label: 'Embedded' },
]

export default function FeatureSelectionWidget() {
  const [mode, setMode] = useState('filter')

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={modeBtnStyle(mode === m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        {mode === 'filter' && <FilterMode />}
        {mode === 'wrapper' && <WrapperMode />}
        {mode === 'embedded' && <EmbeddedMode />}
      </div>
    </div>
  )
}
