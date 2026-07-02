import os
from dataclasses import dataclass, field
from urllib.parse import urlparse


class BotConfigError(RuntimeError):
    """Raised when the Telegram bot runner cannot start safely."""


def _read_bool(value: str | None, default: bool) -> bool:
    if value is None or not value.strip():
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class BotConfig:
    token: str = field(repr=False)
    web_app_url: str
    enabled: bool = False
    bot_name: str = "Дочь винодела"
    polling_allowed: bool = True

    @classmethod
    def from_env(cls) -> "BotConfig":
        token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
        web_app_url = os.getenv("TELEGRAM_WEB_APP_URL", "").strip()
        enabled = _read_bool(os.getenv("TELEGRAM_BOT_ENABLED"), False)
        bot_name = os.getenv("TELEGRAM_BOT_NAME", "Дочь винодела").strip() or "Дочь винодела"
        polling_allowed = _read_bool(os.getenv("TELEGRAM_BOT_POLLING_ALLOWED"), True)

        config = cls(
            token=token,
            web_app_url=web_app_url,
            enabled=enabled,
            bot_name=bot_name,
            polling_allowed=polling_allowed,
        )
        config.validate()
        return config

    def validate(self) -> None:
        if not self.token or self.token == "change_me":
            raise BotConfigError("TELEGRAM_BOT_TOKEN is required to start the Telegram bot.")
        if not self.web_app_url:
            raise BotConfigError("TELEGRAM_WEB_APP_URL is required to create the Mini App button.")

        parsed_url = urlparse(self.web_app_url)
        if parsed_url.scheme != "https" or not parsed_url.netloc:
            raise BotConfigError(
                "TELEGRAM_WEB_APP_URL must be a valid HTTPS URL. "
                "Telegram Web App button requires HTTPS; localhost/http is not accepted by Telegram."
            )

        if not self.polling_allowed:
            raise BotConfigError("TELEGRAM_BOT_POLLING_ALLOWED must be true for the local polling runner.")
