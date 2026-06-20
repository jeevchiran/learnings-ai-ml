import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses, allModules } from '../data/courses.js'
import { useProgressContext } from '../hooks/useProgress.jsx'

export default function Dashboard() {
  const navigate = useNavigate();
  const { isCompleted, isBookmarked, getTrackProgress, getLastVisited } = useProgressContext();

  const completedCount  = allModules.filter(m => isCompleted(m.id)).length;
  const bookmarkedCount = allModules.filter(m => isBookmarked(m.id)).length;

  function getContinueId(course) {
    let best = null, bestTs = 0;
    for (const m of course.modules) {
      const ts = getLastVisited(m.id) || 0;
      if (ts > bestTs) { bestTs = ts; best = m.id; }
    }
    if (best) return best;
    const firstIncomplete = course.modules.find(m => !isCompleted(m.id));
    return firstIncomplete ? firstIncomplete.id : course.modules[0].id;
  }

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <h1 className="dashboard-heading">AI/ML Learning Portal</h1>
      <p className="dashboard-sub">Self-paced interactive courses for data science and engineering.</p>

      <div className="stats-row">
        <div className="stat"><strong>{completedCount}</strong> / {allModules.length} modules completed</div>
        <div className="stat"><strong>{bookmarkedCount}</strong> bookmarked</div>
      </div>

      <div className="track-grid">
        {courses.map(course => {
          const { completed, total } = getTrackProgress(course.modules.map(m => m.id));
          const pct        = total > 0 ? (completed / total) * 100 : 0;
          const continueId = getContinueId(course);

          return (
            <div
              key={course.id}
              className="track-card"
              style={{ '--card-color': course.color }}
              onClick={() => navigate(`/module/${continueId}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/module/${continueId}`)}
            >
              <h3>{course.title}</h3>
              <p>{course.description}</p>

              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${pct}%`, background: course.color }}
                />
              </div>
              <div className="progress-label">
                {completed === total && total > 0 ? '✓ Complete' : `${completed} / ${total} modules`}
              </div>

              <button
                className="continue-btn"
                style={{ color: course.color }}
                onClick={e => { e.stopPropagation(); navigate(`/module/${continueId}`); }}
              >
                {completed === 0 ? 'Start →' : completed === total ? 'Review →' : 'Continue →'}
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
