import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { topics, allModules } from '../data/courses.js'
import { useProgressContext } from '../hooks/useProgress.jsx'

function TrackCard({ course }) {
  const { isCompleted, getTrackProgress, getLastVisited } = useProgressContext();
  const { completed, total } = getTrackProgress(course.modules.map(m => m.id));

  function getContinueId() {
    let best = null, bestTs = 0;
    for (const m of course.modules) {
      const ts = getLastVisited(m.id) || 0;
      if (ts > bestTs) { bestTs = ts; best = m.id; }
    }
    if (best) return best;
    const firstIncomplete = course.modules.find(m => !isCompleted(m.id));
    return firstIncomplete ? firstIncomplete.id : course.modules[0].id;
  }

  const continueId = getContinueId();
  return (
    <Link
      to={`/module/${continueId}`}
      className="track-card"
      style={{ '--card-color': course.color }}
    >
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${total ? completed / total * 100 : 0}%`, background: course.color }} />
      </div>
      <div className="progress-label">
        {completed === total && total > 0 ? '✓ Complete' : `${completed} / ${total} modules`}
      </div>
      <span className="continue-btn" style={{ color: course.color }}>
        {completed === 0 ? 'Start →' : completed === total ? 'Review →' : 'Continue →'}
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const { isCompleted, isBookmarked } = useProgressContext();
  const completedCount  = allModules.filter(m => isCompleted(m.id)).length;
  const bookmarkedCount = allModules.filter(m => isBookmarked(m.id)).length;

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <h1 className="dashboard-heading">ML Atlas</h1>
      <p className="dashboard-sub">New to AI? Start by <Link to="/module/eda-m1">exploring a table of taxi trips</Link>, then <Link to="/module/regression-m1">fit your first prediction model</Link>.</p>

      <div className="stats-row">
        <div className="stat"><strong>{completedCount}</strong> / {allModules.length} modules completed</div>
        <div className="stat"><strong>{bookmarkedCount}</strong> bookmarked</div>
      </div>

      {topics.map(topic => (
        <section className="dashboard-topic" key={topic.title} aria-label={topic.title}>
          <h2>{topic.title}</h2>
          <div className="track-grid">
            {topic.courses.map(course => <TrackCard key={course.id} course={course} />)}
          </div>
        </section>
      ))}
    </motion.div>
  );
}
