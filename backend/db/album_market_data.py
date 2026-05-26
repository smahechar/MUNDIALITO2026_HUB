import uuid
from datetime import datetime, timezone

from db.database import SessionLocal
from db.models import (
    User,
    Sticker,
    UserSticker,
    AlbumTradeListing,
    AlbumTradeOffer,
)


def _now():
    return datetime.now(timezone.utc)


def _get_user(db, email: str):
    return db.query(User).filter(User.email == email.lower()).first()


def _sticker_to_dict(sticker: Sticker | None):
    if not sticker:
        return None

    return {
        "id": sticker.id,
        "num": sticker.num,
        "nation": sticker.nation,
        "slot": sticker.slot,
        "name": sticker.name,
        "shortName": sticker.short_name,
        "type": sticker.type,
        "rarity": sticker.rarity,
    }


def _user_to_public_dict(user: User | None):
    if not user:
        return None

    return {
        "id": user.id,
        "email": user.email,
        "handle": user.handle,
        "name": getattr(user, "name", None) or getattr(user, "username", None) or user.email,
    }


def _get_user_sticker_row(db, user_id: str, sticker_id: str, lock: bool = False):
    query = db.query(UserSticker).filter(
        UserSticker.user_id == user_id,
        UserSticker.sticker_id == sticker_id,
    )

    if lock:
        query = query.with_for_update()

    return query.first()


def _user_has_count(db, user_id: str, sticker_id: str, minimum: int):
    row = _get_user_sticker_row(db, user_id, sticker_id)
    return row and int(row.count or 0) >= minimum


def _increment_sticker(db, user_id: str, sticker_id: str, amount: int = 1):
    row = _get_user_sticker_row(db, user_id, sticker_id, lock=True)

    if row:
        row.count = int(row.count or 0) + amount
        row.updated_at = _now()
        return row

    row = UserSticker(
        id=str(uuid.uuid4()),
        user_id=user_id,
        sticker_id=sticker_id,
        count=amount,
        updated_at=_now(),
    )
    db.add(row)
    db.flush()
    return row


def _decrement_sticker(db, user_id: str, sticker_id: str, amount: int = 1):
    row = _get_user_sticker_row(db, user_id, sticker_id, lock=True)

    if not row or int(row.count or 0) < amount:
        return False

    row.count = int(row.count or 0) - amount
    row.updated_at = _now()
    return True


def _listing_to_dict(listing: AlbumTradeListing, include_offers: bool = False):
    data = {
        "id": listing.id,
        "ownerId": listing.owner_id,
        "owner": _user_to_public_dict(listing.owner),
        "offeredStickerId": listing.offered_sticker_id,
        "requestedStickerId": listing.requested_sticker_id,
        "offeredSticker": _sticker_to_dict(listing.offered_sticker),
        "requestedSticker": _sticker_to_dict(listing.requested_sticker),
        "title": listing.title,
        "note": listing.note,
        "status": listing.status,
        "createdAt": listing.created_at.isoformat() if listing.created_at else None,
        "updatedAt": listing.updated_at.isoformat() if listing.updated_at else None,
        "completedAt": listing.completed_at.isoformat() if listing.completed_at else None,
    }

    if include_offers:
        data["offers"] = [_offer_to_dict(o) for o in getattr(listing, "offers", [])]

    return data


def _offer_to_dict(offer: AlbumTradeOffer):
    return {
        "id": offer.id,
        "listingId": offer.listing_id,
        "bidderId": offer.bidder_id,
        "bidder": _user_to_public_dict(offer.bidder),
        "offeredStickerId": offer.offered_sticker_id,
        "offeredSticker": _sticker_to_dict(offer.offered_sticker),
        "message": offer.message,
        "status": offer.status,
        "createdAt": offer.created_at.isoformat() if offer.created_at else None,
        "updatedAt": offer.updated_at.isoformat() if offer.updated_at else None,
        "confirmedAt": offer.confirmed_at.isoformat() if offer.confirmed_at else None,
    }


def get_market_listings(email: str):
    with SessionLocal() as db:
        user = _get_user(db, email)
        if not user:
            return []

        listings = (
            db.query(AlbumTradeListing)
            .filter(AlbumTradeListing.status.in_(["open", "standby"]))
            .order_by(AlbumTradeListing.created_at.desc())
            .all()
        )

        return [_listing_to_dict(l) for l in listings]


def get_my_market(email: str):
    with SessionLocal() as db:
        user = _get_user(db, email)
        if not user:
            return {"listings": [], "offers": []}

        listings = (
            db.query(AlbumTradeListing)
            .filter(AlbumTradeListing.owner_id == user.id)
            .order_by(AlbumTradeListing.created_at.desc())
            .all()
        )

        offers = (
            db.query(AlbumTradeOffer)
            .filter(AlbumTradeOffer.bidder_id == user.id)
            .order_by(AlbumTradeOffer.created_at.desc())
            .all()
        )

        return {
            "listings": [_listing_to_dict(l) for l in listings],
            "offers": [_offer_to_dict(o) for o in offers],
        }


def create_listing(email: str, payload: dict):
    with SessionLocal() as db:
        user = _get_user(db, email)
        if not user:
            return None, "Usuario no encontrado"

        offered_id = payload.get("offeredStickerId")
        requested_id = payload.get("requestedStickerId")

        if not offered_id:
            return None, "Debes seleccionar la lámina que vas a publicar"

        offered_sticker = db.query(Sticker).filter(Sticker.id == offered_id).first()
        if not offered_sticker:
            return None, "La lámina ofrecida no existe"

        if requested_id:
            requested_sticker = db.query(Sticker).filter(Sticker.id == requested_id).first()
            if not requested_sticker:
                return None, "La lámina solicitada no existe"

        # Para publicar, exigimos repetida: count >= 2.
        if not _user_has_count(db, user.id, offered_id, 2):
            return None, "Solo puedes publicar láminas repetidas"

        listing = AlbumTradeListing(
            id=str(uuid.uuid4()),
            owner_id=user.id,
            offered_sticker_id=offered_id,
            requested_sticker_id=requested_id,
            title=payload.get("title") or "Intercambio de lámina",
            note=payload.get("note"),
            status="open",
            created_at=_now(),
            updated_at=_now(),
        )

        db.add(listing)
        db.commit()
        db.refresh(listing)

        return _listing_to_dict(listing), None


def make_offer(email: str, listing_id: str, payload: dict):
    with SessionLocal() as db:
        user = _get_user(db, email)
        if not user:
            return None, "Usuario no encontrado"

        listing = (
            db.query(AlbumTradeListing)
            .filter(AlbumTradeListing.id == listing_id)
            .first()
        )

        if not listing:
            return None, "Publicación no encontrada"

        if listing.status != "open":
            return None, "Esta publicación no está abierta para ofertas"

        if listing.owner_id == user.id:
            return None, "No puedes ofertar en tu propia publicación"

        offered_id = payload.get("offeredStickerId")
        if not offered_id:
            return None, "Debes seleccionar la lámina que quieres ofrecer"

        sticker = db.query(Sticker).filter(Sticker.id == offered_id).first()
        if not sticker:
            return None, "La lámina ofrecida no existe"

        # El ofertante debe tener al menos una copia.
        if not _user_has_count(db, user.id, offered_id, 1):
            return None, "No tienes esa lámina para ofertar"

        offer = AlbumTradeOffer(
            id=str(uuid.uuid4()),
            listing_id=listing.id,
            bidder_id=user.id,
            offered_sticker_id=offered_id,
            message=payload.get("message"),
            status="pending",
            created_at=_now(),
            updated_at=_now(),
        )

        db.add(offer)
        db.commit()
        db.refresh(offer)

        return _offer_to_dict(offer), None


def accept_offer(email: str, offer_id: str):
    with SessionLocal() as db:
        user = _get_user(db, email)
        if not user:
            return None, "Usuario no encontrado"

        offer = db.query(AlbumTradeOffer).filter(AlbumTradeOffer.id == offer_id).first()
        if not offer:
            return None, "Oferta no encontrada"

        listing = db.query(AlbumTradeListing).filter(
            AlbumTradeListing.id == offer.listing_id
        ).first()

        if not listing:
            return None, "Publicación no encontrada"

        if listing.owner_id != user.id:
            return None, "Solo el dueño de la publicación puede aceptar la oferta"

        if listing.status != "open":
            return None, "La publicación ya no está abierta"

        if offer.status != "pending":
            return None, "La oferta ya no está pendiente"

        listing.status = "standby"
        listing.updated_at = _now()

        offer.status = "standby"
        offer.updated_at = _now()

        # Rechaza las demás ofertas pendientes de esa publicación.
        other_offers = db.query(AlbumTradeOffer).filter(
            AlbumTradeOffer.listing_id == listing.id,
            AlbumTradeOffer.id != offer.id,
            AlbumTradeOffer.status == "pending",
        ).all()

        for other in other_offers:
            other.status = "rejected"
            other.updated_at = _now()

        db.commit()
        db.refresh(offer)

        return _offer_to_dict(offer), None


def confirm_offer(email: str, offer_id: str):
    with SessionLocal() as db:
        user = _get_user(db, email)
        if not user:
            return None, "Usuario no encontrado"

        offer = (
            db.query(AlbumTradeOffer)
            .filter(AlbumTradeOffer.id == offer_id)
            .with_for_update()
            .first()
        )

        if not offer:
            return None, "Oferta no encontrada"

        listing = (
            db.query(AlbumTradeListing)
            .filter(AlbumTradeListing.id == offer.listing_id)
            .with_for_update()
            .first()
        )

        if not listing:
            return None, "Publicación no encontrada"

        if offer.bidder_id != user.id:
            return None, "Solo el usuario que hizo la oferta puede confirmar el intercambio"

        if listing.status != "standby" or offer.status != "standby":
            return None, "El intercambio no está en standby"

        owner_id = listing.owner_id
        bidder_id = offer.bidder_id

        owner_sticker_id = listing.offered_sticker_id
        bidder_sticker_id = offer.offered_sticker_id

        # Revalidamos disponibilidad justo antes de cambiar.
        # El dueño debe seguir teniendo la lámina repetida.
        if not _decrement_sticker(db, owner_id, owner_sticker_id, 1):
            db.rollback()
            return None, "El dueño ya no tiene disponible la lámina publicada"

        if not _decrement_sticker(db, bidder_id, bidder_sticker_id, 1):
            db.rollback()
            return None, "Ya no tienes disponible la lámina ofertada"

        _increment_sticker(db, owner_id, bidder_sticker_id, 1)
        _increment_sticker(db, bidder_id, owner_sticker_id, 1)

        listing.status = "completed"
        listing.completed_at = _now()
        listing.updated_at = _now()

        offer.status = "confirmed"
        offer.confirmed_at = _now()
        offer.updated_at = _now()

        db.commit()
        db.refresh(offer)

        return {
            "success": True,
            "listing": _listing_to_dict(listing),
            "offer": _offer_to_dict(offer),
        }, None


def cancel_listing(email: str, listing_id: str):
    with SessionLocal() as db:
        user = _get_user(db, email)
        if not user:
            return None, "Usuario no encontrado"

        listing = db.query(AlbumTradeListing).filter(
            AlbumTradeListing.id == listing_id
        ).first()

        if not listing:
            return None, "Publicación no encontrada"

        if listing.owner_id != user.id:
            return None, "Solo el dueño puede cancelar esta publicación"

        if listing.status not in ["open", "standby"]:
            return None, "Esta publicación ya no se puede cancelar"

        listing.status = "cancelled"
        listing.updated_at = _now()

        offers = db.query(AlbumTradeOffer).filter(
            AlbumTradeOffer.listing_id == listing.id,
            AlbumTradeOffer.status.in_(["pending", "standby"]),
        ).all()

        for offer in offers:
            offer.status = "cancelled"
            offer.updated_at = _now()

        db.commit()
        db.refresh(listing)

        return _listing_to_dict(listing), None