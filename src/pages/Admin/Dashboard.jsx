import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/config/routes'
import { adminService } from '@/services/admin.service'

function StatCard({ label, value, sub, accent = false }) {
  return (
    <div style={{
      padding: '24px 28px', borderRadius: 12,
      background: accent ? 'var(--gold)' : 'rgba(246,239,217,0.04)',
      border: `1px solid ${accent ? 'transparent' : 'rgba(246,239,217,0.08)'}`,
      color: accent ? 'var(--gold-ink)' : 'var(--paper)',
    }}>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.12em', opacity: .55, marginBottom: 8, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 52, lineHeight: .85 }}>{value}</div>
      {sub && <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, marginTop: 10, opacity: .6 }}>{sub}</div>}
    </div>
  )
}

function RecentRow({ match }) {
  const statusColor = { live: '#22c55e', halftime: '#f4b500', final: 'rgba(246,239,217,.4)', upcoming: 'var(--gold)' }[match.status] ?? 'rgba(246,239,217,.4)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid rgba(246,239,217,0.07)' }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 13 }}>{match.home} vs {match.away}</div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .4, letterSpacing: '.06em', marginTop: 2 }}>
          {match.kickoff ? new Date(match.kickoff).toLocaleString('es-CO') : 'Sin fecha'} · {match.stadium || match.city || 'Sede pendiente'}
        </div>
      </div>
      <div style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(246,239,217,0.06)', fontFamily: 'var(--f-mono)', fontSize: 11, opacity: .7 }}>
        {['live', 'halftime', 'final'].includes(match.status)
          ? `${match.homeScore ?? 0}–${match.awayScore ?? 0} ${match.status.toUpperCase()}`
          : match.status?.toUpperCase() || 'N/D'}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [users, setUsers] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        setLoading(true)
        const [m, u, a] = await Promise.all([
          adminService.getMatches(),
          adminService.getUsers(),
          adminService.getAlerts(),
        ])
        if (!alive) return
        setMatches(Array.isArray(m) ? m : [])
        setUsers(Array.isArray(u) ? u : [])
        setAlerts(Array.isArray(a) ? a : [])
      } catch (err) {
        if (alive) setError(err.message)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  const stats = useMemo(() => {
    const live = matches.filter(m => ['live', 'halftime'].includes(m.status))
    const upcoming = matches.filter(m => m.status === 'upcoming')
    const final = matches.filter(m => m.status === 'final')
    const activeUsers = users.filter(u => u.status === 'active').length
    const openAlerts = alerts.filter(a => a.status === 'open').length
    const recent = [...live, ...final].slice(0, 5)
    return { live, upcoming, final, activeUsers, openAlerts, recent }
  }, [matches, users, alerts])

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .35, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 8 }}>
          PANEL DE CONTROL · {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 52, lineHeight: .85, margin: 0, color: 'var(--paper)', textTransform: 'uppercase' }}>Dashboard</h1>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, opacity: .4, marginTop: 10, letterSpacing: '.06em' }}>
          Bienvenido, {user?.name || 'Admin'}. Datos conectados al backend.
        </p>
      </div>

      {loading && <p style={{ color: 'var(--paper)', opacity: .5 }}>Cargando datos administrativos...</p>}
      {error && <p style={{ color: 'var(--red)' }}>Error: {error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 32 }}>
        <StatCard label="Partidos en vivo" value={stats.live.length} sub="Activos ahora mismo" accent />
        <StatCard label="Próximos partidos" value={stats.upcoming.length} sub="Programados" />
        <StatCard label="Finalizados" value={stats.final.length} sub="Con resultado" />
        <StatCard label="Total partidos" value={matches.length} sub="En el torneo" />
        <StatCard label="Usuarios activos" value={stats.activeUsers} sub="Tomado de MySQL" />
        <StatCard label="Alertas abiertas" value={stats.openAlerts} sub="Pendientes" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ borderRadius: 12, padding: '24px 28px', background: 'rgba(246,239,217,0.03)', border: '1px solid rgba(246,239,217,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 14, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--paper)' }}>Partidos recientes</div>
            <button onClick={() => navigate(ROUTES.ADMIN_MATCHES)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontFamily: 'var(--f-mono)', fontSize: 11, cursor: 'pointer', opacity: .8 }}>Ver todos →</button>
          </div>
          {stats.recent.map(m => <RecentRow key={m.id} match={m} />)}
          {!stats.recent.length && <p style={{ color: 'var(--paper)', opacity: .4 }}>No hay partidos recientes.</p>}
        </div>

        <div style={{ borderRadius: 12, padding: '24px 28px', background: 'rgba(246,239,217,0.03)', border: '1px solid rgba(246,239,217,0.08)' }}>
          <div style={{ fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 14, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--paper)', marginBottom: 16 }}>Acciones rápidas</div>
          {[
            { label: 'Gestionar usuarios', sub: `${users.length} usuarios registrados`, route: ROUTES.ADMIN_USERS },
            { label: 'Administrar partidos', sub: `${matches.length} partidos cargados`, route: ROUTES.ADMIN_MATCHES },
            { label: 'Centro de alertas', sub: `${stats.openAlerts} alertas pendientes`, route: ROUTES.ADMIN_ALERTS },
          ].map(a => (
            <button key={a.route} onClick={() => navigate(a.route)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 8, marginBottom: 10, background: 'rgba(246,239,217,0.04)', border: '1px solid rgba(246,239,217,0.08)', cursor: 'pointer' }}>
              <div style={{ fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 13, color: 'var(--paper)', marginBottom: 3 }}>{a.label}</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, opacity: .4, letterSpacing: '.04em', color: 'var(--paper)' }}>{a.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
