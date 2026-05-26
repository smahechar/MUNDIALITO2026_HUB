from db.tickets_data import _aware, _ticket_to_dict
from datetime import datetime, timezone
from unittest.mock import MagicMock


def test_aware_adds_timezone_to_naive_datetime():
    naive = datetime(2026, 6, 11, 10, 0, 0)

    result = _aware(naive)

    assert result.tzinfo is not None


def test_aware_keeps_timezone_when_exists():
    aware = datetime(2026, 6, 11, 10, 0, 0, tzinfo=timezone.utc)

    result = _aware(aware)

    assert result == aware


def test_ticket_to_dict_basic_fields():
    ticket = MagicMock()
    ticket.id = "T-1234"
    ticket.user.email = "user@example.com"
    ticket.match_id = "m1"
    ticket.match = None
    ticket.status = "reserved"
    ticket.sector_id = "norte-alto"
    ticket.seat_row = "12"
    ticket.seat_num = 8
    ticket.reserved_at = None
    ticket.confirmed_at = None
    ticket.expires_at = None
    ticket.refunded_at = None
    ticket.transferred_to = None
    ticket.price_usd = 98
    ticket.correlation_id = "tx_test"

    data = _ticket_to_dict(ticket)

    assert data["id"] == "T-1234"
    assert data["matchId"] == "m1"
    assert data["status"] == "reserved"
    assert data["sector"] == "norte-alto"
    assert data["priceUSD"] == 98