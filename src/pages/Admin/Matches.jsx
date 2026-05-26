import { useEffect, useMemo, useState } from 'react'
import { adminService } from '@/services/admin.service'

function MatchRow({ match, onSave }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    homeScore: match.homeScore ?? 0,
    awayScore: match.awayScore ?? 0,
    status: match.status || 'upcoming',
    minute: match.minute || '',
  })

  useEffect(() => {
    setForm({ homeScore: match.homeScore ?? 0, awayScore: match.awayScore ?? 0, status: match.status || 'upcoming', minute: match.minute || '' })
  }, [match])

  async function save() {
    await onSave(match.id, { ...form, homeScore: Number(form.homeScore), awayScore: Number(form.awayScore) })
    setEditing(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 280px 100px', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid rgba(246,239,217,.07)', color: 'var(--paper)' }}>
      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: match.status === 'live' ? '#22c55e' : match.status === 'final' ? 'rgba(246,239,217,.45)' : 'var(--gold)', textTransform: 'uppercase' }}>{match.status}</span>
      <div style={{ fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 18 }}>{match.home} {match.homeScore ?? '-'} - {match.awayScore ?? '-'} {match.away}</div>
      {editing ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" min="0" value={form.homeScore} onChange={e => setForm(f => ({ ...f, homeScore: e.target.value }))} style={{ width: 56 }} />
          <input type="number" min="0" value={form.awayScore} onChange={e => setForm(f => ({ ...f, awayScore: e.target.value }))} style={{ width: 56 }} />
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="upcoming">upcoming</option><option value="live">live</option><option value="halftime">halftime</option><option value="final">final</option>
          </select>
          <input value={form.minute} onChange={e => setForm(f => ({ ...f, minute: e.target.value }))} placeholder="min" style={{ width: 60 }} />
        </div>
      ) : <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, opacity: .4 }}>{match.phase || match.stadium || match.city || '—'}</div>}
      {editing ? <button onClick={save}>Guardar</button> : <button onClick={() => setEditing(true)}>Editar</button>}
    </div>
  )
}

export default function AdminMatches() {
  const [matches, setMatches] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true); setError('')
      const data = await adminService.getMatches()
      setMatches(Array.isArray(data) ? data : [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => filter === 'all' ? matches : matches.filter(m => m.status === filter), [matches, filter])

  async function handleSave(id, patch) {
    try {
      const updated = await adminService.updateMatch(id, patch)
      setMatches(list => list.map(m => m.id === id ? { ...m, ...updated } : m))
    } catch (err) {
      alert(`No se pudo actualizar: ${err.message}`)
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 48, lineHeight: .85, margin: '0 0 6px', color: 'var(--paper)', textTransform: 'uppercase' }}>Partidos</h1>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, opacity: .4, margin: 0, letterSpacing: '.06em' }}>Datos tomados del backend y MySQL.</p>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[['all','Todos'],['live','En vivo'],['upcoming','Programados'],['final','Finalizados']].map(([v, l]) => <button key={v} onClick={() => setFilter(v)} style={{ padding: '7px 14px', borderRadius: 8, background: filter === v ? 'var(--gold)' : 'rgba(246,239,217,.06)', color: filter === v ? 'var(--gold-ink)' : 'rgba(246,239,217,.6)', border: 'none' }}>{l}</button>)}
        <span style={{ marginLeft: 'auto', color: 'var(--paper)', opacity: .35 }}>{filtered.length} partidos</span>
      </div>
      {loading && <p style={{ color: 'var(--paper)', opacity: .5 }}>Cargando partidos...</p>}
      {error && <p style={{ color: 'var(--red)' }}>Error: {error}</p>}
      <div style={{ borderRadius: 12, border: '1px solid rgba(246,239,217,0.08)', overflow: 'hidden' }}>
        {filtered.map(m => <MatchRow key={m.id} match={m} onSave={handleSave} />)}
        {!filtered.length && !loading && <div style={{ padding: 40, color: 'var(--paper)', opacity: .4, textAlign: 'center' }}>No hay partidos.</div>}
      </div>
    </div>
  )
}
