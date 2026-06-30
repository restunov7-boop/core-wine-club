import base64
import hashlib
import hmac
import json
from datetime import UTC, datetime, timedelta
from typing import Any

from app.config import settings
from app.shared.errors import AuthenticationError

JWT_ALGORITHM = "HS256"


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    now = datetime.now(UTC)
    payload: dict[str, Any] = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.access_token_expire_minutes)).timestamp()),
    }
    payload.update(extra_claims or {})

    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    signing_input = ".".join([_b64_json(header), _b64_json(payload)])
    signature = _b64_bytes(
        hmac.new(settings.jwt_secret.encode("utf-8"), signing_input.encode("utf-8"), hashlib.sha256).digest()
    )
    return f"{signing_input}.{signature}"


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        header_segment, payload_segment, signature_segment = token.split(".")
    except ValueError as exc:
        raise AuthenticationError("Access token is malformed") from exc

    signing_input = f"{header_segment}.{payload_segment}"
    expected_signature = _b64_bytes(
        hmac.new(settings.jwt_secret.encode("utf-8"), signing_input.encode("utf-8"), hashlib.sha256).digest()
    )
    if not hmac.compare_digest(expected_signature, signature_segment):
        raise AuthenticationError("Access token signature is invalid")

    header = _decode_segment(header_segment)
    if header.get("alg") != JWT_ALGORITHM:
        raise AuthenticationError("Access token algorithm is unsupported")

    payload = _decode_segment(payload_segment)
    exp = payload.get("exp")
    if not isinstance(exp, int) or exp < int(datetime.now(UTC).timestamp()):
        raise AuthenticationError("Access token is expired")
    return payload


def _b64_json(value: dict[str, Any]) -> str:
    return _b64_bytes(json.dumps(value, separators=(",", ":"), sort_keys=True).encode("utf-8"))


def _b64_bytes(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _decode_segment(segment: str) -> dict[str, Any]:
    padding = "=" * (-len(segment) % 4)
    try:
        decoded = base64.urlsafe_b64decode(f"{segment}{padding}".encode("ascii"))
        payload = json.loads(decoded)
    except (ValueError, json.JSONDecodeError) as exc:
        raise AuthenticationError("Access token payload is invalid") from exc
    if not isinstance(payload, dict):
        raise AuthenticationError("Access token payload must be an object")
    return payload
