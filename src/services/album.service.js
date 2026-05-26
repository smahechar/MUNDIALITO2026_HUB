import { apiFetch } from "./api"

export const albumService = {
  getAlbum() {
    return apiFetch("/album")
  },

  openPack() {
    return apiFetch("/album/open-pack", {
      method: "POST",
      body: JSON.stringify({}),
    })
  },

  getOffers() {
    return apiFetch("/album/offers")
  },

  createTrade(payload) {
    return apiFetch("/album/trade", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
}