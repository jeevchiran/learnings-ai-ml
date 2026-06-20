import { useState, useCallback } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { ProgressProvider } from './hooks/useProgress.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import ModuleViewer from './components/ModuleViewer.jsx'

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

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);

  return (
    <HashRouter>
      <ProgressProvider>
        <div className="mobile-header">
          <button className="icon-btn" onClick={openSidebar} aria-label="Open menu">☰</button>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI/ML Portal</span>
          <button className="icon-btn" onClick={toggleDark} style={{ marginLeft: 'auto' }}>
            {dark ? '☀' : '◑'}
          </button>
        </div>

        <div className="app">
          <div
            className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`}
            onClick={closeSidebar}
          />

          <Sidebar
            dark={dark}
            onToggleDark={toggleDark}
            mobileOpen={sidebarOpen}
            onClose={closeSidebar}
          />

          <main className="main-panel">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/module/:moduleId" element={<ModuleViewer />} />
            </Routes>
          </main>
        </div>
      </ProgressProvider>
    </HashRouter>
  );
}
