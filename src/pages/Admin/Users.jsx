import { useState } from 'react'

// ─── Mock users (RF-30 — admin user list) ─────────────────────────────────────
const MOCK_USERS = [
  { id: 'u1',  name: 'Martín Delgadillo',   handle: '@martin',    email: 'martin@hub.co',     role: 'user',  status: 'active',    joinedAt: '2026-03-15', tickets: 2,  pts: 162 },
  { id: 'u2',  name: 'Valeria Ospina',       handle: '@valeria',   email: 'valeria@hub.co',    role: 'user',  status: 'active',    joinedAt: '2026-03-16', tickets: 1,  pts: 98  },
  { id: 'u3',  name: 'Andrés Moreno',        handle: '@andres',    email: 'andres@hub.co',     role: 'user',  status: 'active',    joinedAt: '2026-03-17', tickets: 3,  pts: 210 },
  { id: 'u4',  name: 'Carolina Ruiz',        handle: '@carolina',  email: 'carolina@hub.co',   role: 'user',  status: 'suspended', joinedAt: '2026-03-18', tickets: 0,  pts: 0   },
  { id: 'u5',  name: 'Felipe Torres',        handle: '@felipe',    email: 'felipe@hub.co',     role: 'user',  status: 'active',    joinedAt: '2026-03-20', tickets: 1,  pts: 77  },
  { id: 'u6',  name: 'Natalia Gómez',        handle: '@natalia',   email: 'natalia@hub.co',    role: 'user',  status: 'active',    joinedAt: '2026-03-21', tickets: 0,  pts: 45  },
  { id: 'u7',  name: 'Admin Sistema',        handle: '@admin',     email: 'admin@hub.co',      role: 'admin', status: 'active',    joinedAt: '2026-01-01', tickets: 0,  pts: 0   },
  { id: 'u8',  name: 'Diego Salazar',        handle: '@diego',     email: 'diego@hub.co',      role: 'user',  status: 'active',    joinedAt: '2026-03-22', tickets: 2,  pts: 134 },
]

const STATUS_COLORS = {
  active:    { bg: 'rgba(34,197,94,.15)',  fg: '#22c55e' },
  suspended: { bg: 'rgba(214,54,42,.15)',  fg: 'var(--red)' },
}

const ROLE_COLORS = {
  admin: { bg: 'rgba(244,181,0,.15)', fg: 'var(--gold)' },
  user:  { bg: 'rgba(246,239,217,.06)', fg: 'rgba(246,239,217,.5)' },
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label, scheme }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 8px', borderRadius: 999,
      background: scheme.bg, color: scheme.fg,
      fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
      textTransform: 'uppercase',
    }}>
      {label}
    </span>
  )
}

// ─── AdminUsers ───────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [search,    setSearch]  = useState('')
  const [roleFilter, setRF]    = useState('all')
  const [statusFilter, setSF]  = useState('all')
  const [users, setUsers]      = useState(MOCK_USERS)
  const [selected, setSelected] = useState(null)

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.handle.includes(q) || u.email.includes(q)
    const matchRole   = roleFilter   === 'all' || u.role === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  function toggleSuspend(id) {
    setUsers(us => us.map(u => u.id === id
      ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
      : u
    ))
  }

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 48, lineHeight: .85, margin: '0 0 6px', color: 'var(--paper)', textTransform: 'uppercase' }}>
          Usuarios
        </h1>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, opacity: .4, margin: 0, letterSpacing: '.06em' }}>
          {users.length} registrados · {users.filter(u => u.status === 'active').length} activos · {users.filter(u => u.status === 'suspended').length} suspendidos
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Buscar por nombre, usuario o email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 220, maxWidth: 380,
            padding: '9px 14px', borderRadius: 8, fontSize: 13,
            background: 'rgba(246,239,217,0.05)',
            border: '1px solid rgba(246,239,217,0.12)',
            color: 'var(--paper)', outline: 'none',
            fontFamily: 'var(--f-mono)',
          }}
        />
        {[
          { label: 'Rol',    value: roleFilter,   setter: setRF,   opts: [['all','Todos'],['user','User'],['admin','Admin']] },
          { label: 'Estado', value: statusFilter, setter: setSF,   opts: [['all','Todos'],['active','Activo'],['suspended','Suspendido']] },
        ].map(({ label, value, setter, opts }) => (
          <select
            key={label}
            value={value}
            onChange={e => setter(e.target.value)}
            style={{
              padding: '9px 12px', borderRadius: 8, fontSize: 12,
              background: 'rgba(246,239,217,0.05)',
              border: '1px solid rgba(246,239,217,0.12)',
              color: 'var(--paper)', fontFamily: 'var(--f-mono)', cursor: 'pointer',
            }}
          >
            {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, opacity: .35, marginLeft: 'auto' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div style={{
        borderRadius: 12, overflow: 'hidden',
        border: '1px solid rgba(246,239,217,0.08)',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 80px 100px 60px 60px 110px',
          padding: '10px 18px', gap: 12,
          background: 'rgba(246,239,217,0.04)',
          borderBottom: '1px solid rgba(246,239,217,0.08)',
          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.1em', opacity: .4, textTransform: 'uppercase',
          color: 'var(--paper)',
        }}>
          {['Nombre', 'Email', 'Rol', 'Estado', 'PTS', 'ENT.', 'Acciones'].map(h => (
            <div key={h}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {filtered.map((u, i) => (
          <div
            key={u.id}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 80px 100px 60px 60px 110px',
              padding: '14px 18px', gap: 12, alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(246,239,217,0.06)' : 'none',
              background: selected === u.id ? 'rgba(244,181,0,0.04)' : 'transparent',
              cursor: 'pointer', transition: 'background .12s',
            }}
            onClick={() => setSelected(s => s === u.id ? null : u.id)}
            onMouseEnter={e => { if (selected !== u.id) e.currentTarget.style.background = 'rgba(246,239,217,0.03)' }}
            onMouseLeave={e => { if (selected !== u.id) e.currentTarget.style.background = 'transparent' }}
          >
            <div>
              <div style={{ fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 13, color: 'var(--paper)' }}>{u.name}</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .4, marginTop: 2 }}>{u.handle}</div>
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, opacity: .55, color: 'var(--paper)' }}>{u.email}</div>
            <Chip label={u.role}   scheme={ROLE_COLORS[u.role]} />
            <Chip label={u.status} scheme={STATUS_COLORS[u.status]} />
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, color: 'var(--paper)', lineHeight: 1 }}>{u.pts}</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, color: 'var(--paper)', lineHeight: 1 }}>{u.tickets}</div>
            <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => toggleSuspend(u.id)}
                style={{
                  padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                  fontFamily: 'var(--f-mono)', fontWeight: 700,
                  background: u.status === 'active' ? 'rgba(214,54,42,.15)' : 'rgba(34,197,94,.15)',
                  color: u.status === 'active' ? 'var(--red)' : '#22c55e',
                  border: 'none',
                }}
              >
                {u.status === 'active' ? 'Suspender' : 'Reactivar'}
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: '40px 18px', textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 13, opacity: .35, color: 'var(--paper)' }}>
            No se encontraron usuarios con esos filtros.
          </div>
        )}
      </div>
    </div>
  )
}
