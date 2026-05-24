import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/config/routes'
import { nations } from '@/mocks/data/nations'

const MAX_FAV = 3

// ─── Step 2: Favorites ────────────────────────────────────────────────────────
function FavoritesStep({ selected, onToggle, onBack, onFinish, loading }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 42, lineHeight: .85, margin: '0 0 6px', textTransform: 'uppercase' }}>
          Tus <span style={{ color: 'var(--gold)' }}>favoritas.</span>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
          Elegí hasta {MAX_FAV} selecciones. Aparecerán primero en tu fixture.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {nations.map(n => {
          const on = selected.includes(n.code)
          const disabled = !on && selected.length >= MAX_FAV
          return (
            <button
              key={n.code}
              onClick={() => !disabled && onToggle(n.code)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 999, fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--f-sub)', fontWeight: 800, letterSpacing: '.04em',
                border: on ? 'none' : '1px solid var(--rule)',
                background: on ? 'var(--green)' : 'transparent',
                color: on ? 'var(--green-ink)' : disabled ? 'var(--muted)' : 'var(--ink)',
                opacity: disabled ? .45 : 1,
                transition: 'all .15s',
              }}
            >
              <span style={{ fontSize: 10, fontFamily: 'var(--f-mono)', opacity: on ? .8 : .5 }}>{n.code}</span>
              {n.name}
            </button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--f-mono)', letterSpacing: '.04em' }}>
          {selected.join(' · ')} · {selected.length}/{MAX_FAV}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className="gc-btn gc-btn-ghost"
          style={{ flex: 0 }}
          onClick={onBack}
        >
          ← Atrás
        </button>
        <button
          className="gc-btn gc-btn-primary"
          style={{ flex: 1, justifyContent: 'center', opacity: loading ? .7 : 1 }}
          disabled={loading}
          onClick={onFinish}
        >
          {loading ? 'Creando cuenta…' : selected.length === 0 ? 'Omitir y crear cuenta →' : 'Crear mi cuenta →'}
        </button>
      </div>
    </div>
  )
}

// ─── RegisterPage ─────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate        = useNavigate()
  const { register }    = useAuth()
  const [step, setStep] = useState(0)

  const [username, setUsername]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [terms, setTerms]         = useState(false)
  const [favTeams, setFavTeams]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  function toggleFav(code) {
    setFavTeams(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : prev.length < MAX_FAV ? [...prev, code] : prev
    )
  }

  function validateStep0() {
    if (!username || !email || !password || !confirm) { setError('Completa todos los campos.'); return false }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return false }
    if (password.length < 8)  { setError('La contraseña debe tener mínimo 8 caracteres.'); return false }
    if (!terms)               { setError('Debes aceptar los términos.'); return false }
    return true
  }

  function goToFavorites(e) {
    e.preventDefault()
    if (!validateStep0()) return
    setError('')
    setStep(1)
  }

  async function handleFinish() {
    setLoading(true)
    try {
      await register({ name: username, email, password, favoriteTeams: favTeams })
      navigate(ROUTES.FIXTURE, { replace: true })
    } catch (err) {
      setError(err.message ?? 'Error al crear la cuenta. Intenta de nuevo.')
      setStep(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gc-card w-full gc-rise" style={{ maxWidth: 480, padding: '40px 44px', position: 'relative', overflow: 'hidden' }}>
      {/* floodlight decorativo */}
      <div style={{
        position: 'absolute', bottom: -100, left: -80,
        width: 280, height: 280, borderRadius: '50%',
        background: `radial-gradient(circle, ${step === 1 ? 'var(--gold)' : 'var(--green)'}, transparent 65%)`,
        opacity: 0.12, filter: 'blur(40px)', pointerEvents: 'none',
        transition: 'background .4s',
      }} />

      {step === 0 && (
        <>
          {/* pill de estado */}
          <div className="gc-row gc-gap-sm" style={{ marginBottom: 12, alignItems: 'center' }}>
            <span className="gc-pill gc-pill-live" style={{ fontSize: 9 }}>EN VIVO</span>
            <span className="gc-eyebrow" style={{ fontSize: 10 }}>GLOBAL CUP 2026 · REGISTRO</span>
          </div>

          {/* headline */}
          <h1 style={{
            fontFamily: 'var(--f-display)', fontSize: 'clamp(44px, 8vw, 60px)',
            lineHeight: 0.85, margin: '0 0 6px', textTransform: 'uppercase',
          }}>
            Únete<br />
            <span style={{ color: 'var(--green)' }}>al Hub.</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.4 }}>
            Pollas, álbum, fixture y más — todo gratis para el Global Cup 2026.
          </p>

          <form onSubmit={goToFavorites} style={{ display: 'grid', gap: 13 }}>
            <div className="gc-col" style={{ gap: 5 }}>
              <label className="gc-eyebrow" style={{ fontSize: 10 }}>NOMBRE DE USUARIO</label>
              <input
                className="gc-input"
                type="text"
                placeholder="@tuescape"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="gc-col" style={{ gap: 5 }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="gc-col" style={{ gap: 5 }}>
                <label className="gc-eyebrow" style={{ fontSize: 10 }}>CONTRASEÑA</label>
                <input
                  className="gc-input"
                  type="password"
                  placeholder="min. 8 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="gc-col" style={{ gap: 5 }}>
                <label className="gc-eyebrow" style={{ fontSize: 10 }}>CONFIRMAR</label>
                <input
                  className="gc-input"
                  type="password"
                  placeholder="Repetir"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* términos */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 2 }}>
              <input
                type="checkbox"
                checked={terms}
                onChange={e => setTerms(e.target.checked)}
                style={{ marginTop: 2, accentColor: 'var(--ink)', flexShrink: 0 }}
              />
              <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
                Acepto los <span style={{ color: 'var(--ink)', textDecoration: 'underline', cursor: 'pointer' }}>Términos de uso</span> y la <span style={{ color: 'var(--ink)', textDecoration: 'underline', cursor: 'pointer' }}>Política de privacidad</span> de Mundial Hub 2026.
              </span>
            </label>

            {error && (
              <p style={{ fontSize: 12, color: 'var(--red)', margin: 0, fontFamily: 'var(--f-mono)', letterSpacing: '.04em' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="gc-btn gc-btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              Continuar →
            </button>
          </form>

          <div className="gc-rule" style={{ paddingTop: 16, marginTop: 16 }}>
            <button
              className="gc-btn gc-btn-ghost"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Ya tengo cuenta · Ingresar →
            </button>
          </div>
        </>
      )}

      {step === 1 && (
        <FavoritesStep
          selected={favTeams}
          onToggle={toggleFav}
          onBack={() => setStep(0)}
          onFinish={handleFinish}
          loading={loading}
        />
      )}
    </div>
  )
}
