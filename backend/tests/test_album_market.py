from unittest.mock import MagicMock

from db.album_market_data import _sticker_to_dict, _user_to_public_dict


def test_sticker_to_dict_returns_none_when_empty():
    assert _sticker_to_dict(None) is None


def test_sticker_to_dict_maps_basic_fields():
    sticker = MagicMock()
    sticker.id = "ARG-001"
    sticker.num = 1
    sticker.nation = "ARG"
    sticker.slot = "player"
    sticker.name = "Lionel Messi"
    sticker.short_name = "Messi"
    sticker.type = "player"
    sticker.rarity = "rare"

    data = _sticker_to_dict(sticker)

    assert data["id"] == "ARG-001"
    assert data["num"] == 1
    assert data["nation"] == "ARG"
    assert data["name"] == "Lionel Messi"
    assert data["shortName"] == "Messi"
    assert data["rarity"] == "rare"


def test_user_to_public_dict_returns_none_when_empty():
    assert _user_to_public_dict(None) is None


def test_user_to_public_dict_maps_user():
    user = MagicMock()
    user.id = "user-001"
    user.email = "test@example.com"
    user.handle = "@tester"
    user.name = "Tester"

    data = _user_to_public_dict(user)

    assert data["id"] == "user-001"
    assert data["email"] == "test@example.com"
    assert data["handle"] == "@tester"
    assert data["name"] == "Tester"