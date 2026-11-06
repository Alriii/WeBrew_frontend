import {
  ArrowUpRight,
  Coffee,
  LayoutDashboard,
  LogOut,
  Menu,
  Package2,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { APP_NAME, NAV_ITEMS } from '../../constants/app'
import { ProductsProvider } from '../provider/ProductsProvider'
import { useAuth } from '../../context/useAuth'

const icons = {
  overview: LayoutDashboard,
  sales: ShoppingBag,
  products: Package2,
}

const pageCopy: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'A little more insight,',
    subtitle: 'A fresh look at how your café is doing today.',
  },
  '/sales': {
    title: 'The daily pour.',
    subtitle: 'Every sale, neatly in one place.',
  },
  '/products': {
    title: 'Your little menu.',
    subtitle: 'Keep your drinks, categories and prices up to date.',
  },
}

export function AppLayout() {
  const auth = useAuth()
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const copy = pageCopy[location.pathname] ?? pageCopy['/']

  return (
    <ProductsProvider>
      <div className="app-shell">
        <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
          <NavLink
            to="/"
            className="brand"
            onClick={() => setMobileNavOpen(false)}
          >
            <span className="brand-mark"><Coffee size={21} strokeWidth={2.2} /></span>
            <span className="brand-copy">
              <strong>webrew</strong>
              <small>CAFÉ STUDIO</small>
            </span>
          </NavLink>

          <div className="sidebar-label">YOUR WORKSPACE</div>
          <nav className="side-nav" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = icons[item.icon]
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{item.label}</span>
                  {item.path === '/' && <span className="nav-dot" />}
                </NavLink>
              )
            })}
          </nav>

          <div className="sidebar-bottom">
            <div className="sidebar-note">
              <span className="note-icon"><Sparkles size={16} /></span>
              <strong>Small steps, lovely growth.</strong>
              <p>Your numbers tell a story. Keep listening.</p>
            </div>
            <div className="workspace-user">
              <div className="user-avatar">W</div>
              <div className="user-copy"><strong>WeBrew Café</strong><small>{auth.email ?? 'Owner workspace'}</small></div>
              {auth.email ? (
                <button
                  type="button"
                  className="icon-button sign-out-button"
                  aria-label="Sign out"
                  title="Sign out"
                  onClick={auth.logout}
                >
                  <LogOut size={15} />
                </button>
              ) : (
                <ArrowUpRight size={15} className="user-arrow" />
              )}
            </div>
          </div>
        </aside>

        {mobileNavOpen && (
          <button
            className="mobile-backdrop"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <div className="main-column">
          <header className="topbar">
            <button
              type="button"
              className="icon-button mobile-menu-button"
              aria-label="Open navigation"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb"><span>{APP_NAME}</span><span className="breadcrumb-separator">/</span><strong>{location.pathname === '/' ? 'Overview' : location.pathname.slice(1)}</strong></div>
            <div className="topbar-right">
              <span className="open-indicator"><i /> Your café, in view</span>
              <div className="topbar-avatar">W</div>
            </div>
          </header>

          <main className="page-content">
            <div className="page-intro">
              <div>
                <p className="eyebrow">{location.pathname === '/' ? 'A FRESH LOOK AT YOUR CAFÉ' : 'WEBREW CAFÉ · YOUR BUSINESS'}</p>
                <h1>{copy.title} <em>{location.pathname === '/' ? 'in every cup.' : ''}</em></h1>
                <p className="page-subtitle">{copy.subtitle}</p>
              </div>
              <div className="intro-stamp"><Coffee size={19} /><span>BREWED WITH<br />GOOD INTENTIONS</span></div>
            </div>
            <Outlet />
            <footer className="page-footer">
              <span>Made for the little moments that make a café.</span>
              <span>{APP_NAME} <i>✳</i> Business, brewed better</span>
            </footer>
          </main>
        </div>
      </div>
    </ProductsProvider>
  )
}
