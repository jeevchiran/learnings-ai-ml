import { useState } from 'react'

// ponytail: reuses QuizCard's pick-then-feedback classes — a predict step is
// just a quiz where the payoff is a widget instead of a "Correct!" label.
export default function PredictReveal({ prompt, options, correct, children }) {
  const [picked, setPicked] = useState(null)
  const revealed = picked !== null

  return (
    <div className="lc-predict">
      <p className="lc-predict-prompt">{prompt}</p>
      {!revealed ? (
        <div className="lc-quiz-opts">
          {options.map((opt, i) => (
            <button key={i} className="lc-quiz-opt" onClick={() => setPicked(i)}>
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <>
          {correct !== undefined && (
            <p className={`lc-quiz-result ${picked === correct ? 'correct' : 'wrong'}`}>
              {picked === correct ? "That's right — here's why." : "Not quite — here's what actually happens."}
            </p>
          )}
          <div className="lc-predict-reveal">{children}</div>
        </>
      )}
    </div>
  )
}
