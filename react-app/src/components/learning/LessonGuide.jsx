import { Link } from 'react-router-dom'
import { moduleById } from '../../data/courses.js'
import { learningGuides } from '../../data/learningGuides.js'

export default function LessonGuide({ mod }) {
  const guide = learningGuides[mod.courseId]
  if (!guide) return null
  const first = mod.moduleNumber === 1
  return (
    <aside className="lesson-guide" aria-label="Lesson learning guide">
      <p><strong>Your focus:</strong> {mod.description}</p>
      <details open={first}>
        <summary>{first ? 'Start with a small example' : 'Need a refresher? Prerequisites and a small example'}</summary>
        <p>{guide.readiness}</p>
        {guide.prerequisites.length > 0 && <p className="lesson-prerequisites">
          <strong>Review if needed: </strong>
          {guide.prerequisites.map((id, i) => <span key={id}>
            {i > 0 && ' · '}<Link to={`/module/${id}`}>{moduleById[id]?.title ?? id}</Link>
          </span>)}
        </p>}
        <ol className="lesson-example" aria-label="Small worked example">
          {guide.example.map((step, i) => <li key={step}><span aria-hidden="true">{i + 1}</span>{step}</li>)}
        </ol>
        <p>{guide.takeaway}</p>
        <dl className="lesson-terms">{guide.terms.map(([term, meaning]) => <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl>
      </details>
      {first && <p className="lesson-study-hint">First follow the example. Then try one control at a time in each visual and explain what changed. You can use “Show explanation” whenever a prediction question feels unfamiliar.</p>}
    </aside>
  )
}
