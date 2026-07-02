from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters

from app.bot.config import BotConfig, BotConfigError
from app.bot.keyboards import build_open_app_keyboard
from app.bot.messages import HELP_MESSAGE, UNKNOWN_TEXT_MESSAGE, WELCOME_MESSAGE


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    config: BotConfig = context.application.bot_data["config"]
    if update.message is None:
        return
    await update.message.reply_text(
        WELCOME_MESSAGE,
        reply_markup=build_open_app_keyboard(config.web_app_url),
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    config: BotConfig = context.application.bot_data["config"]
    if update.message is None:
        return
    await update.message.reply_text(
        HELP_MESSAGE,
        reply_markup=build_open_app_keyboard(config.web_app_url),
    )


async def unknown_text(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if update.message is None:
        return
    await update.message.reply_text(UNKNOWN_TEXT_MESSAGE)


def build_application(config: BotConfig) -> Application:
    application = Application.builder().token(config.token).build()
    application.bot_data["config"] = config
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, unknown_text))
    return application


def run_polling() -> int:
    try:
        config = BotConfig.from_env()
    except BotConfigError as exc:
        print(f"Telegram bot is not configured: {exc}")
        return 2

    application = build_application(config)
    print(f"Starting Telegram bot polling for {config.bot_name}. Press Ctrl+C to stop.")
    application.run_polling()
    return 0
