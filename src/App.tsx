import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useAppData } from './context/AppDataContext'
import { AdminPage } from './routes/AdminPage'
import { EventPage } from './routes/EventPage'
import { HomePage } from './routes/HomePage'
import { NotFoundPage } from './routes/NotFoundPage'

function App() {
  const { lockAllEvents, isAdmin } = useAppData()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  // On non-home routes always show header; on home, wait for scroll
  const [scrolledPast, setScrolledPast] = useState(false)

  useEffect(() => {
    if (!isHome) {
      setScrolledPast(false)
      return
    }
    const check = () => setScrolledPast(window.scrollY > window.innerHeight * 1.5)
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [isHome])

  const showHeader = !isHome || scrolledPast

  return (
    <div className="app-shell">
      <header className={`site-header ${showHeader ? 'visible' : 'hidden'}`}>
        <NavLink to="/" className="brand">
          Pavan Portfolio
        </NavLink>
        <nav className="site-nav">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Admin
          </NavLink>
          <button type="button" className="nav-link" onClick={lockAllEvents}>
            Lock all
          </button>
          {isAdmin ? <span className="admin-pill">Admin</span> : null}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/"           element={<HomePage />} />
          <Route path="/event/:slug" element={<EventPage />} />
          <Route path="/admin"      element={<AdminPage />} />
          <Route path="*"           element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
