import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageShell, Floodlight } from '@/components/shared/Layout'
import { Flag, Eyebrow, Pill, Btn } from '@/components/shared/atoms'
import { matchesService } from '@/services/matches.service'

// ─── ScoreStepper ──────────────────────────────────────────────────────────────
function ScoreStepper({ value, onChange, label, code, tone = 'default' }) {
  const accent = tone === 'away' ? 'var(--red)' : 'var(--ink)'
  const border = tone === 'away' ? 'var(--red)' : 'var(--ink)'
  return (
    <div className="gc-col" style={{ alignItems: 'center', gap: 12 }}>
      <Eyebrow>{label}</Eyebrow>
      <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
        <Flag code={code} size={36} />
        <span className="gc-mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em' }}>{code}</span>
      </div>
      <div className="gc-row" style={{ alignItems: 'center', gap: 14 }}>
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          style={{
            width: 44, height: 44, borderRadius: 999,
            border: `2px solid ${border}`,
            background: 'transparent', color: 'var(--ink)',
            fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 22,
            cursor: 'pointer', transition: 'background .15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >−</button>

        <span className="gc-score" style={{
          fontSize: 'clamp(60px, 10vw, 96px)', color: accent,
          minWidth: 72, textAlign: 'center', lineHeight: .85,
        }}>{value}</span>

        <button
          onClick={() => onChange(Math.min(15, value + 1))}
          style={{
            width: 44, height: 44, borderRadius: 999,
            border: `2px solid ${border}`,
            background: accent, color: 'var(--paper)',
            fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 22,
            cursor: 'pointer', transition: 'transform .15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >+</button>
      </div>
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = [
    { id: 0, label: 'Marcador' },
    { id: 1, label: 'Confianza' },
    { id: 2, label: 'Listo' },
  ]
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 56px 0', position: 'relative' }}>
      <div className="gc-row" style={{ alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <div key={s.id} className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
            <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
              <span style={{
                width: 28, height: 28, borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: current >= s.id ? 'var(--ink)' : 'transparent',
                color: current >= s.id ? 'var(--paper)' : 'var(--muted)',
                border: current < s.id ? '1.5px dashed var(--rule)' : 'none',
                fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 12,
              }}>{s.id + 1}</span>
              <span className="gc-mono" style={{
                fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase',
                color: current >= s.id ? 'var(--ink)' : 'var(--muted)',
                fontWeight: current === s.id ? 800 : 500,
              }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 60, height: 2, background: current > i ? 'var(--ink)' : 'var(--rule)', margin: '0 16px' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step 1 · marcador ────────────────────────────────────────────────────────
function Step1Scoreline({ home, away, homeScore, awayScore, setHomeScore, setAwayScore, onNext, onCancel }) {
  const suggestions = [
    { h: 2, a: 1, label: 'Tendencia · local fuerte' },
    { h: 1, a: 1, label: 'Empate cómodo' },
    { h: 1, a: 2, label: 'Sorpresa visitante' },
    { h: 0, a: 0, label: 'Pizarra blanca' },
    { h: 3, a: 1, label: 'Goleada local' },
  ]
  return (
    <div className="gc-col gc-gap-md">
      <Eyebrow>STEP 1 · ELIGE EL MARCADOR</Eyebrow>

      <div className="gc-card" style={{ padding: '44px 32px', position: 'relative', overflow: 'hidden' }}>
        <Floodlight size={420} color="var(--gold)" opacity={.18} top={-220} left="40%" blend="multiply" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'center', position: 'relative' }}>
          <ScoreStepper value={homeScore} onChange={setHomeScore} label="LOCAL"     code={home.code} tone="home" />
          <span className="gc-display" style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', color: 'var(--muted)' }}>—</span>
          <ScoreStepper value={awayScore} onChange={setAwayScore} label="VISITANTE" code={away.code} tone="away" />
        </div>
      </div>

      <Eyebrow>↘ PICKS RÁPIDOS · BASADOS EN H2H</Eyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        {suggestions.map((s, i) => {
          const isActive = s.h === homeScore && s.a === awayScore
          return (
            <button key={i} onClick={() => { setHomeScore(s.h); setAwayScore(s.a) }} style={{
              padding: '16px 18px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              background: isActive ? 'var(--ink)' : 'var(--paper)',
              color: isActive ? 'var(--paper)' : 'var(--ink)',
              border: isActive ? '1px solid var(--ink)' : '1px solid var(--rule)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              transition: 'all .15s ease',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--paper-2)' }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'var(--paper)' }}
            >
              <span className="gc-mono" style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .65 }}>{s.label}</span>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 28, lineHeight: 1 }}>{s.h}<span style={{ opacity: .5, padding: '0 6px' }}>—</span>{s.a}</span>
            </button>
          )
        })}
      </div>

      <div className="gc-row" style={{ justifyContent: 'space-between', marginTop: 28, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Btn kind="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn onClick={onNext}>Siguiente · Confianza →</Btn>
      </div>
    </div>
  )
}

// ─── Step 2 · confianza ───────────────────────────────────────────────────────
function Step2Confidence({ home, away, homeScore, awayScore, doubleDown, setDoubleDown, scorerPick, setScorerPick, allScorers, previewPts, onBack, onNext }) {
  const candidates = allScorers.filter(s => s.nation === home.code || s.nation === away.code).slice(0, 6)

  return (
    <div className="gc-col gc-gap-md">
      <Eyebrow>STEP 2 · NIVEL DE CONFIANZA</Eyebrow>

      {/* recap del pick */}
      <div className="gc-card gc-card-ink" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
        <Floodlight size={300} color="var(--gold)" opacity={.25} top={-150} right={-80} />
        <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16, position: 'relative' }}>
          <Eyebrow tone="onDark">↘ TU PICK</Eyebrow>
          <div className="gc-row gc-gap-md" style={{ alignItems: 'baseline' }}>
            <div className="gc-col" style={{ alignItems: 'center' }}>
              <Flag code={home.code} size={26} />
              <span className="gc-mono" style={{ fontSize: 10, opacity: .8, letterSpacing: '.08em', color: 'var(--paper)' }}>{home.code}</span>
            </div>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 52, color: 'var(--gold)' }}>{homeScore}</span>
            <span className="gc-mono" style={{ fontSize: 22, opacity: .5, color: 'var(--paper)' }}>—</span>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 52, color: 'var(--gold)' }}>{awayScore}</span>
            <div className="gc-col" style={{ alignItems: 'center' }}>
              <Flag code={away.code} size={26} />
              <span className="gc-mono" style={{ fontSize: 10, opacity: .8, letterSpacing: '.08em', color: 'var(--paper)' }}>{away.code}</span>
            </div>
          </div>
          <span className="gc-display" style={{ fontSize: 36, color: 'var(--gold)' }}>+{previewPts}</span>
        </div>
      </div>

      {/* double-down toggle */}
      <div className="gc-card gc-hover no-accent" onClick={() => setDoubleDown(!doubleDown)} style={{
        padding: 24, cursor: 'pointer',
        background: doubleDown ? 'var(--gold)' : 'var(--paper)',
        color:      doubleDown ? 'var(--gold-ink)' : 'var(--ink)',
        borderColor: doubleDown ? 'transparent' : 'var(--rule)',
        transition: 'background .2s ease',
      }}>
        <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div className="gc-col" style={{ flex: 1 }}>
            <Eyebrow style={{ color: doubleDown ? 'var(--gold-ink)' : 'var(--muted)', opacity: doubleDown ? .8 : 1 }}>
              ↘ MULTIPLICADOR ×2 · 2 DISPONIBLES
            </Eyebrow>
            <h4 style={{ fontFamily: 'var(--f-display)', fontSize: 38, margin: '8px 0 6px', lineHeight: .9, textTransform: 'uppercase' }}>
              Pick doble
            </h4>
            <p style={{ fontSize: 13, margin: 0, opacity: doubleDown ? .85 : 1 }}>
              Duplica los puntos si aciertas el marcador exacto, la diferencia o el ganador.
            </p>
          </div>
          <div className="gc-col" style={{ alignItems: 'center', textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 999,
              background: doubleDown ? 'var(--ink)' : 'transparent',
              color: doubleDown ? 'var(--gold)' : 'var(--ink)',
              border: doubleDown ? 'none' : '2px dashed var(--rule)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--f-display)', fontSize: 42, lineHeight: 1,
            }}>×2</div>
            <span className="gc-mono" style={{ fontSize: 11, marginTop: 6, letterSpacing: '.1em', opacity: doubleDown ? .8 : .65 }}>
              {doubleDown ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </div>
        </div>
      </div>

      {/* primer goleador */}
      <Eyebrow>↘ BONO · PRIMER GOLEADOR · +20 PTS</Eyebrow>
      {candidates.length === 0 ? (
        <div className="gc-card" style={{ padding: 20 }}>
          <span className="gc-mono" style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '.08em' }}>
            No hay jugadores destacados para este partido todavía.
          </span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {candidates.map(s => {
            const active = scorerPick === s.name
            return (
              <button key={s.name} onClick={() => setScorerPick(active ? null : s.name)} style={{
                padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                background: active ? 'var(--ink)' : 'var(--paper)',
                color:      active ? 'var(--paper)' : 'var(--ink)',
                border: active ? '1px solid var(--ink)' : '1px solid var(--rule)',
                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                transition: 'all .15s ease',
              }}>
                <Flag code={s.nation} size={22} />
                <div className="gc-col" style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</span>
                  <span className="gc-mono" style={{ fontSize: 10, opacity: .65, letterSpacing: '.06em' }}>{s.role} · {s.goals}G {s.assists}A</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div className="gc-row" style={{ justifyContent: 'space-between', marginTop: 28, alignItems: 'center' }}>
        <Btn kind="ghost" onClick={onBack}>← Volver</Btn>
        <Btn onClick={onNext}>Lockear pick →</Btn>
      </div>
    </div>
  )
}

// ─── Step 3 · confirmación ────────────────────────────────────────────────────
function Step3Confirmation({ match, home, away, homeScore, awayScore, doubleDown, scorerPick, previewPts, onEdit, onClose, onMatchCentre }) {
  return (
    <div className="gc-col gc-gap-md">
      <Eyebrow>STEP 3 · LISTO · TU PICK QUEDÓ LOCKEADO</Eyebrow>

      <div className="gc-card" style={{ padding: 40, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Floodlight size={520} color="var(--gold)" opacity={.22} top={-260} left="30%" blend="multiply" />
        <div style={{ position: 'relative' }}>
          <div className="gc-rise" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Pill tone="ink" style={{ padding: '6px 14px', fontSize: 12, background: 'var(--green)', color: 'var(--green-ink)', borderColor: 'transparent' }}>
              ✓ PREDICCIÓN GUARDADA
            </Pill>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(48px, 7vw, 96px)', margin: '10px 0 0', lineHeight: .85, textTransform: 'uppercase' }}>
              Bloqueada.
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8, maxWidth: 480 }}>
              Tu pick queda registrada en todos tus pools. Se liquida automáticamente al pitazo final.
            </p>
          </div>

          <div className="gc-row" style={{ gap: 32, alignItems: 'center', justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
            <div className="gc-col gc-gap-xs" style={{ alignItems: 'center' }}>
              <Flag code={home.code} size={48} />
              <span className="gc-mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em' }}>{home.code}</span>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(80px, 11vw, 140px)', lineHeight: .85 }}>{homeScore}</span>
            </div>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(40px, 5vw, 72px)', color: 'var(--muted)' }}>—</span>
            <div className="gc-col gc-gap-xs" style={{ alignItems: 'center' }}>
              <Flag code={away.code} size={48} />
              <span className="gc-mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em' }}>{away.code}</span>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(80px, 11vw, 140px)', lineHeight: .85 }}>{awayScore}</span>
            </div>
          </div>

          <div className="gc-row gc-gap-sm" style={{ justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
            {doubleDown && <Pill tone="gold">PICK DOBLE · ×2</Pill>}
            {scorerPick && <Pill tone="ink">PRIMER GOL · {scorerPick}</Pill>}
            <Pill tone="default" style={{ background: 'var(--green)', color: 'var(--green-ink)', borderColor: 'transparent' }}>
              +{previewPts} si aciertas exacto
            </Pill>
          </div>
        </div>
      </div>

      {/* acciones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {[
          { eyebrow: '↘ NEXT',  title: 'Match centre', body: 'Seguí el partido en vivo con timeline, stats y alineaciones.', cta: 'Abrir →',       action: onMatchCentre },
          { eyebrow: '↘ EDIT',  title: 'Cambiar pick', body: 'Podés editar hasta el pitazo inicial. Después queda fijado.',   cta: 'Editar pick',   action: onEdit        },
          { eyebrow: '↘ POOLS', title: 'Volver a pollas', body: 'Mirá tu posición y próximas decisiones en tus pools.',      cta: 'Mis pools →',   action: onClose       },
        ].map(a => (
          <div key={a.title} className="gc-card gc-hover" onClick={a.action} style={{ padding: 24, cursor: 'pointer' }}>
            <Eyebrow>{a.eyebrow}</Eyebrow>
            <h4 style={{ fontFamily: 'var(--f-display)', fontSize: 30, margin: '8px 0 8px', lineHeight: .9 }}>{a.title}</h4>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>{a.body}</p>
            <span className="gc-link" style={{ marginTop: 12, display: 'inline-block' }}>{a.cta}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function PredictPage() {
  const { id: matchId } = useParams()
  const navigate = useNavigate()

  const [match, setMatch]       = useState(null)
  const [scorers, setScorers]   = useState([])
  const [loading, setLoading]   = useState(true)

  const [step, setStep]           = useState(0)
  const [homeScore, setHomeScore] = useState(1)
  const [awayScore, setAwayScore] = useState(0)
  const [doubleDown, setDoubleDown] = useState(false)
  const [scorerPick, setScorerPick] = useState(null)

  useEffect(() => {
    Promise.all([
      matchesService.getById(matchId),
      matchesService.getScorers(),
    ]).then(([m, s]) => { setMatch(m); setScorers(s) })
      .finally(() => setLoading(false))
  }, [matchId])

  const previewPts = doubleDown ? 60 : 30

  if (loading) return (
    <PageShell>
      <div style={{ padding: '80px 56px', textAlign: 'center', color: 'var(--muted)' }}>Cargando…</div>
    </PageShell>
  )

  if (!match) return (
    <PageShell>
      <div style={{ padding: '80px 56px', textAlign: 'center' }}>
        <Eyebrow>MATCH NOT FOUND</Eyebrow>
        <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 64, margin: '10px 0', lineHeight: .85 }}>Match no encontrado.</h2>
        <Btn onClick={() => navigate('/fixture')}>← Fixture</Btn>
      </div>
    </PageShell>
  )

  // home/away nation objects — match.home / match.away son códigos como "ATL"
  const homeNation = { code: match.home, name: match.home }
  const awayNation = { code: match.away, name: match.away }
  const isLocked = match.status !== 'upcoming'

  return (
    <PageShell>
      {/* breadcrumb */}
      <div style={{ padding: '20px 56px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div className="gc-row gc-gap-sm">
          <span className="gc-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/pools')}>← Pollas</span>
          <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>
            / PREDECIR · {matchId.toUpperCase()}
          </span>
        </div>
        <span className="gc-link" style={{ cursor: 'pointer' }} onClick={() => navigate(`/match/${matchId}`)}>
          Ver match centre →
        </span>
      </div>

      {/* hero */}
      <section className="bc-hero-stage" style={{ paddingBottom: 24 }}>
        <Floodlight size={620} color="color-mix(in oklab, var(--gold) 60%, transparent)" opacity={.3} top={-260} left="30%" blend="multiply" />
        <Floodlight size={420} color="color-mix(in oklab, var(--red)  55%, transparent)" opacity={.25} top={-180} right={-100} blend="multiply" />

        <div style={{ padding: '20px 56px 0', position: 'relative' }}>
          <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
            <Eyebrow>↘ PREDICCIÓN · {match.phase}</Eyebrow>
            <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.1em' }}>{match.stadium}</span>
          </div>
          <div className="gc-row" style={{ alignItems: 'center', gap: 20, marginTop: 12, marginBottom: 6, flexWrap: 'wrap' }}>
            <Flag code={match.home} size={40} />
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(36px, 5.5vw, 80px)', margin: 0, lineHeight: .85, textTransform: 'uppercase' }}>
              {match.home}
              <span style={{ color: 'var(--muted)', fontSize: '0.55em', padding: '0 14px' }}>×</span>
              {match.away}
            </h1>
            <Flag code={match.away} size={40} />
          </div>

          {isLocked ? (
            <Pill tone="default" style={{ background: 'var(--red)', color: 'var(--red-ink)', borderColor: 'transparent' }}>
              PREDICCIÓN CERRADA
            </Pill>
          ) : (
            <div className="gc-row gc-gap-md" style={{ alignItems: 'center', marginTop: 8 }}>
              <Eyebrow tone="red">↘ CIERRA AL PITAZO</Eyebrow>
            </div>
          )}
        </div>

        <div style={{ padding: '24px 56px 0', position: 'relative' }}>
          <div className="gc-rule-double" />
        </div>

        {/* step indicator */}
        <StepIndicator current={step} />
      </section>

      {/* contenido del step */}
      <div style={{ padding: '32px 56px 0' }}>
        {isLocked ? (
          <div className="gc-card" style={{ padding: 40, textAlign: 'center' }}>
            <Eyebrow tone="red">PREDICCIÓN CERRADA</Eyebrow>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 48, margin: '12px 0', lineHeight: .9, textTransform: 'uppercase' }}>
              El partido ya empezó.
            </h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 440, margin: '0 auto 24px' }}>
              Las predicciones cierran al pitazo inicial. Podés seguir el partido en el match centre.
            </p>
            <div className="gc-row gc-gap-sm" style={{ justifyContent: 'center' }}>
              <Btn kind="ghost" onClick={() => navigate('/pools')}>← Pollas</Btn>
              <Btn onClick={() => navigate(`/match/${matchId}`)}>Match centre →</Btn>
            </div>
          </div>
        ) : step === 0 ? (
          <Step1Scoreline
            home={homeNation} away={awayNation}
            homeScore={homeScore} awayScore={awayScore}
            setHomeScore={setHomeScore} setAwayScore={setAwayScore}
            onNext={() => setStep(1)}
            onCancel={() => navigate('/pools')}
          />
        ) : step === 1 ? (
          <Step2Confidence
            home={homeNation} away={awayNation}
            homeScore={homeScore} awayScore={awayScore}
            doubleDown={doubleDown} setDoubleDown={setDoubleDown}
            scorerPick={scorerPick} setScorerPick={setScorerPick}
            allScorers={scorers}
            previewPts={previewPts}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        ) : (
          <Step3Confirmation
            match={match} home={homeNation} away={awayNation}
            homeScore={homeScore} awayScore={awayScore}
            doubleDown={doubleDown} scorerPick={scorerPick}
            previewPts={previewPts}
            onEdit={() => setStep(0)}
            onClose={() => navigate('/pools')}
            onMatchCentre={() => navigate(`/match/${matchId}`)}
          />
        )}
      </div>
    </PageShell>
  )
}
