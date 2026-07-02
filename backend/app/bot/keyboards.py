from telegram import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

from app.bot.messages import OPEN_APP_BUTTON_TEXT


def build_open_app_keyboard(web_app_url: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(
                    OPEN_APP_BUTTON_TEXT,
                    web_app=WebAppInfo(url=web_app_url),
                )
            ]
        ]
    )
