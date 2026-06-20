import { useState } from 'react'

export default function QuizCard({ question, options, correct }) {
  const [selected, setSelected] = useState(null)
  const solved = selected === correct

  function pick(i) {
    if (solved) return
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
            <button key={i} className={cls} onClick={() => pick(i)} disabled={solved}>
              {opt}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <p className={`lc-quiz-result ${solved ? 'correct' : 'wrong'}`}>
          {solved ? 'Correct!' : 'Try again'}
        </p>
      )}
    </div>
  )
}
