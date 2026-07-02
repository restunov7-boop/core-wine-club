from typing import Any

from fastapi import APIRouter

from app.bot.config import BotConfig, BotConfigError
from app.bot.webhook import BotWebhookError, handle_webhook_update
from app.shared.errors import PermissionDeniedError, ValidationAppError
from app.shared.responses import success_response

router = APIRouter(prefix="/bot/telegram", tags=["telegram-bot"])


@router.post("/webhook")
async def telegram_webhook(update: dict[str, Any]):
    config = BotConfig.from_env(validate=False)
    if not config.enabled:
        raise PermissionDeniedError("Telegram bot webhook is disabled.")

    try:
        config.validate(require_polling=False)
    except BotConfigError as exc:
        raise ValidationAppError(f"Telegram bot webhook is not configured: {exc}") from exc

    try:
        result = await handle_webhook_update(update, config)
    except BotWebhookError as exc:
        raise ValidationAppError("Telegram webhook update could not be processed.") from exc

    return success_response(result)
