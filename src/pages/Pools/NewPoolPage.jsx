import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell, PageHeader, Footer } from '@/components/shared/Layout'
import { Btn } from '@/components/shared/atoms'
import { ROUTES } from '@/config/routes'

const HOST_TYPES = ['Universitario', 'Empresa', 'Familia', 'Amigos', 'Global', 'Otro']

const MAX_MEMBERS_OPTIONS = [10, 20, 50, 100, 250, 0] // 0 = sin límite

function generateCode(name) {
  const base = name.toUpperCase().replace(/\s+/g, '').slice(0, 6)
  const num  = Math.floor(Math.random() * 900 + 100)
  return `${base}${num}`
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────
function FieldRow({ label, children, hint }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--f-mono)', letterSpacing: '.12em', opacity: .5, textTransform: 'uppercase', marginBottom: 7 }}>
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: 11, color: 'var(--ink-2)', margin: '5px 0 0', lineHeight: 1.4 }}>{hint}</p>
      )}
    </div>
  )
}

// ─── StepIndicator ────────────────────────────────────────────────────────────
function StepIndicator({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 28 }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            height: 4, borderRadius: 999, transition: 'all .2s',
            flex: i < step ? 1 : (i === step ? 2 : 1),
            background: i < step ? 'var(--green)' : i === step ? 'var(--ink)' : 'var(--rule)',
          }}
        />
      ))}
      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .45, whiteSpace: 'nowrap', flexShrink: 0 }}>
        {step + 1} de {total}
      </span>
    </div>
  )
}

// ─── NewPoolPage ──────────────────────────────────────────────────────────────
export default function NewPoolPage() {
  const navigate = useNavigate()
  const [step,    setStep]  = useState(0)
  const [loading, setLoading] = useState(false)
  const [code,    setCode]  = useState('')

  const [form, setForm] = useState({
    name:       '',
    prize:      '',
    hostType:   'Amigos',
    maxMembers: 50,
    visibility: 'private',
  })

  const [error, setError] = useState('')

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function validateStep0() {
    if (!form.name.trim()) { setError('El nombre de la polla es obligatorio.'); return false }
    if (form.name.length < 3) { setError('El nombre debe tener al menos 3 caracteres.'); return false }
    return true
  }

  function nextStep() {
    if (step === 0 && !validateStep0()) return
    setError('')
    setStep(s => s + 1)
  }

  async function handleCreate() {
    if (loading) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    const generatedCode = generateCode(form.name)
    setCode(generatedCode)
    setStep(2)
    setLoading(false)
  }

  return (
    <PageShell>
      <PageHeader
        kicker="POLLAS · NUEVA"
        title={<>Crear <span style={{ color: 'var(--gold)' }}>polla.</span></>}
        lede="Creá tu polla, invitá a tus amigos con el código generado automáticamente y compite por el premio que vos decidís."
      />

      <div style={{ padding: '24px 56px 0', maxWidth: 600 }}>

        {/* ── Step 0: Basic info ─────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="gc-card" style={{ padding: 32 }}>
            <StepIndicator step={0} total={2} />

            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 36, margin: '0 0 24px', lineHeight: .9 }}>
              Información básica
            </h2>

            <div style={{ display: 'grid', gap: 20 }}>
              <FieldRow label="Nombre de la polla" hint="Este nombre aparecerá en el leaderboard y en las invitaciones.">
                <input
                  className="gc-input"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="ej. Aula 304 · Ingeniería"
                  maxLength={48}
                  autoFocus
                />
                <span style={{ fontSize: 10, opacity: .35, fontFamily: 'var(--f-mono)', float: 'right', marginTop: 4 }}>
                  {form.name.length}/48
                </span>
              </FieldRow>

              <FieldRow label="Premio (opcional)" hint="Descripción libre del premio. Puede ser una cena, un trofeo simbólico, etc.">
                <input
                  className="gc-input"
                  value={form.prize}
                  onChange={e => set('prize', e.target.value)}
                  placeholder="ej. Pizza party para los 3 primeros"
                  maxLength={80}
                />
              </FieldRow>

              <FieldRow label="Tipo de grupo">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {HOST_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => set('hostType', t)}
                      style={{
                        padding: '8px 16px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
                        fontFamily: 'var(--f-sub)', fontWeight: 700,
                        background: form.hostType === t ? 'var(--ink)' : 'var(--paper-2)',
                        color:      form.hostType === t ? 'var(--paper)' : 'var(--ink)',
                        border:     form.hostType === t ? 'none' : '1px solid var(--rule)',
                        transition: 'all .15s',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </FieldRow>
            </div>

            {error && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 16, fontFamily: 'var(--f-mono)' }}>{error}</p>}

            <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
              <Btn kind="ghost" onClick={() => navigate(ROUTES.POOLS)}>Cancelar</Btn>
              <Btn onClick={nextStep}>Continuar →</Btn>
            </div>
          </div>
        )}

        {/* ── Step 1: Settings ───────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="gc-card" style={{ padding: 32 }}>
            <StepIndicator step={1} total={2} />

            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 36, margin: '0 0 24px', lineHeight: .9 }}>
              Configuración
            </h2>

            <div style={{ display: 'grid', gap: 20 }}>
              <FieldRow label="Visibilidad">
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { value: 'private', label: 'Privada',    desc: 'Solo se puede unir con código' },
                    { value: 'public',  label: 'Pública',    desc: 'Aparece en el listado de pollas' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => set('visibility', opt.value)}
                      style={{
                        flex: 1, padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                        border: `2px solid ${form.visibility === opt.value ? 'var(--ink)' : 'var(--rule)'}`,
                        background: form.visibility === opt.value ? 'var(--ink)' : 'var(--paper-2)',
                        color:      form.visibility === opt.value ? 'var(--paper)' : 'var(--ink)',
                        transition: 'all .15s',
                      }}
                    >
                      <div style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 13, marginBottom: 3 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, opacity: .6, fontFamily: 'var(--f-mono)' }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </FieldRow>

              <FieldRow label="Máximo de participantes">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {MAX_MEMBERS_OPTIONS.map(n => (
                    <button
                      key={n}
                      onClick={() => set('maxMembers', n)}
                      style={{
                        padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                        fontFamily: 'var(--f-display)', lineHeight: 1,
                        background: form.maxMembers === n ? 'var(--ink)' : 'var(--paper-2)',
                        color:      form.maxMembers === n ? 'var(--paper)' : 'var(--ink)',
                        border:     form.maxMembers === n ? 'none' : '1px solid var(--rule)',
                        transition: 'all .15s',
                      }}
                    >
                      {n === 0 ? '∞' : n}
                    </button>
                  ))}
                </div>
              </FieldRow>

              <div className="gc-card" style={{ padding: 18, background: 'var(--paper-2)', borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: 'var(--ink-2)', margin: 0, lineHeight: 1.5 }}>
                  <strong>Sistema de puntuación estándar:</strong> Resultado exacto = 30 pts · Diferencia de goles = 15 pts · Ganador acertado = 10 pts. Podés activar el bono Double Down (2×) una vez por polla.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
              <Btn kind="ghost" onClick={() => setStep(0)}>← Atrás</Btn>
              <Btn
                onClick={handleCreate}
                style={loading ? { opacity: .7, pointerEvents: 'none' } : {}}
              >
                {loading ? 'Creando…' : 'Crear polla →'}
              </Btn>
            </div>
          </div>
        )}

        {/* ── Step 2: Success ────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="gc-card" style={{ padding: 36, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: -100, right: -80,
              width: 280, height: 280, borderRadius: '50%',
              background: 'radial-gradient(circle, var(--green), transparent 65%)',
              opacity: .12, filter: 'blur(40px)', pointerEvents: 'none',
            }} />

            <div style={{
              width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px',
              background: 'var(--green)', color: 'var(--green-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--f-display)', fontSize: 32,
            }}>✓</div>

            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 42, lineHeight: .9, margin: '0 0 8px', textTransform: 'uppercase' }}>
              ¡Polla creada!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 28px', lineHeight: 1.5 }}>
              <strong>{form.name}</strong> está lista. Compartí el código con tus participantes para que se unan.
            </p>

            {/* Code display */}
            <div style={{
              padding: '20px 28px', borderRadius: 14, marginBottom: 28,
              background: 'var(--ink)', color: 'var(--paper)',
              display: 'inline-block',
            }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .45, letterSpacing: '.14em', marginBottom: 6 }}>
                CÓDIGO DE INVITACIÓN
              </div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 48, letterSpacing: '.08em', lineHeight: 1 }}>
                {code}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Btn
                kind="ghost"
                onClick={() => {
                  navigator.clipboard?.writeText(code)
                }}
              >
                Copiar código
              </Btn>
              <Btn onClick={() => navigate(ROUTES.POOLS)}>
                Ver mis pollas →
              </Btn>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: 80 }} />
      <Footer />
    </PageShell>
  )
}
