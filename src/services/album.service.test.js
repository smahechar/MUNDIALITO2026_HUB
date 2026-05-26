import { beforeEach, describe, expect, it, vi } from 'vitest'
import { albumService } from './album.service'

vi.mock('./api', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from './api'

describe('albumService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('consulta el álbum del usuario', async () => {
    apiFetch.mockResolvedValueOnce({ owned: 10, total: 100 })

    const result = await albumService.getAlbum()

    expect(apiFetch).toHaveBeenCalledWith('/album')
    expect(result.owned).toBe(10)
    expect(result.total).toBe(100)
  })

  it('abre un sobre del álbum', async () => {
    apiFetch.mockResolvedValueOnce({ stickers: [] })

    const result = await albumService.openPack()

    expect(apiFetch).toHaveBeenCalledWith('/album/open-pack', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    expect(result.stickers).toEqual([])
  })

  it('consulta el mercado de intercambios', async () => {
    apiFetch.mockResolvedValueOnce([])

    const result = await albumService.getMarket()

    expect(apiFetch).toHaveBeenCalledWith('/album/market')
    expect(result).toEqual([])
  })

  it('crea una publicación de intercambio', async () => {
    const payload = {
      offeredStickerId: 'ARG-001',
      requestedStickerId: 'BRA-001',
    }

    apiFetch.mockResolvedValueOnce({ id: 'listing-1' })

    const result = await albumService.createListing(payload)

    expect(apiFetch).toHaveBeenCalledWith('/album/market/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    expect(result.id).toBe('listing-1')
  })
})