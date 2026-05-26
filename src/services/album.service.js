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

  getMarket() {
    return apiFetch("/album/market")
  },

  getMyMarket() {
    return apiFetch("/album/market/me")
  },

  createListing(payload) {
    return apiFetch("/album/market/listings", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  makeOffer(listingId, payload) {
    return apiFetch(`/album/market/listings/${listingId}/offers`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  acceptOffer(offerId) {
    return apiFetch(`/album/market/offers/${offerId}/accept`, {
      method: "POST",
      body: JSON.stringify({}),
    })
  },

  confirmOffer(offerId) {
    return apiFetch(`/album/market/offers/${offerId}/confirm`, {
      method: "POST",
      body: JSON.stringify({}),
    })
  },

  cancelListing(listingId) {
    return apiFetch(`/album/market/listings/${listingId}/cancel`, {
      method: "POST",
      body: JSON.stringify({}),
    })
  },
}