import { useState, useEffect } from 'react'
import { PageShell, PageHeader, Floodlight, Footer } from '@/components/shared/Layout'
import { Eyebrow, Btn, SectionHead, useCountUp } from '@/components/shared/atoms'
import { ModalOverlay } from '@/components/shared/Modal'
import { useGroups, useDiscoverGroups } from '@/hooks/useGroups'
import { groupsService } from '@/services/groups.service'

// ─── StatTilePro ──────────────────────────────────────────────────────────────
function StatTilePro({ label, value, change, tone = 'paper' }) {
  const v = useCountUp(typeof value === 'number' ? value : 0, 1400)
  const display = typeof value === 'number' ? Math.round(v) : value
  const styles = {
    paper: { bg: 'var(--paper)',   fg: 'var(--ink)',       border: '1px solid var(--rule)' },
    ink:   { bg: 'var(--ink)',     fg: 'var(--paper)',     border: 'transparent' },
    green: { bg: 'var(--green)',   fg: 'var(--green-ink)', border: 'transparent' },
    gold:  { bg: 'var(--gold)',    fg: 'var(--gold-ink)',  border: 'transparent' },
  }[tone] || { bg: 'var(--paper)', fg: 'var(--ink)', border: '1px solid var(--rule)' }

  return (
    <div className="gc-card gc-hover" style={{ background: styles.bg, color: styles.fg, padding: 24, borderColor: styles.border, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(circle at 100% 0%, ${tone === 'ink' ? 'rgba(247,241,223,.06)' : 'rgba(255,255,255,.18)'}, transparent 60%)` }} />
      <Eyebrow style={{ color: styles.fg, opacity: .7, position: 'relative' }}>{label}</Eyebrow>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 64, marginTop: 10, lineHeight: .85, position: 'relative' }}>{display}</div>
      <div className="gc-mono" style={{ fontSize: 11.5, marginTop: 12, opacity: .8, letterSpacing: '.06em', position: 'relative' }}>{change}</div>
    </div>
  )
}

// ─── Accent color by group type ───────────────────────────────────────────────
function accentFor(type) {
  const map = { Universidad: 'var(--green)', Familia: 'var(--gold)', Viajeros: 'var(--red)', 'Fan Zone': 'var(--ink)' }
  return map[type] || 'var(--ink)'
}
function fgFor(type) {
  return type === 'Familia' ? 'var(--gold-ink)' : type === 'Familia' ? 'var(--gold-ink)' : 'var(--paper)'
}

// ─── MemberStack · overlapping avatars ────────────────────────────────────────
function MemberStack({ members, total }) {
  const shown = members.slice(0, 4)
  return (
    <div className="gc-row" style={{ alignItems: 'center' }}>
      {shown.map((m, i) => (
        <div key={m.id} style={{
          width: 28, height: 28, borderRadius: 999,
          border: '2px solid var(--paper)',
          background: m.isYou ? 'var(--gold)' : 'var(--ink)',
          color: m.isYou ? 'var(--gold-ink)' : 'var(--paper)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 10,
          marginLeft: i > 0 ? -8 : 0, position: 'relative', zIndex: shown.length - i,
        }}>{m.avatar}</div>
      ))}
      {total > shown.length && (
        <span style={{ fontSize: 11, color: 'var(--ink-2)', marginLeft: 6, fontFamily: 'var(--f-mono)' }}>
          +{total - shown.length}
        </span>
      )}
    </div>
  )
}

// ─── GroupCard ────────────────────────────────────────────────────────────────
function GroupCard({ group, onExpand }) {
  const accent = accentFor(group.type)
  const fg     = group.type === 'Familia' ? 'var(--gold-ink)' : group.type === 'Viajeros' ? 'var(--red-ink)' : 'var(--paper)'

  return (
    <div
      className="gc-card gc-hover"
      onClick={onExpand}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', borderLeft: `4px solid ${accent}` }}
    >
      {/* gradient accent */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 260, height: 260,
        background: `radial-gradient(circle at top right, color-mix(in oklab, ${accent} 14%, transparent), transparent 60%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ padding: 24, position: 'relative' }}>
        {/* Header row */}
        <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div className="gc-row gc-gap-sm">
            {/* Avatar */}
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: accent, color: fg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--f-display)', fontSize: 22,
            }}>{group.avatarInitial}</div>
            <div>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 24, lineHeight: .9, margin: '0 0 5px' }}>{group.name}</h3>
              <div className="gc-row gc-gap-sm">
                <span className="gc-mono" style={{ fontSize: 10, opacity: .55, letterSpacing: '.1em' }}>{group.code}</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 999,
                  fontSize: 9, fontFamily: 'var(--f-sub)', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase',
                  background: accent, color: fg,
                }}>{group.type}</span>
              </div>
            </div>
          </div>

          {group.yourRole === 'admin' && (
            <span style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 9,
              fontFamily: 'var(--f-sub)', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase',
              background: 'var(--paper-2)', color: 'var(--muted)',
            }}>ADMIN</span>
          )}
        </div>

        {/* Description */}
        <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 18px', lineHeight: 1.55 }}>{group.description}</p>

        {/* Stats */}
        <div className="gc-row" style={{ gap: 28, marginBottom: 18 }}>
          {[
            { label: 'MIEMBROS',     val: group.members           },
            { label: 'ENTRADAS',     val: group.sharedTickets     },
            { label: 'PREDICCIONES', val: group.activePredictions },
          ].map(s => (
            <div key={s.label}>
              <div className="gc-mono" style={{ fontSize: 9, opacity: .5, letterSpacing: '.12em', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 34, lineHeight: .9, marginTop: 2 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <MemberStack members={group.memberList} total={group.members} />
          <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
            <span className="gc-mono" style={{ fontSize: 10, opacity: .55 }}>📍 {group.city}</span>
            <span style={{ color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--f-sub)', fontWeight: 700, letterSpacing: '.06em' }}>VER GRUPO →</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DiscoverCard ─────────────────────────────────────────────────────────────
function DiscoverCard({ group, onJoin }) {
  return (
    <div className="gc-card gc-hover" style={{ padding: 20 }}>
      <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: .9, margin: '0 0 6px' }}>{group.name}</h3>
          <span style={{
            fontSize: 9, fontFamily: 'var(--f-sub)', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase',
            padding: '2px 8px', borderRadius: 999,
            background: 'var(--paper-2)', color: 'var(--muted)',
          }}>{group.type}</span>
        </div>
        <span style={{
          fontSize: 9, fontFamily: 'var(--f-mono)', letterSpacing: '.1em', textTransform: 'uppercase',
          color: group.open ? 'var(--green)' : 'var(--muted)', opacity: group.open ? 1 : .5,
        }}>{group.open ? 'ABIERTO' : 'PRIVADO'}</span>
      </div>

      <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div className="gc-row" style={{ gap: 20 }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'var(--f-mono)', opacity: .5, letterSpacing: '.12em', textTransform: 'uppercase' }}>MIEMBROS</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 28, lineHeight: .9, marginTop: 2 }}>
              {group.members >= 1000 ? `${(group.members / 1000).toFixed(1)}k` : group.members}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'var(--f-mono)', opacity: .5, letterSpacing: '.12em', textTransform: 'uppercase' }}>SEDE</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{group.city}</div>
          </div>
        </div>
        <Btn kind="ghost" style={{ padding: '8px 16px', fontSize: 11 }} onClick={onJoin}>
          Unirse →
        </Btn>
      </div>
    </div>
  )
}

// ─── GroupDetailModal ─────────────────────────────────────────────────────────
function GroupDetailModal({ group, onClose }) {
  const [tab, setTab] = useState('members')
  const [activity, setActivity] = useState([])
  const [copied, setCopied] = useState(false)
  const accent = accentFor(group.type)
  const fg     = group.type === 'Familia' ? 'var(--gold-ink)' : 'var(--paper)'

  useEffect(() => {
    groupsService.getActivity(group.id).then(setActivity)
  }, [group.id])

  function copyCode() {
    navigator.clipboard?.writeText(group.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const actIcons = { ticket: '🎫', prediction: '⚽', join: '👋' }

  const sortedMembers = [...group.memberList].sort((a, b) => b.pts - a.pts)

  return (
    <ModalOverlay onClose={onClose} maxWidth={580}>
      {/* Group hero */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12, flexShrink: 0,
          background: accent, color: fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--f-display)', fontSize: 26,
        }}>{group.avatarInitial}</div>
        <div>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 32, lineHeight: .88, margin: '0 0 4px', textTransform: 'uppercase' }}>{group.name}</h2>
          <div className="gc-row gc-gap-sm">
            <span className="gc-mono" style={{ fontSize: 10, opacity: .55, letterSpacing: '.1em' }}>{group.code}</span>
            <span style={{
              padding: '2px 8px', borderRadius: 999,
              fontSize: 9, fontFamily: 'var(--f-sub)', fontWeight: 800,
              background: accent, color: fg, letterSpacing: '.07em', textTransform: 'uppercase',
            }}>{group.type}</span>
            {group.yourRole === 'admin' && (
              <span style={{ fontSize: 9, fontFamily: 'var(--f-mono)', color: 'var(--muted)', letterSpacing: '.08em' }}>ADMIN</span>
            )}
          </div>
        </div>
      </div>

      {group.description && (
        <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 20px', lineHeight: 1.55 }}>{group.description}</p>
      )}

      {/* Tabs */}
      <div className="gc-tabs" style={{ marginBottom: 18 }}>
        {[{ id: 'members', label: 'MIEMBROS' }, { id: 'activity', label: 'ACTIVIDAD' }].map(t => (
          <button key={t.id} className={tab === t.id ? 'is-on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* Members tab */}
      {tab === 'members' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {sortedMembers.map((m, i) => (
            <div key={m.id} style={{
              display: 'grid', gridTemplateColumns: 'auto auto 1fr auto',
              gap: 12, alignItems: 'center',
              padding: '10px 14px', borderRadius: 10,
              background: m.isYou ? 'var(--paper-2)' : 'transparent',
              border: m.isYou ? '1px solid var(--rule)' : '1px solid transparent',
            }}>
              <span style={{
                fontFamily: 'var(--f-display)', fontSize: 20, lineHeight: 1, minWidth: 28, textAlign: 'center',
                color: i === 0 ? 'var(--gold)' : i < 3 ? 'var(--ink)' : 'var(--muted)',
              }}>#{i + 1}</span>
              <div style={{
                width: 32, height: 32, borderRadius: 999,
                background: m.isYou ? 'var(--gold)' : 'var(--ink)',
                color: m.isYou ? 'var(--gold-ink)' : 'var(--paper)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 12,
              }}>{m.avatar}</div>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</span>
                {m.isYou && (
                  <span style={{ marginLeft: 8, fontSize: 9, color: 'var(--gold)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em' }}>TÚ</span>
                )}
              </div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: 1, textAlign: 'right' }}>
                {m.pts}<span className="gc-mono" style={{ fontSize: 10, opacity: .45, marginLeft: 3 }}>pts</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity tab */}
      {tab === 'activity' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {activity.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>Sin actividad reciente.</p>
          ) : activity.map(a => (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 999, background: 'var(--paper-2)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>{actIcons[a.type] || '·'}</div>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{a.user}</span>
                <span style={{ fontSize: 13, color: 'var(--ink-2)', marginLeft: 6 }}>{a.text}</span>
                <div className="gc-mono" style={{ fontSize: 10, opacity: .45, marginTop: 3 }}>{a.time} atrás</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--rule)' }}>
        <span className="gc-mono" style={{ fontSize: 10, opacity: .45, letterSpacing: '.1em' }}>
          📍 {group.city} · {group.members} MIEMBROS
        </span>
        <div className="gc-row gc-gap-sm">
          <Btn kind="ghost" onClick={copyCode} style={{ padding: '8px 16px', fontSize: 11 }}>
            {copied ? '✓ Copiado' : 'Copiar código'}
          </Btn>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ─── CreateGroupModal ─────────────────────────────────────────────────────────
function CreateGroupModal({ onClose, onCreated }) {
  const [step,    setStep]   = useState(1)
  const [name,    setName]   = useState('')
  const [type,    setType]   = useState('Universidad')
  const [desc,    setDesc]   = useState('')
  const [city,    setCity]   = useState('')
  const [created, setCreated] = useState(null)
  const [loading, setLoading] = useState(false)

  const TYPES = ['Universidad', 'Familia', 'Viajeros', 'Fan Zone', 'Trabajo', 'Amigos']

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    try {
      const g = await groupsService.create({ name: name.trim(), type, description: desc, city })
      setCreated(g)
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose} maxWidth={520}>
      {step === 1 && (
        <>
          <Eyebrow>↗ NUEVO GRUPO</Eyebrow>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 48, margin: '6px 0 24px', lineHeight: .88, textTransform: 'uppercase' }}>
            Crear<br /><span style={{ color: 'var(--gold)' }}>Grupo.</span>
          </h2>

          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--f-mono)', letterSpacing: '.12em', opacity: .55, marginBottom: 6 }}>
                NOMBRE DEL GRUPO *
              </label>
              <input
                className="gc-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Aula 304 — Ingeniería"
                maxLength={50}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--f-mono)', letterSpacing: '.12em', opacity: .55, marginBottom: 8 }}>
                TIPO
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {TYPES.map(t => (
                  <button key={t} onClick={() => setType(t)} style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: 12,
                    fontFamily: 'var(--f-sub)', fontWeight: 700, cursor: 'pointer',
                    background: type === t ? 'var(--ink)' : 'var(--paper-2)',
                    color: type === t ? 'var(--paper)' : 'var(--ink)',
                    border: type === t ? '1px solid var(--ink)' : '1px solid var(--rule)',
                  }}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--f-mono)', letterSpacing: '.12em', opacity: .55, marginBottom: 6 }}>
                CIUDAD / SEDE
              </label>
              <input
                className="gc-input"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Ej: Miami, Dallas, Los Ángeles…"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--f-mono)', letterSpacing: '.12em', opacity: .55, marginBottom: 6 }}>
                DESCRIPCIÓN (opcional)
              </label>
              <textarea
                className="gc-input"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="¿Qué une a este grupo?"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="gc-row" style={{ justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <Btn kind="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn
              kind="primary"
              onClick={handleCreate}
              style={loading || !name.trim() ? { opacity: .55, pointerEvents: 'none' } : {}}
            >
              {loading ? 'Creando…' : 'Crear grupo →'}
            </Btn>
          </div>
        </>
      )}

      {step === 2 && created && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <Eyebrow>↗ GRUPO CREADO</Eyebrow>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 44, margin: '6px 0 8px', lineHeight: .9, textTransform: 'uppercase' }}>
            {created.name || name}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 24px', lineHeight: 1.5 }}>
            Compartí este código con tus amigos para que puedan unirse.
          </p>

          <div style={{
            padding: '20px 32px', borderRadius: 14,
            background: 'var(--ink)', color: 'var(--paper)',
            display: 'inline-block', marginBottom: 28,
          }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--f-mono)', letterSpacing: '.16em', opacity: .55, marginBottom: 6 }}>
              CÓDIGO DE INVITACIÓN
            </div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 52, letterSpacing: '.04em', lineHeight: 1 }}>
              {created.code}
            </div>
          </div>

          <div className="gc-row" style={{ justifyContent: 'center', gap: 10 }}>
            <Btn kind="ghost" onClick={() => navigator.clipboard?.writeText(created.code)}>Copiar código</Btn>
            <Btn kind="primary" onClick={() => { onCreated?.(created); onClose() }}>¡Listo!</Btn>
          </div>
        </div>
      )}
    </ModalOverlay>
  )
}

// ─── JoinGroupModal ───────────────────────────────────────────────────────────
function JoinGroupModal({ onClose, onJoined }) {
  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleJoin() {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    try {
      await groupsService.join(code.trim().toUpperCase())
      setSuccess(true)
      onJoined?.()
    } catch {
      setError('Código inválido o grupo no encontrado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose} maxWidth={400}>
      {!success ? (
        <div style={{ textAlign: 'center' }}>
          <Eyebrow>↗ UNIRSE A GRUPO</Eyebrow>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 44, margin: '6px 0 24px', lineHeight: .9, textTransform: 'uppercase' }}>
            Ingresá<br /><span style={{ color: 'var(--green)' }}>el código.</span>
          </h2>
          <input
            className="gc-input"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="AULA304"
            maxLength={12}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            style={{ textAlign: 'center', fontSize: 28, fontFamily: 'var(--f-display)', letterSpacing: '.08em' }}
          />
          {error && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 10 }}>{error}</p>}
          <div className="gc-row" style={{ justifyContent: 'center', gap: 10, marginTop: 20 }}>
            <Btn kind="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn
              kind="primary"
              onClick={handleJoin}
              style={loading || !code.trim() ? { opacity: .55, pointerEvents: 'none' } : {}}
            >
              {loading ? 'Verificando…' : 'Unirse →'}
            </Btn>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <Eyebrow>↗ TE UNISTE AL GRUPO</Eyebrow>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 44, margin: '6px 0 18px', lineHeight: .9 }}>¡Bienvenido!</h2>
          <Btn kind="primary" onClick={onClose}>Ver mis grupos</Btn>
        </div>
      )}
    </ModalOverlay>
  )
}

// ─── GroupsPage ───────────────────────────────────────────────────────────────
export default function GroupsPage() {
  const { groups }          = useGroups()
  const { groups: discover } = useDiscoverGroups()
  const [selected,     setSelected]     = useState(null)
  const [showCreate,   setShowCreate]   = useState(false)
  const [showJoin,     setShowJoin]     = useState(false)

  const totalMembers = groups.reduce((s, g) => s + g.members, 0)
  const totalTickets = groups.reduce((s, g) => s + g.sharedTickets, 0)
  const totalPreds   = groups.reduce((s, g) => s + g.activePredictions, 0)

  return (
    <PageShell>
      {selected    && <GroupDetailModal  group={selected} onClose={() => setSelected(null)} />}
      {showCreate  && <CreateGroupModal  onClose={() => setShowCreate(false)} onCreated={() => {}} />}
      {showJoin    && <JoinGroupModal    onClose={() => setShowJoin(false)}   onJoined={() => {}} />}

      <PageHeader
        kicker={`${groups.length} GRUPOS · ${totalMembers} MIEMBROS · ${totalTickets} ENTRADAS COMPARTIDAS`}
        title={<>Mis <span style={{ color: 'var(--gold)' }}>Grupos.</span></>}
        lede="Organizá tu experiencia del Mundial con grupos de amigos, familia o compañeros. Coordinad entradas, seguí predicciones y viví el torneo juntos."
        action={
          <div className="gc-row gc-gap-sm">
            <Btn kind="ghost" onClick={() => setShowJoin(true)}>Código →</Btn>
            <Btn kind="primary" onClick={() => setShowCreate(true)}>Crear grupo →</Btn>
          </div>
        }
      />

      {/* Stat tiles */}
      <div style={{ padding: '0 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
          <StatTilePro label="MIS GRUPOS"          value={groups.length} change="Grupos activos"               tone="ink"   />
          <StatTilePro label="MIEMBROS TOTALES"    value={totalMembers}  change="En todos tus grupos"          tone="green" />
          <StatTilePro label="ENTRADAS COMPARTIDAS" value={totalTickets}  change="Coordina el acceso al estadio" tone="gold"  />
          <StatTilePro label="PREDICCIONES VIVAS"  value={totalPreds}    change="Picks activos de tus grupos"   tone="paper" />
        </div>
      </div>

      {/* Section 01 — My groups */}
      <SectionHead
        num="01"
        label={`↘ ${groups.length} GRUPOS · TUS GRUPOS`}
        title="Tus grupos"
        right={
          <div className="gc-row gc-gap-sm">
            <Btn kind="ghost"   style={{ padding: '8px 16px', fontSize: 11 }} onClick={() => setShowJoin(true)}>Código</Btn>
            <Btn kind="primary" style={{ padding: '8px 16px', fontSize: 11 }} onClick={() => setShowCreate(true)}>+ Crear</Btn>
          </div>
        }
      />

      <div style={{ padding: '22px 56px 0', display: 'grid', gap: 16 }}>
        {groups.length === 0 ? (
          <div className="gc-card" style={{ padding: 60, textAlign: 'center' }}>
            <Eyebrow>SIN GRUPOS TODAVÍA</Eyebrow>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 42, margin: '10px 0 10px', lineHeight: .9 }}>
              Creá tu primer grupo.
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 24 }}>
              Invitá a amigos, familia o compañeros y coordinad el Mundial juntos.
            </p>
            <div className="gc-row" style={{ justifyContent: 'center', gap: 10 }}>
              <Btn kind="ghost"   onClick={() => setShowJoin(true)}>Unirme con código</Btn>
              <Btn kind="primary" onClick={() => setShowCreate(true)}>Crear grupo →</Btn>
            </div>
          </div>
        ) : (
          groups.map(g => <GroupCard key={g.id} group={g} onExpand={() => setSelected(g)} />)
        )}
      </div>

      {/* Section 02 — Discover */}
      <SectionHead
        num="02"
        label={`↘ ${discover.length} GRUPOS PÚBLICOS · DESCUBRÍ`}
        title="Descubrí grupos"
        right={
          <Btn kind="ghost" style={{ padding: '8px 16px', fontSize: 11 }} onClick={() => setShowJoin(true)}>
            Tengo un código
          </Btn>
        }
      />

      <div style={{ padding: '22px 56px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
        {discover.map(g => (
          <DiscoverCard key={g.id} group={g} onJoin={() => setShowJoin(true)} />
        ))}
      </div>

      <div style={{ height: 80 }} />
      <Footer />
    </PageShell>
  )
}
