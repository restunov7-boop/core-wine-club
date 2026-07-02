from typing import Any

import httpx

from app.bot.config import BotConfig
from app.bot.keyboards import build_open_app_keyboard
from app.bot.messages import HELP_MESSAGE, UNKNOWN_TEXT_MESSAGE, WELCOME_MESSAGE


class BotWebhookError(RuntimeError):
    """Raised when a Telegram webhook update cannot be sent safely."""


def choose_reply_text(update: dict[str, Any]) -> tuple[int | str | None, str | None]:
    message = update.get("message")
    if not isinstance(message, dict):
        return None, None

    chat = message.get("chat")
    if not isinstance(chat, dict):
        return None, None

    chat_id = chat.get("id")
    if chat_id is None:
        return None, None

    text = message.get("text")
    if not isinstance(text, str):
        return chat_id, UNKNOWN_TEXT_MESSAGE

    command = text.strip().split(maxsplit=1)[0].lower()
    if command == "/start":
        return chat_id, WELCOME_MESSAGE
    if command == "/help":
        return chat_id, HELP_MESSAGE
    return chat_id, UNKNOWN_TEXT_MESSAGE


async def send_telegram_message(config: BotConfig, chat_id: int | str, text: str) -> None:
    url = f"https://api.telegram.org/bot{config.token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "reply_markup": build_open_app_keyboard(config.web_app_url).to_dict(),
    }
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(url, json=payload)

    if response.status_code >= 400:
        raise BotWebhookError("Telegram sendMessage failed.")


async def handle_webhook_update(update: dict[str, Any], config: BotConfig) -> dict[str, bool]:
    chat_id, reply_text = choose_reply_text(update)
    if chat_id is None or reply_text is None:
        return {"handled": False}

    await send_telegram_message(config, chat_id, reply_text)
    return {"handled": True}
