import pytest

from app.bot.config import BotConfig, BotConfigError
from app.bot.keyboards import build_open_app_keyboard
from app.bot.messages import HELP_MESSAGE, OPEN_APP_BUTTON_TEXT, UNKNOWN_TEXT_MESSAGE, WELCOME_MESSAGE


def test_bot_config_requires_token(monkeypatch):
    monkeypatch.delenv("TELEGRAM_BOT_TOKEN", raising=False)
    monkeypatch.setenv("TELEGRAM_WEB_APP_URL", "https://example.com")

    with pytest.raises(BotConfigError, match="TELEGRAM_BOT_TOKEN"):
        BotConfig.from_env()


def test_bot_config_rejects_placeholder_token(monkeypatch):
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "change_me")
    monkeypatch.setenv("TELEGRAM_WEB_APP_URL", "https://example.com")

    with pytest.raises(BotConfigError, match="TELEGRAM_BOT_TOKEN"):
        BotConfig.from_env()


def test_bot_config_requires_web_app_url(monkeypatch):
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "123456:fake-token-for-test")
    monkeypatch.delenv("TELEGRAM_WEB_APP_URL", raising=False)

    with pytest.raises(BotConfigError, match="TELEGRAM_WEB_APP_URL"):
        BotConfig.from_env()


def test_bot_config_rejects_invalid_web_app_url(monkeypatch):
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "123456:fake-token-for-test")
    monkeypatch.setenv("TELEGRAM_WEB_APP_URL", "not-a-url")

    with pytest.raises(BotConfigError, match="valid HTTPS URL"):
        BotConfig.from_env()


def test_bot_config_rejects_http_localhost_web_app_url(monkeypatch):
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "123456:fake-token-for-test")
    monkeypatch.setenv("TELEGRAM_WEB_APP_URL", "http://localhost:5173")

    with pytest.raises(BotConfigError, match="requires HTTPS"):
        BotConfig.from_env()


def test_bot_config_repr_does_not_leak_token():
    config = BotConfig(token="123456:secret-token", web_app_url="https://example.com")

    assert "secret-token" not in repr(config)
    assert "https://example.com" in repr(config)


def test_bot_config_accepts_https_web_app_url(monkeypatch):
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "123456:fake-token-for-test")
    monkeypatch.setenv("TELEGRAM_WEB_APP_URL", "https://example.com")

    config = BotConfig.from_env()

    assert config.web_app_url == "https://example.com"


def test_open_app_keyboard_uses_web_app_button():
    keyboard = build_open_app_keyboard("https://example.com")
    button = keyboard.inline_keyboard[0][0]

    assert button.text == OPEN_APP_BUTTON_TEXT
    assert button.web_app is not None
    assert button.web_app.url == "https://example.com"
    assert button.url is None


def test_bot_messages_are_available():
    assert "Дочь винодела" in WELCOME_MESSAGE
    assert "мини-приложение" in HELP_MESSAGE
    assert "/start" in UNKNOWN_TEXT_MESSAGE


def test_telegram_webhook_disabled_when_bot_disabled(client, monkeypatch):
    monkeypatch.setenv("TELEGRAM_BOT_ENABLED", "false")
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "123456:fake-token-for-test")
    monkeypatch.setenv("TELEGRAM_WEB_APP_URL", "https://example.com")

    response = client.post("/api/v1/bot/telegram/webhook", json=_telegram_update("/start"))

    assert response.status_code == 403
    assert response.json()["error"]["message"] == "Telegram bot webhook is disabled."


def test_telegram_webhook_reports_missing_token_safely(client, monkeypatch):
    monkeypatch.setenv("TELEGRAM_BOT_ENABLED", "true")
    monkeypatch.delenv("TELEGRAM_BOT_TOKEN", raising=False)
    monkeypatch.setenv("TELEGRAM_WEB_APP_URL", "https://example.com")

    response = client.post("/api/v1/bot/telegram/webhook", json=_telegram_update("/start"))

    assert response.status_code == 422
    body_text = response.text
    assert "TELEGRAM_BOT_TOKEN" in body_text
    assert "fake-token" not in body_text
    assert "123456" not in body_text


def test_telegram_webhook_handles_start_without_network(client, monkeypatch):
    sent_messages: list[tuple[int | str, str]] = []

    async def fake_send(config, chat_id, text):
        sent_messages.append((chat_id, text))

    monkeypatch.setenv("TELEGRAM_BOT_ENABLED", "true")
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "123456:fake-token-for-test")
    monkeypatch.setenv("TELEGRAM_WEB_APP_URL", "https://example.com")
    monkeypatch.setattr("app.bot.webhook.send_telegram_message", fake_send)

    response = client.post("/api/v1/bot/telegram/webhook", json=_telegram_update("/start"))

    assert response.status_code == 200, response.text
    assert response.json()["data"] == {"handled": True}
    assert sent_messages == [(100001, WELCOME_MESSAGE)]


def test_telegram_webhook_handles_help_without_network(client, monkeypatch):
    sent_messages: list[tuple[int | str, str]] = []

    async def fake_send(config, chat_id, text):
        sent_messages.append((chat_id, text))

    monkeypatch.setenv("TELEGRAM_BOT_ENABLED", "true")
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "123456:fake-token-for-test")
    monkeypatch.setenv("TELEGRAM_WEB_APP_URL", "https://example.com")
    monkeypatch.setattr("app.bot.webhook.send_telegram_message", fake_send)

    response = client.post("/api/v1/bot/telegram/webhook", json=_telegram_update("/help"))

    assert response.status_code == 200, response.text
    assert sent_messages == [(100001, HELP_MESSAGE)]


def test_telegram_webhook_handles_unknown_text_without_network(client, monkeypatch):
    sent_messages: list[tuple[int | str, str]] = []

    async def fake_send(config, chat_id, text):
        sent_messages.append((chat_id, text))

    monkeypatch.setenv("TELEGRAM_BOT_ENABLED", "true")
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "123456:fake-token-for-test")
    monkeypatch.setenv("TELEGRAM_WEB_APP_URL", "https://example.com")
    monkeypatch.setattr("app.bot.webhook.send_telegram_message", fake_send)

    response = client.post("/api/v1/bot/telegram/webhook", json=_telegram_update("hello"))

    assert response.status_code == 200, response.text
    assert sent_messages == [(100001, UNKNOWN_TEXT_MESSAGE)]


def _telegram_update(text: str) -> dict:
    return {
        "update_id": 1,
        "message": {
            "message_id": 10,
            "date": 1780000000,
            "text": text,
            "chat": {"id": 100001, "type": "private"},
            "from": {"id": 100001, "is_bot": False, "first_name": "CORE"},
        },
    }
