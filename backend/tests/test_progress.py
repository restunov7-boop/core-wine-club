from app.database import SessionLocal
from app.progress.models import ProgressEvent
from app.progress.service import LESSON_COMPLETED_EVENT, LESSON_SOURCE_TYPE
from tests.conftest import complete_onboarding, login, set_dev_user


LESSON_SLUG = "how-wine-is-made"


def _count_progress_events() -> int:
    db = SessionLocal()
    try:
        return (
            db.query(ProgressEvent)
            .filter(
                ProgressEvent.event_type == LESSON_COMPLETED_EVENT,
                ProgressEvent.source_type == LESSON_SOURCE_TYPE,
            )
            .count()
        )
    finally:
        db.close()


def test_complete_lesson_creates_one_progress_event(client):
    headers = login(client)

    response = client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["lesson_slug"] == LESSON_SLUG
    assert data["is_completed"] is True
    assert data["completed_at"]
    assert _count_progress_events() == 1


def test_complete_lesson_is_idempotent(client):
    headers = login(client)

    first = client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=headers)
    second = client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=headers)

    assert first.status_code == 200, first.text
    assert second.status_code == 200, second.text
    assert first.json()["data"]["completed_at"] == second.json()["data"]["completed_at"]
    assert _count_progress_events() == 1


def test_uncomplete_lesson_deletes_only_current_users_event(client):
    user_one_headers = login(client)
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=user_one_headers)

    set_dev_user(telegram_id="200002", username="core_second_user", first_name="Second")
    user_two_headers = login(client)
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=user_two_headers)

    response = client.delete(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=user_two_headers)
    user_one_summary = client.get("/api/v1/progress/summary", headers=user_one_headers)
    user_two_summary = client.get("/api/v1/progress/summary", headers=user_two_headers)

    assert response.status_code == 200, response.text
    assert response.json()["data"] == {
        "lesson_slug": LESSON_SLUG,
        "is_completed": False,
        "deleted": True,
    }
    assert user_one_summary.json()["data"]["learning"]["completed_lessons_count"] == 1
    assert user_two_summary.json()["data"]["learning"]["completed_lessons_count"] == 0
    assert _count_progress_events() == 1


def test_progress_summary_returns_current_user_counts(client):
    headers = login(client)

    response_before = client.get("/api/v1/progress/summary", headers=headers)
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=headers)
    response_after = client.get("/api/v1/progress/summary", headers=headers)

    assert response_before.status_code == 200, response_before.text
    assert response_before.json()["data"]["learning"] == {
        "completed_lessons_count": 0,
        "available_lessons_count": 5,
        "completed_lesson_slugs": [],
    }
    assert response_after.status_code == 200, response_after.text
    assert response_after.json()["data"]["learning"] == {
        "completed_lessons_count": 1,
        "available_lessons_count": 5,
        "completed_lesson_slugs": [LESSON_SLUG],
    }


def test_second_dev_user_does_not_see_first_users_completed_lesson(client):
    user_one_headers = login(client)
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=user_one_headers)

    set_dev_user(telegram_id="200002", username="core_second_user", first_name="Second")
    user_two_headers = login(client)
    summary = client.get("/api/v1/progress/summary", headers=user_two_headers)
    lesson = client.get(f"/api/v1/learning/lessons/{LESSON_SLUG}", headers=user_two_headers)

    assert summary.status_code == 200, summary.text
    assert summary.json()["data"]["learning"]["completed_lessons_count"] == 0
    assert summary.json()["data"]["learning"]["completed_lesson_slugs"] == []
    assert lesson.status_code == 200, lesson.text
    assert lesson.json()["data"]["is_completed"] is False
    assert lesson.json()["data"]["completed_at"] is None


def test_learning_and_home_include_current_user_completion_state(client):
    headers = login(client)
    complete_onboarding(client, headers)
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=headers)

    path_response = client.get("/api/v1/learning/paths/wine-basics", headers=headers)
    lesson_response = client.get(f"/api/v1/learning/lessons/{LESSON_SLUG}", headers=headers)
    home_response = client.get("/api/v1/home", headers=headers)

    assert path_response.status_code == 200, path_response.text
    path = path_response.json()["data"]
    assert path["lessons_count"] == 5
    assert path["completed_lessons_count"] == 1
    assert path["lessons"][0]["slug"] == LESSON_SLUG
    assert path["lessons"][0]["is_completed"] is True
    assert path["lessons"][0]["completed_at"]

    assert lesson_response.status_code == 200, lesson_response.text
    lesson = lesson_response.json()["data"]
    assert lesson["is_completed"] is True
    assert lesson["completed_at"]

    assert home_response.status_code == 200, home_response.text
    sections = {section["key"]: section for section in home_response.json()["data"]["sections"]}
    assert sections["learning"]["stats"] == {
        "completed_lessons_count": 1,
        "available_lessons_count": 5,
    }
