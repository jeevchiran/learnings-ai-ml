import { useId, useState } from 'react'

// ponytail: reuses QuizCard's pick-then-feedback classes — a predict step is
// just a quiz where the payoff is a widget instead of a "Correct!" label.
export default function PredictReveal({ prompt, options, correct, children }) {
  const [picked, setPicked] = useState(null)
  const revealId = useId()
  const revealed = picked !== null

  return (
    <div className="lc-predict">
      <p className="lc-predict-prompt">{prompt}</p>
      {!revealed ? (
        <>
        <div className="lc-quiz-opts">
          {options.map((opt, i) => (
            <button key={i} className="lc-quiz-opt" onClick={() => setPicked(i)}>
              {opt}
            </button>
          ))}
        </div>
        <button className="lc-study-btn" aria-controls={revealId} aria-expanded={false} onClick={() => setPicked('skip')}>
          Show explanation
        </button>
        </>
      ) : (
        <>
          {correct !== undefined && picked !== 'skip' && (
            <p role="status" className={`lc-quiz-result ${picked === correct ? 'correct' : 'wrong'}`}>
              {picked === correct ? "That's right — here's why." : "Not quite — here's what actually happens."}
            </p>
          )}
          <div id={revealId} className="lc-predict-reveal">{children}</div>
        </>
      )}
    </div>
  )
}
