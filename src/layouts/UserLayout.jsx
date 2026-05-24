import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    to:    ROUTES.FIXTURE,
    label: 'Matches',
    icon:  (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 1 7.07 17.07M9 9l6 6M9 15l6-6" />
      </svg>
    ),
  },
  {
    to:    ROUTES.POOLS,
    label: 'Pools',
    icon:  (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
  {
    to:    ROUTES.ALBUM,
    label: 'Album',
    icon:  (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to:    ROUTES.GROUPS,
    label: 'Grupos',
    icon:  (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="9"  cy="7"  r="4" />
        <circle cx="17" cy="7"  r="3" />
        <path d="M2 21c0-4 3.1-7 7-7s7 3 7 7" />
        <path d="M17 14c2.2 0 4 1.8 4 4" />
      </svg>
    ),
  },
  {
    to:    ROUTES.PROFILE,
    label: 'Profile',
    icon:  (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed lg:static inset-y-0 left-0 z-30',
          'w-64 flex flex-col shrink-0',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        style={{ background: 'var(--green)', color: 'var(--green-ink)' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-6 py-5 shrink-0"
          style={{ borderBottom: '1px solid rgba(247,241,223,0.12)' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--gold)' }}
          >
            <span
              className="font-display text-base leading-none"
              style={{ color: 'var(--gold-ink)', fontFamily: 'var(--f-display)' }}
            >
              M
            </span>
          </div>
          <div className="min-w-0">
            <div
              className="uppercase tracking-widest leading-none truncate"
              style={{ fontFamily: 'var(--f-display)', fontSize: 16 }}
            >
              Mundial
              <span style={{ color: 'var(--gold)' }}>·</span>
              Hub
            </div>
            <div
              className="mt-1 uppercase tracking-widest opacity-50"
              style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.16em' }}
            >
              2026
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-3 py-5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-4 py-3 rounded-md',
                  'text-sm uppercase tracking-widest',
                  'transition-all duration-150',
                  isActive
                    ? 'shadow-2'
                    : 'opacity-70 hover:opacity-100 hover:bg-white/10',
                ].join(' ')
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      fontFamily:  'var(--f-sub)',
                      fontWeight:  700,
                      background:  'var(--gold)',
                      color:       'var(--gold-ink)',
                    }
                  : {
                      fontFamily:  'var(--f-sub)',
                      fontWeight:  700,
                      color:       'var(--green-ink)',
                    }
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div
          className="px-6 py-4 shrink-0"
          style={{ borderTop: '1px solid rgba(247,241,223,0.1)' }}
        >
          <p
            className="uppercase tracking-widest opacity-30"
            style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em' }}
          >
            © 2026 · Mundial Hub
          </p>
        </div>
      </aside>
    </>
  )
}

// ─── Top Navbar ───────────────────────────────────────────────────────────────
function TopNav({ onMenuClick }) {
  const navigate  = useNavigate()
  const location  = useLocation()

  const currentItem = NAV_ITEMS.find(({ to }) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
  )

  return (
    <header
      className="flex items-center justify-between gap-4 px-6 py-4 shrink-0 z-10"
      style={{
        background:       'rgba(247,241,223,0.88)',
        backdropFilter:   'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        borderBottom:     '1px solid var(--rule)',
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-md transition-colors hover:bg-black/6"
          aria-label="Open menu"
        >
          <span className="block w-5 h-0.5 bg-current rounded-full" />
          <span className="block w-5 h-0.5 bg-current rounded-full" />
          <span className="block w-5 h-0.5 bg-current rounded-full" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="uppercase tracking-widest opacity-50 hidden sm:block"
            style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.14em' }}
          >
            Mundial Hub
          </span>
          {currentItem && (
            <>
              <span className="opacity-30 hidden sm:block" style={{ fontSize: 10 }}>/</span>
              <span
                className="uppercase tracking-widest font-bold truncate"
                style={{ fontFamily: 'var(--f-sub)', fontSize: 12, color: 'var(--ink)' }}
              >
                {currentItem.label}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Live ticker pill */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <span
          className="gc-pill gc-pill-live"
          style={{ fontSize: 10 }}
        >
          Live
        </span>
        <span
          className="opacity-60 truncate max-w-xs"
          style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em' }}
        >
          ⚽ MIN 67 · Atlantica 2–1 Durango
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="gc-pill hidden sm:inline-flex">ES · COL</span>
        <button
          className="gc-btn gc-btn-accent"
          style={{ padding: '8px 16px', fontSize: 11 }}
          onClick={() => navigate(ROUTES.PROFILE)}
        >
          Mi Cuenta
        </button>
      </div>
    </header>
  )
}

// ─── UserLayout ───────────────────────────────────────────────────────────────
export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      className="flex h-screen overflow-hidden gc gc-grain"
      style={{ background: 'var(--paper)', color: 'var(--ink)' }}
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: 'var(--paper)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
