import hashlib
import hmac
import json
from dataclasses import dataclass
from datetime import UTC, datetime
from urllib.parse import parse_qsl

from app.config import settings
from app.shared.errors import AuthenticationError, ValidationAppError


@dataclass(frozen=True)
class NormalizedTelegramUser:
    telegram_id: str
    username: str | None
    first_name: str | None
    last_name: str | None
    photo_url: str | None
    language_code: str | None
    auth_date: datetime | None
    safe_raw_data: dict[str, object]

    @property
    def display_name(self) -> str | None:
        parts = [self.first_name, self.last_name]
        name = " ".join(part for part in parts if part).strip()
        return name or self.username


def validate_telegram_init_data(init_data: str) -> NormalizedTelegramUser:
    if settings.dev_auth_enabled and settings.app_env != "production":
        return _build_dev_user()

    if not init_data:
        raise AuthenticationError("Telegram initData is required")

    pairs = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = pairs.pop("hash", None)
    if not received_hash:
        raise AuthenticationError("Telegram initData hash is missing")

    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(pairs.items()))
    secret_key = hmac.new(
        b"WebAppData",
        settings.telegram_bot_token.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        raise AuthenticationError("Telegram initData hash is invalid")

    auth_date = _parse_auth_date(pairs.get("auth_date"))
    if auth_date is None:
        raise AuthenticationError("Telegram auth_date is required")

    age_seconds = (datetime.now(UTC) - auth_date).total_seconds()
    if age_seconds > settings.telegram_auth_max_age_seconds:
        raise AuthenticationError("Telegram initData is expired")

    user_payload = _parse_user_payload(pairs.get("user"))
    return _build_user_from_payload(user_payload, auth_date, source="telegram")


def _build_dev_user() -> NormalizedTelegramUser:
    payload = {
        "id": settings.dev_telegram_id,
        "username": settings.dev_telegram_username,
        "first_name": settings.dev_telegram_first_name,
    }
    return _build_user_from_payload(payload, datetime.now(UTC), source="dev_mock")


def _parse_auth_date(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromtimestamp(int(value), UTC)
    except ValueError as exc:
        raise ValidationAppError("Telegram auth_date is invalid") from exc


def _parse_user_payload(value: str | None) -> dict[str, object]:
    if not value:
        raise AuthenticationError("Telegram user payload is required")
    try:
        payload = json.loads(value)
    except json.JSONDecodeError as exc:
        raise ValidationAppError("Telegram user payload is invalid") from exc
    if not isinstance(payload, dict):
        raise ValidationAppError("Telegram user payload must be an object")
    return payload


def _build_user_from_payload(
    payload: dict[str, object],
    auth_date: datetime | None,
    source: str,
) -> NormalizedTelegramUser:
    telegram_id = payload.get("id")
    if telegram_id is None:
        raise ValidationAppError("Telegram user id is required")

    safe_raw_data = {
        "source": source,
        "telegram_id": str(telegram_id),
        "username": _optional_str(payload.get("username")),
        "first_name": _optional_str(payload.get("first_name")),
        "last_name": _optional_str(payload.get("last_name")),
        "language_code": _optional_str(payload.get("language_code")),
    }

    return NormalizedTelegramUser(
        telegram_id=str(telegram_id),
        username=_optional_str(payload.get("username")),
        first_name=_optional_str(payload.get("first_name")),
        last_name=_optional_str(payload.get("last_name")),
        photo_url=_optional_str(payload.get("photo_url")),
        language_code=_optional_str(payload.get("language_code")),
        auth_date=auth_date,
        safe_raw_data=safe_raw_data,
    )


def _optional_str(value: object) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None
