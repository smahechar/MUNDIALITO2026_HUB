"""
Adaptador de pagos — Mundialito 2026 Hub.

El PDF exige: "Los pagos deberán realizarse de forma simulada con wiremock
(estableciendo un contrato – API – detallado y con reglas para su consumo)
o puede hacer uso de ambientes de prueba de Stripe o MercadoPago."

Este módulo implementa el patrón Adapter:
  - `PaymentProvider`     : interfaz.
  - `MockPaymentProvider` : default, valida tarjetas con reglas tipo Stripe-test.
  - `StripePaymentProvider`: stub que se activa si `STRIPE_SECRET_KEY` está en env.

──────────────────────────────────────────────────────────────────────────────
                             CONTRATO DE PAGO (v1)
──────────────────────────────────────────────────────────────────────────────

Entrada (`charge`):
  amount_usd : float          (monto en USD, >0)
  currency   : str            (siempre "USD" en MVP)
  card       : dict
    number   : str            (13–19 dígitos, espacios permitidos)
    exp_month: int            (1–12)
    exp_year : int            (>= año actual)
    cvc      : str            (3–4 dígitos)
  correlation_id : str | None

Salida (`PaymentResult` dataclass):
  status       : "succeeded" | "failed"
  code         : "ok" | "card_declined" | "insufficient_funds" |
                 "expired_card" | "incorrect_cvc" | "processing_error"
  provider     : "mock" | "stripe"
  provider_ref : str          (id externo, ej "pi_3PqK…")
  last4        : str
  brand        : str          ("visa"|"mastercard"|"amex"|"unknown")
  amount_usd   : float
  currency     : str
  failure_reason : str | None

Tarjetas de prueba (compatible con Stripe testing):
  4242 4242 4242 4242 → succeeded
  4000 0000 0000 0002 → failed · card_declined
  4000 0000 0000 9995 → failed · insufficient_funds
  4000 0000 0000 0069 → failed · expired_card
  4000 0000 0000 0127 → failed · incorrect_cvc

Cualquier otra tarjeta válida (Luhn) → succeeded.
Tarjeta inválida (Luhn falla, fecha vencida, CVC inválido) → failed.
──────────────────────────────────────────────────────────────────────────────
"""

import os
import re
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Protocol


# ─── Resultado ───────────────────────────────────────────────────────────────

@dataclass
class PaymentResult:
    status: str            # "succeeded" | "failed"
    code: str              # "ok" | "card_declined" | …
    provider: str          # "mock" | "stripe"
    provider_ref: str
    last4: str
    brand: str
    amount_usd: float
    currency: str
    failure_reason: str | None = None

    def to_dict(self) -> dict:
        return asdict(self)


# ─── Interfaz ────────────────────────────────────────────────────────────────

class PaymentProvider(Protocol):
    def charge(
        self,
        amount_usd: float,
        currency: str,
        card: dict,
        correlation_id: str | None = None,
    ) -> PaymentResult: ...


# ─── Helpers de validación ───────────────────────────────────────────────────

_TEST_CARDS = {
    "4242424242424242": ("succeeded",  "ok",                  None),
    "4000000000000002": ("failed",     "card_declined",       "Tu tarjeta fue rechazada."),
    "4000000000009995": ("failed",     "insufficient_funds",  "Fondos insuficientes."),
    "4000000000000069": ("failed",     "expired_card",        "La tarjeta esta vencida."),
    "4000000000000127": ("failed",     "incorrect_cvc",       "CVC incorrecto."),
}


def _digits_only(s: str) -> str:
    return re.sub(r"\D", "", s or "")


def _luhn_ok(number: str) -> bool:
    """Algoritmo de Luhn para validar # de tarjeta."""
    digits = [int(c) for c in number if c.isdigit()]
    if len(digits) < 12:
        return False
    checksum = 0
    parity  = len(digits) % 2
    for i, d in enumerate(digits):
        if i % 2 == parity:
            d *= 2
            if d > 9:
                d -= 9
        checksum += d
    return checksum % 10 == 0


def _detect_brand(number: str) -> str:
    if not number:
        return "unknown"
    if number.startswith("4"):
        return "visa"
    if number[:2] in ("51", "52", "53", "54", "55") or 2221 <= int(number[:4] or 0) <= 2720:
        return "mastercard"
    if number[:2] in ("34", "37"):
        return "amex"
    return "unknown"


def _validate_card_shape(card: dict) -> tuple[str, str | None]:
    """Devuelve (failure_code, failure_reason) o ('', None) si OK."""
    if not isinstance(card, dict):
        return "processing_error", "Datos de tarjeta requeridos."

    number = _digits_only(str(card.get("number", "")))
    cvc    = _digits_only(str(card.get("cvc", "")))
    try:
        exp_month = int(card.get("expMonth") or card.get("exp_month") or 0)
        exp_year  = int(card.get("expYear")  or card.get("exp_year")  or 0)
    except (TypeError, ValueError):
        return "processing_error", "Fecha de vencimiento invalida."

    if not (13 <= len(number) <= 19):
        return "card_declined", "Numero de tarjeta invalido."

    if not _luhn_ok(number):
        return "card_declined", "Numero de tarjeta invalido."

    if not (1 <= exp_month <= 12):
        return "expired_card", "Mes de vencimiento invalido."

    # Acepta exp_year de 2 o 4 dígitos
    if exp_year < 100:
        exp_year += 2000
    now = datetime.now(timezone.utc)
    if (exp_year, exp_month) < (now.year, now.month):
        return "expired_card", "La tarjeta esta vencida."

    if not (3 <= len(cvc) <= 4):
        return "incorrect_cvc", "CVC invalido."

    return "", None


# ─── Mock Provider (default) ─────────────────────────────────────────────────

class MockPaymentProvider:
    """
    Cumple el contrato sin conexión externa. Determinista según el #tarjeta.
    Reglas: ver `_TEST_CARDS` y _validate_card_shape.
    """

    name = "mock"

    def charge(
        self,
        amount_usd: float,
        currency: str,
        card: dict,
        correlation_id: str | None = None,
    ) -> PaymentResult:
        provider_ref = f"pay_mock_{uuid.uuid4().hex[:14]}"
        number = _digits_only(str(card.get("number", "")))
        last4  = number[-4:] if len(number) >= 4 else "????"
        brand  = _detect_brand(number)

        if amount_usd <= 0:
            return PaymentResult(
                status="failed", code="processing_error",
                provider=self.name, provider_ref=provider_ref,
                last4=last4, brand=brand,
                amount_usd=amount_usd, currency=currency,
                failure_reason="Monto invalido.",
            )

        # 1) Tarjetas de prueba con resultado forzado
        if number in _TEST_CARDS:
            status, code, reason = _TEST_CARDS[number]
            return PaymentResult(
                status=status, code=code,
                provider=self.name, provider_ref=provider_ref,
                last4=last4, brand=brand,
                amount_usd=amount_usd, currency=currency,
                failure_reason=reason,
            )

        # 2) Validaciones de forma (Luhn, fecha, CVC)
        bad_code, bad_reason = _validate_card_shape(card)
        if bad_code:
            return PaymentResult(
                status="failed", code=bad_code,
                provider=self.name, provider_ref=provider_ref,
                last4=last4, brand=brand,
                amount_usd=amount_usd, currency=currency,
                failure_reason=bad_reason,
            )

        # 3) Cualquier otra tarjeta válida → success
        return PaymentResult(
            status="succeeded", code="ok",
            provider=self.name, provider_ref=provider_ref,
            last4=last4, brand=brand,
            amount_usd=amount_usd, currency=currency,
            failure_reason=None,
        )


# ─── Stripe Provider (opcional) ──────────────────────────────────────────────

class StripePaymentProvider:
    """
    Stub. Si en una iteración futura se conecta Stripe test mode real,
    instalar `stripe`, importar y reemplazar el método `charge`.
    Por ahora delega al mock pero etiquetando provider="stripe" para que
    los tests E2E con `STRIPE_SECRET_KEY=sk_test_…` sean obvios.
    """

    name = "stripe"

    def __init__(self, api_key: str):
        self.api_key = api_key

    def charge(self, amount_usd, currency, card, correlation_id=None):
        # TODO (v2): reemplazar con `stripe.PaymentIntent.create(...)`
        mock = MockPaymentProvider().charge(amount_usd, currency, card, correlation_id)
        return PaymentResult(
            status=mock.status, code=mock.code,
            provider=self.name,
            provider_ref=f"pi_test_{uuid.uuid4().hex[:14]}",
            last4=mock.last4, brand=mock.brand,
            amount_usd=mock.amount_usd, currency=mock.currency,
            failure_reason=mock.failure_reason,
        )


# ─── Factory ─────────────────────────────────────────────────────────────────

def get_payment_provider() -> PaymentProvider:
    """
    Selecciona provider según env:
      - STRIPE_SECRET_KEY presente y empieza con `sk_test_` → StripePaymentProvider
      - cualquier otro caso → MockPaymentProvider
    """
    sk = os.getenv("STRIPE_SECRET_KEY", "").strip()
    if sk.startswith("sk_test_"):
        return StripePaymentProvider(sk)
    return MockPaymentProvider()
