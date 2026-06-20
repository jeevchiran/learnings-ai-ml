import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { allModules } from '../data/courses.js'

export default function SearchBar() {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const wrapRef   = useRef(null);

  useEffect(() => { setQuery(''); setOpen(false); }, [location]);

  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = query.trim().toLowerCase();
  const results = q.length < 2 ? [] : allModules.filter(m =>
    m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
  ).slice(0, 8);

  function pick(id) {
    setQuery('');
    setOpen(false);
    navigate(`/module/${id}`);
  }

  return (
    <div className="search-wrap" ref={wrapRef}>
      <input
        className="search-input"
        type="search"
        placeholder="Search modules…"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => q.length >= 2 && setOpen(true)}
        aria-label="Search modules"
      />
      {open && q.length >= 2 && (
        <div className="search-dropdown" role="listbox">
          {results.length === 0
            ? <div className="search-empty">No results</div>
            : results.map(m => (
                <div key={m.id} className="search-result" role="option" onClick={() => pick(m.id)}>
                  <div className="search-result-title">{m.title}</div>
                  <div className="search-result-course">{m.courseTitle}</div>
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
}
