import { useNavigate } from 'react-router-dom'

export default function PlaceholderPage({ title = 'Próximamente', module = 'MODULE' }) {
  const navigate = useNavigate()

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: '100%', padding: '48px 40px' }}
    >
      {/* Kicker */}
      <span
        className="gc-eyebrow"
        style={{ color: 'var(--muted)' }}
      >
        {module} · EN CONSTRUCCIÓN
      </span>

      {/* Title */}
      <h1
        style={{
          fontFamily:    'var(--f-display)',
          fontSize:      'clamp(56px, 10vw, 96px)',
          lineHeight:    0.88,
          margin:        '14px 0 24px',
          textTransform: 'uppercase',
          letterSpacing: '-0.01em',
        }}
      >
        {title}<br />
        <span style={{ opacity: 0.25 }}>próximamente.</span>
      </h1>

      {/* Rule */}
      <div style={{ width: 48, height: 3, background: 'var(--red)', borderRadius: 999, marginBottom: 24 }} />

      {/* Description */}
      <p style={{ maxWidth: 480, fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 32px' }}>
        Esta sección está en desarrollo. El backend team conectará las funcionalidades reales aquí.
      </p>

      {/* Back button */}
      <div>
        <button
          className="gc-btn gc-btn-ghost"
          style={{ padding: '10px 20px', fontSize: 12 }}
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>
      </div>

      {/* Debug label */}
      <p
        className="gc-eyebrow"
        style={{ marginTop: 'auto', paddingTop: 40, opacity: 0.3 }}
      >
        TODO: Implementar módulo {title}
      </p>
    </div>
  )
}
