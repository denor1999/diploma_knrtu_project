import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { initialsOf } from '../data'
import { IconBell, IconChevron, IconClock, IconLogout } from './Icons'

export default function Layout() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onPointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo" aria-label="вовремя, на главную">
            <span className="logo-mark">
              <IconClock size={16} />
            </span>
            вовремя
          </Link>
          <nav className="nav" aria-label="Основное меню">
            <NavLink to="/" end>
              Поиск
            </NavLink>
            <NavLink to="/routes">Мои маршруты</NavLink>
          </nav>
          <div className="header-side">
            <p className="tagline">Меньше догадок. Больше путешествий.</p>
            {user ? (
              <div className="user-menu" ref={menuRef}>
                <button
                  type="button"
                  className="user-chip"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <span className="avatar">{initialsOf(user.name)}</span>
                  <span>{user.name.split(' ')[0]}</span>
                  <IconChevron size={14} />
                </button>
                {menuOpen ? (
                  <div className="menu-pop" role="menu">
                    <Link to="/routes" onClick={() => setMenuOpen(false)}>
                      <IconBell size={16} /> Мои маршруты
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout()
                        setMenuOpen(false)
                        navigate('/')
                      }}
                    >
                      <IconLogout size={16} /> Выйти
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link to="/login" className="btn btn-ghost">
                Войти
              </Link>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <p>© 2026 Вовремя · Решение за вами, данные за нами.</p>
          <div className="footer-links">
            <Link to="/privacy">Конфиденциальность</Link>
            <a href="mailto:support@vovremya.travel">support@vovremya.travel</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
