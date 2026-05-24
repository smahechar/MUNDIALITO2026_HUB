import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { ROUTES } from '@/config/routes'

export default function ForgotPassword() {
  const navigate          = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]   = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) { setError('Ingresa tu email.'); return }
    setError('')
    setLoading(true)
    try {
      await authService.forgotPassword({ email })
      setSent(true)
    } catch (err) {
      setError(err.message ?? 'Error al enviar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gc-card w-full gc-rise" style={{ maxWidth: 420, padding: '40px 44px', position: 'relative', overflow: 'hidden' }}>
      {/* floodlight decorativo */}
      <div style={{
        position: 'absolute', top: -100, left: -80,
        width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--green), transparent 65%)',
        opacity: 0.1, filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <span className="gc-eyebrow" style={{ display: 'block', marginBottom: 10 }}>
        GLOBAL CUP 2026 · RECUPERAR ACCESO
      </span>

      <h1 style={{
        fontFamily: 'var(--f-display)', fontSize: 'clamp(40px, 7vw, 56px)',
        lineHeight: 0.85, margin: '0 0 16px', textTransform: 'uppercase',
      }}>
        ¿Olvidaste<br />
        <span style={{ color: 'var(--green)' }}>tu clave?</span>
      </h1>

      {sent ? (
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 24 }}>
            Si <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
          </p>
          <div className="gc-card" style={{ padding: '16px 20px', background: 'var(--green)', marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: 'var(--green-ink)', margin: 0, fontFamily: 'var(--f-sub)', fontWeight: 700 }}>
              ✓ Correo enviado
            </p>
            <p style={{ fontSize: 12, color: 'var(--green-ink)', opacity: .8, margin: '4px 0 0', fontFamily: 'var(--f-mono)' }}>
              Revisa también tu carpeta de spam.
            </p>
          </div>
          <button
            className="gc-btn gc-btn-ghost"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            ← Volver al ingreso
          </button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.4 }}>
            Ingresa el email asociado a tu cuenta y te enviaremos un enlace de recuperación.
          </p>

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
              {loading ? 'Enviando…' : 'Enviar enlace →'}
            </button>
          </form>

          <button
            className="gc-btn gc-btn-ghost"
            style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            ← Volver al ingreso
          </button>
        </>
      )}
    </div>
  )
}
