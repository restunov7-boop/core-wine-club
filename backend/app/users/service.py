from sqlalchemy.orm import Session

from app.auth.telegram import NormalizedTelegramUser
from app.users.models import TelegramIdentity, User


def get_user_by_id(db: Session, user_id: object) -> User | None:
    return db.get(User, user_id)


def get_telegram_identity(db: Session, telegram_id: str) -> TelegramIdentity | None:
    return db.query(TelegramIdentity).filter(TelegramIdentity.telegram_id == telegram_id).one_or_none()


def create_user_from_telegram(db: Session, telegram_user: NormalizedTelegramUser) -> User:
    user = User(
        display_name=telegram_user.display_name,
        avatar_url=telegram_user.photo_url,
        locale=telegram_user.language_code,
    )
    db.add(user)
    db.flush()
    return user


def create_or_update_telegram_identity(
    db: Session,
    user: User,
    telegram_user: NormalizedTelegramUser,
) -> TelegramIdentity:
    identity = get_telegram_identity(db, telegram_user.telegram_id)

    if identity is None:
        identity = TelegramIdentity(user_id=user.id, telegram_id=telegram_user.telegram_id)
        db.add(identity)

    identity.username = telegram_user.username
    identity.first_name = telegram_user.first_name
    identity.last_name = telegram_user.last_name
    identity.photo_url = telegram_user.photo_url
    identity.auth_date = telegram_user.auth_date
    identity.raw_data_json = telegram_user.safe_raw_data
    return identity
