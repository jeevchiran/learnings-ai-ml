import { useState } from 'react'

const COLOR = '#0f766e'
const COLOR_NEG = '#ef4444'
const COLOR_POS = '#0f766e'

// Pre-computed hidden state "sentiments" per token per sentence
// Values in [-1, 1] representing accumulated sentiment signal
const SENTENCES = [
  {
    label: 'Positive',
    tokens: ['The', 'movie', 'was', 'absolutely', 'brilliant'],
    states: [0.1, 0.25, 0.3, 0.75, 0.92],
    label_pred: 'Positive 😊',
    confidence: 0.92,
  },
  {
    label: 'Negative',
    tokens: ['Terrible', 'plot', ',', 'boring', 'and', 'predictable'],
    states: [-0.7, -0.8, -0.78, -0.88, -0.85, -0.93],
    label_pred: 'Negative 😞',
    confidence: 0.93,
  },
  {
    label: 'Mixed',
    tokens: ['Great', 'acting', 'but', 'awful', 'script'],
    states: [0.6, 0.72, 0.3, -0.4, -0.65],
    label_pred: 'Negative 😐',
    confidence: 0.65,
  },
  {
    label: 'Negation',
    tokens: ['Not', 'bad', 'at', 'all'],
    states: [-0.5, -0.2, -0.1, 0.55],
    label_pred: 'Positive 😊',
    confidence: 0.55,
  },
]

function stateColor(v) {
  if (v > 0) {
    const t = Math.min(v, 1)
    return `rgb(${Math.round(15 + t * (0 - 15))},${Math.round(118 + t * (130 - 118))},${Math.round(110 + t * (100 - 110))})`
  } else {
    const t = Math.min(-v, 1)
    return `rgb(${Math.round(239 + t * (0 - 239))},${Math.round(68 + t * (0 - 68))},${Math.round(68 + t * (0 - 68))})`
  }
}

export default function SentimentWidget() {
  const [sentIdx, setSentIdx] = useState(0)
  const [step, setStep] = useState(-1)

  const sent = SENTENCES[sentIdx]
  const T = sent.tokens.length
  const visible = step === -1 ? T : step + 1

  const reset = (i) => { setSentIdx(i); setStep(-1) }

  const finalState = sent.states[T - 1]
  const predicted = step === T - 1 || step === -1

  return (
    <div>
      {/* Sentence selector */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
        {SENTENCES.map((s, i) => (
          <button key={i} onClick={() => reset(i)}
            style={{ padding: '0.25rem 0.6rem', borderRadius: 4, border: `2px solid ${i === sentIdx ? COLOR : 'var(--border)'}`, background: i === sentIdx ? COLOR : 'var(--bg)', color: i === sentIdx ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: '0.81rem', fontWeight: i === sentIdx ? 700 : 400 }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Token timeline */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1rem', overflowX: 'auto', alignItems: 'stretch' }}>
        {sent.tokens.map((tok, t) => {
          const isActive = t === step
          const isVisible = t < visible
          const hVal = sent.states[t]
          const bgColor = isVisible ? stateColor(hVal) : 'var(--bg-hover)'

          return (
            <div key={t} style={{ flex: 1, minWidth: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: isVisible ? 1 : 0.3, transition: 'opacity 0.3s', cursor: 'pointer' }}
              onClick={() => setStep(isActive ? -1 : t)}>
              {/* Hidden state bar */}
              <div style={{ width: '80%', height: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '0.3rem', position: 'relative' }}>
                <div style={{ width: '100%', height: '100%', background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    bottom: hVal >= 0 ? '50%' : undefined,
                    top: hVal < 0 ? '50%' : undefined,
                    left: 0, right: 0,
                    height: `${Math.abs(hVal) * 50}%`,
                    background: bgColor,
                    transition: 'all 0.35s',
                    borderRadius: 2,
                  }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'var(--border)' }} />
                </div>
              </div>
              {/* Token label */}
              <div style={{
                padding: '0.2rem 0.4rem',
                background: isActive ? COLOR : isVisible ? `${bgColor}22` : 'var(--bg-hover)',
                border: `1.5px solid ${isActive ? COLOR : isVisible ? bgColor : 'var(--border)'}`,
                borderRadius: 4,
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#fff' : 'var(--text)',
                fontFamily: 'monospace',
                transition: 'all 0.25s',
                textAlign: 'center',
                width: '85%',
              }}>
                {tok}
              </div>
              {/* Hidden state value */}
              {isVisible && (
                <div style={{ fontSize: '0.72rem', color: hVal >= 0 ? COLOR_POS : COLOR_NEG, marginTop: '0.2rem', fontFamily: 'monospace', fontWeight: 700 }}>
                  {hVal >= 0 ? '+' : ''}{hVal.toFixed(2)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sentiment bar */}
      <div style={{ marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
          <span style={{ color: COLOR_NEG }}>Negative</span>
          <span style={{ color: 'var(--text-muted)' }}>h_t signal</span>
          <span style={{ color: COLOR_POS }}>Positive</span>
        </div>
        <div style={{ height: 12, background: `linear-gradient(to right, #ef4444, var(--bg-hover), ${COLOR})`, borderRadius: 6, position: 'relative' }}>
          {(() => {
            const currentState = step === -1 ? finalState : sent.states[step]
            const pct = ((currentState + 1) / 2) * 100
            return (
              <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)', width: 16, height: 16, borderRadius: '50%', background: stateColor(currentState), border: '2px solid #fff', boxShadow: '0 0 4px rgba(0,0,0,0.3)', transition: 'left 0.35s' }} />
            )
          })()}
        </div>
      </div>

      {/* Prediction */}
      {(step === T - 1 || step === -1) && (
        <div style={{ background: 'var(--bg-hover)', borderLeft: `3px solid ${finalState >= 0 ? COLOR : COLOR_NEG}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.84rem' }}>
          <strong style={{ color: finalState >= 0 ? COLOR : COLOR_NEG }}>Prediction: {sent.label_pred}</strong>
          <span style={{ color: 'var(--text-muted)', marginLeft: '0.8rem' }}>confidence {(sent.confidence * 100).toFixed(0)}%</span>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.7rem', alignItems: 'center' }}>
        <button onClick={() => setStep(s => Math.max(-1, s - 1))} disabled={step <= -1}
          style={{ padding: '0.25rem 0.7rem', fontSize: '0.82rem', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg)', color: 'var(--text)', cursor: step > -1 ? 'pointer' : 'default', opacity: step > -1 ? 1 : 0.4 }}>
          ← Prev
        </button>
        <button onClick={() => setStep(s => Math.min(T - 1, s + 1))} disabled={step >= T - 1}
          style={{ padding: '0.25rem 0.7rem', fontSize: '0.82rem', border: 'none', borderRadius: 4, background: COLOR, color: '#fff', cursor: step < T - 1 ? 'pointer' : 'default', opacity: step < T - 1 ? 1 : 0.5 }}>
          Next →
        </button>
        <button onClick={() => setStep(-1)}
          style={{ padding: '0.25rem 0.7rem', fontSize: '0.82rem', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer' }}>
          Show All
        </button>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {step === -1 ? 'All tokens' : `Token ${step + 1}/${T}: "${sent.tokens[step]}"`}
        </span>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Bar height = h<sub>t</sub> signal (teal = positive, red = negative). Click tokens to step through. Notice how "but" and "not" flip the accumulated signal.
      </p>
    </div>
  )
}
