import { useState, useCallback } from 'react'
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ProgressProvider } from './hooks/useProgress.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import ModuleViewer from './components/ModuleViewer.jsx'

function AppInner({ dark, onToggleDark, sidebarOpen, onOpen, onClose }) {
  const location = useLocation()
  return (
    <>
      <div className="mobile-header">
        <button className="icon-btn" onClick={onOpen} aria-label="Open menu">☰</button>
        <Link to="/" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'inherit', textDecoration: 'none' }}>AI/ML Portal</Link>
        <button className="icon-btn" onClick={onToggleDark} style={{ marginLeft: 'auto' }}>
          {dark ? '☀' : '◑'}
        </button>
      </div>

      <div className="app">
        <div
          className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`}
          onClick={onClose}
        />
        <Sidebar dark={dark} onToggleDark={onToggleDark} mobileOpen={sidebarOpen} onClose={onClose} />

        <main className="main-panel">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/module/:moduleId" element={<ModuleViewer />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </>
  )
}

export default function App() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleDark = useCallback(() => {
    setDark(d => {
      const next = !d;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light');
        window.dispatchEvent(new CustomEvent('theme-change', { detail: { dark: next } }));
      } catch {}
      return next;
    });
  }, []);

  return (
    <HashRouter>
      <ProgressProvider>
        <AppInner
          dark={dark}
          onToggleDark={toggleDark}
          sidebarOpen={sidebarOpen}
          onOpen={() => setSidebarOpen(true)}
          onClose={() => setSidebarOpen(false)}
        />
      </ProgressProvider>
    </HashRouter>
  );
}
