import { useState } from 'react'

export default function QuizCard({ question, options, correct, explanation }) {
  const [selected, setSelected] = useState(null)
  const solved = selected === correct

  function pick(i) {
    if (selected !== null) return
    setSelected(i)
  }

  return (
    <div className="lc-quiz">
      <p className="lc-quiz-q">{question}</p>
      <div className="lc-quiz-opts">
        {options.map((opt, i) => {
          let cls = 'lc-quiz-opt'
          if (selected !== null && i === correct) cls += ' correct'
          if (selected === i && i !== correct) cls += ' wrong'
          return (
            <button key={i} className={cls} onClick={() => pick(i)} disabled={selected !== null}>
              {opt}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <div role="status" aria-live="polite">
          <p className={`lc-quiz-result ${solved ? 'correct' : 'wrong'}`}>
            {solved ? 'Correct!' : `Not quite. Correct answer: ${options[correct]}`}
          </p>
          {explanation && <p>{explanation}</p>}
          <button className="lc-study-btn" onClick={() => setSelected(null)}>Try again</button>
        </div>
      )}
    </div>
  )
}
