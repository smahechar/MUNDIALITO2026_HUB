import { useState } from 'react'

// ─── Mock alerts (RF-07 — sistema de alertas) ─────────────────────────────────
const INITIAL_ALERTS = [
  {
    id: 'a1', type: 'security', severity: 'high', status: 'open',
    title: 'Múltiples intentos de login fallidos',
    desc: 'El usuario @andres registró 8 intentos fallidos en los últimos 5 minutos desde IP 190.85.12.44',
    ts: '2026-05-23T14:32:00', userId: 'u3', correlationId: 'evt_8d92f3a1',
  },
  {
    id: 'a2', type: 'fraud', severity: 'high', status: 'open',
    title: 'Transacción sospechosa de entrada',
    desc: 'La reserva RES-4412 fue procesada desde dos IPs distintas en un intervalo de 90 segundos.',
    ts: '2026-05-23T13:18:00', userId: 'u4', correlationId: 'evt_2c41bb9e',
  },
  {
    id: 'a3', type: 'system', severity: 'medium', status: 'open',
    title: 'Latencia elevada en servicio de tickets',
    desc: 'El microservicio de tickets supera 2s de respuesta promedio en los últimos 15 minutos. P99 = 4.8s.',
    ts: '2026-05-23T12:05:00', userId: null, correlationId: 'evt_7f20de45',
  },
  {
    id: 'a4', type: 'info', severity: 'low', status: 'resolved',
    title: 'Nuevo usuario admin registrado',
    desc: 'Se creó la cuenta admin@hub.co con rol ADMIN. Acción realizada por el sistema durante el setup inicial.',
    ts: '2026-05-22T09:00:00', userId: 'admin_1', correlationId: 'evt_1a00ef22',
  },
  {
    id: 'a5', type: 'fraud', severity: 'medium', status: 'resolved',
    title: 'Polla con participantes duplicados',
    desc: 'La polla POL-88 tenía el mismo usuario registrado dos veces con distintos tokens de sesión.',
    ts: '2026-05-21T16:44:00', userId: 'u5', correlationId: 'evt_9b88cc31',
  },
]

const SEVERITY = {
  high:   { bg: 'rgba(214,54,42,.15)',   fg: 'var(--red)',  dot: '#dc2626' },
  medium: { bg: 'rgba(244,181,0,.12)',   fg: 'var(--gold)', dot: '#f4b500' },
  low:    { bg: 'rgba(246,239,217,.07)', fg: 'rgba(246,239,217,.45)', dot: 'rgba(246,239,217,.35)' },
}

const TYPE_LABEL = { security: 'Seguridad', fraud: 'Fraude', system: 'Sistema', info: 'Info' }

// ─── AlertCard ────────────────────────────────────────────────────────────────
function AlertCard({ alert, onResolve, onDismiss }) {
  const sv  = SEVERITY[alert.severity]
  const ts  = new Date(alert.ts).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div style={{
      borderRadius: 10, overflow: 'hidden',
      border: `1px solid ${alert.status === 'open' ? 'rgba(246,239,217,0.12)' : 'rgba(246,239,217,0.05)'}`,
      opacity: alert.status === 'resolved' ? 0.55 : 1,
    }}>
      {/* header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
        background: 'rgba(246,239,217,0.04)',
        borderBottom: '1px solid rgba(246,239,217,0.07)',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: sv.dot, flexShrink: 0 }} />

        <span style={{
          padding: '2px 8px', borderRadius: 999,
          background: sv.bg, color: sv.fg,
          fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          {alert.severity}
        </span>

        <span style={{
          padding: '2px 8px', borderRadius: 999,
          background: 'rgba(246,239,217,.06)', color: 'rgba(246,239,217,.4)',
          fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          {TYPE_LABEL[alert.type]}
        </span>

        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .3, marginLeft: 'auto', color: 'var(--paper)' }}>
          {ts}
        </span>

        {alert.status === 'open' && (
          <span style={{
            padding: '2px 8px', borderRadius: 999,
            background: 'rgba(34,197,94,.12)', color: '#22c55e',
            fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em',
          }}>
            ABIERTA
          </span>
        )}
      </div>

      {/* body */}
      <div style={{ padding: '16px 18px' }}>
        <div style={{ fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 14, color: 'var(--paper)', marginBottom: 6 }}>
          {alert.title}
        </div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, opacity: .5, lineHeight: 1.5, color: 'var(--paper)', marginBottom: 14 }}>
          {alert.desc}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .25, color: 'var(--paper)' }}>
            ID: {alert.correlationId}
          </span>
          {alert.userId && (
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .25, color: 'var(--paper)' }}>
              Usuario: {alert.userId}
            </span>
          )}
          {alert.status === 'open' && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button
                onClick={() => onResolve(alert.id)}
                style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'rgba(34,197,94,.15)', color: '#22c55e', border: 'none', fontFamily: 'var(--f-sub)', fontWeight: 700 }}
              >
                Resolver
              </button>
              <button
                onClick={() => onDismiss(alert.id)}
                style={{ padding: '6px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'rgba(246,239,217,.06)', color: 'rgba(246,239,217,.5)', border: 'none', fontFamily: 'var(--f-mono)' }}
              >
                Descartar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── AdminAlerts ──────────────────────────────────────────────────────────────
export default function AdminAlerts() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [filter, setFilter] = useState('open')

  const open     = alerts.filter(a => a.status === 'open')
  const resolved = alerts.filter(a => a.status === 'resolved')
  const visible  = filter === 'open' ? open : filter === 'resolved' ? resolved : alerts

  function resolve(id)  { setAlerts(as => as.map(a => a.id === id ? { ...a, status: 'resolved' } : a)) }
  function dismiss(id)  { setAlerts(as => as.filter(a => a.id !== id)) }

  return (
    <div style={{ padding: 32, maxWidth: 860, margin: '0 auto' }}>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 48, lineHeight: .85, margin: '0 0 6px', color: 'var(--paper)', textTransform: 'uppercase' }}>
          Alertas
        </h1>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, opacity: .4, margin: 0, letterSpacing: '.06em' }}>
          {open.length} alerta{open.length !== 1 ? 's' : ''} abierta{open.length !== 1 ? 's' : ''} · {resolved.length} resuelta{resolved.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[['open','Abiertas'],['resolved','Resueltas'],['all','Todas']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
              background: filter === v ? 'var(--gold)' : 'rgba(246,239,217,0.06)',
              color: filter === v ? 'var(--gold-ink)' : 'rgba(246,239,217,.6)',
              border: 'none', fontFamily: 'var(--f-sub)', fontWeight: 700,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.map(a => (
          <AlertCard key={a.id} alert={a} onResolve={resolve} onDismiss={dismiss} />
        ))}
        {visible.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 13, opacity: .3, color: 'var(--paper)' }}>
            {filter === 'open' ? 'Sin alertas abiertas. Todo tranquilo.' : 'No hay alertas en este filtro.'}
          </div>
        )}
      </div>
    </div>
  )
}
