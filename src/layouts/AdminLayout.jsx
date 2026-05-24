import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/context/AuthContext'

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 shrink-0">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 shrink-0">
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
  </svg>
)

const IconBall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 shrink-0">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3c0 0-3 4-3 9s3 9 3 9" />
    <path d="M3 12h18" />
    <path d="M5.6 6h12.8M5.6 18h12.8" />
  </svg>
)

const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 shrink-0">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const IconBellTopBar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
)

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

// ─── Nav config ───────────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { to: ROUTES.ADMIN,         label: 'Dashboard', icon: <IconGrid />,  exact: true },
  { to: ROUTES.ADMIN_USERS,   label: 'Users',     icon: <IconUsers /> },
  { to: ROUTES.ADMIN_MATCHES, label: 'Matches',   icon: <IconBall />  },
  { to: ROUTES.ADMIN_ALERTS,  label: 'Alerts',    icon: <IconBell />, badge: 3 },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function AdminSidebar({ open, onClose }) {
  const navigate        = useNavigate()
  const { logout, user } = useAuth()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/70 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed lg:static inset-y-0 left-0 z-30',
          'w-56 flex flex-col shrink-0',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        style={{
          background:   '#0a0a0b',
          borderRight:  '1px solid rgba(246,239,217,0.07)',
          color:        'var(--paper)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-5 py-5 shrink-0"
          style={{ borderBottom: '1px solid rgba(246,239,217,0.07)' }}
        >
          <div
            className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
            style={{ background: 'var(--red)', color: 'var(--red-ink)' }}
          >
            <IconShield />
          </div>
          <div className="min-w-0">
            <div
              className="uppercase leading-none truncate"
              style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 13, letterSpacing: '0.08em' }}
            >
              Admin Panel
            </div>
            <div
              className="mt-0.5 opacity-35 uppercase"
              style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, letterSpacing: '0.18em' }}
            >
              Mundial Hub 2026
            </div>
          </div>
        </div>

        {/* Section label */}
        <div className="px-5 pt-5 pb-2">
          <span
            className="uppercase opacity-35"
            style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.18em' }}
          >
            Navigation
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">
          {ADMIN_NAV.map(({ to, label, icon, badge, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-md relative',
                  'text-xs uppercase tracking-widest transition-all duration-150',
                  isActive
                    ? 'text-white'
                    : 'opacity-45 hover:opacity-80 hover:bg-white/5',
                ].join(' ')
              }
              style={({ isActive }) => ({
                fontFamily:  'var(--f-sub)',
                fontWeight:  700,
                letterSpacing: '0.08em',
                ...(isActive && {
                  background: 'rgba(246,239,217,0.07)',
                  borderLeft: '2px solid var(--gold)',
                  color:      'var(--paper)',
                  paddingLeft: 10,
                }),
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ color: isActive ? 'var(--gold)' : 'currentColor' }}>
                    {icon}
                  </span>
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span
                      className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-center px-1"
                      style={{
                        background:  'var(--red)',
                        color:       'var(--red-ink)',
                        fontFamily:  'var(--f-mono)',
                        fontSize:    9,
                        fontWeight:  700,
                        letterSpacing: 0,
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div
          className="px-3 py-4 shrink-0 flex flex-col gap-1"
          style={{ borderTop: '1px solid rgba(246,239,217,0.07)' }}
        >
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-md w-full text-left opacity-40 hover:opacity-70 transition-opacity"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)' }}
            onClick={() => { logout(); navigate(ROUTES.LOGIN, { replace: true }) }}
          >
            <IconLogout />
            <span
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: 'var(--f-sub)', fontWeight: 700, letterSpacing: '0.08em' }}
            >
              Sign out
            </span>
          </button>
          <p
            className="px-3 opacity-20 uppercase"
            style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, letterSpacing: '0.14em' }}
          >
            Admin v0.1 · Mundial Hub
          </p>
        </div>
      </aside>
    </>
  )
}

// ─── AdminUserChip ────────────────────────────────────────────────────────────
function AdminUserChip() {
  const { user } = useAuth()
  const initial  = (user?.name ?? 'A')[0].toUpperCase()
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center w-7 h-7 rounded-full shrink-0"
        style={{ background: 'var(--gold)', color: 'var(--gold-ink)' }}
      >
        <span style={{ fontFamily: 'var(--f-display)', fontSize: 12, lineHeight: 1 }}>{initial}</span>
      </div>
      <span
        className="hidden md:block opacity-60 text-xs uppercase tracking-widest"
        style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em' }}
      >
        {user?.name ?? 'Admin'}
      </span>
    </div>
  )
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function AdminTopBar({ onMenuClick }) {
  const location = useLocation()

  const currentItem = ADMIN_NAV.find(({ to, exact }) =>
    exact ? location.pathname === to : location.pathname.startsWith(to)
  )

  return (
    <header
      className="flex items-center justify-between gap-4 px-5 py-3.5 shrink-0 z-10"
      style={{
        background:    'rgba(10,10,11,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom:  '1px solid rgba(246,239,217,0.07)',
        color:         'var(--paper)',
      }}
    >
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-white/8"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)' }}
          aria-label="Open menu"
        >
          <IconMenu />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span
            className="opacity-30 hidden sm:block"
            style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}
          >
            Admin
          </span>
          {currentItem && (
            <>
              <span className="opacity-20 hidden sm:block" style={{ fontSize: 10 }}>/</span>
              <span
                className="font-bold uppercase truncate"
                style={{ fontFamily: 'var(--f-sub)', fontSize: 12, letterSpacing: '0.08em', color: 'var(--paper)' }}
              >
                {currentItem.label}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: alerts + user avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Alert bell */}
        <button
          className="relative flex items-center justify-center w-8 h-8 rounded-md opacity-60 hover:opacity-100 transition-opacity"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)' }}
          aria-label="Alerts"
        >
          <IconBellTopBar />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: 'var(--red)' }}
          />
        </button>

        {/* Divider */}
        <div className="w-px h-5 opacity-15" style={{ background: 'var(--paper)' }} />

        {/* User avatar */}
        <AdminUserChip />
      </div>
    </header>
  )
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0c0c0d', color: 'var(--paper)' }}
    >
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />

        <main
          className="flex-1 overflow-y-auto"
          style={{ background: '#0c0c0d' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
