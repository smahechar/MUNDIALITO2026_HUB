import random
import uuid
from datetime import datetime, timezone

from db.database import SessionLocal
from db.models import Sticker, UserSticker, User, Nation, Trade


def _get_user(db, email):
    return db.query(User).filter(User.email == email.lower()).first()


def get_album(email: str):
    db = SessionLocal()
    try:
        user = _get_user(db, email)
        if not user:
            return {
                "total": 0,
                "owned": 0,
                "duplicates": 0,
                "stickers": [],
                "nations": [],
            }

        stickers = db.query(Sticker).all()
        owned_rows = (
            db.query(UserSticker)
            .filter(UserSticker.user_id == user.id)
            .all()
        )

        owned_map = {row.sticker_id: row.count for row in owned_rows}

        total = len(stickers)
        owned = sum(1 for s in stickers if owned_map.get(s.id, 0) > 0)
        duplicates = sum(max(count - 1, 0) for count in owned_map.values())

        sticker_items = []
        for s in stickers:
            count = owned_map.get(s.id, 0)
            sticker_items.append({
                "id": s.id,
                "num": s.num,
                "nation": s.nation,
                "slot": s.slot,
                "name": s.name,
                "shortName": s.short_name,
                "type": s.type,
                "rarity": s.rarity,
                "count": count,
                "owned": count > 0,
                "duplicate": count > 1,
            })

        nations = db.query(Nation).all()
        nation_items = []

        for n in nations:
            nation_stickers = [s for s in stickers if s.nation == n.code]
            nation_total = len(nation_stickers)
            nation_owned = sum(
                1 for s in nation_stickers
                if owned_map.get(s.id, 0) > 0
            )

            nation_items.append({
                "code": n.code,
                "name": n.name,
                "total": nation_total,
                "owned": nation_owned,
                "percent": round((nation_owned / nation_total) * 100) if nation_total else 0,
            })

        return {
            "total": total,
            "owned": owned,
            "duplicates": duplicates,
            "percent": round((owned / total) * 100) if total else 0,
            "stickers": sticker_items,
            "nations": nation_items,
        }

    finally:
        db.close()


def open_pack(email: str):
    db = SessionLocal()
    try:
        user = _get_user(db, email)
        if not user:
            return {"detail": "Usuario no encontrado"}, 404

        stickers = db.query(Sticker).all()
        if not stickers:
            return {"detail": "No hay stickers cargados"}, 400

        selected = random.sample(stickers, min(5, len(stickers)))
        result = []

        for s in selected:
            row = (
                db.query(UserSticker)
                .filter(
                    UserSticker.user_id == user.id,
                    UserSticker.sticker_id == s.id,
                )
                .first()
            )

            is_new = False

            if row:
                row.count += 1
                row.updated_at = datetime.now(timezone.utc)
            else:
                row = UserSticker(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    sticker_id=s.id,
                    count=1,
                    updated_at=datetime.now(timezone.utc),
                )
                db.add(row)
                is_new = True

            result.append({
                "id": s.id,
                "num": s.num,
                "nation": s.nation,
                "name": s.name,
                "shortName": s.short_name,
                "type": s.type,
                "rarity": s.rarity,
                "isNew": is_new,
                "count": row.count,
            })

        db.commit()

        return {
            "success": True,
            "stickers": result,
        }

    except Exception as e:
        db.rollback()
        return {"detail": str(e)}, 500

    finally:
        db.close()


def get_offers(email: str):
    db = SessionLocal()
    try:
        user = _get_user(db, email)
        if not user:
            return []

        trades = (
            db.query(Trade)
            .filter(
                (Trade.proposer_id == user.id) |
                (Trade.receiver_id == user.id)
            )
            .all()
        )

        return [
            {
                "id": t.id,
                "proposerId": t.proposer_id,
                "receiverId": t.receiver_id,
                "offered": t.offered,
                "requested": t.requested,
                "status": t.status,
                "createdAt": t.created_at.isoformat() if t.created_at else None,
                "updatedAt": t.updated_at.isoformat() if t.updated_at else None,
            }
            for t in trades
        ]

    finally:
        db.close()


def create_trade(email: str, payload: dict):
    db = SessionLocal()
    try:
        user = _get_user(db, email)
        if not user:
            return {"detail": "Usuario no encontrado"}, 404

        trade = Trade(
            id=str(uuid.uuid4()),
            proposer_id=user.id,
            receiver_id=payload.get("receiverId"),
            offered=payload.get("offered", []),
            requested=payload.get("requested", []),
            status="pending",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        db.add(trade)
        db.commit()

        return {
            "success": True,
            "id": trade.id,
            "status": trade.status,
        }

    except Exception as e:
        db.rollback()
        return {"detail": str(e)}, 500

    finally:
        db.close()