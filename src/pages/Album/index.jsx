import { useEffect, useMemo, useState } from "react"
import { albumService } from "../../services/album.service"
import { PageShell, Floodlight, Watermark } from "@/components/shared/Layout"
import { Eyebrow, Btn, SectionHead } from "@/components/shared/atoms"

import {
  AlbumProgressBar,
  NationCard,
  StickerCard,
  ActiveTradesSection,
  NationModal,
  PackOpenModal,
  TradeModal,
} from "@/components/album"

export default function AlbumPage() {
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [openingPack, setOpeningPack] = useState(false)
  const [lastPack, setLastPack] = useState(null)

  const [selectedNation, setSelectedNation] = useState(null)
  const [packModalOpen, setPackModalOpen] = useState(false)
  const [tradeModalOpen, setTradeModalOpen] = useState(false)

  const [market, setMarket] = useState([])
  const [myMarket, setMyMarket] = useState({
    listings: [],
    offers: [],
  })
  const [marketLoading, setMarketLoading] = useState(false)

  async function loadAlbum() {
    try {
      setLoading(true)
      setError("")

      const data = await albumService.getAlbum()
      setAlbum(data)
    } catch (err) {
      console.error("Error cargando álbum:", err)
      setError(err.message || "No se pudo cargar el álbum")
    } finally {
      setLoading(false)
    }
  }

  async function loadMarket() {
    try {
      setMarketLoading(true)

      const [marketData, myMarketData] = await Promise.all([
        albumService.getMarket(),
        albumService.getMyMarket(),
      ])

      setMarket(Array.isArray(marketData) ? marketData : [])
      setMyMarket(myMarketData || { listings: [], offers: [] })
    } catch (err) {
      console.error("Error cargando mercado:", err)
    } finally {
      setMarketLoading(false)
    }
  }

  async function handleOpenPack() {
    try {
      setOpeningPack(true)
      setError("")

      const pack = await albumService.openPack()
      setLastPack(pack)
      setPackModalOpen(true)

      await loadAlbum()
      await loadMarket()
    } catch (err) {
      console.error("Error abriendo sobre:", err)
      setError(err.message || "No se pudo abrir el sobre")
    } finally {
      setOpeningPack(false)
    }
  }

  useEffect(() => {
    loadAlbum()
    loadMarket()
  }, [])

  const stickers = Array.isArray(album?.stickers) ? album.stickers : []
  const nationProgress = Array.isArray(album?.nations) ? album.nations : []

  const albumTotal = Number(album?.total ?? 0)
  const albumOwned = Number(album?.owned ?? 0)
  const albumDuplicates = Number(album?.duplicates ?? 0)
  const albumPct = Number(album?.percent ?? 0)
  const albumMissing = Math.max(albumTotal - albumOwned, 0)

  const dupeStickers = useMemo(() => {
    return stickers.filter((s) => Number(s.count ?? 0) > 1 || s.duplicate)
  }, [stickers])

  function getNationStickersReal(code) {
    return stickers.filter((s) => s.nation === code)
  }

  function isOwnedReal(stickerId) {
    const sticker = stickers.find((s) => s.id === stickerId)
    return Boolean(sticker?.owned || Number(sticker?.count ?? 0) > 0)
  }

  function isDupeReal(stickerId) {
    const sticker = stickers.find((s) => s.id === stickerId)
    return Boolean(sticker?.duplicate || Number(sticker?.count ?? 0) > 1)
  }

  if (loading) {
    return (
      <PageShell>
        <div className="gc-card" style={{ padding: 28 }}>
          <Eyebrow>ÁLBUM</Eyebrow>
          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: 54,
              margin: 0,
            }}
          >
            Cargando álbum...
          </h1>
          <p>Consultando datos desde la base de datos.</p>
        </div>
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell>
        <div className="gc-card" style={{ padding: 28 }}>
          <Eyebrow>ERROR</Eyebrow>
          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: 54,
              margin: 0,
            }}
          >
            No se pudo cargar el álbum
          </h1>
          <p>{error}</p>
          <Btn onClick={loadAlbum}>Reintentar</Btn>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Floodlight />
      <Watermark text="ALBUM" />

      <div className="gc-col gc-gap-xl">
        <section className="gc-card" style={{ padding: 28 }}>
          <Eyebrow>ÁLBUM OFICIAL</Eyebrow>

          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: 64,
              margin: 0,
            }}
          >
            Álbum
          </h1>

          <p>
            Progreso real del servidor: {albumOwned}/{albumTotal} láminas.
          </p>

          <AlbumProgressBar
            owned={albumOwned}
            total={albumTotal}
            missing={albumMissing}
            duplicates={albumDuplicates}
            pct={albumPct}
            value={albumPct}
          />

          <div
            className="gc-row gc-gap-md"
            style={{
              marginTop: 18,
              flexWrap: "wrap",
            }}
          >
            <div className="gc-card" style={{ padding: 16 }}>
              <Eyebrow>Total</Eyebrow>
              <strong>{albumTotal}</strong>
            </div>

            <div className="gc-card" style={{ padding: 16 }}>
              <Eyebrow>Obtenidas</Eyebrow>
              <strong>{albumOwned}</strong>
            </div>

            <div className="gc-card" style={{ padding: 16 }}>
              <Eyebrow>Faltantes</Eyebrow>
              <strong>{albumMissing}</strong>
            </div>

            <div className="gc-card" style={{ padding: 16 }}>
              <Eyebrow>Duplicadas</Eyebrow>
              <strong>{albumDuplicates}</strong>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <Btn onClick={handleOpenPack} disabled={openingPack}>
              {openingPack ? "Abriendo..." : "Abrir sobre"}
            </Btn>
          </div>
        </section>

        <section>
          <SectionHead
            eyebrow="COLECCIÓN"
            title="Progreso por selección"
            desc="Datos calculados desde MySQL."
          />

          <div className="gc-grid">
            {nationProgress.map((nation) => (
              <NationCard
                key={nation.code}
                nation={nation}
                stickers={getNationStickersReal(nation.code)}
                owned={nation.owned}
                total={nation.total}
                pct={nation.percent}
                onExpand={() => setSelectedNation(nation)}
              />
            ))}
          </div>
        </section>

        <section className="gc-card" style={{ padding: 28 }}>
          <SectionHead
            eyebrow="LÁMINAS"
            title="Mis stickers"
            desc="Láminas reales asociadas al usuario autenticado."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 16,
              alignItems: "start",
              marginTop: 24,
            }}
          >
            {stickers.map((sticker) => (
              <div
                key={sticker.id}
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <StickerCard
                  sticker={sticker}
                  owned={isOwnedReal(sticker.id)}
                  dupe={isDupeReal(sticker.id)}
                  count={sticker.count}
                />
              </div>
            ))}
          </div>
        </section>

        <ActiveTradesSection
          trades={market}
          myMarket={myMarket}
          duplicates={dupeStickers}
          loading={marketLoading}
          onCreate={() => setTradeModalOpen(true)}
          onRefresh={loadMarket}
          onAcceptOffer={async (offerId) => {
            await albumService.acceptOffer(offerId)
            await loadMarket()
          }}
          onConfirmOffer={async (offerId) => {
            await albumService.confirmOffer(offerId)
            await loadAlbum()
            await loadMarket()
          }}
        />
      </div>

      {selectedNation && (
        <NationModal
          nation={selectedNation}
          stickers={getNationStickersReal(selectedNation.code)}
          isOwned={isOwnedReal}
          isDupe={isDupeReal}
          onClose={() => setSelectedNation(null)}
        />
      )}

      {packModalOpen && lastPack && (
        <PackOpenModal
          pack={lastPack}
          stickers={lastPack.stickers || []}
          onClose={() => setPackModalOpen(false)}
        />
      )}

      {tradeModalOpen && (
        <TradeModal
          duplicates={dupeStickers}
          stickers={stickers}
          onClose={() => setTradeModalOpen(false)}
          onCreate={async (payload) => {
            await albumService.createListing(payload)
            setTradeModalOpen(false)
            await loadMarket()
          }}
        />
      )}
    </PageShell>
  )
}