import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { courses } from '../data/courses.js'
import { useProgressContext } from '../hooks/useProgress.jsx'
import SearchBar from './SearchBar.jsx'

export default function Sidebar({ dark, onToggleDark, mobileOpen, onClose }) {
  const { moduleId: activeId } = useParams();
  const navigate  = useNavigate();
  const { isCompleted, isBookmarked, toggleBookmark, getTrackProgress } = useProgressContext();

  const [expanded, setExpanded] = useState(() => {
    const init = {};
    courses.forEach(c => { init[c.id] = false; });
    if (activeId) {
      const active = courses.find(c => c.modules.some(m => m.id === activeId));
      if (active) init[active.id] = true;
    } else {
      init[courses[0].id] = true;
    }
    return init;
  });

  function toggleTrack(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function goModule(id) {
    navigate(`/module/${id}`);
    onClose();
  }

  return (
    <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span
            className="sidebar-title"
            onClick={() => { navigate('/'); onClose(); }}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate('/')}
          >
            AI/ML Portal
          </span>
          <div className="sidebar-controls">
            <button className="icon-btn" onClick={onToggleDark} aria-label="Toggle dark mode" title="Toggle dark mode">
              {dark ? '☀' : '◑'}
            </button>
            <button className="icon-btn" onClick={onClose} aria-label="Close sidebar">✕</button>
          </div>
        </div>
        <SearchBar />
      </div>

      <nav className="sidebar-scroll" aria-label="Course navigation">
        {courses.map(course => {
          const isOpen = expanded[course.id];
          const { completed, total } = getTrackProgress(course.modules.map(m => m.id));

          return (
            <div key={course.id} className="track-group">
              <div
                className="track-header"
                onClick={() => toggleTrack(course.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && toggleTrack(course.id)}
                aria-expanded={isOpen}
              >
                <span className="track-dot" style={{ background: course.color }} />
                <span style={{ flex: 1 }}>{course.title}</span>
                <span className="track-progress-text">{completed}/{total}</span>
                <span className="track-chevron" style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
              </div>

              {isOpen && (
                <div className="module-items">
                  {course.modules.map(mod => {
                    const done    = isCompleted(mod.id);
                    const starred = isBookmarked(mod.id);
                    const active  = mod.id === activeId;

                    return (
                      <div
                        key={mod.id}
                        className={`module-item${active ? ' active' : ''}`}
                        onClick={() => goModule(mod.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && goModule(mod.id)}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span className="module-check">{done ? '✓' : ''}</span>
                        <span className="module-name">{mod.title}</span>
                        <button
                          className={`star-btn${starred ? ' bookmarked' : ''}`}
                          onClick={e => { e.stopPropagation(); toggleBookmark(mod.id); }}
                          aria-label={starred ? 'Remove bookmark' : 'Bookmark'}
                        >
                          {starred ? '★' : '☆'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
