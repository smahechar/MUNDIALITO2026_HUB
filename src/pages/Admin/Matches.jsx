import { useState } from 'react'
import { matches as initialMatches } from '@/mocks/data/matches'

const STATUS_MAP = {
  upcoming: { label: 'Programado', bg: 'rgba(244,181,0,.12)',   fg: 'var(--gold)'              },
  live:     { label: 'En vivo',    bg: 'rgba(34,197,94,.12)',   fg: '#22c55e'                  },
  halftime: { label: 'Descanso',   bg: 'rgba(34,197,94,.08)',   fg: '#22c55e'                  },
  final:    { label: 'Finalizado', bg: 'rgba(246,239,217,.07)', fg: 'rgba(246,239,217,.45)'    },
}
const DEFAULT_STATUS = { label: 'Desconocido', bg: 'rgba(246,239,217,.05)', fg: 'rgba(246,239,217,.3)' }

// ─── ScoreInput ───────────────────────────────────────────────────────────────
function ScoreInput({ value, onChange }) {
  return (
    <input
      type="number" min={0} max={99} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{
        width: 44, textAlign: 'center', padding: '6px 0',
        borderRadius: 6, border: '1px solid rgba(246,239,217,0.2)',
        background: 'rgba(246,239,217,0.07)',
        color: 'var(--paper)', fontFamily: 'var(--f-display)', fontSize: 22,
        outline: 'none',
      }}
    />
  )
}

// ─── MatchRow ─────────────────────────────────────────────────────────────────
function MatchRow({ match, onSave }) {
  const [editing, setEditing] = useState(false)
  const [hs, setHs] = useState(match.homeScore ?? 0)
  const [as_, setAs] = useState(match.awayScore ?? 0)
  const [status, setStatus] = useState(match.status)
  const st = STATUS_MAP[match.status] ?? DEFAULT_STATUS

  function handleSave() {
    onSave(match.id, { homeScore: hs, awayScore: as_, status })
    setEditing(false)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
      borderBottom: '1px solid rgba(246,239,217,0.06)',
    }}>
      {/* Status pill */}
      <span style={{
        padding: '3px 9px', borderRadius: 999, flexShrink: 0,
        background: st.bg, color: st.fg,
        fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em',
      }}>
        {st.label.toUpperCase()}
      </span>

      {/* Teams + score */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 14, color: 'var(--paper)' }}>
            {match.home}
          </span>
          {editing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ScoreInput value={hs} onChange={setHs} />
              <span style={{ color: 'rgba(246,239,217,.3)', fontFamily: 'var(--f-display)', fontSize: 20 }}>–</span>
              <ScoreInput value={as_} onChange={setAs} />
            </div>
          ) : (
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 22, color: 'var(--paper)', lineHeight: 1 }}>
              {match.homeScore ?? '–'} · {match.awayScore ?? '–'}
            </span>
          )}
          <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 14, color: 'var(--paper)' }}>
            {match.away}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .35, marginTop: 4, letterSpacing: '.06em' }}>
          {match.date} {match.time} · {match.venue}
        </div>
      </div>

      {/* Status selector when editing */}
      {editing && (
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{
            padding: '7px 10px', borderRadius: 7, fontSize: 11,
            background: 'rgba(246,239,217,0.07)',
            border: '1px solid rgba(246,239,217,0.15)',
            color: 'var(--paper)', fontFamily: 'var(--f-mono)', cursor: 'pointer',
          }}
        >
          <option value="upcoming">Programado</option>
          <option value="live">En vivo</option>
          <option value="halftime">Descanso (HT)</option>
          <option value="final">Finalizado</option>
        </select>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {editing ? (
          <>
            <button onClick={handleSave} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'var(--gold)', color: 'var(--gold-ink)', border: 'none', fontFamily: 'var(--f-sub)', fontWeight: 700 }}>
              Guardar
            </button>
            <button onClick={() => setEditing(false)} style={{ padding: '6px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'rgba(246,239,217,.07)', color: 'rgba(246,239,217,.6)', border: 'none', fontFamily: 'var(--f-mono)' }}>
              Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'rgba(246,239,217,.07)', color: 'rgba(246,239,217,.6)', border: '1px solid rgba(246,239,217,.12)', fontFamily: 'var(--f-mono)' }}
          >
            Editar
          </button>
        )}
      </div>
    </div>
  )
}

// ─── AdminMatches ─────────────────────────────────────────────────────────────
export default function AdminMatches() {
  const [matches, setMatches] = useState(initialMatches)
  const [filter, setFilter]  = useState('all')

  const filtered = filter === 'all' ? matches : matches.filter(m => m.status === filter)

  function handleSave(id, { homeScore, awayScore, status }) {
    setMatches(ms => ms.map(m => m.id !== id ? m : { ...m, status, homeScore, awayScore }))
  }

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 48, lineHeight: .85, margin: '0 0 6px', color: 'var(--paper)', textTransform: 'uppercase' }}>
          Partidos
        </h1>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, opacity: .4, margin: 0, letterSpacing: '.06em' }}>
          Cargá resultados y actualizá el estado de cada partido en tiempo real.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[['all','Todos'],['live','En vivo'],['upcoming','Programados'],['final','Finalizados']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
              background: filter === v ? 'var(--gold)' : 'rgba(246,239,217,0.06)',
              color: filter === v ? 'var(--gold-ink)' : 'rgba(246,239,217,.6)',
              border: 'none', fontFamily: 'var(--f-sub)', fontWeight: 700,
              letterSpacing: '.04em',
            }}
          >
            {l}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--f-mono)', fontSize: 11, opacity: .3, color: 'var(--paper)', alignSelf: 'center' }}>
          {filtered.length} partido{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Match list */}
      <div style={{ borderRadius: 12, border: '1px solid rgba(246,239,217,0.08)', overflow: 'hidden' }}>
        {filtered.map(m => (
          <MatchRow key={m.id} match={m} onSave={handleSave} />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 13, opacity: .3, color: 'var(--paper)' }}>
            No hay partidos con este filtro.
          </div>
        )}
      </div>
    </div>
  )
}
