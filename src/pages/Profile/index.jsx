import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell, PageHeader, Floodlight, Footer } from '@/components/shared/Layout'
import { Eyebrow, Btn, Flag } from '@/components/shared/atoms'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/context/AuthContext'
import { TZ_OPTIONS } from '@/utils/tz'
import { notificationsService } from '@/services/notifications.service'

// Stats that come from a separate service — kept as mock until backend is wired
const MOCK_STATS = {
  totalPts:    162,
  predictions: 15,
  accuracy:    73.3,
  tickets:     2,
  rank:        4,
}

const DEFAULT_NOTIFS = {
  golesEnVivo:     true,
  misPredicciones: true,
  grupos:          true,
  entradas:        true,
  recordatorios:   true,
  marketing:       false,
}

// UI key (es-ES) → API key (camelCase backend)
const NOTIF_KEY_MAP = {
  golesEnVivo:     'goalsLive',
  misPredicciones: 'myPredictions',
  grupos:          'groups',
  entradas:        'tickets',
  recordatorios:   'reminders',
  marketing:       'marketing',
}

function apiToUi(api) {
  return {
    golesEnVivo:     api.goalsLive     ?? true,
    misPredicciones: api.myPredictions ?? true,
    grupos:          api.groups        ?? true,
    entradas:        api.tickets       ?? true,
    recordatorios:   api.reminders     ?? true,
    marketing:       api.marketing     ?? false,
  }
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      aria-pressed={value}
      style={{
        position: 'relative', width: 48, height: 26, borderRadius: 999,
        background: value ? 'var(--green)' : 'var(--rule)',
        border: 'none', cursor: 'pointer', transition: 'background .2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: value ? 25 : 3,
        width: 20, height: 20, borderRadius: 999,
        background: 'white', transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.25)',
      }} />
    </button>
  )
}

// ─── NotifRow ─────────────────────────────────────────────────────────────────
function NotifRow({ label, desc, value, onChange, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
      padding: '16px 0',
      borderBottom: last ? 'none' : '1px solid var(--rule)',
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.4 }}>{desc}</div>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  )
}

// ─── PrivacyItem ──────────────────────────────────────────────────────────────
function PrivacyItem({ icon, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
      <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  )
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate               = useNavigate()
  const { user: authUser, logout, updateUser } = useAuth()
  const [tab,     setTab]     = useState('cuenta')
  const [notifs,  setNotifs]  = useState(DEFAULT_NOTIFS)

  // Cargar preferencias reales al montar
  useEffect(() => {
    let alive = true
    notificationsService.getPreferences()
      .then(p => { if (alive) setNotifs(apiToUi(p)) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  async function toggleNotif(uiKey, value) {
    setNotifs(ns => ({ ...ns, [uiKey]: value }))
    try {
      const patch = { [NOTIF_KEY_MAP[uiKey]]: value }
      await notificationsService.updatePreferences(patch)
    } catch {
      // Revert si falla
      setNotifs(ns => ({ ...ns, [uiKey]: !value }))
    }
  }
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  const displayHandle = authUser?.handle?.replace('@', '') ?? ''

  // Edit form state — mirrors auth user fields
  const [form, setForm] = useState({
    name:  authUser?.name  ?? '',
    email: authUser?.email ?? '',
    handle: displayHandle,
  })

  // Password change state
  const [pw,       setPw]      = useState({ current: '', next: '', confirm: '' })
  const [pwError,  setPwError]  = useState(null)
  const [pwDone,   setPwDone]   = useState(false)
  const [pwSaving, setPwSaving] = useState(false)

  // Favorite teams — driven by auth user
  const [favTeams, setFavTeams] = useState([...(authUser?.favoriteTeams ?? [])])

  async function handleSave() {
    setSaving(true)
    try {
      await updateUser({ name: form.name, email: form.email, handle: `@${form.handle}`, favoriteTeams: favTeams })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setEditing(false)
      setSaving(false)
    }
  }

  function handleCancelEdit() {
    setForm({ name: authUser?.name ?? '', email: authUser?.email ?? '', handle: displayHandle })
    setEditing(false)
  }

  async function handlePwChange() {
    if (!pw.current) { setPwError('Ingresá tu contraseña actual.'); return }
    if (pw.next.length < 8) { setPwError('La nueva contraseña debe tener al menos 8 caracteres.'); return }
    if (pw.next !== pw.confirm) { setPwError('Las contraseñas no coinciden.'); return }
    setPwError(null)
    setPwSaving(true)
    await new Promise(r => setTimeout(r, 900))
    setPwSaving(false)
    setPwDone(true)
    setPw({ current: '', next: '', confirm: '' })
  }

  function removeFavTeam(code) {
    setFavTeams(t => t.filter(c => c !== code))
  }

  const NOTIF_ITEMS = [
    { key: 'golesEnVivo',     label: 'Goles en vivo',                desc: 'Notificación inmediata de goles en partidos que seguís' },
    { key: 'misPredicciones', label: 'Mis predicciones',             desc: 'Recordatorio antes del cierre de cada partido pronosticado' },
    { key: 'grupos',          label: 'Actividad de grupos',          desc: 'Cuando alguien se une o comparte contenido en tus grupos' },
    { key: 'entradas',        label: 'Entradas y reservas',          desc: 'Estado de tus reservas, vencimientos y transferencias' },
    { key: 'recordatorios',   label: 'Recordatorios del torneo',     desc: 'Partidos próximos de tus selecciones favoritas' },
    { key: 'marketing',       label: 'Comunicaciones promocionales', desc: 'Novedades, ofertas y contenido especial del Mundial Hub' },
  ]

  return (
    <PageShell>
      <PageHeader
        kicker={`${authUser?.handle ?? ''} · RANGO GLOBAL #${MOCK_STATS.rank}`}
        title={<>Mi <span style={{ color: 'var(--gold)' }}>Perfil.</span></>}
        lede="Gestioná tu cuenta, personalizá tus notificaciones y controlá la privacidad de tus datos."
      />

      {/* User hero card */}
      <div style={{ padding: '0 56px' }}>
        <div className="gc-card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
          <Floodlight size={400} color="var(--gold)" opacity={.15} top={-180} right={-80} />
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>

            {/* Avatar */}
            <div style={{
              width: 88, height: 88, borderRadius: 18, flexShrink: 0,
              background: 'var(--gold)', color: 'var(--gold-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--f-display)', fontSize: 46,
            }}>{(authUser?.name ?? 'U')[0].toUpperCase()}</div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 42, lineHeight: .88, margin: '0 0 6px', textTransform: 'uppercase' }}>
                {authUser?.name}
              </h2>
              <div className="gc-mono" style={{ fontSize: 11, opacity: .55, letterSpacing: '.1em', marginBottom: 18 }}>
                {authUser?.handle} · {authUser?.email}
              </div>

              {/* Quick stats */}
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {[
                  { label: 'PUNTOS',        val: MOCK_STATS.totalPts },
                  { label: 'PRECISIÓN',     val: `${MOCK_STATS.accuracy}%` },
                  { label: 'PREDICCIONES',  val: MOCK_STATS.predictions },
                  { label: 'ENTRADAS',      val: MOCK_STATS.tickets },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 9, fontFamily: 'var(--f-mono)', opacity: .5, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 2 }}>
                      {s.label}
                    </div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 32, lineHeight: .9 }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rank badge */}
            <div style={{
              padding: '10px 16px', borderRadius: 12, flexShrink: 0,
              background: 'var(--ink)', color: 'var(--paper)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 9, fontFamily: 'var(--f-mono)', letterSpacing: '.12em', opacity: .55, marginBottom: 4 }}>RANGO</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 36, lineHeight: .9 }}>#{MOCK_STATS.rank}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved feedback */}
      {saved && (
        <div style={{ margin: '16px 56px 0' }}>
          <div style={{
            padding: '12px 18px', borderRadius: 10,
            background: 'var(--green)', color: 'var(--green-ink)',
            fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 13, letterSpacing: '.06em',
          }}>✓ Perfil actualizado correctamente.</div>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ padding: '32px 56px 0' }}>
        <div className="gc-tabs">
          {[
            { id: 'cuenta',         label: 'MI CUENTA'       },
            { id: 'notificaciones', label: 'NOTIFICACIONES'  },
            { id: 'privacidad',     label: 'PRIVACIDAD'      },
          ].map(t => (
            <button key={t.id} className={tab === t.id ? 'is-on' : ''} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Cuenta ──────────────────────────────────────────────────────── */}
      {tab === 'cuenta' && (
        <div style={{ padding: '24px 56px 0', display: 'grid', gap: 20, maxWidth: 740 }}>

          {/* Edit profile */}
          <div className="gc-card" style={{ padding: 28 }}>
            <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 30, margin: 0, lineHeight: .9 }}>Información personal</h3>
              {!editing ? (
                <Btn kind="ghost" onClick={() => setEditing(true)} style={{ padding: '8px 18px', fontSize: 12 }}>Editar</Btn>
              ) : (
                <div className="gc-row gc-gap-sm">
                  <Btn kind="ghost"    onClick={handleCancelEdit}  style={{ padding: '8px 14px', fontSize: 12 }}>Cancelar</Btn>
                  <Btn kind="primary"  onClick={handleSave} style={{ padding: '8px 18px', fontSize: 12, ...(saving ? { opacity: .6, pointerEvents: 'none' } : {}) }}>
                    {saving ? 'Guardando…' : 'Guardar →'}
                  </Btn>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gap: 18 }}>
              {[
                { key: 'name',   label: 'NOMBRE COMPLETO',    placeholder: 'Tu nombre completo',  display: authUser?.name },
                { key: 'handle', label: 'USUARIO',            placeholder: 'tu_usuario',          display: authUser?.handle },
                { key: 'email',  label: 'CORREO ELECTRÓNICO', placeholder: 'correo@ejemplo.com',  display: authUser?.email, type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--f-mono)', letterSpacing: '.12em', opacity: .5, marginBottom: 7 }}>
                    {f.label}
                  </label>
                  {editing ? (
                    <input
                      className="gc-input"
                      type={f.type || 'text'}
                      value={form[f.key]}
                      onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                    />
                  ) : (
                    <div style={{ padding: '10px 0 10px', fontSize: 14, fontWeight: 600, borderBottom: '1px solid var(--rule)' }}>
                      {f.display}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Favorite teams */}
          <div className="gc-card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 30, margin: '0 0 6px', lineHeight: .9 }}>Selecciones favoritas</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 18px', lineHeight: 1.5 }}>
              Las selecciones que seguís aparecen primero en tu agenda de partidos.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {favTeams.map(code => (
                <div key={code} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '7px 14px', borderRadius: 999,
                  background: 'var(--green)', color: 'var(--green-ink)',
                }}>
                  <Flag code={code} size={18} />
                  <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 12, letterSpacing: '.06em' }}>{code}</span>
                  <button
                    onClick={() => removeFavTeam(code)}
                    style={{ background: 'none', border: 'none', color: 'inherit', opacity: .6, cursor: 'pointer', fontSize: 15, padding: 0, lineHeight: 1 }}
                  >×</button>
                </div>
              ))}
              <button style={{
                padding: '7px 14px', borderRadius: 999,
                border: '1.5px dashed var(--rule)', background: 'transparent',
                color: 'var(--muted)', cursor: 'pointer', fontSize: 12,
                fontFamily: 'var(--f-sub)', fontWeight: 700, letterSpacing: '.04em',
              }}>+ Agregar</button>
            </div>
          </div>

          {/* Timezone */}
          <div className="gc-card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 30, margin: '0 0 6px', lineHeight: .9 }}>Zona horaria</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 18px', lineHeight: 1.5 }}>
              Los horarios de los partidos se mostrarán en tu zona horaria local (RNF-18).
            </p>
            <select
              value={authUser?.timezone ?? 'UTC-5'}
              onChange={async e => { await updateUser({ timezone: e.target.value }) }}
              style={{
                padding: '10px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                border: '1px solid var(--rule)', background: 'var(--paper-2)',
                color: 'var(--ink)', fontFamily: 'var(--f-mono)', maxWidth: 340, width: '100%',
              }}
            >
              {TZ_OPTIONS.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          {/* Change password */}
          <div className="gc-card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 30, margin: '0 0 6px', lineHeight: .9 }}>Cambiar contraseña</h3>
            {pwDone ? (
              <div style={{ padding: '14px 0', color: 'var(--green)', fontWeight: 700, fontSize: 14 }}>
                ✓ Contraseña actualizada correctamente.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14, maxWidth: 420, marginTop: 16 }}>
                {[
                  { key: 'current', label: 'CONTRASEÑA ACTUAL',          placeholder: '••••••••' },
                  { key: 'next',    label: 'NUEVA CONTRASEÑA',           placeholder: 'Mínimo 8 caracteres' },
                  { key: 'confirm', label: 'CONFIRMAR NUEVA CONTRASEÑA', placeholder: '••••••••' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--f-mono)', letterSpacing: '.12em', opacity: .5, marginBottom: 6 }}>
                      {f.label}
                    </label>
                    <input
                      className="gc-input"
                      type="password"
                      value={pw[f.key]}
                      onChange={e => setPw(v => ({ ...v, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
                {pwError && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{pwError}</p>}
                <div>
                  <Btn
                    kind="primary"
                    onClick={handlePwChange}
                    style={pwSaving ? { opacity: .6, pointerEvents: 'none' } : {}}
                  >
                    {pwSaving ? 'Actualizando…' : 'Cambiar contraseña'}
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Notificaciones ───────────────────────────────────────────────── */}
      {tab === 'notificaciones' && (
        <div style={{ padding: '24px 56px 0', maxWidth: 740 }}>
          <div className="gc-card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 30, margin: '0 0 6px', lineHeight: .9 }}>Preferencias de notificación</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 8px', lineHeight: 1.5 }}>
              Controlá qué alertas recibís y cómo querés ser contactado.
            </p>

            <div style={{ marginTop: 16 }}>
              {NOTIF_ITEMS.map((n, i) => (
                <NotifRow
                  key={n.key}
                  label={n.label}
                  desc={n.desc}
                  value={notifs[n.key]}
                  onChange={v => toggleNotif(n.key, v)}
                  last={i === NOTIF_ITEMS.length - 1}
                />
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--rule)' }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                Las notificaciones push se envían vía el servicio de notificaciones externo. El correo de recuperación siempre se envía independientemente de estas preferencias (RF-10).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Privacidad ───────────────────────────────────────────────────── */}
      {tab === 'privacidad' && (
        <div style={{ padding: '24px 56px 0', maxWidth: 740, display: 'grid', gap: 18 }}>

          <div className="gc-card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 30, margin: '0 0 10px', lineHeight: .9 }}>Protección de datos</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 24px', lineHeight: 1.6 }}>
              Tu información personal está cifrada y nunca se comparte con terceros sin tu autorización explícita.
              Cumplimos con las regulaciones vigentes de protección de datos.
            </p>
            <PrivacyItem icon="🔐" title="Contraseña cifrada"              desc="Tu contraseña se almacena con hash seguro. Nadie, ni el equipo técnico, puede ver tu contraseña en texto plano." />
            <PrivacyItem icon="🛡️" title="Datos personales protegidos"      desc="Email y datos personales nunca se exponen a otros usuarios ni a servicios externos no autorizados (RNF-06)." />
            <PrivacyItem icon="📋" title="Logs de auditoría"                desc="Toda acción relevante en tu cuenta genera un log estructurado con marca de tiempo y correlationId para tu protección (RNF-01, RNF-28)." />
            <PrivacyItem icon="🔄" title="Control de acceso por roles"      desc="Solo vos y los administradores autorizados pueden acceder a tu información sensible (RNF-04 · RBAC)." />
            <PrivacyItem icon="🔍" title="Investigación sin exposición"      desc="El equipo de seguridad puede investigar patrones anómalos sin exponer tus datos personales a terceros (RF-08)." />
          </div>

          {/* Danger zone */}
          <div className="gc-card" style={{ padding: 28, borderColor: 'rgba(214,54,42,.25)' }}>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 28, margin: '0 0 8px', lineHeight: .9, color: 'var(--red)' }}>
              Zona de peligro
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Estas acciones son permanentes. Procedé con cuidado.
            </p>
            <div className="gc-row gc-gap-sm" style={{ flexWrap: 'wrap' }}>
              <Btn
                kind="ghost"
                style={{ borderColor: 'var(--red)', color: 'var(--red)', padding: '10px 18px', fontSize: 12 }}
                onClick={() => { logout(); navigate(ROUTES.LOGIN, { replace: true }) }}
              >
                Cerrar sesión
              </Btn>
              <Btn
                kind="ghost"
                style={{ borderColor: 'var(--rule)', color: 'var(--muted)', padding: '10px 18px', fontSize: 12 }}
              >
                Eliminar cuenta
              </Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 80 }} />
      <Footer />
    </PageShell>
  )
}
