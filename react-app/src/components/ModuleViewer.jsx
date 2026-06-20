import { useEffect, useRef, useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { moduleById, getPrevNext, courses } from '../data/courses.js'
import { useProgressContext } from '../hooks/useProgress.jsx'
import MDXRenderer from './MDXRenderer.jsx'

const BASE = import.meta.env.BASE_URL;

// Eagerly resolve all MDX files at build time
const mdxModules = import.meta.glob('../content/**/*.mdx')

function useMDXContent(mod) {
  const [Content, setContent] = useState(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    setContent(null)
    setChecked(false)
    if (!mod) { setChecked(true); return }
    const key = `../content/${mod.coursePath}/${mod.id}.mdx`
    if (mdxModules[key]) {
      mdxModules[key]().then(m => { setContent(() => m.default); setChecked(true) })
    } else {
      setChecked(true)
    }
  }, [mod?.id])

  return { Content, checked }
}

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
  const { Content, checked } = useMDXContent(mod);
  const { prev, next } = getPrevNext(moduleId);   // global sequential (topbar)
  const done    = isCompleted(moduleId);
  const starred = isBookmarked(moduleId);

  // within-track and track-jump navigation for bottom nav
  const course      = mod ? courses.find(c => c.id === mod.courseId) : null;
  const courseIdx   = course ? courses.indexOf(course) : -1;
  const modIdx      = course ? course.modules.findIndex(m => m.id === moduleId) : -1;
  const prevInTrack = course && modIdx > 0 ? course.modules[modIdx - 1] : null;
  const nextInTrack = course && modIdx < course.modules.length - 1 ? course.modules[modIdx + 1] : null;
  const prevTrack   = courseIdx > 0 ? courses[courseIdx - 1] : null;
  const nextTrack   = courseIdx < courses.length - 1 ? courses[courseIdx + 1] : null;

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

      {!checked
        ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</div>
        : Content
          ? <div className="module-mdx-wrap" style={{ flex: 1, overflowY: 'auto' }}><MDXRenderer Content={Content} /></div>
          : <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="module-iframe"
              title={mod.title}
              allow="storage-access *"
            />
      }

      <div className="module-bottom-nav">
        <div className="bottom-nav-row">
          <button
            className="bottom-nav-btn"
            onClick={() => prevInTrack && navigate(`/module/${prevInTrack.id}`)}
            disabled={!prevInTrack}
          >
            ← {prevInTrack?.title ?? ''}
          </button>
          <span className="bottom-nav-center">
            {mod.moduleNumber} / {mod.totalInCourse}
          </span>
          <button
            className="bottom-nav-btn"
            onClick={() => nextInTrack && navigate(`/module/${nextInTrack.id}`)}
            disabled={!nextInTrack}
          >
            {nextInTrack?.title ?? ''} →
          </button>
        </div>

        <div className="bottom-nav-row bottom-nav-tracks">
          <button
            className="bottom-nav-btn track-jump-btn"
            onClick={() => prevTrack && navigate(`/module/${prevTrack.modules[0].id}`)}
            disabled={!prevTrack}
            style={{ '--track-color': prevTrack?.color }}
          >
            ↖ {prevTrack?.title ?? ''}
          </button>
          <span className="bottom-nav-center" style={{ color: course?.color, fontWeight: 600 }}>
            {course?.title}
          </span>
          <button
            className="bottom-nav-btn track-jump-btn"
            onClick={() => nextTrack && navigate(`/module/${nextTrack.modules[0].id}`)}
            disabled={!nextTrack}
            style={{ '--track-color': nextTrack?.color }}
          >
            {nextTrack?.title ?? ''} ↗
          </button>
        </div>
      </div>
    </div>
  );
}
