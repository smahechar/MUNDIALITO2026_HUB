import { Outlet, useNavigate } from 'react-router-dom'

export default function PublicLayout() {
  const navigate = useNavigate()

  return (
    <div
      className="relative flex flex-col min-h-screen overflow-hidden gc gc-grain"
      style={{ background: 'var(--paper)', color: 'var(--ink)' }}
    >
      {/* Ambient floodlights */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 600, height: 600,
          top: -260, left: -120,
          background: 'radial-gradient(circle, var(--green), transparent 65%)',
          opacity: 0.12,
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 500, height: 500,
          bottom: -200, right: -100,
          background: 'radial-gradient(circle, var(--gold), transparent 65%)',
          opacity: 0.14,
          filter: 'blur(60px)',
        }}
      />

      {/* Decorative watermark */}
      <span
        className="absolute select-none pointer-events-none"
        style={{
          fontFamily:    'var(--f-display)',
          fontSize:      'clamp(160px, 28vw, 340px)',
          lineHeight:    1,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          color:         'var(--ink)',
          opacity:       0.03,
          bottom:        -40,
          right:         -20,
          userSelect:    'none',
        }}
      >
        2026
      </span>

      {/* Top brand bar */}
      <header className="relative z-10 flex items-center justify-between px-8 pt-7 pb-4 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
            style={{ background: 'var(--green)' }}
          >
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--green-ink)', lineHeight: 1 }}>
              M
            </span>
          </div>
          <span
            className="uppercase"
            style={{ fontFamily: 'var(--f-display)', fontSize: 15, letterSpacing: '0.04em', lineHeight: 1 }}
          >
            Mundial<span style={{ color: 'var(--red)' }}>·</span>Hub
          </span>
          <span
            className="opacity-40"
            style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase' }}
          >
            2026
          </span>
        </button>

        <span
          className="gc-pill hidden sm:inline-flex"
          style={{ fontSize: 10 }}
        >
          Global Cup 2026
        </span>
      </header>

      {/* Centered content slot */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 flex items-center justify-center gap-4 px-8 py-5 shrink-0"
        style={{ borderTop: '1px solid var(--rule)' }}
      >
        <span
          className="opacity-40 uppercase tracking-widest"
          style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em' }}
        >
          © 2026 · Universidad El Bosque · Ingeniería de Sistemas
        </span>
      </footer>
    </div>
  )
}
