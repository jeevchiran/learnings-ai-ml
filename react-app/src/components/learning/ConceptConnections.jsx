import { useState } from 'react'
import { Link } from 'react-router-dom'
import { courses, moduleById } from '../../data/courses.js'
import { conceptConnections } from '../../data/conceptConnections.js'

export default function ConceptConnections({ mod }) {
  const map = conceptConnections[mod.courseId]
  const course = courses.find(c => c.id === mod.courseId)
  const current = map ? map.stages.reduce((found, stage, i) => moduleById[stage.start].moduleNumber <= mod.moduleNumber ? i : found, 0) : 0
  const [selected, setSelected] = useState(current)
  if (!map || !course) return null
  const stage = map.stages[selected]
  const start = moduleById[stage.start].moduleNumber
  const end = map.stages[selected + 1] ? moduleById[map.stages[selected + 1].start].moduleNumber : Infinity
  const lessons = course.modules.filter(m => moduleById[m.id].moduleNumber >= start && moduleById[m.id].moduleNumber < end)
  return <details className="concept-connections" open={mod.moduleNumber === 1}>
    <summary>Connect the ideas <span>— {map.stages[current].title}</span></summary>
    <p className="connection-hint">Follow the learning path. Select a stage to see why it matters and which lessons build it.</p>
    <ol className="connection-path" aria-label="Learning path">
      {map.stages.map((item, i) => <li key={item.start}>
        <button type="button" aria-pressed={selected === i} aria-current={current === i ? 'step' : undefined} onClick={() => setSelected(i)}>
          <span className="connection-number" aria-hidden="true">{i + 1}</span>
          <strong>{item.title}</strong>
          {current === i && <small>This lesson is here</small>}
        </button>
        {i < map.stages.length - 1 && <span className="connection-arrow" aria-hidden="true">→</span>}
      </li>)}
    </ol>
    <div className="connection-detail" aria-live="polite">
      <p><strong>{stage.title}:</strong> {stage.why}</p>
      <ul aria-label="Lessons in this stage">{lessons.map(lesson => <li key={lesson.id}>
        <Link to={`/module/${lesson.id}`} aria-current={lesson.id === mod.id ? 'page' : undefined}>{lesson.title}</Link>
      </li>)}</ul>
    </div>
    <div className="connection-transfer">
      <span aria-hidden="true">↳ </span><strong>Use this idea elsewhere:</strong> {map.connection}
      {' '}<Link to={`/module/${map.next}`}>{moduleById[map.next].title} →</Link>
    </div>
  </details>
}
