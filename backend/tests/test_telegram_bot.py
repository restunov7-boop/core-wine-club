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

    with pytest.raises(BotConfigError, match="valid http or https URL"):
        BotConfig.from_env()


def test_bot_config_repr_does_not_leak_token():
    config = BotConfig(token="123456:secret-token", web_app_url="https://example.com")

    assert "secret-token" not in repr(config)
    assert "https://example.com" in repr(config)


def test_open_app_keyboard_uses_web_app_button():
    keyboard = build_open_app_keyboard("https://example.com")
    button = keyboard.inline_keyboard[0][0]

    assert button.text == OPEN_APP_BUTTON_TEXT
    assert button.web_app is not None
    assert button.web_app.url == "https://example.com"


def test_bot_messages_are_available():
    assert "Дочь винодела" in WELCOME_MESSAGE
    assert "мини-приложение" in HELP_MESSAGE
    assert "/start" in UNKNOWN_TEXT_MESSAGE
