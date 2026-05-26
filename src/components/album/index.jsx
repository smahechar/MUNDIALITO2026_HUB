import { useEffect, useMemo, useState } from "react"
import { Btn, Eyebrow } from "@/components/shared/atoms"

const cardBase = {
  border: "1px solid rgba(255,255,255,.12)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.035))",
  boxShadow: "0 18px 50px rgba(0,0,0,.35)",
  borderRadius: 22,
}

const goldText = {
  color: "var(--gold, #e8c76a)",
}

function pctOf(owned, total) {
  if (!total || total <= 0) return 0
  return Math.round((owned / total) * 100)
}

export function AlbumProgressBar({
  owned = 0,
  total = 0,
  missing = 0,
  duplicates = 0,
  pct = 0,
  value,
}) {
  const safePct = Number(value ?? pct ?? 0)

  return (
    <div style={{ marginTop: 22 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 10,
          fontSize: 14,
          opacity: 0.9,
        }}
      >
        <span>
          <strong style={goldText}>{owned}</strong> / {total} láminas
        </span>
        <span>
          {safePct}% completado · {missing} faltantes · {duplicates} repetidas
        </span>
      </div>

      <div
        style={{
          height: 14,
          borderRadius: 999,
          overflow: "hidden",
          background: "rgba(255,255,255,.09)",
          border: "1px solid rgba(255,255,255,.12)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.max(0, Math.min(100, safePct))}%`,
            borderRadius: 999,
            background:
              "linear-gradient(90deg, #c99b35, #f1d47a, #fff1a8)",
            boxShadow: "0 0 24px rgba(241,212,122,.35)",
            transition: "width .35s ease",
          }}
        />
      </div>
    </div>
  )
}

export function NationCard({
  nation,
  stickers = [],
  owned,
  total,
  pct,
  onExpand,
  onClick,
}) {
  const safeTotal = Number(total ?? nation?.total ?? stickers.length ?? 0)
  const safeOwned = Number(
    owned ??
      nation?.owned ??
      stickers.filter((s) => s.owned || s.count > 0).length ??
      0
  )

  const duplicates = Number(
    nation?.duplicates ??
      stickers.filter((s) => s.duplicate || s.count > 1).length ??
      0
  )

  const safePct = Number(
    pct ?? nation?.percent ?? pctOf(safeOwned, safeTotal)
  )

  const complete = safeTotal > 0 && safeOwned === safeTotal
  const handleClick = onExpand || onClick

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        ...cardBase,
        cursor: "pointer",
        color: "inherit",
        textAlign: "left",
        padding: 18,
        minHeight: 170,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top right, rgba(232,199,106,.18), transparent 35%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 13,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              opacity: 0.85,
              fontWeight: 800,
            }}
          >
            <span style={goldText}>{nation?.code}</span>
            <span> · {nation?.group ?? "GRP"}</span>
          </div>

          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(232,199,106,.45)",
              background: "rgba(232,199,106,.08)",
              color: "#f1d47a",
              fontSize: 17,
            }}
          >
            ★
          </div>
        </div>

        <h3
          style={{
            margin: 0,
            fontFamily: "var(--f-display)",
            fontSize: 26,
            lineHeight: 1,
          }}
        >
          {nation?.name}
        </h3>
      </div>

      <div style={{ position: "relative", marginTop: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div>
            {duplicates > 0 && (
              <div
                style={{
                  display: "inline-flex",
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: "rgba(232,199,106,.13)",
                  border: "1px solid rgba(232,199,106,.28)",
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 6,
                }}
              >
                REP·{duplicates}
              </div>
            )}

            {safeTotal > 0 && safeOwned < safeTotal && (
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.75,
                  fontWeight: 700,
                }}
              >
                +{safeTotal - safeOwned} faltantes
              </div>
            )}
          </div>

          <div style={{ textAlign: "right" }}>
            <strong style={{ fontSize: 22 }}>
              {safeOwned}/{safeTotal}
            </strong>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: complete ? "#f1d47a" : "rgba(255,255,255,.75)",
              }}
            >
              {complete ? "COMPLETA ★" : `${safePct}%`}
            </div>
          </div>
        </div>

        <div
          style={{
            height: 8,
            borderRadius: 999,
            overflow: "hidden",
            background: "rgba(255,255,255,.09)",
          }}
        >
          <div
            style={{
              width: `${Math.max(0, Math.min(100, safePct))}%`,
              height: "100%",
              background: complete
                ? "linear-gradient(90deg, #c99b35, #fff1a8)"
                : "linear-gradient(90deg, #7a6330, #e8c76a)",
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    </button>
  )
}

export function StickerCard({
  sticker,
  size = "md",
  showCount = true,
  clickable = false,
  onClick,
  owned,
  dupe,
  count,
}) {
  const realCount = Number(count ?? sticker?.count ?? 0)
  const realOwned = Boolean(owned ?? sticker?.owned ?? realCount > 0)
  const realDupe = Boolean(dupe ?? sticker?.duplicate ?? realCount > 1)

  const width = size === "sm" ? 88 : 118
  const height = size === "sm" ? 126 : 166

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onClick}
      style={{
        width,
        minHeight: height,
        border: realOwned
          ? "1px solid rgba(232,199,106,.55)"
          : "1px dashed rgba(255,255,255,.18)",
        borderRadius: 18,
        background: realOwned
          ? "linear-gradient(160deg, rgba(232,199,106,.20), rgba(255,255,255,.06))"
          : "linear-gradient(160deg, rgba(255,255,255,.045), rgba(255,255,255,.02))",
        color: "inherit",
        padding: 10,
        cursor: clickable ? "pointer" : "default",
        boxShadow: realOwned
          ? "0 14px 34px rgba(232,199,106,.12)"
          : "none",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      <div
        style={{
          height: size === "sm" ? 58 : 86,
          borderRadius: 14,
          marginBottom: 10,
          display: "grid",
          placeItems: "center",
          background: realOwned
            ? "radial-gradient(circle, rgba(241,212,122,.32), rgba(0,0,0,.12))"
            : "rgba(255,255,255,.045)",
          fontSize: size === "sm" ? 22 : 32,
          fontWeight: 900,
          color: realOwned ? "#f1d47a" : "rgba(255,255,255,.35)",
        }}
      >
        {realOwned ? "★" : "?"}
      </div>

      <div
        style={{
          fontSize: 11,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          opacity: 0.75,
          fontWeight: 900,
        }}
      >
        {sticker?.code ?? sticker?.id}
      </div>

      <div
        style={{
          fontSize: size === "sm" ? 11 : 13,
          lineHeight: 1.1,
          marginTop: 5,
          fontWeight: 800,
        }}
      >
        {sticker?.name ?? "Sticker"}
      </div>

      {showCount && realOwned && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            padding: "3px 7px",
            borderRadius: 999,
            background: realDupe
              ? "rgba(232,199,106,.95)"
              : "rgba(255,255,255,.14)",
            color: realDupe ? "#141414" : "#fff",
            fontSize: 11,
            fontWeight: 900,
          }}
        >
          x{Math.max(realCount, 1)}
        </div>
      )}
    </button>
  )
}

export function NationModal({
  nation,
  stickers = [],
  isOwned,
  isDupe,
  onClose,
}) {
  const owned = stickers.filter((s) =>
    isOwned ? isOwned(s.id) : s.owned || s.count > 0
  ).length

  const total = stickers.length
  const pct = pctOf(owned, total)
  const complete = total > 0 && owned === total

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,.72)",
        backdropFilter: "blur(10px)",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="gc-card"
        style={{
          ...cardBase,
          width: "min(980px, 96vw)",
          maxHeight: "86vh",
          overflow: "auto",
          padding: 28,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            alignItems: "start",
            marginBottom: 24,
          }}
        >
          <div>
            <Eyebrow>
              {nation?.code} · {nation?.group ?? "GRP"}
            </Eyebrow>
            <h2
              style={{
                fontFamily: "var(--f-display)",
                fontSize: 54,
                margin: "6px 0 0",
              }}
            >
              {nation?.name}
            </h2>
            <p style={{ opacity: 0.8, marginTop: 8 }}>
              {owned}/{total} láminas ·{" "}
              {complete ? "COMPLETA ★" : `${pct}% completado`}
            </p>
          </div>

          <Btn onClick={onClose}>Cerrar</Btn>
        </div>

        <AlbumProgressBar
          owned={owned}
          total={total}
          missing={Math.max(total - owned, 0)}
          duplicates={
            stickers.filter((s) =>
              isDupe ? isDupe(s.id) : s.duplicate || s.count > 1
            ).length
          }
          pct={pct}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
            gap: 16,
            marginTop: 26,
          }}
        >
          {stickers.map((s) => (
            <StickerCard
              key={s.id}
              sticker={s}
              owned={isOwned ? isOwned(s.id) : s.owned || s.count > 0}
              dupe={isDupe ? isDupe(s.id) : s.duplicate || s.count > 1}
              count={s.count}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function PackOpenModal({ pack, stickers = [], onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,.75)",
        backdropFilter: "blur(10px)",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="gc-card"
        style={{
          ...cardBase,
          width: "min(760px, 96vw)",
          padding: 28,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Eyebrow>SOBRE ABIERTO</Eyebrow>
        <h2
          style={{
            fontFamily: "var(--f-display)",
            fontSize: 52,
            margin: "8px 0 18px",
          }}
        >
          Nuevas láminas
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {stickers.map((s) => (
            <StickerCard
              key={s.id}
              sticker={s}
              owned
              count={s.count ?? 1}
              dupe={s.duplicate}
            />
          ))}
        </div>

        <Btn onClick={onClose}>Listo</Btn>
      </div>
    </div>
  )
}

export function ActiveTradesSection({
  trades = [],
  myMarket = { listings: [], offers: [] },
  duplicates = [],
  loading = false,
  onCreate,
  onRefresh,
  onAcceptOffer,
  onConfirmOffer,
}) {
  const visibleDupes = useMemo(() => duplicates.slice(0, 6), [duplicates])

  return (
    <section className="gc-card" style={{ ...cardBase, padding: 28 }}>
      <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <Eyebrow>CASA DE INTERCAMBIOS</Eyebrow>
          <h2
            style={{
              fontFamily: "var(--f-display)",
              fontSize: 42,
              margin: "6px 0 10px",
            }}
          >
            Mercado de láminas
          </h2>
          <p style={{ opacity: 0.75, marginTop: 0 }}>
            Publica una repetida, recibe ofertas, deja el trato en standby y confirma el intercambio.
          </p>
        </div>

        <div className="gc-row gc-gap-sm">
          <Btn onClick={onRefresh}>Actualizar</Btn>
          <Btn onClick={onCreate}>Publicar ficha</Btn>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <Eyebrow>Mis repetidas disponibles</Eyebrow>

        {visibleDupes.length === 0 ? (
          <div
            style={{
              marginTop: 18,
              padding: 18,
              borderRadius: 18,
              background: "rgba(255,255,255,.045)",
              border: "1px solid rgba(255,255,255,.10)",
            }}
          >
            Todavía no tienes repetidas para publicar.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
              gap: 16,
              marginTop: 22,
            }}
          >
            {visibleDupes.map((s) => (
              <StickerCard
                key={s.id}
                sticker={s}
                owned
                dupe
                count={s.count}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 30 }}>
        <Eyebrow>Publicaciones abiertas</Eyebrow>

        {loading ? (
          <p style={{ opacity: 0.7 }}>Cargando mercado…</p>
        ) : trades.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No hay publicaciones abiertas todavía.</p>
        ) : (
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            {trades.map((listing) => (
              <div
                key={listing.id}
                style={{
                  padding: 16,
                  borderRadius: 18,
                  background: "rgba(255,255,255,.045)",
                  border: "1px solid rgba(255,255,255,.10)",
                }}
              >
                <div className="gc-row" style={{ justifyContent: "space-between", gap: 16, alignItems: "center" }}>
                  <div>
                    <strong>{listing.title || "Intercambio"}</strong>
                    <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                      Ofrece: {listing.offeredSticker?.name || listing.offeredStickerId}
                      {" · "}
                      Quiere: {listing.requestedSticker?.name || listing.requestedStickerId || "Escucha ofertas"}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.55, marginTop: 4 }}>
                      Estado: {listing.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 30 }}>
        <Eyebrow>Mis publicaciones</Eyebrow>

        {(myMarket.listings || []).length === 0 ? (
          <p style={{ opacity: 0.7 }}>Aún no has publicado fichas.</p>
        ) : (
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            {myMarket.listings.map((listing) => (
              <div
                key={listing.id}
                style={{
                  padding: 16,
                  borderRadius: 18,
                  background: "rgba(255,255,255,.045)",
                  border: "1px solid rgba(255,255,255,.10)",
                }}
              >
                <strong>{listing.title || "Intercambio"}</strong>
                <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                  {listing.offeredSticker?.name || listing.offeredStickerId}
                  {" → "}
                  {listing.requestedSticker?.name || listing.requestedStickerId || "cualquier oferta"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                  Estado: {listing.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 30 }}>
        <Eyebrow>Mis ofertas hechas</Eyebrow>

        {(myMarket.offers || []).length === 0 ? (
          <p style={{ opacity: 0.7 }}>Todavía no has hecho ofertas.</p>
        ) : (
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            {myMarket.offers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  padding: 16,
                  borderRadius: 18,
                  background: "rgba(255,255,255,.045)",
                  border: "1px solid rgba(255,255,255,.10)",
                }}
              >
                <div className="gc-row" style={{ justifyContent: "space-between", gap: 16, alignItems: "center" }}>
                  <div>
                    <strong>{offer.offeredSticker?.name || offer.offeredStickerId}</strong>
                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                      Estado: {offer.status}
                    </div>
                  </div>

                  {offer.status === "standby" && (
                    <Btn onClick={() => onConfirmOffer?.(offer.id)}>
                      Confirmar intercambio
                    </Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function TradeModal({ duplicates = [], stickers = [], onClose, onCreate }) {
  const [offeredStickerId, setOfferedStickerId] = useState(duplicates[0]?.id || "")
  const [requestedStickerId, setRequestedStickerId] = useState("")
  const [title, setTitle] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!offeredStickerId) {
      alert("Selecciona la ficha repetida que vas a publicar")
      return
    }

    try {
      setSaving(true)

      await onCreate?.({
        offeredStickerId,
        requestedStickerId: requestedStickerId || null,
        title: title || "Intercambio de lámina",
        note: note || null,
      })
    } catch (err) {
      console.error("Error creando publicación:", err)
      alert(err.message || "No se pudo crear la publicación")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,.75)",
        backdropFilter: "blur(10px)",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="gc-card"
        style={{
          ...cardBase,
          width: "min(760px, 96vw)",
          padding: 28,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Eyebrow>CASA DE INTERCAMBIO</Eyebrow>

        <h2
          style={{
            fontFamily: "var(--f-display)",
            fontSize: 48,
            margin: "8px 0 16px",
          }}
        >
          Publicar ficha
        </h2>

        <p style={{ opacity: 0.75 }}>
          Publica una lámina repetida y pide otra a cambio. Otro usuario podrá ofertar y luego confirmar el intercambio.
        </p>

        <div className="gc-col gc-gap-md" style={{ marginTop: 18 }}>
          <label>
            <Eyebrow>Ficha que ofreces</Eyebrow>
            <select
              className="gc-input"
              value={offeredStickerId}
              onChange={(e) => setOfferedStickerId(e.target.value)}
              style={{ width: "100%", marginTop: 8 }}
            >
              {duplicates.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} · {s.name} · tienes {s.count}
                </option>
              ))}
            </select>
          </label>

          <label>
            <Eyebrow>Ficha que quieres recibir</Eyebrow>
            <select
              className="gc-input"
              value={requestedStickerId}
              onChange={(e) => setRequestedStickerId(e.target.value)}
              style={{ width: "100%", marginTop: 8 }}
            >
              <option value="">Escucho ofertas</option>
              {stickers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} · {s.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <Eyebrow>Título</Eyebrow>
            <input
              className="gc-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cambio repetida por una que me falta"
              style={{ width: "100%", marginTop: 8 }}
            />
          </label>

          <label>
            <Eyebrow>Nota</Eyebrow>
            <textarea
              className="gc-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: prefiero jugadores de Colombia o Argentina"
              style={{ width: "100%", marginTop: 8, minHeight: 90 }}
            />
          </label>
        </div>

        <div className="gc-row gc-gap-sm" style={{ justifyContent: "flex-end", marginTop: 24 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn onClick={handleSubmit} disabled={saving}>
            {saving ? "Publicando..." : "Publicar"}
          </Btn>
        </div>
      </div>
    </div>
  )
}
