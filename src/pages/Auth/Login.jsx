import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/config/routes'

export default function LoginPage() {
  const navigate          = useNavigate()
  const { login, isAdmin } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Completa todos los campos.'); return }
    setError('')
    setLoading(true)
    try {
      const { user } = await login({ email, password })
      navigate(user.role === 'admin' ? ROUTES.ADMIN : ROUTES.FIXTURE, { replace: true })
    } catch (err) {
      setError(err.message ?? 'Error al ingresar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gc-card w-full gc-rise" style={{ maxWidth: 420, padding: '40px 44px', position: 'relative', overflow: 'hidden' }}>
      {/* floodlight decorativo */}
      <div style={{
        position: 'absolute', top: -120, right: -100,
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--gold), transparent 65%)',
        opacity: 0.1, filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* eyebrow */}
      <span className="gc-eyebrow" style={{ display: 'block', marginBottom: 10 }}>
        GLOBAL CUP 2026 · ACCESO
      </span>

      {/* headline */}
      <h1 style={{
        fontFamily: 'var(--f-display)', fontSize: 'clamp(44px, 8vw, 64px)',
        lineHeight: 0.85, margin: '0 0 28px', textTransform: 'uppercase',
      }}>
        Ingresar<br />
        <span style={{ color: 'var(--red)' }}>al Hub.</span>
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
        <div className="gc-col" style={{ gap: 6 }}>
          <label className="gc-eyebrow" style={{ fontSize: 10 }}>EMAIL</label>
          <input
            className="gc-input"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="gc-col" style={{ gap: 6 }}>
          <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label className="gc-eyebrow" style={{ fontSize: 10 }}>CONTRASEÑA</label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="gc-link"
              style={{ fontSize: 10 }}
            >
              ¿Olvidaste?
            </Link>
          </div>
          <input
            className="gc-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <p style={{ fontSize: 12, color: 'var(--red)', margin: 0, fontFamily: 'var(--f-mono)', letterSpacing: '.04em' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="gc-btn gc-btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Ingresando…' : 'Entrar al Hub →'}
        </button>
      </form>

      {/* divider */}
      <div className="gc-row" style={{ alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
        <span className="gc-eyebrow" style={{ fontSize: 10 }}>O</span>
        <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
      </div>

      <button
        className="gc-btn gc-btn-ghost"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={() => navigate(ROUTES.REGISTER)}
      >
        Crear cuenta nueva →
      </button>

      <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--f-mono)', letterSpacing: '.04em' }}>
        ¿Sin cuenta? Es gratis y lleva 30 segundos.
      </p>
    </div>
  )
}
