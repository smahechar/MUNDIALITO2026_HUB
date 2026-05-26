import { useEffect, useMemo, useState } from 'react'
import { adminService } from '@/services/admin.service'

const STATUS_COLORS = {
  active: { bg: 'rgba(34,197,94,.15)', fg: '#22c55e' },
  suspended: { bg: 'rgba(214,54,42,.15)', fg: 'var(--red)' },
}
const ROLE_COLORS = {
  admin: { bg: 'rgba(244,181,0,.15)', fg: 'var(--gold)' },
  user: { bg: 'rgba(246,239,217,.06)', fg: 'rgba(246,239,217,.5)' },
}
function Chip({ label, scheme }) {
  return <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 999, background: scheme.bg, color: scheme.fg, fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</span>
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadUsers() {
    try {
      setLoading(true)
      setError('')
      const data = await adminService.getUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return users.filter(u => {
      const matchesSearch = !term || [u.name, u.handle, u.email].some(v => String(v || '').toLowerCase().includes(term))
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  async function toggleStatus(user) {
    const next = user.status === 'suspended' ? 'active' : 'suspended'
    try {
      const updated = await adminService.updateUserStatus(user.id, next)
      setUsers(list => list.map(u => u.id === user.id ? { ...u, ...updated } : u))
    } catch (err) {
      alert(`No se pudo actualizar el usuario: ${err.message}`)
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 980, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 48, lineHeight: .85, margin: '0 0 6px', color: 'var(--paper)', textTransform: 'uppercase' }}>Usuarios</h1>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, opacity: .4, margin: 0, letterSpacing: '.06em' }}>
          {users.length} registrados · {users.filter(u => u.status === 'active').length} activos · {users.filter(u => u.status === 'suspended').length} suspendidos
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', gap: 12, marginBottom: 18 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, usuario o email..." style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(246,239,217,.15)', background: 'rgba(246,239,217,.04)', color: 'var(--paper)', fontFamily: 'var(--f-mono)' }} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '12px', borderRadius: 8, background: 'rgba(246,239,217,.04)', color: 'var(--paper)', border: '1px solid rgba(246,239,217,.15)' }}>
          <option value="all">Todos roles</option><option value="admin">Admin</option><option value="user">User</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '12px', borderRadius: 8, background: 'rgba(246,239,217,.04)', color: 'var(--paper)', border: '1px solid rgba(246,239,217,.15)' }}>
          <option value="all">Todos estados</option><option value="active">Active</option><option value="suspended">Suspended</option>
        </select>
      </div>

      {loading && <p style={{ color: 'var(--paper)', opacity: .5 }}>Cargando usuarios...</p>}
      {error && <p style={{ color: 'var(--red)' }}>Error: {error}</p>}

      <div style={{ borderRadius: 12, border: '1px solid rgba(246,239,217,0.08)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.5fr .7fr .8fr .5fr .7fr 1fr', gap: 12, padding: '12px 16px', background: 'rgba(246,239,217,.04)', fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .45, textTransform: 'uppercase', color: 'var(--paper)' }}>
          <span>Nombre</span><span>Email</span><span>Rol</span><span>Estado</span><span>Pts</span><span>Ent.</span><span>Acciones</span>
        </div>
        {filtered.map(u => (
          <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.5fr .7fr .8fr .5fr .7fr 1fr', gap: 12, alignItems: 'center', padding: '14px 16px', borderTop: '1px solid rgba(246,239,217,.06)', color: 'var(--paper)' }}>
            <div><div style={{ fontFamily: 'var(--f-sub)', fontWeight: 700 }}>{u.name || 'Sin nombre'}</div><div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .4 }}>{u.handle || '—'}</div></div>
            <div style={{ fontFamily: 'var(--f-mono)', opacity: .55 }}>{u.email}</div>
            <Chip label={u.role || 'user'} scheme={ROLE_COLORS[u.role] || ROLE_COLORS.user} />
            <Chip label={u.status || 'active'} scheme={STATUS_COLORS[u.status] || STATUS_COLORS.active} />
            <strong>{u.pts ?? 0}</strong>
            <strong>{u.tickets ?? 0}</strong>
            <button onClick={() => toggleStatus(u)} style={{ padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', background: u.status === 'suspended' ? 'rgba(34,197,94,.15)' : 'rgba(214,54,42,.15)', color: u.status === 'suspended' ? '#22c55e' : 'var(--red)', fontFamily: 'var(--f-sub)', fontWeight: 700 }}>
              {u.status === 'suspended' ? 'Reactivar' : 'Suspender'}
            </button>
          </div>
        ))}
        {!filtered.length && !loading && <div style={{ padding: 40, textAlign: 'center', color: 'var(--paper)', opacity: .4 }}>No hay usuarios para este filtro.</div>}
      </div>
    </div>
  )
}
