import { useEffect, useMemo, useState } from 'react'
import { adminService } from '@/services/admin.service'

const SEVERITY = {
  high: { bg: 'rgba(214,54,42,.15)', fg: 'var(--red)', dot: '#dc2626' },
  medium: { bg: 'rgba(244,181,0,.12)', fg: 'var(--gold)', dot: '#f4b500' },
  low: { bg: 'rgba(246,239,217,.07)', fg: 'rgba(246,239,217,.45)', dot: 'rgba(246,239,217,.35)' },
}
const TYPE_LABEL = { security: 'Seguridad', fraud: 'Fraude', system: 'Sistema', info: 'Info', broadcast: 'Comunicado' }

function AlertCard({ alert, onResolve, onDismiss }) {
  const sv = SEVERITY[alert.severity] || SEVERITY.low
  const ts = alert.ts ? new Date(alert.ts).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : 'Sin fecha'
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${alert.status === 'open' ? 'rgba(246,239,217,0.12)' : 'rgba(246,239,217,0.05)'}`, opacity: alert.status === 'resolved' ? 0.55 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', background: 'rgba(246,239,217,0.04)', borderBottom: '1px solid rgba(246,239,217,0.07)' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: sv.dot, flexShrink: 0 }} />
        <span style={{ padding: '2px 8px', borderRadius: 999, background: sv.bg, color: sv.fg, fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>{alert.severity}</span>
        <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(246,239,217,.06)', color: 'rgba(246,239,217,.4)', fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>{TYPE_LABEL[alert.type] || alert.type || 'Info'}</span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .3, marginLeft: 'auto', color: 'var(--paper)' }}>{ts}</span>
        {alert.status === 'open' && <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(34,197,94,.12)', color: '#22c55e', fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em' }}>ABIERTA</span>}
      </div>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 14, color: 'var(--paper)', marginBottom: 6 }}>{alert.title}</div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, opacity: .5, lineHeight: 1.5, color: 'var(--paper)', marginBottom: 14 }}>{alert.desc}</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .25, color: 'var(--paper)' }}>ID: {alert.correlationId || alert.id}</span>
          {alert.userId && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .25, color: 'var(--paper)' }}>Usuario: {alert.userId}</span>}
          {alert.status === 'open' && <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => onResolve(alert.id)} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'rgba(34,197,94,.15)', color: '#22c55e', border: 'none', fontFamily: 'var(--f-sub)', fontWeight: 700 }}>Resolver</button>
            <button onClick={() => onDismiss(alert.id)} style={{ padding: '6px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'rgba(246,239,217,.06)', color: 'rgba(246,239,217,.5)', border: 'none', fontFamily: 'var(--f-mono)' }}>Descartar</button>
          </div>}
        </div>
      </div>
    </div>
  )
}

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('open')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAlerts() {
    try {
      setLoading(true); setError('')
      const data = await adminService.getAlerts()
      setAlerts(Array.isArray(data) ? data : [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadAlerts() }, [])

  const open = alerts.filter(a => a.status === 'open')
  const resolved = alerts.filter(a => a.status === 'resolved')
  const visible = useMemo(() => filter === 'open' ? open : filter === 'resolved' ? resolved : alerts, [filter, alerts])

  async function update(id, action) {
    try {
      const result = await adminService.updateAlert(id, action)
      if (action === 'dismiss') setAlerts(list => list.filter(a => a.id !== id))
      else setAlerts(list => list.map(a => a.id === id ? { ...a, ...result } : a))
    } catch (err) {
      alert(`No se pudo actualizar la alerta: ${err.message}`)
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 48, lineHeight: .85, margin: '0 0 6px', color: 'var(--paper)', textTransform: 'uppercase' }}>Alertas</h1>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, opacity: .4, margin: 0, letterSpacing: '.06em' }}>{open.length} abiertas · {resolved.length} resueltas · datos desde backend</p>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[['open','Abiertas'],['resolved','Resueltas'],['all','Todas']].map(([v, l]) => <button key={v} onClick={() => setFilter(v)} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: filter === v ? 'var(--gold)' : 'rgba(246,239,217,0.06)', color: filter === v ? 'var(--gold-ink)' : 'rgba(246,239,217,.6)', border: 'none', fontFamily: 'var(--f-sub)', fontWeight: 700 }}>{l}</button>)}
      </div>
      {loading && <p style={{ color: 'var(--paper)', opacity: .5 }}>Cargando alertas...</p>}
      {error && <p style={{ color: 'var(--red)' }}>Error: {error}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.map(a => <AlertCard key={a.id} alert={a} onResolve={(id) => update(id, 'resolve')} onDismiss={(id) => update(id, 'dismiss')} />)}
        {!visible.length && !loading && <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 13, opacity: .3, color: 'var(--paper)' }}>{filter === 'open' ? 'Sin alertas abiertas. Todo tranquilo.' : 'No hay alertas en este filtro.'}</div>}
      </div>
    </div>
  )
}
