import os
import tempfile
from collections.abc import Generator
from pathlib import Path

os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = f"sqlite:///{(Path(tempfile.gettempdir()) / f'core_wine_club_pytest_{os.getpid()}.db').as_posix()}"
os.environ["DEV_AUTH_ENABLED"] = "true"
os.environ["JWT_SECRET"] = "test_secret"
os.environ["CORS_ORIGINS"] = "http://127.0.0.1:5173,http://localhost:5173"

import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.diary import models as diary_models  # noqa: F401
from app.discoveries import models as discovery_models  # noqa: F401
from app.discoveries.service import seed_demo_discoveries
from app.learning import models as learning_models  # noqa: F401
from app.learning.service import seed_demo_learning
from app.main import app
from app.progress import models as progress_models  # noqa: F401
from app.projects import models as project_models  # noqa: F401
from app.projects.service import ensure_default_project
from app.quizzes import models as quiz_models  # noqa: F401
from app.quizzes.service import seed_demo_quizzes
from app.users import models as user_models  # noqa: F401
from app.wine_shelf import models as wine_shelf_models  # noqa: F401


def _reset_dev_user() -> None:
    settings.app_env = "test"
    settings.dev_auth_enabled = True
    settings.dev_telegram_id = "100001"
    settings.dev_telegram_username = "core_dev_user"
    settings.dev_telegram_first_name = "CORE"


@pytest.fixture(autouse=True)
def reset_database() -> Generator[None, None, None]:
    _reset_dev_user()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        project = ensure_default_project(db)
        seed_demo_discoveries(db, project)
        seed_demo_learning(db, project)
        seed_demo_quizzes(db, project)
        db.commit()
    finally:
        db.close()

    yield


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as test_client:
        yield test_client


def set_dev_user(
    telegram_id: str = "100001",
    username: str = "core_dev_user",
    first_name: str = "CORE",
) -> None:
    settings.dev_telegram_id = telegram_id
    settings.dev_telegram_username = username
    settings.dev_telegram_first_name = first_name


def login(client: TestClient) -> dict[str, str]:
    response = client.post("/api/v1/auth/telegram", json={"init_data": "dev_mock_init_data"})
    assert response.status_code == 200, response.text
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def complete_onboarding(client: TestClient, headers: dict[str, str]) -> dict:
    response = client.post(
        "/api/v1/onboarding/complete",
        headers=headers,
        json={
            "wine_experience_level": "beginner",
            "taste_preferences": ["red", "sparkling"],
            "goals": ["choose_bottle", "feel_confident"],
            "display_name": "Test User",
        },
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]


def note_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "wine_name": "Chianti Classico",
        "producer": "Example Producer",
        "country": "Italy",
        "region": "Tuscany",
        "grape": "Sangiovese",
        "vintage": 2021,
        "wine_color": "red",
        "sweetness": "dry",
        "rating": 4,
        "tasted_at": "2026-06-29",
        "aroma_notes": ["cherry", "spice"],
        "taste_notes": ["fresh", "structured"],
        "personal_note": "Bright and balanced.",
        "would_buy_again": True,
    }
    payload.update(overrides)
    return payload


def create_note(client: TestClient, headers: dict[str, str], **overrides: object) -> dict:
    response = client.post("/api/v1/diary/notes", headers=headers, json=note_payload(**overrides))
    assert response.status_code == 200, response.text
    return response.json()["data"]
