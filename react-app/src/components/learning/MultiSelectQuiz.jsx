import { useState } from 'react'

export default function MultiSelectQuiz({ question, options, correct }) {
  const [selected, setSelected] = useState(new Set())
  const [revealed, setRevealed] = useState(false)

  function toggle(i) {
    if (revealed) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const correctSet = new Set(correct)
  const allCorrect = revealed &&
    correct.length === selected.size &&
    correct.every(i => selected.has(i))

  return (
    <div className="lc-quiz">
      <p className="lc-quiz-q">
        {question}
        <em style={{ fontSize: '0.78em', opacity: 0.65, fontWeight: 400, marginLeft: '0.4em' }}>
          (select all that apply)
        </em>
      </p>
      <div className="lc-quiz-opts">
        {options.map((opt, i) => {
          let cls = 'lc-quiz-opt'
          if (revealed && correctSet.has(i)) cls += ' correct'
          if (revealed && selected.has(i) && !correctSet.has(i)) cls += ' wrong'
          const isSelected = selected.has(i)
          return (
            <button
              key={i}
              className={cls}
              onClick={() => toggle(i)}
              style={!revealed && isSelected ? { outline: '2px solid #7c3aed', outlineOffset: '1px' } : undefined}
            >
              <span style={{ marginRight: '0.4em', opacity: 0.7 }}>{isSelected && !revealed ? '☑' : '☐'}</span>
              {opt}
            </button>
          )
        })}
      </div>
      {!revealed && (
        <button
          onClick={() => setRevealed(true)}
          style={{
            marginTop: '0.6rem',
            background: '#7c3aed',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '0.35rem 0.9rem',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Check answers
        </button>
      )}
      {revealed && (
        <p className={`lc-quiz-result ${allCorrect ? 'correct' : 'wrong'}`}>
          {allCorrect
            ? 'Correct! All right answers selected.'
            : `Not quite. Correct: ${correct.map(i => options[i]).join('; ')}`}
        </p>
      )}
    </div>
  )
}
