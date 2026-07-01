from datetime import datetime, timedelta, timezone
from uuid import UUID

from app.database import SessionLocal
from app.diary.models import TastingNote
from app.progress.models import ProgressEvent
from app.progress.service import (
    DIARY_NOTE_CREATED_EVENT,
    DIARY_NOTE_SOURCE_TYPE,
    LESSON_COMPLETED_EVENT,
    LESSON_SOURCE_TYPE,
    record_diary_note_created_event,
)
from app.projects.models import ProjectUser
from tests.conftest import complete_onboarding, create_note, login, set_dev_user


LESSON_SLUG = "how-wine-is-made"
SECOND_LESSON_SLUG = "how-to-taste-wine"


def _count_progress_events(
    event_type: str = LESSON_COMPLETED_EVENT,
    source_type: str = LESSON_SOURCE_TYPE,
) -> int:
    db = SessionLocal()
    try:
        return (
            db.query(ProgressEvent)
            .filter(
                ProgressEvent.event_type == event_type,
                ProgressEvent.source_type == source_type,
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
    assert response_before.json()["data"]["diary"] == {
        "notes_count": 0,
        "created_note_events_count": 0,
    }
    assert response_after.status_code == 200, response_after.text
    assert response_after.json()["data"]["learning"] == {
        "completed_lessons_count": 1,
        "available_lessons_count": 5,
        "completed_lesson_slugs": [LESSON_SLUG],
    }
    assert response_after.json()["data"]["diary"] == {
        "notes_count": 0,
        "created_note_events_count": 0,
    }


def test_creating_diary_note_creates_progress_event(client):
    headers = login(client)

    note = create_note(client, headers, wine_name="Sprint 11 Event Wine", rating=5)

    assert note["id"]
    assert _count_progress_events(DIARY_NOTE_CREATED_EVENT, DIARY_NOTE_SOURCE_TYPE) == 1


def test_diary_note_created_event_is_idempotent_for_same_note(client):
    headers = login(client)
    note = create_note(client, headers, wine_name="Idempotent Wine")

    db = SessionLocal()
    try:
        db_note = db.query(TastingNote).filter(TastingNote.id == UUID(note["id"])).one()
        project_user = db.query(ProjectUser).filter(ProjectUser.id == db_note.project_user_id).one()
        record_diary_note_created_event(db, project_user, db_note)
        db.commit()
    finally:
        db.close()

    assert _count_progress_events(DIARY_NOTE_CREATED_EVENT, DIARY_NOTE_SOURCE_TYPE) == 1


def test_progress_summary_includes_diary_counts(client):
    headers = login(client)

    response_before = client.get("/api/v1/progress/summary", headers=headers)
    note = create_note(client, headers, wine_name="Summary Wine")
    response_after_create = client.get("/api/v1/progress/summary", headers=headers)
    client.delete(f"/api/v1/diary/notes/{note['id']}", headers=headers)
    response_after_delete = client.get("/api/v1/progress/summary", headers=headers)

    assert response_before.status_code == 200, response_before.text
    assert response_before.json()["data"]["diary"] == {
        "notes_count": 0,
        "created_note_events_count": 0,
    }
    assert response_after_create.status_code == 200, response_after_create.text
    assert response_after_create.json()["data"]["diary"] == {
        "notes_count": 1,
        "created_note_events_count": 1,
    }
    assert response_after_delete.status_code == 200, response_after_delete.text
    assert response_after_delete.json()["data"]["diary"] == {
        "notes_count": 0,
        "created_note_events_count": 1,
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


def test_second_dev_user_does_not_see_first_users_diary_progress(client):
    user_one_headers = login(client)
    create_note(client, user_one_headers, wine_name="First User Wine")

    set_dev_user(telegram_id="200002", username="core_second_user", first_name="Second")
    user_two_headers = login(client)
    summary = client.get("/api/v1/progress/summary", headers=user_two_headers)

    assert summary.status_code == 200, summary.text
    assert summary.json()["data"]["diary"] == {
        "notes_count": 0,
        "created_note_events_count": 0,
    }
    assert _count_progress_events(DIARY_NOTE_CREATED_EVENT, DIARY_NOTE_SOURCE_TYPE) == 1


def test_progress_activity_maps_lesson_and_diary_events_newest_first(client):
    headers = login(client)
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=headers)
    note = create_note(client, headers, wine_name="Activity Merlot")

    response = client.get("/api/v1/progress/activity", headers=headers)

    assert response.status_code == 200, response.text
    assert response.json()["meta"]["limit"] == 20
    items = response.json()["data"]["items"]
    assert len(items) == 2
    assert items[0]["event_type"] == DIARY_NOTE_CREATED_EVENT
    assert items[0]["source_type"] == DIARY_NOTE_SOURCE_TYPE
    assert items[0]["title"] == "Заметка добавлена"
    assert items[0]["description"] == "Activity Merlot"
    assert items[0]["href"] == f"/diary/{note['id']}"
    assert items[1]["event_type"] == LESSON_COMPLETED_EVENT
    assert items[1]["source_type"] == LESSON_SOURCE_TYPE
    assert items[1]["title"] == "Урок завершён"
    assert items[1]["description"] == "Как рождается вино"
    assert items[1]["href"] == f"/learn/lessons/{LESSON_SLUG}"


def test_progress_activity_returns_only_current_users_events(client):
    user_one_headers = login(client)
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=user_one_headers)
    create_note(client, user_one_headers, wine_name="Private Activity")

    set_dev_user(telegram_id="200002", username="core_second_user", first_name="Second")
    user_two_headers = login(client)
    response = client.get("/api/v1/progress/activity", headers=user_two_headers)

    assert response.status_code == 200, response.text
    assert response.json()["data"]["items"] == []


def test_progress_activity_deleted_diary_note_keeps_history_without_detail_href(client):
    headers = login(client)
    note = create_note(client, headers, wine_name="Deleted Activity Wine")
    client.delete(f"/api/v1/diary/notes/{note['id']}", headers=headers)

    response = client.get("/api/v1/progress/activity", headers=headers)

    assert response.status_code == 200, response.text
    items = response.json()["data"]["items"]
    assert len(items) == 1
    assert items[0]["event_type"] == DIARY_NOTE_CREATED_EVENT
    assert items[0]["title"] == "Заметка добавлена"
    assert items[0]["description"] == "Deleted Activity Wine"
    assert items[0]["href"] is None


def test_progress_activity_limit_param_and_max_cap(client):
    headers = login(client)
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=headers)
    create_note(client, headers, wine_name="Limit Wine")

    limited = client.get("/api/v1/progress/activity?limit=1", headers=headers)
    capped = client.get("/api/v1/progress/activity?limit=100", headers=headers)

    assert limited.status_code == 200, limited.text
    assert limited.json()["meta"]["limit"] == 1
    assert len(limited.json()["data"]["items"]) == 1
    assert capped.status_code == 200, capped.text
    assert capped.json()["meta"]["limit"] == 50
    assert len(capped.json()["data"]["items"]) == 2


def test_progress_activity_uses_occurred_at_descending_order(client):
    headers = login(client)
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=headers)
    client.post(f"/api/v1/progress/lessons/{SECOND_LESSON_SLUG}/complete", headers=headers)

    db = SessionLocal()
    try:
        old_event = (
            db.query(ProgressEvent)
            .filter(
                ProgressEvent.event_type == LESSON_COMPLETED_EVENT,
                ProgressEvent.source_slug == SECOND_LESSON_SLUG,
            )
            .one()
        )
        old_event.occurred_at = datetime.now(timezone.utc) - timedelta(days=1)
        db.commit()
    finally:
        db.close()

    response = client.get("/api/v1/progress/activity", headers=headers)

    assert response.status_code == 200, response.text
    slugs = [item["source_slug"] for item in response.json()["data"]["items"]]
    assert slugs == [LESSON_SLUG, SECOND_LESSON_SLUG]


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
