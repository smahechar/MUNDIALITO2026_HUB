import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsService } from '@/services/notifications.service'

const POLL_MS = 30_000

const CATEGORY_META = {
  ticket:       { color: 'var(--green)', label: 'ENTRADA' },
  transfer:     { color: 'var(--gold)',  label: 'TRANSFER' },
  refund:       { color: 'var(--ink)',   label: 'REEMBOLSO' },
  pool:         { color: 'var(--gold)',  label: 'POLLA' },
  album:        { color: 'var(--green)', label: 'ÁLBUM' },
  goal:         { color: 'var(--red)',   label: 'GOL' },
  match_change: { color: 'var(--red)',   label: 'CAMBIO' },
  broadcast:    { color: 'var(--ink)',   label: 'AVISO' },
  system:       { color: 'var(--muted)', label: 'SISTEMA' },
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)     return 'ahora'
  if (diff < 3600)   return `${Math.floor(diff / 60)} min`
  if (diff < 86400)  return `${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `${Math.floor(diff / 86400)} d`
  return new Date(iso).toLocaleDateString()
}

export default function NotificationsCenter() {
  const navigate = useNavigate()
  const wrapperRef = useRef(null)
  const [open,     setOpen]     = useState(false)
  const [unread,   setUnread]   = useState(0)
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  // Polling del contador (no abre lista, solo el badge)
  const refreshCount = useCallback(async () => {
    try {
      const { count } = await notificationsService.unreadCount()
      setUnread(count ?? 0)
    } catch {
      // silencioso — si falla, deja el contador como está
    }
  }, [])

  useEffect(() => {
    refreshCount()
    const id = setInterval(refreshCount, POLL_MS)
    return () => clearInterval(id)
  }, [refreshCount])

  // Click fuera cierra el panel
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function openPanel() {
    setOpen(true)
    setLoading(true)
    setError(null)
    try {
      const list = await notificationsService.list()
      setItems(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.message ?? 'Error al cargar notificaciones')
    } finally {
      setLoading(false)
    }
  }

  async function handleItemClick(n) {
    if (!n.read) {
      try {
        await notificationsService.markRead(n.id)
        setItems(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
        setUnread(c => Math.max(0, c - 1))
      } catch {}
    }
    if (n.link) {
      setOpen(false)
      navigate(n.link)
    }
  }

  async function handleMarkAllRead() {
    try {
      await notificationsService.markAllRead()
      setItems(prev => prev.map(n => ({ ...n, read: true })))
      setUnread(0)
    } catch {}
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label="Notificaciones"
        style={{
          position: 'relative', width: 38, height: 38, borderRadius: 10,
          border: '1px solid var(--rule)', background: 'transparent',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--ink)', transition: 'background .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,.04)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
             style={{ width: 18, height: 18 }}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999,
            background: 'var(--red)', color: '#fff',
            fontSize: 9, fontFamily: 'var(--f-sub)', fontWeight: 800,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--paper)',
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 380, maxWidth: '92vw', maxHeight: '70vh',
          background: 'var(--paper)', border: '1px solid var(--rule)',
          borderRadius: 12, boxShadow: '0 12px 36px rgba(0,0,0,.18)',
          display: 'flex', flexDirection: 'column',
          zIndex: 50, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', borderBottom: '1px solid var(--rule)',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 18, lineHeight: 1 }}>
                Notificaciones
              </div>
              <div className="gc-mono" style={{ fontSize: 10, opacity: .55, letterSpacing: '.1em', marginTop: 4 }}>
                {unread} SIN LEER
              </div>
            </div>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 11,
                  letterSpacing: '.06em', color: 'var(--ink)', textDecoration: 'underline',
                }}
              >
                Marcar todas
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
                Cargando…
              </div>
            )}
            {error && !loading && (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--red)' }}>
                {error}
              </div>
            )}
            {!loading && !error && items.length === 0 && (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, opacity: .3, marginBottom: 8 }}>🔕</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Sin notificaciones por ahora.</div>
              </div>
            )}
            {!loading && !error && items.map(n => {
              const meta = CATEGORY_META[n.category] ?? CATEGORY_META.system
              return (
                <button
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    background: n.read ? 'transparent' : 'rgba(244,181,0,0.06)',
                    padding: '12px 16px', borderBottom: '1px solid var(--rule)',
                    display: 'grid', gridTemplateColumns: '4px 1fr auto', gap: 12,
                    transition: 'background .12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(244,181,0,0.06)' }}
                >
                  <span style={{
                    width: 4, borderRadius: 4, background: meta.color, alignSelf: 'stretch',
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <div className="gc-mono" style={{
                      fontSize: 9, letterSpacing: '.12em', opacity: .55, marginBottom: 3,
                    }}>
                      {meta.label}
                    </div>
                    <div style={{
                      fontWeight: n.read ? 500 : 700, fontSize: 13, marginBottom: 2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {n.title}
                    </div>
                    {n.body && (
                      <div style={{
                        fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.4,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {n.body}
                      </div>
                    )}
                  </div>
                  <div className="gc-mono" style={{
                    fontSize: 10, opacity: .5, letterSpacing: '.06em',
                    alignSelf: 'flex-start', whiteSpace: 'nowrap',
                  }}>
                    {relativeTime(n.createdAt)}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{
            padding: '10px 16px', borderTop: '1px solid var(--rule)',
            textAlign: 'center',
          }}>
            <button
              onClick={() => { setOpen(false); navigate('/profile') }}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 11,
                letterSpacing: '.08em', color: 'var(--muted)',
              }}
            >
              Preferencias de notificación →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
