import { useEffect, useRef, useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { moduleById, getPrevNext } from '../data/courses.js'
import { useProgressContext } from '../hooks/useProgress.jsx'

const BASE = import.meta.env.BASE_URL;

function syncIframeTheme(iframe, dark) {
  try {
    iframe?.contentDocument?.documentElement?.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch {}
}

export default function ModuleViewer() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { isCompleted, isBookmarked, markComplete, toggleComplete, toggleBookmark, setLastVisited } = useProgressContext();
  const iframeRef    = useRef(null);
  const autoTimerRef = useRef(null);

  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });

  // keep in sync when shell toggles dark mode
  useEffect(() => {
    function handler(e) { setDark(e.detail.dark); }
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const mod  = moduleById[moduleId];
  const { prev, next } = getPrevNext(moduleId);
  const done    = isCompleted(moduleId);
  const starred = isBookmarked(moduleId);

  // record visit + start 30s auto-complete timer
  useEffect(() => {
    if (!mod) return;
    setLastVisited(moduleId);
    autoTimerRef.current = setTimeout(() => markComplete(moduleId), 30000);
    return () => clearTimeout(autoTimerRef.current);
  }, [moduleId]); // eslint-disable-line react-hooks/exhaustive-deps

  // sync iframe theme on dark change or module navigation
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    function onLoad() { syncIframeTheme(iframe, dark); }
    iframe.addEventListener('load', onLoad);
    syncIframeTheme(iframe, dark);
    return () => iframe.removeEventListener('load', onLoad);
  }, [dark, moduleId]);

  const handleMarkComplete = useCallback(() => {
    clearTimeout(autoTimerRef.current);
    markComplete(moduleId);
  }, [moduleId, markComplete]);

  const handleToggleComplete = useCallback(() => {
    clearTimeout(autoTimerRef.current);
    toggleComplete(moduleId);
  }, [moduleId, toggleComplete]);

  if (!mod) {
    return (
      <div style={{ padding: 32 }}>
        <p>Module not found: <code>{moduleId}</code></p>
        <button className="topbar-btn" style={{ marginTop: 16 }} onClick={() => navigate('/')}>← Back to Dashboard</button>
      </div>
    );
  }

  const iframeSrc = `${BASE}${mod.coursePath}/modules/${mod.file}`;

  return (
    <div className="module-viewer">
      <div className="module-topbar">
        <div className="module-breadcrumb">
          <span role="button" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            {mod.courseTitle}
          </span>
          {' › '}
          <strong>Module {mod.moduleNumber} of {mod.totalInCourse}</strong>
        </div>

        <span className="readtime" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          ~{mod.readTime} min
        </span>

        <button
          className={`topbar-star${starred ? ' bookmarked' : ''}`}
          onClick={() => toggleBookmark(moduleId)}
          aria-label={starred ? 'Remove bookmark' : 'Bookmark'}
        >
          {starred ? '★' : '☆'}
        </button>

        <button
          className="topbar-btn"
          onClick={() => prev && navigate(`/module/${prev.id}`)}
          disabled={!prev}
          aria-label="Previous module"
        >
          ← Prev
        </button>

        <button
          className="topbar-btn"
          onClick={() => next && navigate(`/module/${next.id}`)}
          disabled={!next}
          aria-label="Next module"
        >
          Next →
        </button>

        {done
          ? <button className="topbar-btn done-btn" onClick={handleToggleComplete}>✓ Done</button>
          : <button className="topbar-btn complete-btn" onClick={handleMarkComplete}>Mark complete</button>
        }
      </div>

      <iframe
        ref={iframeRef}
        src={iframeSrc}
        className="module-iframe"
        title={mod.title}
        allow="storage-access *"
      />

      <div className="module-bottom-nav">
        <button
          className="bottom-nav-btn"
          onClick={() => prev && navigate(`/module/${prev.id}`)}
          disabled={!prev}
        >
          ← {prev?.title ?? 'Start'}
        </button>
        <span className="bottom-nav-center">
          {mod.moduleNumber} / {mod.totalInCourse}
        </span>
        <button
          className="bottom-nav-btn"
          onClick={() => next && navigate(`/module/${next.id}`)}
          disabled={!next}
        >
          {next?.title ?? 'End'} →
        </button>
      </div>
    </div>
  );
}
